const util = require("util");

const moment = require("moment");
const R = require("ramda");

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
  const output = json
    ? {
      data: {},
      errors: [],
      log: [],
      warnings: []
    }
    : undefined;

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
        details.push((prefix + JSON.stringify(item.body, null, 2)).split("\n").slice(0,4));
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

  // merge an item into JSON output @ /data/(key)/
  const data = (key, obj) => {
    if(json) {
      output.data[key] = obj;
    }
  };

  const dataGet = () => output.data;

  const errorList = (...args) => R.map(error, args);

  const errorsAndWarnings = ({errors, warnings}) => {
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

  // print out json output object (if configured)
  const outputJSON = () => {
    if(json) {
      // eslint-disable-next-line no-console
      if(!silent) console.log(JSON.stringify(output, null, 2));
    }
  };

  const warnList  = (...args) => R.map(warn, args);

  return {
    data,
    dataGet,
    error,
    errorList,
    errorsAndWarnings,
    log,
    logList,
    outputJSON,
    warn,
    warnList
  };
};

module.exports = {blueprint, New};