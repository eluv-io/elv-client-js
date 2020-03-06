var _classCallCheck = require("@babel/runtime/helpers/classCallCheck");

var _createClass = require("@babel/runtime/helpers/createClass");

// Incremental numerical IDs
var __id = 0;

var Id =
/*#__PURE__*/
function () {
  "use strict";

  function Id() {
    _classCallCheck(this, Id);
  }

  _createClass(Id, null, [{
    key: "next",
    value: function next() {
      __id++;
      return __id;
    }
  }]);

  return Id;
}();

module.exports = Id;