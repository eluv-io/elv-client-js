const {NewOpt, StdOpt} = require("./lib/options");
const Utility = require("./lib/Utility");

const Client = require("./lib/concerns/Client");
const Library = require("./lib/concerns/Library");

class LibraryCreate extends Utility {
  blueprint() {
    return {
      concerns: [Client],
      options: [
        StdOpt("name",
          {
            demand: true,
            forX: "new library"
          }),
        StdOpt("description",
          {
            forX: "new library"
          }),
        NewOpt("kmsId",
          {
            descTemplate: "ID of the KMS to use for new library. If not specified, the default KMS will be used.",
            type: "string"
          }),
        NewOpt("addDrmCert",
          {
            descTemplate: "Add standard DRM certificate to library metadata.",
            type: "boolean"
          })
      ]
    };
  }

  async body() {
    const logger = this.logger;
    const {description, kmsId, name} = this.args;

    const metadata = this.args.addDrmCert
      ? Library.stdDrmCert
      : undefined;

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
    return `Create library '${this.args.name}':`;
  }
}

if(require.main === module) {
  Utility.cmdLineInvoke(LibraryCreate);
} else {
  module.exports = LibraryCreate;
}