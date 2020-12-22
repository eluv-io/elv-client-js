// Create a new content fabric library
const {opts, composeOpts} = require("./lib/options");

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
    return composeOpts(
      super.options(),
      opts.name({forX: "new library", demand: true}),
      opts.description({forX: "new library"}),
      opts.kmsId({forX: "content in new library"})
    );
  }
}

const script = new LibraryCreate;
script.run();