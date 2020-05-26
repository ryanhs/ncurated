// const Promise = require('bluebird');
const Machine = require('machine');
const uuid = require('uuid').v4;
const faker = require('faker');
const createInstance = require('./createInstance');
const destroyInstanceMachine = require('./destroyInstance');
const publisherMachine = require('./publish');
const { bootstrap } = require('../../../..');

jest.setTimeout(60 * 1000); // 60s

let sdk;
let client;
const testId = uuid();
const destroy = Machine(destroyInstanceMachine);
const publish = Machine(publisherMachine);
const generateMessage = () => faker.lorem.sentence();

beforeAll(async () => {
  jest.useRealTimers();
  sdk = await bootstrap('production', { APP_NAME: `jest-${testId}`, LOG_DEBUG_ENABLE: false });
  client = await Machine(createInstance)({
    sdk,
    connectionString: 'kafka://127.0.0.1:9092/',
  });
});

afterAll(() => destroy({ sdk, client }));

describe('check', () => {
  it('publish message', async () => {
    expect.assertions(3 + 1);
    const topic = `test-${testId}`;

    // create topic
    const createTopic = async () => {
      const log = sdk.log.child({ worker: 'create-topic' });
      const admin = client.admin();
      await admin.connect();
      await admin.createTopics({
        waitForLeaders: true,
        topics: [{ topic }],
      });
      log.trace(`topic created: ${topic}`);
      await admin.disconnect();
    };

    // producer
    const startPublishing = async () => {
      const log = sdk.log.child({ worker: 'producer' });
      const go = async () => {
        const message = generateMessage();
        log.trace('sending', { message: `${message.substr(0, 10)}...` });

        const req = publish({
          client,
          sdk,
          channel: topic,
          message,
        }).now();
        await expect(req).resolves.not.toThrow();
      };

      // run routines 3 messages
      log.trace('start publishing messages..');
      await go();
      await go();
      await go();
    };

    await expect(createTopic().then(startPublishing)).resolves.not.toThrow();
  });
});
