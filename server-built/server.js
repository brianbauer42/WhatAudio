#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var cors_1 = __importDefault(require("cors"));
var body_parser_1 = __importDefault(require("body-parser"));
var mongoose_1 = __importDefault(require("mongoose"));
var passport_1 = __importDefault(require("passport"));
var express_session_1 = __importDefault(require("express-session"));
var express_formidable_1 = __importDefault(require("express-formidable"));
var userControl_1 = require("./controllers/userControl");
var postControl_1 = require("./controllers/postControl");
var inviteControl_1 = require("./controllers/inviteControl");
var auth_1 = require("./passport/auth");
var uploadManagement_1 = require("./uploadManagement");
var onStartup_1 = require("./onStartup");
var passport_2 = require("./passport/passport");
var config_1 = require("./config");
// import { enableHotReload } from "./enableHotReload";
var app = express_1.default();
passport_2.registerStrategies(passport_1.default);
app.use(express_session_1.default({
    secret: config_1.config.sessionSecret,
    saveUninitialized: true,
    resave: true
}));
app.use(passport_1.default.initialize());
app.use(passport_1.default.session());
app.use(cors_1.default());
app.use(body_parser_1.default.json());
app.use(body_parser_1.default.urlencoded({ extended: true }));
app.use(express_1.default.static(__dirname + "/../public"));
app.use("/resources", express_1.default.static(config_1.config.uploadDir));
onStartup_1.ensureUploadDirExists();
// ---------------- API ROUTES ----------------
// These are authentication related routes for creation and authentication of accounts.
app.post("/api/user/register", auth_1.verifyInviteCode, auth_1.registerNewUser, auth_1.consumeInviteCode);
app.post("/api/user/login", auth_1.loginExistingUser);
app.get("/api/user/logout", function (req, res) {
    req.logout();
    res.redirect("/");
});
// These routes are for modifying or retrieving info about the users in the database.
// There is no create because passport handles all user creation in passport/passport.js
app.get("/api/user/whoami", auth_1.whoAmI);
app.get("/api/user", auth_1.requireLogin, userControl_1.getAll);
app.get("/api/user/:id", auth_1.requireLogin, userControl_1.read);
// app.put('/api/user/:id', auth.requireLogin, userCtrl.update);
// app.delete('/api/user/:id', auth.requireLogin, userCtrl.remove);
// Routes for posting and reading entries
app.post("/api/songs/upload", auth_1.requireLogin, express_formidable_1.default({
    uploadDir: config_1.config.uploadDir,
    multiples: true,
    keepExtensions: true
}), uploadManagement_1.testForValidExtensions, uploadManagement_1.ensureUserUploadDirExists, uploadManagement_1.arrangeUploadedFiles, postControl_1.create);
app.get("/api/songs", postControl_1.getAll);
app.get("/api/songs/search", postControl_1.search);
app.put("/api/songs/:id", auth_1.requireLogin, postControl_1.update);
app.delete("/api/songs/:id", auth_1.requireLogin, postControl_1.remove);
// Invite Code related endpoints
app.post("/api/invites/generate", auth_1.requireLogin, inviteControl_1.create);
app.get("/api/invites/getmine", auth_1.requireLogin, inviteControl_1.readMine);
// Return contact email from config. Just because.
app.get("/api/contactemail", function (req, res) {
    res.setHeader("Content-Type", "application/json");
    res.json(config_1.config.contactPageEmail);
});
// --------- HOT RELOAD STUFF FOR DEV MODE -------
// if (process.env.NODE_ENV === "production") {
//   console.log("\x1b[33m%s\x1b[0m", "Running in production mode");
app.use("/static", express_1.default.static(__dirname + "./../static"));
// } else {
//   // When not in production, enable hot reloading
//   enableHotReload(app);
// }
// Connect to the database.
mongoose_1.default.connect(config_1.config.mongoUri, {
    useCreateIndex: true,
    useNewUrlParser: true
});
mongoose_1.default.connection.on("error", console.error.bind(console, "Connection error!"));
mongoose_1.default.connection.once("open", function () {
    console.log("\x1b[32m%s\x1b[0m", "MongoDB connected successfully");
    onStartup_1.inviteFirstUser();
});
// Render the index (referring to root of views specified in middleware section (__dirname + '/public'))
app.get("/", function (req, res) {
    res.render("index.html");
});
// Begin serving users
app.listen(config_1.config.port, "localhost", function (err) {
    if (err) {
        return console.error(err);
    }
    console.log("\x1b[32m%s\x1b[0m", "Spinning up the records! Tune in on the following frequency: " +
        config_1.config.port);
});
//# sourceMappingURL=server.js.map