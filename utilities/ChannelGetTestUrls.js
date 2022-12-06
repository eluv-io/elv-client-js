// convert an offering to a just-started VoD-as-Live item

const Utility = require("./lib/Utility");

const {NewOpt} = require("./lib/options");

const Client = require("./lib/concerns/Client");
const ExistObjOrVer = require("./lib/concerns/ExistObjOrVer");
const kindOf = require("kind-of");
const R = require("ramda");


class ChannelGetTestUrls extends Utility {
  static blueprint() {
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

    const offerings = await this.concerns.ExistObjOrVer.metadata({subtree:"/channel/offerings"});
    if(!offerings) {
      throw Error("No offerings found in channel");
    }

    if(!offerings[offeringKey]) {
      throw Error(`Offering '${offeringKey}' not found in channel`);
    }

    if(!offerings[offeringKey].items) throw Error(`/channel/offerings/${offeringKey}/items not found in object metadata`);

    if(kindOf(offerings[offeringKey].items) !== "array") throw Error(`/channel/offerings/${offeringKey}/items in object metadata is not an array`);

    if(offerings[offeringKey].items.length === 0) throw Error(`/channel/offerings/${offeringKey}/items in object metadata is empty`);

    const client = await this.concerns.Client.get();


    // get an auth token for each item to include in playout URLs
    const mezAuthTokens = [];
    const items = offerings[offeringKey].items;

    const RE_URI_HASH = /\/(hq__[a-zA-Z0-9]+)\//;
    logger.log("Generating auth tokens...");
    for(let i = 0; i < items.length; i++) {
      const itemURI = items[i].source["/"];
      const mezVersionHash = RE_URI_HASH.exec(itemURI)[1];
      if(!mezVersionHash) throw Error(`hash not found in item URI: ${itemURI}`);

      const mezObjectId = this.concerns.Version.objectId({versionHash: mezVersionHash});
      const mezLibId = await this.concerns.FabricObject.libraryId({objectId: mezObjectId});

      mezAuthTokens.push(
        await client.authClient.AuthorizationToken(
          {
            libraryId: mezLibId,
            objectId: mezObjectId,
            versionHash: mezVersionHash,
            update: false
          }
        )
      );
    }


    const url = await client.FabricUrl({
      libraryId,
      objectId,
      versionHash,
      rep: "channel/options.json"
    });

    logger.data("version_hash", versionHash);
    logger.data("options_url", url);

    logger.log();
    logger.log(`Version hash: ${versionHash}`);
    logger.log();

    logger.log("Sample command for obtaining channel information (NOT for public distribution!)");
    logger.log();
    logger.log("curl '" + url + "' | jq");

    const offeringUrl = await client.FabricUrl({
      libraryId,
      objectId,
      versionHash,
      rep: `channel/${offeringKey}/options.json`
    });
    logger.log();
    logger.log("Sample command for obtaining test playout URLs (NOT for public distribution!)");
    logger.log();
    logger.log("curl '" + offeringUrl + "' | jq");

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
      mezAuthTokens.forEach(t => playoutUrl.searchParams.append("authorization", t));
      playoutUrl.searchParams.set("sid", sid);

      logger.log();
      logger.log(`Sample test playout URL for format '${playoutFormatKey}' (NOT for public distribution!):`);
      logger.log();
      logger.log(playoutUrl.toString());
    }

    const multiviewPresent = offerings[offeringKey].multiview &&
      !R.empty(offerings[offeringKey].multiview);
    if(multiviewPresent) {
      const viewsUrl = await client.FabricUrl({
        libraryId,
        objectId,
        versionHash,
        rep: `channel/${offeringKey}/views.json`
      });
      const viewsUrlObj = new URL(viewsUrl);
      viewsUrlObj.searchParams.set("sid", sid);
      logger.log();
      logger.log(`Sample offering '${offeringKey}' current available views URL (sid must be same as in playout URL):`);
      logger.log();
      logger.log(viewsUrlObj.toString());


      const selectViewUrl = await client.FabricUrl({
        libraryId,
        objectId,
        versionHash,
        rep: `channel/${offeringKey}/select_view`
      });
      const viewSelectUrlObj = new URL(selectViewUrl);
      viewSelectUrlObj.searchParams.set("sid", sid);

      logger.log();
      logger.log("Sample curl command to select view (sid must be same as in playout URL):");
      logger.log();
      logger.log(`curl -X POST '${viewSelectUrlObj.toString()}' -d '{"view":1}'`);
    }
  }

  header() {
    return `Get test playout URLs for channel object ${this.args.objectId}`;
  }
}

if(require.main === module) {
  Utility.cmdLineInvoke(ChannelGetTestUrls);
} else {
  module.exports = ChannelGetTestUrls;
}
