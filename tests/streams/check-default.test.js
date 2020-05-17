const bootstrap = require('./_bootstrapSdk');

let sdk;
beforeAll(async () => {
  sdk = await bootstrap({
    APP_NAME: 'jest',
    // LOG_DEBUG_ENABLE: true,
    STREAM_DRIVER: 'redis-mock',
    STREAM_CONNECTION_STRING: 'redis://localhost:6379/1',
  });
});

afterAll(() => jest.clearAllTimers());

describe('check', () => {

  it('has defaults', async () => {
    await sdk.enable_stream();
    expect(sdk.stream).toBeTruthy();
    expect(sdk.streams.default).toBeTruthy();
    expect(Object.keys(sdk.streams).length).toBe(1);
  });

});
