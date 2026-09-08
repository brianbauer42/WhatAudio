import mongoose from "mongoose";
import type { HydratedDocument, Types } from "mongoose";

const { Schema, model } = mongoose;

export interface IPost {
  dateCreated: Date;
  dateEdited?: Date;
  title: string;
  album: string;
  artist: string;
  postBody: string;
  audioUri: string;
  artUri?: string;
  sharedBy: Types.ObjectId;
}

export type PostDocument = HydratedDocument<IPost>;

const postSchema = new Schema<IPost>({
  dateCreated: { type: Date, default: Date.now },
  dateEdited: { type: Date },
  title: { type: String, default: "" },
  album: { type: String, default: "" },
  artist: { type: String, default: "" },
  postBody: { type: String, default: "" },
  audioUri: { type: String, required: true },
  artUri: { type: String },
  sharedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
});

postSchema.index({ title: "text", album: "text", artist: "text", postBody: "text" });

export const Post = model<IPost>("Post", postSchema);
