const fs = require('fs');
const path = require('path');
const config = require('./../config.js');

const validImageExtensions = [".jpeg", ".jpg", ".gif", ".bmp", ".webp", ".png"];
const validAudioExtensions = [".mp3", ".ogg", ".flac", ".opus"];

module.exports = {
    testForValidExtensions: function(req, res, next) {
        var foundErr = false;
        if (!req.files.audio || !validAudioExtensions.includes(path.extname(req.files.audio.path))) {
            foundErr = true;
            res.message = "Valid audio formats are: .mp3, .ogg, .flac, and .opus";
        } else if (req.files.art && !validImageExtensions.includes(path.extname(req.files.art.path))) {
            foundErr = true;
            res.message = "Valid image formats are: .jpeg, .jpg, .gif, .bmp, .webp, .png"
        }
        console.log('Extension Test: foundErr?',foundErr);
        if (foundErr) {
            res.status(403).send();
        } else {
            next();
        }
    },

    ensureUserUploadDirExists: function(req, res, next) {
        const path = config.uploadDir + '/' + req.user.displayName;
        fs.mkdir(path, 0744, function(err) {
            if (err) {
                if (err.code == 'EEXIST'){
                    console.log("User upload dir already exists, did not create: ", path);
                    next(); // Ignore error, we want the folder to exist.
                } else {
                    console.log("Error creating upload directory: ", path);
                    console.log("ERR", err);
                    next(err);
                }
            } else {
                console.log("Created new user upload directory: ", path);
                next();
            }
        });
    },
    
    arrangeUploadedFiles: function(req, res, next) {
        if (req.files.audio) {
            var oldPath = req.files.audio.path;
            var newPath = path.dirname(req.files.audio.path) + '/' + req.user.displayName + '/' + path.basename(req.files.audio.path);
            fs.rename(oldPath, newPath, function() {
                if (req.files.art) {
                    oldPath = req.files.art.path;
                    newPath = path.dirname(req.files.art.path) + '/' + req.user.displayName + '/' + path.basename(req.files.art.path);
                    fs.rename(oldPath, newPath, next)
                } else {
                    next();
                }
            });
        }
    }
};