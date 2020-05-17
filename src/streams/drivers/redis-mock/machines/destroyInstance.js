const contract = require('../../_contracts/destroyInstance');

module.exports = {
  ...contract,
  friendlyName: 'destroyInstance',
  description: 'destroy stream connection',

  fn({ client, sdk }, exits) {
    const log = sdk.log.child({
      service: 'stream',
      driver: 'redis-mock',
      action: 'destroy',
    });

    client.quit();
    log.info('stream: redis-mock disabled!');
    return exits.success();
  },
};
