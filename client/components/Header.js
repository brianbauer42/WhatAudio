import React, { Component } from 'react';
import Player from './Player.js';

class Header extends Component {
  render() {
    return (
      <div className="header">
        <h1 className="openMenuButton">☰</h1>
        <h1 className="banner">∞</h1>
        <form className="searchForm">
          <input type="text" placeholder="search" />
          <input type="submit" className="invisible" />
        </form>
        <Player />
      </div>
    );
  }
}

export default Header;