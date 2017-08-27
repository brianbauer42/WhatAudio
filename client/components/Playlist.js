import React, { Component } from 'react';
import axios from 'axios';
import StandardTrackCard from './TrackCards/StandardTrackCard';
import StandardEditTrackCard from './TrackCards/StandardEditTrackCard';
import StandardDeleteTrackCard from './TrackCards/StandardDeleteTrackCard';

class Playlist extends Component {
  constructor(props) {
      super(props);

      this.state = { 
        tracksBeingEdited: [],
        tracksBeingDeleted: []
      }

      this.handleEditPost = this.handleEditPost.bind(this);
      this.handleDeletePost = this.handleDeletePost.bind(this);
      this.toggleDeleteTrackCard = this.toggleDeleteTrackCard.bind(this);
      this.toggleEditTrackCard = this.toggleEditTrackCard.bind(this);
      this.handleTrackSelection = this.handleTrackSelection.bind(this);
      this.generateClassName = this.generateClassName.bind(this);
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
  
  trackCards() {
    if (this.props.posts) {
      return (
        this.props.posts.map(track => {
          if (this.state.tracksBeingDeleted.includes(track._id)) {
            return <StandardDeleteTrackCard key={track._id}
                                            track={track}
                                            generateClassName={this.generateClassName}
                                            handleTrackSelection={this.handleTrackSelection}
                                            toggleDeleteTrackCard={this.toggleDeleteTrackCard}
                                            handleDeletePost={this.handleDeletePost}
                                            />
          } else if (this.state.tracksBeingEdited.includes(track._id)) {
            return <StandardEditTrackCard key={track._id}
                                          track={track}
                                          inputState={this.state[track._id]}
                                          generateClassName={this.generateClassName}
                                          handleTrackSelection={this.handleTrackSelection}
                                          toggleDeleteTrackCard={this.toggleDeleteTrackCard}
                                          toggleEditTrackCard={this.toggleEditTrackCard}
                                          handleInputChange={this.handleInputChange}
                                          handleEditPost={this.handleEditPost}
                                          />
          } else {
            return <StandardTrackCard key={track._id} 
                                      track={track}
                                      generateClassName={this.generateClassName}
                                      handleTrackSelection={this.handleTrackSelection}
                                      isLoggedIn={this.props.isLoggedIn}
                                      toggleDeleteTrackCard={this.toggleDeleteTrackCard}
                                      toggleEditTrackCard={this.toggleEditTrackCard}
                                      />
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