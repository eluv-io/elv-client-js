// List versions of an object
const {NewOpt} = require("./lib/options");

const Utility = require("./lib/Utility");

const ArgOutfile = require("./lib/concerns/ArgOutfile");
const ExistObj = require("./lib/concerns/ExistObj");
const Version = require("./lib/concerns/Version");


class ObjectListVersions extends Utility {
  blueprint() {
    return {
      concerns: [ArgOutfile, ExistObj],
      options: [
        NewOpt("type", {
          descTemplate: "include type of each version",
          type: "boolean"
        }),
        NewOpt("commitInfo", {
          descTemplate: "include commit info fields if available",
          type: "boolean"
        }),
        NewOpt("decode", {
          descTemplate: "include fields decoded from version hash",
          type: "boolean"
        })
      ]
    };
  }

  async body() {
    const {libraryId, objectId} = await this.concerns.ExistObj.argsProc();

    const versionList = await this.concerns.ExistObj.versionList();

    for(let i = 0; i < versionList.length; i++) {
      const v = versionList[i];
      if(!this.args.type) delete v.type;
      if(this.args.commitInfo) {
        const commitInfo = await this.concerns.Metadata.commitInfo({
          libraryId,
          objectId,
          versionHash: v.hash
        });
        v.commit_author = commitInfo.author;
        v.commit_author_address = commitInfo.author_address;
        v.commit_message = commitInfo.message;
        v.commit_timestamp = commitInfo.timestamp;
      }
      if(this.args.decode) {
        const decoded = Version.decode({versionHash: v.hash});
        v.decode_digest = decoded.digest;
        v.decode_objectId = decoded.objectId;
        v.decode_partHash = decoded.partHash;
        v.decode_size = decoded.size;
      }
    }

    this.logger.data("versions", versionList);
    this.logger.data("version_count", versionList.length);
    if(this.args.outfile) {
      if(this.args.json) {
        this.concerns.ArgOutfile.writeJson({obj: versionList});
      } else {
        this.concerns.ArgOutfile.writeTable({list: versionList});
      }
    } else {
      this.logger.logTable(versionList);
    }
  }

  header() {
    return `List versions for object ${this.args.objectId}`;
  }
}

if(require.main === module) {
  Utility.cmdLineInvoke(ObjectListVersions);
} else {
  module.exports = ObjectListVersions;
}