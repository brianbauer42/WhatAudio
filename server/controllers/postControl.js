const Post = require('./../models/Post.js');

module.exports = {
  create: function(req, res) {
    var newPost = new Post(req.body);
    newPost.save(function(err, result){
      if (err) {
        res.send(err);
      }
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
    Post.find(req.query).exec(function (err, result) {
      if (err) {
        res.send(err);
      }
      res.send(result);
    });
  },

  update: function(req, res){
    Post.findByIdAndUpdate(req.params.id, req.body, function(err, result){
      if (err) {
        return res.send(err);
      }
      res.send(result);
    });
  },

  delete: function(req, res){
    console.log(req.user._id, req.params.id);
    Post.findByIdAndRemove(req.params.id, req.body, function(err, result){
      if (err) {
        res.send(err);
      }
      res.send(result);
    });
  }
};