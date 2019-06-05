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
    //ClientConfiguration.noCache = true;
    let client = ElvClient.FromConfiguration({
      configuration: ClientConfiguration
    });

    let client2 = ElvClient.FromConfiguration({
      configuration: ClientConfiguration
    });

    let wallet2 = client2.GenerateWallet();
    let signer2 = wallet2.AddAccount({
      privateKey: "0x5a59693d04b5066d96bfe77a01ed0d719169c198d9243c4c0a4d9bc06329c1d8",
    });
    await client2.SetSigner({signer: signer2});

    //console.log(await client2.AccessGroupsCollection({collectionType: "contentTypes"}));

    //console.log(await client2.ContentTypes());
    //console.log(await client2.ContentLibraries());
    console.log(await client2.CreateContentType({
      name: "somethign unqique",
      metadata: {"meta": "data"}
    }));

    return;

    let wallet = client.GenerateWallet();
    let signer = wallet.AddAccount({
      privateKey: "0x5a59693d04b5066d96bfe77a01ed0d719169c198d9243c4c0a4d9bc06329c1d8",
    });
    await client.SetSigner({signer});

    console.log("ADDING");
    await client.AddAccessGroupManager({
      contractAddress: "0xe198294999e2ecce8f4882753213b33494c6d635",
      memberAddress: "0xc04e30b4d747afb72e2239b42c174b42dc6f7039"
    });
    console.log("ADDED");



    console.log(await client2.ContentTypes());

    return;

    console.log(await client.ContentType({name: "library"}));

    return;
    const CT = await client.CreateContentType({
      name: "Test",
      metadata: {content: "type"}
    });

    console.log(CT);
    return;

    /*
    console.log(event);
    console.log("====\n");
    //await client.ContentTypesTest();
    const events = await client.ContractEvents({
      contractAddress: client.walletAddress,
      abi: WalletContract.abi
    });

    console.log(events.length);
    console.log(JSON.stringify(events, null, 2));
    */

    console.time("first");
    await client.ContentTypes();
    console.timeEnd("first");

    console.time("second");
    await client.ContentTypes();
    console.timeEnd("second");

    console.log(await client.ContentType({name: "Content Type"}));

    console.log(await client.ContentType({versionHash: "hq__8DszzNUy3KS141eJwrK6FL8Hbpyrdzm23tSptvEoKSxFbUL2yCZu6tNpR9VGVqqEeGiwMBpteB"}));

    /*
    const res = await client.authClient.ChannelContentRequest({
      objectId: "iq__KziRWKBkYe2sFqUNeyRFvYcwrxM",
      value: 0
    });

    console.log(res);
    */

    /*
    const libraryId = await client.CreateContentLibrary({
      name: "Fake Content Space"
    });

    console.log(libraryId);
    return;
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
    console.log(editResponse);
    console.log("\nFinalize Response:");
    console.log(finalizeResponse2);

    let rep = await client.Rep({libraryId, objectId, rep: "dash"});

    console.log(rep);
    */

  } catch(error) {
    console.error(error);
  }
};

Test();
