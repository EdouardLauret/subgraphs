'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const config = require('./config');
const userData = require('./storage/user');

const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

function extractProfile(profile) {
  let email = profile.emails[0].value;
  let name = profile.displayName;
  return userData.getOrCreate({name, email}).then(user => {
    return {
      uid: user.key.id,
      name: user.name,
      email: user.email,
      registrationDate: user.registrationDate,
      isAdmin: user.isAdmin
    };
  });
}

passport.use(new GoogleStrategy({
  clientID: config.get('OAUTH2_CLIENT_ID'),
  clientSecret: config.get('OAUTH2_CLIENT_SECRET'),
  callbackURL: config.get('OAUTH2_CALLBACK'),
  accessType: 'offline'
}, (accessToken, refreshToken, profile, cb) => {
  extractProfile(profile).then((user) => {
    cb(null, user);
  });
}));

passport.serializeUser((user, cb) => {
  cb(null, user);
});
passport.deserializeUser((obj, cb) => {
  cb(null, obj);
});

function authRequired (req, res, next) {
  if (!req.user) {
    req.session.oauth2return = req.originalUrl;
    return res.redirect('/#/login');
  }
  next();
}

function addTemplateVariables (req, res, next) {
  res.locals.profile = req.user;
  res.locals.login = `/api/user/auth/google?return=${encodeURIComponent(req.originalUrl)}`;
  res.locals.logout = `/api/user/logout?return=${encodeURIComponent(req.originalUrl)}`;
  next();
}

const router = express.Router();

router.use(bodyParser.json());

router.get(
  '/auth/google',
  (req, res, next) => {
    if (req.query.return) {
      req.session.oauth2return = req.query.return;
    }
    next();
  },
  passport.authenticate('google', { scope: ['email', 'profile'] })
);

router.get(
  '/auth/google/callback',
  passport.authenticate('google'),
  (req, res) => {
    const redirect = '/#/editor';
    delete req.session.oauth2return;
    res.redirect(redirect);
  }
);

router.post('/update', (req, res) => {
  if (!req.user) {
    return res.status(403).end();
  }

  userData.update(req.body).then(() => {
    req.user.name = req.body.name;
    return res.status(200).end();
  });
});

router.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/');
});

router.post('/whoami', (req, res) => {
  res.json(req.user || {});
});

module.exports = {
  router,
  required: authRequired,
  template: addTemplateVariables
};
