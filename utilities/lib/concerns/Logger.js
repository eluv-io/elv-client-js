const util = require("util");

const columnify = require("columnify");
const moment = require("moment");
const R = require("ramda");

const {identity} = require("../helpers");
const {NewOpt} = require("../options");

const blueprint = {
  name: "Logger",
  options: [
    NewOpt("json", {
      descTemplate: "Output results in JSON format",
      group: "Logger",
      type: "boolean"
    }),

    NewOpt("silent", {
      descTemplate: "Suppress logging to stdout",
      group: "Logger",
      type: "boolean"
    }),

    NewOpt("timestamps", {
      alias: "ts",
      descTemplate: "Prefix messages with timestamps",
      group: "Logger",
      type: "boolean"
    }),

    NewOpt("verbose", {
      alias: "v",
      descTemplate: "Print more information on errors",
      group: "Logger",
      type: "boolean"
    })
  ]
};

const New = (context) => {
  // -------------------------------------
  // closures
  // -------------------------------------
  const {json, silent, timestamps, verbose} = context.args;
  const output = {
    data: {},
    errors: [],
    log: [],
    warnings: []
  };

  // -------------------------------------
  // private utility methods
  // -------------------------------------

  // add timestamp prefix to args if specified (and message is not just a blank line)
  const argsWithPrefix = list => timestamps && !isBlankMessage(list)
    ? [moment().format()].concat(list)
    : list;

  // attempt to provide more helpful messages for objects
  const format = (...args) => {
    const prefix = timestamps ? args.shift() + " " : "";

    const item = (args.length === 1 ? args[0] : prefix + util.format(...args));
    let details = [];
    if(item.hasOwnProperty("message")) {
      details.push(`${prefix}${item.message}`);
    }
    if(verbose && item.hasOwnProperty("stack")) {
      details.push(prefix + item.stack);
    }
    if(item.hasOwnProperty("body")) {
      if(verbose) {
        details.push(prefix + JSON.stringify(item.body, null, 2));
      } else {
        details.push((prefix + JSON.stringify(item.body, null, 2)).split("\n").slice(0, 4));
      }

    }
    if(details.length > 0) {
      return details.join("\n");
    }
    return prefix + item;
  };

  const isBlankMessage = (list) => R.equals(list, [""]) || R.equals(list, []);

  // save non-data items to json output
  const jsonConsole = (key, ...args) => {
    if(!isBlankMessage(args)) { // omit empty messages used for whitespace
      output[key].push(format(...args));
    }
  };


  // -------------------------------------
  // interface: console
  // -------------------------------------

  // log error and send to node.js Console or json output object
  const error = (...args) => {
    args = argsWithPrefix(args);
    if(json) {
      jsonConsole("errors", ...args);
    } else {
      // eslint-disable-next-line no-console
      if(!silent) console.error(format(...args));
    }
  };

  // log message and send to node.js Console or json output object
  const log = (...args) => {
    args = argsWithPrefix(args);
    if(json) {
      jsonConsole("log", ...args);
    } else {
      // eslint-disable-next-line no-console
      if(!silent) console.log(...args);
    }
  };

  // log warning and send to node.js Console or json output object
  const warn = (...args) => {
    args = argsWithPrefix(args);
    if(json) {
      jsonConsole("warnings", ...args);
    } else {
      // eslint-disable-next-line no-console
      if(!silent) console.warn(...args);
    }
  };

  // -------------------------------------
  // interface: Logger
  // -------------------------------------

  // set/replace data for a a key in JSON output @ /data/(key)/
  const data = (key, obj) => output.data[key] = obj;

  // set/concat data for a a key in JSON output @ /data/(key)/
  const dataConcat = (key, obj) => {
    if(output.data[key]) {
      output.data[key] = output.data[key].concat(obj);
    } else {
      output.data[key] = obj;
    }
  };

  const dataGet = () => output && output.data;

  const errorList = (...args) => R.map(error, args);

  const errorsAndWarnings = ({errors = [], warnings = []}) => {
    if(warnings.length) {
      log("Warnings:");
      warnList(...warnings);
      log();
    }
    if(errors.length > 0) {
      log("Errors:");
      errorList(...errors);
      log();
    }
  };

  const logList = (...args) => R.map(log, args);

  const logObject = obj => logList(...(JSON.stringify(obj, null, 2).split("\n")));

  // formats a list of objects in tabular format
  const logTable = ({list, options = {}}) => {
    mergedOptions = R.mergeDeepRight(
      {headingTransform: identity},
      options
    );
    logList("",
      ...columnify(list, mergedOptions).split("\n"),
      "");
  };

  // print out json output object (if configured)
  const outputJSON = () => {
    if(json) {
      const lines = JSON.stringify(output, null, 2).split("\n");
      // eslint-disable-next-line no-console
      if(!silent) lines.forEach(x => console.log(x));
    }
  };

  const warnList = (...args) => R.map(warn, args);

  // instance interface
  return {
    data,
    dataConcat,
    dataGet,
    error,
    errorList,
    errorsAndWarnings,
    log,
    logList,
    logObject,
    logTable,
    outputJSON,
    warn,
    warnList
  };
};

module.exports = {
  blueprint,
  New
};
