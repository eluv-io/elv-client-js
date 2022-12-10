// resolves 'include_presets' for vars used by integration tests

const path = require("path");

const kindOf = require("kind-of");
const R = require("ramda");

const {
  assertArray,
  assertObject,
  assertString
} = require("./assertions");

const {cloneMerge} = require("./immutable");
const {ELV_CLIENT_DIR} = require("./paths");
const redact = require("./redact");

const FORBIDDEN_KEYS = [
  "defaults",
  "ELV_CLIENT_DIR",
  "presets"
];

const FORBIDDEN_PRESET_NAMES = [
  "defaults",
  "ELV_CLIENT_DIR",
  "include_presets",
  "presets"
];

const FORBIDDEN_SUBST_VAR_NAMES = [
  "defaults",
  "ELV_CLIENT_DIR",
  "include_presets",
  "presets"
];


// Regex to substitute $ELV_CLIENT_DIR
// (but not e.g. $ELV_CLIENT_DIR_2, $ELV_CLIENT_DIR-alternate etc.)
// 2 dollar signs in a row indicate escaped $ to include in final output
// const ELV_CLIENT_DIR_RE = /(?:[^$]|(\$\$)+|^)(\$ELV_CLIENT_DIR)(?=[^A-Za-z0-9_-]|-+([^A-Za-z0-9_-]|$)|$)/gm;

// Return a copy of .presets from test-vars file with the named preset resolved (e.g. 'include_presets' converted
// to variables, which in turn may be overridden if the named preset also defines variables with the same name(s))
// Recursive, may return with more than one preset resolved if the preset(s) included also use 'include_presets'.
const resolveNamedPreset = ({presetName, presets, visited = []}) => {

  assertString("preset name", presetName);
  if(presetName === "include_presets") throw Error("Illegal preset name 'include_presets'.");

  assertObject("presets", presets);
  if(!presets.hasOwnProperty(presetName)) throw Error(`Preset not found: ${presetName}`);

  assertArray("visited", visited);

  // clone to prevent accidental mutation of original
  let results = R.clone(presets);

  const presetDef = presets[presetName];
  assertObject("preset definition", presetDef);

  // if the preset does not include any other presets, no resolving needed
  if(!presetDef.hasOwnProperty("include_presets")) return results;

  let presetResolvedValues = {};
  // resolve any included other presets first
  const includedPresets = presetDef["include_presets"];
  assertArray("include_presets", includedPresets);

  for(const includedPresetName of includedPresets) {
    if(visited.includes(includedPresetName)) throw Error(`resolveNamedPreset(): circular reference: ${[visited, includedPresetName].flat().join(",")}`);
    // recurse, resolve other preset (if needed) that our requested preset depends on
    results = resolveNamedPreset({
      presetName: includedPresetName,
      presets: results,
      visited: [visited, includedPresetName].flat()
    });
    presetResolvedValues = cloneMerge(presetResolvedValues, results[includedPresetName]);
  }
  // copy other entries besides 'include_presets'
  presetResolvedValues = cloneMerge(
    presetResolvedValues,
    R.dissoc("include_presets", presetDef)
  );

  return cloneMerge(results, {[presetName]: presetResolvedValues});
};

// Pass in .presets from var file, get back a copy with all 'include_presets' references resolved.
// Also validates that variable values are either string or null.
const resolveAllPresets = presets => {
  assertObject("presets", presets);

  // clone original to prevent accidental mutation of original
  let results = R.clone(presets);
  if(results.hasOwnProperty("include_presets")) throw Error("Illegal entry '/presets/include_presets' in test variable set.");

  const presetNames = Object.keys(results);
  for(const presetName of presetNames) {
    results = resolveNamedPreset({
      presetName,
      presets: results
    });
    const resolvedPreset = results[presetName];
    validateItemDef(resolvedPreset);
  }
  return results;
};

// non-recursive - resolvedPresets is already recursively resolved, and has no internal "include_presets" to follow
const resolveIncludes = (itemDef, resolvedPresets) => {
  if(!itemDef.hasOwnProperty("include_presets")) return itemDef;

  let result = {};
  const includedPresets = itemDef["include_presets"];
  assertArray("include_presets", includedPresets);
  for(const presetName of includedPresets) {
    assertString("preset name", presetName);
    if(!resolvedPresets.hasOwnProperty(presetName)) throw Error(`Preset name not found: ${presetName}`);
    result = cloneMerge(result, resolvedPresets[presetName]);
  }
  const ownVars = R.dissoc("include_presets", itemDef);
  const resolvedItemDef = cloneMerge(
    result,
    ownVars
  );
  validateItemDef(resolvedItemDef);
  return resolvedItemDef;
};

const substituteDollars = R.map(
  val => kindOf(val) === "string"
    ? val.replaceAll("$$", "$")
    : val
);

const substituteOneValueXrefs = ({varName, oneValue, finalVars, visited, debugLogger})=> {
  // Regex to match substitution variables:
  //   must start with "$"
  //   the rest must be either letters, digits, dash ("-") or underscore ("_")
  //   cannot start or end with dash ("-")
  //
  // valid:
  //   $f
  //   $__FOO-Bar3__
  //
  // invalid:
  //  $-FOO
  //  $FOO- ("$FOO" will be matched and substituted, trailing dash will be left in place)
  //
  // note also that "$defaults", "$presets", and "$include_presets" are illegal, but those are enforced outside of regex
  //
  // 2 dollar signs in a row indicate escaped dollar sign to include in final output, ignore these
  const SUBST_VAR_RE = /(?<=[^$]|(\$\$)+|^)\$[A-Z0-9_]+([A-Z0-9_-]*[A-Z0-9_]+)*/gmi;

  const dl = debugLogger;

  let workingCopy = R.clone(finalVars);
  dl && dl.debug(`searching for $ expressions in value from ${varName}`);
  let finalValPieces = [oneValue];
  let done = false;
  while(!done) {
    const match = SUBST_VAR_RE.exec(oneValue);
    if(match === null) {
      done = true;
    } else {
      const foundVarExpression = match[0];
      dl && dl.debug(`found ${foundVarExpression}`);

      // remove dollar sign to get key
      const foundVarName = foundVarExpression.slice(1);

      if(!/^[a-z0-9_-]+$/i.test(foundVarName)) throw Error(`Internal error processing substitution variables - bad match '${foundVarExpression}'`);

      const matchIndex = SUBST_VAR_RE.lastIndex;
      const matchStart = matchIndex - foundVarExpression.length;
      // process any substitution variables contained in finalVars[foundVarName] if needed
      workingCopy = substituteOneVarXrefs({
        varName: foundVarName,
        finalVars: workingCopy,
        visited,
        debugLogger
      });
      // chop up the last element of finalValPieces to substitute in the value
      const foundVarValue = workingCopy[foundVarName];
      if(kindOf(foundVarValue) === "null") throw Error(`substitution variable ${foundVarExpression} contains a null value (used in variable: ${varName})`);

      const lastPiece = finalValPieces.pop();
      const charsAlreadyProcessed = oneValue.length - lastPiece.length;
      // push remaining unprocessed chars in varVal that are before the found substitution variable (unless empty string)
      const precedingChars = lastPiece.slice(
        0,
        matchStart - charsAlreadyProcessed
      );
      if(precedingChars.length > 0) finalValPieces.push(precedingChars);
      // push substituted value (might be an array)
      finalValPieces.push(foundVarValue);
      // push remaining chars in varVal after the found substitution variable
      const succeedingChars = lastPiece.slice(
        foundVarName.length + 1 + matchStart - charsAlreadyProcessed,
        oneValue.length
      );
      if(succeedingChars.length > 0) finalValPieces.push(succeedingChars);
    }
  }
  // done matching
  dl && dl.debug(`finished processing $ expressions for value from ${varName}`);
  // check if we have mix of strings an arrays
  const kinds = R.uniq(finalValPieces.map(kindOf));
  if(kinds.length > 1) throw Error(`variable ${varName} contains a mix of strings and arrays after processing $ substitutions`);

  if(kinds[0]==="array") return [finalValPieces.flat(), workingCopy];

  return [finalValPieces.join(""), workingCopy];
};

const substituteOneVarXrefs = ({varName, finalVars, visited = [], debugLogger}) => {

  const dl = debugLogger;

  assertString("variable name", varName);
  if(["defaults", "include_presets", "presets"].includes(varName)) throw Error(`Illegal variable name '${varName}'.`);

  assertObject("vars", finalVars);

  assertArray("visited", visited);

  // clone to prevent accidental mutation of original
  let results = R.clone(finalVars);

  if(visited.includes(varName)) throw Error(`substituteOneVarXrefs(): circular reference: ${[visited, varName].flat().join(",")}`);

  if(!results.hasOwnProperty(varName) && varName !== "ELV_CLIENT_DIR") throw Error(`Variable not found: ${varName}`);

  const varVal = varName === "ELV_CLIENT_DIR"
    ? ELV_CLIENT_DIR.replaceAll("$", "$$")
    : results[varName];

  if(dl){
    const redacted = redact({[varName]: varVal});
    dl.debug(`variable value: ${JSON.stringify(redacted[varName])}`);
  }

  if(kindOf(varVal) === "null") {
    dl && dl.debug("value is null, no substitution needed");
    return results;
  }

  if(kindOf(varVal)==="array"){
    dl && dl.debug("value is an array, processing each element...");
    let newVal = [];
    let newElem = null;
    for(const elem of varVal){
      dl && dl.debug(`processing array item '${elem}'`);
      [newElem, results] = substituteOneValueXrefs({
        varName,
        oneValue: elem,
        finalVars: results,
        debugLogger
      });
      dl && dl.debug(`array item after substitutions: '${newElem}'`);
      newVal.push(newElem);
    }
    results[varName] = newVal;
    dl && dl.debug(`array after substitutions: '${JSON.stringify(newVal)}'`);
  } else {
    let newVal = null;
    [newVal, results] = substituteOneValueXrefs({
      varName,
      oneValue: varVal,
      finalVars: results,
      debugLogger
    });
    results[varName] = newVal;
    if(dl){
      const redacted = redact({[varName]: newVal});
      dl.debug(`variable value after substitutions: ${JSON.stringify(redacted[varName])}`);
    }
  }


  return R.clone(results);
};

// Intended to be run just before executing a utility within an integration test, after all override mechanisms
// have been processed and we have the final map of variables.
// Recursive.
// Returns a clone of object with $var_name references within values replaced by corresponding entry under that key (without the leading '$').
// e.g. "libraryId" : "$mez_lib_id" will be converted to "libraryId": finalVars.mez_lib_id
const substituteVarXrefs = (finalVars, debugLogger = null) => {
  const dl = debugLogger;
  dl && dl.group("SUBSTITUTE VARIABLE CROSS-REFERENCES");
  let workingCopy = R.clone(finalVars);
  dl && dl.debug("validating variable set");
  validateItemDef(workingCopy);
  for(const varName of Object.keys(workingCopy)) {
    if(dl){
      dl.debug(`processing ${varName}`);
      const redacted = redact({[varName]:workingCopy[varName]});
      dl.debug(`initial value ${JSON.stringify(redacted[varName])}`);
    }
    workingCopy = substituteOneVarXrefs({
      varName,
      finalVars: workingCopy,
      debugLogger
    });
    if(dl){
      const redacted = redact({[varName]:workingCopy[varName]});
      dl.debug(`final value for ${varName}: ${JSON.stringify(redacted[varName])}`);
    }
  }
  dl && dl.groupEnd();
  return substituteDollars(workingCopy);
};

const validateItemDef = resolvedItemDef => {
  for(const [varName, varVal] in resolvedItemDef) {
    assertString("variable name", varName);
    if(["defaults", "presets", "include_presets"].includes(varName)) throw Error(`Illegal variable name: ${varName}`);
    if(!["null", "string", "array"].includes(kindOf(varVal))) throw Error(`Variable values can only be strings, arrays of strings, or null, found: ${kindOf(varVal)} (variable: ${varName}, value: ${varVal})`);
    if(kindOf(varVal)==="array"){
      for(const elem of varVal){
        if(kindOf(elem) !== "string") throw Error(`Variable values that are arrays can only contain strings, found: ${kindOf(elem)} (variable: ${varName}, array item: ${elem})`);
      }
    }
  }
};

const varsFromFile = (varFilePath, debugLogger = null) => {
  // Ah, the struggle between clarity and conciseness...
  const dl = debugLogger;

  if(!varFilePath) throw Error("varFilePath missing");
  assertString("varFilePath", varFilePath);
  if(!varFilePath.endsWith(".ignore.js")) throw Error("testVarsFilePath must end with '.ignore.js'");

  const varFileFullPath = path.resolve(process.cwd(), varFilePath);

  if(dl){
    dl.group("Loading variables from file");

    dl.debug(`Current working directory ${process.cwd()}`);
    dl.debug(`test-vars path: ${varFilePath}`);
    dl.debug(`resolved full path: ${varFileFullPath}`);
  }

  const varFile = require(varFileFullPath);
  assertObject("test vars file export", varFile);

  if(dl){
    dl.group(`VARIABLE DEFINITIONS FROM ${varFileFullPath}`);
    dl.debugJson(varFile);
    dl.groupEnd();
  }

  const unrecognizedKeys = Object.keys(varFile).filter(k => !["defaults", "presets"].includes(k));
  if(unrecognizedKeys.length !== 0) throw Error(`Test vars file must only contain "defaults" and "presets" as top level keys. (found: ${unrecognizedKeys})`);

  if(!varFile.hasOwnProperty("presets")) throw Error("'presets' not found in test vars file");
  assertObject("presets", varFile.presets);
  // process '/presets' to resolve cross-references and also replace "$ELV_CLIENT_DIR" with ELV_CLIENT_DIR
  const presets = resolveAllPresets(varFile.presets);

  if(dl){
    dl.group("PRESETS AFTER RESOLVING ALL 'include_presets' ENTRIES");
    dl.debugJson(presets);
    dl.groupEnd();
  }

  if(!varFile.hasOwnProperty("defaults")) throw Error("'defaults' not found in test vars file");
  assertObject("defaults", varFile.defaults);

  // Process '/defaults/include_presets' and also replace "$ELV_CLIENT_DIR" with ELV_CLIENT_DIR
  const defaults = resolveIncludes(varFile.defaults, presets);

  if(dl){
    dl.group("DEFAULTS AFTER RESOLVING 'include_presets'");
    dl.debugJson(defaults);
    dl.groupEnd();

    dl.groupEnd();
  }

  return {defaults, presets};
};

module.exports = {
  resolveIncludes,
  substituteVarXrefs,
  validateItemDef,
  varsFromFile
};
