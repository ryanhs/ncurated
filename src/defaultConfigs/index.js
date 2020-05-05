const defaultApp = require('./app');
const defaultLog = require('./log');
const defaultCache = require('./cache');
const defaultAuthorization = require('./authorization');
const defaultStream = require('./stream');
const defaultMutex = require('./mutex');
const defaultZipkin = require('./zipkin');

module.exports = {
  development: {
    ...defaultApp,
    ...defaultLog.full,
    ...defaultLog.development,
    ...defaultCache.full,
    ...defaultCache.development,
    ...defaultAuthorization.full,
    ...defaultAuthorization.development,
    ...defaultStream.full,
    ...defaultStream.development,
    ...defaultMutex.full,
    ...defaultMutex.development,
    ...defaultZipkin.full,
    ...defaultZipkin.development,
  },
  production: {
    ...defaultApp,
    ...defaultLog.full,
    ...defaultLog.production,
    ...defaultCache.full,
    ...defaultCache.production,
    ...defaultAuthorization.full,
    ...defaultAuthorization.production,
    ...defaultStream.full,
    ...defaultStream.production,
    ...defaultMutex.full,
    ...defaultMutex.production,
    ...defaultZipkin.full,
    ...defaultZipkin.production,
  },
};
