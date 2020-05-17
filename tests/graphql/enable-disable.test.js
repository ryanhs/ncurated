// const gql = require('graphql-tag');
const { bootstrap } = require('../../src');

let sdk;

beforeEach(async () => {
  sdk = await bootstrap('development', {
    APP_NAME: 'jest',
    LOG_DEBUG_ENABLE: false,
    ZIPKIN_ENABLE: false,
    ZIPKIN_DRIVER: 'none',
  });
  // await sdk.enable_stream();
});

const responseSchema = {
  type: 'object',
  properties: {
    errors: {
      items: [{
        required: ['message'],
      }],
    },
    status: {
      type: 'integer',
    },
  },
  required: [
    'errors',
    'data',
    'status',
  ],
};

describe('success', () => {

  it('enable by name', async () => {
    const mock = () => {
      // fetchMock.dontMock();
      fetchMock.doMock();
      fetchMock.mockResponses([
        JSON.stringify({
          data: {
            user: {
              id: '1',
              name: 'Leanne Graham',
              phone: '1-770-736-8031 x56222',
            },
          },
        }),
      ]);
    };

    await sdk.enable_graphql('ok', {
      uri: 'https://graphqlzero.almansi.me/api',
      remoteServiceName: 'fakeql',
    });

    const query = `
      {
        user (id: 1) {
          id
          name
          phone
        }
      }
    `;

    mock();
    const response = await sdk.graphqls.ok.query({ query, throwError: true, withCache: false });
    expect(response.data.user).toBeTruthy();
    expect(response.data.user.id).toBeTruthy();
    expect(response.data.user.name).toBeTruthy();
    expect(response.data.user.phone).toBeTruthy();
    expect(response.errors.length).toBe(0);
    expect(response).toMatchSchema(responseSchema);
    const lastLogCount = sdk.log.ringBuffer.records.length;

    mock();
    const fromCache = await sdk.graphqls.ok.query({ query, throwError: true });
    expect(response.hash).toBe(fromCache.hash);

    // new additional request, checked in log
    expect(sdk.log.ringBuffer.records.length).toBeGreaterThan(lastLogCount);
  });

  it('enable by default', async () => {
    const mock = () => {
      // fetchMock.dontMock();
      fetchMock.doMock();
      fetchMock.mockResponses([
        JSON.stringify({
          data: {
            user: {
              id: '1',
              name: 'Leanne Graham',
              phone: '1-770-736-8031 x56222',
            },
          },
        }),
      ]);
    };

    await sdk.enable_graphql({
      uri: 'https://graphqlzero.almansi.me/api',
      remoteServiceName: 'fakeql',
    });

    const query = `
      {
        user (id: 1) {
          id
          name
          phone
        }
      }
    `;

    mock();
    const response = await sdk.graphql.query({ query, throwError: true, withCache: false });
    expect(response.data.user).toBeTruthy();
    expect(response.data.user.id).toBeTruthy();
    expect(response.data.user.name).toBeTruthy();
    expect(response.data.user.phone).toBeTruthy();
    expect(response.errors.length).toBe(0);
    expect(response).toMatchSchema(responseSchema);
    const lastLogCount = sdk.log.ringBuffer.records.length;

    mock();
    const fromCache = await sdk.graphql.query({ query, throwError: true });
    expect(response.hash).toBe(fromCache.hash);

    // new additional request, checked in log
    expect(sdk.log.ringBuffer.records.length).toBeGreaterThan(lastLogCount);
  });

  it('disable by name', async () => {
    // pre test
    expect(sdk.graphqls.ok).toBeFalsy();

    // enable
    await sdk.enable_graphql('ok', {
      uri: 'https://graphqlzero.almansi.me/api',
      remoteServiceName: 'fakeql',
    });

    // test
    expect(sdk.graphqls.ok).toBeTruthy();
  });

  it('disable by default, with config', async () => {
    // pre test
    expect(sdk.graphql).toBeFalsy();

    // enable
    await sdk.enable_graphql('default', {
      uri: 'https://graphqlzero.almansi.me/api',
      remoteServiceName: 'fakeql',
    });

    // test
    expect(sdk.graphqls).toBeTruthy();
  });

  it('disable by default, direct', async () => {
    // pre test
    expect(sdk.graphql).toBeFalsy();

    // enable
    await sdk.enable_graphql({
      uri: 'https://graphqlzero.almansi.me/api',
      remoteServiceName: 'fakeql',
    });

    // test
    expect(sdk.graphqls).toBeTruthy();
  });
});
