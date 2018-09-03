'use strict';

const nconf = module.exports = require('nconf');
const path = require('path');

nconf
  .argv()
  .env([
    'GCLOUD_PROJECT',
    'MEMCACHE_URL',
    'MEMCACHE_USERNAME',
    'MEMCACHE_PASSWORD',
    'INSTANCE_CONNECTION_NAME',
    'NODE_ENV',
    'OAUTH2_CLIENT_ID',
    'OAUTH2_CLIENT_SECRET',
    'OAUTH2_CALLBACK',
    'PORT',
    'SECRET'
  ])
  .file({ file: path.join(__dirname, 'config.json') })
  .defaults({
    GCLOUD_PROJECT: '',
    OAUTH2_CLIENT_ID: '',
    OAUTH2_CLIENT_SECRET: '',
    OAUTH2_CALLBACK: '',
    PORT: 8080,
    SECRET: ''
  });

checkConfig('GCLOUD_PROJECT');
checkConfig('OAUTH2_CLIENT_ID');
checkConfig('OAUTH2_CLIENT_SECRET');

function checkConfig (setting) {
  if (!nconf.get(setting)) {
    throw new Error(`You must set ${setting} as an environment variable or in config.json!`);
  }
}
