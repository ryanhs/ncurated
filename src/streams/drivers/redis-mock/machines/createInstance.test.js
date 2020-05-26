const Machine = require('machine');
const Promise = require('bluebird');
const createInstance = require('./createInstance');
const { bootstrap } = require('../../../..');

let sdk;
let client;

beforeAll(async () => {
  sdk = await bootstrap('production', { APP_NAME: 'jest', LOG_DEBUG_ENABLE: false });
  client = await Machine(createInstance)({ sdk });
});

afterAll(() => client.quit());

describe('check', () => {
  it('not null', async () => {
    expect(client).toBeTruthy();
  });

  it('pub sub', () =>
    new Promise((resolve) => {
      expect.assertions(3);

      const pub = client;
      const sub = client;

      sub.on('subscribe', () => {
        pub.publish('a nice channel', 'I am sending a message.');
        pub.publish('a nice channel', 'I am sending a second message.');
        pub.publish('a nice channel', 'I am sending my last message.');
      });

      let msgCount = 0;
      sub.on('message', (_, message) => {
        expect(message).toBeTruthy();
        msgCount += 1;

        // quit on 3 messages reached
        if (msgCount === 3) resolve();
      });

      sub.subscribe('a nice channel');
    }));
});
