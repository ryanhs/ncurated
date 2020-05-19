const Promise = require('bluebird');
const redis = require('redis');
const Redlock = require('redlock');
const contract = require('./../../_contracts/createInstance');

Promise.promisifyAll(redis.RedisClient.prototype);
Promise.promisifyAll(redis.Multi.prototype);

module.exports = {
  ...contract,
  friendlyName: 'createInstance',
  description: 'createInstance function',

  fn({ sdk, connectionString }, exits) {
    // notify to boot
    const log = sdk.log.child({
      service: 'mutex',
      driver: 'redis',
      action: 'create',
    });

    log.info('mutex: redis enabled!');

    const redisClient = redis.createClient({ url: connectionString });

    const redlock = new Redlock(
      [redisClient],
      {
        // the expected clock drift; for more details
        // see http://redis.io/topics/distlock
        driftFactor: 0.01, // time in ms

        // the max number of times Redlock will attempt
        // to lock a resource before erroring
        retryCount: 100,

        // the time in ms between attempts
        retryDelay: 200, // time in ms

        // the max time in ms randomly added to retries
        // to improve performance under high contention
        // see https://www.awsarchitectureblog.com/2015/03/backoff.html
        retryJitter: 200, // time in ms
      },
    );

    let healthy = true;

    redlock.on('clientError', (err) => {
      log.error('A redis error has occurred:', { err });
      healthy = false;
    });

    return exits.success({ redisClient, redlock, isHealthy: () => healthy });
  },
};
