"use strict";

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

if (typeof Buffer === "undefined") {
  Buffer = require("buffer/").Buffer;
}

var bs58 = require("bs58");

var Stream = require("stream");

var Utils = require("./Utils");

var _ElvCrypto;

switch (Utils.Platform()) {
  case Utils.PLATFORM_WEB:
    if (typeof crypto === "undefined") {
      var _crypto = require("crypto");

      Object.defineProperty(global.self, "crypto", {
        value: {
          getRandomValues: function getRandomValues(arr) {
            return _crypto.randomBytes(arr.length);
          }
        }
      });
    }

    _ElvCrypto = require("@eluvio/crypto/dist/elv-crypto.bundle.js")["default"];
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
    var _ElvCrypto2 = _asyncToGenerator(
    /*#__PURE__*/
    regeneratorRuntime.mark(function _callee() {
      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
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
              console.error("Error initializing ElvCrypto:"); // eslint-disable-next-line no-console

              console.error(_context.t0);

            case 12:
            case "end":
              return _context.stop();
          }
        }
      }, _callee, null, [[0, 8]]);
    }));

    function ElvCrypto() {
      return _ElvCrypto2.apply(this, arguments);
    }

    return ElvCrypto;
  }(),
  EncryptConk: function () {
    var _EncryptConk = _asyncToGenerator(
    /*#__PURE__*/
    regeneratorRuntime.mark(function _callee2(conk, publicKey) {
      var elvCrypto, _ref, data, ephemeralKey, tag, cap;

      return regeneratorRuntime.wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
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
              _ref = _context2.sent;
              data = _ref.data;
              ephemeralKey = _ref.ephemeralKey;
              tag = _ref.tag;
              cap = Buffer.concat([Buffer.from(ephemeralKey), Buffer.from(tag), Buffer.from(data)]);
              return _context2.abrupt("return", Utils.B64(cap));

            case 13:
            case "end":
              return _context2.stop();
          }
        }
      }, _callee2);
    }));

    function EncryptConk(_x, _x2) {
      return _EncryptConk.apply(this, arguments);
    }

    return EncryptConk;
  }(),
  DecryptCap: function () {
    var _DecryptCap = _asyncToGenerator(
    /*#__PURE__*/
    regeneratorRuntime.mark(function _callee3(encryptedCap, privateKey) {
      var elvCrypto, ephemeralKey, tag, data, cap;
      return regeneratorRuntime.wrap(function _callee3$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
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
        }
      }, _callee3);
    }));

    function DecryptCap(_x3, _x4) {
      return _DecryptCap.apply(this, arguments);
    }

    return DecryptCap;
  }(),
  GeneratePrimaryConk: function () {
    var _GeneratePrimaryConk = _asyncToGenerator(
    /*#__PURE__*/
    regeneratorRuntime.mark(function _callee4() {
      var elvCrypto, _elvCrypto$generatePr, secretKey, publicKey, symmetricKey;

      return regeneratorRuntime.wrap(function _callee4$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              _context4.next = 2;
              return Crypto.ElvCrypto();

            case 2:
              elvCrypto = _context4.sent;
              _elvCrypto$generatePr = elvCrypto.generatePrimaryKeys(), secretKey = _elvCrypto$generatePr.secretKey, publicKey = _elvCrypto$generatePr.publicKey;
              symmetricKey = elvCrypto.generateSymmetricKey().key;
              return _context4.abrupt("return", {
                symm_key: "kpsy".concat(bs58.encode(Buffer.from(symmetricKey))),
                secret_key: "kpsk".concat(bs58.encode(Buffer.from(secretKey))),
                public_key: "kppk".concat(bs58.encode(Buffer.from(publicKey)))
              });

            case 6:
            case "end":
              return _context4.stop();
          }
        }
      }, _callee4);
    }));

    function GeneratePrimaryConk() {
      return _GeneratePrimaryConk.apply(this, arguments);
    }

    return GeneratePrimaryConk;
  }(),
  GenerateTargetConk: function () {
    var _GenerateTargetConk = _asyncToGenerator(
    /*#__PURE__*/
    regeneratorRuntime.mark(function _callee5() {
      var elvCrypto, _elvCrypto$generateTa, secretKey, publicKey;

      return regeneratorRuntime.wrap(function _callee5$(_context5) {
        while (1) {
          switch (_context5.prev = _context5.next) {
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
        }
      }, _callee5);
    }));

    function GenerateTargetConk() {
      return _GenerateTargetConk.apply(this, arguments);
    }

    return GenerateTargetConk;
  }(),
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
  EncryptionContext: function () {
    var _EncryptionContext = _asyncToGenerator(
    /*#__PURE__*/
    regeneratorRuntime.mark(function _callee6(cap) {
      var elvCrypto, _Crypto$CapToConk, symmetricKey, secretKey, publicKey, context, type;

      return regeneratorRuntime.wrap(function _callee6$(_context6) {
        while (1) {
          switch (_context6.prev = _context6.next) {
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
        }
      }, _callee6);
    }));

    function EncryptionContext(_x5) {
      return _EncryptionContext.apply(this, arguments);
    }

    return EncryptionContext;
  }(),

  /**
   * Encrypt data with headers
   *
   * @namedParams
   * @param {ArrayBuffer | Buffer} data - Data to encrypt
   * @param {Object} cap - Encryption "capsule" containing keys
   *
   * @returns {Promise<Buffer>} - Encrypted data
   */
  Encrypt: function () {
    var _Encrypt = _asyncToGenerator(
    /*#__PURE__*/
    regeneratorRuntime.mark(function _callee7(cap, data) {
      var elvCrypto, _ref2, context, dataArray, encryptedData, encryptedDataBuffer;

      return regeneratorRuntime.wrap(function _callee7$(_context7) {
        while (1) {
          switch (_context7.prev = _context7.next) {
            case 0:
              if (!(!Buffer.isBuffer(data) && !(data instanceof ArrayBuffer))) {
                _context7.next = 6;
                break;
              }

              _context7.t0 = Buffer;
              _context7.next = 4;
              return new Response(data).arrayBuffer();

            case 4:
              _context7.t1 = _context7.sent;
              data = _context7.t0.from.call(_context7.t0, _context7.t1);

            case 6:
              _context7.next = 8;
              return Crypto.ElvCrypto();

            case 8:
              elvCrypto = _context7.sent;
              _context7.next = 11;
              return Crypto.EncryptionContext(cap);

            case 11:
              _ref2 = _context7.sent;
              context = _ref2.context;
              dataArray = new Uint8Array(data);
              encryptedData = elvCrypto.encryptPrimaryH(context, dataArray);
              encryptedDataBuffer = Buffer.from(encryptedData);
              context.free();
              return _context7.abrupt("return", encryptedDataBuffer);

            case 18:
            case "end":
              return _context7.stop();
          }
        }
      }, _callee7);
    }));

    function Encrypt(_x6, _x7) {
      return _Encrypt.apply(this, arguments);
    }

    return Encrypt;
  }(),

  /**
   * Decrypt data with headers
   *
   * @namedParams
   * @param {Object} cap - Encryption "capsule" containing keys
   * @param {ArrayBuffer | Buffer} encryptedData - Data to encrypt
   *
   * @returns {Promise<Buffer>} - Decrypted data
   */
  Decrypt: function () {
    var _Decrypt = _asyncToGenerator(
    /*#__PURE__*/
    regeneratorRuntime.mark(function _callee8(cap, encryptedData) {
      var stream, decryptedChunks;
      return regeneratorRuntime.wrap(function _callee8$(_context8) {
        while (1) {
          switch (_context8.prev = _context8.next) {
            case 0:
              _context8.next = 2;
              return Crypto.OpenDecryptionStream(cap);

            case 2:
              stream = _context8.sent;
              stream.end(new Uint8Array(encryptedData));
              decryptedChunks = [];
              _context8.next = 7;
              return new Promise(function (resolve, reject) {
                stream.on("data", function (chunk) {
                  decryptedChunks.push(chunk);
                }).on("finish", function () {
                  resolve();
                }).on("error", function (e) {
                  reject(e);
                });
              });

            case 7:
              return _context8.abrupt("return", Buffer.concat(decryptedChunks));

            case 8:
            case "end":
              return _context8.stop();
          }
        }
      }, _callee8);
    }));

    function Decrypt(_x8, _x9) {
      return _Decrypt.apply(this, arguments);
    }

    return Decrypt;
  }(),
  OpenDecryptionStream: function () {
    var _OpenDecryptionStream = _asyncToGenerator(
    /*#__PURE__*/
    regeneratorRuntime.mark(function _callee9(cap) {
      var elvCrypto, _ref3, context, type, stream, decipher;

      return regeneratorRuntime.wrap(function _callee9$(_context9) {
        while (1) {
          switch (_context9.prev = _context9.next) {
            case 0:
              _context9.next = 2;
              return Crypto.ElvCrypto();

            case 2:
              elvCrypto = _context9.sent;
              _context9.next = 5;
              return Crypto.EncryptionContext(cap);

            case 5:
              _ref3 = _context9.sent;
              context = _ref3.context;
              type = _ref3.type;
              stream = new Stream.PassThrough();
              decipher = elvCrypto.createDecipher(type, context);
              return _context9.abrupt("return", stream.pipe(decipher).on("finish", function () {
                context.free();
              }).on("error", function (e) {
                throw Error(e);
              }));

            case 11:
            case "end":
              return _context9.stop();
          }
        }
      }, _callee9);
    }));

    function OpenDecryptionStream(_x10) {
      return _OpenDecryptionStream.apply(this, arguments);
    }

    return OpenDecryptionStream;
  }()
};
module.exports = Crypto;