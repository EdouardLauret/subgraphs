import React, { Component } from 'react';
import {Overlay, Tooltip} from 'react-bootstrap';
import './Menu.css';

class Menu extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tooltip: '',
      showTooltip: false
    };
  }

  share = () => {
    let tooltip = this.props.callbacks.share();
    if (!tooltip) return;
    this.setState({
      tooltip,
      showTooltip: true
    });
    setTimeout(() => this.setState({showTooltip: false}), 5000);
  }

  render() {
    return (
      <div className="btn-toolbar blue-toolbar">
        <div className="btn-group">
          <a className="btn btn-primary" onClick={e => this.props.callbacks.new()}>
            <i className="fa fa-file-o"></i>
          </a>
        </div>
        <div className="btn-group">
          <a className="btn btn-primary" onClick={e => this.props.callbacks.open()}>
            <i className="fa fa-folder-open-o"></i>
          </a>
        </div>
        <div className="btn-group">
          <a className="btn btn-primary" onClick={e => this.props.callbacks.save()}>
            <i className="fa fa-save"></i>
          </a>
        </div>
        <div className="btn-group">
          <a className="btn btn-primary" onClick={e => this.props.callbacks.delete()}>
            <i className="fa fa-trash"></i>
          </a>
        </div>
        <div className="btn-group">
          <a className="btn btn-primary" onClick={e => this.props.callbacks.run()}>
            <i className="fa fa-play"></i>
          </a>
        </div>
        <div className="btn-group" ref={p => this.shareButton = p}>
          <a className="btn btn-primary" onClick={e => this.share()}>
            <i className="fa fa-share"></i>
          </a>
        </div>
        <Overlay container={this.shareButton} target={this.shareButton}
                 show={this.state.showTooltip} placement="bottom">
          <Tooltip id="share-tooltip">
            {this.state.tooltip}
          </Tooltip>
        </Overlay>
      </div>
    );
  }
}

export default Menu;
