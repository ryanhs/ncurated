const packageJson = require('./package.json');
module.exports = require('machine').pack({
  pkg: packageJson,
  dir: __dirname,
});
