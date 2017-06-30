import React, { Component } from 'react';
import { NavLink } from 'react-router-dom';

class MenuSlider extends Component {
  handleMenuButtonClick(e) {
    e.preventDefault();
    this.props.toggleMenu();
  }

  render() {
    return (
      <div className={this.props.showMenu ? "menuContainer menuShow" : "menuContainer menuHide" }>
        <i className='fa fa-times fa-lg colorClick closeMenuButton' onClick={ e => this.handleMenuButtonClick(e) } />
        <div className="menuContent">
          <NavLink to='/'>Playlist</NavLink>
          <br />
          <NavLink to='/admin'>Admin Panel</NavLink>
          <br />
          <NavLink to='/login'>Login</NavLink>
          <br />
          <NavLink to='/register'>Register</NavLink>
          <br />
          <NavLink to='/contact'>Contact</NavLink>
        </div>
      </div>
    );
  }
}

export default MenuSlider;