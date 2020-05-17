const contract = require('../../_contracts/healthcheck');

module.exports = {
  ...contract,
  friendlyName: 'healthcheck',
  description: 'healthcheck function',

  fn(_, exits) {
    return exits.success('redis mock always on!');
  },
};
