const torrentStream = require('torrent-stream');
const BITTORRENT_PORT = 6881;

function createTorrentStream(input, opts) {
  const torrent = torrentStream(input, opts);

  torrent.on('ready', () => {
    console.log(`[engine.js] ready ${torrent.infoHash} with files: `);
    torrent.files.forEach((file, i) => {
      console.log(`\t ${i}. ${file.name}`);
    });
    console.log('');
  });

  // uncommenting the code below will
  // select the largest file and start downloading it whenever a new torrent is loaded in the app
  // torrent.once('ready', () => {
  //   const biggestFile = torrent.files.reduce((a, b) => (
  //     a.length > b.length ? a : b
  //   ));
  //   biggestFile.select();
  // });

  torrent.on('uninterested', () => {
    console.log('[engine.js] uninterested ' + torrent.infoHash);
  });

  torrent.on('interested', () => {
    console.log('[engine.js] interested ' + torrent.infoHash);
  });

  torrent.on('idle', () => {
    torrent.emit('finished');
    console.log(`[engine.js] finished downloading ${torrent.infoHash}`);
  });

  torrent.once('destroyed', () => {
    console.log('[engine.js] destroyed ' + torrent.infoHash);
    torrent.removeAllListeners();
  });

  torrent.on('error', (err) => {
    console.error('[engine.js] ERROR ' + torrent.infoHash + ': \n' + err);
  });

  torrent.listen(BITTORRENT_PORT, () => {
    console.log('[engine.js] listening ' + torrent.infoHash + ' on BT port ' + BITTORRENT_PORT);
  });

  return torrent;
}

module.exports = createTorrentStream;
