const { createLogger } = require('../../src/utils/log');
const defaultConfig = require('../../src/defaultConfigs/log').development;

describe('test logger', () => {
  const checkMethod = (method) => {
    it(`has methods ${method}`, async () => {
      const log = await createLogger({
        configs: { ...defaultConfig, APP_NAME: 'jest' },
      });

      expect(log).toHaveProperty(method);
      expect(log[method]).toBeInstanceOf(Function);
    });
  };

  checkMethod('trace');
  checkMethod('info');
  checkMethod('warn');
  checkMethod('error');
});

describe('test logger ringBuffer', () => {
  const checkMethod = (method) => {
    it(`it sent to ringBuffer when put level: ${method}`, async () => {
      const log = await createLogger({
        configs: { ...defaultConfig, APP_NAME: 'jest' },
      });

      // info
      log[method](`test for ${method}`);
      expect(log.ringBuffer.records[0]).toMatchObject({
        msg: expect.stringMatching(new RegExp(method, 'ig')),
      });

      expect(log).toHaveProperty(method);
      expect(log[method]).toBeInstanceOf(Function);
    });
  };

  checkMethod('trace');
  checkMethod('info');
  checkMethod('warn');
  checkMethod('error');
});

describe.skip('az bunyan test', () => {
  const checkMethod = (method) => {
    it(`it sent to az bunyan when put level: ${method}`, async () => {
      const log = await createLogger({
        configs: {
          ...defaultConfig,
          APP_NAME: 'jest',

          LOG_AZURETABLESTORAGE_ENALBE: true,
          LOG_AZURETABLESTORAGE_LEVEL: 'trace',
          LOG_AZURETABLESTORAGE_TABLENAME: 'na....logs',
          LOG_AZURETABLESTORAGE_CONNECTIONSTRING: 'D....indows.net',
        },
      });

      // info
      log[method](`test for ${method}`);
      expect(log.ringBuffer.records[0]).toMatchObject({
        msg: expect.stringMatching(new RegExp(method, 'ig')),
      });

      expect(log).toHaveProperty(method);
      expect(log[method]).toBeInstanceOf(Function);
    });
  };

  checkMethod('trace');
  checkMethod('info');
  checkMethod('warn');
  checkMethod('error');
});

describe('sentry test', () => {
  const checkMethod = (method, context = {}) => {
    it(`it sent to sentry when put level: ${method}`, async () => {
      const log = await createLogger({
        configs: {
          ...defaultConfig,
          APP_NAME: 'jest',

          LOG_SENTRY_ENABLE: true,
          LOG_SENTRY_INIT: true,
          LOG_SENTRY_LEVEL: "info",
          LOG_SENTRY_DSN: "https://e35a02b707e04798b40b3dc1b0aee189@insightdev.astra.co.id/12",
          LOG_SENTRY_TRACESSAMPLERATE: "1.0",
          LOG_SENTRY_ENVIRONMENT: "development",
        },
      });

      // info
      log[method](context, `test 1101 for ${method}`);
      expect(log.ringBuffer.records[0]).toMatchObject({
        msg: expect.stringMatching(new RegExp(method, 'ig')),
      });

      expect(log).toHaveProperty(method);
      expect(log[method]).toBeInstanceOf(Function);
    });
  };

  checkMethod('trace', { foo: 1, bar: 2, baz: { hello: 'world' } });
  checkMethod('info', { foo: 1, bar: 2, baz: { hello: 'world' } });
  checkMethod('warn', { foo: 1, bar: 2, baz: { hello: 'world' } });
  checkMethod('error', { foo: 1, bar: 2, baz: { hello: 'world' }, err: new Error('test error1') });
});
