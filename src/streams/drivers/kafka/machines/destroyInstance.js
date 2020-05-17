const contract = require('../../_contracts/destroyInstance');

module.exports = {
  ...contract,
  friendlyName: 'destroyInstance',
  description: 'destroy stream connection',

  async fn({ sdk, client }, exits) {
    const log = sdk.log.child({
      service: 'stream',
      driver: 'kafka',
      action: 'destroy',
    });

    // disconnect
    await client.singleton_producer.disconnect();

    log.info('stream: kafka disabled!');
    return exits.success();
  },
};
