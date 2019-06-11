const { ElvClient } = require("../src/ElvClient");
const { FrameClient } = require("../src/FrameClient");

const ClientConfiguration = require("../TestConfiguration.json");
const Response = (require("node-fetch")).Response;
const Utils = require("../src/Utils");

const ContentContract = require("../src/contracts/BaseContent");
const LibraryContract = require("../src/contracts/BaseLibrary");
const SpaceContract = require("../src/contracts/BaseContentSpace");
const WalletContract = require("../src/contracts/BaseAccessWallet");


const KickReplacementFee = async (signer, gasPrice) => {
  try {
    const transaction = await signer.sendTransaction({
      to: signer.address,
      value: 0,
      gasPrice: gasPrice || await signer.provider.getGasPrice()
    });

    return await transaction.wait();
  } catch(error) {
    console.log(error);
    await KickReplacementFee(signer, error.transaction.gasPrice.mul(10));
  }
};

const Test = async () => {
  try {
    console.log(ClientConfiguration);
    //const client = new ElvClient(ClientConfiguration);

    const client = await ElvClient.FromConfigurationUrl({configUrl: "http://main.net955304.contentfabric.io"});

    console.log(client);
    return;
    /*


    const client = await ElvClient.FromConfigurationUrl({
      configUrl: "http://main.net955304.contentfabric.io:80/config"
    });
    */

    let wallet = client.GenerateWallet();
    let signer = wallet.AddAccount({
      privateKey: "0x5a59693d04b5066d96bfe77a01ed0d719169c198d9243c4c0a4d9bc06329c1d8",
    });
    await client.SetSigner({signer});

    /*
    const libraryId = await client.CreateContentLibrary({name: "Test"});
    console.log(libraryId);

    const createResponse = await client.CreateContentObject({libraryId});
    const objectId = createResponse.id;

    await client.ReplaceMetadata({
      libraryId,
      objectId,
      writeToken: createResponse.write_token,
      metadata: {meta: "Data"}
    });

    const finalizeResponse = await client.FinalizeContentObject({
      libraryId,
      objectId,
      writeToken: createResponse.write_token
    });

    console.log("Create Response:");
    console.log(createResponse);
    console.log("\nFinalize Response:");
    console.log(finalizeResponse);

    console.log(libraryId);
    console.log(objectId);
    return;
    */
    const libraryId = "ilib2tNqMTr51szPGsttFQJSq6gRdKaZ";
    const objectId = "iq__2tNqMTr51szPGsttFQJSq6gRdKaZ";

    console.log(await client.ContentObject({
      versionHash: "hq__7cTGD2eMTZMrvLT7SqCtsoJx9cWzy5QBLqcBqSdPtGaXuoYJPaEA22CX3LGZPpMXURCdpzFwS1"
    }));
    /*

    const editResponse = await client.EditContentObject({libraryId, objectId});
    await client.ReplaceMetadata({
      libraryId,
      objectId: editResponse.id,
      writeToken: editResponse.write_token,
      metadata: {your: {meta: {data: "here"}}}
    });

    const finalizeResponse2 = await client.FinalizeContentObject({
      libraryId,
      objectId,
      writeToken: editResponse.write_token
    });

    console.log("\nEdit Response: ");
    console.log(editResponse);
    console.log("\nFinalize Response:");
    console.log(finalizeResponse2);

    console.log(await client.ContentObjectMetadata({libraryId, objectId}));
    return;

    /*
    const createResponse = await client.CreateContentObject({libraryId});
    const objectId = createResponse.id;

    await client.ReplaceMetadata({
      libraryId,
      objectId,
      writeToken: createResponse.write_token
    });

    const finalizeResponse = await client.FinalizeContentObject({
      libraryId,
      objectId,
      writeToken: createResponse.write_token
    });

    console.log("Create Response:");
    console.log(createResponse);
    console.log("\nFinalize Response:");
    console.log(finalizeResponse);






    let rep = await client.Rep({libraryId, objectId, rep: "dash"});

    console.log(rep);
    */

  } catch(error) {
    console.error(error);
  }
};

Test();
