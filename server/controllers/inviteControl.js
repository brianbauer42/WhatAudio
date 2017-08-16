const crypto = require('crypto');
const Invite = require('./../models/Invite.js');
const User = require('./../models/User.js');

module.exports = {
  create: function(req, res) {
    var newCode = new Invite();
    newCode.generatedBy = req.user._id;
    newCode.note = req.body.note;
    newCode.code = crypto.randomBytes(16).toString("hex");
    newCode.save(function(err, result){
      if (err) {
        res.send(err);
      }
      User.update(
        { _id: req.user._id }, 
        { $push: { invites: result._id } }, function () {
          res.send(result);
        }
      );
    });
  },

  readMine: function(req, res) {
    Invite.find({
        generatedBy: req.user._id,
    }).populate('claimedBy')
    .exec(function (err, result) {
      if (err) {
        return res.send(err);
      }
      res.send(result);
    });
  }
}