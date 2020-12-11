/* eslint-disable no-console */
const util = require("util");

module.exports = class Logger {
  constructor(json = false) {
    this.json = json;
    this.output = {
      data: {},
      errors: [],
      log: [],
      warnings: []
    };
  }

  // add a data item to JSON output @ /data/(key)/
  data(key, obj) {
    if(this.json) {
      this.output.data[key] = obj;
    }
  }

  // log error and send to node.js Console or json output object
  error(...args) {
    if(this.json) {
      this.json_console("errors", ...args);
    } else {
      console.error(...args);
    }
  }

  // attempt to provide more helpful messages objects
  format(...args) {
    const item = (args.length === 1 ? args[0] : util.format(...args));
    if(item.hasOwnProperty("message")) {
      return item.message;
    }
    if(item.hasOwnProperty("body")) {
      return JSON.stringify(item.body, null, 2);
    }
    return item;
  }
  
  // save non-data items to json output
  json_console(key, ...args) {
    if(args.length !== 0) { // omit empty messages used for whitespace
      this.output[key].push(this.format(...args));
    }
  }

  // log message and send to node.js Console or json output object
  log(...args) {
    if(this.json) {
      this.json_console("log", ...args);
    } else {
      console.log(...args);
    }
  }

  // print out json output object (if configured)
  output_json() {
    if(this.json) {
      console.log(JSON.stringify(this.output, null, 2));
    }
  }
  
  // log warning and send to node.js Console or json output object
  warn(...args) {
    if(this.json) {
      this.json_console("warnings", ...args);
    } else {
      console.log(...args);
    }
  }
};