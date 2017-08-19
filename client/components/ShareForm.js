import React, { Component } from 'react';

class ShareForm extends Component {
    constructor(props) {
        super(props);

        this.state = {
            errorMsg: '',
            waitingMsg: '',
            successMsg: '',
            post: {
                artist: '',
                title: '',
                album: '',
                body: '',
                audio: '',
                art: ''
            }
        }

        this.handleFileChange = this.handleFileChange.bind(this);
        this.handleInputChange = this.handleInputChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.getErrorComponent = this.getErrorComponent.bind(this);
        this.getSuccessComponent = this.getSuccessComponent.bind(this);
        this.getWaitingComponent = this.getWaitingComponent.bind(this);
        this.clearMessages = this.clearMessages.bind(this);
    }

    handleInputChange(field, e) {
        const newStatePost = this.state.post;
        newStatePost[field] = e.target.value;
        this.setState({post: newStatePost});
    }

    handleFileChange(field, e) {
        const newStatePost = this.state.post;
        newStatePost[field] = e.target.files[0];
        this.setState({post: newStatePost});
    }

    clearMessages() {
        this.setState({
            errorMsg: '',
            waitingMsg: '',
            successMsg: ''
        })
    }

    handleSubmit(e) {
        this.setState({ waitingMsg: 'Uploading...'});
        var formElement = document.querySelector('#newPostForm');
        var formData = new FormData(formElement);
        if (this.state.post.art === '') {
            formData.delete('art');
        }
        fetch("/api/songs/upload", {
            method: "POST",
            credentials: 'include',
            body: formData
        }).then((result) => {
            return result.json();
        }).then((error) => {
            if (error && error.found === true) {
                this.setState({ waitingMsg: '', errorMsg: error.message });
            } else {
                this.setState({ successMsg: "Posted successfully!", waitingMsg: '' });
                setTimeout(() => {
                    this.props.history.push('/');
                }, 1200);
            }
        });
        e.preventDefault();
    }

    getErrorComponent() {
        if (!this.state.errorMsg) {
            return;
        } else {
            return (
                <div className="errorContainer">
                    <p>{this.state.errorMsg}</p>
                </div>
            )
        }
    }

    getSuccessComponent() {
        if (!this.state.successMsg) {
            return;
        } else {
            return (
                <div className="successContainer">
                    <p>{this.state.successMsg}</p>
                </div>
            )
        }
    }

    getWaitingComponent() {
        if (!this.state.waitingMsg) {
            return;
        } else {
            return (
                <div className="waitingContainer">
                    <p>{this.state.waitingMsg}</p>
                </div>
            )
        }
    }

    render(){
        return (
            <div className="adminContainer">
                <h2>Share your funky grooves!</h2>
                <form className="newPostForm" id="newPostForm" onSubmit={this.handleSubmit}>  
                    <div>
                        <label>Song Title:</label>
                    </div>
                    <div>
                        <input type='text'
                            name='title'
                            placeholder="Title"
                            value={this.state.title}
                            onChange={(e) => this.handleInputChange('title', e)}
                            autoFocus={true}
                        />
                    </div>
                    <div>
                        <label>Artist:</label>
                    </div>
                    <div>
                        <input type='text'
                            name='artist'
                            placeholder="Artist"
                            value={this.state.artist}
                            onChange={(e) => this.handleInputChange('artist', e)}
                        />
                    </div>
                    <div>
                        <label>From Album:</label>
                    </div>
                    <div>
                        <input type='text'
                            name='album'
                            placeholder="Album"
                            value={this.state.album}
                            onChange={(e) => this.handleInputChange('album', e)}
                        />
                    </div>
                    <div>
                        <label>Post Body:</label>
                    </div>
                    <div>
                        <textarea type='text'
                            name='postBody'
                            placeholder="What are your thoughts?"
                            value={this.state.body}
                            onChange={(e) => this.handleInputChange('body', e)}
                        />
                    </div>
                    <div>
                        <label>Upload Audio File:</label>
                    </div>
                    <div>
                        <input type='file'
                            name='audio'
                            accept='.flac,.mp3,.ogg,.opus, audio/webm,audio/ogg,audio/flac,audio/mpeg'
                            onChange={(e) => this.handleFileChange('audio', e)}
                        />
                    </div> 
                    <div>
                        <label>Image Upload (album art looks great here!)</label>
                    </div>
                    <div>
                        <input type='file'
                            name='art'
                            accept='.png,.jpeg,.jpg,.bmp,.webp,.gif, image/gif,image/jpeg,image/bmp,image/webp,image/png'
                            onChange={(e) => this.handleFileChange('art', e)}
                        />
                    </div>
                    <button type="submit">Share!</button>
                </form>

                {this.getErrorComponent()}
                {this.getWaitingComponent()}
                {this.getSuccessComponent()}

            </div>
        )
    }
}

export default ShareForm;