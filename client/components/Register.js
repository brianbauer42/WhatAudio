import React, { Component } from 'react';

class Register extends Component {
    render(){
        return(
            <div className="loginPage">
                <div className="loginContainer">
                    <form>
                        <label>Name</label>
                        {' '}
                        <input type='text' placeholder="email@address.com" />
                        <br />
                        <label>Email</label>
                        {' '}
                        <input type='email' />
                        <br />
                        <label>Password</label>
                        {' '}
                        <input type='password' />
                        <br />
                        <label>Confirm Password</label>
                        {' '}
                        <input type='password' />
                        <br />
                        <button type='submit'>Login</button>
                    </form>
                </div>
            </div>
        )
    }
}

export default Register;