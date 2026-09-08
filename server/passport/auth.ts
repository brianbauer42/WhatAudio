import passport from "passport";
import type { NextFunction, Request, Response } from "express";
import { Invite } from "../models/Invite.js";
import { config } from "../config.js";
import { HttpError } from "../httpError.js";
import type { UserDocument } from "../models/User.js";

interface AuthInfo {
  message?: string;
}

/** Promise wrapper around passport's callback-style `authenticate`. */
const authenticate = (
  strategy: string,
  req: Request,
  res: Response,
): Promise<{ user: UserDocument | false; info: AuthInfo }> =>
  new Promise((resolve, reject) => {
    const handler = passport.authenticate(
      strategy,
      (error: unknown, user: UserDocument | false, info: AuthInfo = {}) => {
        if (error) {
          reject(error);
        } else {
          resolve({ user, info });
        }
      },
    );
    handler(req, res, reject);
  });

const logIn = (req: Request, user: Express.User): Promise<void> =>
  new Promise((resolve, reject) => {
    req.logIn(user, (error) => (error ? reject(error) : resolve()));
  });

/** Throws a 401 rather than returning `undefined`, so controllers stay flat. */
export const currentUser = (req: Request): Express.User => {
  if (!req.user) {
    throw new HttpError(401, "You are not logged in!");
  }
  return req.user;
};

export const requireLogin = (req: Request, _res: Response, next: NextFunction): void => {
  next(req.user ? undefined : new HttpError(401, "You are not logged in!"));
};

export const registerNewUser = async (req: Request, res: Response): Promise<void> => {
  if (!config.allowRegistrations) {
    throw new HttpError(403, "Registrations are disabled");
  }

  // Reserve the invite before creating the account, then claim it afterwards.
  let invite = null;
  if (!config.openRegistrations) {
    const code = String(req.body?.signup?.inviteCode ?? "");
    invite = await Invite.findOne({ code });
    if (!invite) {
      throw new HttpError(400, "Invalid invite code!");
    }
    if (invite.wasClaimed) {
      throw new HttpError(400, "Invite code has already been used!");
    }
  }

  const { user, info } = await authenticate("local-signup", req, res);
  if (!user) {
    throw new HttpError(400, info.message ?? "Unknown registration failure!");
  }

  await logIn(req, user);

  if (invite) {
    invite.wasClaimed = true;
    invite.claimedBy = user._id;
    await invite.save();
  }

  res.status(201).json({ user, message: info.message ?? `Welcome, ${user.displayName}!` });
};

export const loginExistingUser = async (req: Request, res: Response): Promise<void> => {
  const { user, info } = await authenticate("local-login", req, res);
  if (!user) {
    throw new HttpError(401, info.message ?? "Unknown login failure...");
  }

  await logIn(req, user);
  res.json({ user, message: info.message ?? `Welcome back, ${user.displayName}!` });
};

export const logout = (req: Request, res: Response, next: NextFunction): void => {
  req.logout((error) => {
    if (error) {
      next(error);
      return;
    }
    req.session.destroy(() => {
      res.clearCookie("connect.sid");
      res.status(204).end();
    });
  });
};

export const whoAmI = (req: Request, res: Response): void => {
  res.json({ user: req.user ?? null });
};
