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

// Regex to substitute $ELV_CLIENT_DIR
// (but not e.g. $ELV_CLIENT_DIR_2, $ELV_CLIENT_DIR-alternate etc.)
// 2 dollar signs in a row indicate escaped $ to include in final output
const ELV_CLIENT_DIR_RE = /(?:[^$]|(\$\$)+|^)(\$ELV_CLIENT_DIR)(?=[^A-Za-z0-9_-]|-+([^A-Za-z0-9_-]|$)|$)/g;

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
    substituteElvClientDir(R.dissoc("include_presets", presetDef))
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

const substituteElvClientDir = R.map(
  val => kindOf(val) === "string"
    ? val.replaceAll(ELV_CLIENT_DIR_RE, ELV_CLIENT_DIR)
    : val
);

const substituteDollars = R.map(
  val => kindOf(val) === "string"
    ? val.replaceAll("$$", "$")
    : val
);

const substituteOneVarXrefs = ({varName, finalVars, visited = []}) => {
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
  const SUBST_VAR_RE = /(?:[^$]|(\$\$)+|^)\$[A-Z0-9_]+([A-Z0-9_-]*[A-Z0-9_]+)*/gi;

  assertString("variable name", varName);
  if(["defaults", "include_presets", "presets"].includes(varName)) throw Error(`Illegal variable name '${varName}'.`);

  assertObject("vars", finalVars);
  if(!finalVars.hasOwnProperty(varName)) throw Error(`Variable not found: ${varName}`);

  assertArray("visited", visited);

  // clone to prevent accidental mutation of original
  let results = R.clone(finalVars);

  if(visited.includes(varName)) throw Error(`substituteOneVarXrefs(): circular reference: ${[visited, varName].flat().join(",")}`);
  const varVal = results[varName];
  if(kindOf(varVal) === "null") return results;

  let finalValPieces = [varVal];
  let done = false;
  while(!done) {
    const match = SUBST_VAR_RE.exec(varVal);
    if(match === null) {
      done = true;
    } else {
      const foundVarExpression = match[0];
      // remove dollar sign to get key
      const foundVarName = foundVarExpression.slice(1);
      const matchIndex = SUBST_VAR_RE.lastIndex;
      const matchStart = matchIndex - foundVarExpression.length;
      // process any substitution variables contained in finalVars[foundVarName] if needed
      results = substituteOneVarXrefs({
        varName: foundVarName,
        finalVars: results,
        visited: [visited, varName].flat()
      });
      // chop up the last element of finalValPieces to substitute in the value
      const foundVarValue = results[foundVarName];
      if(kindOf(foundVarValue) === "null") throw Error(`substitution variable ${foundVarExpression} contains a null value (used in variable: ${varName})`);

      const lastPiece = finalValPieces.pop();
      const charsAlreadyProcessed = varVal.length - lastPiece.length;
      // push remaining unprocessed chars in varVal that are before the found substitution variable (might be empty string)
      finalValPieces.push(
        lastPiece.slice(
          0,
          matchStart - charsAlreadyProcessed
        )
      );
      // push substituted value
      finalValPieces.push(foundVarValue);
      // push remaining chars in varVal after the found substitution variable
      finalValPieces.push(
        lastPiece.slice(
          foundVarName.length + 1 + matchStart - charsAlreadyProcessed,
          varVal.length
        )
      );
    }
  }
  // done processing
  results[varName] = finalValPieces.join("");
  return R.clone(results);
};

// Intended to be run just before executing a utility within an integration test, after all override mechanisms
// have been processed and we have the final map of variables.
// Recursive.
// Returns a clone of object with $var_name references within values replaced by corresponding entry under that key (without the leading '$').
// e.g. "libraryId" : "$mez_lib_id" will be converted to "libraryId": finalVars.mez_lib_id
const substituteVarXrefs = finalVars => {
  let workingCopy = R.clone(finalVars);
  validateItemDef(workingCopy);
  for(const varName of Object.keys(workingCopy)) {
    workingCopy = substituteOneVarXrefs({
      varName,
      finalVars: workingCopy
    });
  }
  return substituteDollars(workingCopy);
};

const validateItemDef = resolvedItemDef => {
  for(const [varName, varVal] in resolvedItemDef) {
    assertString("variable name", varName);
    if(["defaults", "presets", "include_presets"].includes(varName)) throw Error(`Illegal variable name: ${varName}`);
    if(!["null", "string"].includes(kindOf(varVal))) throw Error(`Variable values can only be strings or null, found: ${kindOf(varVal)} (variable: ${varName}, value: ${varVal})`);
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
    dl.debug(JSON.stringify(varFile,null,2));
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
    dl.debug(JSON.stringify(presets,null,2));
    dl.groupEnd();
  }

  if(!varFile.hasOwnProperty("defaults")) throw Error("'defaults' not found in test vars file");
  assertObject("defaults", varFile.defaults);

  // Process '/defaults/include_presets' and also replace "$ELV_CLIENT_DIR" with ELV_CLIENT_DIR
  const defaults = substituteElvClientDir(resolveIncludes(varFile.defaults, presets));

  if(dl){
    dl.group("DEFAULTS AFTER RESOLVING 'include_presets'");
    dl.debug(JSON.stringify(defaults,null,2));
    dl.groupEnd();

    dl.groupEnd();
  }

  return {defaults, presets};
};

module.exports = {
  resolveIncludes,
  substituteElvClientDir,
  substituteVarXrefs,
  validateItemDef,
  varsFromFile
};
