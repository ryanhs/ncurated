const flaverr = require('flaverr');
const contract = require('../../_contracts/acquire');

module.exports = {
  ...contract,
  friendlyName: 'acquire',
  description: 'acquire function',

  async fn({ client, key }, exits) {
    const { redlock, isHealthy } = client;

    // if not healthy
    if (!isHealthy()) {
      const msg = 'redis redlock (mutex) is not in healthy condition';
      throw flaverr({ code: 'E_MUTEX_NOT_HEALTHY' }, msg);
    }

    // the maximum amount of time you want the resource locked in milliseconds,
    // keeping in mind that you can extend the lock up until
    // the point when it expires
    const ttl = 30000; // 30s?
    const lock = await redlock.lock(key, ttl);
    const unlock = () => lock.unlock();

    return exits.success(unlock);
  },
};
