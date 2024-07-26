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
    const client=await this.client();

    let objectId=this.args.objectId;
    const versionHash=this.args.versionHash;
    const offeringKey=this.args.offeringKey;
    const streamKey=this.args.streamKey;
    const startTime=this.args.startTime;
    let endTime=this.args.endTime;
    const out=this.args.out;


    if(objectId === undefined) {
      if(versionHash === undefined) {
        throw Error("require object-id or object-hash to be provided");
      }
      const res=utils.DecodeVersionHash(versionHash);
      objectId=res.objectId;
    }

    const dirPath=path.resolve(out);
    if(!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, {recursive: true});
      console.log(`Directory created at ${dirPath}`);
    } else {
      throw Error(`Directory already exists at ${dirPath}`);
    }


    const sourcesJsonPath="offerings." + offeringKey + ".media_struct.streams.video.sources[*]";
    const libraryId=await client.ContentObjectLibraryId({objectId, versionHash});
    const totalDurationJsonPath="offerings." + offeringKey + ".media_struct.streams." + streamKey + ".duration";

    // get object metadata
    let metadata=await client.ContentObjectMetadata({
      libraryId,
      objectId
    });

    let sourcesMetadata=JSONPath({
      json: metadata,
      path: sourcesJsonPath,
      wrap: false
    });
    if(sourcesMetadata === undefined) {
      throw new Error("no matching offerings metadata found");
    }

    let totalDurationMetadata=JSONPath({
      json: metadata,
      path: totalDurationJsonPath,
      wrap: false
    });
    if(totalDurationMetadata === undefined) {
      throw new Error("no matching total duration metadata found");
    }

    const totalDurationTimeBase=new Fraction(totalDurationMetadata.time_base);
    const totalDuration=new Fraction(totalDurationMetadata.ts).mul(totalDurationTimeBase);
    if(startTime < 0) {
      throw new Error(`start time provided needs to be greater than 0: start=${startTime}s`);
    }
    if(startTime >= endTime) {
      throw new Error(`end time needs to be greater than start time, values provided: start=${startTime}s, end=${endTime}s`);
    }
    if(endTime > totalDuration) {
      console.warn(`end time exceeds total duration. Setting end time to total duration: ${totalDuration}s`);
      endTime=totalDuration;
    }

    const sourcesTimeInfo=sourcesMetadata.map((part) => {
      // start = part.timeline_start.ts * part.timeline_start.time_base
      const startTimeBase=new Fraction(part.timeline_start.time_base);
      const start=new Fraction(part.timeline_start.ts).mul(startTimeBase);
      // end = part.timeline_start.ts * part.timeline_end.time_base
      const endTimeBase=new Fraction(part.timeline_end.time_base);
      const end=new Fraction(part.timeline_end.ts).mul(endTimeBase);

      return {
        start: start.valueOf(),
        end: end.valueOf(),
        source: part.source
      };
    });

    let parts=[];
    // for trimming video
    let minStart=null;
    let maxEnd=null;
    sourcesTimeInfo.forEach(item => {
      if(startTime < item.end && endTime > item.start) {
        parts.push(item.source);
        if(minStart === null || item.start < minStart) {
          minStart=item.start;
        }
        if(maxEnd === null || item.end > maxEnd) {
          maxEnd=item.end;
        }
      }
    });

    console.log("PARTS:");
    console.log(parts);
    console.log();


    let mtpath=path.join(dirPath, streamKey);
    if(!fs.existsSync(mtpath)) {
      fs.mkdirSync(mtpath, {recursive: true});
      console.log(`Directory created at ${mtpath}`);
    }
    let partsfile=path.join(dirPath, "/parts_" + streamKey + ".txt");

    console.log("Downloading parts...");
    for(const [index, partHash] of parts.entries()) {
      let ph=(index + 1).toString().padStart(4, "0") + "." + partHash;
      console.log(`processing ${ph}...`);
      const buf=await client.DownloadPart({
        libraryId,
        objectId,
        partHash,
        format: "buffer",
        chunked: false,
        callback: ({bytesFinished, bytesTotal}) => {
          console.log("  progress: ", bytesFinished + "/" + bytesTotal);
        }
      });

      let partFile=path.join(mtpath, ph + ".mp4");
      console.log("partFile:", partFile);
      fs.appendFileSync(partFile, buf, (err) => {
        if(err) {
          console.log(err);
        }
      });

      fs.appendFileSync(partsfile, `file '${partFile}'\n`, (err) => {
        if(err) {
          console.log(err);
        }
      });
    }

    console.log("partsFile:", partsfile);
    // console.log("partsfile content:", fs.readFileSync(partsfile, "utf8"));

    // Concatenate parts into one mp4
    let cmd=`ffmpeg -f concat -safe 0 -i ${partsfile} -c copy ${path.join(dirPath, streamKey + ".mp4")}`;
    console.log("Running", cmd);
    try {
      execSync(cmd);
      console.log("Concatenation complete.");
    } catch(error) {
      console.error("Error running ffmpeg:", error);
    }

    const secondsToHms=function(seconds, separator) {
      const date=new Date(seconds * 1000);
      const hh=String(date.getUTCHours()).padStart(2, "0");
      const mm=String(date.getUTCMinutes()).padStart(2, "0");
      const ss=String(date.getUTCSeconds()).padStart(2, "0");
      const ms=String(date.getUTCMilliseconds()).padStart(3, "0");
      return `${hh}${separator}${mm}${separator}${ss}.${ms}`;
    };

    let trimStartTime=null;
    let trimEndTime=null;
    // since new concatenated video starts from 0s
    if(minStart !== null && maxEnd !== null) {
      trimStartTime=startTime - minStart;
      trimEndTime=endTime - minStart;
    }
    const trimDuration=trimEndTime - trimStartTime;
    console.log(`Duration to be trimmed in concatenated MP4 file:${trimDuration}s`);

    let trimmedOutputFile=path.join(dirPath, streamKey + "_" + secondsToHms(startTime, "-") + "_" + secondsToHms(endTime, "-") + ".mp4");
    // Trim the MP4 file to the specified start and end times
    cmd=`ffmpeg -i ${path.join(dirPath, streamKey + ".mp4")} -ss ${secondsToHms(trimStartTime, ":")} -to ${secondsToHms(trimEndTime, ":")} -c copy ${trimmedOutputFile}`;
    console.log("Running", cmd);
    try {
      execSync(cmd);
      console.log(`Trimmed file: ${trimmedOutputFile}`);
    } catch(error) {
      console.error("Error running ffmpeg:", error);
    }
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
        describe: "start time to retrieve parts in seconds",
        demandOption: true,
        type: "number",
      })
      .option("endTime", {
        describe: "end time to retrieve parts in seconds",
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