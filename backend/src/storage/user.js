'use strict';

const {ds, fromDatastore} = require('./datastore');

const userKind = 'User';

function getKey(id) {
  return ds.key([userKind, parseInt(id, 10)]);
}

function read({email}) {
  const q = ds.createQuery(userKind);

  if (email !== undefined)
    q.filter('email', '=', email);

  return ds.runQuery(q).then(results => fromDatastore(results[0]));
}

function write({name, email, isAdmin=false}) {
  let registrationDate = new Date();

  const entity = {
    key: ds.key(userKind),
    data: {name, email, registrationDate, isAdmin}
  };

  return ds.insert(entity).then(() => {
    let user = entity.data;
    user.key = entity.key;
    return user;
  });
}

function update({name, email}) {
  return read({email}).then(users => {
    if (users.length == 0) return;

    let {key, registrationDate, isAdmin} = users[0];

    const entity = {
      key: key,
      data: {name, email, registrationDate, isAdmin},
    };

    return ds.update(entity);
  });
}

function getOrCreate({name, email}) {
  return read({email}).then(users => {
    if (users.length > 0) {
      return new Promise((resolve, reject) => {
        resolve(users[0]);
      });
    } else {
      return write({name, email});
    }
  });
}

function remove(key) {
  ds.delete(key);
}

module.exports = {
  kind: userKind,
  key: getKey,
  read,
  write,
  update,
  getOrCreate,
  remove,
};
