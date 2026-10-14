import type { Request, Response } from "express";
import { getUserSummary, listUsers } from "../db/users.js";
import { HttpError } from "../httpError.js";
import { parseId } from "../ids.js";

// The query helpers never select the password hash, and the query string
// never reaches the database as a filter.
export const read = async (req: Request, res: Response): Promise<void> => {
  const user = await getUserSummary(parseId(req.params.id));
  if (!user) {
    throw new HttpError(404, "User not found");
  }
  res.json(user);
};

export const getAll = async (_req: Request, res: Response): Promise<void> => {
  res.json(await listUsers());
};
