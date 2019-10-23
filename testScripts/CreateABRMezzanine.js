const { ElvClient } = require("../src/ElvClient");

const ClientConfiguration = require("../TestConfiguration.json");

const Report = response => {
  if(response.errors.length > 0) {
    console.error("Errors:");
    console.error(response.errors.join("\n"), "\n");
  }

  if(response.warnings.length) {
    console.warn("Warnings:");
    console.warn(response.warnings.join("\n"), "\n");
  }
};

const Create = async (mezLibraryId, productionMasterHash, productionMasterVariant="default") => {
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
    const createResponse = await client.CreateABRMezzanine({
      libraryId: mezLibraryId,
      masterVersionHash: productionMasterHash,
      variant: productionMasterVariant,
      access
    });

    Report(createResponse);

    const objectId = createResponse.id;

    console.log("Starting Mezzanine Job(s)");

    const startResponse = await client.StartABRMezzanineJobs({
      libraryId: mezLibraryId,
      objectId,
      offeringKey: productionMasterVariant,
      access: {
        region: process.env.AWS_REGION,
        bucket: process.env.AWS_BUCKET,
        accessKey: process.env.AWS_KEY,
        secret: process.env.AWS_SECRET
      }
    });

    Report(startResponse);

    const writeToken = startResponse.writeToken;

    //console.log(data);


    while(true) {
      const status = await client.ContentObjectMetadata({
        libraryId: mezLibraryId,
        objectId,
        writeToken,
        metadataSubtree: "lro_status"
      });

      if(status.end) {
        console.log(status.run_state);
        break;
      }

      console.log(`${status.progress.percentage || 0}%`);

      await new Promise(resolve => setTimeout(resolve, 10000));
    }

    const finalizeResponse = await client.FinalizeABRMezzanine({
      libraryId: mezLibraryId,
      objectId,
      writeToken,
      offeringKey: productionMasterVariant
    });

    Report(finalizeResponse);

    console.log("\nABR mezzanine object created:");
    console.log("\tObject ID:", objectId);
    console.log("\tVersion Hash:", finalizeResponse.hash, "\n");
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
