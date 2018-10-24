import React, { Component } from 'react';
import styled from 'styled-components';
import logo from './logo.png';
import Icon from './Icon';
import magnetIcon from './magnet.svg';
import Checkbox from './Checkbox';
import socketIO from 'socket.io-client';
import TorrentCard from './TorrentCard';
import ProgressBar from './ProgressBar';
import Stats from './Stats';
import Form from './FormStyle';
import Header from './HeaderStyle';

const AppStyle = styled.div`
  margin: 0 auto;
  max-width: 768px;
`;

const downloader = 'http://localhost:8000';

class App extends Component {
  iconMap = {
    'connecting': 'autorenew',
    'downloading': 'cloud_download',
    'finished': 'cloud_done'
  }
  socket = null;
  state = {
    magnet: '',
    torrents: []
  } 

  componentDidMount() {
    this.fetch();
  }

  componentWillUnmount() {
    if (!this.socket) {
      return;
    }
    this.socket.removeAllListeners();
    this.socket.disconnect();
    delete this.socket;
  }

  fetch() {
    fetch(`${downloader}/torrents`)
    .then(res => res.json())
    .then(torrents => {
      this.setState({
        torrents: torrents.map(torrent => {
          torrent.stats = {};
          return torrent;
        })
      }, () => this.setupSocket());
    });
  }

  removeTorrent(hash) {
    // TODO: call remove endpoint in API
    this.setState(prev => ({
      torrents: prev.torrents.filter(storedHash => storedHash !== hash)
    }));
  }

  setupSocket() {
    this.socket = socketIO(`${downloader}/`);
    this.socket.on('connect', () => {
      console.log('Connected to Palomitas DL WebSocket');
    });
    this.socket.on('verifying', (hash, stats) => this.fetchSingleTorrent(hash, stats));
    this.socket.on('ready', (hash, stats) => this.fetchSingleTorrent(hash, stats));
    this.socket.on('stats', (hash, stats) => this.updateTorrent(hash, {stats}));
    this.socket.on('download', (hash, progress) => this.updateTorrent(hash, {progress}));
    this.socket.on('interested', hash => this.updateTorrent(hash, {interested: true}));
    this.socket.on('uninterested', hash => this.updateTorrent(hash, {interested: false}));
    this.socket.on('selection', (hash, selection) => this.updateSelection(hash, selection));
    this.socket.on('destroyed', hash => this.removeTorrent(hash));
  }

  isTorrentInState(hash) {
    return this.state.torrents.some(torrent => torrent.infoHash === hash);
  }

  fetchSingleTorrent(hash, stats) {
    fetch(`${downloader}/torrents/${hash}`)
    .then(res => res.json())
    .then(torrent => {
      if (this.isTorrentInState(torrent.infoHash)) {
        this.updateTorrent(hash, torrent)
      } else {
        this.setState(prev => ({
          torrents: prev.torrents.concat({...torrent, stats})
        }))
      }
    })
  }

  updateTorrent(hash, data) {
    this.setState(prev => ({
      torrents: prev.torrents.map(torrent => {
        return torrent.infoHash === hash ?
          {...torrent, ...data} :
          torrent;
      })
    }))
  }

  updateSelection(hash, selection) {
    this.setState(prev => ({
      torrents: prev.torrents.map(torrent => {
        if (torrent.infoHash === hash) {
          torrent.files.forEach((file, index) => {
            file.selection = selection[index];
          });
        }
        return torrent;
      })
    }))
  }

  formatSize(bytes) {
    bytes = bytes || 0;
    const KB = 1024;
    const MB = 1024 * 1024;
    if (bytes > MB) {
      bytes = `${(bytes / MB).toFixed(2)} MB`;
    } else {
      bytes = `${(bytes / KB).toFixed(2)} KB`;
    }
    return bytes;
  }

  getTorrentClass(torrent) {
    return torrent.ready ?
      (torrent.interested ? 'downloading' : 'finished') : 'connecting'
  }

  getTorrentIcon(torrent) {
    return this.iconMap[this.getTorrentClass(torrent)];
  } 

  getTorrentDate(torrent) {
    const date = new Date(torrent.addDate);
    return torrent.addDate && `el ${date.toLocaleDateString()} a las ${date.toLocaleTimeString()}`
  }

  toggleFileSelection(torrent, file, selected) {
    const event = selected ? 'select' : 'deselect';
    const index = torrent.files.indexOf(file);
    this.socket.emit(event, torrent.infoHash, index);
  }

  togglePlayPause(torrent) {
    const event = torrent.stats.paused ? 'resume' : 'pause';
    this.socket.emit(event, torrent.infoHash);
  }

  render() {
    return (
      <AppStyle>
        <Header>
          <h1>
            <img src={logo} alt="logo palomitas" />
            Palomitas Downloader
          </h1>
          <nav>
            <a target="_blank" rel="noopener noreferrer" href="https://palomitas.fuken.xyz">Palomitas</a>
            <a target="_blank" rel="noopener noreferrer" href="https://palomovies.surge.sh">Palomovies</a>
            <a target="_blank" rel="noopener noreferrer" href="https://dibujitos.fuken.xyz">Dibujitos</a>
          </nav>
        </Header>
        <main>
          <Form>
            <h2>Torrent Streaming</h2>
            <div className="magnet-box">
              <img src={magnetIcon} alt="magnet icon" />
              <input type="url" 
                value={this.state.magnet}
                onChange={ev => this.setState({magnet: ev.target.value})}
                placeholder="Introduzca el magnet link aqui" />
            </div>
            <button>
              <Icon icon="file_download" />
              Descargar
            </button>
            <p className="browse-label">
              Suelta archivos .torrent aquí o examina tu equipo
            </p>
          </Form>
          {this.state.torrents.map(torrent => (
            <TorrentCard key={torrent.infoHash} className={this.getTorrentClass(torrent)}>
              <header>
                <Icon icon={this.getTorrentIcon(torrent)} />
                <p>{torrent.name}</p>
                <button>
                  <Icon size={16} icon="close" />
                </button>
              </header>
              <p className="date">Añadido {this.getTorrentDate(torrent)}</p>
              <ProgressBar className="progress" singleChunk={torrent.progress.length === 1}>
                {torrent.progress.map((percent, index) => (
                  <div key={percent} style={{width: `${percent}%`}} 
                    className={index % 2 === 0 ? 'fill' : 'space'}></div>
                ))}
              </ProgressBar>
              <ul className="files">
                {torrent.files.map(file => (
                  <li key={file.link}>
                    <Checkbox 
                      onChange={checked => this.toggleFileSelection(torrent, file, checked)}
                      checked={file.selected}
                      label={
                        <a href={file.link}>{file.name} ({this.formatSize(file.length)})</a>
                      } />
                  </li>
                ))}
              </ul>
              <Stats>
                <button onClick={() => this.togglePlayPause(torrent)}>
                  <Icon size={20} icon={torrent.stats.paused ? 'play_arrow' : 'pause'} />
                </button>
                <div className="down">
                  <Icon size={20} icon="arrow_downward" />
                  <span title="Tráfico total de descarga">{this.formatSize(torrent.stats.downloaded)}</span>
                  <span title="Velocidad de descarga">({this.formatSize(torrent.stats.downloadSpeed)}/s)</span>
                </div>
                <div className="up">
                  <Icon size={20} icon="arrow_upward" />
                  <span title="Tráfico total de subida">{this.formatSize(torrent.stats.uploaded)}</span>
                  <span title="Velocidad de subida">({this.formatSize(torrent.stats.uploadSpeed)}/s)</span>
                </div>
                <div className="peers" title="Peers del torrent (activos / totales / en cola)">
                  <Icon size={20} icon="person" />
                  <span>{torrent.stats.activePeers || 0}</span>
                  <span>/ {torrent.stats.totalPeers || 0}</span>
                  <span>/ {torrent.stats.queuedPeers || 0}</span>
                </div>
              </Stats>
            </TorrentCard>
          ))}
        </main>
      </AppStyle>
    );
  }
}

export default App;
