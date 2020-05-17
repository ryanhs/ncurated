const contract = require('../../_contracts/healthcheck');

module.exports = {
  ...contract,
  friendlyName: 'healthcheck',
  description: 'healthcheck function',

  async fn({ client }, exits) {
    const response = await client.pingAsync();
    return exits.success(response === 'PONG');
  },
};
