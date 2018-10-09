import React, { Component } from 'react';
import styled from 'styled-components';
import logo from './logo.png';
import Icon from './Icon';

const AppStyle = styled.div`
  margin: 0 auto;
  max-width: 768px;
  header {
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
  }
  main {
    margin-top: 24px;
    form {
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
      }
      button {
        display: block;
        margin: 14px auto;
        border: 1px solid #4cae4c;
        background-color: #5cb85c;
        color: white;
        padding: 12px 20px;
        border: none;
        font-size: 20px;
        border-radius: 4px;
        cursor: pointer;
        &:hover, &:focus {
          background-color: #449d44;
          border-color: #255625;
        }
      }
      .browse-label {
        text-align: right;
        font-size: 12px;
        margin-top: 24px;
      }
    }
  }
`;

class App extends Component {
  render() {
    return (
      <AppStyle>
        <header>
          <h1>
            <img src={logo} alt="logo palomitas" />
            Palomitas Downloader
          </h1>
          <nav>
            <a target="_blank" rel="noopener noreferrer" href="https://palomitas.fuken.xyz">Palomitas</a>
            <a target="_blank" rel="noopener noreferrer" href="https://palomovies.surge.sh">Palomovies</a>
            <a target="_blank" rel="noopener noreferrer" href="https://dibujitos.fuken.xyz">Dibujitos</a>
          </nav>
        </header>
        <main>
          <form>
            <h2>Torrent Streaming</h2>
            <div className="magnet-box">
              <Icon icon="file_download" />
              <input type="url" placeholder="Introduzca aqui el magnet link" />
            </div>
            <button>
              <Icon />
              Descargar torrent
            </button>
            <p className="browse-label">
              Suelta archivos .torrent aquí o examina tu equipo
            </p>
          </form>
        </main>
      </AppStyle>
    );
  }
}

export default App;
