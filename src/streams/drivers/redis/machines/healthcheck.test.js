const Machine = require('machine');
const createInstance = require('./createInstance');
const healthcheckMachine = require('./healthcheck');
const { bootstrap } = require('../../../..');

let sdk;
let client;
const healthcheck = Machine(healthcheckMachine);

beforeAll(async () => {
  sdk = await bootstrap('production', { APP_NAME: 'jest', LOG_DEBUG_ENABLE: false });
  client = await (Machine(createInstance))({
    sdk,
    connectionString: 'redis://127.0.0.1:6379/15',
  });
});

afterAll(() => client.quit());

describe('check', () => {
  it('ok', async () => {
    await healthcheck({ sdk, client });

    expect('not error').toBe('not error');
  });
});
