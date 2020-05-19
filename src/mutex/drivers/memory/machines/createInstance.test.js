const Machine = require('machine');
const createInstance = require('./createInstance');
const { bootstrap } = require('./../../../../');

let sdk;
let client;

beforeAll(async () => {
  sdk = await bootstrap('production', { APP_NAME: 'jest', LOG_DEBUG_ENABLE: false });
  client = await (Machine(createInstance))({ sdk });
});

describe('what a check, no need actually', () => {
  it('just a test', async () => {
    expect(client).toBeDefined();
    expect(client).toHaveProperty('getInstance');
  });

});
