'use strict';

if (process.env.NODE_ENV === 'production') {
  require('@google-cloud/trace-agent').start();
  require('@google-cloud/debug-agent').start();
}

const path = require('path');
const express = require('express');
const passport = require('passport');
const config = require('./config');
const logging = require('./logging');

const app = express();

app.disable('etag');
app.set('trust proxy', true);

app.use(logging.requestLogger);

app.use(require('./session').router);

app.use(passport.initialize());
app.use(passport.session());

app.use('/api/user', require('./user').router);
app.use('/api/doc', require('./document').router);

app.use('/', express.static(path.join(__dirname, '../www')));

app.use(logging.errorLogger);

app.use((req, res) => {
  res.status(404).send('Not Found');
});


app.use((err, req, res, next) => {
  res.status(500).send(err.response || 'Something broke!');
});

if (module === require.main) {
  const server = app.listen(config.get('PORT'), () => {
    const port = server.address().port;
    console.log(`App listening on port ${port}`);
  });
}

module.exports = app;
