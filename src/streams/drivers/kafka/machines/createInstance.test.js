const Machine = require('machine');
const Promise = require('bluebird');
const faker = require('faker');
const uuid = require('uuid').v4;
const createInstance = require('./createInstance');
const { bootstrap } = require('../../../..');

let sdk;
let client;
jest.setTimeout(60 * 1000); // 60s

const testId = uuid();
const generateMessage = () => faker.lorem.sentence();

beforeAll(async () => {
  jest.useRealTimers();
  sdk = await bootstrap('production', { APP_NAME: `jest-${testId}`, LOG_DEBUG_ENABLE: false });
  client = await (Machine(createInstance))({
    sdk,
    connectionString: 'kafka://127.0.0.1:9092/',
  });
});

describe('check', () => {

  it('not null', async () => {
    expect(client).toBeTruthy();
  });

  it('pub sub', () => new Promise((resolve) => {
    expect.assertions(3);
    const topic = `test-${testId}`;
    let producer;
    let consumer;

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

      producer = client.singleton_producer;

      const go = async () => {
        const msg = generateMessage();
        log.trace(`sending: ${msg}`);
        return producer.send({
          topic,
          messages: [
            { value: msg },
          ],
        });
      };

      // run routines 3 messages
      log.trace('start publishing messages..');
      go();
      go();
      go();

      await producer.disconnect();
    };

    // consumer
    (async () => {
      const log = sdk.log.child({ worker: 'consumer' });

      await createTopic();

      consumer = client.consumer({ groupId: 'my-group' });
      await consumer.connect();
      await consumer.subscribe({ topic });

      log.trace('start subscribing messages..');
      let msgCount = 0;
      await consumer.run({
        eachMessage: async ({ message }) => {
          expect(message).toBeTruthy();
          log.trace('received a message', { message: message.value.toString() });
          msgCount += 1;

          // quit on 3 messages reached
          if (msgCount >= 3) {
            await producer.disconnect();
            await consumer.disconnect();
            resolve();
          }
        },
      });

      startPublishing();
    })();

  }));
});
