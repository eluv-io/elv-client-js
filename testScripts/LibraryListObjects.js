const ScriptBase = require("./parentClasses/ScriptBase");

class LibraryListObjects extends ScriptBase {

  async body() {
    const client = await this.client();

    const libraryId = this.args.libraryId;

    const response = await client.ContentObjects({
      libraryId: libraryId,
      filterOptions: {
        limit: 100000
      }
    });

    const rows = response.contents;
    
    // eslint-disable-next-line no-console
    console.log(JSON.stringify(rows, null, 2));
  }

  footer() {
    return "";
  }

  header() {
    return "";
  }

  options() {
    return super.options()
      .option("libraryId", {
        alias: "library-id",
        demandOption: true,
        describe: "Library ID (should start with 'ilib')",
        type: "string"
      });
  }
}

const script = new LibraryListObjects;
script.run();