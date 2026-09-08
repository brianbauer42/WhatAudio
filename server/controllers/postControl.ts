import type { Request, Response } from "express";
import { Post } from "../models/Post.js";
import { User } from "../models/User.js";
import { HttpError } from "../httpError.js";
import { currentUser } from "../passport/auth.js";
import { removeStoredFile, removeUploadedFiles } from "../uploadManagement.js";

const AUTHOR_FIELDS = "displayName";

export const create = async (req: Request, res: Response): Promise<void> => {
  const user = currentUser(req);
  const files = req.files as Record<string, Express.Multer.File[]> | undefined;
  const audio = files?.audio?.[0];
  const art = files?.art?.[0];

  if (!audio) {
    await removeUploadedFiles(req);
    throw new HttpError(400, "No audio file received!");
  }

  const post = await Post.create({
    title: req.body.title ?? "",
    album: req.body.album ?? "",
    artist: req.body.artist ?? "",
    postBody: req.body.postBody ?? "",
    audioUri: `${user.displayName}/${audio.filename}`,
    artUri: art ? `${user.displayName}/${art.filename}` : undefined,
    sharedBy: user._id,
  });
  await User.updateOne({ _id: user._id }, { $push: { posts: post._id } });

  res.status(201).json(await post.populate("sharedBy", AUTHOR_FIELDS));
};

export const getAll = async (_req: Request, res: Response): Promise<void> => {
  res.json(await Post.find({}).populate("sharedBy", AUTHOR_FIELDS).sort({ dateCreated: -1 }));
};

export const search = async (req: Request, res: Response): Promise<void> => {
  const query = typeof req.query.q === "string" ? req.query.q.trim() : "";
  if (!query) {
    await getAll(req, res);
    return;
  }
  res.json(await Post.find({ $text: { $search: query } }).populate("sharedBy", AUTHOR_FIELDS));
};

export const read = async (req: Request, res: Response): Promise<void> => {
  const post = await Post.findById(req.params.id).populate("sharedBy", AUTHOR_FIELDS);
  if (!post) {
    throw new HttpError(404, "Track not found");
  }
  res.json(post);
};

export const update = async (req: Request, res: Response): Promise<void> => {
  currentUser(req);
  // Only these fields are editable; the rest are set by the upload flow.
  const { title, album, artist, postBody } = req.body;
  const post = await Post.findByIdAndUpdate(
    req.params.id,
    { title, album, artist, postBody, dateEdited: new Date() },
    { new: true, runValidators: true },
  ).populate("sharedBy", AUTHOR_FIELDS);
  if (!post) {
    throw new HttpError(404, "Track not found");
  }
  res.json(post);
};

export const remove = async (req: Request, res: Response): Promise<void> => {
  currentUser(req);
  const post = await Post.findByIdAndDelete(req.params.id);
  if (!post) {
    throw new HttpError(404, "Track not found");
  }
  // Keep the owning user's post list from accumulating dangling references,
  // and take the audio and art off disk with it.
  await User.updateOne({ _id: post.sharedBy }, { $pull: { posts: post._id } });
  await Promise.all([removeStoredFile(post.audioUri), removeStoredFile(post.artUri)]);
  res.json(post);
};
