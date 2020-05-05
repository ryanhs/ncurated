const Promise = require('bluebird');
const bunyan = require('bunyan');
const { ConnectionString } = require('connection-string');
const { createCacher } = require('../../src/utils/cache');
const defaultConfig = require('../../src/defaultConfigs/cache').production;

let cache;

beforeAll(async () => {
  cache = await createCacher({
    configs: {
      ...defaultConfig,
      CACHE_MEMORY_ENABLE: true,
      CACHE_REDIS_ENABLE: false,
    },
    sdk: {
      log: bunyan.createLogger({ name: 'jest', streams: [] }),
    },
  });
});

describe('check cache oke', () => {

  it('cache a string', async () => {
    const foo = await cache.wrap('foo', () => Promise.resolve('foo'));

    expect(foo).toBe('foo');
  });

  it('cache random generator', async () => {
    // initial value
    let randInt = -1;
    expect(randInt).toBe(-1);

    // function to generate a number
    const generate = async () => Math.random();

    // should be using generator
    randInt = await cache.wrap('randInt', generate);
    const randIntCached = randInt;
    expect(randInt).not.toBe(-1);

    // should not be using generator
    randInt = await cache.wrap('randInt', generate);
    expect(randInt).toBe(randIntCached);
  });

  it('check redis connection by url', async () => {
    cache = await createCacher({
      configs: {
        ...defaultConfig,
        CACHE_MEMORY_ENABLE: false,

        CACHE_REDIS_ENABLE: true,
        CACHE_REDIS_URL: process.env.REDIS_CONNECTION_STRING,

      },
      sdk: {
        log: bunyan.createLogger({ name: 'jest', streams: [] }),
      },
    });

    expect(cache.redisCache.store.getClient().options.url)
      .toBe(process.env.REDIS_CONNECTION_STRING);

    return cache.redisCache.store.getClient().quit();
  });

  it('check redis connection by each var', async () => {
    const constring = new ConnectionString(process.env.REDIS_CONNECTION_STRING);

    const redisConfig = {
      CACHE_REDIS_HOST: constring.hosts[0].name,
      CACHE_REDIS_PORT: constring.hosts[0].port,
      CACHE_REDIS_PASS: constring.password,
      CACHE_REDIS_DB: constring.path[0],
    };

    cache = await createCacher({
      configs: {
        ...defaultConfig,
        CACHE_MEMORY_ENABLE: false,

        CACHE_REDIS_ENABLE: true,
        CACHE_REDIS_TTL: 1000,
        ...redisConfig,
      },
      sdk: {
        log: bunyan.createLogger({ name: 'jest', streams: [] }),
      },
    });

    expect(cache.redisCache.store.getClient().options).toMatchObject({
      db: String(redisConfig.CACHE_REDIS_DB),
      host: redisConfig.CACHE_REDIS_HOST,
      port: String(redisConfig.CACHE_REDIS_PORT),
    });

    return cache.redisCache.store.getClient().quit();
  });

});
