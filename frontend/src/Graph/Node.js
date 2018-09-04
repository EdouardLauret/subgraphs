import * as Utils from '../Common/Utils';
import Edge from './Edge';
import Port from './Port';

class Node {
  static categories = {
    GRAPH: 'graph',
    KERNEL: 'kernel'
  };

  constructor(title='', identifier='', name='',
              category=Node.categories.GRAPH) {
    this.title = title;
    this.identifier = identifier;
    this.name = name || identifier;
    this.public = false;
    this.owner = '';
    this.category = category;
    this.id = Utils.generateUID();
    this.position = {x: 0, y: 0};
    this.inputs = [];
    this.outputs = [];
    this.attributes = [];
    this.nodeData = [];
    this.edgeData = [];
    this.code = '';
    this.global = false;
  }

  uniqueName(name) {
    return Utils.uniqueName(name, this.nodeData.map(d => d.name));
  }

  clone() {
    let d = new Node();
    d.title = this.title;
    d.name = this.name;
    d.identifier = this.identifier;
    d.public = this.public;
    d.owner = this.owner;
    d.category = this.category;
    d.id = this.id;
    d.position = Utils.clone(this.position);
    d.inputs = Utils.clone(this.inputs);
    d.outputs = Utils.clone(this.outputs);
    d.attributes = Utils.clone(this.attributes);
    d.nodeData = [];
    for (let node of this.nodeData) {
      node = Object.assign(new Node(), node).clone()
      d.nodeData.push(node);
    }
    d.edgeData = [];
    for (let edge of this.edgeData) {
      edge = Object.assign(new Edge(), edge).clone()
      d.edgeData.push(edge);
    }
    d.code = this.code;
    d.global = this.global;
    return d;
  }

  fromTemplate(template, pos) {
    let d = Object.assign(new Node(), template).clone();
    d.name = this.uniqueName(d.identifier);
    d.position = pos;
    for (let side of ['inputs', 'outputs']) {
      for (let i in d[side]) {
        d[side][i].id = new Port(d.id, side, i).id;
        d[side][i].alias = '';
      }
    }
    for (let attr of d.attributes) {
      attr.alias = '';
    }
    return d;
  }

  toTemplate() {
    let d = this.clone();
    delete d.id;
    delete d.name;
    delete d.position;
    for (let side of ['inputs', 'outputs']) {
      for (let i in d[side]) {
        delete d[side][i].id;
        delete d[side][i].alias;
      }
    }
    for (let attr of d.attributes) {
      delete attr.alias;
    }
    return d;
  }

  addNode(d) {
    this.nodeData.push(d);
  }

  removeNode(nodeDatum) {
    let nodeId = nodeDatum.id;
    let i = this.edgeData.length;
    while (i--) {
      let d = this.edgeData[i];
      if (Port.fromId(d.source).nodeId === nodeId ||
        Port.fromId(d.target).nodeId === nodeId) {
        this.edgeData.splice(i, 1);
      }
    }

    let nodeIdx = this.nodeData.indexOf(nodeDatum);
    this.nodeData.splice(nodeIdx, 1);
  }

  pathExists(srcId, tarId) {
    try {
      let p = Port.fromId(srcId);
      let node = this.getNodeById(p.nodeId);
      if (node.outputs.find(d => d.id === tarId)) {
        return true;
      }
      for (let q of node.outputs) {
        let edges = this.edgeData.filter(edge => edge.source === q.id);
        for (let edge of edges) {
          if (this.pathExists(edge.target, tarId)) {
            return true;
          }
        }
      }
    } catch(err) { }
    return false;
  }

  addEdge(srcId, tarId) {
    if (this.pathExists(tarId, srcId)) {
      return false;
    }
    let d = new Edge(srcId, tarId);
    let edgeId = d.id;
    if (this.getEdgeById(edgeId) !== undefined) {
      return;
    }
    this.edgeData.push(d);
    return true;
  }

  removeEdge(edgeDatum) {
    let edgeIdx = this.edgeData.indexOf(edgeDatum);
    this.edgeData.splice(edgeIdx, 1);
  }

  getNodeById(nodeId) {
    return this.nodeData.find(d => d.id === nodeId);
  }

  getEdgeById(edgeId) {
    return this.edgeData.find(d => d.id === edgeId);
  }

  getPortById(portId) {
    let p = Port.fromId(portId);
    let node = this.getNodeById(p.nodeId);
    return node[p.side][p.idx];
  }

  getPortEdges(portId) {
    let p = Port.fromId(portId);
    let ts = {inputs: 'target', outputs: 'source'}[p.side];
    return this.edgeData.filter(edge => edge[ts] === portId);
  }

  pruneEdges() {
    let ports = new Set();
    for (let node of this.nodeData) {
      for (let side of ['inputs', 'outputs']) {
        for (let port of node[side]) {
          ports.add(port.id);
        }
      }
    }
    this.edgeData = this.edgeData.filter(function(edge) {
      return ports.has(edge.source) && ports.has(edge.target);
    });
  }

  updatePorts() {
    let ports = {inputs: [],  outputs: []};
    let idx = {inputs: 0, outputs: 0}
    this.nodeData.forEach(function(node) {
      for (let side of ['inputs', 'outputs']) {
        for (let i in node[side]) {
          let port = node[side][i];
          if (port.alias) {
            ports[side].push({
              name: port.alias,
              id: new Port(this.id, side, idx[side]++).id,
              alias: ''
            });
          }
        }
      }
    }.bind(this));
    this.inputs = ports.inputs;
    this.outputs = ports.outputs;
  }

  updateAttributes() {
    let attributes = [];
    this.nodeData.forEach(function(node) {
      for (let attr of node.attributes) {
        if (attr.alias) {
          attributes.push({
            name: attr.alias,
            value: attr.value,
            alias: ''
          });
        }
      }
    });
    this.attributes = attributes;
  }

  updateFromConfig(config) {
    function mergeProperties(source, target) {
      let merged = [];
      target.forEach(tar => {
        let src = source.find((src) => src.name === tar.name);
        if (src !== undefined)
          merged.push(Object.assign(src, tar));
        else
          merged.push(tar);
      });
      return merged;
    }

    try {
      if (config.inputs !== undefined)
        this.inputs = mergeProperties(this.inputs, config.inputs);
      else
        this.inputs = [];

      if (config.outputs !== undefined)
        this.outputs = mergeProperties(this.outputs, config.outputs);
      else
        this.outputs = [];

      if (config.attributes !== undefined)
        this.attributes = mergeProperties(this.attributes, config.attributes);
      else
        this.attributes = [];

      if (config.global !== undefined)
        this.global = config.global;
      else
        this.global = false;

    } catch (e) {
      console.error(e.name + ':' + e.message);
    }
  }

  setPortAlias(port, alias) {
    port.alias = alias;
    this.updatePorts();
  }

  setAttributeAlias(attr, alias) {
    attr.alias = alias;
    this.updateAttributes();
  }

  updateFromCode(sandbox) {
    let code = `return function() { ${this.code} }().config`;
    return sandbox.call(code).then(config => {
      this.updateFromConfig(config);
    });
  }

  createNamespace(nsh, attr) {
    return ['app'].concat(nsh.map(i => 'ns_' + i[attr])).join('.');
  }

  async run(sandbox, nsh=[]) {
    let visited = new Set();

    // Create all child nodes and set the outputs
    let outputArgs = [];
    for (let node of this.nodeData) {
      await this.createNode(node, visited, sandbox, nsh);

      for (let outPort of node.outputs) {
        if (outPort.alias) {
          let cns = this.createNamespace(nsh.concat([node]), 'id');
          outputArgs.push(`${outPort.alias}:${cns}.out().${outPort.name}`);
        }
      }
    }
    let ns = this.createNamespace(nsh, 'id');
    await sandbox.eval(`${ns}.out=()=>({${outputArgs.join(',')}})`);
  }

  async createNode(node, visited, sandbox, nsh) {
    if (visited.has(node.id)) return;
    visited.add(node.id);

    // Create the namespace
    let pns = this.createNamespace(nsh, 'id');
    let ns = this.createNamespace(nsh.concat([node]), 'id');
    let gns = this.createNamespace(nsh.concat([node]), 'name');
    await sandbox.eval(`${ns} = {}; ${gns} = {}`);

    // Set the input args
    let inputArgs = [];
    let scopeArgs = [
      `${ns}.in={}`,
      `${ns}.at={}`
    ];

    for (let inPort of node.inputs) {
      let argVals = [];
      for (let edge of this.getPortEdges(inPort.id)) {
        let srcPort = Port.fromId(edge.source);
        let srcNode = this.getNodeById(srcPort.nodeId);
        let srcPortName = srcNode[srcPort.side][srcPort.idx].name;
        await this.createNode(srcNode, visited, sandbox, nsh);
        let sns = this.createNamespace(nsh.concat([srcNode]), 'id');
        argVals.push(`()=>${sns}.out().${srcPortName}`);
      }
      if (inPort.alias) {
        argVals.push(`...${pns}.in.${inPort.alias}`);
      }
      inputArgs.push(`${inPort.name}=[${argVals.join(',')}]`);
      scopeArgs.push(`${ns}.in.${inPort.name}=[${argVals.join(',')}]`);
    }

    // Set the attributes
    for (let attr of node.attributes) {
      let value;
      if (attr.alias) {
        value = `${pns}.at.${attr.alias}`;
      } else {
        value = `${attr.value}`;
      }
      inputArgs.push(`${attr.name}=${value}`);
      scopeArgs.push(`${ns}.at.${attr.name}=${value}`);
    }

    // Run the subgraph
    if (node.category === Node.categories.KERNEL) {
      // Supply context arguments
      inputArgs.push(`context={gns: '${gns}'}`);

      let code = `${ns}.def = function() { ${node.code} }();`;
      let fn = `${ns}.def.call(${inputArgs.join(',')})`;
      if (node.global) {
        code += `
        ${gns}.g = await ${fn};
        ${ns}.out = () => ${gns}.g;`;
      } else {
        code += `${ns}.out = () => ${fn};`;
      }
      await sandbox.eval(code);
    } else {
      let code = `${scopeArgs.join(';')}`;
      await sandbox.eval(code);
      await node.run(sandbox, nsh.concat([node]));
    }
  }
}

export default Node;
