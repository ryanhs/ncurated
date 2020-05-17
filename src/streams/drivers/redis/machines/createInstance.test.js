const Machine = require('machine');
// const Promise = require('bluebird');
const createInstance = require('./createInstance');
const { bootstrap } = require('../../../..');

let sdk;
let client;

beforeAll(async () => {
  sdk = await bootstrap('production', { APP_NAME: 'jest', LOG_DEBUG_ENABLE: false });
  client = await (Machine(createInstance))({
    sdk,
    connectionString: 'redis://127.0.0.1:6379/15',
  });
});

afterAll(() => client.quit());

describe('check', () => {

  it('not null', async () => expect(client).toBeTruthy());

  it('ping', async () => {
    const ping = client.pingAsync();

    await expect(ping).resolves.not.toThrow();
    await expect(ping).resolves.toBe('PONG');
  });
});
