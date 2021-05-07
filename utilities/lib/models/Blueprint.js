// Specifies concerns, options and checksMap for a Concern or Script

const {
  CheckedResult,
  FunctionModel,
  KVMapModelFactory,
  NonBlankString,
  ObjectModel
} = require("./Models");

const OptCheckModel = FunctionModel(Object).return(Boolean);
const OptChecksMapModel = KVMapModelFactory(OptCheckModel);

const BlueprintModel = ObjectModel({
  checksMap: [KVMapModelFactory(OptCheckModel)],
  concerns: [Array],
  name: NonBlankString,
  options: [Array],
});

const CheckedBlueprint = CheckedResult(BlueprintModel);

module.exports = {
  BlueprintModel,
  CheckedBlueprint,
  OptCheckModel,
  OptChecksMapModel
};