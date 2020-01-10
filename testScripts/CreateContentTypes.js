const path = require('path');
const fs = require('fs');

const { ElvClient } = require("../src/ElvClient");
const { FrameClient } = require("../src/FrameClient");

const ClientConfiguration = require("../TestConfiguration.json");
const Response = (require("node-fetch")).Response;
const Utils = require("../src/Utils");

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
