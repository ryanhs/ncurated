/*
 * acquire mutex by key.
 *  async () => {
 *    const unlock = await acquire('a-lock-key');
 *
 *    // do some logic here....
 *    doSomething()
 *      .then((data) => ...)
 *      .then(() => unlock())
 *      .catch(err => unlock())
 *  }
 * */
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
    key: {
      description: 'mutex key',
      required: true,
      type: 'string',
    },
  },

  exits: {
    success: {
      description: 'will output an promise after aquiring',
      extendedDescription: 'acquire().then(unlock => { ...; unlock(); })',
    },
    unknownError: {
      description: 'Unknown error occurred!',
    },
  },
};
