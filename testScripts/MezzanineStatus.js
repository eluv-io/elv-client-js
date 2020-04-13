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
  .option("offeringKey", {
    description: "Offering key of the mezzanine",
    default: "default"
  })
  .option("config-url", {
    type: "string",
    description: "URL pointing to the Fabric configuration. i.e. https://main.net955210.contentfabric.io/config"
  })
  .demandOption(
    ["objectId"],
    "\nUsage: PRIVATE_KEY=<private-key> node MezzanineStatus.js --objectId <mezzanine-object-id> (--finalize) (--variant \"default\")\n"
  )
  .argv;

const ClientConfiguration = (!argv["config-url"]) ? (require("../TestConfiguration.json")) : {"config-url": argv["config-url"]}


const Status = async (objectId, offeringKey="default", finalize) => {
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

    const status = await client.LROStatus({libraryId, objectId, offeringKey: offeringKey});

    if(finalize) {
      if(!Object.values(status).every(job => job.run_state === "finished")) {
        console.error("\nError finalizing mezzanine: Not all jobs not finished\n");
        console.error("Current Status:");
        console.error(JSON.stringify(status, null, 2));
        return;
      }

      const finalizeResponse = await client.FinalizeABRMezzanine({libraryId, objectId, offeringKey});

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

let {objectId, offeringKey, finalize} = argv;

const privateKey = process.env.PRIVATE_KEY;
if(!privateKey) {
  console.error("PRIVATE_KEY environment variable must be specified");
  return;
}

Status(objectId, offeringKey, finalize);
