import styled from 'styled-components';

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

export default Stats;
