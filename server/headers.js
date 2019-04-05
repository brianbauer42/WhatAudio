module.exports = {
    applyStreamingHeaders: function(res, path, stat) {
      var re = /(?:\.([^.]+))?$/; // should grab the file extension
      var ext = re.exec(path);
        res.set('content-length', stat.size);
        switch (ext) {
          case "jpg" || "jpeg":
            res.set("Content-Type",  'image/jpeg');
          case ".png":
            res.set("Content-Type",  'image/png');
          case ".bmp":
            res.set("Content-Type",  'image/bmp');
          case ".gif":
            res.set("Content-Type",  'image/gif');
          case ".webp":
            res.set("Content-Type",  'image/webp');
          case ".flac":
            res.set("Content-Type",  'audio/flac');
          case ".mp3":
            res.set("Content-Type",  'audio/mpeg');
          case ".ogg":
            res.set("Content-Type",  'audio/ogg');
          case ".opus":
            res.set("Content-Type",  'audio/webm');
        }
    }
};