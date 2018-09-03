import React, { Component } from 'react';
import PropTypes from 'prop-types';
import d3 from '../../Common/D3Ext';
import theCatalogService from '../../Services/CatalogService';
import './CatalogView.css';

class CatalogView extends Component {
  static propTypes = {
    draggingNode: PropTypes.object,
    nodesContainer: PropTypes.object,
    onDrop: PropTypes.func
  };

  componentDidMount() {
    this.createCatalogDragHandler();
    this.drawCatalog();
    theCatalogService.subscribe(this.onUpdateCatalog);
  }

  componentWillUnmount() {
    theCatalogService.unsubscribe(this.onUpdateCatalog);
    delete this.catalogDrag;
  }

  onUpdateCatalog = () => {
    this.drawCatalog();
  };

  createCatalogDragHandler() {
    let _self = this;

    this.catalogDrag = d3.drag()
    .on('start', function(d) {
      let draggingNode = d3.select(_self.props.draggingNode);
      draggingNode
      .append('a')
      .attr('class', 'list-group-item')
      .attr('role', 'button')
      .text(d.title);

      let mouse = d3.mouse(_self.container);
      let node = draggingNode.node();
      node.style.left = `${mouse[0]}px`;
      node.style.top = `${mouse[1]}px`;
    })
    .on('drag', function() {
      let mouse = d3.mouse(_self.container);
      let node = d3.select(_self.props.draggingNode).node();
      node.style.left = `${mouse[0]}px`;
      node.style.top = `${mouse[1]}px`;
    })
    .on('end', function(d) {
      d3.select(_self.props.draggingNode).selectAll('a').remove();
      let mouse = d3.mouse(_self.props.nodesContainer);
      if (mouse[0] > 0 && mouse[1] > 0) {
        let pos = {x: mouse[0] - 75, y: mouse[1] - 20};
        _self.props.onDrop(d, pos);
      }
    });
  }

  drawCatalog() {
    let cats = {
      kernel: this.kernelCatalogView,
      graph: this.graphCatalogView
    };

    for (let cat in cats) {
      let ref = d3.select(cats[cat]).selectAll('a')
      .data(
        theCatalogService.getItems(cat, this.catalogSearchBox.value),
        d => d.identifier);

      ref.exit().remove();

      ref.enter()
      .append('a')
      .attr('class', 'list-group-item')
      .attr('role', 'button')
      .text(d => d.title)
      .call(this.catalogDrag);
    }
  }

  render() {
    return (
      <div id="cv-container" ref={p => this.container = p}>
        <div className="form-group has-feedback">
          <input type="text" className="form-control" placeholder="Search..."
                 ref={p => this.catalogSearchBox = p}
                 onChange={this.onUpdateCatalog} />
          <i className="glyphicon glyphicon-search form-control-feedback"></i>
        </div>
        <span>Kernels</span>
        <div ref={p => this.kernelCatalogView = p} className="list-group">
        </div>
        <span>Graphs</span>
        <div ref={p => this.graphCatalogView = p} className="list-group">
        </div>
      </div>
    );
  }
}

export default CatalogView;
