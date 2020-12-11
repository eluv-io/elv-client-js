const moment = require("moment");
// amount of time allowed to elapse since last LRO update before raising 'stalled' error
const MAX_REPORTED_DURATION_TOLERANCE = 15 * 60; // 15 minutes

const ScriptBase = require("./lib/ScriptBase");

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

  if(minutesString !== "00") {
    dataStarted = true;
  }
  result += dataStarted ? minutesString + "m " : "    ";

  if(secondsString !== "00") {
    dataStarted = true;
  }
  result += dataStarted ? secondsString + "s " : "    ";

  return result;
}

class MezzanineJobStatus extends ScriptBase {
  async body() {
    const client = await this.client();
    const logger = this.logger;

    const objectId = this.args.objectId;
    const offeringKey = this.args.offeringKey;
    const finalize = this.args.finalize;
    const noWait = this.args.noWait;
    const force = this.args.force;

    const libraryId = await client.ContentObjectLibraryId({objectId});

    const status = await client.LROStatus({libraryId, objectId, offeringKey});

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
          logger.warn(statusEntry.warning);
          warningsAdded = true;
        } else {
          const estSecondsLeft = (
            statusEntry.progress.percentage ?
              statusEntry.progress.percentage === 100 ?
                0 :
                (statusEntry.duration_ms / 1000) / (statusEntry.progress.percentage / 100) - (statusEntry.duration_ms / 1000) :
              null
          );
          statusEntry.estimated_time_left_seconds = Math.round(estSecondsLeft);
          statusEntry.estimated_time_left_h_m_s = etaString(estSecondsLeft);
        }
      } else {
        if(status[lroKey].progress.percentage !== 100) {
          statusEntry.warning = "Job " + lroKey + " is not running, but progress does not equal 100";
          logger.warn(statusEntry.warning);
          warningsAdded = true;
        }
      }
    }
    const logLines = JSON.stringify(status, null, 2).split("\n");
    for(const line of logLines) {
      logger.log(line);
    }
    logger.data("jobs", status);

    if(warningsAdded && !(finalize && force)) {
      throw Error("Warnings raised for job status, exiting script!");
    }

    if(finalize) {
      if(!Object.values(status).every(job => job.run_state === "finished")) {
        throw Error("Error finalizing mezzanine: Not all jobs not finished");
      }

      const finalizeResponse = await client.FinalizeABRMezzanine({libraryId, objectId, offeringKey});

      logger.log();
      logger.log("ABR mezzanine object finalized:");
      logger.log("  Object ID:", objectId);
      logger.log("  Version Hash:", finalizeResponse.hash);
      logger.data("version_hash", finalizeResponse.hash);
      logger.data("finalized", true);
      logger.log();

      if(noWait) {
        logger.log("--no-wait specified, exiting script without waiting for publishing to finish (finalized new object version may take up to several minutes to become visible.");
      } else {
        logger.log("Waiting for publishing to finish and new object version to become visible...");
        let publishFinished = false;
        let latestObjectData = {};
        while(!publishFinished) {
          latestObjectData = await client.ContentObject({libraryId, objectId});
          if(latestObjectData.hash === finalizeResponse.hash) {
            publishFinished = true;
          } else {
            logger.log("  waiting 15 seconds...");
            await new Promise(resolve => setTimeout(resolve, 15 * 1000));
          }
        }
      }
    }
  }

  header() {
    return "Getting status for mezzanine job(s)...";
  }

  options() {
    return super.options()
      .option("objectId", {
        alias: "object-id",
        demandOption: true,
        description: "Object ID of the mezzanine",
        type: "string"
      })
      .option("offeringKey", {
        alias: "offering-key",
        default: "default",
        description: "Object ID of the mezzanine",
        type: "string"
      })
      .option("finalize", {
        description: "If specified, will finalize the mezzanine if completed",
        type: "boolean"
      })
      .option("noWait", {
        alias: "no-wait",
        description: "When finalizing, exit script immediately after finalize call rather than waiting for publish to finish",
        type: "boolean"
      })
      .option("force", {
        description: "When finalizing, proceed even if warning raised",
        type: "boolean"
      })
      .usage("\nUsage: PRIVATE_KEY=<private-key> node MezzanineStatus.js --objectId <mezzanine-object-id> (--finalize) (--wait) (--force)\n");
  }
}

const script = new MezzanineJobStatus;
script.run();
