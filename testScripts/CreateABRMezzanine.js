/* eslint-disable no-console */

const {ElvClient} = require("../src/ElvClient");
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
  .option("name", {
    description: "Name for the mezzanine object (derived from ip-title-id and title if not provided)"
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
    description: "IP title ID for the mezzanine (equivalent to slug if not specified)",
    type: "string"
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
    description: "Metadata JSON string (or file path if prefixed with '@') to include in the object metadata"
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
    description: "Geographic region for the fabric nodes. Available regions: na-west-north, na-west-south, na-east, eu-west, eu-east, as-east, au-east"
  })
  .option("config-url", {
    type: "string",
    description: "URL pointing to the Fabric configuration. i.e. https://main.net955210.contentfabric.io/config"
  })
  .option("credentials", {
    type: "string",
    description: "Path to JSON file containing credential sets for files stored in cloud"
  })
  .option("debug", {
    type: "boolean",
    description: "Enable client logging"
  })
  .option("wait", {
    type: "boolean",
    description: "Wait for mezzanine to finish transcoding, then finalize before exiting script"
  })
  .demandOption(
    ["library", "masterHash", "type"],
    "\nUsage: PRIVATE_KEY=<private-key> node CreateABRMezzanine.js --library <mezzanine-library-id> --type <type> </type>--masterHash <production-master-hash> --title <title> (--variant <variant>) (--metadata '<metadata-json>') (--existingMezzId <object-id>) (--elv-geo eu-west)\n"
  )
  .argv;

const ClientConfiguration = (!argv["config-url"]) ? (require("../TestConfiguration.json")) : {"config-url": argv["config-url"]};

const Slugify = str =>
  (str || "").toLowerCase().replace(/ /g, "-").replace(/[^a-z0-9-]/g, "");

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
  name,
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
  credentials,
  debug,
  wait = false
}) => {

  // force ipTitleId to be a string, if present
  if(ipTitleId) {
    ipTitleId = ipTitleId.toString();
  }

  try {
    const privateKey = process.env.PRIVATE_KEY;
    if(!privateKey) {
      console.error("PRIVATE_KEY environment variable must be specified");
      return;
    }

    if(!existingMezzId && !title) {
      throw Error("--title argument is required unless --existingMezzId is specified");
    }

    const client = await ElvClient.FromConfigurationUrl({
      configUrl: ClientConfiguration["config-url"],
      region: elvGeo
    });
    let wallet = client.GenerateWallet();
    let signer = wallet.AddAccount({
      privateKey: process.env.PRIVATE_KEY
    });

    await client.SetSigner({signer});

    if(debug) {
      client.ToggleLogging(true);
    }

    if(metadata) {
      try {
        if(metadata.startsWith("@")) {
          metadata = fs.readFileSync(metadata.substring(1));
        }

        metadata = JSON.parse(metadata) || {};
        if(!metadata.public) {
          metadata.public = {};
        }

        name = name || metadata.public.name || metadata.name;
      } catch(error) {
        console.error("Error parsing metadata:");
        console.error(error);
        return;
      }
    } else if(existingMezzId) {
      const libraryId = await client.ContentObjectLibraryId({objectId: existingMezzId});
      const assetMetadata = (await client.ContentObjectMetadata({
        libraryId,
        objectId: existingMezzId,
        metadataSubtree: "public/asset_metadata"
      })) || {};

      const existingName = (await client.ContentObjectMetadata({
        libraryId,
        objectId: existingMezzId,
        metadataSubtree: "public/name"
      })) || {};

      metadata = {
        public: {
          asset_metadata: assetMetadata || {},
          name: name || existingName || ""
        }
      };

      if(!title && !metadata.public.asset_metadata.title) {
        throw Error("Existing mez does not have 'title' set and title argument was not provided");
      }
    } else {
      metadata = {public: {asset_metadata: {}}};
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
      asset_type: assetType,
      ...(metadata.public.asset_metadata || {})
    };

    name = name || metadata.public.name || metadata.public.asset_metadata.title + " MEZ";

    let access;
    if(credentials) {
      access = JSON.parse(fs.readFileSync(credentials));
    } else {
      access = [
        {
          path_matchers: [".*"],
          remote_access: {
            protocol: "s3",
            platform: "aws",
            path: process.env.AWS_BUCKET + "/",
            storage_endpoint: {
              region: process.env.AWS_REGION
            },
            cloud_credentials: {
              access_key_id: process.env.AWS_KEY,
              secret_access_key: process.env.AWS_SECRET
            }
          }
        }
      ];
    }

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
      name,
      libraryId: library,
      objectId: existingMezzId,
      type,
      masterVersionHash: masterHash,
      variant,
      offeringKey: offeringKey,
      metadata,
      abrProfile
    });

    Report(createResponse);

    const objectId = createResponse.id;
    await client.SetVisibility({id: objectId, visibility: 0});

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

    if(!wait) {
      return;
    }

    console.log("Progress:");

    // eslint-disable-next-line no-constant-condition
    while(true) {
      const status = await client.LROStatus({libraryId: library, objectId, offeringKey});

      let done = true;
      const progress = Object.keys(status).map(id => {
        const info = status[id];

        if(!info.end) {
          done = false;
        }

        if(done && info.run_state !== "finished") {
          throw Error(`LRO ${id} failed with status ${info.run_state}`);
        }

        return `${id}: ${parseFloat(info.progress.percentage || 0).toFixed(1)}%`;
      });

      readline.clearLine(process.stdout, 0);
      readline.cursorTo(process.stdout, 0, null);
      process.stdout.write(progress.join(" "));

      if(done) {
        break;
      }

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
    console.error(error.body ? JSON.stringify(error, null, 2) : error);
  }
};


Create(argv);
