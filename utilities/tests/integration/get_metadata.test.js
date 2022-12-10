const IntegrationTest = require("../helpers/IntegrationTest");

module.exports = class Test extends IntegrationTest {

  static testVarPresets = [];

  async testBody() {
    const vars = this.vars;

    return await this.runUtility("ObjectGetMetadata", vars);
  }
};
