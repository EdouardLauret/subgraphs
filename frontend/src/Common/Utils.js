
function generateUID() {
  return '_' + Math.random().toString(36).substr(2, 9);
};

function uniqueName(name, reserved) {
  let suffixes = new Set();
  for (let d of reserved) {
    if (d.startsWith(name)) {
    suffixes.add(d.substr(name.length));
    }
  }
  let i = 0;
  while (suffixes.has(i.toString())) { i++; }
  return name + i;
}

function sigmoid(x) {
  return 1.0 / (1.0 + Math.pow(Math.E, -x));
}

const zip = (arr, ...etc) => {
  return arr.map((val, i) => etc.reduce((a, arr) => [...a, arr[i]], [val]));
}

function clone(data) {
  let node;
  if (Array.isArray(data)) {
    node = data.length > 0 ? data.slice(0) : [];
    node.forEach((e, i) => {
      if (
        (typeof e === "object" && e !== {}) ||
        (Array.isArray(e) && e.length > 0)
      ) {
        node[i] = clone(e);
      }
    });
  } else if (typeof data === "object") {
    node = Object.assign({}, data);
    Object.keys(node).forEach((key) => {
      if (
        (typeof node[key] === "object" && node[key] !== {}) ||
        (Array.isArray(node[key]) && node[key].length > 0)
      ) {
        node[key] = clone(node[key]);
      }
    });
  } else {
    node = data;
  }
  return node;
};

function compare(a, b) {
  if (a === b) return true;
  if (typeof a !== typeof b) return false;
  if (Array.isArray(a)) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (!compare(a[i], b[i])) return false;
    }
    return true;
  } else if (typeof a === "object") {
    let keys = Object.keys(a);
    if (keys.length !== Object.keys(b).length) return false;
    for (let i = 0; i < keys.length; i++) {
      let key = keys[i];
      if (!(key in b)) return false;
      if (!compare(a[key], b[key])) return false;
    }
    return true;
  }
  return false;
}

export {
  generateUID,
  uniqueName,
  sigmoid,
  zip,
  clone,
  compare
};
