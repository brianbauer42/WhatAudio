const mongoose = require('mongoose');

var Post = new mongoose.Schema({
    text: { type: String },
    timestamp: { type: Date, default: Date.now },
    song: {
        title: { type: String },
        album: { type: String },
        artist: { type: String },
        uri: { type: String },
        art: { type: String }
    },
    sharedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

module.exports = mongoose.model('Post', Post);