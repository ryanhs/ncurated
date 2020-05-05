const Machine = require('machine');
const Promise = require('bluebird');
const { ConnectionString } = require('connection-string');
const cacheManager = require('cache-manager');
const redisStore = require('cache-manager-redis-store');

const def = {
  friendlyName: 'CacheCreator',
  description: 'Create cache manager object for caching',

  inputs: {
    configs: {
      required: true,
      type: 'ref',
    },
    sdk: {
      description: 'this sdk instance',
      required: true,
      type: 'ref',
    },
  },

  exits: {
    success: {
      outputFriendlyName: 'cache-manager',
      outputDescription: 'cache-manager instance',
    },
    unknownError: {
      description: 'Unknown error occurred!',
    },
  },

  async fn({ configs, sdk }, exits) {
    const stores = [];

    if (configs.CACHE_MEMORY_ENABLE) {
      stores.push(cacheManager.caching({
        store: 'memory',
        max: configs.CACHE_MEMORY_MAX || 10000,
        ttl: configs.CACHE_MEMORY_TTL || 60,
      }));
    }

    let redisCache;
    if (configs.CACHE_REDIS_ENABLE) {
      const redisUrl = (configs.CACHE_REDIS_URL)
        ? configs.CACHE_REDIS_URL
        : new ConnectionString('', {
          protocol: 'redis',
          hosts: [{
            name: configs.CACHE_REDIS_HOST,
            port: parseInt(configs.CACHE_REDIS_PORT, 10),
          }],
          password: configs.CACHE_REDIS_PASS,
          path: [String(parseInt(configs.CACHE_REDIS_DB, 10))],
        }).toString();

      redisCache = cacheManager.caching({
        store: redisStore,
        url: redisUrl,
        ttl: configs.CACHE_REDIS_TTL || 1800,
      });
      stores.push(redisCache);
    }

    sdk.log.info('cache enabled', {
      memory: configs.CACHE_MEMORY_ENABLE,
      redis: configs.CACHE_REDIS_ENABLE,
    });

    const cacher = cacheManager.multiCaching(stores);
    cacher.redisCache = redisCache; // expose redis?
    return exits.success(Promise.promisifyAll(cacher)); // :-) good idea to use bluebird here
  },
};

module.exports = { createCacher: Machine(def) };
