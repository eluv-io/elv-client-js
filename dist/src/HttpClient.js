var _regeneratorRuntime = require("@babel/runtime/regenerator");

var _asyncToGenerator = require("@babel/runtime/helpers/asyncToGenerator");

var _classCallCheck = require("@babel/runtime/helpers/classCallCheck");

var _createClass = require("@babel/runtime/helpers/createClass");

var URI = require("urijs");

var _Fetch = typeof fetch !== "undefined" ? fetch : require("node-fetch")["default"];

var _require = require("./LogMessage"),
    LogMessage = _require.LogMessage;

var HttpClient = /*#__PURE__*/function () {
  "use strict";

  function HttpClient(_ref) {
    var uris = _ref.uris,
        debug = _ref.debug;

    _classCallCheck(this, HttpClient);

    this.uris = uris;
    this.uriIndex = 0;
    this.debug = debug;
    this.draftURIs = {};
  }

  _createClass(HttpClient, [{
    key: "Log",
    value: function Log(message) {
      var error = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
      LogMessage(this, message, error);
    }
  }, {
    key: "BaseURI",
    value: function BaseURI() {
      return new URI(this.uris[this.uriIndex]);
    }
  }, {
    key: "RecordWriteToken",
    value: function RecordWriteToken(writeToken) {
      this.draftURIs[writeToken] = this.BaseURI();
    }
  }, {
    key: "RequestHeaders",
    value: function RequestHeaders(bodyType) {
      var headers = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      if (!headers.Accept) {
        headers["Accept"] = "application/json";
      }

      if (bodyType === "JSON") {
        headers["Content-type"] = "application/json";
      } else if (bodyType === "BINARY") {
        headers["Content-type"] = "application/octet-stream";
      }

      return headers;
    }
  }, {
    key: "Request",
    value: function () {
      var _Request = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee(_ref2) {
        var method, path, _ref2$queryParams, queryParams, body, _ref2$bodyType, bodyType, _ref2$headers, headers, _ref2$attempts, attempts, _ref2$failover, failover, _ref2$forceFailover, forceFailover, baseURI, writeTokenMatch, writeToken, uri, fetchParameters, response, responseType, errorBody, error;

        return _regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                method = _ref2.method, path = _ref2.path, _ref2$queryParams = _ref2.queryParams, queryParams = _ref2$queryParams === void 0 ? {} : _ref2$queryParams, body = _ref2.body, _ref2$bodyType = _ref2.bodyType, bodyType = _ref2$bodyType === void 0 ? "JSON" : _ref2$bodyType, _ref2$headers = _ref2.headers, headers = _ref2$headers === void 0 ? {} : _ref2$headers, _ref2$attempts = _ref2.attempts, attempts = _ref2$attempts === void 0 ? 0 : _ref2$attempts, _ref2$failover = _ref2.failover, failover = _ref2$failover === void 0 ? true : _ref2$failover, _ref2$forceFailover = _ref2.forceFailover, forceFailover = _ref2$forceFailover === void 0 ? false : _ref2$forceFailover;
                baseURI = this.BaseURI(); // If URL contains a write token, it must go to the correct server and can not fail over

                writeTokenMatch = path.replace(/^\//, "").match(/(qlibs\/ilib[a-zA-Z0-9]+|q|qid)\/(tqw_[a-zA-Z0-9]+)/);
                writeToken = writeTokenMatch ? writeTokenMatch[2] : undefined;

                if (writeToken) {
                  if (this.draftURIs[writeToken]) {
                    // Use saved write token URI
                    baseURI = this.draftURIs[writeToken];
                  } else {
                    // Save current URI for all future requests involving this write token
                    this.draftURIs[writeToken] = baseURI;
                  }
                }

                uri = baseURI.path(path).query(queryParams).hash("");
                fetchParameters = {
                  method: method,
                  headers: this.RequestHeaders(bodyType, headers)
                };

                if (method === "POST" || method === "PUT" || method === "DELETE") {
                  if (body && bodyType === "JSON") {
                    fetchParameters.body = JSON.stringify(body);
                  } else if (body) {
                    fetchParameters.body = body;
                  }
                }

                _context.prev = 8;
                _context.next = 11;
                return HttpClient.Fetch(uri.toString(), fetchParameters);

              case 11:
                response = _context.sent;
                _context.next = 17;
                break;

              case 14:
                _context.prev = 14;
                _context.t0 = _context["catch"](8);
                response = {
                  ok: false,
                  status: 500,
                  statusText: "ElvClient Error: " + _context.t0.message,
                  url: uri.toString(),
                  stack: _context.t0.stack
                };

              case 17:
                if (response.ok) {
                  _context.next = 40;
                  break;
                }

                if (!(!writeToken && (failover && parseInt(response.status) >= 500 || forceFailover) && attempts < this.uris.length)) {
                  _context.next = 24;
                  break;
                }

                // Server error - Try next node
                this.Log("HttpClient failing over from ".concat(this.BaseURI(), ": ").concat(attempts + 1, " attempts"), true);
                this.uriIndex = (this.uriIndex + 1) % this.uris.length;
                _context.next = 23;
                return this.Request({
                  method: method,
                  path: path,
                  queryParams: queryParams,
                  body: body,
                  bodyType: bodyType,
                  headers: headers,
                  attempts: attempts + 1,
                  forceFailover: forceFailover
                });

              case 23:
                return _context.abrupt("return", _context.sent);

              case 24:
                // Parse JSON error if headers indicate JSON
                responseType = response.headers ? response.headers.get("content-type") || "" : "";
                errorBody = "";

                if (!(response.text && response.json)) {
                  _context.next = 37;
                  break;
                }

                if (!responseType.includes("application/json")) {
                  _context.next = 33;
                  break;
                }

                _context.next = 30;
                return response.json();

              case 30:
                _context.t1 = _context.sent;
                _context.next = 36;
                break;

              case 33:
                _context.next = 35;
                return response.text();

              case 35:
                _context.t1 = _context.sent;

              case 36:
                errorBody = _context.t1;

              case 37:
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

              case 40:
                this.Log("".concat(response.status, " - ").concat(method, " ").concat(uri.toString()));
                return _context.abrupt("return", response);

              case 42:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this, [[8, 14]]);
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
  }], [{
    key: "Fetch",
    value: function Fetch(url) {
      var params = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      return _Fetch(url, params);
    }
  }]);

  return HttpClient;
}();

module.exports = HttpClient;