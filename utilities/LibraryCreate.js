// Create a new content fabric library

const ScriptBase = require("./lib/ScriptBase");

class LibraryCreate extends ScriptBase {

  async body() {
    const client = await this.client();
    const logger = this.logger;

    const description = this.args.description;
    const name = this.args.name;
    const kmsId = this.args.kmsId;

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

  options() {
    return super.options()
      .option("name", {
        demandOption: true,
        describe: "Name for new library",
        type: "string"
      })
      .option("description", {
        describe: "Library description",
        type: "string"
      })
      .option("kmsId", {
        alias: "kms-id",
        describe: "ID of the KMS to use for content in this library. If not specified, the default KMS will be used.",
        type: "string"
      });
  }
}

const script = new LibraryCreate;
script.run();