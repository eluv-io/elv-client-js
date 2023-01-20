var _regeneratorRuntime = require("@babel/runtime/regenerator");
var _asyncToGenerator = require("@babel/runtime/helpers/asyncToGenerator");
require("buffer");
var bs58 = require("bs58");
var Stream = require("stream");
var Utils = require("./Utils");
if (typeof crypto === "undefined") {
  var _crypto = require("crypto");
  _crypto.getRandomValues = function (arr) {
    return _crypto.randomBytes(arr.length);
  };
  global.crypto = _crypto;
}
var _ElvCrypto;
switch (Utils.Platform()) {
  case Utils.PLATFORM_REACT_NATIVE:
    _ElvCrypto = require("@eluvio/crypto/dist/elv-crypto.bundle.externals")["default"];
    break;
  case Utils.PLATFORM_WEB:
    _ElvCrypto = require("@eluvio/crypto/dist/elv-crypto.bundle.externals")["default"];
    break;
  default:
    _ElvCrypto = require("@eluvio/crypto/dist/elv-crypto.bundle.node")["default"];
    break;
}

/**
 * @namespace
 * @description This namespace contains cryptographic helper methods to encrypt and decrypt
 * data with automatic handling of keys
 */
var Crypto = {
  ElvCrypto: function () {
    var _ElvCrypto2 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee() {
      return _regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) switch (_context.prev = _context.next) {
          case 0:
            _context.prev = 0;
            if (Crypto.elvCrypto) {
              _context.next = 5;
              break;
            }
            _context.next = 4;
            return new _ElvCrypto().init();
          case 4:
            Crypto.elvCrypto = _context.sent;
          case 5:
            return _context.abrupt("return", Crypto.elvCrypto);
          case 8:
            _context.prev = 8;
            _context.t0 = _context["catch"](0);
            // eslint-disable-next-line no-console
            console.error("Error initializing ElvCrypto:");
            // eslint-disable-next-line no-console
            console.error(_context.t0);
          case 12:
          case "end":
            return _context.stop();
        }
      }, _callee, null, [[0, 8]]);
    }));
    function ElvCrypto() {
      return _ElvCrypto2.apply(this, arguments);
    }
    return ElvCrypto;
  }(),
  EncryptedSize: function EncryptedSize(clearSize) {
    var clearBlockSize = 1000000;
    var blocks = Math.floor(clearSize / clearBlockSize);
    var encryptedBlockSize = Crypto.EncryptedBlockSize(clearBlockSize);
    var encryptedFileSize = blocks * encryptedBlockSize;
    if (clearSize % clearBlockSize !== 0) {
      encryptedFileSize += Crypto.EncryptedBlockSize(clearSize % clearBlockSize);
    }
    return encryptedFileSize;
  },
  EncryptedBlockSize: function EncryptedBlockSize(clearSize) {
    var reencrypt = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
    var primaryEncBlockOverhead = 129;
    var targetEncBlockOverhead = 608;
    var MODBYTES_384_58 = 48;
    var clearElementByteSize = 12 * (MODBYTES_384_58 - 1);
    var encElementByteSize = 12 * MODBYTES_384_58;
    var encryptedBlockSize = Math.floor(clearSize / clearElementByteSize) * encElementByteSize;
    if (clearSize % clearElementByteSize !== 0) {
      encryptedBlockSize += encElementByteSize;
    }
    return reencrypt ? encryptedBlockSize + targetEncBlockOverhead : encryptedBlockSize + primaryEncBlockOverhead;
  },
  EncryptConk: function EncryptConk(conk, publicKey) {
    return _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee2() {
      var elvCrypto, _yield$elvCrypto$encr, data, ephemeralKey, tag, cap;
      return _regeneratorRuntime.wrap(function _callee2$(_context2) {
        while (1) switch (_context2.prev = _context2.next) {
          case 0:
            _context2.next = 2;
            return Crypto.ElvCrypto();
          case 2:
            elvCrypto = _context2.sent;
            publicKey = new Uint8Array(Buffer.from(publicKey.replace("0x", ""), "hex"));
            conk = new Uint8Array(Buffer.from(JSON.stringify(conk)));
            _context2.next = 7;
            return elvCrypto.encryptECIES(conk, publicKey);
          case 7:
            _yield$elvCrypto$encr = _context2.sent;
            data = _yield$elvCrypto$encr.data;
            ephemeralKey = _yield$elvCrypto$encr.ephemeralKey;
            tag = _yield$elvCrypto$encr.tag;
            cap = Buffer.concat([Buffer.from(ephemeralKey), Buffer.from(tag), Buffer.from(data)]);
            return _context2.abrupt("return", Utils.B64(cap));
          case 13:
          case "end":
            return _context2.stop();
        }
      }, _callee2);
    }))();
  },
  DecryptCap: function DecryptCap(encryptedCap, privateKey) {
    return _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee3() {
      var elvCrypto, ephemeralKey, tag, data, cap;
      return _regeneratorRuntime.wrap(function _callee3$(_context3) {
        while (1) switch (_context3.prev = _context3.next) {
          case 0:
            _context3.next = 2;
            return Crypto.ElvCrypto();
          case 2:
            elvCrypto = _context3.sent;
            privateKey = new Uint8Array(Buffer.from(privateKey.replace("0x", ""), "hex"));
            encryptedCap = Buffer.from(encryptedCap, "base64");
            ephemeralKey = encryptedCap.slice(0, 65);
            tag = encryptedCap.slice(65, 81);
            data = encryptedCap.slice(81);
            cap = elvCrypto.decryptECIES(new Uint8Array(data), privateKey, new Uint8Array(ephemeralKey), new Uint8Array(tag));
            return _context3.abrupt("return", JSON.parse(Buffer.from(cap).toString()));
          case 10:
          case "end":
            return _context3.stop();
        }
      }, _callee3);
    }))();
  },
  GeneratePrimaryConk: function GeneratePrimaryConk(_ref) {
    return _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee4() {
      var spaceId, objectId, elvCrypto, _elvCrypto$generatePr, secretKey, publicKey, symmetricKey;
      return _regeneratorRuntime.wrap(function _callee4$(_context4) {
        while (1) switch (_context4.prev = _context4.next) {
          case 0:
            spaceId = _ref.spaceId, objectId = _ref.objectId;
            _context4.next = 3;
            return Crypto.ElvCrypto();
          case 3:
            elvCrypto = _context4.sent;
            _elvCrypto$generatePr = elvCrypto.generatePrimaryKeys(), secretKey = _elvCrypto$generatePr.secretKey, publicKey = _elvCrypto$generatePr.publicKey;
            symmetricKey = elvCrypto.generateSymmetricKey().key;
            return _context4.abrupt("return", {
              symm_key: "kpsy".concat(bs58.encode(Buffer.from(symmetricKey))),
              secret_key: "kpsk".concat(bs58.encode(Buffer.from(secretKey))),
              public_key: "kppk".concat(bs58.encode(Buffer.from(publicKey))),
              sid: spaceId,
              qid: objectId
            });
          case 7:
          case "end":
            return _context4.stop();
        }
      }, _callee4);
    }))();
  },
  GenerateTargetConk: function GenerateTargetConk() {
    return _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee5() {
      var elvCrypto, _elvCrypto$generateTa, secretKey, publicKey;
      return _regeneratorRuntime.wrap(function _callee5$(_context5) {
        while (1) switch (_context5.prev = _context5.next) {
          case 0:
            _context5.next = 2;
            return Crypto.ElvCrypto();
          case 2:
            elvCrypto = _context5.sent;
            _elvCrypto$generateTa = elvCrypto.generateTargetKeys(), secretKey = _elvCrypto$generateTa.secretKey, publicKey = _elvCrypto$generateTa.publicKey;
            return _context5.abrupt("return", {
              secret_key: "kpsk".concat(bs58.encode(Buffer.from(secretKey))),
              public_key: "ktpk".concat(bs58.encode(Buffer.from(publicKey)))
            });
          case 5:
          case "end":
            return _context5.stop();
        }
      }, _callee5);
    }))();
  },
  CapToConk: function CapToConk(cap) {
    var keyToBytes = function keyToBytes(key) {
      return new Uint8Array(bs58.decode(key.slice(4)));
    };
    return {
      symmetricKey: keyToBytes(cap.symm_key),
      secretKey: keyToBytes(cap.secret_key),
      publicKey: keyToBytes(cap.public_key)
    };
  },
  EncryptionContext: function EncryptionContext(cap) {
    return _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee6() {
      var elvCrypto, _Crypto$CapToConk, symmetricKey, secretKey, publicKey, context, type;
      return _regeneratorRuntime.wrap(function _callee6$(_context6) {
        while (1) switch (_context6.prev = _context6.next) {
          case 0:
            _context6.next = 2;
            return Crypto.ElvCrypto();
          case 2:
            elvCrypto = _context6.sent;
            _Crypto$CapToConk = Crypto.CapToConk(cap), symmetricKey = _Crypto$CapToConk.symmetricKey, secretKey = _Crypto$CapToConk.secretKey, publicKey = _Crypto$CapToConk.publicKey;
            if (publicKey.length === elvCrypto.PRIMARY_PK_KEY_SIZE) {
              // Primary context
              type = elvCrypto.CRYPTO_TYPE_PRIMARY;
              context = elvCrypto.newPrimaryContext(publicKey, secretKey, symmetricKey);
            } else {
              // Target context
              type = elvCrypto.CRYPTO_TYPE_TARGET;
              context = elvCrypto.newTargetDecryptionContext(secretKey, symmetricKey);
            }
            return _context6.abrupt("return", {
              context: context,
              type: type
            });
          case 6:
          case "end":
            return _context6.stop();
        }
      }, _callee6);
    }))();
  },
  /**
   * Encrypt data with headers
   *
   * @namedParams
   * @param {Object} cap - Encryption "capsule" containing keys
   * @param {ArrayBuffer | Buffer} data - Data to encrypt
   *
   * @returns {Promise<Buffer>} - Decrypted data
   */
  Encrypt: function () {
    var _Encrypt = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee7(cap, data) {
      var stream, dataArray, i, end, encryptedChunks;
      return _regeneratorRuntime.wrap(function _callee7$(_context7) {
        while (1) switch (_context7.prev = _context7.next) {
          case 0:
            _context7.next = 2;
            return Crypto.OpenEncryptionStream(cap);
          case 2:
            stream = _context7.sent;
            if (!(!Buffer.isBuffer(data) && !(data instanceof ArrayBuffer))) {
              _context7.next = 9;
              break;
            }
            _context7.t0 = Buffer;
            _context7.next = 7;
            return new Response(data).arrayBuffer();
          case 7:
            _context7.t1 = _context7.sent;
            data = _context7.t0.from.call(_context7.t0, _context7.t1);
          case 9:
            dataArray = new Uint8Array(data);
            for (i = 0; i < dataArray.length; i += 1000000) {
              end = Math.min(dataArray.length, i + 1000000);
              stream.write(dataArray.slice(i, end));
            }
            stream.end();
            encryptedChunks = [];
            _context7.next = 15;
            return new Promise(function (resolve, reject) {
              stream.on("data", function (chunk) {
                encryptedChunks.push(chunk);
              }).on("finish", function () {
                resolve();
              }).on("error", function (e) {
                reject(e);
              });
            });
          case 15:
            return _context7.abrupt("return", Buffer.concat(encryptedChunks));
          case 16:
          case "end":
            return _context7.stop();
        }
      }, _callee7);
    }));
    function Encrypt(_x, _x2) {
      return _Encrypt.apply(this, arguments);
    }
    return Encrypt;
  }(),
  OpenEncryptionStream: function () {
    var _OpenEncryptionStream = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee8(cap) {
      var elvCrypto, _yield$Crypto$Encrypt, context, stream, cipher;
      return _regeneratorRuntime.wrap(function _callee8$(_context8) {
        while (1) switch (_context8.prev = _context8.next) {
          case 0:
            _context8.next = 2;
            return Crypto.ElvCrypto();
          case 2:
            elvCrypto = _context8.sent;
            _context8.next = 5;
            return Crypto.EncryptionContext(cap);
          case 5:
            _yield$Crypto$Encrypt = _context8.sent;
            context = _yield$Crypto$Encrypt.context;
            stream = new Stream.PassThrough();
            cipher = elvCrypto.createCipher(context);
            return _context8.abrupt("return", stream.pipe(cipher).on("finish", function () {
              context.free();
            }).on("error", function (e) {
              throw Error(e);
            }));
          case 10:
          case "end":
            return _context8.stop();
        }
      }, _callee8);
    }));
    function OpenEncryptionStream(_x3) {
      return _OpenEncryptionStream.apply(this, arguments);
    }
    return OpenEncryptionStream;
  }(),
  /**
   * Decrypt data with headers
   *
   * @namedParams
   * @param {Object} cap - Encryption "capsule" containing keys
   * @param {ArrayBuffer | Buffer} encryptedData - Data to decrypt
   *
   * @returns {Promise<Buffer>} - Decrypted data
   */
  Decrypt: function () {
    var _Decrypt = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee9(cap, encryptedData) {
      var stream, dataArray, i, end, decryptedChunks;
      return _regeneratorRuntime.wrap(function _callee9$(_context9) {
        while (1) switch (_context9.prev = _context9.next) {
          case 0:
            _context9.next = 2;
            return Crypto.OpenDecryptionStream(cap);
          case 2:
            stream = _context9.sent;
            dataArray = new Uint8Array(encryptedData);
            for (i = 0; i < dataArray.length; i += 1000000) {
              end = Math.min(dataArray.length, i + 1000000);
              stream.write(dataArray.slice(i, end));
            }
            stream.end();
            decryptedChunks = [];
            _context9.next = 9;
            return new Promise(function (resolve, reject) {
              stream.on("data", function (chunk) {
                decryptedChunks.push(chunk);
              }).on("finish", function () {
                resolve();
              }).on("error", function (e) {
                reject(e);
              });
            });
          case 9:
            return _context9.abrupt("return", Buffer.concat(decryptedChunks));
          case 10:
          case "end":
            return _context9.stop();
        }
      }, _callee9);
    }));
    function Decrypt(_x4, _x5) {
      return _Decrypt.apply(this, arguments);
    }
    return Decrypt;
  }(),
  OpenDecryptionStream: function () {
    var _OpenDecryptionStream = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee10(cap) {
      var elvCrypto, _yield$Crypto$Encrypt2, context, type, stream, decipher;
      return _regeneratorRuntime.wrap(function _callee10$(_context10) {
        while (1) switch (_context10.prev = _context10.next) {
          case 0:
            _context10.next = 2;
            return Crypto.ElvCrypto();
          case 2:
            elvCrypto = _context10.sent;
            _context10.next = 5;
            return Crypto.EncryptionContext(cap);
          case 5:
            _yield$Crypto$Encrypt2 = _context10.sent;
            context = _yield$Crypto$Encrypt2.context;
            type = _yield$Crypto$Encrypt2.type;
            stream = new Stream.PassThrough();
            decipher = elvCrypto.createDecipher(type, context);
            return _context10.abrupt("return", stream.pipe(decipher).on("finish", function () {
              context.free();
            }).on("error", function (e) {
              throw Error(e);
            }));
          case 11:
          case "end":
            return _context10.stop();
        }
      }, _callee10);
    }));
    function OpenDecryptionStream(_x6) {
      return _OpenDecryptionStream.apply(this, arguments);
    }
    return OpenDecryptionStream;
  }()
};
module.exports = Crypto;