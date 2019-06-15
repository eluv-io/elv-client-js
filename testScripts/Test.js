const { ElvClient } = require("../src/ElvClient");
const { FrameClient } = require("../src/FrameClient");

const ClientConfiguration = require("../TestConfiguration.json");

const ContentContract = require("../src/contracts/BaseContent");
const LibraryContract = require("../src/contracts/BaseLibrary");
const SpaceContract = require("../src/contracts/BaseContentSpace");
const WalletContract = require("../src/contracts/BaseAccessWallet");
const cbor = require("cbor");
const fs = require("fs");

const Crypto = require("../src/Crypto");

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
    const client = new ElvClient(ClientConfiguration);
    //const client = await ElvClient.FromConfigurationUrl({configUrl: "http://main.net955304.contentfabric.io/config"});

    let wallet = client.GenerateWallet();
    let signer = wallet.AddAccount({
      privateKey: "0x0000000000000000000000000000000000000000000000000000000000000000",
    });
    await client.SetSigner({signer});

    const file = fs.readFileSync("ElvClient-min-dev.js.map");

    const libraryId = "ilib2AwHNWBtUm75E4hxBUx8UohsrfBg";
    const objectId = "iq__PbkfXcVNLSjApBxozxeG34oaLUG";

    console.log(await client.BitmovinPlayoutOptions({versionHash: "hq__E964vNCbW8EwZQKJcxx1vxQzpwDQeuge4sNxxR7ij7hMzscfZvg1D9dkn5B6KoCYFWyg8UiCuv", drms: ["widevine"]}));
    return;

    /*
    const editResponse = await client.CreateContentObject({libraryId});
    const objectId = editResponse.id;

    const uploadResponse = await client.UploadPart({
      libraryId,
      objectId,
      writeToken: editResponse.write_token,
      data: file,
      encryption: "cgck",
      chunkSize: 123456
    });

    const partHash = uploadResponse.part.hash;
    console.log(partHash);

    const finalizeResponse = await client.FinalizeContentObject({
      libraryId,
      objectId,
      writeToken: editResponse.write_token
    });

    console.log("\nFinalize Response:");
    console.log(finalizeResponse);

    console.log(await client.ContentParts({
      versionHash: finalizeResponse.hash
    }));
*/
    console.log(await client.DownloadPart({
      libraryId,
      objectId,
      partHash: "hqpe27mbSmA4yhd7evLN7mGSiTyjBv3q3ScGLv3gweBeQEkiTErr8G",
      format: "text"
    }));
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

    console.log(await client.CallContractMethod({
      contractAddress: client.utils.HashToAddress(objectId),
      abi: ContentContract.abi,
      methodName: "getKMSInfo",
      methodArgs: [[]]
    }));

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
