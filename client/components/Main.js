import React, { Component } from 'react';
import { Switch, Route } from 'react-router-dom';
import { soundManager } from 'soundmanager2';
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
      currentPost: null,
      currentTrack: null,
      currentTrackData: {
        mongoID: null,
        displayText: "I'm waiting for you..."
      }
    };

    this.toggleMenu = this.toggleMenu.bind(this);
    this.isLoggedIn = this.isLoggedIn.bind(this);
    this.handleLogout = this.handleLogout.bind(this);
    this.updateLoggedInUser = this.updateLoggedInUser.bind(this);
    this.getPosts = this.getPosts.bind(this);
    this.setCurrentTrack = this.setCurrentTrack.bind(this);
    this.clearCurrentTrack = this.clearCurrentTrack.bind(this);
    this.play = this.play.bind(this);
    this.next = this.next.bind(this);
    this.previous = this.previous.bind(this);
  }

  updateLoggedInUser(user) {
    this.setState({loggedInUser: user})
  }

  handleLogout() {
    axios.get("/api/user/logout")
    .then(() => this.updateLoggedInUser(null));
  }

  clearCurrentTrack() {
    soundManager.destroySound(this.state.currentTrack.id);
    this.setState({
      currentTrack: null,
      currentPost: null,
      currentTrackData: {
        displayText: "I'm in between jobs...",
        mongoID: null
      }
    })
  }

  setCurrentTrack(track) {
    console.log("SETCURRENTTRACK CALLED", track);
    if (this.state.currentTrack) {
      this.clearCurrentTrack();
    }
    this.setState({
      currentTrack: soundManager.createSound({
        id: 'track_' + track._id,
        url: '/resources/' + track.audioUri,
        stream: true,
        autoPlay: true,
        onfinish: this.next
      }),
      currentPost: track,
      currentTrackData: {
        displayText: track.artist + ": " + track.title,
        mongoID: track._id
      }
    });
  }

  getPosts() {
    axios.get("/api/songs").then(result => {
      this.setState({posts: result.data});
    });
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

  play() {
    if (this.state.currentTrack && !this.state.currentTrack.paused) {
      return ;
    }
    if (!this.state.currentTrack && this.state.posts) {
        this.setCurrentTrack(this.state.posts[0]);
    }
    if (this.state.currentTrack){
      this.state.currentTrack.play();
    }
  }

  next() {
    if (!this.state.currentTrack) {
      return ;
    }
    var postCount = this.state.posts.length;
    if (postCount < 1) {
      return ;
    }
    var index = this.state.posts.indexOf(this.state.currentPost);
    if (index === -1 || index === postCount - 1) {
      this.setCurrentTrack(this.state.posts[0])
    } else {
      this.setCurrentTrack(this.state.posts[++index])
    }
    this.play();
  }

  previous() {
    if (!this.state.currentTrack) {
      return ;
    }
    var postCount = this.state.posts.length;
    if (postCount < 1) {
      return ;
    }
    var index = this.state.posts.indexOf(this.state.currentPost);
    if (index === -1 || index === 0) {
      this.setCurrentTrack(this.state.posts[--postCount]);
    } else {
      this.setCurrentTrack(this.state.posts[--index]);
    }
    this.play();
  }

  render() {
    return (
      <div className="App">
        <Header toggleMenu={this.toggleMenu} />
        <Player play={this.play}
                pause={this.state.currentTrack ? this.state.currentTrack.togglePause : null}
                next={this.next}
                previous={this.previous}
                displayText={this.state.currentTrackData.displayText}
                isPlaying={this.state.currentTrack ? !this.state.currentTrack.paused : false}
                />
        <MenuSlider toggleMenu={this.toggleMenu}
                    showMenu={this.state.showMenu}
                    isLoggedIn={this.isLoggedIn}
                    handleLogout={this.handleLogout}
                    />
        <div className="main">

          <Switch>
            <Route exact path='/' render={(props) => <Playlist {...props}
                                                      posts={this.state.posts}
                                                      getPosts={this.getPosts}
                                                      setCurrentTrack={this.setCurrentTrack}
                                                      currentTrackID={this.state.currentTrackData.mongoID}
                                                      playerGlow={ this.state.currentTrack ? !this.state.currentTrack.paused : false }
                                                      /> } />
            <Route path='/admin' component={AdminPanel} />
            <Route path='/contact' component={Contact} />
            <Route path='/login' render={(props) => <Login {...props}
                                                      saveLoggedInUser={this.updateLoggedInUser}
                                                    /> } />
            <Route path='/register' component={Register}/>
          </Switch>

        </div>
      </div>
    );
  }
}

export default Main;