const IntegrationTest = require("../helpers/IntegrationTest");

module.exports = class Test extends IntegrationTest {

  static testVarPresets = ["ingest_mez"];

  async testBody() {
    const vars = this.vars;
    return await this.runUtility("MezzanineCreate", vars);
  }
};
