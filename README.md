# [What Audio](https://beta.what.audio)

An infinite playlist music platform. I've long admired the format of leftasrain.com
and wanted to build something similar for my own use.

Audio streams through the browser's native `<audio>` element, so anything the
browser can decode will play. FLAC works in Chrome, Firefox, and Opera; Safari
and Edge still don't support FLAC streaming, so prefer `.mp3`, `.ogg`, or
`.opus` if you care about those.

## Requirements

- Node.js 26 (`.nvmrc` pins it; run `nvm use` in the project directory)
- [pnpm](https://pnpm.io) 12 — `npm install -g pnpm`
- Docker, for the local Postgres and object storage containers (or your own
  Postgres and any S3-compatible bucket; see [Storage](#storage-and-database))

## Setup

```
nvm use
pnpm install
docker compose up -d
cp .env.example .env
```

`docker compose up -d` starts Postgres 18 and [Garage](https://garagehq.deuxfleurs.fr),
a small S3-compatible object store, with the bucket and credentials that
`.env.example` already points at. Every value in `.env` has a working default for
local development, but you should at minimum set:

- `SESSION_SECRET` — any long random string. Generate one with
  `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`.
  This is **required** when `NODE_ENV=production`.

For a real deployment you also need `DATABASE_URL`, `S3_ENDPOINT`, `S3_BUCKET`,
`S3_ACCESS_KEY`, `S3_SECRET_KEY`, and `CORS_ORIGINS`. See `.env.example` for the
full list, including upload limits and whether anyone may register.

### Sample tracks

```
pnpm run seed
```

This creates an admin account (`dev@example.com` / `password`) and downloads
about 80 MB of freely licensed music into the bucket: Kevin MacLeod tracks from
incompetech.com (CC BY 4.0), plus public-domain and CC0 classical recordings and
public-domain composer portraits from Wikimedia Commons. Each track's post
carries its attribution. It's safe to re-run: downloads are cached in
`.cache/seed/`, and tracks that are already posted are skipped. It refuses to run
with `NODE_ENV=production`.

## Running it

Production build and start:

```
pnpm run prod
```

Or run it for development, with the API and the client rebuilding on save:

```
pnpm run dev
```

`pnpm run dev` starts two processes: the API on port 8080 (restarted by `tsx`
whenever a file under `server/` changes) and the Vite dev server on port 3000
with React Fast Refresh. **Open http://localhost:3000** in development — it
proxies `/api` through to the API. In production everything is served from
port 8080.

The server applies any pending database migrations on startup, so a fresh
database needs no separate step.

## The ring

The playlist is drawn as a ring of cards floating in space, built with
[React Three Fiber](https://docs.pmnd.rs/react-three-fiber). Scroll or use the
arrow keys to turn the ring, press Enter or click a card to play it, and Space
to pause. The playing card glows orange, the one at the front teal.

Browsers without WebGL, and people with "reduce motion" turned on, get a plain
list instead. There's a toggle in the bottom-left corner either way, and the
choice is remembered in `localStorage`.

## Accounts

For local development, `pnpm run seed` (above) creates `dev@example.com` /
`password`. You can also sign up at `/register`: registration is open in
development and closed in production by default. To create accounts on a
production server, set `ALLOW_REGISTRATIONS=true`, register, then remove it and
restart.

## Storage and database

**Postgres** holds users, tracks, and login sessions. The schema lives in
`server/db/schema.ts` and is managed with [Drizzle](https://orm.drizzle.team):
after changing the schema, run `pnpm run db:generate` to write a new SQL
migration into `drizzle/` and commit it. Migrations run automatically when the
server starts (and when seeding); `pnpm run db:migrate` applies them by hand.
Track search is a Postgres full-text index with prefix matching, so "bac" finds
Bach.

**Uploaded audio and art** go into an S3-compatible bucket rather than onto the
server's disk, so the app can move between machines and the bucket can be backed
up on its own. Uploads stream straight from the request into the bucket under
`tracks/<track id>/`. The bucket is private: the client plays
`/api/songs/<id>/audio` (and shows `/api/songs/<id>/art`), and the API answers
with a redirect to a presigned bucket URL that is valid for one to two hours.
That keeps storage details out of the browser, stops permanent hotlinks, and
leaves one place to add a login requirement for listening later.

Locally the bucket is Garage from `compose.yaml` (`docker/garage.toml` holds its
development-only config). In production, any S3-compatible store works: Garage on
your own server, Cloudflare R2, Backblaze B2, Hetzner Object Storage, and so on.
Two things to get right:

- `S3_ENDPOINT` must be the URL **browsers** can reach, since presigned links
  embed it. Garage does not terminate TLS, so put it behind your reverse proxy
  (for example `https://s3.what.audio` → Garage's port 3900) and use that URL.
- `CORS_ORIGINS` must list your site's origin. The ring paints album art into
  WebGL textures, which the browser only allows when the bucket answers with
  CORS headers for the page's origin. The server writes this CORS rule to the
  bucket on startup.

## Other scripts

| Command | What it does |
| --- | --- |
| `pnpm run build` | Clean, compile the server, and bundle the client |
| `pnpm start` | Run the compiled server (requires `pnpm run build` first) |
| `pnpm run typecheck` | Type-check the server without emitting |
| `pnpm run lint` | ESLint over the client and build config |
| `pnpm run clean` | Remove `static/` and `server-built/` |
| `pnpm run seed` | Create a dev account and upload sample tracks |
| `pnpm run db:generate` | Write a migration for schema changes into `drizzle/` |
| `pnpm run db:migrate` | Apply pending migrations by hand |
| `pnpm run db:studio` | Browse the database in Drizzle Studio |

## Layout

- `index.html` — the Vite entry point
- `client/` — React single-page app, bundled by Vite into `static/`
  - `scene/` — the 3D ring: React Three Fiber canvas, cards, nebula, bloom
  - `state/` — auth and player contexts (one shared `<audio>` element)
  - `ui/`, `pages/` — DOM overlays and the login / register / share / contact pages
  - `theme.js` and `styles/base.css` — the Blade Runner 2049 palette, kept in sync
- `server/` — TypeScript Express API, compiled by `tsc` into `server-built/`
  - `db/` — Drizzle schema, connection, and the user and track queries
  - `storage.ts` — the S3 client, presigned URLs, and bucket setup
  - `uploadManagement.ts` — multer storage engine that streams uploads into the bucket
- `drizzle/` — generated SQL migrations, applied on startup
- `compose.yaml`, `docker/` — local Postgres and Garage
- `public/` — static assets copied verbatim into the build (the favicon)

Project-level pnpm settings (allowed build scripts) live in `pnpm-workspace.yaml` —
pnpm 12 no longer reads them from `package.json`.
