const IntegrationTest = require("../helpers/IntegrationTest");

module.exports = class Test extends IntegrationTest {

  static desc = `Creates a production master from a local file`;

  static testVarPresets = ["ingest_master_local"];

  async testBody() {
    const assert = this.assert;
    const vars = this.vars;
    const resultCreate = await this.runUtility("ProductionMasterCreate", vars);

    const masterHash = resultCreate.data.versionHash;
    assert.isString(masterHash);
    assert.isNotEmpty(masterHash);

    // get metadata from the newly created production master
    const resultMeta = await this.runTest({
        testPath: "get_metadata_silent.test.js",
        addlVars: {
          subtree: "/production_master",
          versionHash: masterHash
        }
      }
    );

    // verify that default variant exists
    const defaultVariant = resultMeta.data.metadata.variants.default;
    assert.isObject(defaultVariant);
    assert.isNotEmpty(defaultVariant);

    return resultCreate;
  }
};
