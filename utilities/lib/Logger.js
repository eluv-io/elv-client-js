/* eslint-disable no-console */
const util = require("util");

const moment = require("moment");
const R = require("ramda");

// state
let json = false;
let timestamps = false;

let output = {
  data: {},
  errors: [],
  log: [],
  warnings: []
};

const addPrefix = (list) => {
  if(timestamps && !R.equals(list, [""]) && !R.equals(list, [])) {
    list.unshift(moment().format());
  }
};

// add a data item to JSON output @ /data/(key)/
const data = (key, obj) => {
  if(json) {
    output.data[key] = obj;
  }
};

// log error and send to node.js Console or json output object
const error = (...args) => {
  addPrefix(args);
  if(json) {
    json_console("errors", ...args);
  } else {
    console.error(format(args));
  }
};

const error_list = (list) => {
  for(const item of list) {
    error(item);
  }
};

// attempt to provide more helpful messages objects
const format = (...args) => {
  const item = (args.length === 1 ? args[0] : util.format(...args));
  let details = [];
  if(item.hasOwnProperty("message")) {
    details.push(item.message);
  }
  if(item.hasOwnProperty("stack")) {
    details.push(item.stack);
  }
  if(item.hasOwnProperty("body")) {
    details.push(JSON.stringify(item.body, null, 2));
  }
  if(details.length > 0) {
    return details.join("\n");
  }
  return item;
};

// save non-data items to json output
const json_console = (key, ...args) => {
  addPrefix(args);
  if(args.length !== 0) { // omit empty messages used for whitespace
    output[key].push(format(...args));
  }
};

// log message and send to node.js Console or json output object
const log = (...args) => {
  addPrefix(args);
  if(json) {
    json_console("log", ...args);
  } else {
    console.log(...args);
  }
};

const log_list = (list) => {
  for(const item of list) {
    log(item);
  }
};

// print out json output object (if configured)
const output_json = () => {
  if(json) {
    console.log(JSON.stringify(output, null, 2));
  }
  return output;
};

// log warning and send to node.js Console or json output object
const warn = (...args) => {
  addPrefix(args);
  if(json) {
    json_console("warnings", ...args);
  } else {
    console.log(...args);
  }
};

const warn_list = (list) => {
  for(const item of list) {
    warn(item);
  }
};

module.exports = (options) => {
  json = options.json;
  timestamps = options.timestamps;
  return {
    data,
    error,
    error_list,
    log,
    log_list,
    output_json,
    warn,
    warn_list
  };
};
