const Invite = require('./../models/Invite.js');
const inviteHandler = require('./../inviteHandler.js');

module.exports = {
  create: function(req, res) {
    var newCode = new Invite();
    console.log(req.body);
    newCode.generatedBy = req.user._id;
    newCode.note = req.body.note;
    newCode.code = inviteHandler.uuidv4();
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

  readByUser: function(req, res) {
    Invite.find({
        generatedBy: req.user._id,
    }).exec(function (err, result) {
      if (err) {
        return res.send(err);
      }
      res.send(result);
    });
  }
}