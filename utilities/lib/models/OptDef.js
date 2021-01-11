// Validators used when defining and processing options

const R = require("ramda");

const {
  ArrayModel,
  BasicModel,
  FunctionModel,
  KVMapModelFactory,
  NonBlankString,
  NonBlankStringOrArrayOfSame,
  NonNull,
  CheckedResult,
  SealedModel
} = require("./Models");

// used by both YargsOptModel and OptDefModel
const commonOptFields = {
  alias: [NonBlankStringOrArrayOfSame],
  choices: [ArrayModel(NonNull)],
  conflicts: [NonBlankStringOrArrayOfSame],
  coerce: [FunctionModel(NonNull).return(NonNull)],
  default: [NonNull],
  demand: [Boolean],
  group: [NonBlankString],
  implies: [NonBlankStringOrArrayOfSame],
  normalize: [true],
  number: [true],
  requiresArg: [true],
  string: [true],
  type: [BasicModel(["array", "boolean", "number", "string"])]
};

const optDescFields = {
  descTemplate: NonBlankString,
  forX: [NonBlankString],
  ofX: [NonBlankString],
  X: [NonBlankString]
};

const optDefFields = R.mergeAll([
  commonOptFields,
  optDescFields
]);
const OptDefModel = SealedModel(optDefFields).as("OptDef");
const CheckedOptDef = CheckedResult(OptDefModel);

// for overrides, descTemplate is optional
const optDefOverrideFields = R.mergeAll([
  commonOptFields,
  optDescFields,
  {descTemplate: [NonBlankString]}
]);
const OptDefOverrideModel = SealedModel(optDefOverrideFields).as("OptDefOverride");
const CheckedOptDefOverride = CheckedResult(OptDefOverrideModel);

const OptDefMapModel = KVMapModelFactory(OptDefModel).as("OptDefMap");
const CheckedOptDefMap = CheckedResult(OptDefMapModel);

const yargsOptFields =  R.mergeRight(
  commonOptFields,
  {desc: String}
);
const YargsOptModel = SealedModel(yargsOptFields).as("YargsOpt");
const CheckedYargsOpt = CheckedResult(YargsOptModel);

const YargsOptMapModel = KVMapModelFactory(YargsOptModel).as("YargsOptMap");
const CheckedYargsOptMap = CheckedResult(YargsOptMapModel);

module.exports = {
  OptDefMapModel,
  OptDefModel,
  OptDefOverrideModel,
  yargsOptFields,
  YargsOptModel,
  YargsOptMapModel,
  CheckedOptDef,
  CheckedOptDefMap,
  CheckedOptDefOverride,
  CheckedYargsOpt,
  CheckedYargsOptMap
};
