// Retrieve part list from object
const Utility = require("./lib/Utility");

const ObjectOrVersion = require("./lib/concerns/ObjectOrVersion");
const Outfile = require("./lib/concerns/Outfile");

class ListParts extends Utility {
  blueprint() {
    return {
      concerns: [ObjectOrVersion, Outfile]
    };
  }

  async body() {
    const {outfile} = this.args;
    const partList = await this.concerns.ObjectOrVersion.partList();
    this.logger.data("parts", partList);

    if(outfile) {
      this.concerns.Outfile.writeJson({obj: partList});
    } else {
      this.logger.logTable(partList);
    }

    if(partList.length === 0) logger.warn("No parts found.");
  }

  header() {
    return `Get part list for ${this.args.versionHash || this.args.objectId}`;
  }
}

if(require.main === module) {
  Utility.cmdLineInvoke(ListParts);
} else {
  module.exports = ListParts;
}
