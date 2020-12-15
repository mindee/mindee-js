import { html } from 'lit-element'

export const containerStyle = (background = 'black') => html`
  <style>
    :host {
      display: flex;
      height: 500px;
      width: 500px;
    }
    #container {
      height: 100%;
      width: 100%;
      background: ${background};
    }
  </style>
`

export const LensStyle = (background = 'black') => html`
  <style>
    :host {
      display: flex;
      height: 200px;
      width: 200px;
    }
    #container {
      height: 100%;
      width: 100%;
      background: ${background};
    }
    .wrapper {
      position: relative;
      height: 100%;
      width: 100%;
      background: black;
    }
    .icon {
      position: absolute;
      width: 30px;
      height: 30px;
      z-index: 2;
      top: 50%;
      left: 50%;
      transform: translate(-50%; -50%);
    }
  </style>
`
