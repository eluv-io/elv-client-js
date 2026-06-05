const Client = require("./lib/concerns/Client");
const {NewOpt, StdOpt} = require("./lib/options");
const Library = require("./lib/concerns/Library");
const Utility = require("./lib/Utility");

class StreamCreate extends Utility {
  blueprint() {
    return {
      concerns: [Client],
      options: [
        StdOpt(
          "libraryId",
          {
            demand: true,
            forX: "new stream"
          }
        ),
        NewOpt(
          "url",
          {
            demand: true,
            descTemplate: "URL{X}",
            type: "string"
          }
        )
      ]
    };
  }

  async body() {
    const logger = this.logger;
    const {libraryId, url} = this.args;

    const client = await this.concerns.Client.get();
    const response = await client.StreamCreate({
      libraryId,
      url
    });

    logger.log(`New object ID: ${response.id}`);
    logger.data("object_id", response.id);
  }

  header() {
    return `Create live stream '${this.args.libraryId}':`;
  }
}

if(require.main === module) {
  Utility.cmdLineInvoke(StreamCreate);
} else {
  module.exports = StreamCreate;
}
