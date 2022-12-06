const IntegrationTest = require("../helpers/IntegrationTest");

module.exports = class Test extends IntegrationTest {

  static testVarPresets = ["drm"];

  async testBody() {
    const assert = this.assert;
    const vars = this.vars;
    this.copyProp(vars, "mez_lib_id", "libraryId");

    const resultAdd = await this.runUtility("LibraryAddDrmCert", vars);
    const resultInfo = await this.runUtility("LibraryInfo", vars);

    assert.isObject(resultInfo.library_info.metadata.elv.media.drm.fps);
    const foundCert = resultInfo.library_info.metadata.elv.media.drm.fps.cert;
    assert.isNotEmpty(foundCert);
    assert.equal(foundCert, vars.lib_drm_cert);

    return resultAdd;
  }
};
