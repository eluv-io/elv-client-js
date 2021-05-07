// Delete a single object

const Utility = require("./lib/Utility");

const ExistObj = require("./lib/concerns/ExistObj");

class ObjectDelete extends Utility {
  blueprint() {
    return {
      concerns: [ExistObj]
    };
  }

  async body() {
    await this.concerns.ExistObj.del();
  }

  header() {
    return `Delete object ${this.args.objectId}`;
  }
}

if(require.main === module) {
  Utility.cmdLineInvoke(ObjectDelete);
} else {
  module.exports = ObjectDelete;
}