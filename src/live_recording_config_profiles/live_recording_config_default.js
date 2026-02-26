const LiveRecordingConfigDefault = {
  drm_type: "clear",
  recording_config: {
    part_ttl: 86400,
    reconnect_timeout: 3600,
    connection_timeout: 3600,
    copy_mpegts: false,
  },
  profile: {
    ladder_specs: {
      audio: [
        {
          bit_rate: 192000,
          channels: 2,
          codecs: "mp4a.40.2"
        },
        {
          bit_rate: 384000,
          channels: 6,
          codecs: "mp4a.40.2"
        }
      ],
      video: [
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
      ]
    },
    name: "Default"
  }
}

module.exports = LiveRecordingConfigDefault;
