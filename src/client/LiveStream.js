/**
 * Methods for Live Stream creation and management
 *
 * @module ElvClient/LiveStream
 */

const {LiveConf} = require("./LiveConf");
const path = require("path");

const fs = require("fs");

const HttpClient = require("../HttpClient");
//
// const {
//   ValidateLibrary,
//   ValidateVersion,
//   ValidateParameters
// } = require("../Validation");

const MakeTxLessToken = async({client, libraryId, objectId, versionHash}) => {
  const tok = await client.authClient.AuthorizationToken({libraryId, objectId,
    versionHash, channelAuth: false, noCache: true,
    noAuth: true});

  return tok;
};

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retrieve the status of the current live stream session
 *
 * @methodGroup Live Stream
 * @namedParams
 * @param {string} name -
 * @param {boolean} stopLro -
 * @param {boolean} showParams -
 * States:
 * unconfigured    - no live_recording_config
 * uninitialized   - no live_recording config generated
 * inactive        - live_recording config initialized but no 'edge write token'
 * stopped         - edge-write-token but not started
 * starting        - LRO running but no source data yet
 * running         - stream is running and producing output
 * stalled         - LRO running but no source data (so not producing output)
 *
 * @return {Object} - The status response for the object, as well as logs, warnings and errors from the master initialization
 */
exports.StreamStatus = async function({name, stopLro=false, showParams=false}) {
  let conf = await this.LoadConf({name});

  let status = {name: name};

  try {

    let libraryId = await this.ContentObjectLibraryId({objectId: conf.objectId});
    status.library_id = libraryId;
    status.object_id = conf.objectId;

    let mainMeta = await this.ContentObjectMetadata({
      libraryId: libraryId,
      objectId: conf.objectId,
      select: [
        "live_recording_config",
        "live_recording"
      ]
    });

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
    if(edgeWriteToken == undefined) {
      status.state = "inactive";
      return status;
    }

    this.RecordWriteToken({writeToken: edgeWriteToken, fabricNodeUrl: fabURI});

    status.edge_write_token = edgeWriteToken;
    status.stream_id = edgeWriteToken; // By convention the stream ID is its write token
    let edgeMeta = await this.ContentObjectMetadata({
      libraryId: libraryId,
      objectId: conf.objectId,
      writeToken: edgeWriteToken,
      select: [
        "live_recording"
      ]
    });

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

    let sinceLastFinalize = Math.floor(new Date().getTime() / 1000) -
      period.video_finalized_parts_info.last_finalization_time /1000000;

    let recording_period = {
      activation_time_epoch_sec: period.recording_start_time_epoch_sec,
      start_time_epoch_sec: period.start_time_epoch_sec,
      start_time_text: new Date(period.start_time_epoch_sec * 1000).toLocaleString(),
      end_time_epoch_sec: period.end_time_epoch_sec,
      end_time_text:  period.end_time_epoch_sec === 0 ? null : new Date(period.end_time_epoch_sec * 1000).toLocaleString(),
      video_parts: period.video_finalized_parts_info.n_parts,
      video_last_part_finalized_epoch_sec: period.video_finalized_parts_info.last_finalization_time / 1000000,
      video_since_last_finalize_sec : sinceLastFinalize
    };
    status.recording_period = recording_period;

    status.lro_status_url = await this.FabricUrl({
      libraryId: libraryId,
      objectId: conf.objectId,
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
      status.recording_paramse = edgeMeta.live_recording.recording_config.recording_params;
    }

    let state = "stopped";
    let lroStatus = "";
    try {
      lroStatus = await this.utils.ResponseToJson(
        await HttpClient.Fetch(status.lro_status_url)
      );
      state = lroStatus.state;
    } catch(error) {
      console.log("LRO Status (failed): ", error.response.statusCode);
      status.state = "stopped";
      status.error = error.response;
      return status;
    }

    // Convert LRO 'state' to desired 'state'
    if(state === "running" && period.video_finalized_parts_info.last_finalization_time === 0) {
      state = "starting";
    } else if(state === "running" && sinceLastFinalize > 32.9) {
      state = "stalled";
    } else if(state == "terminated") {
      state = "stopped";
    }
    status.state = state;

    if((state === "running" || state === "stalled" || state === "starting") && stopLro) {
      lroStopUrl = await this.FabricUrl({
        libraryId: libraryId,
        objectId: conf.objectId,
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
      let objectId = conf.objectId;
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
      let embed_url = `https://embed.v3.contentfabric.io/?net=${embed_net}&p&ct=h&oid=${conf.objectId}&mt=v&ath=${token}`;
      playout_urls.embed_url = embed_url;

      status.playout_urls = playout_urls;
    }
  } catch(error) {
    console.error(error);
  }

  return status;
};

// async StatusPrep({name}) {
//
//   let conf = await this.LoadConf({name});
//
//   try {
//
//     // Set static token - avoid individual auth for separate channels/streams
//     let token = await MakeTxLessToken({client: this.client, libraryId: conf.libraryId});
//     this.client.SetStaticToken({token});
//
//   } catch(error) {
//     console.log("StatusPrep failed: ", error);
//     return null;
//   }
//
// }

/**
 * Create a new edge write token
 *
 * @methodGroup Live Stream
 * @namedParams
 * @param {string} name -
 * @param {boolean} start -
 *
 * @return {Object} - The status response for the object
 *
*/
exports.StreamCreate = async function({name, start = false}) {

  let status = await this.StreamStatus({name});
  if(status.state !== "inactive" && status.state !== "terminated" && status.state !== "stopped") {
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
 * @param {string} name -
 * @param {string=} op - The operation to perform. Possible values:
 * 'start'
 * 'reset' - Stops current LRO recording and starts a new one.  Does
 * not create a new edge write token (just creates a new recording
 * period in the existing edge write token)
 * - 'stop'
 *
 * @return {Object} - The status response for the stream
 *
*/
exports.StreamStartOrStopOrReset = async function({name, op}) {
  try {
    console.log("Stream ", op, ": ", name);
    let status = await this.StreamStatus({name});
    if(status.state != "stopped") {
      if(op === "start") {
        status.error = "Unable to start stream - state: " + status.state;
        return status;
      }
    }

    if(status.state == "running" || status.state == "starting" || status.state == "stalled") {
      console.log("STOPPING");
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
        await sleep(1000);
        status = await this.StreamStatus({name});
      }
      console.log("Status after terminate - ", status.state);

      if(tries <= 0) {
        console.log("Failed to terminate");
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
      await sleep(1000);
      status = await this.StreamStatus({name});
    }

    console.log("Status after restart - ", status.state);
    return status;

  } catch(error) {
    console.error(error);
  }
};

/*
 * Stop the live stream session and close the edge write token.
 * Not implemented fully
 */
// async StopSession({name}) {
//
//   try {
//
//     console.log("TERMINATE: ", name);
//
//     let conf = await this.LoadConf({name});
//
//     let objectId = conf.objectId;
//     let libraryId = await this.client.ContentObjectLibraryId({objectId: objectId});
//
//     let mainMeta = await this.client.ContentObjectMetadata({
//       libraryId: libraryId,
//       objectId: objectId
//     });
//
//     let fabURI = mainMeta.live_recording.fabric_config.ingress_node_api;
//     // Support both hostname and URL ingress_node_api
//     if(!fabURI.startsWith("http")) {
//       // Assume https
//       fabURI = "https://" + fabURI;
//     }
//
//     this.client.SetNodes({fabricURIs: [fabURI]});
//
//     let edgeWriteToken = mainMeta.live_recording.fabric_config.edge_write_token;
//
//     if(edgeWriteToken === undefined || edgeWriteToken === "") {
//       return {
//         state: "inactive",
//         error: "no active streams - must create a stream first"
//       };
//     }
//     let edgeMeta = await this.client.ContentObjectMetadata({
//       libraryId: libraryId,
//       objectId: objectId,
//       writeToken: edgeWriteToken
//     });
//
//     // Stop the LRO if running
//     let status = await this.Status({name});
//     if(status.state != "terminated") {
//       console.log("STOPPING");
//       try {
//         await this.client.CallBitcodeMethod({
//           libraryId: status.library_id,
//           objectId: status.object_id,
//           writeToken: status.edge_write_token,
//           method: "/live/stop/" + status.tlro,
//           constant: false
//         });
//       } catch(error) {
//         // The /call/lro/stop API returns empty response
//         // console.log("LRO Stop (failed): ", error);
//       }
//
//       // Wait until LRO is terminated
//       let tries = 10;
//       while (status.state != "terminated" && tries-- > 0) {
//         console.log("Wait to terminate - ", status.state);
//         await sleep(1000);
//         status = await this.Status({name});
//       }
//       console.log("Status after terminate - ", status.state);
//
//       if(tries <= 0) {
//         console.log("Failed to terminate");
//         return status;
//       }
//     }
//
//     // Set stop time
//     edgeMeta.recording_stop_time = Math.floor(new Date().getTime() / 1000);
//     console.log("recording_start_time: ", edgeMeta.recording_start_time);
//     console.log("recording_stop_time:  ", edgeMeta.recording_stop_time);
//
//     edgeMeta.live_recording.status = {
//       state: "terminated",
//       recording_stop_time: edgeMeta.recording_stop_time
//     };
//
//     edgeMeta.live_recording.fabric_config.edge_write_token = "";
//
//     await this.client.ReplaceMetadata({
//       libraryId: libraryId,
//       objectId: objectId,
//       writeToken: edgeWriteToken,
//       metadata: edgeMeta
//     });
//
//     let fin = await this.client.FinalizeContentObject({
//       libraryId,
//       objectId,
//       writeToken: edgeWriteToken,
//       commitMessage: "Finalize live stream - stop time " + edgeMeta.recording_stop_time,
//       publish: false // Don't publish this version because it is not currently useful
//     });
//
//     return {
//       fin,
//       name: name,
//       edge_write_token: edgeWriteToken,
//       state: "terminated"
//     };
//
//   } catch(error) {
//     console.error(error);
//   }
// }

// async Initialize({name, drm=false, format}) {
//
//   const contentTypes = await this.client.ContentTypes();
//
//   let typeAbrMaster;
//   let typeLiveStream;
//   for (let i = 0; i < Object.keys(contentTypes).length; i ++) {
//     const key = Object.keys(contentTypes)[i];
//     if(contentTypes[key].name.includes("ABR Master") || contentTypes[key].name.includes("Title")) {
//       typeAbrMaster = contentTypes[key].hash;
//     }
//     if(contentTypes[key].name.includes("Live Stream")) {
//       typeLiveStream = contentTypes[key].hash;
//     }
//   }
//
//   if(typeAbrMaster === undefined || typeLiveStream === undefined) {
//     console.log("ERROR - unable to find content types", "ABR Master", typeAbrMaster, "Live Stream", typeLiveStream);
//     return {};
//   }
//   let res = await this.SetOfferingAndDRM({name, typeAbrMaster, typeLiveStream, drm, format});
//   return res;
// }

// async SetOfferingAndDRM({name, typeAbrMaster, typeLiveStream, drm=false, format}) {
//
//   let status = await this.Status({name});
//   if(status.state != "inactive" && status.state != "terminated") {
//     return {
//       state: status.state,
//       error: "stream still active - must terminate first"
//     };
//   }
//
//   let objectId = status.object_id;
//
//   console.log("INIT: ", name, objectId);
//
//   const {GenerateOffering} = require("./LiveObjectSetupStepOne");
//
//   const aBitRate = 128000;
//   const aChannels = 2;
//   const aSampleRate = 48000;
//   const aStreamIndex = 1;
//   const aTimeBase = "1/48000";
//   const aChannelLayout = "stereo";
//
//   const vBitRate = 14000000;
//   const vHeight = 720;
//   const vStreamIndex = 0;
//   const vWidth = 1280;
//   const vDisplayAspectRatio = "16/9";
//   const vFrameRate = "30000/1001";
//   const vTimeBase = "1/30000"; // "1/16000";
//
//   const abrProfile = require("./abr_profile_live_drm.json");
//
//   let playoutFormats = abrProfile.playout_formats;
//   if(format) {
//     drm = true; // Override DRM parameter
//     playoutFormats = {};
//     let formats = format.split(",");
//     for (let i = 0; i < formats.length; i++) {
//       if(formats[i] === "hls-clear") {
//         abrProfile.drm_optional = true;
//         playoutFormats["hls-clear"] = {
//           "drm": null,
//           "protocol": {
//             "type": "ProtoHls"
//           }
//         };
//         continue;
//       }
//       playoutFormats[formats[i]] = abrProfile.playout_formats[formats[i]];
//     }
//   } else if(!drm) {
//     abrProfile.drm_optional = true;
//     playoutFormats = {
//       "hls-clear": {
//         "drm": null,
//         "protocol": {
//           "type": "ProtoHls"
//         }
//       }
//     };
//   }
//
//   abrProfile.playout_formats = playoutFormats;
//
//   let libraryId = await this.client.ContentObjectLibraryId({objectId});
//
//   try {
//
//     let mainMeta = await this.client.ContentObjectMetadata({
//       libraryId: libraryId,
//       objectId: objectId
//     });
//
//     let fabURI = mainMeta.live_recording.fabric_config.ingress_node_api;
//     // Support both hostname and URL ingress_node_api
//     if(!fabURI.startsWith("http")) {
//       // Assume https
//       fabURI = "https://" + fabURI;
//     }
//
//     this.client.SetNodes({fabricURIs: [fabURI]});
//
//     let streamUrl = mainMeta.live_recording.recording_config.recording_params.origin_url;
//
//     await GenerateOffering({
//       client: this.client,
//       libraryId,
//       objectId,
//       typeAbrMaster, typeLiveStream,
//       streamUrl,
//       abrProfile,
//       aBitRate, aChannels, aSampleRate, aStreamIndex,
//       aTimeBase,
//       aChannelLayout,
//       vBitRate, vHeight, vStreamIndex, vWidth,
//       vDisplayAspectRatio, vFrameRate, vTimeBase
//     });
//
//     console.log("GenerateOffering - DONE");
//
//     return {
//       name,
//       object_id: objectId,
//       state: "initialized"
//     };
//   } catch(error) {
//     console.error(error);
//   }
// }

// Add a content insertion entry
// Parameters:
// - insertionTime - seconds (float)
// - sinceStart - true if time specified since stream start, false if since epoch
// - duration - seconds (float, deafault 20.0)
// - targetHash -  playable
// - remove - flag to remove the insertion at that exact 'time' (instead of adding)
// async Insertion({name, insertionTime, sinceStart, duration, targetHash, remove}) {
//
//   // Determine audio and video parameters of the insertion
//   const insertionInfo = await this.getOfferingInfo({versionHash: targetHash});
//   const audioAbrDuration = insertionInfo.audio.seg_duration_sec;
//   const videoAbrDuration = insertionInfo.video.seg_duration_sec;
//
//   if(audioAbrDuration === 0 || videoAbrDuration === 0) {
//     throw new Error("Bad segment duration hash:", targetHash);
//   }
//
//   if(duration === undefined) {
//     duration = insertionInfo.duration_sec;  // Use full duration of the insertion
//   } else {
//     if(duration > insertionInfo.duration_sec) {
//       throw new Error("Bad duration - larger than insertion object duration", insertionInfo.duration_sec);
//     }
//   }
//
//   let conf = await this.LoadConf({name});
//   let libraryId = await this.client.ContentObjectLibraryId({objectId: conf.objectId});
//   let objectId = conf.objectId;
//
//   let mainMeta = await this.client.ContentObjectMetadata({
//     libraryId: libraryId,
//     objectId: conf.objectId
//   });
//
//   let fabURI = mainMeta.live_recording.fabric_config.ingress_node_api;
//
//   // Support both hostname and URL ingress_node_api
//   if(!fabURI.startsWith("http")) {
//     // Assume https
//     fabURI = "https://" + fabURI;
//   }
//   this.client.SetNodes({fabricURIs: [fabURI]});
//   let edgeWriteToken = mainMeta.live_recording.fabric_config.edge_write_token;
//
//   let edgeMeta = await this.client.ContentObjectMetadata({
//     libraryId: libraryId,
//     objectId: conf.objectId,
//     writeToken: edgeWriteToken
//   });
//
//   // Find stream start time (from the most recent recording section)
//   let recordings = edgeMeta.live_recording.recordings;
//   let sequence = 1;
//   let streamStartTime = 0;
//   if(recordings != undefined && recordings.recording_sequence != undefined) {
//     // We have at least one recording - check if still active
//     sequence = recordings.recording_sequence;
//     let period = recordings.live_offering[sequence - 1];
//
//     if(period.end_time_epoch_sec > 0) {
//       // The last period is closed - apply insertions to the next period
//       sequence ++;
//     } else {
//       // The period is active
//       streamStartTime = period.start_time_epoch_sec;
//     }
//   }
//
//   if(streamStartTime === 0) {
//     // There is no active period - must use absolute time
//     if(sinceStart === false) {
//       throw new Error("Stream not running - must use 'time since start'");
//     }
//   }
//
//   // Find the current period playout configuration
//   if(edgeMeta.live_recording.playout_config.interleaves === undefined) {
//     edgeMeta.live_recording.playout_config.interleaves = {};
//   }
//   if(edgeMeta.live_recording.playout_config.interleaves[sequence] === undefined) {
//     edgeMeta.live_recording.playout_config.interleaves[sequence] = [];
//   }
//
//   let playoutConfig = edgeMeta.live_recording.playout_config;
//   let insertions = playoutConfig.interleaves[sequence];
//
//   let res = {};
//
//   if(!sinceStart) {
//     insertionTime = insertionTime - streamStartTime;
//   }
//
//   // Assume insertions are sorted by insertion time
//   let errs = [];
//   let currentTime = -1;
//   let insertionDone = false;
//   let newInsertion = {
//     insertion_time: insertionTime,
//     duration: duration,
//     audio_abr_duration: audioAbrDuration,
//     video_abr_duration: videoAbrDuration,
//     playout: "/qfab/" + targetHash + "/rep/playout"  // TO FIX - should be a link
//   };
//
//   for (let i = 0; i < insertions.length; i ++) {
//     if(insertions[i].insertion_time <= currentTime) {
//       // Bad insertion - must be later than current time
//       append(errs, "Bad insertion - time:", insertions[i].insertion_time);
//     }
//     if(remove) {
//       if(insertions[i].insertion_time === insertionTime) {
//         insertions.splice(i, 1);
//         break;
//       }
//     } else {
//       if(insertions[i].insertion_time > insertionTime) {
//         if(i > 0) {
//           insertions = [
//             ...insertions.splice(0, i),
//             newInsertion,
//             ...insertions.splice(i)
//           ];
//         } else {
//           insertions = [
//             newInsertion,
//             ...insertions.splice(i)
//           ];
//         }
//         insertionDone = true;
//         break;
//       }
//     }
//   }
//
//   if(!remove && !insertionDone) {
//     // Add to the end of the insertions list
//     console.log("Add insertion at the end");
//     insertions = [
//       ...insertions,
//       newInsertion
//     ];
//   }
//
//   playoutConfig.interleaves[sequence] = insertions;
//
//   // Store the new insertions in the write token
//   await this.client.ReplaceMetadata({
//     libraryId: libraryId,
//     objectId: objectId,
//     writeToken: edgeWriteToken,
//     metadataSubtree: "/live_recording/playout_config",
//     metadata: edgeMeta.live_recording.playout_config
//   });
//
//   res.errors = errs;
//   res.insertions = insertions;
//   return res;
// }


exports.LoadConf = async function({name}) {
  if(name.startsWith("iq__")) {
    return {
      name: name,
      objectId: name
    };
  }

  // If name is not a QID, load liveconf.json
  let streamsBuf;
  try {
    streamsBuf = fs.readFileSync(
      path.resolve(__dirname, "../liveconf.json")
    );
  } catch(error) {
    console.log("Stream name must be a QID or a label in liveconf.json");
    return {};
  }
  const streams = JSON.parse(streamsBuf);
  const conf = streams[name];
  if(conf === null) {
    console.log("Bad name: ", name);
    return {};
  }

  return conf;
};

/*
 * Read a playable contnet object and get information about a particular offering
 */
// async getOfferingInfo({versionHash, offering = "default"}) {
//
//   // Content Type check is currently disabled due to permissions
//   /*
//   let ct = await this.client.ContentObject({versionHash});
//   if(ct.type != undefined && ct.type != "") {
//     let typeMeta = await this.client.ContentObjectMetadata({
//       versionHash: ct.type
//     });
//     if(typeMeta.bitcode_flags != "abrmaster") {
//       throw new Error("Not a playable VoD object " + versionHash);
//     }
//   }
//   */
//   let offeringMeta = await this.client.ContentObjectMetadata({
//     versionHash,
//     metadataSubtree: "/offerings/" + offering
//   });
//
//   var info = {
//     duration_sec: 0 // Minimum of video and audio duration
//   };
//   ["video", "audio"].forEach(mt =>  {
//     const stream = offeringMeta.media_struct.streams[mt];
//     info[mt] = {
//       seg_duration_sec: stream.optimum_seg_dur.float,
//       duration_sec: stream.duration.float,
//       frame_rate_rat: stream.rate,
//     };
//     if(info.duration_sec === 0 || stream.duration.float < info.duration_sec) {
//       info.duration_sec = stream.duration.float;
//     }
//   });
//   return info;
// }


// async StreamDownload({name, period}) {
//
//   let conf = await this.LoadConf({name});
//
//   let status = {name};
//
//   try {
//
//     let libraryId = await this.client.ContentObjectLibraryId({objectId: conf.objectId});
//     status.library_id = libraryId;
//     status.object_id = conf.objectId;
//
//     let mainMeta = await this.client.ContentObjectMetadata({
//       libraryId: libraryId,
//       objectId: conf.objectId
//     });
//
//     let fabURI = mainMeta.live_recording.fabric_config.ingress_node_api;
//     if(fabURI === undefined) {
//       console.log("bad fabric config - missing ingress node API");
//     }
//
//     // Support both hostname and URL ingress_node_api
//     if(!fabURI.startsWith("http")) {
//       // Assume https
//       fabURI = "https://" + fabURI;
//     }
//     this.client.SetNodes({fabricURIs: [fabURI]});
//
//     let edgeWriteToken = mainMeta.live_recording.fabric_config.edge_write_token;
//     let edgeMeta = await this.client.ContentObjectMetadata({
//       libraryId: libraryId,
//       objectId: conf.objectId,
//       writeToken: edgeWriteToken
//     });
//
//     // If a stream has never been started return state 'inactive'
//     if(edgeMeta.live_recording === undefined ||
//       edgeMeta.live_recording.recordings === undefined ||
//       edgeMeta.live_recording.recordings.recording_sequence === undefined) {
//       status.state = "no recordings";
//       return status;
//     }
//
//     let recordings = edgeMeta.live_recording.recordings;
//     status.recording_period_sequence = recordings.recording_sequence;
//
//     let sequence = recordings.recording_sequence;
//     if(period === undefined || period < 0 || period > sequence - 1) {
//       period = sequence - 1;
//     }
//
//     console.log("Downloading stream", name, " period", period, " latest", sequence - 1);
//
//     let recording = recordings.live_offering[period];
//     if(recording === undefined) {
//       console.log("ERROR - recording period not found: ", period);
//     }
//
//     let dpath = "DOWNLOAD/" + edgeWriteToken + "." + period;
//     !fs.existsSync(dpath) && fs.mkdirSync(dpath, {recursive: true});
//
//     let mts = ["audio", "video"];
//     for (let mi = 0; mi < mts.length; mi ++) {
//       let mt = mts[mi];
//       console.log("Downloading ", mt);
//       let mtpath = dpath + "/" + mt;
//       let partsfile = dpath + "/parts_" + mt + ".txt";
//       !fs.existsSync(mtpath) && fs.mkdirSync(mtpath);
//       var sources = recording.sources[mt];
//       for (let i = 0; i < sources.length - 1; i++) {
//         console.log(sources[i].hash);
//         let partHash = sources[i].hash;
//         let buf = await this.client.DownloadPart({
//           libraryId,
//           objectId: conf.objectId,
//           partHash,
//           format: "buffer",
//           chunked: false,
//           callback: ({bytesFinished, bytesTotal}) => {
//             console.log("  progress: ", bytesFinished + "/" + bytesTotal);
//           }
//         });
//
//         let partfile = mtpath + "/" + partHash + ".mp4";
//         fs.appendFile(partfile, buf, (err) => {
//           if(err)
//             console.log(err);
//         });
//         fs.appendFile(partsfile, "file '" + mt + "/" + partHash + ".mp4'\n", (err) => {
//           if(err)
//             console.log(err);
//         });
//       }
//
//       // Concatenate parts into one mp4
//       let cmd = "ffmpeg -f concat -safe 0 -i " + partsfile + " -c copy " + dpath + "/" + mt + ".mp4";
//       console.log("Running", cmd);
//       execSync(cmd);
//     }
//
//     // Create final mp4 file
//     let f = dpath + "/download.mp4";
//     let cmd = "ffmpeg -i " + dpath + "/video.mp4"  + "  -i " +  dpath + "/audio.mp4" + "  -map 0:v:0  -map 1:a:0  -c copy  -shortest " + f;
//     console.log("Running", cmd);
//     execSync(cmd);
//
//     status.file = f;
//     status.state = "completed";
//   } catch(e) {
//     console.log("Download failed", e);
//     throw e;
//   }
//
//   return status;
// }

/**
 * Configure the stream
 *
 * @methodGroup Live Stream
 * @namedParams
 * @param {string} name -
 * @param {string=} op - The operation to perform. Possible values:
 * 'start'
 * 'reset' - Stops current LRO recording and starts a new one.  Does
 * not create a new edge write token (just creates a new recording
 * period in the existing edge write token)
 * - 'stop'
 *
 * @return {Object} - The status response for the stream
 *
 */
exports.StreamConfig = async function({name}) {
  let conf = await this.LoadConf({name});
  let status = {name};

  let libraryId = await this.ContentObjectLibraryId({objectId: conf.objectId});
  status.library_id = libraryId;
  status.object_id = conf.objectId;

  let mainMeta = await this.ContentObjectMetadata({
    libraryId: libraryId,
    objectId: conf.objectId
  });

  let userConfig = mainMeta.live_recording_config;
  status.user_config = userConfig;

  // Get node URI from user config
  const hostName = userConfig.url.replace("udp://", "").replace("rtmp://", "").split(":")[0];
  const streamUrl = new URL(userConfig.url);

  console.log("Retrieving nodes...");
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
      objectId: conf.objectId,
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

  console.log("PROBE", probe);
  probe.format.filename = streamUrl.href;

  // Create live reocording config
  let lc = new LiveConf(probe, node.id, endpoint, false, false, true);

  const liveRecordingConfigStr = lc.generateLiveConf();
  let liveRecordingConfig = JSON.parse(liveRecordingConfigStr);
  console.log("CONFIG", JSON.stringify(liveRecordingConfig.live_recording));

  // Store live recording config into the stream object
  let e = await this.EditContentObject({
    libraryId,
    objectId: conf.objectId
  });
  let writeToken = e.write_token;

  await this.ReplaceMetadata({
    libraryId,
    objectId: conf.objectId,
    writeToken,
    metadataSubtree: "live_recording",
    metadata: liveRecordingConfig.live_recording
  });

  status.fin = await this.FinalizeContentObject({
    libraryId,
    objectId: conf.objectId,
    writeToken,
    commitMessage: "Apply live stream configuration"
  });

  return status;
};

// const ChannelStatus = async ({client, name}) => {
//
//   let status = {name: name};
//
//   const conf = channels[name];
//   if(conf === null) {
//     console.log("Bad name: ", name);
//     return;
//   }
//
//   try {
//
//     let meta = await client.ContentObjectMetadata({
//       libraryId: conf.libraryId,
//       objectId: conf.objectId
//     });
//
//     status.channel_title = meta.public.asset_metadata.title;
//     let source = meta.channel.offerings.default.items[0].source["/"];
//     let hash = source.split("/")[2];
//     status.stream_hash = hash;
//     latestHash = await client.LatestVersionHash({
//       versionHash: hash
//     });
//     status.stream_latest_hash = latestHash;
//
//     if(hash != latestHash) {
//       status.warnings = ["Stream version is not the latest"];
//     }
//
//     let channelFormatsUrl = await client.FabricUrl({
//       libraryId: conf.libraryId,
//       objectId: conf.objectId,
//       rep: "channel/options.json"
//     });
//
//     try {
//       let offerings = await got(channelFormatsUrl);
//       status.offerings = JSON.parse(offerings.body);
//     } catch(error) {
//       console.log(error);
//       status.offerings_error = "Failed to retrieve channel offerings";
//     }
//
//     status.playout = await ChannelPlayout({client, libraryId: conf.libraryId, objectId: conf.objectId});
//
//   } catch(error) {
//     console.error(error);
//   }
//
//   return status;
// };

/*
 * Performs client-side playout operations - open the channel, read offerings,
 * retrieve playlist and one video init segment.
 */
// const ChannelPlayout = async({client, libraryId, objectId}) => {
//
//   let playout = {};
//
//   const offerings = await client.AvailableOfferings({
//     libraryId,
//     objectId,
//     handler: "channel",
//     linkPath: "/public/asset_metadata/offerings"
//   });
//
//   // Choosing offering 'default'
//   let offering = offerings.default;
//
//   const playoutOptions = await client.PlayoutOptions({
//     libraryId,
//     objectId,
//     offeringURI: offering.uri
//   });
//
//   // Retrieve master playlist
//   let masterPlaylistUrl = playoutOptions["hls"]["playoutMethods"]["fairplay"]["playoutUrl"];
//   playout.master_playlist_url = masterPlaylistUrl;
//   try {
//     //let masterPlaylist =  await got(masterPlaylistUrl);
//     playout.master_playlist = "success";
//   } catch(error) {
//     playout.master_playlist = "fail";
//   }
//
//   let url = new URL(masterPlaylistUrl);
//   let p = url.pathname.split("/");
//
//   // Retrieve media playlist
//   p[p.length - 1] = "video/720@14000000/live.m3u8";
//   let pathMediaPlaylist = p.join("/");
//   url.pathname = pathMediaPlaylist;
//   let mediaPlaylistUrl = url.toString();
//   playout.media_playlist_url = mediaPlaylistUrl;
//   let mediaPlaylist;
//   try {
//     mediaPlaylist = await got(mediaPlaylistUrl);
//     playout.media_playlist = "success";
//   } catch(error) {
//     playout.media_playlist = "fail";
//   }
//
//   // Retrieve init segment
//   var regex = new RegExp("^#EXT-X-MAP:URI=\"init.m4s.(.*)\"$", "m");
//   var match = regex.exec(mediaPlaylist.body);
//   let initQueryParams;
//   if(match) {
//     initQueryParams = match[1];
//   }
//
//   p[p.length - 1] = "video/720@14000000/init.m4s";
//   let pathInit = p.join("/");
//   url.pathname = pathInit;
//   url.search=initQueryParams;
//   let initUrl = url.toString();
//   playout.init_segment_url = initUrl;
//   /*
//   try {
// 	let initSegment = await got(initUrl);
// 	playout.init_segment = "success"
//   } catch(error) {
// 	playout.init_segment = "fail";
//   }
// */
//   return playout;
// };


// const Summary = async ({client}) => {
//
//   let summary = {};
//
//   try {
//     for (const [key] of Object.entries(streams)) {
//       conf = streams[key];
//       summary[key] = await Status({client, name: key, stopLro: false});
//     }
//
//   } catch(error) {
//     console.error(error);
//   }
//   return summary;
// };

// const ChannelSummary = async ({client}) => {
//
//   let summary = {};
//
//   try {
//     for (const [key] of Object.entries(channels)) {
//       conf = channels[key];
//       summary[key] = await ChannelStatus({client, name: key});
//     }
//
//   } catch(error) {
//     console.error(error);
//   }
//   return summary;
// };

// const ConfigStreamRebroadcast = async () => {
//
//   const t = 1619850660;
//
//   try {
//     let client;
//     if(conf.clientConf.configUrl) {
//       client = await ElvClient.FromConfigurationUrl({
//         configUrl: conf.clientConf.configUrl
//       });
//     } else {
//       client = new ElvClient(conf.clientConf);
//     }
//     const wallet = client.GenerateWallet();
//     const signer = wallet.AddAccount({ privateKey: conf.signerPrivateKey });
//     client.SetSigner({ signer });
//     const fabURI = client.fabricURIs[0];
//     console.log("Fabric URI: " + fabURI);
//     const ethURI = client.ethereumURIs[0];
//     console.log("Ethereum URI: " + ethURI);
//
//     client.ToggleLogging(false);
//
//     let mainMeta = await client.ContentObjectMetadata({
//       libraryId: conf.libraryId,
//       objectId: conf.objectId
//     });
//     console.log("Main meta:", mainMeta);
//
//     edgeWriteToken = mainMeta.edge_write_token;
//     console.log("Edge: ", edgeWriteToken);
//
//     let edgeMeta = await client.ContentObjectMetadata({
//       libraryId: conf.libraryId,
//       objectId: conf.objectId,
//       writeToken: edgeWriteToken
//     });
//     console.log("Edge meta:", edgeMeta);
//
//     //console.log("CONFIG: ", edgeMeta.live_recording_parameters.live_playout_config);
//     console.log("recording_start_time: ", edgeMeta.recording_start_time);
//     console.log("recording_stop_time:  ", edgeMeta.recording_stop_time);
//
//     // Set rebroadcast start
//     edgeMeta.live_recording_parameters.live_playout_config.rebroadcast_start_time_sec_epoch = t;
//
//     if(PRINT_DEBUG) console.log("MergeMetadata", conf.libraryId, conf.objectId, writeToken);
//     await client.MergeMetadata({
//       libraryId: conf.libraryId,
//       objectId: conf.objectId,
//       writeToken: edgeWriteToken,
//       metadata: {
//         "live_recording_parameters": {
//           "live_playout_config" : edgeMeta.live_recording_parameters.live_playout_config
//         }
//       }
//     });
//
//   } catch(error) {
//     console.error(error);
//   }
// };

// async function EnsureAll() {
//   client = await StatusPrep({name: null});
//   let summary = await Summary({client});
//
//   var res = {
//     running: 0,
//     stalled: 0,
//     terminated: 0
//   };
//
//   try {
//     for (const [key, value] of Object.entries(summary)) {
//       if(value.state === "stalled") {
//         console.log("Stream stalled: ", key, " - restarting");
//         console.log("todo ...");
//       }
//       res[value.state] = res[value.state] + 1;
//     }
//   } catch(error) {
//     console.error(error);
//   }
//
//   return res;
// }


/*
 * Original Run() function - kept for reference
 */
// async function Run() {
//
//   var client;
//
//   switch (command) {
//
//     case "start":
//       StartStream({name});
//       break;
//
//     case "status":
//       client = await StatusPrep({name});
//       let status = await Status({client, name, stopLro: false});
//       console.log(JSON.stringify(status, null, 4));
//       break;
//
//     case "stop":
//       client = await UpdatePrep({name});
//       Status({client, name, stopLro: true});
//       break;
//
//     case "summary":
//       client = await StatusPrep({name: null});
//       let summary = await Summary({client});
//       console.log(JSON.stringify(summary, null, 4));
//       break;
//
//     case "init": // Set up DRM
//       SetOfferingAndDRM();
//       break;
//
//     case "reset": // Stop and start LRO recording (same edge write token)
//       client = await StatusPrep({name});
//       let reset = await Reset({client, name, stopLro: false});
//       console.log(JSON.stringify(reset, null, 4));
//       break;
//
//     case "channel":
//       client = await StatusPrep({name});
//       let channelStatus = await ChannelStatus({client, name});
//       console.log(JSON.stringify(channelStatus, null, 4));
//       break;
//
//     case "channel_summary":
//       client = await StatusPrep({name});
//       let channelSummary = await ChannelSummary({client, name});
//       console.log(JSON.stringify(channelSummary, null, 4));
//       break;
//
//     case "ensure_all": // Check all and restart stalled
//       let ensureSummary = await EnsureAll();
//       console.log(JSON.stringify(ensureSummary, null, 4));
//       break;
//
//     case "future_use_config":
//       ConfigStreamRebroadcast();
//       break;
//
//     default:
//       console.log("Bad command: ", command);
//       break;
//
//   }
// }
