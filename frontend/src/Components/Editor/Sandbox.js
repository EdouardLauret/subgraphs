import React, { Component } from 'react';
import './Sandbox.css';

class Sandbox extends Component {
  constructor(props) {
    super(props);

    this.counter = 1;
    this.callbacks = {};
  }

  uniqueId() {
    return this.counter++;
  }

  shouldComponentUpdate() {
    return false;
  }

  componentDidMount() {
    this.reset();

    window.addEventListener('message', this.receiveMessage, false);
  }

  componentWillUnmount() {
    window.removeEventListener('message', this.receiveMessage, false);
  }

  receiveMessage = (event) => {
    let data = event.data;
    if (data.id === undefined) return;
    let id = data.id;
    let result = data.result;
    this.callbacks[id](result);
    delete this.callbacks[id];
  }

  eval(code) {
    let id = this.uniqueId();
    let promise = new Promise((resolve, reject) => {
      this.callbacks[id] = resolve;
    });
    this.ifr.contentWindow.postMessage({id, code, method: 'eval'}, '*');
    return promise;
  }

  call(code, ...args) {
    let id = this.uniqueId();
    let promise = new Promise((resolve, reject) => {
      this.callbacks[id] = resolve;
    });
    this.ifr.contentWindow.postMessage({id, code, args, method: 'call'}, '*');
    return promise;
  }

  reset() {
    let script = `
    const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;
    var app = {};
    async function frameReceiveMessage(event) {
      if (event.data.id === undefined) return;
      let id = event.data.id;
      let code = event.data.code
      let result;
      try {
        if (event.data.method == 'eval') {
          await (new AsyncFunction(code))();
        } else {
          result = await (new AsyncFunction(...event.data.args, code))();
        }
      } catch (e) {
        let html = \`
        <span style="color: red">\${e.name}:</span> \${e.message},
        occurred while running:<br>\${code}\`;
        let p = document.createElement('p');
        p.innerHTML = html;
        document.body.appendChild(p);
        console.log('%c ' + e.name + ':' + e.message, 'color: red');
        console.log('code ' + code);
        console.log(JSON.stringify(app, (key, val) => {
          if (val instanceof Function ||
              val instanceof AsyncFunction) {
            if (val.name) {
              return 'function: ' + val.name;
            } else {
              return val.toString();
            }
          } else {
            return val;
          }
        }, 2));
      }
      window.parent.postMessage({id, result}, '*');
    }
    window.addEventListener('message', frameReceiveMessage, false);
    `;
    let html = `
    <html>
    <head>
    <style>
    body { font-family: 'Courier New'; font-size: 12px; }
    </style>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/tensorflow/0.12.5/tf.min.js" integrity="sha256-Eq2OUrnzn5xiSxQGei/aKxQnPQR4zrQKoMk4TKlLWBU=" crossorigin="anonymous"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/2.7.2/Chart.min.js" integrity="sha256-CfcERD4Ov4+lKbWbYqXD6aFM9M51gN4GUEtDhkWABMo=" crossorigin="anonymous"></script>
    <script>${script}</script>
    </head>
    <body></body>
    </html>
    `;
    this.ifr.src = 'data:text/html;charset=utf-8,' + encodeURIComponent(html);
  }

  render() {
    return (
      <iframe ref={(p) => this.ifr = p}
              title="Sandbox"
              sandbox="allow-scripts"
              className="sandbox">
      </iframe>
    );
  }
}

export default Sandbox;
