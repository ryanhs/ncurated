/*
 * this machine will have sync:true, since it needs to return observable
 *
 * const { observable } = makeObservable({ client, sdk, channel }).now();
 * const subscription = observable.subscribe({
 *   next(message) {
 *   // something to do here with message...
 *   }
 * }
 *
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
      description: 'a channel (topic) to subscribe',
      required: true,
      type: 'string',
    },
    partition: {
      description: 'kafka partition?',
      type: 'ref',
      defaultsTo: 0,
    },
    offset: {
      description: 'latest offset to start, *usefull in something like kafka',
      example: 12312,
      type: 'ref', // since it will depend on stream driver
      // defaultsTo: 'latest',
    },
    fromBeginning: {
      description: 'fromBeginning? *usefull in something like kafka',
      type: 'boolean',
      defaultsTo: false,
    },
  },

  exits: {
    success: {
      description: 'observable',
    },
    unknownError: {
      description: 'Unknown error occurred!',
    },
  },
};
