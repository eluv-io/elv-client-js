const IntegrationTest = require("../helpers/IntegrationTest");

module.exports = class Test extends IntegrationTest {

  static testVarPresets = ["ingest_master_local"];

  async testBody() {
    const assert = this.assert;
    const vars = this.vars;
    const resultCreate = await this.runUtility("ProductionMasterCreate", vars);

    assert.isString(resultCreate.version_hash);
    assert.isNotEmpty(resultCreate.version_hash);

    // get metadata from the newly created production master
    const resultMeta = await this.runUtility(
      "ObjectGetMetadata",
      vars,
      {
        outfile: "/dev/null", // send metadata output to /dev/null to avoid spamming screen
        overwrite: "true",
        subtree: "/production_master",
        versionHash: resultCreate.version_hash
      }
    );

    // verify that default variant exists
    const defaultVariant = resultMeta.metadata.variants.default;
    assert.isObject(defaultVariant);
    assert.isNotEmpty(defaultVariant);

    return resultCreate;
  }
};
