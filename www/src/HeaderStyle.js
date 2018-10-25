import styled from 'styled-components';

const HeaderStyle = styled.header`
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

export default HeaderStyle;
