import React, { Component } from 'react';
import ContentArea from './ContentArea.js';
import Header from './Header.js';
import MenuSlider from './MenuSlider.js';
import Player from './Player.js';

class Main extends Component {
  constructor(props) {
    super(props);
    this.state = { showMenu: false };
    this.toggleMenu = this.toggleMenu.bind(this);
  }
  
  toggleMenu() {
    const currentState = this.state.showMenu;
    this.setState({ showMenu: !currentState });
    console.log("toggleMenu activated! showMenu: " + this.state.showMenu)
  }

  render() {
    return (
      <div className="App">
        <Header toggleMenu={this.toggleMenu} />
        <Player />
        <MenuSlider toggleMenu={this.toggleMenu} showMenu={this.state.showMenu} />
        <ContentArea className="contentArea" />
      </div>
    );
  }
}

export default Main;