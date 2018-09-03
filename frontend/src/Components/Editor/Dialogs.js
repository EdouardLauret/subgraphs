import React, { Component } from 'react';
import {
  Modal, Button, FormGroup, FormControl, ControlLabel, HelpBlock,
  ListGroup, ListGroupItem, Checkbox
} from 'react-bootstrap';
import './Dialogs.css';
import theUserService from '../../Services/UserService'
import Sandbox from './Sandbox';

class NewDialog extends Component {
  constructor(props) {
    super(props);

    this.state = {
      types: {},
      showModal: false,
      callbackOK: function() {},
      callbackCancel: function() {},
    };
  }

  open = (types, callbackOK, callbackCancel) => {
    this.setState({
      types: types,
      showModal: true,
      callbackOK: callbackOK,
      callbackCancel: callbackCancel
    });
  };

  onOK = (type) => {
    this.setState({
      showModal: false
    });
    this.state.callbackOK(type);
  };

  onCancel = () => {
    this.setState({
      showModal: false
    });
    this.state.callbackCancel();
  };

  render() {
    let buttons = Object.keys(this.state.types).map((key) =>
      <div className="btn-group" key={key}>
        <Button bsStyle="primary" onClick={() => this.onOK(key)}>
          {this.state.types[key]}
        </Button>
      </div>
    );

    return (
      <div>
        {this.state.showModal ? (
        <Modal.Dialog>
          <Modal.Header>
            <Modal.Title>New subgraph</Modal.Title>
          </Modal.Header>

          <Modal.Body>
            {buttons}
          </Modal.Body>

          <Modal.Footer>
            <Button bsStyle="default" onClick={this.onCancel}>Cancel</Button>
          </Modal.Footer>

        </Modal.Dialog>
        ): null}
      </div>
    );
  }
}

class SaveDialog extends Component {
  constructor(props) {
    super(props);

    this.state = {
      showModal: false,
      reserved: new Set(),
      title: '',
      identifier: '',
      public: false,
      callbackOK: function() {},
      callbackCancel: function() {},
    };
  }

  open = (title, identifier, public_, reserved, callbackOK, callbackCancel) => {
    this.setState({
      showModal: true,
      title: title,
      identifier: identifier,
      public: public_,
      reserved: reserved,
      callbackOK: callbackOK,
      callbackCancel: callbackCancel
    });
  };

  onOK = () => {
    if (this.validateTitle() === 'error' ||
        this.validateIdentifier() === 'error') return;
    this.setState({
      showModal: false
    });
    this.state.callbackOK(
      this.state.title, this.state.identifier, this.state.public);
  };

  onCancel = () => {
    this.setState({
      showModal: false
    });
    this.state.callbackCancel();
  };

  validateTitle = () => {
    if (this.state.title.length < 3) return 'error';
    return 'success';
  };

  validateIdentifier = () => {
    if (this.state.title.length < 3) return 'error';
    return 'success';
  };

  changeTitle = (e) => {
    this.setState({ title: e.target.value });
  };

  changeIdentifier = (e) => {
    this.setState({ identifier: e.target.value });
  };

  changePublic = (e) => {
    this.setState({ public: e.target.checked });
  };

  render() {
    return (
      <div>
        {this.state.showModal ? (
        <Modal.Dialog>
          <Modal.Header>
            <Modal.Title>Save subgraph</Modal.Title>
          </Modal.Header>

          <Modal.Body>

            <form>
              <FormGroup controlId="title" validationState={this.validateTitle()}>
                <ControlLabel>Title</ControlLabel>
                <FormControl type="text"
                             value={this.state.title}
                             placeholder="Title"
                             onChange={this.changeTitle} />
                <FormControl.Feedback />
                <HelpBlock>
                  Human readable name for the subgraph.
                </HelpBlock>
              </FormGroup>

              <FormGroup controlId="identifier" validationState={this.validateIdentifier()}>
                <ControlLabel>Identifier</ControlLabel>
                <FormControl type="text"
                             value={this.state.identifier}
                             placeholder="identifier"
                             onChange={this.changeIdentifier} />
                <FormControl.Feedback />
                <HelpBlock>
                  The unique identifier must be consisted of alphanumerics with no
                  special characters.
                </HelpBlock>
              </FormGroup>

              {theUserService.isAdmin && (
               <FormGroup controlId="public">
                <Checkbox checked={this.state.public}
                          onChange={this.changePublic}>Public</Checkbox>
               </FormGroup>)}

            </form>

          </Modal.Body>

          <Modal.Footer>
            <Button bsStyle="default" onClick={this.onCancel}>Cancel</Button>
            <Button bsStyle="primary" onClick={this.onOK}>
            {
              this.state.reserved.has(this.state.identifier) ? 'Overwrite' : 'Save'
            }
            </Button>
          </Modal.Footer>

        </Modal.Dialog>
        ): null}
      </div>
    );
  }
}

class OpenDialog extends Component {
  constructor(props) {
    super(props);

    this.state = {
      showModal: false,
      items: [],
      callbackOK: function() {},
      callbackCancel: function() {},
      filter: ''
    };
  }

  open = (items, callbackOK, callbackCancel) => {
    this.setState({
      showModal: true,
      items: items,
      callbackOK: callbackOK,
      callbackCancel: callbackCancel,
      filter: ''
    });
  };

  onOK = (e) => {
    let {category, identifier} = e.target.dataset;
    this.setState({
      showModal: false
    });
    this.state.callbackOK(category, identifier);
  };

  onCancel = () => {
    this.setState({
      showModal: false
    });
    this.state.callbackCancel();
  };

  onChange = (event) => {
    this.setState({
      filter: event.target.value
    });
  }

  render() {
    let re = new RegExp(this.state.filter, 'i');
    return (
      <div>
        {this.state.showModal ? (
        <Modal.Dialog>
          <Modal.Header>
            <Modal.Title>Open subgraph</Modal.Title>
          </Modal.Header>

          <Modal.Body>
          <div className="form-group has-feedback">
            <input type="text" className="form-control"
                   placeholder="Search..."
                   defaultValue={this.state.filter}
                   onChange={this.onChange} />
            <i className="glyphicon glyphicon-search form-control-feedback"></i>
          </div>
          <ListGroup className="scrollable">
          {
            this.state.items.map(item =>
              item.items.map(
                identifier =>
                identifier.match(re) != null &&
                <ListGroupItem onClick={this.onOK}
                               key={identifier}
                               data-identifier={identifier}
                               data-category={item.category}>
                  {identifier} <span className="light-text">{item.title}</span>
                </ListGroupItem>)
            )
          }
          </ListGroup>
          </Modal.Body>

          <Modal.Footer>
            <Button bsStyle="default" onClick={this.onCancel}>Cancel</Button>
          </Modal.Footer>

        </Modal.Dialog>
        ): null}
      </div>
    );
  }
}

class DeleteDialog extends Component {
  constructor(props) {
    super(props);

    this.state = {
      showModal: false,
      name: "",
      callbackOK: function() {},
      callbackCancel: function() {},
    };
  }

  open = (name, callbackOK, callbackCancel) => {
    this.setState({
      showModal: true,
      name: name,
      callbackOK: callbackOK,
      callbackCancel: callbackCancel
    });
  }

  onOK = (e) => {
    this.setState({
      showModal: false
    });
    this.state.callbackOK();
  }

  onCancel = () => {
    this.setState({
      showModal: false
    });
    this.state.callbackCancel();
  }

  render() {
    return (
      <div>
        {this.state.showModal ? (
        <Modal.Dialog>
          <Modal.Header>
            <Modal.Title>Delete subgraph</Modal.Title>
          </Modal.Header>

          <Modal.Body>
            Are you sure you want to delete {this.name}?
          </Modal.Body>

          <Modal.Footer>
            <Button bsStyle="default" onClick={this.onCancel}>Cancel</Button>
            <Button bsStyle="primary" onClick={this.onOK}>Confirm</Button>
          </Modal.Footer>

        </Modal.Dialog>
        ): null}
      </div>
    );
  }
}

class MessageDialog extends Component {
  constructor(props) {
    super(props);

    this.state = {
      showModal: false,
      title: '',
      message: ''
    };
  }

  open = (title, message) => {
    this.setState({
      showModal: true,
      title: title,
      message: message
    });
  }

  onDismiss = () => {
    this.setState({
      showModal: false
    });
  }

  render() {
    return (
      <div>
        {this.state.showModal ? (
        <Modal.Dialog>
          <Modal.Header>
            <Modal.Title>{this.state.title}</Modal.Title>
          </Modal.Header>

          <Modal.Body>{this.state.message}</Modal.Body>

          <Modal.Footer>
            <Button bsStyle="default" onClick={this.onDismiss}>Dismiss</Button>
          </Modal.Footer>

        </Modal.Dialog>
        ): null}
      </div>
    );
  }
}

class SandboxDialog extends Component {
  constructor(props) {
    super(props);

    this.state = {
      scope: {},
      showModal: false
    };
  }

  open = (scope) => {
    scope.run(this.sandbox);
    this.setState({
      scope: scope,
      showModal: true
    });
  }

  onDismiss = () => {
    this.sandbox.reset();
    this.setState({
      showModal: false
    });
  }

  render() {
    return (
      <div style={{display: this.state.showModal ? 'block': 'none'}}>
        <Modal.Dialog>
          <Modal.Header>
            <Modal.Title>{this.state.scope.title}</Modal.Title>
          </Modal.Header>

          <Modal.Body>
          <Sandbox ref={p => this.sandbox = p} />
          </Modal.Body>

          <Modal.Footer>
            <Button bsStyle="default" onClick={this.onDismiss}>Dismiss</Button>
          </Modal.Footer>

        </Modal.Dialog>
      </div>
    );
  }
}

export {
  NewDialog,
  OpenDialog,
  SaveDialog,
  DeleteDialog,
  MessageDialog,
  SandboxDialog
};
