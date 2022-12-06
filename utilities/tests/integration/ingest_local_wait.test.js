const IntegrationTest = require("../helpers/IntegrationTest");

module.exports = class Test extends IntegrationTest {

  static testVarPresets = [];

  async testBody() {
    // const assert = this.assert;
    // const vars = this.vars;

    const resultMaster = await this.runTest({testPath: "create_master_local.test.js"});
    const masterHash = resultMaster.version_hash;

    return await this.runTest({
      testPath: "create_mez.test.js",
      addlVars: {
        masterHash,
        wait: true
      }
    });
  }
};
