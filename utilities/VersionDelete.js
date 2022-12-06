// Retrieve part list from object
const Utility = require("./lib/Utility");

const ExistVer = require("./lib/concerns/ExistVer");

class VersionDelete extends Utility {
  static blueprint() {
    return {
      concerns: [ExistVer]
    };
  }

  async body() {
    await this.concerns.ExistVer.del();
  }

  header() {
    return `Delete version ${this.args.versionHash}`;
  }
}

if(require.main === module) {
  Utility.cmdLineInvoke(VersionDelete);
} else {
  module.exports = VersionDelete;
}
