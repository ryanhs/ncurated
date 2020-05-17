const flaverr = require('flaverr');
const DriverRedis = require('./drivers/redis');
const DriverRedisMock = require('./drivers/redis-mock');
const DriverKafka = require('./drivers/kafka');

const drivers = {
  redis: DriverRedis,
  'redis-mock': DriverRedisMock,
  kafka: DriverKafka,
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
    const errorObject = { code: 'E_STREAM_INVALID_DRIVER', driver };
    const errorMessage = 'stream invalid driver!';

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
    makeObservable: (args) => drivers[driver].makeObservable({ client, sdk, ...args }),
    publish: (args) => drivers[driver].publish({ client, sdk, ...args }),
    healthcheck: (args) => drivers[driver].healthcheck({ client, sdk, ...args }),
    destroyInstance: (args) => drivers[driver].destroyInstance({ client, sdk, ...args }),
  };
};

module.exports = async ({ configs, sdk }) => {
  const connection = await connect({
    sdk,
    driver: configs.STREAM_DRIVER,
    connectionString: configs.STREAM_CONNECTION_STRING,
    sslEnable: configs.STREAM_SSL_ENABLE,
    sslRejectUnauthorized: configs.STREAM_SSL_REJECT_UNAUTHORIZED,
    sslCaFile: configs.STREAM_SSL_CA_FILE,
    sslKeyFile: configs.STREAM_SSL_KEY_FILE,
    sslCertFile: configs.STREAM_SSL_CERT_FILE,
  });

  return {
    // main methods
    makeObservable: (args) => connection.makeObservable(args).now(),
    publish: (args) => connection.publish(args).now(),
    // healthcheck: (args) => mainConnection.healthcheck(args),
    destroy: () => connection.destroyInstance(),

    // dig deeper
    connection,
  };
};
