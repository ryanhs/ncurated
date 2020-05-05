module.exports = {
  full: {
    MUTEX_DRIVER: 'memory',
    MUTEX_CONNECTION_STRING: '',
    MUTEX_SSL_ENABLE: false,
    MUTEX_SSL_REJECT_UNAUTHORIZED: false,
    MUTEX_SSL_CA_FILE: '',
    MUTEX_SSL_KEY_FILE: '',
    MUTEX_SSL_CERT_FILE: '',
  },
  development: {
    MUTEX_DRIVER: 'memory',
    MUTEX_CONNECTION_STRING: '',
    MUTEX_SSL_ENABLE: false,
  },
  production: {
    MUTEX_DRIVER: 'memory',
    MUTEX_CONNECTION_STRING: 'redis://anonymous:redispasshere@localhost:6379/1',
    MUTEX_SSL_ENABLE: false,
  },
};
