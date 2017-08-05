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

        this.clearAllFields = this.clearAllFields.bind(this);
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

    clearAllFields() {
        this.handleInputChange('name', {target: {value: ''}});
        this.handleInputChange('email', {target: {value: ''}});
        this.clearPasswordFields();
    }

    handleSubmit(e) {
        e.preventDefault();
        var self = this;
        if (this.state.user.password !== this.state.user.verify) {
            this.setState({errors: "Password didn't match!"});
            this.clearPasswordFields();
        } else {
            // Not working weith new FormData ... Don't see why...
            // var regFormElement = document.querySelector('#registrationForm');

            // var userInput = Object.entries(this.state.user);
            // var regFormData = new FormData();
            // for (var [key, value] of userInput) {
            //     regFormData.append(key, value);
            //     console.log(key, value);
            // }
            axios.post("/api/user/register", {
                signup: this.state.user
            }).then(function(result) {
                console.log(result);
            })
            // fetch("/api/user/register", {
            //     method: 'POST',
            //     body: regFormData,
            //     credentials: 'include'
        // })
            // .then(function(result) {
            //     console.log(result);
            // })
            // this.clearAllFields();
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