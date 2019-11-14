"use strict";

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var URI = require("urijs");

var _Fetch = function Fetch(input) {
  var init = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  if (typeof fetch === "undefined") {
    return require("node-fetch")(input, init);
  } else {
    return fetch(input, init);
  }
};

var HttpClient =
/*#__PURE__*/
function () {
  _createClass(HttpClient, [{
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
      console.error("\n(elv-client-js#HttpClient) ".concat(message, "\n")) : // eslint-disable-next-line no-console
      console.log("\n(elv-client-js#HttpClient) ".concat(message, "\n"));
    }
  }]);

  function HttpClient(_ref) {
    var uris = _ref.uris,
        debug = _ref.debug;

    _classCallCheck(this, HttpClient);

    this.uris = uris;
    this.uriIndex = 0;
    this.debug = debug;
  }

  _createClass(HttpClient, [{
    key: "BaseURI",
    value: function BaseURI() {
      return new URI(this.uris[this.uriIndex]);
    }
  }, {
    key: "Fetch",
    value: function Fetch(url) {
      var params = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      return _Fetch(url, params);
    }
  }, {
    key: "RequestHeaders",
    value: function RequestHeaders(bodyType) {
      var headers = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      headers["Accept"] = "application/json";

      if (bodyType === "JSON") {
        headers["Content-type"] = "application/json";
      } else {
        headers["Content-type"] = "application/octet-stream";
      }

      return headers;
    }
  }, {
    key: "Request",
    value: function () {
      var _Request = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee(_ref2) {
        var method, path, _ref2$queryParams, queryParams, _ref2$body, body, _ref2$bodyType, bodyType, _ref2$headers, headers, _ref2$attempts, attempts, _ref2$failover, failover, uri, fetchParameters, response, responseType, errorBody, error;

        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                method = _ref2.method, path = _ref2.path, _ref2$queryParams = _ref2.queryParams, queryParams = _ref2$queryParams === void 0 ? {} : _ref2$queryParams, _ref2$body = _ref2.body, body = _ref2$body === void 0 ? {} : _ref2$body, _ref2$bodyType = _ref2.bodyType, bodyType = _ref2$bodyType === void 0 ? "JSON" : _ref2$bodyType, _ref2$headers = _ref2.headers, headers = _ref2$headers === void 0 ? {} : _ref2$headers, _ref2$attempts = _ref2.attempts, attempts = _ref2$attempts === void 0 ? 0 : _ref2$attempts, _ref2$failover = _ref2.failover, failover = _ref2$failover === void 0 ? true : _ref2$failover;
                uri = this.BaseURI().path(path).query(queryParams).hash("");
                fetchParameters = {
                  method: method,
                  headers: this.RequestHeaders(bodyType, headers)
                };

                if (method === "POST" || method === "PUT") {
                  if (bodyType === "JSON") {
                    fetchParameters.body = JSON.stringify(body);
                  } else {
                    fetchParameters.body = body;
                  }
                }

                _context.prev = 4;
                _context.next = 7;
                return this.Fetch(uri.toString(), fetchParameters);

              case 7:
                response = _context.sent;
                _context.next = 13;
                break;

              case 10:
                _context.prev = 10;
                _context.t0 = _context["catch"](4);
                response = {
                  ok: false,
                  status: 500,
                  statusText: "ElvClient Error: " + _context.t0.message,
                  url: uri.toString(),
                  stack: _context.t0.stack
                };

              case 13:
                if (response.ok) {
                  _context.next = 36;
                  break;
                }

                if (!(failover && parseInt(response.status) >= 500 && attempts < this.uris.length)) {
                  _context.next = 20;
                  break;
                }

                // Server error - Try next node
                this.uriIndex = (this.uriIndex + 1) % this.uris.length;
                this.Log("HttpClient failing over: ".concat(attempts + 1, " attempts"), true);
                _context.next = 19;
                return this.Request({
                  method: method,
                  path: path,
                  queryParams: queryParams,
                  body: body,
                  bodyType: bodyType,
                  headers: headers,
                  attempts: attempts + 1
                });

              case 19:
                return _context.abrupt("return", _context.sent);

              case 20:
                // Parse JSON error if headers indicate JSON
                responseType = response.headers ? response.headers.get("content-type") : "";
                errorBody = "";

                if (!(response.text && response.json)) {
                  _context.next = 33;
                  break;
                }

                if (!responseType.includes("application/json")) {
                  _context.next = 29;
                  break;
                }

                _context.next = 26;
                return response.json();

              case 26:
                _context.t1 = _context.sent;
                _context.next = 32;
                break;

              case 29:
                _context.next = 31;
                return response.text();

              case 31:
                _context.t1 = _context.sent;

              case 32:
                errorBody = _context.t1;

              case 33:
                error = {
                  name: "ElvHttpClientError",
                  status: response.status,
                  statusText: response.statusText,
                  message: response.statusText,
                  url: uri.toString(),
                  body: errorBody,
                  requestParams: fetchParameters
                };
                this.Log(JSON.stringify(error, null, 2), true);
                throw error;

              case 36:
                this.Log("".concat(response.status, " - ").concat(method, " ").concat(uri.toString()));
                return _context.abrupt("return", response);

              case 38:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this, [[4, 10]]);
      }));

      function Request(_x) {
        return _Request.apply(this, arguments);
      }

      return Request;
    }()
  }, {
    key: "URL",
    value: function URL(_ref3) {
      var path = _ref3.path,
          _ref3$queryParams = _ref3.queryParams,
          queryParams = _ref3$queryParams === void 0 ? {} : _ref3$queryParams;
      return this.BaseURI().path(path).query(queryParams).hash("").toString();
    }
  }]);

  return HttpClient;
}();

module.exports = HttpClient;