const contract = require('../../_contracts/healthcheck');

module.exports = {
  ...contract,
  friendlyName: 'healthcheck',
  description: 'healthcheck function',

  fn(_, exits) {
    // still figuring out how to do healthcheck with kafka stream
    return exits.success('just ok for now!');
  },
};
