import mongoose from "mongoose";
import type { HydratedDocument, Model, Types } from "mongoose";
import bcrypt from "bcryptjs";

const { Schema, model } = mongoose;

const SALT_ROUNDS = 10;

export interface IUser {
  dateRegistered: Date;
  email: string;
  password: string;
  displayName: string;
  isAdmin: boolean;
  posts: Types.ObjectId[];
  invites: Types.ObjectId[];
}

export interface IUserMethods {
  validPassword(password: string): Promise<boolean>;
}

export type UserDocument = HydratedDocument<IUser, IUserMethods>;
type UserModel = Model<IUser, Record<string, never>, IUserMethods>;

const userSchema = new Schema<IUser, UserModel, IUserMethods>(
  {
    dateRegistered: { type: Date, default: Date.now },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    displayName: { type: String, required: true, unique: true },
    isAdmin: { type: Boolean, default: false },
    posts: [{ type: Schema.Types.ObjectId, ref: "Post" }],
    invites: [{ type: Schema.Types.ObjectId, ref: "Invite" }],
  },
  {
    // Password hashes must never leave the server, so strip them centrally
    // rather than at each call site.
    toJSON: {
      transform: (_doc, ret) => {
        delete (ret as { password?: string }).password;
        return ret;
      },
    },
  },
);

// Hash on the way in, so no caller can accidentally persist a plaintext password.
userSchema.pre("save", async function hashPassword() {
  if (!this.isModified("password")) {
    return;
  }
  this.password = await bcrypt.hash(this.password, SALT_ROUNDS);
});

userSchema.method("validPassword", function validPassword(password: string) {
  return bcrypt.compare(password, this.password);
});

export const User = model<IUser, UserModel>("User", userSchema);
