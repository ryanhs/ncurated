const { ApolloClient } = require('apollo-client');
const { InMemoryCache } = require('apollo-cache-inmemory');
const { HttpLink } = require('apollo-link-http');
const wrapFetch = require('zipkin-instrumentation-fetch');
const fetch = require('node-fetch');
const crypto = require('crypto');
const flaverr = require('flaverr');
const _ = require('lodash');
const qgl = require('graphql-tag');

const makeRequest = ({ sdk, method, client, remoteServiceName, logger }) => (configs) => {
  const { withCache = false, cacheOptions = {}, throwError = true } = configs;

  const formatError = (err) => ({
    message: err.message,
    locations: [],
    path: [],
  });

  // auto throw, if configs.throwError is true
  const hash = crypto
    .createHash('md5')
    .update(JSON.stringify(_.pick(configs, ['query', 'mutation', 'variables'])))
    .digest('hex')
    .substr(0, 14);

  const log = logger.child({ hash, method });

  const sendRequest = () => {
    log.trace('request sent!', configs);

    // auto translate if gql is string
    if (configs.query && typeof configs.query === 'string') {
      configs.query = qgl(configs.query);
    }
    if (configs.mutation && typeof configs.mutation === 'string') {
      configs.mutation = qgl(configs.mutation);
    }

    return client[method](configs)
      .then((response) => {
        if ((response.errors || []).length > 0 && throwError) {
          throw flaverr(
            _.pick(response.errors[0], ['code', 'httpStatusCode', 'locations', 'path']),
            new Error(response.errors[0].message),
          );
        }

        log.trace('response success!');
        return {
          status: 200,
          errors: response.errors || [],
          ...response,
          hash,
        };
      })
      .catch((err) => {
        if (throwError) {
          // if there is more information
          if (Array.isArray(err.graphQLErrors) && err.graphQLErrors.length > 0) {
            throw flaverr(
              _.pick(err.graphQLErrors[0], ['code', 'httpStatusCode', 'locations', 'path']),
              err,
            );
          }

          // else just throw error
          throw err;
        }

        if (err.networkError) {
          log.trace('failed! networkError', err);
          return {
            status: 500,
            data: {},
            errors: [formatError(new Error('Backend Error!')), formatError(err.networkError)],
            hash,
          };
        }

        log.trace('failed! UnknownError', err);

        const originalErrors = Array.isArray(err.graphQLErrors)
          ? err.graphQLErrors.map(formatError)
          : [formatError(err)];

        return {
          status: 200,
          errors: [formatError(new Error('Unknown Error!')), ...originalErrors],
          data: null,
          hash,
        };
      });
  };

  if (withCache) {
    return sdk.cache.wrap(`${remoteServiceName}/${hash}`, () => sendRequest(), cacheOptions);
  }

  return sendRequest();
};

module.exports = async ({
  configs: { defaultOptions = {}, url, uri, remoteServiceName = 'unnamed-remote-service' },
  sdk,
}) => {
  const logger = sdk.log.child({
    service: 'graphql',
    remoteServiceName,
  });

  const endpoint = url || uri; // -_- which one is right?

  const defaultOptionsOverride = {
    watchQuery: {
      fetchPolicy: 'no-cache',
      errorPolicy: 'ignore',
    },
    query: {
      fetchPolicy: 'no-cache',
      errorPolicy: 'all',
    },
    ...defaultOptions,
  };

  // default fetcher
  let fetcher = fetch;

  // add zipkin tracer if enabled
  if (sdk.zipkinTracer) {
    fetcher = wrapFetch(fetch, {
      tracer: sdk.zipkinTracer,
      remoteServiceName,
    });
  }

  const cache = new InMemoryCache();
  const link = new HttpLink({ fetch: fetcher, uri: endpoint });
  const client = new ApolloClient({ cache, link, defaultOptions: defaultOptionsOverride });

  logger.info(`graphql: graphql enabled! ${remoteServiceName}`);

  return {
    query: makeRequest({
      method: 'query',
      sdk,
      client,
      remoteServiceName,
      logger,
    }),
    mutate: makeRequest({
      method: 'mutate',
      sdk,
      client,
      remoteServiceName,
      logger,
    }),
    client,
  };
};
