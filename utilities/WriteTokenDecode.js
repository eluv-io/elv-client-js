// Retrieve part list from object
const Utility = require("./lib/Utility");

const Client = require("./lib/concerns/Client");
const Draft = require("./lib/concerns/Draft");
const {NewOpt} = require("./lib/options");

class WriteTokenDecode extends Utility {
  blueprint() {
    return {
      concerns: [Client, Draft],
      options: [
        NewOpt("writeToken", {
          demand: true,
          descTemplate: "Write token to decode",
          type: "string"
        }),
        NewOpt("node", {
          descTemplate: "Look up node info",
          type: "boolean"
        })
      ]
    };
  }

  async body() {
    const {writeToken, node} = this.args;
    const tokenInfo = this.concerns.Draft.decode({writeToken});
    let result = {};
    if(node) {
      const client = await this.concerns.Client.get();
      const nodeInfo = await client.WriteTokenNodeInfo({writeToken});
      result = {tokenInfo, nodeInfo};
    } else {
      result = {tokenInfo};
    }
    // eslint-disable-next-line no-console
    console.log(JSON.stringify(result, null,2));
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
