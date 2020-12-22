const R = require("ramda");
const namedArgs = /{([0-9a-zA-Z_]+)}/g;

module.exports = R.curry(
  (substitutions, stringTemplate) =>
    stringTemplate.replace(
      namedArgs,
      (match, substName) => substitutions.hasOwnProperty(substName) ? substitutions[substName] : ""
    )
);