const { ElvClient } = require("../src/ElvClient");
const { FrameClient } = require("../src/FrameClient");

const ClientConfiguration = require("../TestConfiguration.json");
const Response = (require("node-fetch")).Response;
const Utils = require("../src/Utils");

const ContentContract = require("../src/contracts/BaseContent");
const LibraryContract = require("../src/contracts/BaseLibrary");
const SpaceContract = require("../src/contracts/BaseContentSpace");

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
    //ClientConfiguration.noCache = true;
    let client = ElvClient.FromConfiguration({configuration: ClientConfiguration});

    let wallet = client.GenerateWallet();
    let signer = wallet.AddAccount({
      privateKey: "0x09e180efeacdd2bdae9292bb5cb85cf9668217eed44447008604ecb7f26c1ab1",
    });
    await client.SetSigner({signer});



    /*
    const res = await client.authClient.ChannelContentRequest({
      objectId: "iq__KziRWKBkYe2sFqUNeyRFvYcwrxM",
      value: 0
    });

    console.log(res);
    */

    let rep = await client.Rep({
      libraryId: "ilibKziRWKBkYe2sFqUNeyRFvYcwrxM",
      objectId: "iq__KziRWKBkYe2sFqUNeyRFvYcwrxM",
      rep: "dash",
    });

    console.log(rep);

    rep = await client.Rep({
      libraryId: "ilibKziRWKBkYe2sFqUNeyRFvYcwrxM",
      objectId: "iq__KziRWKBkYe2sFqUNeyRFvYcwrxM",
      rep: "dash",
    });

    console.log(rep);


    const libraryId = await client.CreateContentLibrary({
      name: "Library",
      publicMetadata: {public: "metadata"},
      privateMetadata: {private: "metadata"}
    });

    console.log(libraryId);
    /*
    const response = await client.CreateContentType({
      metadata: {name: "test CT", meta: "data"}
    });

    console.log(response);


    console.log(await client.ContentTypes());
    console.log(await client.ContentType({name: "test CT"}));
    console.log(await client.ContentType({versionHash: response.hash}));

    //const ct = await client.ContentType()
    //return;

    */

    //const libraryId = "ilib4Ag3gNpoSGszapPya7LEFzjBXhb2";
    //const objectId = "iq__4Ag3gNpoSGszapPya7LEFzjBXhb2";

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


  } catch(error) {
    console.error(error);
  }
};

Test();
