const IntegrationTest = require("../helpers/IntegrationTest");

module.exports = class Test extends IntegrationTest {

  static desc = `Retrieves metadata. Requires an objectId, versionHash, or writeToken to be passed in.`;

  static testVarPresets = [];

  async testBody() {
    const vars = this.vars;

    return await this.runUtility("ObjectGetMetadata", vars);
  }
};
