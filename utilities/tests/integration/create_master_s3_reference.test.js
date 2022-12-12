const IntegrationTest = require("../helpers/IntegrationTest");

module.exports = class Test extends IntegrationTest {

  static desc = `Creates a production master containing a reference (link) to a file stored in S3`;

  static testVarPresets = ["ingest_master_s3_reference"];

  async testBody() {
    const assert = this.assert;
    const vars = this.vars;
    const resultCreateMaster = await this.runUtility("ProductionMasterCreate", vars);

    const masterHash = resultCreateMaster.data.versionHash;
    assert.isString(masterHash);
    assert.isNotEmpty(masterHash);

    return resultCreateMaster;
  }
};
