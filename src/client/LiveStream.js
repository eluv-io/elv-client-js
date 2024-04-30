/**
 * Methods for Live Stream creation and management
 *
 * @module ElvClient/LiveStream
 */

const {LiveConf} = require("./LiveConf");
const path = require("path");
const fs = require("fs");
const HttpClient = require("../HttpClient");
const Fraction = require("fraction.js");
const {ValidateObject, ValidatePresence} = require("../Validation");

const MakeTxLessToken = async({client, libraryId, objectId, versionHash}) => {
  const tok = await client.authClient.AuthorizationToken({libraryId, objectId,
    versionHash, channelAuth: false, noCache: true,
    noAuth: true});

  return tok;
};

const Sleep = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

const CueInfo = async ({eventId, status}) => {
  let cues;
  try {
    const lroStatusResponse = await this.utils.ResponseToJson(
      await HttpClient.Fetch(status.lro_status_url)
    );
    console.log("lroStatusResponse", lroStatusResponse)
    cues = lroStatusResponse.custom.cues;
  } catch (error) {
    console.log("LRO status failed", error);
    return {error: "failed to retrieve status", eventId};
  }

  let eventStart, eventEnd;
  for (const value of Object.values(cues)) {
    for (const event of Object.values(value.descriptors)) {
      if (event.id == eventId) {
        switch (event.type_id) {
          case 32:
          case 16:
            eventStart = value.insertion_time;
            break;
          case 33:
          case 17:
            eventEnd = value.insertion_time;
            break;

        }
      }
    }
  }

  return {eventStart, eventEnd, eventId};
}

/**
 * Set the offering for the live stream
 *
 * @methodGroup Live Stream
 * @namedParams
 * @param {Object} client - The client object
 * @param {string} libraryId - ID of the library for the new live stream object
 * @param {string} objectId - ID of the new live stream object
 * @param {string=} typeAbrMaster - Content type hash
 * @param {string=} typeLiveStream - Content type hash
 * @param {string} streamUrl - Live source URL
 * @param {object} abrProfile - ABR Profile for the offering
 * @param {number} aBitRate - Audio bitrate
 * @param {number} aChannels - Audio channels
 * @param {number} aSampleRate - Audio sample rate
 * @param {number} aStreamIndex - Audio stream index
 * @param {string} aTimeBase - Audio time base as a fraction, e.g. "1/48000" (usually equal to 1/aSampleRate)
 * @param {string} aChannelLayout - Channel layout, e.g. "stereo"
 * @param {number} vBitRate - Video bitrate
 * @param {number} vHeight - Video height
 * @param {number} vStreamIndex - Video stream index
 * @param {number} vWidth - Video width
 * @param {string} vDisplayAspectRatio - Display aspect ratio as a fraction, e.g. "16/9"
 * @param {string} vFrameRate - Frame rate as an integer, e.g. "30"
 * @param {string} vTimeBase - Time base as a fraction, e.g. "1/30000"
 *
 * @return {Promise<string>} - Final hash of the live stream object
 */
const StreamGenerateOffering = async({
  client,
  libraryId,
  objectId,
  typeAbrMaster,
  typeLiveStream,
  streamUrl,
  abrProfile,
  aBitRate,
  aChannels,
  aSampleRate,
  aStreamIndex,
  aTimeBase,
  aChannelLayout,
  vBitRate,
  vHeight,
  vStreamIndex,
  vWidth,
  vDisplayAspectRatio,
  vFrameRate,
  vTimeBase
}) => {
  // compute duration_ts
  const DUMMY_DURATION = 1001; // should result in integer duration_ts values for both audio and video
  const aDurationTs = Fraction(aTimeBase).inverse().mul(DUMMY_DURATION).valueOf();
  const vDurationTs = Fraction(vTimeBase).inverse().mul(DUMMY_DURATION).valueOf();

  // construct /production_master/sources/STREAM_URL/streams

  const sourceAudioStream = {
    "bit_rate": aBitRate,
    "channel_layout": aChannelLayout,
    "channels": aChannels,
    "codec_name": "aac",
    "duration": DUMMY_DURATION,
    "duration_ts": aDurationTs,
    "frame_count": 0,
    "language": "",
    "max_bit_rate": aBitRate,
    "sample_rate": aSampleRate,
    "start_pts": 0,
    "start_time": 0,
    "time_base": aTimeBase,
    "type": "StreamAudio"
  };

  const sourceVideoStream = {
    "bit_rate": vBitRate,
    "codec_name": "h264",
    "display_aspect_ratio": vDisplayAspectRatio,
    "duration": DUMMY_DURATION,
    "duration_ts": vDurationTs,
    "field_order": "progressive",
    "frame_count": 0,
    "frame_rate": vFrameRate,
    "hdr": null,
    "height": vHeight,
    "language": "",
    "max_bit_rate": vBitRate,
    "sample_aspect_ratio": "1",
    "start_pts": 0,
    "start_time": 0,
    "time_base": vTimeBase,
    "type": "StreamVideo",
    "width": vWidth
  };

  // placeholder stream to use if [aStreamIndex, vStreamIndex].sort() is not [0,1]
  const DUMMY_STREAM = {
    "bit_rate": 0,
    "codec_name": "",
    "duration": DUMMY_DURATION,
    "duration_ts": 2500 * DUMMY_DURATION,
    "frame_count": 1,
    "language": "",
    "max_bit_rate": 0,
    "start_pts": 0,
    "start_time": 0,
    "time_base": "1/2500",
    "type": "StreamData"
  };

  const sourceStreams = [];
  const maxStreamIndex = Math.max(aStreamIndex, vStreamIndex);

  for(let i = 0; i <= maxStreamIndex; i++) {
    if(i === aStreamIndex) {
      sourceStreams.push(sourceAudioStream);
    } else if(i === vStreamIndex) {
      sourceStreams.push(sourceVideoStream);
    } else {
      sourceStreams.push(DUMMY_STREAM);
    }
  }

  // construct /production_master/sources
  const sources = {
    [streamUrl]: {
      "container_format": {
        "duration": DUMMY_DURATION,
        "filename": streamUrl,
        "format_name": "mov,mp4,m4a,3gp,3g2,mj2",
        "start_time": 0
      },
      "streams": sourceStreams
    }
  };

  // construct /production_master/variants
  const variants = {
    "default": {
      "streams": {
        "audio": {
          "default_for_media_type": false,
          "label": "",
          "language": "",
          "mapping_info": "",
          "sources": [
            {
              "files_api_path": streamUrl,
              "stream_index": aStreamIndex
            }
          ]
        },
        "video": {
          "default_for_media_type": false,
          "label": "",
          "language": "",
          "mapping_info": "",
          "sources": [
            {
              "files_api_path": streamUrl,
              "stream_index": vStreamIndex
            }
          ]
        }
      }
    }
  };

  // construct /production_master
  const production_master = {sources, variants};

  // get existing metadata
  console.log("Retrieving current metadata...");
  let metadata = await client.ContentObjectMetadata({
    libraryId,
    objectId
  });

  // add /production_master to metadata
  metadata.production_master = production_master;

  // write back to object
  console.log("Getting write token...");
  let editResponse = await client.EditContentObject({
    libraryId,
    objectId,
    options: {
      type: typeAbrMaster
    }
  });
  let writeToken = editResponse.write_token;
  console.log(`New write token: ${writeToken}`);

  console.log("Writing back metadata with /production_master added...");
  await client.ReplaceMetadata({
    libraryId,
    metadata,
    objectId,
    writeToken
  });

  console.log("Finalizing...");
  let finalizeResponse = await client.FinalizeContentObject({
    libraryId,
    objectId,
    writeToken
  });
  let masterVersionHash = finalizeResponse.hash;
  console.log(`Finalized, new version hash: ${masterVersionHash}`);

  // Generate offering
  const createResponse = await client.CreateABRMezzanine({
    libraryId,
    objectId,
    masterVersionHash,
    variant: "default",
    offeringKey: "default",
    abrProfile
  });

  if(createResponse.warnings.length > 0) {
    console.log("WARNINGS:");
    console.log(JSON.stringify(createResponse.warnings, null, 2));
  }

  if(createResponse.errors.length > 0) {
    console.log("ERRORS:");
    console.log(JSON.stringify(createResponse.errors, null, 2));
  }

  let versionHash = createResponse.hash;
  console.log(`New version hash: ${versionHash}`);

  // get new metadata
  console.log("Retrieving revised metadata with offering...");
  metadata = await client.ContentObjectMetadata({
    libraryId,
    versionHash
  });

  console.log("Moving /abr_mezzanine/offerings to /offerings and removing /abr_mezzanine...");
  metadata.offerings = metadata.abr_mezzanine.offerings;
  delete metadata.abr_mezzanine;

  // add items to media_struct needed to use options.json handler
  metadata.offerings.default.media_struct.duration_rat = `${DUMMY_DURATION}`;

  // write back to object
  console.log("Getting write token...");
  editResponse = await client.EditContentObject({
    libraryId,
    objectId,
    options: {
      type: typeLiveStream
    }
  });
  writeToken = editResponse.write_token;
  console.log(`New write token: ${writeToken}`);

  console.log("Writing back metadata with /offerings...");
  await client.ReplaceMetadata({
    libraryId,
    metadata,
    objectId,
    writeToken
  });

  console.log("Finalizing...");
  finalizeResponse = await client.FinalizeContentObject({
    libraryId,
    objectId,
    writeToken
  });

  const finalHash = finalizeResponse.hash;
  console.log(`Finalized, new version hash: ${finalHash}`);

  return finalHash;
};

/**
 * Retrieve the status of the current live stream session
 *
 * @methodGroup Live Stream
 * @namedParams
 * @param {string} name - Object ID or name of the live stream object
 * @param {boolean=} stopLro - If specified, will stop LRO
 * @param {boolean=} showParams - If specified, will return recording_params with status
 * States:
 * unconfigured    - no live_recording_config
 * uninitialized   - no live_recording config generated
 * inactive        - live_recording config initialized but no 'edge write token'
 * stopped         - edge-write-token but not started
 * starting        - LRO running but no source data yet
 * running         - stream is running and producing output
 * stalled         - LRO running but no source data (so not producing output)
 *
 * @return {Promise<Object>} - The status response for the object, as well as logs, warnings and errors from the master initialization
 */
exports.StreamStatus = async function({name, stopLro=false, showParams=false}) {
  let objectId = name;
  let status = {name: name};

  try {
    let libraryId = await this.ContentObjectLibraryId({objectId});
    status.library_id = libraryId;
    status.object_id = objectId;

    let mainMeta = await this.ContentObjectMetadata({
      libraryId,
      objectId,
      select: [
        "live_recording_config",
        "live_recording"
      ]
    });

    status.reference_url = mainMeta.live_recording_config.reference_url;

    if(mainMeta.live_recording_config == undefined || mainMeta.live_recording_config.url == undefined) {
      status.state = "unconfigured";
      return status;
    }

    if(mainMeta.live_recording == undefined || mainMeta.live_recording.fabric_config == undefined ||
      mainMeta.live_recording.playout_config == undefined || mainMeta.live_recording.recording_config == undefined) {
      status.state = "uninitialized";
      return status;
    }

    let fabURI = mainMeta.live_recording.fabric_config.ingress_node_api;
    if(fabURI === undefined) {
      console.log("bad fabric config - missing ingress node API");
      status.state = "uninitialized";
      return status;
    }

    // Support both hostname and URL ingress_node_api
    if(!fabURI.startsWith("http")) {
      // Assume https
      fabURI = "https://" + fabURI;
    }

    status.fabric_api = fabURI;
    status.url = mainMeta.live_recording.recording_config.recording_params.origin_url;

    let edgeWriteToken = mainMeta.live_recording.fabric_config.edge_write_token;
    if(!edgeWriteToken) {
      status.state = "inactive";
      return status;
    }

    this.RecordWriteToken({writeToken: edgeWriteToken, fabricNodeUrl: fabURI});

    status.edge_write_token = edgeWriteToken;
    status.stream_id = edgeWriteToken; // By convention the stream ID is its write token
    let edgeMeta = await this.ContentObjectMetadata({
      libraryId: libraryId,
      objectId: objectId,
      writeToken: edgeWriteToken,
      select: [
        "live_recording"
      ]
    });

    status.edge_meta_size = JSON.stringify(edgeMeta).length;

    // If a stream has never been started return state 'inactive'
    if(edgeMeta.live_recording === undefined ||
      edgeMeta.live_recording.recordings === undefined ||
      edgeMeta.live_recording.recordings.recording_sequence === undefined) {
      status.state = "stopped";
      return status;
    }

    let recordings = edgeMeta.live_recording.recordings;
    status.recording_period_sequence = recordings.recording_sequence;

    let sequence = recordings.recording_sequence;
    let period = recordings.live_offering[sequence - 1];

    let tlro = period.live_recording_handle;
    status.tlro = tlro;

    let videoLastFinalizationTimeEpochSec = -1;
    let videoFinalizedParts = 0;
    let sinceLastFinalize = -1;
    if (period.finalized_parts_info && period.finalized_parts_info.video && period.finalized_parts_info.video.last_finalization_time) {
      videoLastFinalizationTimeEpochSec = period.finalized_parts_info.video.last_finalization_time / 1000000;
      videoFinalizedParts = period.finalized_parts_info.video.n_parts;
      sinceLastFinalize = Math.floor(new Date().getTime() / 1000) - videoLastFinalizationTimeEpochSec;
    }

    let recording_period = {
      activation_time_epoch_sec: period.recording_start_time_epoch_sec,
      start_time_epoch_sec: period.start_time_epoch_sec,
      start_time_text: new Date(period.start_time_epoch_sec * 1000).toLocaleString(),
      end_time_epoch_sec: period.end_time_epoch_sec,
      end_time_text:  period.end_time_epoch_sec === 0 ? null : new Date(period.end_time_epoch_sec * 1000).toLocaleString(),
      video_parts: videoFinalizedParts,
      video_last_part_finalized_epoch_sec: videoLastFinalizationTimeEpochSec,
      video_since_last_finalize_sec : sinceLastFinalize
    };
    status.recording_period = recording_period;

    status.lro_status_url = await this.FabricUrl({
      libraryId: libraryId,
      objectId: objectId,
      writeToken: edgeWriteToken,
      call: "live/status/" + tlro
    });

    status.insertions = [];
    if((edgeMeta.live_recording.playout_config.interleaves != undefined) &&
      (edgeMeta.live_recording.playout_config.interleaves[sequence] != undefined)) {
      let insertions = edgeMeta.live_recording.playout_config.interleaves[sequence];
      for(let i = 0; i < insertions.length; i ++) {
        let insertionTimeSinceEpoch = recording_period.start_time_epoch_sec + insertions[i].insertion_time;
        status.insertions[i] = {
          insertion_time_since_start: insertions[i].insertion_time,
          insertion_time: new Date(insertionTimeSinceEpoch * 1000).toISOString(),
          insertion_time_local: new Date(insertionTimeSinceEpoch * 1000).toLocaleString(),
          target: insertions[i].playout};
      }
    }

    if(showParams) {
      status.recording_params = edgeMeta.live_recording.recording_config.recording_params;
    }

    let state = "stopped";
    let lroStatus = "";
    try {
      lroStatus = await this.utils.ResponseToJson(
        await HttpClient.Fetch(status.lro_status_url)
      );
      state = lroStatus.state;
      status.warnings = lroStatus.custom && lroStatus.custom.warnings;
      status.quality = lroStatus.custom && lroStatus.custom.quality;
    } catch(error) {
      console.log("LRO Status (failed): ", error.response.statusCode);
      status.state = "stopped";
      status.error = error.response;
      return status;
    }

    // Convert LRO 'state' to desired 'state'
    if(state === "running" && videoLastFinalizationTimeEpochSec <= 0) {
      state = "starting";
    } else if(state === "running" && sinceLastFinalize > 32.9) {
      state = "stalled";
    } else if(state == "terminated") {
      state = "stopped";
    }
    status.state = state;

    if((state === "running" || state === "stalled" || state === "starting") && stopLro) {
      lroStopUrl = await this.FabricUrl({
        libraryId,
        objectId,
        writeToken: edgeWriteToken,
        call: "live/stop/" + tlro
      });

      try {
        await this.utils.ResponseToJson(
          await HttpClient.Fetch(lroStopUrl)
        );

        console.log("LRO Stop: ", lroStatus.body);
      } catch(error) {
        console.log("LRO Stop (failed): ", error.response.statusCode);
      }

      state = "stopped";
      status.state = state;
    }

    if(state === "running") {
      let playout_urls = {};
      let playout_options = await this.PlayoutOptions({
        objectId,
        linkPath: "public/asset_metadata/sources/default"
      });

      let hls_clear_enabled = (
        playout_options &&
        playout_options.hls &&
        playout_options.hls.playoutMethods &&
        playout_options.hls.playoutMethods.clear !== undefined
      );
      if(hls_clear_enabled) {
        playout_urls.hls_clear = await this.FabricUrl({
          libraryId: libraryId,
          objectId: objectId,
          rep: "playout/default/hls-clear/playlist.m3u8",
        });
      }

      let hls_aes128_enabled = (
        playout_options &&
        playout_options.hls &&
        playout_options.hls.playoutMethods &&
        playout_options.hls.playoutMethods["aes-128"] !== undefined
      );
      if(hls_aes128_enabled) {
        playout_urls.hls_aes128 = await this.FabricUrl({
          libraryId: libraryId,
          objectId: objectId,
          rep: "playout/default/hls-aes128/playlist.m3u8",
        });
      }

      let hls_sample_aes_enabled = (
        playout_options &&
        playout_options.hls &&
        playout_options.hls.playoutMethods &&
        playout_options.hls.playoutMethods["sample-aes"] !== undefined
      );
      if(hls_sample_aes_enabled) {
        playout_urls.hls_sample_aes = await this.FabricUrl({
          libraryId: libraryId,
          objectId: objectId,
          rep: "playout/default/hls-sample-aes/playlist.m3u8",
        });
      }

      const networkInfo = await this.NetworkInfo();
      let token = await this.authClient.AuthorizationToken({
        libraryId,
        objectId,
        channelAuth: false,
        noCache: true,
        noAuth: true
      });

      let embed_net = "main";
      if(networkInfo.name.includes("demo")) {
        embed_net = "demo";
      }
      let embed_url = `https://embed.v3.contentfabric.io/?net=${embed_net}&p&ct=h&oid=${objectId}&mt=lv&ath=${token}`;
      playout_urls.embed_url = embed_url;

      status.playout_urls = playout_urls;
    }
  } catch(error) {
    console.error(error);
  }

  return status;
};

/**
 * Create a new edge write token
 *
 * @methodGroup Live Stream
 * @namedParams
 * @param {string} name - Object ID or name of the live stream object
 * @param {boolean=} start - If specified, will start the stream after creation
 *
 * @return {Promise<Object>} - The status response for the object
 *
*/
exports.StreamCreate = async function({name, start=false}) {
  let status = await this.StreamStatus({name});
  if(status.state != "uninitialized" && status.state !== "inactive" && status.state !== "terminated" && status.state !== "stopped") {
    return {
      state: status.state,
      error: "stream still active - must terminate first"
    };
  }

  let objectId = status.object_id;
  console.log("START: ", name, "start", start);

  let libraryId = await this.ContentObjectLibraryId({objectId: objectId});

  // Read live recording parameters - determine ingest node
  let liveRecording = await this.ContentObjectMetadata({
    libraryId: libraryId,
    objectId: objectId,
    metadataSubtree: "/live_recording"
  });

  let fabURI = liveRecording.fabric_config.ingress_node_api;
  // Support both hostname and URL ingress_node_api
  if(!fabURI.startsWith("http")) {
    // Assume https
    fabURI = "https://" + fabURI;
  }

  this.SetNodes({fabricURIs: [fabURI]});

  console.log("Node URI", fabURI, "ID", liveRecording.fabric_config.ingress_node_id);

  let response = await this.EditContentObject({
    libraryId: libraryId,
    objectId: objectId
  });
  const edgeToken = response.write_token;
  console.log("Edge token:", edgeToken);

  /*
  * Set the metadata, including the edge token.
  */
  response = await this.EditContentObject({
    libraryId: libraryId,
    objectId: objectId
  });
  let writeToken = response.write_token;

  this.Log("Merging metadata: ", libraryId, objectId, writeToken);
  await this.MergeMetadata({
    libraryId: libraryId,
    objectId: objectId,
    writeToken: writeToken,
    metadata: {
      live_recording: {
        status: {
          edge_write_token: edgeToken,
          state: "active"  // indicates there is an active session (set to 'closed' when done)
        },
        fabric_config: {
          edge_write_token: edgeToken
        }
      }
    }
  });

  this.Log("Finalizing content draft: ", libraryId, objectId, writeToken);
  response = await this.FinalizeContentObject({
    libraryId: libraryId,
    objectId: objectId,
    writeToken: writeToken,
    commitMessage: "Create stream edge write token " + edgeToken
  });

  const objectHash = response.hash;
  this.Log("Finalized object: ", objectHash);

  status = {
    object_id: objectId,
    hash: objectHash,
    library_id: libraryId,
    stream_id: edgeToken,
    edge_write_token: edgeToken,
    fabric_api: fabURI,
    state: "stopped"
  };

  if(start) {
    status = this.StreamStartOrStopOrReset({name, op: start});
  }

  return status;
};

/**
 * Start, stop or reset a stream within the current session (current edge write token)
 *
 * @methodGroup Live Stream
 * @namedParams
 * @param {string} name - Object ID or name of the live stream object
 * @param {string} op - The operation to perform. Possible values:
 * 'start'
 * 'reset' - Stops current LRO recording and starts a new one.  Does
 * not create a new edge write token (just creates a new recording
 * period in the existing edge write token)
 * - 'stop'
 *
 * @return {Promise<Object>} - The status response for the stream
 *
*/
exports.StreamStartOrStopOrReset = async function({name, op}) {
  try {
    let status = await this.StreamStatus({name})
    if(status.state != "stopped") {
      if(op === "start") {
        status.error = "Unable to start stream - state: " + status.state;
        return status;
      }
    }

    if(status.state == "running" || status.state == "starting" || status.state == "stalled") {
      try {
        await this.CallBitcodeMethod({
          libraryId: status.library_id,
          objectId: status.object_id,
          writeToken: status.edge_write_token,
          method: "/live/stop/" + status.tlro,
          constant: false
        });
      } catch(error) {
        // The /call/lro/stop API returns empty response
        // console.log("LRO Stop (failed): ", error);
      }

      // Wait until LRO is terminated
      let tries = 10;
      while(status.state != "stopped" && tries-- > 0) {
        console.log("Wait to terminate - ", status.state);
        await Sleep(1000);
        status = await this.StreamStatus({name});
      }

      console.log("Status after stop - ", status.state);

      if(tries <= 0) {
        console.log("Failed to stop");
        return status;
      }
    }

    if(op === "stop") {
      return status;
    }

    console.log("STARTING", "edge_write_token", status.edge_write_token);

    try {
      await this.CallBitcodeMethod({
        libraryId: status.library_id,
        objectId: status.object_id,
        writeToken: status.edge_write_token,
        method: "/live/start",
        constant: false
      });
    } catch(error) {
      console.log("LRO Start (failed): ", error);
      return {
        state: status.state,
        error: "LRO start failed - must create a stream first"
      };
    }

    // Wait until LRO is 'starting'
    let tries = 10;
    while(status.state != "starting" && tries-- > 0) {
      console.log("Wait to start - ", status.state);
      await Sleep(1000);
      status = await this.StreamStatus({name});
    }

    console.log("Status after restart - ", status.state);
    return status;

  } catch(error) {
    console.error(error);
  }
};

/**
 * Close the edge write token and make the stream object inactive.
 *
 * @methodGroup Live Stream
 * @namedParams
 * @param {string} name - Object ID or name of the live stream object
 *
 * @return {Promise<Object>} - The finalize response for the stream object
 */
exports.StreamStopSession = async function({name}) {
  try {
    this.Log(`Terminating stream session for: ${name}`);
    let objectId = name;
    let libraryId = await this.ContentObjectLibraryId({objectId});

    let mainMeta = await this.ContentObjectMetadata({
      libraryId,
      objectId
    });

    let fabURI = mainMeta.live_recording.fabric_config.ingress_node_api;
    // Support both hostname and URL ingress_node_api
    if(!fabURI.startsWith("http")) {
      // Assume https
      fabURI = "https://" + fabURI;
    }

    this.SetNodes({fabricURIs: [fabURI]});

    const metaEdgeWriteToken = mainMeta.live_recording.fabric_config.edge_write_token;

    if(!metaEdgeWriteToken) {
      return {
        state: "inactive",
        error: "The stream is not active"
      };
    }

    try {
      const streamMetadata = await this.ContentObjectMetadata({
        libraryId,
        objectId,
        writeToken: metaEdgeWriteToken
      });

      const status = await this.StreamStatus({name});

      if(status.state !== "stopped") {
        return {
          state: status.state,
          error: "The stream must be stopped before terminating"
        }
      }

      await this.DeleteWriteToken({
        libraryId,
        writeToken: metaEdgeWriteToken
      });
    } catch(error) {
      this.Log("Unable to retrieve metadata for edge write token");
    }

    const {writeToken} = await this.EditContentObject({
      libraryId: libraryId,
      objectId: objectId
    });

    // Set stop time and inactive state
    const newState = "inactive";
    const stopTime = Math.floor(new Date().getTime() / 1000);

    const finalizeMetadata = {
      live_recording: {
        status: {
          edge_write_token: "",
          state: newState,
          recording_stop_time: stopTime
        },
        fabric_config: {
          edge_write_token: ""
        }
      }
    };

    await this.MergeMetadata({
      libraryId,
      objectId,
      writeToken,
      metadata: finalizeMetadata
    });

    let fin = await this.FinalizeContentObject({
      libraryId,
      objectId,
      writeToken,
      commitMessage: `Deactivate live stream - stop time ${stopTime}`
    });

    return {
      fin,
      name,
      state: newState
    };
  } catch(error) {
    console.error(error);
  }
};

/**
 * Initialize the stream object
 *
 * @methodGroup Live Stream
 * @namedParams
 * @param {string} name - Object ID or name of the live stream object
 * @param {boolean=} drm - If specified, playout will be DRM protected
 * @param {string=} format - Specify the list of playout formats and DRM to support,
 comma-separated (hls-clear, hls-aes128, hls-sample-aes,
 hls-fairplay)
 *
 * @return {Promise<Object>} - The name, object ID, and state of the stream
 */
exports.StreamInitialize = async function({name, drm=false, format}) {
  let typeAbrMaster;
  let typeLiveStream;

  // Fetch Title and Live Stream content types from tenant meta
  const tenantContractId = await this.userProfileClient.TenantContractId();
  const {live_stream, title} = await this.ContentObjectMetadata({
    libraryId: tenantContractId.replace("iten", "ilib"),
    objectId: tenantContractId.replace("iten", "iq__"),
    metadataSubtree: "public/content_types",
    select: [
      "live_stream",
      "title"
    ]
  });

  if(live_stream) {
    typeLiveStream = live_stream;
  }

  if(title) {
    typeAbrMaster = title;
  }

  if(typeAbrMaster === undefined || typeLiveStream === undefined) {
    console.log("ERROR - unable to find content types", "ABR Master", typeAbrMaster, "Live Stream", typeLiveStream);
    return {};
  }

  const res = await this.StreamSetOfferingAndDRM({name, typeAbrMaster, typeLiveStream, drm, format});

  return res;
};

/**
 * Create a dummy VoD offering and initialize DRM keys.
 *
 * @methodGroup Live Stream
 * @namedParams
 * @param {string} name - Object ID or name of the live stream object
 * @param {string=} typeAbrMaster - Content type hash
 * @param {string=} typeLiveStream - Content type hash
 * @param {boolean=} drm - If specified, DRM will be applied to the stream
 * @param {string=} format - A list of playout formats and DRM to support, comma-separated
 * (hls-clear, hls-aes128, hls-sample-aes, hls-fairplay). If specified,
 * this will take precedence over the drm value
 *
 * @return {Promise<Object>} - The name, object ID, and state of the stream
 */
exports.StreamSetOfferingAndDRM = async function({name, typeAbrMaster, typeLiveStream, drm=false, format}) {
  let status = await this.StreamStatus({name});
  if(status.state != "uninitialized" && status.state != "inactive" && status.state != "stopped") {
    return {
      state: status.state,
      error: "stream still active - must terminate first"
    };
  }

  let objectId = status.object_id;

  console.log("INIT: ", name, objectId);

  const aBitRate = 128000;
  const aChannels = 2;
  const aSampleRate = 48000;
  const aStreamIndex = 1;
  const aTimeBase = "1/48000";
  const aChannelLayout = "stereo";

  const vBitRate = 14000000;
  const vHeight = 720;
  const vStreamIndex = 0;
  const vWidth = 1280;
  const vDisplayAspectRatio = "16/9";
  const vFrameRate = "30000/1001";
  const vTimeBase = "1/30000"; // "1/16000";

  const abrProfileDefault = require("../abr_profiles/abr_profile_live_drm.js");

  let playoutFormats;
  let abrProfile = JSON.parse(JSON.stringify(abrProfileDefault));
  if(format) {
    drm = true; // Override DRM parameter
    playoutFormats = {};
    let formats = format.split(",");
    for(let i = 0; i < formats.length; i++) {
      if(formats[i] === "hls-clear") {
        abrProfile.drm_optional = true;
        playoutFormats["hls-clear"] = {
          "drm": null,
          "protocol": {
            "type": "ProtoHls"
          }
        };
        continue;
      }
      playoutFormats[formats[i]] = abrProfile.playout_formats[formats[i]];
    }
  } else if(!drm) {
    abrProfile.drm_optional = true;
    playoutFormats = {
      "hls-clear": {
        "drm": null,
        "protocol": {
          "type": "ProtoHls"
        }
      }
    };
  } else {
    playoutFormats = Object.assign({}, abrProfile.playout_formats);
  }

  abrProfile.playout_formats = playoutFormats;

  let libraryId = await this.ContentObjectLibraryId({objectId});

  try {
    let mainMeta = await this.ContentObjectMetadata({
      libraryId,
      objectId
    });

    let fabURI = mainMeta.live_recording.fabric_config.ingress_node_api;
    // Support both hostname and URL ingress_node_api
    if(!fabURI.startsWith("http")) {
      // Assume https
      fabURI = "https://" + fabURI;
    }

    this.SetNodes({fabricURIs: [fabURI]});

    let streamUrl = mainMeta.live_recording.recording_config.recording_params.origin_url;

    await StreamGenerateOffering({
      client: this,
      libraryId,
      objectId,
      typeAbrMaster,
      typeLiveStream,
      streamUrl,
      abrProfile,
      aBitRate,
      aChannels,
      aSampleRate,
      aStreamIndex,
      aTimeBase,
      aChannelLayout,
      vBitRate,
      vHeight,
      vStreamIndex,
      vWidth,
      vDisplayAspectRatio,
      vFrameRate,
      vTimeBase
    });

    console.log("Finished generating offering");

    return {
      name,
      object_id: objectId,
      state: "initialized"
    };
  } catch(error) {
    console.error(error);
  }
};

/**
 * Add a content insertion entry
 *
 * @methodGroup Live Stream
 * @namedParams
 * @param {string} name - Object ID or name of the live stream object
 * @param {number} insertionTime - Time in seconds (float)
 * @param {boolean=} sinceStart - If specified, time specified will be elapsed seconds
 * since stream start, otherwise, time will be elapsed since epoch
 * @param {number=} duration - Time in seconds (float). Default: 20.0
 * @param {string} targetHash - The target content object hash (playable)
 * @param {boolean=} remove - If specified, will remove the inseration at the exact 'time' (instead of adding)
 *
 * @return {Promise<Object>} - Insertions, as well as any errors from bad insertions
 */
exports.StreamInsertion = async function({name, insertionTime, sinceStart=false, duration, targetHash, remove=false}) {
  // Determine audio and video parameters of the insertion

  // Content Type check is currently disabled due to permissions
  /*
  let ct = await this.client.ContentObject({versionHash});
  if(ct.type != undefined && ct.type != "") {
    let typeMeta = await this.client.ContentObjectMetadata({
      versionHash: ct.type
    });
    if(typeMeta.bitcode_flags != "abrmaster") {
      throw new Error("Not a playable VoD object " + versionHash);
    }
  }
  */
  let offeringMeta = await this.ContentObjectMetadata({
    versionHash: targetHash,
    metadataSubtree: "/offerings/default"
  });

  var insertionInfo = {
    duration_sec: 0 // Minimum of video and audio duration
  };
  ["video", "audio"].forEach(mt =>  {
    const stream = offeringMeta.media_struct.streams[mt];
    insertionInfo[mt] = {
      seg_duration_sec: stream.optimum_seg_dur.float,
      duration_sec: stream.duration.float,
      frame_rate_rat: stream.rate,
    };
    if(insertionInfo.duration_sec === 0 || stream.duration.float < insertionInfo.duration_sec) {
      insertionInfo.duration_sec = stream.duration.float;
    }
  });

  const audioAbrDuration = insertionInfo.audio.seg_duration_sec;
  const videoAbrDuration = insertionInfo.video.seg_duration_sec;

  if(audioAbrDuration === 0 || videoAbrDuration === 0) {
    throw new Error("Bad segment duration hash:", targetHash);
  }

  if(duration === undefined) {
    duration = insertionInfo.duration_sec;  // Use full duration of the insertion
  } else {
    if(duration > insertionInfo.duration_sec) {
      throw new Error("Bad duration - larger than insertion object duration", insertionInfo.duration_sec);
    }
  }

  let objectId = name;
  let libraryId = await this.ContentObjectLibraryId({objectId});

  let mainMeta = await this.ContentObjectMetadata({
    libraryId,
    objectId
  });

  let fabURI = mainMeta.live_recording.fabric_config.ingress_node_api;

  // Support both hostname and URL ingress_node_api
  if(!fabURI.startsWith("http")) {
    // Assume https
    fabURI = "https://" + fabURI;
  }
  this.SetNodes({fabricURIs: [fabURI]});
  let edgeWriteToken = mainMeta.live_recording.fabric_config.edge_write_token;

  let edgeMeta = await this.ContentObjectMetadata({
    libraryId,
    objectId,
    writeToken: edgeWriteToken
  });

  // Find stream start time (from the most recent recording section)
  let recordings = edgeMeta.live_recording.recordings;
  let sequence = 1;
  let streamStartTime = 0;
  if(recordings != undefined && recordings.recording_sequence != undefined) {
    // We have at least one recording - check if still active
    sequence = recordings.recording_sequence;
    let period = recordings.live_offering[sequence - 1];

    if(period.end_time_epoch_sec > 0) {
      // The last period is closed - apply insertions to the next period
      sequence ++;
    } else {
      // The period is active
      streamStartTime = period.start_time_epoch_sec;
    }
  }

  if(streamStartTime === 0) {
    // There is no active period - must use absolute time
    if(sinceStart === false) {
      throw new Error("Stream not running - must use 'time since start'");
    }
  }

  // Find the current period playout configuration
  if(edgeMeta.live_recording.playout_config.interleaves === undefined) {
    edgeMeta.live_recording.playout_config.interleaves = {};
  }
  if(edgeMeta.live_recording.playout_config.interleaves[sequence] === undefined) {
    edgeMeta.live_recording.playout_config.interleaves[sequence] = [];
  }

  let playoutConfig = edgeMeta.live_recording.playout_config;
  let insertions = playoutConfig.interleaves[sequence];

  let res = {};

  if(!sinceStart) {
    insertionTime = insertionTime - streamStartTime;
  }

  // Assume insertions are sorted by insertion time
  let errs = [];
  let currentTime = -1;
  let insertionDone = false;
  let newInsertion = {
    insertion_time: insertionTime,
    duration: duration,
    audio_abr_duration: audioAbrDuration,
    video_abr_duration: videoAbrDuration,
    playout: "/qfab/" + targetHash + "/rep/playout"  // TO FIX - should be a link
  };

  for(let i = 0; i < insertions.length; i ++) {
    if(insertions[i].insertion_time <= currentTime) {
      // Bad insertion - must be later than current time
      append(errs, "Bad insertion - time:", insertions[i].insertion_time);
    }
    if(remove) {
      if(insertions[i].insertion_time === insertionTime) {
        insertions.splice(i, 1);
        break;
      }
    } else {
      if(insertions[i].insertion_time > insertionTime) {
        if(i > 0) {
          insertions = [
            ...insertions.splice(0, i),
            newInsertion,
            ...insertions.splice(i)
          ];
        } else {
          insertions = [
            newInsertion,
            ...insertions.splice(i)
          ];
        }
        insertionDone = true;
        break;
      }
    }
  }

  if(!remove && !insertionDone) {
    // Add to the end of the insertions list
    console.log("Add insertion at the end");
    insertions = [
      ...insertions,
      newInsertion
    ];
  }

  playoutConfig.interleaves[sequence] = insertions;

  // Store the new insertions in the write token
  await this.ReplaceMetadata({
    libraryId: libraryId,
    objectId: objectId,
    writeToken: edgeWriteToken,
    metadataSubtree: "/live_recording/playout_config",
    metadata: edgeMeta.live_recording.playout_config
  });

  res.errors = errs;
  res.insertions = insertions;

  return res;
};

/**
 * Configure the stream based on built-in logic and optional custom settings.
 *
 * Custom settings format:
 *    {
 *      "audio" {
 *        "1" : {  // This is the stream index
 *          "tags" : "language: english",
 *          "codec" : "aac",
 *          "bitrate": 204000,
 *          "record":  true,
 *          "recording_bitrate" : 192000,
 *          "recording_channels" : 2,
 *          "playout": bool
 *          "playout_label": "English (Stereo)"
 *        },
 *        "3": {
 *          ...
 *        }
 *      }
 *    }
 *
 * @methodGroup Live Stream
 * @namedParams
 * @param {string} name - Object ID or name of the live stream object
 * @param {Object=} customSettings - Additional options to customize configuration settings
 * @return {Promise<Object>} - The status response for the stream
 *
 */
exports.StreamConfig = async function({name, customSettings={}}) {
  let objectId = name;
  let status = {name};

  let libraryId = await this.ContentObjectLibraryId({objectId});
  status.library_id = libraryId;
  status.object_id = objectId;

  let mainMeta = await this.ContentObjectMetadata({
    libraryId: libraryId,
    objectId: objectId
  });

  let userConfig = mainMeta.live_recording_config;
  status.user_config = userConfig;

  // Get node URI from user config
  const hostName = userConfig.url.replace("udp://", "").replace("rtmp://", "").replace("srt://", "").split(":")[0];
  const streamUrl = new URL(userConfig.url);

  console.log("Retrieving nodes - matching", hostName);
  let nodes = await this.SpaceNodes({matchEndpoint: hostName});
  if(nodes.length < 1) {
    status.error = "No node matching stream URL " + streamUrl.href;
    return status;
  }
  const node = nodes[0];
  status.node = node;

  let endpoint = node.endpoints[0];
  this.SetNodes({fabricURIs: [endpoint]});

  // Probe the stream
  let probe = {};
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, 60 * 1000); // milliseconds
  try {

    let probeUrl = await this.Rep({
      libraryId,
      objectId,
      rep: "probe"
    });

    probe = await this.utils.ResponseToJson(
      await HttpClient.Fetch(probeUrl, {
        body: JSON.stringify({
          "filename": streamUrl.href,
          "listen": true
        }),
        method: "POST",
        signal: controller.signal
      })
    );

    if(probe) { clearTimeout(timeoutId); }

    if(probe.errors) {
      throw probe.errors[0];
    }
  } catch(error) {
    if(error.code === "ETIMEDOUT") {
      throw "Stream probe time out - make sure the stream source is available";
    } else {
      throw error;
    }
  }

  probe.format.filename = streamUrl.href;

  // Create live recording config
  let lc = new LiveConf(probe, node.id, endpoint, false, false, true);

  const liveRecordingConfig = lc.generateLiveConf({
    customSettings
  });

  // Store live recording config into the stream object
  let e = await this.EditContentObject({
    libraryId,
    objectId: objectId
  });
  let writeToken = e.write_token;

  await this.ReplaceMetadata({
    libraryId,
    objectId,
    writeToken,
    metadataSubtree: "live_recording",
    metadata: liveRecordingConfig.live_recording
  });

  status.fin = await this.FinalizeContentObject({
    libraryId,
    objectId,
    writeToken,
    commitMessage: "Apply live stream configuration"
  });

  return status;
};

/**
 * List the pre-allocated URLs for a site
 *
 * @methodGroup Live Stream
 * @namedParams
 * @param {string=} siteId - ID of the live stream site object
 *
 * @return {Promise<Object>} - The list of stream URLs
 */
exports.StreamListUrls = async function({siteId}={}) {
  try {
    const STATUS_MAP = {
      UNCONFIGURED: "unconfigured",
      UNINITIALIZED: "uninitialized",
      INACTIVE: "inactive",
      STOPPED: "stopped",
      STARTING: "starting",
      RUNNING: "running",
      STALLED: "stalled",
    };

    if(!siteId) {
      const tenantContractId = await this.userProfileClient.TenantContractId();

      if(!tenantContractId) {
        throw Error("No tenant contract ID configured");
      }

      siteId = await this.ContentObjectMetadata({
        libraryId: tenantContractId.replace("iten", "ilib"),
        objectId: tenantContractId.replace("iten", "iq__"),
        metadataSubtree: "public/sites/live_streams",
      });
    }

    const streamMetadata = await this.ContentObjectMetadata({
      libraryId: await this.ContentObjectLibraryId({objectId: siteId}),
      objectId: siteId,
      metadataSubtree: "public/asset_metadata/live_streams",
      resolveLinks: true,
      resolveIgnoreErrors: true
    });

    const activeUrlMap = {};
    await this.utils.LimitedMap(
      10,
      Object.keys(streamMetadata || {}),
      async slug => {
        const stream = streamMetadata[slug];
        let versionHash;

        if(
          stream &&
          stream.sources &&
          stream.sources.default &&
          stream.sources.default["."] &&
          stream.sources.default["."].container ||
          ((stream["/"] || "").match(/^\/?qfab\/([\w]+)\/?.+/) || [])[1]
        ) {
          versionHash = (
            stream.sources.default["."].container ||
            ((stream["/"] || "").match(/^\/?qfab\/([\w]+)\/?.+/) || [])[1]
          );
        }

        if(versionHash) {
          const objectId = this.utils.DecodeVersionHash(versionHash).objectId;
          const libraryId = await this.ContentObjectLibraryId({objectId});

          const status = await this.StreamStatus({
            name: objectId
          });

          const streamMeta = await this.ContentObjectMetadata({
            objectId,
            libraryId,
            select: [
              "live_recording_config/reference_url",
              // live_recording_config/url is the old path
              "live_recording_config/url"
            ]
          });

          const url = streamMeta.live_recording_config.reference_url || streamMeta.live_recording_config.url;
          const isActive = [STATUS_MAP.STARTING, STATUS_MAP.RUNNING, STATUS_MAP.STALLED, STATUS_MAP.STOPPED].includes(status.state);

          if(url && isActive) {
            activeUrlMap[url] = true;
          }
        }
      }
    );

    const streamUrlStatus = {};

    const streamUrls = await this.ContentObjectMetadata({
      libraryId: await this.ContentObjectLibraryId({objectId: siteId}),
      objectId: siteId,
      metadataSubtree: "/live_stream_urls",
      resolveLinks: true,
      resolveIgnoreErrors: true
    });

    if(!streamUrls) {
      throw Error("No pre-allocated URLs configured");
    }

    Object.keys(streamUrls || {}).forEach(protocol => {
      streamUrlStatus[protocol] = streamUrls[protocol].map(url => {
        return {
          url,
          active: activeUrlMap[url] || false
        };
      })
    });

    return streamUrlStatus;
  } catch(error) {
    console.error(error);
  }
};

/**
 * Copy a portion of a live stream recording into a standard VoD object using the zero-copy content fabric API
 *
 * Limitations:
 * - currently requires the target object to be pre-created and have content encryption keys (CAPS)
 * - for audio and video to be sync'd, the live stream needs to have the beginning of the desired recording period
 * - for an event stream, make sure the TTL is long enough to allow running the live-to-vod command before the beginning of the recording expires
 * - for 24/7 streams, make sure to reset the stream before the desired recording (as to create a new recording period) and have the TTL long enough
 *  to allow running the live-to-vod command before the beginning of the recording expires.
 * - startTime and endTime are not currently implemented by this method
 *
 *
 * @methodGroup Live Stream
 * @namedParams
 * @param {string} name - Object ID or name of the live stream
 * @param {string} targetObjectId - Object ID of the target VOD object
 * @param {string=} eventId -
 * @param {boolean=} finalize - If enabled, target object will be finalized after copy to vod operations
 * @param {number=} recordingPeriod - Determines which recording period to copy, which are 0-based. -1 copies the current (or last) period
 *
 * @return {Promise<Object>} - The status response for the stream
 */

/*
   Example fabric API flow:

     https://host-76-74-34-194.contentfabric.io/qlibs/ilib24CtWSJeVt9DiAzym8jB6THE9e7H/q/$QWT/call/media/live_to_vod/init -d @r1 -H "Authorization: Bearer $TOK"

     {
       "live_qhash": "hq__5Zk1jSN8vNLUAXjQwMJV8F8J8ESXNvmVKkhaXySmGc1BXnJPG2FvvaXee4CXqvFHuGuU3fqLJc",
       "start_time": "",
       "end_time": "",
       "recording_period": -1,
       "streams": ["video", "audio"],
       "variant_key": "default"
     }

     https://host-76-74-34-194.contentfabric.io/qlibs/ilib24CtWSJeVt9DiAzym8jB6THE9e7H/q/$QWT/call/media/abr_mezzanine/init  -H "Authorization: Bearer $TOK" -d @r2

     {

       "abr_profile": { ...  },
       "offering_key": "default",
       "prod_master_hash": "tqw__HSQHBt7vYxWfCMPH5yXwKTfhdPcQ4Lcs9WUMUbTtnMbTZPTLo4BfJWPMGpoy1Dpv1wWQVtUtAtAr429TnVs",
       "variant_key": "default",
       "keep_other_streams": false
     }

     https://host-76-74-34-194.contentfabric.io/qlibs/ilib24CtWSJeVt9DiAzym8jB6THE9e7H/q/$QWT/call/media/live_to_vod/copy -d '{"variant_key":"","offering_key":""}' -H "Authorization: Bearer $TOK"


     https://host-76-74-34-194.contentfabric.io/qlibs/ilib24CtWSJeVt9DiAzym8jB6THE9e7H/q/$QWT/call/media/abr_mezzanine/offerings/default/finalize -d '{}' -H "Authorization: Bearer $TOK"

 */

exports.StreamCopyToVod = async function({
  name,
  targetObjectId,
  eventId,
  streams=null,
  finalize=true,
  recordingPeriod=-1,
  startTime="",
  endTime=""
}) {
  const objectId = name;
  const abrProfile = require("../abr_profiles/abr_profile_live_to_vod.js");

  const status = await this.StreamStatus({name});
  const libraryId = status.library_id;

  this.Log(`Copying stream ${name} to target ${targetObjectId}`);

  ValidateObject(targetObjectId);

  const targetLibraryId = await this.ContentObjectLibraryId({objectId: targetObjectId});

  // Validation - ensure target object has content encryption keys
  const kmsAddress = await this.authClient.KMSAddress({objectId: targetObjectId});
  const kmsCapId = `eluv.caps.ikms${this.utils.AddressToHash(kmsAddress)}`;
  const kmsCap = await this.ContentObjectMetadata({
    libraryId: targetLibraryId,
    objectId: targetObjectId,
    metadataSubtree: kmsCapId
  });

  if(!kmsCap) {
    throw Error(`No content encryption key set for object ${targetObjectId}`);
  }

  try {
    status.live_object_id = objectId;

    const liveHash = await this.LatestVersionHash({objectId, libraryId});
    status.live_hash = liveHash;

    if(eventId) {
      // Retrieve start and end times for the event
      let event = await this.CueInfo({eventId, status});
      if(event.eventStart && event.eventEnd) {
        startTime = event.eventStart;
        endTime = event.eventEnd;
      }
    }

    const {writeToken} = await this.EditContentObject({
      objectId: targetObjectId,
      libraryId: targetLibraryId
    });

    status.target_object_id = targetObjectId;
    status.target_library_id = targetLibraryId;
    status.target_write_token = writeToken;

    this.Log("Process live source (takes around 20 sec per hour of content)");

    await this.CallBitcodeMethod({
      libraryId: targetLibraryId,
      objectId: targetObjectId,
      writeToken,
      method: "/media/live_to_vod/init",
      body: {
        "live_qhash": liveHash,
        "start_time": startTime, // eg. "2023-10-03T02:09:02.00Z",
        "end_time": endTime, // eg. "2023-10-03T02:15:00.00Z",
        "streams": streams,
        "recording_period": recordingPeriod,
        "variant_key": "default"
      },
      constant: false,
      format: "text"
    });

    const abrMezInitBody = {
      abr_profile: abrProfile,
      "offering_key": "default",
      "prod_master_hash": writeToken,
      "variant_key": "default",
      "keep_other_streams": false
    };

    await this.CallBitcodeMethod({
      libraryId: targetLibraryId,
      objectId: targetObjectId,
      writeToken,
      method: "/media/abr_mezzanine/init",
      body: abrMezInitBody,
      constant: false,
      format: "text"
    });

    try {
      await this.CallBitcodeMethod({
        libraryId: targetLibraryId,
        objectId: targetObjectId,
        writeToken,
        method: "/media/live_to_vod/copy",
        body: {},
        constant: false,
        format: "text"
      });
    } catch(error) {
      console.error("Unable to call /media/live_to_vod/copy", error);
      throw error;
    }

    await this.CallBitcodeMethod({
      libraryId: targetLibraryId,
      objectId: targetObjectId,
      writeToken,
      method: "/media/abr_mezzanine/offerings/default/finalize",
      body: abrMezInitBody,
      constant: false,
      format: "text"
    });

    if(finalize) {
      const finalizeResponse = await this.FinalizeContentObject({
        libraryId: targetLibraryId,
        objectId: targetObjectId,
        writeToken,
        commitMessage: "Live Stream to VoD"
      });

      status.target_hash = finalizeResponse.hash;
    }

    // Clean up unnecessary status items
    delete status.playout_urls;
    delete status.lro_status_url;
    delete status.recording_period;
    delete status.recording_period_sequence;
    delete status.edge_meta_size;
    delete status.insertions;

    return status;
  } catch(error) {
    this.Log(error, true);
    throw error;
  }
};

/**
 * Remove a watermark for a live stream
 *
 * @methodGroup Live Stream
 * @namedParams
 * @param {string} objectId - Object ID of the live stream
 * @param {Array<string>} types - Specify which type of watermark to remove. Possible values:
 * - "image"
 * - "text"
 * @param {boolean=} finalize - If enabled, target object will be finalized after removing watermark
 *
 * @return {Promise<Object>} - The finalize response
 */
exports.StreamRemoveWatermark = async function({
  objectId,
  types,
  finalize=true
}) {
  ValidateObject(objectId);

  const libraryId = await this.ContentObjectLibraryId({objectId});
  const {writeToken} = await this.EditContentObject({
    objectId,
    libraryId
  });

  this.Log(`Removing watermark types: ${types.join(", ")} ${libraryId} ${objectId}`);

  const edgeWriteToken = await this.ContentObjectMetadata({
    objectId,
    libraryId,
    metadataSubtree: "/live_recording/fabric_config/edge_write_token"
  });

  const recordingParamsPath = "live_recording/recording_config/recording_params";

  const recordingMetadata = await this.ContentObjectMetadata({
    libraryId,
    objectId,
    writeToken,
    metadataSubtree: recordingParamsPath,
    resolveLinks: false
  });

  if(!recordingMetadata) {
    throw Error("Stream object must be configured");
  }

  types.forEach(type => {
    if(type === "text") {
      delete recordingMetadata.simple_watermark;
    } else if(type === "image") {
      delete recordingMetadata.image_watermark;
    }
  });

  await this.ReplaceMetadata({
    libraryId,
    objectId,
    writeToken,
    metadataSubtree: recordingParamsPath,
    metadata: recordingMetadata
  });

  if(edgeWriteToken) {
    await this.ReplaceMetadata({
      libraryId,
      objectId,
      writeToken: edgeWriteToken,
      metadataSubtree: recordingParamsPath,
      metadata: recordingMetadata
    });
  }

  if(finalize) {
    const finalizeResponse = await this.FinalizeContentObject({
      libraryId,
      objectId,
      writeToken,
      commitMessage: "Watermark removed"
    });

    return finalizeResponse;
  }
};

/**
 * Create a watermark for a live stream
 *
 * @methodGroup Live Stream
 * @namedParams
 * @param {string} objectId - Object ID of the live stream
 * @param {Object} simpleWatermark - Text watermark
 * @param {Object} imageWatermark - Image watermark
 * @param {boolean=} finalize - If enabled, target object will be finalized after adding watermark
 *
 * @return {Promise<Object>} - The finalize response
 */
exports.StreamAddWatermark = async function({
  objectId,
  simpleWatermark,
  imageWatermark,
  finalize=true
}) {
  ValidateObject(objectId);

  const libraryId = await this.ContentObjectLibraryId({objectId});
  const {writeToken} = await this.EditContentObject({
    objectId,
    libraryId
  });

  const edgeWriteToken = await this.ContentObjectMetadata({
    objectId,
    libraryId,
    metadataSubtree: "/live_recording/fabric_config/edge_write_token"
  });

  this.Log(`Adding watermarking type: ${imageWatermark ? "image" : "text"} ${libraryId} ${objectId}`);

  const recordingParamsPath = "live_recording/recording_config/recording_params";

  const recordingMetadata = await this.ContentObjectMetadata({
    libraryId,
    objectId,
    writeToken,
    metadataSubtree: recordingParamsPath,
    resolveLinks: false
  });

  if(!recordingMetadata) {
    throw Error("Stream object must be configured");
  }

  if(simpleWatermark) {
    recordingMetadata.simple_watermark = simpleWatermark;
  } else if(imageWatermark) {
    recordingMetadata.image_watermark = imageWatermark;
  }

  await this.ReplaceMetadata({
    libraryId,
    objectId,
    writeToken,
    metadataSubtree: recordingParamsPath,
    metadata: recordingMetadata
  });

  if(edgeWriteToken) {
    await this.ReplaceMetadata({
      libraryId,
      objectId,
      writeToken: edgeWriteToken,
      metadataSubtree: recordingParamsPath,
      metadata: recordingMetadata
    });
  }

  const response = {
    "imageWatermark": recordingMetadata.image_watermark,
    "textWatermark": recordingMetadata.simple_watermark
  };

  if(finalize) {
    const finalizeResponse = await this.FinalizeContentObject({
      libraryId,
      objectId,
      writeToken,
      commitMessage: "Watermark set"
    });

    response.hash = finalizeResponse.hash;
  }

  return response;
};
