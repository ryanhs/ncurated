const gql = require('graphql-tag');
const { bootstrap } = require('../../src');

let sdk;

beforeAll(async () => {
  sdk = await bootstrap('development', {
    APP_NAME: 'jest',
    LOG_DEBUG_ENABLE: false,
    ZIPKIN_ENABLE: true,
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

  it('success query', async () => {
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

  it('success query with default mode', async () => {
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
    const fromCache = await sdk.graphqls.ok.query({ query, throwError: true });
    expect(response.hash).toBe(fromCache.hash);

    // new additional request, checked in log
    expect(sdk.log.ringBuffer.records.length).toBeGreaterThan(lastLogCount);
  });

  it('success query with cache', async () => {
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
    const response = await sdk.graphqls.ok.query({ query, throwError: true, withCache: true });
    expect(response.data.user).toBeTruthy();
    expect(response.data.user.id).toBeTruthy();
    expect(response.data.user.name).toBeTruthy();
    expect(response.data.user.phone).toBeTruthy();
    expect(response.errors.length).toBe(0);
    expect(response).toMatchSchema(responseSchema);
    const lastLogCount = sdk.log.ringBuffer.records.length;

    // no mock because of cache!
    const fromCache = await sdk.graphqls.ok.query({ query, throwError: true, withCache: true });
    expect(response.hash).toBe(fromCache.hash);

    // no additional request, checked in log
    expect(sdk.log.ringBuffer.records.length).toBe(lastLogCount);
  });

  it('success mutation', async () => {
    const mock = () => {
      // fetchMock.dontMock();
      fetchMock.doMock();
      fetchMock.mockResponses([
        JSON.stringify({
          data: {
            post: {
              id: '26',
              title: 'A Very Captivating Post Title',
            },
          },
        }),
      ]);
    };

    await sdk.enable_graphql('ok', {
      uri: 'https://graphqlzero.almansi.me/api',
      remoteServiceName: 'fakeql',
    });

    const mutation = gql`
      mutation ( $input: CreatePostInput!) {
        post: createPost(input: $input) {
          id
          title
        }
      }
    `;

    const variables = {
      input: {
        user_id: 1,
        date: '2020-05-12T17:10:05.567Z',
        title: 'A Very Captivating Post Title',
      },
    };

    mock();
    const response = await sdk.graphqls.ok.mutate({
      mutation,
      variables,
      throwError: true,
    });
    expect(response.data.post).toBeTruthy();
    expect(response.data.post.id).toBeTruthy();
    expect(response.data.post.title).toBeTruthy();
    expect(response.errors.length).toBe(0);
    expect(response).toMatchSchema(responseSchema);
  });
});
