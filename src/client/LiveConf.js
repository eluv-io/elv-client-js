const LadderTemplate = {
  "2160": {
    bit_rate: 14000000,
    codecs: "avc1.640028,mp4a.40.2",
    height: 2160,
    media_type: 1,
    representation: "videovideo_3840x2160_h264@14000000",
    stream_name: "video",
    width: 3840
  },
  "1080": {
    bit_rate: 9500000,
    codecs: "avc1.640028,mp4a.40.2",
    height: 1080,
    media_type: 1,
    representation: "videovideo_1920x1080_h264@9500000",
    stream_name: "video",
    width: 1920
  },
  "720": {
    bit_rate: 4500000,
    codecs: "avc1.640028,mp4a.40.2",
    height: 720,
    media_type: 1,
    representation: "videovideo_1280x720_h264@4500000",
    stream_name: "video",
    width: 1280
  },
  "540": {
    bit_rate: 2000000,
    codecs: "avc1.640028,mp4a.40.2",
    height: 540,
    media_type: 1,
    representation: "videovideo_960x540_h264@2000000",
    stream_name: "video",
    width: 960
  },
  "360": {
    bit_rate: 520000,
    codecs: "avc1.640028,mp4a.40.2",
    height: 360,
    media_type: 1,
    representation: "videovideo_640x360_h264@520000",
    stream_name: "video",
    width: 640
  }
};

const LiveconfTemplate = {
  live_recording: {
    fabric_config: {
      ingress_node_api: "",
      ingress_node_id: ""
    },
    playout_config: {
      rebroadcast_start_time_sec_epoch: 0,
      vod_enabled: false
    },
    recording_config: {
      recording_params: {
        description: "",
        ladder_specs: [
          {
            bit_rate: 384000,
            channels: 2,
            codecs: "mp4a.40.2",
            media_type: 2,
            representation: "audioaudio_aac@384000",
            stream_name: "audio"
          }
        ],
        listen: true,
        live_delay_nano: 2000000000,
        max_duration_sec: -1,
        name: "",
        origin_url: "",
        part_ttl: 3600,
        playout_type: "live",
        source_timescale: null,
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
    for (let index = 0; index < this.probeData.streams.length; index++) {
      if(this.probeData.streams[index].codec_type == codecType) {
        stream = this.probeData.streams[index];
      }
    }
    return stream;
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

  calcSegDuration({sourceTimescale}) {

    let videoStream = this.getStreamDataForCodecType("video");
    let frameRate = videoStream.frame_rate;

    let seg ={};
    switch (frameRate) {
      case "24":
        seg.video = 30 * sourceTimescale;
        seg.audio = 30 * 48000;
        seg.keyint = 48;
        seg.duration = "30";
        break;
      case "25":
        seg.video = 30 * sourceTimescale;
        seg.audio = 30 * 48000;
        seg.keyint = 50;
        seg.duration = "30";
        break;
      case "30":
        seg.video = 30 * sourceTimescale;
        seg.audio = 30 * 48000;
        seg.keyint = 60;
        seg.duration = "30";
        break;
      case "30000/1001":
        seg.video = 30.03 * sourceTimescale;
        seg.audio = 29.76 * 48000;
        seg.keyint = 60;
        seg.duration = "30.03";
        break;
      case "48":
        seg.video = 30 * sourceTimescale;
        seg.audio = 30 * 48000;
        seg.keyint = 96;
        seg.duration = "30";
        break;
      case "50":
        seg.video = 30 * sourceTimescale;
        seg.audio = 30 * 48000;
        seg.keyint = 100;
        seg.duration = "30";
        break;
      case "60":
        seg.video = 30 * sourceTimescale;
        seg.audio = 30 * 48000;
        seg.keyint = 120;
        seg.duration = "30";
        break;
      case "60000/1001":
        seg.video = 30.03 * sourceTimescale;
        seg.audio = 29.76 * 48000;
        seg.keyint = 120;
        seg.duration = "30.03";
        break;
      default:
        console.log("Unsupported frame rate", frameRate);
        break;
    }
    return seg;
  }

  syncAudioToStreamIdValue() {
    let sync_id = -1;
    let videoStream = this.getStreamDataForCodecType("video");
    switch (this.probeKind()) {
      case "udp":
        sync_id = videoStream.stream_id;
        break;
      case "rtmp":
        sync_id = -1; // Pending fabric API: videoStream.stream_index
        break;
    }
    return sync_id;
  }

  generateLiveConf() {
    // gather required data
    const conf = LiveconfTemplate;
    const fileName = this.overwriteOriginUrl || this.probeData.format.filename;
    const audioStream = this.getStreamDataForCodecType("audio");
    const sampleRate = parseInt(audioStream.sample_rate);
    const videoStream = this.getStreamDataForCodecType("video");
    let sourceTimescale;

    console.log("AUDIO", audioStream);
    console.log("VIDEO", videoStream);

    // Fill in liveconf all formats have in common
    conf.live_recording.fabric_config.ingress_node_api = this.nodeUrl || null;
    conf.live_recording.fabric_config.ingress_node_id = this.nodeId || null;
    conf.live_recording.recording_config.recording_params.description;
    conf.live_recording.recording_config.recording_params.origin_url = fileName;
    conf.live_recording.recording_config.recording_params.description = `Ingest stream ${fileName}`;
    conf.live_recording.recording_config.recording_params.name = `Ingest stream ${fileName}`;
    conf.live_recording.recording_config.recording_params.xc_params.audio_index[0] = audioStream.stream_index;
    conf.live_recording.recording_config.recording_params.xc_params.sample_rate = sampleRate;
    conf.live_recording.recording_config.recording_params.xc_params.enc_height = videoStream.height;
    conf.live_recording.recording_config.recording_params.xc_params.enc_width = videoStream.width;

    if(this.syncAudioToVideo) {
      conf.live_recording.recording_config.recording_params.xc_params.sync_audio_to_stream_id = this.syncAudioToStreamIdValue();
    }

    // Fill in specifics for protocol
    switch(this.probeKind()) {
      case "udp":
        sourceTimescale = 90000;
        conf.live_recording.recording_config.recording_params.source_timescale = sourceTimescale;
        break;
      case "rtmp":
        sourceTimescale = 16000;
        conf.live_recording.recording_config.recording_params.source_timescale = sourceTimescale;
        break;
      case "hls":
        console.log("HLS detected. Not yet implemented");
        break;
      default:
        console.log("Unsuppoted media", this.probeKind());
        break;
    }

    const segDurations = this.calcSegDuration({sourceTimescale});

    // Segment conditioning parameters
    conf.live_recording.recording_config.recording_params.xc_params.seg_duration = segDurations.duration;
    conf.live_recording.recording_config.recording_params.xc_params.audio_seg_duration_ts = segDurations.audio;
    conf.live_recording.recording_config.recording_params.xc_params.video_seg_duration_ts = segDurations.video;
    conf.live_recording.recording_config.recording_params.xc_params.force_keyint = segDurations.keyint;

    switch(videoStream.height) {
      case 2160:
        conf.live_recording.recording_config.recording_params.ladder_specs.unshift(
          LadderTemplate[2160],
          LadderTemplate[1080],
          LadderTemplate[720],
          LadderTemplate[540],
          LadderTemplate[360]
        );
        conf.live_recording.recording_config.recording_params.xc_params.video_bitrate = LadderTemplate[2160].bit_rate;
        conf.live_recording.recording_config.recording_params.xc_params.enc_height = 2160;
        conf.live_recording.recording_config.recording_params.xc_params.enc_width = 3840;

        break;
      case 1080:
        conf.live_recording.recording_config.recording_params.ladder_specs.unshift(
          LadderTemplate[1080],
          LadderTemplate[720],
          LadderTemplate[540],
          LadderTemplate[360]
        );
        conf.live_recording.recording_config.recording_params.xc_params.video_bitrate = LadderTemplate[1080].bit_rate;
        conf.live_recording.recording_config.recording_params.xc_params.enc_height = 1080;
        conf.live_recording.recording_config.recording_params.xc_params.enc_width = 1920;
        break;
      case 720:
        conf.live_recording.recording_config.recording_params.ladder_specs.unshift(
          LadderTemplate[720],
          LadderTemplate[540],
          LadderTemplate[360]
        );
        conf.live_recording.recording_config.recording_params.xc_params.video_bitrate = LadderTemplate[720].bit_rate;
        conf.live_recording.recording_config.recording_params.xc_params.enc_height = 720;
        conf.live_recording.recording_config.recording_params.xc_params.enc_width = 1280;
        break;
      case 540:
        conf.live_recording.recording_config.recording_params.ladder_specs.unshift(
          LadderTemplate[540],
          LadderTemplate[360]
        );
        conf.live_recording.recording_config.recording_params.xc_params.video_bitrate = LadderTemplate[540].bit_rate;
        conf.live_recording.recording_config.recording_params.xc_params.enc_height = 540;
        conf.live_recording.recording_config.recording_params.xc_params.enc_width = 960;
        break;
      case 360:
        conf.live_recording.recording_config.recording_params.ladder_specs.unshift(LadderTemplate[360]);
        conf.live_recording.recording_config.recording_params.ladder_specs.unshift(LadderTemplate[360]);
        conf.live_recording.recording_config.recording_params.xc_params.video_bitrate = LadderTemplate[360].bit_rate;
        conf.live_recording.recording_config.recording_params.xc_params.enc_height = 360;
        conf.live_recording.recording_config.recording_params.xc_params.enc_width = 640;
        break;
      default:
        throw new Error("ERROR: Probed stream does not conform to one of the following built in resolution ladders [4096, 2160], [1920, 1080] [1280, 720], [960, 540], [640, 360]");
    }

    return JSON.stringify(conf, null, 2);
  }
}
exports.LiveConf = LiveConf;