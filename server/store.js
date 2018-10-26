const path = require('path');
const fs = require('fs');
const {promisify} = require('util');
const EventEmitter = require('events');
const engine = require('./engine');
const parseTorrent = require('parse-torrent');

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

const storagePath = process.env.STORAGE_PATH || '/tmp';

class Store extends EventEmitter {
  constructor({storageFilePath}) {
    super();
    this.storageFilePath = storageFilePath;
    this.torrents = {};
  }

  loadTorrent(input) {
    const {infoHash} = parseTorrent(input);
    if (this.torrents[infoHash]) {
      return Promise.resolve(infoHash);
    }
    console.log(`[torrent store] adding ${infoHash}`);

    try {
      this._loadData({ infoHash, addDate: Date.now() });
      return this.updateStorage().then(() => infoHash);
    } catch (err) {
      return Promise.reject(err);
    }
  }

  _loadData({infoHash, addDate}) {
    console.log(`[torrent store] loading hash ${infoHash}`);
    const torrent = engine({infoHash});
    torrent.addDate = addDate;
    this.emit('torrent', infoHash, torrent);
    this.torrents[infoHash] = torrent;
  }

  get(infoHash) {
    return this.torrents[infoHash];
  }

  remove(infoHash) {
    const torrent = this.torrents[infoHash];
    if (!torrent) {
      return;
    }
    torrent.destroy();
    torrent.remove(function () {
      torrent.emit('destroyed');
    });
    delete this.torrents[infoHash];
    return this.updateStorage();
  }

  list() {
    return Object.keys(this.torrents).map(key => this.torrents[key]);
  }

  init() {
    return this.readStorage().then(torrents => {
      console.log('[torrent store] resuming from previous state');
      torrents.forEach(torrent => {
        this._loadData(torrent);
      });
    }).catch(err => {
      if (err.code === 'ENOENT') {
        console.log('[torrent store] previous state not found');
      } else {
        console.error(`[torrent store] error reading storage ${err}`);
        return Promise.reject(err);
      }
    });
  }

  clean(signal) {
    if (signal) {
      console.log(`[torrent store] Received signal ${signal}. Cleaning torrent store`);
    }
    Object.keys(this.torrents).forEach(key => {
      const torrent = this.torrents[key];
      torrent.destroy(() => {
        torrent.emit('destroyed');
        delete this.torrents[key];
      });
    });
    process.nextTick(process.exit);
  }

  readStorage() {
    return readFile(this.storageFilePath)
    .then(text => JSON.parse(text));
  }

  updateStorage() {
    const torrents = Object.keys(this.torrents).map(hash => ({
      infoHash: hash,
      addDate: this.torrents[hash].addDate
    }));
    return writeFile(this.storageFilePath, JSON.stringify(torrents))
    .then(() => {
      console.log('[torrent store] state saved');
    }).catch((err) => {
      throw err;
    });
  }
}

const storageFilePath = path.join(storagePath, 'torrentlist.json');
const instance = new Store({storageFilePath});

instance.init();

process.on('SIGINT', () => instance.clean('SIGINT'));
process.on('SIGTERM', () => instance.clean('SIGTERM'));

module.exports = instance;
