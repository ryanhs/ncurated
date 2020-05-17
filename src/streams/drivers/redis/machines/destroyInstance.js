const contract = require('../../_contracts/destroyInstance');

module.exports = {
  ...contract,
  friendlyName: 'destroyInstance',
  description: 'destroy stream connection',

  async fn({ client, sdk }, exits) {
    const log = sdk.log.child({
      service: 'stream',
      driver: 'redis',
      action: 'destroy',
    });

    await client.quitAsync();
    log.info('stream: redis disabled!');
    return exits.success();
  },
};
