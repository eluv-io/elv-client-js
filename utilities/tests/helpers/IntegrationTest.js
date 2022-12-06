const path = require("path");

const chai = require("chai");
const assert = chai.assert;
const kindOf = require("kind-of");
const R = require("ramda");

const {
  substituteElvClientDir,
  substituteVarXrefs,
  varsFromFile
} = require("./TestVars");

const debugLogger = require("./debugLogger");
const {cloneMerge} = require("../helpers/immutable");

const ELV_CLIENT_DIR = path.resolve(path.join(__dirname, "..", "..", ".."));
const ENV_VAR_REGEX = /[A-Z]+_[A-Z]+(_[A-Z]+)*/;

module.exports = class IntegrationTest {
  static testVarPresets = [];

  constructor({varFilePath, addlVars = {}, debug = false}) {
    this.debug = debug;
    if(this.debug) this.dl = debugLogger;

    this.debug && this.dl.group("INITIALIZING TEST INSTANCE");

    this.varFilePath = varFilePath;
    this.resolvedVarFile = varsFromFile(varFilePath, this.dl);

    // validate testVarPresets defined by test subclass
    this.varsFromPresets = R.reduce(
      (accumulator, presetKey) => {
        if(!this.resolvedVarFile.presets.hasOwnProperty(presetKey)) throw Error(`Bad preset name found in testVarPresets: '${presetKey}' not found`);
        return R.mergeRight(accumulator, this.resolvedVarFile.presets[presetKey]);
      },
      {},
      this.constructor.testVarPresets
    );

    if(this.debug) {
      this.dl.group("MERGED PRESETS INCLUDED BY TEST");
      this.dl.debug(JSON.stringify(this.varsFromPresets, null, 2));
      this.dl.groupEnd();
    }

    this.origTestVars = cloneMerge(this.resolvedVarFile.defaults, this.varsFromPresets);

    if(this.debug) {
      this.dl.group("DEFAULTS + MERGED PRESETS");
      this.dl.debug(JSON.stringify(this.origTestVars, null, 2));
      this.dl.groupEnd();
    }

    this._savedAddlVars = addlVars;

    if(this.debug) {
      this.dl.group("ADDITIONAL VARS PASSED IN TO TEST");
      this.dl.debug(JSON.stringify(this.addlVars, null, 2));
      this.dl.groupEnd();
    }

    this.finalTestVars = cloneMerge(
      this.origTestVars,
      this.addlVars
    );

    if(this.debug) {
      this.dl.group("DEFAULTS + MERGED PRESETS + ADDITIONAL VARS");
      this.dl.debug(JSON.stringify(this.finalTestVars, null, 2));
      this.dl.groupEnd();
    }

    this.debug && this.dl.groupEnd();
  }

  get addlVars() {return R.clone(this._savedAddlVars)}

  get assert() {return assert}

  async checkPrerequisites() {
    return true;
  }

  copyProp(obj, sourcePropName, targetPropName) {
    if(!obj.hasOwnProperty(sourcePropName)) throw Error(`copyProp(): sourcePropName ${sourcePropName} not found in object`);
    obj[targetPropName] = obj[sourcePropName];
  }

  get defaults() {return R.clone(this.resolvedVarFile.defaults)}

  preset(presetName) {
    if(!this.resolvedVarFile.presets.hasOwnProperty(presetName)) throw Error(`Preset '${presetName}' not found`)
    return R.clone(this.resolvedVarFile.presets[presetName]);
  }

  async run() {
    await this.checkPrerequisites();
    return await this.testBody();
  }

  async runTest({testPath, addlVars = {}, debug = this.debug, includeParentAddlVars = true}) {
    const testClass = require(path.resolve(process.cwd(), testPath));
    const mergedAddlVars = includeParentAddlVars
      ? cloneMerge(this.addlVars, addlVars)
      : addlVars;

    return await new testClass({
      varFilePath: this.varFilePath,
      addlVars: mergedAddlVars,
      debug
    }).run()
  }

  async runUtility(utilityName, modifiedVars, addlVarOverrides = {}) {

    this.debug && this.dl.group(`RUN UTILITY: ${utilityName}`);

    if(this.debug) {
      this.dl.group("VARIABLES FOR UTILITY");
      this.dl.debug(JSON.stringify(modifiedVars, null, 2));
      this.dl.groupEnd();

      this.dl.group("ADDITIONAL VARIABLE OVERRIDES PASSED IN TO runUtility()");
      this.dl.debug(JSON.stringify(addlVarOverrides, null, 2));
      this.dl.groupEnd();
    }

    const varsAfterOverrides = cloneMerge(modifiedVars, addlVarOverrides);

    if(this.debug) {
      this.dl.group("VARIABLES + OVERRIDES");
      this.dl.debug(JSON.stringify(varsAfterOverrides, null, 2));
      this.dl.groupEnd();
    }

    // process final variable cross-reference substitutions
    const varsAfterSubs = substituteVarXrefs(substituteElvClientDir(varsAfterOverrides));

    if(this.debug) {
      this.dl.group("AFTER PROCESSING $ VARIABLE SUBSTITUTIONS (VARIABLES + OVERRIDES)");
      this.dl.debug(JSON.stringify(varsAfterOverrides, null, 2));
      this.dl.groupEnd();
    }

    // use any ALL_CAPS_ENTRIES as environment variables
    const env = R.pickBy(
      (v, k) => ENV_VAR_REGEX.test(k),
      varsAfterSubs
    );

    if(this.debug) {
      this.dl.group("FINAL ENV VARS");
      this.dl.debug(JSON.stringify(env, null, 2));
      this.dl.groupEnd();
    }

    // filter out any null values and ALL_CAPS_ENTRIES
    const possibleArgVars = R.pickBy(
      (v, k) => kindOf(v) !== "null" && !ENV_VAR_REGEX.test(k),
      varsAfterSubs
    );

    // get list of args that this utility accepts
    const utilityClass = require(path.join(ELV_CLIENT_DIR, "utilities", utilityName));
    const utilityArgs = utilityClass.argMap();
    const utilityArgNames = Object.keys(utilityArgs);

    if(this.debug) {
      this.dl.group(`COMMAND LINE OPTIONS FOR ${utilityName}`);
      this.dl.debug(JSON.stringify(utilityArgNames.map(x => `--${x}`), null, 2));
      this.dl.groupEnd();
    }

    // pluck matches out of possibleArgVars
    const argsFromVars = R.pick(
      utilityArgNames,
      possibleArgVars
    );

    if(this.debug) {
      this.dl.group("VARIABLES WITH NAMES MATCHING COMMAND LINE OPTIONS");
      this.dl.debug(JSON.stringify(argsFromVars, null, 2));
      this.dl.groupEnd();
    }

    const argList = Object.entries(argsFromVars).map(([k, v]) => [`--${k}`, v]).flat();

    if(this.debug) {
      this.dl.group(`FINAL COMMAND LINE OPTIONS TO PASS TO ${utilityName}`);
      this.dl.debug(JSON.stringify(argList, null, 2));
      this.dl.groupEnd();
    }

    if(this.debug) {
      this.dl.group("Creating utility instance...");
      this.dl.groupEnd();
      this.dl.groupEnd(); // set indent level to zero in case of "Missing required argument" error
    }

    const utilityInstance = new utilityClass({argList, env});

    if(this.debug) {
      this.dl.group(); // restore indent level 1
      this.dl.group("Invoking utility...");
      this.dl.groupEnd();
      this.dl.groupEnd(); // set indent level to zero before exiting method
    }

    const result = await utilityInstance.run();
    if(result.exit_code !== 0) throw result.failure_reason;
    return result;
  }

  async testBody() {throw Error("call to abstract base class method IntegrationTest.testBody()")}

  get testName() {
    const stack = new Error().stack.split("\n");
    for(const line of stack) {
      const filename = line.split("/").slice(-1)[0]
        .split(":")[0];
      if(filename !== path.basename(__filename) && filename.endsWith(".test.js")) {
        return filename.replace(/\.test\.js$/, "");
      }
    }
    throw Error("Could not determine test name from call stack");
  }

  get vars() {return R.clone(this.finalTestVars)}

};
