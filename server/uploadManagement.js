const fs = require('fs');
const path = require('path');
const config = require('./../config.js');

const validImageExtensions = [".jpeg", ".jpg", ".gif", ".bmp", ".webp", ".png"];
const validAudioExtensions = [".mp3", ".ogg", ".flac", ".opus"];
const deleteInvalidFiles = function(files) {
    fs.unlink(files.audio.path);
    if (files.art !== undefined) {
        fs.unlink(files.art.path);
    }
};

module.exports = {

    testForValidExtensions: function(req, res, next) {
        var error = {};
        error.found = false;
        if (!req.files.audio || !validAudioExtensions.includes(path.extname(req.files.audio.path))) {
            error.found = true;
            error.message = "Valid audio formats are: .mp3, .ogg, .flac, and .opus";
        } else if (req.files.art !== undefined && !validImageExtensions.includes(path.extname(req.files.art.path))) {
            error.found = true;
            error.message = "Valid image formats are: .jpeg, .jpg, .gif, .bmp, .webp, .png";
        }
        if (error.found === true) {
            deleteInvalidFiles(req.files);
            res.json(error);
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
                    deleteInvalidFiles(req.files);
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
                if (req.files.art !== undefined) {
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