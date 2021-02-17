
const {
  CheckedResult,
  NonBlankString,
  TypedArrayNonEmpty
} = require("./Models");


const ChainOutArgModel = TypedArrayNonEmpty(NonBlankString).assert(function isEvenLength(arr) {
  return arr.length % 2 === 0;
});


const CheckedChainOutArg = CheckedResult(ChainOutArgModel);

module.exports = {
  ChainOutArgModel,
  CheckedChainOutArg
};