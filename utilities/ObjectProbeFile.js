// Probe file in object for media structure

const {NewOpt} = require("./lib/options");
const Utility = require("./lib/Utility");

const ArgOutfile = require("./lib/concerns/ArgOutfile");
const Client = require("./lib/concerns/Client");
const CloudAccess = require("./lib/concerns/CloudAccess");
const ExistObjOrVer = require("./lib/concerns/ExistObjOrVer");

class ObjectProbeFile extends Utility {
  blueprint() {
    return {
      concerns: [Client, ExistObjOrVer, ArgOutfile, CloudAccess],
      options: [
        NewOpt("file", {
          demand: true,
          descTemplate: "Name of file within object (must be at top level).",
          type: "string"
        })
      ]
    };
  }

  async body() {
    const {file, outfile} = this.args;
    const client = await this.concerns.Client.get();

    const access = this.concerns.CloudAccess.credentialSet(false);

    await this.concerns.ExistObjOrVer.argsProc();

    const {data, errors, warnings} = await client.CallBitcodeMethod({
      versionHash: this.args.versionHash,
      method: "/media/files/probe",
      constant: false,
      body: {file_paths: [file], access}
    });

    this.logger.errorsAndWarnings({errors, warnings});

    if(outfile) {
      this.concerns.ArgOutfile.writeJson(data);
    } else {
      this.logger.logObject(data);
    }
    this.logger.data("fileMediaInfo", data);
  }

  header() {
    return `Get media info for ${this.args.file} in ${this.args.versionHash || this.args.objectId}...`;
  }
}

if(require.main === module) {
  Utility.cmdLineInvoke(ObjectProbeFile);
} else {
  module.exports = ObjectProbeFile;
}
