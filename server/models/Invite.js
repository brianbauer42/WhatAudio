const mongoose = require('mongoose');

var Invite = new mongoose.Schema({
    timestamp: { type: Date, default: Date.now },
    generatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    claimedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    code: { type: String, required: true },
    note: { type: String },
    claimed: { type: Boolean, default: false }
});

module.exports = mongoose.model('Invite', Invite);