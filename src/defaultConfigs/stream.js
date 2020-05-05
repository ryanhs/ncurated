module.exports = {
  full: {
    STREAM_DRIVER: 'redis-mock',
    STREAM_CONNECTION_STRING: 'redis://localhost:6379/1',
    STREAM_SSL_ENABLE: false,
    STREAM_SSL_REJECT_UNAUTHORIZED: false,
    STREAM_SSL_CA_FILE: '',
    STREAM_SSL_KEY_FILE: '',
    STREAM_SSL_CERT_FILE: '',

    STREAM_FALLBACK_ENABLE: false,
    STREAM_FALLBACK_DRIVER: 'redis-mock',
    STREAM_FALLBACK_CONNECTION_STRING: 'redis://localhost:6379/1',
    STREAM_FALLBACK_SSL_ENABLE: false,
    STREAM_FALLBACK_SSL_REJECT_UNAUTHORIZED: false,
    STREAM_FALLBACK_SSL_CA_FILE: '',
    STREAM_FALLBACK_SSL_KEY_FILE: '',
    STREAM_FALLBACK_SSL_CERT_FILE: '',
  },
  development: {
    STREAM_DRIVER: 'redis-mock',
    STREAM_CONNECTION_STRING: 'redis://localhost:6379/1',
    STREAM_SSL_ENABLE: false,

    STREAM_FALLBACK_ENABLE: false,
  },
  production: {
    STREAM_DRIVER: 'redis-mock',
    STREAM_CONNECTION_STRING: 'redis://localhost:6379/1',
    STREAM_SSL_ENABLE: false,

    STREAM_FALLBACK_ENABLE: false,
  },
};
