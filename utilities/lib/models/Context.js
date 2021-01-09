const {
  ArrayModel,
  NonBlankString,
  ObjectModel,
  CheckedResult
} = require("./Models");

const ContextModel = ObjectModel({
  argList: ArrayModel(NonBlankString),
  args: Object,
  concerns: Object,
  cwd: String,
  env: Object
}).as("Context");

const CheckedContext = CheckedResult(ContextModel);

module.exports = {
  CheckedContext,
  ContextModel
};