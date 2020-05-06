// libs
const _ = require('lodash');

// utils
const { createLogger } = require('./utils/log');
const { createCacher } = require('./utils/cache');
const { parseConfig } = require('./utils/config');

// trackers
const { createZipkinTracer } = require('./tracers/zipkin/index');

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

  mutex: null, // default mutex
  mutexes: { default: null },

  graphql: null, // default mutex
  graphqls: { default: null },
};

// just a small decoration, also used for test binding :-)
function logoPrint() {
  const logo = '==== SDK-NODEJS Bootstrap! ====';
  this.log.trace(logo);
  return logo;
}

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
