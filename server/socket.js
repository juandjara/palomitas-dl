const socketIO = require('socket.io');
const store = require('./store');
const https = require('https');
const { parseStats, torrentProgress } = require('./utils');
const throttle = require('just-throttle');

module.exports = {
  socketServer: null,
  numClients: 0,
  torrentStatsInterval: null,

  init(httpServer) {
    this.socketServer = socketIO.listen(httpServer);
    this.socketServer.sockets.on('connection', socket => {
      this.setupClientSocket(socket);
    });
    store.on('torrent', (infoHash, torrent) => {
      if (torrent.torrent) {
        this.trackTorrentProgress(torrent);
      } else {
        torrent.once('verifying', () => this.trackTorrentProgress(torrent));
      }
    });
  },

  setupClientSocket(socket) {
    this.numClients++;
    console.log(`[torrent socket] Connected WS client. Total connected clients: ${this.numClients}`);
    socket.on('disconnect', () => {
      this.numClients--;
      console.log(`[torrent socket] Disconnected WS client. Total connected clients: ${this.numClients}`);
    });
    socket.on('pause', (infoHash) => {
      console.log(`[torrent socket] Pausing ${infoHash}`);
      const torrent = store.get(infoHash);
      if (torrent && torrent.swarm) {
        torrent.swarm.pause();
      }
    });
    socket.on('resume', (infoHash) => {
      console.log(`[torrent socket] Resuming ${infoHash}`);
      const torrent = store.get(infoHash);
      if (torrent && torrent.swarm) {
        torrent.swarm.resume();
      }
    });
    socket.on('select', (infoHash, fileIndex) => {
      console.log(`[torrent socket] Selected file ${fileIndex} for torrent ${infoHash}`);
      var torrent = store.get(infoHash);
      if (torrent && torrent.files) {
        torrent.files[fileIndex].select();
      }
    });
    socket.on('deselect', (infoHash, fileIndex) => {
      console.log(`[torrent socket] Deselected file ${fileIndex} for torrent ${infoHash}`);      
      var torrent = store.get(infoHash);
      if (torrent && torrent.files) {
        torrent.files[fileIndex].deselect();
      }
    });
  },

  notifyProgress: throttle(function(torrent) {
    this.socketServer.sockets.emit('download', torrent.infoHash, torrentProgress(torrent.bitfield.buffer));
  }, 1000),

  notifySelection: throttle(function(torrent) {
    const pieceLength = torrent.torrent.pieceLength;
    const selection = torrent.files.map(file => {
      const start = file.offset / pieceLength | 0;
      const end = (file.offset + file.length - 1) / pieceLength | 0;
      return torrent.selection.some(s => s.from <= start && s.to >= end);
    });
    this.socketServer.sockets.emit('selection', torrent.infoHash, selection);
  }, 1000),

  trackTorrentProgress(torrent) {
    this.sendNotificationToTelegram(torrent);

    this.socketServer.sockets.emit('verifying', torrent.infoHash, parseStats(torrent));
    
    this.torrentStatsInterval = setInterval(() => {
      this.socketServer.sockets.emit('stats', torrent.infoHash, parseStats(torrent));
      this.notifySelection(torrent);
    }, 1000);

    torrent.once('ready', () => {
      this.socketServer.sockets.emit('ready', torrent.infoHash, parseStats(torrent));
    });

    torrent.on('interested', () => {
      this.socketServer.sockets.emit('interested', torrent.infoHash, torrentProgress(torrent));
      this.notifySelection(torrent);
    });

    torrent.on('uninterested', () => {
      this.socketServer.sockets.emit('uninterested', torrent.infoHash, torrentProgress(torrent));
      this.notifySelection(torrent);
    });

    torrent.on('verify', () => this.notifyProgress(torrent));

    torrent.on('finished', () => {
      clearInterval(this.torrentStatsInterval);
      this.socketServer.sockets.emit('finished', torrent.infoHash);
      this.notifySelection(torrent);
      this.notifyProgress(torrent);
    });

    torrent.once('destroyed', () => {
      clearInterval(this.torrentStatsInterval);
      this.socketServer.sockets.emit('destroyed', torrent.infoHash);
    });
  },

  sendNotificationToTelegram(torrent) {
    const {BOT_TOKEN, TG_CHANNEL} = process.env;
    if (!BOT_TOKEN || !TG_CHANNEL) {
      console.log('[torrent socket] missing Telegram configuration. Aborting Telegram message send');
      return;
    }
    const filename = torrent.torrent && torrent.torrent.name;
    const msg = `New torrent added: \n${filename}`;
    const path = `/bot${encodeURIComponent(BOT_TOKEN)}/sendMessage?chat_id=${TG_CHANNEL}&text=${encodeURIComponent(msg)}`;
    return new Promise((resolve, reject) => {
      const request = https.request({
        hostname: 'api.telegram.org',
        port: 443,
        path: (path),
        method: 'GET'
      }, res => {
        res.on('data', data => {
          resolve(data);
        });
      });
      request.on('error', err => {
        reject(err);
      });
      request.end();
    });
  }
};
