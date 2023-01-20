var _typeof = require("@babel/runtime/helpers/typeof");
var _regeneratorRuntime = require("@babel/runtime/regenerator");
var _asyncToGenerator = require("@babel/runtime/helpers/asyncToGenerator");
var Utils = require("../Utils");
var UrlJoin = require("url-join");
var StateStorePath = function StateStorePath(_ref) {
  var network = _ref.network,
    path = _ref.path;
  return UrlJoin(network === "main" ? "/main" : "/dv3", path);
};
var UserProfilePath = function UserProfilePath(_ref2) {
  var network = _ref2.network,
    appId = _ref2.appId,
    userAddress = _ref2.userAddress,
    key = _ref2.key,
    type = _ref2.type,
    mode = _ref2.mode;
  return StateStorePath({
    network: network,
    path: UrlJoin(type === "app" ? "app" : "usr", type === "app" ? appId : "", userAddress, mode === "public" ? "pub" : "pri", key || "")
  });
};

/**
 * Methods related to getting and setting user profile data.
 *
 * @module ProfileMethods
 */

/**
 * Retrieve user profile metadata for the specified user
 *
 * @methodGroup ProfileMetadata
 * @namedParams
 * @param {string=} type="app" - Specify `app` or `user` metadata.
 * @param {string=} mode="public" - Specify `public` or `private` metadata. If private is specified, you may only retrieve metadata for the current user.
 * @param {string=} appId - Namespace to use for the metadata, if retrieving app metadata. Uses the app ID specified on client initialization by default.
 * @param {string=} userAddress - User to retrieve metadata for. If not specified, will retrieve metadata for the current user
 * @param {string=} key - The metadata key to retrieve
 *
 * @returns {Promise<Object|String>} - Returns the specified metadata
 */
exports.ProfileMetadata = /*#__PURE__*/function () {
  var _ref4 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee(_ref3) {
    var _ref3$type, type, _ref3$mode, mode, appId, userAddress, key, response;
    return _regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) switch (_context.prev = _context.next) {
        case 0:
          _ref3$type = _ref3.type, type = _ref3$type === void 0 ? "app" : _ref3$type, _ref3$mode = _ref3.mode, mode = _ref3$mode === void 0 ? "public" : _ref3$mode, appId = _ref3.appId, userAddress = _ref3.userAddress, key = _ref3.key;
          _context.prev = 1;
          _context.next = 4;
          return this.stateStoreClient.Request({
            path: UserProfilePath({
              network: this.network,
              appId: appId || this.appId,
              userAddress: userAddress || this.UserAddress(),
              type: type,
              mode: mode,
              key: key
            }),
            headers: mode === "private" ? {
              Authorization: "Bearer ".concat(this.AuthToken())
            } : undefined
          });
        case 4:
          response = _context.sent;
          if (response.ok) {
            _context.next = 7;
            break;
          }
          throw response;
        case 7:
          _context.next = 9;
          return Utils.ResponseToJson(response);
        case 9:
          _context.t0 = key;
          return _context.abrupt("return", _context.sent[_context.t0]);
        case 13:
          _context.prev = 13;
          _context.t1 = _context["catch"](1);
          if (!(_context.t1.status === 404)) {
            _context.next = 17;
            break;
          }
          return _context.abrupt("return", undefined);
        case 17:
          throw _context.t1;
        case 18:
        case "end":
          return _context.stop();
      }
    }, _callee, this, [[1, 13]]);
  }));
  return function (_x) {
    return _ref4.apply(this, arguments);
  };
}();

/**
 * Set user profile metadata for the current user
 *
 * @methodGroup ProfileMetadata
 * @namedParams
 * @param {string=} type="app" - Specify `app` or `user` metadata.
 * @param {string=} mode="public" - Specify `public` or `private` metadata.
 * @param {string=} appId - Namespace to use for the metadata, if retrieving app metadata. Uses the app ID specified on client initialization by default.
 * @param {string} key - The metadata key to set
 * @param {string} value - The metadata value to set
 */
exports.SetProfileMetadata = /*#__PURE__*/function () {
  var _ref6 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee2(_ref5) {
    var _ref5$type, type, _ref5$mode, mode, appId, key, value;
    return _regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) switch (_context2.prev = _context2.next) {
        case 0:
          _ref5$type = _ref5.type, type = _ref5$type === void 0 ? "app" : _ref5$type, _ref5$mode = _ref5.mode, mode = _ref5$mode === void 0 ? "public" : _ref5$mode, appId = _ref5.appId, key = _ref5.key, value = _ref5.value;
          _context2.next = 3;
          return this.stateStoreClient.Request({
            method: "POST",
            path: UserProfilePath({
              network: this.network,
              appId: appId || this.appId,
              userAddress: this.UserAddress(),
              type: type,
              mode: mode,
              key: key
            }),
            body: value,
            bodyType: _typeof(value) === "object" ? "JSON" : "string",
            headers: {
              Authorization: "Bearer ".concat(this.AuthToken())
            }
          });
        case 3:
        case "end":
          return _context2.stop();
      }
    }, _callee2, this);
  }));
  return function (_x2) {
    return _ref6.apply(this, arguments);
  };
}();

/**
 * Remove user profile metadata for the current user
 *
 * @methodGroup ProfileMetadata
 * @namedParams
 * @param {string=} type="app" - Specify `app` or `user` metadata.
 * @param {string=} mode="public" - Specify `public` or `private` metadata.
 * @param {string=} appId - Namespace to use for the metadata, if retrieving app metadata.. Uses the app ID specified on client initialization by default.
 * @param {string} key - The metadata key to set
 */
exports.RemoveProfileMetadata = /*#__PURE__*/function () {
  var _ref8 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee3(_ref7) {
    var _ref7$type, type, _ref7$mode, mode, appId, key;
    return _regeneratorRuntime.wrap(function _callee3$(_context3) {
      while (1) switch (_context3.prev = _context3.next) {
        case 0:
          _ref7$type = _ref7.type, type = _ref7$type === void 0 ? "app" : _ref7$type, _ref7$mode = _ref7.mode, mode = _ref7$mode === void 0 ? "public" : _ref7$mode, appId = _ref7.appId, key = _ref7.key;
          _context3.next = 3;
          return this.stateStoreClient.Request({
            method: "DELETE",
            path: UserProfilePath({
              network: this.network,
              appId: appId || this.appId,
              userAddress: this.UserAddress(),
              type: type,
              mode: mode,
              key: key
            }),
            headers: {
              Authorization: "Bearer ".concat(this.AuthToken())
            }
          });
        case 3:
        case "end":
          return _context3.stop();
      }
    }, _callee3, this);
  }));
  return function (_x3) {
    return _ref8.apply(this, arguments);
  };
}();

/**
 * Retrieve profile info for the specified user, including address, username and profile image (if set)
 *
 * @methodGroup Profile
 * @param {string=} userAddress - Address of the user
 * @param {string=} userName - Username of the user
 *
 * @returns {Promise<Object>} - Profile info of the specified user
 */
exports.Profile = /*#__PURE__*/function () {
  var _ref10 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee4(_ref9) {
    var userAddress, userName, imageUrl;
    return _regeneratorRuntime.wrap(function _callee4$(_context4) {
      while (1) switch (_context4.prev = _context4.next) {
        case 0:
          userAddress = _ref9.userAddress, userName = _ref9.userName;
          if (!userName) {
            _context4.next = 5;
            break;
          }
          _context4.next = 4;
          return this.UserNameToAddress({
            userName: userName
          });
        case 4:
          userAddress = _context4.sent;
        case 5:
          if (userAddress) {
            _context4.next = 7;
            break;
          }
          throw Error("Eluvio Wallet Client: Unable to determine profile - user address not specified");
        case 7:
          if (userName) {
            _context4.next = 11;
            break;
          }
          _context4.next = 10;
          return this.ProfileMetadata({
            type: "user",
            userAddress: userAddress,
            key: "username"
          });
        case 10:
          userName = _context4.sent;
        case 11:
          _context4.next = 13;
          return this.ProfileMetadata({
            type: "user",
            userAddress: userAddress,
            key: "icon_url"
          });
        case 13:
          imageUrl = _context4.sent;
          return _context4.abrupt("return", {
            userAddress: Utils.FormatAddress(userAddress),
            userName: userName,
            imageUrl: imageUrl
          });
        case 15:
        case "end":
          return _context4.stop();
      }
    }, _callee4, this);
  }));
  return function (_x4) {
    return _ref10.apply(this, arguments);
  };
}();
exports.UserNameToAddress = /*#__PURE__*/function () {
  var _ref12 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee5(_ref11) {
    var userName, response;
    return _regeneratorRuntime.wrap(function _callee5$(_context5) {
      while (1) switch (_context5.prev = _context5.next) {
        case 0:
          userName = _ref11.userName;
          _context5.prev = 1;
          _context5.next = 4;
          return this.stateStoreClient.Request({
            method: "GET",
            path: StateStorePath({
              network: this.network,
              path: UrlJoin("usr", "profile_for_username", userName)
            })
          });
        case 4:
          response = _context5.sent;
          if (response.ok) {
            _context5.next = 7;
            break;
          }
          throw response;
        case 7:
          _context5.next = 9;
          return Utils.ResponseToJson(response);
        case 9:
          return _context5.abrupt("return", _context5.sent.address);
        case 12:
          _context5.prev = 12;
          _context5.t0 = _context5["catch"](1);
          if (!(_context5.t0.status !== 404)) {
            _context5.next = 16;
            break;
          }
          throw _context5.t0;
        case 16:
          return _context5.abrupt("return", undefined);
        case 17:
        case "end":
          return _context5.stop();
      }
    }, _callee5, this, [[1, 12]]);
  }));
  return function (_x5) {
    return _ref12.apply(this, arguments);
  };
}();