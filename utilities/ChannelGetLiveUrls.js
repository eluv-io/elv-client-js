// convert an offering to a just-started VoD-as-Live item

const Utility = require("./lib/Utility");

const {NewOpt} = require("./lib/options");

const Client = require("./lib/concerns/Client");
const ExistObjOrVer = require("./lib/concerns/ExistObjOrVer");

class ChannelGetLiveUrls extends Utility {
  blueprint() {
    return {
      concerns: [Client, ExistObjOrVer],
      options: [
        NewOpt("offeringKey",
          {
            default: "default",
            descTemplate: "Which offering within channel to get URLs for",
            type: "string"
          })
      ]
    };
  }

  async body() {
    const logger = this.logger;

    // operations that need to wait on network access
    // ----------------------------------------------------
    const {libraryId, objectId, versionHash, offeringKey} = await this.concerns.ExistObjOrVer.argsProc();

    const client = await this.concerns.Client.get();
    const url = await client.FabricUrl({
      libraryId,
      objectId,
      versionHash,
      rep: "channel/options.json"
    });

    const options = await client.AvailableOfferings({
      libraryId,
      objectId,
      versionHash,
      handler: "channel"
    });

    logger.data("version_hash", versionHash);
    logger.data("options_url", url);
    logger.data("options_json", options);

    logger.log();
    logger.log(`Version hash: ${versionHash}`);
    logger.log();
    logger.log("Channel options.json URL:");
    logger.log();
    logger.log(url);
    logger.log();
    logger.log("options.json contents:");
    logger.log();
    logger.logObject(options);

    const offeringUrl = await client.FabricUrl({
      libraryId,
      objectId,
      versionHash,
      rep: `channel/${offeringKey}/options.json`
    });
    logger.log();
    logger.log(`Offering '${offeringKey}' options.json URL:`);
    logger.log();
    logger.log(offeringUrl);

    const viewsUrl = await client.FabricUrl({
      libraryId,
      objectId,
      versionHash,
      rep: `channel/${offeringKey}/views.json`
    });
    logger.log();
    logger.log(`Offering '${offeringKey}' current available views URL:`);
    logger.log();
    logger.log(viewsUrl);

    // NOTE: although following line calls ElvClient.AvailableOfferings(), it is not actually
    // retrieving available offerings, it is retrieving all available playback formats for channel offering
    // (due to handler setting)
    const offeringOptions = await client.AvailableOfferings({
      libraryId,
      objectId,
      versionHash,
      handler: `channel/${offeringKey}`
    });

    let offUrlObj = new URL(offeringUrl);
    const urlBase =  offUrlObj.origin + offUrlObj.pathname;
    const authToken = offUrlObj.searchParams.get("authorization");
    let sid = "";
    for(const [playoutFormatKey, playoutFormatInfo] of Object.entries(offeringOptions)) {
      const pfUrlObj = new URL(playoutFormatInfo.uri, urlBase);
      sid = pfUrlObj.searchParams.get("sid");
      const playoutUrl =  new URL(playoutFormatInfo.uri, urlBase);
      playoutUrl.searchParams.set("authorization", authToken);
      playoutUrl.searchParams.set("sid", sid);

      logger.log();
      logger.log(`Playout URL for format '${playoutFormatKey}':`);
      logger.log();
      logger.log(playoutUrl.toString());
    }

    const selectViewUrl = await client.FabricUrl({
      libraryId,
      objectId,
      versionHash,
      rep: `channel/${offeringKey}/select_view`
    });
    const viewSelectUrlObj = new URL(selectViewUrl);
    viewSelectUrlObj.searchParams.set("sid", sid);

    logger.log();
    logger.log("Sample curl command to select view:");
    logger.log();
    logger.log(`curl -X POST '${viewSelectUrlObj.toString()}' -d '{"view":1}'`);
  }

  header() {
    return `Start playout of 'live' channel object ${this.args.objectId}${this.args.delay ? ` with ${this.args.delay} second(s) delay` : ""}`;
  }
}

if(require.main === module) {
  Utility.cmdLineInvoke(ChannelGetLiveUrls);
} else {
  module.exports = ChannelGetLiveUrls;
}