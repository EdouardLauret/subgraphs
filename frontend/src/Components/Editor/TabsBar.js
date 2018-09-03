import React, { Component } from 'react';
import PropTypes from 'prop-types';
import d3 from '../../Common/D3Ext';
import './TabsBar.css';

class TabsBar extends Component {
  static propTypes = {
    scope: PropTypes.object,
    openNodes: PropTypes.array,
    onSetScope: PropTypes.func,
    onSaveSubgraph: PropTypes.func,
    onCloseSubgraph: PropTypes.func,
  };

  componentDidMount() {
    this.drawTabs();
  }

  componentDidUpdate() {
    this.drawTabs();
  }

  drawTabs() {
    let elements = d3.select(this.tabsContainer);

    elements.selectAll('li').remove();

    for (let i in this.props.openNodes) {
      let p = this.props.openNodes[i];
      let item = elements.append('li')
      .attr('role', 'button')
      .on('click', function() {
        d3.event.stopPropagation();
        this.props.onSetScope(p);
      }.bind(this));

      if (this.props.scope === p) {
        item.attr('class', 'active');
      }

      item.append('span').text(p.identifier);

      item
      .append('a')
      .attr('role', 'button')
      .on('click', function() {
        d3.event.stopPropagation();
        if (p.parent || p.nodeData.length === 0) {
          this.props.onCloseSubgraph(p);
        } else {
          this.props.onSaveSubgraph(
            p,
            () => this.props.onCloseSubgraph(p),
            () => this.props.onCloseSubgraph(p));
        }
      }.bind(this))
      .append('i')
      .attr('class', 'fa fa-close');
    }
  }

  render() {
    return (
      <div id="tabsContainer">
        <ul ref={p => this.tabsContainer = p} className="list-inline"></ul>
      </div>
    );
  }
}

export default TabsBar;
