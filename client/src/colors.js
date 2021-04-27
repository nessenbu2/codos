import React, { Component } from 'react';
import './colors.css';

function setLightMode() {
  document.body.style.setProperty('--codos-bg', '#f7f7f7');
}

function setDarkMode() {
  document.body.style.setProperty('--codos-bg', '#161b26');
}

class DarkModeButton extends Component {
  constructor() {
    super();
    this.state = {
      darkMode: false
    };
  }

  render() {
    return (
      <button onClick={this.toggleDarkMode}>Toggle Dark Mode</button>
    )
  }

  toggleDarkMode = () => {
    this.state.darkMode === true ? setLightMode() : setDarkMode();
    this.setState({darkMode: !this.state.darkMode});
  }
}

export default DarkModeButton;
