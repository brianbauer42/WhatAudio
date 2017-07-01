import React, { Component } from 'react';

class AdminPanel extends Component {
    constructor(props) {
        super(props);

        this.state = {
            post: {
                artist: '',
                title: '',
                album: '',
                body: '',
                audio: '',
                art: ''
            }
        }

        this.handleAudioChange = this.handleAudioChange.bind(this);
        this.handleArtChange = this.handleArtChange.bind(this);
        this.handleArtistChange = this.handleArtistChange.bind(this);
        this.handleTitleChange = this.handleTitleChange.bind(this);
        this.handleAlbumChange = this.handleAlbumChange.bind(this);
        this.handleBodyChange = this.handleBodyChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleArtistChange(e) {
        const newStatePost = this.state.post;
        newStatePost.artist = e.target.value;
        this.setState({post: newStatePost});
    }

    handleTitleChange(e) {
        const newStatePost = this.state.post;
        newStatePost.title = e.target.value;
        this.setState({post: newStatePost});
    }
    
    handleAlbumChange(e) {
        const newStatePost = this.state.post;
        newStatePost.album = e.target.value;
        this.setState({post: newStatePost});
    }

    handleBodyChange(e) {
        const newStatePost = this.state.post;
        newStatePost.body = e.target.value;
        this.setState({post: newStatePost});
    }

    handleArtChange(e) {
        const newStatePost = this.state.post;
        newStatePost.art = e.target.files[0];
        this.setState({post: newStatePost});
    }

    handleAudioChange(e) {
        const newStatePost = this.state.post;
        newStatePost.audio = e.target.files[0];
        this.setState({post: newStatePost});
    }

    handleSubmit(e) {
        console.log('A user submitted a new post: ', this.state.post);
        e.preventDefault();
    }

    render() {
        return (
            <div className="adminPage">
                <div className="adminContainer">
                <h2>Share your funky grooves!</h2>
                <form onSubmit={this.handleSubmit}>  
                {/*method="post" action="/fileuploadtest" enctype="multipart/form-data"*/}
                    <div >
                        <label>Song Title:</label>
                    </div>
                    <div >
                        <input type='text'
                            placeholder="Title"
                            value={this.state.title}
                            onChange={this.handleTitleChange}   
                        />
                    </div>
                    <div >
                        <label>Artist:</label>
                    </div>
                    <div >
                        <input type='text'
                            placeholder="Artist"
                            value={this.state.artist}
                            onChange={this.handleArtistChange}   
                        />
                    </div>
                    <div >
                        <label>From Album:</label>
                    </div>
                    <div >
                        <input type='text'
                            placeholder="Album"
                            value={this.state.album}
                            onChange={this.handleAlbumChange}    
                        />
                    </div>
                    <div >
                        <label>Post Body:</label>
                    </div>
                    <div >
                        <input type='text'
                            placeholder="What are your thoughts?"
                            value={this.state.body}
                            onChange={this.handleBodyChange}
                        />
                    </div>
                    <div>
                        <label>Upload Audio File:</label>
                    </div>
                    <div>
                        <input type='file'
                            onChange={this.handleAudioChange}
                        />
                    </div> 
                    <div>
                        <label>Image Upload (album art looks great here!)</label>
                    </div>
                    <div>
                        <input type='file'
                            onChange={this.handleArtChange}
                        />
                    </div>
                    <button type="submit">Share!</button>
                </form>
                </div>
            </div>
        );
    }
}

export default AdminPanel;