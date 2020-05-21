const Promise = require('bluebird');
const uuid = require('uuid').v4;
const bootstrap = require('./_bootstrapSdk');

jest.useRealTimers();
jest.setTimeout(5000);
let sdk;

beforeAll(async () => {
  sdk = await bootstrap({
    APP_NAME: 'jest',
    LOG_DEBUG_ENABLE: true,
    MUTEX_DRIVER: 'memory',
    MUTEX_CONNECTION_STRING: 'memory-as-default',
  });
});

afterAll(() => jest.clearAllTimers());

beforeEach(() => sdk.enableMutex())
afterEach(() => sdk.disableMutex())

describe('check', () => {

  it(`not overlap in random order`, async () => {
    const mutexKey = uuid();

    const now = Date.now();

    const run = async (workerId, workDuration, shouldRunAfter) => {
      const createdAt = Date.now();
      const unlock = await sdk.mutex.acquire({ key: mutexKey });
      sdk.log.trace(`#${workerId} createdAt: ${new Date(createdAt).toISOString()}`);

      const startedAt = Date.now();
      await Promise.delay(workDuration);
      sdk.log.trace(`#${workerId} startAt: ${new Date(startedAt).toISOString()}`);

      await unlock();
      const finishedAt = Date.now();
      sdk.log.trace(`#${workerId} finishedAt: ${new Date(finishedAt).toISOString()}`);

      // expect this in order
      expect(createdAt).toBeGreaterThan(now);
      expect(startedAt).toBeGreaterThan(createdAt);
      expect(finishedAt).toBeGreaterThanOrEqual(startedAt + workDuration);

      // expect before
      expect(startedAt).toBeGreaterThan(now + shouldRunAfter);

      return ({
        createdAt,
        startedAt,
        finishedAt,
      })
    }

    // mutex not run in order, then we only make sure if its run after certain time
    await Promise.all([

      // #1 batch
      // called At                      id   run in (ms)    startedAt should be >=
      Promise.delay(   1).then(() => run('1.1',    300,                  0)),
      // Promise.delay( 100).then(() => run('1.2',    200,                300)),
      // Promise.delay( 200).then(() => run('1.3',    200,                300)),


      // #1 batch
      // called At                      id   run in (ms)    startedAt should be >=
      // Promise.delay( 800).then(() => run('2.1',    200,                800)),
      // Promise.delay( 900).then(() => run('2.2',    200,                800)),
      // Promise.delay(1000).then(() => run('2.3',    200,                800)),
    ])
  });

});
