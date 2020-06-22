/* eslint-disable no-console */

// abstract base class for scripts
//
// Properties
//
//   args        Arguments supplied to command, either via command line or via testArgs parameter during instantiation
//   elvClient   An elv-client-js client instance
//

const yargs = require("yargs");
const {ElvClient} = require("../../src/ElvClient");

module.exports = class ScriptBase {
  constructor(testArgs = null) {
    // make sure env var PRIVATE_KEY is set
    if(!process.env.PRIVATE_KEY) {
      throw new Error("Please set environment variable PRIVATE_KEY");
    }

    // if testArgs is present, we are running a test, use testArgs instead of yargs
    if(testArgs) {
      this.args = testArgs;
    } else {
      this.args = this.options().argv;
    }

    // if --configUrl was not passed in, try to read from ../TestConfiguration.json
    if(!this.args.configUrl) {
      const ClientConfiguration = require("../../TestConfiguration.json");
      this.args.configUrl = ClientConfiguration["config-url"];
    }
  }

  // actual work specific to individual script
  async body() {
    throw new Error("call to abstract base class method body()");
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
        privateKey: process.env.PRIVATE_KEY
      });
      await this.elvClient.SetSigner({signer});
      this.elvClient.ToggleLogging(this.args.debug);
    }
    return this.elvClient;
  }

  // default footer
  footer() {
    return "Done.";
  }

  header() {
    throw new Error("call to abstract base class method header()");
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
    return yargs
      .option("debug", {
        describe: "Print debug logging for API calls",
        type: "boolean"
      })
      .option("configUrl", {
        alias: "config-url",
        describe: "URL pointing to the Fabric configuration, enclosed in quotes. e.g. for Eluvio test network: --configUrl \"https://main.net955210.contentfabric.io/config\"",
        type: "string"
      })
      .option("elvGeo", {
        alias: "elv-geo",
        choices: ["eu-west", "na-east", "na-west-north", "na-west-south"],
        describe: "Geographic region for the fabric nodes.",
        type: "string",
      })
      .version(false);
  }

  async run() {
    console.log("\n" + this.header());
    try {
      await this.body();
      console.log(this.footer()+ "\n");
    } catch(err) {
      console.error(err);
    }
  }
};
