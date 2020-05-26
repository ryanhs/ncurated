const connectStream = require('./connect');
const { bootstrap } = require('..');

let sdk;

beforeAll(async () => {
  jest.useRealTimers();
  sdk = await bootstrap('production', { APP_NAME: 'jest', LOG_DEBUG_ENABLE: false });
});

describe('test invalid', () => {
  test('supply invalid driver fails with an error', async () => {
    const stream = connectStream({ configs: { STREAM_DRIVER: 'somethingInvalid' }, sdk });
    await expect(stream).rejects.toThrow(/invalid/);
  });
});

describe('test create & destroy', () => {
  test('redismock create', async () => {
    const stream = connectStream({ configs: { STREAM_DRIVER: 'redis-mock' }, sdk });
    await expect(stream).resolves.toBeTruthy();
  });

  test('redismock destroy', async () => {
    const stream = await connectStream({ configs: { STREAM_DRIVER: 'redis-mock' }, sdk });
    await expect(stream.destroy()).resolves.not.toThrow();
  });
});
