const mongoose = require('mongoose');

var Post = new mongoose.Schema({
    dateCreated: { type: Date, default: Date.now },
    dateEdited: { type: Date },
    title: { type: String },
    album: { type: String },
    artist: { type: String },
    postBody: { type: String },
    audioUri: { type: String },
    artUri: { type: String },
    sharedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

Post.index({ title: 'text', album: 'text', artist: 'text', postBody: 'text'});

module.exports = mongoose.model('Post', Post);