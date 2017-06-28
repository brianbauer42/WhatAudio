var userModel = require('./../models/userModel.js'); //Create user model

module.exports = {
  // Passport does most of this. We just have to send back the response.
  login: function(req, res, next){
      console.log('userCtrl.login function was called');
      res.send();
  },

  // Find current user, then check that a user is logged in.
  // (passport middleware creates req.user for logged in users)
  whoAmI: function(req, res) {
      if (!req.user){
      console.log("no req.user!");
      return res.send();
    }
    // req.user is a passport functionality
    userModel.findById(req.user._id).exec(function (err, result) {
      if (err) {
        return res.send(err);
      }
      res.send(result);
    });
  },

  read: function(req, res) {
    userModel.findById(req.params.id).exec(function (err, result) {
      if (err) {
        return res.send(err);
      }
      res.send(result);
    });
  },

  getall: function(req, res) {
    userModel.find(req.query).exec(function (err, result) {
      if (err) {
        res.send(err);
      }
      res.send(result);
    });
  },

  update: function(req, res){
    userModel.findByIdAndUpdate(req.params.id, req.body, function(err, result){
      if (err) {
        return res.send(err);
      }
      res.send(result);
    });
  },

  delete: function(req, res){
    console.log(req.user._id, req.params.id);
    userModel.findByIdAndRemove(req.params.id, req.body, function(err, result){
      if (err) {
        res.send(err);
      }
      res.send(result);
    });
  }
};