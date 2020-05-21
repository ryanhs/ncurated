const Promise = require('bluebird');
const contract = require('./../../_contracts/acquire');

module.exports = {
  ...contract,
  friendlyName: 'acquire',
  description: 'acquire function',

  async fn({ client, key }, exits) {
    const mutex = await client.getInstance(key).promise();
    await mutex.lock();

    const unlock = () => Promise.resolve(mutex.unlock());
    return exits.success(unlock);
  },
};
