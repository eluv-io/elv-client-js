const kindOf = require("kind-of");
const R = require("ramda");

const callContext = params => {
  if(kindOf(params.argList) !== "array") {
    throw Error("argList must be an Array");
  }
  if(!R.all(x => kindOf(x) === "string", params.argList)) {
    throw Error("all items in argList array must be strings");
  }

  if((params.hasOwnProperty("cwd")) && kindOf(params.cwd) !== "string") {
    throw Error("cwd must be a string");
  }

  const context = {
    argList: R.clone(params.argList),
    args: {},
    concerns: {},
    cwd: params.cwd || process.cwd(),
    env: R.clone(process.env)
  };

  if(params.hasOwnProperty("env")) {
    if(kindOf(params.env) !== "object") {
      throw Error("env must be an object");
    }
    context.env = R.mergeRight(context.env, params.env);
  }

  return context;
};

const cmdLineContext = () => {
  return {
    argList: R.clone(process.argv),
    args: {},
    concerns: {},
    cwd: process.cwd(),
    env: R.clone(process.env)
  };
};

const emptyContext = () => {
  return {
    argList: [],
    args: {},
    concerns: {},
    cwd: "",
    env: {}
  };
};

module.exports = {callContext, cmdLineContext, emptyContext};