import React, { Component } from 'react';

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
        <div className="searchContainer">
          <form className="searchForm"> 
            <input type="text" placeholder="search" />
            <input type="submit" className="invisible" />
          </form>
        </div>
      </div>
    );
  }
}

export default Header;