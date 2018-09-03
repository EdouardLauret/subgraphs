import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './CodeEditor.css'

class CodeEditor extends Component {
  static propTypes = {
    scope: PropTypes.object,
    sandbox: PropTypes.object
  };

  componentDidMount() {
    this.editor = window.ace.edit(this.container, {
      mode: "ace/mode/javascript",
      selectionStyle: "text",
      theme: "ace/theme/clouds",
      showPrintMargin: false
    });
    this.editor.setValue(this.props.scope.code, -1);
    this.editor.focus();
  }

  componentDidUpdate() {
    this.editor.setValue(this.props.scope.code, -1);
    this.editor.focus();
  }

  updateScope = async () => {
    this.props.scope.code = this.editor.getValue();
    await this.props.scope.updateFromCode(this.props.sandbox);
  };

  render() {
    return (
      <div id="ce-container" ref={p => this.container = p}>
      </div>
    );
  }
}

export default CodeEditor;
