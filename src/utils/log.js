const Machine = require('machine');
const Bunyan = require('bunyan');
const DebugStream = require('bunyan-debug-stream');
const Slack = require('bunyan-slack');
const Teams = require('bunyan-teams');
const Cloudwatch = require('bunyan-cloudwatch');

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
