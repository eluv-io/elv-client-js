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

class ChannelStartLiveOffering extends Utility {
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

    const liveSegCount = this.args.liveWindowSize || currentMetadata.channel.offerings[offeringKey].live_seg_count || 3;
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
            playout_type: "ch_live"
          }
        }
      }
    };

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
    this.logger.log("Channel options.json URL:");
    this.logger.log();
    this.logger.log(url);
    this.logger.log();
    this.logger.log("options.json contents:");
    this.logger.log();
    this.logger.logObject(options);

    const offeringUrl = await client.FabricUrl({
      libraryId,
      objectId,
      versionHash: newHash,
      rep: `channel/${offeringKey}/options.json`
    });
    this.logger.log();
    this.logger.log(`Offering '${offeringKey}' options.json URL:`);
    this.logger.log();
    this.logger.log(offeringUrl);

    const viewsUrl = await client.FabricUrl({
      libraryId,
      objectId,
      versionHash: newHash,
      rep: `channel/${offeringKey}/views.json`
    });
    this.logger.log();
    this.logger.log(`Offering '${offeringKey}' current available views URL:`);
    this.logger.log();
    this.logger.log(viewsUrl);

    // NOTE: although following line calls ElvClient.AvailableOfferings(), it is not actually
    // retrieving available offerings, it is retrieving all available playback formats for channel offering
    // (due to handler setting)
    const offeringOptions = await client.AvailableOfferings({
      libraryId,
      objectId,
      versionHash: newHash,
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

      this.logger.log();
      this.logger.log(`Playout URL for format '${playoutFormatKey}':`);
      this.logger.log();
      this.logger.log(playoutUrl.toString());
    }

    const selectViewUrl = await client.FabricUrl({
      libraryId,
      objectId,
      versionHash: newHash,
      rep: `channel/${offeringKey}/select_view`
    });
    const viewSelectUrlObj = new URL(selectViewUrl);
    viewSelectUrlObj.searchParams.set("sid", sid);

    this.logger.log();
    this.logger.log("Sample curl command to select view:");
    this.logger.log();
    this.logger.log(`curl -X POST '${viewSelectUrlObj.toString()}' -d '{"view":1}'`);
  }

  header() {
    return `Start playout of 'live' channel object ${this.args.objectId}${this.args.delay ? ` with ${this.args.delay} second(s) delay` : ""}`;
  }
}

if(require.main === module) {
  Utility.cmdLineInvoke(ChannelStartLiveOffering);
} else {
  module.exports = ChannelStartLiveOffering;
}