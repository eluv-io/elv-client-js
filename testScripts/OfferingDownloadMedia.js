/* eslint-disable no-console */
const ScriptBase = require("./parentClasses/ScriptBase");
const utils = require("../src/Utils");
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

class OfferingDownloadMedia extends ScriptBase {

  async body(){

    let objectId=this.args.objectId;
    const versionHash=this.args.versionHash;
    const offeringKey=this.args.offeringKey;
    const streamKey=this.args.streamKey;
    const out=this.args.out;

    if(!objectId && !versionHash) throw new Error("Require object-id or object-hash to be provided");
    if(!objectId) {
      objectId = utils.DecodeVersionHash(versionHash).objectId;
    }

    const client=await this.client();
    const libraryId=await client.ContentObjectLibraryId({objectId, versionHash});

    // get object metadata
    const metadata = await client.ContentObjectMetadata({ libraryId, objectId, versionHash });

    const offeringMetadata = metadata.offerings && metadata.offerings[offeringKey];
    if(!offeringMetadata) {
      throw new Error(`Offering "${offeringKey}" not found`);
    }

    const transcodesMetadata = metadata.transcodes || {};

    const streamKeyArray = streamKey.split(",").map(key => key.trim()).filter(Boolean);
    const partsMap = Object.fromEntries(streamKeyArray.map(key => {
      const transcodeParts = this.getTranscodeParts(offeringMetadata, transcodesMetadata, key);
      console.log(`Stream "${key}" uses transcode ${transcodeParts.transcodeId} (${transcodeParts.parts.length} parts)`);

      return [key, transcodeParts.parts];
    }));

    // handle directories
    const dirPath=path.resolve(out);
    if(!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, {recursive: true});
      console.log(`Directory created at ${dirPath}`);
    } else {
      console.log(`Directory already exists at ${dirPath}`);
    }
    const contentObjDirPath = path.join(dirPath, `${objectId}_${offeringKey}`);
    if(!fs.existsSync(contentObjDirPath)) {
      fs.mkdirSync(contentObjDirPath, { recursive: true });
      console.log(`Directory created at ${contentObjDirPath}`);
    }

    // Download and concatenate all parts for each stream key.
    for(const [streamKey, parts] of Object.entries(partsMap)) {
      const partsFile = await this.downloadParts(contentObjDirPath, libraryId, objectId, versionHash, streamKey, parts);
      console.log(`parts file for ${streamKey}: ${partsFile}\n`);

      // concatenate the parts
      const mediaFile=path.join(contentObjDirPath, `${streamKey}.mp4`);
      const ffmpegArgs = ["-f", "concat", "-safe", "0", "-i", partsFile, "-c", "copy", mediaFile];
      console.log("Running", "ffmpeg", ffmpegArgs.join(" "));
      try {
        execFileSync("ffmpeg", ffmpegArgs, {stdio: "inherit"});
        console.log("Concatenation complete.");
      } catch(error) {
        console.error("Error running ffmpeg:", error);
      }

      console.log("================================================");
    }

  }

  getTranscodeParts(offering, transcodes, streamKey) {
    const playoutStream = offering.playout && offering.playout.streams && offering.playout.streams[streamKey];
    if(!playoutStream) {
      const availableStreams = Object.keys(offering.playout && offering.playout.streams || {});
      throw new Error(`Stream "${streamKey}" not found. Available streams: ${availableStreams.join(", ")}`);
    }

    const representations = Object.values(playoutStream.representations || {});
    const representation = representations.find(rep => rep.transcode_matches_rep && rep.transcode_id) ||
      representations.find(rep => rep.transcode_id);
    if(!representation) {
      throw new Error(`No transcode ID found for stream "${streamKey}"`);
    }

    const transcodeId = representation.transcode_id;
    const transcode = transcodes[transcodeId];
    if(!transcode) {
      throw new Error(`Transcode "${transcodeId}" for stream "${streamKey}" not found in metadata.transcodes`);
    }

    // Current metadata stores sources as [partHash, durationTs]. Keep support
    // for the older {source: partHash} representation as well.
    const sources = transcode.stream && transcode.stream.sources;
    const rawParts = Array.isArray(sources) && sources.length > 0
      ? sources
      : transcode.mez_prep_spec && transcode.mez_prep_spec.part_hashes;
    if(!Array.isArray(rawParts) || rawParts.length === 0) {
      throw new Error(`No parts found for stream "${streamKey}" in transcode "${transcodeId}"`);
    }

    const parts = rawParts.map((part, index) => {
      const partHash = Array.isArray(part) ? part[0] : (typeof part === "string" ? part : part.source);
      if(typeof partHash !== "string" || !partHash) {
        throw new Error(`Invalid part entry ${index + 1} for stream "${streamKey}" in transcode "${transcodeId}"`);
      }

      return partHash;
    });

    return {transcodeId, parts};
  }

  async downloadParts(outDir, libraryId, objectId, versionHash, streamKey, parts) {
    const mtPath=path.join(outDir, streamKey);
    if(!fs.existsSync(mtPath)) {
      fs.mkdirSync(mtPath, {recursive: true});
      console.log(`Directory created at ${mtPath}`);
    } else {
      throw new Error(`Directory already exists at ${mtPath}`);
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
        versionHash,
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

  header() {
    return `Downloading all parts for streams: ${this.args.streamKey}`;
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
        alias: "offering-key",
        describe: "offering key",
        type: "string",
        default: "default",
      })
      .option("streamKey", {
        alias: "stream-key",
        describe: "comma separated list of offerings stream key",
        type: "string",
        default: "video",
      })
      .option("out",{
        describe: "output directory",
        type: "string",
        default: "./out",
      });
  }
}

if(require.main === module) {
  const script = new OfferingDownloadMedia();
  script.run();
} else {
  module.exports = OfferingDownloadMedia;
}
