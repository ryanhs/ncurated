const { matchers: jsonSchemaMatchers } = require('jest-json-schema');

// yarn
require('dotenv')
  .config({
    path: require('path').resolve(process.cwd(), 'jest.env'),
  });

// extends
expect.extend(jsonSchemaMatchers);

// fake timer
// jest.useFakeTimers();

// timeout 10s
// jest.setTimeout(10000);
