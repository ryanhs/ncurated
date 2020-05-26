const uuid = require('uuid').v4;
const { fromEventPattern } = require('rxjs');
const { filter, map } = require('rxjs/operators');
const contract = require('../../_contracts/makeObservable');

module.exports = {
  ...contract,
  friendlyName: 'makeObservable',
  description: 'Subscribe from stream with redis mock.',
  sync: true,

  fn({ client, sdk, channel }, exits) {
    const log = sdk.log.child({
      service: 'stream',
      driver: 'redis',
      action: 'subscribe',
      channel,
      uuid: uuid(),
    });

    // make state ready
    log.trace('ready to subscribe!');

    // make observable
    let sub;
    const onSubscribe = (handler) => {
      sub = client.newClient(); // duplicate() doesnt work -_-
      sub.subscribe(channel);
      sub.addListener('message', handler);
    };
    const onUnsubscribe = (handler) => {
      sub.removeListener('message', handler);
      sub.unsubscribe();
      sub.quit();
    };
    const selector = (channelNow, message) => (channel === channelNow ? message : undefined);
    const observable = fromEventPattern(onSubscribe, onUnsubscribe, selector)
      .pipe(filter((ev) => ev !== undefined))
      .pipe(
        map((message) => {
          const convertedMessage = {
            partition: 0,
            offset: Date.now(),
            headers: {},
            message,
          };
          log.trace('received!', convertedMessage);
          return convertedMessage;
        }),
      );

    // return
    return exits.success({ observable });
  },
};
