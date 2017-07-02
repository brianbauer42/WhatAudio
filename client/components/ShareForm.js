import React, { Component } from 'react';

class ShareForm extends Component {
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

        this.handleFileChange = this.handleFileChange.bind(this);
        this.handleInputChange = this.handleInputChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleInputChange(field, e) {
        const newStateUser = this.state.user;
        newStateUser[field] = e.target.value;
        this.setState({user: newStateUser});
    }

    handleFileChange(field, e) {
        const newStatePost = this.state.post;
        newStatePost[field] = e.target.files[0];
        this.setState({post: newStatePost});
    }

    handleSubmit(e) {
        console.log(e);
        console.log('A user submitted a new post: ', this.state.post);
        var formElement = document.querySelector('#newPostForm');
        console.log(formElement);
        var formData = new FormData(formElement);
        for (var [key, value] of formData.entries()) { 
            console.log(key, value);
        }
        // fetch("/api/songs", {
        //     method: "POST",
        //     body: formData
        // })
        e.preventDefault();
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
                            onChange={(e) => this.handleFileChange('audio', e)}
                        />
                    </div> 
                    <div>
                        <label>Image Upload (album art looks great here!)</label>
                    </div>
                    <div>
                        <input type='file'
                            name='art'
                            onChange={(e) => this.handleFileChange('art', e)}
                        />
                    </div>
                    <button type="submit">Share!</button>
                </form>
            </div>
        )
    }
}

export default ShareForm;