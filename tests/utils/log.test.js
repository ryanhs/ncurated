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
    it(`it produce to ringBuffer when put level: ${method}`, async () => {
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
