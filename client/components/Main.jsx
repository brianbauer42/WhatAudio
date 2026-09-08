import { Component } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { api } from '../api.js';
import Header from './Header.jsx';
import MenuSlider from './MenuSlider.jsx';
import Player from './Player.jsx';
import Playlist from './Playlist.jsx';
import AdminPanel from './AdminPanel.jsx';
import Contact from './Contact.jsx';
import Login from './Login.jsx';
import Register from './Register.jsx';

const IDLE_TEXT = 'Press Play...';

class Main extends Component {
  constructor(props) {
    super(props);

    // Plain HTML5 audio; the old soundmanager2 Flash shim is long dead.
    this.audio = null;
    // Switching tracks aborts the previous play() promise. This token lets a
    // stale rejection be ignored instead of clobbering the new track's status.
    this.playToken = 0;

    this.state = {
      showMenu: false,
      loggedInUser: null,
      posts: [],
      postOrder: 'newest-first',
      currentPost: null,
      isPlaying: false,
      displayText: IDLE_TEXT,
    };

    this.toggleMenu = this.toggleMenu.bind(this);
    this.isLoggedIn = this.isLoggedIn.bind(this);
    this.handleLogout = this.handleLogout.bind(this);
    this.updateLoggedInUser = this.updateLoggedInUser.bind(this);
    this.getPosts = this.getPosts.bind(this);
    this.setPosts = this.setPosts.bind(this);
    this.isCurrentTrack = this.isCurrentTrack.bind(this);
    this.setCurrentTrack = this.setCurrentTrack.bind(this);
    this.play = this.play.bind(this);
    this.togglePause = this.togglePause.bind(this);
    this.next = this.next.bind(this);
    this.previous = this.previous.bind(this);
    this.handlePlayEvent = this.handlePlayEvent.bind(this);
    this.handlePauseEvent = this.handlePauseEvent.bind(this);
    this.handleAudioError = this.handleAudioError.bind(this);
  }

  componentDidMount() {
    const audio = new Audio();
    audio.preload = 'none';
    audio.addEventListener('play', this.handlePlayEvent);
    audio.addEventListener('pause', this.handlePauseEvent);
    audio.addEventListener('ended', this.next);
    audio.addEventListener('error', this.handleAudioError);
    this.audio = audio;

    api
      .get('/user/whoami')
      .then((response) => this.updateLoggedInUser(response.data.user))
      .catch(() => this.updateLoggedInUser(null));
  }

  componentWillUnmount() {
    if (!this.audio) {
      return;
    }
    this.audio.removeEventListener('play', this.handlePlayEvent);
    this.audio.removeEventListener('pause', this.handlePauseEvent);
    this.audio.removeEventListener('ended', this.next);
    this.audio.removeEventListener('error', this.handleAudioError);
    this.audio.pause();
    this.audio.removeAttribute('src');
    this.audio = null;
  }

  handlePlayEvent() {
    this.setState({ isPlaying: true });
  }

  handlePauseEvent() {
    this.setState({ isPlaying: false });
  }

  handleAudioError() {
    // Fires with an empty error during teardown and while swapping sources.
    if (this.audio && this.audio.error && this.audio.currentSrc) {
      this.setState({ displayText: "That track wouldn't load..." });
    }
  }

  updateLoggedInUser(user) {
    this.setState({ loggedInUser: user || null });
  }

  handleLogout() {
    api
      .post('/user/logout')
      .catch(() => {})
      .then(() => this.updateLoggedInUser(null));
  }

  isLoggedIn() {
    return Boolean(this.state.loggedInUser && this.state.loggedInUser.displayName);
  }

  isCurrentTrack(track) {
    return Boolean(this.state.currentPost && this.state.currentPost._id === track._id);
  }

  setCurrentTrack(track) {
    if (!track || !this.audio) {
      return;
    }
    const token = (this.playToken += 1);
    this.setState({
      currentPost: track,
      displayText: `${track.artist} - ${track.title}`,
    });
    this.audio.src = `/resources/${track.audioUri}`;
    this.audio.play().catch((error) => {
      // AbortError means we interrupted playback ourselves, by switching
      // tracks or pausing. Only a genuine failure (an autoplay block, say)
      // should replace the track name with a prompt.
      if (error?.name === 'AbortError' || token !== this.playToken) {
        return;
      }
      this.setState({ displayText: 'Press Play to start listening...' });
    });
  }

  sortPosts(posts) {
    const sorted = [...posts];
    if (this.state.postOrder === 'newest-first') {
      return sorted.sort((a, b) => new Date(b.dateCreated) - new Date(a.dateCreated));
    }
    if (this.state.postOrder === 'oldest-first') {
      return sorted.sort((a, b) => new Date(a.dateCreated) - new Date(b.dateCreated));
    }
    return sorted;
  }

  setPosts(posts) {
    this.setState({ posts: this.sortPosts(Array.isArray(posts) ? posts : []) });
  }

  getPosts() {
    return api
      .get('/songs')
      .then((response) => this.setPosts(response.data))
      .catch(() => this.setPosts([]));
  }

  toggleMenu() {
    this.setState((state) => ({ showMenu: !state.showMenu }));
  }

  play() {
    if (!this.audio) {
      return;
    }
    if (!this.state.currentPost) {
      this.setCurrentTrack(this.state.posts[0]);
      return;
    }
    this.audio.play().catch(() => {});
  }

  togglePause() {
    if (!this.audio || !this.state.currentPost) {
      return;
    }
    if (this.audio.paused) {
      this.audio.play().catch(() => {});
    } else {
      this.audio.pause();
    }
  }

  /** Walks the playlist, wrapping around at either end. */
  step(offset) {
    const { posts, currentPost } = this.state;
    if (posts.length === 0) {
      return;
    }
    if (!currentPost) {
      this.setCurrentTrack(posts[0]);
      return;
    }
    const index = posts.findIndex((post) => post._id === currentPost._id);
    const target = index === -1 ? 0 : (index + offset + posts.length) % posts.length;
    this.setCurrentTrack(posts[target]);
  }

  next() {
    this.step(1);
  }

  previous() {
    this.step(-1);
  }

  render() {
    return (
      <div className="App">
        <Header toggleMenu={this.toggleMenu} setPosts={this.setPosts} />
        <Player
          play={this.play}
          pause={this.togglePause}
          next={this.next}
          previous={this.previous}
          displayText={this.state.displayText}
          isPlaying={this.state.isPlaying}
        />
        <MenuSlider
          toggleMenu={this.toggleMenu}
          showMenu={this.state.showMenu}
          isLoggedIn={this.isLoggedIn}
          handleLogout={this.handleLogout}
        />
        <div className="main">
          <Routes>
            <Route
              path="/"
              element={
                <Playlist
                  posts={this.state.posts}
                  getPosts={this.getPosts}
                  isLoggedIn={this.isLoggedIn}
                  isCurrentTrack={this.isCurrentTrack}
                  setCurrentTrack={this.setCurrentTrack}
                />
              }
            />
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="/contact" element={<Contact />} />
            <Route
              path="/login"
              element={<Login saveLoggedInUser={this.updateLoggedInUser} />}
            />
            <Route
              path="/register"
              element={<Register saveLoggedInUser={this.updateLoggedInUser} />}
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </div>
    );
  }
}

export default Main;
