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
    ZIPKIN_DRIVER: 'http',
  });
});

describe('check http transport', () => {
  it('local process: static', async () => {
    fetch.resetMocks();
    fetch.doMock();

    await sdk.zipkinTracer.local('static int 1', () => 1);

    // have span
    await Promise.delay(1000);
    expect(fetch.mock.calls).toHaveLength(1);

    // check span
    const spanLogs = JSON.parse(fetch.mock.calls[0][1].body);
    expect(spanLogs).toHaveLength(1);
    expect(spanLogs[0]).toMatchObject({
      name: 'static int 1',
    });

    fetch.dontMock();
  });
});
