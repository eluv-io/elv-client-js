const path = require('path');
const fs = require('fs');

const { ElvClient } = require("../src/ElvClient");
const { FrameClient } = require("../src/FrameClient");

const ClientConfiguration = require("../TestConfiguration.json");
const Response = (require("node-fetch")).Response;
const Utils = require("../src/Utils");

const ContentContract = require("../src/contracts/BaseContent");

const KickReplacementFee = async (signer, gasPrice) => {
  try {
    const transaction = await signer.sendTransaction({
      to: signer.address,
      value: 0,
      gasPrice: gasPrice || await signer.provider.getGasPrice()
    });

    return await transaction.wait();
  } catch(error) {
    console.log(error.message);
    await KickReplacementFee(signer, error.transaction.gasPrice.mul(10));
  }
};

const LibraryList = async (client, libraryId) => {

  var libObjects
  console.log("List library");
  libObjects = await client.ContentObjects({libraryId});
  console.log(JSON.stringify(libObjects));
}

const MakeLibrary = async (client) => {

  const libraryId = await client.CreateContentLibrary({
    name: "Library",
    metadata: {"name": "No name library"}
  });

  console.log("Library ID: " + libraryId);
}

const MakeContentTypes = async(client) => {

  await client.userProfileClient.WalletAddress();
  var ct1 = await client.CreateContentType({name: "Production Master",
				    metadata: {
				      "bitcode_format": "builtin",
				      "bitcode_flags":"abrmaster"
				    },
				    bitcode: null});
  console.log("Content type: " + JSON.stringify(ct1));

  var ct2 = await client.CreateContentType({name: "ABR Master",
				    metadata: {
				      "bitcode_format": "builtin",
				      "bitcode_flags":"abrmaster"
				    },
				    bitcode: null});
  console.log("Content type: " + JSON.stringify(ct2));

}

const TestContentType = async(client) => {

  client.ToggleLogging(true);

  const c = await this.ContentType({name: "Production Master"});
  console.log("Content type: " + JSON.stringify(c));

}

const TestPlayout = async (client) => {

  const linkPath = "public/asset_metadata/titles/BOND22/trailers/default/sources/default";

  const objectId = "iq__24HjYwSqwGW58vqrcUJgeJAE2sKk";
  var playoutOptions1 = await client.BitmovinPlayoutOptions({
    objectId,
    linkPath,
    protocols: [ "dash", "hls" ]
  })
  console.log("By ID - bitmovin options: " + JSON.stringify(playoutOptions1));

  const versionHash = "hq__5VjSMz9v4KA888dwebcJWvakPffmDreX4bHEphvmd9C3M34Ad3FJHexEWp1ghiqMLMjpxaDcMU";
  const playoutOptions2 = await client.BitmovinPlayoutOptions({
    versionHash,
    linkPath,
    protocols: [ "dash", "hls" ]
  });
  console.log("By hash - bitmovin options: " + JSON.stringify(playoutOptions2));

}


// Read metadata from file
const MakeContent = async(client, libraryId, contentTypeHash, name, metaFile) => {

  const createResponse = await client.CreateContentObject({
    libraryId,
    options: {
      "type": contentTypeHash,
      "meta": {}
    }
  });

  var metadata
  if (metaFile != null) {
    var metaStr = fs.readFileSync(singleFilePath);
    metadata = JSON.parse(metaStr)
  }

  metadata.name = name;

  await client.ReplaceMetadata({
    libraryId,
    objectId: createResponse.id,
    writeToken: createResponse.write_token,
    metadata: metadata
  });

  await client.UploadPart({
    libraryId,
    objectId: createResponse.id,
    writeToken: createResponse.write_token,
    data: "THIS IS A SAMPLE PART - TEST 2"
  });

  const finalizeResponse = await client.FinalizeContentObject({
    libraryId,
    objectId: createResponse.id,
    writeToken: createResponse.write_token
  });

  console.log("MakeContent " + JSON.stringify(finalizeResponse));
}

const MakeStateChannelToken = async(client, libraryId, objectId, versionHash) => {
  console.log("Auth token - state channel");
  tok = await client.authClient.AuthorizationToken({libraryId, objectId,
						    versionHash, channelAuth: true, noCache: true,
						    noAuth: true});
  console.log("Bearer " + tok);
}

const MakeTxToken = async(client, libraryId, objectId, versionHash) => {
  console.log("Auth token - tx based");
  tok = await client.authClient.AuthorizationToken({libraryId, objectId,
						    versionHash, channelAuth: false, noCache: true,
						    noAuth: false});
  console.log("Bearer " + tok);
}

const MakeTxLessToken = async(client, libraryId, objectId, versionHash) => {
  console.log("Auth token - tx-less");
  tok = await client.authClient.AuthorizationToken({libraryId, objectId,
						    versionHash, channelAuth: false, noCache: true,
						    noAuth: true});
  console.log("Bearer " + tok);
}

const LibrarySetMeta = async (client, libraryId, metadata) => {
  const objectId = libraryId.replace("ilib", "iq__");
  const editResponse = await client.EditContentObject({
    libraryId,
    objectId
  });

  await client.ReplaceMetadata({
    libraryId,
    objectId,
    writeToken: editResponse.write_token,
    metadata: metadata
  });

  await client.FinalizeContentObject({
    libraryId,
    objectId,
    writeToken: editResponse.write_token
  });
}

const MakeContentLiveEdge = async(client, libraryId, objectId, versionHash) => {

  // SS just publish

  const pub = await client.PublishContentVersion({objectId, versionHash})

  console.log("MakeContentLiveEdge " + JSON.stringify(pub));
}

const clientConfLocal = {
    configUrl: "",
    contentSpaceId: "ispcHmsdES4vixPv4ubPcJq8jyhvXoy",
    fabricURIs: ["http://localhost:8008"],
    ethereumURIs: ["http://localhost:8545"],
    noCache: false,
    noAuth: false
};

const abrProfile = {
  "abr_profile": {
    "ladder_specs": {
      "{\"media_type\":\"audio\",\"channels\":2}": {
        "rung_specs": [
          {
            "bit_rate": 128000,
            "media_type": "audio",
            "pregenerate": true
          }
        ]
      },
      "{\"media_type\":\"video\",\"aspect_ratio_height\":3,\"aspect_ratio_width\":4}": {
        "rung_specs": [
          {
            "bit_rate": 4900000,
            "height": 1080,
            "media_type": "video",
            "pregenerate": true,
            "width": 1452
          },
          {
            "bit_rate": 3375000,
            "height": 720,
            "media_type": "video",
            "pregenerate": false,
            "width": 968
          },
          {
            "bit_rate": 1500000,
            "height": 540,
            "media_type": "video",
            "pregenerate": false,
            "width": 726
          },
          {
            "bit_rate": 825000,
            "height": 432,
            "media_type": "video",
            "pregenerate": false,
            "width": 580
          },
          {
            "bit_rate": 300000,
            "height": 360,
            "media_type": "video",
            "pregenerate": false,
            "width": 484
          }
        ]
      },
      "{\"media_type\":\"video\",\"aspect_ratio_height\":9,\"aspect_ratio_width\":16}": {
        "rung_specs": [
          {
            "bit_rate": 6500000,
            "height": 1080,
            "media_type": "video",
            "pregenerate": true,
            "width": 1920
          },
          {
            "bit_rate": 4500000,
            "height": 720,
            "media_type": "video",
            "pregenerate": false,
            "width": 1280
          },
          {
            "bit_rate": 2000000,
            "height": 540,
            "media_type": "video",
            "pregenerate": false,
            "width": 960
          },
          {
            "bit_rate": 1100000,
            "height": 432,
            "media_type": "video",
            "pregenerate": false,
            "width": 768
          },
          {
            "bit_rate": 400000,
            "height": 360,
            "media_type": "video",
            "pregenerate": false,
            "width": 640
          }
        ]
      }
    },
    "playout_formats": {
      "dash-clear": {
        "drm": null,
        "protocol": {
          "min_buffer_length": 2,
          "type": "ProtoDash"
        }
      },
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
      "hls-aes128": {
        "drm": {
          "enc_scheme_name": "aes-128",
          "type": "DrmAes128"
        },
        "protocol": {
          "type": "ProtoHls"
        }
      },
      "hls-clear": {
        "drm": null,
        "protocol": {
          "type": "ProtoHls"
        }
      }
    },
    "segment_specs": {
      "audio": {
        "segs_per_chunk": 15,
        "target_dur": 2
      },
      "video": {
        "segs_per_chunk": 15,
        "target_dur": 2
      }
    }
  }
};

const Tool = async () => {

  try {

    //const client = await ElvClient.FromConfigurationUrl({configUrl: "https://main.net955210.contentfabric.io/config"});
    const client = await ElvClient.FromConfigurationUrl({configUrl: "http://main.local:8008/config"});

    let wallet = client.GenerateWallet();
    let signer = wallet.AddAccount({
      privateKey: process.env.PRIVATE_KEY
    });
    client.SetSigner({signer});

    MakeContentTypes(client)

  } catch(error) {
    console.error(error);
  }

}

if (process.argv.length < 2) {
  console.log("Needs arguments: library_id");
  process.exit();
}

const lib = process.argv[2];
Tool(lib)
