// get metadata without spamming the screen

const IntegrationTest = require("../helpers/IntegrationTest");

module.exports = class Test extends IntegrationTest {

  static desc = `Retrieves metadata without printing it to the screen.
  Requires an objectId, versionHash, or writeToken to be passed in.`;

  async testBody() {
    const vars = this.vars;

    return await this.runUtility("ObjectGetMetadata", vars,{
      outfile: "/dev/null", // send metadata output to /dev/null to avoid spamming screen
      overwrite: "true"
    });
  }
};
