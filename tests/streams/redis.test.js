const Promise = require('bluebird');
const faker = require('faker');
const flaverr = require('flaverr');
const uuid = require('uuid').v4;
const bootstrap = require('./_bootstrapSdk');

jest.useRealTimers();

let sdk;
const generateMessage = () => faker.lorem.sentence();

beforeAll(async () => {
  sdk = await bootstrap({
    APP_NAME: 'jest',
    // LOG_STDOUT_ENABLE: true,
    // LOG_STDOUT_LEVEL: 'trace',
    STREAM_DRIVER: 'redis',
    STREAM_CONNECTION_STRING: 'redis://localhost:6379/15',
  });
  await sdk.enable_stream();
});

afterAll(() => sdk.disable_stream());


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
    setTimeout(() => {
      sdk.stream.publish({ channel, message: 'aa' });
    }, 1000);
  }));

  it('silent from other channel', () => new Promise((resolve) => {
    const channel = uuid();

    // subscriber test
    const subscription = sdk.stream.makeObservable({ channel }).observable.subscribe({
      next() {
        subscription.unsubscribe();
        throw flaverr({ code: 'E_STREAM_CROWDED' }, new Error('crowded!'));
      },
    });

    // send something
    Promise
      .delay(250)
      .then(() => sdk.stream.publish({ channel: 'ccc', message: 'aa' }))
      .then(() => Promise.delay(250))
      .then(() => sdk.stream.publish({ channel: 'ddd', message: 'aa' }))
      .then(() => Promise.delay(250))
      .then(() => sdk.stream.publish({ channel: 'eee', message: 'aa' }))
      .then(() => Promise.delay(1000)) // wait for error if subscriber overhelmed?
      .then(() => subscription.unsubscribe())
      .then(resolve);
  }));

  it('overall test', () => new Promise((resolve) => {
    const channel = uuid();
    expect.assertions(2);


    // subscriber
    let messageCounter = 0;
    const subscription = sdk.stream.makeObservable({ channel }).observable.subscribe({
      next({ message }) {
        messageCounter += 1;
        expect(message).toBeTruthy();
        if (messageCounter === 2) {
          subscription.unsubscribe();
          resolve();
        }
      },
    });

    // publisher
    const go = () => sdk.stream.publish({ channel, message: generateMessage() }).promise;

    // run routines
    Promise.resolve()
      .then(Promise.delay(250)).then(go)
      .then(Promise.delay(250))
      .then(go)
      .then(Promise.delay(250))
      .then(go);
  }));
});
