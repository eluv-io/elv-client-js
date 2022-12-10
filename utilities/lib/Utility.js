// base class for utility scripts

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
    if(!process.exitCode) {
      process.exit(0);
    } else {
      process.exit();
    }
  }

  static argMap() {
    return this.buildWidget(this.blueprintWithNameAndLogger()).data().yargsOptMap;
  }

  static blueprint() {
    throw Error("call to abstract base class method blueprint()");
  }

  static blueprintWithNameAndLogger() {
    return addNameAndLogger(this.blueprint());
  }

  static buildWidget(blueprint) {
    return BuildWidget(blueprint);
  }
  constructor(params) {
    const blueprintPlus = this.constructor.blueprintWithNameAndLogger();
    this.widget = this.constructor.buildWidget(blueprintPlus);

    this.context = params === undefined
      ? cmdLineContext() // assume invoked at command line
      : callContext(params); // module call

    let yargsParser = yargs()
      .option("debugArgs", {hidden: true, type: "boolean"})
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
        throw Error(msg);
      });

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
    this.logger.args(this.args);
  }

  blueprint() {
    return this.constructor.blueprint();
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
      this.logger.exitCode(0);
      this.logger.successValue(successValue);
      this.logger.outputJSON();
      return this.logger.allInfoGet();
    }, failureReason => {
      this.logger.error(failureReason);
      this.logger.log();
      if(this.env.ELV_THROW_ON_ERROR) throw Error(failureReason);
      if(!process.exitCode) process.exitCode = 1;
      this.logger.exitCode(process.exitCode);
      this.logger.failureReason(failureReason);
      this.logger.outputJSON();
      this.logger.error("FAILED!");
      this.logger.log("");
      return this.logger.allInfoGet();
    });
  }
};
