const {NewOpt, StdOpt} = require("./lib/options");
const Utility = require("./lib/Utility");

const Client = require("./lib/concerns/Client");

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
          })
      ]
    };
  }

  async body() {
    const client = await this.concerns.Client.get();
    const logger = this.logger;
    const {description, name, kmsId} = this.args;

    const response = await client.CreateContentLibrary({
      name,
      description,
      kmsId
    });

    logger.log(`New library ID: ${response}`);
    logger.data("library_id", response);
  }

  header() {
    return `Creating library '${this.args.name}'...`;
  }
}

if(require.main === module) {
  Utility.cmdLineInvoke(LibraryCreate);
} else {
  module.exports = LibraryCreate;
}