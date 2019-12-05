"use strict";

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

// Async map - Perform up to `limit` operations simultaneously
var LimitedMap = function LimitedMap(limit, array, f) {
  var index, locked, nextIndex, results, active;
  return regeneratorRuntime.async(function LimitedMap$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          index = 0;
          locked = false;

          nextIndex = function nextIndex() {
            var thisIndex;
            return regeneratorRuntime.async(function nextIndex$(_context) {
              while (1) {
                switch (_context.prev = _context.next) {
                  case 0:
                    if (!locked) {
                      _context.next = 5;
                      break;
                    }

                    _context.next = 3;
                    return regeneratorRuntime.awrap(new Promise(function (resolve) {
                      return setTimeout(resolve, 10);
                    }));

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
            });
          };

          results = [];
          active = 0;
          return _context3.abrupt("return", new Promise(function (resolve, reject) {
            _toConsumableArray(Array(limit || 1)).forEach(function _callee() {
              var index;
              return regeneratorRuntime.async(function _callee$(_context2) {
                while (1) {
                  switch (_context2.prev = _context2.next) {
                    case 0:
                      active += 1;
                      _context2.next = 3;
                      return regeneratorRuntime.awrap(nextIndex());

                    case 3:
                      index = _context2.sent;

                    case 4:
                      if (!(index < array.length)) {
                        _context2.next = 19;
                        break;
                      }

                      _context2.prev = 5;
                      _context2.next = 8;
                      return regeneratorRuntime.awrap(f(array[index], index));

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
                      return regeneratorRuntime.awrap(nextIndex());

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
              }, null, null, [[5, 11]]);
            });
          }));

        case 6:
        case "end":
          return _context3.stop();
      }
    }
  });
};

module.exports = LimitedMap;