/* eslint-disable no-console */
const fs = require("fs");

const ScriptBase = require("./parentClasses/ScriptBase");

class CheckTagStatus extends ScriptBase {

  async body() {
    const client = await this.client();
    
    var iqs = this.args.iqs;

    if (!iqs) {
      iqs = [ this.args.objectId ]
    }
    
    for (const objectId of iqs) {

      const libraryId = await client.ContentObjectLibraryId({ objectId, });
      
      let files = await client.ContentObjectMetadata({
        libraryId,
        objectId,
        metadataSubtree: "files",
        resolveLinks: false
      });
      
      //console.dir(files, {depth: null});
            
      let vtfs = files?.video_tags
      if (!vtfs) {
        console.log(`RESULT ${objectId} NO TAGS`)
        continue
      }

      //console.log(Object.keys(vtfs))
      
      if (!vtfs["video-tags-tracks-0000.json"]) {
        console.log(`RESULT ${objectId} NO TAGS0`)
        continue
      }
            
      const tagfile = await client.DownloadFile({
        libraryId: libraryId,
        objectId: objectId,
        filePath: "video_tags/video-tags-tracks-0000.json",
        format: "Buffer",
      });
      
      let vt = JSON.parse(tagfile)
      
      //console.dir(vt, {depth: null});
      
      
      console.log(`RESULT ${objectId} ${Object.keys(vt.metadata_tags).length}`)
    }
  }
  
  header() {
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
