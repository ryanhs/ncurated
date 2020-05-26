module.exports = {
  inputs: {
    client: {
      description: 'this stream driver instance',
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
      description: 'ok',
    },
    unknownError: {
      description: 'Unknown error occurred!',
    },
  },
};
