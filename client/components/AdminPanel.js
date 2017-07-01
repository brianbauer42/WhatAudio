import React, { Component } from 'react';

class AdminPanel extends Component {
  render() {
    return (
      <div className="adminPage">
        <div className="adminContainer">
          <h2>Share your funky grooves!</h2>
          <form method="post" action="/fileuploadtest" enctype="multipart/form-data">
            <div >
                <label>Song Title:</label>
            </div>
            <div >
                <input type='text' placeholder="Title" />
            </div>
            <div >
                <label>Band Name:</label>
            </div>
            <div >
                <input type='text' placeholder="Band" />
            </div>
            <div >
                <label>From Album:</label>
            </div>
            <div >
                <input type='text' placeholder="Album" />
            </div>
            <div >
                <label>Post Body:</label>
            </div>
            <div >
                <input type='text' placeholder="What are your thoughts?" />
            </div>
            <div>
                <label>Upload Audio File:</label>
            </div>
            <div>
                <input type='file' name='song' />
            </div>
            <div>
                <label>Image Upload (album art looks great here!)</label>
            </div>
            <div>
                <input type='file' name='art' />
            </div>
            <button type="submit">Share!</button>
          </form>
        </div>
      </div>
    );
  }
}

export default AdminPanel;