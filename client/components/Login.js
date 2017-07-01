import React, { Component } from 'react';

class Login extends Component {
    constructor(props) {
        super(props);
            
        this.state = {
            user: {
                email: '',
                password: ''
            }
        }

        this.handlePasswordChange = this.handlePasswordChange.bind(this);
        this.handleEmailChange = this.handleEmailChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleEmailChange(e) {
        const newStateUser = this.state.user;
        newStateUser.email = e.target.value;
        this.setState({user: newStateUser});
    }

    handlePasswordChange(e) {
        const newStateUser = this.state.user;
        newStateUser.password = e.target.value;
        this.setState({user: newStateUser});
    }

    handleSubmit(e) {
        console.log('A user attempted to login: ', this.state.user);
        e.preventDefault();
    }

    render(){
        return(
            <div className="loginPage">
                <div className="loginContainer">
                    <h2>Login</h2>
                    <form onSubmit={this.handleSubmit}>
                        <div >
                            <label>Email</label>
                        </div>
                        <div >
                            <input type='email'
                                value={this.state.user.email}
                                onChange={this.handleEmailChange}
                                placeholder="email@address.com"
                            />
                        </div>
                        <div >
                            <label>Password</label>
                        </div>
                        <div >
                            <input type='password'
                                value={this.state.user.password}
                                onChange={this.handlePasswordChange}
                            />
                        </div>
                        <button type='submit'>Login</button>
                    </form>
                </div>
            </div>
        )
    }
}

export default Login;