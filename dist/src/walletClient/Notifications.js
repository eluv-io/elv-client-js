var _regeneratorRuntime = require("@babel/runtime/regenerator");
var _asyncToGenerator = require("@babel/runtime/helpers/asyncToGenerator");
/**
 * Methods related to notifications for the current user.
 *
 * @module Notifications
 */

var Utils = require("../Utils");
var UrlJoin = require("url-join");
var NotificationPath = function NotificationPath(_ref) {
  var network = _ref.network,
    path = _ref.path;
  return UrlJoin("/push", network === "main" ? "/main" : "/dv3", path);
};

/**
 * Push a notification to the current user
 *
 * @methodGroup Notifications
 * @param {string} tenantId - The tenant associated with this notification
 * @param {string} eventType - The type of the notification
 * @param {(Object | string)=} data - Data associated with this notification
 */
exports.PushNotification = /*#__PURE__*/function () {
  var _ref3 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee(_ref2) {
    var tenantId, eventType, data;
    return _regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) switch (_context.prev = _context.next) {
        case 0:
          tenantId = _ref2.tenantId, eventType = _ref2.eventType, data = _ref2.data;
          _context.next = 3;
          return this.stateStoreClient.Request({
            method: "POST",
            path: NotificationPath({
              network: this.network,
              path: UrlJoin("notify_user", this.UserAddress(), tenantId, eventType)
            }),
            body: data,
            headers: {
              Authorization: "Bearer ".concat(this.AuthToken())
            }
          });
        case 3:
        case "end":
          return _context.stop();
      }
    }, _callee, this);
  }));
  return function (_x) {
    return _ref3.apply(this, arguments);
  };
}();

/**
 * Add a listener to receive new notifications.
 *
 * @methodGroup Notifications
 * @param {function} onMessage - Callback invoked when a new notification is received
 *
 * @returns {Promise<EventSource>} - An EventSource instance listening for notifications. Use source.close() to close the listener.
 */
exports.AddNotificationListener = /*#__PURE__*/function () {
  var _ref5 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee2(_ref4) {
    var onMessage, url, source;
    return _regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) switch (_context2.prev = _context2.next) {
        case 0:
          onMessage = _ref4.onMessage;
          if (onMessage) {
            _context2.next = 3;
            break;
          }
          throw Error("Eluvio Wallet Client: No onMessage callback provided to AddNotificationListener");
        case 3:
          url = new URL(this.stateStoreClient.BaseURI().toString());
          url.pathname = NotificationPath({
            network: this.network,
            path: UrlJoin("register", this.UserAddress(), this.AuthToken())
          });
          source = new EventSource(url);
          source.onmessage = function (event) {
            var parsedMessage = JSON.parse(event.data);
            try {
              parsedMessage.data = JSON.parse(parsedMessage.data);
              // eslint-disable-next-line no-empty
            } catch (error) {}
            onMessage(parsedMessage);
          };
          return _context2.abrupt("return", source);
        case 8:
        case "end":
          return _context2.stop();
      }
    }, _callee2, this);
  }));
  return function (_x2) {
    return _ref5.apply(this, arguments);
  };
}();

/**
 * Retrieve notifications for the current user.
 *
 * @methodGroup Notifications
 * @param {integer=} limit=10 - The maximum number of notifications to return
 * @param {string=} tenantId - Filter notifications to only those related to the specified tenant
 * @param {Array<string>=} types - Filter notifications to only the specified types
 * @param {string=} offsetId - Return notifications older than the specified ID
 *
 * @returns {Promise<Array<Object>>} - A list of notifications for the specified parameters
 */
exports.Notifications = /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee3() {
  var _ref7,
    tenantId,
    types,
    offsetId,
    _ref7$limit,
    limit,
    queryParams,
    _yield$Utils$Response,
    records,
    _args3 = arguments;
  return _regeneratorRuntime.wrap(function _callee3$(_context3) {
    while (1) switch (_context3.prev = _context3.next) {
      case 0:
        _ref7 = _args3.length > 0 && _args3[0] !== undefined ? _args3[0] : {}, tenantId = _ref7.tenantId, types = _ref7.types, offsetId = _ref7.offsetId, _ref7$limit = _ref7.limit, limit = _ref7$limit === void 0 ? 10 : _ref7$limit;
        queryParams = {
          limit: limit
        };
        if (tenantId) {
          queryParams.tenant_id = tenantId;
        }
        if (types) {
          queryParams.types = Array.isArray(types) ? types.join(",") : types;
        }
        if (offsetId) {
          queryParams.offset_by = offsetId;
        }
        _context3.next = 7;
        return Utils.ResponseToJson(this.stateStoreClient.Request({
          method: "GET",
          path: NotificationPath({
            network: this.network,
            path: UrlJoin("history", this.UserAddress())
          }),
          queryParams: queryParams,
          headers: {
            Authorization: "Bearer ".concat(this.AuthToken())
          }
        }));
      case 7:
        _yield$Utils$Response = _context3.sent;
        records = _yield$Utils$Response.records;
        return _context3.abrupt("return", records.map(function (record) {
          try {
            record.data = JSON.parse(record.data);
            // eslint-disable-next-line no-empty
          } catch (error) {}
          return record;
        }));
      case 10:
      case "end":
        return _context3.stop();
    }
  }, _callee3, this);
}));