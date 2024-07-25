/* eslint-disable no-console */
const ScriptBase = require("./parentClasses/ScriptBase");
const utils = require("../src/Utils");
const Fraction = require("fraction.js");
const {JSONPath} = require("jsonpath-plus");
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

class OfferingDownloadMedia extends ScriptBase {
  async body() {
    const client = await this.client();

    let objectId = this.args.objectId;
    const versionHash = this.args.versionHash;
    const offeringKey = this.args.offeringKey;
    const streamKey = this.args.streamKey;
    const startTime = this.args.startTime;
    const endTime = this.args.endTime;
    const out = this.args.out;


    if(objectId === undefined){
      if(versionHash===undefined){
        throw Error("require object-id or object-hash to be provided");
      }
      const res = utils.DecodeVersionHash(versionHash);
      objectId = res.objectId;
    }

    const dirPath = path.resolve(out);
    if(!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
      console.log(`Directory created at ${dirPath}`);
    } else {
      throw Error(`Directory already exists at ${dirPath}`);
    }


    const sourcesJsonPath = "offerings." + offeringKey + ".media_struct.streams.video.sources[*]";
    const libraryId = await client.ContentObjectLibraryId({objectId, versionHash});
    const totalDurationJsonPath = "offerings." + offeringKey + ".media_struct.streams." + streamKey + ".duration";

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
    if(startTime === endTime) {
      throw new Error(`end time needs to be greater than start time, value provided: ${startTime}s`);
    }

    const sourcesTimeInfo = sourcesMetadata.map((part) => {
      // start = part.timeline_start.ts * part.timeline_start.time_base
      const startTimeBase = new Fraction(part.timeline_start.time_base);
      const start = new Fraction(part.timeline_start.ts).mul(startTimeBase);
      // end = part.timeline_start.ts * part.timeline_end.time_base
      const endTimeBase = new Fraction(part.timeline_end.time_base);
      const end = new Fraction(part.timeline_end.ts).mul(endTimeBase);

      return {
        start: start.valueOf(),
        end: end.valueOf(),
        source: part.source
      };
    });

    let parts = [];
    sourcesTimeInfo.forEach(item => {
      if(startTime < item.end && endTime > item.start){
        parts.push(item.source);
      }
    });

    console.log("PARTS:");
    console.log(parts);
    console.log();


    let mtpath = path.join(dirPath, streamKey);
    if(!fs.existsSync(mtpath)) {
      fs.mkdirSync(mtpath, { recursive: true });
      console.log(`Directory created at ${mtpath}`);
    }
    let partsfile = path.join(dirPath, "/parts_" + streamKey + ".txt");

    console.log("Downloading parts...");
    for(const partHash of parts) {
      console.log(partHash);
      const buf = await client.DownloadPart({
        libraryId,
        objectId,
        partHash,
        format: "buffer",
        chunked: false,
        callback: ({bytesFinished, bytesTotal}) => {
          console.log("  progress: ", bytesFinished + "/" + bytesTotal);
        }
      });

      let partFile = path.join(mtpath, partHash + ".mp4");
      fs.appendFile(partFile, buf, (err) => {
        if(err)
          console.log(err);
      });
      fs.appendFile(partsfile, "file '" + streamKey + "/" + partHash + ".mp4'\n", (err) => {
        if(err)
          console.log(err);
      });
    }

    // Concatenate parts into one mp4
    let cmd = "ffmpeg -f concat -safe 0 -i " + partsfile + " -c copy " + dirPath + "/" + streamKey + ".mp4";
    console.log("Running", cmd);
    execSync(cmd);
  }

  header() {
    return `Downloading parts from startTime: ${this.args.startTime}s to endTime: ${this.args.endTime}s`;
  }

  options() {
    return super.options()
      .option("objectId", {
        alias: "object-id",
        describe: "Object ID (should start with 'iq__')",
        type: "string"
      })
      .option("versionHash", {
        alias: "version-hash",
        describe: "Object Version Hash (should start with 'hq__')",
        type: "string"
      })
      .option("offeringKey", {
        describe: "offering key",
        type: "string",
        default: "default",
      })
      .option("streamKey", {
        describe: "offerings stream key: audio/video",
        type: "string",
        default: "video",
      })
      .option("startTime", {
        describe: "start time to retrieve parts",
        demandOption: true,
        type: "number",
      })
      .option("endTime", {
        describe: "end time to retrieve parts",
        demandOption: true,
        type: "number",
      })
      .option("out",{
        describe: "output directory",
        type: "string",
        default: "./out",
      });
  }
}

const script = new OfferingDownloadMedia();
script.run();