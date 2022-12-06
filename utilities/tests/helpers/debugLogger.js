/* eslint-disable no-console */

const debug = console.debug;

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
  group,
  groupEnd
};
