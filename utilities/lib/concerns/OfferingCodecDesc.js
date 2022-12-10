const R = require("ramda");

const Client = require("./Client");
const Logger = require("./Logger");
const Metadata = require("./Metadata");
const MP4InitSeg = require("./MP4InitSeg");

const blueprint = {
  name: "OfferingCodecDesc",
  concerns: [Client, Logger, Metadata, MP4InitSeg]
};

const New = context => {

  const logger = context.concerns.Logger;

  const setVideoRepCodecDescs = async ({libraryId, objectId, offeringKey, writeToken}) => {
    logger.log("Constructing codec descriptor strings for video stream(s)...");

    // if offeringKey supplied, only retrieve that offering's metadata
    const subtree = offeringKey
      ? `/offerings/${offeringKey}`
      : "/offerings";

    let metadata = await context.concerns.Metadata.get({
      libraryId,
      subtree,
      objectId,
      writeToken
    });
    if(!metadata) throw Error(`No metadata found for ${subtree}`);


    // make data struct of same shape regardless of whether offeringKey was supplied
    const offeringKVPairs = offeringKey
      ? [[offeringKey, metadata]]
      : Object.entries(metadata);

    const client = await context.concerns.Client.get();

    for(const [offKey, offMetadata] of offeringKVPairs) {
      // get first available playout format (for constructing init segment urls)
      const formats = offMetadata.playout.playout_formats;
      const firstFormatKey = Object.keys(formats)[0];
      const player_profile = formats[firstFormatKey].drm && formats[firstFormatKey].drm.type === "DrmAes128" ?
        "hls-js" :
        "";

      // find video streams, request init segments, set codec_desc
      for(const [streamKey, stream] of R.toPairs(offMetadata.media_struct.streams)) {
        if(stream.codec_type === "video") {
          // get bitrate ladder
          const reps = offMetadata.playout.streams[streamKey].representations;
          for(const [repKey, rep] of R.sortBy(x => -x[1].bit_rate, R.toPairs(reps))) {
            const initSegUrl = `playout/${offKey}/${firstFormatKey}/${streamKey}/${repKey}/init.m4s`;
            const url = new URL(
              await client.FabricUrl({
                libraryId,
                objectId,
                rep: initSegUrl,
                writeToken
              })
            );

            const path = url.pathname;
            let queryParams = {
              authorization: url.searchParams.get("authorization")
            };
            if(player_profile) queryParams.player_profile = player_profile;

            // get init segment
            const response = await client.HttpClient.Request({
              path,
              queryParams,
              method: "GET"
            });
            const buffer = Buffer.from(await response.arrayBuffer());

            // make codec desc based on init seg
            rep.codec_desc = context.concerns.MP4InitSeg.codecDesc(buffer);
            logger.log(`Codec desc ${rep.codec_desc} constructed for ${offKey}/${streamKey}/${repKey}`);
          }
        }
      }
    }

    metadata = offeringKey
      ? offeringKVPairs[0][1]
      : Object.fromEntries(offeringKVPairs);

    // save back to object
    await context.concerns.Metadata.write({
      libraryId,
      metadata,
      objectId,
      subtree,
      writeToken,
      commitMessage: "Set codec descriptor strings for video stream(s) " + (offeringKey
        ? `in offering '${offeringKey}'`
        : "in all offerings")
    });
  };

  return {
    setVideoRepCodecDescs
  };
};

module.exports = {
  blueprint,
  New
};
