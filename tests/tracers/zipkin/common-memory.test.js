const Promise = require('bluebird');
const { bootstrap: bootstrapSdk } = require('../../../src');

let sdk;
jest.setTimeout(60 * 1000); // 60s
jest.useRealTimers();

beforeEach(async () => {
  sdk = await bootstrapSdk('production', {
    APP_NAME: 'jest',
    LOG_RINGBUFFER_ENABLE: true,
    LOG_RINGBUFFER_LEVEL: 'trace',
    LOG_RINGBUFFER_LIMIT: 100,
    ZIPKIN_ENABLE: true,
    ZIPKIN_DRIVER: 'none',
  });
});

describe('check', () => {
  it('local process: static', async () => {
    expect(sdk.zipkinTracer.local('static int 1', () => 1)).toBe(1);
    expect(sdk.zipkinTracer.local('static int 2', () => 2)).toBe(2);

    const spansLength = sdk.log.ringBuffer.records.filter(({ log }) => log === 'zipkin-span').length;
    expect(spansLength).toBe(2);
  });

  it('local process: promise ', async () => {
    await expect(sdk.zipkinTracer.local('promise int 1', () => Promise.delay(200, 1))).resolves.toBe(1);
    await expect(sdk.zipkinTracer.local('promise int 2', () => Promise.delay(200, 2))).resolves.toBe(2);

    const spansLength = sdk.log.ringBuffer.records.filter(({ log }) => log === 'zipkin-span').length;
    expect(spansLength).toBe(2);
  });
});
