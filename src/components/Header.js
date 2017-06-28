import React, { Component } from 'react';
import { Link } from 'react-router-dom'

class Header extends Component {
  render() {
    return (
      <div className="header">
        <h1>This is the Header!</h1>
          <ul>
            <li><Link to='/'>Playlist</Link></li>
            <li><Link to='/admin'>Admin Panel</Link></li>
          </ul>
      </div>
    );
  }
}

export default Header;