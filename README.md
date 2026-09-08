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
- A MongoDB instance

## Setup

```
nvm use
pnpm install
cp .env.example .env
```

Then edit `.env`. Every value has a working default for local development, but
you should at minimum set:

- `SESSION_SECRET` — any long random string. Generate one with
  `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`.
  This is **required** when `NODE_ENV=production`.
- `MONGO_URI` — points at your MongoDB instance.

See `.env.example` for the full list, including upload limits and whether
registration is open or invite-only.

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
proxies `/api` and `/resources` through to the API. In production everything is
served from port 8080.

## First account

The first time you run the server against an empty user database, an invite code
is generated so you can create the initial admin account. It's printed to the
console and saved to `REGISTRATION_CODE.txt`.

## Other scripts

| Command | What it does |
| --- | --- |
| `pnpm run build` | Clean, compile the server, and bundle the client |
| `pnpm start` | Run the compiled server (requires `pnpm run build` first) |
| `pnpm run typecheck` | Type-check the server without emitting |
| `pnpm run lint` | ESLint over the client and build config |
| `pnpm run clean` | Remove `static/` and `server-built/` |

## Layout

- `index.html` — the Vite entry point
- `client/` — React single-page app, bundled by Vite into `static/`
- `server/` — TypeScript Express API, compiled by `tsc` into `server-built/`
- `public/` — static assets copied verbatim into the build (the favicon)
- `uploads/` — uploaded audio and album art, served at `/resources`

Project-level pnpm settings (dependency overrides, allowed build scripts) live
in `pnpm-workspace.yaml` — pnpm 12 no longer reads them from `package.json`.

Deleting a track removes its database record and its audio and album art from
`uploads/`.
