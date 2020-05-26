const Machine = require('machine');
const Promise = require('bluebird');
const createInstance = require('./createInstance');
const publisherMachine = require('./publish');
const { bootstrap } = require('../../../..');

let sdk;
let client;
const publish = Machine(publisherMachine);

beforeAll(async () => {
  sdk = await bootstrap('production', { APP_NAME: 'jest', LOG_DEBUG_ENABLE: false });
  client = await Machine(createInstance)({ sdk });
});

afterAll(() => client.quit());

describe('check', () => {
  it('publish a message', () =>
    new Promise((resolve) => {
      expect.assertions(1);

      // subscriber & check
      const sub = client;
      sub.on('message', (_, message) => {
        expect(message).toBeTruthy();
      });
      sub.subscribe('a channel');

      // publisher
      const req = publish({
        client,
        sdk,
        channel: 'a channel',
        message: 'foo bar',
      }).now();

      req.then(resolve);
    }));

  it('publish 2 messages', () =>
    new Promise((resolve) => {
      expect.assertions(6);

      // subscriber & check
      let i = 0;
      const sub = client;
      sub.on('message', (_, message) => {
        expect(message).toBeTruthy();
        expect(message).toEqual(expect.stringMatching(new RegExp(i + 1, 'g')));
        i += 1;

        if (i > 1) {
          resolve();
        }
      });
      sub.subscribe('b channel');

      // publisher
      const p = (message) =>
        publish({
          client,
          sdk,
          channel: 'b channel',
          message,
        }).now();

      p('foo bar 1');
      p('foo bar 2');
    }));
});
