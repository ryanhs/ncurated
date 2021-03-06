const Machine = require('machine');
const createInstance = require('./createInstance');
const { bootstrap } = require('../../../..');

let sdk;
let client;

beforeAll(async () => {
  sdk = await bootstrap('production', {
    APP_NAME: 'jest',
    LOG_DEBUG_ENABLE: false,
    MUTEX_DRIVER: 'redis',
    MUTEX_CONNECTION_STRING: 'redis://localhost:6379/0',
  });
  client = await Machine(createInstance)({ sdk });
});

afterAll(() => client && client.redlock.quit());

describe('what a check, no need actually', () => {
  it('just a test', async () => {
    expect(client).toBeDefined();
    expect(client).toHaveProperty('isHealthy');
    expect(client).toHaveProperty('redisClient');
    expect(client).toHaveProperty('redlock');
  });
});
