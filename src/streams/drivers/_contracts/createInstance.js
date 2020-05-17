module.exports = {
  inputs: {
    sdk: {
      description: 'this sdk instance',
      required: true,
      type: 'ref',
    },
    connectionString: {
      description: 'connection string for this driver',
      required: false,
      type: 'string',
    },
    sslEnable: {
      description: 'enable ssl?',
      required: false,
      type: 'boolean',
    },
    sslRejectUnauthorized: {
      description: 'reject unauthorized ssl? self-signed?',
      required: false,
      type: 'boolean',
    },
    sslCaFile: {
      description: 'ssl ca file',
      required: false,
      type: 'string',
    },
    sslKeyFile: {
      description: 'ssl key file',
      required: false,
      type: 'string',
    },
    sslCertFile: {
      description: 'ssl cert file',
      required: false,
      type: 'string',
    },
  },

  exits: {
    success: {
      description: 'return stream client connection',
    },
    unknownError: {
      description: 'Unknown error occurred!',
    },
  },
};
