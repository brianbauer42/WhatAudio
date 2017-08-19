const Post = require('./../models/Post.js');
const User = require('./../models/User.js');
const fs = require('fs');
const path = require('path');

module.exports = {
  create: function(req, res) {
    var newPost = new Post(req.fields);
    newPost.audioUri = req.user.displayName + '/' + path.basename(req.files.audio.path);
    if (req.files.art !== undefined) {
      newPost.artUri = req.user.displayName + '/' + path.basename(req.files.art.path);
    }
    newPost.sharedBy = req.user._id;
    newPost.save(function(err, result){
      if (err) {
        res.send(err);
      }
      User.update(
        { _id: req.user._id }, 
        { $push: { posts: result._id } }
      ).exec();
      res.send(result);
    });
  },

  read: function(req, res) {
    Post.findById(req.params.id).exec(function (err, result) {
      if (err) {
        return res.send(err);
      }
      res.send(result);
    });
  },

  getAll: function(req, res) {
    Post.find(req.query).populate('sharedBy', 'displayName').exec(function (err, result) {
      if (err) {
        res.send(err);
      }
      res.send(result);
    });
  },

  update: function(req, res){
    req.body.dateEdited = Date.now();
    Post.findByIdAndUpdate(req.params.id, req.body, function(err, result){
      if (err) {
        return res.send(err);
      }
      res.send(result);
    });
  },

  delete: function(req, res){
    Post.findByIdAndRemove(req.params.id, function(err, result){
      if (err) {
        res.send(err);
      }
      res.send(result);
    });
  }
};