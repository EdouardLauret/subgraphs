import Service from './Service';

class UserService extends Service {
  constructor() {
    super();
    this.user = {};
    this.fetchUser();
  }

  fetchUser() {
    fetch('/api/user/whoami', {
      method: 'POST',
      headers: new Headers({
        Accept: 'application/json'
      }),
      credentials: 'same-origin'
    })
    .then(response => {
      if (!response.ok) {
        throw Error('Failed to fetch user information.')
      }
      return response;
    })
    .then(d => d.json())
    .then(d => {
      this.user = d;
      this.publish(this.user);
    }).catch((e) => {
      console.error(e.name + ':' + e.message);
    });
  }

  updateUser(newUser) {
    fetch('/api/user/update', {
      method: 'POST',
      headers: new Headers({
        'Content-Type': 'application/json',
      }),
      body: JSON.stringify(newUser),
      credentials: 'same-origin'
    })
    .then(response => {
      if (!response.ok) throw response.body;
      this.user = newUser;
      this.publish(this.user);
    }).catch(e => {
      console.error(e.name + ':' + e.message);
    });
  }

  get isLoggedIn() {
    return this.user.uid !== undefined;
  }

  get isAdmin() {
    return this.isLoggedIn && this.user.isAdmin;
  }
}

let theUserService = new UserService();

export default theUserService;
