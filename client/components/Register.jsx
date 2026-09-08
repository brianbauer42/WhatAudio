import { Component } from 'react';
import { api, errorMessage } from '../api.js';
import { withRouter } from '../withRouter.jsx';

const EMPTY_USER = {
  name: '',
  email: '',
  password: '',
  verify: '',
  inviteCode: '',
};

class Register extends Component {
  constructor(props) {
    super(props);

    this.state = {
      errorMsg: '',
      successMsg: '',
      submitting: false,
      user: { ...EMPTY_USER },
    };

    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleInputChange(field, event) {
    const { value } = event.target;
    this.setState((state) => ({ user: { ...state.user, [field]: value } }));
  }

  handleSubmit(event) {
    event.preventDefault();
    this.setState({ errorMsg: '', successMsg: '' });

    if (this.state.user.password !== this.state.user.verify) {
      this.setState({ errorMsg: "Passwords didn't match!" });
      return;
    }

    this.setState({ submitting: true });
    api
      .post('/user/register', { signup: this.state.user })
      .then((response) => {
        this.props.saveLoggedInUser(response.data.user);
        this.setState({ successMsg: response.data.message, submitting: false });
        this.redirectTimer = setTimeout(() => this.props.navigate('/admin'), 1200);
      })
      .catch((error) => {
        this.setState({
          errorMsg: errorMessage(error, 'Unknown registration failure!'),
          submitting: false,
        });
      });
  }

  componentWillUnmount() {
    clearTimeout(this.redirectTimer);
  }

  render() {
    return (
      <div className="registrationPage">
        <div className="registrationContainer">
          <h2>Register</h2>
          <form className="registrationForm" onSubmit={this.handleSubmit}>
            <div>
              <label htmlFor="register-name">Name</label>
            </div>
            <div>
              <input
                id="register-name"
                type="text"
                autoComplete="username"
                value={this.state.user.name}
                onChange={(event) => this.handleInputChange('name', event)}
                placeholder="Your name"
                autoFocus
              />
            </div>
            <div>
              <label htmlFor="register-email">Email</label>
            </div>
            <div>
              <input
                id="register-email"
                type="email"
                autoComplete="email"
                value={this.state.user.email}
                onChange={(event) => this.handleInputChange('email', event)}
                placeholder="email@address.com"
              />
            </div>
            <div>
              <label htmlFor="register-password">Password</label>
            </div>
            <div>
              <input
                id="register-password"
                type="password"
                autoComplete="new-password"
                value={this.state.user.password}
                onChange={(event) => this.handleInputChange('password', event)}
              />
            </div>
            <div>
              <label htmlFor="register-verify">Verify Password</label>
            </div>
            <div>
              <input
                id="register-verify"
                type="password"
                autoComplete="new-password"
                value={this.state.user.verify}
                onChange={(event) => this.handleInputChange('verify', event)}
              />
            </div>
            <div>
              <label htmlFor="register-invite">Invite Code</label>
            </div>
            <div>
              <input
                id="register-invite"
                type="text"
                value={this.state.user.inviteCode}
                onChange={(event) => this.handleInputChange('inviteCode', event)}
              />
            </div>
            <button type="submit" disabled={this.state.submitting}>
              {this.state.submitting ? 'Submitting...' : 'Submit'}
            </button>
          </form>

          {this.state.errorMsg ? (
            <div className="errorContainer">
              <p>{this.state.errorMsg}</p>
            </div>
          ) : null}
          {this.state.successMsg ? (
            <div className="successContainer">
              <p>{this.state.successMsg}</p>
            </div>
          ) : null}
        </div>
      </div>
    );
  }
}

export default withRouter(Register);
