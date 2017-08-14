import React, { Component } from 'react';

class Playlist extends Component {
  constructor(props) {
      super(props);

      this.state = { trackCards: null }
  }

  componentWillMount() {
    this.props.getPosts();
  }

  isCurrentTrack(track) {
    if (this.props.currentTrackID && track._id === this.props.currentTrackID) {
      return true;
    } else {
      return false;
    }
  }

  trackCards() {
    if (this.props.posts) {
      return (
        this.props.posts.map(track => (
          <div className={'trackCard' + (this.isCurrentTrack(track) ? ' currentTrack' : '')} key={track._id}
                                     onClick={(track) => this.props.setCurrentTrack} >
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

          {this.trackCards()}

        </div>
      </div>
    );
  }
}

export default Playlist;