const Promise = require('bluebird');
const MutexPromise = require('mutex-promise');
const contract = require('./../../_contracts/createInstance');

MutexPromise.Promise = Promise;

function createInstance() {
  const pool = {};

  return {
    getInstance(key) {
      // return existing pool if has the key
      if (Object.prototype.hasOwnProperty.call(pool, key)) {
        return pool[key];
      }

      // otherwise just make a new mutex based on given key
      pool[key] = new MutexPromise(key);
      return pool[key];
    },
  };
}

module.exports = {
  ...contract,
  friendlyName: 'createInstance',
  description: 'createInstance function',

  fn({ sdk }, exits) {
    // notify to boot
    const log = sdk.log.child({
      service: 'mutex',
      driver: 'memory',
      action: 'create',
    });

    log.info('mutex: memory enabled!');

    return exits.success(createInstance());
  },
};
