// Delete versions of an object
const R = require("ramda");

const {NewOpt} = require("./lib/options");

const Utility = require("./lib/Utility");

const ExistObj = require("./lib/concerns/ExistObj");
const Version = require("./lib/concerns/Version");

const chkKeepNewOrKeepOld = (argv) => {
  if(!argv.keepNew && !argv.keepOld) {
    throw Error("Must supply either --keepNew or --keepOld");
  }
  return true; // tell yargs that the arguments passed the check
};

class ObjectPruneVersions extends Utility {
  static blueprint() {
    return {
      concerns: [ExistObj, Version],
      options: [
        NewOpt("keep", {
          demand: true,
          descTemplate:"Number of versions to keep",
          type: "number"
        }),
        NewOpt("keepNew", {
          descTemplate:"delete oldest versions first",
          type: "boolean"
        }),
        NewOpt("keepOld", {
          descTemplate:"delete newest versions first",
          type: "boolean"
        })
      ],
      checksMap: {chkKeepNewOrKeepOld}
    };
  }

  async body() {
    const {keep, keepOld} = this.args;

    const versionList = await this.concerns.ExistObj.versionList();
    const versionCount = versionList.length;
    this.logger.data("original_version_count", versionCount);

    if(versionCount < keep) throw Error(`--keep ${keep} specified but only ${versionCount} version(s) found.`);

    this.logger.data("deleted_version_count", 0);
    this.logger.data("deleted_version_hashes", []);
    if(versionCount === keep) {
      this.logger.warn(`Object current version count (${versionCount}) same as --keep, no versions deleted.`);
      this.logger.data("deleted_version_count", 0);
    } else {
      const numberToDelete = versionCount - keep;
      this.logger.log(`Object current version count = ${versionCount}, deleting ${numberToDelete} ${keepOld ? "newest" : "oldest"} version(s)...`);
      // versionList returns sorted by newest first, if we keep old then delete from start of the list
      const sliceStart = keepOld ? 0 : versionCount - numberToDelete;
      const sliceEnd = sliceStart + numberToDelete;
      const hashesToDelete = R.pluck("hash",versionList.slice(sliceStart, sliceEnd));

      let deleteCount = 0;
      for(const versionHash of hashesToDelete) {
        await this.concerns.Version.del({versionHash});
        deleteCount++;
        this.logger.data("deleted_version_count", deleteCount);
        this.logger.dataConcat("deleted_version_hashes", versionHash);
      }
    }
  }

  header() {
    return `Prune object ${this.args.objectId}, keeping ${this.args.keep} version(s)`;
  }
}

if(require.main === module) {
  Utility.cmdLineInvoke(ObjectPruneVersions);
} else {
  module.exports = ObjectPruneVersions;
}
