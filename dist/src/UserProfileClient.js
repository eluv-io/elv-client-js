"use strict";

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var Utils = require("./Utils");

var UrlJoin = require("url-join");

var _require = require("./FrameClient"),
    FrameClient = _require.FrameClient;

var SpaceContract = require("./contracts/BaseContentSpace");

var UserProfileClient =
/*#__PURE__*/
function () {
  _createClass(UserProfileClient, [{
    key: "Log",
    value: function Log(message) {
      var error = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

      if (!this.debug) {
        return;
      }

      if (_typeof(message) === "object") {
        message = JSON.stringify(message);
      }

      error ? // eslint-disable-next-line no-console
      console.error("\n(elv-client-js#UserProfileClient) ".concat(message, "\n")) : // eslint-disable-next-line no-console
      console.log("\n(elv-client-js#UserProfileClient) ".concat(message, "\n"));
    }
    /**
     * Methods used to access and modify information about the user
     *
     * <h4 id="PromptsAndAccessLevels">A note about access level and prompts: </h4>
     *
     * Note: This section only applies to applications working within Eluvio Core
     *
     * Users can choose whether or not their info is shared to applications. A user
     * may choose to allow open access to their profile, no access to their profile, or
     * they may choose to be prompted to give access when an application requests it. The
     * user's access level can be determined using the <a href="#AccessLevel">AccessLevel</a>
     * method.
     *
     * By default, users will be prompted to give access. For methods that access the user's private information,
     * Eluvio Core will intercept the request and prompt the user for permission before proceeding. In
     * these cases, the normal FrameClient timeout period will be ignored, and the response will come
     * only after the user accepts or rejects the request.
     *
     * Access and modification of user metadata is namespaced to the requesting application when using the
     * FrameClient. Public user metadata can be accessed using the PublicUserMetadata method.
     *
     * If the user refuses to give permission, an error will be thrown. Otherwise, the request will proceed
     * as normal.
     *
     * <h4>Usage</h4>
     *
     * Access the UserProfileClient from ElvClient or FrameClient via client.userProfileClient
     *
     * @example
    let client = ElvClient.FromConfiguration({configuration: ClientConfiguration});
    let wallet = client.GenerateWallet();
    let signer = wallet.AddAccount({
    accountName: "Alice",
    privateKey: "0x0000000000000000000000000000000000000000000000000000000000000000"
    });
    client.SetSigner({signer});
    await client.userProfileClient.UserMetadata()
    let frameClient = new FrameClient();
    await client.userProfileClient.UserMetadata()
     *
     */

  }]);

  function UserProfileClient(_ref) {
    var client = _ref.client,
        debug = _ref.debug;

    _classCallCheck(this, UserProfileClient);

    this.client = client;
    this.debug = debug;
    this.userWalletAddresses = {};
  }
  /**
   * Get the user wallet address for the specified user, if it exists
   *
   * @namedParams
   * @param {string} address - The address of the user
   *
   * @return {Promise<string>} - The wallet address of the specified user, if it exists
   */


  _createClass(UserProfileClient, [{
    key: "UserWalletAddress",
    value: function UserWalletAddress(_ref2) {
      var address, walletAddress;
      return regeneratorRuntime.async(function UserWalletAddress$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              address = _ref2.address;

              if (this.userWalletAddresses[address]) {
                _context.next = 7;
                break;
              }

              this.Log("Retrieving user wallet address for user ".concat(address));
              _context.next = 5;
              return regeneratorRuntime.awrap(this.client.CallContractMethod({
                abi: SpaceContract.abi,
                contractAddress: Utils.HashToAddress(this.client.contentSpaceId),
                methodName: "userWallets",
                methodArgs: [address]
              }));

            case 5:
              walletAddress = _context.sent;

              if (!Utils.EqualAddress(walletAddress, Utils.nullAddress)) {
                this.userWalletAddresses[address] = walletAddress;
              }

            case 7:
              return _context.abrupt("return", this.userWalletAddresses[address]);

            case 8:
            case "end":
              return _context.stop();
          }
        }
      }, null, this);
    }
    /**
     * Get the contract address of the current user's BaseAccessWallet contract
     *
     * @return {Promise<string>} - The contract address of the current user's wallet contract
     */

  }, {
    key: "WalletAddress",
    value: function WalletAddress() {
      var _this = this;

      return regeneratorRuntime.async(function WalletAddress$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              if (!this.walletAddress) {
                _context3.next = 2;
                break;
              }

              return _context3.abrupt("return", this.walletAddress);

            case 2:
              if (!this.walletCreationPromise) {
                _context3.next = 5;
                break;
              }

              _context3.next = 5;
              return regeneratorRuntime.awrap(this.walletCreationPromise);

            case 5:
              _context3.next = 7;
              return regeneratorRuntime.awrap(this.UserWalletAddress({
                address: this.client.signer.address
              }));

            case 7:
              this.walletAddress = _context3.sent;

              if (!this.walletAddress) {
                this.Log("Creating user wallet for user ".concat(this.client.signer.address)); // Make promise available so any other calls will wait

                this.walletCreationPromise = new Promise(function _callee(resolve) {
                  var balance, walletCreationEvent, libraryId, objectId, createResponse;
                  return regeneratorRuntime.async(function _callee$(_context2) {
                    while (1) {
                      switch (_context2.prev = _context2.next) {
                        case 0:
                          if (!(!_this.walletAddress || _this.walletAddress === Utils.nullAddress)) {
                            _context2.next = 11;
                            break;
                          }

                          _context2.next = 3;
                          return regeneratorRuntime.awrap(_this.client.GetBalance({
                            address: _this.client.signer.address
                          }));

                        case 3:
                          balance = _context2.sent;

                          if (!(balance < 0.1)) {
                            _context2.next = 6;
                            break;
                          }

                          return _context2.abrupt("return", undefined);

                        case 6:
                          _context2.next = 8;
                          return regeneratorRuntime.awrap(_this.client.CallContractMethodAndWait({
                            contractAddress: Utils.HashToAddress(_this.client.contentSpaceId),
                            abi: SpaceContract.abi,
                            methodName: "createAccessWallet",
                            methodArgs: []
                          }));

                        case 8:
                          walletCreationEvent = _context2.sent;
                          _this.walletAddress = _this.client.ExtractValueFromEvent({
                            abi: SpaceContract.abi,
                            event: walletCreationEvent,
                            eventName: "CreateAccessWallet",
                            eventValue: "wallet"
                          });
                          _this.userWalletAddresses[Utils.FormatAddress(_this.client.signer.address)] = _this.walletAddress;

                        case 11:
                          // Ensure wallet object is created
                          libraryId = _this.client.contentSpaceLibraryId;
                          objectId = Utils.AddressToObjectId(_this.walletAddress);
                          _context2.prev = 13;
                          _context2.next = 16;
                          return regeneratorRuntime.awrap(_this.client.ContentObject({
                            libraryId: libraryId,
                            objectId: objectId
                          }));

                        case 16:
                          _context2.next = 29;
                          break;

                        case 18:
                          _context2.prev = 18;
                          _context2.t0 = _context2["catch"](13);

                          if (!(_context2.t0.status === 404)) {
                            _context2.next = 29;
                            break;
                          }

                          _this.Log("Creating wallet object for user ".concat(_this.client.signer.address));

                          _context2.next = 24;
                          return regeneratorRuntime.awrap(_this.client.CreateContentObject({
                            libraryId: libraryId,
                            objectId: objectId
                          }));

                        case 24:
                          createResponse = _context2.sent;
                          _context2.next = 27;
                          return regeneratorRuntime.awrap(_this.client.ReplaceMetadata({
                            libraryId: libraryId,
                            objectId: objectId,
                            writeToken: createResponse.write_token,
                            metadata: {
                              "bitcode_flags": "abrmaster",
                              "bitcode_format": "builtin"
                            }
                          }));

                        case 27:
                          _context2.next = 29;
                          return regeneratorRuntime.awrap(_this.client.FinalizeContentObject({
                            libraryId: libraryId,
                            objectId: objectId,
                            writeToken: createResponse.write_token
                          }));

                        case 29:
                          resolve();

                        case 30:
                        case "end":
                          return _context2.stop();
                      }
                    }
                  }, null, null, [[13, 18]]);
                });
              }

              _context3.next = 11;
              return regeneratorRuntime.awrap(this.walletCreationPromise);

            case 11:
              this.walletCreationPromise = undefined;
              return _context3.abrupt("return", this.walletAddress);

            case 13:
            case "end":
              return _context3.stop();
          }
        }
      }, null, this);
    }
  }, {
    key: "__InvalidateCache",
    value: function __InvalidateCache() {
      this.cachedPrivateMetadata = undefined;
    }
  }, {
    key: "__CacheMetadata",
    value: function __CacheMetadata(metadata) {
      this.cachedPrivateMetadata = metadata;
    }
  }, {
    key: "__GetCachedMetadata",
    value: function __GetCachedMetadata(subtree) {
      subtree = subtree.replace(/\/*/, "");

      if (!subtree) {
        return this.cachedPrivateMetadata;
      }

      var pointer = this.cachedPrivateMetadata || {};
      subtree = subtree.replace(/\/*/, "");
      var keys = subtree.split("/");

      for (var i = 0; i < keys.length - 1; i++) {
        var key = keys[i];

        if (!pointer || !pointer.hasOwnProperty(key)) {
          return undefined;
        }

        pointer = pointer[key];
      }

      var lastKey = keys[keys.length - 1];

      if (pointer && pointer.hasOwnProperty(lastKey)) {
        return pointer[lastKey];
      }
    }
    /**
     * Access the specified user's public profile metadata
     *
     * @namedParams
     * @param {string=} address - The address of the user
     * @param {string=} metadataSubtree - Subtree of the metadata to retrieve
     * @param {boolean=} resolveLinks=false - If specified, links in the metadata will be resolved
     * @param {boolean=} resolveIncludeSource=false - If specified, resolved links will include the hash of the link at the root of the metadata
        Example:
         {
            "resolved-link": {
              ".": {
                "source": "hq__HPXNia6UtXyuUr6G3Lih8PyUhvYYHuyLTt3i7qSfYgYBB7sF1suR7ky7YRXsUARUrTB1Um1x5a"
              },
              ...
            }
         }
     *
     *
     * @return {Promise<Object|string>}
     */

  }, {
    key: "PublicUserMetadata",
    value: function PublicUserMetadata(_ref3) {
      var address, _ref3$metadataSubtree, metadataSubtree, _ref3$resolveLinks, resolveLinks, _ref3$resolveIncludeS, resolveIncludeSource, walletAddress, libraryId, objectId;

      return regeneratorRuntime.async(function PublicUserMetadata$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              address = _ref3.address, _ref3$metadataSubtree = _ref3.metadataSubtree, metadataSubtree = _ref3$metadataSubtree === void 0 ? "/" : _ref3$metadataSubtree, _ref3$resolveLinks = _ref3.resolveLinks, resolveLinks = _ref3$resolveLinks === void 0 ? false : _ref3$resolveLinks, _ref3$resolveIncludeS = _ref3.resolveIncludeSource, resolveIncludeSource = _ref3$resolveIncludeS === void 0 ? false : _ref3$resolveIncludeS;
              _context4.next = 3;
              return regeneratorRuntime.awrap(this.UserWalletAddress({
                address: address
              }));

            case 3:
              walletAddress = _context4.sent;

              if (walletAddress) {
                _context4.next = 6;
                break;
              }

              return _context4.abrupt("return");

            case 6:
              metadataSubtree = UrlJoin("public", metadataSubtree || "/");
              libraryId = this.client.contentSpaceLibraryId;
              objectId = Utils.AddressToObjectId(walletAddress);
              _context4.next = 11;
              return regeneratorRuntime.awrap(this.client.ContentObjectMetadata({
                libraryId: libraryId,
                objectId: objectId,
                metadataSubtree: metadataSubtree,
                resolveLinks: resolveLinks,
                resolveIncludeSource: resolveIncludeSource
              }));

            case 11:
              return _context4.abrupt("return", _context4.sent);

            case 12:
            case "end":
              return _context4.stop();
          }
        }
      }, null, this);
    }
    /**
     * Access the current user's metadata
     *
     * Note: Subject to user's access level
     *
     * @see <a href="#PromptsAndAccessLevels">Prompts and access levels</a>
     *
     * @namedParams
     * @param {string=} metadataSubtree - Subtree of the metadata to retrieve
     * @param {boolean=} noCache=false - If specified, it will always query for metadata instead of returning from the cache
     * @param {boolean=} resolveLinks=false - If specified, links in the metadata will be resolved
     * @param {boolean=} resolveIncludeSource=false - If specified, resolved links will include the hash of the link at the root of the metadata
        Example:
         {
            "resolved-link": {
              ".": {
                "source": "hq__HPXNia6UtXyuUr6G3Lih8PyUhvYYHuyLTt3i7qSfYgYBB7sF1suR7ky7YRXsUARUrTB1Um1x5a"
              },
              ...
            }
         }
     *
     * @return {Promise<Object|string>} - The user's profile metadata - returns undefined if no metadata set or subtree doesn't exist
     */

  }, {
    key: "UserMetadata",
    value: function UserMetadata() {
      var _ref4,
          _ref4$metadataSubtree,
          metadataSubtree,
          _ref4$resolveLinks,
          resolveLinks,
          _ref4$resolveIncludeS,
          resolveIncludeSource,
          _ref4$noCache,
          noCache,
          libraryId,
          objectId,
          metadata,
          _args5 = arguments;

      return regeneratorRuntime.async(function UserMetadata$(_context5) {
        while (1) {
          switch (_context5.prev = _context5.next) {
            case 0:
              _ref4 = _args5.length > 0 && _args5[0] !== undefined ? _args5[0] : {}, _ref4$metadataSubtree = _ref4.metadataSubtree, metadataSubtree = _ref4$metadataSubtree === void 0 ? "/" : _ref4$metadataSubtree, _ref4$resolveLinks = _ref4.resolveLinks, resolveLinks = _ref4$resolveLinks === void 0 ? false : _ref4$resolveLinks, _ref4$resolveIncludeS = _ref4.resolveIncludeSource, resolveIncludeSource = _ref4$resolveIncludeS === void 0 ? false : _ref4$resolveIncludeS, _ref4$noCache = _ref4.noCache, noCache = _ref4$noCache === void 0 ? false : _ref4$noCache;

              if (!(!noCache && this.cachedPrivateMetadata)) {
                _context5.next = 3;
                break;
              }

              return _context5.abrupt("return", this.__GetCachedMetadata(metadataSubtree));

            case 3:
              this.Log("Accessing private user metadata at ".concat(metadataSubtree));
              libraryId = this.client.contentSpaceLibraryId;
              _context5.t0 = Utils;
              _context5.next = 8;
              return regeneratorRuntime.awrap(this.WalletAddress());

            case 8:
              _context5.t1 = _context5.sent;
              objectId = _context5.t0.AddressToObjectId.call(_context5.t0, _context5.t1);

              if (!noCache) {
                _context5.next = 14;
                break;
              }

              _context5.next = 13;
              return regeneratorRuntime.awrap(this.client.ContentObjectMetadata({
                libraryId: libraryId,
                objectId: objectId,
                metadataSubtree: metadataSubtree,
                resolveLinks: resolveLinks,
                resolveIncludeSource: resolveIncludeSource
              }));

            case 13:
              return _context5.abrupt("return", _context5.sent);

            case 14:
              _context5.next = 16;
              return regeneratorRuntime.awrap(this.client.ContentObjectMetadata({
                libraryId: libraryId,
                objectId: objectId
              }));

            case 16:
              metadata = _context5.sent;

              this.__CacheMetadata(metadata);

              return _context5.abrupt("return", this.__GetCachedMetadata(metadataSubtree));

            case 19:
            case "end":
              return _context5.stop();
          }
        }
      }, null, this);
    }
    /**
     * Merge the current user's profile metadata
     *
     * @namedParams
     * @param {Object} metadata - New metadata
     * @param {string=} metadataSubtree - Subtree to merge into - modifies root metadata if not specified
     */

  }, {
    key: "MergeUserMetadata",
    value: function MergeUserMetadata(_ref5) {
      var _ref5$metadataSubtree, metadataSubtree, _ref5$metadata, metadata, libraryId, objectId, editRequest;

      return regeneratorRuntime.async(function MergeUserMetadata$(_context6) {
        while (1) {
          switch (_context6.prev = _context6.next) {
            case 0:
              _ref5$metadataSubtree = _ref5.metadataSubtree, metadataSubtree = _ref5$metadataSubtree === void 0 ? "/" : _ref5$metadataSubtree, _ref5$metadata = _ref5.metadata, metadata = _ref5$metadata === void 0 ? {} : _ref5$metadata;
              this.Log("Merging user metadata at ".concat(metadataSubtree));
              libraryId = this.client.contentSpaceLibraryId;
              _context6.t0 = Utils;
              _context6.next = 6;
              return regeneratorRuntime.awrap(this.WalletAddress());

            case 6:
              _context6.t1 = _context6.sent;
              objectId = _context6.t0.AddressToObjectId.call(_context6.t0, _context6.t1);
              _context6.next = 10;
              return regeneratorRuntime.awrap(this.client.EditContentObject({
                libraryId: libraryId,
                objectId: objectId
              }));

            case 10:
              editRequest = _context6.sent;
              _context6.next = 13;
              return regeneratorRuntime.awrap(this.client.MergeMetadata({
                libraryId: libraryId,
                objectId: objectId,
                writeToken: editRequest.write_token,
                metadataSubtree: metadataSubtree,
                metadata: metadata
              }));

            case 13:
              _context6.next = 15;
              return regeneratorRuntime.awrap(this.client.FinalizeContentObject({
                libraryId: libraryId,
                objectId: objectId,
                writeToken: editRequest.write_token
              }));

            case 15:
              this.__InvalidateCache();

            case 16:
            case "end":
              return _context6.stop();
          }
        }
      }, null, this);
    }
    /**
     * Replace the current user's profile metadata
     *
     * @namedParams
     * @param {Object} metadata - New metadata
     * @param {string=} metadataSubtree - Subtree to replace - modifies root metadata if not specified
     */

  }, {
    key: "ReplaceUserMetadata",
    value: function ReplaceUserMetadata(_ref6) {
      var _ref6$metadataSubtree, metadataSubtree, _ref6$metadata, metadata, libraryId, objectId, editRequest;

      return regeneratorRuntime.async(function ReplaceUserMetadata$(_context7) {
        while (1) {
          switch (_context7.prev = _context7.next) {
            case 0:
              _ref6$metadataSubtree = _ref6.metadataSubtree, metadataSubtree = _ref6$metadataSubtree === void 0 ? "/" : _ref6$metadataSubtree, _ref6$metadata = _ref6.metadata, metadata = _ref6$metadata === void 0 ? {} : _ref6$metadata;
              this.Log("Replacing user metadata at ".concat(metadataSubtree));
              libraryId = this.client.contentSpaceLibraryId;
              _context7.t0 = Utils;
              _context7.next = 6;
              return regeneratorRuntime.awrap(this.WalletAddress());

            case 6:
              _context7.t1 = _context7.sent;
              objectId = _context7.t0.AddressToObjectId.call(_context7.t0, _context7.t1);
              _context7.next = 10;
              return regeneratorRuntime.awrap(this.client.EditContentObject({
                libraryId: libraryId,
                objectId: objectId
              }));

            case 10:
              editRequest = _context7.sent;
              _context7.next = 13;
              return regeneratorRuntime.awrap(this.client.ReplaceMetadata({
                libraryId: libraryId,
                objectId: objectId,
                writeToken: editRequest.write_token,
                metadataSubtree: metadataSubtree,
                metadata: metadata
              }));

            case 13:
              _context7.next = 15;
              return regeneratorRuntime.awrap(this.client.FinalizeContentObject({
                libraryId: libraryId,
                objectId: objectId,
                writeToken: editRequest.write_token
              }));

            case 15:
              this.__InvalidateCache();

            case 16:
            case "end":
              return _context7.stop();
          }
        }
      }, null, this);
    }
    /**
     * Delete the specified subtree from the users profile metadata
     *
     * @namedParams
     * @param {string=} metadataSubtree - Subtree to delete - deletes all metadata if not specified
     */

  }, {
    key: "DeleteUserMetadata",
    value: function DeleteUserMetadata(_ref7) {
      var _ref7$metadataSubtree, metadataSubtree, libraryId, objectId, editRequest;

      return regeneratorRuntime.async(function DeleteUserMetadata$(_context8) {
        while (1) {
          switch (_context8.prev = _context8.next) {
            case 0:
              _ref7$metadataSubtree = _ref7.metadataSubtree, metadataSubtree = _ref7$metadataSubtree === void 0 ? "/" : _ref7$metadataSubtree;
              this.Log("Deleting user metadata at ".concat(metadataSubtree));
              libraryId = this.client.contentSpaceLibraryId;
              _context8.t0 = Utils;
              _context8.next = 6;
              return regeneratorRuntime.awrap(this.WalletAddress());

            case 6:
              _context8.t1 = _context8.sent;
              objectId = _context8.t0.AddressToObjectId.call(_context8.t0, _context8.t1);
              _context8.next = 10;
              return regeneratorRuntime.awrap(this.client.EditContentObject({
                libraryId: libraryId,
                objectId: objectId
              }));

            case 10:
              editRequest = _context8.sent;
              _context8.next = 13;
              return regeneratorRuntime.awrap(this.client.DeleteMetadata({
                libraryId: libraryId,
                objectId: objectId,
                writeToken: editRequest.write_token,
                metadataSubtree: metadataSubtree
              }));

            case 13:
              _context8.next = 15;
              return regeneratorRuntime.awrap(this.client.FinalizeContentObject({
                libraryId: libraryId,
                objectId: objectId,
                writeToken: editRequest.write_token
              }));

            case 15:
              this.__InvalidateCache();

            case 16:
            case "end":
              return _context8.stop();
          }
        }
      }, null, this);
    }
    /**
     * Return the permissions the current user allows for apps to access their profile.
     *
     * "private" - No access allowed
     * "prompt" - (default) - When access is requested by an app, the user will be prompted to give permission
     * "public - Public - Any access allowed
     *
     * @return {Promise<string>} - Access setting
     */

  }, {
    key: "AccessLevel",
    value: function AccessLevel() {
      return regeneratorRuntime.async(function AccessLevel$(_context9) {
        while (1) {
          switch (_context9.prev = _context9.next) {
            case 0:
              _context9.next = 2;
              return regeneratorRuntime.awrap(this.UserMetadata({
                metadataSubtree: "access_level"
              }));

            case 2:
              _context9.t0 = _context9.sent;

              if (_context9.t0) {
                _context9.next = 5;
                break;
              }

              _context9.t0 = "prompt";

            case 5:
              return _context9.abrupt("return", _context9.t0);

            case 6:
            case "end":
              return _context9.stop();
          }
        }
      }, null, this);
    }
    /**
     * Set the current user's access level.
     *
     * Note: This method is not accessible to applications. Eluvio core will drop the request.
     *
     * @namedParams
     * @param level
     */

  }, {
    key: "SetAccessLevel",
    value: function SetAccessLevel(_ref8) {
      var level;
      return regeneratorRuntime.async(function SetAccessLevel$(_context10) {
        while (1) {
          switch (_context10.prev = _context10.next) {
            case 0:
              level = _ref8.level;
              level = level.toLowerCase();

              if (["private", "prompt", "public"].includes(level)) {
                _context10.next = 4;
                break;
              }

              throw new Error("Invalid access level: " + level);

            case 4:
              _context10.next = 6;
              return regeneratorRuntime.awrap(this.ReplaceUserMetadata({
                metadataSubtree: "access_level",
                metadata: level
              }));

            case 6:
            case "end":
              return _context10.stop();
          }
        }
      }, null, this);
    }
    /**
     * Get the URL of the current user's profile image
     *
     * Note: Part hash of profile image will be appended to the URL as a query parameter to invalidate
     * browser caching when the image is updated
     *
     * @namedParams
     * @param {string=} address - The address of the user. If not specified, the address of the current user will be used.
     *
     * @return {Promise<string | undefined>} - URL of the user's profile image. Will be undefined if no profile image is set.
     */

  }, {
    key: "UserProfileImage",
    value: function UserProfileImage() {
      var _ref9,
          address,
          walletAddress,
          imageHash,
          libraryId,
          objectId,
          _args11 = arguments;

      return regeneratorRuntime.async(function UserProfileImage$(_context11) {
        while (1) {
          switch (_context11.prev = _context11.next) {
            case 0:
              _ref9 = _args11.length > 0 && _args11[0] !== undefined ? _args11[0] : {}, address = _ref9.address;

              if (!address) {
                _context11.next = 7;
                break;
              }

              _context11.next = 4;
              return regeneratorRuntime.awrap(this.UserWalletAddress({
                address: address
              }));

            case 4:
              walletAddress = _context11.sent;
              _context11.next = 9;
              break;

            case 7:
              address = this.client.signer.address;
              walletAddress = this.walletAddress;

            case 9:
              if (walletAddress) {
                _context11.next = 11;
                break;
              }

              return _context11.abrupt("return");

            case 11:
              _context11.next = 13;
              return regeneratorRuntime.awrap(this.PublicUserMetadata({
                address: address,
                metadataSubtree: "image"
              }));

            case 13:
              imageHash = _context11.sent;

              if (imageHash) {
                _context11.next = 16;
                break;
              }

              return _context11.abrupt("return");

            case 16:
              libraryId = this.client.contentSpaceLibraryId;
              objectId = Utils.AddressToObjectId(walletAddress);
              _context11.next = 20;
              return regeneratorRuntime.awrap(this.client.PublicRep({
                libraryId: libraryId,
                objectId: objectId,
                rep: "image",
                queryParams: {
                  hash: imageHash
                },
                noAuth: true,
                channelAuth: false
              }));

            case 20:
              return _context11.abrupt("return", _context11.sent);

            case 21:
            case "end":
              return _context11.stop();
          }
        }
      }, null, this);
    }
    /**
     * Set a new profile image for the current user
     *
     * @namedParams
     * @param {blob} image - The new profile image for the current user
     */

  }, {
    key: "SetUserProfileImage",
    value: function SetUserProfileImage(_ref10) {
      var image, libraryId, objectId, editRequest, uploadResponse;
      return regeneratorRuntime.async(function SetUserProfileImage$(_context12) {
        while (1) {
          switch (_context12.prev = _context12.next) {
            case 0:
              image = _ref10.image;
              this.Log("Setting profile image for user ".concat(this.client.signer.address));
              libraryId = this.client.contentSpaceLibraryId;
              _context12.t0 = Utils;
              _context12.next = 6;
              return regeneratorRuntime.awrap(this.WalletAddress());

            case 6:
              _context12.t1 = _context12.sent;
              objectId = _context12.t0.AddressToObjectId.call(_context12.t0, _context12.t1);
              _context12.next = 10;
              return regeneratorRuntime.awrap(this.client.EditContentObject({
                libraryId: libraryId,
                objectId: objectId
              }));

            case 10:
              editRequest = _context12.sent;
              _context12.next = 13;
              return regeneratorRuntime.awrap(this.client.UploadPart({
                libraryId: libraryId,
                objectId: objectId,
                writeToken: editRequest.write_token,
                data: image
              }));

            case 13:
              uploadResponse = _context12.sent;
              _context12.next = 16;
              return regeneratorRuntime.awrap(this.client.MergeMetadata({
                libraryId: libraryId,
                objectId: objectId,
                writeToken: editRequest.write_token,
                metadata: {
                  image: uploadResponse.part.hash
                }
              }));

            case 16:
              _context12.next = 18;
              return regeneratorRuntime.awrap(this.client.MergeMetadata({
                libraryId: libraryId,
                objectId: objectId,
                writeToken: editRequest.write_token,
                metadataSubtree: "public",
                metadata: {
                  image: uploadResponse.part.hash
                }
              }));

            case 18:
              _context12.next = 20;
              return regeneratorRuntime.awrap(this.client.FinalizeContentObject({
                libraryId: libraryId,
                objectId: objectId,
                writeToken: editRequest.write_token
              }));

            case 20:
              this.__InvalidateCache();

            case 21:
            case "end":
              return _context12.stop();
          }
        }
      }, null, this);
    }
    /**
     * Get the accumulated tags for the current user
     *
     * Note: Subject to user's access level
     *
     * @see <a href="#PromptsAndAccessLevels">Prompts and access levels</a>
     *
     * @return {Promise<Object>} - User tags
     */

  }, {
    key: "CollectedTags",
    value: function CollectedTags() {
      return regeneratorRuntime.async(function CollectedTags$(_context13) {
        while (1) {
          switch (_context13.prev = _context13.next) {
            case 0:
              _context13.next = 2;
              return regeneratorRuntime.awrap(this.UserMetadata({
                metadataSubtree: "collected_data"
              }));

            case 2:
              _context13.t0 = _context13.sent;

              if (_context13.t0) {
                _context13.next = 5;
                break;
              }

              _context13.t0 = {};

            case 5:
              return _context13.abrupt("return", _context13.t0);

            case 6:
            case "end":
              return _context13.stop();
          }
        }
      }, null, this);
    } // Ensure recording tags never causes action to fail

  }, {
    key: "RecordTags",
    value: function RecordTags(_ref11) {
      var libraryId, objectId, versionHash;
      return regeneratorRuntime.async(function RecordTags$(_context14) {
        while (1) {
          switch (_context14.prev = _context14.next) {
            case 0:
              libraryId = _ref11.libraryId, objectId = _ref11.objectId, versionHash = _ref11.versionHash;
              _context14.prev = 1;
              _context14.next = 4;
              return regeneratorRuntime.awrap(this.__RecordTags({
                libraryId: libraryId,
                objectId: objectId,
                versionHash: versionHash
              }));

            case 4:
              _context14.next = 9;
              break;

            case 6:
              _context14.prev = 6;
              _context14.t0 = _context14["catch"](1);
              // eslint-disable-next-line no-console
              console.error(_context14.t0);

            case 9:
              this.__InvalidateCache();

            case 10:
            case "end":
              return _context14.stop();
          }
        }
      }, null, this, [[1, 6]]);
    }
  }, {
    key: "__RecordTags",
    value: function __RecordTags(_ref12) {
      var libraryId, objectId, versionHash, accessType, seen, userLibraryId, userObjectId, editRequest, contentTags, userTags, formattedTags;
      return regeneratorRuntime.async(function __RecordTags$(_context15) {
        while (1) {
          switch (_context15.prev = _context15.next) {
            case 0:
              libraryId = _ref12.libraryId, objectId = _ref12.objectId, versionHash = _ref12.versionHash;
              _context15.next = 3;
              return regeneratorRuntime.awrap(this.client.AccessType({
                id: objectId
              }));

            case 3:
              accessType = _context15.sent;

              if (!(accessType !== "object")) {
                _context15.next = 6;
                break;
              }

              return _context15.abrupt("return");

            case 6:
              if (!(!versionHash && !libraryId)) {
                _context15.next = 10;
                break;
              }

              _context15.next = 9;
              return regeneratorRuntime.awrap(this.client.ContentObjectLibraryId({
                objectId: objectId
              }));

            case 9:
              libraryId = _context15.sent;

            case 10:
              if (versionHash) {
                _context15.next = 14;
                break;
              }

              _context15.next = 13;
              return regeneratorRuntime.awrap(this.client.ContentObject({
                libraryId: libraryId,
                objectId: objectId
              }));

            case 13:
              versionHash = _context15.sent.hash;

            case 14:
              _context15.next = 16;
              return regeneratorRuntime.awrap(this.UserMetadata({
                metadataSubtree: UrlJoin("accessed_content", versionHash)
              }));

            case 16:
              seen = _context15.sent;

              if (!seen) {
                _context15.next = 19;
                break;
              }

              return _context15.abrupt("return");

            case 19:
              userLibraryId = this.client.contentSpaceLibraryId;
              _context15.t0 = Utils;
              _context15.next = 23;
              return regeneratorRuntime.awrap(this.WalletAddress());

            case 23:
              _context15.t1 = _context15.sent;
              userObjectId = _context15.t0.AddressToObjectId.call(_context15.t0, _context15.t1);
              _context15.next = 27;
              return regeneratorRuntime.awrap(this.client.EditContentObject({
                libraryId: userLibraryId,
                objectId: userObjectId
              }));

            case 27:
              editRequest = _context15.sent;
              _context15.next = 30;
              return regeneratorRuntime.awrap(this.client.ReplaceMetadata({
                libraryId: userLibraryId,
                objectId: userObjectId,
                writeToken: editRequest.write_token,
                metadataSubtree: UrlJoin("accessed_content", versionHash),
                metadata: Date.now()
              }));

            case 30:
              _context15.next = 32;
              return regeneratorRuntime.awrap(this.client.ContentObjectMetadata({
                libraryId: libraryId,
                objectId: objectId,
                versionHash: versionHash,
                metadataSubtree: "video_tags"
              }));

            case 32:
              contentTags = _context15.sent;

              if (!(contentTags && contentTags.length > 0)) {
                _context15.next = 41;
                break;
              }

              _context15.next = 36;
              return regeneratorRuntime.awrap(this.CollectedTags());

            case 36:
              userTags = _context15.sent;
              formattedTags = this.__FormatVideoTags(contentTags);
              Object.keys(formattedTags).forEach(function (tag) {
                if (userTags[tag]) {
                  // User has seen this tag before
                  userTags[tag].occurrences += 1;
                  userTags[tag].aggregate += formattedTags[tag];
                } else {
                  // New tag
                  userTags[tag] = {
                    occurrences: 1,
                    aggregate: formattedTags[tag]
                  };
                }
              }); // Update user tags

              _context15.next = 41;
              return regeneratorRuntime.awrap(this.client.ReplaceMetadata({
                libraryId: userLibraryId,
                objectId: userObjectId,
                writeToken: editRequest.write_token,
                metadataSubtree: "collected_data",
                metadata: userTags
              }));

            case 41:
              _context15.next = 43;
              return regeneratorRuntime.awrap(this.client.FinalizeContentObject({
                libraryId: userLibraryId,
                objectId: userObjectId,
                writeToken: editRequest.write_token,
                awaitCommitConfirmation: false
              }));

            case 43:
            case "end":
              return _context15.stop();
          }
        }
      }, null, this);
    }
    /*
      Format video tags into an easier format and average scores
      Example content tags:
      [
      {
        "tags": [
          {
            "score": 0.3,
            "tag": "cherry"
          },
          {
            "score": 0.8,
            "tag": "chocolate"
          },
          {
            "score": 0.6,
            "tag": "boat"
          }
        ],
        "time_in": "00:00:00.000",
        "time_out": "00:03:00.000"
      },
      ...
      ]
    */

  }, {
    key: "__FormatVideoTags",
    value: function __FormatVideoTags(videoTags) {
      var collectedTags = {};
      videoTags.forEach(function (videoTag) {
        var tags = videoTag["tags"];
        tags.forEach(function (tag) {
          if (collectedTags[tag.tag]) {
            collectedTags[tag.tag].occurrences += 1;
            collectedTags[tag.tag].aggregate += tag.score;
          } else {
            collectedTags[tag.tag] = {
              occurrences: 1,
              aggregate: tag.score
            };
          }
        });
      });
      var formattedTags = {};
      Object.keys(collectedTags).forEach(function (tag) {
        formattedTags[tag] = collectedTags[tag].aggregate / collectedTags[tag].occurrences;
      });
      return formattedTags;
    } // List of methods that may require a prompt - these should have an unlimited timeout period

  }, {
    key: "PromptedMethods",
    value: function PromptedMethods() {
      return FrameClient.PromptedMethods();
    } // List of methods for accessing user metadata - these should be namespaced when used by an app

  }, {
    key: "MetadataMethods",
    value: function MetadataMethods() {
      return FrameClient.MetadataMethods();
    } // Whitelist of methods allowed to be called using the frame API

  }, {
    key: "FrameAllowedMethods",
    value: function FrameAllowedMethods() {
      var forbiddenMethods = ["constructor", "FrameAllowedMethods", "Log", "MetadataMethods", "PromptedMethods", "RecordTags", "SetAccessLevel", "SetUserProfileImage", "__CacheMetadata", "__GetCachedMetadata", "__InvalidateCache", "__IsLibraryCreated", "__TouchLibrary", "__FormatVideoTags", "__RecordTags"];
      return Object.getOwnPropertyNames(Object.getPrototypeOf(this)).filter(function (method) {
        return !forbiddenMethods.includes(method);
      });
    }
  }]);

  return UserProfileClient;
}();

module.exports = UserProfileClient;