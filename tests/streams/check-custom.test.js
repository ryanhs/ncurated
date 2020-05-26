const bootstrap = require('./_bootstrapSdk');

let sdk;
beforeAll(async () => {
  sdk = await bootstrap({
    APP_NAME: 'jest',
    // LOG_DEBUG_ENABLE: true,
  });
});

afterAll(() => jest.clearAllTimers());

describe('check custom', () => {
  it('has "custom"', async () => {
    await sdk.enable_stream('custom', {
      STREAM_DRIVER: 'redis-mock',
      STREAM_CONNECTION_STRING: 'redis://localhost:6379/1',
    });
    expect(sdk.stream).toBeFalsy();
    expect(sdk.streams.default).toBeFalsy();
    expect(sdk.streams.custom).toBeTruthy();
    expect(sdk.streams.custom.connection).toBeTruthy();
    expect(Object.keys(sdk.streams).length).toBe(2); // + default = null
  });
});
