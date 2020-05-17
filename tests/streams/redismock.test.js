const Promise = require('bluebird');
const faker = require('faker');
const flaverr = require('flaverr');
const uuid = require('uuid').v4;
const bootstrap = require('./_bootstrapSdk');

// jest.useRealTimers();
jest.useFakeTimers();

let sdk;
const generateMessage = () => faker.lorem.sentence();

beforeAll(async () => {
  sdk = await bootstrap({
    APP_NAME: 'jest',
    // LOG_STDOUT_ENABLE: true,
    // LOG_STDOUT_LEVEL: 'trace',
    STREAM_DRIVER: 'redis-mock',
    STREAM_CONNECTION_STRING: 'redis://localhost:6379/1',
    STREAM_SSL_ENABLE: false,
    STREAM_FALLBACK_ENABLE: false,
  });
  await sdk.enable_stream();
});

afterAll(() => sdk.disable_stream() && jest.clearAllTimers());


describe('check', () => {

  it('publish without error', async () => {
    await sdk.stream.publish({ channel: uuid(), message: 'aa' }).promise;
  });

  it('subscribe ok', () => new Promise((resolve) => {
    const channel = uuid();

    // subscriber test
    const subscription = sdk.stream.makeObservable({ channel }).observable.subscribe({
      next({ message }) {
        expect(message).toBeTruthy();
        subscription.unsubscribe();
        resolve();
      },
    });

    // send something
    sdk.stream.publish({ channel, message: 'aa' });
  }));

  it('silent from other channel', () => new Promise((resolve) => {
    // subscriber test
    const subscription = sdk.stream.makeObservable({ channel: uuid() }).observable.subscribe({
      next() {
        subscription.unsubscribe();
        throw flaverr({ code: 'E_STREAM_CROWDED' }, new Error('crowded!'));
      },
    });

    // send something
    (async () => {
      await sdk.stream.publish({ channel: 'bbb', message: 'aa' });
      await sdk.stream.publish({ channel: 'ccc', message: 'aa' });
      await sdk.stream.publish({ channel: 'ddd', message: 'aa' });
      await sdk.stream.publish({ channel: 'eee', message: 'aa' });
      await sdk.stream.publish({ channel: 'ccc', message: 'aa' });
      resolve();
    })();

  }));

  it('overall test', () => new Promise((resolve) => {
    expect.assertions(3);

    const channel = uuid();

    // subscriber
    let messageCounter = 0;
    const subscription = sdk.stream.makeObservable({ channel }).observable.subscribe({
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
    const go = () => {
      const message = generateMessage();
      sdk.log.trace('sending...', { message });
      return sdk.stream.publish({ channel, message }).promise;
    };

    // run routines
    Promise.delay(25).then(go);
    jest.advanceTimersByTime(150);

    Promise.delay(25).then(go);
    jest.advanceTimersByTime(150);

    Promise.delay(25).then(go);
    jest.advanceTimersByTime(150);
  }));
});
