const { Router } = require('express');
const {serializeTorrent, parseStats} = require('./utils');
const store = require('./store');
const pump = require('pump');
const transformers = require('./transformers');
const du = require('diskusage');

function torrentMiddleware(req, res, next) {
  const hash = req.params.infoHash;
  req.torrent = store.get(hash);
  if (!req.torrent) {
    return res.status(404).json({error: `torrent not found for hash ${hash}`});
  }
  next();
}
const router = new Router();

router.get('/torrents', (req, res) => {
  const torrents = store.list().map(serializeTorrent);
  return res.json(torrents);
});

const MIN_SPACE = 2 * 1024 * 1024 * 1024; // 2GB
router.post('/torrents', async (req, res, next) => {
  const magnet = req.body.link;
  const diskinfo = await du.check('/');
  if (diskinfo.available < MIN_SPACE) {
    res.status(500).json({ error: 'Space available on disk is below 2GB. Please free some space before adding more torrents' });
    return;
  }

  try {
    const infoHash = await store.loadTorrent(magnet);
    res.json(serializeTorrent(store.get(infoHash)));
  } catch (err) {
    next(err);
  }
});

router.get('/torrents/:infoHash', torrentMiddleware, (req, res) => {
  res.json(serializeTorrent(req.torrent));
});

router.delete('/torrents/:infoHash', torrentMiddleware, (req, res, next) => {
  const hash = req.torrent.infoHash;
  try {
    store.remove(hash);
    res.json({message: `deleted ${hash}`});
  } catch (err) {
    next(err);
  }
});

// TODO: incluir aqui endpoint para subir archivos .torrent

router.get('/torrents/:infoHash/stats', torrentMiddleware, (req, res) => {
  res.json(parseStats(req.torrent));
});

router.post('/torrents/:infoHash/pause', torrentMiddleware, (req, res) => {
  req.torrent.swarm.pause();
  res.json({message: 'torrent swarm paused'});
});

router.post('/torrents/:infoHash/resume', torrentMiddleware, (req, res) => {
  req.torrent.swarm.resume();
  res.json({message: 'torrent swarm resumed'});
});

router.post('/torrents/:infoHash/select', torrentMiddleware, (req, res) => {
  const indexes = req.body.indexes;
  if (Array.isArray(indexes)) {
    indexes.forEach(index => {
      req.torrent.files[index].select();
    });
  }
  res.json({message: `selected files with indexes ${indexes}`});
});

router.post('/torrents/:infoHash/deselect', torrentMiddleware, (req, res) => {
  const indexes = req.body.indexes;
  if (Array.isArray(indexes)) {
    indexes.forEach(index => {
      req.torrent.files[index].deselect();
    });
  }
  res.json({message: `deselected files with indexes ${indexes}`});
});

router.get('/torrents/:infoHash/files/:path([^"]+)', torrentMiddleware, (req, res) => {
  const torrent = req.torrent;
  const file = torrent.files.find(f => f.path === req.params.path);
  const range = req.headers.range;

  if (!file) {
    return res.status(404).json({error: 'file not found'});
  }

  const transformKey = req.query.transform;
  const transformFn = transformers[transformKey];
  if (typeof transformFn === 'function') {
    return transformFn(req, res, torrent, file);
  }

  // TODO: disabled until header problem is fixed
  // if (!torrent.amInterested) {
  //   console.log('[torrent api routes] redirecting to NGINX storage');  
  //   return res.redirect(`/storage/${req.params.infoHash}/${req.params.path}`);
  // }
  
  res.type(file.name);
  req.connection.setTimeout(3600000);

  if (!range) {
    const head = {
      'Content-Length': file.length
    };
    res.writeHead(200, head);
    pump(file.createReadStream(), res);
    return;
  }

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
  pump(file.createReadStream({start, end}), res);
});

module.exports = router;
