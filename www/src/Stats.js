import styled from 'styled-components';

const Stats = styled.div`
  padding-top: 8px;
  padding-left: 4px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  line-height: 20px;
  color: #444;
  position: relative;
  .material-icons {
    margin-right: 2px;
  }
  button {
    background: none;
    border: 1px solid #ccc;
    margin-right: 12px;
    height: 30px;
    padding: 4px;
    border-radius: 2px;
    color: inherit;
    cursor: pointer;
    .material-icons {
      margin: 0;
    }
  }
  > div {
    margin: 5px 8px;
    margin-left: 0;
    display: flex;
    align-items: center;
  }
  .up, .down {
    span {
      margin-right: 4px;
    }
  }
  .peers {
    span {
      margin-right: 4px;
    }
  }
  @media (max-width: 420px) {
    display: block;
    button {
      position: absolute;
      top: 8px;
      right: 4px;
      margin: 0;
    }
  }
`;

export default Stats;
