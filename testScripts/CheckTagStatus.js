#!/usr/bin/env node

/* eslint-disable no-console */
const fs = require("fs");

const ScriptBase = require("./parentClasses/ScriptBase");


class CheckTagStatus extends ScriptBase {

  async body() {
    const client = await this.client();

    let shortMap = {
      celebrity_detection: "cel",
      object_detection: "obj",
      speech_to_text: "asr",
      optical_character_recognition: "ocr",
      shot_detection: "sho",
      shot_tags: "stg",
      logo_detection: "lgo",
      landmark_recognition: "lmk",
      segment_levels: "seg",
      action_detection: "act"
    }

    var iqs = this.args.iqs;

    if (!iqs) {
      iqs = [ this.args.objectId ]
    }

    for (const objectId of iqs) {

      let files
      let libraryId
      try {
        libraryId = await client.ContentObjectLibraryId({ objectId, });

        files = await client.ContentObjectMetadata({
          libraryId,
          objectId,
          metadataSubtree: "files",
          resolveLinks: false
        });
      }
      catch (e) {
        console.log(`RESULT ${objectId} ${e}`)
        continue
      }

      //console.dir(files, {depth: null});

      let vtfs = files?.video_tags
      if (!vtfs) {
        console.log(`RESULT ${objectId} NO TAGS`)
        continue
      }

      vtfs = Object.keys(vtfs).filter( (e) => e.startsWith("video-tags-tracks-"))

      const tagged = {}

      for (const tagfilename of vtfs) {

        const tagfile = await client.DownloadFile({
          libraryId: libraryId,
          objectId: objectId,
          filePath: `video_tags/${tagfilename}`,
          format: "Buffer",
        });

        let vt = JSON.parse(tagfile)

        //console.dir(vt, {depth: null});
        //console.log(Object.keys(vt.metadata_tags))

        for (const tag in vt.metadata_tags) {
          let cnt = vt.metadata_tags[tag].tags.length
          let cur = tagged[tag]
          if (!cur) cur = 0
          tagged[tag] = cur + cnt
        }

      }

      let sum = "";
      for (const tag in tagged) {
        //if (tagged[tag] == 0) continue
        if (sum) sum += " "
        let shortTag = shortMap[tag]
        if (!shortTag) shortTag = tag
        sum += `${shortTag}:${tagged[tag]}`
      }

      console.log(`RESULT ${objectId} ${Object.keys(tagged).length} ${sum}`)
      //console.dir(vt, {depth: null});


    }
  }

  header() {
    return "";
  }

  footer() {
    return "";
  }

  options() {
    return super.options()
      .option("objectId", {
        alias: "object-id",
        demandOption: false,
        describe: "Object ID (should start with 'iq__')",
        type: "string"
      })
      .option("iqs", {
        alias: "iq-list",
        demandOption: false,
        describe: "List of object IDs",
        type: "array"
      });
  }
}


const script = new CheckTagStatus();
script.run();
