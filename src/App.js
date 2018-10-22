import React, { Component } from 'react';
import styled from 'styled-components';
import logo from './logo.png';
import Icon from './Icon';
import magnetIcon from './magnet.svg';

const AppStyle = styled.div`
  margin: 0 auto;
  max-width: 768px;
  main {
    margin-top: 24px;
  }
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
  margin-top: 16px;
  background-color: white;
  color: #222;
`;

const downloader = 'http://localhost:8000';

class App extends Component {
  state = {
    magnet: '',
    torrents: []
  } 
  componentDidMount() {
    fetch(`${downloader}/torrents`)
    .then(res => res.json())
    .then(torrents => {
      this.setState({torrents});
    });
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
            <TorrentCard>
              <header>{torrent.name}</header>
              <ul className="files">
                {torrent.files.map(file => (
                  <li>{file.name}</li>
                ))}
              </ul>
            </TorrentCard>
          ))}
        </main>
      </AppStyle>
    );
  }
}

export default App;
