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

describe('check with throwError: false', () => {

  it('error on graphql', async () => {
    await sdk.enable_graphql('default', {
      uri: 'https://fakeql.com/graphql/4e71d3354872265c9d42f69859d2ef14',
      // uri: "http://meunang.com",
      // uri: "https://jsonplaceholder.typicode.com/users",
      remoteServiceName: 'fakeql',
    });

    const query = gql`
      {
        user (id: 134123) {
          id
          firstname
          age
        }
      }
    `;

    const response = await sdk.graphql.query({ query, throwError: false });
    expect(Array.isArray(response.errors)).toBeTruthy();
    expect(response.errors.length).toBeGreaterThan(0);
    expect(response).toMatchSchema(responseSchema);
  });

  it('error on parsing', async () => {
    await sdk.enable_graphql('default', {
      // uri: 'https://fakeql.com/graphql/4e71d3354872265c9d42f69859d2ef14',
      uri: 'http://meunang.com',
      // uri: "https://jsonplaceholder.typicode.com/users",
      remoteServiceName: 'meunang',
    });

    const query = gql`
      {
        user (id: 134123) {
          id
          firstname
          age
        }
      }
    `;

    const response = await sdk.graphql.query({ query, throwError: false });
    expect(Array.isArray(response.errors)).toBeTruthy();
    expect(response.errors.length).toBeGreaterThan(0);
    expect(response).toMatchSchema(responseSchema);
  });

  it('error on networkError: 1', async () => {
    await sdk.enable_graphql('default', {
      // uri: 'https://fakeql.com/graphql/4e71d3354872265c9d42f69859d2ef14',
      // uri: "http://meunang.com",
      uri: 'https://jsonplaceholder.typicode.com/users',
      remoteServiceName: 'jsonplaceholder',
    });

    const query = gql`
      {
        user (id: 134123) {
          id
          firstname
          age
        }
      }
    `;

    const response = await sdk.graphql.query({ query, throwError: false });
    expect(Array.isArray(response.errors)).toBeTruthy();
    expect(response.errors.length).toBeGreaterThan(0);
    expect(response).toMatchSchema(responseSchema);
  });

  it('error on networkError: dns', async () => {
    await sdk.enable_graphql('default', {
      uri: 'https://fakeqlee123213.com/graphql/4e71d3354872265c9d42f69859d2ef14',
      // uri: "http://meunang.com",
      // uri: "https://jsonplaceholder.typicode.com/users",
      remoteServiceName: 'dns-error',
    });

    const query = gql`
      {
        user (id: 134123) {
          id
          firstname
          age
        }
      }
    `;

    const response = await sdk.graphql.query({ query, throwError: false });
    expect(Array.isArray(response.errors)).toBeTruthy();
    expect(response.errors.length).toBeGreaterThan(0);
    expect(response).toMatchSchema(responseSchema);
  });
});
