// const Promise = require('bluebird');
const { bootstrap } = require('../../src');

module.exports = (configs) => bootstrap('production', configs);
