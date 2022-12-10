// get metadata without spamming the screen

const IntegrationTest = require("../helpers/IntegrationTest");

module.exports = class Test extends IntegrationTest {
  async testBody() {
    const vars = this.vars;

    return await this.runUtility("ObjectGetMetadata", vars,{
      outfile: "/dev/null", // send metadata output to /dev/null to avoid spamming screen
      overwrite: true
    });
  }
};
