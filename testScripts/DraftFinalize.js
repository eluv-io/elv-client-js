/* eslint-disable no-console */

const URI = require("urijs");

const ScriptBase = require("./parentClasses/ScriptBase");

const WriteTokenNode = require("../utilities/WriteTokenNode");

class DraftFinalize extends ScriptBase {

  async body() {
    const client = await this.client();

    const libraryId = this.args.libraryId;
    const objectId = this.args.objectId;
    const writeToken = this.args.writeToken;

    const nodeResolver = new WriteTokenNode({
      argList: [
        "--writeToken", writeToken,
        "--json", "--silent"
      ],
      env: {
        "FABRIC_CONFIG_URL": client.ConfigUrl()
      }
    });

    const result = await nodeResolver.run();
    if(result.exitCode !== 0) throw Error("Failed to determine node for write token");
    if(!result.data.nodeInfo) throw Error("Null node_info returned for write token");

    const fabricInfo = result.data.nodeInfo.fab[0];
    const url = new URL("https://dummy");
    url.protocol = fabricInfo.scheme;
    url.hostname = fabricInfo.host;
    if(fabricInfo.port !== "") {
      url.port = parseInt(fabricInfo.port);
    }
    const nodeUrl = url.href;

    client.HttpClient.RecordWriteToken(writeToken,new URI(nodeUrl));
    console.log("Finalizing draft...");
    const finalizeResponse = await client.FinalizeContentObject({
      libraryId,
      objectId,
      writeToken
    });
    console.log("New version hash: " + finalizeResponse.hash);
  }

  header() {
    return "Finalize draft " + this.args.writeToken + "'... ";
  }

  options() {
    return super.options()
      .option("libraryId", {
        alias: "library-id",
        demandOption: true,
        describe: "Library ID (should start with 'ilib')",
        type: "string"
      })
      .option("objectId", {
        alias: "object-id",
        demandOption: true,
        describe: "Object ID (should start with 'iq__')",
        type: "string"
      })
      .option("writeToken", {
        alias: "write-token",
        demandOption: true,
        describe: "Write token of draft",
        type: "string"
      });
  }
}

const script = new DraftFinalize;
script.run();
