const kindOf = require("kind-of");
const R = require("ramda");

const REDACT_PATTERNS = [
  /^AWS_KEY$/i, // specific check in case generic "ends with" check gets changed
  /^AWS_SECRET$/i, // specific check in case generic "ends with" check gets changed
  /^PRIVATE_KEY$/i, // specific check in case generic "ends with" check gets changed
  /_KEY$/i, // ends with "_KEY" (case insensitive)
  /_SECRET$/i // ends with "_SECRET" (case insensitive)
];

const shouldRedact = x => REDACT_PATTERNS.find(pattern => pattern.test(x)) !== undefined;

const redact = (value, parentKey = null) => {
  switch(kindOf(value)) {
    case "array":
      return value.map(redact);
    case "object":
      return R.mapObjIndexed((value, key, obj) => redact(value, key), value);
    case "string":
      return shouldRedact(parentKey)
        ? `[REDACTED ...${value.slice(-3)}]`
        : value;
    default:
      return value;
  }
};

module.exports = redact;
