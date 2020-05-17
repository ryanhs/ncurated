/*
 * this machine will have sync:true, since it needs to return promise
 *
 * const { promise } = publish({ client, sdk, channel: topic, message }).now();
 * // use promise
 * promise.then(console.log)
 * */
module.exports = {
  sync: true,

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
    channel: {
      description: 'channel to publish',
      required: true,
      type: 'string',
    },
    message: {
      description: 'message to publish',
      required: true,
      type: 'string',
    },
    partition: {
      description: 'kafka partition?',
      type: 'ref',
      defaultsTo: 0,
    },
  },

  exits: {
    success: {
      description: 'will output an object that contain promise',
    },
    unknownError: {
      description: 'Unknown error occurred!',
    },
  },
};
