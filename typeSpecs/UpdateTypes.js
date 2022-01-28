const { ElvClient } = require("../src/ElvClient");
const isEqual = require("lodash/isEqual");

if(!process.env.PRIVATE_KEY || !process.env.NETWORK) {
  console.error("USAGE: PRIVATE_KEY=<key> NETWORK=<network-name> node UpdateTypes.js");
  process.exit(-1);
}

const specs = {
  "Event Site": {
    spec: require("./DropEventSite"),
  },
  "Tenant": {
    spec: require("./EventTenant"),
  },
  "NFT Collection": {
    spec: require("./NFTCollection")
  },
  "NFT Template": {
    spec: require("./NFTTemplate")
  },
  "Marketplace": {
    spec: require("./Marketplace")
  }
};

const Test = async () => {
  try {
    const client = await ElvClient.FromNetworkName({
      networkName: process.env.NETWORK
    });

    let wallet = client.GenerateWallet();
    let signer = wallet.AddAccount({
      privateKey: process.env.PRIVATE_KEY
    });

    client.SetSigner({signer});

    const types = await client.ContentTypes();

    await Promise.all(
      Object.values(types).map(async (type) => {
        try {
          const typeName = (type.meta && type.meta.public && type.meta.public.name && type.meta.public.name) || "";
          const typeSpec = Object.keys(specs)
            .find(name => typeName.toLowerCase().includes(name.toLowerCase()));

          if(!typeSpec) {
            console.log("Skipping", typeName);
            return;
          }

          const specMetadata = specs[typeSpec].spec;

          if(isEqual(specMetadata, type.meta.public.title_configuration || {})) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            console.log("Type already up to date: ", typeName);
            return;
          }

          await client.EditAndFinalizeContentObject({
            libraryId: client.contentSpaceLibraryId,
            objectId: type.id,
            commitMessage: "Updated type spec via UpdateTypes.js",
            callback: async ({writeToken}) => {
              await client.ReplaceMetadata({
                libraryId: client.contentSpaceLibraryId,
                objectId: type.id,
                writeToken,
                metadataSubtree: "public/title_configuration",
                metadata: specMetadata
              });
            }
          });

          console.log("Updated", typeName);
        } catch(error) {
          console.log(type);
          console.log(error);
        }
      })
    );
  } catch(error) {
    console.error(error);
    console.error(JSON.stringify(error, null, 2));
  }

  process.exit(0);
};

Test();
