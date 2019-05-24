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

const Test = async () => {
  try {
    //ClientConfiguration.noAuth = true;
    let client = ElvClient.FromConfiguration({configuration: ClientConfiguration});

    let wallet = client.GenerateWallet();
    let signer = wallet.AddAccount({
      privateKey: "0x09e180efeacdd2bdae9292bb5cb85cf9668217eed44447008604ecb7f26c1ab1"
    });
    client.SetSigner({signer});

    /*
    client.authClient.ChannelContentRequest({
      objectId: "iq__BC9GKQqfxmewmakxKzRz13WLS94",
      value: 1
    });
    */



    const libraryId = await client.CreateContentLibrary({
      name: "Library",
      publicMetadata: {public: "metadata"},
      privateMetadata: {private: "metadata"}
    });


    console.log(libraryId);

    const response = await client.CreateContentType({
      libraryId,
      metadata: {meta: "data"}
    });

    console.log(response);
    return;


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

    const editResponse = await client.EditContentObject({libraryId, objectId});
    await client.ReplaceMetadata({
      libraryId,
      objectId: editResponse.id,
      writeToken: editResponse.write_token,
      metadata: {meta: {data: "here"}}
    });

    const finalizeResponse2 = await client.FinalizeContentObject({
      libraryId,
      objectId,
      writeToken: editResponse.write_token
    });

    console.log("\nEdit Response: ");
    console.log(createResponse);
    console.log("\nFinalize Response:")
    console.log(finalizeResponse2);

    await client.CallContractMethod({
      contractAddress: client.utils.HashToAddress(objectId),
      abi: ContentContract.abi,
      methodName: "publish"
    });

    console.log("\nPublished");
  } catch(error) {
    console.error(error);
  }
};

Test();
