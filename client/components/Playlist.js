import React, { Component } from 'react';

class Playlist extends Component {
  constructor(props) {
      super(props);

      this.state = { trackCards: null }
  }

  componentWillMount() {
    this.props.getPosts();
  }

  trackCards() {
    if (this.props.posts) {
      return (
        this.props.posts.map(track => (
          <div className="trackCard" key={track._id}>
            <div className="artContainer">
            <img className="albumArt" src={'resources/' + track.artUri} alt="album cover" />
            </div>
            <div className="postBody">
              <h5>{track.artist} - {track.title}</h5>
              <p>{track.postBody}</p>
            </div>
          </div>
        ))
      )
    }
    else {
      return null;
    }
  }

  render() {
    return (
      <div className="playlistPage">
        <div className="playlistContainer">

          <div className="trackCard currentTrack">
            <div className="artContainer">
              <img className="albumArt" src="https://i.imgur.com/L5RDDvU.jpg" alt="album cover" />
            </div>
            <div className="postBody">
              <h5>Spoon - Chicago at Night</h5>
              <p>Spoon is the best ever!</p>
            </div>
          </div>

          {this.trackCards()}

        </div>
      </div>
    );
  }
}

export default Playlist;