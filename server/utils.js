const mime = require('mime-types')

function parseStats({swarm}) {
  return {
    totalPeers: swarm.wires.length,
    activePeers: swarm.wires.reduce((acum, wire) => (
      acum + Number(!wire.peerChoking)
    ), 0),
    downloaded: swarm.downloaded,
    uploaded: swarm.uploaded,
    downloadSpeed: swarm.downloadSpeed(),
    uploadSpeed: swarm.uploadSpeed(),
    queuedPeers: swarm.queued,
    paused: swarm.paused
  };
}

function torrentProgress(buffer) {
  const progress = [];
  let counter = 0;
  let downloaded = true;

  for (let i = 0; i < buffer.length; i++) {
    const piece = buffer[i];
    if (downloaded && piece > 0 || !downloaded && piece === 0) {
      counter++;
    } else {
      progress.push(counter);
      counter = 1;
      downloaded = !downloaded;
    }
  }

  progress.push(counter);

  return progress.map(p => ( p * 100 / buffer.length ));
}

function serializeTorrent(torrent) {
  const ready = !!torrent.torrent;
  if (!ready) {
    return {
      name: torrent.name,
      addDate: torrent.addDate,
      infoHash: torrent.infoHash
    };
  }
  const pieceLength = torrent.torrent.pieceLength;

  return {
    ready,
    infoHash: torrent.infoHash,
    name: torrent.torrent.name,
    interested: torrent.amInterested,
    addDate: torrent.addDate,
    files: torrent.files.map(f => {
      const start = f.offset / pieceLength | 0;
      const end = (f.offset + f.length - 1) / pieceLength | 0;
      const link = `/torrents/${torrent.infoHash}/files/${encodeURIComponent(f.path)}`;
      return {
        name: f.name,
        mime: mime.lookup(f.name) || 'application/octet-stream',
        path: f.path,
        length: f.length,
        offset: f.offset,
        link,
        selected: torrent.selection.some(s => (
          s.from <= start && s.to >= end
        ))
      };
    }),
    progress: torrentProgress(torrent.bitfield.buffer)
  };
}

module.exports = {
  parseStats,
  torrentProgress,
  serializeTorrent
};
