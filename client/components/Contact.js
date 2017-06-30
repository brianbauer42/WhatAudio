import React, { Component } from 'react';
import { contactPageEmail } from '../../config';

class Contact extends Component {
  render() {
    return (
      <div className="contactPage">
        <div className="contactContainer">
          <h2>contact me! <br /> {contactPageEmail}</h2>
        </div>
      </div>
    );
  }
}

export default Contact;