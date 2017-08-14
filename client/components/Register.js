import React, { Component } from 'react';
import axios from 'axios';

class Register extends Component {
    constructor(props) {
        super(props);

        this.state = {
            errors: {},
            user: {
                name: '',
                email: '',
                password: '',
                verify: ''
            }
        }
        this.handleRegistrationFailure = this.handleRegistrationFailure.bind(this);
        this.handleRegistrationSuccess = this.handleRegistrationSuccess.bind(this);
        this.clearPasswordFields = this.clearPasswordFields.bind(this);
        this.handleInputChange = this.handleInputChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleInputChange(field, e) {
        const newStateUser = this.state.user;
        newStateUser[field] = e.target.value;
        this.setState({user: newStateUser});
    }

    clearPasswordFields() {
        this.handleInputChange('password', {target: {value: ''}});
        this.handleInputChange('verify', {target: {value: ''}});
    }

    handleRegistrationSuccess(result) { 
        this.props.saveLoggedInUser(result.data.user);
        this.setState({message: result.data.message});
        this.props.history.push('/admin');
    }

    handleRegistrationFailure(result) {
        if (result && result.data && result.data.message) {
        console.log("login failed:", result.data.message);
        } else {
            console.log("unknown registration failure");
        }
    }

    handleSubmit(e) {
        e.preventDefault();
        var self = this;
        if (this.state.user.password !== this.state.user.verify) {
            this.setState({errors: "Password didn't match!"});
            this.clearPasswordFields();
        } else {
            axios.post("/api/user/register", {
                signup: this.state.user
            }).then( (result) => this.handleRegistrationSuccess(result), (result) => this.handleRegistrationFailure(result));
        }
    }

    render(){
        return(
            <div className="registrationPage">
                <div className="registrationContainer">
                    <h2>Register</h2>
                    <form id="registrationForm" className="registrationForm" onSubmit={this.handleSubmit}>
                        <div >
                            <label>Name</label>
                        </div>
                        <div >
                            <input type='text' 
                                value={this.state.user.name}
                                onChange={(e) => this.handleInputChange('name', e)}
                                placeholder="Your name"
                            />
                        </div>
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
                                ref={regPassword => this.regPasswordInput = regPassword}
                            />
                        </div>
                        <div >
                            <label>Verify Password</label>
                        </div>
                        <div >
                            <input type='password'
                                value={this.state.user.verify}
                                onChange={(e) => this.handleInputChange('verify', e)}
                                ref="verify"
                            />
                        </div>
                        <button type='submit'>Submit</button>
                    </form>
                </div>
            </div>
        )
    }
}

export default Register;