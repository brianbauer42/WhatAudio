import React, { Component } from 'react';

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

        this.handleVerifyChange = this.handleVerifyChange.bind(this);
        this.handlePasswordChange = this.handlePasswordChange.bind(this);
        this.handleEmailChange = this.handleEmailChange.bind(this);
        this.handleNameChange = this.handleNameChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleNameChange(e) {
        const newStateUser = this.state.user;
        newStateUser.name = e.target.value;
        this.setState({user: newStateUser});
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

    handleVerifyChange(e) {
        const newStateUser = this.state.user;
        newStateUser.verify = e.target.value;
        this.setState({user: newStateUser});
    }

    handleSubmit(e) {
        console.log('A user attempted to register: ', this.state.user);
        e.preventDefault();
    }

    render(){
        return(
            <div className="registrationPage">
                <div className="registrationContainer">
                    <h2>Register</h2>
                    <form onSubmit={this.handleSubmit}>
                        <div >
                            <label>Name</label>
                        </div>
                        <div >
                            <input type='text' 
                                value={this.state.user.name}
                                onChange={this.handleNameChange}
                                placeholder="Your name"
                            />
                        </div>
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
                        <div >
                            <label>Verify Password</label>
                        </div>
                        <div >
                            <input type='password'
                                value={this.state.user.verify}
                                onChange={this.handleVerifyChange}
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