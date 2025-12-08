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
      drm_type: "drm-all", // drm-public | drm-all | drm-fairplay | drm-widevine | drm-playready | clear
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
