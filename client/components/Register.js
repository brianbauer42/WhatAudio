import React, { Component } from 'react';
import axios from 'axios';

class Register extends Component {
    constructor(props) {
        super(props);

        this.state = {
            errorMsg: '',
            successMsg: '',
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
        this.checkIfSuccessful = this.checkIfSuccessful.bind(this);
    }

    handleInputChange(field, e) {
        const newStateUser = this.state.user;
        newStateUser[field] = e.target.value;
        this.setState({user: newStateUser});
    }

    clearPasswordFields() {
        this.setState({
            user: {
                password: '',
                verify: ''
            }
        })
    }

    clearMessages() {
        this.setState({
            successMsg: '',
            errorMsg: ''
        });
    }

    handleRegistrationSuccess(result) {
        this.props.saveLoggedInUser(result.data.user);
        this.setState({successMsg: result.data.message});
        setTimeout(() => {
            this.props.history.push('/admin');   
        }, 1200);
    }

    handleRegistrationFailure(result) {
        if (result && result.data && result.data.message) {
        this.setState({errorMsg: result.data.message});
        } else {
            this.setState({errorMsg: "Unknown registration failure!"});
        }
    }

    checkIfSuccessful(result) {
        if (result.data.err){
            this.handleRegistrationFailure(result);
        } else {
            this.handleRegistrationSuccess(result);
        }
    }

    handleSubmit(e) {
        e.preventDefault();
        this.clearMessages();
        var self = this;
        if (this.state.user.password !== this.state.user.verify) {
            this.setState({errorMsg: "Passwords didn't match!"});
            this.clearPasswordFields();
        } else {
            axios.post("/api/user/register", {
                signup: this.state.user
            }).then( (result) => this.checkIfSuccessful(result));
        }
    }

    getErrorComponent() {
        if (!this.state.errorMsg) {
            return;
        } else {
            return (
                <div className="errorContainer">
                    <p>{this.state.errorMsg}</p>
                </div>
            )
        }
    }

    getSuccessComponent() {
        if (!this.state.successMsg) {
            return;
        } else {
            return (
                <div className="successContainer">
                    <p>{this.state.successMsg}</p>
                </div>
            )
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

                    {this.getErrorComponent()}
                    {this.getSuccessComponent()}

                </div>
            </div>
        )
    }
}

export default Register;