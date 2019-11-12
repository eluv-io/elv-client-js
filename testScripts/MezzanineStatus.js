/* eslint-disable no-console */

const { ElvClient } = require("../src/ElvClient");
const yargs = require("yargs");
const argv = yargs
  .option("objectId", {
    description: "Object ID of the mezzanine"
  })
  .option("finalize", {
    description: "If specified, will finalize the mezzanine if completed",
    type: "boolean"
  })
  .option("variant", {
    description: "Variant of the mezzanine",
    default: "default"
  })
  .demandOption(
    ["objectId"],
    "\nUsage: PRIVATE_KEY=<private-key> node MezzanineStatus.js --objectId <mezzanine-object-id> (--finalize) (--variant \"default\")\n"
  )
  .argv;

const ClientConfiguration = require("../TestConfiguration.json");


const Status = async (objectId, variant="default", finalize) => {
  try {
    const client = await ElvClient.FromConfigurationUrl({
      configUrl: ClientConfiguration["config-url"]
    });

    let wallet = client.GenerateWallet();
    let signer = wallet.AddAccount({
      privateKey: process.env.PRIVATE_KEY
    });

    await client.SetSigner({signer});

    const libraryId = await client.ContentObjectLibraryId({objectId});

    const status = await client.LROStatus({libraryId, objectId});

    if(finalize) {
      if(!Object.values(status).every(job => job.run_state === "finished")) {
        console.error("\nError finalizing mezzanine: Not all jobs not finished\n");
        console.error("Current Status:");
        console.error(JSON.stringify(status, null, 2));
        return;
      }

      const finalizeResponse = await client.FinalizeABRMezzanine({libraryId, objectId, offeringKey: variant});

      console.log("\nABR mezzanine object finalized:");
      console.log("\tObject ID:", objectId);
      console.log("\tVersion Hash:", finalizeResponse.hash, "\n");
    } else {
      console.log(JSON.stringify(status, null, 2));
    }
  } catch(error) {
    console.error("Error creating mezzanine:");
    console.error(error.body ? JSON.stringify(error, null, 2): error);
  }
};

let {objectId, variant, finalize} = argv;

const privateKey = process.env.PRIVATE_KEY;
if(!privateKey) {
  console.error("PRIVATE_KEY environment variable must be specified");
  return;
}

Status(objectId, variant, finalize);
