const Machine = require('machine');
const createInstance = require('./createInstance');
const healthcheckMachine = require('./healthcheck');
const destroyInstanceMachine = require('./destroyInstance');
const { bootstrap } = require('../../../..');

let sdk;
let client;
const healthcheck = Machine(healthcheckMachine);
const destroy = Machine(destroyInstanceMachine);

beforeAll(async () => {
  sdk = await bootstrap('production', { APP_NAME: 'jest' });
  client = await Machine(createInstance)({
    sdk,
    connectionString: 'kafka://127.0.0.1:9092/',
  });
});

afterAll(() => destroy({ sdk, client }));

describe('check', () => {
  it('ok', async () => {
    await healthcheck({ sdk, client });

    expect('not error').toBe('not error');
  });
});
