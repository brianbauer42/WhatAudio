import mongoose from "mongoose";
import type { HydratedDocument, Types } from "mongoose";

const { Schema, model } = mongoose;

export interface IInvite {
  dateCreated: Date;
  generatedBy?: Types.ObjectId;
  claimedBy?: Types.ObjectId;
  code: string;
  note: string;
  wasClaimed: boolean;
}

export type InviteDocument = HydratedDocument<IInvite>;

const inviteSchema = new Schema<IInvite>({
  dateCreated: { type: Date, default: Date.now },
  generatedBy: { type: Schema.Types.ObjectId, ref: "User" },
  claimedBy: { type: Schema.Types.ObjectId, ref: "User" },
  code: { type: String, required: true, unique: true },
  note: { type: String, default: "" },
  wasClaimed: { type: Boolean, default: false },
});

export const Invite = model<IInvite>("Invite", inviteSchema);
