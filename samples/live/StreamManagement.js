const {ElvClient} = require("../../src/ElvClient");

let client;
const networkName = "demov3"; // "main" or "demo"
const libraryId = "ilib3xjQjKgtB1d1aKwEwaB1hUioYFar";
const accessGroups = [];
const url = "";

const Setup = async() => {
  client = await ElvClient.FromNetworkName({networkName});

  const wallet = client.GenerateWallet();
  const signer = wallet.AddAccount({
    privateKey: process.env.PRIVATE_KEY
  });

  client.SetSigner({signer});
};

const CreateStream = async() => {
  await client.StreamCreate({
    libraryId,
    url,
    options: {
      name: "Live Stream - 11/01/25 Concert Tour",
      displayTitle: "Farewell Tour - 11/01/25",
      description: "The last night of the 11/01/25 Farewell Tour",
      accessGroups,
      linkToSite: true
    },
    liveRecordingConfig: {
      profile: "M6",
      drm_type: "drm-all", // drm-public | drm-all | drm-fairplay | drm-widevine | drm-playready | clear
      recording_config: {
        part_ttl: 3600, // seconds
        reconnect_timeout: 1800, // seconds
        connection_timeout: 1800, // seconds
        copy_mpeg_ts: true,
        input_cfg: {
          bypass_libav_reader: true,
          copy_mode: "raw",
          copy_packaging: "rtp_ts",
          packaging_mode: "rtp_ts",
        }
      },
      recording_stream_config: {
        audio: {
          1: {
            "bitrate": 265988,
            "codec": "aac",
            "default": true,
            "lang": "en-us",
            "playout": true,
            "playout_label": "Audio 1",
            "record": true,
            "recording_bitrate": 192000,
            "recording_channels": 2
          },
          2: {
            "bitrate": 265988,
            "codec": "aac",
            "default": false,
            "lang": "fr-fr",
            "playout": true,
            "playout_label": "Audio 2",
            "record": true,
            "recording_bitrate": 192000,
            "recording_channels": 2
          },
          3: {
            "bitrate": 265988,
            "codec": "aac",
            "lang": "fr-ca",
            "default": false,
            "playout": true,
            "playout_label": "Audio 3",
            "record": true,
            "recording_bitrate": 192000,
            "recording_channels": 2
          },
          4: {
            "bitrate": 265988,
            "codec": "aac",
            "lang": "es-es",
            "default": false,
            "playout": true,
            "playout_label": "Audio 4",
            "record": true,
            "recording_bitrate": 192000,
            "recording_channels": 2
          },
          5: {
            "bitrate": 265988,
            "codec": "aac",
            "lang": "de-de",
            "default": false,
            "playout": true,
            "playout_label": "Audio 5",
            "record": true,
            "recording_bitrate": 192000,
            "recording_channels": 2
          }
        }
      },
      input_stream_info: {
        format: {
          format_name: "mpegts"
        },
        streams: [
          {
            codec_name: "h264",
            codec_type: "video",
            display_aspect_ratio:
              "16/9",
            field_order:
              "progressive",
            frame_rate: "50",
            height: 1080,
            width: 1920,
            level: 42,
            stream_id: 101,
            stream_index: 0,
            time_base: "1/90000"
          },
          {
            codec_name: "aac",
            codec_type: "audio",
            channel_layout: 3,
            channels: 2,
            sample_rate: 48000,
            stream_id: 111,
            stream_index: 1,
            time_base: "1/90000"
          },
          {
            codec_name: "aac",
            codec_type: "audio",
            channel_layout: 3,
            channels: 2,
            sample_rate: 48000,
            stream_id: 112,
            stream_index: 2,
            time_base: "1/90000"
          },
          {
            codec_name: "aac",
            codec_type: "audio",
            channel_layout: 3,
            channels: 2,
            sample_rate: 48000,
            stream_id: 113,
            stream_index: 3,
            time_base: "1/90000"
          },
          {
            codec_name: "aac",
            codec_type: "audio",
            channel_layout: 3,
            channels: 2,
            sample_rate: 48000,
            stream_id: 114,
            stream_index: 4,
            time_base: "1/90000"
          },
          {
            codec_name: "aac",
            codec_type: "audio",
            channel_layout: 3,
            channels: 2,
            sample_rate: 48000,
            stream_id: 115,
            stream_index: 5,
            time_base: "1/90000"
          }
        ]
      }
    }
  });
};

const Run = async() => {
  await Setup();
  await CreateStream();
};

Run();
