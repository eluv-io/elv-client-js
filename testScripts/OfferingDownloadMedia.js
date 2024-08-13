/* eslint-disable no-console */
const ScriptBase = require("./parentClasses/ScriptBase");
const utils = require("../src/Utils");
const Fraction = require("fraction.js");
const {JSONPath} = require("jsonpath-plus");
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

class OfferingDownloadMedia2 extends ScriptBase {

  async body(){

    let objectId=this.args.objectId;
    const versionHash=this.args.versionHash;
    const offeringKey=this.args.offeringKey;
    const streamKey=this.args.streamKey;
    const startTime=this.args.startTime;
    let endTime=this.args.endTime;
    const out=this.args.out;

    if(!objectId && !versionHash) throw new Error("Require object-id or object-hash to be provided");
    if(!objectId) {
      objectId = utils.DecodeVersionHash(versionHash).objectId;
    }

    if(startTime < 0) {
      throw new Error(`start time provided needs to be greater than 0: start=${startTime}s`);
    }
    if(startTime >= endTime) {
      throw new Error(`end time needs to be greater than start time, values provided: start=${startTime}s, end=${endTime}s`);
    }

    const client=await this.client();
    const libraryId=await client.ContentObjectLibraryId({objectId, versionHash});

    // get object metadata
    const metadata = await client.ContentObjectMetadata({ libraryId, objectId });

    const offeringMetadata=JSONPath({
      json: metadata,
      path: `offerings.${offeringKey}`,
      wrap: false
    });

    const transcodesMetadata=JSONPath({
      json:metadata,
      path: "transcodes"
    });

    // Retrieve stream metadata from transcodes or offering metadata
    // Create a map of streamKey => stream metadata
    const streamsMap = Object.fromEntries(
      Object.keys(offeringMetadata.playout.streams).map(streamKey => {
        const info = this.getStreamInfo(offeringMetadata, transcodesMetadata, streamKey);
        if (info === undefined) {
          console.log(`StreamInfo returned undefined for streamKey: ${streamKey}`);
        }
        return [streamKey, info || {}];
      })
    );

    let streamKeyArray = streamKey.split(",").map(key => key.trim()); // trim() to remove any extra spaces
    const streamsMapKeys = new Set(Object.keys(streamsMap));

    // Filter the streamKeyArray to only include keys present in streamsMap
    streamKeyArray = streamKeyArray.filter(key => {
      if (!streamsMapKeys.has(key)) {
        console.warn(`Warning: Stream key "${key}" not found in streamsMap.`);
        return false;
      }
      return true;
    });

    // Retrieve all parts that includes the start and end time for each streamKey
    const partsMap = this.getPartsMap(streamsMap, streamKeyArray, startTime, endTime);
    console.log("PARTS MAP => { parts, minStart, maxEnd } map:", partsMap);

    // handle directories
    const dirPath=path.resolve(out);
    if(!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, {recursive: true});
      console.log(`Directory created at ${dirPath}`);
    } else {
      console.log(`Directory already exists at ${dirPath}`);
    }
    // create directory for object provided : iq_XXX_start-time_end-time
    const contentObjDirPath = path.join(dirPath, `${objectId}_${this.secondsToHms(startTime, "-")}_${this.secondsToHms(endTime, "-")}`);
    if(fs.existsSync(contentObjDirPath)) throw new Error(`Directory already exists at ${contentObjDirPath}`);
    fs.mkdirSync(contentObjDirPath, { recursive: true });
    console.log(`Directory created at ${contentObjDirPath}`);

    const trimmedDirectory = path.join(contentObjDirPath, "trimmed");
    if(!fs.existsSync(trimmedDirectory)) {
      fs.mkdirSync(trimmedDirectory, { recursive: true });
    }

    // Download and concatenate the parts for each streamKey
    // Then, trim the concatenated media
    for(const streamKey of Object.keys(partsMap)) {
      const { parts, minStart, maxEnd } = partsMap[streamKey];
      const partsFile = await this.downloadParts(contentObjDirPath, libraryId, objectId, streamKey, parts);
      console.log(`parts file for ${streamKey}: ${partsFile}\n`);

      // concatenate the parts
      let mediaFile=path.join(contentObjDirPath, `${streamKey}.mp4`);
      let cmd=`ffmpeg -f concat -safe 0 -i ${partsFile} -c copy ${mediaFile}`;
      console.log("Running", cmd);
      try {
        execSync(cmd);
        console.log("Concatenation complete.");
      } catch(error) {
        console.error("Error running ffmpeg:", error);
      }

      // trim the parts
      let trimStartTime=null;
      let trimEndTime=null;
      // since new concatenated video starts from 0s
      if(minStart !== null && maxEnd !== null) {
        trimStartTime=startTime - minStart;
        trimEndTime=endTime - minStart;
      }

      let mediaTrimmedFile=path.join(trimmedDirectory, `${streamKey}_trimmed.mp4`);
      cmd=`ffmpeg -i ${mediaFile} -ss ${this.secondsToHms(trimStartTime, ":")} -t ${this.secondsToHms(trimEndTime - trimStartTime, ":")} ${mediaTrimmedFile}`;
      console.log("Running", cmd);
      try {
        execSync(cmd);
        console.log(`\nTrimmed ${streamKey} file: ${mediaTrimmedFile}`);
      } catch(error) {
        console.error("Error running ffmpeg:", error);
      }

      console.log("================================================");
    }

  }

  getStreamInfo(offering, transcodes, streamKey) {
    const reps = offering.playout.streams[streamKey].representations;
    const rep = reps && Object.values(reps).find(r => r.transcode_id);
    return rep && (transcodes[0] && transcodes[0][rep.transcode_id] && transcodes[0][rep.transcode_id].stream) || offering.media_struct.streams[streamKey];
  }

  getPartsMap(streamsMap, streamKeyArray, startTime, endTime){
    const partsMap = {};

    streamKeyArray.forEach(key => {
      let sourcesMetadata = streamsMap[key].sources;
      let durationMetadata = streamsMap[key].duration;

      const totalDuration = new Fraction(durationMetadata.ts).mul(new Fraction(durationMetadata.time_base));
      if (endTime > totalDuration) {
        console.warn(`Warning: end time exceeds total duration. Setting end time to total duration: ${totalDuration}s`);
        endTime = totalDuration;
      }

      const sourcesTimeInfo = sourcesMetadata.map(part => {
        const start = new Fraction(part.timeline_start.ts).mul(new Fraction(part.timeline_start.time_base));
        const end = new Fraction(part.timeline_end.ts).mul(new Fraction(part.timeline_end.time_base));
        return {
          start: start.valueOf(),
          end: end.valueOf(),
          source: part.source
        };
      });

      let parts = [];
      let minStart = null;
      let maxEnd = null;
      sourcesTimeInfo.forEach(item => {
        if(startTime < item.end && endTime > item.start) {
          parts.push(item.source);
          if (minStart === null || item.start < minStart) {
            minStart = item.start;
          }
          if(maxEnd === null || item.end > maxEnd) {
            maxEnd = item.end;
          }
        }
      });

      partsMap[key] = {
        parts,
        minStart,
        maxEnd
      };
    });
    return partsMap;
  }

  async downloadParts(outDir, libraryId, objectId, streamKey, parts) {

    const mtPath=path.join(outDir, streamKey);
    if(!fs.existsSync(mtPath)) {
      fs.mkdirSync(mtPath, {recursive: true});
      console.log(`Directory created at ${mtPath}`);
    }
    const partsFile=path.join(outDir, `parts_${streamKey}.txt`);
    const client=await this.client();

    console.log("\nDownloading parts...\n");
    for(const [index, partHash] of parts.entries()) {
      let ph=(index + 1).toString().padStart(4, "0") + "." + partHash;
      console.log(`processing ${ph}...`);

      const buf=await client.DownloadPart({
        libraryId,
        objectId,
        partHash,
        format: "buffer",
        chunked: false,
      });

      let partFile=path.join(mtPath, ph + ".mp4");
      fs.appendFileSync(partFile, buf, (err) => {
        if(err) {
          console.log(err);
        }
      });

      fs.appendFileSync(partsFile, `file '${partFile}'\n`, (err) => {
        if(err) {
          console.log(err);
        }
      });
    }
    return partsFile;
  }

  secondsToHms(seconds, separator) {
    const date=new Date(seconds * 1000);
    const hh=String(date.getUTCHours()).padStart(2, "0");
    const mm=String(date.getUTCMinutes()).padStart(2, "0");
    const ss=String(date.getUTCSeconds()).padStart(2, "0");
    const ms=String(date.getUTCMilliseconds()).padStart(3, "0");
    return `${hh}${separator}${mm}${separator}${ss}.${ms}`;
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
        describe: "comma separated list of offerings stream key",
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

const script = new OfferingDownloadMedia2();
script.run();