class Edge {
  constructor(srcId, tarId) {
    this.source = srcId;
    this.target = tarId;
  }

  clone() {
    let d = new Edge();
    d.source = this.source;
    d.target = this.target;
    return d;
  }

  get id() {
    return ['e', this.source, this.target].join('-');
  }

  static fromId(id) {
    let [, srcId, tarId] = id.split('-');
    return new Edge(srcId, tarId);
  }
}

export default Edge;
