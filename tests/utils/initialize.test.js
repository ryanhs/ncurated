const faker = require('faker');
const { bootstrap, getInstance } = require('../../src');

describe('check initialize sdk', () => {
  it('bootstrap', async () => {
    const sdk = await bootstrap();
    expect(sdk.configs.APP_NAME).toBe('UnnamedApp');
  });

  it('print logo & check log', async () => {
    const sdk = await bootstrap('development');
    const logo = sdk.logoPrint();

    // one of the msg must be logo
    expect(sdk.log.ringBuffer.records.map((v) => v.msg)).toContain(logo);
  });

  it('check cache', async () => {
    const sdk = await bootstrap('development');
    const uuid = faker.random.uuid();
    await sdk.cache.set(uuid, uuid);
    return expect(sdk.cache.get(uuid)).resolves.toBe(uuid);
  });

  it('check getInstance return same instance', async () => {
    const uuid = faker.random.uuid();

    // overwriteGlobal = true
    const sdk = await bootstrap('development', { APP_NAME: uuid }, true, true);

    // same
    expect(sdk.configs.APP_NAME).toBe(uuid);
    expect(getInstance().configs.APP_NAME).toBe(uuid);
  });

  it('check bootstrap 2 instances, its not identical', async () => {
    const sdk1 = await bootstrap('development', { APP_NAME: 'first' });
    const sdk2 = await bootstrap('development', { APP_NAME: 'second' });

    // same
    expect(sdk1.configs.APP_NAME).toBe('first');
    expect(sdk2.configs.APP_NAME).toBe('second');
  });

});
