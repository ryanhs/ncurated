const { matchers: jsonSchemaMatchers } = require('jest-json-schema');

// extends
expect.extend(jsonSchemaMatchers);

// fake timer
// jest.useFakeTimers();

// timeout 10s
// jest.setTimeout(10000);
