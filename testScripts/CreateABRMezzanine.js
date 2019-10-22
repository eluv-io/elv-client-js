const { ElvClient } = require("../src/ElvClient");

const ClientConfiguration = require("../TestConfiguration.json");

const Create = async (mezLibraryId, productionMasterHash, productionMasterVariant="default", ) => {
  try {
    const client = await ElvClient.FromConfigurationUrl({
      configUrl: ClientConfiguration["config-url"]
    });

    let wallet = client.GenerateWallet();
    let signer = wallet.AddAccount({
      privateKey: process.env.PRIVATE_KEY
    });

    await client.SetSigner({signer});


    const access = {
      region: process.env.AWS_REGION,
      bucket: process.env.AWS_BUCKET,
      accessKey: process.env.AWS_KEY,
      secret: process.env.AWS_SECRET
    };

    console.log("Creating ABR Mezzanine...");
    const {id, hash} = await client.CreateABRMezzanine({
      libraryId: mezLibraryId,
      masterVersionHash: productionMasterHash,
      variant: productionMasterVariant,
      access
    });

    console.log("\nABR mezzanine object created:");
    console.log("\tObject ID:", id);
    console.log("\tVersion Hash:", hash, "\n");

    console.log("Starting Mezzanine Job(s)");

    const {writeToken, data, warnings, errors} = await client.StartABRMezzanineJobs({
      libraryId: mezLibraryId,
      objectId: id,
      offeringKey: productionMasterVariant,
      access: {
        region: process.env.AWS_REGION,
        bucket: process.env.AWS_BUCKET,
        accessKey: process.env.AWS_KEY,
        secret: process.env.AWS_SECRET
      }
    });

    console.log(data);

    if(errors.length > 0) {
      console.error("Errors:");
      console.error(errors.join("\n"), "\n");
    }

    if(warnings.length) {
      console.warn("Warnings:");
      console.warn(warnings.join("\n"), "\n");
    }

    while(true) {
      const status = await client.ContentObjectMetadata({
        libraryId: mezLibraryId,
        objectId: id,
        writeToken
      });

      if(status.end) {
        break;
      }

      console.log(status.progress.percentage);

      await new Promise(resolve => setTimeout(resolve, 10000));
    }

    await client.FinalizeContentObject({
      libraryId: mezLibraryId,
      objectId: id,
      writeToken
    });
  } catch(error) {
    console.error("Error creating mezzanine:");
    console.error(error.body ? JSON.stringify(error, null, 2): error);
  }
};

const mezLibraryId = process.argv[2];
const productionMasterHash = process.argv[3];
const productionMasterVariant = process.argv[4];

if(!mezLibraryId || !productionMasterHash ) {
  console.error("Usage: PRIVATE_KEY=<private-key> node ./testScripts/CreateABRMezzanine.js mezLibraryId productionMasterHash (productionMasterVariant)");
  return;
}

Create(mezLibraryId, productionMasterHash, productionMasterVariant);
