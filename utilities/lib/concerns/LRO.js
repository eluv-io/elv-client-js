const kindOf = require("kind-of");
const moment = require("moment");
const R = require("ramda");

const {etaString} = require("../helpers");

const Client = require("./Client");
const Logger = require("./Logger");

const blueprint = {
  name: "LRO",
  concerns: [Logger, Client]
};

// amount of time allowed to elapse since last LRO update before raising 'stalled' error
const MAX_REPORTED_DURATION_TOLERANCE = 15 * 60; // 15 minutes

const STATE_UNKNOWN = "unknown";
const STATE_FINISHED = "finished";
const STATE_RUNNING = "running";
const STATE_STALLED = "stalled";
const STATE_BAD_PCT = "bad_percentage";
const STATE_ERROR = "error";

const New = context => {
  const logger = context.concerns.Logger;

  const StatePrecedence = {
    [STATE_UNKNOWN]: 0,
    [STATE_FINISHED]: 1,
    [STATE_RUNNING]: 2,
    [STATE_STALLED]: 3,
    [STATE_BAD_PCT]: 4,
    [STATE_ERROR]: 5
  };

  const estJobTotalSeconds = (duration_ms, progress_pct) => duration_ms / (10 * progress_pct); // === (duration_ms/1000) / (progress_pct/100)
  const safePct = statusEntry => statusEntry && statusEntry.progress && statusEntry.progress.percentage;

  const estSecondsLeft = statusEntry => {
    const pct = safePct(statusEntry);
    if(pct) {
      if(pct === 100) return 0;
      if(pct > 100) {
        statusEntry.warning = "Progress percentage > 100, process has generated too much data";
        logger.warn(statusEntry.warning);
        setBadRunState(statusEntry, STATE_BAD_PCT);
        return null;
      }
      return Math.round(
        estJobTotalSeconds(statusEntry.duration_ms, pct)
        - (statusEntry.duration_ms / 1000)
      );
    }
    return null; // percent progress = 0
  };

  const highestReduce = (statusMap, propName, reducer, startVal) => Object.entries(statusMap).map((pair) => pair[1][propName]).reduce(reducer, startVal);
  const higherRunState = (a, b) => StatePrecedence[a] > StatePrecedence[b] ? a : b;
  const highestRunState = statusMap => highestReduce(statusMap, "run_state", higherRunState, STATE_UNKNOWN);
  const higherSecondsLeft = (a, b) => kindOf(a) === "undefined"
    ? a
    : kindOf(b) === "undefined"
      ? b
      : a > b ? a : b;

  const highestSecondsLeft = statusMap => highestReduce(R.filter(isRunning, statusMap), "estimated_time_left_seconds", higherSecondsLeft, null);

  const isRunning = x => x.run_state === STATE_RUNNING;

  const setBadRunState = (statusEntry, state) => {
    statusEntry.reported_run_state = statusEntry.run_state;
    statusEntry.run_state = state;
  };

  const status = async ({libraryId, objectId}) => {
    const client = await context.concerns.Client.get();
    const statusMap = await client.LROStatus({libraryId, objectId}); // TODO: check how offering key is used, if at all

    if(kindOf(statusMap)==="undefined") throw Error("Received no job status information from server - object already finalized?");
    return statusMapProcess(statusMap);
  };

  const statusMapProcess = statusMap => {
    if(kindOf(statusMap)!=="object") throw Error(`statusMap must be an object, got ${kindOf(statusMap)}`);

    // examine each entry, add fields
    for(const [lroKey, statusEntry] of Object.entries(statusMap)) {
      if(statusEntry.run_state === STATE_RUNNING) {
        const start = moment.utc(statusEntry.start).valueOf();
        const now = moment.utc().valueOf();
        const actualElapsedSeconds = Math.round((now - start) / 1000);
        const reportedElapsed = Math.round(statusEntry.duration_ms / 1000);
        const secondsSinceLastUpdate = actualElapsedSeconds - reportedElapsed;
        statusEntry.seconds_since_last_update = secondsSinceLastUpdate;

        // off by more than tolerance?
        if(secondsSinceLastUpdate > MAX_REPORTED_DURATION_TOLERANCE) {
          statusEntry.warning = "status has not been updated in " + secondsSinceLastUpdate + " seconds, process may have terminated";
          logger.warn(statusEntry.warning);
          setBadRunState(statusEntry, STATE_STALLED);
        } else if(safePct(statusEntry) > 100) {
          statusEntry.warning = `Job ${lroKey} has progress > 100`;
          logger.warn(statusEntry.warning);
          setBadRunState(statusEntry, STATE_BAD_PCT);
        } else {
          const secondsLeft = estSecondsLeft(statusEntry);
          if(kindOf(secondsLeft) !== "null") {
            statusEntry.estimated_time_left_seconds = secondsLeft;
            statusEntry.estimated_time_left_h_m_s = etaString(secondsLeft);
          }
        }
      } else {
        if(safePct(statusEntry) !== 100 && statusEntry.run_state === STATE_FINISHED) {
          statusEntry.warning = `Job ${lroKey} has run_state '${STATE_FINISHED}', but progress pct is ${safePct(statusEntry)}`;
          logger.warn(statusEntry.warning);
          setBadRunState(statusEntry, STATE_BAD_PCT);
        }
      }
    }
    return statusMap;
  };

  const warningFound = statusMap => Object.entries(statusMap).findIndex((x) => x.hasOwnProperty("warning")) !== -1;

  const statusSummary = statusMap => {
    const summary = {run_state: highestRunState(statusMap)};
    if(summary.run_state === STATE_RUNNING) {
      summary.estimated_time_left_seconds = highestSecondsLeft(statusMap);
      if(kindOf(summary.estimated_time_left_seconds) !== "undefined") {
        summary.estimated_time_left_h_m_s = etaString(summary.estimated_time_left_seconds);
      }
    }
    return summary;
  };

  return {
    status,
    statusMapProcess,
    statusSummary,
    warningFound
  };
};

module.exports = {
  blueprint,
  New,
  STATE_UNKNOWN,
  STATE_FINISHED,
  STATE_RUNNING,
  STATE_STALLED,
  STATE_BAD_PCT,
  STATE_ERROR,
};