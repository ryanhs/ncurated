const Machine = require('machine');
const { Tracer, ExplicitContext, BatchRecorder, jsonEncoder } = require('zipkin');
const { HttpLogger } = require('zipkin-transport-http');

const def = {
  friendlyName: 'ZipkinTracerCreator',
  description: 'Create zipkin tracer object',

  inputs: {
    configs: {
      required: true,
      type: 'ref',
    },
    sdk: {
      description: 'this sdk instance',
      required: true,
      type: 'ref',
    },
  },

  exits: {
    success: {
      outputFriendlyName: 'zipkin-tracer',
      outputDescription: 'zipkin-tracer instance',
    },
    unknownError: {
      description: 'Unknown error occurred!',
    },
  },

  async fn({ configs, sdk }, exits) {
    // default log just log.trace it
    let logger = {
      logSpan: (span) => sdk.log.trace({ log: 'zipkin-span', ...span }),
    };

    if (configs.ZIPKIN_DRIVER === 'http') {
      logger = new HttpLogger({
        endpoint: configs.ZIPKIN_HTTP_ENDPOINT,
        jsonEncoder: jsonEncoder.JSON_V2,
        log: sdk.log,
      });
    }

    const tracer = new Tracer({
      ctxImpl: new ExplicitContext(),
      recorder: new BatchRecorder({ logger }),
      localServiceName: configs.APP_NAME,
    });

    sdk.log.info(`zipkip enabled with ${configs.ZIPKIN_DRIVER} driver`, {
      driver: configs.ZIPKIN_DRIVER,
    });

    return exits.success(tracer);
  },
};

module.exports = { createZipkinTracer: Machine(def) };
