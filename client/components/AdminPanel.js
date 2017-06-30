import React, { Component } from 'react';

class AdminPanel extends Component {
  render() {
    return (
      <div className="adminPage">
        <div className="adminContainer">
          <h1>Share those funky grooves here!</h1>
          <form method="post" action="/fileuploadtest" enctype="multipart/form-data">
            <label>MP3 file:</label>
            {' '}
            <input type="file" class="songInput" name="file" />
            <br />
            <label>Song:</label>
            {' '}
            <input type="text" />
            <label>Band:</label>
            {' '}
            <input type="text" />
            <label>Album:</label>
            {' '}
            <input type="text" />
            <label>Optional image upload:</label>
            {' '}
            <input type="file" class="songInput" name="file" />
            <br />
            <button type="submit">Share!</button>
          </form>
        </div>
      </div>
    );
  }
}

export default AdminPanel;