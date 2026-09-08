import path from "node:path";
import express from "express";
import type { NextFunction, Request, Response } from "express";
import cors from "cors";
import session from "express-session";
import MongoStore from "connect-mongo";
import passport from "passport";
import mongoose from "mongoose";

import { config } from "./config.js";
import { connectToDatabase, disconnectFromDatabase } from "./db.js";
import { HttpError } from "./httpError.js";
import { registerStrategies } from "./passport/passport.js";
import {
  loginExistingUser,
  logout,
  registerNewUser,
  requireLogin,
  whoAmI,
} from "./passport/auth.js";
import { receiveTrackFiles } from "./uploadManagement.js";
import { ensureUploadDirExists, inviteFirstUser } from "./onStartup.js";
import { getAll as getAllUsers, read as readUser } from "./controllers/userControl.js";
import {
  create as createPost,
  getAll as getAllPosts,
  read as readPost,
  remove as removePost,
  search as searchPosts,
  update as updatePost,
} from "./controllers/postControl.js";
import {
  create as createInvite,
  readMine as readMyInvites,
} from "./controllers/inviteControl.js";

// Works both from `server/` under tsx and from `server-built/` after `tsc`.
const projectRoot = path.resolve(import.meta.dirname, "..");
const publicDir = path.join(projectRoot, "public");
const staticDir = path.join(projectRoot, "static");

const buildApp = (): express.Express => {
  const app = express();

  app.set("trust proxy", 1);
  registerStrategies();

  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(
    session({
      secret: config.sessionSecret,
      // Sessions live in MongoDB so they survive restarts and don't leak memory.
      store: MongoStore.create({ client: mongoose.connection.getClient() }),
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        sameSite: "lax",
        secure: config.cookieSecure,
        maxAge: 1000 * 60 * 60 * 24 * 14,
      },
    }),
  );
  app.use(passport.initialize());
  app.use(passport.session());

  // `index: false` matters: public/index.html is only the build template, so
  // "/" must fall through to the built shell in static/ instead.
  app.use(express.static(publicDir, { index: false }));
  app.use("/static", express.static(staticDir));
  app.use("/resources", express.static(config.uploadDir));

  // ---------------- API ROUTES ----------------
  // Account creation and authentication.
  app.post("/api/user/register", registerNewUser);
  app.post("/api/user/login", loginExistingUser);
  app.post("/api/user/logout", logout);
  app.get("/api/user/whoami", whoAmI);

  // Reading users. Creation lives in the auth routes above.
  app.get("/api/user", requireLogin, getAllUsers);
  app.get("/api/user/:id", requireLogin, readUser);

  // Posting and reading tracks.
  app.post("/api/songs/upload", requireLogin, receiveTrackFiles, createPost);
  app.get("/api/songs", getAllPosts);
  app.get("/api/songs/search", searchPosts);
  app.get("/api/songs/:id", readPost);
  app.put("/api/songs/:id", requireLogin, updatePost);
  app.delete("/api/songs/:id", requireLogin, removePost);

  // Invite codes.
  app.post("/api/invites/generate", requireLogin, createInvite);
  app.get("/api/invites/getmine", requireLogin, readMyInvites);

  app.get("/api/contactemail", (_req: Request, res: Response) => {
    res.json({ email: config.contactPageEmail });
  });

  app.use("/api", (_req: Request, _res: Response, next: NextFunction) => {
    next(new HttpError(404, "Not found"));
  });

  // Anything else is a client-side route: hand back the built single-page app.
  // Asset prefixes are excluded so a missing file 404s instead of quietly
  // returning index.html with a 200.
  const assetPrefixes = ["/resources/", "/static/"];
  app.use((req: Request, res: Response, next: NextFunction) => {
    if (req.method !== "GET" && req.method !== "HEAD") {
      next();
      return;
    }
    if (assetPrefixes.some((prefix) => req.path.startsWith(prefix))) {
      next(new HttpError(404, "Not found"));
      return;
    }
    res.sendFile(path.join(staticDir, "index.html"), (error) => {
      if (error) {
        next(new HttpError(404, "Client bundle not found. Run `npm run build:client` first."));
      }
    });
  });

  app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
    if (error instanceof HttpError) {
      res.status(error.status).json({ message: error.message });
      return;
    }
    if (error instanceof mongoose.Error.CastError) {
      res.status(400).json({ message: `Invalid ${error.path}` });
      return;
    }
    if (error instanceof mongoose.Error.ValidationError) {
      res.status(400).json({ message: error.message });
      return;
    }
    console.error(error);
    res.status(500).json({ message: "Something went wrong on our end." });
  });

  return app;
};

const main = async (): Promise<void> => {
  await connectToDatabase();
  await ensureUploadDirExists();
  await inviteFirstUser();

  const server = buildApp().listen(config.port, config.host, () => {
    console.log(
      "\x1b[32m%s\x1b[0m",
      `Spinning up the records! Tune in on the following frequency: ${config.port}`,
    );
  });

  const shutdown = (signal: string) => {
    console.log(`\n${signal} received, shutting down...`);
    server.close(() => {
      disconnectFromDatabase().finally(() => process.exit(0));
    });
  };
  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
};

main().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
