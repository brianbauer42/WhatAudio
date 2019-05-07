#!/usr/bin/env node
import express from "express";
import { Request, Response } from "express";
import cors from "cors";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import passport from "passport";
import session from "express-session";
import formidable from "express-formidable";
import {
  read as readUser,
  getAll as getAllUsers
} from "./controllers/userControl";
import {
  create as createPost,
  getAll as getAllPosts,
  search as searchPosts,
  update as updatePost,
  remove as removePost
} from "./controllers/postControl";
import {
  create as createInvite,
  readMine as readMyInvite
} from "./controllers/inviteControl";
import {
  requireLogin,
  verifyInviteCode,
  registerNewUser,
  consumeInviteCode,
  loginExistingUser,
  whoAmI
} from "./passport/auth";
import {
  testForValidExtensions,
  ensureUserUploadDirExists,
  arrangeUploadedFiles
} from "./uploadManagement";
import { ensureUploadDirExists, inviteFirstUser } from "./onStartup";
import { registerStrategies } from "./passport/passport";
import { config } from "./config";
// import { enableHotReload } from "./enableHotReload";

const app = express();
registerStrategies(passport);

app.use(
  session({
    secret: config.sessionSecret,
    saveUninitialized: true,
    resave: true
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/../public"));
app.use("/resources", express.static(config.uploadDir));
ensureUploadDirExists();

// ---------------- API ROUTES ----------------
// These are authentication related routes for creation and authentication of accounts.
app.post(
  "/api/user/register",
  verifyInviteCode,
  registerNewUser,
  consumeInviteCode
);
app.post("/api/user/login", loginExistingUser);
app.get("/api/user/logout", (req: Request, res: Response) => {
  req.logout();
  res.redirect("/");
});

// These routes are for modifying or retrieving info about the users in the database.
// There is no create because passport handles all user creation in passport/passport.js
app.get("/api/user/whoami", whoAmI);
app.get("/api/user", requireLogin, getAllUsers);
app.get("/api/user/:id", requireLogin, readUser);
// app.put('/api/user/:id', auth.requireLogin, userCtrl.update);
// app.delete('/api/user/:id', auth.requireLogin, userCtrl.remove);

// Routes for posting and reading entries
app.post(
  "/api/songs/upload",
  requireLogin,
  formidable({
    uploadDir: config.uploadDir,
    multiples: true,
    keepExtensions: true
  }),
  testForValidExtensions,
  ensureUserUploadDirExists,
  arrangeUploadedFiles,
  createPost
);
app.get("/api/songs", getAllPosts);
app.get("/api/songs/search", searchPosts);
app.put("/api/songs/:id", requireLogin, updatePost);
app.delete("/api/songs/:id", requireLogin, removePost);

// Invite Code related endpoints
app.post("/api/invites/generate", requireLogin, createInvite);
app.get("/api/invites/getmine", requireLogin, readMyInvite);

// Return contact email from config. Just because.
app.get("/api/contactemail", (req: Request, res: Response) => {
  res.setHeader("Content-Type", "application/json");
  res.json(config.contactPageEmail);
});

// --------- HOT RELOAD STUFF FOR DEV MODE -------
// if (process.env.NODE_ENV === "production") {
//   console.log("\x1b[33m%s\x1b[0m", "Running in production mode");
app.use("/static", express.static(__dirname + "./../static"));
// } else {
//   // When not in production, enable hot reloading
//   enableHotReload(app);
// }
// Connect to the database.
mongoose.connect(config.mongoUri, {
  useCreateIndex: true,
  useNewUrlParser: true
});
mongoose.connection.on(
  "error",
  console.error.bind(console, "Connection error!")
);
mongoose.connection.once("open", () => {
  console.log("\x1b[32m%s\x1b[0m", "MongoDB connected successfully");
  inviteFirstUser();
});

// Render the index (referring to root of views specified in middleware section (__dirname + '/public'))
app.get("/", (req: Request, res: Response) => {
  res.render("index.html");
});

// Begin serving users
app.listen(config.port, "localhost", (err: NodeJS.ErrnoException) => {
  if (err) {
    return console.error(err);
  }
  console.log(
    "\x1b[32m%s\x1b[0m",
    "Spinning up the records! Tune in on the following frequency: " +
      config.port
  );
});
