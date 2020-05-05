const { parseConfig, envBoolean } = require('../../src/utils/config');

describe('check environment config', () => {
  it("parse envBoolean correctly", () => {
    expect(envBoolean("true")).toBe(true)
    expect(envBoolean(true)).toBe(true);
    expect(envBoolean(false)).toBe(false);
    expect(envBoolean("false")).toBe(false);
  })

  it('do SDK_* overrides', async () => {
    process.env.SDK_APP_NAME = 'overrided';
    process.env.SDK_APP_LOGO_PRINT = false;
    process.env.SDK_LOG_DEBUG_ENABLE = false;
    process.env.SDK_CACHE_MEMORY_ENABLE = false;
    process.env.SDK_STREAM_DRIVER = 'kafka';
    process.env.SDK_STREAM_CONNECTION_STRING = 'kafka://127.0.0.1:9092/';
    process.env.SDK_STREAM_SSL_ENABLE = false;
    process.env.SDK_STREAM_FALLBACK_ENABLE = false;

    const appName = 'overrided again! by app level';
    const config = await parseConfig('development', { APP_NAME: appName }, true);

    // same as overrides
    expect(`${config.APP_LOGO_PRINT}`).toBe(process.env.SDK_APP_LOGO_PRINT);
    expect(`${config.LOG_DEBUG_ENABLE}`).toBe(process.env.SDK_LOG_DEBUG_ENABLE);
    expect(`${config.CACHE_MEMORY_ENABLE}`).toBe(process.env.SDK_CACHE_MEMORY_ENABLE);
    expect(`${config.STREAM_DRIVER}`).toBe(process.env.SDK_STREAM_DRIVER);
    expect(`${config.STREAM_CONNECTION_STRING}`).toBe(process.env.SDK_STREAM_CONNECTION_STRING);
    expect(`${config.STREAM_SSL_ENABLE}`).toBe(process.env.SDK_STREAM_SSL_ENABLE);
    expect(`${config.STREAM_FALLBACK_ENABLE}`).toBe(process.env.SDK_STREAM_FALLBACK_ENABLE);

    // overrides again APP_NAME
    expect(config.APP_NAME).toBe(appName);
  });

  it('just parse, without config, should be (production, {}, true)', async () => {
    process.env.SDK_APP_NAME = 'overrided';
    process.env.SDK_APP_LOGO_PRINT = false;
    process.env.SDK_LOG_DEBUG_ENABLE = false;
    process.env.SDK_CACHE_MEMORY_ENABLE = false;
    process.env.SDK_STREAM_DRIVER = 'kafka';
    process.env.SDK_STREAM_CONNECTION_STRING = 'kafka://127.0.0.1:9092/';
    process.env.SDK_STREAM_SSL_ENABLE = false;
    process.env.SDK_STREAM_FALLBACK_ENABLE = false;

    const appName = 'overrided again! by app level';
    const config = await parseConfig();

    // same as overrides
    expect(`${config.APP_LOGO_PRINT}`).toBe(process.env.SDK_APP_LOGO_PRINT);
    expect(`${config.LOG_DEBUG_ENABLE}`).toBe(process.env.SDK_LOG_DEBUG_ENABLE);
    expect(`${config.CACHE_MEMORY_ENABLE}`).toBe(process.env.SDK_CACHE_MEMORY_ENABLE);
    expect(`${config.STREAM_DRIVER}`).toBe(process.env.SDK_STREAM_DRIVER);
    expect(`${config.STREAM_CONNECTION_STRING}`).toBe(process.env.SDK_STREAM_CONNECTION_STRING);
    expect(`${config.STREAM_SSL_ENABLE}`).toBe(process.env.SDK_STREAM_SSL_ENABLE);
    expect(`${config.STREAM_FALLBACK_ENABLE}`).toBe(process.env.SDK_STREAM_FALLBACK_ENABLE);

    // overrides again APP_NAME
    expect(config.APP_NAME).toBe('overrided');
  });

  it('do inline overrides', async () => {
    // clear process.env
    process.env = Object.keys(process.env).filter((v) => v.indexOf('SDK_') === -1);

    const overrides = {
      APP_NAME: 'dadang',
      STREAM_CONNECTION_STRING: 'kafka://127.0.0.1:9092/',
      STREAM_SSL_ENABLE: true,
    };

    const config = await parseConfig('development', overrides);
    expect(config).toMatchObject(overrides);
  });

  it('get defaultConfigs', async () => {
    // clear process.env
    process.env = Object.keys(process.env).filter((v) => v.indexOf('SDK_') === -1);

    const config = await parseConfig('development', {}, true);
    expect(config.APP_NAME).toBe('UnnamedApp');
  });

  it('use env FALSE', async () => {
    // clear process.env
    process.env = Object.keys(process.env).filter((v) => v.indexOf('SDK_') === -1);

    // override name, will not affected
    process.env.SDK_APP_NAME = 'overrided';

    const config = await parseConfig('development', {}, false);
    expect(config.APP_NAME).toBe('UnnamedApp');
  });
});
