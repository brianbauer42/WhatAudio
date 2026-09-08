import { Component } from 'react';
import { errorMessage } from '../api.js';
import { withRouter } from '../withRouter.jsx';

const EMPTY_POST = {
  title: '',
  artist: '',
  album: '',
  postBody: '',
};

class ShareForm extends Component {
  constructor(props) {
    super(props);

    this.state = {
      errorMsg: '',
      waitingMsg: '',
      successMsg: '',
      post: { ...EMPTY_POST },
      audioFile: null,
      artFile: null,
    };

    this.formRef = null;
    this.handleFileChange = this.handleFileChange.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentWillUnmount() {
    clearTimeout(this.redirectTimer);
  }

  handleInputChange(field, event) {
    const { value } = event.target;
    this.setState((state) => ({ post: { ...state.post, [field]: value } }));
  }

  handleFileChange(field, event) {
    this.setState({ [field]: event.target.files[0] ?? null });
  }

  handleSubmit(event) {
    event.preventDefault();

    if (!this.state.audioFile) {
      this.setState({ errorMsg: 'Pick an audio file to share.', waitingMsg: '', successMsg: '' });
      return;
    }

    const formData = new FormData();
    Object.entries(this.state.post).forEach(([key, value]) => formData.append(key, value));
    formData.append('audio', this.state.audioFile);
    if (this.state.artFile) {
      formData.append('art', this.state.artFile);
    }

    this.setState({ waitingMsg: 'Uploading...', errorMsg: '', successMsg: '' });

    // fetch, not axios: FormData uploads need the browser to set the boundary.
    fetch('/api/songs/upload', {
      method: 'POST',
      credentials: 'include',
      body: formData,
    })
      .then(async (response) => {
        const body = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(body.message || 'Upload failed.');
        }
        this.setState({ successMsg: 'Posted successfully!', waitingMsg: '' });
        this.redirectTimer = setTimeout(() => this.props.navigate('/'), 1200);
      })
      .catch((error) => {
        this.setState({ waitingMsg: '', errorMsg: errorMessage(error, 'Upload failed.') });
      });
  }

  render() {
    return (
      <div className="adminContainer">
        <h2>Share your funky grooves!</h2>
        <form className="newPostForm" onSubmit={this.handleSubmit}>
          <div>
            <label htmlFor="share-title">Song Title:</label>
          </div>
          <div>
            <input
              id="share-title"
              type="text"
              name="title"
              placeholder="Title"
              value={this.state.post.title}
              onChange={(event) => this.handleInputChange('title', event)}
              autoFocus
            />
          </div>
          <div>
            <label htmlFor="share-artist">Artist:</label>
          </div>
          <div>
            <input
              id="share-artist"
              type="text"
              name="artist"
              placeholder="Artist"
              value={this.state.post.artist}
              onChange={(event) => this.handleInputChange('artist', event)}
            />
          </div>
          <div>
            <label htmlFor="share-album">From Album:</label>
          </div>
          <div>
            <input
              id="share-album"
              type="text"
              name="album"
              placeholder="Album"
              value={this.state.post.album}
              onChange={(event) => this.handleInputChange('album', event)}
            />
          </div>
          <div>
            <label htmlFor="share-body">Post Body:</label>
          </div>
          <div>
            <textarea
              id="share-body"
              name="postBody"
              placeholder="What are your thoughts?"
              value={this.state.post.postBody}
              onChange={(event) => this.handleInputChange('postBody', event)}
            />
          </div>
          <div>
            <label htmlFor="share-audio">Upload Audio File:</label>
          </div>
          <div>
            <input
              id="share-audio"
              type="file"
              name="audio"
              accept=".flac,.mp3,.ogg,.opus,audio/ogg,audio/flac,audio/mpeg"
              onChange={(event) => this.handleFileChange('audioFile', event)}
            />
          </div>
          <div>
            <label htmlFor="share-art">Image Upload (album art looks great here!)</label>
          </div>
          <div>
            <input
              id="share-art"
              type="file"
              name="art"
              accept=".png,.jpeg,.jpg,.bmp,.webp,.gif,image/gif,image/jpeg,image/bmp,image/webp,image/png"
              onChange={(event) => this.handleFileChange('artFile', event)}
            />
          </div>
          <button type="submit" disabled={Boolean(this.state.waitingMsg)}>
            Share!
          </button>
        </form>

        {this.state.errorMsg ? (
          <div className="errorContainer">
            <p>{this.state.errorMsg}</p>
          </div>
        ) : null}
        {this.state.waitingMsg ? (
          <div className="waitingContainer">
            <p>{this.state.waitingMsg}</p>
          </div>
        ) : null}
        {this.state.successMsg ? (
          <div className="successContainer">
            <p>{this.state.successMsg}</p>
          </div>
        ) : null}
      </div>
    );
  }
}

export default withRouter(ShareForm);
