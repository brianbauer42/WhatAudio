import React, { Component } from 'react';

class Login extends Component {
    render(){
        return(
            <div className="loginPage">
                <div className="loginContainer">
                    <h2>Login</h2>
                    <form>
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
                        <button type='submit'>Login</button>
                    </form>
                </div>
            </div>
        )
    }
}

export default Login;