const IntegrationTest = require("../helpers/IntegrationTest");

module.exports = class Test extends IntegrationTest {

  static testVarPresets = ["abr_profiles"];

  async testBody() {
    // const assert = this.assert;
    // const vars = this.vars;

    const resultMaster = await this.runTest({
      testPath: "create_master_local.test.js",
      addlVars: {abr_profile_filename: null}
    });

    const masterHash = resultMaster.data.versionHash;

    return await this.runTest({
      testPath: "create_mez.test.js",
      addlVars: {
        masterHash,
        wait: true
      }
    });
  }
};
