import { Component } from 'react';
import { api } from '../api.js';

class Contact extends Component {
  constructor(props) {
    super(props);
    this.state = { contactPageEmail: 'fetching...' };
  }

  componentDidMount() {
    api
      .get('/contactemail')
      .then((response) => this.setState({ contactPageEmail: response.data.email || 'unlisted' }))
      .catch(() => this.setState({ contactPageEmail: 'unavailable' }));
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
