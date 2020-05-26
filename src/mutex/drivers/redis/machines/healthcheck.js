const flaverr = require('flaverr');
const contract = require('../../_contracts/healthcheck');

module.exports = {
  ...contract,
  friendlyName: 'healthcheck',
  description: 'healthcheck function',

  fn({ client }, exits) {
    const { redisClient, isHealthy } = client;

    // if not healthy
    if (!isHealthy()) {
      const msg = 'redis redlock (mutex) is not in healthy condition';
      throw flaverr({ code: 'E_MUTEX_NOT_HEALTHY' }, msg);
    }

    return exits.success(redisClient.pingAsync());
  },
};
