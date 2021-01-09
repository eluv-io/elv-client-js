const R = require("ramda");

const testEnv = {
  cwd: __dirname,
  env: {ELV_THROW_ON_ERROR: 1, ELV_SUPPRESS_USAGE: 1}
};

const argList2Params = (...argList) => {
  argList = argList || [];
  return {
    argList,
    ...testEnv
  };
};

const params = testParams => R.mergeDeepRight(
  testParams,
  testEnv
);

const removeElvEnvVars = () => {
  delete process.env.FABRIC_CONFIG_URL;
  delete process.env.PRIVATE_KEY;
};

module.exports = {argList2Params, params, removeElvEnvVars};