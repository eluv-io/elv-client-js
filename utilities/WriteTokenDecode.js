// Retrieve part list from object
const Utility = require("./lib/Utility");

const Draft = require("./lib/concerns/Draft");
const {NewOpt} = require("./lib/options");

class WriteTokenDecode extends Utility {
  blueprint() {
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
    // eslint-disable-next-line no-console
    console.log(JSON.stringify(this.concerns.Draft.decode({writeToken}), null, 2));
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
