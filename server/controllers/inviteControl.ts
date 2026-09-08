import crypto from "node:crypto";
import type { Request, Response } from "express";
import { Invite } from "../models/Invite.js";
import { User } from "../models/User.js";
import { currentUser } from "../passport/auth.js";

export const generateInviteCode = (): string => crypto.randomBytes(16).toString("hex");

export const create = async (req: Request, res: Response): Promise<void> => {
  const user = currentUser(req);
  const invite = await Invite.create({
    generatedBy: user._id,
    note: String(req.body?.note ?? ""),
    code: generateInviteCode(),
  });
  await User.updateOne({ _id: user._id }, { $push: { invites: invite._id } });
  res.status(201).json(invite);
};

export const readMine = async (req: Request, res: Response): Promise<void> => {
  const user = currentUser(req);
  const invites = await Invite.find({ generatedBy: user._id })
    .populate("claimedBy", "displayName dateRegistered")
    .sort({ dateCreated: -1 });
  res.json(invites);
};
