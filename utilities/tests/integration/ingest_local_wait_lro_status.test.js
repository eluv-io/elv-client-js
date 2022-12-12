const IntegrationTest = require("../helpers/IntegrationTest");

module.exports = class Test extends IntegrationTest {

  static desc = `Creates a production master from a local file, then creates a mezzanine from the master and uses --wait
  to finalize it. After finalization finishes, gets mezzanine metadata and then asks for detailed status of each LRO 
  listed under /lro_status. This is expected to fail with 'Failed to find write token'`;

  static testVarPresets = [];

  async testBody() {
    // const assert = this.assert;
    const vars = this.vars;

    const resultMaster = await this.runTest({testPath: "create_master_local.test.js"});
    const masterHash = resultMaster.data.versionHash;

    const resultMez = await this.runTest({
      testPath: "create_mez.test.js",
      addlVars: {
        masterHash,
        wait: "true",
      }
    });

    const writeToken = resultMez.data.writeToken;
    const mezId = resultMez.data.objectId;

    let addlVars = this.preset("use_mez_lib");
    addlVars.subtree = "/lro_status";
    addlVars.objectId = mezId;

    const resultMetadata = await this.runUtility(
      "ObjectGetMetadata",
      vars,
      addlVars
    );

    const lroIds = Object.keys(resultMetadata.data.metadata);
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
