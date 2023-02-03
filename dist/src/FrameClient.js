var _defineProperty = require("@babel/runtime/helpers/defineProperty");
var _regeneratorRuntime = require("@babel/runtime/regenerator");
var _asyncToGenerator = require("@babel/runtime/helpers/asyncToGenerator");
var _classCallCheck = require("@babel/runtime/helpers/classCallCheck");
var _createClass = require("@babel/runtime/helpers/createClass");
function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }
function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }
function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
var Id = require("./Id");
var Utils = require("./Utils");
var permissionLevels = require("./client/ContentAccess").permissionLevels;
var _require = require("./LogMessage"),
  LogMessage = _require.LogMessage;
var Crypto = require("./Crypto");
var FrameClient = /*#__PURE__*/function () {
  "use strict";

  /**
   * FrameClient is a client that looks to the user like an ElvClient, but works by passing messages
   * to another frame with an actual ElvClient instead of making the calls itself.
   *
   * The purpose of this is to isolate users' private keys and the usage thereof in one trusted application,
   * while still allowing other (possibly less trustworthy) applications to communicate with the content fabric
   * on behalf of the user from a sandboxed IFrame.
   *
   * FrameClient has available almost all of the same methods as ElvClient, and should be transparently
   * interchangable with it from a usage perspective.
   *
   * The methods available in FrameClient are generated automatically from ElvClient. These methods will use a
   * messaging protocol to communicate intent to a specified frame, which can listen for such messages, perform
   * the actions using the real ElvClient, and return the results via a response message.
   *
   * Because the privileged frame is doing the actual work, it may decide to allow or disallow any actions
   * it sees fit - for example, limiting a dependent app to a few safe calls while preventing it from making any
   * significant changes.
   *
   * The most important aspect of this architecture is to prevent leaking of users' private keys. Be careful when
   * setting up a project using this architecture - make sure the untrusted app is properly contained in a sandboxed
   * IFrame and served from a different origin than the privileged app.
   *
   * @see test/frames/Parent.html and test/frames/Client.html for an example setup using this scheme
   *
   * @namedParams
   * @param {Object} target - The window or frame that will listen for messages produced by this client
   * @param {number} timeout - How long to wait for a response after calling a method before giving up
   * and generating a timeout error
   */
  function FrameClient() {
    var _this = this;
    var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
      target = _ref.target,
      _ref$timeout = _ref.timeout,
      timeout = _ref$timeout === void 0 ? 30 : _ref$timeout;
    _classCallCheck(this, FrameClient);
    this.permissionLevels = permissionLevels;
    if (!target && typeof window !== "undefined" && window.parent) {
      target = window.parent;
    }
    this.target = target;
    this.timeout = timeout;
    this.utils = Utils;
    this.Crypto = Crypto;
    this.Crypto.ElvCrypto();

    // Dynamically defined methods defined in AllowedMethods
    var _iterator = _createForOfIteratorHelper(this.AllowedMethods()),
      _step;
    try {
      var _loop = function _loop() {
        var methodName = _step.value;
        _this[methodName] = /*#__PURE__*/function () {
          var _ref2 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee(args) {
            var callback;
            return _regeneratorRuntime.wrap(function _callee$(_context) {
              while (1) switch (_context.prev = _context.next) {
                case 0:
                  callback = args && args.callback;
                  if (callback) {
                    delete args.callback;
                  }
                  _context.next = 4;
                  return _this.SendMessage({
                    options: {
                      calledMethod: methodName,
                      args: _this.utils.MakeClonable(args)
                    },
                    callback: callback
                  });
                case 4:
                  return _context.abrupt("return", _context.sent);
                case 5:
                case "end":
                  return _context.stop();
              }
            }, _callee);
          }));
          return function (_x) {
            return _ref2.apply(this, arguments);
          };
        }();
      };
      for (_iterator.s(); !(_step = _iterator.n()).done;) {
        _loop();
      }
    } catch (err) {
      _iterator.e(err);
    } finally {
      _iterator.f();
    }
    this.userProfileClient = {};
    // Dynamically defined user profile methods defined in AllowedUserProfileMethods
    var _iterator2 = _createForOfIteratorHelper(this.AllowedUserProfileMethods()),
      _step2;
    try {
      var _loop2 = function _loop2() {
        var methodName = _step2.value;
        _this.userProfileClient[methodName] = /*#__PURE__*/function () {
          var _ref3 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee2(args) {
            var callback;
            return _regeneratorRuntime.wrap(function _callee2$(_context2) {
              while (1) switch (_context2.prev = _context2.next) {
                case 0:
                  callback = args && args.callback;
                  if (callback) {
                    delete args.callback;
                  }
                  _context2.next = 4;
                  return _this.SendMessage({
                    options: {
                      module: "userProfileClient",
                      calledMethod: methodName,
                      args: _this.utils.MakeClonable(args),
                      prompted: FrameClient.PromptedMethods().includes(methodName)
                    },
                    callback: callback
                  });
                case 4:
                  return _context2.abrupt("return", _context2.sent);
                case 5:
                case "end":
                  return _context2.stop();
              }
            }, _callee2);
          }));
          return function (_x2) {
            return _ref3.apply(this, arguments);
          };
        }();
      };
      for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
        _loop2();
      }
    } catch (err) {
      _iterator2.e(err);
    } finally {
      _iterator2.f();
    }
  }

  /**
   * Pass an ElvFrameRequest to the target and receive a ElvFrameResponse.
   * Useful when acting as an intermediate between a contained app and a parent app.
   *
   * @namedParams
   * @param {object} request - An ElvFrameRequest
   * @returns {object} - The resultant ElvFrameResponse
   */
  _createClass(FrameClient, [{
    key: "Log",
    value: function Log(message) {
      var error = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
      LogMessage(this, message, error);
    }
  }, {
    key: "PassRequest",
    value: function () {
      var _PassRequest = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee3(_ref4) {
        var request, Respond, response, error, callback;
        return _regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) switch (_context3.prev = _context3.next) {
            case 0:
              request = _ref4.request, Respond = _ref4.Respond;
              _context3.prev = 1;
              if (request.callbackId) {
                callback = function callback(result) {
                  return Respond({
                    type: "ElvFrameResponse",
                    requestId: request.callbackId,
                    response: result
                  });
                };
              }
              _context3.next = 5;
              return this.SendMessage({
                options: request,
                callback: callback
              });
            case 5:
              response = _context3.sent;
              _context3.next = 11;
              break;
            case 8:
              _context3.prev = 8;
              _context3.t0 = _context3["catch"](1);
              error = _context3.t0;
            case 11:
              return _context3.abrupt("return", {
                type: "ElvFrameResponse",
                requestId: request.requestId,
                response: response,
                error: error
              });
            case 12:
            case "end":
              return _context3.stop();
          }
        }, _callee3, this, [[1, 8]]);
      }));
      function PassRequest(_x3) {
        return _PassRequest.apply(this, arguments);
      }
      return PassRequest;
    }()
  }, {
    key: "SendMessage",
    value: function () {
      var _SendMessage = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee4(_ref5) {
        var _ref5$options, options, callback, _ref5$noResponse, noResponse, requestId, callbackId, operation, isFileOperation, timeout;
        return _regeneratorRuntime.wrap(function _callee4$(_context4) {
          while (1) switch (_context4.prev = _context4.next) {
            case 0:
              _ref5$options = _ref5.options, options = _ref5$options === void 0 ? {} : _ref5$options, callback = _ref5.callback, _ref5$noResponse = _ref5.noResponse, noResponse = _ref5$noResponse === void 0 ? false : _ref5$noResponse;
              requestId = Id.next();
              if (callback) {
                callbackId = Id.next();
              }
              this.target.postMessage(_objectSpread(_objectSpread({}, options), {}, {
                type: "ElvFrameRequest",
                requestId: requestId,
                callbackId: callbackId
              }), "*");

              // No timeout for prompted methods
              if (!noResponse) {
                _context4.next = 6;
                break;
              }
              return _context4.abrupt("return");
            case 6:
              operation = options.calledMethod || options.operation;
              isFileOperation = FrameClient.FileMethods().includes(options.calledMethod);
              timeout = this.timeout;
              if (options.prompted || isFileOperation) {
                timeout = 0;
              } else if (options.args && options.args.fcTimeout) {
                timeout = options.args.fcTimeout;
              }
              _context4.next = 12;
              return this.AwaitMessage(requestId, timeout, callback, callbackId, operation);
            case 12:
              return _context4.abrupt("return", _context4.sent);
            case 13:
            case "end":
              return _context4.stop();
          }
        }, _callee4, this);
      }));
      function SendMessage(_x4) {
        return _SendMessage.apply(this, arguments);
      }
      return SendMessage;
    }()
  }, {
    key: "AwaitMessage",
    value: function () {
      var _AwaitMessage = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee6(requestId, timeout, callback, callbackId, operation) {
        return _regeneratorRuntime.wrap(function _callee6$(_context6) {
          while (1) switch (_context6.prev = _context6.next) {
            case 0:
              _context6.next = 2;
              return new Promise(function (resolve, reject) {
                var methodListener;

                // Initialize or reset timeout
                var timeoutId;
                var touchTimeout = function touchTimeout() {
                  if (timeoutId) {
                    clearTimeout(timeoutId);
                  }
                  if (timeout > 0) {
                    timeoutId = setTimeout(function () {
                      if (typeof window !== "undefined") {
                        window.removeEventListener("message", methodListener);
                        if (callbackListener) {
                          window.removeEventListener("message", callbackListener);
                        }
                      }
                      reject("Request ".concat(requestId, " timed out (").concat(operation, ")"));
                    }, timeout * 1000);
                  }
                };

                // Set up callback listener
                var callbackListener;
                if (callbackId) {
                  callbackListener = function callbackListener(event) {
                    try {
                      touchTimeout();
                      var message = event.data;
                      if (message.type !== "ElvFrameResponse" || message.requestId !== callbackId) {
                        return;
                      }
                      callback(message.response);
                    } catch (error) {
                      // eslint-disable-next-line no-console
                      console.error(error);
                    }
                  };
                  window.addEventListener("message", callbackListener);
                }

                // Set up final method response listener
                methodListener = /*#__PURE__*/function () {
                  var _ref6 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee5(event) {
                    var message;
                    return _regeneratorRuntime.wrap(function _callee5$(_context5) {
                      while (1) switch (_context5.prev = _context5.next) {
                        case 0:
                          _context5.prev = 0;
                          message = event.data;
                          if (!(message.type !== "ElvFrameResponse" || message.requestId !== requestId)) {
                            _context5.next = 4;
                            break;
                          }
                          return _context5.abrupt("return");
                        case 4:
                          clearTimeout(timeoutId);
                          window.removeEventListener("message", methodListener);
                          if (callbackListener) {
                            window.removeEventListener("message", callbackListener);
                          }
                          if (message.error) {
                            reject(message.error);
                          } else {
                            resolve(message.response);
                          }
                          _context5.next = 16;
                          break;
                        case 10:
                          _context5.prev = 10;
                          _context5.t0 = _context5["catch"](0);
                          clearTimeout(timeoutId);
                          window.removeEventListener("message", methodListener);
                          if (callbackListener) {
                            window.removeEventListener("message", callbackListener);
                          }
                          reject(_context5.t0);
                        case 16:
                        case "end":
                          return _context5.stop();
                      }
                    }, _callee5, null, [[0, 10]]);
                  }));
                  return function methodListener(_x10) {
                    return _ref6.apply(this, arguments);
                  };
                }();

                // Start the timeout
                touchTimeout();
                window.addEventListener("message", methodListener);
              });
            case 2:
              return _context6.abrupt("return", _context6.sent);
            case 3:
            case "end":
              return _context6.stop();
          }
        }, _callee6);
      }));
      function AwaitMessage(_x5, _x6, _x7, _x8, _x9) {
        return _AwaitMessage.apply(this, arguments);
      }
      return AwaitMessage;
    }() // List of methods that may require a prompt - these should have an unlimited timeout period
  }, {
    key: "OverriddenMethods",
    value:
    // List of methods that are defined separately in FrameClient
    function OverriddenMethods() {
      return ["UploadFiles"];
    }

    // List of allowed methods available to frames
    // This should match ElvClient.FrameAvailableMethods()
    // ElvClient will also reject any disallowed methods
    /**
     * @returns {Array<string>} - List of ElvClient methods available to a FrameClient
     */
  }, {
    key: "AllowedMethods",
    value: function AllowedMethods() {
      return ["AccessGroupManagers", "AccessGroupMembers", "AccessGroupOwner", "AccessInfo", "AccessRequest", "AccessType", "AddAccessGroupManager", "AddAccessGroupMember", "AddContentLibraryGroup", "AddContentObjectGroupPermission", "AddLibraryContentType", "AssetMetadata", "AvailableDRMs", "AvailableOfferings", "AwaitPending", "BitmovinPlayoutOptions", "BlockNumber", "CallBitcodeMethod", "CallContractMethod", "CallContractMethodAndWait", "ClearCache", "ClearStaticToken", "Collection", "CollectionTransactions", "ConfigUrl", "ContentLibraries", "ContentLibrary", "ContentLibraryGroupPermissions", "ContentLibraryOwner", "ContentObject", "ContentObjectAccessComplete", "ContentObjectGraph", "ContentObjectGroupPermissions", "ContentObjectImageUrl", "ContentObjectLibraryId", "ContentObjectMetadata", "ContentObjectOwner", "ContentObjectTenantId", "ContentObjectVersions", "ContentObjects", "ContentPart", "ContentParts", "ContentSpaceId", "ContentType", "ContentTypeOwner", "ContentTypes", "ContractAbi", "ContractEvents", "ContractMetadata", "ContractName", "CopyContentObject", "CreateABRMezzanine", "CreateAccessGroup", "CreateAndFinalizeContentObject", "CreateContentLibrary", "CreateContentObject", "CreateContentType", "CreateEncryptionConk", "CreateFabricToken", "CreateFileDirectories", "CreateFileUploadJob", "CreateLinks", "CreateNTPInstance", "CreateNonOwnerCap", "CreatePart", "CreateProductionMaster", "CreateSignedToken", "CurrentAccountAddress", "CustomContractAddress", "Decrypt", "DecryptECIES", "DefaultKMSAddress", "DeleteAccessGroup", "DeleteContentLibrary", "DeleteContentObject", "DeleteContentVersion", "DeleteFiles", "DeleteMetadata", "DeleteNTPInstance", "DeletePart", "DeployContract", "Download", "DownloadEncrypted", "DownloadFile", "DownloadPart", "EditAndFinalizeContentObject", "EditContentObject", "Encrypt", "EncryptECIES", "EncryptionConk", "Events", "ExtractEventFromLogs", "ExtractValueFromEvent", "FabricUrl", "FileUrl", "FinalizeABRMezzanine", "FinalizeContentObject", "FinalizePart", "FinalizeStateChannelAccess", "FinalizeUploadJob", "FormatContractArguments", "GenerateStateChannelToken", "GenerateSignedLinkToken", "GetBalance", "InitializeAuthPolicy", "IssueNTPCode", "IssueSignedNTPCode", "LatestVersionHash", "LibraryContentTypes", "LinkAccessGroupToOauth", "LinkData", "LinkTarget", "LinkUrl", "ListAccessGroups", "ListFiles", "ListNTPInstances", "LROStatus", "MergeContractMetadata", "MergeMetadata", "MetadataAuth", "MintNFT", "NetworkInfo", "NodeId", "Nodes", "NTPInstance", "Permission", "PlayoutOptions", "PlayoutPathResolution", "ProduceMetadataLinks", "Proofs", "PublicRep", "PublishContentVersion", "QParts", "RedeemCode", "RemoveAccessGroupManager", "RemoveAccessGroupMember", "RemoveContentObjectGroupPermission", "RemoveContentLibraryGroup", "RemoveLibraryContentType", "Rep", "ReplaceContractMetadata", "ReplaceMetadata", "Request", "ResetRegion", "SendFunds", "SetAccessCharge", "SetAuth", "SetAuthContext", "SetAuthPolicy", "SetContentLibraryImage", "SetContentObjectImage", "SetCustomContentContract", "SetGroupPermission", "SetNodes", "SetOauthToken", "SetPolicyAuthorization", "SetSignerFromOauthToken", "SetStaticToken", "SetVisibility", "SetPermission", "StartABRMezzanineJobs", "SuspendNTPInstance", "UnlinkAccessGroupFromOauth", "UpdateContentObjectGraph", "UpdateNTPInstance", "UploadFileData", "UploadFilesFromS3", "UploadJobStatus", "UploadPart", "UploadPartChunk", "UploadStatus", "UseRegion", "VerifyContentObject", "Visibility"];
    }
  }, {
    key: "AllowedUserProfileMethods",
    value: function AllowedUserProfileMethods() {
      return ["AccessLevel", "CollectedTags", "CreateWallet", "DeleteUserMetadata", "MergeUserMetadata", "PublicUserMetadata", "ReplaceUserMetadata", "TenantId", "UserMetadata", "UserProfileImage", "UserWalletAddress", "UserWalletObjectInfo", "WalletAddress"];
    }
  }], [{
    key: "PromptedMethods",
    value: function PromptedMethods() {
      return ["CollectedTags", "DeleteUserMetadata", "MergeUserMetadata", "ReplaceUserMetadata", "UserMetadata"];
    }
  }, {
    key: "MetadataMethods",
    value: function MetadataMethods() {
      return ["DeleteUserMetadata", "MergeUserMetadata", "ReplaceUserMetadata", "UserMetadata"];
    }
  }, {
    key: "FileMethods",
    value: function FileMethods() {
      return ["DownloadFile", "DownloadPart", "UpdateContentObjectGraph", "UploadFiles", "UploadFilesFromS3", "UploadPart", "UploadPartChunk"];
    }
  }]);
  return FrameClient;
}();
var _require2 = require("./client/Files"),
  UploadFiles = _require2.UploadFiles;
FrameClient.prototype.UploadFiles = UploadFiles;
exports.FrameClient = FrameClient;