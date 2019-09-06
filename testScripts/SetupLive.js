const { ElvClient } = require("../src/ElvClient.js");

/*
 * Usage:
 * export PRIVATE_KEY=deadbeefbadf00dbadf00dbadf00dbadf00dbadf00dbadf00dbadf00dbadf00d
 * node SetupLive.js
 *
 * For clientConf, use EITHER configUrl OR contentSpaceId, fabricURIs, and ethereumURIs
 * 
 * From the config json
 *   contentSpaceId is qspace.id
 *   fabricURIs/ingressNodeApiUrl is network.seed_nodes.fabric_api
 *   ethereumURIs is network.seed_nodes.ethereum_api
 *   ingressNodeId is node_id
 */

const confLocal = {
  clientConf: {
    configUrl: "",
    contentSpaceId: "ispc2v1uV2Lr51zyAFXeV6qi5R8628nT",
    fabricURIs: ["http://localhost:8008"],
    ethereumURIs: ["http://localhost:8545"],
    noCache: false,
    noAuth: false
  },
  ingressNodeApiUrl: "",
  ingressNodeId: "",
  libraryId: "ilib3cDtpxmqQkEgJVdihcoMphVoEBMC",
  objectType: "hq__2zAECvdVZ9U9nJBjD4tQdUBJ7szU79hYFRaxLkU2J8FwEG1rcG9tce3PhByrCDWxHrZGcmgwkP",
  originUrl: "http://origin1.sedev02_newsdemuxclear.stage-cdhls.skydvn.com/cdsedev04demuxclearnews/13012/cd.m3u8",
  signerPrivateKey: process.env.PRIVATE_KEY
}

/*
 * Creates object in: https://core.test.contentfabric.io/#/apps/fabric-browser/content/ilibX37dYK6dj5F5ZQQC4eDLMNe1kZD
 *
 * For the private key, create an account at https://core.test.contentfabric.io/#/accounts
 */
const conf955210California = {
  clientConf: {
    // configUrl: "https://main.net955210.contentfabric.io",
    contentSpaceId: "ispc2zqa4gZ8N3DH1QWakR2e5UowDLF1",
    fabricURIs: ["https://host-35-233-145-232.test.contentfabric.io"],
    ethereumURIs: ["https://host-35-233-145-232.test.contentfabric.io/eth/"],
    noCache: false,
    noAuth: false
  },
  ingressNodeApiUrl: "https://host-35-233-145-232.test.contentfabric.io",
  ingressNodeId: "inod3jzKHgsuaBu3cqKu7t4N2fLLdkC4",
  libraryId: "ilibX37dYK6dj5F5ZQQC4eDLMNe1kZD",
  objectType: "hq__aVeScS42SZYyRtud7ycv6UWqaxm76VGN398RamQ3w4b55Ycrn1z6DivNTJyaPhEs4m1TfR3bH",
  originUrl: "http://origin1.sedev02_newsdemuxclear.stage-cdhls.skydvn.com/cdsedev04demuxclearnews/13012/cd.m3u8",
  signerPrivateKey: process.env.PRIVATE_KEY
}

const conf955210London = {
  clientConf: {
    // configUrl: "https://main.net955210.contentfabric.io",
    contentSpaceId: "ispc2zqa4gZ8N3DH1QWakR2e5UowDLF1",
    fabricURIs: ["https://host-35-246-28-142.test.contentfabric.io"],
    ethereumURIs: ["https://host-35-246-28-142.test.contentfabric.io/eth/"],
    noCache: false,
    noAuth: false
  },
  ingressNodeApiUrl: "https://host-35-246-28-142.test.contentfabric.io",
  ingressNodeId: "inod3wynwpbH82fsCWxbatCKxCsgyP1c",
  libraryId: "ilibX37dYK6dj5F5ZQQC4eDLMNe1kZD",
  objectType: "hq__aVeScS42SZYyRtud7ycv6UWqaxm76VGN398RamQ3w4b55Ycrn1z6DivNTJyaPhEs4m1TfR3bH",
  originUrl: "http://origin1.sedev02_newsdemuxclear.stage-cdhls.skydvn.com/cdsedev04demuxclearnews/13012/cd.m3u8",
  signerPrivateKey: process.env.PRIVATE_KEY
}

const conf = conf955210London

const Test = async () => {
  try {
    let client
    if (conf.clientConf.configUrl) {
      client = await ElvClient.FromConfigurationUrl({
        configUrl: conf.clientConf.configUrl
      });
    } else {
      client = new ElvClient(conf.clientConf);
    }
    const wallet = client.GenerateWallet();
    const signer = wallet.AddAccount({ privateKey: conf.signerPrivateKey });
    client.SetSigner({ signer });
    const fabURI = client.fabricURIs[0]
    console.log("Fabric URI: " + fabURI)
    const ethURI = client.ethereumURIs[0]
    console.log("Ethereum URI: " + ethURI)

    /*
     * Create object for live streaming.
     */
    let response = await client.CreateContentObject({
      libraryId: conf.libraryId,
      options: {
        type: conf.objectType
      }
    });
    const objectId = response.id
    console.log("Object ID:", objectId);
    let writeToken = response.write_token

    /*
     * First finalize the object before creating the edge token, otherwise
     * the object type will be empty for the edge token.
     * 
     * FIXME: Also sleep to make sure the operation is settled before
     * continuing, for the same reason.
     */
    await client.FinalizeContentObject({
      libraryId: conf.libraryId,
      objectId: objectId,
      writeToken: writeToken
    });
    await sleep(1000)

    response = await client.EditContentObject({
      libraryId: conf.libraryId,
      objectId: objectId
    });
    const edgeToken = response.write_token
    console.log("Edge token:", edgeToken)

    /*
     * Set the metadata, including the edge token.
     */
    response = await client.EditContentObject({
      libraryId: conf.libraryId,
      objectId: objectId
    });
    writeToken = response.write_token

    await client.MergeMetadata({
      libraryId: conf.libraryId,
      objectId: objectId,
      writeToken: writeToken,
      metadata: {
        "description": "Lorem ipsum dolor sit amet",
        "edge_write_token": edgeToken,
        "ingress_node_api": conf.ingressNodeApiUrl,
        "ingress_node_id": conf.ingressNodeId,
        "max_duration": "90000",
        "name": "Live Test - " + Date().toLocaleString(),
        "origin_url": conf.originUrl
      }
    });

    response = await client.FinalizeContentObject({
      libraryId: conf.libraryId,
      objectId,
      writeToken: writeToken
    });
    const objectHash = response.hash
    console.log("Object hash:", objectHash);

    console.log("\nInspect metadata:\ncurl -s " +
      fabURI + "/q/" + objectHash + "/meta | jq")

    console.log("\nStart recording (returns HANDLE):\ncurl -s " +
      fabURI + "/qlibs/" + conf.libraryId + "/q/" + edgeToken +
      "/call/live/start | jq")

    console.log("\nStop recording (use HANDLE from start):\ncurl -s " +
      fabURI + "/qlibs/" + conf.libraryId + "/q/" + edgeToken +
      "/call/live/stop/HANDLE")

    console.log("\nLive offering metadata:\ncurl -s " +
      fabURI + "/qlibs/" + conf.libraryId + "/q/" + edgeToken +
      "/meta/live_offering | jq")

    console.log("\nPlayout options:\ncurl -s " +
      fabURI + "/qlibs/" + conf.libraryId + "/q/" + edgeToken +
      "/rep/live/default/options.json | jq\ncurl -s " +
      fabURI + "/q/" + objectHash + "/rep/live/default/options.json | jq")

    console.log("\nHLS playlist:\n" +
      fabURI + "/qlibs/" + conf.libraryId + "/q/" + edgeToken +
      "/rep/live/default/hls-clear/playlist.m3u8\n" +
      fabURI + "/q/" + objectHash + "/rep/live/default/hls-clear/playlist.m3u8")

    console.log("\nFinalize recording (changes object HASH):\ncurl -s " +
      fabURI + "/qlibs/" + conf.libraryId + "/q/" + edgeToken +
      " -X POST -H 'Content-Type: application/json' | jq")

    console.log("\nFinalized options and playlist (use HASH from finalize):" +
      "\ncurl -s " + fabURI + "/q/HASH/rep/live/default/options.json | jq\n" +
      fabURI + "/q/HASH/rep/live/default/hls-clear/playlist.m3u8\n")
  } catch (error) {
    console.error(error);
  }
}

function sleep(ms) {
  return new Promise(resolve => {
    setTimeout(resolve, ms)
  })
}

Test();
