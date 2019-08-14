"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

// Incremental numerical IDs
var __id = 0;

var Id =
/*#__PURE__*/
function () {
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