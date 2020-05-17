const Machine = require('machine');
const Promise = require('bluebird');
const faker = require('faker');
const createInstance = require('./createInstance');
const makeObservableMachine = require('./makeObservable');
const publisherMachine = require('./publish');
const { bootstrap } = require('../../../..');

jest.useRealTimers();

let sdk;
let client;
const publish = Machine(publisherMachine);
const makeObservable = Machine(makeObservableMachine);

beforeAll(async () => {
  sdk = await bootstrap('production', { APP_NAME: 'jest', LOG_DEBUG_ENABLE: false });
  client = await (Machine(createInstance))({
    sdk,
    connectionString: 'redis://127.0.0.1:6379/15',
  });
});

afterAll(() => client.quit());

describe('check', () => {
  it('subscribe messages', () => new Promise((resolve) => {
    // expect.assertions(3);
    const channel = 'a channel';
    const generateMessage = () => faker.lorem.sentence();

    let messageCounter = 0;
    const subscription = makeObservable({ client, sdk, channel }).now().observable.subscribe({
      next({ message }) {
        messageCounter += 1;
        expect(message).toBeTruthy();
        if (messageCounter === 3) {
          subscription.unsubscribe();
          resolve();
        }
      },
    });

    // publisher
    const go = () => publish({
      client, sdk, channel, message: generateMessage(),
    }).now().promise;

    // run routines
    Promise.delay(250).then(go);
    Promise.delay(250).then(go);
    Promise.delay(250).then(go);
  }));
});
