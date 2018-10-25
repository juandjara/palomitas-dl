import styled from 'styled-components';

const FormStyle = styled.form`
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

export default FormStyle;
