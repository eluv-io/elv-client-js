const R = require("ramda");
const yargs = require("yargs/yargs");
const yargsTerminalWidth = require("yargs").terminalWidth;

const {loadConcerns} = require("./concerns");
const {callContext, cmdLineContext} = require("./context");
const {BuildWidget} = require("./options");

const Logger = require("./concerns/Logger");

const addNameAndLogger = (blueprint) => {
  return {
    checksMap: blueprint.checksMap ? R.clone(blueprint.checksMap) : undefined,
    concerns: [Logger, R.clone(blueprint.concerns) || []].flat(),
    name: "Utility",
    options: blueprint.options ? R.clone(blueprint.options) : []
  };
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

const chainedArgInfo = envVarMap => {
  if(envVarMap.ELV_ENABLE_CHAINING) {
    const chain_arg_keys = Object.keys(envVarMap).filter(x => x.startsWith("ELV_CHAIN_")).sort();
    const chain_arg_info = chain_arg_keys.map(x => new Object({argName: x.slice(10), argVal: envVarMap[x] }));
    if(chain_arg_keys.length > 0) return chain_arg_info.map(x=>`${x.argName}=${x.argVal}`);
    return nil;
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
    if(!process.exitCode) {
      process.exit(0);
    } else {
      process.exit();
    }
  }

  constructor(params) {
    const blueprintPlus = addNameAndLogger(this.blueprint());

    this.widget = BuildWidget(blueprintPlus);

    this.context = params === undefined
      ? cmdLineContext() // assume invoked at command line
      : callContext(params); // module call

    const chainedArgs = chainedArgInfo(this.context.env);

    let yargsParser = yargs()
      .option("debugArgs", {hidden: true, type: "boolean"})
      .option("chain", {
        hidden: true,
        requiresArg: true,
        string: true,
        type: "array"
      })
      .option("help", {
        desc: "Show help for command line options",
        group: "General",
        type: "boolean"
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
        if(chainedArgs) {
          // eslint-disable-next-line no-console
          console.warn("\nWARNING: Env var ELV_ENABLE_CHAINING is set, this may introduce unwanted arguments, use 'unset ELV_ENABLE_CHAINING' if this was unintended.\n");
          for(const a of chainedArg) {
            // eslint-disable-next-line no-console
            console.warn(`   ${a}`);
          }
          // eslint-disable-next-line no-console
          console.warn();
        }
        throw Error(msg);
      });

    if(this.context.env.ELV_ENABLE_CHAINING) yargsParser = yargsParser.env("ELV_CHAIN");

    this.context.args = yargsParser.parse(this.context.argList);

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

    if(chainedArgs) {
      this.logger.data("arg_chaining_vars", chainedArgs);
      this.logger.logList(
        "",
        "----------------------------------------------------",
        "ELV_ENABLE_CHAINING in use for the following arg(s):",
        ...chainedArgs,
        "----------------------------------------------------"
      );
    }
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
      this.header() + ":",
      ""
    );
    return this.body().then(successValue => {
      this.logger.logList(
        "",
        this.footer(),
        ""
      );
      // this.logger.data("successValue", successValue);
      this.logger.data("exit_code", 0);
      this.logger.data("success_value", successValue);
      this.logger.outputJSON();
      return this.logger.dataGet();
    }, failureReason => {
      this.logger.error(failureReason);
      this.logger.log();
      if(this.env.ELV_THROW_ON_ERROR) throw Error(failureReason);
      if(!process.exitCode) process.exitCode = 1;
      this.logger.data("exit_code", process.exitCode);
      this.logger.data("failure_reason", failureReason);
      this.logger.outputJSON();
      this.logger.error("FAILED!");
      this.logger.log("");
      return this.logger.dataGet();
    });
  }
};