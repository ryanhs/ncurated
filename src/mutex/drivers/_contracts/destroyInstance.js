module.exports = {
  inputs: {
    client: {
      description: 'this mutex driver instance',
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
      description: "mutex client's connection released",
    },
    unknownError: {
      description: 'Unknown error occurred!',
    },
  },
};
