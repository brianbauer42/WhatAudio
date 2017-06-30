import React, { Component } from 'react';

class Login extends Component {
    render(){
        return(
            <div className="loginPage">
                <div className="loginContainer">
                    <form>
                        <label>Login</label>
                        {' '}
                        <input type='text' placeholder="email@address.com" />
                        <br />
                        <label>Password</label>
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

export default Login;