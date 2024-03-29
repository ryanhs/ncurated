module.exports = {
  full: {
    LOG_DEBUG_ENABLE: false,

    LOG_STDOUT_ENABLE: true,
    LOG_STDOUT_LEVEL: 'trace',

    // ring buffer enabled by default
    LOG_RINGBUFFER_LEVEL: 'info',
    LOG_RINGBUFFER_LIMIT: 100,

    LOG_TEAMS_ENABLE: false,
    LOG_TEAMS_LEVEL: 'error',
    LOG_TEAMS_URL: 'https://outlook.office.com/webhook/ba57dfc.....d117daf812',

    LOG_CLOUDWATCH_ENABLE: false,
    LOG_CLOUDWATCH_LEVEL: 'error',
    LOG_CLOUDWATCH_GROUP_NAME: '',
    LOG_CLOUDWATCH_STREAM_NAME: '',

    LOG_AZURETABLESTORAGE_ENALBE: false,
    LOG_AZURETABLESTORAGE_LEVEL: 'error',
    LOG_AZURETABLESTORAGE_TABLENAME: 'sometableforlogs',
    LOG_AZURETABLESTORAGE_CONNECTIONSTRING: 'DefaultEndpointsProtocol=https;AccountName=storageAccountName;AccountKey=storageAccoutnKey;',

    LOG_SENTRY_ENABLE: false,
    LOG_SENTRY_LEVEL: "info",
    LOG_SENTRY_DSN: "https://somekey@domain.dev.id/12",
    LOG_SENTRY_TRACESSAMPLERATE: "1.0",
    LOG_SENTRY_ENVIRONMENT: "production",
    LOG_SENTRY_INIT: false, // already init
  },
  development: {
    LOG_STDOUT_ENABLE: false,
    LOG_RINGBUFFER_LEVEL: 'trace',
  },
  production: {
    LOG_STDOUT_ENABLE: false,
  },
};
