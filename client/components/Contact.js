import React, { Component } from 'react';
import { contactPageEmail } from '../../config';

class Contact extends Component {
  render() {
    return (
      <div className="contactPage">
        <div className="contactContainer">
          <h2>contact me!</h2>
          <h2 className="contactAddress">{contactPageEmail}</h2>
        </div>
      </div>
    );
  }
}

export default Contact;