import React, { Component } from 'react';
import styled from 'styled-components';
import logo from './logo.png';
import Icon from './Icon';
import magnetIcon from './magnet.svg';
import Checkbox from './Checkbox';
import socketIO from 'socket.io-client';

const AppStyle = styled.div`
  margin: 0 auto;
  max-width: 768px;
`;

const Header = styled.header`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #ccc;
  h1 {
    font-weight: normal;
    display: flex;
    align-items: center;
    margin: 12px 0;
  }
  img {
    width: 50px;
    height: 50px;
    margin: 0 12px;
  }
  nav {
    a {
      display: inline-block;
      color: white;
      font-size: 16px;
      text-decoration: none;
      padding: 10px;
      margin-left: 4px;
      border-radius: 6px;
      &:hover {
        background: rgba(255,255,255, 0.2);
      }
    }
  }
  @media (max-width: 600px) {
    h1 {
      font-size: 24px;
      margin-bottom: 4px;
    }
    img {
      width: 40px;
      height: 40px;
    }
    nav a {
      margin-bottom: 4px;
    }
  }
`;

const Form = styled.form`
  padding: 12px;
  background: rgba(255,255,255, 0.2);
  border-radius: 4px;
  margin: 24px 0;
  h2 {
    font-size: 32px;
    text-align: center;
    font-weight: normal;
    margin-top: 16px;
    margin-bottom: 16px;
  }
  .magnet-box {
    background-color: white;
    display: flex;
    align-items: center;
    color: #666;
    border-radius: 4px;
    padding: 6px 8px;
    input {
      flex: 1 0 auto;
      font-size: 16px;
      line-height: 32px;
      padding: 0 8px;
      border: none;
    }
    img {
      width: 24px;
      margin-right: 4px;
    }
  }
  button {
    display: block;
    margin: 16px auto;
    border: 1px solid #4cae4c;
    background-color: #5cb85c;
    color: white;
    padding: 12px 20px 12px 12px;
    border: none;
    font-size: 20px;
    border-radius: 4px;
    cursor: pointer;
    &:hover, &:focus {
      background-color: #449d44;
      border-color: #255625;
    }
    .material-icons {
      vertical-align: middle;
      margin-right: 8px;
    }
  }
  .browse-label {
    text-align: right;
    font-size: 12px;
    margin-top: 24px;
  }
`;

const TorrentCard = styled.div`
  padding: 8px 12px;
  margin-bottom: 18px;
  background-color: white;
  color: #666;
  border-radius: 4px;
  header {
    border-bottom: 2px solid currentColor;
    padding: 6px 4px;
    display: flex;
    align-items: center;
    font-weight: 600;
    p {
      margin-left: 8px;
      flex-grow: 1;
    }
    button {
      background: transparent;
      border: none;
      padding: 0;
      cursor: pointer;
    }
  }
  ul {
    list-style: none;
    margin: 0;
    padding: 16px 8px;
    border-bottom: 1px solid #ccc;
    li {
      padding: 8px 0;
    }
  }
  &.finished {
    color: #2980b9;
  }
  &.downloading {
    color: #27ae60;
  }
  &.connecting {
    color: #f7b731;
    header {
      overflow: hidden;
      > .material-icons {
        animation: 1s spin ease-in-out infinite;
      }
    }
  }
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;
const Stats = styled.div`
  padding-top: 8px;
  padding-left: 4px;
  display: flex;
  align-items: center;
  line-height: 20px;
  color: #444;
  button {
    background: none;
    border: 1px solid #ccc;
    margin-right: 12px;
    height: 30px;
    padding: 4px;
    border-radius: 2px;
    color: inherit;
    cursor: pointer;
  }
  > div {
    margin-right: 8px;
    display: flex;
    align-items: center;
  }
  .up, .down {
    span {
      margin-right: 4px;
    }
  }
  .peers {
    .material-icons {
      margin-right: 2px;
    }
    span {
      margin-right: 4px;
    }
  }
`;

const ProgressBar = styled.div`
  height: 20px;
  display: flex;
  margin-top: 12px;
  div {
    height: 100%;
    background-color: #eee;
    &.fill {
      background-image: repeating-linear-gradient(
        135deg,
        #27ae60,
        #27ae60 10px,
        rgb(39, 174, 96, .75) 10px,
        rgb(39, 174, 96, .75) 20px
      );
      background-size: 200% 200%;
      ${props => props.animated ? `
        animation: 10s barberpole linear infinite;
      ` : ''}
    }
    ${props => props.singleChunk ? `
      border-radius: 10px;
    ` : `
      &:first-child {
        border-radius: 10px 0 0 10px;
      }
      &:last-child {
        border-radius: 0 10px 10px 0;
      }
    `}
  }
  &.animated {
    .fill {
      animation: barberpole 10s linear infinite;
    }
  }
  @keyframes barberpole {
    100% {
      background-position: 100% 100%;
    }
  }
`;

const downloader = 'http://localhost:8000';

class App extends Component {
  socket = null;
  state = {
    magnet: '',
    torrents: []
  } 

  componentDidMount() {
    this.fetch();
  }

  componentWillUnmount() {
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
    this.setState(prev => ({
      torrents: prev.torrents.filter(storedHash => storedHash !== hash)
    }));
  }

  setupSocket() {
    this.socket = socketIO(`${downloader}/`);
    this.socket.on('connect', () => {
      console.log('Connected to Palomitas DL WebSocket');
    });
    this.socket.on('destroyed', hash => this.removeTorrent(hash));
    this.socket.on('stats', (hash, stats) => this.updateStats(hash, stats));
    this.socket.on('download', stats => {
      console.log('download event', stats);
    });
    this.socket.on('progress', stats => {
      console.log('progress event', stats);
    });
  }

  updateStats(hash, stats) {
    console.log('update stats for hash ', hash)
    this.setState(prev => ({
      torrents: prev.torrents.map(torrent => {
        if (torrent.infoHash === hash) {
          torrent.stats = stats;
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

  toggleFileSelection(torrent, file, selected) {
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
            <TorrentCard key={torrent.infoHash} className="downloading">
              <header>
                <Icon icon="cloud_download" />
                <p>{torrent.name}</p>
                <button>
                  <Icon size={16} icon="close" />
                </button>
              </header>
              <ProgressBar animated singleChunk={torrent.progress.length === 1}>
                {torrent.progress.map((percent, index) => (
                  <div style={{width: `${percent}%`}} 
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
                        <a href={file.link}>{file.name}</a>
                      } />
                  </li>
                ))}
              </ul>
              <Stats>
                <button>
                  <Icon size={20} icon="pause" />
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
