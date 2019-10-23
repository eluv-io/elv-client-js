const { ElvClient } = require("../src/ElvClient");

const ClientConfiguration = require("../TestConfiguration.json");

const Create = async (mezLibraryId, productionMasterHash, productionMasterVariant) => {
  try {
    const client = await ElvClient.FromConfigurationUrl({
      configUrl: ClientConfiguration["config-url"]
    });

    let wallet = client.GenerateWallet();
    let signer = wallet.AddAccount({
      privateKey: process.env.PRIVATE_KEY
    });

    await client.SetSigner({signer});

    console.log("Creating ABR Mezzanine...");
    const {id, hash} = await client.CreateABRMezzanine({
      libraryId: mezLibraryId,
      masterVersionHash: productionMasterHash,
      variant: productionMasterVariant
    });

    console.log("\nABR mezzanine object created:");
    console.log("\tObject ID:", id);
    console.log("\tVersion Hash:", hash, "\n");
  } catch(error) {
    console.error("Error creating mezzanine:");
    console.error(error);
  }
};

const mezLibraryId = process.argv[2];
const productionMasterHash = process.argv[3];
const productionMasterVariant = process.argv[4];

if(!mezLibraryId || !productionMasterHash ) {
  console.error("Usage: PRIVATE_KEY=<private-key> node ./testScripts/TempCreateMezzanine.js mezLibraryId productionMasterHash [productionMasterVariant]");
  return;
}

Create(mezLibraryId, productionMasterHash, productionMasterVariant);
