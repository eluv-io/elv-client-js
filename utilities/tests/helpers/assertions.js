// simple assertions used by integration tests for /utilities

const kindOf = require("kind-of");
const R = require("ramda");

const assertKind = R.curry((expected, name, value) => {
  const expectedKinds = kindOf(expected) === "string" ? [expected] : expected;
  const kindDesc = (expectedKinds.length === 1 ? "" : "one of ") + expectedKinds.join(",");
  if(!expectedKinds.includes(kindOf(value))) throw Error(`${name} must be ${kindDesc}, instead got: ${kindOf(value)} (${value})`);
});

const assertArray = assertKind("array");

const assertObject = assertKind("object");

const assertString = assertKind("string");

module.exports = {
  assertArray,
  assertKind,
  assertObject,
  assertString
};
