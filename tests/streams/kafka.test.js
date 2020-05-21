const Promise = require('bluebird');
const faker = require('faker');
const uuid = require('uuid').v4;
const bootstrap = require('./_bootstrapSdk');

jest.setTimeout(60 * 1000); // 60s
jest.useRealTimers();

let sdk;
const testId = uuid();
const generateMessage = () => faker.lorem.sentence();

// create kafka topic
const createTopic = async (channel) => {
  const log = sdk.log.child({ worker: 'create-topic' });
  const admin = sdk.stream.connection.connection.client.admin();
  await admin.connect();
  await admin.createTopics({
    waitForLeaders: true,
    topics: [{ topic: channel }],
  });
  log.trace(`topic created: ${channel}`);
  await admin.disconnect();
};

beforeAll(async () => {
  jest.useRealTimers();
  sdk = await bootstrap({
    APP_NAME: `jest-${testId}`,
    LOG_DEBUG_ENABLE: true,

    STREAM_DRIVER: 'kafka',
    STREAM_CONNECTION_STRING: 'kafka://127.0.0.1:9092/',
    STREAM_SSL_ENABLE: false,
    STREAM_FALLBACK_ENABLE: false,
  });
  await sdk.enable_stream();
});

afterEach(() => sdk.stream && sdk.disable_stream());
afterAll(() => sdk.stream && sdk.disable_stream());


describe('check creating', () => {

  it('enable stream without error', async () => {
    const streamPromise = sdk.enable_stream();
    await expect(streamPromise).resolves.toBeTruthy();

    // release stream
    await streamPromise.then((s) => s.destroy());
  });

  it('destroy stream without error', async () => {
    const stream = await sdk.enable_stream();
    await expect(stream.destroy()).resolves.not.toThrow();
  });

});

describe('pub sub', () => {

  it('publish without error', async () => {
    const channel = `test-${testId}-pub-without-error`;

    await sdk.enable_stream();

    await createTopic(channel);
    const { promise } = sdk.stream.publish({ channel, message: generateMessage() });
    await expect(promise).resolves.not.toThrow();

    await sdk.disable_stream();
  });

  it('subscribe ok', () => new Promise((resolve) => {
    const channel = uuid();

    sdk.enable_stream()
      .then(() => createTopic(channel))
      .then(() => {
        // subscriber test
        const { observable } = sdk.stream.makeObservable({ channel });
        const subscription = observable.subscribe({
          async next({ message }) {
            expect(message).toBeTruthy();
            subscription.unsubscribe();
            await sdk.disable_stream();
            resolve();
          },
        });
      })
      .then(() => Promise.delay(15000)) // -_- kafka get so long to start
      .then(() => sdk.stream.publish({ channel, message: generateMessage() }));
  }));

  it('silent from other channel', () => new Promise((resolve) => {
    const channel1 = `test-${testId}-silent-1`;
    const channel2 = `test-${testId}-silent-2`;

    let silentFn;
    sdk.enable_stream()
      .then(() => Promise.all([createTopic(channel1), createTopic(channel2)]))
      .then(async () => {
        // subscriber test
        silentFn = jest.fn();
        const { observable } = sdk.stream.makeObservable({ channel: channel1 });
        const subscription = observable.subscribe({ next: silentFn });

        // run routines
        await Promise.resolve()
          .then(() => Promise.delay(15000))
          .then(() => sdk.stream.publish({ channel: channel2, message: generateMessage() }));

        // wait if message mixed?
        Promise.delay(1000)
          .then(() => expect(silentFn).not.toHaveBeenCalled())
          .then(() => Promise.delay(2000))
          .then(() => expect(silentFn).not.toHaveBeenCalled())
          .then(() => Promise.delay(3000))
          .then(() => expect(silentFn).not.toHaveBeenCalled())
          .then(() => subscription.unsubscribe())
          .then(resolve);
      });
  }));

  it('overall', () => new Promise((resolve) => {
    const channel = `test-${testId}-overall`;
    const message = generateMessage();

    sdk.enable_stream()
      .then(() => createTopic(channel))
      .then(async () => {
        // subscriber test
        const { observable } = sdk.stream.makeObservable({ channel });
        const subscription = observable.subscribe({
          async next({ message: msg }) {
            expect(msg).toBe(message);
            subscription.unsubscribe();
            await sdk.disable_stream();
            resolve();
          },
        });

        // run routines
        await Promise.resolve()
          .then(() => Promise.delay(15000))
          .then(() => sdk.stream.publish({ channel, message }));
      });
  }));

});
