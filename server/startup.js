const fs = require('fs');
const config = require('./../config.js');

module.exports = {
    ensureExists: function(path, mask) {
        fs.mkdir(path, mask, function(err) {
            if (err) {
                if (err.code == 'EEXIST')
                    console.log("Found existing upload directory.");
            }
        });
    },

    setup: function() {
        console.log(config.formidableConfig.uploadDir);
        this.ensureExists(config.formidableConfig.uploadDir, 0777);
        this.ensureExists(config.formidableConfig.uploadDir + "/songs", 0777);
        this.ensureExists(config.formidableConfig.uploadDir + "/images", 0777);
    }
};