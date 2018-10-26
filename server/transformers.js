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
  
  let streamOpts;
  const range = req.headers.range;
  if (!range) {
    const head = {
      'Content-Length': file.length
    };
    res.writeHead(200, head);
  } else {
    const parts = range.replace(/bytes=/, '').split('-');
    const start = parseInt(parts[0], 10);
    const end = parts[1] 
      ? parseInt(parts[1], 10)
      : file.length - 1;
    const chunksize = (end - start) + 1;
    const head = {
      'Content-Range': `bytes ${start}-${end}/${file.length}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize
    };
    res.writeHead(206, head);
    streamOpts = {start, end};
  } 
  
  var command = ffmpeg(file.createReadStream(streamOpts))
  .videoCodec('libvpx').audioCodec('libvorbis').format('webm')
  .audioBitrate(128)
  .videoBitrate(1024)
  .outputOptions([
    //'-threads 2',
    '-deadline realtime',
    '-error-resilient 1'
  ])
  .on('start', cmd => { console.log('[ffmpeg] ', cmd); })
  .on('error', err => { console.error('[ffmpeg] ', err); });
  pump(command, res);
};

