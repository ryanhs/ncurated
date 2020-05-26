const contract = require('../../_contracts/destroyInstance');

module.exports = {
  ...contract,
  friendlyName: 'destroyInstance',
  description: 'destroyInstance function',

  fn({ client }, exits) {
    return exits.success(client.redlock.quit());
  },
};
