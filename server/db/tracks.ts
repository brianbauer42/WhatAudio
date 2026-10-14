import { desc, eq, sql } from "drizzle-orm";
import { db } from "./index.js";
import { tracks, users } from "./schema.js";

export interface TrackRecord {
  id: string;
  title: string;
  album: string;
  artist: string;
  body: string;
  audioKey: string;
  artKey: string | null;
  createdAt: Date;
  updatedAt: Date | null;
  sharedBy: { id: string; displayName: string };
}

const TRACK_COLUMNS = {
  id: tracks.id,
  title: tracks.title,
  album: tracks.album,
  artist: tracks.artist,
  body: tracks.body,
  audioKey: tracks.audioKey,
  artKey: tracks.artKey,
  createdAt: tracks.createdAt,
  updatedAt: tracks.updatedAt,
  sharedBy: { id: users.id, displayName: users.displayName },
};

const withOwner = () =>
  db.select(TRACK_COLUMNS).from(tracks).innerJoin(users, eq(tracks.userId, users.id));

export const listTracks = (): Promise<TrackRecord[]> =>
  withOwner().orderBy(desc(tracks.createdAt));

/**
 * Turns free text into a prefix-matching tsquery, so "bac gold" finds the
 * Bach Goldberg Variations. Punctuation is dropped because it has meaning in
 * tsquery syntax.
 */
const toPrefixQuery = (text: string): string | null => {
  const terms = text
    .split(/\s+/)
    .map((term) => term.replace(/[^\p{L}\p{N}]/gu, ""))
    .filter(Boolean);
  return terms.length > 0 ? terms.map((term) => `${term}:*`).join(" & ") : null;
};

export const searchTracks = async (text: string): Promise<TrackRecord[]> => {
  const query = toPrefixQuery(text);
  if (!query) {
    return listTracks();
  }
  const tsquery = sql`to_tsquery('simple', ${query})`;
  return withOwner()
    .where(sql`${tracks.search} @@ ${tsquery}`)
    .orderBy(sql`ts_rank(${tracks.search}, ${tsquery}) desc`, desc(tracks.createdAt));
};

export const getTrack = async (id: string): Promise<TrackRecord | null> => {
  const [track] = await withOwner().where(eq(tracks.id, id)).limit(1);
  return track ?? null;
};

export interface NewTrack {
  id: string;
  userId: string;
  title: string;
  album: string;
  artist: string;
  body: string;
  audioKey: string;
  artKey: string | null;
  createdAt?: Date;
}

export const insertTrack = async (input: NewTrack): Promise<TrackRecord> => {
  await db.insert(tracks).values(input);
  const track = await getTrack(input.id);
  if (!track) {
    throw new Error(`Track ${input.id} vanished right after insert`);
  }
  return track;
};

export type TrackPatch = Partial<Pick<NewTrack, "title" | "album" | "artist" | "body">>;

export const updateTrack = async (id: string, patch: TrackPatch): Promise<TrackRecord | null> => {
  const [updated] = await db
    .update(tracks)
    .set({ ...patch, updatedAt: new Date() })
    .where(eq(tracks.id, id))
    .returning({ id: tracks.id });
  return updated ? getTrack(id) : null;
};

/** Removes the row and hands back what it held, so the caller can clean up the bucket. */
export const deleteTrack = async (id: string): Promise<TrackRecord | null> => {
  const track = await getTrack(id);
  if (!track) {
    return null;
  }
  await db.delete(tracks).where(eq(tracks.id, id));
  return track;
};
