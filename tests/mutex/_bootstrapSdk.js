const Promise = require('bluebird');
const sdk = require('../../src');

module.exports = (configs) => sdk.bootstrap('production', configs);
