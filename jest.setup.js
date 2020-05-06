const { matchers: jsonSchemaMatchers } = require('jest-json-schema');

// yarn
require('dotenv')
  .config({
    path: require('path').resolve(process.cwd(), 'jest.env'),
  });

// extends
expect.extend(jsonSchemaMatchers);

// mocks fetch
require('jest-fetch-mock').enableMocks();
fetchMock.dontMock();

// fake timer
// jest.useFakeTimers();

// timeout 30s
jest.setTimeout(30000);
