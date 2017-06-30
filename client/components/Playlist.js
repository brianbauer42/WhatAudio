import React, { Component } from 'react';

class Playlist extends Component {
  render() {
    return (
      <div className="playlistPage">
        <div className="playlistContainer">
          <div className="trackCard">
            <div className="artContainer">
              <img className="albumArt" src="https://i.imgur.com/L5RDDvU.jpg" alt="album cover" />
            </div>
            <div className="postBody">
              <h5>Spoon - Chicago at Night</h5>
              <p>Spoon is the best ever!</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Playlist;