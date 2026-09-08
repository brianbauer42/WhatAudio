import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import multer from "multer";
import type { NextFunction, Request, Response } from "express";
import { config } from "./config.js";
import { HttpError } from "./httpError.js";

const VALID_AUDIO_EXTENSIONS = new Set([".mp3", ".ogg", ".flac", ".opus"]);
const VALID_IMAGE_EXTENSIONS = new Set([".jpeg", ".jpg", ".gif", ".bmp", ".webp", ".png"]);

export const uploadedFiles = (req: Request): Express.Multer.File[] => {
  const files = req.files;
  if (!files) {
    return [];
  }
  return Array.isArray(files) ? files : Object.values(files).flat();
};

/** Best-effort cleanup so a rejected upload doesn't leave junk on disk. */
export const removeUploadedFiles = async (req: Request): Promise<void> => {
  await Promise.all(
    uploadedFiles(req).map((file) => fs.rm(file.path, { force: true }).catch(() => {})),
  );
};

/**
 * Deletes a stored upload. Paths come from our own database, but resolve and
 * bounds-check anyway so a malformed record can never reach outside the
 * upload directory.
 */
export const removeStoredFile = async (relativePath?: string): Promise<void> => {
  if (!relativePath) {
    return;
  }
  const root = path.resolve(config.uploadDir);
  const resolved = path.resolve(root, relativePath);
  if (resolved !== root && !resolved.startsWith(root + path.sep)) {
    console.warn(`Refusing to delete outside the upload directory: ${relativePath}`);
    return;
  }
  try {
    await fs.rm(resolved, { force: true });
  } catch (error) {
    // The database row is already gone; a stranded file is not worth failing on.
    console.warn(`Could not delete ${resolved}:`, error);
  }
};

const storage = multer.diskStorage({
  destination(req, _file, callback) {
    const user = req.user;
    if (!user) {
      callback(new HttpError(401, "You are not logged in!"), "");
      return;
    }
    // Display names are validated at registration, so they are safe as a path segment.
    const directory = path.join(config.uploadDir, user.displayName);
    fs.mkdir(directory, { recursive: true }).then(
      () => callback(null, directory),
      (error) => callback(error, ""),
    );
  },
  filename(_req, file, callback) {
    // Never build a path out of a client-supplied filename.
    const extension = path.extname(file.originalname).toLowerCase();
    callback(null, `${crypto.randomUUID()}${extension}`);
  },
});

const ALLOWED_EXTENSIONS: Record<string, { extensions: Set<string>; message: string }> = {
  audio: {
    extensions: VALID_AUDIO_EXTENSIONS,
    message: "Valid audio formats are: .mp3, .ogg, .flac, and .opus",
  },
  art: {
    extensions: VALID_IMAGE_EXTENSIONS,
    message: "Valid image formats are: .jpeg, .jpg, .gif, .bmp, .webp, .png",
  },
};

const fileFilter: NonNullable<multer.Options["fileFilter"]> = (_req, file, callback) => {
  const rule = ALLOWED_EXTENSIONS[file.fieldname];
  if (!rule) {
    callback(new HttpError(400, `Unexpected upload field "${file.fieldname}"`));
    return;
  }
  if (!rule.extensions.has(path.extname(file.originalname).toLowerCase())) {
    callback(new HttpError(400, rule.message));
    return;
  }
  callback(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: config.maxUploadBytes, files: 2 },
}).fields([
  { name: "audio", maxCount: 1 },
  { name: "art", maxCount: 1 },
]);

const toHttpError = (error: unknown): unknown => {
  if (error instanceof multer.MulterError && error.code === "LIMIT_FILE_SIZE") {
    const megabytes = Math.round(config.maxUploadBytes / 1024 / 1024);
    return new HttpError(413, `Files must be smaller than ${megabytes}MB`);
  }
  return error;
};

export const receiveTrackFiles = (req: Request, res: Response, next: NextFunction): void => {
  upload(req, res, (error) => {
    if (!error) {
      next();
      return;
    }
    removeUploadedFiles(req).finally(() => next(toHttpError(error)));
  });
};
