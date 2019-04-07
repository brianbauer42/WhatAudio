#!/usr/bin/env node
import express from 'express';
import { Request, Response } from "express";
import cors from 'cors';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import passport from 'passport';
import session from 'express-session';
import formidable from 'express-formidable';
import { read as readUser, getAll as getAllUsers } from './server/controllers/userControl';
import { create as createPost , getAll as getAllPosts, search as searchPosts, update as updatePost, remove as removePost } from './server/controllers/postControl';
import { create as createInvite, readMine as readMyInvite } from './server/controllers/inviteControl';
import { requireLogin, verifyInviteCode, registerNewUser, consumeInviteCode, loginExistingUser, whoAmI } from './server/passport/auth';
import { uploadManagement } from './server/uploadManagement';
import { ensureUploadDirExists, inviteFirstUser } from './server/onStartup';

export const config = require('./config.js');
const app = express();
require('./server/passport/passport')(passport);

app.use(session({
  secret: config.sessionSecret,
  saveUninitialized: true,
  resave: true
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));
app.use('/resources', express.static(config.uploadDir));
ensureUploadDirExists();

// ---------------- API ROUTES ----------------
// These are authentication related routes for creation and authentication of accounts.
app.post('/api/user/register', verifyInviteCode, registerNewUser, consumeInviteCode);
app.post('/api/user/login', loginExistingUser);
app.get('/api/user/logout', (req: Request, res: Response) => {
  req.logout();
  res.redirect('/');
});

// These routes are for modifying or retrieving info about the users in the database.
// There is no create because passport handles all user creation in passport/passport.js
app.get('/api/user/whoami', whoAmI);
app.get('/api/user', requireLogin, getAllUsers);
app.get('/api/user/:id', requireLogin, readUser);
// app.put('/api/user/:id', auth.requireLogin, userCtrl.update);
// app.delete('/api/user/:id', auth.requireLogin, userCtrl.remove);

// Routes for posting and reading entries
app.post('/api/songs/upload', requireLogin,
  formidable({
    uploadDir: config.uploadDir,
    multiples: true,
    keepExtensions: true
  }),
  uploadManagement.testForValidExtensions,
  uploadManagement.ensureUserUploadDirExists,
  uploadManagement.arrangeUploadedFiles,
  createPost
);
app.get('/api/songs', getAllPosts);
app.get('/api/songs/search', searchPosts);
app.put('/api/songs/:id', requireLogin, updatePost);
app.delete('/api/songs/:id', requireLogin, removePost);

// Invite Code related endpoints
app.post('/api/invites/generate', requireLogin, createInvite);
app.get('/api/invites/getmine', requireLogin, readMyInvite);

// Return contact email from config. Just because.
app.get('/api/contactemail', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'application/json');
  res.json(config.contactPageEmail);
})

// --------- HOT RELOAD STUFF FOR DEV MODE -------
if (process.env.NODE_ENV === 'production') {
  console.log('\x1b[33m%s\x1b[0m', 'Running in production mode');
  app.use('/static', express.static(__dirname + '/static'));
} else {
  // When not in production, enable hot reloading
  const chokidar = require('chokidar');
  const webpack = require('webpack');
  const webpackConfig = require('./webpack.config.dev');
  const compiler = webpack(webpackConfig);
  app.use(require('webpack-dev-middleware')(compiler, {
    noInfo: true,
    publicPath: webpackConfig.output.publicPath
  }));
  app.use(require('webpack-hot-middleware')(compiler));
  // Do "hot-reloading" of express stuff on the server
  // Throw away cached modules and re-require next time
  // Ensure there's no important state in there!
  const watcher = chokidar.watch('./server');
  watcher.on('ready', () => {
    watcher.on('all', () => {
      console.log('Clearing /server/ module cache from server');
      Object.keys(require.cache).forEach((id) => {
        if (/\/server\//.test(id)) delete require.cache[id];
      });
    });
  });
}

// Connect to the database.
mongoose.connect(config.mongoUri, { useCreateIndex: true, useNewUrlParser: true });
mongoose.connection.on('error', console.error.bind(console, 'Connection error!'));
mongoose.connection.once('open', () => {
  console.log('\x1b[32m%s\x1b[0m', 'MongoDB connected successfully');
  inviteFirstUser();
});

// Render the index (referring to root of views specified in middleware section (__dirname + '/public'))
app.get('/', (req: Request, res: Response) => {
  res.render('index.html');
});

// Begin serving users
app.listen(config.port, 'localhost', (err:  NodeJS.ErrnoException) => {
  if (err) {
    return console.error(err);
  }
  console.log('\x1b[32m%s\x1b[0m', 'Spinning up the records! Tune in on the following frequency: ' + config.port);
});