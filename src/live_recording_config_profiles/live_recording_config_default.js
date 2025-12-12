const LiveRecordingConfigDefault = {
  drm_type: "clear",
  recording_config: {
    part_ttl: 86400,
    reconnect_timeout: 3600,
    connection_timeout: 3600,
    copy_mpeg_ts: false,
  },
  input_stream_info: {
    format: {
      format_name: "mpegts",
    },
    streams: [
      {
        codec_name: "h264",
        codec_type: "video",
        display_aspect_ratio: "16/9",
        field_order: "progressive",
        frame_rate: "50",
        height: 1080,
        width: 1920,
        level: 42,
        stream_id: 256,
        stream_index: 0,
        time_base: "1/90000",
      },
      {
        codec_name: "aac",
        codec_type: "audio",
        channel_layout: 3,
        channels: 2,
        sample_rate: 48000,
        stream_id: 257,
        stream_index: 1,
        time_base: "1/90000",
      },
    ],
  },
}

module.exports = LiveRecordingConfigDefault;
