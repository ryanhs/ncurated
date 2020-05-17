const Promise = require('bluebird');
// const { ConnectionString } = require('connection-string');
const Redis = Promise.promisifyAll(require('redis'));
const contract = require('../../_contracts/createInstance');

module.exports = {
  ...contract,
  friendlyName: 'createInstance',
  description: 'Create stream driver with redis mock.',

  fn({ sdk, connectionString }, exits) {
    // notify to boot
    const log = sdk.log.child({
      service: 'stream',
      driver: 'redis',
      action: 'create',
    });

    const client = Redis.createClient(connectionString);
    log.info('stream: redis enabled!');

    // duplicate a whole things, usefull for subscribing...
    client.newClient = () => Redis.createClient(connectionString);

    return exits.success(client);
  },
};
