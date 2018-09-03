import React, { Component } from 'react';
import d3 from '../../Common/D3Ext';
import './PropertiesView.css';

class PropertiesView extends Component {

  componentDidMount() {
    this.drawPropertiesView();
  }

  componentDidUpdate() {
    this.drawPropertiesView();
  }

  drawPropertiesView() {
    let _self = this;
    let selection = this.props.selection;

    let propertiesView = d3.select(this.propertiesView);
    propertiesView.selectAll('*').remove();

    if (!selection) {
      let d = this.props.scope;

      let group = propertiesView.append('div')
      .attr('class', 'form-group');
      group.append('label').text('Title');
      group.append('input').attr('class', 'form-control input-sm')
      .attr('value', d.title)
      .on('input', function() {
        d.title = this.value;
        d3.select(`#${d.id} > g > text`).text(this.value);
      });

      group = propertiesView.append('div')
      .attr('class', 'form-group');
      group.append('label').text('Identifier');
      group.append('input').attr('class', 'form-control input-sm')
      .attr('value', d.identifier)
      .on('input', function() {
        d.identifier = this.value;
        d3.select(`#${d.id} > g > text`).text(this.value);
      });

      propertiesView.append('hr').attr('class', 'divider');

      for (let i in d.attributes) {
        let attribute = d.attributes[i];
        let group = propertiesView.append('div')
        .attr('class', 'form-group');;

        group.append('label').text(attribute.name);
        group.append('input')
        .attr('class', 'form-control input-sm')
        .attr('value', attribute.value)
        .on('input', function() {
          attribute.value = this.value;
          let p = d3.select(d3.selectAll(
            `#${d.id} .nodeAttr > text`).nodes()[i]);
          p.text(`${attribute.name}: ${this.value}`);
        });
      }
    } else {
      let d = selection;

      let group = propertiesView.append('div')
      .attr('class', 'form-group');
      group.append('label').text('Name');
      group.append('input').attr('class', 'form-control input-sm')
      .attr('value', d.name)
      .on('input', function() {
        d.name = this.value;
        d3.select(`#${d.id} > g > text`).text(this.value);
      });

      group = propertiesView.append('div')
      .attr('class', 'form-group');
      group.append('label').text('Identifier');
      group.append('input').attr('class', 'form-control input-sm')
      .attr('value', d.identifier)
      .attr('readonly', true);

      propertiesView.append('hr').attr('class', 'divider');

      for (let i in d.attributes) {
        let attribute = d.attributes[i];
        let group = propertiesView.append('div')
        .attr('class', 'form-group');

        let p = d3.select(d3.selectAll(`#${d.id} .nodeAttr > text`).nodes()[i]);

        group.append('label').text(attribute.name);
        group.append('input')
        .attr('class', 'form-control input-sm')
        .attr('value', attribute.value)
        .on('input', function() {
          attribute.value = this.value;
          p.text(`${attribute.name}: ${this.value}`);
        });

        group = propertiesView.append('div')
        .attr('class', 'form-group');
        if (attribute.alias) {
          group.append('label').text('Alias');
          group.append('input')
          .attr('class', 'form-control input-sm')
          .attr('value', attribute.alias)
          .on('input', function() {
            _self.props.scope.setAttributeAlias(attribute, this.value);
            if (!this.value) {
              _self.drawPropertiesView();
              p.attr('class', '');
            }
          });
        } else {
          group.append('input')
          .attr('type', 'button')
          .attr('class', 'btn btn-default btn-sm')
          .attr('value', 'External')
          .on('click', function() {
            _self.props.scope.setAttributeAlias(attribute, attribute.name);
            _self.drawPropertiesView();
            p.attr('class', 'alias');
          });
        }
      }

      propertiesView.append('hr').attr('class', 'divider');

      for (let item of [
        {side: 'inputs', class: 'nodeInput'},
        {side: 'outputs', class: 'nodeOutput'}
      ]) {
        for (let i in d[item.side]) {
          let port = d[item.side][i];
          let group = propertiesView.append('div')
          .attr('class', 'form-group');
          group.append('label').text(port.name);

          let p = d3.select(d3.selectAll(`#${d.id} .${item.class} > text`).nodes()[i]);

          group = propertiesView.append('div')
          .attr('class', 'form-group');
          if (port.alias) {
            group.append('label').text('Alias');
            group.append('input')
            .attr('class', 'form-control input-sm')
            .attr('value', port.alias)
            .on('input', function() {
              _self.props.scope.setPortAlias(port, this.value);
              if (!this.value) {
                _self.drawPropertiesView();
                p.attr('class', '');
              }
            });
          } else {
            group.append('input')
            .attr('type', 'button')
            .attr('class', 'btn btn-default btn-sm')
            .attr('value', 'External')
            .on('click', function() {
              _self.props.scope.setPortAlias(port, port.name);
              _self.drawPropertiesView();
              p.attr('class', 'alias');
            });
          }
        }
      }
    }
  }

  render() {
    return (
      <div id="pv-container" ref={p => this.container = p}>
        <form ref={p => this.propertiesView = p}>
        </form>
      </div>
    );
  }
}

export default PropertiesView;
