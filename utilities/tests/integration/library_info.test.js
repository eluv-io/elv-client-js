const IntegrationTest = require("../helpers/IntegrationTest");

module.exports = class Test extends IntegrationTest {

  static testVarPresets = []; // no additional presets needed, defaults sufficient

  async testBody() {
    const vars = this.vars;
    return await this.runUtility(
      "LibraryInfo",
      vars,
      {"libraryId": vars.mez_lib_id}
    );
  }

};
