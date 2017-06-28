import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import Player from './Player.js';

class Header extends Component {
  render() {
    return (
      <div className="header">
        <h1>This is the Header!</h1>
        <Player />
          <ul>
            <li><Link to='/'>Playlist</Link></li>
            <li><Link to='/admin'>Admin Panel</Link></li>
            <li><Link to='/contact'>Contact</Link></li>
          </ul>
      </div>
    );
  }
}

export default Header;