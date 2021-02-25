// convert an offering to a just-started VoD-as-Live item

const R = require("ramda");

const Utility = require("./lib/Utility");

const REofferingUrlParse = /^([^?]+)options.json\?(authorization=[^&]+)/;

const Client = require("./lib/concerns/Client");
const ExistObj = require("./lib/concerns/ExistObj");
const Metadata = require("./lib/concerns/Metadata");

class ChannelStartLive extends Utility {
  blueprint() {
    return {
      concerns: [Client, ExistObj, Metadata]
    };
  }

  async body() {
    const logger = this.logger;
    const now = (new Date).toISOString();

    const metadataToMerge = {
      channel: {live_start_time: now}
    };

    // operations that need to wait on network access
    // ----------------------------------------------------
    const {libraryId, objectId} = await this.concerns.ExistObj.argsProc();

    logger.log("Retrieving existing metadata from object...");
    const currentMetadata = await this.concerns.ExistObj.metadata();

    if(!currentMetadata.channel) {
      throw Error("/channel not found in object metadata");
    }

    const metadata = R.mergeDeepRight(currentMetadata, metadataToMerge);

    // Write back metadata
    const newHash = await this.concerns.Metadata.write({
      libraryId,
      metadata,
      objectId
    });

    const client = await this.concerns.Client.get();
    const url = await client.FabricUrl({
      libraryId,
      objectId,
      versionHash: newHash,
      rep: "channel/options.json"
    });

    const options = await client.AvailableOfferings({
      libraryId,
      objectId,
      versionHash: newHash,
      handler: "channel"
    });

    this.logger.data("version_hash", newHash);
    this.logger.data("options_url", url);
    this.logger.data("options_json", options);
    this.logger.log();
    this.logger.log(`New version hash: ${newHash}`);
    this.logger.log();
    this.logger.log(`Options.json URL: ${url}`);
    this.logger.log();
    this.logger.log("options.json contents:");
    this.logger.logObject(options);

    if(options.options) {
      for(const [offeringKey, offeringInfo] of Object.entries(options.options)) {
        const offeringUrl = await client.FabricUrl({
          libraryId,
          objectId,
          versionHash: newHash,
          rep: `channel/${offeringKey}/options.json`
        });
        this.logger.log(`Offering '${offeringKey}' options.json URL:`);
        this.logger.log(offeringUrl);

        const match = REofferingUrlParse.exec(offeringUrl);
        const urlBase = match && match[1];
        const authToken = match && match[2];

        const offeringOptions = await client.AvailableOfferings({
          libraryId,
          objectId,
          versionHash: newHash,
          handler: `channel/${offeringKey}`
        });

        for(const [playoutFormatKey, playoutFormatInfo] of Object.entries(offeringOptions)) {
          const playoutUrl = `${urlBase}${playoutFormatInfo.uri}${authToken ? `?${authToken}` : ""}`;
          this.logger.log();
          this.logger.log(`Offering '${offeringKey}' format '${playoutFormatKey}' playout URL:`);
          this.logger.log(playoutUrl);
          this.logger.log();
        }
      }
    }
  }

  header() {
    return `Start playout of 'live' channel object ${this.args.objectId}`;
  }
}

if(require.main === module) {
  Utility.cmdLineInvoke(ChannelStartLive);
} else {
  module.exports = ChannelStartLive;
}