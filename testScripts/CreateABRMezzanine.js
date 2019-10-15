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

    console.log("Creating ABR Mezzanine");
    await client.CreateABRMezzanine({
      libraryId: mezLibraryId,
      versionHash: productionMasterHash,
      variant: productionMasterVariant,
    });

  } catch(error) {
    console.error(error);
  }
};

const mezLibraryId = process.argv[2];
const productionMasterHash = process.argv[3];
const productionMasterVariant = process.argv[4];

if(!mezLibraryId || !productionMasterHash ) {
  console.error("Usage: PRIVATE_KEY=<private-key> node ./testScripts/CreateABRMezzanine.js mezLibraryId productionMasterHash [productionMasterVariant]");
  return;
}

Create(mezLibraryId, productionMasterHash, productionMasterVariant);
