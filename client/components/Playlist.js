import React, { Component } from 'react';
import axios from 'axios';

class Playlist extends Component {
  constructor(props) {
      super(props);

      this.state = { 
        tracksBeingEdited: [],
        tracksBeingDeleted: []
      }

      this.standardTrackCard = this.standardTrackCard.bind(this);
      this.editingTrackCard = this.editingTrackCard.bind(this);
      this.deletingTrackCard = this.deletingTrackCard.bind(this);
      this.handleInputChange = this.handleInputChange.bind(this);
  }

  componentWillMount() {
    this.props.getPosts();
  }

  handleInputChange(field, id, e) {
      var newStateTrack = this.state[id];
      newStateTrack[field] = e.target.value;
      this.setState({[id]: newStateTrack});
  }

  handleTrackSelection(track, e) {
    this.props.setCurrentTrack(track);
  }

  generateClassName(track) {
    if (this.props.isCurrentTrack(track)) {
      return 'trackCard currentTrack';
    } else {
      return 'trackCard';
    }
  }

  stopEventBubbling(e) {
    if (!e) {
      var e = window.event;
    }
    if (e.stopPropagation) {
      e.stopPropagation();
    }
  }

  handleDeletePost(id, e) {
    this.stopEventBubbling(e);
    axios.delete("/api/songs/" + id)
    .then(this.props.getPosts(), (result) => function(result){
      this.props.history.push('/login');
    });
  }
  
  handleEditPost(track, e) {
    this.stopEventBubbling(e);
    axios.put("api/songs/" + track._id, this.state[track._id])
    .then((result) => {
      this.props.getPosts()
      this.toggleEditTrackCard(track);
    }, (result) => {
      this.props.history.push('/login');
    });
  }

  toggleEditTrackCard(track, e) {
    this.stopEventBubbling(e);
    if (this.state.tracksBeingEdited.includes(track._id)) {
      this.setState({ tracksBeingEdited: this.state.tracksBeingEdited.filter(trackId => trackId !== track._id) });
    } else {
      this.setState({ tracksBeingEdited: this.state.tracksBeingEdited.concat([track._id]) });
    }
    if (!this.state[track._id]) {
      this.setState({
        [track._id]: {
          artist: track.artist,
          title: track.title,
          album: track.album,
          postBody: track.postBody
        } 
      })
    }
  }

  toggleDeleteTrackCard(track, e) {
    this.stopEventBubbling(e);
    if (this.state.tracksBeingDeleted.includes(track._id)) {
      this.setState({ tracksBeingDeleted: this.state.tracksBeingDeleted.filter(trackId => trackId !== track._id) });
    } else {
      this.setState({ tracksBeingDeleted: this.state.tracksBeingDeleted.concat([track._id]) });
    }
  }

  standardTrackCard(track) {
    return (
      <div className={this.generateClassName(track)} key={track._id} onClick={(e) => this.handleTrackSelection(track, e)} >
        <div className="artContainer">
          <img className="albumArt" src={track.artUri !== undefined ? 'resources/' + track.artUri : '/favicon.ico'} alt="album cover" />
        </div>
        <div className="postBody">
          <h4 className="trackTitle">{track.artist} - {track.title}</h4>
          <h5 className="albumTitle">{track.album}</h5>
          <p className="postBodyText">{track.postBody}</p>
          <p className="postAuthor">- {track.sharedBy.displayName}</p>
        </div>
        {this.props.isLoggedIn() ? 
        <div className="postButtonsContainer">
          <i className='fa fa-pencil-square-o fa-lg colorClick postEditButton' onClick={this.toggleEditTrackCard.bind(this, track) } />
          <i className='fa fa-times fa-lg colorClick postDeleteButton' onClick={this.toggleDeleteTrackCard.bind(this, track) } />
        </div>
          : null }
      </div>
    )
  }

  deletingTrackCard(track) {
    return (
      <div className={this.generateClassName(track)} key={track._id} >
        <div className="artContainer" onClick={(e) => this.handleTrackSelection(track, e)} >
          <img className="albumArt" src={track.artUri !== undefined ? 'resources/' + track.artUri : '/favicon.ico'} alt="album cover" />
        </div>
        <div className="postBody">
          <h2 className="areYouSure">Are you sure you want to delete this track?</h2>
          <h3 className="trackTitle">{track.artist} - {track.title}</h3><p className="postAuthor">Shared by: {track.sharedBy.displayName}</p>
          <button type="button" className="redButton" onClick={this.handleDeletePost.bind(this, track._id)} >Delete!</button>
          <button type="button" className="greenButton" onClick={this.toggleDeleteTrackCard.bind(this, track) }>Keep!</button>
        </div>
      </div>
    )
  }

  editingTrackCard(track) {
    return (
      <div className={this.generateClassName(track)} key={track._id} >
        <div className="artContainer" onClick={(e) => this.handleTrackSelection(track, e)} >
          <img className="albumArt" src={track.artUri !== undefined ? 'resources/' + track.artUri : '/favicon.ico'} alt="album cover" />
        </div>
        <div className="postBody">
          <form id="trackUpdateForm" className="trackUpdateForm" onSubmit={this.handleTrackUpdate}>
            <h5>Artist: 
              <input type='text' 
                value={this.state[track._id].artist}
                onChange={(e) => this.handleInputChange('artist', track._id, e)}
              /> Title:  
              <input type='text' 
                value={this.state[track._id].title}
                onChange={(e) => this.handleInputChange('title', track._id, e)}
              />
            </h5>
            <h5>Album: 
              <input type='text' 
                value={this.state[track._id].album}
                onChange={(e) => this.handleInputChange('album', track._id, e)}
              />
            </h5>
            <input type='textarea' 
              value={this.state[track._id].postBody}
              onChange={(e) => this.handleInputChange('postBody', track._id, e)}
            />
            <p className="postAuthor">- {track.sharedBy.displayName}</p>
            <button type="submit" onClick={this.handleEditPost.bind(this, track)} >Save Changes</button>
          </form>
        </div>
        <div className="postButtonsContainer">
          <i className='fa fa-pencil-square-o fa-lg colorClick postEditButton' onClick={this.toggleEditTrackCard.bind(this, track) } />
          <i className='fa fa-times fa-lg colorClick postDeleteButton' onClick={this.toggleDeleteTrackCard.bind(this, track._id)} />
        </div>
      </div>
    )
  }
  
  trackCards() {
    if (this.props.posts) {
      return (
        this.props.posts.map(track => {
          if (this.state.tracksBeingDeleted.includes(track._id))
            return (this.deletingTrackCard(track));
          else if (this.state.tracksBeingEdited.includes(track._id))
            return (this.editingTrackCard(track));
          else {
            return this.standardTrackCard(track);
          }
        })
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