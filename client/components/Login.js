import React, { Component } from 'react';
import axios from 'axios';

class Login extends Component {
    constructor(props) {
        super(props);
            
        this.state = {
            user: {
                email: '',
                password: ''
            }
        }

        this.clearAllFields = this.handleInputChange.bind(this);
        this.handleInputChange = this.handleInputChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleInputChange(field, e) {
        const newStateUser = this.state.user;
        newStateUser[field] = e.target.value;
        this.setState({user: newStateUser});
    }

    clearAllFields() {
        this.handleInputChange('email', {target: {value: ''}});
        this.handleInputChange('password', {target: {value: ''}});
    }

    handleSubmit(e) {
        e.preventDefault();
        console.log('A user attempted to login: ', this.state.user);
        axios.post("/api/user/login", {
            login: this.state.user
        }).then(function(result) {
            console.log(result);
        })
        //this.clearAllFields();
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
                                onChange={(e) => this.handleInputChange('email', e)}
                                placeholder="email@address.com"
                            />
                        </div>
                        <div >
                            <label>Password</label>
                        </div>
                        <div >
                            <input type='password'
                                value={this.state.user.password}
                                onChange={(e) => this.handleInputChange('password', e)}
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