/* eslint-disable no-console */

const ScriptBase = require("./parentClasses/ScriptBase");
const Validator = require("./parentClasses/Validator");

class ProductionMasterInfo extends ScriptBase {
  async body() {
    const client = await this.client();

    const libraryId = this.args.libraryId;
    const objectId = this.args.objectId;

    // get object metadata
    let metadata = await client.ContentObjectMetadata({
      libraryId,
      objectId
    });

    const V = new Validator;
    const omMaster = V.FabricProductionMaster(metadata);
    console.log("  Name:        " + (omMaster.public.name || ""));
    console.log("  IP Title ID: " + (omMaster.public.asset_metadata.ip_title_id || ""));
    console.log("  Description: " + (omMaster.public.description || ""));

    const sources = omMaster.production_master.sources;
    if(sources) {
      console.log("  SOURCES:");
      for(const sourceFileName in sources) {
        const source = sources[sourceFileName];
        console.log("    " + sourceFileName + "  (duration: " + source.container_format.duration + ")");
        for(const [streamIndex, stream] of source.streams.entries()) {
          console.log("      " + streamIndex + ": " + stream.type);
          switch(stream.type) {
            case "StreamAudio":
              console.log("           channel_layout: " + stream.channel_layout);
              console.log("           channels:       " + stream.channels);
              console.log("           sample_rate:    " + stream.sample_rate);
              break;
            case "StreamVideo":
              console.log("           display_aspect_ratio: " + stream.display_aspect_ratio);
              console.log("           height:               " + stream.height);
              console.log("           frame_rate:           " + stream.frame_rate);
              console.log("           sample_aspect_ratio:  " + stream.sample_aspect_ratio);
              console.log("           time_base:            " + stream.time_base);
              console.log("           width:                " + stream.width);
              break;
            default:
            // nothing
          }
        }
      }
    }
    const variants = omMaster.production_master.variants;
    if(variants) {
      console.log("  VARIANTS:");
      for(const variantKey in variants) {
        const variant = variants[variantKey];
        console.log("    " + variantKey);
        console.log("    STREAMS:");
        for(const streamKey in variant.streams) {
          const stream = variant.streams[streamKey];
          console.log("      " + streamKey);
          console.log("        default_for_media_type: " + stream.default_for_media_type);
          console.log("        label:                  " + stream.label);
          console.log("        language:               " + stream.language);
          console.log("        mapping_info:           " + stream.mapping_info);
          console.log("        SOURCES:");
          for(const [sourceIndex, source] of stream.sources.entries()) {
            console.log("          " + sourceIndex + ":");
            console.log("            files_api_path: " + source.files_api_path);
            console.log("            stream_index:   " + source.stream_index);
          }
        }
      }
    }
  }

  header() {
    return "Showing info for production master " + this.args.objectId + "... ";
  }

  options() {
    return super.options()
      .option("libraryId", {
        alias: "library-id",
        demandOption: true,
        describe: "Library ID (should start with 'ilib')",
        type: "string"
      })
      .option("objectId", {
        alias: "object-id",
        demandOption: true,
        describe: "Object ID (should start with 'iq__')",
        type: "string"
      });
  }
}

const script = new ProductionMasterInfo;
script.run();