// Get mezzanine job status and optionally finalize

const {NewOpt, ModOpt} = require("./lib/options");
const Utility = require("./lib/Utility");

const Client = require("./lib/concerns/Client");
const ExistingObject = require("./lib/concerns/ExistingObject");
const Finalization = require("./lib/concerns/Finalization");
const Logger = require("./lib/concerns/Logger");
const LRO = require("./lib/concerns/LRO");

class MezzanineJobStatus extends Utility {
  blueprint() {
    return {
      concerns: [Logger, ExistingObject, Client, LRO, Finalization],
      options: [
        ModOpt("objectId", {ofX: "mezzanine"}),
        ModOpt("libraryId", {forX: "mezzanine"}),
        NewOpt("finalize", {
          descTemplate: "If specified, will finalize the mezzanine if all jobs are completed",
          type: "boolean"
        }),
        NewOpt("force", {
          descTemplate: "When finalizing, proceed even if warning raised",
          implies: "finalize",
          type: "boolean"
        }),
        ModOpt("noWait", {implies: "finalize"})
      ]
    };
  }

  async body() {
    const client = await this.concerns.Client.get();
    const logger = this.logger;
    const lro = this.concerns.LRO;

    const {finalize, objectId, force} = this.args;
    //const offeringKey = this.args.offeringKey;

    const libraryId = await this.concerns.ExistingObject.libraryId();

    let statusMap;
    try {
      statusMap = await lro.status({libraryId, objectId}); // TODO: check how offering key is used, if at all
    } catch(e) {
      if(finalize && force && e.message === "Received no job status information from server - object already finalized?") {
        logger.warn(e.message);
        logger.warn("--force specified, will attempt to finalize anyway");
      } else {
        throw e;
      }
    }

    let status_summary;
    if(statusMap) {
      logger.logList(
        ...JSON.stringify(statusMap, null, 2)
          .split("\n")
      );
      logger.data("jobs", statusMap);

      status_summary = lro.statusSummary(statusMap);

      logger.data("status_summary", status_summary);
      logger.logList(
        ...JSON.stringify({status_summary}, null, 2)
          .split("\n")
      );

      if(lro.warningFound(statusMap) && !(finalize && force)) {
        throw Error("Warnings raised for job status, exiting script!");
      }
    }

    if(finalize) {
      const safeSummaryRunState = status_summary && status_summary.run_state;
      if(safeSummaryRunState !== LRO.STATE_FINISHED) {
        if(force) {
          logger.warn(`Overall run state is "${safeSummaryRunState}" rather than "${LRO.STATE_FINISHED}", but --force specified, attempting finalization...`);
        } else {
          throw Error(`Error finalizing mezzanine - overall run state is "${safeSummaryRunState}" rather than "${LRO.STATE_FINISHED}"`);
        }
      } else {
        logger.log("Finalizing mezzanine...");
      }

      const finalizeResponse = await client.FinalizeABRMezzanine({libraryId, objectId});
      const latestHash = finalizeResponse.hash;
      logger.logList(
        "",
        "ABR mezzanine object finalized:",
        `  Object ID: ${objectId}`,
        `  Version Hash: ${latestHash}`,
        ""
      );
      logger.data("version_hash", latestHash);
      logger.data("finalized", true);

      await this.concerns.Finalization.waitOrNot({libraryId, objectId, latestHash});
    }
  }

  header() {
    return "Getting status for mezzanine job(s)...";
  }
}

if(require.main === module) {
  Utility.cmdLineInvoke(MezzanineJobStatus);
} else {
  module.exports = MezzanineJobStatus;
}