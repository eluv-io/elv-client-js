// helper functions used by integration tests for /utilities

const R = require("ramda");

const {assertObject} = require("./assertions");

//
const cloneMerge = (object1, object2) => {
  assertObject("cloneMerge(): object1", object1);
  assertObject("cloneMerge(): object2", object2);
  return R.mergeRight(R.clone(object1), R.clone(object2));
};

module.exports = {
  cloneMerge
};
