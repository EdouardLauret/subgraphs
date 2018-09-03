import React, { Component } from 'react';

class Guide extends Component {
  render() {
    return (
      <div className="container">
        <div>
          <h1 className="text-center">Quick Start</h1>
        </div>
        <br />

        <div>
          <h2 className="text-center">Login</h2>
          <p className="lead">
            You can use the editor without logging in, but all of your changes will be
            discarded when you leave the session. So make sure to login before starting
            a new project.
          </p>
        </div>

        <div>
          <h2 className="text-center">Creating graphs</h2>
          <p className="lead">
            Click on the new button to create an empty subgraph. You can then specify
            a title and an identifier for your subgraph. Make sure to specify a unique
            identifier for your graphs. You can only use alphanumerical characters
            and underline for the identifier.
          </p>
          <p className="text-center">
            <img src="https://i.imgur.com/oOoMGg6.gif" alt="" />
          </p>
        </div>

        <div>
          <h2 className="text-center">Inserting nodes</h2>
          <p className="lead">
            Simply drag and drop any node from the catalog to the canvas and specify
            its attributes. You can then connect the nodes by dragging the ports.
          </p>
          <p className="text-center">
            <img src="https://i.imgur.com/jjdZrAH.gif" alt="" />
          </p>
        </div>

        <div>
          <h2 className="text-center">Making reusable graphs</h2>
          <p className="lead">
            You can expose any graph's internal attributes and ports so that it can be
            reused in different places. Select a node, and go to property view on the
            right. Press "external" to expose the port or attribute. You can further
            specify external aliases for ports or attributes.
          </p>
          <p className="text-center">
            <img src="https://i.imgur.com/B2d8IPn.gif" alt="" />
          </p>
        </div>

        <div>
          <h2 className="text-center">Running your graphs</h2>
          <p className="lead">
            Simply click on the "Run" button to execute the current graph.
            A popup window will appear in which you can see the results of the execution.
          </p>
          <p className="text-center">
            <img src="https://i.imgur.com/IF18TE5.gif" alt="" />
          </p>
        </div>

        <br />
        <hr />
        <br />

      </div>
    );
  }
}

export default Guide;
