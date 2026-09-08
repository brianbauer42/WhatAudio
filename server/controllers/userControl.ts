import type { Request, Response } from "express";
import { User } from "../models/User.js";
import { HttpError } from "../httpError.js";

// Never select the password hash, and never let the query string reach the
// database as a filter.
const PUBLIC_FIELDS = "displayName dateRegistered isAdmin";

export const read = async (req: Request, res: Response): Promise<void> => {
  const user = await User.findById(req.params.id, PUBLIC_FIELDS);
  if (!user) {
    throw new HttpError(404, "User not found");
  }
  res.json(user);
};

export const getAll = async (_req: Request, res: Response): Promise<void> => {
  res.json(await User.find({}, PUBLIC_FIELDS).sort({ dateRegistered: 1 }));
};
