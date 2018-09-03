import React, { Component } from 'react';
import './About.css';

class About extends Component {
  render() {
    return (
      <div>

        <section>
          <div className="container">
            <div className="row">
              <div className="col-lg-12 text-center">
                <p className="lead">
                  Subgraphs is a visual IDE for developing computational graphs, particularly
                  designed for deep neural networks. Subgraphs is built with tensorflow.js,
                  node, and react, and serves on Google Cloud.
                </p>

                <div className="btn-icons">
                  <div className="btn-group">
                    <a className="btn btn-primary" href="https://github.com/vahidk/subgraphs">
                      <i className="fa fa-github"></i>
                    </a>
                  </div>
                  <div className="btn-group">
                    <a className="btn btn-primary" href="http://twitter.com/vahidk">
                      <i className="fa fa-twitter"></i>
                    </a>
                  </div>
                  <div className="btn-group">
                    <a className="btn btn-primary" href="mailto:vkazemi[@]gmail.com">
                      <i className="fa fa-envelope"></i>
                    </a>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </section>

      </div>
    );
  }
}

export default About;
