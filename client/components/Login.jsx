import { Component } from 'react';
import { api, errorMessage } from '../api.js';
import { withRouter } from '../withRouter.jsx';

class Login extends Component {
  constructor(props) {
    super(props);

    this.state = {
      errorMsg: '',
      successMsg: '',
      submitting: false,
      user: { email: '', password: '' },
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
    this.setState({ errorMsg: '', successMsg: '', submitting: true });

    api
      .post('/user/login', { login: this.state.user })
      .then((response) => {
        this.props.saveLoggedInUser(response.data.user);
        this.setState({ successMsg: response.data.message, submitting: false });
        this.redirectTimer = setTimeout(() => this.props.navigate('/admin'), 1200);
      })
      .catch((error) => {
        this.setState({
          errorMsg: errorMessage(error, 'Unknown login failure...'),
          submitting: false,
          user: { email: '', password: '' },
        });
      });
  }

  componentWillUnmount() {
    clearTimeout(this.redirectTimer);
  }

  render() {
    return (
      <div className="loginPage">
        <div className="loginContainer">
          <h2>Login</h2>
          <form onSubmit={this.handleSubmit}>
            <div>
              <label htmlFor="login-email">Email</label>
            </div>
            <div>
              <input
                id="login-email"
                type="email"
                autoComplete="email"
                value={this.state.user.email}
                onChange={(event) => this.handleInputChange('email', event)}
                placeholder="email@address.com"
                autoFocus
              />
            </div>
            <div>
              <label htmlFor="login-password">Password</label>
            </div>
            <div>
              <input
                id="login-password"
                type="password"
                autoComplete="current-password"
                value={this.state.user.password}
                onChange={(event) => this.handleInputChange('password', event)}
              />
            </div>
            <button type="submit" disabled={this.state.submitting}>
              {this.state.submitting ? 'Logging in...' : 'Login'}
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

export default withRouter(Login);
