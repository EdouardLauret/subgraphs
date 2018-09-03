'use strict';

const Datastore = require('@google-cloud/datastore');
const config = require('../config');

const ds = Datastore({
  projectId: config.get('GCLOUD_PROJECT')
});

function fromDatastore(entities) {
  return entities.map((obj) => {
    obj.key = obj[Datastore.KEY];
    return obj;
  });
}

module.exports = {
  ds,
  fromDatastore
};
