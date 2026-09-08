import { Component } from 'react';
import { api, errorMessage } from '../api.js';
import { withRouter } from '../withRouter.jsx';
import StandardTrackCard from './TrackCards/StandardTrackCard.jsx';
import StandardEditTrackCard from './TrackCards/StandardEditTrackCard.jsx';
import StandardDeleteTrackCard from './TrackCards/StandardDeleteTrackCard.jsx';

class Playlist extends Component {
  constructor(props) {
    super(props);

    this.state = {
      tracksBeingEdited: [],
      tracksBeingDeleted: [],
      // Draft edits, keyed by track id, kept out of the top-level state bag.
      drafts: {},
      errorMsg: '',
    };

    this.handleEditPost = this.handleEditPost.bind(this);
    this.handleDeletePost = this.handleDeletePost.bind(this);
    this.toggleDeleteTrackCard = this.toggleDeleteTrackCard.bind(this);
    this.toggleEditTrackCard = this.toggleEditTrackCard.bind(this);
    this.handleTrackSelection = this.handleTrackSelection.bind(this);
    this.generateClassName = this.generateClassName.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
  }

  componentDidMount() {
    this.props.getPosts();
  }

  handleInputChange(field, id, event) {
    const { value } = event.target;
    this.setState((state) => ({
      drafts: { ...state.drafts, [id]: { ...state.drafts[id], [field]: value } },
    }));
  }

  handleTrackSelection(track) {
    this.props.setCurrentTrack(track);
  }

  generateClassName(track) {
    return this.props.isCurrentTrack(track) ? 'trackCard currentTrack' : 'trackCard';
  }

  handleAuthError(error) {
    if (error?.response?.status === 401) {
      this.props.navigate('/login');
      return;
    }
    this.setState({ errorMsg: errorMessage(error) });
  }

  handleDeletePost(id, event) {
    event?.stopPropagation();
    api
      .delete(`/songs/${id}`)
      .then(() => {
        this.setState((state) => ({
          tracksBeingDeleted: state.tracksBeingDeleted.filter((trackId) => trackId !== id),
        }));
        return this.props.getPosts();
      })
      .catch((error) => this.handleAuthError(error));
  }

  handleEditPost(track, event) {
    event?.preventDefault();
    event?.stopPropagation();
    api
      .put(`/songs/${track._id}`, this.state.drafts[track._id])
      .then(() => {
        this.toggleEditTrackCard(track);
        return this.props.getPosts();
      })
      .catch((error) => this.handleAuthError(error));
  }

  toggleEditTrackCard(track, event) {
    event?.stopPropagation();
    this.setState((state) => {
      const isEditing = state.tracksBeingEdited.includes(track._id);
      return {
        tracksBeingEdited: isEditing
          ? state.tracksBeingEdited.filter((trackId) => trackId !== track._id)
          : state.tracksBeingEdited.concat(track._id),
        drafts: {
          ...state.drafts,
          [track._id]: state.drafts[track._id] ?? {
            artist: track.artist ?? '',
            title: track.title ?? '',
            album: track.album ?? '',
            postBody: track.postBody ?? '',
          },
        },
      };
    });
  }

  toggleDeleteTrackCard(track, event) {
    event?.stopPropagation();
    this.setState((state) => ({
      tracksBeingDeleted: state.tracksBeingDeleted.includes(track._id)
        ? state.tracksBeingDeleted.filter((trackId) => trackId !== track._id)
        : state.tracksBeingDeleted.concat(track._id),
    }));
  }

  trackCards() {
    return (this.props.posts ?? []).map((track) => {
      if (this.state.tracksBeingDeleted.includes(track._id)) {
        return (
          <StandardDeleteTrackCard
            key={track._id}
            track={track}
            generateClassName={this.generateClassName}
            handleTrackSelection={this.handleTrackSelection}
            toggleDeleteTrackCard={this.toggleDeleteTrackCard}
            handleDeletePost={this.handleDeletePost}
          />
        );
      }
      if (this.state.tracksBeingEdited.includes(track._id)) {
        return (
          <StandardEditTrackCard
            key={track._id}
            track={track}
            inputState={this.state.drafts[track._id]}
            generateClassName={this.generateClassName}
            handleTrackSelection={this.handleTrackSelection}
            toggleDeleteTrackCard={this.toggleDeleteTrackCard}
            toggleEditTrackCard={this.toggleEditTrackCard}
            handleInputChange={this.handleInputChange}
            handleEditPost={this.handleEditPost}
          />
        );
      }
      return (
        <StandardTrackCard
          key={track._id}
          track={track}
          generateClassName={this.generateClassName}
          handleTrackSelection={this.handleTrackSelection}
          isLoggedIn={this.props.isLoggedIn}
          toggleDeleteTrackCard={this.toggleDeleteTrackCard}
          toggleEditTrackCard={this.toggleEditTrackCard}
        />
      );
    });
  }

  render() {
    return (
      <div className="playlistPage">
        <div className="playlistContainer">
          {this.state.errorMsg ? (
            <div className="errorContainer">
              <p>{this.state.errorMsg}</p>
            </div>
          ) : null}
          {this.trackCards()}
        </div>
      </div>
    );
  }
}

export default withRouter(Playlist);
