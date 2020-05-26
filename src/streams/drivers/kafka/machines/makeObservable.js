const uuid = require('uuid').v4;
const { fromEventPattern } = require('rxjs');
const flaverr = require('flaverr');
const contract = require('../../_contracts/makeObservable');

module.exports = {
  ...contract,
  friendlyName: 'makeObservable',
  description: 'Subscribe from stream.',
  sync: true,

  fn({ client, sdk, channel, partition, offset, fromBeginning }, exits) {
    const log = sdk.log.child({
      service: 'stream',
      driver: 'kafka',
      action: 'subscribe',
      channel,
      uuid: uuid(),
    });

    // make state ready
    log.trace('ready to subscribe!');

    // make observable
    let consumer;

    const onSubscribe = async (handler) => {
      try {
        consumer = client.consumer({ groupId: `${sdk.configs.APP_NAME}/${channel}` });
        if (typeof offset !== 'undefined') {
          await consumer.connect({ readUncommitted: true });
          await consumer.subscribe({ topic: channel });
        } else {
          await consumer.connect();
          await consumer.subscribe({ topic: channel, fromBeginning });
        }

        consumer.run({
          eachMessage: ({ partition: partitionMsg, message }) => {
            // convert
            const convertedMessage = {
              partition: partitionMsg,
              offset: message.offset,
              headers: message.headers,
              message: message.value.toString(),
            };
            log.trace('received!', convertedMessage);
            handler(convertedMessage);
          },
        });

        // override offset
        if (typeof offset !== 'undefined') {
          consumer.seek({ topic: channel, partition, offset });
        }

        log.trace('subscribing...');
      } catch (err) {
        log.error('subscribing failed', { code: 'E_STREAM_PUBLISH_FAILED', err });
        throw flaverr({ code: 'E_STREAM_SUBSCRIBE_FAILED' }, err);
      }
    };

    const onUnsubscribe = async () => {
      await consumer.disconnect();
      log.trace('unsubscribed!');
    };

    const observable = fromEventPattern(onSubscribe, onUnsubscribe);

    // return
    return exits.success({ observable });
  },
};
