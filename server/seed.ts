/**
 * Fills a local database and bucket with a dev account and a handful of freely
 * licensed tracks, so a fresh checkout has something to play. Run with
 * `pnpm run seed`.
 *
 * Safe to re-run: downloads are cached in .cache/seed/, track ids are derived
 * from the manifest, and tracks that already exist are skipped.
 */
import fs from "node:fs/promises";
import path from "node:path";
import { createHash } from "node:crypto";
import { config } from "./config.js";
import { closeDatabase, runMigrations } from "./db/index.js";
import { getTrack, insertTrack } from "./db/tracks.js";
import { createUser, findUserByDisplayName } from "./db/users.js";
import {
  contentTypeFor,
  ensureBucket,
  objectExists,
  putObject,
  s3,
  trackObjectKey,
} from "./storage.js";

const DEV_USER = {
  email: "dev@example.com",
  password: "password",
  displayName: "dev",
};

// Works both from `server/` under tsx and from `server-built/` after `tsc`.
const CACHE_DIR = path.resolve(import.meta.dirname, "..", ".cache", "seed");

// Track ids are UUID v5 of the slug, so a re-run resolves to the same row and
// the same object keys no matter what happened to the database in between.
const SEED_NAMESPACE = "0c1f7a2e-5b3d-4e8f-9a6c-7d2b1e4f8a3c";
const seedTrackId = (slug: string): string => {
  const namespace = Buffer.from(SEED_NAMESPACE.replaceAll("-", ""), "hex");
  const hash = createHash("sha1").update(namespace).update(slug).digest();
  hash[6] = (hash[6]! & 0x0f) | 0x50; // version 5
  hash[8] = (hash[8]! & 0x3f) | 0x80; // RFC 4122 variant
  const hex = hash.subarray(0, 16).toString("hex");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
};

// Wikimedia asks automated clients to identify themselves, and rate-limits
// anonymous-looking ones much harder.
const USER_AGENT = "WhatAudio-dev-seed/1.0 (https://github.com/brianbauer42/WhatAudio)";

const incompetech = (title: string): string =>
  `https://incompetech.com/music/royalty-free/mp3-royaltyfree/${encodeURIComponent(title)}.mp3`;

// Special:FilePath redirects to the current upload, so these survive re-uploads.
const commons = (file: string, width?: number): string =>
  `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(file)}` +
  (width ? `?width=${width}` : "");

const KEVIN_MACLEOD_CREDIT = (title: string) =>
  `"${title}" by Kevin MacLeod (incompetech.com). ` +
  "Licensed under Creative Commons: By Attribution 4.0 — https://creativecommons.org/licenses/by/4.0/";

interface SeedTrack {
  /** Stable file name stem in the upload directory; also the idempotency key. */
  slug: string;
  title: string;
  artist: string;
  album: string;
  postBody: string;
  audioUrl: string;
  artUrl?: string;
}

const macleod = (slug: string, title: string, album: string): SeedTrack => ({
  slug,
  title,
  artist: "Kevin MacLeod",
  album,
  postBody: KEVIN_MACLEOD_CREDIT(title),
  audioUrl: incompetech(title),
});

const TRACKS: SeedTrack[] = [
  macleod("carefree", "Carefree", "Royalty Free: Pop"),
  macleod("local-forecast-elevator", "Local Forecast - Elevator", "Royalty Free: Jazz"),
  macleod("sneaky-snitch", "Sneaky Snitch", "Royalty Free: Comedy"),
  macleod("monkeys-spinning-monkeys", "Monkeys Spinning Monkeys", "Royalty Free: Comedy"),
  macleod("fluffing-a-duck", "Fluffing a Duck", "Royalty Free: Comedy"),
  macleod("investigations", "Investigations", "Royalty Free: Mystery"),
  macleod("hidden-agenda", "Hidden Agenda", "Royalty Free: Mystery"),
  macleod("pamgaea", "Pamgaea", "Royalty Free: World"),
  {
    slug: "bach-jesu-joy",
    title: "Jesu, Joy of Man's Desiring (BWV 147, No. 10)",
    artist: "Johann Sebastian Bach — Orchestra Gli Armonici",
    album: "Herz und Mund und Tat und Leben",
    postBody: "Recording released under CC0 via Wikimedia Commons. Portrait: public domain.",
    audioUrl: commons("Bach, BWV 147, 10. Jesus bleibet meine Freude.ogg"),
    artUrl: commons("Johann Sebastian Bach.jpg", 500),
  },
  {
    slug: "bach-goldberg-aria",
    title: "Goldberg Variations: Aria",
    artist: "Johann Sebastian Bach — Musopen",
    album: "Goldberg Variations",
    postBody: "Musopen recording released under CC0 via Wikimedia Commons. Portrait: public domain.",
    audioUrl: commons("Bach, Goldberg Variations, Aria (Musopen version).ogg"),
    artUrl: commons("Johann Sebastian Bach.jpg", 500),
  },
  {
    slug: "albinoni-oboe-concerto-adagio",
    title: "Oboe Concerto No. 2 in D minor: II. Adagio",
    artist: "Tomaso Albinoni — Musopen",
    album: "Concerti a cinque, Op. 9",
    postBody: "Musopen recording released under CC0 via Wikimedia Commons. Portrait: public domain.",
    audioUrl: commons(
      "Albinoni, Concerto for Oboe and Strings No. 2 in D minor, Op. 9, II. Adagio.ogg",
    ),
    artUrl: commons("Tomaso Albinoni.jpg", 500),
  },
  {
    slug: "borodin-steppes",
    title: "In the Steppes of Central Asia",
    artist: "Alexander Borodin — Musopen Symphony Orchestra",
    album: "Orchestral Works",
    postBody: "Musopen recording released under CC0 via Wikimedia Commons. Portrait: public domain.",
    audioUrl: commons("Alexander Borodin - In The Steppes Of Central Asia.ogg"),
    artUrl: commons("Borodin.jpg", 500),
  },
  {
    slug: "mendelssohn-dance-of-clowns",
    title: "A Midsummer Night's Dream: Dance of Clowns",
    artist: "Felix Mendelssohn — European Archive",
    album: "A Midsummer Night's Dream, Op. 61",
    postBody: "Public domain recording via Wikimedia Commons (European Archive). Portrait: public domain.",
    audioUrl: commons("A Midsummer Night's Dream Op. 61 Dance of Clowns (Mendelssohn) European Archive.ogg"),
    artUrl: commons("Felix Mendelssohn Bartholdy by Eduard Magnus (1833).jpg", 500),
  },
  {
    slug: "scriabin-prelude-op67-1",
    title: "Prelude No. 1, Op. 67",
    artist: "Alexander Scriabin — Musopen",
    album: "Two Preludes, Op. 67",
    postBody: "Public domain Musopen recording via Wikimedia Commons.",
    audioUrl: commons("Alexander Scriabin - prelude no. 1, op. 67.ogg"),
  },
  {
    slug: "dvorak-new-world-scherzo",
    title: "Symphony No. 9 'From the New World': III. Molto vivace",
    artist: "Antonín Dvořák — Musopen",
    album: "Symphony No. 9 in E minor, Op. 95",
    postBody: "Public domain Musopen recording via Wikimedia Commons. Portrait: public domain.",
    audioUrl: commons(
      "Antonin Dvorak - symphony no. 9 in e minor 'from the new world', op. 95 - iii. molto vivace.ogg",
    ),
    artUrl: commons("Dvorak.jpg", 500),
  },
];

/**
 * Recognise what we actually received, so a rate-limit or error page served
 * with a 200 never ends up saved as a "track".
 */
const sniffExtension = (bytes: Uint8Array): string | undefined => {
  const ascii = (start: number, length: number) =>
    String.fromCharCode(...bytes.subarray(start, start + length));
  if (ascii(0, 3) === "ID3" || (bytes[0] === 0xff && (bytes[1]! & 0xe0) === 0xe0)) {
    return ".mp3";
  }
  if (ascii(0, 4) === "OggS") {
    return ".ogg";
  }
  if (ascii(0, 4) === "fLaC") {
    return ".flac";
  }
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return ".jpg";
  }
  if (ascii(1, 3) === "PNG") {
    return ".png";
  }
  return undefined;
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const download = async (url: string, attempts = 4): Promise<Uint8Array> => {
  for (let attempt = 1; ; attempt += 1) {
    const response = await fetch(url, { headers: { "User-Agent": USER_AGENT } });
    if (response.ok) {
      return new Uint8Array(await response.arrayBuffer());
    }
    const retryable = response.status === 429 || response.status >= 500;
    if (!retryable || attempt >= attempts) {
      throw new Error(`GET ${url} failed with HTTP ${response.status}`);
    }
    const retryAfter = Number(response.headers.get("retry-after"));
    const delay = Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter * 1000 : 2000 * 2 ** attempt;
    console.log(`  HTTP ${response.status}, retrying in ${Math.round(delay / 1000)}s...`);
    await sleep(delay);
  }
};

interface CachedFile {
  bytes: Uint8Array;
  extension: string;
}

/**
 * Downloads `url` into the cache directory as `<stem><ext>`, unless a previous
 * run already did, and hands back the bytes with their sniffed extension.
 */
const fetchCached = async (stem: string, url: string, allowed: Set<string>): Promise<CachedFile> => {
  const existing = (await fs.readdir(CACHE_DIR)).find(
    (name) => path.parse(name).name === stem && allowed.has(path.extname(name)),
  );
  if (existing) {
    return { bytes: await fs.readFile(path.join(CACHE_DIR, existing)), extension: path.extname(existing) };
  }

  const bytes = await download(url);
  const extension = sniffExtension(bytes);
  if (!extension || !allowed.has(extension)) {
    throw new Error(`${url} did not return a supported file (got ${extension ?? "unknown"})`);
  }
  const fileName = `${stem}${extension}`;
  // Write then rename, so an interrupted run never leaves a truncated file
  // that a later run would mistake for a finished download.
  const temporary = path.join(CACHE_DIR, `.${fileName}.part`);
  await fs.writeFile(temporary, bytes);
  await fs.rename(temporary, path.join(CACHE_DIR, fileName));
  console.log(`  downloaded ${fileName} (${(bytes.length / 1024 / 1024).toFixed(1)} MB)`);
  return { bytes, extension };
};

const uploadIfMissing = async (key: string, file: CachedFile): Promise<void> => {
  if (await objectExists(key)) {
    return;
  }
  await putObject(key, file.bytes, contentTypeFor(file.extension));
  console.log(`  uploaded ${key}`);
};

const AUDIO_EXTENSIONS = new Set([".mp3", ".ogg", ".flac"]);
const IMAGE_EXTENSIONS = new Set([".jpg", ".png"]);

const ensureDevUser = async () => {
  const existing = await findUserByDisplayName(DEV_USER.displayName);
  if (existing) {
    return existing;
  }
  const user = await createUser({ ...DEV_USER, isAdmin: true });
  console.log(`Created admin account ${DEV_USER.email} / ${DEV_USER.password}`);
  return user;
};

const main = async (): Promise<void> => {
  if (config.isProduction) {
    throw new Error("Refusing to seed with NODE_ENV=production.");
  }

  await runMigrations();
  await ensureBucket();
  await fs.mkdir(CACHE_DIR, { recursive: true });
  const user = await ensureDevUser();

  // Space the posts a minute apart in manifest order, so the playlist order is
  // stable no matter how long the downloads take.
  const baseTime = Date.now() - TRACKS.length * 60_000;
  let added = 0;
  let failed = 0;

  for (const [index, track] of TRACKS.entries()) {
    console.log(`${track.artist} — ${track.title}`);
    try {
      const id = seedTrackId(track.slug);
      if (await getTrack(id)) {
        console.log("  already posted, skipping");
        continue;
      }

      const audio = await fetchCached(track.slug, track.audioUrl, AUDIO_EXTENSIONS);
      const audioKey = trackObjectKey(id, "audio", audio.extension);
      await uploadIfMissing(audioKey, audio);

      let artKey: string | null = null;
      if (track.artUrl) {
        try {
          const art = await fetchCached(`${track.slug}-art`, track.artUrl, IMAGE_EXTENSIONS);
          artKey = trackObjectKey(id, "art", art.extension);
          await uploadIfMissing(artKey, art);
        } catch (error) {
          // Art is decoration; the client falls back to a placeholder.
          console.warn(`  no art: ${(error as Error).message}`);
        }
      }

      await insertTrack({
        id,
        userId: user.id,
        title: track.title,
        artist: track.artist,
        album: track.album,
        body: track.postBody,
        audioKey,
        artKey,
        createdAt: new Date(baseTime + (TRACKS.length - index) * 60_000),
      });
      added += 1;
    } catch (error) {
      failed += 1;
      console.error(`  failed: ${(error as Error).message}`);
    }
  }

  console.log(`\nDone: ${added} added, ${failed} failed, ${TRACKS.length - added - failed} already present.`);
  console.log(`Log in as ${DEV_USER.email} / ${DEV_USER.password}`);
  process.exitCode = failed > 0 ? 1 : 0;
};

main()
  .catch((error) => {
    console.error("Seeding failed:", error);
    process.exitCode = 1;
  })
  .finally(() => {
    s3.destroy();
    return closeDatabase();
  });
