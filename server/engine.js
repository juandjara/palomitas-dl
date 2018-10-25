const torrentStream = require('torrent-stream');
const BITTORRENT_PORT = 6881;

function createTorrentStream(input, opts) {
  const torrent = torrentStream(input, opts);
  torrent.once('verifying', () => {
    const totalPieces = torrent.torrent.pieces.length;
    let verifiedPieces = 0;

    console.log(`[torrent engine] verifying ${torrent.infoHash} \n\nFILES: `);
    torrent.files.forEach((file, i) => {
      console.log(`${i}. ${file.name}`);
    });
    console.log('');

    torrent.on('verify', () => {
      if (++verifiedPieces === totalPieces) {
        torrent.emit('finished');
        console.log(`[torrent engine] finished downloading ${torrent.infoHash}`);
      }
    });
  });

  torrent.once('ready', () => {
    console.log('[torrent engine] ready ' + torrent.infoHash);
    torrent.ready = true;

    // select the largest file and start downloading it
    // TODO: maybe we should disable this and start downloading when the file is streamed
    const file = torrent.files.reduce((a, b) => (
      a.length > b.length ? a : b
    ));
    file.select();
  });

  torrent.on('uninterested', () => {
    console.log('[torrent engine] uninterested ' + torrent.infoHash);
  });

  torrent.on('interested', () => {
    console.log('[torrent engine] interested ' + torrent.infoHash);
  });

  torrent.on('idle', () => {
    console.log('[torrent engine] idle ' + torrent.infoHash);
  });

  torrent.on('error', (err) => {
    console.log('[torrent engine] error ' + torrent.infoHash + ': ' + err);
  });

  torrent.once('destroyed', () => {
    console.log('[torrent engine] destroyed ' + torrent.infoHash);
    torrent.removeAllListeners();
  });

  torrent.listen(BITTORRENT_PORT, () => {
    console.log('[torrent engine] listening ' + torrent.infoHash + ' on BT port ' + torrentStream.port);
  });

  return torrent;
}

module.exports = createTorrentStream;
