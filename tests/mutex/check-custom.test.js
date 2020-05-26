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
  it('has "custom-mutex" memory', async () => {
    await sdk.enable_mutex('custom-mutex', {
      MUTEX_DRIVER: 'memory',
      MUTEX_CONNECTION_STRING: 'waw',
    });
    expect(sdk.mutex).toBeFalsy();
    expect(sdk.mutexes.default).toBeFalsy();
    expect(sdk.mutexes['custom-mutex']).toBeTruthy();
    expect(sdk.mutexes['custom-mutex'].connection).toBeTruthy();
    expect(Object.keys(sdk.mutexes).length).toBe(2); // + default = null
  });
});
