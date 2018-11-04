import React from 'react';
import styled from 'styled-components';

const ErrorStyle = styled.div`
  width: 100vw;
  height: 100vh;
  background: firebrick;
  font-size: 18px;
  color: white;
  .container {
    max-width: 768px;
    margin: 0px auto;
    text-align: center;
    padding: 2em;
    p {
      margin-bottom: 2em;
    }
    a {
      color: white;
    }
  }
`;

export default function RedScreenOfDeath() {
  return (
    <ErrorStyle>
      <div className="container">
        <h1>:(</h1>
        <h2>Algo ha fallado en la aplicación</h2>
        <p>Pantallazo rojo de la muerte</p>
        <a href="/">Recargar</a>
      </div>
    </ErrorStyle>
  );
}