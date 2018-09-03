import React, { Component } from 'react';
import './Login.css';

class Login extends Component {
  render() {
    return (
      <div className="container container-table">
        <div className="row vertical-center-row">
          <div className="text-center col-md-4 col-md-offset-4">
            <div className="page-header">
              <h1>Login or Signup:</h1>
            </div>
            <span className="input-group-btn">
              <a role="button" className="btn btn-danger" 
                 href="/api/user/auth/google">
                Google
              </a>
            </span>          
          </div>
        </div>
      </div>
    )
  }
}

export default Login;
