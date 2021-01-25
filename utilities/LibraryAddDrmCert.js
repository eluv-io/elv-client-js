const {ModOpt} = require("./lib/options");
const Utility = require("./lib/Utility");

const Client = require("./lib/concerns/Client");
const Library = require("./lib/concerns/Library");

class LibraryAddDrmCert extends Utility {
  blueprint() {
    return {
      concerns: [Library, Client],
      options: [
        ModOpt("libraryId",{demand: true })
      ]
    };
  }

  async body() {
    const logger = this.logger;

    const client = await this.concerns.Client.get();
    const response = await client.CreateContentLibrary({
      description,
      kmsId,
      name,
      metadata
    });

    logger.log(`New library ID: ${response}`);
    logger.data("library_id", response);
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