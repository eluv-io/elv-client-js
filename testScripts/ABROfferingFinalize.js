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
      const metadata = await client.ContentObjectMetadata({libraryId, objectId});
      const prodMasterHash = metadata.abr_mezzanine.offerings[offeringKey].prod_master_hash;

      console.log("master hash:" + prodMasterHash);

      console.log("mez qid:" + objectId);
      console.log("Mez lib:" + libraryId);

      const {write_token} = await client.EditContentObject({libraryId, objectId});

      const masterInfoReply = await client.ContentObject({versionHash: prodMasterHash});
      console.log(JSON.stringify(masterInfoReply));
      const masterId = masterInfoReply.id;

      console.log("objectID mez:" + objectId);
      console.log();

      // Include authorization for master, and mezzanine
      let authorizationTokens = [];

      console.log("prod qid: " + masterId);
      console.log("prod lib: " + masterId);

      authorizationTokens.push(await client.authClient.AuthorizationToken({libraryId, objectId, update: true}));
      authorizationTokens.push(await client.authClient.AuthorizationToken({objectId:masterId, libraryId:"ilibMeiZ3F266sx1hk3QvccVsLhQKfp", versionHash: prodMasterHash}));


      const headers = {
        Authorization: authorizationTokens.map(token => `Bearer ${token}`).join(",")
      };


      console.log(JSON.stringify(headers, null, 2));

      console.log();

      const {data, errors, warnings, logs} = await client.CallBitcodeMethod({
        headers,
        objectId,
        libraryId,
        writeToken: write_token,
        method: "/media/abr_mezzanine/offerings/" + offeringKey + "/finalize",
        constant: false
      });

      const finalizeResponse = await client.FinalizeContentObject({
        libraryId,
        objectId: objectId,
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
