// Require packages
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const app = express();
const userCtrl = require('./controllers/userControl.js');
const passport = require('passport');
const session = require('express-session');
const config = require('./passport/config');

// Configure Passport by passing an instance of itself to the configuration file containing strategies, etc.
require('./passport/passport')(passport);

// ---------------- MIDDLEWARE ----------------
// Initialize the middleware. These will perform their given tasks on each request and response that passes through the server.
app.use(session(config));         // Set session secret
/*app.use(session({ secret: config.secret , cookie: { maxAge: 60000 }, resave: true, saveUninitialized: true }));*/
app.use(passport.initialize());
app.use(passport.session());      // Configure session through passport. Starts session on login
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(express.static(__dirname + '/public'));
app.use('/static', express.static(__dirname + '/static'));

// ---------------- ROUTE AUTH FUNCTION ----------------
// This is a simple test to see whether a user is authenticated by passport when they make a request to a route.
// Right now it tests for ANY logged in user. We will have to add a property req.user.admin to test for if users are allowed to create accounts.
const ifAuthenticated = function(req, res, next){
  if (req.user) {               // req.user only exists after passport has authenticated a user
    next();
  } else {
    res.redirect('/');          // On failure, redirect to home (where login resides in this app)
  }
};

// ---------------- ROUTES ----------------
// These are authentication related routes for creation and authentication of accounts.
app.post('/api/user/register', passport.authenticate('local-signup'), userCtrl.login);
app.post('/api/user/login', passport.authenticate('local-login'), userCtrl.login);
app.get('/api/user/logout', function(req, res){
  req.logout();         // Method 'req.logout' is added by passport middleware. It clears req.user and any stored session data.
  res.redirect('/');    // Send user back to home page after logging out.
});

// These routes are for modifying or retrieving info about the users in the database.
// There is no create because passport handles all user creation in passport/passport.js
app.get('/api/user/whoami', userCtrl.whoAmI);
app.get('/api/user', ifAuthenticated, userCtrl.getall);
app.get('/api/user/:id', userCtrl.read);
app.put('/api/user/:id', ifAuthenticated, userCtrl.update);
app.delete('/api/user/:id', ifAuthenticated, userCtrl.delete);

if (process.env.NODE_ENV === 'production') {
  console.log('Running in production mode');
  app.use('/static', express.static('static'));
} else {
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
  watcher.on('ready', function() {
    watcher.on('all', function() {
      console.log('Clearing /server/ module cache from server');
      Object.keys(require.cache).forEach(function(id) {
        if (/\/server\//.test(id)) delete require.cache[id];
      });
    });
  });
}

// Connect to the database.
var mongoUri = "mongodb://webdbdev:pERx8h9o9T@altcoinsandbox-shard-00-00-0lfak.mongodb.net:27017/TESTINFINITE?ssl=true&replicaSet=altcoinsandbox-shard-0&authSource=admin"
mongoose.connect(mongoUri, { useMongoClient: true });
mongoose.connection.on('error', console.error.bind(console, 'Connection error!'));
mongoose.connection.once('open', function(){
  console.log("MongoDB connected successfully");
});

// Render the index (referring to root of views specified in middleware section (__dirname + '/public'))
app.get('/', function(req, res){
  res.render('index');
});

// Begin serving users
app.listen(8080, function (err) {
  if (err) {
    return console.error(err);
  }
  console.log('Spinning up the sound cannons! Targeting coordinates: 8080');
});