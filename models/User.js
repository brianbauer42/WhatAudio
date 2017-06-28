var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');

var User = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    displayName: { type: String, unique: true },
    isAdmin: { type: Boolean },
    posts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }]
});

// Encrypts password and salts it 10 times.
User.methods.generateHash = function(password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(10), null);
};

// Compares the given password with the encrypted stored password.
User.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.password);
};

module.exports = mongoose.model('User', User);