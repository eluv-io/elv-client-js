const R = require("ramda");

const {ModOpt, NewOpt} = require("./lib/options");
const Utility = require("./lib/Utility");

const Library = require("./lib/concerns/Library");
const ArgLibraryId = require("./lib/concerns/ArgLibraryId");
const ArgNoWait = require("./lib/concerns/ArgNoWait");
const Metadata = require("./lib/concerns/Metadata");

class LibraryAddDrmCert extends Utility {
  static blueprint() {
    return {
      concerns: [Library, ArgLibraryId, ArgNoWait, Metadata],
      options: [
        ModOpt("libraryId", {demand: true}),
        NewOpt("force", {
          descTemplate: "overwrite any existing cert",
          type: "boolean"
        })
      ]
    };
  }

  async body() {
    const logger = this.logger;
    const {noWait} = this.args;

    // note objectId here is the id of library object
    const {objectId, metadata} = await this.concerns.ArgLibraryId.libInfo();

    // id of library CONTAINING the library
    const libraryContainerLibId = await this.concerns.Library.forObject({objectId});

    // make sure path does NOT exist, or --force specified
    this.concerns.Metadata.checkTargetPath({metadata, targetPath: "/elv/media/drm/fps/cert", force: this.args.force});

    const revisedMetadata = R.mergeDeepRight(metadata, Library.stdDrmCert);

    logger.log("Writing metadata to library...");
    const latestHash = await this.concerns.Metadata.write({
      libraryId: libraryContainerLibId,
      metadata: revisedMetadata,
      noWait,
      objectId,
      commitMessage: "Add DRM cert to library metadata"
    });

    logger.data("versionHash", latestHash);
    logger.log(`Library new version hash ${latestHash}`);
  }

  header() {
    return `Add DRM cert to metadata of library ${this.args.libraryId}`;
  }
}

if(require.main === module) {
  Utility.cmdLineInvoke(LibraryAddDrmCert);
} else {
  module.exports = LibraryAddDrmCert;
}
