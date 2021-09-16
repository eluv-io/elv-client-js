// convert an offering to a just-started VoD-as-Live item

const kindOf = require("kind-of");
const Fraction = require("fraction.js");
const R = require("ramda");

const Utility = require("./lib/Utility");

const {NewOpt} = require("./lib/options");
const {PositiveInteger} = require("./lib/models/Models");

const Client = require("./lib/concerns/Client");
const ExistObj = require("./lib/concerns/ExistObj");
const Metadata = require("./lib/concerns/Metadata");

class ChannelStartVaLOffering extends Utility {
  blueprint() {
    return {
      concerns: [Client, ExistObj, Metadata],
      options: [
        NewOpt("delay",
          {
            default: 0,
            descTemplate: "Number of seconds to delay start. Use a negative number to jump to middle/end of playout",
            type: "number"
          }),
        NewOpt("liveEndTol",
          {
            coerce: PositiveInteger,
            descTemplate: "Number of seconds after end of playout to allow request of live media playlist",
            type: "number"
          }),
        NewOpt("liveWindowSize",
          {
            coerce: PositiveInteger,
            descTemplate: "Number of segments to return in live media playlist",
            type: "number"
          }),
        NewOpt("offeringKey",
          {
            default: "default",
            descTemplate: "Which offering within channel to start",
            type: "string"
          })
      ]
    };
  }

  async body() {
    const logger = this.logger;

    // operations that need to wait on network access
    // ----------------------------------------------------
    const {delay, libraryId, objectId, offeringKey} = await this.concerns.ExistObj.argsProc();

    const client = await this.concerns.Client.get();

    logger.log("Retrieving existing metadata from object...");
    const currentMetadata = await this.concerns.ExistObj.metadata();

    if(!currentMetadata.channel) {
      throw Error("/channel not found in object metadata");
    }

    if(!currentMetadata.channel.offerings) {
      throw Error("/channel/offerings not found in object metadata");
    }

    if(!currentMetadata.channel.offerings[offeringKey]) {
      throw Error(`/channel/offerings/${offeringKey} not found in object metadata`);
    }

    if(!currentMetadata.channel.offerings[offeringKey].items) {
      throw Error(`/channel/offerings/${offeringKey}/items not found in object metadata`);
    }
    if(kindOf(currentMetadata.channel.offerings[offeringKey].items) !== "array") {
      throw Error(`/channel/offerings/${offeringKey}/items in object metadata is not an array`);
    }
    if(currentMetadata.channel.offerings[offeringKey].items.length === 0) {
      throw Error(`/channel/offerings/${offeringKey}/items in object metadata is empty`);
    }

    const totalDur = currentMetadata.channel.offerings[offeringKey].items.reduce(
      (total, value) => total + Fraction(value.duration_rat).valueOf(),
      0
    );

    // get item list from channel offering, get an auth token for each to include in playout URLs
    const mezAuthTokens = [];
    const items = currentMetadata.channel.offerings[offeringKey].items;

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


    const liveSegCount = this.args.liveWindowSize || currentMetadata.channel.offerings[offeringKey].live_seg_count || 60;
    const liveEndTol = this.args.liveEndTolerance || currentMetadata.channel.offerings[offeringKey].live_end_tol || 300;

    const now = new Date;  // ).toISOString();
    const startTime = new Date(now.setSeconds(now.getSeconds() + delay));
    const startTimeISO = startTime.toISOString();
    const endTimeISO = new Date(startTime.setSeconds(startTime.getSeconds() + totalDur)).toISOString();

    const metadataToMerge = {
      channel: {
        offerings: {
          [offeringKey]: {
            live_end_time: endTimeISO,
            live_end_tol: liveEndTol,
            live_seg_count: liveSegCount,
            live_start_time: startTimeISO,
            playout_type: "ch_val"
          }
        }
      }
    };

    const metadata = R.mergeDeepRight(currentMetadata, metadataToMerge);

    // Write back metadata
    const versionHash = await this.concerns.Metadata.write({
      libraryId,
      metadata,
      objectId
    });

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
    logger.log("Channel options.json URL:");
    logger.log();
    logger.log(url);

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
    const urlBase = offUrlObj.origin + offUrlObj.pathname;
    const authToken = offUrlObj.searchParams.get("authorization");
    let sid = "";
    for(const [playoutFormatKey, playoutFormatInfo] of Object.entries(offeringOptions)) {
      const pfUrlObj = new URL(playoutFormatInfo.uri, urlBase);
      sid = pfUrlObj.searchParams.get("sid");
      const playoutUrl = new URL(playoutFormatInfo.uri, urlBase);
      playoutUrl.searchParams.set("authorization", authToken);
      mezAuthTokens.forEach(t => playoutUrl.searchParams.append("authorization", t));
      playoutUrl.searchParams.set("sid", sid);

      logger.log();
      logger.log(`Sample playout URL for format '${playoutFormatKey}':`);
      logger.log();
      logger.log(playoutUrl.toString());
    }

    const multiviewPresent = currentMetadata.channel.offerings[offeringKey].multiview &&
      !R.empty(currentMetadata.channel.offerings[offeringKey].multiview);
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
    return `Start playout of simulated live channel object ${this.args.objectId}${this.args.delay ? ` with ${this.args.delay} second(s) delay` : ""}`;
  }
}

if(require.main === module) {
  Utility.cmdLineInvoke(ChannelStartVaLOffering);
} else {
  module.exports = ChannelStartVaLOffering;
}
