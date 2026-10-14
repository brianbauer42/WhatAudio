import path from "node:path";
import crypto from "node:crypto";
import multer from "multer";
import type { StorageEngine } from "multer";
import { Upload } from "@aws-sdk/lib-storage";
import type { NextFunction, Request, Response } from "express";
import { config } from "./config.js";
import { HttpError } from "./httpError.js";
import {
  CACHE_CONTROL_IMMUTABLE,
  bucket,
  contentTypeFor,
  deleteObjects,
  s3,
  trackObjectKey,
} from "./storage.js";

const VALID_AUDIO_EXTENSIONS = new Set([".mp3", ".ogg", ".flac", ".opus"]);
const VALID_IMAGE_EXTENSIONS = new Set([".jpeg", ".jpg", ".gif", ".bmp", ".webp", ".png"]);

/**
 * Object keys are grouped by track id, so the id is minted before multer
 * starts streaming and the controller reuses it for the database row.
 */
export const assignTrackId = (req: Request, _res: Response, next: NextFunction): void => {
  req.trackId = crypto.randomUUID();
  next();
};

export const uploadedFiles = (req: Request): Express.Multer.File[] => {
  const files = req.files;
  if (!files) {
    return [];
  }
  return Array.isArray(files) ? files : Object.values(files).flat();
};

/** Best-effort cleanup so a rejected upload doesn't leave objects in the bucket. */
export const removeUploadedFiles = (req: Request): Promise<void> =>
  deleteObjects(uploadedFiles(req).map((file) => file.key));

/**
 * multer storage engine that streams each part straight into the bucket.
 * Nothing touches local disk, and the key comes from our own validated
 * extension rather than anything the client sent.
 */
class BucketStorage implements StorageEngine {
  _handleFile(
    req: Request,
    file: Express.Multer.File,
    callback: (error?: unknown, info?: Partial<Express.Multer.File>) => void,
  ): void {
    const trackId = req.trackId;
    if (!trackId) {
      callback(new Error("assignTrackId must run before the upload middleware"));
      return;
    }
    const extension = path.extname(file.originalname).toLowerCase();
    const key = trackObjectKey(trackId, file.fieldname === "art" ? "art" : "audio", extension);

    const upload = new Upload({
      client: s3,
      params: {
        Bucket: bucket,
        Key: key,
        Body: file.stream,
        ContentType: contentTypeFor(extension),
        CacheControl: CACHE_CONTROL_IMMUTABLE,
      },
    });
    let size = 0;
    upload.on("httpUploadProgress", (progress) => {
      size = progress.loaded ?? size;
    });
    // busboy truncates the stream at the size limit. Don't finish storing the
    // truncated file; multer reports LIMIT_FILE_SIZE and we answer with a 413.
    file.stream.on("limit", () => {
      upload.abort().catch(() => {});
    });

    upload.done().then(
      () => callback(null, { key, size }),
      (error) => callback(error),
    );
  }

  _removeFile(_req: Request, file: Express.Multer.File, callback: (error: Error | null) => void): void {
    deleteObjects([file.key]).then(
      () => callback(null),
      (error) => callback(error as Error),
    );
  }
}

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
  storage: new BucketStorage(),
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
