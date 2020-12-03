/* eslint-disable no-console */

const moment = require("moment");
// amount of time allowed to elapse since last LRO update before raising 'stalled' error
const MAX_REPORTED_DURATION_TOLERANCE = 15 * 60; // 15 minutes

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
  .option("no-wait", {
    alias: "noWait",
    type: "boolean",
    description: "When finalizing, exit script immediately after finalize call rather than waiting for publish to finish"
  })
  .option("force", {
    type: "boolean",
    description: "When finalizing, proceed even if warning raised"
  })
  .option("debug", {
    type: "boolean",
    description: "Enable client logging"
  })
  .demandOption(
    ["objectId"],
    "\nUsage: PRIVATE_KEY=<private-key> node MezzanineStatus.js --objectId <mezzanine-object-id> (--finalize) (--wait) (--offeringKey \"default\")\n"
  )
  .strict().argv;

const ClientConfiguration = (!argv["config-url"]) ? (require("../TestConfiguration.json")) : {"config-url": argv["config-url"]};

function etaString(seconds) {
  const days = Math.trunc(seconds / 86400);
  const unixTimestamp = moment.unix(seconds).utc();
  const hoursString = unixTimestamp.format("HH");
  const minutesString = unixTimestamp.format("mm");
  const secondsString = unixTimestamp.format("ss");

  let dataStarted = false;
  let result = "";
  if(days > 0) {
    dataStarted = true;
  }
  result += dataStarted ? days.padStart(2) + "d " : "    ";

  if(hoursString !== "00") {
    dataStarted = true;
  }
  result += dataStarted ? hoursString + "h " : "    ";

  if(minutesString  !== "00") {
    dataStarted = true;
  }
  result += dataStarted ? minutesString + "m " : "    ";

  if(secondsString !== "00") {
    dataStarted = true;
  }
  result += dataStarted ? secondsString + "s " : "    ";

  return result;
}

const Status = async (objectId, offeringKey="default", finalize, noWait, force, debug) => {
  try {
    const client = await ElvClient.FromConfigurationUrl({
      configUrl: ClientConfiguration["config-url"]
    });

    let wallet = client.GenerateWallet();
    let signer = wallet.AddAccount({
      privateKey: process.env.PRIVATE_KEY
    });

    await client.SetSigner({signer});

    if(debug) {
      client.ToggleLogging(true);
    }

    const libraryId = await client.ContentObjectLibraryId({objectId});

    const status = await client.LROStatus({libraryId, objectId, offeringKey: offeringKey});
    
    let warningsAdded = false;

    for(const lroKey in status) {
      let statusEntry = status[lroKey];
      if(statusEntry.run_state === "running") {
        const start = moment.utc(statusEntry.start).valueOf();
        const now = moment.utc().valueOf();
        const actualElapsedSeconds = Math.round((now - start) / 1000);
        const reportedElapsed = Math.round(statusEntry.duration_ms / 1000);
        const secondsSinceLastUpdate = actualElapsedSeconds - reportedElapsed;

        // off by more than tolerance?
        if(secondsSinceLastUpdate > MAX_REPORTED_DURATION_TOLERANCE) {
          statusEntry.warning = "status has not been updated in " + secondsSinceLastUpdate + " seconds, process may have terminated";
          warningsAdded = true;
        } else {
          const estSecondsLeft = (
            statusEntry.progress.percentage ?
              statusEntry.progress.percentage === 100 ?
                0 :
                (statusEntry.duration_ms / 1000) / (statusEntry.progress.percentage / 100) - (statusEntry.duration_ms / 1000) :
              null
          );
          statusEntry.estimated_time_remaining = etaString(estSecondsLeft);
        }
      } else {
        if(status[lroKey].progress.percentage !== 100) {
          statusEntry.warning = "LRO " + lroKey + " is not running, but progress does not equal 100";
          warningsAdded = true;
        }
      }
    }
    console.log(JSON.stringify(status,null,2));

    if(warningsAdded && !(finalize && force)) {
      console.error("\nWarnings raised for LRO status, exiting script!\n");
      process.exitCode = 1;
      return;
    }
    
    if(finalize) {
      if(!Object.values(status).every(job => job.run_state === "finished")) {
        console.error("\nError finalizing mezzanine: Not all jobs not finished\n");
        console.error("Current Status:");
        console.error(JSON.stringify(status, null, 2));
        process.exitCode = 1;
        return;
      }

      const finalizeResponse = await client.FinalizeABRMezzanine({libraryId, objectId, offeringKey});

      console.log("\nABR mezzanine object finalized:");
      console.log("\tObject ID:", objectId);
      console.log("\tVersion Hash:", finalizeResponse.hash, "\n");

      if(noWait) {
        console.log("--no-wait specified, exiting script without waiting for publishing to finish (finalized new object version may take up to several minutes to become visible.");
      } else {
        console.log("Waiting for publishing to finish and new object version to become visible...");
        let publishFinished = false;
        let latestObjectData = {};
        while(!publishFinished) {
          latestObjectData = await client.ContentObject({libraryId, objectId});
          if(latestObjectData.hash === finalizeResponse.hash) {
            publishFinished = true;
          } else {
            console.log("  waiting 15 seconds...");
            await new Promise(resolve => setTimeout(resolve, 15 * 1000));
          }
        }
      }
    }
  } catch(error) {
    console.error("Error getting mezzanine status:");
    console.error(error.body ? JSON.stringify(error, null, 2): error);
  }
};

let {objectId, offeringKey, finalize, noWait, force, debug} = argv;

const privateKey = process.env.PRIVATE_KEY;
if(!privateKey) {
  console.error("PRIVATE_KEY environment variable must be specified");
  process.exitCode = 1;
  return;
}

Status(objectId, offeringKey, finalize, noWait, force, debug).then(successValue => {
  // nothing
  return successValue;
}, failureReason => {
  console.error(failureReason);
  process.exitCode = 1;
});
