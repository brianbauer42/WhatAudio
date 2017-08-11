import React, { Component } from 'react';
import { Switch, Route } from 'react-router-dom'
import axios from 'axios';
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
      loggedInUser: null,
      posts: null,
      currentTrack: null
    };

    this.toggleMenu = this.toggleMenu.bind(this);
    this.isLoggedIn = this.isLoggedIn.bind(this);
    this.updateLoggedInUser = this.updateLoggedInUser.bind(this);
    this.getPosts = this.getPosts.bind(this);
  }
  
  componentDidMount(){
    this.getPosts();
  }

  updateLoggedInUser(user) {
    this.state.loggedInUser = user;
    console.log(this.state.loggedInUser);
  }

  handleLogout() {
    axios.post("/api/user/logout")
    .then(() => this.updateLoggedInUser(null));
  }

  getPosts() {
    axios.get("/api/songs").then(result => {
      this.setState({posts: result.data})
      console.log(this.state.posts);
//    this.setCurrentTrack();
    })
  }

  setCurrentTrack() {

  }

  isLoggedIn() {
    if (this.state.loggedInUser && this.state.loggedInUser.displayName)
      return (true);
    else
      return (false);
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
        <MenuSlider toggleMenu={this.toggleMenu} showMenu={this.state.showMenu} isLoggedIn={this.isLoggedIn} handleLogout={this.handleLogout} />
        <div className="main">
          <Switch>
            <Route exact path='/' render={(props) => <Playlist {...props} posts={this.state.posts} /> } />
            <Route path='/admin' component={AdminPanel} />
            <Route path='/contact' component={Contact} />
            <Route path='/login' render={(props) => <Login {...props} saveLoggedInUser={this.updateLoggedInUser}/>}/>
            <Route path='/register' component={Register}/>
          </Switch>
        </div>
      </div>
    );
  }
}

export default Main;