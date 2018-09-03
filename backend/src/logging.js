'use strict';

const winston = require('winston');
const expressWinston = require('express-winston');
const StackdriverTransport = require('@google-cloud/logging-winston').LoggingWinston;

const colorize = process.env.NODE_ENV !== 'production';

const requestLogger = expressWinston.logger({
  transports: [
    new StackdriverTransport(),
    new winston.transports.Console({
      json: false,
      colorize: colorize
    })
  ],
  expressFormat: true,
  meta: false
});

const errorLogger = expressWinston.errorLogger({
  transports: [
    new StackdriverTransport(),
    new winston.transports.Console({
      json: true,
      colorize: colorize
    })
  ]
});

module.exports = {
  requestLogger: requestLogger,
  errorLogger: errorLogger,
  error: winston.error,
  warn: winston.warn,
  info: winston.info,
  log: winston.log,
  verbose: winston.verbose,
  debug: winston.debug,
  silly: winston.silly
};
