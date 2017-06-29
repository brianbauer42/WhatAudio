import React, { Component } from 'react';
import { NavLink } from 'react-router-dom';

class MenuSlider extends Component {
  render() {
    return (
      <div className="menuSlider">
        <h2>Menu</h2>
          <div className="closeMenuButton colorClick">×</div>
          <ul>
            <li><NavLink to='/'>Playlist</NavLink></li>
            <li><NavLink to='/admin'>Admin Panel</NavLink></li>
            <li><NavLink to='/contact'>Contact</NavLink></li>
          </ul>
      </div>
    );
  }
}

export default MenuSlider;