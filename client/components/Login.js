import React, { Component } from 'react';
import axios from 'axios';

class Login extends Component {
    constructor(props) {
        super(props);
            
        this.state = {
            errorMsg: '',
            successMsg: '',
            user: {
                email: '',
                password: ''
            },
        }

        this.clearAllFields = this.clearAllFields.bind(this);
        this.handleInputChange = this.handleInputChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleLoginSuccess = this.handleLoginSuccess.bind(this);
        this.handleLoginFailure = this.handleLoginFailure.bind(this);
        this.checkIfSuccessful = this.checkIfSuccessful.bind(this);
    }

    handleInputChange(field, e) {
        const newStateUser = this.state.user;
        newStateUser[field] = e.target.value;
        this.setState({user: newStateUser});
    }

    clearAllFields() {
        this.setState({
            user: {
                email: '',
                password: ''
            }
        })
    }

    clearMessages() {
        this.setState({
            successMsg: '',
            errorMsg: ''
        });
    }

    handleLoginSuccess(result) { 
        this.props.saveLoggedInUser(result.data.user);
        this.setState({successMsg: result.data.message});
        setTimeout(() => {
            this.props.history.push('/admin');   
        }, 1200);
    }

    handleLoginFailure(result) {
        if (result && result.data && result.data.message) {
        this.setState({errorMsg: result.data.message});
        } else {
            this.setState({errorMsg: "Unknown login failure..."});
        }
        this.clearAllFields();
    }

    checkIfSuccessful(result) {
        if (result.data.err){
            this.handleLoginFailure(result);
        } else {
            this.handleLoginSuccess(result);
        }
    }

    handleSubmit(e) {
        e.preventDefault();
        this.clearMessages();
        axios.post("/api/user/login", {
            login: this.state.user
        }).then((result) => this.checkIfSuccessful(result));
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

                    {this.getErrorComponent()}
                    {this.getSuccessComponent()}

                </div>
            </div>
        )
    }
}

export default Login;