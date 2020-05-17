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
      description: 'stream client\'s connection released',
    },
    unknownError: {
      description: 'Unknown error occurred!',
    },
  },
};
