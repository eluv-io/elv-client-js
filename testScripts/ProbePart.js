const { ElvClient } = require("../src/ElvClient");

const ClientConfiguration = require("../TestConfiguration.json");

const ProbePart = async (libId, objectId, partHash, logLevel="none") => {
  try {
    const client = await ElvClient.FromConfigurationUrl({
      configUrl: ClientConfiguration["config-url"]
    });
    let wallet = client.GenerateWallet();
    let signer = wallet.AddAccount({
      privateKey: process.env.PRIVATE_KEY
    });
    await client.SetSigner({signer});

    console.log("\nCalling parts/.../probe");

    let response = null;

    try {
      response = await client.CallBitcodeMethod({
        constant: true,
        libraryId: libId,
        method: "/media/parts/" + partHash + "/probe",
        objectId: objectId,
        queryParams: {response_log_level: logLevel}
      });
    } catch(error) {
      // was the exception generated due to http error code? (did we actually get a response?)
      if (error.body && error.status && error.statusText) {
        console.log("Received error response from server: " + error.status + " " + error.statusText);
        response = error.body
      }  else {
        console.error("Unrecoverable error:");
        const errorJson = JSON.stringify(error, null, 2);
        if (errorJson === "{}") {
          console.error(error)
        } else {
          console.error(errorJson);
        }
      }
    }

    if (response) {
      console.log(JSON.stringify(response, null, 2));
    }

  } catch(error) {
    console.error(error);
  }
};

const [ , , libId, objectId, partHash, log_level ] = process.argv;

if(!libId || !objectId || !partHash ) {
  console.error("Usage: PRIVATE_KEY=<private-key> node ./testScripts/ProbePart.js libId objectId partHash [log_level]");
  console.error("  log_level = [none|error|warn|info|debug]");
  process.exit(1);
}

ProbePart(libId, objectId, partHash, log_level);
