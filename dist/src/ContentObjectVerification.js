var _regeneratorRuntime = require("@babel/runtime/regenerator");

var _asyncToGenerator = require("@babel/runtime/helpers/asyncToGenerator");

function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

var CBOR = require("cbor");

var SJCL = require("sjcl");

var MultiHash = require("multihashes");

var DeepEqual = require("deep-equal");

var Utils = require("./Utils");

var ContentObjectVerification = {
  VerifyContentObject: function VerifyContentObject(_ref) {
    return _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee() {
      var client, libraryId, objectId, versionHash, response, partHash, qpartsResponse, partVerification, qmdHash, metadataPartHash, metadataPartResponse, metadataVerification, metadata, qstructHash, structPartHash, structPartResponse, structVerification;
      return _regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              client = _ref.client, libraryId = _ref.libraryId, objectId = _ref.objectId, versionHash = _ref.versionHash;
              response = {
                hash: versionHash
              };
              partHash = Utils.DecodeVersionHash(versionHash).partHash;
              _context.next = 5;
              return client.QParts({
                libraryId: libraryId,
                objectId: objectId,
                partHash: partHash,
                format: "arrayBuffer"
              }).then(function (response) {
                return Buffer.from(response);
              });

            case 5:
              qpartsResponse = _context.sent;
              partVerification = ContentObjectVerification._VerifyPart({
                partHash: partHash,
                qpartsResponse: qpartsResponse
              });

              if (partVerification.valid) {
                response.qref = {
                  valid: true
                };
              } else {
                response.qref = {
                  valid: false,
                  error: partVerification.error.message
                };
              }

              response.qref.hash = partHash;

              if (!response.qref.valid) {
                _context.next = 32;
                break;
              }

              // Validate Metadata
              qmdHash = partVerification.cbor.QmdHash.value;
              metadataPartHash = "hqp_" + MultiHash.toB58String(qmdHash.slice(1, qmdHash.length));
              _context.next = 14;
              return client.QParts({
                libraryId: libraryId,
                objectId: objectId,
                partHash: metadataPartHash,
                format: "arrayBuffer"
              }).then(function (response) {
                return Buffer.from(response);
              });

            case 14:
              metadataPartResponse = _context.sent;
              metadataVerification = ContentObjectVerification._VerifyPart({
                partHash: metadataPartHash,
                qpartsResponse: metadataPartResponse
              });

              if (metadataVerification.valid) {
                response.qmd = {
                  valid: true
                };
              } else {
                response.qmd = {
                  valid: false,
                  error: metadataVerification.error.message
                };
              }

              response.qmd.hash = metadataPartHash;

              if (!(response.qmd.valid && libraryId)) {
                _context.next = 23;
                break;
              }

              _context.next = 21;
              return client.ContentObjectMetadata({
                libraryId: libraryId,
                objectId: objectId,
                versionHash: partHash.replace("hqp_", "hq__")
              });

            case 21:
              metadata = _context.sent;
              response.qmd.check = ContentObjectVerification._VerifyMetadata({
                metadataCbor: metadataVerification.cbor,
                metadata: metadata
              });

            case 23:
              // Validate Qstruct
              qstructHash = partVerification.cbor.QstructHash.value;
              structPartHash = "hqp_" + MultiHash.toB58String(qstructHash.slice(1, qstructHash.length));
              _context.next = 27;
              return client.QParts({
                libraryId: libraryId,
                objectId: objectId,
                partHash: structPartHash,
                format: "arrayBuffer"
              }).then(function (response) {
                return Buffer.from(response);
              });

            case 27:
              structPartResponse = _context.sent;
              structVerification = ContentObjectVerification._VerifyPart({
                partHash: structPartHash,
                qpartsResponse: structPartResponse
              });

              if (structVerification.valid) {
                response.qstruct = {
                  valid: true
                };
              } else {
                response.qstruct = {
                  valid: false,
                  error: structVerification.error.message
                };
              }

              response.qstruct.hash = structPartHash;

              if (response.qstruct.valid) {
                response.qstruct.parts = ContentObjectVerification._FormatQStruct(structVerification.cbor.Parts);
              }

            case 32:
              response.valid = response.qref.valid && response.qmd.valid && response.qstruct.valid && (!response.qmd.check || response.qmd.check.valid);
              return _context.abrupt("return", response);

            case 34:
            case "end":
              return _context.stop();
          }
        }
      }, _callee);
    }))();
  },
  // Content verification methods //
  _FormatQStruct: function _FormatQStruct(structParts) {
    if (!structParts) {
      return [];
    }

    return structParts.map(function (structPart) {
      return {
        hash: "hqp_" + MultiHash.toB58String(structPart.Hash.value.slice(1, structPart.Hash.length)),
        size: structPart.Size
      };
    });
  },
  _Hash: function _Hash(thing) {
    function fromBits(arr) {
      var out = [],
          bl = SJCL.bitArray.bitLength(arr),
          i,
          tmp;

      for (i = 0; i < bl / 8; i++) {
        if ((i & 3) === 0) {
          tmp = arr[i / 4];
        }

        out.push(tmp >>> 24);
        tmp <<= 8;
      }

      return out;
    }

    function toBits(bytes) {
      var out = [],
          i,
          tmp = 0;

      for (i = 0; i < bytes.length; i++) {
        tmp = tmp << 8 | bytes[i];

        if ((i & 3) === 3) {
          out.push(tmp);
          tmp = 0;
        }
      }

      if (i & 3) {
        out.push(SJCL.bitArray.partial(8 * (i & 3), tmp));
      }

      return out;
    }

    var digest = SJCL.hash.sha256.hash(toBits(thing));
    var bytes = fromBits(digest);
    var out = Buffer.from(bytes, "binary");
    return MultiHash.toB58String(MultiHash.encode(out, "sha2-256"));
  },
  _ParseCBOR: function _ParseCBOR(cborResponse) {
    var buffer = cborResponse.slice(7, cborResponse.length);
    var hex = buffer.toString("hex");
    return CBOR.decodeFirstSync(hex);
  },
  _VerifyPart: function _VerifyPart(_ref2) {
    var partHash = _ref2.partHash,
        qpartsResponse = _ref2.qpartsResponse;

    try {
      if (ContentObjectVerification._Hash(qpartsResponse) !== partHash.replace("hqp_", "")) {
        throw Error("Hashes do not match");
      }

      var cbor = ContentObjectVerification._ParseCBOR(qpartsResponse);

      return {
        valid: true,
        cbor: cbor
      };
    } catch (error) {
      return {
        valid: false,
        error: error
      };
    }
  },
  _VerifyMetadata: function _VerifyMetadata(_ref3) {
    var metadataCbor = _ref3.metadataCbor,
        metadata = _ref3.metadata;

    if (!metadataCbor) {
      metadataCbor = {};
    }

    if (!metadata) {
      metadata = {};
    }

    var response = {
      valid: true,
      invalidValues: []
    };
    var cborKeys = Object.keys(metadataCbor);
    var metadataKeys = Object.keys(metadata); // Find any difference between top level keys

    var differentKeys = cborKeys.filter(function (x) {
      return !metadataKeys.includes(x);
    }).concat(metadataKeys.filter(function (x) {
      return !cborKeys.includes(x);
    }));

    var _iterator = _createForOfIteratorHelper(differentKeys),
        _step;

    try {
      for (_iterator.s(); !(_step = _iterator.n()).done;) {
        var key = _step.value;
        var cborValue = metadataCbor[key];
        var metadataValue = metadata[key];
        response.invalidValues.push({
          key: key,
          cborValue: cborValue,
          metadataValue: metadataValue
        });
      } // Deep comparison of up to 5 keys

    } catch (err) {
      _iterator.e(err);
    } finally {
      _iterator.f();
    }

    var _iterator2 = _createForOfIteratorHelper(Object.keys(metadataCbor).slice(0, 5)),
        _step2;

    try {
      for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
        var fieldToValidate = _step2.value;
        var _cborValue = metadataCbor[fieldToValidate];
        var _metadataValue = metadata[fieldToValidate];

        if (!DeepEqual(_cborValue, _metadataValue)) {
          response.invalidValues.push({
            key: fieldToValidate,
            cborValue: _cborValue,
            metadataValue: _metadataValue
          });
        }
      }
    } catch (err) {
      _iterator2.e(err);
    } finally {
      _iterator2.f();
    }

    if (response.invalidValues.length !== 0) {
      response.valid = false;
    }

    return response;
  }
};
module.exports = ContentObjectVerification;