const { ConnectionString } = require('connection-string');
const { Kafka, logLevel } = require('kafkajs');
const contract = require('../../_contracts/createInstance');

const toBunyanLogLevel = (level) => {
  if (level === logLevel.ERROR) return 'error';
  if (level === logLevel.NOTHING) return 'error';
  if (level === logLevel.WARN) return 'warn';
  if (level === logLevel.INFO) return 'info';
  if (level === logLevel.DEBUG) return 'trace';
  return 'info';
};

const LogCreator = (logger) => () => ({ level, log }) => {
  const { message, ...extra } = log;
  logger[toBunyanLogLevel(level)]({
    message,
    extra,
  });
};

module.exports = {
  ...contract,
  friendlyName: 'createInstance',
  description: 'Create stream driver with kafka',

  fn({ sdk, connectionString, sslEnable = false, sslRejectUnauthorized, sslCaFile, sslKeyFile, sslCertFile }, exits) {
    // notify to boot
    const log = sdk.log.child({
      service: 'stream',
      driver: 'kafka',
      action: 'create',
    });

    const connectionStringParsed = new ConnectionString(connectionString);
    if (!connectionStringParsed.hosts) {
      const msg = `No hosts available in stream connection! ${connectionString}`;
      sdk.log.error(msg);
      throw new Error(msg);
    }

    const brokers = connectionStringParsed.hosts.map((v) => v.toString());

    let ssl = sslEnable;
    if (sslEnable && (sslRejectUnauthorized || sslCaFile || sslKeyFile || sslCertFile)) {
      ssl = {
        rejectUnauthorized: sslRejectUnauthorized,
        ca: [sslCaFile],
        key: sslKeyFile,
        cert: sslCertFile,
      };
    }

    let sasl;
    if (Object.prototype.hasOwnProperty.call(connectionStringParsed, 'password')) {
      sasl = {
        mechanism: 'plain', // scram-sha-256 or scram-sha-512
        username: connectionStringParsed.user,
        password: connectionStringParsed.password,
      };
    }

    const kafkaOptions = {
      clientId: sdk.configs.APP_NAME,
      brokers,
      ssl,
      sasl,
      requestTimeout: 25000,
      connectionTimeout: 3000,
      maxRetryTime: 30000, // Maximum wait time (ms)
      initialRetryTime: 300, // Initial value used to calc retry in ms
      factor: 0.2, // Randomization factor
      multiplier: 2, // Exponential factor
      retries: 5,
      maxInFlightRequests: null, // concurrency
      logCreator: LogCreator(sdk.log),
    };
    // log.trace({ kafkaOptions });

    const kafka = new Kafka(kafkaOptions);

    // inject singleton product
    kafka.singleton_producer = kafka.producer();

    log.info(`stream: kafka enabled! ${brokers.join(',')}`);
    return exits.success(kafka);
  },
};
