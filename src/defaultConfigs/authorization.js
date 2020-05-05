module.exports = {
  full: {
    AUTHORIZATION_DRIVER: 'faker',
    AUTHORIZATION_CONNECTION_STRING: 'http://localhost:80/graphql',
    AUTHORIZATION_SSL_ENABLE: false,
    AUTHORIZATION_SSL_REJECT_UNAUTHORIZED: false,
    AUTHORIZATION_SSL_CA_FILE: '',
    AUTHORIZATION_SSL_KEY_FILE: '',
    AUTHORIZATION_SSL_CERT_FILE: '',
  },
  development: {
    AUTHORIZATION_DRIVER: 'faker',
    AUTHORIZATION_CONNECTION_STRING: 'http://localhost:80/graphql',
    AUTHORIZATION_SSL_ENABLE: false,
  },
  production: {
    AUTHORIZATION_DRIVER: 'faker',
    AUTHORIZATION_CONNECTION_STRING: 'http://localhost:80/graphql',
    AUTHORIZATION_SSL_ENABLE: false,
  },
};
