// Retrieve part list from object
const Utility = require("./lib/Utility");

const ExistObjOrVer = require("./lib/concerns/ExistObjOrVer");
const ArgOutfile = require("./lib/concerns/ArgOutfile");

class ListParts extends Utility {
  blueprint() {
    return {
      concerns: [ExistObjOrVer, ArgOutfile]
    };
  }

  async body() {
    const {outfile} = this.args;
    const partList = await this.concerns.ExistObjOrVer.partList();
    this.logger.data("parts", partList);

    if(outfile) {
      this.concerns.ArgOutfile.writeJson({obj: partList});
    } else {
      this.logger.logTable({list: partList});
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
