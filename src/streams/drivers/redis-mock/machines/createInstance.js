const Promise = require('bluebird');
const Redis = Promise.promisifyAll(require('redis-mock'));
const contract = require('../../_contracts/createInstance');

module.exports = {
  ...contract,
  friendlyName: 'createInstance',
  description: 'Create stream driver with redis mock.',

  fn({ sdk }, exits) {
    // notify to boot
    const log = sdk.log.child({
      service: 'stream',
      driver: 'redis-mock',
      action: 'create',
    });
    const client = Redis.createClient();
    log.info('stream: redis-mock enabled!');
    return exits.success(client);
  },
};
