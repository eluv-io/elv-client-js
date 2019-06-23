"use strict";

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var Utils = require("./Utils");

var UrlJoin = require("url-join");

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
   * Access the UserProfileClient from ElvClient or FrameClient via client.userProfile
   *
   * @example
  let client = ElvClient.FromConfiguration({configuration: ClientConfiguration});
  let wallet = client.GenerateWallet();
  let signer = wallet.AddAccount({
  accountName: "Alice",
  privateKey: "0x0000000000000000000000000000000000000000000000000000000000000000"
  });
  client.SetSigner({signer});
  await client.userProfile.PublicUserMetadata({accountAddress: signer.address})
  let frameClient = new FrameClient();
  await client.userProfile.PublicUserMetadata({accountAddress: signer.address})
   *
   */
  function UserProfileClient(_ref) {
    var client = _ref.client;

    _classCallCheck(this, UserProfileClient);

    this.client = client;
    this.libraryCreated = false;
    this.cachedPrivateMetadata = undefined;
  }

  _createClass(UserProfileClient, [{
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
     * Create an account library for the current user
     *
     * @namedParams
     * @param {object=} publicMetadata - Publicly accessible metadata
     * @param {object=} privateMetadata - Metadata accessible only by this user
     * @param {blob=} image - Profile image for this user
     *
     * @return {Promise<string|*>} - The ID of the created library
     */

  }, {
    key: "CreateAccountLibrary",
    value: function () {
      var _CreateAccountLibrary = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee() {
        var _ref2,
            _ref2$publicMetadata,
            publicMetadata,
            _ref2$privateMetadata,
            privateMetadata,
            image,
            libraryId,
            imageHash,
            _args = arguments;

        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _ref2 = _args.length > 0 && _args[0] !== undefined ? _args[0] : {}, _ref2$publicMetadata = _ref2.publicMetadata, publicMetadata = _ref2$publicMetadata === void 0 ? {} : _ref2$publicMetadata, _ref2$privateMetadata = _ref2.privateMetadata, privateMetadata = _ref2$privateMetadata === void 0 ? {} : _ref2$privateMetadata, image = _ref2.image;
                _context.next = 3;
                return this.__IsLibraryCreated({
                  accountAddress: this.client.signer.address
                });

              case 3:
                if (!_context.sent) {
                  _context.next = 5;
                  break;
                }

                return _context.abrupt("return", Utils.AddressToLibraryId(this.client.signer.address));

              case 5:
                publicMetadata = _objectSpread({}, publicMetadata, {
                  "class": "elv-user-library"
                }); // Initialize fields

                privateMetadata = _objectSpread({}, privateMetadata, {
                  access_level: "prompt",
                  collected_data: {}
                });
                _context.next = 9;
                return this.client.CreateContentLibrary({
                  publicMetadata: publicMetadata,
                  privateMetadata: privateMetadata,
                  image: image,
                  isUserLibrary: true
                });

              case 9:
                libraryId = _context.sent;

                if (!image) {
                  _context.next = 16;
                  break;
                }

                _context.next = 13;
                return this.PrivateUserMetadata({
                  metadataSubtree: "image"
                });

              case 13:
                imageHash = _context.sent;
                _context.next = 16;
                return this.ReplacePublicUserMetadata({
                  metadataSubtree: "image",
                  metadata: imageHash
                });

              case 16:
                return _context.abrupt("return", libraryId);

              case 17:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function CreateAccountLibrary() {
        return _CreateAccountLibrary.apply(this, arguments);
      }

      return CreateAccountLibrary;
    }() // Create the library if it doesn't yet exist

  }, {
    key: "__TouchLibrary",
    value: function () {
      var _TouchLibrary = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee2() {
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                if (!this.client.signer) {
                  _context2.next = 7;
                  break;
                }

                _context2.next = 3;
                return this.__IsLibraryCreated({
                  accountAddress: this.client.signer.address
                });

              case 3:
                if (_context2.sent) {
                  _context2.next = 6;
                  break;
                }

                _context2.next = 6;
                return this.CreateAccountLibrary();

              case 6:
                this.libraryCreated = true;

              case 7:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function __TouchLibrary() {
        return _TouchLibrary.apply(this, arguments);
      }

      return __TouchLibrary;
    }() // Check if the account library exists
    // TODO: Change logic when user libraries are properly implemented

  }, {
    key: "__IsLibraryCreated",
    value: function () {
      var _IsLibraryCreated = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee3(_ref3) {
        var accountAddress, libraryId, libraryIds;
        return regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                accountAddress = _ref3.accountAddress;

                if (!this.libraryCreated) {
                  _context3.next = 3;
                  break;
                }

                return _context3.abrupt("return", true);

              case 3:
                libraryId = Utils.AddressToLibraryId(accountAddress);
                _context3.next = 6;
                return this.client.ContentLibraries();

              case 6:
                libraryIds = _context3.sent;
                return _context3.abrupt("return", libraryIds.find(function (id) {
                  return id === libraryId;
                }));

              case 8:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      function __IsLibraryCreated(_x) {
        return _IsLibraryCreated.apply(this, arguments);
      }

      return __IsLibraryCreated;
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
      regeneratorRuntime.mark(function _callee4() {
        return regeneratorRuntime.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                _context4.next = 2;
                return this.PrivateUserMetadata({
                  metadataSubtree: "access_level"
                });

              case 2:
                _context4.t0 = _context4.sent;

                if (_context4.t0) {
                  _context4.next = 5;
                  break;
                }

                _context4.t0 = "prompt";

              case 5:
                return _context4.abrupt("return", _context4.t0);

              case 6:
              case "end":
                return _context4.stop();
            }
          }
        }, _callee4, this);
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
      regeneratorRuntime.mark(function _callee5(_ref4) {
        var level;
        return regeneratorRuntime.wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                level = _ref4.level;

                if (["private", "prompt", "public"].includes(level.toLowerCase())) {
                  _context5.next = 3;
                  break;
                }

                return _context5.abrupt("return");

              case 3:
                _context5.next = 5;
                return this.ReplacePrivateUserMetadata({
                  metadataSubtree: "access_level",
                  metadata: level.toLowerCase()
                });

              case 5:
              case "end":
                return _context5.stop();
            }
          }
        }, _callee5, this);
      }));

      function SetAccessLevel(_x2) {
        return _SetAccessLevel.apply(this, arguments);
      }

      return SetAccessLevel;
    }()
    /**
     * Get the URL of the specified user's profile image
     *
     * Note: Part hash of profile image will be appended to the URL as a query parameter in order to ensure browsers
     * won't serve old cached versions when the image is updated
     *
     * @namedParams
     * @param {string} accountAddress - Address of the user account
     * @return {Promise<string | undefined>} - URL of the user's profile image. Will be undefined if no profile image is set.
     */

  }, {
    key: "UserProfileImage",
    value: function () {
      var _UserProfileImage = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee6(_ref5) {
        var accountAddress, libraryId, objectId, imageHash;
        return regeneratorRuntime.wrap(function _callee6$(_context6) {
          while (1) {
            switch (_context6.prev = _context6.next) {
              case 0:
                accountAddress = _ref5.accountAddress;
                libraryId = Utils.AddressToLibraryId(accountAddress);
                objectId = Utils.AddressToObjectId(accountAddress); // Ensure library is created

                _context6.next = 5;
                return this.__IsLibraryCreated({
                  accountAddress: accountAddress
                });

              case 5:
                if (_context6.sent) {
                  _context6.next = 7;
                  break;
                }

                return _context6.abrupt("return");

              case 7:
                _context6.next = 9;
                return this.PublicUserMetadata({
                  accountAddress: accountAddress,
                  metadataSubtree: "image"
                });

              case 9:
                imageHash = _context6.sent;

                if (imageHash) {
                  _context6.next = 12;
                  break;
                }

                return _context6.abrupt("return");

              case 12:
                _context6.next = 14;
                return this.client.Rep({
                  libraryId: libraryId,
                  objectId: objectId,
                  rep: "image",
                  queryParams: {
                    hash: imageHash
                  },
                  noAuth: true
                });

              case 14:
                return _context6.abrupt("return", _context6.sent);

              case 15:
              case "end":
                return _context6.stop();
            }
          }
        }, _callee6, this);
      }));

      function UserProfileImage(_x3) {
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
      regeneratorRuntime.mark(function _callee7(_ref6) {
        var image, libraryId, imageHash;
        return regeneratorRuntime.wrap(function _callee7$(_context7) {
          while (1) {
            switch (_context7.prev = _context7.next) {
              case 0:
                image = _ref6.image;
                libraryId = Utils.AddressToLibraryId(this.client.signer.address);
                _context7.next = 4;
                return this.__TouchLibrary();

              case 4:
                _context7.next = 6;
                return this.client.SetContentLibraryImage({
                  libraryId: libraryId,
                  image: image
                });

              case 6:
                _context7.next = 8;
                return this.PrivateUserMetadata({
                  metadataSubtree: "image"
                });

              case 8:
                imageHash = _context7.sent;

                //await this.client.ReplacePublicLibraryMetadata({libraryId, metadataSubtree: "image", metadata: imageHash});
                this.__InvalidateCache();

              case 10:
              case "end":
                return _context7.stop();
            }
          }
        }, _callee7, this);
      }));

      function SetUserProfileImage(_x4) {
        return _SetUserProfileImage.apply(this, arguments);
      }

      return SetUserProfileImage;
    }()
    /**
     * Access the specified user account's public metadata
     *
     * @namedParams
     * @param {string} accountAddress - Address of the user account
     * @param {string=} metadataSubtree - Subtree of the metadata to retrieve
     *
     * @return {Promise<Object>} - The user's public profile metadata - returns undefined if no metadata set or subtree doesn't exist
     */

  }, {
    key: "PublicUserMetadata",
    value: function () {
      var _PublicUserMetadata = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee8(_ref7) {
        var accountAddress, _ref7$metadataSubtree, metadataSubtree, libraryId;

        return regeneratorRuntime.wrap(function _callee8$(_context8) {
          while (1) {
            switch (_context8.prev = _context8.next) {
              case 0:
                accountAddress = _ref7.accountAddress, _ref7$metadataSubtree = _ref7.metadataSubtree, metadataSubtree = _ref7$metadataSubtree === void 0 ? "/" : _ref7$metadataSubtree;

                if (accountAddress) {
                  _context8.next = 3;
                  break;
                }

                return _context8.abrupt("return", undefined);

              case 3:
                libraryId = Utils.AddressToLibraryId(accountAddress);
                _context8.prev = 4;
                _context8.next = 11;
                break;

              case 7:
                _context8.prev = 7;
                _context8.t0 = _context8["catch"](4);

                if (!(_context8.t0.status !== 404)) {
                  _context8.next = 11;
                  break;
                }

                throw _context8.t0;

              case 11:
              case "end":
                return _context8.stop();
            }
          }
        }, _callee8, null, [[4, 7]]);
      }));

      function PublicUserMetadata(_x5) {
        return _PublicUserMetadata.apply(this, arguments);
      }

      return PublicUserMetadata;
    }()
    /**
     * Replace the current user's public library metadata
     *
     * @namedParams
     * @param {Object} metadata - New metadata
     * @param {string=} metadataSubtree - Subtree to replace - modifies root metadata if not specified
     */

  }, {
    key: "ReplacePublicUserMetadata",
    value: function () {
      var _ReplacePublicUserMetadata = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee9(_ref8) {
        var _ref8$metadataSubtree, metadataSubtree, _ref8$metadata, metadata, libraryId;

        return regeneratorRuntime.wrap(function _callee9$(_context9) {
          while (1) {
            switch (_context9.prev = _context9.next) {
              case 0:
                _ref8$metadataSubtree = _ref8.metadataSubtree, metadataSubtree = _ref8$metadataSubtree === void 0 ? "/" : _ref8$metadataSubtree, _ref8$metadata = _ref8.metadata, metadata = _ref8$metadata === void 0 ? {} : _ref8$metadata;
                libraryId = Utils.AddressToLibraryId(this.client.signer.address);
                _context9.next = 4;
                return this.__TouchLibrary();

              case 4:
                _context9.next = 6;
                return this.client.ReplacePublicLibraryMetadata({
                  libraryId: libraryId,
                  metadataSubtree: metadataSubtree,
                  metadata: metadata
                });

              case 6:
                return _context9.abrupt("return", _context9.sent);

              case 7:
              case "end":
                return _context9.stop();
            }
          }
        }, _callee9, this);
      }));

      function ReplacePublicUserMetadata(_x6) {
        return _ReplacePublicUserMetadata.apply(this, arguments);
      }

      return ReplacePublicUserMetadata;
    }()
    /**
     * Delete the specified subtree of the current user's public metadata
     *
     * @namedParams
     * @param {string=} metadataSubtree - Subtree to replace - modifies root metadata if not specified
     */

  }, {
    key: "DeletePublicUserMetadata",
    value: function () {
      var _DeletePublicUserMetadata = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee10(_ref9) {
        var _ref9$metadataSubtree, metadataSubtree, libraryId;

        return regeneratorRuntime.wrap(function _callee10$(_context10) {
          while (1) {
            switch (_context10.prev = _context10.next) {
              case 0:
                _ref9$metadataSubtree = _ref9.metadataSubtree, metadataSubtree = _ref9$metadataSubtree === void 0 ? "/" : _ref9$metadataSubtree;
                libraryId = Utils.AddressToLibraryId(this.client.signer.address);
                _context10.next = 4;
                return this.__TouchLibrary();

              case 4:
                _context10.next = 6;
                return this.client.DeletePublicLibraryMetadata({
                  libraryId: libraryId,
                  metadataSubtree: metadataSubtree
                });

              case 6:
                return _context10.abrupt("return", _context10.sent);

              case 7:
              case "end":
                return _context10.stop();
            }
          }
        }, _callee10, this);
      }));

      function DeletePublicUserMetadata(_x7) {
        return _DeletePublicUserMetadata.apply(this, arguments);
      }

      return DeletePublicUserMetadata;
    }()
    /**
     * Access the current user's private metadata
     *
     * Note: Subject to user's access level
     *
     * @see <a href="#PromptsAndAccessLevels">Prompts and access levels</a>
     *
     * @namedParams
     * @param {string=} metadataSubtree - Subtree of the metadata to retrieve
     * @param {boolean=} noCache=false - If specified, it will always query for metadata instead of returning from the cache
     *
     * @return {Promise<Object>} - The user's private profile metadata - returns undefined if no metadata set or subtree doesn't exist
     */

  }, {
    key: "PrivateUserMetadata",
    value: function () {
      var _PrivateUserMetadata = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee11() {
        var _ref10,
            _ref10$metadataSubtre,
            metadataSubtree,
            _ref10$noCache,
            noCache,
            libraryId,
            objectId,
            metadata,
            _args11 = arguments;

        return regeneratorRuntime.wrap(function _callee11$(_context11) {
          while (1) {
            switch (_context11.prev = _context11.next) {
              case 0:
                _ref10 = _args11.length > 0 && _args11[0] !== undefined ? _args11[0] : {}, _ref10$metadataSubtre = _ref10.metadataSubtree, metadataSubtree = _ref10$metadataSubtre === void 0 ? "/" : _ref10$metadataSubtre, _ref10$noCache = _ref10.noCache, noCache = _ref10$noCache === void 0 ? false : _ref10$noCache;

                if (!(!noCache && this.cachedPrivateMetadata)) {
                  _context11.next = 3;
                  break;
                }

                return _context11.abrupt("return", this.__GetCachedMetadata(metadataSubtree));

              case 3:
                libraryId = Utils.AddressToLibraryId(this.client.signer.address);
                objectId = Utils.AddressToObjectId(this.client.signer.address);
                _context11.next = 7;
                return this.__TouchLibrary();

              case 7:
                if (!noCache) {
                  _context11.next = 11;
                  break;
                }

                _context11.next = 10;
                return this.client.ContentObjectMetadata({
                  libraryId: libraryId,
                  objectId: objectId,
                  metadataSubtree: metadataSubtree
                });

              case 10:
                return _context11.abrupt("return", _context11.sent);

              case 11:
                _context11.next = 13;
                return this.client.ContentObjectMetadata({
                  libraryId: libraryId,
                  objectId: objectId
                });

              case 13:
                metadata = _context11.sent;

                this.__CacheMetadata(metadata);

                return _context11.abrupt("return", this.__GetCachedMetadata(metadataSubtree));

              case 16:
              case "end":
                return _context11.stop();
            }
          }
        }, _callee11, this);
      }));

      function PrivateUserMetadata() {
        return _PrivateUserMetadata.apply(this, arguments);
      }

      return PrivateUserMetadata;
    }()
    /**
     * Merge the current user's public library metadata
     *
     * @namedParams
     * @param {Object} metadata - New metadata
     * @param {string=} metadataSubtree - Subtree to merge into - modifies root metadata if not specified
     */

  }, {
    key: "MergePrivateUserMetadata",
    value: function () {
      var _MergePrivateUserMetadata = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee12(_ref11) {
        var _ref11$metadataSubtre, metadataSubtree, _ref11$metadata, metadata, libraryId, objectId, editRequest;

        return regeneratorRuntime.wrap(function _callee12$(_context12) {
          while (1) {
            switch (_context12.prev = _context12.next) {
              case 0:
                _ref11$metadataSubtre = _ref11.metadataSubtree, metadataSubtree = _ref11$metadataSubtre === void 0 ? "/" : _ref11$metadataSubtre, _ref11$metadata = _ref11.metadata, metadata = _ref11$metadata === void 0 ? {} : _ref11$metadata;
                libraryId = Utils.AddressToLibraryId(this.client.signer.address);
                objectId = Utils.AddressToObjectId(this.client.signer.address);
                _context12.next = 5;
                return this.__TouchLibrary();

              case 5:
                _context12.next = 7;
                return this.client.EditContentObject({
                  libraryId: libraryId,
                  objectId: objectId
                });

              case 7:
                editRequest = _context12.sent;
                _context12.next = 10;
                return this.client.MergeMetadata({
                  libraryId: libraryId,
                  objectId: objectId,
                  writeToken: editRequest.write_token,
                  metadataSubtree: metadataSubtree,
                  metadata: metadata
                });

              case 10:
                _context12.next = 12;
                return this.client.FinalizeContentObject({
                  libraryId: libraryId,
                  objectId: objectId,
                  writeToken: editRequest.write_token
                });

              case 12:
                this.__InvalidateCache();

              case 13:
              case "end":
                return _context12.stop();
            }
          }
        }, _callee12, this);
      }));

      function MergePrivateUserMetadata(_x8) {
        return _MergePrivateUserMetadata.apply(this, arguments);
      }

      return MergePrivateUserMetadata;
    }()
    /**
     * Replace the current user's public library metadata
     *
     * @namedParams
     * @param {Object} metadata - New metadata
     * @param {string=} metadataSubtree - Subtree to replace - modifies root metadata if not specified
     */

  }, {
    key: "ReplacePrivateUserMetadata",
    value: function () {
      var _ReplacePrivateUserMetadata = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee13(_ref12) {
        var _ref12$metadataSubtre, metadataSubtree, _ref12$metadata, metadata, libraryId, objectId, editRequest;

        return regeneratorRuntime.wrap(function _callee13$(_context13) {
          while (1) {
            switch (_context13.prev = _context13.next) {
              case 0:
                _ref12$metadataSubtre = _ref12.metadataSubtree, metadataSubtree = _ref12$metadataSubtre === void 0 ? "/" : _ref12$metadataSubtre, _ref12$metadata = _ref12.metadata, metadata = _ref12$metadata === void 0 ? {} : _ref12$metadata;
                libraryId = Utils.AddressToLibraryId(this.client.signer.address);
                objectId = Utils.AddressToObjectId(this.client.signer.address);
                _context13.next = 5;
                return this.__TouchLibrary();

              case 5:
                _context13.next = 7;
                return this.client.EditContentObject({
                  libraryId: libraryId,
                  objectId: objectId
                });

              case 7:
                editRequest = _context13.sent;
                _context13.next = 10;
                return this.client.ReplaceMetadata({
                  libraryId: libraryId,
                  objectId: objectId,
                  writeToken: editRequest.write_token,
                  metadataSubtree: metadataSubtree,
                  metadata: metadata
                });

              case 10:
                _context13.next = 12;
                return this.client.FinalizeContentObject({
                  libraryId: libraryId,
                  objectId: objectId,
                  writeToken: editRequest.write_token
                });

              case 12:
                this.__InvalidateCache();

              case 13:
              case "end":
                return _context13.stop();
            }
          }
        }, _callee13, this);
      }));

      function ReplacePrivateUserMetadata(_x9) {
        return _ReplacePrivateUserMetadata.apply(this, arguments);
      }

      return ReplacePrivateUserMetadata;
    }()
    /**
     * Delete the specified subtree from the users private metadata
     *
     * @namedParams
     * @param {string=} metadataSubtree - Subtree to delete - deletes all metadata if not specified
     */

  }, {
    key: "DeletePrivateUserMetadata",
    value: function () {
      var _DeletePrivateUserMetadata = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee14(_ref13) {
        var _ref13$metadataSubtre, metadataSubtree, libraryId, objectId, editRequest;

        return regeneratorRuntime.wrap(function _callee14$(_context14) {
          while (1) {
            switch (_context14.prev = _context14.next) {
              case 0:
                _ref13$metadataSubtre = _ref13.metadataSubtree, metadataSubtree = _ref13$metadataSubtre === void 0 ? "/" : _ref13$metadataSubtre;
                libraryId = Utils.AddressToLibraryId(this.client.signer.address);
                objectId = Utils.AddressToObjectId(this.client.signer.address);
                _context14.next = 5;
                return this.__TouchLibrary();

              case 5:
                _context14.next = 7;
                return this.client.EditContentObject({
                  libraryId: libraryId,
                  objectId: objectId
                });

              case 7:
                editRequest = _context14.sent;
                _context14.next = 10;
                return this.client.DeleteMetadata({
                  libraryId: libraryId,
                  objectId: objectId,
                  writeToken: editRequest.write_token,
                  metadataSubtree: metadataSubtree
                });

              case 10:
                _context14.next = 12;
                return this.client.FinalizeContentObject({
                  libraryId: libraryId,
                  objectId: objectId,
                  writeToken: editRequest.write_token
                });

              case 12:
                this.__InvalidateCache();

              case 13:
              case "end":
                return _context14.stop();
            }
          }
        }, _callee14, this);
      }));

      function DeletePrivateUserMetadata(_x10) {
        return _DeletePrivateUserMetadata.apply(this, arguments);
      }

      return DeletePrivateUserMetadata;
    }()
    /**
     * Delete the account library for the current user
     */

  }, {
    key: "DeleteAccountLibrary",
    value: function () {
      var _DeleteAccountLibrary = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee15() {
        var libraryId, path;
        return regeneratorRuntime.wrap(function _callee15$(_context15) {
          while (1) {
            switch (_context15.prev = _context15.next) {
              case 0:
                _context15.next = 2;
                return this.__IsLibraryCreated({
                  accountAddress: this.client.signer.address
                });

              case 2:
                if (_context15.sent) {
                  _context15.next = 4;
                  break;
                }

                return _context15.abrupt("return");

              case 4:
                libraryId = Utils.AddressToLibraryId(this.client.signer.address);
                path = UrlJoin("qlibs", libraryId);
                _context15.t0 = this.client.HttpClient;
                _context15.next = 9;
                return this.client.authClient.AuthorizationHeader({
                  libraryId: libraryId
                });

              case 9:
                _context15.t1 = _context15.sent;
                _context15.t2 = path;
                _context15.t3 = {
                  headers: _context15.t1,
                  method: "DELETE",
                  path: _context15.t2
                };
                _context15.next = 14;
                return _context15.t0.Request.call(_context15.t0, _context15.t3);

              case 14:
                this.libraryCreated = false;

              case 15:
              case "end":
                return _context15.stop();
            }
          }
        }, _callee15, this);
      }));

      function DeleteAccountLibrary() {
        return _DeleteAccountLibrary.apply(this, arguments);
      }

      return DeleteAccountLibrary;
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
      regeneratorRuntime.mark(function _callee16() {
        return regeneratorRuntime.wrap(function _callee16$(_context16) {
          while (1) {
            switch (_context16.prev = _context16.next) {
              case 0:
                _context16.next = 2;
                return this.PrivateUserMetadata({
                  metadataSubtree: "collected_data"
                });

              case 2:
                _context16.t0 = _context16.sent;

                if (_context16.t0) {
                  _context16.next = 5;
                  break;
                }

                _context16.t0 = {};

              case 5:
                return _context16.abrupt("return", _context16.t0);

              case 6:
              case "end":
                return _context16.stop();
            }
          }
        }, _callee16, this);
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
      regeneratorRuntime.mark(function _callee17(_ref14) {
        var libraryId, objectId, versionHash;
        return regeneratorRuntime.wrap(function _callee17$(_context17) {
          while (1) {
            switch (_context17.prev = _context17.next) {
              case 0:
                libraryId = _ref14.libraryId, objectId = _ref14.objectId, versionHash = _ref14.versionHash;
                return _context17.abrupt("return");

              case 5:
                _context17.next = 10;
                break;

              case 7:
                _context17.prev = 7;
                _context17.t0 = _context17["catch"](2);
                // eslint-disable-next-line no-console
                console.error(_context17.t0);

              case 10:
                this.__InvalidateCache();

              case 11:
              case "end":
                return _context17.stop();
            }
          }
        }, _callee17, this, [[2, 7]]);
      }));

      function RecordTags(_x11) {
        return _RecordTags.apply(this, arguments);
      }

      return RecordTags;
    }()
  }, {
    key: "__RecordTags",
    value: function () {
      var _RecordTags2 = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee18(_ref15) {
        var libraryId, objectId, versionHash, seen, userLibraryId, userObjectId, editRequest, contentTags, userTags, formattedTags;
        return regeneratorRuntime.wrap(function _callee18$(_context18) {
          while (1) {
            switch (_context18.prev = _context18.next) {
              case 0:
                libraryId = _ref15.libraryId, objectId = _ref15.objectId, versionHash = _ref15.versionHash;
                _context18.next = 3;
                return this.__TouchLibrary();

              case 3:
                if (versionHash) {
                  _context18.next = 7;
                  break;
                }

                _context18.next = 6;
                return this.client.ContentObject({
                  libraryId: libraryId,
                  objectId: objectId
                });

              case 6:
                versionHash = _context18.sent.hash;

              case 7:
                _context18.next = 9;
                return this.PrivateUserMetadata({
                  metadataSubtree: UrlJoin("accessed_content", versionHash)
                });

              case 9:
                seen = _context18.sent;

                if (!seen) {
                  _context18.next = 12;
                  break;
                }

                return _context18.abrupt("return");

              case 12:
                userLibraryId = Utils.AddressToLibraryId(this.client.signer.address);
                userObjectId = Utils.AddressToObjectId(this.client.signer.address); // Mark content as seen

                _context18.next = 16;
                return this.client.EditContentObject({
                  libraryId: userLibraryId,
                  objectId: userObjectId
                });

              case 16:
                editRequest = _context18.sent;
                _context18.next = 19;
                return this.client.ReplaceMetadata({
                  libraryId: userLibraryId,
                  objectId: userObjectId,
                  writeToken: editRequest.write_token,
                  metadataSubtree: UrlJoin("accessed_content", versionHash),
                  metadata: Date.now()
                });

              case 19:
                _context18.next = 21;
                return this.client.ContentObjectMetadata({
                  libraryId: libraryId,
                  objectId: objectId,
                  versionHash: versionHash,
                  metadataSubtree: "video_tags",
                  noAuth: true
                });

              case 21:
                contentTags = _context18.sent;

                if (!(contentTags && contentTags.length > 0)) {
                  _context18.next = 30;
                  break;
                }

                _context18.next = 25;
                return this.CollectedTags();

              case 25:
                userTags = _context18.sent;
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

                _context18.next = 30;
                return this.client.ReplaceMetadata({
                  libraryId: userLibraryId,
                  objectId: userObjectId,
                  writeToken: editRequest.write_token,
                  metadataSubtree: "collected_data",
                  metadata: userTags
                });

              case 30:
                _context18.next = 32;
                return this.client.FinalizeContentObject({
                  libraryId: userLibraryId,
                  objectId: userObjectId,
                  writeToken: editRequest.write_token
                });

              case 32:
              case "end":
                return _context18.stop();
            }
          }
        }, _callee18, this);
      }));

      function __RecordTags(_x12) {
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
      return ["CollectedTags", "PublicUserMetadata", "PrivateUserMetadata"];
    } // Whitelist of methods allowed to be called using the frame API

  }, {
    key: "FrameAllowedMethods",
    value: function FrameAllowedMethods() {
      var forbiddenMethods = ["constructor", "FrameAllowedMethods", "PromptedMethods", "__CacheMetadata", "__GetCachedMetadata", "__InvalidateCache", "__IsLibraryCreated", "__TouchLibrary", "__FormatVideoTags", "__RecordTags"];
      return Object.getOwnPropertyNames(Object.getPrototypeOf(this)).filter(function (method) {
        return !forbiddenMethods.includes(method);
      });
    }
  }]);

  return UserProfileClient;
}();

module.exports = UserProfileClient;