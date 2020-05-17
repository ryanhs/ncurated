const Promise = require('bluebird');
const uuid = require('uuid').v4;
const flaverr = require('flaverr');
const contract = require('../../_contracts/publish');


module.exports = {
  ...contract,
  friendlyName: 'publish',
  description: 'Publish a message into stream.',
  sync: true,

  fn({
    client, sdk, channel, message,
  }, exits) {
    const log = sdk.log.child({
      service: 'stream',
      driver: 'kafka',
      action: 'publish',
      channel,
      uuid: uuid(),
    });

    // make state sending
    log.trace('sending message!', { message });

    // publish message
    const pub = client.singleton_producer;
    const promise = Promise.resolve(pub.send({
      topic: channel,
      messages: [
        { value: message },
      ],
    }))
      .tap(() => {
        // finish'em up
        log.trace('message published!');
      })
      .catch((err) => {
        log.error('publish message failed', { code: 'E_STREAM_PUBLISH_FAILED', err });
        throw flaverr({ code: 'E_STREAM_PUBLISH_FAILED' }, err);
      });

    // return promise and promise compatibility
    return exits.success({ promise, then: (...args) => promise.then(...args) });
  },
};
