class Port {
  constructor(nodeId, side, idx) {
    this.nodeId = nodeId;
    this.side = side;
    this.idx = idx;
  }

  get id() {
    return [this.nodeId, this.side, this.idx].join('-');
  }

  static fromId(id) {
    return new Port(...id.split('-'));
  }
}

export default Port;
