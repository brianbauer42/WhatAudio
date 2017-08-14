import React, { Component } from 'react';

class Contact extends Component {
  constructor(props) {
    super(props);

    this.state = {
      contactPageEmail: 'fetching...'
    };

    // this.getContactEmail = this.getContactEmail.bind(this);
  }

  componentDidMount() {
    this.getContactEmail();
  }

  getContactEmail() {
    fetch('/api/contactemail')
      .then(response => response.json())
      .then(json => {
        this.setState({
          contactPageEmail: json
        })
      })
  }

  render() {
    return (
      <div className="contactPage">
        <div className="contactContainer">
          <h2>contact me!</h2>
          <h2 className="contactAddress">{this.state.contactPageEmail}</h2>
        </div>
      </div>
    );
  }
}

export default Contact;