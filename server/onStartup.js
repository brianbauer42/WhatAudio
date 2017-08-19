const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const mongoose = require('mongoose');
const Invite = require('./models/Invite.js');
const User = require('./models/User.js');
const config = require('./../config.js');

const createAndSaveFirstInvite = function() {
    var newCode = new Invite();
    newCode.note = "Genesis Invite";
    newCode.code = crypto.randomBytes(16).toString("hex");
    firstInvite = newCode.code;
    newCode.save(function(err, result){
      if (err) {
        console.log(err);
      }
      return;
    });
    return (firstInvite);
}

module.exports = {
    ensureUploadDirExists: function() {
        const path = config.uploadDir;
        fs.mkdir(path, 0744, function(err) {
            if (err) {
                if (err.code == 'EEXIST') {
                    console.log("Specified upload directory exists: ", path);
                } else {
                    console.log("Error creating upload directory: ", path);
                    console.log(err);
                }
            } else {
                console.log("Created upload directory: ", path);
            }
        });
    },

    inviteFirstUser: function() {
        User.findOne({}).exec(function (err, result) {
            if (err) {
                console.log(err);
            }
            if (result === null) {
                Invite.findOne({}).exec(function (err, result) {
                    if (err) {
                        console.log(err);
                    }
                    if (result === null) {
                        var firstInvite = createAndSaveFirstInvite();;
                        fs.writeFile(path.resolve(__dirname, '..') + "/REGISTRATION_CODE.txt", "First invite code: " + firstInvite, function(err) {
                            if(err) {
                                return console.log(err);
                            }
                            console.log('\x1b[36m%s\x1b[0m', "No users were found in the database. Use this code to create your first account: " + firstInvite);
                            console.log('\x1b[36m%s\x1b[0m', "Saving a copy at " + path.resolve(__dirname, '..') + "/REGISTRATION_CODE.txt");
                        }); 
                    }
                })
            }
        })
    }
};