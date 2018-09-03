import React, { Component } from 'react';
import GraphEditor from './GraphEditor'
import CodeEditor from './CodeEditor'
import Menu from './Menu'
import TabsBar from './TabsBar';
import { NewDialog, OpenDialog, SaveDialog, DeleteDialog, MessageDialog,
         SandboxDialog } from './Dialogs';
import theCatalogService from '../../Services/CatalogService'
import Node from '../../Graph/Node';
import * as Utils from '../../Common/Utils';
import './Editor.css';

const modes = {
  NONE: 'none',
  GRAPH: 'graph',
  CODE: 'code'
};

class Editor extends Component {
  constructor(props) {
    super(props);

    if (props.match.params.i) {
      this.state = {
        scope: null,
        openNodes: []
      };
      theCatalogService.queryItem(
        props.match.params.i,
        props.match.params.o).then((p) => {
          if (!p) {
            this.messageDialog.open('Error', 'Graph not found.');
            return;
          }
          p = Object.assign(new Node(), p).clone();
          this.setState({
            scope: p,
            openNodes: [p]
          });
        }
      );
    } else {
      let scope = new Node('New Project', 'project0');
      this.state = {
        scope: scope,
        openNodes: [scope]
      };
    }
  }

  componentDidMount() {
    this.setState({});
  }

  get mode() {
    if (this.state.scope === null) {
      return modes.NONE;
    } else if (this.state.scope.category === Node.categories.GRAPH) {
      return modes.GRAPH;
    } else if (this.state.scope.category === Node.categories.KERNEL) {
      return modes.CODE;
    }
  }

  uniqueIdentifier(identifier, category) {
    let identifiers = this.state.openNodes.map(d => d.identifier).concat(
      theCatalogService.getIdentifiers(category));
    return Utils.uniqueName(identifier, identifiers);
  }

  onNew = () => {
    this.newDialog.open(
      {
        graph: 'Graph',
        kernel: 'Kernel'
      },
      (category) => {
        this.onNewSubgraph(category);
      },
      () => {});
  };

  onNewSubgraph = (category) => {
    let node = new Node('New Project',
                        this.uniqueIdentifier('project', category),
                        null, category);
    let openNodes = this.state.openNodes;
    openNodes.push(node);
    this.setState({
      scope: node,
      openNodes: openNodes
    });
  };

  onOpen = () => {
    this.openDialog.open(
      [
        {
          'title': 'Graph',
          'category': Node.categories.GRAPH,
          'items': theCatalogService.getIdentifiers(Node.categories.GRAPH),
        },
        {
          'title': 'Kernel',
          'category': Node.categories.KERNEL,
          'items': theCatalogService.getIdentifiers(Node.categories.KERNEL),
        }
      ],
      (category, identifier) => {
        let p = theCatalogService.getItemByIdentifier(
          category, identifier);
        p = Object.assign(new Node(), p).clone();
        this.onOpenSubgraph(p);
      },
      () => {});
  };

  onOpenSubgraph = async (p) => {
    let openNodes = this.state.openNodes;
    let i = openNodes.findIndex(q => q.identifier === p.identifier);
    if (i >= 0) {
      openNodes.splice(i, 1);
    }
    openNodes.push(p);
    await this.updateScope();
    this.setState({
      scope: p,
      openNodes: openNodes
    });
  };

  onClose = async (p) => {
    if (p === null) {
      this.messageDialog.open('Error', 'Invalid action.');
      return;
    }

    // Find index of the current tab
    let openNodes = this.state.openNodes;
    let i = openNodes.indexOf(p);

    // Set scope to an open tab
    if (this.state.scope === p) {
      if (openNodes.length === 1) {
        await this.onSetScope(null);
      } else {
        await this.onSetScope(openNodes[Math.max(0, i - 1)]);
      }
    }

    // Remove current tab
    openNodes.splice(i, 1);
    this.setState({openNodes: openNodes});
  };

  onSave = async (p=null, onOK=null, onCancel=null) => {
    if (p === null) {
      p = this.state.scope;
      if (p === null) {
        this.messageDialog.open('Error', 'Invalid action.');
        return;
      }
    }

    await this.updateScope();

    this.saveDialog.open(
      p.title,
      p.identifier,
      p.public,
      new Set(theCatalogService.getIdentifiers(p.category)),
      (title, identifier, public_) => {
        p.title = title;
        p.identifier = identifier;
        p.public = public_;
        theCatalogService.add(p.toTemplate(), () => {
          this.messageDialog.open(
            'Error', 'Failed to communicate with the server. '+
            'Perhaps you are not logged in?');
        });
        if (onOK) onOK();
        this.setState({scope: p});
      },
      () => {
        if (onCancel) onCancel();
      });
  };

  onDelete = async () => {
    if (this.state.scope === null) {
      this.messageDialog.open('Error', 'Invalid action.');
      return;
    }
    let existing = theCatalogService.getItemByIdentifier(
      this.state.scope.category, this.state.scope.identifier);
    if (!existing) {
      await this.onClose(this.state.scope);
      return;
    }
    this.deleteDialog.open(
      this.state.scope.identifier,
      async () => {
        theCatalogService.remove(this.state.scope, () => {
          this.messageDialog.open(
            'Error', 'Failed to communicate with the server. '+
            'Perhaps you are not logged in?');
        });
        await this.onClose(this.state.scope);
      },
      () => {}
    );
  };

  onRun = () => {
    if (this.state.scope === null) {
      this.messageDialog.open('Error', 'Invalid action.');
      return;
    }

    this.sandboxDialog.open(this.state.scope);
  };

  onShare = () => {
    if (this.state.scope === null || !this.state.scope.owner) {
      this.messageDialog.open('Error', 'Invalid action.');
      return '';
    }

    let link = window.location.href + `/${this.state.scope.identifier}`;
    if (!this.state.scope.public) {
      link += '/' + this.state.scope.owner;
    }
    return link;
  }

  onSetScope = async (p) => {
    await this.updateScope();
    this.setState({
      scope: p
    });
  }

  updateScope = async () => {
    if (this.state.scope !== null) {
      await this.editor.updateScope();
      if (this.state.scope.parent) {
        this.state.scope.parent.pruneEdges();
      }
    }
  }

  onChangeIdentifier = () => {
    this.setState({openNodes: this.state.openNodes});
  }

  render() {
    let callbacks = {
      new: this.onNew,
      open: this.onOpen,
      save: this.onSave,
      delete: this.onDelete,
      run: this.onRun,
      share: this.onShare
    };

    return (
      <div id="editor-container">
        <SandboxDialog ref={p => this.sandboxDialog = p} />
        <NewDialog ref={p => this.newDialog = p} />
        <OpenDialog ref={p => this.openDialog = p} />
        <SaveDialog ref={p => this.saveDialog = p} />
        <DeleteDialog ref={p => this.deleteDialog = p} />
        <MessageDialog ref={p => this.messageDialog = p} />
        <div className="menu">
          <Menu ref={p => this.menu = p} callbacks={callbacks} />
        </div>
        <div className="tabsBar">
          <TabsBar scope={this.state.scope}
                   openNodes={this.state.openNodes}
                   onSetScope={this.onSetScope}
                   onSaveSubgraph={this.onSave}
                   onCloseSubgraph={this.onClose} />
        </div>
        <div className="editor">
        {
          this.mode === modes.GRAPH &&
          <GraphEditor ref={p => this.editor = p}
                       scope={this.state.scope}
                       onOpenSubgraph={this.onOpenSubgraph} />
        }
        {
          this.mode === modes.CODE &&
          <CodeEditor ref={p => this.editor = p}
                      scope={this.state.scope}
                      sandbox={this.sandboxDialog.sandbox} />
        }
        </div>
      </div>
    );
  }
}

export default Editor;
