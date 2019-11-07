"use strict";

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

// Async map - Perform up to `limit` operations simultaneously
var LimitedMap =
/*#__PURE__*/
function () {
  var _ref = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee3(limit, array, f) {
    var index, locked, nextIndex, results, active;
    return regeneratorRuntime.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            index = 0;
            locked = false;

            nextIndex =
            /*#__PURE__*/
            function () {
              var _ref2 = _asyncToGenerator(
              /*#__PURE__*/
              regeneratorRuntime.mark(function _callee() {
                var thisIndex;
                return regeneratorRuntime.wrap(function _callee$(_context) {
                  while (1) {
                    switch (_context.prev = _context.next) {
                      case 0:
                        if (!locked) {
                          _context.next = 5;
                          break;
                        }

                        _context.next = 3;
                        return new Promise(function (resolve) {
                          return setTimeout(resolve, 10);
                        });

                      case 3:
                        _context.next = 0;
                        break;

                      case 5:
                        locked = true;
                        thisIndex = index;
                        index += 1;
                        locked = false;
                        return _context.abrupt("return", thisIndex);

                      case 10:
                      case "end":
                        return _context.stop();
                    }
                  }
                }, _callee);
              }));

              return function nextIndex() {
                return _ref2.apply(this, arguments);
              };
            }();

            results = [];
            active = 0;
            return _context3.abrupt("return", new Promise(function (resolve, reject) {
              _toConsumableArray(Array(limit || 1)).forEach(
              /*#__PURE__*/
              _asyncToGenerator(
              /*#__PURE__*/
              regeneratorRuntime.mark(function _callee2() {
                var index;
                return regeneratorRuntime.wrap(function _callee2$(_context2) {
                  while (1) {
                    switch (_context2.prev = _context2.next) {
                      case 0:
                        active += 1;
                        _context2.next = 3;
                        return nextIndex();

                      case 3:
                        index = _context2.sent;

                      case 4:
                        if (!(index < array.length)) {
                          _context2.next = 19;
                          break;
                        }

                        _context2.prev = 5;
                        _context2.next = 8;
                        return f(array[index]);

                      case 8:
                        results[index] = _context2.sent;
                        _context2.next = 14;
                        break;

                      case 11:
                        _context2.prev = 11;
                        _context2.t0 = _context2["catch"](5);
                        reject(_context2.t0);

                      case 14:
                        _context2.next = 16;
                        return nextIndex();

                      case 16:
                        index = _context2.sent;
                        _context2.next = 4;
                        break;

                      case 19:
                        // When finished and no more workers are active, resolve
                        active -= 1;

                        if (active === 0) {
                          resolve(results);
                        }

                      case 21:
                      case "end":
                        return _context2.stop();
                    }
                  }
                }, _callee2, null, [[5, 11]]);
              })));
            }));

          case 6:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3);
  }));

  return function LimitedMap(_x, _x2, _x3) {
    return _ref.apply(this, arguments);
  };
}();

module.exports = LimitedMap;