import * as fs from "fs";
import { NextFunction, Request, Response } from "express";
import path from "path";
import { config } from "./config";

const validImageExtensions = [".jpeg", ".jpg", ".gif", ".bmp", ".webp", ".png"];
const validAudioExtensions = [".mp3", ".ogg", ".flac", ".opus"];
const deleteInvalidFiles = (files: any) => {
  fs.unlink(files.audio.path, () => {});
  if (files.art !== undefined) {
    fs.unlink(files.art.path, () => {});
  }
};

export const testForValidExtensions = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const error = {
    found: false,
    message: ""
  };
  if (!req.files) {
    error.found = true;
    error.message = "No files received!";
  } else if (
    !req.files.audio ||
    !validAudioExtensions.includes(path.extname(req.files.audio.path))
  ) {
    error.found = true;
    error.message = "Valid audio formats are: .mp3, .ogg, .flac, and .opus";
  } else if (
    req.files.art !== undefined &&
    !validImageExtensions.includes(path.extname(req.files.art.path))
  ) {
    error.found = true;
    error.message =
      "Valid image formats are: .jpeg, .jpg, .gif, .bmp, .webp, .png";
  }
  if (error.found === true) {
    deleteInvalidFiles(req.files);
    res.json(error);
  } else {
    next();
  }
};

export const ensureUserUploadDirExists = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const path = config.uploadDir + "/" + req.user.displayName;
  fs.mkdir(path, 0o744, function(err) {
    if (err) {
      if (err.code == "EEXIST") {
        console.log("User upload dir already exists, did not create: ", path);
        next(); // Ignore error, we want the folder to exist.
      } else {
        deleteInvalidFiles(req.files);
        console.log("Error creating upload directory: ", path);
        console.log("ERR", err);
        next(err);
      }
    } else {
      console.log("Created new user upload directory: ", path);
      next();
    }
  });
};

export const arrangeUploadedFiles = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.files && req.files.audio) {
    var oldPath = req.files.audio.path;
    var newPath =
      path.dirname(req.files.audio.path) +
      "/" +
      req.user.displayName +
      "/" +
      path.basename(req.files.audio.path);
    fs.rename(oldPath, newPath, function() {
      if (req.files && req.files.art !== undefined) {
        oldPath = req.files.art.path;
        newPath =
          path.dirname(req.files.art.path) +
          "/" +
          req.user.displayName +
          "/" +
          path.basename(req.files.art.path);
        fs.rename(oldPath, newPath, next);
      } else {
        next();
      }
    });
  }
};
