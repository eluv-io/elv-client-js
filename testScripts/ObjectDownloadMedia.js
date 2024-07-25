/* eslint-disable no-console */
const ScriptBase = require("./parentClasses/ScriptBase");
const utils = require("../src/Utils");
const Fraction = require("fraction.js");
const {JSONPath} = require("jsonpath-plus");

class ObjectDownloadMedia extends ScriptBase {
  async body() {
    const client = await this.client();

    let objectId = this.args.objectId;
    const versionHash = this.args.objectHash;
    const offeringType = this.args.offeringType || "default";
    const startTime = this.args.startTime;
    const endTime = this.args.endTime;

    if(objectId === undefined){
      if(versionHash===undefined){
        throw Error("require object-id or object-hash to be provided");
      }
      const res = utils.DecodeVersionHash(versionHash);
      objectId = res.objectId;
    }

    const sourcesJsonPath = "offerings." + offeringType + ".media_struct.streams.video.sources[*]";
    const libraryId = await client.ContentObjectLibraryId({objectId, versionHash});
    const totalDurationJsonPath = "offerings." + offeringType + ".media_struct.streams.video.duration";

    // get object metadata
    let metadata = await client.ContentObjectMetadata({
      libraryId,
      objectId
    });

    let sourcesMetadata = JSONPath({
      json: metadata,
      path: sourcesJsonPath,
      wrap: false
    });
    if(sourcesMetadata === undefined) {
      throw new Error("no matching offerings metadata found");
    }

    let totalDurationMetadata = JSONPath({
      json: metadata,
      path: totalDurationJsonPath,
      wrap: false
    });
    if(totalDurationMetadata === undefined) {
      throw new Error("no matching total duration metadata found");
    }

    const totalDurationTimeBase = new Fraction(totalDurationMetadata.time_base);
    const totalDuration = new Fraction(totalDurationMetadata.ts).mul(totalDurationTimeBase);
    if(startTime < 0 || endTime > totalDuration) {
      throw new Error(`start or end time provided are not within range: ${totalDuration}s`);
    }

    const sourcesTimeInfo = sourcesMetadata.map((item) => {
      // start = item.timeline_start.ts * item.timeline_start.time_base
      const startTimeBase = new Fraction(item.timeline_start.time_base);
      const start = new Fraction(item.timeline_start.ts).mul(startTimeBase);
      // end = item.timeline_start.ts * item.timeline_end.time_base
      const endTimeBase = new Fraction(item.timeline_end.time_base);
      const end = new Fraction(item.timeline_end.ts).mul(endTimeBase);

      return {
        start: start.valueOf(),
        end: end.valueOf(),
        source: item.source
      };
    });

    let parts = [];
    sourcesTimeInfo.forEach(item => {
      if(startTime < item.end && endTime > item.start){
        parts.push(item.source);
      }
    });
    console.log(parts);
  }

  header() {
    return `Downloading parts for objectId ${this.args.objectId} from startTime: ${this.args.startTime}s to endTime: ${this.args.endTime}s`;
  }

  options() {
    return super.options()
      .option("objectId", {
        alias: "object-id",
        describe: "Object ID (should start with 'iq__')",
        type: "string"
      })
      .option("objectHash", {
        alias: "object-hash",
        describe: "Object Hash (should start with 'hq__')",
        type: "string"
      })
      .option("offeringType", {
        describe: "offerings type (default: 'default')",
        type: "string",
      })
      .option("startTime", {
        describe: "start time to retrieve parts",
        type: "number"
      })
      .option("endTime", {
        describe: "end time to retrieve parts",
        type: "number"
      });
  }
}

const script = new ObjectDownloadMedia();
script.run();