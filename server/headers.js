module.exports = {
    applyStreamingHeaders: function(res, path, stat) {
        res.set('content-length', stat.size);
        if (path.endsWith(".jpg") || path.endsWith(".jpeg")) {
            res.set("Content-Type",  'image/jpeg');
        } else if (path.toLowerCase().endsWith(".png")) {
            res.set("Content-Type",  'image/png');
        } else if (path.toLowerCase().endsWith(".bmp")) {
            res.set("Content-Type",  'image/bmp');
        } else if (path.toLowerCase().endsWith(".gif")) {
            res.set("Content-Type",  'image/gif');
        } else if (path.toLowerCase().endsWith(".webp")) {
            res.set("Content-Type",  'image/webp');
        } else if (path.toLowerCase().endsWith(".flac")) {
            res.set("Content-Type",  'audio/flac');
        } else if (path.toLowerCase().endsWith(".mp3")) {
            res.set("Content-Type",  'audio/mpeg');
        } else if (path.toLowerCase().endsWith(".ogg")) {
            res.set("Content-Type",  'audio/ogg');
        } else if (path.toLowerCase().endsWith(".opus")) {
            res.set("Content-Type",  'audio/webm');
        }
    }
};