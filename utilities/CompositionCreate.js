const R = require("ramda");

const {ModOpt, NewOpt, StdOpt} = require("./lib/options");
const Utility = require("./lib/Utility");

const ArgLibraryId = require("./lib/concerns/ArgLibraryId");
const ArgType = require("./lib/concerns/ArgType");
const FabricObject = require("./lib/concerns/FabricObject");
const Version = require("./lib/concerns/Version");

const STREAM_FIELDS = [
  "aspect_ratio",
  "channel_layout",
  "channels",
  "codec_name",
  "codec_type",
  "height",
  "rate",
  "width"
];

const itemParser = itemStr => {
  const parsed = itemStr.split("/");
  if(parsed.length !== 2) throw Error(`Failed to parse item '${itemStr} - each item should be a version hash + slash + offering key, e.g. 'hq__1234/default'`);
  return {hash: parsed[0], offering: parsed[1]};
};

const mediaStructStreamFields = R.pick(STREAM_FIELDS);

const msStreamsFieldSubset = R.map(mediaStructStreamFields);

// return media_struct stream keys appearing in playout.streams.representations (usually only 1)
const poStreamMsStreamKeys = poStream => R.uniq(R.map(R.prop("media_struct_stream_key"), poStream.representations));

// return fields that need to be checked from media_struct.streams, include only streams referred to by playout.streams
const msStreamFields = (poStreams, msStreams) => {
  const msStreamKeys = R.uniq(R.values(R.map(poStreamMsStreamKeys, poStreams)));
  const usedMsStreams = R.pick(msStreamKeys, msStreams);
  return R.map(msStreamsFieldSubset, usedMsStreams);
};

const withoutDrmContentId = poFormat => {
  const clone = R.clone(poFormat);
  if(clone.drm) clone.drm.content_id = null;
  return clone;
};

const withoutEncryptionSchemes = poStream => {
  const clone = R.clone(poStream);
  clone.encryption_schemes = null;
  return clone;
};

const sanitizeFilename = (name, fallback) => {
    if (!name) return fallback;
        return name
            .replace(/[^a-zA-Z0-9._-]+/g, "_")
            .replace(/_+/g, "_")
            .substring(0, 180);
}


class ChannelCreate extends Utility {
  blueprint() {
    return {
      concerns: [ArgLibraryId, ArgType, FabricObject, Version],
      options: [
        ModOpt("libraryId", {demand: true}),
        ModOpt("type", {demand: true}),
        StdOpt("name",
          {
            demand: true,
            forX: "channel object"
          }),
        NewOpt("items", {
          demand: true,
          descTemplate: "List of channel items, separated by spaces. Each item should be of form VERSION_HASH/OFFERING_KEY, e.g. hq__12345/default ",
          string: true,
          type: "array"
        }),
        NewOpt("val", {
          descTemplate: "VoD-as-Live (make the channel a simulated live stream)",
          type: "boolean"
        })
      ]
    };
  }

  async body() {
    const logger = this.logger;
    const {name, items, libraryId, val} = this.args;
    const type = await this.concerns.ArgType.typVersionHash();

    const itemList = R.map(itemParser, items);
    const firstItemHash = itemList[0].hash;

    // check items
    logger.log("\nChecking items for any parameter mismatches...");

    // get item full meta
    const itemPublicMeta = [];
    const itemOfferings = [];
    for(let i = 0; i < itemList.length; i++) {
      const item = itemList[i];
      const versionHash = item.hash;
      const objectId = this.concerns.Version.objectId({versionHash});
      const meta = await this.concerns.FabricObject.metadata({
        libraryId,
        objectId,
        versionHash
      });
      itemPublicMeta.push(meta);
      itemOfferings.push(meta.offerings[item.offering])
    }

    // make sure streams, playout formats, and ladders are the same
    const firstPoStreams = R.map(withoutEncryptionSchemes, itemOfferings[0].playout.streams);
    const firstPoFormats = R.map(withoutDrmContentId, itemOfferings[0].playout.playout_formats);
    const firstMsStreamFields = msStreamFields(firstPoStreams, itemOfferings[0].media_struct.streams);

    for(let i = 1; i < itemList.length; i++) {
      const testPoStreams = R.map(withoutEncryptionSchemes, itemOfferings[i].playout.streams);

      const stripTranscodeId = R.map(
        R.evolve({
          representations: R.map(
            R.dissoc("transcode_id")
          )
        })
      );

      if (!R.equals(
        stripTranscodeId(firstPoStreams),
        stripTranscodeId(testPoStreams)
      )) {
        throw Error("ERROR: All items must have identical playout.streams.representations");
      }

      const testPoFormats = R.map(withoutDrmContentId, itemOfferings[i].playout.playout_formats);
      if(!R.equals(firstPoFormats, testPoFormats)) throw Error("ERROR: All items must have identical playout.playout_formats (other than widevine content_id field)");

      const testMsStreamFields = msStreamFields(testPoStreams, itemOfferings[i].media_struct.streams);
      if(!R.equals(firstMsStreamFields, testMsStreamFields)) throw Error("ERROR: All items must have matching values for included streams in the following media_struct stream fields: " + STREAM_FIELDS.join(", "));
    }
    // passed checks, assemble channel items metadata
    logger.log("Mezzanine item parameter checks passed.");

    // retrieve object's metadata
    const objectId = this.concerns.Version.objectId({
        versionHash: firstItemHash
    });
    let metadata = await this.concerns.FabricObject.metadata({ libraryId, objectId });

    logger.log("\nAdding channel metadata to new object...");

    let key = sanitizeFilename(this.args.name, `${objectId}.mp4`);
      // ---------- SAFE MERGE FOR EXISTING metadata.channel ----------
      metadata.channel ??= {};
      metadata.channel.offerings ??= {};
      metadata.channel.offerings[key] ??= {
          display_name: this.args.name,
          items: [],
          key,
          offeringKey: itemList[0].offering,
          live_end_tol: 60,
          live_seg_count: 60,
          playout: {
              playout_formats: itemOfferings?.[0]?.playout?.playout_formats ?? [],
              streams: itemOfferings?.[0]?.playout?.streams ?? []
          },
          playout_type: (val ? "ch_val" : "ch_vod")
      };

      // Local reference to avoid long paths
      const offeringRef = metadata.channel.offerings[key];

      // ---------- ADD ITEMS ----------
      for (let i = 0; i < itemList.length; i++) {
          const offering = itemOfferings[i];
          const item = itemList[i];
          const publicMeta = itemPublicMeta[i];

          const itemMeta = {
              display_name: publicMeta.public.name,
              duration_rat: offering.media_struct.duration_rat,
              source: {
                  ".": {
                      auto_update: {
                          tag: "latest"
                      }
                  },
                  "/": `/qfab/${item.hash}/rep/playout/${item.offering}`
              },
              type: "mez_vod"
          };
          offeringRef.items.push(itemMeta);
      }

    // Write back metadata
    logger.log("Writing metadata...");
    const versionHash = await this.concerns.Metadata.write({
      libraryId,
      metadata,
      objectId
    });

    logger.log("");
    logger.log(`Object ID: ${objectId}`);
    logger.data("object_id", objectId);
    logger.log("New version hash: " + versionHash);
    logger.data("version_hash", versionHash);
  }

  header() {
    return `Create channel '${this.args.name}' in lib ${this.args.libraryId}`;
  }
}

if(require.main === module) {
  Utility.cmdLineInvoke(ChannelCreate);
} else {
  module.exports = ChannelCreate;
}
