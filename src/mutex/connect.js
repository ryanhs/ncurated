const flaverr = require('flaverr');
const bluebird = require('bluebird');
const DriverMemory = require('./drivers/memory');
const DriverRedis = require('./drivers/redis');

const drivers = {
  memory: DriverMemory,
  redis: DriverRedis,
};

const connect = async ({
  sdk,
  driver,
  connectionString,
  sslEnable,
  sslRejectUnauthorized,
  sslCaFile,
  sslKeyFile,
  sslCertFile,
}) => {
  // guard driver
  if (Object.keys(drivers).indexOf(driver) === -1) {
    const errorObject = { code: 'E_MUTEX_INVALID_DRIVER', driver };
    const errorMessage = 'mutex invalid driver!';

    sdk.log.error(errorMessage, errorObject);
    throw flaverr(errorObject, new Error(errorMessage));
  }

  const client = await drivers[driver].createInstance({
    sdk,
    connectionString,
    sslEnable,
    sslRejectUnauthorized,
    sslCaFile,
    sslKeyFile,
    sslCertFile,
  });

  return {
    connection: { client },
    acquire: (args) => drivers[driver].acquire({ client, sdk, ...args }),
    healthcheck: (args) => drivers[driver].healthcheck({ client, sdk, ...args }),
    destroyInstance: (args) => drivers[driver].destroyInstance({ client, sdk, ...args }),
  };
};

module.exports = async ({ configs, sdk }) => {
  const connection = await connect({
    sdk,
    driver: configs.MUTEX_DRIVER,
    connectionString: configs.MUTEX_CONNECTION_STRING,
    sslEnable: configs.MUTEX_SSL_ENABLE,
    sslRejectUnauthorized: configs.MUTEX_SSL_REJECT_UNAUTHORIZED,
    sslCaFile: configs.MUTEX_SSL_CA_FILE,
    sslKeyFile: configs.MUTEX_SSL_KEY_FILE,
    sslCertFile: configs.MUTEX_SSL_CERT_FILE,
  });

  return {
    // main methods
    acquire: (args) => connection.acquire(args),
    destroy: () => connection.destroyInstance(),

    wrap: async (args, fn) => {
      const unlock = await connection.acquire(args);

      return bluebird
        .resolve(fn())
        .tap(unlock)
        .catch(async (err) => {
          await unlock();
          throw err;
        });
    },

    // dig deeper
    connection,
  };
};
