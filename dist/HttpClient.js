"use strict";

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var URI = require("urijs");

var Fetch = function Fetch(input) {
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
  function HttpClient(uris) {
    _classCallCheck(this, HttpClient);

    this.uris = uris;
    this.uriIndex = 0;
  }

  _createClass(HttpClient, [{
    key: "BaseURI",
    value: function BaseURI() {
      return new URI(this.uris[this.uriIndex]);
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
      regeneratorRuntime.mark(function _callee(_ref) {
        var method, path, _ref$queryParams, queryParams, _ref$body, body, _ref$bodyType, bodyType, _ref$headers, headers, _ref$attempts, attempts, uri, fetchParameters, response;

        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                method = _ref.method, path = _ref.path, _ref$queryParams = _ref.queryParams, queryParams = _ref$queryParams === void 0 ? {} : _ref$queryParams, _ref$body = _ref.body, body = _ref$body === void 0 ? {} : _ref$body, _ref$bodyType = _ref.bodyType, bodyType = _ref$bodyType === void 0 ? "JSON" : _ref$bodyType, _ref$headers = _ref.headers, headers = _ref$headers === void 0 ? {} : _ref$headers, _ref$attempts = _ref.attempts, attempts = _ref$attempts === void 0 ? 0 : _ref$attempts;
                uri = this.BaseURI().path(path).query(queryParams).hash("");
                fetchParameters = {
                  method: method,
                  headers: this.RequestHeaders(bodyType, headers)
                };

                if (method === "POST" || method === "PUT") {
                  if (bodyType === "JSON") {
                    fetchParameters["body"] = JSON.stringify(body);
                  } else {
                    fetchParameters["body"] = body;
                  }
                }

                _context.prev = 4;
                _context.next = 7;
                return Fetch(uri.toString(), fetchParameters);

              case 7:
                response = _context.sent;
                _context.next = 13;
                break;

              case 10:
                _context.prev = 10;
                _context.t0 = _context["catch"](4);
                response = _objectSpread({
                  ok: false,
                  status: 500,
                  statusText: _context.t0.message,
                  url: uri.toString()
                }, fetchParameters, {
                  stack: _context.t0.stack
                });

              case 13:
                if (response.ok) {
                  _context.next = 35;
                  break;
                }

                if (!(response.status === 500 && attempts < this.uris.length)) {
                  _context.next = 19;
                  break;
                }

                // Try next node
                this.uriIndex = (this.uriIndex + 1) % this.uris.length;
                _context.next = 18;
                return this.Request({
                  method: method,
                  path: path,
                  queryParams: queryParams,
                  body: body,
                  bodyType: bodyType,
                  headers: headers,
                  attempts: attempts + 1
                });

              case 18:
                return _context.abrupt("return", _context.sent);

              case 19:
                _context.t1 = _objectSpread;
                _context.t2 = response.status;
                _context.t3 = response.statusText;
                _context.t4 = response.statusText;
                _context.t5 = uri.toString();

                if (!response.text) {
                  _context.next = 30;
                  break;
                }

                _context.next = 27;
                return response.text();

              case 27:
                _context.t6 = _context.sent;
                _context.next = 31;
                break;

              case 30:
                _context.t6 = "";

              case 31:
                _context.t7 = _context.t6;
                _context.t8 = {
                  name: "ElvHttpClientError",
                  status: _context.t2,
                  statusText: _context.t3,
                  message: _context.t4,
                  url: _context.t5,
                  body: _context.t7
                };
                _context.t9 = fetchParameters;
                throw (0, _context.t1)(_context.t8, _context.t9);

              case 35:
                return _context.abrupt("return", response);

              case 36:
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
    value: function URL(_ref2) {
      var path = _ref2.path,
          _ref2$queryParams = _ref2.queryParams,
          queryParams = _ref2$queryParams === void 0 ? {} : _ref2$queryParams;
      return this.BaseURI().path(path).query(queryParams).hash("").toString();
    }
  }]);

  return HttpClient;
}();

module.exports = HttpClient;