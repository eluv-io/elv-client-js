const { ElvClient } = require("../src/ElvClient");

const ClientConfiguration = require("../TestConfiguration.json");

const Probe = async (contentHash, file_paths, access) => {
  try {
    const client = await ElvClient.FromConfigurationUrl({
      configUrl: ClientConfiguration["config-url"]
    });
    let wallet = client.GenerateWallet();
    let signer = wallet.AddAccount({
      privateKey: process.env.PRIVATE_KEY
    });
    await client.SetSigner({signer});

    console.log("\nCalling files/probe");

    try {
      const body = {file_paths, access};
      const {data, errors, warnings, logs} = await client.CallBitcodeMethod({
        versionHash: contentHash,
        method: "/media/files/probe",
        constant: false,
        body: body
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

const [ , , objectHash, ...filePaths ] = process.argv;

// const access = null;

// Example access if all files in filePaths are in S3 bucket
//
const access = [
  {
    "path_matchers": [".*"],
    "remote_access": {
      "protocol": "s3",
      "platform": "aws",
      "path": process.env.AWS_BUCKET + "/",
      "storage_endpoint": {
        "region":  process.env.AWS_REGION
      },
      "cloud_credentials": {
        "access_key_id": process.env.AWS_KEY,
        "secret_access_key": process.env.AWS_SECRET
      }
    }
  }
];



if(!objectHash ) {
  console.error("Usage: PRIVATE_KEY=<private-key> node ./testScripts/ProbeFiles.js objectHash filePaths...");
  return;
}

Probe(objectHash, filePaths, access);
