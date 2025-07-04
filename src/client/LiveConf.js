/* eslint no-console: 0 */

const DefaultABRLadder = {
  "video" : [
    {
      bit_rate: 14000000,
      codecs: "avc1.640028,mp4a.40.2",
      height: 2160,
      width: 3840
    },
    {
      bit_rate: 9500000,
      codecs: "avc1.640028,mp4a.40.2",
      height: 1080,
      width: 1920
    },
    {
      bit_rate: 4500000,
      codecs: "avc1.640028,mp4a.40.2",
      height: 720,
      width: 1280
    },
    {
      bit_rate: 2000000,
      codecs: "avc1.640028,mp4a.40.2",
      height: 540,
      width: 960
    },
    {
      bit_rate: 900000,
      codecs: "avc1.640028,mp4a.40.2",
      height: 540,
      width: 960
    }
  ],
  "audio" : [
    {
      bit_rate: 192000,
      channels: 2,
      codecs: "mp4a.40.2",
    },
    {
      bit_rate: 384000,
      channels: 6,
      codecs: "mp4a.40.2",
    }
  ]
};

const LiveconfTemplate = {
  live_recording: {
    fabric_config: {
      ingress_node_api: "",
      ingress_node_id: ""
    },
    playout_config: {
      dvr_enabled: true,
      dvr_max_duration: 0,
      rebroadcast_start_time_sec_epoch: 0,
      vod_enabled: false
    },
    recording_config: {
      recording_params: {
        description: "",
        ladder_specs: [],
        listen: true,
        live_delay_nano: 2000000000,
        max_duration_sec: -1,
        name: "",
        origin_url: "",
        part_ttl: 3600,
        playout_type: "live",
        source_timescale: null,
        reconnect_timeout: 600,
        xc_params: {
          audio_bitrate: 384000,
          audio_index: [
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0
          ],
          audio_seg_duration_ts: null,
          connection_timeout: 600,
          ecodec2: "aac",
          enc_height: null,
          enc_width: null,
          filter_descriptor: "",
          force_keyint: null,
          format: "fmp4-segment",
          listen: true,
          n_audio: 1,
          preset: "faster",
          sample_rate: 48000,
          seg_duration: null,
          skip_decoding: false,
          start_segment_str: "1",
          stream_id: -1,
          sync_audio_to_stream_id: -1,
          video_bitrate: null,
          video_seg_duration_ts: null,
          video_time_base: null,
          video_frame_duration_ts: null,
          xc_type: 3
        }
      }
    }
  }
};

class LiveConf {
  constructor(probeData, nodeId, nodeUrl, includeAVSegDurations, overwriteOriginUrl, syncAudioToVideo) {
    this.probeData = probeData;
    this.nodeId = nodeId;
    this.nodeUrl = nodeUrl;
    this.includeAVSegDurations = includeAVSegDurations;
    this.overwriteOriginUrl = overwriteOriginUrl;
    this.syncAudioToVideo = syncAudioToVideo;
  }

  probeKind() {
    let fileNameSplit = this.probeData.format.filename.split(":");
    return fileNameSplit[0];
  }

  getStreamDataForCodecType(codecType) {
    let stream = null;
    for(let index = 0; index < this.probeData.streams.length; index++) {
      if(this.probeData.streams[index].codec_type == codecType) {
        stream = this.probeData.streams[index];
      }
    }
    return stream;
  }

  // Return all audio streams found in the probe
  // Used by generateAudioStreamsConfig()
  getAudioStreamsFromProbe() {
    let audioStreams = {};
    const audioStreamData = this.probeData.streams.filter((value) => value.codec_type === "audio");

    for(let index = 0; index < audioStreamData.length; index++) {
      const currentStreamIndex = audioStreamData[index].stream_index;
      const currentStreamData = audioStreamData[index];

      audioStreams[currentStreamIndex] = {
        recordingBitrate: Math.max(currentStreamData.bit_rate, 128000),
        recordingChannels: currentStreamData.channels,
        playoutLabel: `Audio ${index + 1}`
      };
    }

    return audioStreams;
  }

  getFrameRate() {
    let videoStream = this.getStreamDataForCodecType("video");
    let frameRate = videoStream.r_frame_rate || videoStream.frame_rate;
    return frameRate.split("/");
  }

  isFrameRateWhole() {
    let frameRate = this.getFrameRate();
    return frameRate[1] == "1";
  }

  getForceKeyint() {
    let frameRate = this.getFrameRate();
    let roundedFrameRate = Math.round(frameRate[0] / frameRate[1]);
    if(roundedFrameRate > 30) {
      return roundedFrameRate;
    } else {
      return roundedFrameRate * 2;
    }
  }

  /*
   * Calculates mez segment durations based on input stream parameters
   *
   * Live input formats have fixed timebase:
   * - MPEG-TS/SRT input stream timebase is 90000
   * - RTMP input stream timebase is 1000 and gets translated to 16000 if not otherwise specified
   *
   * This causes frame duration irregularities for certain frame rates.
   * For example RTMP 60fps has frames of durations 16 and 17.  MPEG-TS 59.94fps has frames of
   * durations 1001 and 1002.
   *
   * Live mez segmentation requires that the segment be cut at the specific number of frames, and when
   * the frame durations are irregular we adjust both the video timebase and the video frame duration
   * to make the math possible.  This adjustment is also required for live-to-vod conversion.
   *
   * For example for MPEG-TS 59.94fps, the mez segment timebase needs to be 60000
   * (and resulting frame duration is 1001) and for RTMP 60fps the timebase needs to be 15360 (resulting frame
   * duration is 256).
   *
   * @sourceTimescale - adjusted source video stream timescale (eg. MPEGTS 90000, RTMP 16000 )
   * @sampleRate - audio sample rate (commonly 48000 but can be different)
   * @audioCodec - audio codec as a string (eg. "aac")
   * @return - segment encoding parameters
   */
  calcSegDuration({sourceTimescale, sampleRate, audioCodec}) {
    let seg = {};

    switch(this.probeKind()) {
      case "rtmp":
        seg = this.calcSegDurationRtmp({sourceTimescale, sampleRate, audioCodec});
        break;
      case "udp":
      case "srt":
        seg = this.calcSegDurationMpegts({sourceTimescale, sampleRate, audioCodec});
        break;
      default:
        throw "protocol not supported - " + this.probeKind();
    }

    if(audioCodec == "aac") {
      seg.audio = 29.76 * sampleRate;
    } else {
      seg.audio = 29.76 * 48000; // Other codecs are resampled @48000
    }

    return seg;
  }

  /*
  * Calculate output timebase from the encoder (codec) timebase. The videoTimeBase parameter
  * represents the encoder timebase. The format muxer will change it so it is greater than 10000.
  */
  calcOutputTimebase(codecTimebase) {
    let outputTimebase = codecTimebase;
    while(outputTimebase < 10000)
      outputTimebase = outputTimebase * 2;
    return outputTimebase;
  }

  calcSegDurationMpegts({sourceTimescale}) {
    let videoStream = this.getStreamDataForCodecType("video");
    let frameRate = videoStream.frame_rate;

    // PENDING(SS) - calculate frame duration here
    // let frameRateNum = 0;
    let seg = {
      //  videoFrameDurationTs: sourceTimescale / frameRateNum
    };

    switch(frameRate) {
      case "24":
        seg.video = sourceTimescale * 30;
        seg.keyint = 48;
        seg.duration = "30";
        break;
      case "25":
        seg.video = sourceTimescale * 30;
        seg.keyint = 50;
        seg.duration = "30";
        break;
      case "30":
        seg.video = sourceTimescale * 30;
        seg.keyint = 60;
        seg.duration = "30";
        break;
      case "30000/1001":
        //seg.videoFrameDurationTs = 3003;
        seg.video = sourceTimescale * 30.03;
        seg.keyint = 60;
        seg.duration = "30.03";
        break;
      case "48":
        //seg.videoFrameDurationTs = 1875;
        seg.video = sourceTimescale * 30;
        seg.keyint = 96;
        seg.duration = "30";
        break;
      case "50":
        //seg.videoFrameDurationTs = 1800;
        seg.video = sourceTimescale * 30;
        seg.keyint = 100;
        seg.duration = "30";
        break;
      case "60":
        //seg.videoFrameDurationTs = 1500;
        seg.video = sourceTimescale * 30;
        seg.keyint = 120;
        seg.duration = "30";
        break;
      case "60000/1001":
        seg.videoTimeBase = 60000;
        seg.video = seg.videoTimeBase * 30.03;
        seg.keyint = 120;
        seg.duration = "30.03";
        break;
      default:
        throw "unsupported frame rate for MPEGTS - " + frameRate;
    }
    return seg;
  }

  calcSegDurationRtmp({sourceTimescale}) {
    let videoStream = this.getStreamDataForCodecType("video");
    let frameRate = videoStream.frame_rate;
    let seg = {};

    switch(frameRate) {
      case "24":
        seg.videoTimeBase = 768; // Note 1536 produces low output bitrate
        seg.videoFrameDurationTs = 512;
        seg.video = this.calcOutputTimebase(seg.videoTimeBase) * 30;
        seg.keyint = 48;
        seg.duration = "30";
        break;
      case "25":
        seg.video = sourceTimescale * 30;
        seg.keyint = 50;
        seg.duration = "30";
        break;
      case "30":
        seg.videoTimeBase = 960; // Output timebase: 15360
        seg.videoFrameDurationTs = 512;
        seg.video = this.calcOutputTimebase(seg.videoTimeBase) * 30;
        seg.keyint = 60;
        seg.duration = "30";
        break;
      case "30000/1001":
        seg.video = sourceTimescale * 30.03;
        seg.keyint = 60;
        seg.duration = "30.03";
        break;
      case "48":
        seg.videoTimeBase = 1536; // Output timebase: 12288
        seg.videoFrameDurationTs = 256;
        seg.video = this.calcOutputTimebase(seg.videoTimeBase) * 30;
        seg.keyint = 96;
        seg.duration = "30";
        break;
      case "50":
        seg.video = sourceTimescale * 30;
        seg.keyint = 100;
        seg.duration = "30";
        break;
      case "60":
        seg.videoTimeBase = 960; // Output timebase: 15360
        seg.videoFrameDurationTs = 256;
        seg.video = this.calcOutputTimebase(seg.videoTimeBase) * 30;
        seg.keyint = 120;
        seg.duration = "30";
        break;
      case "60000/1001":
        seg.video = sourceTimescale * 30.03;
        seg.keyint = 120;
        seg.duration = "30.03";
        break;
      default:
        throw "unsupported frame rate for RTMP - " + frameRate;
    }
    return seg;
  }

  syncAudioToStreamIdValue() {
    let sync_id = -1;
    let videoStream = this.getStreamDataForCodecType("video");
    switch(this.probeKind()) {
      case "udp":
      case "srt":
        sync_id = videoStream.stream_id;
        break;
      case "rtmp":
        sync_id = videoStream.stream_index;
        break;
    }
    return sync_id;
  }

  /*
  * Generate audio streams recording configuration based on the optional custom settings.
  * If no custom "audio" section is present, record all the acceptable audio streams found in the probe
  */
  generateAudioStreamsConfig({customSettings}) {

    let audioStreams = {};
    if(customSettings && customSettings.audio && Object.keys(customSettings.audio).length > 0) {
      for(let i = 0; i < Object.keys(customSettings.audio).length; i ++) {
        let audioIdx = Object.keys(customSettings.audio)[i];
        let audio = customSettings.audio[audioIdx];
        audioStreams[audioIdx] = {
          recordingBitrate: audio.recording_bitrate || 192000,
          recordingChannels: audio.recording_channels || 2,
        };
        if(audio.playout) {
          audioStreams[audioIdx].playoutLabel = audio.playout_label || `Audio ${i + 1}`;
        }
      }
    }

    // If no audio streams specified in custom config, set up all the suitable audio streams in the probe
    if(!customSettings.audio || Object.keys(customSettings.audio).length == 0) {
      audioStreams = this.getAudioStreamsFromProbe();
    }

    return audioStreams;
  }

  /*
  * Generate the live recording config as required by QFAB, based on defaults and optional custom settings.
  */
  generateLiveConf({customSettings}) {
    // gather required data
    const conf = JSON.parse(JSON.stringify(LiveconfTemplate));
    const fileName = this.overwriteOriginUrl || this.probeData.format.filename;
    const audioStreams = this.generateAudioStreamsConfig({customSettings});

    // Retrieve one audio stream from the probe to read the sample rate and codec name
    const audioStream = this.getStreamDataForCodecType("audio");
    const sampleRate = parseInt(audioStream.sample_rate);
    const audioCodec = audioStream.codec_name;

    const videoStream = this.getStreamDataForCodecType("video");
    let sourceTimescale;

    // Fill in liveconf all formats have in common
    conf.live_recording.fabric_config.ingress_node_api = this.nodeUrl || null;
    conf.live_recording.fabric_config.ingress_node_id = this.nodeId || null;
    conf.live_recording.recording_config.recording_params.description;
    conf.live_recording.recording_config.recording_params.origin_url = fileName;
    conf.live_recording.recording_config.recording_params.description = `Ingest stream ${fileName}`;
    conf.live_recording.recording_config.recording_params.name = `Ingest stream ${fileName}`;
    conf.live_recording.recording_config.recording_params.xc_params.sample_rate = sampleRate;
    conf.live_recording.recording_config.recording_params.xc_params.enc_height = videoStream.height;
    conf.live_recording.recording_config.recording_params.xc_params.enc_width = videoStream.width;

    for(let i =0; i < Object.keys(audioStreams).length; i ++) {
      conf.live_recording.recording_config.recording_params.xc_params.audio_index[i] = parseInt(Object.keys(audioStreams)[i]);
    }

    if(this.syncAudioToVideo) {
      conf.live_recording.recording_config.recording_params.xc_params.sync_audio_to_stream_id = this.syncAudioToStreamIdValue();
    }

    // Fill in specifics for protocol
    switch(this.probeKind()) {
      case "udp":
        sourceTimescale = 90000;
        conf.live_recording.recording_config.recording_params.source_timescale = sourceTimescale;
        break;
      case "srt":
        sourceTimescale = 90000;
        conf.live_recording.recording_config.recording_params.source_timescale = sourceTimescale;
        conf.live_recording.recording_config.recording_params.live_delay_nano = 4000000000;
        break;
      case "rtmp":
        sourceTimescale = 16000;
        conf.live_recording.recording_config.recording_params.source_timescale = sourceTimescale;
        break;
      case "hls":
        console.log("HLS detected. Not yet implemented");
        break;
      default:
        console.log("Unsupported media", this.probeKind());
        break;
    }

    const segDurations = this.calcSegDuration({sourceTimescale, sampleRate, audioCodec});

    // Segment conditioning parameters
    conf.live_recording.recording_config.recording_params.xc_params.seg_duration = segDurations.duration;
    conf.live_recording.recording_config.recording_params.xc_params.audio_seg_duration_ts = segDurations.audio;
    conf.live_recording.recording_config.recording_params.xc_params.video_seg_duration_ts = segDurations.video;
    conf.live_recording.recording_config.recording_params.xc_params.force_keyint = segDurations.keyint;

    // Optional override output timebase and frame duration (ts)
    if(segDurations.videoTimeBase) {
      conf.live_recording.recording_config.recording_params.xc_params.video_time_base = segDurations.videoTimeBase;

      // Note 'source_timescale' needs to be set to the output timebase and is used by playout
      conf.live_recording.recording_config.recording_params.source_timescale = this.calcOutputTimebase(segDurations.videoTimeBase);
    }
    if(segDurations.videoFrameDurationTs) {
      conf.live_recording.recording_config.recording_params.xc_params.video_frame_duration_ts = segDurations.videoFrameDurationTs;
    }

    const ladderProfile = customSettings.ladder_profile || DefaultABRLadder;

    conf.live_recording.recording_config.recording_params.xc_params.enc_height = videoStream.height;
    conf.live_recording.recording_config.recording_params.xc_params.enc_width = videoStream.width;

    // Determine video recording bitrate and ABR ladder
    let topLadderRate = 0;
    for(let i = 0; i < ladderProfile.video.length; i ++) {
      let elem = ladderProfile.video[i];
      if(elem.height > videoStream.height)
        continue;
      if(elem.bit_rate > topLadderRate) {
        topLadderRate = elem.bit_rate;
      }
      elem.media_type = 1;
      elem.stream_name = "video";
      elem.stream_index = 0;
      elem.representation = "videovideo_" + elem.width + "x" + elem.height + "_h264@" + elem.bit_rate;
      conf.live_recording.recording_config.recording_params.ladder_specs.push(elem);
    }
    // Currently the recording bitrate is the top bitrate of the ladder (it will be configurable separately in the future)
    conf.live_recording.recording_config.recording_params.xc_params.video_bitrate = topLadderRate;

    // Determine audio recording bitrate and ABR ladder
    let globalAudioBitrate = 0;
    let nAudio = 0;

    for(let i = 0; i < Object.keys(audioStreams).length; i ++ ) {
      let audioLadderSpec = {};
      const audioIndex = Object.keys(audioStreams)[i];
      const audio = audioStreams[audioIndex];

      // Find ladder rung for the specific channel layout (2 or 6 channels)
      for(let j = 0; j < ladderProfile.audio.length; j ++) {
        let elem = ladderProfile.audio[j];
        if(elem.channels == audio.recordingChannels) {
          audioLadderSpec = {...elem};
          break;
        }
      }
      if(Object.keys(audioLadderSpec).length === 0) {
        // If no channels layout match, just use the first element in the ladder
        audioLadderSpec = {...ladderProfile.audio[0]};
      }

      audioLadderSpec.representation = `audioaudio_aac@${audioLadderSpec.bit_rate}`;
      audioLadderSpec.channels = audio.recordingChannels;
      audioLadderSpec.stream_index = parseInt(audioIndex);
      audioLadderSpec.stream_name = `audio_${audioIndex}`;
      audioLadderSpec.stream_label = audio.playoutLabel ? audio.playoutLabel : null;
      audioLadderSpec.media_type = 2;

      conf.live_recording.recording_config.recording_params.ladder_specs.push(audioLadderSpec);
      if(audio.recordingBitrate > globalAudioBitrate) {
        globalAudioBitrate = audio.recordingBitrate;
      }
      nAudio ++;
    }

    // Global recording bitrate for all audio streams
    conf.live_recording.recording_config.recording_params.xc_params.audio_bitrate = globalAudioBitrate;
    conf.live_recording.recording_config.recording_params.xc_params.n_audio = nAudio;

    // Iterate through custom settings (which will override any existing setting)
    function SetByPath({obj, path, value}) {
      const keys = path.split(".");
      let temp = obj;
      for(let i = 0; i < keys.length - 1; i++) {
        if(!temp[keys[i]]) {
          temp[keys[i]] = {};
        }
        temp = temp[keys[i]];
      }

      temp[keys[keys.length - 1]] = value;
    }

    const {metaPathValues} = customSettings;

    for(let [path, value] of Object.entries(metaPathValues || {})) {
      SetByPath({obj: conf, path, value});
    }

    return conf;
  }
}

exports.LiveConf = LiveConf;
