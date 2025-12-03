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
  await client.StreamCreateObject({
    libraryId,
    options: {
      name: "Live Stream - 11/01/25 Concert Tour",
      displayTitle: "Farewell Tour - 11/01/25",
      description: "The last night of the 11/01/25 Farewell Tour",
      accessGroups
    },
    liveRecordingConfig: {
      drm_type: "drm-all", // drm-public | drm-all | drm-fairplay | drm-widevine | drm-playready | clear
      recording_stream_config: {
        audio: {
          1: {
            bitrate: 197660,
            codec: "aac",
            playout: true,
            playout_label: "Audio 1",
            record: true,
            recording_bitrate: 192000,
            recording_channels: 2
          },
          2: {
            bitrate: 186326,
            codec: "aac",
            playout: true,
            playout_label: "Audio 2",
            record: true,
            recording_bitrate: 192000,
            recording_channels: 2
          },
        },
        part_ttl: 21600, // seconds
        persistent: false,
        url: "",
        playout_ladder_profile: "Default",
        reconnect_timeout: 600 // seconds
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
            stream_index: 0
          },
          {
            codec_name: "aac",
            codec_type: "audio",
            channel_layout: 3,
            channels: 2,
            sample_rate: 48000,
            stream_id: 111,
            stream_index: 1
          },
          {
            codec_name: "aac",
            codec_type: "audio",
            channel_layout: 3,
            channels: 2,
            sample_rate: 48000,
            stream_id: 112,
            stream_index: 2
          },
          {
            codec_name: "aac",
            codec_type: "audio",
            channel_layout: 3,
            channels: 2,
            sample_rate: 48000,
            stream_id: 113,
            stream_index: 3
          },
          {
            codec_name: "aac",
            codec_type: "audio",
            channel_layout: 3,
            channels: 2,
            sample_rate: 48000,
            stream_id: 114,
            stream_index: 4
          },
          {
            codec_name: "aac",
            codec_type: "audio",
            channel_layout: 3,
            channels: 2,
            sample_rate: 48000,
            stream_id: 115,
            stream_index: 5
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
