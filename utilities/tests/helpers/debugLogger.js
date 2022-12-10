/* eslint-disable no-console */

const redact = require("./redact");

const debug = console.debug;

const debugJson = x => console.debug(JSON.stringify(redact(x),null,2));

const group = (...args) => {
  const combined = args.join(" ");
  const dashCount = combined.length > 70 ? 70 : combined.length;
  debug();
  debug("=".repeat(dashCount));
  debug(combined);
  debug("=".repeat(dashCount));
  debug();
  console.group();
};

const groupEnd = console.groupEnd;

module.exports = {
  debug,
  debugJson,
  group,
  groupEnd
};
