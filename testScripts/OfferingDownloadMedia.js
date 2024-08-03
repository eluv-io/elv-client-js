/* eslint-disable no-console */
const ScriptBase = require("./parentClasses/ScriptBase");
const utils = require("../src/Utils");
const Fraction = require("fraction.js");
const {JSONPath} = require("jsonpath-plus");
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

class OfferingDownloadMedia extends ScriptBase {

  async body(){

    let objectId=this.args.objectId;
    const versionHash=this.args.versionHash;
    const offeringKey=this.args.offeringKey;
    const streamKey=this.args.streamKey;
    const startTime=this.args.startTime;
    let endTime=this.args.endTime;
    const out=this.args.out;

    const client=await this.client();
    const libraryId=await client.ContentObjectLibraryId({objectId, versionHash});
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
      console.log(`Directory already exists at ${dirPath}`);
    }

    let contentObjDirPath=path.join(dirPath, objectId + "_" + this.secondsToHms(startTime, "-") + "_" + this.secondsToHms(endTime, "-"));
    if(!fs.existsSync(contentObjDirPath)) {
      fs.mkdirSync(contentObjDirPath, {recursive: true});
      console.log(`Directory created at ${contentObjDirPath}`);
    } else {
      throw new Error(`Directory already exists at ${contentObjDirPath}`);
    }

    // get object metadata
    let metadata=await client.ContentObjectMetadata({
      libraryId,
      objectId
    });

    let audioFile, videoFile, mediaFile;
    let minStart, maxEnd; // for trimmed video
    if(streamKey === "both"){
      try {
        ({mediaFile,minStart,maxEnd} = await this.processAudioOrVideoStream({
          libraryId,
          objectId,
          metadata,
          streamKey: "video",
          offeringKey,
          startTime,
          endTime,
          out: contentObjDirPath,
        }));
        videoFile = mediaFile;
        console.log("VIDEO MEDIA FILE:", mediaFile);
      } catch(error) {
        console.error("Error processing video:", error);
      }

      try {
        ({mediaFile,minStart,maxEnd} = await this.processAudioOrVideoStream({
          libraryId,
          objectId,
          metadata,
          streamKey: "audio",
          offeringKey,
          startTime,
          endTime,
          out: contentObjDirPath,
        }));
        audioFile = mediaFile;
        console.log("AUDIO MEDIA FILE:", mediaFile);
      } catch(error) {
        console.error("Error processing video:", error);
      }
    } else if((streamKey === "audio") || (streamKey === "video")) {
      try {
        ({mediaFile,minStart,maxEnd} = await this.processAudioOrVideoStream({
          libraryId,
          objectId,
          metadata,
          streamKey,
          offeringKey,
          startTime,
          endTime,
          out: contentObjDirPath,
        }));

        if(streamKey === "audio"){
          audioFile = mediaFile;
        } else {
          videoFile = mediaFile;
        }
        console.log(`${streamKey} MEDIA FILE:`, mediaFile);
      } catch(error) {
        console.error("Error processing video:", error);
      }
    } else {
      throw new Error("invalid streamKey: " + streamKey);
    }

    let audioVideoFile;
    if(audioFile !== "" && videoFile !== ""){
      audioVideoFile=path.join(contentObjDirPath, "out.mp4");
      let cmd=`ffmpeg -i ${videoFile} -i ${audioFile} -c:v copy -c:a copy -map 0:v -map 1:a ${audioVideoFile}`;
      console.log("Running", cmd);
      try {
        execSync(cmd);
        console.log("Concatenation complete.");
      } catch(error) {
        console.error("Error running ffmpeg:", error);
      }
    }

    if(audioVideoFile !== ""){
      try {
        await this.trimAudioVideoFiles({
          mediaFile: audioVideoFile,
          startTime,
          endTime,
          minStart,
          maxEnd,
          out: contentObjDirPath,
        });
      } catch(error) {
        console.error(error);
      }
    } else if(audioFile !== ""){
      try {
        await this.trimAudioVideoFiles({
          mediaFile: audioFile,
          startTime,
          endTime,
          minStart,
          maxEnd,
          out: contentObjDirPath,
        });
      } catch(error) {
        console.error(error);
      }
    } else if(videoFile !== ""){
      try {
        await this.trimAudioVideoFiles({
          mediaFile: videoFile,
          startTime,
          endTime,
          minStart,
          maxEnd,
          out: contentObjDirPath,
        });
      } catch(error) {
        console.error(error);
      }
    }

  }

  async processAudioOrVideoStream({
    libraryId,
    objectId,
    metadata,
    streamKey,
    offeringKey,
    startTime,
    endTime,
    out}) {

    let sourcesJsonPath="offerings." + offeringKey + ".media_struct.streams." + streamKey + ".sources[*]";
    let totalDurationJsonPath="offerings." + offeringKey + ".media_struct.streams." + streamKey + ".duration";

    const sourcesMetadata=JSONPath({
      json: metadata,
      path: sourcesJsonPath,
      wrap: false
    });
    if(sourcesMetadata === undefined) {
      throw new Error(`no matching ${offeringKey}_${streamKey} offerings metadata found`);
    }
    //console.log(sourcesMetadata);

    const totalDurationMetadata=JSONPath({
      json: metadata,
      path: totalDurationJsonPath,
      wrap: false
    });
    if(totalDurationMetadata === undefined) {
      throw new Error("no matching total duration metadata found");
    }
    //console.log(totalDurationMetadata);

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
    // for trimming video/audio
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

    console.log(`${streamKey} PARTS:`);
    console.log(parts);
    console.log();

    // ========================================

    const mtPath=path.join(out, streamKey);
    if(!fs.existsSync(mtPath)) {
      fs.mkdirSync(mtPath, {recursive: true});
      console.log(`Directory created at ${mtPath}`);
    }
    const partsFile=path.join(out, "/parts_" + streamKey + ".txt");
    console.log("partsFile:", partsFile);

    const client=await this.client();
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

      let prtFile=path.join(mtPath, ph + ".mp4");
      console.log("partFile:", prtFile);
      fs.appendFileSync(prtFile, buf, (err) => {
        if(err) {
          console.log(err);
        }
      });

      fs.appendFileSync(partsFile, `file '${prtFile}'\n`, (err) => {
        if(err) {
          console.log(err);
        }
      });
    }

    console.log("partsFile:", partsFile);
    // console.log("partsfile content:", fs.readFileSync(videoPartsFile, "utf8"));

    let mediaFile=path.join(out, streamKey + ".mp4");
    let cmd=`ffmpeg -f concat -safe 0 -i ${partsFile} -c copy ${mediaFile}`;
    console.log("Running", cmd);
    try {
      execSync(cmd);
      console.log("Concatenation complete.");
      console.log(mediaFile);
    } catch(error) {
      console.error("Error running ffmpeg:", error);
    }

    return {mediaFile, minStart, maxEnd};
  }

  async trimAudioVideoFiles({
    mediaFile,
    startTime,
    endTime,
    minStart,
    maxEnd,
    out,
  }){
    let trimStartTime=null;
    let trimEndTime=null;
    // since new concatenated video starts from 0s
    if(minStart !== null && maxEnd !== null) {
      trimStartTime=startTime - minStart;
      trimEndTime=endTime - minStart;
    }
    const trimDuration=trimEndTime - trimStartTime;
    console.log(`Duration to be trimmed in concatenated MP4 file:${trimDuration}s`);

    let trimmedOutputFile=path.join(out, "out_" + this.secondsToHms(startTime, "-") + "_" + this.secondsToHms(endTime, "-") + ".mp4");
    // Trim the MP4 file to the specified start and end times
    let cmd=`ffmpeg -i ${mediaFile} -ss ${this.secondsToHms(trimStartTime, ":")} -to ${this.secondsToHms(trimEndTime, ":")} ${trimmedOutputFile}`;
    console.log("Running", cmd);
    try {
      execSync(cmd);
      console.log(`\nTrimmed file: ${trimmedOutputFile}`);
      console.log(`Duration of MP4 file: ${trimDuration}s`);
    } catch(error) {
      console.error("Error running ffmpeg:", error);
    }
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
        describe: "offerings stream key: audio/video/both",
        type: "string",
        default: "both",
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