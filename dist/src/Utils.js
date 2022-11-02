var _toConsumableArray = require("@babel/runtime/helpers/toConsumableArray");

var _regeneratorRuntime = require("@babel/runtime/regenerator");

var _asyncToGenerator = require("@babel/runtime/helpers/asyncToGenerator");

var _defineProperty = require("@babel/runtime/helpers/defineProperty");

var _slicedToArray = require("@babel/runtime/helpers/slicedToArray");

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }

if (typeof Buffer === "undefined") {
  Buffer = require("buffer/").Buffer;
}

var bs58 = require("bs58");

var BigNumber = require("bignumber.js")["default"];

var VarInt = require("varint");

var URI = require("urijs");

var Pako = require("pako");

var _require$utils = require("ethers").utils,
    keccak256 = _require$utils.keccak256,
    getAddress = _require$utils.getAddress;
/**
 * @namespace
 * @description This is a utility namespace mostly containing functions for managing
 * multiformat type conversions.
 *
 * Utils can be imported separately from the client:
 *
 * `const Utils = require("@eluvio/elv-client-js/src/Utils)`
 *
 * or
 *
 * `import Utils from "@eluvio/elv-client-js/src/Utils"`
 *
 *
 * It can be accessed from ElvClient and FrameClient as `client.utils`
 */


var Utils = {
  name: "Utils",
  nullAddress: "0x0000000000000000000000000000000000000000",
  weiPerEther: new BigNumber("1000000000000000000"),

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
    return Utils.ToBigNumber(wei).div(Utils.weiPerEther);
  },

  /**
   * Convert ether to wei
   *
   * @param {number | string | BigNumber} ether - Ether value to convert to wei
   *
   * @see https://github.com/indutny/bn.js/
   *
   * @returns {BigNumber} - Given value in wei
   */
  EtherToWei: function EtherToWei(ether) {
    return Utils.ToBigNumber(ether).times(Utils.weiPerEther);
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

    address = address.trim();

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
    if (!(versionHash.startsWith("hq__") || versionHash.startsWith("tq__"))) {
      throw new Error("Invalid version hash: \"".concat(versionHash, "\""));
    }

    versionHash = versionHash.slice(4); // Decode base58 payload

    var bytes = Utils.FromB58(versionHash); // Remove 32 byte SHA256 digest

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

    var objectId = "iq__" + Utils.B58(bytes); // Part hash is B58 encoded version hash without the ID

    var partHash = "hqp_" + Utils.B58(Buffer.concat([digestBytes, sizeBytes]));
    return {
      digest: digest,
      size: size,
      objectId: objectId,
      partHash: partHash
    };
  },

  /**
   * Decode the specified signed token into its component parts
   *
   * @param {string} token - The token to decode
   *
   * @return {Object} - Components of the signed token
   */
  DecodeSignedToken: function DecodeSignedToken(token) {
    var decodedToken = Utils.FromB58(token.slice(6));
    var signature = "0x".concat(decodedToken.slice(0, 65).toString("hex"));
    var payload = JSON.parse(Buffer.from(Pako.inflateRaw(decodedToken.slice(65))).toString("utf-8"));
    payload.adr = Utils.FormatAddress("0x".concat(Buffer.from(payload.adr, "base64").toString("hex")));
    return {
      payload: payload,
      signature: signature
    };
  },

  /**
   * Decode the specified write token into its component parts
   *
   * @param writeToken
   *
   * @returns {Object} - Components of the write token.
   */
  DecodeWriteToken: function DecodeWriteToken(writeToken) {
    /*
    Format:
    - content write token, LRO:
      - prefix: "tq__", "tqw__", "tlro"
      - format:
        prefix + base58(uvarint(len(QID) | QID |
                        uvarint(len(NID) | NID |
                        uvarint(len(RAND_BYTES) | RAND_BYTES)
    - content part write token:
      - prefix: "tqp_"
      - format:
        prefix + base58(scheme | flags | uvarint(len(RAND_BYTES) | RAND_BYTES)
    - content write token v1, content part write token v1:
      - prefix: "tqw_", "tqpw"
      - format:
        prefix + base58(RAND_BYTES)
     */
    if (writeToken.length < 4) {
      throw new Error("Invalid write token: [\"".concat(writeToken, "\"] (unknown prefix)"));
    }

    var tokenType;

    if (writeToken.startsWith("tqw__")) {
      tokenType = "tq__";
      writeToken = writeToken.slice(5);
    } else {
      tokenType = writeToken.slice(0, 4);
      writeToken = writeToken.slice(4);
    }

    if (writeToken.length === 0) {
      throw new Error("Invalid write token: [\"".concat(writeToken, "\"] (too short)"));
    }

    switch (tokenType) {
      case "tqw_":
      case "tq__":
      case "tqpw":
      case "tqp_":
      case "tlro":
        break;

      default:
        throw new Error("Invalid write token: [\"".concat(writeToken, "\"] (unknown prefix)"));
    } // decode base58 payload


    var bytes = Utils.FromB58(writeToken);

    function decodeBytes(isID, prefix) {
      var bsize = VarInt.decode(bytes, 0); // decode: count of bytes to read

      var offset = VarInt.decode.bytes; // offset in buffer to start read after decode

      var theBytes;
      var ret;

      if (isID) {
        theBytes = bytes.slice(offset + 1, bsize + offset); // skip 1st byte (code id) at offset 0

        if (theBytes.length === 0) {
          ret = "";
        } else {
          ret = prefix + Utils.B58(theBytes);
        }
      } else {
        theBytes = bytes.slice(offset, bsize + offset);
        ret = "0x" + theBytes.toString("hex");
      }

      bytes = bytes.slice(bsize + offset);
      return ret;
    }

    var tokenId;
    var qid;
    var nid;
    var scheme;
    var flags;

    switch (tokenType) {
      case "tqw_": // content write token v1

      case "tqpw":
        // content part write token v1
        tokenId = "0x" + bytes.toString("hex");
        break;

      case "tlro": // LRO,

      case "tq__":
        // content write token
        qid = decodeBytes(true, "iq__");
        nid = decodeBytes(true, "inod");
        tokenId = decodeBytes(false, "");
        break;

      case "tqp_":
        // content part write token
        if (bytes.length < 3) {
          throw new Error("Invalid write token: [\"".concat(writeToken, "\"] (token truncated)"));
        }

        scheme = bytes[0];
        flags = bytes[1];
        bytes = bytes.slice(2);
        tokenId = decodeBytes(false, "");
        break;

      default:
        // already raised
        throw new Error("Invalid write token: [\"".concat(writeToken, "\"] (unknown prefix)"));
    }

    return {
      tokenType: tokenType,
      // type of token
      tokenId: tokenId,
      // random bytes generated by the fabric node
      objectId: qid,
      // content id for content write token (tq__) or LRO (tlro)
      nodeId: nid,
      // node id where the content write token is valid (tq__)
      scheme: scheme,
      // encryption scheme for part write token - (tqp_)
      flags: flags // flags for part write token (tqp_)

    };
  },

  /**
   * Convert contract address to multiformat hash
   *
   * @param {string} address - Address of contract
   * @param {boolean} key - Whether or not the first param is a public key. Defaults to address type
   *
   * @returns {string} - Hash of contract address
   */
  AddressToHash: function AddressToHash(address) {
    var key = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
    address = address.replace(key ? "0x04" : "0x", "");
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
   * @param {boolean} key - Whether or not the first param is a key. Defaults to address type
   *
   * @returns {string} - Contract address of item
   */
  HashToAddress: function HashToAddress(hash) {
    var key = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
    hash = key ? hash : hash.substr(4);
    return Utils.FormatAddress((key ? "0x04" : "0x") + bs58.decode(hash).toString("hex"));
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
   * Determine whether the address is valid
   *
   * @param {string} address - Address to validate
   *
   * @returns {boolean} - Whether or not the address is valid
   */
  ValidAddress: function ValidAddress(address) {
    try {
      getAddress(address);
      return true;
    } catch (error) {
      return false;
    }
  },

  /**
   * Determine whether the hash is valid
   *
   * @param {string} hash - Hash to validate
   *
   * @returns {boolean} - Whether or not the hash is valid
   */
  ValidHash: function ValidHash(hash) {
    return Utils.ValidAddress(Utils.HashToAddress(hash));
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
  FromB64URL: function FromB64URL(str) {
    str = str.replace(/-/g, "+").replace(/_/g, "/");
    var pad = str.length % 4;

    if (pad) {
      if (pad === 1) {
        throw new Error("InvalidLengthError: Input base64url string is the wrong length to determine padding");
      }

      str += new Array(5 - pad).join("=");
    }

    return Utils.FromB64(str);
  },
  B58: function B58(arr) {
    return bs58.encode(Buffer.from(arr));
  },
  FromB58: function FromB58(str) {
    return bs58.decode(str);
  },
  FromB58ToStr: function FromB58ToStr(str) {
    return new TextDecoder().decode(Utils.FromB58(str));
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
    return _objectSpread(_objectSpread({}, info), {}, {
      signature: signature
    });
  },
  LimitedMap: function () {
    var _LimitedMap = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee3(limit, array, f) {
      var index, locked, nextIndex, results, active;
      return _regeneratorRuntime.wrap(function _callee3$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              index = 0;
              locked = false;

              nextIndex = /*#__PURE__*/function () {
                var _ref = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee() {
                  var thisIndex;
                  return _regeneratorRuntime.wrap(function _callee$(_context) {
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
                  return _ref.apply(this, arguments);
                };
              }();

              results = [];
              active = 0;
              return _context3.abrupt("return", new Promise(function (resolve, reject) {
                _toConsumableArray(Array(limit || 1)).forEach( /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee2() {
                  var index;
                  return _regeneratorRuntime.wrap(function _callee2$(_context2) {
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
                          return f(array[index], index);

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

    function LimitedMap(_x, _x2, _x3) {
      return _LimitedMap.apply(this, arguments);
    }

    return LimitedMap;
  }(),
  ResponseToJson: function () {
    var _ResponseToJson = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee4(response) {
      return _regeneratorRuntime.wrap(function _callee4$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              return _context4.abrupt("return", Utils.ResponseToFormat("json", response));

            case 1:
            case "end":
              return _context4.stop();
          }
        }
      }, _callee4);
    }));

    function ResponseToJson(_x4) {
      return _ResponseToJson.apply(this, arguments);
    }

    return ResponseToJson;
  }(),
  ResponseToFormat: function () {
    var _ResponseToFormat = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee5(format, response) {
      return _regeneratorRuntime.wrap(function _callee5$(_context5) {
        while (1) {
          switch (_context5.prev = _context5.next) {
            case 0:
              _context5.next = 2;
              return response;

            case 2:
              response = _context5.sent;
              _context5.t0 = format.toLowerCase();
              _context5.next = _context5.t0 === "json" ? 6 : _context5.t0 === "text" ? 9 : _context5.t0 === "blob" ? 12 : _context5.t0 === "arraybuffer" ? 15 : _context5.t0 === "formdata" ? 18 : _context5.t0 === "buffer" ? 21 : 24;
              break;

            case 6:
              _context5.next = 8;
              return response.json();

            case 8:
              return _context5.abrupt("return", _context5.sent);

            case 9:
              _context5.next = 11;
              return response.text();

            case 11:
              return _context5.abrupt("return", _context5.sent);

            case 12:
              _context5.next = 14;
              return response.blob();

            case 14:
              return _context5.abrupt("return", _context5.sent);

            case 15:
              _context5.next = 17;
              return response.arrayBuffer();

            case 17:
              return _context5.abrupt("return", _context5.sent);

            case 18:
              _context5.next = 20;
              return response.formData();

            case 20:
              return _context5.abrupt("return", _context5.sent);

            case 21:
              _context5.next = 23;
              return response.buffer();

            case 23:
              return _context5.abrupt("return", _context5.sent);

            case 24:
              return _context5.abrupt("return", response);

            case 25:
            case "end":
              return _context5.stop();
          }
        }
      }, _callee5);
    }));

    function ResponseToFormat(_x5, _x6) {
      return _ResponseToFormat.apply(this, arguments);
    }

    return ResponseToFormat;
  }(),

  /**
   * Resize the image file or link URL to the specified maximum height. Can also be used to remove
   * max height parameter(s) from a url if height is not specified.
   *
   * @param imageUrl - Url to an image file or link in the Fabric
   * @param {number=} height - The maximum height for the image to be scaled to.
   *
   * @returns {string} - The modified URL with the height parameter
   */
  ResizeImage: function ResizeImage(_ref3) {
    var imageUrl = _ref3.imageUrl,
        height = _ref3.height;

    if (!imageUrl || imageUrl && !imageUrl.startsWith("http")) {
      return imageUrl;
    }

    imageUrl = URI(imageUrl).removeSearch("height").removeSearch("header-x_image_height");

    if (height && !isNaN(parseInt(height))) {
      imageUrl.addSearch("height", parseInt(height));
    }

    return imageUrl.toString();
  },
  SafeTraverse: function SafeTraverse(object) {
    for (var _len = arguments.length, keys = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      keys[_key - 1] = arguments[_key];
    }

    if (!object) {
      return object;
    }

    if (keys.length === 1 && Array.isArray(keys[0])) {
      keys = keys[0];
    }

    var result = object;

    for (var i = 0; i < keys.length; i++) {
      result = result[keys[i]];

      if (result === undefined) {
        return undefined;
      }
    }

    return result;
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

  /**
   * Converts the given string to a public address
   *
   * @param key - Public key to convert to a public address
   *
   * @returns {string} - the public address
   */
  PublicKeyToAddress: function PublicKeyToAddress(key) {
    var keyData = new Uint8Array(Buffer.from(key.replace("0x04", ""), "hex"));
    var keccakHash = keccak256(keyData);
    var address = "0x" + keccakHash.slice(26);
    return Utils.FormatAddress(address);
  },
  PLATFORM_NODE: "node",
  PLATFORM_WEB: "web",
  PLATFORM_REACT_NATIVE: "react-native",
  Platform: function Platform() {
    if (typeof navigator !== "undefined" && navigator.product === "ReactNative") {
      return Utils.PLATFORM_REACT_NATIVE;
    } else if (typeof process !== "undefined" && typeof process.versions !== "undefined" && typeof process.versions.node !== "undefined") {
      return Utils.PLATFORM_NODE;
    } else {
      return Utils.PLATFORM_WEB;
    }
  }
};
module.exports = Utils;