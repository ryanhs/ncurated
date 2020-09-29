const AsyncLock = require('async-lock');
const bluebird = require('bluebird');
const contract = require('../../_contracts/acquire');

const lock = new AsyncLock({ Promise: bluebird }); // Bluebird

module.exports = {
  ...contract,
  friendlyName: 'acquire',
  description: 'acquire function',

  async fn({ client, key }, exits) {
    const acquire = new Promise((resolve) => {
      lock.acquire(key, (done) => resolve(() => done()));
    });
    return exits.success(await acquire);
  },
};
