const { ElvClient } = require("./src/ElvClient.js");

const Path = require("path");
const fs = require("fs");

const ClientConfiguration = require("./TestConfiguration.json");

let client = ElvClient.FromConfiguration({configuration: ClientConfiguration});
const wallet = client.GenerateWallet();
const signer = wallet.AddAccount({
  accountName: "Serban",
  //privateKey: "efab66c11603800aaaf5ebf135ea1c23393994c4854346949481960a7a3e2573"  // 955301
  privateKey: "0x0000000000000000000000000000000000000000000000000000000000000000"
  //privateKey: "33235d5d6dbc0b877ce1b505068a7de0e449f77425374d67a4c44f7218c6ddf8" // Ganache
  //privateKey: "0x0000000000000000000000000000000000000000000000000000000000000000"
});
client.SetSigner({signer});

const mediaPlatformPath = "../elv-media-platform";

const contentSpaceId = ClientConfiguration.fabric.contentSpaceId;
const contentSpaceContractAddress = client.utils.HashToAddress(contentSpaceId);
const contentSpaceLibraryId = client.utils.AddressToLibraryId(contentSpaceContractAddress);

const CreateContentType = async (schema) => {
  const bitcode = schema.bitcode ? fs.readFileSync(Path.join(mediaPlatformPath, "bitcode", schema.bitcode + ".bc")) : undefined;

  const typeId = await client.CreateContentType({metadata: schema.metadata, bitcode});
  
  const editRequest = await client.EditContentObject({libraryId: contentSpaceLibraryId, objectId: typeId});

  // Deploy custom contract and record contract info
  let customContractAddress;
  if(schema.contract) {
    const contract = eval(fs.readFileSync(Path.join("./src/contracts", schema.contract + ".js")).toString());
    const { contractAddress } = await client.DeployContract({
      abi: contract.abi,
      bytecode: contract.bytecode
    });

    let factoryAbi;
    if(schema.factoryContract) {
      factoryAbi = (eval(fs.readFileSync(Path.join("./src/contracts", schema.factoryContract + ".js")).toString())).abi;
    }

    customContractAddress = contractAddress;

    await client.ReplaceMetadata({
      libraryId: contentSpaceLibraryId,
      objectId: typeId,
      writeToken: editRequest.write_token,
      metadataSubtree: "custom_contract",
      metadata: {
        address: contractAddress,
        name: schema.contract,
        abi: contract.abi,
        bytecode: contract.bytecode,
        factoryAbi
      }
    });
  }

  // Upload apps and specify apps in metadata
  if(Object.keys(schema.apps).length > 0) {
    const fileInfo = await Promise.all (
      Object.keys(schema.apps).map(async role => {
        await client.ReplaceMetadata({
          libraryId: contentSpaceLibraryId,
          objectId: typeId,
          writeToken: editRequest.write_token,
          metadataSubtree: `eluv.${role}App`,
          metadata: `${role}App.html`
        });

        const appData = fs.readFileSync(Path.join(mediaPlatformPath, "apps", schema.apps[role]));

        return {
          path: `${role}App.html`,
          type: "file",
          size: appData.length,
          data: appData
        };
      })
    );

    await client.UploadFiles({
      libraryId: contentSpaceLibraryId,
      objectId: typeId,
      writeToken: editRequest.write_token,
      fileInfo
    });
  }

  // Set type schema
  if(schema.schema) {
    const typeSchema = JSON.parse(fs.readFileSync(Path.join(mediaPlatformPath, "schemas", schema.schema + ".json")).toString());

    await client.MergeMetadata({
      libraryId: contentSpaceLibraryId,
      objectId: typeId,
      writeToken: editRequest.write_token,
      metadata: typeSchema
    });
  }

  await client.FinalizeContentObject({
    libraryId: contentSpaceLibraryId,
    objectId: typeId,
    writeToken: editRequest.write_token
  });

  await client.ContentObject({libraryId: contentSpaceLibraryId, objectId: typeId});

  return {id: typeId, contractAddress: customContractAddress};
};

const CreateContentTypes = async () => {
  let contentTypes = {};
  let contracts = {};

  const typeSchema = fs.readdirSync(Path.join(mediaPlatformPath, "content-types"));

  for(const schemaName of typeSchema) {
    const schema = JSON.parse(fs.readFileSync(Path.join(mediaPlatformPath, "content-types", schemaName)).toString());

    const {id, contractAddress} = await CreateContentType(schema);

    console.log("\n\t" + schema.metadata.name);
    console.log("\tID: " + id);
    if(contractAddress) {
      console.log("\tContract: " + contractAddress);
    }

    contentTypes[schema.key] = id;

    if(contractAddress) { contracts[schema.key] = contractAddress; }
  }

  return {contentTypes, contracts};
};

const InitializeContentSpace = async () => {
  // Ensure the content space library is created
  try {
    await client.ContentLibrary({libraryId: contentSpaceLibraryId});
  } catch(error) {
    if(error.status !== 404) { throw error; }

    client.HttpClient.Request({
      headers: await client.authClient.AuthorizationHeader({}),
      method: "PUT",
      path: Path.join("qlibs", contentSpaceLibraryId),
      body: {
        meta: {
          "name": "Content Types"
        }
      }
    });
  }
};

const CreateMediaPlatform = async () => {
  await InitializeContentSpace();

  console.log("\nCreating content types");
  const {contentTypes, contracts} = await CreateContentTypes();

  console.log("\nCreating libraries");

  let libraryIds = {};

  // Make library - Ads Marketplace
  const adsMarketplaceID = await client.CreateContentLibrary({
    name: "Ads Marketplace",
    description: "Ads Marketplace",
  });

  console.log("\tAds Marketplace: " + adsMarketplaceID);

  // TODO - Make add type automatically pull contract out of type (?)
  await client.AddLibraryContentType({
    libraryId: adsMarketplaceID,
    typeId: contentTypes.campaign_manager,
    customContractAddress: contracts.campaign_manager
  });

  // Make library - Channels
  const channelsId = await client.CreateContentLibrary({
    name: "Channels",
    description: "Library for public channels"
  });

  console.log("\tChannels: " + channelsId);

  // Make the main library "Eluvio Media Platform"
  const libraryId = await client.CreateContentLibrary({
    name: "Eluvio Media Platform",
    description: "Eluvio Media Platform",
    publicMetadata: {
      class: "platform",
      emp: {
        class: "platform",
        content_types: contentTypes,
        contracts,
        ads_marketplace: adsMarketplaceID,
        channels: channelsId
      }
    }
  });
  console.log("\tEluvio Media Platform: " + libraryId + "\n");
};

CreateMediaPlatform();
