// Object Model basic and common derived types
const Om = require("objectmodel");
const Model = Om.Model;
const ArrayModel = Om.ArrayModel;
const BasicModel = Om.BasicModel;
const ObjectModel = Om.ObjectModel;

const Primitive = BasicModel([Boolean, Number, String, Symbol]).as("Primitive");

// Booleans-like
const Falsy = BasicModel([Primitive, null, undefined]).assert(function isFalsy(x) {
  return !x;
}).as("Falsy");
const Truthy = BasicModel([Primitive, Object]).assert(function isTruthy(x) {
  return !!x;
}).as("Truthy");

// Numbers
const Integer = BasicModel(Number).assert(Number.isInteger).as("Integer");
const SafeInteger = BasicModel(Number).assert(Number.isSafeInteger).as("SafeInteger");
const FiniteNumber = BasicModel(Number).assert(Number.isFinite).as("FiniteNumber");
const PositiveNumber = BasicModel(Number).assert(function isPositive(n) {
  return n > 0;
}).as("PositiveNumber");
const NegativeNumber = BasicModel(Number).assert(function isNegative(n) {
  return n < 0;
}).as("NegativeNumber");
const NonNegativeNumber = BasicModel(Number).assert(function isNonNegative(n) {
  return n >= 0;
}).as("NonNegativeNumber");
const PositiveInteger = PositiveNumber.extend().assert(Number.isInteger).as("PositiveInteger");
const NegativeInteger = NegativeNumber.extend().assert(Number.isInteger).as("NegativeInteger");
const NonNegativeInteger = NonNegativeNumber.extend().assert(Number.isInteger).as("NonNegativeInteger");

// Strings
const NonBlankString = BasicModel(String).assert(function isNotBlank(str) {
  return str.trim().length > 0;
}).as("StringNotBlank");
const NormalizedString = BasicModel(String).assert(function isNormalized(str) {
  return str.normalize() === str;
}).as("NormalizedString");
const TrimmedString = BasicModel(String).assert(function isTrimmed(str) {
  return str.trim() === str;
}).as("TrimmedString");

// Dates
const PastDate = BasicModel(Date).assert(function isInThePast(date) {
  return date.getTime() < Date.now();
}).as("PastDate");
const FutureDate = BasicModel(Date).assert(function isInTheFuture(date) {
  return date.getTime() > Date.now();
}).as("FutureDate");

// Arrays
const ArrayNotEmpty = BasicModel(Array).assert(function isNotEmpty(arr) {
  return arr.length > 0;
}).as("ArrayNotEmpty");
const ArrayUnique = BasicModel(Array).assert(function hasNoDuplicates(arr) {
  return arr.every((x, i) => arr.indexOf(x) === i);
}).as("ArrayUnique");
const ArrayDense = BasicModel(Array).assert(function hasNoHoles(arr) {
  return arr.filter(() => true).length === arr.length;
}).as("ArrayDense");

// Others
const PromiseOf = model => p => BasicModel(Promise)(p).then(x => model(x));

// ==============================================
// Custom Error Collector for models
// ==============================================

const ErrCollect = function(errors, logger=console){
  let errLines = [];
  errors.forEach(error => {
    // eslint-disable-next-line quotes
    if(error.message.indexOf(`assertion "checkType"`)===-1)
      errLines.push(error.message);
  });
  if(errLines.length > 0) {
    logger.warn("Error collector caught these errors:");
    logger.warn(errLines.join("\n"));
  }
};

// Model.prototype.errorCollector = ErrCollect;

// ==============================================
// Support for KVMap schemas (objects where any
// key is allowed but all values must be of same
// type
// ==============================================

function KVMapModelFactory(model) {
  return BasicModel(Object).assert(function checkType(obj) {
    for(const key in obj) {
      if(!model.test(obj[key], ErrCollect)) {
        return false;
      }
    }
    return true;
  });
}

module.exports = {
  Om,
  Model,
  ArrayModel,
  BasicModel,
  ObjectModel,
  Primitive,
  Falsy,
  Truthy,
  Integer,
  SafeInteger,
  FiniteNumber,
  PositiveNumber,
  NegativeNumber,
  NonNegativeNumber,
  PositiveInteger,
  NegativeInteger,
  NonNegativeInteger,
  NonBlankString,
  NormalizedString,
  TrimmedString,
  PastDate,
  FutureDate,
  ArrayNotEmpty,
  ArrayUnique,
  ArrayDense,
  PromiseOf,
  KVMapModelFactory
};
