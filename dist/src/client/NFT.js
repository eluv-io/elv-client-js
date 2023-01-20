var _regeneratorRuntime = require("@babel/runtime/regenerator");
var _defineProperty = require("@babel/runtime/helpers/defineProperty");
var _asyncToGenerator = require("@babel/runtime/helpers/asyncToGenerator");
function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }
function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }
/**
 * Methods for creating and managing NFTs
 *
 * @module ElvClient/NFT
 */

var UUID = require("uuid");
var UrlJoin = require("url-join");
var _require = require("../Validation"),
  ValidateAddress = _require.ValidateAddress,
  ValidateObject = _require.ValidateObject,
  ValidatePresence = _require.ValidatePresence;

/**
 * Mint NFTs for the specified user
 *
 * @methodGroup Minting
 * @namedParams
 * @param {string} tenantId - The ID of the tenant
 * @param {string=} address - The address of the NFT recipient
 * @param {string} marketplaceId - The ID of the marketplace containing the NFT
 * @param {Array<Object>} items - List of items
 * @param {string} items.sku - SKU of the NFT
 * @param {number=} items.quantity=1 - Number to mint
 * @param {(string | Array<string>)=} items.tokenId - Custom token IDs for these items (must be unique).
 * @param {Object=} items.extraData={} - Additional data to put in the transaction
 * @param {Object=} extraData={} - Additional data to put in the transaction
 *
 * @return Promise<Object> - An object containing the address for whom the NFT was minted and the transactionId of the minting request.
 */
exports.MintNFT = /*#__PURE__*/function () {
  var _ref2 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee(_ref) {
    var tenantId, address, marketplaceId, items, _ref$extraData, extraData, requestBody, transactionId, mintSignature;
    return _regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) switch (_context.prev = _context.next) {
        case 0:
          tenantId = _ref.tenantId, address = _ref.address, marketplaceId = _ref.marketplaceId, items = _ref.items, _ref$extraData = _ref.extraData, extraData = _ref$extraData === void 0 ? {} : _ref$extraData;
          ValidatePresence("tenantId", tenantId);
          ValidatePresence("address", address);
          ValidatePresence("marketplaceId", marketplaceId);
          ValidatePresence("items", items);
          ValidateObject(marketplaceId);
          ValidateAddress(address);
          requestBody = {
            tickets: null,
            products: items.map(function (item) {
              return {
                sku: item.sku,
                quant: item.quantity || 1,
                extra: item.tokenId ? _objectSpread(_objectSpread({}, item.extraData || {}), {}, {
                  token_id: item.tokenId
                }) : _objectSpread({}, item.extraData || {})
              };
            }),
            ident: address,
            cust_name: address,
            extra: _objectSpread(_objectSpread({}, extraData), {}, {
              elv_addr: address
            })
          };
          transactionId = this.utils.B58(UUID.parse(UUID.v4()));
          requestBody.ts = Date.now();
          requestBody.trans_id = transactionId;
          _context.next = 13;
          return this.Sign(JSON.stringify(requestBody));
        case 13:
          mintSignature = _context.sent;
          _context.next = 16;
          return this.authClient.MakeAuthServiceRequest({
            method: "POST",
            path: UrlJoin("/as/tnt/trans/base", tenantId, marketplaceId),
            body: requestBody,
            headers: {
              "Authorization": "Bearer ".concat(mintSignature)
            }
          });
        case 16:
          return _context.abrupt("return", {
            address: address,
            transactionId: transactionId
          });
        case 17:
        case "end":
          return _context.stop();
      }
    }, _callee, this);
  }));
  return function (_x) {
    return _ref2.apply(this, arguments);
  };
}();

/**
 * Retrieve information about transactions for the specified collection
 *
 * @methodGroup Transactions
 * @namedParams
 * @param {string} tenantId - The ID of the tenant
 * @param {string} collectionId - The ID of the NFT collection containing the NFT
 * @param {Object=} filterOptions={} - Options for filtering transactions
 * @param {string=} filterOptions.email - Filter transactions by email.
 * @param {string=} filterOptions.transactionId - Filter transactions by transaction ID.
 * @param {string=} filterOptions.max - The maximum number of transactions to return. Default is 500.
 * @param {string=} filterOptions.status -- Filter transactions by status. Allowed statuses are 'complete', 'failed' and (empty), meaning unprocessed.
 * @param {string=} filterOptions.fromOrdinal - The internal transaction ordinal to start from. Note that negative values are supported and are interpreted as meaning 'from the last current transaction'. Default is 0 - i.e. the beginning.
 *
 * @return Promise<Array<Object>> - A list of transactions matching the specified filters.
 */
exports.CollectionTransactions = /*#__PURE__*/function () {
  var _ref4 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee2(_ref3) {
    var tenantId, collectionId, _ref3$filterOptions, filterOptions, ts, queryParams, allowedOptions, path, signature;
    return _regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) switch (_context2.prev = _context2.next) {
        case 0:
          tenantId = _ref3.tenantId, collectionId = _ref3.collectionId, _ref3$filterOptions = _ref3.filterOptions, filterOptions = _ref3$filterOptions === void 0 ? {} : _ref3$filterOptions;
          ts = Date.now();
          queryParams = {
            ts: ts
          };
          allowedOptions = {
            "email": "email",
            "fromOrdinal": "from_ord",
            "max": "max",
            "status": "status",
            "transactionId": "trans_id"
          };
          Object.keys(allowedOptions).forEach(function (option) {
            if (filterOptions[option]) {
              queryParams[allowedOptions[option]] = filterOptions[option];
            }
          });
          path = this.AuthHttpClient.BaseURI().path(UrlJoin("/tnt", "trans", tenantId, collectionId)).query(queryParams).hash("").resource();
          _context2.next = 8;
          return this.Sign(path);
        case 8:
          signature = _context2.sent;
          _context2.next = 11;
          return this.utils.ResponseToJson(this.authClient.MakeAuthServiceRequest({
            method: "GET",
            path: UrlJoin("as", "tnt", "trans", tenantId, collectionId),
            queryParams: queryParams,
            headers: {
              "Authorization": "Bearer ".concat(signature)
            }
          }));
        case 11:
          return _context2.abrupt("return", _context2.sent);
        case 12:
        case "end":
          return _context2.stop();
      }
    }, _callee2, this);
  }));
  return function (_x2) {
    return _ref4.apply(this, arguments);
  };
}();