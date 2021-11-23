var _defineProperty = require("@babel/runtime/helpers/defineProperty");

var _regeneratorRuntime = require("@babel/runtime/regenerator");

var _classCallCheck = require("@babel/runtime/helpers/classCallCheck");

var _createClass = require("@babel/runtime/helpers/createClass");

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

var Id = require("./Id");

var Utils = require("./Utils");

var permissionLevels = require("./client/ContentAccess").permissionLevels;

var FrameClient =
/*#__PURE__*/
function () {
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
    this.utils = Utils; // Dynamically defined methods defined in AllowedMethods

    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      var _loop = function _loop() {
        var methodName = _step.value;

        _this[methodName] = function _callee(args) {
          var callback;
          return _regeneratorRuntime.async(function _callee$(_context) {
            while (1) {
              switch (_context.prev = _context.next) {
                case 0:
                  callback = args && args.callback;

                  if (callback) {
                    delete args.callback;
                  }

                  _context.next = 4;
                  return _regeneratorRuntime.awrap(_this.SendMessage({
                    options: {
                      calledMethod: methodName,
                      args: _this.utils.MakeClonable(args)
                    },
                    callback: callback
                  }));

                case 4:
                  return _context.abrupt("return", _context.sent);

                case 5:
                case "end":
                  return _context.stop();
              }
            }
          });
        };
      };

      for (var _iterator = this.AllowedMethods()[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        _loop();
      }
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

    this.userProfileClient = {}; // Dynamically defined user profile methods defined in AllowedUserProfileMethods

    var _iteratorNormalCompletion2 = true;
    var _didIteratorError2 = false;
    var _iteratorError2 = undefined;

    try {
      var _loop2 = function _loop2() {
        var methodName = _step2.value;

        _this.userProfileClient[methodName] = function _callee2(args) {
          var callback;
          return _regeneratorRuntime.async(function _callee2$(_context2) {
            while (1) {
              switch (_context2.prev = _context2.next) {
                case 0:
                  callback = args && args.callback;

                  if (callback) {
                    delete args.callback;
                  }

                  _context2.next = 4;
                  return _regeneratorRuntime.awrap(_this.SendMessage({
                    options: {
                      module: "userProfileClient",
                      calledMethod: methodName,
                      args: _this.utils.MakeClonable(args),
                      prompted: FrameClient.PromptedMethods().includes(methodName)
                    },
                    callback: callback
                  }));

                case 4:
                  return _context2.abrupt("return", _context2.sent);

                case 5:
                case "end":
                  return _context2.stop();
              }
            }
          });
        };
      };

      for (var _iterator2 = this.AllowedUserProfileMethods()[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
        _loop2();
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
    key: "PassRequest",
    value: function PassRequest(_ref2) {
      var request, Respond, response, error, callback;
      return _regeneratorRuntime.async(function PassRequest$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              request = _ref2.request, Respond = _ref2.Respond;
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
              return _regeneratorRuntime.awrap(this.SendMessage({
                options: request,
                callback: callback
              }));

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
        }
      }, null, this, [[1, 8]]);
    }
  }, {
    key: "SendMessage",
    value: function SendMessage(_ref3) {
      var _ref3$options, options, callback, _ref3$noResponse, noResponse, requestId, callbackId, operation, isFileOperation, timeout;

      return _regeneratorRuntime.async(function SendMessage$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              _ref3$options = _ref3.options, options = _ref3$options === void 0 ? {} : _ref3$options, callback = _ref3.callback, _ref3$noResponse = _ref3.noResponse, noResponse = _ref3$noResponse === void 0 ? false : _ref3$noResponse;
              requestId = Id.next();

              if (callback) {
                callbackId = Id.next();
              }

              this.target.postMessage(_objectSpread({}, options, {
                type: "ElvFrameRequest",
                requestId: requestId,
                callbackId: callbackId
              }), "*"); // No timeout for prompted methods

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
              return _regeneratorRuntime.awrap(this.AwaitMessage(requestId, timeout, callback, callbackId, operation));

            case 12:
              return _context4.abrupt("return", _context4.sent);

            case 13:
            case "end":
              return _context4.stop();
          }
        }
      }, null, this);
    }
  }, {
    key: "AwaitMessage",
    value: function AwaitMessage(requestId, timeout, callback, callbackId, operation) {
      return _regeneratorRuntime.async(function AwaitMessage$(_context6) {
        while (1) {
          switch (_context6.prev = _context6.next) {
            case 0:
              _context6.next = 2;
              return _regeneratorRuntime.awrap(new Promise(function (resolve, reject) {
                var _methodListener; // Initialize or reset timeout


                var timeoutId;

                var touchTimeout = function touchTimeout() {
                  if (timeoutId) {
                    clearTimeout(timeoutId);
                  }

                  if (timeout > 0) {
                    timeoutId = setTimeout(function () {
                      if (typeof window !== "undefined") {
                        window.removeEventListener("message", _methodListener);

                        if (callbackListener) {
                          window.removeEventListener("message", callbackListener);
                        }
                      }

                      reject("Request ".concat(requestId, " timed out (").concat(operation, ")"));
                    }, timeout * 1000);
                  }
                }; // Set up callback listener


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
                } // Set up final method response listener


                _methodListener = function methodListener(event) {
                  var message;
                  return _regeneratorRuntime.async(function methodListener$(_context5) {
                    while (1) {
                      switch (_context5.prev = _context5.next) {
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
                          window.removeEventListener("message", _methodListener);

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
                          window.removeEventListener("message", _methodListener);

                          if (callbackListener) {
                            window.removeEventListener("message", callbackListener);
                          }

                          reject(_context5.t0);

                        case 16:
                        case "end":
                          return _context5.stop();
                      }
                    }
                  }, null, null, [[0, 10]]);
                }; // Start the timeout


                touchTimeout();
                window.addEventListener("message", _methodListener);
              }));

            case 2:
              return _context6.abrupt("return", _context6.sent);

            case 3:
            case "end":
              return _context6.stop();
          }
        }
      });
    } // List of methods that may require a prompt - these should have an unlimited timeout period

  }, {
    key: "AllowedMethods",
    // List of allowed methods available to frames
    // This should match ElvClient.FrameAvailableMethods()
    // ElvClient will also reject any disallowed methods

    /**
     * @returns {Array<string>} - List of ElvClient methods available to a FrameClient
     */
    value: function AllowedMethods() {
      return ["AccessGroupManagers", "AccessGroupMembers", "AccessGroupOwner", "AccessInfo", "AccessRequest", "AccessType", "AddAccessGroupManager", "AddAccessGroupMember", "AddContentLibraryGroup", "AddContentObjectGroupPermission", "AddLibraryContentType", "AssetMetadata", "AvailableDRMs", "AvailableOfferings", "AwaitPending", "BitmovinPlayoutOptions", "BlockNumber", "CallBitcodeMethod", "CallContractMethod", "CallContractMethodAndWait", "ClearCache", "ClearStaticToken", "Collection", "CollectionTransactions", "ConfigUrl", "ContentLibraries", "ContentLibrary", "ContentLibraryGroupPermissions", "ContentLibraryOwner", "ContentObject", "ContentObjectAccessComplete", "ContentObjectGraph", "ContentObjectGroupPermissions", "ContentObjectImageUrl", "ContentObjectLibraryId", "ContentObjectMetadata", "ContentObjectOwner", "ContentObjectTenantId", "ContentObjectVersions", "ContentObjects", "ContentPart", "ContentParts", "ContentSpaceId", "ContentType", "ContentTypeOwner", "ContentTypes", "ContractAbi", "ContractEvents", "ContractMetadata", "ContractName", "CopyContentObject", "CreateABRMezzanine", "CreateAccessGroup", "CreateAndFinalizeContentObject", "CreateContentLibrary", "CreateContentObject", "CreateContentType", "CreateEncryptionConk", "CreateFileDirectories", "CreateFileUploadJob", "CreateLinks", "CreateNTPInstance", "CreateNonOwnerCap", "CreatePart", "CreateProductionMaster", "CreateSignedToken", "CurrentAccountAddress", "CustomContractAddress", "Decrypt", "DecryptECIES", "DefaultKMSAddress", "DeleteAccessGroup", "DeleteContentLibrary", "DeleteContentObject", "DeleteContentVersion", "DeleteFiles", "DeleteMetadata", "DeleteNTPInstance", "DeletePart", "DeployContract", "Download", "DownloadEncrypted", "DownloadFile", "DownloadPart", "EditAndFinalizeContentObject", "EditContentObject", "Encrypt", "EncryptECIES", "EncryptionConk", "Events", "ExtractEventFromLogs", "ExtractValueFromEvent", "FabricUrl", "FileUrl", "FinalizeABRMezzanine", "FinalizeContentObject", "FinalizePart", "FinalizeStateChannelAccess", "FinalizeUploadJob", "FormatContractArguments", "GenerateStateChannelToken", "GetBalance", "InitializeAuthPolicy", "IssueNTPCode", "IssueSignedNTPCode", "LatestVersionHash", "LibraryContentTypes", "LinkAccessGroupToOauth", "LinkData", "LinkTarget", "LinkUrl", "ListAccessGroups", "ListFiles", "ListNTPInstances", "LROStatus", "MergeContractMetadata", "MergeMetadata", "MetadataAuth", "MintNFT", "NetworkInfo", "NodeId", "Nodes", "NTPInstance", "Permission", "PlayoutOptions", "PlayoutPathResolution", "ProduceMetadataLinks", "Proofs", "PublicRep", "PublishContentVersion", "QParts", "RedeemCode", "RemoveAccessGroupManager", "RemoveAccessGroupMember", "RemoveContentObjectGroupPermission", "RemoveContentLibraryGroup", "RemoveLibraryContentType", "Rep", "ReplaceContractMetadata", "ReplaceMetadata", "Request", "ResetRegion", "SendFunds", "SetAccessCharge", "SetAuth", "SetAuthContext", "SetAuthPolicy", "SetContentLibraryImage", "SetContentObjectImage", "SetCustomContentContract", "SetGroupPermission", "SetNodes", "SetOauthToken", "SetPolicyAuthorization", "SetSignerFromOauthToken", "SetStaticToken", "SetVisibility", "SetPermission", "StartABRMezzanineJobs", "SuspendNTPInstance", "UnlinkAccessGroupFromOauth", "UpdateContentObjectGraph", "UpdateNTPInstance", "UploadFileData", "UploadFiles", "UploadFilesFromS3", "UploadJobStatus", "UploadPart", "UploadPartChunk", "UploadStatus", "UseRegion", "VerifyContentObject", "Visibility"];
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

exports.FrameClient = FrameClient;