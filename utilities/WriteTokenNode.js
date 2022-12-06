// Find node for write token
const Utility = require("./lib/Utility");

const Draft = require("./lib/concerns/Draft");
const {NewOpt} = require("./lib/options");

class WriteTokenNode extends Utility {
  static blueprint() {
    return {
      concerns: [Draft],
      options: [
        NewOpt("writeToken", {
          demand: true,
          descTemplate: "Write token to determine node for",
          type: "string"
        })
      ]
    };
  }

  async body() {
    const {writeToken} = this.args;
    const nodeInfo = await this.concerns.Draft.nodeInfo({writeToken});
    this.logger.data("node_info", nodeInfo);
    this.logger.logObject(nodeInfo);
  }

  header() {
    return `Get node info for write token ${this.args.writeToken}`;
  }
}

if(require.main === module) {
  Utility.cmdLineInvoke(WriteTokenNode);
} else {
  module.exports = WriteTokenNode;
}
