const { ElvClient } = require("../src/ElvClient");

const ClientConfiguration = require("../TestConfiguration.json");

const OfferingFinalize = async (libraryId, objectId, offeringKey) => {
  try {
    const client = await ElvClient.FromConfigurationUrl({
      configUrl: ClientConfiguration["config-url"]
    });
    let wallet = client.GenerateWallet();
    let signer = wallet.AddAccount({
      privateKey: process.env.PRIVATE_KEY
    });
    await client.SetSigner({signer});

    try {

      const {write_token} = await client.EditContentObject({libraryId, objectId});

      const {data, errors, warnings, logs} = await client.CallBitcodeMethod({
        objectId,
        libraryId,
        writeToken: write_token,
        method: "/media/abr_mezzanine/offerings/" + offeringKey + "/finalize",
        constant: false
      });

      const finalizeResponse = await client.FinalizeContentObject({
        libraryId,
        objectId: id,
        writeToken: write_token,
        awaitCommitConfirmation: false
      });

      console.log(JSON.stringify(data, null, 2));

      if(errors && errors.length > 0) {
        console.error("Errors:");
        console.error(errors.join("\n"), "\n");
      }

      if(warnings && warnings.length > 0) {
        console.warn("Warnings:");
        console.warn(warnings.join("\n"), "\n");
      }

      if(logs && logs.length > 0) {
        console.log("Log:");
        console.log(logs.join("\n"), "\n");
      }

    } catch(error) {
      console.error("Unrecoverable error:");
      console.error(error.body ? error.body : error);
    }
  } catch(error) {
    console.error(error);
  }
};

const [ , , libraryId, objectId, offeringKey ] = process.argv;

if(!libraryId || !objectId || !offeringKey  ) {
  console.error("Usage: PRIVATE_KEY=<private-key> node ./testScripts/ABROfferingFinalize.js libraryId, objectId, offeringKey");
  return;
}

OfferingFinalize(libraryId, objectId, offeringKey);
