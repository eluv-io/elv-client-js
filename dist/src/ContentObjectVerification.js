var _regeneratorRuntime = require("@babel/runtime/regenerator");

var CBOR = require("cbor");

var SJCL = require("sjcl");

var MultiHash = require("multihashes");

var DeepEqual = require("deep-equal");

var Utils = require("./Utils");

var ContentObjectVerification = {
  VerifyContentObject: function VerifyContentObject(_ref) {
    var client, libraryId, objectId, versionHash, response, partHash, qpartsResponse, partVerification, qmdHash, metadataPartHash, metadataPartResponse, metadataVerification, metadata, qstructHash, structPartHash, structPartResponse, structVerification;
    return _regeneratorRuntime.async(function VerifyContentObject$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            client = _ref.client, libraryId = _ref.libraryId, objectId = _ref.objectId, versionHash = _ref.versionHash;
            response = {
              hash: versionHash
            };
            partHash = Utils.DecodeVersionHash(versionHash).partHash;
            _context.next = 5;
            return _regeneratorRuntime.awrap(client.QParts({
              libraryId: libraryId,
              objectId: objectId,
              partHash: partHash,
              format: "arrayBuffer"
            }).then(function (response) {
              return Buffer.from(response);
            }));

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
            return _regeneratorRuntime.awrap(client.QParts({
              libraryId: libraryId,
              objectId: objectId,
              partHash: metadataPartHash,
              format: "arrayBuffer"
            }).then(function (response) {
              return Buffer.from(response);
            }));

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
            return _regeneratorRuntime.awrap(client.ContentObjectMetadata({
              libraryId: libraryId,
              objectId: objectId,
              versionHash: partHash.replace("hqp_", "hq__")
            }));

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
            return _regeneratorRuntime.awrap(client.QParts({
              libraryId: libraryId,
              objectId: objectId,
              partHash: structPartHash,
              format: "arrayBuffer"
            }).then(function (response) {
              return Buffer.from(response);
            }));

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
    });
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
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = differentKeys[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
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
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator["return"] != null) {
          _iterator["return"]();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }

    var _iteratorNormalCompletion2 = true;
    var _didIteratorError2 = false;
    var _iteratorError2 = undefined;

    try {
      for (var _iterator2 = Object.keys(metadataCbor).slice(0, 5)[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
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
      _didIteratorError2 = true;
      _iteratorError2 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion2 && _iterator2["return"] != null) {
          _iterator2["return"]();
        }
      } finally {
        if (_didIteratorError2) {
          throw _iteratorError2;
        }
      }
    }

    if (response.invalidValues.length !== 0) {
      response.valid = false;
    }

    return response;
  }
};
module.exports = ContentObjectVerification;