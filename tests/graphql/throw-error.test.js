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

describe('check with throwError: true', () => {

  it('error on graphql', async () => {
    const mock = () => {
      // fetchMock.dontMock();
      fetchMock.doMock();
      fetchMock.mockResponses([
        JSON.stringify({
          "errors": [
            {
              "message": "Expected type Int, found \"fe\".",
              "locations": [
                {
                  "line": 2,
                  "column": 15
                }
              ]
            }
          ]
        }),
      ])
    }

    await sdk.enable_graphql('default', {
      uri: 'https://fakeql.com/graphql/29f1e13d226c2689483960dc9e248b0c',
      remoteServiceName: 'fakeql',
    });

    const query = gql`
      query {
        albums(options: {paginate: { page: "dwa", limit: 2}}) {
          data {
            id
            title
          }
        }
      }
    `;

    mock();
    const response = sdk.graphql.query({ query, throwError: true });
    await expect(response).rejects.toThrow();
  });

  it('error on parsing', async () => {
    const mock = () => {
      // fetchMock.dontMock();
      fetchMock.doMock();
      fetchMock.mockResponses([
        JSON.stringify({
          "errors": [
            {
              "message": "Expected type Int, found \"fe\".",
              "locations": [
                {
                  "line": 2,
                  "column": 15
                }
              ]
            }
          ]
        }),
      ])
    }

    await sdk.enable_graphql('default', {
      uri: 'https://fakeql.com',
      remoteServiceName: 'meunang',
    });

    const query = gql`
      {
        user (id: "fe") {
          id
          firstname
          age
        }
      }
    `;

    mock();
    const response = sdk.graphql.query({ query, throwError: true });
    await expect(response).rejects.toThrow(/expected/ig);
  });

  it('error on networkError: 1', async () => {
    await sdk.enable_graphql('default', {
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

    const response = sdk.graphql.query({ query, throwError: true });
    await expect(response).rejects.toThrow(/Network error/ig);
  });

  it('error on networkError: dns', async () => {
    await sdk.enable_graphql('default', {
      uri: 'https://fakeqlee123213.com/graphql/4e71d3354872265c9d42f69859d2ef14',
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

    const response = sdk.graphql.query({ query, throwError: true });
    await expect(response).rejects.toThrow(/Network error/ig);
  });
});
