const bootstrap = require('./_bootstrapSdk');

let sdk;
beforeAll(async () => {
  sdk = await bootstrap({
    APP_NAME: 'jest',
    // LOG_DEBUG_ENABLE: true,
    MUTEX_DRIVER: 'memory',
    MUTEX_CONNECTION_STRING: 'memory-as-default',
  });
});

afterAll(() => jest.clearAllTimers());

describe('check', () => {

  it('has memory has defaults', async () => {
    await sdk.enable_mutex();
    expect(sdk.mutex).toBeTruthy();
    expect(sdk.mutexes.default).toBeTruthy();
    expect(Object.keys(sdk.mutexes).length).toBe(1);
  });

});
