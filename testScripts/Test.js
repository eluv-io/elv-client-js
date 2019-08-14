const { ElvClient } = require("../src/ElvClient");
const { FrameClient } = require("../src/FrameClient");

const ClientConfiguration = require("../TestConfiguration.json");

const ContentContract = require("../src/contracts/BaseContent");
const LibraryContract = require("../src/contracts/BaseLibrary");
const SpaceContract = require("../src/contracts/BaseContentSpace");
const WalletContract = require("../src/contracts/BaseAccessWallet");
const AccessGroupContract = require("../src/contracts/BaseAccessControlGroup");
const cbor = require("cbor");
const fs = require("fs");

const Crypto = require("../src/Crypto");
const Ethers = require("ethers");
const UUID = require("uuid/v4");

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

const AddToSpaceGroup = async (client, address) => {
  const groupAddress = await client.ContentObjectMetadata({
    libraryId: client.contentSpaceLibraryId,
    objectId: client.contentSpaceObjectId,
    metadataSubtree: "contentSpaceGroupAddress"
  });

  // Add new account to content space group
  await client.AddAccessGroupManager({
    contractAddress: groupAddress,
    memberAddress: address
  });
};

const Create = async (client) => {
  const libraryId = await client.CreateContentLibrary({name: "Test"});

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

  console.log(libraryId);
  console.log(objectId);
  console.log(finalizeResponse.hash);
};

const Update = async (client, libraryId, objectId, todo) => {
  const editResponse = await client.EditContentObject({libraryId, objectId});

  await todo(editResponse.write_token);

  await client.FinalizeContentObject({
    libraryId,
    objectId,
    writeToken: editResponse.write_token
  });
};

const Test = async () => {
  try {
    const client = await ElvClient.FromConfigurationUrl({
      configUrl: ClientConfiguration["config-url"]
    });


    //const client = await ElvClient.FromConfigurationUrl({configUrl: "http://main.net955304.contentfabric.io/config"});

    let wallet = client.GenerateWallet();
    let signer = wallet.AddAccount({
      //privateKey: "0x0000000000000000000000000000000000000000000000000000000000000000",
      privateKey: "0x0000000000000000000000000000000000000000000000000000000000000000"
      //privateKey: "0000000000000000000000000000000000000000000000000000000000000000"
    });

    await client.SetSigner({signer});

    const accessGroupAddress = await client.ContentObjectMetadata({
      libraryId: client.contentSpaceLibraryId,
      objectId: client.contentSpaceObjectId,
      metadataSubtree: "contentSpaceGroupAddress"
    });

    await client.AddAccessGroupManager({
      contractAddress: accessGroupAddress,
      memberAddress: "0x060b075aa5bc937d989fde080d09ececc286dbe6"
    });
  } catch(error) {
    console.error(error);
  }
};

Test();
