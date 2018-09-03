'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const docData = require('./storage/document');
const userData = require('./storage/user');
const user = require('./user');

const router = express.Router();

router.use(bodyParser.json());
router.use(user.template);

router.post('/list', (req, res) => {
  let data = req.body;
  let category = data.category;

  let promises = [docData.read({public: true, category})];

  if (req.user && req.user.uid) {
    let owner = userData.key(req.user.uid);
    promises.push(docData.read({public: false, category, owner}));
  }

  Promise.all(promises).then(results => {
    let docs = [];
    results.forEach(result => docs = docs.concat(result));
    let contents = docs.map(doc => JSON.parse(doc.content));
    return contents;
  })
  .then(contents => {
    return res.json(contents);
  })
  .catch(e => {
    console.error(e.name + ': ' + e.message);
    return res.status(400).end();
  });
});

router.post('/get/:identifier/:owner?', (req, res) => {
  let identifier = req.params.identifier;
  let owner = undefined;
  if (req.params.owner) {
    owner = userData.key(req.params.owner);
  }
  docData.read({identifier, owner}).then(docs => {
    if (docs.length == 0) {
      throw 'Requested doc not found.';
    };
    return res.send(docs[0].content);
  })
  .catch(e => {
    console.error(e.name + ': ' + e.message);
    return res.status(400).end();
  });
});

router.post('/save', (req, res) => {
  if (!req.user) {
    return res.status(403).end();
  }

  let data = req.body;
  let {title, identifier, category, public: public_} = data;

  if (!req.user.isAdmin) {
    public_ = false;
  }

  if (!identifier) {
    return res.status(400).end();
  }

  let content = JSON.stringify(data);
  let owner = userData.key(req.user.uid);

  docData.update({
    title, identifier, category, public: public_, owner, content
  });

  return res.status(200).end();
});

router.post('/delete', (req, res) => {
  if (!req.user) {
    return res.status(403).end();
  }

  let data = req.body;
  let identifier = data.identifier;

  if (!identifier) {
    return res.status(400).end();
  }

  let owner = userData.key(req.user.uid);

  docData.findAndRemove({identifier, owner}).then(() => {
    return res.status(200).end();
  });
});

router.use((err, req, res, next) => {
  err.response = {
    message: err.message,
    internalCode: err.code
  };
  next(err);
});

module.exports = {
  router
};
