import Service from './Service';
import Node from '../Graph/Node';
import theUserService from './UserService';

class CatalogService extends Service {
  constructor() {
    super();
    this.items = {
      kernel: [],
      graph: []
    };
    this.fetchCatalog();
  }

  fetchCatalog() {
    fetch('/api/doc/list', {
      method: 'POST',
      headers: new Headers({
        'Content-Type': 'application/json',
        Accept: 'application/json'
      }),
      body: "{}",
      credentials: 'same-origin'
    })
    .then(response => {
      if (!response.ok) {
        throw Error('Failed to fetch the documents.')
      }
      return response;
    })
    .then(d => d.json())
    .then(items => {
      this.items.kernel = items.filter(d => d.category === Node.categories.KERNEL);
      this.items.graph = items.filter(d => d.category === Node.categories.GRAPH);
      this.publish('init');
    }).catch(e => {
      console.error(e.name + ':' + e.message);
    });
  }

  queryItem(identifier, owner) {
    let query = `/api/doc/get/${identifier}`;
    if (owner) {
      query += `/${owner}`;
    }
    return fetch(query, {
      method: 'POST',
      headers: new Headers({
        'Content-Type': 'application/json',
        Accept: 'application/json'
      }),
      body: "{}",
      credentials: 'same-origin'
    })
    .then(response => {
      if (!response.ok) {
        throw Error('Failed to fetch the documents.')
      }
      return response;
    })
    .then(d => d.json())
    .catch(e => {
      console.error(e.name + ':' + e.message);
    });
  }

  getIdentifiers(category) {
    return this.items[category].map(p => p.identifier);
  }

  getItems(category, filter=null) {
    let items = this.items[category];
    if (filter) {
      let re = new RegExp(filter, 'i');
      items = items.filter(function(d) {
        return d.title.match(re) != null
      });
    }
    items = items.sort(
      (a, b) => {
        if (a.title < b.title) return -1;
        if (a.title > b.title) return 1;
        return 0;
      });
    return items;
  }

  getItemByIdentifier(category, identifier) {
    return this.items[category].find(d => d.identifier === identifier);
  }

  findIndex(item) {
    let items = this.items[item.category];
    for (let i in items) {
      if (items[i].identifier === item.identifier) {
        return i;
      }
    }
    return -1;
  }

  addLocal(item) {
    if (theUserService.isLoggedIn) {
      item.owner = theUserService.user.uid;
    }
    let items = this.items[item.category];
    let i = this.findIndex(item);
    if (i >= 0) {
      items[i] = item;
    } else {
      items.push(item);
    }
    this.publish('update');
  }

  add(item, errorCallback=null) {
    this.addLocal(item);

    fetch('/api/doc/save', {
      method: 'POST',
      headers: new Headers({
        'Content-Type': 'application/json',
      }),
      body: JSON.stringify(item),
      credentials: 'same-origin'
    })
    .then(response => {
      if (!response.ok) {
        if (errorCallback) errorCallback();
      }
    });
  }

  removeLocal(item) {
    let i = this.findIndex(item);
    if (i >= 0) {
      let items = this.items[item.category];
      items.splice(i, 1);
      this.publish('update');
    }
  }

  remove(item, errorCallback=null) {
    this.removeLocal(item);

    fetch('/api/doc/delete', {
      method: 'POST',
      headers: new Headers({
        'Content-Type': 'application/json',
      }),
      body: JSON.stringify(item),
      credentials: 'same-origin'
    })
    .then(response => {
      if (!response.ok) {
        if (errorCallback) errorCallback();
      }
    });
  }
}

let theCatalogService = new CatalogService();

export default theCatalogService;
