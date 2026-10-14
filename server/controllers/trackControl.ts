import type { Request, Response } from "express";
import {
  deleteTrack,
  getTrack,
  insertTrack,
  listTracks,
  searchTracks,
  updateTrack,
} from "../db/tracks.js";
import type { TrackPatch, TrackRecord } from "../db/tracks.js";
import { HttpError } from "../httpError.js";
import { parseId } from "../ids.js";
import { currentUser } from "../passport/auth.js";
import { deleteObjects, presignGet } from "../storage.js";
import { removeUploadedFiles } from "../uploadManagement.js";

/**
 * What the client sees. Media URLs point back at this API; those routes
 * redirect to short-lived bucket URLs, so storage details never reach the
 * browser and a login requirement later needs no client change.
 */
const toJson = (track: TrackRecord) => ({
  id: track.id,
  title: track.title,
  album: track.album,
  artist: track.artist,
  postBody: track.body,
  audioUrl: `/api/songs/${track.id}/audio`,
  artUrl: track.artKey ? `/api/songs/${track.id}/art` : null,
  createdAt: track.createdAt,
  updatedAt: track.updatedAt,
  sharedBy: track.sharedBy,
});

/** Form fields arrive as strings; anything else (missing, arrays) is ignored. */
const text = (value: unknown): string | undefined =>
  typeof value === "string" ? value : undefined;

export const create = async (req: Request, res: Response): Promise<void> => {
  const user = currentUser(req);
  const files = req.files as Record<string, Express.Multer.File[]> | undefined;
  const audio = files?.audio?.[0];
  const art = files?.art?.[0];

  if (!audio?.key || !req.trackId) {
    await removeUploadedFiles(req);
    throw new HttpError(400, "No audio file received!");
  }

  const track = await insertTrack({
    id: req.trackId,
    userId: user.id,
    title: text(req.body.title) ?? "",
    album: text(req.body.album) ?? "",
    artist: text(req.body.artist) ?? "",
    body: text(req.body.postBody) ?? "",
    audioKey: audio.key,
    artKey: art?.key ?? null,
  });
  res.status(201).json(toJson(track));
};

export const getAll = async (_req: Request, res: Response): Promise<void> => {
  res.json((await listTracks()).map(toJson));
};

export const search = async (req: Request, res: Response): Promise<void> => {
  const query = typeof req.query.q === "string" ? req.query.q.trim() : "";
  res.json((await searchTracks(query)).map(toJson));
};

export const read = async (req: Request, res: Response): Promise<void> => {
  const track = await getTrack(parseId(req.params.id));
  if (!track) {
    throw new HttpError(404, "Track not found");
  }
  res.json(toJson(track));
};

export const update = async (req: Request, res: Response): Promise<void> => {
  currentUser(req);
  // Only these fields are editable; the rest are set by the upload flow.
  const patch: TrackPatch = {
    title: text(req.body.title),
    album: text(req.body.album),
    artist: text(req.body.artist),
    body: text(req.body.postBody),
  };
  const track = await updateTrack(parseId(req.params.id), patch);
  if (!track) {
    throw new HttpError(404, "Track not found");
  }
  res.json(toJson(track));
};

export const remove = async (req: Request, res: Response): Promise<void> => {
  currentUser(req);
  const track = await deleteTrack(parseId(req.params.id));
  if (!track) {
    throw new HttpError(404, "Track not found");
  }
  // The row is gone; take the audio and art out of the bucket with it.
  await deleteObjects([track.audioKey, track.artKey]);
  res.json(toJson(track));
};

/** Browsers follow the redirect for every Range request, so seeking works. */
const redirectToObject = async (res: Response, key: string): Promise<void> => {
  res.set("Cache-Control", "private, max-age=300");
  res.redirect(302, await presignGet(key));
};

export const streamAudio = async (req: Request, res: Response): Promise<void> => {
  const track = await getTrack(parseId(req.params.id));
  if (!track) {
    throw new HttpError(404, "Track not found");
  }
  await redirectToObject(res, track.audioKey);
};

export const streamArt = async (req: Request, res: Response): Promise<void> => {
  const track = await getTrack(parseId(req.params.id));
  if (!track?.artKey) {
    throw new HttpError(404, "No album art for this track");
  }
  await redirectToObject(res, track.artKey);
};
