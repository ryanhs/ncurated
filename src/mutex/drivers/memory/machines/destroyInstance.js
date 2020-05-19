const contract = require('./../../_contracts/destroyInstance');

module.exports = {
  ...contract,
  friendlyName: 'destroyInstance',
  description: 'destroyInstance function',

  fn(_, exits) {
    return exits.success(true);
  },
};
