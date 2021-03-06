// libs
const _ = require('lodash');

// utils
const { createLogger } = require('./utils/log');
const { createCacher } = require('./utils/cache');
const { parseConfig } = require('./utils/config');

// trackers
const { createZipkinTracer } = require('./tracers/zipkin/index');

// connect
const connectGraphql = require('./graphql/connect');
const connectStream = require('./streams/connect');
const connectMutex = require('./mutex/connect');

// default instance
const defaultInstance = {
  configs: {},

  // utils
  zipkinTracer: null,
  log: null,
  cache: null,

  authorization: null, // default authorization
  authorizations: { default: null },

  stream: null, // default stream
  streams: { default: null },

  mutex: null, // default stream
  mutexes: { default: null },

  graphql: null, // default graphql
  graphqls: { default: null },
};

// ---------------------------------------------------------------------------

// just a small decoration, also used for test binding :-)
function logoPrint() {
  const logo = '==== SDK-NODEJS Bootstrap! ====';
  this.log.trace(logo);
  return logo;
}

// ---------------------------------------------------------------------------

async function enableMutex(name = 'default', configs) {
  const sdk = this; // -_-

  // only if default then try from sdk configs
  const mergedConfigs = name === 'default' ? configs || sdk.configs : configs || {};

  const connection = await connectMutex({ configs: mergedConfigs, sdk });
  sdk.mutexes[name] = connection;

  // default?
  if (name === 'default') {
    sdk.mutex = connection;
  }

  return sdk.mutexes[name];
}

async function disableMutex(name = 'default') {
  const sdk = this; // -_-

  // call destroy
  if (Object.prototype.hasOwnProperty.call(sdk.mutexes[name], 'destroy')) {
    await sdk.mutexes[name].destroy();
  }

  // just delete instance
  delete sdk.mutexes[name];

  // if default, then remove default
  if (name === 'default') {
    sdk.mutex = null;
  }
}

// ---------------------------------------------------------------------------

async function enableStream(name = 'default', configs) {
  const sdk = this; // -_-

  // only if default then try from sdk configs
  const mergedConfigs = name === 'default' ? configs || sdk.configs : configs || {};

  const connection = await connectStream({ configs: mergedConfigs, sdk });
  sdk.streams[name] = connection;

  // default?
  if (name === 'default') {
    sdk.stream = connection;
  }

  return sdk.streams[name];
}

async function disableStream(name = 'default') {
  const sdk = this; // -_-

  // call destroy
  if (Object.prototype.hasOwnProperty.call(sdk.streams[name], 'destroy')) {
    await sdk.streams[name].destroy();
  }

  // just delete instance
  delete sdk.streams[name];

  // if default, then remove default
  if (name === 'default') {
    sdk.stream = null;
  }
}

// ---------------------------------------------------------------------------

async function enableGraphql(name = 'default', configs = {}) {
  const sdk = this; // -_-

  // direct config for default? ok then
  if (typeof name === 'object') {
    configs = name; // eslint-disable-line no-param-reassign
    name = 'default'; // eslint-disable-line no-param-reassign
  }

  // connect and add to graphqls list
  const connection = await connectGraphql({
    configs: { remoteServiceName: name, ...configs },
    sdk,
  });
  sdk.graphqls[name] = connection;

  // default? add to default
  if (name === 'default') {
    sdk.graphql = connection;
  }

  return sdk.graphqls[name];
}

async function disableGraphql(name = 'default') {
  const sdk = this; // -_-

  // just delete instance
  delete sdk.graphqls[name];

  // if default, then remove default
  if (name === 'default') {
    sdk.graphql = null;
  }
}

// ---------------------------------------------------------------------------

async function bootstrap(environment = 'production', configOverrides = {}, useEnv = true, overwriteGlobal = false) {
  // create new instance
  const instance = _.cloneDeep(defaultInstance);

  // parse config
  const configs = parseConfig(environment, configOverrides, useEnv);
  instance.configs = configs;

  // bind all functions
  instance.logoPrint = logoPrint.bind(instance);

  // utils bootstraped first, since its essentials.
  instance.log = await createLogger({ configs });
  instance.cache = await createCacher({ configs, sdk: instance });

  // enable zipkin?
  if (configs.ZIPKIN_ENABLE) {
    instance.zipkinTracer = await createZipkinTracer({ configs, sdk: instance });
  }

  // integration with graphql, with back compatibility for not camelcase
  instance.enable_graphql = enableGraphql.bind(instance);
  instance.disable_graphql = disableGraphql.bind(instance);
  instance.enableGraphql = enableGraphql.bind(instance);
  instance.disableGraphql = disableGraphql.bind(instance);

  // integration with stream, with back compatibility for not camelcase
  instance.enable_stream = enableStream.bind(instance);
  instance.disable_stream = disableStream.bind(instance);
  instance.enableStream = enableStream.bind(instance);
  instance.disableStream = disableStream.bind(instance);

  // integration with mutex, with back compatibility for not camelcase
  instance.enable_mutex = enableMutex.bind(instance);
  instance.disable_mutex = disableMutex.bind(instance);
  instance.enableMutex = enableMutex.bind(instance);
  instance.disableMutex = disableMutex.bind(instance);

  // put it in global var for default usage later with getInstance()
  if (overwriteGlobal || !global.ncuratedSDK) {
    global.ncuratedSDK = instance;
  }

  // return nicely
  return instance;
}

// compatibility
const getInstance = () => global.ncuratedSDK; // global instance for default usage
module.exports = { getInstance, bootstrap };
