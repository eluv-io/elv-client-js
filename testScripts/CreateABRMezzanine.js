const { ElvClient } = require("../src/ElvClient");
const readline = require("readline");

const yargs = require("yargs");
const argv = yargs
  .option("library", {
    description: "ID of the library in which to create the mezzanine"
  })
  .option("masterHash", {
    description: "Version hash of the master object"
  })
  .option("title", {
    description: "Title for the mezzanine"
  })
  .option("metadata", {
    description: "Metadata JSON string to include in the object metadata"
  })
  .option("variant", {
    description: "Variant of the mezzanine",
    default: "default"
  })
  .option("existingMezzId", {
    description: "If re-running the mezzanine process, the ID of an existing mezzanine object"
  })
  .demandOption(
    ["library", "title", "masterHash"],
    "\nUsage: PRIVATE_KEY=<private-key> node CreateABRMezzanine.js --library <mezzanine-library-id> --masterHash <production-master-hash> --title <title> (--variant <variant>) (--metadata '<metadata-json>') (--existingMezzId <object-id>)\n"
  )
  .argv;

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

const Create = async (mezLibraryId, productionMasterHash, productionMasterVariant="default", title, metadata, existingMezzId) => {
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

    let objectId;
    if(existingMezzId) {
      objectId = existingMezzId;
    } else {
      console.log("\nCreating ABR Mezzanine...");
      const createResponse = await client.CreateABRMezzanine({
        name: title,
        libraryId: mezLibraryId,
        masterVersionHash: productionMasterHash,
        variant: productionMasterVariant,
        metadata,
        access
      });

      Report(createResponse);

      objectId = createResponse.id;
    }

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

    console.log();

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

      readline.clearLine(process.stdout, 0);
      readline.cursorTo(process.stdout, 0, null);
      process.stdout.write(`Progress: ${parseFloat(status.progress.percentage || 0).toFixed(1)}%`);

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

let {library, masterHash, title, existingMezzId, variant, metadata} = argv;

const privateKey = process.env.PRIVATE_KEY;
if(!privateKey) {
  console.error("PRIVATE_KEY environment variable must be specified");
  return;
}

if(metadata) {
  try {
    metadata = JSON.parse(metadata);
  } catch(error) {
    console.error("Error parsing metadata:");
    console.error(error);
  }
}

Create(library, masterHash, variant, title, metadata, existingMezzId);
