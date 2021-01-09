const kindOf = require("kind-of");
const R = require("ramda");
const yargs = require("yargs/yargs");
const yargsTerminalWidth = require("yargs").terminalWidth;

const {BuildWidget} = require("./options");

const Logger = require("./concerns/Logger");

const addNameAndLogger = (blueprint) => {
  return {
    checksMap: blueprint.checksMap ? R.clone(blueprint.checksMap) : undefined,
    concerns: [Logger, R.clone(blueprint.concerns) || []].flat(),
    name: "Utility",
    options: R.clone([blueprint.options].flat())
  };
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

const callContext = params => {
  if(!Array.isArray(params.argList)) {
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

const checkFunctionFactory = checksMap => {
  return (argv, options) => {
    for(const key in checksMap) {
      if(!checksMap[key](argv, options)) {
        return false;
      }
    }
    return true;
  };
};

const loadConcerns = (context, concerns) => {
  for(const concern of concerns) {
    // if not already loaded into context
    if(!context.concerns.hasOwnProperty(concern.blueprint.name)) {
      // first load any child concerns recursively
      if(concern.blueprint.concerns) {
        loadConcerns(context, concern.blueprint.concerns);
      }
      if(context.concerns.hasOwnProperty(concern.blueprint.name)) {
        throw Error("LoadConcerns error - child caused parent to load? :" + concern.blueprint.name);
      } else {
        context.concerns[concern.blueprint.name] = concern.New(context);
      }
    }
  }
};

module.exports = class Utility {
  static async cmdLineInvoke(klass) {
    let utility;
    try {
      utility = new klass;
    } catch(e) {
      // eslint-disable-next-line no-console
      console.error(`\n${e.message}\n`);
      if(process.env.ELV_THROW_ON_ERROR) throw e;
      process.exit(1);
    }
    await utility.run();
  }

  constructor(params) {
    const blueprintPlus = addNameAndLogger(this.blueprint());

    this.widget = BuildWidget(blueprintPlus);

    this.context = params === undefined
      ? cmdLineContext() // assume invoked at command line
      : callContext(params); // module call

    this.context.args = yargs()
      .option("debugArgs",{type:"boolean", hidden: true})
      .option("help",{
        desc:  "Show help for command line options",
        group: "General",
        type:"boolean"
      })
      .options(this.widget.data().yargsOptMap)
      .check(checkFunctionFactory(this.widget.data().checksMap))
      .strict()
      .version(false)
      .usage("")
      .wrap(yargsTerminalWidth())
      .fail((msg, err, yargs) => {
        if(err) throw err; // preserve stack
        // eslint-disable-next-line no-console
        if(!this.context.env.ELV_SUPPRESS_USAGE) console.error(yargs.help());
        throw Error(msg);
      })
      .parse(this.context.argList);

    if(this.context.args.debugArgs) {
      // eslint-disable-next-line no-console
      console.log(JSON.stringify(this.context.args, null, 2));
      process.exit(0);
    }

    loadConcerns(this.context, blueprintPlus.concerns);

    // convenience shortcuts
    this.concerns = this.context.concerns;
    this.args = this.context.args;
    this.env = this.context.env;
    this.logger = this.concerns.Logger;
    this.logger.data("args", this.args);
  }

  blueprint() {
    throw Error("call to abstract base class method blueprint()");
  }

  // actual work specific to individual script
  async body() {
    throw Error("call to abstract base class method body()");
  }

  // default footer
  footer() {
    return "Done.";
  }

  header() {
    throw Error("call to abstract base class method header()");
  }

  async run() {
    this.logger.logList(
      "",
      this.header(),
      ""
    );
    return this.body().then(successValue => {
      this.logger.logList(
        "",
        this.footer(),
        ""
      );
      // this.logger.data("successValue", successValue);
      this.logger.outputJSON();
      return successValue;
    }, failureReason => {
      this.logger.error(failureReason);
      this.logger.log();
      if(this.env.ELV_THROW_ON_ERROR) throw Error(failureReason);
      process.exitCode = 1;
      this.logger.outputJSON();
    });
  }
};