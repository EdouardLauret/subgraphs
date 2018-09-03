import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

class Home extends Component {
  render() {
    return (
      <div>

        <header className="masthead">
          <div className="container">
            <img className="img-fluid" src="favicon.ico" alt="" />
            <div className="intro-text">
              <span className="name">Subgraphs</span>
              <span className="subtitle">A Deep Learning IDE</span>
            </div>
            <div className="start">
              <Link to="/editor" className="btn btn-lg btn-primary">Start</Link>
            </div>
          </div>
        </header>

      </div>
    );
  }
}

export default Home;
