import React, { Component } from 'react';
import SearchBox from './SearchBox.js';

class Header extends Component {
  handleMenuButtonClick(e) {
    e.preventDefault();
    this.props.toggleMenu();
  }

  render() {
    return (
      <div className="headerContainer">
        <h1 className="openMenuButton colorClick" onClick={ e => this.handleMenuButtonClick(e) }>☰</h1>
        <div className="bannerContainer">
          <h1 className="banner">∞</h1>
        </div>
        <SearchBox setPosts={this.props.setPosts} />
      </div>
    );
  }
}

export default Header;