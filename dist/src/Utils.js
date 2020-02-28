"use strict";

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { if (!(Symbol.iterator in Object(arr) || Object.prototype.toString.call(arr) === "[object Arguments]")) { return; } var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

if (typeof Buffer === "undefined") {
  Buffer = require("buffer/").Buffer;
}

var bs58 = require("bs58");

var BigNumber = require("bignumber.js");

var MultiHash = require("multihashes");

var VarInt = require("varint");
/**
 * @namespace
 * @description This is a utility namespace mostly containing functions for managing
 * multiformat type conversions
 *
 *
 * It can be accessed from ElvClient and FrameClient as client.utils
 */


var Utils = {
  name: "Utils",
  nullAddress: "0x0000000000000000000000000000000000000000",
  weiPerEther: BigNumber("1000000000000000000"),

  /**
   * Convert number or string to BigNumber
   *
   * @param {string | number} value - Value to convert to BigNumber
   *
   * @see https://github.com/MikeMcl/bignumber.js
   *
   * @returns {BigNumber} - Given value as a BigNumber
   */
  ToBigNumber: function ToBigNumber(value) {
    return new BigNumber(value);
  },

  /**
   * Convert wei to ether
   *
   * @param {string | BigNumber} wei - Wei value to convert to ether
   *
   * @see https://github.com/MikeMcl/bignumber.js
   *
   * @returns {BigNumber} - Given value in ether
   */
  WeiToEther: function WeiToEther(wei) {
    wei = new BigNumber(wei);
    return BigNumber(wei).div(Utils.weiPerEther);
  },

  /**
   * Convert ether to wei
   *
   * @param {number | string | BigNumber} ether - Ether value to convert to wei
   *
   * @see https://github.com/MikeMcl/bignumber.js
   *
   * @returns {BigNumber} - Given value in wei
   */
  EtherToWei: function EtherToWei(ether) {
    return BigNumber(ether).times(Utils.weiPerEther);
  },

  /**
   * Convert address to normalized form - lower case with "0x" prefix
   *
   * @param {string} address - Address to format
   *
   * @returns {string} - Formatted address
   */
  FormatAddress: function FormatAddress(address) {
    if (!address || typeof address !== "string") {
      return "";
    }

    if (!address.startsWith("0x")) {
      address = "0x" + address;
    }

    return address.toLowerCase();
  },

  /**
   * Formats a signature into multi-sig
   *
   * @param {string} sig - Hex representation of signature
   *
   * @returns {string} - Multi-sig string representation of signature
   */
  FormatSignature: function FormatSignature(sig) {
    sig = sig.replace("0x", "");
    return "ES256K_" + bs58.encode(Buffer.from(sig, "hex"));
  },

  /**
   * Decode the specified version hash into its component parts
   *
   * @param versionHash
   *
   * @returns {Object} - Components of the version hash.
   */
  DecodeVersionHash: function DecodeVersionHash(versionHash) {
    if (!versionHash.startsWith("hq__")) {
      throw new Error("Invalid version hash: \"".concat(versionHash, "\""));
    }

    versionHash = versionHash.replace("hq__", ""); // Decode base58 payload

    var bytes = MultiHash.fromB58String(versionHash); // Remove 32 byte SHA256 digest

    var digestBytes = bytes.slice(0, 32);
    var digest = digestBytes.toString("hex");
    bytes = bytes.slice(32); // Determine size of varint content size

    var sizeLength = 0;

    while (bytes[sizeLength] >= 128) {
      sizeLength++;
    }

    sizeLength++; // Remove size

    var sizeBytes = bytes.slice(0, sizeLength);
    var size = VarInt.decode(sizeBytes);
    bytes = bytes.slice(sizeLength); // Remaining bytes is object ID

    var objectId = "iq__" + MultiHash.toB58String(bytes); // Part hash is B58 encoded version hash without the ID

    var partHash = "hqp_" + MultiHash.toB58String(Buffer.concat([digestBytes, sizeBytes]));
    return {
      digest: digest,
      size: size,
      objectId: objectId,
      partHash: partHash
    };
  },

  /**
   * Convert contract address to multiformat hash
   *
   * @param {string} address - Address of contract
   *
   * @returns {string} - Hash of contract address
   */
  AddressToHash: function AddressToHash(address) {
    address = address.replace("0x", "");
    return bs58.encode(Buffer.from(address, "hex"));
  },

  /**
   * Convert contract address to content space ID
   *
   * @param {string} address - Address of contract
   *
   * @returns {string} - Content space ID from contract address
   */
  AddressToSpaceId: function AddressToSpaceId(address) {
    return "ispc" + Utils.AddressToHash(address);
  },

  /**
   * Convert contract address to content library ID
   *
   * @param {string} address - Address of contract
   *
   * @returns {string} - Content library ID from contract address
   */
  AddressToLibraryId: function AddressToLibraryId(address) {
    return "ilib" + Utils.AddressToHash(address);
  },

  /**
   * Convert contract address to content object ID
   *
   * @param {string} address - Address of contract
   *
   * @returns {string} - Content object ID from contract address
   */
  AddressToObjectId: function AddressToObjectId(address) {
    return "iq__" + Utils.AddressToHash(address);
  },

  /**
   * Convert any content fabric ID to the corresponding contract address
   *
   * @param {string} hash - Hash to convert to address
   *
   * @returns {string} - Contract address of item
   */
  HashToAddress: function HashToAddress(hash) {
    hash = hash.substr(4);
    return "0x" + bs58.decode(hash).toString("hex");
  },

  /**
   * Compare two addresses to determine if they are the same, regardless of format/capitalization
   *
   * @param firstAddress
   * @param secondAddress
   *
   * @returns {boolean} - Whether or not the addresses match
   */
  EqualAddress: function EqualAddress(firstAddress, secondAddress) {
    if (!firstAddress || !secondAddress) {
      return false;
    }

    return Utils.FormatAddress(firstAddress) === Utils.FormatAddress(secondAddress);
  },

  /**
   * Compare two IDs to determine if the hashes are the same
   * by comparing the contract address they resolve to
   *
   * @param firstHash
   * @param secondHash
   *
   * @returns {boolean} - Whether or not the hashes of the IDs match
   */
  EqualHash: function EqualHash(firstHash, secondHash) {
    if (!firstHash || !secondHash) {
      return false;
    }

    if (firstHash.length <= 4 || secondHash.length <= 4) {
      return false;
    }

    return Utils.HashToAddress(firstHash) === Utils.HashToAddress(secondHash);
  },

  /**
   * Convert the specified string to a bytes32 string
   *
   * @param {string} string - String to format as a bytes32 string
   *
   * @returns {string} - The given string in bytes32 format
   */
  ToBytes32: function ToBytes32(string) {
    var bytes32 = string.split("").map(function (_char) {
      return _char.charCodeAt(0).toString(16);
    }).join("");
    return "0x" + bytes32.slice(0, 64).padEnd(64, "0");
  },
  BufferToArrayBuffer: function BufferToArrayBuffer(buffer) {
    return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
  },
  B64: function B64(str) {
    return Buffer.from(str, "utf-8").toString("base64");
  },
  FromB64: function FromB64(str) {
    return Buffer.from(str, "base64").toString("utf-8");
  },

  /**
   * Decode the given fabric authorization token
   *
   * @param {string} token - The authorization token to decode
   * @return {Object} - Token Info: {qspace_id, qlib_id*, addr, tx_id*, afgh_pk*, signature}
   */
  DecodeAuthorizationToken: function DecodeAuthorizationToken(token) {
    token = decodeURIComponent(token);

    var _token$split = token.split("."),
        _token$split2 = _slicedToArray(_token$split, 2),
        info = _token$split2[0],
        signature = _token$split2[1];

    info = JSON.parse(Utils.FromB64(info));
    return _objectSpread({}, info, {
      signature: signature
    });
  },
  LimitedMap: function LimitedMap(limit, array, f) {
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
  },
  ResponseToJson: function ResponseToJson(response) {
    return regeneratorRuntime.async(function ResponseToJson$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            return _context4.abrupt("return", Utils.ResponseToFormat("json", response));

          case 1:
          case "end":
            return _context4.stop();
        }
      }
    });
  },
  ResponseToFormat: function ResponseToFormat(format, response) {
    return regeneratorRuntime.async(function ResponseToFormat$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            _context5.next = 2;
            return regeneratorRuntime.awrap(response);

          case 2:
            response = _context5.sent;
            _context5.t0 = format.toLowerCase();
            _context5.next = _context5.t0 === "json" ? 6 : _context5.t0 === "text" ? 9 : _context5.t0 === "blob" ? 12 : _context5.t0 === "arraybuffer" ? 15 : _context5.t0 === "formdata" ? 18 : _context5.t0 === "buffer" ? 21 : 24;
            break;

          case 6:
            _context5.next = 8;
            return regeneratorRuntime.awrap(response.json());

          case 8:
            return _context5.abrupt("return", _context5.sent);

          case 9:
            _context5.next = 11;
            return regeneratorRuntime.awrap(response.text());

          case 11:
            return _context5.abrupt("return", _context5.sent);

          case 12:
            _context5.next = 14;
            return regeneratorRuntime.awrap(response.blob());

          case 14:
            return _context5.abrupt("return", _context5.sent);

          case 15:
            _context5.next = 17;
            return regeneratorRuntime.awrap(response.arrayBuffer());

          case 17:
            return _context5.abrupt("return", _context5.sent);

          case 18:
            _context5.next = 20;
            return regeneratorRuntime.awrap(response.formData());

          case 20:
            return _context5.abrupt("return", _context5.sent);

          case 21:
            _context5.next = 23;
            return regeneratorRuntime.awrap(response.buffer());

          case 23:
            return _context5.abrupt("return", _context5.sent);

          case 24:
            return _context5.abrupt("return", response);

          case 25:
          case "end":
            return _context5.stop();
        }
      }
    });
  },

  /**
   * Determine if the given value is cloneable - Data passed in messages must be cloneable
   *
   * @param {*} value - Value to check
   * @returns {boolean} - Whether or not the value is cloneable
   */
  IsCloneable: function IsCloneable(value) {
    if (Object(value) !== value) {
      // Primitive value
      return true;
    }

    switch ({}.toString.call(value).slice(8, -1)) {
      // Class
      case "Boolean":
      case "Number":
      case "String":
      case "Date":
      case "RegExp":
      case "Blob":
      case "FileList":
      case "ImageData":
      case "ImageBitmap":
      case "ArrayBuffer":
        return true;

      case "Array":
      case "Object":
        return Object.keys(value).every(function (prop) {
          return Utils.IsCloneable(value[prop]);
        });

      case "Map":
        return _toConsumableArray(value.keys()).every(Utils.IsCloneable) && _toConsumableArray(value.values()).every(Utils.IsCloneable);

      case "Set":
        return _toConsumableArray(value.keys()).every(Utils.IsCloneable);

      default:
        return false;
    }
  },

  /**
   * Make the given value cloneable if it is not already.
   *
   * Note: this will remove or transform any attributes of the object that are not cloneable (e.g. functions)
   *
   * Transformations:
   * - Buffer: Converted to ArrayBuffer
   * - Error: Converted to string (error.message)
   *
   * @param {*} value - Value to check
   * @returns {*} - Cloneable value
   */
  MakeClonable: function MakeClonable(value) {
    if (Utils.IsCloneable(value)) {
      return value;
    }

    if (Buffer.isBuffer(value)) {
      return Utils.BufferToArrayBuffer(value);
    }

    switch ({}.toString.call(value).slice(8, -1)) {
      // Class
      case "Response":
      case "Function":
        return undefined;

      case "Boolean":
      case "Number":
      case "String":
      case "Date":
      case "RegExp":
      case "Blob":
      case "FileList":
      case "ImageData":
      case "ImageBitmap":
      case "ArrayBuffer":
        return value;

      case "Array":
        return value.map(function (element) {
          return Utils.MakeClonable(element);
        });

      case "Set":
        return new Set(Array.from(value.keys()).map(function (entry) {
          return Utils.MakeClonable(entry);
        }));

      case "Map":
        var cloneableMap = new Map();
        Array.from(value.keys()).forEach(function (key) {
          var cloneable = Utils.MakeClonable(value.get(key));

          if (cloneable) {
            cloneableMap.set(key, cloneable);
          }
        });
        return cloneableMap;

      case "Error":
        return value.message;

      case "Object":
        var cloneableObject = {};
        Object.keys(value).map(function (key) {
          var cloneable = Utils.MakeClonable(value[key]);

          if (cloneable) {
            cloneableObject[key] = cloneable;
          }
        });
        return cloneableObject;

      default:
        return JSON.parse(JSON.stringify(value));
    }
  },
  PLATFORM_NODE: "node",
  PLATFORM_WEB: "web",
  PLATFORM_REACT_NATIVE: "react-native",
  Platform: function Platform() {
    if (typeof navigator !== "undefined" && navigator.product === "ReactNative") {
      return Utils.PLATFORM_REACT_NATIVE;
    } else if (typeof process !== "undefined" && typeof process.versions.node !== "undefined") {
      return Utils.PLATFORM_NODE;
    } else {
      return Utils.PLATFORM_WEB;
    }
  }
};
module.exports = Utils;