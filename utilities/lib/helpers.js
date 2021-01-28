const fs = require("fs");
const path = require("path");

const ellipsize = require("ellipsize");
const Fraction = require("fraction.js");
const kindOf = require("kind-of");
const moment = require("moment");
const R = require("ramda");

const Result = require("crocks/Result");
const {Err, Ok} = Result;
const curry = require("crocks/helpers/curry");

// --------------------------------------------
// wait
// --------------------------------------------

const seconds = seconds => new Promise(resolve => setTimeout(resolve, Math.round(seconds * 1000.0)));

// --------------------------------------------
// sorting
// --------------------------------------------

const compare = (a, b) => {
  return a < b
    ? -1
    : a > b
      ? 1
      : 0;
};

// --------------------------------------------
// string processing
// --------------------------------------------

// convert camelCase to kebab-case
const camel2kebab = s => {
  return s
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/([A-Z])([A-Z])(?=[a-z])/g, "$1-$2")
    .toLowerCase();
};

const padStart = width => str => str.padStart(width);

const removeTrailingSlash = str => str.replace(/\/$/, "");

const namedArgs = /{([0-9a-zA-Z_]+)}/g;
// string template replacement
const subst = curry(
  (substitutions, stringTemplate) =>
    stringTemplate.replace(
      namedArgs,
      (match, substName) => substitutions.hasOwnProperty(substName) ? substitutions[substName] : ""
    )
);

// prevent 'null' and 'undefined' from getting put into strings
const suppressNully = x => kindOf(x) === "null" || kindOf(x) === "undefined"
  ? ""
  : x;


// --------------------------------------------
// time formatting
// --------------------------------------------

// Converts seconds to right-aligned string in "##d ##h ##m ##s " format
// Uneeded larger units are omitted, e.g.
//
// etaString(0)      == "             0s"
// etaString(1)      == "             1s"
// etaString(61)     == "         1m 01s"
// etaString(3661)   == "     1h 01m 01s"
// etaString(90061)  == " 1d 01h 01m 01s"
// etaString(954061) == "11d 01h 01m 01s"

const etaString = seconds => {
  const unixTimestamp = moment.unix(seconds).utc();
  let dataStarted = false;
  let pieces = [];

  const days = Math.trunc(seconds / 86400);
  if(days > 0) dataStarted = true;
  pieces.push(dataStarted ? days.toString() + "d" : "");

  const hoursString = unixTimestamp.format(dataStarted ? "HH\\h" : "H\\h");
  dataStarted = dataStarted || hoursString !== "0h";
  pieces.push(dataStarted ? hoursString : "");

  const minutesString = unixTimestamp.format(dataStarted ? "mm\\m" : "m\\m");
  dataStarted = dataStarted || minutesString !== "0m";
  pieces.push(dataStarted ? minutesString : "");

  const secondsString = unixTimestamp.format(dataStarted ? "ss\\s" : "s\\s");
  pieces.push(secondsString);
  return pieces.map(padStart(3)).join(" ");
};

// --------------------------------------------
// path/file processing
// --------------------------------------------

const absPath = (pathStr, workingDir) => path.isAbsolute(pathStr)
  ? pathStr
  : path.isAbsolute(workingDir)
    ? path.resolve(workingDir, pathStr)
    : path.resolve(path.resolve(workingDir), pathStr);

const readFile = (filePath, cwd = ".", logger) => {
  const fullPath = absPath(filePath, cwd);
  if(logger) logger.log(`Reading file ${fullPath}...`);
  return fs.readFileSync(fullPath);
};

const stringOrFileContents = (str, cwd = ".", logger) => str.startsWith("@")
  ? readFile(str.substring(1), cwd, logger)
  : str;


// --------------------------------------------
// logging / debugging
// --------------------------------------------

const jsonCurry = R.curry(JSON.stringify)(R.__, null, 2);
// eslint-disable-next-line no-console
const dumpJson = R.pipe(jsonCurry, console.log);
// eslint-disable-next-line no-console
const dumpKeys = R.pipe(Object.keys, console.log);
// eslint-disable-next-line no-console
const ll = (char = "=") => console.log(char.repeat(30)); // output horizontal line to log
const tapJson = R.tap(dumpJson);

// logging for type: Result

const formattedInspect = (result) => result.inspect().split("\n").map((x) => x.trim()).join(" ");
// eslint-disable-next-line no-console
const dumpResult = R.pipe(formattedInspect, console.log);

// --------------------------------------------
// aspect ratio
// --------------------------------------------

// Returns integer width for a given height and aspect ratio
//
// ratio can be anything that fraction.js will accept,
// but most common case is to pass in a fraction as a string, e.g. "16/9"
const widthForRatioAndHeight = (ratio, h) => Fraction(ratio).mul(h).round(0).valueOf();


// --------------------------------------------
// functional programming helpers
// --------------------------------------------

const identity = x => x;

const join = x => x.either(Err, identity);
const resolve = x => x.either(throwError, identity);

const singleEntryMap = curry((key, value) => Object({[key]: value}));

const throwError = message => {
  throw Error(message);
};

const objUnwrapReducer = (rAccPairs, kvPair) => {
  return join(rAccPairs.map(
    (accPairs) => {
      const [key, rVal] = kvPair;
      return rVal.either(
        (e) => Err(e),
        (val) => Ok([...accPairs, [key, val]])
      );
    }
  ));
};

const objUnwrapValues = obj => R.toPairs(obj).reduce(objUnwrapReducer, Ok([])).map(R.fromPairs);

const resultValue = result => result.either(identity, identity);
const valOrThrow = result => result.either(throwError, identity);

module.exports = {
  absPath,
  camel2kebab,
  compare,
  dumpJson,
  dumpKeys,
  dumpResult,
  ellipsize,
  etaString,
  formattedInspect,
  identity,
  join,
  jsonCurry,
  ll,
  objUnwrapValues,
  padStart,
  readFile,
  removeTrailingSlash,
  resolve,
  resultValue,
  seconds,
  singleEntryMap,
  stringOrFileContents,
  subst,
  suppressNully,
  tapJson,
  throwError,
  valOrThrow,
  widthForRatioAndHeight
};