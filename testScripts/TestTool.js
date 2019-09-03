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

const MakeContent = async(client, libraryId, contentTypeId, contentTypeHash) => {

  const createResponse = await client.CreateContentObject({
    libraryId,
    options: {
      "type": contentTypeHash,
      "meta": {"initial_field_001":"value001"}
    }
  });

  await client.ReplaceMetadata({
    libraryId,
    objectId: createResponse.id,
    writeToken: createResponse.write_token
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
						    versionHash, channelAuth: true, noCache: true});
  console.log("Bearer " + tok);
}

const MakeTxToken = async(client, libraryId, objectId, versionHash) => {
  console.log("Auth token - tx based");
  tok = await client.authClient.AuthorizationToken({libraryId, objectId,
						    versionHash, channelAuth: false, noCache: true});
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

const Tool = async () => {

  try {

    const client = await ElvClient.FromConfigurationUrl({configUrl: "https://main.net955210.contentfabric.io"});

    let wallet = client.GenerateWallet();
    let signer = wallet.AddAccount({
      privateKey: "9d88bea6b9d1bca1124e783934bd6c740f42d0af212461f81490fa66171c112d" // REPLACE WITH REAL KEY
    });
    client.SetSigner({signer});

    // Run the actual command

    //MakeLibrary(client);
    //LibraryList(client, "ilib3zqsDeXBYRQEMu8UEMWv4Ng9fnpb");

    MakeContent(client, lib, null, null);

    //MakeStateChannelToken(client, lib, qid, null /* qhash not needed */);
    //MakeTxToken(client, lib, qid, qhash);
    //LibrarySetMeta(client, lib, {"name":"Stargate Origins", "description" : "Stargate Origins Season 1"})

    //const mediaDir = "/s/QCODE/MEDIA/SGC/3pass_7m_bf0_kf_EXTRA_41026_1-stargate-command-part-1__Discovery_in_Giza_mp4"
    //UpdateMedia(client, lib, qid, mediaDir, "", "background.jpg");

    //MakeContentLiveEdge(client, lib, qid, qhash)

  } catch(error) {
    console.error(error);
  }

}

if (process.argv.length < 2) {
  console.log("Needs arguments: library_id content_id content_hash");
  process.exit();
}

const lib = process.argv[2];
const qid = process.argv[3];
const qhash = process.argv[4];

console.log("Lib: " + lib + " Qid: " + qid + " Qhash: " + qhash);
Tool(lib, qid, qhash)
