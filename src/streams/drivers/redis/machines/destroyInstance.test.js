const Machine = require('machine');
const createInstance = require('./createInstance');
const destroyInstance = require('./destroyInstance');
const { bootstrap } = require('../../../..');

let sdk;
let client;
const destroy = Machine(destroyInstance);

beforeAll(async () => {
  sdk = await bootstrap('production', { APP_NAME: 'jest', LOG_DEBUG_ENABLE: false });
  client = await Machine(createInstance)({
    sdk,
    connectionString: 'redis://127.0.0.1:6379/15',
  });
});

describe('check', () => {
  it('ok', async () => {
    await destroy({ sdk, client });

    expect('not error').toBe('not error');
  });
});
