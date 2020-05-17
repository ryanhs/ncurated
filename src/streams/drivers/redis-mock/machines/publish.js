// const Promise = require('bluebird');
const uuid = require('uuid').v4;
const contract = require('../../_contracts/publish');

module.exports = {
  ...contract,
  friendlyName: 'publish',
  description: 'Publish a message into stream.',
  sync: true,

  fn({
    client,
    sdk,
    channel,
    message,
  }, exits) {
    const log = sdk.log.child({
      service: 'stream',
      driver: 'redis-mock',
      action: 'publish',
      channel,
      uuid: uuid(),
    });

    // make state sending
    log.trace('sending message!', { message });

    // publish message
    const pub = client.duplicate();
    const promise = pub.publishAsync(channel, message)
      .tap(() => {
        // finish'em up
        log.trace('message published!');
        pub.quit();
      });

    // return promise and promise compatibility
    return exits.success({ promise, then: (...args) => promise.then(...args) });
  },
};
