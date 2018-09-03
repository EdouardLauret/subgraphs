import React, { Component } from 'react';
import theUserService from '../../Services/UserService';

class Profile extends Component {
  constructor(props) {
    super(props);

    this.state = this.props.user;
  }

  onUpdate = (e) => {
    e.preventDefault();
    theUserService.updateUser(this.state);
  }

  onChange = (e) => {
    var val;
    if (e.target.type === 'text') {
      val = e.target.value;
    } else {
      val = e.target.checked;
    }
    this.setState({
      [e.target.name]: val
    });
  }

  componentWillReceiveProps(nextProps) {
    this.setState(nextProps.user);
  }

  render() {
    return (
      <div className="container">

        <div className="page-header">
          <h3>
            <span className="fa fa-user" aria-hidden="true"></span>&nbsp;
            Profile
          </h3>
        </div>

        <form className="form-horizontal">
          <div className="form-group">
            <label className="col-sm-3 control-label">Name</label>
            <div className="col-sm-5">
              <input type="text" size="20" className="form-control"
                     placeholder="name" name="name" required
                     value={this.state.name || '' }
                     onChange={this.onChange} />
            </div>
          </div>
          <input type="hidden" name="uid" value={this.state.uid || ''} />
          <div className="form-group">
            <div className="col-sm-offset-3 col-sm-5">
              <button type="submit" className="btn btn-default"
                      onClick={this.onUpdate}>Save</button>
            </div>
          </div>
        </form>

      </div>
    )
  }
}

export default Profile;
