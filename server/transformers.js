const fs = require('fs');
const path = require('path');
const pump = require('pump');
const ffmpeg = require('fluent-ffmpeg');

module.exports.subs = (req, res, torrent, file) => {
  res.type('text/vtt');
  const command = ffmpeg(file.createReadStream())
  .noVideo()
  .noAudio()
  .format('webvtt')
  .outputOptions([
    // //'-threads 2',
    // '-deadline realtime',
    // '-error-resilient 1'
  ])
  .on('start', cmd => { console.log('[ffmpeg] ', cmd); })
  .on('error', err => { console.error('[ffmpeg] ', err); });
  pump(command, res);
};

module.exports.probe = (req, res, torrent, file) => {
  const filePath = path.join(torrent.path, file.path);
  fs.exists(filePath, (exists) => {
    if (!exists) {
      res.status(404).json({error: 'File doesn`t exist.'});
      return;
    }
    return ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) {
        console.error(err);
        res.status(500).json({error: err.toString()});
        return;
      }
      res.json(metadata);
    });
  });
};

module.exports.remux = (req, res, torrent, file) => {
  res.type('video/webm');
  
  var command = ffmpeg(file.createReadStream())
  .seekInput(req.query.t || 0)
  .videoCodec('libvpx')
  .audioCodec('libvorbis')
  .format('webm')
  // .audioBitrate(128)
  // .videoBitrate(1024)
  .outputOptions([
    '-pix_fmt yuv420p',
    '-color_primaries 1',
    '-color_trc 1',
    '-colorspace 1',
    '-movflags +faststart',
    '-g 90',
    '-keyint_min 90',
    '-deadline realtime',
    '-error-resilient 1'
  ])
  .on('start', cmd => { console.log('[ffmpeg] ', cmd); })
  .on('error', err => { console.error('[ffmpeg] ', err); });
  pump(command, res);
};

