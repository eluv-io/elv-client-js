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

/*
    const client = await ElvClient.FromConfigurationUrl({configUrl: "https://main.net955304.contentfabric.io"});

    let wallet = client.GenerateWallet();
    let signer = wallet.AddAccount({
      privateKey: "0x5a59693d04b5066d96bfe77a01ed0d719169c198d9243c4c0a4d9bc06329c1d8",
      //privateKey: "0x09e180efeacdd2bdae9292bb5cb85cf9668217eed44447008604ecb7f26c1ab1"
    });
    await client.SetSigner({signer});



    const versionHash = "hq__BKwnLS9nz71CMDo6gs3kedBv2VQC1kyRwnPtYpNxs7ADXLoG9Je9sTLrcAyhXC1VL7juXo5vji";

    console.log(JSON.stringify(await client.BitmovinPlayoutOptions({
      versionHash,
      drms: ["widevine", "aes-128"]
    }), null, 2));

    */
    const client = await ElvClient.FromConfigurationUrl({
      configUrl: ClientConfiguration["config-url"]
    });


    //const client = await ElvClient.FromConfigurationUrl({configUrl: "http://main.net955304.contentfabric.io/config"});

    let wallet = client.GenerateWallet();
    let signer = wallet.AddAccount({
      //privateKey: "0x5a59693d04b5066d96bfe77a01ed0d719169c198d9243c4c0a4d9bc06329c1d8",
      privateKey: "0x4a375c17bc0398c58839310cac6ddec4c14055205f9599c04adf67de5edc0863"
    });


    await client.SetSigner({signer});

    const libraryId = "ilibrCr3vtsdcxqnBtdtbz5ArnJVYjz";
    const objectId = "iq__48ovSLGUU3ECSVAepJZbrkCpteyT";

    const writeToken = (await client.EditContentObject({libraryId, objectId})).write_token;
    console.log(await client.CreatePart({libraryId, objectId, writeToken}));
    
    return;

    const addr = await client.CreateAccessGroup();

    await client.AddAccessGroupManager({
      contractAddress: addr,
      memberAddress: "0x5ed253fc57eba0fd5e215d3f70d3b8912570a723"
    });


    console.log(await client.CallContractMethod({
      contractAddress: addr,
      abi: AccessGroupContract.abi,
      methodName: "hasManagerAccess",
      methodArgs: [signer.address.replace("0x", "")]
    }));

/*
    console.log(await client.VerifyContentObject({
      libraryId,
      objectId,
      versionHash
    }));


/*
    //http://localhost:8008/qlibs/ilib1mGTeSAJ8WzJDgyuxRKKUYTwA4K/q/iq__3N7wV3bFbwXrENqbE9Bk1gVLpBXC/data/hqp_DPzN7Vjct4kf3ydeU6HegaXXxgQbGYKX7dVkjh3DzhfLFXPEB?authorization=eyJxc3BhY2VfaWQiOiJpc3BjMmFxZjV6cnN0bzcyS3RSYmd2WDkyV3NzY29YUCIsImFkZHIiOiI1MDY2Q0VhOWJiNDY0YTcwZDdEZDFENTI3OUNCMUQ4M2Q4Y2FlYTNFIiwidHhfaWQiOiI1YTI1MTg3YmE2NWFjMjRkYjdlZTJmNWMwYjA0ZTBlNTJmOGIzMmViZjJhOGY1ZWI3MGRkZTM1ZWE1NzEwODkxIiwicWxpYl9pZCI6ImlsaWIxbUdUZVNBSjhXekpEZ3l1eFJLS1VZVHdBNEsifQ%3D%3D.RVMyNTZLX0RFYm90alpydGlqQ3JqVUJBQW83UGJzdUJpbXp1UEZ3dGtZZlpKVVZGM2szcU5aYWRIY0FjVWU2WmZzS2lYd2toejZ3TGZ0NFpKYTFNNFpVd1pxYkd2TFRN

    const libraryId = "ilib1mGTeSAJ8WzJDgyuxRKKUYTwA4K";
    const objectId = "iq__1mGTeSAJ8WzJDgyuxRKKUYTwA4K";
    console.log(await client.FabricUrl({libraryId, objectId}));

    const libraryId = "ilib3LDeDsNEeSnLJF3Ky8nxZkFiBNHu";
    const objectId = "iq__2jp6AedVJULoLboZp6HVb7HmKUFE";
    const partHash = "hqpe63e1MckwkkotZs41WXzA2tmYC3PDktgMoPAtwEM2fxmF2Gq";

    console.log(await client.DownloadPart({
      libraryId,
      objectId,
      partHash,
      format: "text"
    }));

    /*


    const Upload = async (writeToken) => {
      const file = fs.readFileSync("LICENSE");

      console.log(await client.UploadPart({libraryId, objectId, writeToken, data: file, encryption: "cgck"}));
    };

    await Update(client, libraryId, objectId, Upload);

    /*
    return;

    console.log(await client.DownloadPart({
      libraryId: "ilib38jyeQdw3cB4hzWhkeg4Fux3dw82",
      objectId: "iq__449HPG2MfgM9QFXZFKRtCT56pQFM",
      partHash: "hqpePMMjDcbrxGVo3NR2g7eq7TeFQDETzY16MK2qtJboM1Eyha3T"
    }));
    return;

    console.log(await client.Collection({
      collectionType: "accessGroups"
    }));

    return;

    const libraryId = "ilib4CRR6P5RYnLmfxqsXrriTjskKo2x";
    const objectId = "iq__3naFPRP4m5NX1BMxor2WJRUHLvLv";

    const file = fs.readFileSync("test/images/test-image1.png");

    const editResponse = await client.EditContentObject({libraryId, objectId});

    const upload = await client.UploadPart({
      libraryId,
      objectId,
      writeToken: editResponse.write_token,
      data: file,
      encryption: "cgck"
    });

    const partHash = upload.part.hash;

    console.log(partHash);

    await client.FinalizeContentObject({
      libraryId,
      objectId,
      writeToken: editResponse.write_token
    });

    const part1 = (await client.DownloadPart({
      libraryId,
      objectId,
      partHash,
      format: "arrayBuffer"
    }));

    const client2 = await ElvClient.FromConfigurationUrl({
      configUrl: ClientConfiguration["config-url"]
    });

    const signer2 = client2.GenerateWallet().AddAccount({
      privateKey: "0x09e180efeacdd2bdae9292bb5cb85cf9668217eed44447008604ecb7f26c1ab1",
    });
    await client2.SetSigner({signer: signer2});

    const part2 = (await client2.DownloadPart({
      libraryId,
      objectId,
      partHash,
      format: "arrayBuffer"
    }));

    console.log(part2);


    fs.writeFileSync("./enc-download.png", Buffer.from(part2));

    return;

    /*


    /*


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

    console.log(await client.DownloadPart({
      libraryId,
      objectId,
      partHash,
      format: "text"
    }));

    console.log("====");
    console.log(objectId);
    console.log(partHash);
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
