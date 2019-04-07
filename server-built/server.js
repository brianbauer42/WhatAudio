#!/usr/bin/env node
"use strict";
var express = require('express');
var cors = require('cors');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var passport = require('passport');
var session = require('express-session');
var formidable = require('express-formidable');
var userCtrl = require('./server/controllers/userControl');
var postCtrl = require('./server/controllers/postControl');
var inviteCtrl = require('./server/controllers/inviteControl');
var auth = require('./server/passport/auth');
var config = require('./config.js');
var uploadManagement = require('./server/uploadManagement.js');
var onStartup = require('./server/onStartup.js');
var app = express();
require('./server/passport/passport')(passport);
// Mongoose promises are deprecated, replace with standard ES6 Promise.
mongoose.Promise = Promise;
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
onStartup.ensureUploadDirExists();
// ---------------- API ROUTES ----------------
// These are authentication related routes for creation and authentication of accounts.
app.post('/api/user/register', auth.verifyInviteCode, auth.registerNewUser, auth.consumeInviteCode);
app.post('/api/user/login', auth.loginExistingUser);
app.get('/api/user/logout', function (req, res) {
    req.logout();
    res.redirect('/');
});
// These routes are for modifying or retrieving info about the users in the database.
// There is no create because passport handles all user creation in passport/passport.js
app.get('/api/user/whoami', auth.whoAmI);
app.get('/api/user', auth.requireLogin, userCtrl.getAll);
app.get('/api/user/:id', auth.requireLogin, userCtrl.read);
// app.put('/api/user/:id', auth.requireLogin, userCtrl.update);
// app.delete('/api/user/:id', auth.requireLogin, userCtrl.delete);
// Routes for posting and reading entries
app.post('/api/songs/upload', auth.requireLogin, formidable({
    uploadDir: config.uploadDir,
    multiples: true,
    keepExtensions: true
}), uploadManagement.testForValidExtensions, uploadManagement.ensureUserUploadDirExists, uploadManagement.arrangeUploadedFiles, postCtrl.create);
app.get('/api/songs', postCtrl.getAll);
app.get('/api/songs/search', postCtrl.search);
app.put('/api/songs/:id', auth.requireLogin, postCtrl.update);
app.delete('/api/songs/:id', auth.requireLogin, postCtrl.delete);
// Invite Code related endpoints
app.post('/api/invites/generate', auth.requireLogin, inviteCtrl.create);
app.get('/api/invites/getmine', auth.requireLogin, inviteCtrl.readMine);
// Return contact email from config. Just because.
app.get('/api/contactemail', function (req, res) {
    res.setHeader('Content-Type', 'application/json');
    res.json(config.contactPageEmail);
});
// --------- HOT RELOAD STUFF FOR DEV MODE -------
if (process.env.NODE_ENV === 'production') {
    console.log('\x1b[33m%s\x1b[0m', 'Running in production mode');
    app.use('/static', express.static(__dirname + '/static'));
}
else {
    // When not in production, enable hot reloading
    var chokidar = require('chokidar');
    var webpack = require('webpack');
    var webpackConfig = require('./webpack.config.dev');
    var compiler = webpack(webpackConfig);
    app.use(require('webpack-dev-middleware')(compiler, {
        noInfo: true,
        publicPath: webpackConfig.output.publicPath
    }));
    app.use(require('webpack-hot-middleware')(compiler));
    // Do "hot-reloading" of express stuff on the server
    // Throw away cached modules and re-require next time
    // Ensure there's no important state in there!
    var watcher = chokidar.watch('./server');
    watcher.on('ready', function () {
        watcher.on('all', function () {
            console.log('Clearing /server/ module cache from server');
            Object.keys(require.cache).forEach(function (id) {
                if (/\/server\//.test(id))
                    delete require.cache[id];
            });
        });
    });
}
// Connect to the database.
mongoose.connect(config.mongoUri, { useCreateIndex: true, useNewUrlParser: true });
mongoose.connection.on('error', console.error.bind(console, 'Connection error!'));
mongoose.connection.once('open', function () {
    console.log('\x1b[32m%s\x1b[0m', 'MongoDB connected successfully');
    onStartup.inviteFirstUser();
});
// Render the index (referring to root of views specified in middleware section (__dirname + '/public'))
app.get('/', function (req, res) {
    res.render('index.html');
});
// Begin serving users
app.listen(config.port, 'localhost', function (err) {
    if (err) {
        return console.error(err);
    }
    console.log('\x1b[32m%s\x1b[0m', 'Spinning up the records! Tune in on the following frequency: ' + config.port);
});
//# sourceMappingURL=server.js.map