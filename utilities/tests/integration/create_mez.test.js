const IntegrationTest = require("../helpers/IntegrationTest");

module.exports = class Test extends IntegrationTest {

  static desc = `Creates a mezzanine. Requires masterHash to be passed in.`;

  static testVarPresets = ["ingest_mez"];

  async testBody() {
    const vars = this.vars;
    return await this.runUtility("MezzanineCreate", vars);
  }
};
