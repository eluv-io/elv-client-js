// used by unit tests for /utilities

const path = require("path");

const Utility = require("../../lib/Utility");

const {argList2Params} = require("./params");

const concern = concernName => {
  return require(path.join("..","..","lib","concerns",concernName));
};

const concern2utility = (concernObject, argList) => {

  class TestUtility extends Utility {
    blueprint() {
      return {
        concerns: [concernObject]
      };
    }

    async body() {

    }

    header() {
      return `TestUtility loading concern ${concernObject.blueprint().name}...`;
    }
  }

  return new TestUtility(argList2Params(...argList));
};

module.exports = {concern, concern2utility};
