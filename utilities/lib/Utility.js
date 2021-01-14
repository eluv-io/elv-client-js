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
      this.logger.data("exit_code", 0);
      this.logger.data("success_value", successValue);
      this.logger.outputJSON();
      return this.logger.dataGet();
    }, failureReason => {
      this.logger.error(failureReason);
      this.logger.log();
      if(this.env.ELV_THROW_ON_ERROR) throw Error(failureReason);
      if(process.exitCode === 0) process.exitCode = 1;
      this.logger.data("exit_code", process.exitCode);
      this.logger.data("failure_reason", failureReason);
      this.logger.outputJSON();
      return this.logger.dataGet();
    });
  }
};