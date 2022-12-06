// Output decoded write token
const Utility = require("./lib/Utility");

const Draft = require("./lib/concerns/Draft");
const {NewOpt} = require("./lib/options");

class WriteTokenDecode extends Utility {
  static blueprint() {
    return {
      concerns: [Draft],
      options: [
        NewOpt("writeToken", {
          demand: true,
          descTemplate: "Write token to decode",
          type: "string"
        })
      ]
    };
  }

  async body() {
    const {writeToken} = this.args;
    this.logger.logObject(this.concerns.Draft.decode({writeToken}));
  }

  header() {
    return `Decode write token ${this.args.writeToken}`;
  }
}

if(require.main === module) {
  Utility.cmdLineInvoke(WriteTokenDecode);
} else {
  module.exports = WriteTokenDecode;
}
