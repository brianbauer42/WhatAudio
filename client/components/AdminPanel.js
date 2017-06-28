import React, { Component } from 'react';

class AdminPanel extends Component {
  render() {
    return (
      <div className="adminPanel">
        <h1>This is the AdminPanel!</h1>
        <form method="post" action="/fileuploadtest" enctype="multipart/form-data">
          <input type="file" class="songInput" name="file" />
          <button type="submit">Submit</button>
        </form>
      </div>
    );
  }
}

export default AdminPanel;