"use strict";

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var Utils = require("./Utils");

var UrlJoin = require("url-join");

var SpaceContract = require("./contracts/BaseContentSpace");

var UserProfileClient =
/*#__PURE__*/
function () {
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
   * If the user refuses to give permission, an error will be thrown. Otherwise, the request will proceed
   * as normal.
   *
   * For all prompted methods, an extra argument "requestor" is required.
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
  privateKey: "0xbf092a5c94988e2f7a1d00d0db309fc492fe38ddb57fc6d102d777373389c5e6"
  });
  client.SetSigner({signer});
  await client.userProfileClient.UserMetadata({accountAddress: signer.address})
  let frameClient = new FrameClient();
  await client.userProfileClient.UserMetadata({accountAddress: signer.address})
   *
   */
  function UserProfileClient(_ref) {
    var client = _ref.client;

    _classCallCheck(this, UserProfileClient);

    this.client = client;
    this.libraryCreated = false;
    this.cachedPrivateMetadata = undefined;
  }
  /**
   * Get the contract address of the current user's BaseAccessWallet contract
   *
   * @return {Promise<string>} - The contract address of the current user's wallet contract
   */


  _createClass(UserProfileClient, [{
    key: "WalletAddress",
    value: function () {
      var _WalletAddress = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee() {
        var walletCreationEvent;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                if (this.walletAddress) {
                  _context.next = 9;
                  break;
                }

                _context.next = 3;
                return this.client.CallContractMethod({
                  abi: SpaceContract.abi,
                  contractAddress: Utils.HashToAddress(this.client.contentSpaceId),
                  methodName: "userWallets",
                  methodArgs: [this.client.signer.address]
                });

              case 3:
                this.walletAddress = _context.sent;

                if (!(!this.walletAddress || this.walletAddress === Utils.nullAddress)) {
                  _context.next = 9;
                  break;
                }

                _context.next = 7;
                return this.client.CallContractMethodAndWait({
                  contractAddress: Utils.HashToAddress(this.client.contentSpaceId),
                  abi: SpaceContract.abi,
                  methodName: "createAccessWallet",
                  methodArgs: []
                });

              case 7:
                walletCreationEvent = _context.sent;
                this.walletAddress = this.client.ExtractValueFromEvent({
                  abi: SpaceContract.abi,
                  event: walletCreationEvent,
                  eventName: "CreateAccessWallet",
                  eventValue: "wallet"
                });

              case 9:
                return _context.abrupt("return", this.walletAddress);

              case 10:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function WalletAddress() {
        return _WalletAddress.apply(this, arguments);
      }

      return WalletAddress;
    }()
  }, {
    key: "Initialize",
    value: function () {
      var _Initialize = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee2() {
        var walletAddress, libraryId, objectId, createResponse;
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                _context2.next = 2;
                return this.WalletAddress();

              case 2:
                walletAddress = _context2.sent;
                libraryId = this.client.contentSpaceLibraryId;
                objectId = Utils.AddressToObjectId(walletAddress);
                _context2.prev = 5;
                _context2.next = 8;
                return this.client.ContentObject({
                  libraryId: libraryId,
                  objectId: objectId
                });

              case 8:
                _context2.next = 18;
                break;

              case 10:
                _context2.prev = 10;
                _context2.t0 = _context2["catch"](5);

                if (!(_context2.t0.status === 404)) {
                  _context2.next = 18;
                  break;
                }

                _context2.next = 15;
                return this.client.CreateContentObject({
                  libraryId: libraryId,
                  objectId: objectId,
                  options: {
                    type: "library"
                  }
                });

              case 15:
                createResponse = _context2.sent;
                _context2.next = 18;
                return this.client.FinalizeContentObject({
                  libraryId: libraryId,
                  objectId: objectId,
                  writeToken: createResponse.write_token
                });

              case 18:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this, [[5, 10]]);
      }));

      function Initialize() {
        return _Initialize.apply(this, arguments);
      }

      return Initialize;
    }()
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
     * Access the current user's metadata
     *
     * Note: Subject to user's access level
     *
     * @see <a href="#PromptsAndAccessLevels">Prompts and access levels</a>
     *
     * @namedParams
     * @param {string=} metadataSubtree - Subtree of the metadata to retrieve
     * @param {boolean=} noCache=false - If specified, it will always query for metadata instead of returning from the cache
     *
     * @return {Promise<Object>} - The user's profile metadata - returns undefined if no metadata set or subtree doesn't exist
     */

  }, {
    key: "UserMetadata",
    value: function () {
      var _UserMetadata = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee3() {
        var _ref2,
            _ref2$metadataSubtree,
            metadataSubtree,
            _ref2$noCache,
            noCache,
            libraryId,
            objectId,
            metadata,
            _args3 = arguments;

        return regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                _ref2 = _args3.length > 0 && _args3[0] !== undefined ? _args3[0] : {}, _ref2$metadataSubtree = _ref2.metadataSubtree, metadataSubtree = _ref2$metadataSubtree === void 0 ? "/" : _ref2$metadataSubtree, _ref2$noCache = _ref2.noCache, noCache = _ref2$noCache === void 0 ? false : _ref2$noCache;

                if (!(!noCache && this.cachedPrivateMetadata)) {
                  _context3.next = 3;
                  break;
                }

                return _context3.abrupt("return", this.__GetCachedMetadata(metadataSubtree));

              case 3:
                libraryId = this.client.contentSpaceLibraryId;
                _context3.t0 = Utils;
                _context3.next = 7;
                return this.WalletAddress();

              case 7:
                _context3.t1 = _context3.sent;
                objectId = _context3.t0.AddressToObjectId.call(_context3.t0, _context3.t1);

                if (!noCache) {
                  _context3.next = 13;
                  break;
                }

                _context3.next = 12;
                return this.client.ContentObjectMetadata({
                  libraryId: objectId,
                  metadataSubtree: metadataSubtree
                });

              case 12:
                return _context3.abrupt("return", _context3.sent);

              case 13:
                _context3.next = 15;
                return this.client.ContentObjectMetadata({
                  libraryId: libraryId,
                  objectId: objectId
                });

              case 15:
                metadata = _context3.sent;

                this.__CacheMetadata(metadata);

                return _context3.abrupt("return", this.__GetCachedMetadata(metadataSubtree));

              case 18:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      function UserMetadata() {
        return _UserMetadata.apply(this, arguments);
      }

      return UserMetadata;
    }()
    /**
     * Merge the current user's profile metadata
     *
     * @namedParams
     * @param {Object} metadata - New metadata
     * @param {string=} metadataSubtree - Subtree to merge into - modifies root metadata if not specified
     */

  }, {
    key: "MergeUserMetadata",
    value: function () {
      var _MergeUserMetadata = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee4(_ref3) {
        var _ref3$metadataSubtree, metadataSubtree, _ref3$metadata, metadata, libraryId, objectId, editRequest;

        return regeneratorRuntime.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                _ref3$metadataSubtree = _ref3.metadataSubtree, metadataSubtree = _ref3$metadataSubtree === void 0 ? "/" : _ref3$metadataSubtree, _ref3$metadata = _ref3.metadata, metadata = _ref3$metadata === void 0 ? {} : _ref3$metadata;
                libraryId = this.client.contentSpaceLibraryId;
                _context4.t0 = Utils;
                _context4.next = 5;
                return this.WalletAddress();

              case 5:
                _context4.t1 = _context4.sent;
                objectId = _context4.t0.AddressToObjectId.call(_context4.t0, _context4.t1);
                _context4.next = 9;
                return this.client.EditContentObject({
                  libraryId: libraryId,
                  objectId: objectId
                });

              case 9:
                editRequest = _context4.sent;
                _context4.next = 12;
                return this.client.MergeMetadata({
                  libraryId: libraryId,
                  objectId: objectId,
                  writeToken: editRequest.write_token,
                  metadataSubtree: metadataSubtree,
                  metadata: metadata
                });

              case 12:
                _context4.next = 14;
                return this.client.FinalizeContentObject({
                  libraryId: libraryId,
                  objectId: objectId,
                  writeToken: editRequest.write_token
                });

              case 14:
                this.__InvalidateCache();

              case 15:
              case "end":
                return _context4.stop();
            }
          }
        }, _callee4, this);
      }));

      function MergeUserMetadata(_x) {
        return _MergeUserMetadata.apply(this, arguments);
      }

      return MergeUserMetadata;
    }()
    /**
     * Replace the current user's profile metadata
     *
     * @namedParams
     * @param {Object} metadata - New metadata
     * @param {string=} metadataSubtree - Subtree to replace - modifies root metadata if not specified
     */

  }, {
    key: "ReplaceUserMetadata",
    value: function () {
      var _ReplaceUserMetadata = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee5(_ref4) {
        var _ref4$metadataSubtree, metadataSubtree, _ref4$metadata, metadata, libraryId, objectId, editRequest;

        return regeneratorRuntime.wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                _ref4$metadataSubtree = _ref4.metadataSubtree, metadataSubtree = _ref4$metadataSubtree === void 0 ? "/" : _ref4$metadataSubtree, _ref4$metadata = _ref4.metadata, metadata = _ref4$metadata === void 0 ? {} : _ref4$metadata;
                libraryId = this.client.contentSpaceLibraryId;
                _context5.t0 = Utils;
                _context5.next = 5;
                return this.WalletAddress();

              case 5:
                _context5.t1 = _context5.sent;
                objectId = _context5.t0.AddressToObjectId.call(_context5.t0, _context5.t1);
                _context5.next = 9;
                return this.client.EditContentObject({
                  libraryId: libraryId,
                  objectId: objectId
                });

              case 9:
                editRequest = _context5.sent;
                _context5.next = 12;
                return this.client.ReplaceMetadata({
                  libraryId: libraryId,
                  objectId: objectId,
                  writeToken: editRequest.write_token,
                  metadataSubtree: metadataSubtree,
                  metadata: metadata
                });

              case 12:
                _context5.next = 14;
                return this.client.FinalizeContentObject({
                  libraryId: libraryId,
                  objectId: objectId,
                  writeToken: editRequest.write_token
                });

              case 14:
                this.__InvalidateCache();

              case 15:
              case "end":
                return _context5.stop();
            }
          }
        }, _callee5, this);
      }));

      function ReplaceUserMetadata(_x2) {
        return _ReplaceUserMetadata.apply(this, arguments);
      }

      return ReplaceUserMetadata;
    }()
    /**
     * Delete the specified subtree from the users profile metadata
     *
     * @namedParams
     * @param {string=} metadataSubtree - Subtree to delete - deletes all metadata if not specified
     */

  }, {
    key: "DeleteUserMetadata",
    value: function () {
      var _DeleteUserMetadata = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee6(_ref5) {
        var _ref5$metadataSubtree, metadataSubtree, libraryId, objectId, editRequest;

        return regeneratorRuntime.wrap(function _callee6$(_context6) {
          while (1) {
            switch (_context6.prev = _context6.next) {
              case 0:
                _ref5$metadataSubtree = _ref5.metadataSubtree, metadataSubtree = _ref5$metadataSubtree === void 0 ? "/" : _ref5$metadataSubtree;
                libraryId = this.client.contentSpaceLibraryId;
                _context6.t0 = Utils;
                _context6.next = 5;
                return this.WalletAddress();

              case 5:
                _context6.t1 = _context6.sent;
                objectId = _context6.t0.AddressToObjectId.call(_context6.t0, _context6.t1);
                _context6.next = 9;
                return this.client.EditContentObject({
                  libraryId: libraryId,
                  objectId: objectId
                });

              case 9:
                editRequest = _context6.sent;
                _context6.next = 12;
                return this.client.DeleteMetadata({
                  libraryId: libraryId,
                  objectId: objectId,
                  writeToken: editRequest.write_token,
                  metadataSubtree: metadataSubtree
                });

              case 12:
                _context6.next = 14;
                return this.client.FinalizeContentObject({
                  libraryId: libraryId,
                  objectId: objectId,
                  writeToken: editRequest.write_token
                });

              case 14:
                this.__InvalidateCache();

              case 15:
              case "end":
                return _context6.stop();
            }
          }
        }, _callee6, this);
      }));

      function DeleteUserMetadata(_x3) {
        return _DeleteUserMetadata.apply(this, arguments);
      }

      return DeleteUserMetadata;
    }()
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
    value: function () {
      var _AccessLevel = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee7() {
        return regeneratorRuntime.wrap(function _callee7$(_context7) {
          while (1) {
            switch (_context7.prev = _context7.next) {
              case 0:
                _context7.next = 2;
                return this.UserMetadata({
                  metadataSubtree: "access_level"
                });

              case 2:
                _context7.t0 = _context7.sent;

                if (_context7.t0) {
                  _context7.next = 5;
                  break;
                }

                _context7.t0 = "prompt";

              case 5:
                return _context7.abrupt("return", _context7.t0);

              case 6:
              case "end":
                return _context7.stop();
            }
          }
        }, _callee7, this);
      }));

      function AccessLevel() {
        return _AccessLevel.apply(this, arguments);
      }

      return AccessLevel;
    }()
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
    value: function () {
      var _SetAccessLevel = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee8(_ref6) {
        var level;
        return regeneratorRuntime.wrap(function _callee8$(_context8) {
          while (1) {
            switch (_context8.prev = _context8.next) {
              case 0:
                level = _ref6.level;
                level = level.toLowerCase();

                if (["private", "prompt", "public"].includes(level)) {
                  _context8.next = 4;
                  break;
                }

                throw new Error("Invalid access level: " + level);

              case 4:
                _context8.next = 6;
                return this.ReplaceUserMetadata({
                  metadataSubtree: "access_level",
                  metadata: level
                });

              case 6:
              case "end":
                return _context8.stop();
            }
          }
        }, _callee8, this);
      }));

      function SetAccessLevel(_x4) {
        return _SetAccessLevel.apply(this, arguments);
      }

      return SetAccessLevel;
    }()
    /**
     * Get the URL of the current user's profile image
     *
     * Note: Part hash of profile image will be appended to the URL as a query parameter to invalidate
     * browser caching when the image is updated
     *
     * @return {Promise<string | undefined>} - URL of the user's profile image. Will be undefined if no profile image is set.
     */

  }, {
    key: "UserProfileImage",
    value: function () {
      var _UserProfileImage = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee9() {
        var imageHash, libraryId, objectId;
        return regeneratorRuntime.wrap(function _callee9$(_context9) {
          while (1) {
            switch (_context9.prev = _context9.next) {
              case 0:
                _context9.next = 2;
                return this.UserMetadata({
                  metadataSubtree: "image"
                });

              case 2:
                imageHash = _context9.sent;

                if (imageHash) {
                  _context9.next = 5;
                  break;
                }

                return _context9.abrupt("return");

              case 5:
                libraryId = this.client.contentSpaceLibraryId;
                _context9.t0 = Utils;
                _context9.next = 9;
                return this.WalletAddress();

              case 9:
                _context9.t1 = _context9.sent;
                objectId = _context9.t0.AddressToObjectId.call(_context9.t0, _context9.t1);
                _context9.next = 13;
                return this.client.Rep({
                  libraryId: libraryId,
                  objectId: objectId,
                  rep: "image",
                  queryParams: {
                    hash: imageHash
                  }
                });

              case 13:
                return _context9.abrupt("return", _context9.sent);

              case 14:
              case "end":
                return _context9.stop();
            }
          }
        }, _callee9, this);
      }));

      function UserProfileImage() {
        return _UserProfileImage.apply(this, arguments);
      }

      return UserProfileImage;
    }()
    /**
     * Set a new profile image for the current user
     *
     * @namedParams
     * @param {blob} image - The new profile image for the current user
     */

  }, {
    key: "SetUserProfileImage",
    value: function () {
      var _SetUserProfileImage = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee10(_ref7) {
        var image, libraryId, objectId, editRequest, uploadResponse;
        return regeneratorRuntime.wrap(function _callee10$(_context10) {
          while (1) {
            switch (_context10.prev = _context10.next) {
              case 0:
                image = _ref7.image;
                libraryId = this.client.contentSpaceLibraryId;
                _context10.t0 = Utils;
                _context10.next = 5;
                return this.WalletAddress();

              case 5:
                _context10.t1 = _context10.sent;
                objectId = _context10.t0.AddressToObjectId.call(_context10.t0, _context10.t1);
                _context10.next = 9;
                return this.client.EditContentObject({
                  libraryId: libraryId,
                  objectId: objectId
                });

              case 9:
                editRequest = _context10.sent;
                _context10.next = 12;
                return this.client.UploadPart({
                  libraryId: libraryId,
                  objectId: objectId,
                  writeToken: editRequest.write_token,
                  data: image
                });

              case 12:
                uploadResponse = _context10.sent;
                _context10.next = 15;
                return this.client.ReplaceMetadata({
                  libraryId: libraryId,
                  objectId: objectId,
                  writeToken: editRequest.write_token,
                  metadataSubtree: "image",
                  metadata: uploadResponse.part.hash
                });

              case 15:
                _context10.next = 17;
                return this.client.FinalizeContentObject({
                  libraryId: libraryId,
                  objectId: objectId,
                  writeToken: editRequest.write_token
                });

              case 17:
                this.__InvalidateCache();

              case 18:
              case "end":
                return _context10.stop();
            }
          }
        }, _callee10, this);
      }));

      function SetUserProfileImage(_x5) {
        return _SetUserProfileImage.apply(this, arguments);
      }

      return SetUserProfileImage;
    }()
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
    value: function () {
      var _CollectedTags = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee11() {
        return regeneratorRuntime.wrap(function _callee11$(_context11) {
          while (1) {
            switch (_context11.prev = _context11.next) {
              case 0:
                _context11.next = 2;
                return this.UserMetadata({
                  metadataSubtree: "collected_data"
                });

              case 2:
                _context11.t0 = _context11.sent;

                if (_context11.t0) {
                  _context11.next = 5;
                  break;
                }

                _context11.t0 = {};

              case 5:
                return _context11.abrupt("return", _context11.t0);

              case 6:
              case "end":
                return _context11.stop();
            }
          }
        }, _callee11, this);
      }));

      function CollectedTags() {
        return _CollectedTags.apply(this, arguments);
      }

      return CollectedTags;
    }() // Ensure recording tags never causes action to fail

  }, {
    key: "RecordTags",
    value: function () {
      var _RecordTags = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee12(_ref8) {
        var libraryId, objectId, versionHash;
        return regeneratorRuntime.wrap(function _callee12$(_context12) {
          while (1) {
            switch (_context12.prev = _context12.next) {
              case 0:
                libraryId = _ref8.libraryId, objectId = _ref8.objectId, versionHash = _ref8.versionHash;
                _context12.prev = 1;
                _context12.next = 4;
                return this.__RecordTags({
                  libraryId: libraryId,
                  objectId: objectId,
                  versionHash: versionHash
                });

              case 4:
                _context12.next = 9;
                break;

              case 6:
                _context12.prev = 6;
                _context12.t0 = _context12["catch"](1);
                // eslint-disable-next-line no-console
                console.error(_context12.t0);

              case 9:
                this.__InvalidateCache();

              case 10:
              case "end":
                return _context12.stop();
            }
          }
        }, _callee12, this, [[1, 6]]);
      }));

      function RecordTags(_x6) {
        return _RecordTags.apply(this, arguments);
      }

      return RecordTags;
    }()
  }, {
    key: "__RecordTags",
    value: function () {
      var _RecordTags2 = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee13(_ref9) {
        var libraryId, objectId, versionHash, seen, userLibraryId, userObjectId, editRequest, contentTags, userTags, formattedTags;
        return regeneratorRuntime.wrap(function _callee13$(_context13) {
          while (1) {
            switch (_context13.prev = _context13.next) {
              case 0:
                libraryId = _ref9.libraryId, objectId = _ref9.objectId, versionHash = _ref9.versionHash;

                if (versionHash) {
                  _context13.next = 5;
                  break;
                }

                _context13.next = 4;
                return this.client.ContentObject({
                  libraryId: libraryId,
                  objectId: objectId
                });

              case 4:
                versionHash = _context13.sent.hash;

              case 5:
                _context13.next = 7;
                return this.UserMetadata({
                  metadataSubtree: UrlJoin("accessed_content", versionHash)
                });

              case 7:
                seen = _context13.sent;

                if (!seen) {
                  _context13.next = 10;
                  break;
                }

                return _context13.abrupt("return");

              case 10:
                userLibraryId = this.client.contentSpaceLibraryId;
                _context13.t0 = Utils;
                _context13.next = 14;
                return this.WalletAddress();

              case 14:
                _context13.t1 = _context13.sent;
                userObjectId = _context13.t0.AddressToObjectId.call(_context13.t0, _context13.t1);
                _context13.next = 18;
                return this.client.EditContentObject({
                  libraryId: userLibraryId,
                  objectId: userObjectId
                });

              case 18:
                editRequest = _context13.sent;
                _context13.next = 21;
                return this.client.ReplaceMetadata({
                  libraryId: userLibraryId,
                  objectId: userObjectId,
                  writeToken: editRequest.write_token,
                  metadataSubtree: UrlJoin("accessed_content", versionHash),
                  metadata: Date.now()
                });

              case 21:
                _context13.next = 23;
                return this.client.ContentObjectMetadata({
                  libraryId: libraryId,
                  objectId: objectId,
                  versionHash: versionHash,
                  metadataSubtree: "video_tags",
                  noAuth: true
                });

              case 23:
                contentTags = _context13.sent;

                if (!(contentTags && contentTags.length > 0)) {
                  _context13.next = 32;
                  break;
                }

                _context13.next = 27;
                return this.CollectedTags();

              case 27:
                userTags = _context13.sent;
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

                _context13.next = 32;
                return this.client.ReplaceMetadata({
                  libraryId: userLibraryId,
                  objectId: userObjectId,
                  writeToken: editRequest.write_token,
                  metadataSubtree: "collected_data",
                  metadata: userTags
                });

              case 32:
                _context13.next = 34;
                return this.client.FinalizeContentObject({
                  libraryId: userLibraryId,
                  objectId: userObjectId,
                  writeToken: editRequest.write_token
                });

              case 34:
              case "end":
                return _context13.stop();
            }
          }
        }, _callee13, this);
      }));

      function __RecordTags(_x7) {
        return _RecordTags2.apply(this, arguments);
      }

      return __RecordTags;
    }()
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
      return ["CollectedTags", "UserMetadata"];
    } // Whitelist of methods allowed to be called using the frame API

  }, {
    key: "FrameAllowedMethods",
    value: function FrameAllowedMethods() {
      var forbiddenMethods = ["constructor", "FrameAllowedMethods", "PromptedMethods", "SetAccessLevel", "__CacheMetadata", "__GetCachedMetadata", "__InvalidateCache", "__IsLibraryCreated", "__TouchLibrary", "__FormatVideoTags", "__RecordTags"];
      return Object.getOwnPropertyNames(Object.getPrototypeOf(this)).filter(function (method) {
        return !forbiddenMethods.includes(method);
      });
    }
  }]);

  return UserProfileClient;
}();

module.exports = UserProfileClient;