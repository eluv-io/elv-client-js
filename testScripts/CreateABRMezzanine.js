/* eslint-disable no-console */

const { ElvClient } = require("../src/ElvClient");
const readline = require("readline");
const fs = require("fs");

const yargs = require("yargs");
const argv = yargs
  .option("library", {
    description: "ID of the library in which to create the mezzanine"
  })
  .option("masterHash", {
    description: "Version hash of the master object"
  })
  .option("type", {
    description: "Name, object ID, or version hash of the type for the mezzanine"
  })
  .option("title", {
    description: "Title for the mezzanine"
  })
  .option("display-title", {
    description: "Display title for the mezzanine (set to title if not specified)"
  })
  .option("slug", {
    description: "Slug for the mezzanine (generated based on title if not specified)"
  })
  .option("ip-title-id", {
    description: "IP title ID for the mezzanine (equivalent to slug if not specified)"
  })
  .option("title-type", {
    description: "Title type for the mezzanine",
    default: "title"
  })
  .option("asset-type", {
    description: "Asset type for the mezzanine",
    default: "primary"
  })
  .option("metadata", {
    description: "Metadata JSON string to include in the object metadata or file path prefixed with '@'"
  })
  .option("variant", {
    description: "Variant of the mezzanine",
    default: "default"
  })
  .option("offering-key", {
    description: "Offering key for the new mezzanine",
    default: "default"
  })
  .option("existingMezzId", {
    description: "If re-running the mezzanine process, the ID of an existing mezzanine object"
  })
  .option("abr-profile", {
    description: "Path to JSON file containing alternative ABR profile"
  })
  .option("elv-geo", {
    type: "string",
    description: "Geographic region for the fabric nodes. Available regions: na-west-north|na-west-south|na-east|eu-west"
  })
  .option("config-url", {
    type: "string",
    description: "URL pointing to the Fabric configuration. i.e. https://main.net955210.contentfabric.io/config"
  })
  .demandOption(
    ["library", "masterHash", "type", "title"],
    "\nUsage: PRIVATE_KEY=<private-key> node CreateABRMezzanine.js --library <mezzanine-library-id> --masterHash <production-master-hash> --title <title> (--variant <variant>) (--metadata '<metadata-json>') (--existingMezzId <object-id>) (--elv-geo eu-west)\n"
  )
  .argv;

const ClientConfiguration = (!argv["config-url"]) ? (require("../TestConfiguration.json")) : {"config-url": argv["config-url"]}

const Slugify = str =>
  (str || "").toLowerCase().replace(/ /g, "-").replace(/[^a-z0-9\-]/g,"");

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

const Create = async ({
  library,
  masterHash,
  type,
  variant,
  offeringKey,
  title,
  displayTitle,
  slug,
  ipTitleId,
  titleType,
  assetType,
  metadata,
  existingMezzId,
  abrProfile,
  elvGeo,
  wait=false
}) => {
  try {
    const privateKey = process.env.PRIVATE_KEY;
    if(!privateKey) {
      console.error("PRIVATE_KEY environment variable must be specified");
      return;
    }

    if(metadata) {
      try {
        if(metadata.startsWith("@")) {
          metadata = fs.readFileSync(metadata.substring(1));
        }
        metadata = JSON.parse(metadata);

        const name = (metadata.public || {}).name || metadata.name || title;
        metadata.name = metadata.name || name;
        metadata.public = {
          ...(metadata.public || {}),
          public: {
            name
          }
        };

      } catch(error) {
        console.error("Error parsing metadata:");
        console.error(error);
      }
    } else {
      metadata = {
        name: title,
        public: {
          name: title,
          asset_metadata: {

          }
        }
      };
    }

    if(abrProfile) {
      abrProfile = JSON.parse(fs.readFileSync(abrProfile));
    }

    metadata.public.asset_metadata = {
      title,
      display_title: displayTitle || title,
      slug: slug || Slugify(displayTitle || title),
      ip_title_id: ipTitleId || slug || Slugify(displayTitle || title),
      title_type: titleType,
      asset_type: assetType
    };

    const client = await ElvClient.FromConfigurationUrl({
      configUrl: ClientConfiguration["config-url"],
      region: elvGeo
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

    const originalType = type;
    if(type.startsWith("iq__")) {
      type = await client.ContentType({typeId: type});
    } else if(type.startsWith("hq__")) {
      type = await client.ContentType({versionHash: type});
    } else {
      type = await client.ContentType({name: type});
    }

    if(!type) {
      throw Error(`Unable to find content type "${originalType}"`);
    }

    type = type.hash;

    console.log("\nCreating ABR Mezzanine...");
    const createResponse = await client.CreateABRMezzanine({
      name: title,
      libraryId: library,
      objectId: existingMezzId,
      type,
      masterVersionHash: masterHash,
      variant,
      offeringKey: offeringKey,
      metadata,
      abrProfile,
      access
    });

    Report(createResponse);

    const objectId = createResponse.id;
    if(objectId) {
      await client.CallContractMethodAndWait({
           contractAddress: client.utils.HashToAddress(objectId),
           methodName: "setVisibility",
           methodArgs: [0],
      });
    }

    console.log("Starting Mezzanine Job(s)");

    const startResponse = await client.StartABRMezzanineJobs({
      libraryId: library,
      objectId,
      offeringKey,
      access
    });

    Report(startResponse);

    console.log("\nLibrary ID", library);
    console.log("Object ID", objectId);
    console.log("Offering:", offeringKey);
    console.log("Write Token:", startResponse.lro_draft.write_token);
    console.log("Write Node:", startResponse.lro_draft.node, "\n");

    if(!wait) { return; }

    console.log("Progress:");

    // eslint-disable-next-line no-constant-condition
    while(true) {
      const status = await client.LROStatus({libraryId: library, objectId, offeringKey});

      let done = true;
      const progress = Object.keys(status).map(id => {
        const info = status[id];

        if(!info.end) { done = false; }

        if(done && info.run_state !== "finished") {
          throw Error(`LRO ${id} failed with status ${info.run_state}`);
        }

        return `${id}: ${parseFloat(info.progress.percentage || 0).toFixed(1)}%`;
      });

      readline.clearLine(process.stdout, 0);
      readline.cursorTo(process.stdout, 0, null);
      process.stdout.write(progress.join(" "));

      if(done) { break; }

      await new Promise(resolve => setTimeout(resolve, 10000));
    }

    const finalizeResponse = await client.FinalizeABRMezzanine({
      libraryId: library,
      objectId,
      offeringKey: offeringKey
    });

    Report(finalizeResponse);

    console.log("\n\nABR mezzanine object created:");
    console.log("\tObject ID:", objectId);
    console.log("\tVersion Hash:", finalizeResponse.hash, "\n");
  } catch(error) {
    console.error("Error creating mezzanine:");
    console.error(error.body ? JSON.stringify(error, null, 2): error);
  }
};


Create(argv);
