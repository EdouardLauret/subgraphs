import React, { Component } from 'react';
import { withRouter, Link } from 'react-router-dom';
import { Navbar, Nav, NavItem, NavDropdown, MenuItem } from 'react-bootstrap';
import './Navigation.css';

class Navigation extends Component {

  goto(pathname, e) {
    if (this.props.location.pathname !== pathname) {
      this.props.history.push(pathname);
    }
  }

  render() {
    return (
      <Navbar fluid collapseOnSelect>
        <Navbar.Header>
          <Navbar.Brand>
            <Link to="/">Subgraphs<sup>&alpha;</sup></Link>
          </Navbar.Brand>
          <Navbar.Toggle />
        </Navbar.Header>
        <Navbar.Collapse>
          <Nav>
            <NavItem eventKey={1} onClick={this.goto.bind(this, "/editor")}>
              Editor
            </NavItem>
            <NavItem eventKey={2} onClick={this.goto.bind(this, "/guide")}>
              Guide
            </NavItem>
            <NavItem eventKey={3} onClick={this.goto.bind(this, "/about")}>
              About
            </NavItem>
          </Nav>
          <Nav pullRight>
            {
              this.props.user.uid === undefined ? (
                <NavItem eventKey={3} onClick={this.goto.bind(this, "/login")}>Login</NavItem>
              ) : (
                <NavDropdown eventKey={3}
                             title={<span>
                                    <i className='fa fa-user'></i>&nbsp;
                                    {this.props.user.name}
                                    </span>}
                             id='nav-user'>
                  <MenuItem eventKey={3.1} onClick={this.goto.bind(this, "/profile")}>Profile</MenuItem>
                  <MenuItem divider />
                  <MenuItem eventKey={3.2} onClick={e => window.location = "/api/user/logout"}>Logout</MenuItem>
                </NavDropdown>
              )
            }
          </Nav>
        </Navbar.Collapse>
      </Navbar>
    );
  }
}

export default Navigation = withRouter(Navigation);
