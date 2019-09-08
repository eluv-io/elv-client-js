"use strict";

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

require("@babel/polyfill");

var Id = require("./Id");

var Utils = require("./Utils");

var FrameClient =
/*#__PURE__*/
function () {
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
        _ref$target = _ref.target,
        target = _ref$target === void 0 ? parent : _ref$target,
        _ref$timeout = _ref.timeout,
        timeout = _ref$timeout === void 0 ? 30 : _ref$timeout;

    _classCallCheck(this, FrameClient);

    this.target = target;
    this.timeout = timeout;
    this.utils = Utils; // Dynamically defined methods defined in AllowedMethods

    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      var _loop = function _loop() {
        var methodName = _step.value;

        _this[methodName] =
        /*#__PURE__*/
        function () {
          var _ref2 = _asyncToGenerator(
          /*#__PURE__*/
          regeneratorRuntime.mark(function _callee(args) {
            var callback;
            return regeneratorRuntime.wrap(function _callee$(_context) {
              while (1) {
                switch (_context.prev = _context.next) {
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
              }
            }, _callee);
          }));

          return function (_x) {
            return _ref2.apply(this, arguments);
          };
        }();
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

        _this.userProfileClient[methodName] =
        /*#__PURE__*/
        function () {
          var _ref3 = _asyncToGenerator(
          /*#__PURE__*/
          regeneratorRuntime.mark(function _callee2(args) {
            var isPrompted, callback;
            return regeneratorRuntime.wrap(function _callee2$(_context2) {
              while (1) {
                switch (_context2.prev = _context2.next) {
                  case 0:
                    isPrompted = FrameClient.PromptedMethods().includes(methodName);

                    if (!(isPrompted && (!args || !args.requestor))) {
                      _context2.next = 3;
                      break;
                    }

                    throw new Error("'requestor' param required when calling user profile methods from FrameClient");

                  case 3:
                    callback = args && args.callback;

                    if (callback) {
                      delete args.callback;
                    }

                    _context2.next = 7;
                    return _this.SendMessage({
                      options: {
                        module: "userProfileClient",
                        calledMethod: methodName,
                        args: _this.utils.MakeClonable(args),
                        prompted: FrameClient.PromptedMethods().includes(methodName),
                        requestor: args.requestor
                      },
                      callback: callback
                    });

                  case 7:
                    return _context2.abrupt("return", _context2.sent);

                  case 8:
                  case "end":
                    return _context2.stop();
                }
              }
            }, _callee2);
          }));

          return function (_x2) {
            return _ref3.apply(this, arguments);
          };
        }();
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
    value: function () {
      var _PassRequest = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee3(_ref4) {
        var request, Respond, response, callback;
        return regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
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
                response = JSON.parse(JSON.stringify(_context3.t0));

              case 11:
                return _context3.abrupt("return", {
                  type: "ElvFrameResponse",
                  requestId: request.requestId,
                  response: response
                });

              case 12:
              case "end":
                return _context3.stop();
            }
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
      var _SendMessage = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee4(_ref5) {
        var _ref5$options, options, callback, _ref5$noResponse, noResponse, requestId, callbackId, operation, timeout;

        return regeneratorRuntime.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                _ref5$options = _ref5.options, options = _ref5$options === void 0 ? {} : _ref5$options, callback = _ref5.callback, _ref5$noResponse = _ref5.noResponse, noResponse = _ref5$noResponse === void 0 ? false : _ref5$noResponse;
                requestId = Id.next();

                if (callback) {
                  callbackId = Id.next();
                }

                this.target.postMessage(_objectSpread({}, options, {
                  type: "ElvFrameRequest",
                  requestId: requestId,
                  callbackId: callbackId
                }), "*"); // No timeout for prompted methods

                if (noResponse) {
                  _context4.next = 10;
                  break;
                }

                operation = options.calledMethod || options.operation;
                timeout = options.prompted ? 0 : this.timeout;
                _context4.next = 9;
                return this.AwaitMessage(requestId, timeout, callback, callbackId, operation);

              case 9:
                return _context4.abrupt("return", _context4.sent);

              case 10:
              case "end":
                return _context4.stop();
            }
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
      var _AwaitMessage = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee6(requestId, timeout, callback, callbackId, operation) {
        return regeneratorRuntime.wrap(function _callee6$(_context6) {
          while (1) {
            switch (_context6.prev = _context6.next) {
              case 0:
                _context6.next = 2;
                return new Promise(function (resolve, reject) {
                  var methodListener; // Initialize or reset timeout

                  var timeoutId;

                  var touchTimeout = function touchTimeout() {
                    if (timeoutId) {
                      clearTimeout(timeoutId);
                    }

                    if (timeout > 0) {
                      timeoutId = setTimeout(function () {
                        reject("Request ".concat(requestId, " timed out (").concat(operation, ")"));
                        window.removeEventListener("message", methodListener);

                        if (callbackListener) {
                          window.removeEventListener("message", callbackListener);
                        }
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


                  methodListener =
                  /*#__PURE__*/
                  function () {
                    var _ref6 = _asyncToGenerator(
                    /*#__PURE__*/
                    regeneratorRuntime.mark(function _callee5(event) {
                      var message;
                      return regeneratorRuntime.wrap(function _callee5$(_context5) {
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
                              if (message.error) {
                                reject(message.error);
                              } else {
                                resolve(message.response);
                              }

                              window.removeEventListener("message", methodListener);

                              if (callbackListener) {
                                window.removeEventListener("message", callbackListener);
                              }

                              _context5.next = 14;
                              break;

                            case 9:
                              _context5.prev = 9;
                              _context5.t0 = _context5["catch"](0);
                              reject(_context5.t0);
                              window.removeEventListener("message", methodListener);

                              if (callbackListener) {
                                window.removeEventListener("message", callbackListener);
                              }

                            case 14:
                            case "end":
                              return _context5.stop();
                          }
                        }
                      }, _callee5, null, [[0, 9]]);
                    }));

                    return function methodListener(_x10) {
                      return _ref6.apply(this, arguments);
                    };
                  }(); // Start the timeout


                  touchTimeout();
                  window.addEventListener("message", methodListener);
                });

              case 2:
                return _context6.abrupt("return", _context6.sent);

              case 3:
              case "end":
                return _context6.stop();
            }
          }
        }, _callee6);
      }));

      function AwaitMessage(_x5, _x6, _x7, _x8, _x9) {
        return _AwaitMessage.apply(this, arguments);
      }

      return AwaitMessage;
    }() // List of methods that may require a prompt - these should have an unlimited timeout period

  }, {
    key: "AllowedMethods",
    // List of allowed methods available to frames
    // This should match ElvClient.FrameAvailableMethods()
    // ElvClient will also reject any disallowed methods

    /**
     * @returns {Array<string>} - List of ElvClient methods available to a FrameClient
     */
    value: function AllowedMethods() {
      return ["AccessGroupManagers", "AccessGroupMembers", "AccessGroupOwner", "AccessInfo", "AccessRequest", "AccessType", "AddAccessGroupManager", "AddAccessGroupMember", "AddLibraryContentType", "AvailableDRMs", "BitmovinPlayoutOptions", "BlockNumber", "CachedAccessTransaction", "CallBitcodeMethod", "CallContractMethod", "CallContractMethodAndWait", "ClearCache", "Collection", "ContentLibraries", "ContentLibrary", "ContentLibraryOwner", "ContentObject", "ContentObjectAccessComplete", "ContentObjectLibraryId", "ContentObjectMetadata", "ContentObjectOwner", "ContentObjectVersions", "ContentObjects", "ContentPart", "ContentParts", "ContentSpaceId", "ContentType", "ContentTypeOwner", "ContentTypes", "ContractEvents", "CopyContentObject", "CreateAccessGroup", "CreateContentLibrary", "CreateContentObject", "CreateContentSpace", "CreateContentType", "CreateFileUploadJob", "CreatePart", "CurrentAccountAddress", "CustomContractAddress", "DefaultKMSAddress", "DeleteAccessGroup", "DeleteContentLibrary", "DeleteContentObject", "DeleteContentVersion", "DeleteMetadata", "DeletePart", "DeployContract", "DownloadFile", "DownloadPart", "EditContentObject", "EncryptionCap", "Events", "ExtractEventFromLogs", "ExtractValueFromEvent", "FabricUrl", "FileUrl", "FinalizeContentObject", "FinalizePart", "FinalizeUploadJobs", "FormatContractArguments", "GenerateStateChannelToken", "GetBalance", "LibraryContentTypes", "ListFiles", "MergeMetadata", "PlayoutOptions", "Proofs", "PublicRep", "PublishContentVersion", "QParts", "RemoveAccessGroupManager", "RemoveAccessGroupMember", "RemoveLibraryContentType", "Rep", "ReplaceMetadata", "SendFunds", "SetAccessCharge", "SetContentLibraryImage", "SetContentObjectImage", "SetCustomContentContract", "UploadFileData", "UploadFiles", "UploadJobStatus", "UploadPart", "UploadPartChunk", "VerifyContentObject", "WithdrawContractFunds"];
    }
  }, {
    key: "AllowedUserProfileMethods",
    value: function AllowedUserProfileMethods() {
      return ["AccessLevel", "CollectedTags", "DeleteUserMetadata", "Initialize", "MergeUserMetadata", "PublicUserMetadata", "ReplaceUserMetadata", "UserMetadata", "UserProfileImage", "UserWalletAddress", "WalletAddress"];
    }
  }], [{
    key: "PromptedMethods",
    value: function PromptedMethods() {
      return ["CollectedTags", "DeleteUserMetadata", "MergeUserMetadata", "ReplaceUserMetadata", "UserMetadata"];
    }
  }]);

  return FrameClient;
}();

exports.FrameClient = FrameClient;