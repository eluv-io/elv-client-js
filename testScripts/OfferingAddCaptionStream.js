/* eslint-disable no-console */

// Adds a caption stream to an ABR offering

const slugify = require("@sindresorhus/slugify");
const countableSlugify = slugify.counter();
const fs = require("fs");
const path = require("path");

const ScriptOffering = require("./parentClasses/ScriptOffering");

const RE_VTT_TIMESTAMP_LINE = /(^.*)([0-9]{2}:[0-9]{2}:[0-9]{2}\.[0-9]{3}) --> ([0-9]{2}:[0-9]{2}:[0-9]{2}\.[0-9]{3})(.*$)/;
const RE_VTT_TIMESTAMP_PARTS = /([0-9]{2}):([0-9]{2}):([0-9]{2}\.[0-9]{3})/;

function zeroPadLeft(value, width) {
  return (value + "").padStart(width, "0");
}

function timeStampShift(timestamp, offset) {
  const match = RE_VTT_TIMESTAMP_PARTS.exec(timestamp);
  const shiftedSeconds = parseInt(match[1],10) * 3600 + parseInt(match[2], 10) * 60 + parseFloat(match[3]) + offset;
  if(shiftedSeconds < 0) {
    throw new Error("timeShift resulted in negative timestamp");
  }

  const hours = Math.floor(shiftedSeconds / 3600);
  const minutes = Math.floor((shiftedSeconds % 3600)/ 60);
  const seconds = Math.floor(shiftedSeconds % 60);
  const milliseconds = Math.floor((shiftedSeconds % 1) * 1000);
  return zeroPadLeft(hours, 2) + ":" + zeroPadLeft(minutes, 2) + ":" + zeroPadLeft(seconds, 2) + "." + zeroPadLeft(milliseconds, 3);
}

function vttLineTimeShift(line, offset) {
  const match = RE_VTT_TIMESTAMP_LINE.exec(line);
  if(match !== null) {
    return match[1] + timeStampShift(match[2], offset) + " --> " + timeStampShift(match[3], offset) + match[4];
  } else {
    return line;
  }
}

function firstVideoStream(offeringMetadata) {
  for(const streamKey in offeringMetadata.media_struct.streams) {
    const stream = offeringMetadata.media_struct.streams[streamKey];
    if(stream.codec_type === "video") {
      return stream;
    }
  }
  throw new Error("No video stream found in offering");
}

function streamKeyFound(offeringMetadata, streamKey) {
  const existsInMediaStruct = offeringMetadata.media_struct.streams.hasOwnProperty(streamKey);
  const existsInPlayout = offeringMetadata.playout.streams.hasOwnProperty(streamKey);
  return existsInMediaStruct || existsInPlayout;
}

class OfferingAddCaptionStream extends ScriptOffering {

  async body() {
    const client = await this.client();

    const libraryId = this.args.libraryId;
    const objectId = this.args.objectId;
    const offeringKey = this.args.offeringKey;
    const filePath = this.args.file;
    const fileName = path.basename(filePath);
    const label = this.args.label;
    const language = this.args.language;
    const timeShift = this.args.timeShift;

    // ===============================================================
    // retrieve metadata from object and validate presence of offering
    // ===============================================================
    let metadata = await client.ContentObjectMetadata({
      libraryId,
      objectId
    });
    this.validateOffering(metadata, offeringKey);

    // ============================================================
    // upload captions as fabric part, timeshifting if needed
    // ============================================================

    // read captions file and apply any time shift
    let originalData = fs.readFileSync(filePath);
    let finalData;
    if(timeShift !== 0) {
      const contentString = originalData.toString("utf8");
      const lines = contentString.split(/\r?\n/);
      const remappedLines = lines.map(x => vttLineTimeShift(x, timeShift));
      finalData = remappedLines.join("\n");
    } else {
      finalData = originalData;
    }

    let editResponse = await client.EditContentObject({
      libraryId,
      objectId
    });
    let writeToken = editResponse.write_token;
    const uploadPartResponse = await client.UploadPart({
      libraryId,
      objectId,
      writeToken,
      data: finalData,
      encryption: "cgck"
    });
    const partHash = uploadPartResponse.part.hash;
    let finalizeResponse = await client.FinalizeContentObject({
      libraryId,
      objectId,
      writeToken
    });
    console.log("Captions uploaded as new part: " + partHash);
    const hashAfterUpload = finalizeResponse.hash;

    // wait for publish to finish before re-reading metadata
    let publishFinished = false;
    let latestObjectData = {};
    while(!publishFinished) {
      latestObjectData = await client.ContentObject({libraryId, objectId});
      if(latestObjectData.hash === hashAfterUpload) {
        publishFinished = true;
      } else {
        console.log("waiting for publish to finish...");
        await new Promise(resolve => setTimeout(resolve, 15 * 1000));
      }
    }

    // =======================================
    // add metadata for caption stream
    // =======================================

    // reload metadata (now includes updated '/eluv-fb.parts' metadata from captions upload)
    metadata = await client.ContentObjectMetadata({
      libraryId,
      versionHash: hashAfterUpload
    });
    this.validateOffering(metadata, offeringKey);

    let offeringMetadata = metadata.offerings[offeringKey];

    // create stream key
    const slugInput = "captions-" + label + fileName;

    let captionStreamKey = countableSlugify(slugInput);
    // make sure key doesn't already exist in media_struct.streams
    while(streamKeyFound(offeringMetadata, captionStreamKey)) {
      // increment slug numeric suffix
      captionStreamKey = countableSlugify(slugInput);
    }
    let captionRepKey = captionStreamKey + "-vtt"; // representation is VTT, append as suffix as convention

    // copy temporal info from video stream
    const vidStream = firstVideoStream(offeringMetadata);
    const timeBase = vidStream.duration.time_base;
    const durationRat = vidStream.duration.rat;
    const durationTs = vidStream.duration.ts;
    const rate = vidStream.rate;

    // construct metadata for caption stream media_struct

    const mediaStructStream = {
      bit_rate: 100,
      codec_name: "none",
      codec_type: "captions",
      duration: {
        time_base: timeBase,
        ts: durationTs
      },
      label: label,
      language: language,
      optimum_seg_dur: {
        "time_base": timeBase,
        "ts": durationTs
      },
      rate: rate,
      sources: [
        {
          duration: {
            time_base: timeBase,
            ts: durationTs
          },
          entry_point: {
            rat: "0",
            time_base: timeBase
          },
          source: partHash,
          timeline_end: {
            rat: durationRat,
            time_base: timeBase
          },
          timeline_start: {
            rat: "0",
            time_base: timeBase
          }
        }
      ],
      start_time: {
        time_base: timeBase,
        ts: 0
      },
      time_base: timeBase
    };

    // construct metadata for caption stream playout

    let playoutStream = {
      encryption_schemes: {},
      representations: {}
    };
    playoutStream.representations[captionRepKey] = {
      bit_rate: 100,
      media_struct_stream_key: captionStreamKey,
      type: "RepCaptions"
    };

    // merge into object offering metadata
    offeringMetadata.media_struct.streams[captionStreamKey] = mediaStructStream;
    offeringMetadata.playout.streams[captionStreamKey] = playoutStream;

    // write back to object
    await this.metadataWrite(metadata);
  }

  header() {
    return "Adding caption stream to offering '" + this.args.offeringKey + "'... ";
  }

  options() {
    return super.options()
      .option("file", {
        alias: "f",
        demandOption: true,
        describe: "Path to VTT file containing captions",
        type: "string"
      })
      .option("label", {
        demandOption: true,
        describe: "Label to display for caption stream",
        type: "string"
      })
      .option("language", {
        alias: "lang",
        demandOption: true,
        describe: "Language code for caption stream (some older players may use this as the label)",
        type: "string"
      })
      .option("timeShift", {
        alias: "time-shift",
        default: 0,
        demandOption: false,
        describe: "Number of seconds to add or (-) subtract from timestamps in captions file",
        type: "number"
      });
  }
}

const script = new OfferingAddCaptionStream;
script.run();