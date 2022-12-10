const IntegrationTest = require("../helpers/IntegrationTest");

module.exports = class Test extends IntegrationTest {

  static testVarPresets = [];

  async testBody() {
    // const assert = this.assert;
    const vars = this.vars;

    const resultMaster = await this.runTest({testPath: "create_master_local.test.js"});
    const masterHash = resultMaster.data.versionHash;

    const resultMez = await this.runTest({
      testPath: "create_mez.test.js",
      addlVars: {masterHash}
    });

    const writeToken = resultMez.data.writeToken;
    const mezId = resultMez.data.objectId;

    const resultStatus = await this.runTest({
      testPath: "mez_status.test.js",
      addlVars: {objectId: mezId}
    });

    const lroIds = Object.keys(resultStatus.data.jobs);
    for(const lroId of lroIds){
      const lroStatus = await this.runUtility(
        "LROStatus",
        vars,
        {
          lroId,
          writeToken
        });
      console.log(JSON.stringify(lroStatus,null,2));
    }
  }
};
