import React, { Component}  from 'react';
import d3 from '../../Common/D3Ext';
import CatalogView from './CatalogView';
import PropertiesView from './PropertiesView';
import * as Utils from '../../Common/Utils';
import Node from '../../Graph/Node';
import Port from '../../Graph/Port';
import './GraphEditor.css';

class GraphEditor extends Component {
  constructor(props) {
    super(props);

    this.state = {
      selection: null
    };
  }

  get nodeData() { return this.props.scope.nodeData; }
  get edgeData() { return this.props.scope.edgeData; }

  onAddNode = (template, pos) => {
    let node = this.props.scope.fromTemplate(template, pos);
    this.props.scope.addNode(node);
    this.drawNodes();
  }

  groupSelection(selection) {
    let _self = this;

    // Create a new node
    let title = 'Group';
    let identifier = 'group';
    let name = this.props.scope.uniqueName(identifier);
    let newNode = new Node(title, identifier, name);

    // Create a set of node ids
    let nodeIds = new Set();
    selection.each(function(nodeDatum) {
      nodeIds.add(nodeDatum.id);
    });

    // Move nodes and edges
    let moveEdges = new Set();
    selection.each(function(nodeDatum) {
      newNode.nodeData.push(nodeDatum);

      newNode.position.x += nodeDatum.position.x;
      newNode.position.y += nodeDatum.position.y;

      // If there's no edge or there's an external connection create
      // new port, otherwise move all the edges to the new scope.
      for (let side of ['inputs', 'outputs']) {
        let st = {inputs: 'source', outputs: 'target'}[side];
        let ts = {inputs: 'target', outputs: 'source'}[side];
        for (let port of nodeDatum[side]) {
          let edges = _self.props.scope.getPortEdges(port.id);
          let newPort = edges.length === 0;
          let rewireEdges = new Set();
          for (let edge of edges) {
            let srcNodeId = Port.fromId(edge[st]).nodeId;
            if (!nodeIds.has(srcNodeId)) {
              newPort = true;
              rewireEdges.add(edge);
            } else {
              moveEdges.add(edge);
            }
          }
          if (!newPort) continue;
          let l = newNode[side].length;
          let portId = new Port(newNode.id, side, l).id;
          newNode[side].push({
            name: port.name,
            id: portId,
            alias: ''
          });
          for (let edgeDatum of rewireEdges) {
            edgeDatum[ts] = portId;
          }
          port.alias = port.name;
        }
      }
    });

    for (let edgeDatum of moveEdges) {
      let edgeIdx = _self.edgeData.indexOf(edgeDatum);
      _self.edgeData.splice(edgeIdx, 1);
      newNode.edgeData.push(edgeDatum);
    }

    newNode.position.x /= selection.size();
    newNode.position.y /= selection.size();

    this.nodeData.push(newNode);

    selection
    .each(function(d) {
      _self.props.scope.removeNode(d);
    });
    _self.drawNodes();
    _self.drawEdges();
  }

  createContextMenu(get_data) {
    let canvas = d3.select(this.canvas);
    let _self = this;
    let selectedDatum = null;

    let contextMenu = d3.select(this.contextMenu);

    let contextMenuEvent = function(d) {
      selectedDatum = d;
      d3.event.preventDefault();
      d3.event.stopPropagation();
      let mouse = d3.mouse(_self.canvas);
      contextMenu.attr('transform', function() {
        return 'translate(' + [ mouse[0], mouse[1] ] + ')'
      })

      let contextItem = contextMenu.selectAll('.contextItem')
      .data(get_data(selectedDatum));

      contextItem.exit().remove();

      let enter = contextItem
      .enter()
      .append('g')
      .attr('class', 'contextItem');

      enter
      .append('rect')
      .attr('y', (d, i) => 40 * i)
      .attr('width', 200)
      .attr('height', 40)
      .on('click', function(d) {
        d.callback(selectedDatum);
        selectedDatum = null;
      });

      enter
      .append('text')
      .attr('x', 8)
      .attr('y', (d, i) => 26 + 40 * i)
      .text(d => d.name);
    };

    canvas
    .on('click.hideNodeContext', function() {
      contextMenu.selectAll('.contextItem').remove();
    });

    return contextMenuEvent;
  }

  createNodeContextMenu() {
    let _self = this;
    this.nodeContextMenu = this.createContextMenu(function(d) {
      let items = [];

      items.push({
        name: 'Open',
        callback: function() {
          let p = _self.props.scope.getNodeById(d.id);
          p.parent = _self.props.scope;
          _self.props.onOpenSubgraph(p);
        }
      });

      items.push({
        name: 'Remove',
        callback: function(selectedNodeDatum) {
          _self.props.scope.removeNode(selectedNodeDatum);
          _self.drawNodes();
          _self.drawEdges();
        }
      });

      items.push({
        name: 'Make copy',
        callback: function(selectedNodeDatum) {
          let mouse = d3.mouse(_self.nodesContainer);
          let pos = {x: mouse[0] - 75, y: mouse[1] - 20};
          let node = _self.props.scope.fromTemplate(d.toTemplate(), pos);
          _self.props.scope.addNode(node);
          _self.drawNodes();
        }
      });

      items.push({
        name: 'Make reference',
        callback: function(selectedNodeDatum) {
          let mouse = d3.mouse(_self.nodesContainer);
          let pos = {x: mouse[0] - 75, y: mouse[1] - 20};
          let node = _self.props.scope.fromTemplate(d.toTemplate(), pos);
          node.name = d.name;
          _self.props.scope.addNode(node);
          _self.drawNodes();
        }
      });

      let selection = d3.selectAll('.selected');
      if (selection.empty()) {
        return items;
      }

      items.push({
        name: 'Remove selected',
        callback: function() {
          selection
          .each(function(d) {
            _self.props.scope.removeNode(d);
          });
          _self.drawNodes();
          _self.drawEdges();
        },
      });

      items.push({
        name: 'Group selected',
        callback: function() {
          _self.groupSelection(selection);
        },
      });

      return items;
    });
  }

  createEdgeContextMenu() {
    let _self = this;
    let items = [
      {
        name: 'Remove',
        callback: function(selectedEdgeIdDatum) {
          _self.props.scope.removeEdge(selectedEdgeIdDatum);
          _self.drawEdges();
        },
      },
    ];

    this.edgeContextMenu = this.createContextMenu(function() {
      return items;
    });
  }

  createConnectHandler() {
    let _self = this;
    let line = d3.select(this.line);
    let sourceNode = null;
    let targetNode = null;

    this.edgeDrag = d3.drag()
    .on('start', function() {
      sourceNode = this;
      targetNode = null;
      let portPos = d3.select(this).position();
      line
      .attr('visibility', 'visible')
      .attr('x1', portPos.x)
      .attr('y1', portPos.y)
      .attr('x2', portPos.x)
      .attr('y2', portPos.y);
    })
    .on('drag', function() {
      let mouse = d3.mouse(_self.canvas);
      line
      .attr('x2', mouse[0])
      .attr('y2', mouse[1]);
    })
    .on('end', function() {
      line.attr('visibility', 'hidden');
      if (sourceNode != null && targetNode != null) {
        let src = null, tar = null;
        let ps = [sourceNode, targetNode];
        for (let p of ps) {
          let cls = d3.select(p.parentNode).attr('class');
          if (cls === 'nodeInput') {
            tar = p;
          } else if (cls === 'nodeOutput') {
            src = p;
          }
        }
        if (src != null && tar != null) {
          let srcId = d3.select(src).attr('id');
          let tarId = d3.select(tar).attr('id');
          _self.props.scope.addEdge(srcId, tarId);
          _self.drawEdges();
        }
      }
      sourceNode = targetNode = null;
    });

    this.portEnter = function() {
      if (sourceNode !== this) {
        targetNode = this;
      }
    };
  }

  createNodeDragHandler() {
    let _self = this;
    let shiftKey = false;

    d3.select('body')
    .on('keydown.click', function() { shiftKey = d3.event.shiftKey; })
    .on('keyup.click', function() {
      shiftKey = d3.event.shiftKey;
    });

    this.nodeDrag = d3.drag()
    .on('start', function() {
      if (!shiftKey) {
        d3.selectAll('.selected').classed('selected', false);
      }
      d3.select(this).classed('selected', true);
      _self.updateSelection();
    })
    .on('drag', function(d) {
      d.position.x += d3.event.dx;
      d.position.y += d3.event.dy;
      d3.select(this).attr('transform', function(d){
        return 'translate(' + [ d.position.x, d.position.y ] + ')'
      })
      _self.drawEdges();
    })
    .on('end', function(d) {
      d.position.x = Math.round(d.position.x / 16) * 16;
      d.position.y = Math.round(d.position.y / 16) * 16;
      d3.select(this).attr('transform', function(d){
        return 'translate(' + [ d.position.x, d.position.y ] + ')'
      })
      _self.drawEdges();
    });
  }

  createPanAndSelectHandler() {
    let _self = this;
    let selectionRect = d3.select(this.selectionRect);
    let canvas = d3.select(this.canvas);
    let shiftKey = false;
    let translate = [0, 0];

    d3.select('body')
    .on('keydown.select', function() { shiftKey = d3.event.shiftKey; })
    .on('keyup.select', function() {
      shiftKey = d3.event.shiftKey;
      selectionRect
      .attr('visibility', 'hidden');
    });

    // Handle selection
    let mouseDown = false;
    let lastPos = [0, 0];
    let origin = [0, 0];
    canvas
    .on('mousedown.select', function() {
      if (d3.event.button !== 0) return;
      d3.event.preventDefault();
      mouseDown = true;
      origin = lastPos = d3.mouse(_self.canvas);
      if (shiftKey) {
        selectionRect
        .attr('visibility', 'visible')
        .attr('x', origin[0])
        .attr('y', origin[1])
        .attr('width', 0)
        .attr('height', 0);
      }
      d3.selectAll('.selected').classed('selected', false);
      _self.updateSelection();
    })
    .on('mousemove.select', function() {
      if (!mouseDown) return;
      d3.event.preventDefault();
      let mouse = d3.mouse(_self.canvas);
      if (shiftKey) {
        selectionRect
        .attr('x', Math.min(origin[0], mouse[0]))
        .attr('y', Math.min(origin[1], mouse[1]))
        .attr('width', Math.abs(mouse[0] - origin[0]))
        .attr('height', Math.abs(mouse[1] - origin[1]));
      } else {
        translate[0] += mouse[0] - lastPos[0];
        translate[1] += mouse[1] - lastPos[1];
        let t = `translate(${translate[0]},${translate[1]})`;
        d3.select(_self.background).attr('transform', t);
        d3.select(_self.nodesContainer).attr('transform', t);
        _self.drawEdges();
      }
      lastPos = mouse;
    })
    .on('mouseup.select', function() {
      d3.event.preventDefault();
      mouseDown = false;
      if (shiftKey) {
        selectionRect
        .attr('visibility', 'hidden');

        let nodes = d3.select(_self.nodesContainer)
        .selectAll('.node');

        let box = {
          x1: Math.min(origin[0], lastPos[0]) - translate[0],
          y1: Math.min(origin[1], lastPos[1]) - translate[1],
          x2: Math.max(origin[0], lastPos[0]) - translate[0],
          y2: Math.max(origin[1], lastPos[1]) - translate[1]
        };

        let collide = function(node, x1, y1, x2, y2) {
          if (!node.length) {
            do {
              let d = node.data;
              let sel = (d.position.x > box.x1 &&
                     d.position.x < box.x2 &&
                     d.position.y > box.y1 &&
                     d.position.y < box.y2);
              if (sel) {
                d3.select('#' + d.id).classed('selected', true);
              }
              node = node.next;
            } while (node);
          }
          return (x1 > box.x2 || x2 < box.x1 ||
              y1 > box.y2 || y2 < box.y1);
        }

        let quadtree = d3.quadtree()
        .x(d => d.position.x)
        .y(d => d.position.y)
        .addAll(nodes.data(this.nodeData, d => d.id));

        nodes.each(function() {
          quadtree.visit(collide);
        });
        _self.updateSelection();
      }
    });
  }

  clearHandlers() {
    delete this.nodeContextMenu;
    delete this.edgeContextMenu;
    delete this.edgeDrag;
    delete this.nodeDrag;
  }

  updateSelection() {
    let selection = d3.selectAll('.selected');
    if (selection.size() === 1) {
      this.setState({selection: selection.datum()});
    } else  {
      this.setState({selection: null});
    }
  }

  drawNodes() {
    let nodes = d3.select(this.nodesContainer)
    .selectAll('.node')
    .data(this.nodeData, d => d.id);

    nodes.exit().remove();

    let enter = nodes
    .enter()
    .append('g')
    .attr('class', 'node')
    .attr('id', d => d.id)
    .attr('transform', d => `translate(${d.position.x}, ${d.position.y})`)
    .call(this.nodeDrag)
    .on('contextmenu', this.nodeContextMenu);

    enter
    .append('clipPath')
    .attr('id', d => `node-clip-${d.id}`)
    .append('rect')
    .attr('width', 150)
    .attr('height', function(d) {
      let numPorts = Math.max(d.inputs.length, d.outputs.length);
      let numAttrs = d.attributes.length;
      return (1 + numPorts + numAttrs) * 20
    });

    let nodeHeader = enter.append('g')
    .attr('class', 'nodeHeader');

    nodeHeader
    .append('rect')
    .attr('width', 150)
    .attr('height', 20);

    nodeHeader
    .append('text')
    .attr('x', 5)
    .attr('y', 16)
    .attr('clip-path', d => `url(#node-clip-${d.id})`)
    .text(d => d.name);

    let nodeBody = enter.append('g')
    .attr('class', 'nodeBody')
    .attr('transform', 'translate(0, 20)');

    nodeBody
    .append('rect')
    .attr('width', 150)
    .attr('height', function(d) {
      let numPorts = Math.max(d.inputs.length, d.outputs.length);
      let numAttrs = d.attributes.length;
      return (numPorts + numAttrs) * 20
    });

    for (let item of [
      {side: 'inputs', class: 'nodeInput', cX: 8, tX: 16},
      {side: 'outputs', class: 'nodeOutput', cX: 142, tX: 134}
    ]) {
      let nodeInputs = nodeBody
      .selectAll(`.${item.class}`)
      .data(d => d[item.side])
      .enter()
      .append('g')
      .attr('class', item.class);

      nodeInputs
      .append('circle')
      .attr('id', d => d.id)
      .attr('cx', item.cX)
      .attr('cy', (d, i) => 12 + 20 * i)
      .attr('r', 5)
      .text(d => d)
      .on('mouseenter', this.portEnter)
      .call(this.edgeDrag);

      nodeInputs
      .append('text')
      .attr('x', item.tX)
      .attr('y', (d, i) => 16 + 20 * i)
      .attr('class', d => d.alias ? 'alias' : '')
      .text(d => d.name);
    }

    let nodeAttrs = nodeBody
    .selectAll('.nodeAttr')
    .data(d => {
      let numPorts = Math.max(d.inputs.length, d.outputs.length);
      let output = [];
      for (let i in d.attributes) {
        output.push({
          offset: 20 * (parseInt(i, 10) + numPorts),
          attr: d.attributes[i],
          id: d.id
        });
      }
      return output;
    })
    .enter()
    .append('g')
    .attr('class', 'nodeAttr');

    nodeAttrs
    .append('rect')
    .attr('x', 0)
    .attr('y', d => d.offset)
    .attr('width', 150)
    .attr('height', 20)
    .text(d => d.name);

    nodeAttrs
    .append('text')
    .attr('x', 4)
    .attr('y', d => 16 + d.offset)
    .attr('class', d => d.attr.alias ? 'alias' : '')
    .attr('clip-path', function(d) {
      return `url(#node-clip-${d.id})`;
    })
    .text(d => `${d.attr.name}: ${d.attr.value}`);
  }

  drawEdges() {
    let canvas = d3.select(this.edgesContainer);

    let edges = canvas
    .selectAll('.edge')
    .data(this.edgeData, d => d.id);

    edges.exit().remove();

    let enter = edges
    .enter()
    .append('g')
    .attr('class', 'edge');

    edges.merge(enter).attr('id', d => d.id);

    enter.append('path')
    .attr('class', 'edgePath');

    enter.append('circle')
    .attr('class', 'edgeCircle')
    .attr('fill', 'black')
    .attr('r', 1)
    .on('contextmenu', this.edgeContextMenu)
    .transition()
    .attr('r', 5);

    d3.selectAll('.edgePath')
    .attr('d', function(d) {
      let s = d3.select('#' + d.source).position();
      let t = d3.select('#' + d.target).position();
      let a = Utils.sigmoid(Math.abs(t.y - s.y));
      let c = {
        x: (s.x + t.x) / 2,
        y: (1 - a) * s.y + a * t.y
      };
      return `M${s.x},${s.y}S${c.x},${c.y},${t.x},${t.y}`;
    });

    d3.selectAll('.edgeCircle')
    .attr('transform', function(d) {
      let path = d3.select(`#${d.id} > path`).node();
      var l = path.getTotalLength();
      var pos = path.getPointAtLength(0.5 * l);
      return `translate(${pos.x},${pos.y})`;
    });
  }

  drawAll() {
    this.drawNodes();
    this.drawEdges();
  }

  componentDidMount() {
    this.createNodeContextMenu();
    this.createEdgeContextMenu();

    this.createPanAndSelectHandler();
    this.createNodeDragHandler();
    this.createConnectHandler();

    this.setState({});
  }

  componentDidUpdate() {
    this.drawAll();
  }

  componentWillUnmount() {
    this.clearHandlers();
  }

  updateScope = async () => {
  };

  render() {
    return (
    <div id="ge-container" ref={p => this.container = p} >
      <div id="catalogView">
        <CatalogView draggingNode={this.draggingNode}
                     nodesContainer={this.nodesContainer}
                     onDrop={this.onAddNode} />
      </div>
      <div id="canvas">
        <svg ref={p => this.canvas = p}>
          <defs>
            <pattern id="grid" width="32" height="32"
                patternUnits="userSpaceOnUse">
              <circle cx="16" cy="16" r="2" fill="#ccc">
              </circle>
            </pattern>
            <marker id="arrow"
                markerWidth="7"
                markerHeight="7"
                refX="6" refY="2"
                orient="auto"
                markerUnits="strokeWidth">
              <path d="M0,0L0,4L7,2z" fill="#555"  />
            </marker>
          </defs>

          <g ref={p => this.background = p}>
            <rect ref={p => this.nodesContainer = p}
                className="wallpaper"
                x="-10000px" y="-10000px"
                width="20000px" height="20000px"
                fill="url(#grid)">
            </rect>
          </g>
          <g ref={p => this.edgesContainer = p}></g>
          <line ref={p => this.line = p}
              className="nodeLink"
              visibility="hidden"
              markerEnd="url(#arrow)">
          </line>
          <g ref={p => this.nodesContainer = p}></g>
          <rect ref={p => this.selectionRect = p} className="selectionRect"
              visibility="hidden">
          </rect>
          <g ref={p => this.contextMenu = p} className="contextMenu">
          </g>
        </svg>
      </div>
      <div id="propertiesView">
        <PropertiesView selection={this.state.selection}
                        scope={this.props.scope} />
      </div>
      <div id="overlay">
        <div ref={p => this.draggingNode = p} className="list-group">
        </div>
      </div>
    </div>
    )
  }
}

export default GraphEditor;
