class Service {
  constructor() {
    this.subscribers = [];
  }
  
  subscribe(func) {
    this.subscribers.push(func)
  }

  unsubscribe(func) {
    let it = this.subscribers.find(d => d === func);
    this.subscribers.splice(it, 1);
  }

  publish(d) {
    this.subscribers.forEach(func => func(d));
  }
}

export default Service;
