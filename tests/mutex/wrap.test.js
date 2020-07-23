const Promise = require('bluebird');
const uuid = require('uuid').v4;

const bootstrap = require('./_bootstrapSdk');

jest.useRealTimers();
jest.setTimeout(500000);
let sdk;

beforeAll(async () => {
  sdk = await bootstrap({
    APP_NAME: 'jest',
    LOG_DEBUG_ENABLE: true,
    MUTEX_DRIVER: 'memory',
  });
  await sdk.enable_mutex();
});

afterAll(() => jest.clearAllTimers());

describe('check wrap returns', () => {
  it('wrap mutex ok on resolves', async () => {
    await expect(sdk.mutex.wrap({ key: 'trx' }, () => 1)).resolves.not.toThrow();
  });

  it('wrap mutex ok on rejects', async () => {
    await expect(
      sdk.mutex.wrap({ key: 'trx' }, () => {
        throw new Error('aha');
      }),
    ).rejects.toThrow(/aha/);
  });
});

describe('check wrap no race', () => {
  it('no races', async () => {
    const mutexKey = uuid();

    const beforeAllAt = Date.now();
    const loggerTable = [];

    const run = async (workerId, workDuration, shouldRunAfter) => {
      const createdAt = Date.now();
      let startedAt;
      let finishedAt;

      await sdk.mutex.wrap({ key: mutexKey }, async () => {
        startedAt = Date.now();
        await Promise.delay(workDuration);
        loggerTable.push({
          workerId,
          waitInSeconds: workDuration / 1000,
          startedAt: new Date(startedAt).toISOString().split('T')[1],
          shouldRunAfter: new Date(beforeAllAt + shouldRunAfter).toISOString().split('T')[1],
        });
        finishedAt = Date.now();
      });

      // its ok?
      expect(createdAt).toBeGreaterThan(beforeAllAt);
      expect(startedAt).toBeGreaterThan(beforeAllAt);
      expect(finishedAt).toBeGreaterThan(beforeAllAt);

      // timer in order
      expect(startedAt).toBeGreaterThan(createdAt);
      expect(finishedAt).toBeGreaterThan(startedAt);

      // outside timer
      expect(startedAt).toBeGreaterThanOrEqual(beforeAllAt + shouldRunAfter);

      return {
        createdAt,
        startedAt,
        finishedAt,
      };
    };

    // mutex not run in order, then we only make sure if its run after certain time
    await Promise.all([
      // #1 batch
      // called At                      id   run in (ms)    startedAt should be >=
      Promise.delay(1).then(() => run('1.1', 2000, 1)),
      Promise.delay(1000).then(() => run('1.2', 2000, 2000)), // batch #1.2 will be randomly assigned
      Promise.delay(2000).then(() => run('1.3', 2000, 2000)), // batch #1.2 will be randomly assigned

      // #3 batch
      // called At                      id   run in (ms)    startedAt should be >=
      Promise.delay(8000).then(() => run('2.1', 2000, 8000)),
      Promise.delay(9000).then(() => run('2.2', 2000, 9000)),
      Promise.delay(10000).then(() => run('2.3', 2000, 9000)),
    ]);

    // console.table(loggerTable)
  });
});
