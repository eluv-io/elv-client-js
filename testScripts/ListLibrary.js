const ScriptBase = require("./parentClasses/ScriptBase");

class ListLibrary extends ScriptBase {

  async body() {
    const client = await this.client();
    client.SetAuth(false);

    const libraryId = this.args.libraryId;
    const path = (this.args.path.startsWith("/")) ? this.args.path.substring(1) : this.args.path;

    const response = await client.ContentObjects({
      libraryId: libraryId,
      filterOptions: {
        limit: 100000,
        select: path
      }
    });

    let rows;
    if(path.startsWith("public")) {
      rows = response.contents;
    } else {
      rows = await Promise.all(response.contents.map(async (object, i) => {
        const objectMeta = await client.ContentObjectMetadata({
          libraryId,
          objectId: object.id
        });

        if(objectMeta.public) delete objectMeta.public;
        response.contents[i].versions[0]["meta"] = objectMeta;
        return response.contents[i];
      }));
    }

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
      })
      .option("path", {
        demandOption: true,
        describe: "Path (can be public or private)",
        type: "string"
      });
  }
}

const script = new ListLibrary();
script.run();
