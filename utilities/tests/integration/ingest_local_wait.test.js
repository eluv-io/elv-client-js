const IntegrationTest = require("../helpers/IntegrationTest");

module.exports = class Test extends IntegrationTest {

  static desc = `Creates a master from local file, then creates a mez from default variant, using --wait to finalize 
  when done.`;

  static testVarPresets = ["abr_profiles"];

  async testBody() {

    const resultMaster = await this.runTest({
      testPath: "create_master_local.test.js"
    });

    const masterHash = resultMaster.data.versionHash;

    return await this.runTest({
      testPath: "create_mez.test.js",
      addlVars: {
        masterHash,
        wait: "true"
      }
    });
  }
};
