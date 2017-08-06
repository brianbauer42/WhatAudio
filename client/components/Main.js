import React, { Component } from 'react';
import { Switch, Route } from 'react-router-dom'
import Header from './Header.js';
import MenuSlider from './MenuSlider.js';
import Player from './Player.js';
import Playlist from './Playlist';
import AdminPanel from './AdminPanel';
import Contact from './Contact';
import Login from './Login';
import Register from './Register';

class Main extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showMenu: false,
      loggedInUser: {}
    };

    this.toggleMenu = this.toggleMenu.bind(this);
    this.loggedIn = this.loggedIn.bind(this);
    this.saveLoggedInUser = this.saveLoggedInUser.bind(this);
  }

  saveLoggedInUser(user) {
    this.state.loggedInUser = user;
  }

  loggedIn() {
    if (!this.state.loggedInUser)
      return (false);
    else
      return (true);
  }
  
  requireAuth(nextState, replace) {
    if (!loggedIn()) {
      replace({
        pathname: '/login'
      })
    }
  }

  toggleMenu() {
    const currentState = this.state.showMenu;
    this.setState({ showMenu: !currentState });
  }

  render() {
    return (
      <div className="App">
        <Header toggleMenu={this.toggleMenu} />
        <Player />
        <MenuSlider toggleMenu={this.toggleMenu} showMenu={this.state.showMenu} />
        <div className="main">
          <Switch>
            <Route exact path='/' component={Playlist}/>
            <Route path='/admin' component={AdminPanel} />
            <Route path='/contact' component={Contact}/>
            <Route path='/login' component={Login} saveLoggedInUser={this.state.saveLoggedInUser} />
            <Route path='/register' component={Register}/>
          </Switch>
        </div>
      </div>
    );
  }
}

export default Main;