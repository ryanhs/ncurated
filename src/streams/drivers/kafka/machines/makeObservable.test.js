const Machine = require('machine');
const Promise = require('bluebird');
const faker = require('faker');
const uuid = require('uuid').v4;
const createInstance = require('./createInstance');
const makeObservableMachine = require('./makeObservable');
const destroyInstanceMachine = require('./destroyInstance');
const publisherMachine = require('./publish');
const { bootstrap } = require('../../../..');

jest.setTimeout(60 * 1000); // 60s
jest.useRealTimers();

let sdk;
let client;
const testId = uuid();
const publish = Machine(publisherMachine);
const destroy = Machine(destroyInstanceMachine);
const makeObservable = Machine(makeObservableMachine);
const generateMessage = () => faker.lorem.sentence();

beforeAll(async () => {
  jest.useRealTimers();
  sdk = await bootstrap('production', { APP_NAME: `jest-${testId}`, LOG_DEBUG_ENABLE: false });
  client = await (Machine(createInstance))({
    sdk,
    connectionString: 'kafka://127.0.0.1:9092/',
  });
});

afterAll(() => destroy({ sdk, client }));

// publisher
const sendSomething = (channel) => publish({
  client, sdk, channel, message: generateMessage(),
  // client, sdk, channel, message: generateMessage(),
}).now().promise;

// create topic
const createTopic = async (channel) => {
  const log = sdk.log.child({ worker: 'create-topic' });
  const admin = client.admin();
  await admin.connect();
  await admin.createTopics({
    waitForLeaders: true,
    topics: [{ topic: channel }],
  });
  log.trace(`topic created: ${channel}`);
  await admin.disconnect();
};


describe('check', () => {

  it('able to subscribe', () => {
    const channel = `test-${testId}`;
    return createTopic(channel)
      .then(() => new Promise((resolve) => {
        const log = sdk.log.child({ worker: 'testing' });

        let messageCounter = 0;
        const { observable } = makeObservable({ client, sdk, channel }).now();
        const subscription = observable.subscribe({
          next({ message }) {
            messageCounter += 1;
            expect(message).toBeTruthy();
            log.trace('received!', { message: `${message.substr(0, 10)}...` });

            if (messageCounter === 3) {
              subscription.unsubscribe();
              resolve();
            }

          },
        });

        // test sent
        Promise.delay(5205).then(() => sendSomething(channel));
        Promise.delay(5405).then(() => sendSomething(channel));
        Promise.delay(5605).then(() => sendSomething(channel));
        Promise.delay(5805).then(() => sendSomething(channel));

      }));
  });


  it('not mixed channel', () => {
    const channel1 = `test-${testId}-crowd1`;
    const channel2 = `test-${testId}-crowd2`;
    return Promise.all([createTopic(channel1), createTopic(channel2)])
      .then(async () => {
        // const log = sdk.log.child({ worker: 'testing' });

        // im not listening to anything
        const next = jest.fn();
        const s = makeObservable({ client, sdk, channel: channel2 })
          .now()
          .observable
          .subscribe({ next });

        // send to channel1
        await Promise.delay(25).then(() => sendSomething(channel1));
        await Promise.delay(25).then(() => sendSomething(channel1));
        await Promise.delay(1000);
        await Promise.delay(2000);
        await Promise.delay(3000);
        expect(next).not.toHaveBeenCalled();
        s.unsubscribe();
      });
  });

  it('fromBeginning ok', async () => {
    const channelFromBegining = `test-${testId}-frombeginning`;

    // send 3 messages
    await sendSomething(channelFromBegining);
    await sendSomething(channelFromBegining);
    await sendSomething(channelFromBegining);

    // const messageCounter = 0;
    const { observable } = makeObservable({
      client,
      sdk,
      channel: channelFromBegining,
      fromBeginning: true,
    })
      .now();

    return new Promise((resolve) => {
      const log = sdk.log.child({ worker: 'fromBeginning' });

      let messageCounter = 0;
      const subscription = observable.subscribe({
        next({ offset, message }) {
          messageCounter += 1;
          expect(message).toBeTruthy();
          log.trace('received!', { message: `${message.substr(0, 10)}...`, offset });
          if (messageCounter === 3) {
            subscription.unsubscribe();
            resolve();
          }
        },
      });
    });
  });

  it('from offset', async () => {
    const channelFromOffset = `test-${testId}-offset`;

    // send 5 messages
    await sendSomething(channelFromOffset);
    await sendSomething(channelFromOffset);
    await sendSomething(channelFromOffset);
    await sendSomething(channelFromOffset);
    await sendSomething(channelFromOffset);

    let messageCounter = 0;
    const { observable } = makeObservable({
      client,
      sdk,
      channel: channelFromOffset,
      offset: 2, // from 2
    }).now();

    return new Promise((resolve) => {
      const log = sdk.log.child({ worker: 'offset' });

      const subscription = observable.subscribe({
        next({ offset, message }) {
          messageCounter += 1;
          expect(message).toBeTruthy();
          log.trace('received!', { message: `${message.substr(0, 10)}...`, offset });
          if (messageCounter === 3) {
            subscription.unsubscribe();
            resolve();
          }
        },
      });
    });
  });

});
