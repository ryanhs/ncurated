module.exports = {
  full: {
    CACHE_MEMORY_ENABLE: false,
    CACHE_MEMORY_MAX: 1000,
    CACHE_MEMORY_TTL: 60,

    CACHE_REDIS_ENABLE: false,
    CACHE_REDIS_URL: null, // if this provided, then all host port style can be ignored
    CACHE_REDIS_HOST: '127.0.0.1',
    CACHE_REDIS_PORT: 6379,
    CACHE_REDIS_PASS: '',
    CACHE_REDIS_DB: 1,
    CACHE_REDIS_TTL: 60,
  },
  development: {
    CACHE_MEMORY_ENABLE: true,
  },
  production: {
    CACHE_MEMORY_ENABLE: false,
    CACHE_REDIS_ENABLE: false,
  },
};
