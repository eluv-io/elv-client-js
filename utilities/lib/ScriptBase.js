// abstract base class for scripts

const R = require("ramda");
const yargs = require("yargs");

const {ElvClient} = require("../../src/ElvClient");
const Logger = require("./Logger");
const {opts, composeOpts, newOpt} = require("./options");

module.exports = class ScriptBase {
  constructor(opts = {}) {
    this.env = R.clone(process.env);

    // check how we were invoked
    if(R.equals(opts, {})) {
      // via command line / shell
      this.args = yargs.options(
        this.options())
        .check(this.checkFunctionFactory(this.OptionsChecks()))
        .strict()
        .version(false)
        .usage("").argv;
    } else {
      // via require()
      if(opts.env) {
        this.env = R.mergeRight(this.env, opts.env);
      }
      if(!Array.isArray(opts.argList)) {
        throw Error("argList must be an Array");
      }
      if(!R.all(x => typeof x === "string", opts.argList)) {
        throw Error("all items in args array must be strings");
      }
      this.args = this.args = yargs.options(
        this.options())
        .check(this.checkFunctionFactory(this.OptionsChecks()))
        .strict()
        .version(false)
        .usage("").parse(opts.argList);
    }

    // make sure env var PRIVATE_KEY is set
    if(!this.env.PRIVATE_KEY) {
      throw Error("Please set environment variable PRIVATE_KEY");
    }

    if(this.args.debugArgs) {
      // eslint-disable-next-line no-console
      console.log(JSON.stringify(this.args, null, 2));
      process.exit(0);
    }

    this.logger = Logger(this.args);
    this.logger.data("args", this.args);

    // if --configUrl was not passed in, try to read from env var
    if(!this.args.configUrl) {
      if(!this.env.FABRIC_CONFIG_URL) {
        throw Error("Please either supply --configUrl or set environment variable FABRIC_CONFIG_URL");
      }
      this.args.configUrl = this.env.FABRIC_CONFIG_URL;
    }
  }

  // actual work specific to individual script
  async body() {
    throw Error("call to abstract base class method body()");
  }

  checkFunctionFactory(checksArray) {
    return (argv, options) => {
      for(const f of checksArray) {
        if(!f(argv, options)) {
          return false;
        }
      }
      return true;
    };
  }

  async client() {
    // get client if we have not already
    if(!this.elvClient) {
      this.elvClient = await ElvClient.FromConfigurationUrl({
        configUrl: this.args.configUrl,
        region: this.args.elvGeo
      });
      let wallet = this.elvClient.GenerateWallet();
      let signer = wallet.AddAccount({
        privateKey: this.env.PRIVATE_KEY
      });
      await this.elvClient.SetSigner({signer});

      this.elvClient.ToggleLogging(
        this.args.debug,
        {
          log: this.logger.log,
          error: this.logger.error,
        }
      );

    }
    return this.elvClient;
  }

  // default footer
  footer() {
    return "Done.";
  }

  header() {
    throw Error("call to abstract base class method header()");
  }

  // Returns yargs to allow extension
  //
  // Subclass this method to add command line options, e.g.:
  //
  // class NewScript extends ScriptBase {
  //    options() {
  //        return this.super()
  //          .option("newArg", {
  //             alias: "new-arg",
  //             demandOption: true,
  //             describe: "My new argument",
  //             type: "string"
  //          }
  //        )
  //    }
  // }
  options() {
    return composeOpts(
      opts.help(),
      opts.debug(),
      opts.configUrl(),
      opts.elvGeo(),
      opts.json(),
      opts.timestamps(),
      newOpt("debugArgs", {
        desc: "print processed arguments and exit without executing",
        hidden: true,
        type: "boolean"
      })
    );
  }

  OptionsChecks() {
    return [];
  }

  run() {
    this.logger.log();
    this.logger.log(this.header());
    this.logger.log();
    this.body().then(successValue => {
      this.logger.log();
      this.logger.log(this.footer());
      this.logger.log();
      // this.logger.data("successValue", successValue);
      this.logger.output_json();
      return successValue;
    }, failureReason => {
      this.logger.error(failureReason);
      process.exitCode = 1;
      this.logger.output_json();
    });
  }
};