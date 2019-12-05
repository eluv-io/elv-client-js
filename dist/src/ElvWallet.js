"use strict";

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var Ethers = require("ethers");

var ElvWallet =
/*#__PURE__*/
function () {
  /**
   * Create a new ElvWallet connected to the given provider
   *
   * NOTE: It is recommended to initialize wallets from the ElvClient, not using this constructor
   *
   * @see ElvClient#GenerateWallet()
   *
   * @param {string} providerUrl - URL of blockchain provider
   */
  function ElvWallet(provider) {
    _classCallCheck(this, ElvWallet);

    this.provider = provider;
    this.signers = {};
  }
  /**
   * Generate a mnemonic that can be used to initialize a private key
   *
   * @returns {string} - Space-separated list of random words
   */


  _createClass(ElvWallet, [{
    key: "GenerateMnemonic",
    value: function GenerateMnemonic() {
      return Ethers.utils.HDNode.entropyToMnemonic(Ethers.utils.randomBytes(16));
    }
    /**
     * Generate a private key from the given mnemonic
     *
     * @namedParams
     * @param {string=} accountName - Name of account to save in wallet. Account will be saved in the wallet if provided.
     * @param {string} mnemonic - Mnemonic from which to generate a private key
     *
     * @returns {Signer} - Signer with the generated private key, connected to the provider
     */

  }, {
    key: "AddAccountFromMnemonic",
    value: function AddAccountFromMnemonic(_ref) {
      var accountName = _ref.accountName,
          mnemonic = _ref.mnemonic;
      var signer = Ethers.Wallet.fromMnemonic(mnemonic);
      return this.AddAccount({
        accountName: accountName,
        privateKey: signer.privateKey
      });
    }
    /**
     * Add an account from an encrypted private key (Ethereum keystore format)
     *
     * @namedParams
     * @param {string=} accountName - Name of account to save in wallet. Account will be saved in the wallet if provided.
     * @param {string} encryptedPrivateKey - Encrypted private key to decrypt
     * @params {string} password - Password with which to decrypt the private key
     *
     * @returns {Promise<Signer>} - Signer with the decrypted private key, connected to the provider
     */

  }, {
    key: "AddAccountFromEncryptedPK",
    value: function AddAccountFromEncryptedPK(_ref2) {
      var accountName, encryptedPrivateKey, password, signer;
      return regeneratorRuntime.async(function AddAccountFromEncryptedPK$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              accountName = _ref2.accountName, encryptedPrivateKey = _ref2.encryptedPrivateKey, password = _ref2.password;

              if (_typeof(encryptedPrivateKey) === "object") {
                encryptedPrivateKey = JSON.stringify(encryptedPrivateKey);
              }

              _context.next = 4;
              return regeneratorRuntime.awrap(Ethers.Wallet.fromEncryptedJson(encryptedPrivateKey, password));

            case 4:
              signer = _context.sent;
              return _context.abrupt("return", this.AddAccount({
                accountName: accountName,
                privateKey: signer.privateKey
              }));

            case 6:
            case "end":
              return _context.stop();
          }
        }
      }, null, this);
    }
    /**
     * Add an account from a private key (Ethereum keystore format)
     *
     * @namedParams
     * @param {string=} accountName - Name of account to save in wallet. Account will be saved in the wallet if provided.
     * @param {string} privateKey - Private key to use
     *
     * @returns {Signer} - Signer with the private key, connected to the provider
     */

  }, {
    key: "AddAccount",
    value: function AddAccount(_ref3) {
      var accountName = _ref3.accountName,
          privateKey = _ref3.privateKey;
      var signer = new Ethers.Wallet(privateKey);
      signer = signer.connect(this.provider);

      if (accountName) {
        this.signers[accountName] = signer;
      }

      return signer;
    }
    /**
     * Get the balance of the account. The account to query can be specified either by
     * passing the signer object, or by passing the account name of a saved account
     *
     * Note: Either the signer OR the account name should be specified
     *
     * @namedParams
     * @param {string=} accountName - Saved account to query the account balance of
     * @param {Signer=} signer - Signer to query the account balance of
     *
     * @returns {number} - Account balance of the specified account, in ETH
     */

  }, {
    key: "GetAccountBalance",
    value: function GetAccountBalance(_ref4) {
      var accountName, signer, accountSigner;
      return regeneratorRuntime.async(function GetAccountBalance$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              accountName = _ref4.accountName, signer = _ref4.signer;
              accountSigner = signer || this.GetAccount({
                accountName: accountName
              });

              if (accountSigner) {
                _context2.next = 4;
                break;
              }

              throw Error("Unknown account: " + accountName);

            case 4:
              _context2.t0 = Ethers.utils;
              _context2.next = 7;
              return regeneratorRuntime.awrap(accountSigner.getBalance());

            case 7:
              _context2.t1 = _context2.sent;
              return _context2.abrupt("return", _context2.t0.formatEther.call(_context2.t0, _context2.t1));

            case 9:
            case "end":
              return _context2.stop();
          }
        }
      }, null, this);
    }
    /**
     * Generate the encrypted private key (Ethereum keystore format) of the signer's private key
     * The private key to decrypt can be specified either by passing the signer object, or by passing
     * the account name of a saved account
     *
     * Note: Either the signer OR the account name should be specified
     *
     * @namedParams
     * @param {string=} accountName - Saved account to encrypt the private key of
     * @param {string=} signer - Signer to encrypt the private key of
     * @params {string} password - Password to encrypt the private key with
     *
     * @returns {Promise<string>} - The encrypted private key (in Ethereum keystore format)
     */

  }, {
    key: "GenerateEncryptedPrivateKey",
    value: function GenerateEncryptedPrivateKey(_ref5) {
      var accountName, signer, password, options, accountSigner;
      return regeneratorRuntime.async(function GenerateEncryptedPrivateKey$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              accountName = _ref5.accountName, signer = _ref5.signer, password = _ref5.password, options = _ref5.options;
              accountSigner = signer || this.GetAccount({
                accountName: accountName
              });

              if (accountSigner) {
                _context3.next = 4;
                break;
              }

              throw Error("Unknown account: " + accountName);

            case 4:
              _context3.next = 6;
              return regeneratorRuntime.awrap(accountSigner.encrypt(password, options));

            case 6:
              return _context3.abrupt("return", _context3.sent);

            case 7:
            case "end":
              return _context3.stop();
          }
        }
      }, null, this);
    }
    /**
     * Get the signer of a previously saved account by name
     *
     * @namedParams
     * @param {string} accountName - Name of the account
      * @returns {(Signer|undefined)} - Signer of the saved account, if it exists
     */

  }, {
    key: "GetAccount",
    value: function GetAccount(_ref6) {
      var accountName = _ref6.accountName;
      return this.signers[accountName];
    }
    /**
     * Remove a previously saved account from this wallet
     *
     * @namedParams
     * @param {string} accountName - Name of the account to delete
     */

  }, {
    key: "RemoveAccount",
    value: function RemoveAccount(_ref7) {
      var accountName = _ref7.accountName;
      delete this.signers[accountName];
    }
  }]);

  return ElvWallet;
}();

module.exports = ElvWallet;