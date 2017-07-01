import React, { Component } from 'react';

class Register extends Component {
    render(){
        return(
            <div className="registrationPage">
                <div className="registrationContainer">
                    <h2>Register</h2>
                    <form>
                        <div >
                            <label>Name</label>
                        </div>
                        <div >
                            <input type='text' placeholder="Your name" />
                        </div>
                        <div >
                            <label>Email</label>
                        </div>
                        <div >
                            <input type='email' placeholder="email@address.com" />
                        </div>
                        <div >
                            <label>Password</label>
                        </div>
                        <div >
                            <input type='password' />
                        </div>
                        <div >
                            <label>Verify Password</label>
                        </div>
                        <div >
                            <input type='password' />
                        </div>
                        <button type='submit'>Submit!</button>
                    </form>
                </div>
            </div>
        )
    }
}

export default Register;