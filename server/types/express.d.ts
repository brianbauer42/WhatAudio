import type { HydratedDocument } from "mongoose";
import type { IUser, IUserMethods } from "../models/User.js";

// Teach Express (and therefore passport) what `req.user` actually is.
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface User extends HydratedDocument<IUser, IUserMethods> {}
  }
}

export {};
