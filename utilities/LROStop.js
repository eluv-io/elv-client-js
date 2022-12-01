// Stop 1 LRO

const {ModOpt} = require("./lib/options");
const Utility = require("./lib/Utility");

const Client = require("./lib/concerns/Client");
const ArgLroId = require("./lib/concerns/ArgLroId");
const ArgNodeUrl = require("./lib/concerns/ArgNodeUrl");
const ArgWriteToken = require("./lib/concerns/ArgWriteToken");

class LROStop extends Utility {
  blueprint() {
    return {
      concerns: [ArgLroId, ArgNodeUrl, ArgWriteToken, Client],
      options: [
        ModOpt("writeToken", {demand: true}),
        ModOpt("lroId", {
          demand: true,
          X: "to stop"
        })
      ]
    };
  }

  async body() {
    await this.concerns.ArgWriteToken.argsProc();
    const {objectId, libraryId, writeToken, lroId} = this.args;

    const client = await this.concerns.Client.get();

    // TODO: check first whether LRO is already terminated

    const {data, errors, warnings, logs} = await client.CallBitcodeMethod({
      objectId,
      libraryId,
      method: "/media/lro/stop",
      writeToken,
      constant: false,
      body: {lro_id: lroId}
    });

    this.logger.errorsAndWarnings({errors, warnings});
    if(logs && logs.length > 0) this.logger.logList("Log:", ...logs);

    this.logger.data("data", data);
    this.logger.log(data);
  }

  header() {
    return `Stop 1 LRO - draft ${this.args.writeToken}, LRO ${this.args.lroId}`;
  }
}

if(require.main === module) {
  Utility.cmdLineInvoke(LROStop);
} else {
  module.exports = LROStop;
}
