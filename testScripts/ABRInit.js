// initialize abr mezzaninewithout uploading any files
// - use to turn a manually created object into an abr mezzanine

// still need to pass in cloud credentials if files are remote

const { ElvClient } = require("../src/ElvClient");

const ClientConfiguration = require("../TestConfiguration.json");

const ABRMezzanineInit = async (libraryId, objectId, productionMasterHash, productionMasterVariant="default") => {
  try {
    const client = await ElvClient.FromConfigurationUrl({
      configUrl: ClientConfiguration["config-url"]
    });
    let wallet = client.GenerateWallet();
    let signer = wallet.AddAccount({
      privateKey: process.env.PRIVATE_KEY
    });
    await client.SetSigner({signer});

    console.log("\nCalling production_master/init");

    try {

      const response = await client.EditContentObject({libraryId, objectId});

      console.log(JSON.stringify(response));
      const {id, write_token} = response;




      // get master object metadata
      const masterMetaData = (await client.ContentObjectMetadata({
        versionHash: productionMasterHash
      }));

      // ** temporary workaround for server permissions issue **
      const production_master = masterMetaData["production_master"];
      const masterName = masterMetaData["name"];
      // const production_master_files = masterMetaData["fies"];

      // get master object name
      // const masterName = (await this.ContentObjectMetadata({
      //   versionHash: masterVersionHash,
      //   metadataSubtree: UrlJoin( "public", "name")
      // })) || masterVersionHash;


      // ** temporary workaround for server permissions issue **
      // get target library metadata
      const targetLib = (await client.ContentLibrary({libraryId}));
      const abr_profile = (await client.ContentObjectMetadata(
        {
          libraryId,
          objectId: targetLib.qid,
          metadataSubtree: "public/abr_profile"
        }
      ));


      const {data, errors, warnings, logs} = await client.CallBitcodeMethod({
        objectId,
        libraryId,
        method: "/media/abr_mezzanine/init",
        writeToken: write_token,
        body: {
          "offering_key": productionMasterVariant,
          "variant_key": productionMasterVariant,
          "prod_master_hash": productionMasterHash,
          production_master, // ** temporary workaround for server permissions issue **
          abr_profile // ** temporary workaround for server permissions issue **
        },
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

const [ , , libraryId, objectId, productionMasterHash, productionMasterVariant ] = process.argv;




if(!libraryId || !objectId || !productionMasterHash  ) {
  console.error("Usage: PRIVATE_KEY=<private-key> node ./testScripts/ABRInit.js libraryId objectId productionMasterHash [variant]");
  return;
}

ABRMezzanineInit(libraryId, objectId, productionMasterHash, productionMasterVariant);
