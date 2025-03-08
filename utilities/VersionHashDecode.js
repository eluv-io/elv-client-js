// Get information about a version hash
const Utility = require("./lib/Utility");

const Client = require("./lib/concerns/Client");
const Version = require("./lib/concerns/Version");
const {NewOpt} = require("./lib/options");

class VersionHashDecode extends Utility {
  blueprint() {
    return {
      concerns: [Client, Version],
      options: [
        NewOpt("versionHash", {
          demand: true,
          descTemplate: "Version hash to decode",
          type: "string"
        }),
        NewOpt("node", {
          descTemplate: "Query node for additional information",
          type: "boolean"
        })
      ]
    };
  }

  async body() {
    const {versionHash, node} = this.args;
    const versionInfo = this.concerns.Version.decode({versionHash});
    let result;
    if(node) {
      const client = await this.concerns.Client.get();
      const nodeInfo = await client.VersionStatus({versionHash});
      result = {versionInfo, nodeInfo};
    } else {
      result = {versionInfo};
    }
    // eslint-disable-next-line no-console
    console.log(JSON.stringify(result, null,2));
  }

  header() {
    return `Decode version hash ${this.args.versionHash}`;
  }
}

if(require.main === module) {
  Utility.cmdLineInvoke(VersionHashDecode);
} else {
  module.exports = VersionHashDecode;
}
