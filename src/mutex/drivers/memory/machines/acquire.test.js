const Promise = require('bluebird');
const Machine = require('machine');
const createInstance = require('./createInstance');
const acquireInstance = require('./acquire');
const { bootstrap } = require('./../../../../');

jest.useRealTimers();
jest.setTimeout(20000);

let sdk;
let client;
let acquire;

beforeAll(async () => {
  sdk = await bootstrap('production', { APP_NAME: 'jest', LOG_DEBUG_ENABLE: false });
  client = await (Machine(createInstance))({ sdk });
  const acquireMachine = Machine(acquireInstance);
  acquire = (key) => acquireMachine({ sdk, client, key });
});

describe('just a test', () => {
  it('its working fine', async () => {
    const unlock = await acquire('a');
    expect(1).toBe(1);
    await unlock();
  });

  it('which one is the first?', async () => {
    expect.assertions(5);

    // make sure key exists;
    (await acquire('a-race'))();

    // history which worker finish first
    const finishers = [];

    const run = (id, delay) => new Promise((resolve) => {
      acquire('a-race').then((unlock) => {
        setTimeout(() => {
          const finishTag = {
            worker: id,
            time: (new Date()).toISOString(),
            timestamp: Date.now(),
            nextIn: `${(delay / 1000).toFixed(2)}s`,
          };

          sdk.log.info(finishTag);
          finishers.push(finishTag);

          expect(1).toBe(1);
          unlock().then(resolve);
        }, delay);
      });
    });

    await Promise.all([
      Promise.delay(50).then(() => run(1, 550)), // must be first
      Promise.delay(70).then(() => run(2, 1000)),
      Promise.delay(70).then(() => run(3, 1500)),
    ]);

    // check first one must be ahead of everyone
    expect(finishers[1].timestamp).toBeGreaterThan(finishers[0].timestamp + 500);
    expect(finishers[2].timestamp).toBeGreaterThan(finishers[0].timestamp + 500);
  });

});
