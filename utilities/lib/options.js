const R = require("ramda");

const assign = require("crocks/helpers/assign");
const curry = require("crocks/helpers/curry");
const getProp = require("crocks/Maybe/getProp");
const getPropOr = require("crocks/helpers/getPropOr");
const liftA2 = require("crocks/helpers/liftA2");
const liftA3 = require("crocks/helpers/liftA3");
const map = require("crocks/pointfree/map");
const maybeToResult = require("crocks/Result/maybeToResult");
const Result = require("crocks/Result");
const {Ok} = Result;
const setProp = require("crocks/helpers/setProp");
const unsetProp = require("crocks/helpers/unsetProp");

const kindOf = require("kind-of");
const objectPath = require("object-path");

const {CheckedNonBlankString, CheckedAbsentPropName, CheckedPresentPropName} = require("./models/Models");
const {CheckedWidgetData, EmptyWidgetData} = require("./models/WidgetData");
const {CheckedOptDef, CheckedOptDefMap, CheckedOptDefOverride, yargsOptFields} = require("./models/OptDef");
const {CheckedBlueprint} = require("./models/Blueprint");

const StandardOptions = require("./StandardOptions");

const {
  camel2kebab, compare, join,
  objUnwrapValues, subst,
  valOrThrow
} = require("./helpers");

// =====================================
// utility functions
// =====================================

const fEnsureOptNameAlreadyExists = (rAccOptDefMap, rName) => join(liftA2(CheckedPresentPropName("not found"), rAccOptDefMap, rName));
const fEnsureOptNameNotAlreadyAdded = (rAccOptDefMap, rName) => join(liftA2(CheckedAbsentPropName("already added"), rAccOptDefMap, rName));
const fEnsureIsStdOptName = (rName) => join(map(CheckedPresentPropName("is not a standard option", StandardOptions), rName));
const fGetPropResult = curry((propName, object) => maybeToResult(Error(`property "${propName}" not found.`), getProp(propName, object)));
const fGetStdOption = (optName) => StandardOptions[optName];
const fLiftedAssign = liftA2(assign);
const fLiftedSetProp = liftA3(setProp);
const fLiftedUnsetProp = liftA2(unsetProp);
const fLiftedCheckedOptDef = (rOptDef) => join(map(CheckedOptDef, rOptDef));

// =====================================
// Handlers for option add/modify/delete/standard
// =====================================

const _addStdOpt = curry((accOptDefMap, optName, overrides) => {
  // console.log(`_addStdOpt(${JSON.stringify(accOptDefMap)}, ${JSON.stringify(optName)}, ${JSON.stringify(overrides)})`);
  const rAccOptDefMap = CheckedOptDefMap(accOptDefMap);

  const rSafeNonBlankName = CheckedNonBlankString(optName);
  const rSafeNewName = fEnsureOptNameNotAlreadyAdded(rAccOptDefMap, rSafeNonBlankName);
  const rSafeStdOptName = fEnsureIsStdOptName(rSafeNewName);
  const rStdOption = map(fGetStdOption, rSafeStdOptName);

  const rOverrides = CheckedOptDefOverride(overrides);
  const rStdOptWithOverrides = fLiftedAssign(rOverrides, rStdOption);
  const rValStdOptWithOverrides = fLiftedCheckedOptDef(rStdOptWithOverrides);
  return fLiftedSetProp(rSafeStdOptName, rValStdOptWithOverrides, rAccOptDefMap);
});

const _delOpt = curry((accOptDefMap, optName) => {
  // console.log(`_delOpt(${JSON.stringify(accOptDefMap)}, ${JSON.stringify(optName)})`);
  const rAccOptDefMap = CheckedOptDefMap(accOptDefMap);

  const rSafeNonBlankName = CheckedNonBlankString(optName);
  const rSafeExistingName = fEnsureOptNameAlreadyExists(rAccOptDefMap, rSafeNonBlankName);

  return fLiftedUnsetProp(rSafeExistingName, rAccOptDefMap);
});

const _modOpt = curry((accOptDefMap, optName, overrides) => {
  // console.log(`_modOpt(${JSON.stringify(accOptDefMap)}, ${JSON.stringify(optName)}, ${JSON.stringify(overrides)})`);
  const rAccOptDefMap = CheckedOptDefMap(accOptDefMap);

  const rSafeNonBlankName = CheckedNonBlankString(optName);
  const rSafeExistingName = fEnsureOptNameAlreadyExists(rAccOptDefMap, rSafeNonBlankName);
  const rExistingOptDef = join(liftA2(fGetPropResult, rSafeExistingName, rAccOptDefMap));

  const rOverrides = CheckedOptDefOverride(overrides);
  const rExistingOptWithOverrides = fLiftedAssign(rOverrides, rExistingOptDef);
  const rValOptWithOverrides = fLiftedCheckedOptDef(rExistingOptWithOverrides);
  return fLiftedSetProp(rSafeExistingName, rValOptWithOverrides, rAccOptDefMap);
});

const _newOpt = (accOptDefMap, optName, newOptDef) => {
  // console.log(`_newOpt(${JSON.stringify(accOptDefMap)}, ${JSON.stringify(optName)}, ${JSON.stringify(spec)})`);
  const rAccOptDefMap = CheckedOptDefMap(accOptDefMap);

  const rSafeNonBlankName = CheckedNonBlankString(optName);
  const rSafeNewName = fEnsureOptNameNotAlreadyAdded(rAccOptDefMap, rSafeNonBlankName);

  const rNewOptDef = CheckedOptDef(newOptDef);
  return fLiftedSetProp(rSafeNewName, rNewOptDef, rAccOptDefMap);
};

// =====================================
// Conversion to yargs
// =====================================

// Used to sort [name, spec] pairs
// Forces "Options: (Main)" group to be last
const compareYargsOptKVPairs = (a, b) => {
  const aName = a[0].toUpperCase();
  const bName = b[0].toUpperCase();

  const aGroup = a[1].group === "Options: (Main)"
    ? "Z"
    : a[1].group.toUpperCase();

  const bGroup = b[1].group === "Options: (Main)"
    ? "Z"
    : b[1].group.toUpperCase();

  return aGroup === bGroup
    ? compare(aName, bName) // both are in same group, sort by arg name
    : compare(aGroup, bGroup); // they are in different groups, sort by group name
};

// return desc string created by doing var substitution on descTemplate
const renderDesc = optDef => {
  const descTemplate = optDef.descTemplate || "";
  const forX = optDef.forX ? ` for ${optDef.forX}` : null;
  const ofX = optDef.ofX ? ` of ${optDef.ofX}` : null;
  const X = optDef.X ? ` ${optDef.X}` : null;
  const finalX = forX || ofX || X || "";
  return subst({X: finalX}, descTemplate);
};

// returns an array [...old alias(es), aliasToAdd]
const mergedAliases = curry((aliasToAdd, optDef) => {
  const oldAliases = getPropOr([], "alias", optDef);
  return R.uniq([oldAliases, aliasToAdd].flat());
});

const optDef2YargsOpt = (kvPair) => {
  const [optName, optDef] = kvPair;

  // validate
  const rOptDef = CheckedOptDef(optDef);

  // create description from descTemplate, substituting {forX, ofX} if needed
  const itemsToMerge = {
    desc: join(rOptDef.map(renderDesc))
  };

  // add alias if option is camel-cased
  const kebabCase = camel2kebab(optName);
  if(kebabCase !== optName) {
    itemsToMerge.alias = join(rOptDef.map(mergedAliases(kebabCase)));
  }

  // add string: true if type == "string"
  if(join(rOptDef.map(getPropOr("", "type"))) === "string") {
    itemsToMerge.string = true;
  }

  const oldGroup = join(rOptDef.map(getPropOr(false, "group")));
  itemsToMerge.group = `Options: (${oldGroup ? oldGroup : "Main"})`;

  // set requiresArg if not boolean
  const type = join(rOptDef.map(getPropOr(false, "type")));
  if(type !== "boolean") {
    itemsToMerge.requiresArg = true;
  }
  const rMergedOptDef = rOptDef.map(assign(itemsToMerge));
  // remove props that don't belong in a YargsOpt
  const rYargsOpt = rMergedOptDef.map(R.pick(R.keys(yargsOptFields)));

  return [optName, rYargsOpt];
};

// create a new object with properties added in an order which alphabetizes by group
// then arg name, with "Options (Main)" last
const sortYargsOptMap = R.pipe(
  R.toPairs,
  R.sort(compareYargsOptKVPairs),
  R.fromPairs
);


const OptDefMap2YargsOptMap = (optDefMap) => {
  // validate
  const rOptDefMap = CheckedOptDefMap(optDefMap);
  return rOptDefMap.map((optDefMap) => {
    const kvPairs = R.toPairs(optDefMap);
    const yargsKVPairs = kvPairs.map(optDef2YargsOpt);
    return R.fromPairs(yargsKVPairs);
  });
};

// =====================================
// Compilation and concerns
// =====================================

const reduceOptions = curry((rAccumulator, optionsList) => optionsList.reduce(fOptDefMapReducer, rAccumulator));

const fOptDefMapReducer = (rAccOptDefMap, optFunc) => join(rAccOptDefMap.map(optFunc));

const fConcernsReducer = (rAccWidget, concern) => {
  // console.log("fConcernsReducer: " + concern.blueprint.name);
  const rConcernWidgetData = CheckedWidgetData(WidgetDataFromBlueprint(concern.blueprint));
  const rConcernOptDefMap = rConcernWidgetData.map(getPropOr({}, "optDefMap"));
  const rAccOptDefMap = rAccWidget.map(getPropOr({}, "optDefMap"));
  const mergedOptDefMap = fLiftedAssign(rConcernOptDefMap, rAccOptDefMap);
  const rConcernChecksMap = rConcernWidgetData.map(getPropOr({}, "checksMap"));
  const rAccChecksMap = rAccWidget.map(getPropOr({}, "checksMap"));
  const mergedChecksMap = fLiftedAssign(rConcernChecksMap, rAccChecksMap);
  const rAccWidgetWithMergedOptSpecs = fLiftedSetProp(Ok("optDefMap"), mergedOptDefMap, rAccWidget);
  return fLiftedSetProp(Ok("checksMap"), mergedChecksMap, rAccWidgetWithMergedOptSpecs);
};

const concernsToWidget = (concernArray) => concernArray.reduce(fConcernsReducer, Ok(EmptyWidgetData()));

const WidgetDataFromBlueprint = (blueprint) => {
  // console.log("WidgetDataFromBlueprint called: " + blueprint.concerns.length
  //   + " concern(s), " + blueprint.options.length + " option(s)");

  const rCheckedBlueprint = CheckedBlueprint(blueprint);

  // assemble concerns
  const rConcerns = rCheckedBlueprint.map(getPropOr([], "concerns"));
  const rConcernsWidget = join(rConcerns.map(concernsToWidget));
  const rConcernsOptDefMap = rConcernsWidget.map(getPropOr({}, "optDefMap"));
  const rBlueprintOptions = rCheckedBlueprint.map(getPropOr([], "options"));
  const rBlueprintOptDefMap = join(rBlueprintOptions.map(reduceOptions(rConcernsOptDefMap)));

  const rWidgetWithOptDefMap = fLiftedSetProp(Ok("optDefMap"), rBlueprintOptDefMap, Ok({}));

  const rConcernsChecksMap = rConcernsWidget.map(getPropOr({}, "checksMap"));
  // merge self's checks (if any)
  const rBlueprintChecksMap = rCheckedBlueprint.map(getPropOr({}, "checksMap"));
  const rMergedChecksMap = fLiftedAssign(rBlueprintChecksMap, rConcernsChecksMap);

  const rWidgetWithChecksMap = fLiftedSetProp(Ok("checksMap"), rMergedChecksMap, rWidgetWithOptDefMap);

  const rYargsOptMap = join(rBlueprintOptDefMap.map(OptDefMap2YargsOptMap));
  const rUnwrappedValYargsOptMap = join(rYargsOptMap.map(objUnwrapValues));
  const rSortedYargsOptMap = rUnwrappedValYargsOptMap.map(sortYargsOptMap);
  const rWidgetWithYargsOpts = fLiftedSetProp(Ok("yargsOptMap"), rSortedYargsOptMap, rWidgetWithChecksMap);
  // validate, then either throw error or return
  const rCheckedWidgetData = join(rWidgetWithYargsOpts.map(CheckedWidgetData));
  return valOrThrow(rCheckedWidgetData);
};

const BuildWidget = (blueprint) => {
  const widgetData = WidgetDataFromBlueprint(blueprint);
  const data = () => widgetData;
  return {data};
};

const objectPathList = (obj, parentKeys=[]) => {
  let ret = [];
  for(const [k,v] of R.toPairs(obj)) {
    switch(kindOf(v)) {
      case "object":
        ret.concat(objectPathList(v,[...parentKeys, k]));
        break;
      case "undefined":
      case "null":
        break;
      default:
        ret.concat([...parentKeys, k]);
    }
  }
  return ret;
};

// convert an args object back into a command line arguments list
const argsMapToArgList = (argsMap) => {
  let list = [];
  for(const [k,v] of R.toPairs(argsMap)) {
    if(v !== undefined && v !== null) { // omit any options without values
      if(v !== true) { // skip value for boolean flag values
        switch(kindOf(v)) {
          case "array":
            list.push(`--${k}`);
            list = list.concat(v.map(x=>x.toString()));
            break;
          case "object":
            const pathArrayList = objectPathList(v);
            for(const onePathArray of pathArrayList){
              list.push(`--${k}.${onePathArray.join(".")}`);
              list.push(objectPath.get(v, `${onePathArray}`));
            }
            break;
          default:
            list.push(`--${k}`);
            list.push(`${v}`);
        }
      }
    }
  }
  return list;
};


// The four functions available to use in Blueprint.options array
const DelOpt = (optName) => accOptDefMap => _delOpt(accOptDefMap, optName);
const ModOpt = (optName, overrides) => accOptDefMap => _modOpt(accOptDefMap, optName, overrides);
const NewOpt = (optName, newOptDef) => accOptDefMap => _newOpt(accOptDefMap, optName, newOptDef);
const StdOpt = (optName, overrides = {}) => accOptDefMap => _addStdOpt(accOptDefMap, optName, overrides);

module.exports = {
  argsMapToArgList,
  BuildWidget,
  DelOpt,
  ModOpt,
  NewOpt,
  StdOpt,
  _addStdOpt,
  fConcernsReducer
};
