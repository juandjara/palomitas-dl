import styled from 'styled-components';

const ProgressBar = styled.div`
  height: 20px;
  display: flex;
  margin: 12px 4px;
  margin-bottom: 0;
  div {
    height: 100%;
    background-color: #eee;
    min-width: 10px;
    &.fill {
      background-image: repeating-linear-gradient(
        135deg,
        #27ae60,
        #27ae60 10px,
        rgb(39, 174, 96, .75) 10px,
        rgb(39, 174, 96, .75) 20px
      );
      background-size: 200% 200%;
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
  @keyframes barberpole {
    100% {
      background-position: 100% 100%;
    }
  }
`;

export default ProgressBar;
