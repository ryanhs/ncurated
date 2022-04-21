const omit = require('lodash.omit');
const jsonStringify = require('fast-json-stable-stringify');
const Machine = require('machine');
const Bunyan = require('bunyan');
const DebugStream = require('bunyan-debug-stream');
const Slack = require('bunyan-slack');
const Teams = require('bunyan-teams');
const Cloudwatch = require('bunyan-cloudwatch');
const AzBunyan = require('az-bunyan');
const Sentry = require("@sentry/node");


const def = {
  friendlyName: 'LoggerCreator',
  description: 'Create bunyan object for logging',

  inputs: {
    configs: {
      required: true,
      type: 'ref',
    },
  },

  exits: {
    success: {
      outputFriendlyName: 'Logger',
      outputDescription: 'Bunyan Logger',
    },
    unknownError: {
      description: 'Unknown error occurred!',
    },
  },

  async fn({ configs }, exits) {
    const streams = [];

    // -------------------------------------------------------------------------

    // stdout when not in debug mode
    if (configs.LOG_STDOUT_ENABLE && !configs.LOG_DEBUG_ENABLE) {
      streams.push({
        stream: process.stdout,
        level: configs.LOG_STDOUT_LEVEL,
      });
    }

    // -------------------------------------------------------------------------

    // debug, usefull for unit test / development
    if (configs.LOG_DEBUG_ENABLE) {
      streams.push({
        level: 'trace',
        type: 'raw',
        stream: DebugStream({
          basepath: __dirname, // this should be the root folder of your project.
          forceColor: true,
        }),
      });
    }

    // -------------------------------------------------------------------------

    // cool stuff, get last log. you can even use it for unit test
    // ring buffer enabled by default!!
    const ringBuffer = new Bunyan.RingBuffer({
      limit: configs.LOG_RINGBUFFER_LIMIT,
    });
    streams.push({
      level: configs.LOG_RINGBUFFER_LEVEL,
      type: 'raw', // use 'raw' to get raw log record objects
      stream: ringBuffer,
    });

    // -------------------------------------------------------------------------

    // push to slack
    if (configs.LOG_SLACK_ENABLE) {
      streams.push({
        level: configs.LOG_SLACK_LEVEL,
        stream: new Slack({
          webhook_url: configs.LOG_SLACK_URL,
          channel: configs.LOG_SLACK_CHANNEL,
          username: configs.LOG_SLACK_USERNAME,
          icon_emoji: configs.LOG_SLACK_ICON,
        }),
      });
    }

    // -------------------------------------------------------------------------

    // push to teams
    if (configs.LOG_TEAMS_ENABLE) {
      streams.push({
        level: configs.LOG_TEAMS_LEVEL,
        stream: new Teams({
          webhook_url: configs.LOG_TEAMS_URL,
        }),
      });
    }

    // -------------------------------------------------------------------------

    // push to cloudwatch
    function wrappedCloudwatch() {
      const cloudwatchStream = Cloudwatch({
        logGroupName: configs.LOG_CLOUDWATCH_GROUP_NAME,
        logStreamName: configs.LOG_CLOUDWATCH_STREAM_NAME,
      });

      return {
        // simplify it, and using level name, instead of number for easier lookup
        write: (entry) => {
          const logObject = typeof entry === 'string' ? JSON.parse(entry) : entry;
          logObject.level = Bunyan.nameFromLevel[logObject.level].toUpperCase();
          delete logObject.pid;
          delete logObject.v;
          cloudwatchStream.write(logObject);
        },
        ...cloudwatchStream,
      };
    }
    if (configs.LOG_CLOUDWATCH_ENABLE) {
      streams.push({
        level: configs.LOG_CLOUDWATCH_LEVEL,
        stream: wrappedCloudwatch(),
      });
    }

    // -------------------------------------------------------------------------

    // push to azure blob storage
    if (configs.LOG_AZURETABLESTORAGE_ENALBE) {
      streams.push(AzBunyan.createTableStorageStream(configs.LOG_AZURETABLESTORAGE_LEVEL, {
          connectionString: configs.LOG_AZURETABLESTORAGE_CONNECTIONSTRING,
          tableName: configs.LOG_AZURETABLESTORAGE_TABLENAME
      }));
      // streams.push({
      //   level: configs.LOG_AZURETABLESTORAGE_LEVEL,
      //   stream: AzBunyan.createTableStorageStream(configs.LOG_AZURETABLESTORAGE_LEVEL, {
      //       connectionString: configs.LOG_AZURETABLESTORAGE_CONNECTIONSTRING,
      //       tableName: configs.LOG_AZURETABLESTORAGE_TABLENAME
      //   }),
      // });
    }

    // -------------------------------------------------------------------------

    // push to sentry storage
    // LOG_SENTRY_ENABLE: false,
    // LOG_SENTRY_LEVEL: "info",
    // LOG_SENTRY_DSN: "https://xxxxxxxxxxxx@xxxxxxxxxxxxxx.id/12",
    // LOG_SENTRY_TRACESSAMPLERATE: "1.0",
    // LOG_SENTRY_ENVIRONMENT: "production",
    function wrappedSentry() {
      if (configs.LOG_SENTRY_INIT) {
        Sentry.init({
          serverName: configs.APP_NAME,
          environment: configs.LOG_SENTRY_ENVIRONMENT || 'production',
          dsn: configs.LOG_SENTRY_DSN,
          tracesSampleRate: configs.LOG_SENTRY_TRACESSAMPLERATE, // log all for sdk
          // debug: true,
        });
      }

      // const scope = new Sentry.Scope();

      return {
        // simplify it, and using level name, instead of number for easier lookup
        write: (entry) => {
          let { level, error, err, tags, msg } = entry;
          const levelName = ({
            'error': Sentry.Severity.Error,
            'warn': Sentry.Severity.Warning,
            'info': Sentry.Severity.Info,
            'debug': Sentry.Severity.Debug,
            'trace': Sentry.Severity.Debug,
          })[Bunyan.nameFromLevel[level]];
          let cleanedContext = omit(entry, 'level', 'error', 'v', 'pid', 'err', 'tags', 'msg');

          if (levelName === 'error') {

            const context = {
              extra: cleanedContext,
              error: err || error,
              level: 'error',
            };
            Sentry.captureMessage(msg, context);
            // console.log('Sentry.captureMessage', msg, context);

          } else {

            const context = {
              extra: cleanedContext,
              level: levelName,
            }
            Sentry.captureMessage(msg, context);
            // console.log('Sentry.captureMessage', msg, context);
          }
        },
      };
    }
    if (configs.LOG_SENTRY_ENABLE) {
      streams.push({
        level: configs.LOG_SENTRY_LEVEL,
        stream: wrappedSentry(),
        type: 'raw',
      });
    }

    // -------------------------------------------------------------------------

    // level of logs based on environment
    let level = 'info';
    if (configs.environment === 'production') level = 'info';
    if (configs.environment === 'development') level = 'trace';

    // create bunyan object
    const logger = Bunyan.createLogger({
      name: configs.APP_NAME,
      streams,
      serializers: Bunyan.stdSerializers,
      level,
      src: configs.environment === 'development',
    });

    // expose some goods
    logger.ringBuffer = ringBuffer; // this the trick, to use ringBuffer object it self

    return exits.success(logger);
  },
};

module.exports = { createLogger: Machine(def) };
