import styled from 'styled-components';

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
  .date {
    margin: 12px 4px;
    font-size: 14px;
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
    header {
      color: #2980b9;
    }
  }
  &.downloading {
    header {
      color: #27ae60;
    }
    .progress .fill {
      animation: barberpole 8s linear infinite;
    }
  }
  &.connecting {
    header {
      color: #f7b731;
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

export default TorrentCard;