var _regeneratorRuntime = require("@babel/runtime/regenerator");

var _classCallCheck = require("@babel/runtime/helpers/classCallCheck");

var _createClass = require("@babel/runtime/helpers/createClass");

var Utils = require("./Utils");

var UrlJoin = require("url-join");

var _require = require("./FrameClient"),
    FrameClient = _require.FrameClient;

var _require2 = require("./LogMessage"),
    LogMessage = _require2.LogMessage;

var UserProfileClient =
/*#__PURE__*/
function () {
  "use strict";

  _createClass(UserProfileClient, [{
    key: "Log",
    value: function Log(message) {
      var error = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
      LogMessage(this, message, error);
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
    this.walletAddress = undefined;
    this.walletAddressRetrieved = false;
  }

  _createClass(UserProfileClient, [{
    key: "CreateWallet",
    value: function CreateWallet() {
      var balance, walletCreationEvent, abi, libraryId, objectId, createResponse;
      return _regeneratorRuntime.async(function CreateWallet$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              if (!this.creatingWallet) {
                _context.next = 6;
                break;
              }

            case 1:
              if (!this.creatingWallet) {
                _context.next = 6;
                break;
              }

              _context.next = 4;
              return _regeneratorRuntime.awrap(new Promise(function (resolve) {
                return setTimeout(resolve, 500);
              }));

            case 4:
              _context.next = 1;
              break;

            case 6:
              this.creatingWallet = true;
              _context.prev = 7;

              if (!(!this.walletAddress || Utils.EqualAddress(this.walletAddress, Utils.nullAddress))) {
                _context.next = 23;
                break;
              }

              this.Log("Creating user wallet for user ".concat(this.client.signer.address)); // Don't attempt to create a user wallet if user has no funds

              _context.next = 12;
              return _regeneratorRuntime.awrap(this.client.GetBalance({
                address: this.client.signer.address
              }));

            case 12:
              balance = _context.sent;

              if (!(balance < 0.1)) {
                _context.next = 15;
                break;
              }

              return _context.abrupt("return", undefined);

            case 15:
              _context.next = 17;
              return _regeneratorRuntime.awrap(this.client.CallContractMethodAndWait({
                contractAddress: Utils.HashToAddress(this.client.contentSpaceId),
                methodName: "createAccessWallet",
                methodArgs: []
              }));

            case 17:
              walletCreationEvent = _context.sent;
              _context.next = 20;
              return _regeneratorRuntime.awrap(this.client.ContractAbi({
                contractAddress: this.client.contentSpaceAddress
              }));

            case 20:
              abi = _context.sent;
              this.walletAddress = this.client.ExtractValueFromEvent({
                abi: abi,
                event: walletCreationEvent,
                eventName: "CreateAccessWallet",
                eventValue: "wallet"
              });
              this.userWalletAddresses[Utils.FormatAddress(this.client.signer.address)] = this.walletAddress;

            case 23:
              // Check if wallet object is created
              libraryId = this.client.contentSpaceLibraryId;
              objectId = Utils.AddressToObjectId(this.walletAddress);
              _context.prev = 25;
              _context.next = 28;
              return _regeneratorRuntime.awrap(this.client.ContentObject({
                libraryId: libraryId,
                objectId: objectId
              }));

            case 28:
              _context.next = 39;
              break;

            case 30:
              _context.prev = 30;
              _context.t0 = _context["catch"](25);

              if (!(_context.t0.status === 404)) {
                _context.next = 39;
                break;
              }

              this.Log("Creating wallet object for user ".concat(this.client.signer.address));
              _context.next = 36;
              return _regeneratorRuntime.awrap(this.client.CreateContentObject({
                libraryId: libraryId,
                objectId: objectId
              }));

            case 36:
              createResponse = _context.sent;
              _context.next = 39;
              return _regeneratorRuntime.awrap(this.client.FinalizeContentObject({
                libraryId: libraryId,
                objectId: objectId,
                writeToken: createResponse.write_token,
                commitMessage: "Create user wallet object"
              }));

            case 39:
              _context.next = 45;
              break;

            case 41:
              _context.prev = 41;
              _context.t1 = _context["catch"](7);
              // eslint-disable-next-line no-console
              console.error("Failed to create wallet contract:"); // eslint-disable-next-line no-console

              console.error(_context.t1);

            case 45:
              _context.prev = 45;
              this.creatingWallet = false;
              return _context.finish(45);

            case 48:
            case "end":
              return _context.stop();
          }
        }
      }, null, this, [[7, 41, 45, 48], [25, 30]]);
    }
    /**
     * Get the contract address of the current user's BaseAccessWallet contract
     *
     * @return {Promise<string>} - The contract address of the current user's wallet contract
     */

  }, {
    key: "WalletAddress",
    value: function WalletAddress() {
      var autoCreate,
          walletAddress,
          _args2 = arguments;
      return _regeneratorRuntime.async(function WalletAddress$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              autoCreate = _args2.length > 0 && _args2[0] !== undefined ? _args2[0] : true;

              if (!(this.walletAddress || this.walletAddressRetrieved)) {
                _context2.next = 3;
                break;
              }

              return _context2.abrupt("return", this.walletAddress);

            case 3:
              if (!this.walletAddressPromise) {
                this.walletAddressPromise = this.client.CallContractMethod({
                  contractAddress: Utils.HashToAddress(this.client.contentSpaceId),
                  methodName: "userWallets",
                  methodArgs: [this.client.signer.address]
                });
              }

              _context2.next = 6;
              return _regeneratorRuntime.awrap(this.walletAddressPromise);

            case 6:
              walletAddress = _context2.sent;

              if (!Utils.EqualAddress(walletAddress, Utils.nullAddress)) {
                this.walletAddress = walletAddress;
              }

              if (!(!this.walletAddress && autoCreate)) {
                _context2.next = 11;
                break;
              }

              _context2.next = 11;
              return _regeneratorRuntime.awrap(this.CreateWallet());

            case 11:
              this.walletAddressRetrieved = true;
              return _context2.abrupt("return", this.walletAddress);

            case 13:
            case "end":
              return _context2.stop();
          }
        }
      }, null, this);
    }
    /**
     * Get the user wallet address for the specified user, if it exists
     *
     * @namedParams
     * @param {string} address - The address of the user
     *
     * @return {Promise<string>} - The wallet address of the specified user, if it exists
     */

  }, {
    key: "UserWalletAddress",
    value: function UserWalletAddress(_ref2) {
      var address, walletAddress;
      return _regeneratorRuntime.async(function UserWalletAddress$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              address = _ref2.address;

              if (!Utils.EqualAddress(address, this.client.signer.address)) {
                _context3.next = 5;
                break;
              }

              _context3.next = 4;
              return _regeneratorRuntime.awrap(this.WalletAddress());

            case 4:
              return _context3.abrupt("return", _context3.sent);

            case 5:
              if (this.userWalletAddresses[address]) {
                _context3.next = 11;
                break;
              }

              this.Log("Retrieving user wallet address for user ".concat(address));
              _context3.next = 9;
              return _regeneratorRuntime.awrap(this.client.CallContractMethod({
                contractAddress: Utils.HashToAddress(this.client.contentSpaceId),
                methodName: "userWallets",
                methodArgs: [address]
              }));

            case 9:
              walletAddress = _context3.sent;

              if (!Utils.EqualAddress(walletAddress, Utils.nullAddress)) {
                this.userWalletAddresses[address] = walletAddress;
              }

            case 11:
              return _context3.abrupt("return", this.userWalletAddresses[address]);

            case 12:
            case "end":
              return _context3.stop();
          }
        }
      }, null, this);
    }
    /**
     * Retrieve the user wallet object information (library ID and object ID)
     *
     * The user's wallet can be modified in the same way as any other object, using
     * EditContentObject to get a write token, modification methods to change it,
     * and FinalizeContentObject to finalize the draft
     *
     * @return {Promise<{Object}>} - An object containing the libraryId and objectId for the wallet object.
     */

  }, {
    key: "UserWalletObjectInfo",
    value: function UserWalletObjectInfo() {
      var _ref3,
          address,
          walletAddress,
          _args4 = arguments;

      return _regeneratorRuntime.async(function UserWalletObjectInfo$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              _ref3 = _args4.length > 0 && _args4[0] !== undefined ? _args4[0] : {}, address = _ref3.address;

              if (!address) {
                _context4.next = 7;
                break;
              }

              _context4.next = 4;
              return _regeneratorRuntime.awrap(this.UserWalletAddress({
                address: address
              }));

            case 4:
              _context4.t0 = _context4.sent;
              _context4.next = 10;
              break;

            case 7:
              _context4.next = 9;
              return _regeneratorRuntime.awrap(this.WalletAddress());

            case 9:
              _context4.t0 = _context4.sent;

            case 10:
              walletAddress = _context4.t0;
              return _context4.abrupt("return", {
                libraryId: this.client.contentSpaceLibraryId,
                objectId: walletAddress ? Utils.AddressToObjectId(walletAddress) : ""
              });

            case 12:
            case "end":
              return _context4.stop();
          }
        }
      }, null, this);
    }
    /**
     * Access the specified user's public profile metadata
     *
     * @namedParams
     * @param {string=} address - The address of the user
     * @param {string=} metadataSubtree - Subtree of the metadata to retrieve
     * @param {Object=} queryParams={} - Additional query params for the call
     * @param {Array<string>=} select - Limit the returned metadata to the specified attributes
     * - Note: Selection is relative to "metadataSubtree". For example, metadataSubtree="public" and select=["name", "description"] would select "public/name" and "public/description"
     * @param {boolean=} resolveLinks=false - If specified, links in the metadata will be resolved
     * @param {boolean=} resolveIncludeSource=false - If specified, resolved links will include the hash of the link at the root of the metadata
          Example:
          {
            "resolved-link": {
              ".": {
                "source": "hq__HPXNia6UtXyuUr6G3Lih8PyUhvYYHuyLTt3i7qSfYgYBB7sF1suR7ky7YRXsUARUrTB1Um1x5a"
              },
              "public": {
                "name": "My Linked Object",
              }
              ...
            }
         }
      * @param {boolean=} resolveIgnoreErrors=false - If specified, link errors within the requested metadata will not cause the entire response to result in an error
     * @param {number=} linkDepthLimit=1 - Limit link resolution to the specified depth. Default link depth is 1 (only links directly in the object's metadata will be resolved)
     *
     * @return {Promise<Object|string>}
     */

  }, {
    key: "PublicUserMetadata",
    value: function PublicUserMetadata(_ref4) {
      var address, _ref4$metadataSubtree, metadataSubtree, _ref4$queryParams, queryParams, _ref4$select, select, _ref4$resolveLinks, resolveLinks, _ref4$resolveIncludeS, resolveIncludeSource, _ref4$resolveIgnoreEr, resolveIgnoreErrors, _ref4$linkDepthLimit, linkDepthLimit, walletAddress, _ref5, libraryId, objectId;

      return _regeneratorRuntime.async(function PublicUserMetadata$(_context5) {
        while (1) {
          switch (_context5.prev = _context5.next) {
            case 0:
              address = _ref4.address, _ref4$metadataSubtree = _ref4.metadataSubtree, metadataSubtree = _ref4$metadataSubtree === void 0 ? "/" : _ref4$metadataSubtree, _ref4$queryParams = _ref4.queryParams, queryParams = _ref4$queryParams === void 0 ? {} : _ref4$queryParams, _ref4$select = _ref4.select, select = _ref4$select === void 0 ? [] : _ref4$select, _ref4$resolveLinks = _ref4.resolveLinks, resolveLinks = _ref4$resolveLinks === void 0 ? false : _ref4$resolveLinks, _ref4$resolveIncludeS = _ref4.resolveIncludeSource, resolveIncludeSource = _ref4$resolveIncludeS === void 0 ? false : _ref4$resolveIncludeS, _ref4$resolveIgnoreEr = _ref4.resolveIgnoreErrors, resolveIgnoreErrors = _ref4$resolveIgnoreEr === void 0 ? false : _ref4$resolveIgnoreEr, _ref4$linkDepthLimit = _ref4.linkDepthLimit, linkDepthLimit = _ref4$linkDepthLimit === void 0 ? 1 : _ref4$linkDepthLimit;

              if (address) {
                _context5.next = 3;
                break;
              }

              return _context5.abrupt("return");

            case 3:
              _context5.next = 5;
              return _regeneratorRuntime.awrap(this.UserWalletAddress({
                address: address
              }));

            case 5:
              walletAddress = _context5.sent;

              if (walletAddress) {
                _context5.next = 8;
                break;
              }

              return _context5.abrupt("return");

            case 8:
              metadataSubtree = UrlJoin("public", metadataSubtree || "/");
              _context5.next = 11;
              return _regeneratorRuntime.awrap(this.UserWalletObjectInfo({
                address: address
              }));

            case 11:
              _ref5 = _context5.sent;
              libraryId = _ref5.libraryId;
              objectId = _ref5.objectId;

              if (objectId) {
                _context5.next = 16;
                break;
              }

              return _context5.abrupt("return");

            case 16:
              _context5.next = 18;
              return _regeneratorRuntime.awrap(this.client.ContentObjectMetadata({
                libraryId: libraryId,
                objectId: objectId,
                queryParams: queryParams,
                select: select,
                metadataSubtree: metadataSubtree,
                resolveLinks: resolveLinks,
                resolveIncludeSource: resolveIncludeSource,
                resolveIgnoreErrors: resolveIgnoreErrors,
                linkDepthLimit: linkDepthLimit
              }));

            case 18:
              return _context5.abrupt("return", _context5.sent);

            case 19:
            case "end":
              return _context5.stop();
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
     * @param {Object=} queryParams={} - Additional query params for the call
     * @param {Array<string>=} select - Limit the returned metadata to the specified attributes
     * - Note: Selection is relative to "metadataSubtree". For example, metadataSubtree="public" and select=["name", "description"] would select "public/name" and "public/description"
     * @param {boolean=} resolveLinks=false - If specified, links in the metadata will be resolved
     * @param {boolean=} resolveIncludeSource=false - If specified, resolved links will include the hash of the link at the root of the metadata
          Example:
          {
            "resolved-link": {
              ".": {
                "source": "hq__HPXNia6UtXyuUr6G3Lih8PyUhvYYHuyLTt3i7qSfYgYBB7sF1suR7ky7YRXsUARUrTB1Um1x5a"
              },
              "public": {
                "name": "My Linked Object",
              }
              ...
            }
         }
      * @param {boolean=} resolveIgnoreErrors=false - If specified, link errors within the requested metadata will not cause the entire response to result in an error
     * @param {number=} linkDepthLimit=1 - Limit link resolution to the specified depth. Default link depth is 1 (only links directly in the object's metadata will be resolved)
     *
     * @return {Promise<Object|string>} - The user's profile metadata - returns undefined if no metadata set or subtree doesn't exist
     */

  }, {
    key: "UserMetadata",
    value: function UserMetadata() {
      var _ref6,
          _ref6$metadataSubtree,
          metadataSubtree,
          _ref6$queryParams,
          queryParams,
          _ref6$select,
          select,
          _ref6$resolveLinks,
          resolveLinks,
          _ref6$resolveIncludeS,
          resolveIncludeSource,
          _ref6$resolveIgnoreEr,
          resolveIgnoreErrors,
          _ref6$linkDepthLimit,
          linkDepthLimit,
          _ref7,
          libraryId,
          objectId,
          _args6 = arguments;

      return _regeneratorRuntime.async(function UserMetadata$(_context6) {
        while (1) {
          switch (_context6.prev = _context6.next) {
            case 0:
              _ref6 = _args6.length > 0 && _args6[0] !== undefined ? _args6[0] : {}, _ref6$metadataSubtree = _ref6.metadataSubtree, metadataSubtree = _ref6$metadataSubtree === void 0 ? "/" : _ref6$metadataSubtree, _ref6$queryParams = _ref6.queryParams, queryParams = _ref6$queryParams === void 0 ? {} : _ref6$queryParams, _ref6$select = _ref6.select, select = _ref6$select === void 0 ? [] : _ref6$select, _ref6$resolveLinks = _ref6.resolveLinks, resolveLinks = _ref6$resolveLinks === void 0 ? false : _ref6$resolveLinks, _ref6$resolveIncludeS = _ref6.resolveIncludeSource, resolveIncludeSource = _ref6$resolveIncludeS === void 0 ? false : _ref6$resolveIncludeS, _ref6$resolveIgnoreEr = _ref6.resolveIgnoreErrors, resolveIgnoreErrors = _ref6$resolveIgnoreEr === void 0 ? false : _ref6$resolveIgnoreEr, _ref6$linkDepthLimit = _ref6.linkDepthLimit, linkDepthLimit = _ref6$linkDepthLimit === void 0 ? 1 : _ref6$linkDepthLimit;
              this.Log("Accessing private user metadata at ".concat(metadataSubtree));
              _context6.next = 4;
              return _regeneratorRuntime.awrap(this.UserWalletObjectInfo());

            case 4:
              _ref7 = _context6.sent;
              libraryId = _ref7.libraryId;
              objectId = _ref7.objectId;
              _context6.next = 9;
              return _regeneratorRuntime.awrap(this.client.ContentObjectMetadata({
                libraryId: libraryId,
                objectId: objectId,
                metadataSubtree: metadataSubtree,
                queryParams: queryParams,
                select: select,
                resolveLinks: resolveLinks,
                resolveIncludeSource: resolveIncludeSource,
                resolveIgnoreErrors: resolveIgnoreErrors,
                linkDepthLimit: linkDepthLimit
              }));

            case 9:
              return _context6.abrupt("return", _context6.sent);

            case 10:
            case "end":
              return _context6.stop();
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
    value: function MergeUserMetadata(_ref8) {
      var _ref8$metadataSubtree, metadataSubtree, _ref8$metadata, metadata, _ref9, libraryId, objectId, editRequest;

      return _regeneratorRuntime.async(function MergeUserMetadata$(_context7) {
        while (1) {
          switch (_context7.prev = _context7.next) {
            case 0:
              _ref8$metadataSubtree = _ref8.metadataSubtree, metadataSubtree = _ref8$metadataSubtree === void 0 ? "/" : _ref8$metadataSubtree, _ref8$metadata = _ref8.metadata, metadata = _ref8$metadata === void 0 ? {} : _ref8$metadata;
              this.Log("Merging user metadata at ".concat(metadataSubtree));
              _context7.next = 4;
              return _regeneratorRuntime.awrap(this.UserWalletObjectInfo());

            case 4:
              _ref9 = _context7.sent;
              libraryId = _ref9.libraryId;
              objectId = _ref9.objectId;
              _context7.next = 9;
              return _regeneratorRuntime.awrap(this.client.EditContentObject({
                libraryId: libraryId,
                objectId: objectId
              }));

            case 9:
              editRequest = _context7.sent;
              _context7.next = 12;
              return _regeneratorRuntime.awrap(this.client.MergeMetadata({
                libraryId: libraryId,
                objectId: objectId,
                writeToken: editRequest.write_token,
                metadataSubtree: metadataSubtree,
                metadata: metadata
              }));

            case 12:
              _context7.next = 14;
              return _regeneratorRuntime.awrap(this.client.FinalizeContentObject({
                libraryId: libraryId,
                objectId: objectId,
                writeToken: editRequest.write_token,
                commitMessage: "Merge user metadata"
              }));

            case 14:
            case "end":
              return _context7.stop();
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
    value: function ReplaceUserMetadata(_ref10) {
      var _ref10$metadataSubtre, metadataSubtree, _ref10$metadata, metadata, _ref11, libraryId, objectId, editRequest;

      return _regeneratorRuntime.async(function ReplaceUserMetadata$(_context8) {
        while (1) {
          switch (_context8.prev = _context8.next) {
            case 0:
              _ref10$metadataSubtre = _ref10.metadataSubtree, metadataSubtree = _ref10$metadataSubtre === void 0 ? "/" : _ref10$metadataSubtre, _ref10$metadata = _ref10.metadata, metadata = _ref10$metadata === void 0 ? {} : _ref10$metadata;
              this.Log("Replacing user metadata at ".concat(metadataSubtree));
              _context8.next = 4;
              return _regeneratorRuntime.awrap(this.UserWalletObjectInfo());

            case 4:
              _ref11 = _context8.sent;
              libraryId = _ref11.libraryId;
              objectId = _ref11.objectId;
              _context8.next = 9;
              return _regeneratorRuntime.awrap(this.client.EditContentObject({
                libraryId: libraryId,
                objectId: objectId
              }));

            case 9:
              editRequest = _context8.sent;
              _context8.next = 12;
              return _regeneratorRuntime.awrap(this.client.ReplaceMetadata({
                libraryId: libraryId,
                objectId: objectId,
                writeToken: editRequest.write_token,
                metadataSubtree: metadataSubtree,
                metadata: metadata
              }));

            case 12:
              _context8.next = 14;
              return _regeneratorRuntime.awrap(this.client.FinalizeContentObject({
                libraryId: libraryId,
                objectId: objectId,
                writeToken: editRequest.write_token,
                commitMessage: "Replace user metadata"
              }));

            case 14:
            case "end":
              return _context8.stop();
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
    value: function DeleteUserMetadata(_ref12) {
      var _ref12$metadataSubtre, metadataSubtree, _ref13, libraryId, objectId, editRequest;

      return _regeneratorRuntime.async(function DeleteUserMetadata$(_context9) {
        while (1) {
          switch (_context9.prev = _context9.next) {
            case 0:
              _ref12$metadataSubtre = _ref12.metadataSubtree, metadataSubtree = _ref12$metadataSubtre === void 0 ? "/" : _ref12$metadataSubtre;
              this.Log("Deleting user metadata at ".concat(metadataSubtree));
              _context9.next = 4;
              return _regeneratorRuntime.awrap(this.UserWalletObjectInfo());

            case 4:
              _ref13 = _context9.sent;
              libraryId = _ref13.libraryId;
              objectId = _ref13.objectId;
              _context9.next = 9;
              return _regeneratorRuntime.awrap(this.client.EditContentObject({
                libraryId: libraryId,
                objectId: objectId
              }));

            case 9:
              editRequest = _context9.sent;
              _context9.next = 12;
              return _regeneratorRuntime.awrap(this.client.DeleteMetadata({
                libraryId: libraryId,
                objectId: objectId,
                writeToken: editRequest.write_token,
                metadataSubtree: metadataSubtree
              }));

            case 12:
              _context9.next = 14;
              return _regeneratorRuntime.awrap(this.client.FinalizeContentObject({
                libraryId: libraryId,
                objectId: objectId,
                writeToken: editRequest.write_token,
                commitMessage: "Delete user metadata"
              }));

            case 14:
            case "end":
              return _context9.stop();
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
      return _regeneratorRuntime.async(function AccessLevel$(_context10) {
        while (1) {
          switch (_context10.prev = _context10.next) {
            case 0:
              _context10.next = 2;
              return _regeneratorRuntime.awrap(this.UserMetadata({
                metadataSubtree: "access_level"
              }));

            case 2:
              _context10.t0 = _context10.sent;

              if (_context10.t0) {
                _context10.next = 5;
                break;
              }

              _context10.t0 = "prompt";

            case 5:
              return _context10.abrupt("return", _context10.t0);

            case 6:
            case "end":
              return _context10.stop();
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
    value: function SetAccessLevel(_ref14) {
      var level;
      return _regeneratorRuntime.async(function SetAccessLevel$(_context11) {
        while (1) {
          switch (_context11.prev = _context11.next) {
            case 0:
              level = _ref14.level;
              level = level.toLowerCase();

              if (["private", "prompt", "public"].includes(level)) {
                _context11.next = 4;
                break;
              }

              throw new Error("Invalid access level: " + level);

            case 4:
              _context11.next = 6;
              return _regeneratorRuntime.awrap(this.ReplaceUserMetadata({
                metadataSubtree: "access_level",
                metadata: level
              }));

            case 6:
            case "end":
              return _context11.stop();
          }
        }
      }, null, this);
    }
    /**
     * Return the ID of the tenant this user belongs to, if set.
     *
     * @return {Promise<string>} - Tenant ID
     */

  }, {
    key: "TenantId",
    value: function TenantId() {
      return _regeneratorRuntime.async(function TenantId$(_context12) {
        while (1) {
          switch (_context12.prev = _context12.next) {
            case 0:
              if (this.tenantId) {
                _context12.next = 4;
                break;
              }

              _context12.next = 3;
              return _regeneratorRuntime.awrap(this.UserMetadata({
                metadataSubtree: "tenantId"
              }));

            case 3:
              this.tenantId = _context12.sent;

            case 4:
              return _context12.abrupt("return", this.tenantId);

            case 5:
            case "end":
              return _context12.stop();
          }
        }
      }, null, this);
    }
    /**
     * Set the current user's tenant
     *
     * Note: This method is not accessible to applications. Eluvio core will drop the request.
     *
     * @namedParams
     * @param {string} id - The tenant ID in hash format
     * @param {string} address - The group address to use in the hash if id is not provided
     */

  }, {
    key: "SetTenantId",
    value: function SetTenantId(_ref15) {
      var id, address, version;
      return _regeneratorRuntime.async(function SetTenantId$(_context13) {
        while (1) {
          switch (_context13.prev = _context13.next) {
            case 0:
              id = _ref15.id, address = _ref15.address;

              if (!(id && (!id.startsWith("iten") || !Utils.ValidHash(id)))) {
                _context13.next = 3;
                break;
              }

              throw Error("Invalid tenant ID: ".concat(id));

            case 3:
              if (!address) {
                _context13.next = 7;
                break;
              }

              if (Utils.ValidAddress(address)) {
                _context13.next = 6;
                break;
              }

              throw Error("Invalid address: ".concat(address));

            case 6:
              id = "iten".concat(Utils.AddressToHash(address));

            case 7:
              _context13.prev = 7;
              _context13.next = 10;
              return _regeneratorRuntime.awrap(this.client.AccessType({
                id: id
              }));

            case 10:
              version = _context13.sent;

              if (!(version !== this.client.authClient.ACCESS_TYPES.GROUP)) {
                _context13.next = 13;
                break;
              }

              throw Error("Invalid tenant ID: " + id);

            case 13:
              _context13.next = 18;
              break;

            case 15:
              _context13.prev = 15;
              _context13.t0 = _context13["catch"](7);
              throw Error("Invalid tenant ID: " + id);

            case 18:
              _context13.next = 20;
              return _regeneratorRuntime.awrap(this.ReplaceUserMetadata({
                metadataSubtree: "tenantId",
                metadata: id
              }));

            case 20:
              this.tenantId = id;

            case 21:
            case "end":
              return _context13.stop();
          }
        }
      }, null, this, [[7, 15]]);
    }
    /**
     * Get the URL of the current user's profile image
     *
     * Note: Part hash of profile image will be appended to the URL as a query parameter to invalidate
     * browser caching when the image is updated
     *
     * @namedParams
     * @param {string=} address - The address of the user. If not specified, the address of the current user will be used.
     * @param {number=} height - If specified, the image will be scaled to the specified maximum height
     *
     * @see <a href="Utils.html#.ResizeImage">Utils#ResizeImage</a>
     *
     * @return {Promise<string | undefined>} - URL of the user's profile image. Will be undefined if no profile image is set.
     */

  }, {
    key: "UserProfileImage",
    value: function UserProfileImage() {
      var _ref16,
          address,
          height,
          walletAddress,
          _ref17,
          libraryId,
          objectId,
          _args14 = arguments;

      return _regeneratorRuntime.async(function UserProfileImage$(_context14) {
        while (1) {
          switch (_context14.prev = _context14.next) {
            case 0:
              _ref16 = _args14.length > 0 && _args14[0] !== undefined ? _args14[0] : {}, address = _ref16.address, height = _ref16.height;

              if (!address) {
                _context14.next = 7;
                break;
              }

              _context14.next = 4;
              return _regeneratorRuntime.awrap(this.UserWalletAddress({
                address: address
              }));

            case 4:
              walletAddress = _context14.sent;
              _context14.next = 9;
              break;

            case 7:
              address = this.client.signer.address;
              walletAddress = this.walletAddress;

            case 9:
              if (walletAddress) {
                _context14.next = 11;
                break;
              }

              return _context14.abrupt("return");

            case 11:
              _context14.next = 13;
              return _regeneratorRuntime.awrap(this.UserWalletObjectInfo({
                address: address
              }));

            case 13:
              _ref17 = _context14.sent;
              libraryId = _ref17.libraryId;
              objectId = _ref17.objectId;
              return _context14.abrupt("return", this.client.ContentObjectImageUrl({
                libraryId: libraryId,
                objectId: objectId,
                height: height,
                imagePath: "public/profile_image"
              }));

            case 17:
            case "end":
              return _context14.stop();
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
    value: function SetUserProfileImage(_ref18) {
      var image, size, _ref19, libraryId, objectId, editRequest;

      return _regeneratorRuntime.async(function SetUserProfileImage$(_context15) {
        while (1) {
          switch (_context15.prev = _context15.next) {
            case 0:
              image = _ref18.image;
              this.Log("Setting profile image for user ".concat(this.client.signer.address));
              size = image.length || image.byteLength || image.size;

              if (!(size > 5000000)) {
                _context15.next = 5;
                break;
              }

              throw Error("Maximum profile image size is 5MB");

            case 5:
              _context15.next = 7;
              return _regeneratorRuntime.awrap(this.UserWalletObjectInfo());

            case 7:
              _ref19 = _context15.sent;
              libraryId = _ref19.libraryId;
              objectId = _ref19.objectId;
              _context15.next = 12;
              return _regeneratorRuntime.awrap(this.client.EditContentObject({
                libraryId: libraryId,
                objectId: objectId
              }));

            case 12:
              editRequest = _context15.sent;
              _context15.next = 15;
              return _regeneratorRuntime.awrap(this.client.SetContentObjectImage({
                libraryId: libraryId,
                objectId: objectId,
                writeToken: editRequest.write_token,
                image: image,
                imageName: "profile_image",
                imagePath: "public/profile_image"
              }));

            case 15:
              _context15.next = 17;
              return _regeneratorRuntime.awrap(this.client.FinalizeContentObject({
                libraryId: libraryId,
                objectId: objectId,
                writeToken: editRequest.write_token,
                commitMessage: "Set user profile image"
              }));

            case 17:
            case "end":
              return _context15.stop();
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
      return _regeneratorRuntime.async(function CollectedTags$(_context16) {
        while (1) {
          switch (_context16.prev = _context16.next) {
            case 0:
              _context16.next = 2;
              return _regeneratorRuntime.awrap(this.UserMetadata({
                metadataSubtree: "collected_data"
              }));

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
      }, null, this);
    } // Ensure recording tags never causes action to fail

  }, {
    key: "RecordTags",
    value: function RecordTags(_ref20) {
      var libraryId, objectId, versionHash;
      return _regeneratorRuntime.async(function RecordTags$(_context17) {
        while (1) {
          switch (_context17.prev = _context17.next) {
            case 0:
              libraryId = _ref20.libraryId, objectId = _ref20.objectId, versionHash = _ref20.versionHash;
              _context17.prev = 1;
              _context17.next = 4;
              return _regeneratorRuntime.awrap(this.__RecordTags({
                libraryId: libraryId,
                objectId: objectId,
                versionHash: versionHash
              }));

            case 4:
              _context17.next = 9;
              break;

            case 6:
              _context17.prev = 6;
              _context17.t0 = _context17["catch"](1);
              // eslint-disable-next-line no-console
              console.error(_context17.t0);

            case 9:
            case "end":
              return _context17.stop();
          }
        }
      }, null, this, [[1, 6]]);
    }
  }, {
    key: "__RecordTags",
    value: function __RecordTags(_ref21) {
      var libraryId, objectId, versionHash, accessType, seen, walletObjectInfo, userLibraryId, userObjectId, editRequest, contentTags, userTags, formattedTags;
      return _regeneratorRuntime.async(function __RecordTags$(_context18) {
        while (1) {
          switch (_context18.prev = _context18.next) {
            case 0:
              libraryId = _ref21.libraryId, objectId = _ref21.objectId, versionHash = _ref21.versionHash;
              _context18.next = 3;
              return _regeneratorRuntime.awrap(this.client.AccessType({
                id: objectId
              }));

            case 3:
              accessType = _context18.sent;

              if (!(accessType !== "object")) {
                _context18.next = 6;
                break;
              }

              return _context18.abrupt("return");

            case 6:
              if (!(!versionHash && !libraryId)) {
                _context18.next = 10;
                break;
              }

              _context18.next = 9;
              return _regeneratorRuntime.awrap(this.client.ContentObjectLibraryId({
                objectId: objectId
              }));

            case 9:
              libraryId = _context18.sent;

            case 10:
              if (versionHash) {
                _context18.next = 14;
                break;
              }

              _context18.next = 13;
              return _regeneratorRuntime.awrap(this.client.ContentObject({
                libraryId: libraryId,
                objectId: objectId
              }));

            case 13:
              versionHash = _context18.sent.hash;

            case 14:
              _context18.next = 16;
              return _regeneratorRuntime.awrap(this.UserMetadata({
                metadataSubtree: UrlJoin("accessed_content", versionHash)
              }));

            case 16:
              seen = _context18.sent;

              if (!seen) {
                _context18.next = 19;
                break;
              }

              return _context18.abrupt("return");

            case 19:
              _context18.next = 21;
              return _regeneratorRuntime.awrap(this.UserWalletObjectInfo());

            case 21:
              walletObjectInfo = _context18.sent;
              userLibraryId = walletObjectInfo.libraryId;
              userObjectId = walletObjectInfo.objectId; // Mark content as seen

              _context18.next = 26;
              return _regeneratorRuntime.awrap(this.client.EditContentObject({
                libraryId: userLibraryId,
                objectId: userObjectId
              }));

            case 26:
              editRequest = _context18.sent;
              _context18.next = 29;
              return _regeneratorRuntime.awrap(this.client.ReplaceMetadata({
                libraryId: userLibraryId,
                objectId: userObjectId,
                writeToken: editRequest.write_token,
                metadataSubtree: UrlJoin("accessed_content", versionHash),
                metadata: Date.now()
              }));

            case 29:
              _context18.next = 31;
              return _regeneratorRuntime.awrap(this.client.ContentObjectMetadata({
                libraryId: libraryId,
                objectId: objectId,
                versionHash: versionHash,
                metadataSubtree: "video_tags"
              }));

            case 31:
              contentTags = _context18.sent;

              if (!(contentTags && contentTags.length > 0)) {
                _context18.next = 40;
                break;
              }

              _context18.next = 35;
              return _regeneratorRuntime.awrap(this.CollectedTags());

            case 35:
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

              _context18.next = 40;
              return _regeneratorRuntime.awrap(this.client.ReplaceMetadata({
                libraryId: userLibraryId,
                objectId: userObjectId,
                writeToken: editRequest.write_token,
                metadataSubtree: "collected_data",
                metadata: userTags
              }));

            case 40:
              _context18.next = 42;
              return _regeneratorRuntime.awrap(this.client.FinalizeContentObject({
                libraryId: userLibraryId,
                objectId: userObjectId,
                writeToken: editRequest.write_token,
                commitMessage: "Record user tags",
                awaitCommitConfirmation: false
              }));

            case 42:
            case "end":
              return _context18.stop();
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
      var forbiddenMethods = ["constructor", "FrameAllowedMethods", "Log", "MetadataMethods", "PromptedMethods", "RecordTags", "SetAccessLevel", "SetTenantId", "SetUserProfileImage", "__IsLibraryCreated", "__TouchLibrary", "__FormatVideoTags", "__RecordTags"];
      return Object.getOwnPropertyNames(Object.getPrototypeOf(this)).filter(function (method) {
        return !forbiddenMethods.includes(method);
      });
    }
  }]);

  return UserProfileClient;
}();

module.exports = UserProfileClient;