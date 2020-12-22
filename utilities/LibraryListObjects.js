// list all object IDs in a library
const R = require("ramda");

const {opts, composeOpts} = require("./lib/options");

const ScriptBase = require("./lib/ScriptBase");

class LibraryListObjects extends ScriptBase {

  async body() {
    const client = await this.client();

    const libraryId = this.args.libraryId;
    const logger = this.logger;

    const response = await client.ContentObjects({
      libraryId: libraryId,
      filterOptions: {
        limit: 100000
      }
    });

    const object_ids = R.map(R.prop("id"))(response.contents);
    logger.data("object_ids", object_ids);
    logger.log_list(object_ids);
  }

  header() {
    return `Getting list of object IDs from ${this.args.libraryId}...`;
  }

  options() {
    return composeOpts(
      super.options(),
      opts.libraryId({demand: true})
    );
  }
}

const script = new LibraryListObjects;
script.run();