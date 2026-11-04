const AbrProfileLiveVod = require("./abr_profile_live_to_vod");

module.exports = {
  ...AbrProfileLiveVod,
  "store_clear": false,
  "playout_formats": {
    "dash-widevine": {
      "drm": {
        "content_id": "",
        "enc_scheme_name": "cenc",
        "license_servers": [],
        "type": "DrmWidevine"
      },
      "protocol": {
        "min_buffer_length": 2,
        "type": "ProtoDash"
      }
    },
    "hls-fairplay": {
      "drm": {
        "enc_scheme_name": "cbcs",
        "license_servers": [],
        "type": "DrmFairplay"
      },
      "protocol": {
        "type": "ProtoHls"
      }
    },
    "hls-aes128": {
      "drm": {
        "enc_scheme_name": "aes-128",
        "type": "DrmAes128"
      },
      "protocol": {
        "type": "ProtoHls"
      }
    },
    "hls-playready-cenc": {
      "drm": {
        "enc_scheme_name": "cenc",
        "type": "DrmPlayReady"
      },
      "protocol": {
        "type": "ProtoHls"
      }
    }
  }
};
