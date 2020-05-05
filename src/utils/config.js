const defaultConfigsAvailable = require('../defaultConfigs/index');

const envBoolean = (v) => {
  if (v === 'true') {
    return true;
  }
  if (v === 'false') {
    return false;
  }
  return v;
};

const envSDKOverride = () => Object.keys(process.env)
  .filter((v) => v.substr(0, 4) === 'SDK_') // filter only sdk overrides
  .reduce((o, v) => ({ ...o, [v.substr(4)]: envBoolean(process.env[v]) }), {});

const parseConfig = (environment = 'production', configOverrides = {}, useEnv = true) => {
  const env = useEnv ? envSDKOverride() : {};
  
  const config = {
    ...defaultConfigsAvailable[environment],
    ...env,
    ...configOverrides,
    environment,
  };

  return config;
};

module.exports = { envSDKOverride, envBoolean, parseConfig };
