const User = require('./../models/User.js');
const passport = require('passport');

module.exports = {
  // Passport does most of this. We just have to send back the response.
  login: function(req, res, next) {
      console.log("Login Response:", res.req.authInfo.message);
      response = {};
      response.message = res.req.authInfo.message;
      if (res.req.user) {
        response.user = {};
        response.user.displayName = res.req.user.displayName;
        response.user._id = res.req.user._id;
      }
      res.send(response);
  },

  // Find current user, then check that a user is logged in.
  // (passport middleware creates req.user for logged in users)
  whoAmI: function(req, res) {
      if (!req.user){
      console.log("no req.user!");
      return res.send();
    }
    User.findById(req.user._id).exec(function (err, result) {
      if (err) {
        return res.send(err);
      }
      res.send(result);
    });
  },

  read: function(req, res) {
    User.findById(req.params.id).exec(function (err, result) {
      if (err) {
        return res.send(err);
      }
      res.send(result);
    });
  },

  getAll: function(req, res) {
    User.find(req.query).exec(function (err, result) {
      if (err) {
        res.send(err);
      }
      res.send(result);
    });
  },

  update: function(req, res){
    User.findByIdAndUpdate(req.params.id, req.body, function(err, result){
      if (err) {
        return res.send(err);
      }
      res.send(result);
    });
  },

  delete: function(req, res){
    User.findByIdAndRemove(req.params.id, req.body, function(err, result){
      if (err) {
        res.send(err);
      }
      res.send(result);
    });
  }
};