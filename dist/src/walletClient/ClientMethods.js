var _defineProperty = require("@babel/runtime/helpers/defineProperty");

var _regeneratorRuntime = require("@babel/runtime/regenerator");

var _asyncToGenerator = require("@babel/runtime/helpers/asyncToGenerator");

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }

var Utils = require("../Utils");

var UrlJoin = require("url-join");

var _require = require("./Utils"),
    FormatNFTDetails = _require.FormatNFTDetails,
    FormatNFTMetadata = _require.FormatNFTMetadata,
    FormatNFT = _require.FormatNFT;
/**
 * Methods
 *
 * @module ClientMethods
 */

/* USER INFO */

/**
 * <b><i>Requires login</i></b>
 *
 * Retrieve information about the user, including the address, wallet type, and (for custodial users) email address.
 *
 * @methodGroup User
 *
 * @returns {Object} - User info
 */


exports.UserInfo = function () {
  if (!this.loggedIn) {
    return;
  }

  return {
    name: this.__authorization.email || this.UserAddress(),
    address: this.UserAddress(),
    email: this.__authorization.email,
    walletType: this.__authorization.walletType,
    walletName: this.__authorization.walletName
  };
};
/**
 * <b><i>Requires login</i></b>
 *
 * Retrieve the address of the current user.
 *
 * @methodGroup User
 *
 * @returns {string} - The address of the current user
 */


exports.UserAddress = function () {
  if (!this.loggedIn) {
    return;
  }

  return this.client.utils.DecodeSignedToken(this.AuthToken()).payload.adr;
};
/**
 * <b><i>Requires login</i></b>
 *
 * Retrieve the fund balances for the current user
 *
 * @methodGroup User
 * @returns {Promise<Object>} - Returns balances for the user. All values are in USD.
 *  <ul>
 *  <li>- totalWalletBalance - Total balance of the users sales and wallet balance purchases</li>
 *  <li>- availableWalletBalance - Balance available for purchasing items</li>
 *  <li>- pendingWalletBalance - Balance unavailable for purchasing items</li>
 *  <li>- withdrawableWalletBalance - Amount that is available for withdrawal</li>
 *  <li>- usedBalance - <i>(Only included if user has set up Solana link with the Phantom wallet)</i> Available USDC balance of the user's Solana wallet</li>
 *  </ul>
 */


exports.UserWalletBalance = /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee() {
  var checkOnboard,
      _yield$this$client$ut,
      balance,
      usage_hold,
      payout_hold,
      stripe_id,
      stripe_payouts_enabled,
      userStripeId,
      userStripeEnabled,
      totalWalletBalance,
      availableWalletBalance,
      pendingWalletBalance,
      withdrawableWalletBalance,
      rootUrl,
      balances,
      _args = arguments;

  return _regeneratorRuntime.wrap(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          checkOnboard = _args.length > 0 && _args[0] !== undefined ? _args[0] : false;

          if (this.loggedIn) {
            _context.next = 3;
            break;
          }

          return _context.abrupt("return");

        case 3:
          _context.t0 = this.client.utils;
          _context.next = 6;
          return this.client.authClient.MakeAuthServiceRequest({
            path: UrlJoin("as", "wlt", "mkt", "bal"),
            method: "GET",
            headers: {
              Authorization: "Bearer ".concat(this.AuthToken())
            }
          });

        case 6:
          _context.t1 = _context.sent;
          _context.next = 9;
          return _context.t0.ResponseToJson.call(_context.t0, _context.t1);

        case 9:
          _yield$this$client$ut = _context.sent;
          balance = _yield$this$client$ut.balance;
          usage_hold = _yield$this$client$ut.usage_hold;
          payout_hold = _yield$this$client$ut.payout_hold;
          stripe_id = _yield$this$client$ut.stripe_id;
          stripe_payouts_enabled = _yield$this$client$ut.stripe_payouts_enabled;
          userStripeId = stripe_id;
          userStripeEnabled = stripe_payouts_enabled;
          totalWalletBalance = parseFloat(balance || 0);
          availableWalletBalance = Math.max(0, totalWalletBalance - parseFloat(usage_hold || 0));
          pendingWalletBalance = Math.max(0, totalWalletBalance - availableWalletBalance);
          withdrawableWalletBalance = Math.max(0, totalWalletBalance - parseFloat(payout_hold || 0));

          if (!(checkOnboard && stripe_id && !stripe_payouts_enabled)) {
            _context.next = 28;
            break;
          }

          // Refresh stripe enabled flag
          rootUrl = new URL(UrlJoin(window.location.origin, window.location.pathname)).toString();
          _context.next = 25;
          return this.client.authClient.MakeAuthServiceRequest({
            path: UrlJoin("as", "wlt", "onb", "stripe"),
            method: "POST",
            body: {
              country: "US",
              mode: this.mode,
              refresh_url: rootUrl.toString(),
              return_url: rootUrl.toString()
            },
            headers: {
              Authorization: "Bearer ".concat(this.AuthToken())
            }
          });

        case 25:
          _context.next = 27;
          return this.UserWalletBalance(false);

        case 27:
          return _context.abrupt("return", _context.sent);

        case 28:
          balances = {
            totalWalletBalance: totalWalletBalance,
            availableWalletBalance: availableWalletBalance,
            pendingWalletBalance: pendingWalletBalance,
            withdrawableWalletBalance: withdrawableWalletBalance
          };

          if (userStripeEnabled) {
            balances.userStripeId = userStripeId;
            balances.userStripeEnabled = userStripeEnabled;
          } // TODO: integrate

          /*
          if(cryptoStore.usdcConnected) {
            balances.usdcBalance = cryptoStore.phantomUSDCBalance;
          }
            */


          return _context.abrupt("return", balances);

        case 31:
        case "end":
          return _context.stop();
      }
    }
  }, _callee, this);
}));
/**
 * Retrieve all valid names for filtering user items. Full item names are required for filtering results by name.
 *
 * Specify marketplace information to filter the results to only items offered in that marketplace.
 *
 * @methodGroup User
 * @namedParams
 * @param {string=} userAddress - Address of a user
 * @param {Object=} marketplaceParams - Parameters of a marketplace to filter results by
 *
 * @returns {Promise<Array<String>>} - A list of item names
 */

exports.UserItemNames = /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee2() {
  var _ref3,
      marketplaceParams,
      userAddress,
      filters,
      _args2 = arguments;

  return _regeneratorRuntime.wrap(function _callee2$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          _ref3 = _args2.length > 0 && _args2[0] !== undefined ? _args2[0] : {}, marketplaceParams = _ref3.marketplaceParams, userAddress = _ref3.userAddress;
          filters = [];

          if (!marketplaceParams) {
            _context2.next = 10;
            break;
          }

          _context2.t0 = filters;
          _context2.t1 = "tenant:eq:";
          _context2.next = 7;
          return this.MarketplaceInfo({
            marketplaceParams: marketplaceParams
          });

        case 7:
          _context2.t2 = _context2.sent.tenantId;
          _context2.t3 = _context2.t1.concat.call(_context2.t1, _context2.t2);

          _context2.t0.push.call(_context2.t0, _context2.t3);

        case 10:
          if (userAddress) {
            filters.push("wlt:eq:".concat(Utils.FormatAddress(userAddress)));
          }

          _context2.t4 = Utils;
          _context2.next = 14;
          return this.client.authClient.MakeAuthServiceRequest({
            path: UrlJoin("as", "wlt", "names"),
            method: "GET",
            queryParams: {
              filter: filters
            }
          });

        case 14:
          _context2.t5 = _context2.sent;
          _context2.next = 17;
          return _context2.t4.ResponseToJson.call(_context2.t4, _context2.t5);

        case 17:
          return _context2.abrupt("return", _context2.sent);

        case 18:
        case "end":
          return _context2.stop();
      }
    }
  }, _callee2, this);
}));
/**
 * Retrieve all valid edition names for filtering the specified item. Full edition names are required for filtering results by edition.
 *
 * Specify marketplace information to filter the results to only items offered in that marketplace.
 *
 * @methodGroup User
 * @namedParams
 * @param {string} displayName - Name of an item
 *
 * @returns {Promise<Array<String>>} - A list of item editions
 */

exports.UserItemEditionNames = /*#__PURE__*/function () {
  var _ref5 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee3(_ref4) {
    var displayName;
    return _regeneratorRuntime.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            displayName = _ref4.displayName;
            _context3.t0 = Utils;
            _context3.next = 4;
            return this.client.authClient.MakeAuthServiceRequest({
              path: UrlJoin("as", "wlt", "editions"),
              method: "GET",
              queryParams: {
                filter: "meta/display_name:eq:".concat(displayName)
              }
            });

          case 4:
            _context3.t1 = _context3.sent;
            _context3.next = 7;
            return _context3.t0.ResponseToJson.call(_context3.t0, _context3.t1);

          case 7:
            return _context3.abrupt("return", _context3.sent);

          case 8:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3, this);
  }));

  return function (_x) {
    return _ref5.apply(this, arguments);
  };
}();
/**
 * Retrieve all valid attribute names and values. Full attribute names and values are required for filtering results by attribute.
 *
 * Specify marketplace information to filter the results to only items offered in that marketplace.
 *
 * @methodGroup User
 * @namedParams
 * @param {string=} userAddress - Address of a user
 * @param {string=} displayName - Name of an item
 * @param {Object=} marketplaceParams - Parameters of a marketplace to filter results by
 *
 * @returns {Promise<Array<String>>} - A list of item names
 */


exports.UserItemAttributes = /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee4() {
  var _ref7,
      marketplaceParams,
      displayName,
      userAddress,
      filters,
      attributes,
      _args4 = arguments;

  return _regeneratorRuntime.wrap(function _callee4$(_context4) {
    while (1) {
      switch (_context4.prev = _context4.next) {
        case 0:
          _ref7 = _args4.length > 0 && _args4[0] !== undefined ? _args4[0] : {}, marketplaceParams = _ref7.marketplaceParams, displayName = _ref7.displayName, userAddress = _ref7.userAddress;
          filters = [];

          if (!marketplaceParams) {
            _context4.next = 10;
            break;
          }

          _context4.t0 = filters;
          _context4.t1 = "tenant:eq:";
          _context4.next = 7;
          return this.MarketplaceInfo({
            marketplaceParams: marketplaceParams
          });

        case 7:
          _context4.t2 = _context4.sent.tenantId;
          _context4.t3 = _context4.t1.concat.call(_context4.t1, _context4.t2);

          _context4.t0.push.call(_context4.t0, _context4.t3);

        case 10:
          if (userAddress) {
            filters.push("wlt:eq:".concat(Utils.FormatAddress(userAddress)));
          }

          if (displayName) {
            filters.push("meta/display_name:eq:".concat(displayName));
          }

          _context4.t4 = Utils;
          _context4.next = 15;
          return this.client.authClient.MakeAuthServiceRequest({
            path: UrlJoin("as", "wlt", "attributes"),
            method: "GET",
            queryParams: {
              filter: filters
            }
          });

        case 15:
          _context4.t5 = _context4.sent;
          _context4.next = 18;
          return _context4.t4.ResponseToJson.call(_context4.t4, _context4.t5);

        case 18:
          attributes = _context4.sent;
          return _context4.abrupt("return", attributes.map(function (_ref8) {
            var trait_type = _ref8.trait_type,
                values = _ref8.values;
            return {
              name: trait_type,
              values: values
            };
          }).filter(function (_ref9) {
            var name = _ref9.name;
            return !["Content Fabric Hash", "Total Minted Supply", "Creator"].includes(name);
          }));

        case 20:
        case "end":
          return _context4.stop();
      }
    }
  }, _callee4, this);
}));
/**
 * <b><i>Requires login</i></b>
 *
 * Retrieve items owned by the specified or current user matching the specified parameters.
 *
 * @methodGroup User
 * @namedParams
 * @param {string=} userAddress - Address of a user. If not specified, will return results for current user
 * @param {integer=} start=0 - PAGINATION: Index from which the results should start
 * @param {integer=} limit=50 - PAGINATION: Maximum number of results to return
 * @param {string=} sortBy="default" - Sort order. Options: `default`, `meta/display_name`
 * @param {boolean=} sortDesc=false - Sort results descending instead of ascending
 * @param {string=} filter - Filter results by item name.
 * @param {string=} contractAddress - Filter results by the address of the NFT contract
 * @param {string=} tokenId - Filter by token ID (if filtering by contract address)
 * @param {Object=} marketplaceParams - Filter results by marketplace
 * @param {Array<integer>=} collectionIndexes - If filtering by marketplace, filter by collection(s). The index refers to the index in the array `marketplace.collections`
 *
 * @returns {Promise<Object>} - Results of the query and pagination info
 */

exports.UserItems = /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee5() {
  var _ref11,
      _ref11$sortBy,
      sortBy,
      _args5 = arguments;

  return _regeneratorRuntime.wrap(function _callee5$(_context5) {
    while (1) {
      switch (_context5.prev = _context5.next) {
        case 0:
          _ref11 = _args5.length > 0 && _args5[0] !== undefined ? _args5[0] : {}, _ref11$sortBy = _ref11.sortBy, sortBy = _ref11$sortBy === void 0 ? "default" : _ref11$sortBy;
          return _context5.abrupt("return", this.FilteredQuery(_objectSpread({
            mode: "owned",
            sortBy: sortBy
          }, _args5[0] || {})));

        case 2:
        case "end":
          return _context5.stop();
      }
    }
  }, _callee5, this);
}));
/**
 * Return all listings for the current user. Not paginated.
 *
 * @methodGroup User
 * @namedParams
 * @param {string=} userAddress - Address of a user. If not specified, will return results for current user
 * @param {string=} sortBy="created" - Sort order. Options: `created`, `info/token_id`, `info/ordinal`, `price`, `nft/display_name`
 * @param {boolean=} sortDesc=false - Sort results descending instead of ascending
 * @param {Object=} marketplaceParams - Filter results by marketplace
 * @param {string=} contractAddress - Filter results by the address of the NFT contract
 * @param {string=} tokenId - Filter by token ID (if filtering by contract address)
 *
 * @returns {Promise<Array<Object>>} - List of current user's listings
 */

exports.UserListings = /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee6() {
  var _ref13,
      userAddress,
      _ref13$sortBy,
      sortBy,
      _ref13$sortDesc,
      sortDesc,
      contractAddress,
      tokenId,
      marketplaceParams,
      _args6 = arguments;

  return _regeneratorRuntime.wrap(function _callee6$(_context6) {
    while (1) {
      switch (_context6.prev = _context6.next) {
        case 0:
          _ref13 = _args6.length > 0 && _args6[0] !== undefined ? _args6[0] : {}, userAddress = _ref13.userAddress, _ref13$sortBy = _ref13.sortBy, sortBy = _ref13$sortBy === void 0 ? "created" : _ref13$sortBy, _ref13$sortDesc = _ref13.sortDesc, sortDesc = _ref13$sortDesc === void 0 ? false : _ref13$sortDesc, contractAddress = _ref13.contractAddress, tokenId = _ref13.tokenId, marketplaceParams = _ref13.marketplaceParams;
          _context6.next = 3;
          return this.FilteredQuery({
            mode: "listings",
            start: 0,
            limit: 10000,
            sortBy: sortBy,
            sortDesc: sortDesc,
            sellerAddress: userAddress || this.UserAddress(),
            marketplaceParams: marketplaceParams,
            contractAddress: contractAddress,
            tokenId: tokenId,
            includeCheckoutLocked: true
          });

        case 3:
          return _context6.abrupt("return", _context6.sent.results);

        case 4:
        case "end":
          return _context6.stop();
      }
    }
  }, _callee6, this);
}));
/**
 * Return all sales for the current user. Not paginated.
 *
 * @methodGroup User
 * @namedParams
 * @param {string=} userAddress - Address of a user. If not specified, will return results for current user
 * @param {string=} sortBy="created" - Sort order. Options: `created`, `price`, `name`
 * @param {boolean=} sortDesc=false - Sort results descending instead of ascending
 * @param {Object=} marketplaceParams - Filter results by marketplace
 * @param {string=} contractAddress - Filter results by the address of the NFT contract
 * @param {string=} tokenId - Filter by token ID (if filtering by contract address)
 * @param {integer=} lastNDays - Filter by results listed in the past N days
 *
 * @returns {Promise<Array<Object>>} - List of current user's sales
 */

exports.UserSales = /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee7() {
  var _ref15,
      userAddress,
      _ref15$sortBy,
      sortBy,
      _ref15$sortDesc,
      sortDesc,
      contractAddress,
      tokenId,
      marketplaceParams,
      _args7 = arguments;

  return _regeneratorRuntime.wrap(function _callee7$(_context7) {
    while (1) {
      switch (_context7.prev = _context7.next) {
        case 0:
          _ref15 = _args7.length > 0 && _args7[0] !== undefined ? _args7[0] : {}, userAddress = _ref15.userAddress, _ref15$sortBy = _ref15.sortBy, sortBy = _ref15$sortBy === void 0 ? "created" : _ref15$sortBy, _ref15$sortDesc = _ref15.sortDesc, sortDesc = _ref15$sortDesc === void 0 ? false : _ref15$sortDesc, contractAddress = _ref15.contractAddress, tokenId = _ref15.tokenId, marketplaceParams = _ref15.marketplaceParams;
          _context7.next = 3;
          return this.FilteredQuery({
            mode: "sales",
            start: 0,
            limit: 10000,
            sortBy: sortBy,
            sortDesc: sortDesc,
            sellerAddress: userAddress || this.UserAddress(),
            marketplaceParams: marketplaceParams,
            contractAddress: contractAddress,
            tokenId: tokenId
          });

        case 3:
          return _context7.abrupt("return", _context7.sent.results);

        case 4:
        case "end":
          return _context7.stop();
      }
    }
  }, _callee7, this);
}));
/**
 * Return all transfers and sales for the current user. Not paginated.
 *
 * @methodGroup User
 * @namedParams
 * @param {string=} userAddress - Address of a user. If not specified, will return results for current user
 * @param {string=} sortBy="created" - Sort order. Options: `created`, `price`, `name`
 * @param {boolean=} sortDesc=false - Sort results descending instead of ascending
 * @param {Object=} marketplaceParams - Filter results by marketplace
 * @param {string=} contractAddress - Filter results by the address of the NFT contract
 * @param {string=} tokenId - Filter by token ID (if filtering by contract address)
 * @param {integer=} lastNDays - Filter by results listed in the past N days
 *
 * @returns {Promise<Array<Object>>} - List of current user's sales
 */

exports.UserTransfers = /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee8() {
  var _ref17,
      userAddress,
      _ref17$sortBy,
      sortBy,
      _ref17$sortDesc,
      sortDesc,
      contractAddress,
      tokenId,
      marketplaceParams,
      _args8 = arguments;

  return _regeneratorRuntime.wrap(function _callee8$(_context8) {
    while (1) {
      switch (_context8.prev = _context8.next) {
        case 0:
          _ref17 = _args8.length > 0 && _args8[0] !== undefined ? _args8[0] : {}, userAddress = _ref17.userAddress, _ref17$sortBy = _ref17.sortBy, sortBy = _ref17$sortBy === void 0 ? "created" : _ref17$sortBy, _ref17$sortDesc = _ref17.sortDesc, sortDesc = _ref17$sortDesc === void 0 ? false : _ref17$sortDesc, contractAddress = _ref17.contractAddress, tokenId = _ref17.tokenId, marketplaceParams = _ref17.marketplaceParams;
          _context8.next = 3;
          return this.FilteredQuery({
            mode: "transfers",
            start: 0,
            limit: 10000,
            sortBy: sortBy,
            sortDesc: sortDesc,
            sellerAddress: userAddress || this.UserAddress(),
            marketplaceParams: marketplaceParams,
            contractAddress: contractAddress,
            tokenId: tokenId
          });

        case 3:
          return _context8.abrupt("return", _context8.sent.results);

        case 4:
        case "end":
          return _context8.stop();
      }
    }
  }, _callee8, this);
}));
/* TENANT */

/**
 * Retrieve configuration information about the specified tenant, or the tenant associated with the specified contract.
 *
 * This information includes the royalty rate the tenant receives for secondary sales.
 *
 * @methodGroup Tenants
 * @namedParams
 * @param {string=} tenantId - The ID of the tenant for which to retrieve configuration
 * @param {string=} contractAddress - The ID of an nft contract for which to retrieve configuration
 *
 * @returns {Promise<Object>} - The tenant configuration
 */

exports.TenantConfiguration = /*#__PURE__*/function () {
  var _ref19 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee9(_ref18) {
    var tenantId, contractAddress;
    return _regeneratorRuntime.wrap(function _callee9$(_context9) {
      while (1) {
        switch (_context9.prev = _context9.next) {
          case 0:
            tenantId = _ref18.tenantId, contractAddress = _ref18.contractAddress;
            _context9.prev = 1;
            _context9.next = 4;
            return Utils.ResponseToJson(this.client.authClient.MakeAuthServiceRequest({
              path: contractAddress ? UrlJoin("as", "config", "nft", contractAddress) : UrlJoin("as", "config", "tnt", tenantId),
              method: "GET"
            }));

          case 4:
            return _context9.abrupt("return", _context9.sent);

          case 7:
            _context9.prev = 7;
            _context9.t0 = _context9["catch"](1);
            this.Log("Failed to load tenant configuration", true, _context9.t0);
            return _context9.abrupt("return", {});

          case 11:
          case "end":
            return _context9.stop();
        }
      }
    }, _callee9, this, [[1, 7]]);
  }));

  return function (_x2) {
    return _ref19.apply(this, arguments);
  };
}();
/**
 * Retrieve the current exchange rate for the specified currency to USD
 *
 * @methodGroup Tenants
 * @namedParams
 * @param {string} currency - The currency for which to retrieve the USD exchange rate
 */


exports.ExchangeRate = /*#__PURE__*/function () {
  var _ref21 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee10(_ref20) {
    var currency;
    return _regeneratorRuntime.wrap(function _callee10$(_context10) {
      while (1) {
        switch (_context10.prev = _context10.next) {
          case 0:
            currency = _ref20.currency;

            if (currency) {
              _context10.next = 3;
              break;
            }

            throw Error("Eluvio Wallet Client: Invalid or missing currency in ExchangeRate");

          case 3:
            _context10.next = 5;
            return Utils.ResponseToJson(this.client.authClient.MakeAuthServiceRequest({
              path: UrlJoin("as", "xr", "ebanx", currency),
              method: "GET"
            }));

          case 5:
            return _context10.abrupt("return", _context10.sent);

          case 6:
          case "end":
            return _context10.stop();
        }
      }
    }, _callee10, this);
  }));

  return function (_x3) {
    return _ref21.apply(this, arguments);
  };
}();
/* MARKETPLACE */

/**
 * Retrieve available stock for the specified marketplace, organized by SKU.
 *
 * If a user is logged in, stock information will also include how many of that item the user has purchased.
 *
 * @methodGroup Marketplaces
 * @namedParams
 * @param {Object} marketplaceParams - Parameters of the marketplace
 *
 * @returns {Promise<Object>} - Stock info for items in the marketplace
 */


exports.MarketplaceStock = /*#__PURE__*/function () {
  var _ref23 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee11(_ref22) {
    var marketplaceParams, tenantId, marketplaceInfo;
    return _regeneratorRuntime.wrap(function _callee11$(_context11) {
      while (1) {
        switch (_context11.prev = _context11.next) {
          case 0:
            marketplaceParams = _ref22.marketplaceParams, tenantId = _ref22.tenantId;

            if (!tenantId) {
              marketplaceInfo = this.MarketplaceInfo({
                marketplaceParams: marketplaceParams
              });
              tenantId = marketplaceInfo.tenantId;
            }

            if (!this.loggedIn) {
              _context11.next = 6;
              break;
            }

            _context11.next = 5;
            return Utils.ResponseToJson(this.client.authClient.MakeAuthServiceRequest({
              path: UrlJoin("as", "wlt", "nft", "info", tenantId),
              method: "GET",
              headers: {
                Authorization: "Bearer ".concat(this.AuthToken())
              }
            }));

          case 5:
            return _context11.abrupt("return", _context11.sent);

          case 6:
            _context11.next = 8;
            return Utils.ResponseToJson(this.client.authClient.MakeAuthServiceRequest({
              path: UrlJoin("as", "nft", "stock", tenantId),
              method: "GET"
            }));

          case 8:
            return _context11.abrupt("return", _context11.sent);

          case 9:
          case "end":
            return _context11.stop();
        }
      }
    }, _callee11, this);
  }));

  return function (_x4) {
    return _ref23.apply(this, arguments);
  };
}();
/**
 * Retrieve basic information about a specific available marketplace with the specified tenant/marketplace slug, ID, or hash.
 *
 * Includes the slugs, ID and hash of the marketplace, as well as branding information.
 *
 * To retrieve full metadata for the marketplace, use the <a href="#.Marketplace">Marketplace</a> method.
 *
 * @methodGroup Marketplaces
 * @namedParams
 * @param {Object} marketplaceParams - Parameters of the marketplace
 *
 * @returns {Promise<Object>} - Info about the marketplace
 */


exports.MarketplaceInfo = function (_ref24) {
  var marketplaceParams = _ref24.marketplaceParams;

  var _ref25 = marketplaceParams || {},
      tenantSlug = _ref25.tenantSlug,
      marketplaceSlug = _ref25.marketplaceSlug,
      marketplaceId = _ref25.marketplaceId,
      marketplaceHash = _ref25.marketplaceHash;

  var marketplaceInfo;

  if (tenantSlug && marketplaceSlug) {
    marketplaceInfo = (this.availableMarketplaces[tenantSlug] || {})[marketplaceSlug];
  } else {
    marketplaceId = marketplaceHash ? this.client.utils.DecodeVersionHash(marketplaceHash).objectId : marketplaceId;
    marketplaceInfo = this.availableMarketplacesById[marketplaceId];
  }

  if (!marketplaceInfo) {
    throw Error("Eluvio Wallet Client: Unable to find marketplace with parameters ".concat(JSON.stringify(arguments)));
  }

  return marketplaceInfo;
};
/**
 * Retrieve custom CSS for the specified marketplace
 *
 * @methodGroup Marketplaces
 * @namedParams
 * @param {Object} marketplaceParams - Parameters of the marketplace
 *
 * @returns {Promise<string>} - The CSS of the marketplace
 */


exports.MarketplaceCSS = /*#__PURE__*/function () {
  var _ref27 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee12(_ref26) {
    var marketplaceParams, marketplaceInfo, marketplaceHash;
    return _regeneratorRuntime.wrap(function _callee12$(_context12) {
      while (1) {
        switch (_context12.prev = _context12.next) {
          case 0:
            marketplaceParams = _ref26.marketplaceParams;
            marketplaceInfo = this.MarketplaceInfo({
              marketplaceParams: marketplaceParams
            });
            marketplaceHash = marketplaceInfo.marketplaceHash;

            if (this.cachedCSS[marketplaceHash]) {
              _context12.next = 7;
              break;
            }

            _context12.next = 6;
            return this.client.ContentObjectMetadata({
              versionHash: marketplaceHash,
              metadataSubtree: "public/asset_metadata/info/branding/custom_css",
              authorizationToken: this.publicStaticToken,
              noAuth: true
            });

          case 6:
            this.cachedCSS[marketplaceHash] = _context12.sent;

          case 7:
            return _context12.abrupt("return", this.cachedCSS[marketplaceHash] || "");

          case 8:
          case "end":
            return _context12.stop();
        }
      }
    }, _callee12, this);
  }));

  return function (_x5) {
    return _ref27.apply(this, arguments);
  };
}();
/**
 * Retrieve info about all available marketplaces
 *
 * @methodGroup Marketplaces
 * @namedParams
 * @param {boolean=} organizeById - By default, the returned marketplace info is organized by tenant and marketplace slug. If this option is enabled, the marketplaces will be organized by marketplace ID instead.
 * @param {boolean=} forceReload=false - If specified, a new request will be made to check the currently available marketplaces instead of returning cached info
 *
 * @returns {Promise<Object>} - Info about available marketplaces
 */


exports.AvailableMarketplaces = /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee13() {
  var _ref29,
      organizeById,
      _ref29$forceReload,
      forceReload,
      _args13 = arguments;

  return _regeneratorRuntime.wrap(function _callee13$(_context13) {
    while (1) {
      switch (_context13.prev = _context13.next) {
        case 0:
          _ref29 = _args13.length > 0 && _args13[0] !== undefined ? _args13[0] : {}, organizeById = _ref29.organizeById, _ref29$forceReload = _ref29.forceReload, forceReload = _ref29$forceReload === void 0 ? false : _ref29$forceReload;

          if (!forceReload) {
            _context13.next = 4;
            break;
          }

          _context13.next = 4;
          return this.LoadAvailableMarketplaces(true);

        case 4:
          return _context13.abrupt("return", _objectSpread({}, organizeById ? this.availableMarketplacesById : this.availableMarketplaces));

        case 5:
        case "end":
          return _context13.stop();
      }
    }
  }, _callee13, this);
}));
/**
 * Retrieve full information about the specified marketplace
 *
 * <b><i>Note</i></b> - Upon changing login state, the marketplace should be retrieved again as permission info in marketplace items may be different depending on the current user's permissions.
 *
 * @methodGroup Marketplaces
 * @namedParams
 * @param {Object} marketplaceParams - Parameters of the marketplace
 *
 * @returns {Promise<Object>} - The full information for the marketplace
 */

exports.Marketplace = /*#__PURE__*/function () {
  var _ref31 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee14(_ref30) {
    var marketplaceParams;
    return _regeneratorRuntime.wrap(function _callee14$(_context14) {
      while (1) {
        switch (_context14.prev = _context14.next) {
          case 0:
            marketplaceParams = _ref30.marketplaceParams;
            return _context14.abrupt("return", this.LoadMarketplace(marketplaceParams));

          case 2:
          case "end":
            return _context14.stop();
        }
      }
    }, _callee14, this);
  }));

  return function (_x6) {
    return _ref31.apply(this, arguments);
  };
}();
/* NFTS */

/**
 * Return info about the specified NFT contract, including the cap, current total supply, and total minted and burned.
 *
 * @methodGroup NFTs
 * @namedParams
 * @param {string} contractAddress - The contract address of the NFT
 *
 * @returns {Promise<Object>} - Information about the specified contract
 */


exports.NFTContractStats = /*#__PURE__*/function () {
  var _ref33 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee15(_ref32) {
    var contractAddress;
    return _regeneratorRuntime.wrap(function _callee15$(_context15) {
      while (1) {
        switch (_context15.prev = _context15.next) {
          case 0:
            contractAddress = _ref32.contractAddress;
            _context15.next = 3;
            return Utils.ResponseToJson(this.client.authClient.MakeAuthServiceRequest({
              path: UrlJoin("as", "nft", "info", contractAddress),
              method: "GET"
            }));

          case 3:
            return _context15.abrupt("return", _context15.sent);

          case 4:
          case "end":
            return _context15.stop();
        }
      }
    }, _callee15, this);
  }));

  return function (_x7) {
    return _ref33.apply(this, arguments);
  };
}();
/**
 * Load full info for the specified NFT
 *
 * @methodGroup NFTs
 * @namedParams
 * @param {string} contractAddress - The contract address of the NFT
 * @param {string} tokenId - The token ID of the NFT
 */


exports.NFT = /*#__PURE__*/function () {
  var _ref35 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee16(_ref34) {
    var tokenId, contractAddress, nft;
    return _regeneratorRuntime.wrap(function _callee16$(_context16) {
      while (1) {
        switch (_context16.prev = _context16.next) {
          case 0:
            tokenId = _ref34.tokenId, contractAddress = _ref34.contractAddress;
            _context16.t0 = FormatNFTDetails;
            _context16.next = 4;
            return Utils.ResponseToJson(this.client.authClient.MakeAuthServiceRequest({
              path: UrlJoin("as", "nft", "info", contractAddress, tokenId),
              method: "GET"
            }));

          case 4:
            _context16.t1 = _context16.sent;
            nft = (0, _context16.t0)(_context16.t1);
            _context16.t2 = _objectSpread;
            _context16.t3 = _objectSpread;
            _context16.t4 = {};
            _context16.next = 11;
            return this.client.ContentObjectMetadata({
              versionHash: nft.details.VersionHash,
              metadataSubtree: "public/asset_metadata/nft",
              produceLinkUrls: true
            });

          case 11:
            _context16.t5 = _context16.sent;

            if (_context16.t5) {
              _context16.next = 14;
              break;
            }

            _context16.t5 = {};

          case 14:
            _context16.t6 = _context16.t5;
            _context16.t7 = (0, _context16.t3)(_context16.t4, _context16.t6);
            _context16.t8 = nft.metadata || {};
            nft.metadata = (0, _context16.t2)(_context16.t7, _context16.t8);
            _context16.next = 20;
            return this.TenantConfiguration({
              contractAddress: contractAddress
            });

          case 20:
            nft.config = _context16.sent;
            return _context16.abrupt("return", FormatNFTMetadata(this, nft));

          case 22:
          case "end":
            return _context16.stop();
        }
      }
    }, _callee16, this);
  }));

  return function (_x8) {
    return _ref35.apply(this, arguments);
  };
}();
/**
 * <b><i>Requires login</i></b>
 *
 * Transfer the specified NFT owned by the current user to the specified address
 *
 * @methodGroup NFTs
 * @namedParams
 * @param {string} contractAddress - The contract address of the NFT
 * @param {string} tokenId - The token ID of the NFT
 * @param {string} targetAddress - The address to which to transfer the NFT
 */


exports.TransferNFT = /*#__PURE__*/function () {
  var _ref37 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee17(_ref36) {
    var contractAddress, tokenId, targetAddress;
    return _regeneratorRuntime.wrap(function _callee17$(_context17) {
      while (1) {
        switch (_context17.prev = _context17.next) {
          case 0:
            contractAddress = _ref36.contractAddress, tokenId = _ref36.tokenId, targetAddress = _ref36.targetAddress;

            if (!(!targetAddress || !Utils.ValidAddress(targetAddress))) {
              _context17.next = 3;
              break;
            }

            throw Error("Eluvio Wallet Client: Invalid or missing target address in UserTransferNFT");

          case 3:
            _context17.next = 5;
            return this.client.authClient.MakeAuthServiceRequest({
              path: UrlJoin("as", "wlt", "mkt", "xfer"),
              method: "POST",
              body: {
                contract: Utils.FormatAddress(contractAddress),
                token: tokenId,
                to_addr: Utils.FormatAddress(targetAddress)
              },
              headers: {
                Authorization: "Bearer ".concat(this.AuthToken())
              }
            });

          case 5:
            return _context17.abrupt("return", _context17.sent);

          case 6:
          case "end":
            return _context17.stop();
        }
      }
    }, _callee17, this);
  }));

  return function (_x9) {
    return _ref37.apply(this, arguments);
  };
}();
/** LISTINGS */

/**
 * Retrieve the status of the specified listing
 *
 * @methodGroup Listings
 * @namedParams
 * @param {string=} listingId - The ID of the listing
 *
 * @returns {Promise<Object>} - The status of the listing
 */


exports.ListingStatus = /*#__PURE__*/function () {
  var _ref39 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee18(_ref38) {
    var listingId;
    return _regeneratorRuntime.wrap(function _callee18$(_context18) {
      while (1) {
        switch (_context18.prev = _context18.next) {
          case 0:
            listingId = _ref38.listingId;
            _context18.prev = 1;
            _context18.t0 = Utils;
            _context18.next = 5;
            return this.client.authClient.MakeAuthServiceRequest({
              path: UrlJoin("as", "mkt", "status", listingId),
              method: "GET"
            });

          case 5:
            _context18.t1 = _context18.sent;
            _context18.next = 8;
            return _context18.t0.ResponseToJson.call(_context18.t0, _context18.t1);

          case 8:
            return _context18.abrupt("return", _context18.sent);

          case 11:
            _context18.prev = 11;
            _context18.t2 = _context18["catch"](1);

            if (!(_context18.t2.status === 404)) {
              _context18.next = 15;
              break;
            }

            return _context18.abrupt("return");

          case 15:
            throw _context18.t2;

          case 16:
          case "end":
            return _context18.stop();
        }
      }
    }, _callee18, this, [[1, 11]]);
  }));

  return function (_x10) {
    return _ref39.apply(this, arguments);
  };
}();
/**
 * Retrieve a specific listing
 *
 * NOTE: When a listing is sold or deleted, it will no longer be queryable with this API. Use <a href="#.ListingStatus">ListingStatus</a> instead.
 *
 * @methodGroup Listings
 * @namedParams
 * @param {string=} listingId - The ID of the listing
 *
 * @returns {Promise<Object>} - The listing
 */


exports.Listing = /*#__PURE__*/function () {
  var _ref41 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee19(_ref40) {
    var listingId;
    return _regeneratorRuntime.wrap(function _callee19$(_context19) {
      while (1) {
        switch (_context19.prev = _context19.next) {
          case 0:
            listingId = _ref40.listingId;
            _context19.t0 = FormatNFT;
            _context19.t1 = this;
            _context19.t2 = Utils;
            _context19.next = 6;
            return this.client.authClient.MakeAuthServiceRequest({
              path: UrlJoin("as", "mkt", "l", listingId),
              method: "GET"
            });

          case 6:
            _context19.t3 = _context19.sent;
            _context19.next = 9;
            return _context19.t2.ResponseToJson.call(_context19.t2, _context19.t3);

          case 9:
            _context19.t4 = _context19.sent;
            return _context19.abrupt("return", (0, _context19.t0)(_context19.t1, _context19.t4));

          case 11:
          case "end":
            return _context19.stop();
        }
      }
    }, _callee19, this);
  }));

  return function (_x11) {
    return _ref41.apply(this, arguments);
  };
}();
/**
 * Retrieve listings matching the specified parameters.
 *
 * @methodGroup Listings
 * @namedParams
 * @param {integer=} start=0 - PAGINATION: Index from which the results should start
 * @param {integer=} limit=50 - PAGINATION: Maximum number of results to return
 * @param {string=} sortBy="created" - Sort order. Options: `created`, `info/token_id`, `info/ordinal`, `price`, `nft/display_name`
 * @param {boolean=} sortDesc=false - Sort results descending instead of ascending
 * @param {string=} filter - Filter results by item name.
 *  <br /><br />
 *  NOTE: This string must be an <b>exact match</b> on the item name.
 * You can retrieve all available item names from the <a href="#.ListingNames">ListingNames method</a>.
 *  @param {Array<string>=} editionFilters - Filter results by item edition.
 *  <br /><br />
 *  NOTE: This string must be an <b>exact match</b> on the edition name.
 * You can retrieve all available item edition names from the <a href="#.ListingEditionNames">ListingEditionNames method</a>.
 *  @param {Array<Object>} attributeFilters - Filter results by item attributes. Each entry should include name and value (e.g. `[{name: "attribute-name", value: "attribute-value"}]`)
 *  <br /><br />
 *  NOTE: These filters must be an <b>exact match</b> on the attribute name and value.
 * You can retrieve all available item attributes from the <a href="#.ListingAttributes">ListingAttributes method</a>.
 * @param {Object=} priceRange - Filter min and/or max price (e.g. `{min: 1}` `{max: 2}` `{min: 1.50, max: 10.50})
 * @param {string=} sellerAddress - Filter by a specific seller
 * @param {string=} contractAddress - Filter results by the address of the NFT contract
 * @param {string=} tokenId - Filter by token ID (if filtering by contract address)
 * @param {string=} currency - Filter results by purchase currency. Available options: `usdc`
 * @param {Object=} marketplaceParams - Filter results by marketplace
 * @param {Array<integer>=} collectionIndexes - If filtering by marketplace, filter by collection(s). The index refers to the index in the array `marketplace.collections`
 * @param {integer=} lastNDays - Filter by results listed in the past N days
 * @param {boolean=} includeCheckoutLocked - If specified, listings which are currently in the checkout process (and not so currently purchasable) will be included in the results. By default they are excluded.
 *
 * @returns {Promise<Object>} - Results of the query and pagination info
 */


exports.Listings = /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee20() {
  var _args20 = arguments;
  return _regeneratorRuntime.wrap(function _callee20$(_context20) {
    while (1) {
      switch (_context20.prev = _context20.next) {
        case 0:
          return _context20.abrupt("return", this.FilteredQuery(_objectSpread({
            mode: "listings"
          }, _args20[0] || {})));

        case 1:
        case "end":
          return _context20.stop();
      }
    }
  }, _callee20, this);
}));
/**
 * Retrieve stats for listings matching the specified parameters.
 *
 * @methodGroup Listings
 * @namedParams
 * @param {integer=} start=0 - PAGINATION: Index from which the results should start
 * @param {integer=} limit=50 - PAGINATION: Maximum number of results to return
 * @param {string=} sortBy="created" - Sort order. Options: `created`, `info/token_id`, `info/ordinal`, `price`, `nft/display_name`
 * @param {boolean=} sortDesc=false - Sort results descending instead of ascending
 * @param {string=} filter - Filter results by item name.
 *  <br /><br />
 *  NOTE: This string must be an <b>exact match</b> on the item name.
 * You can retrieve all available item names from the <a href="#.ListingNames">ListingNames method</a>.
 *  @param {Array<string>} editionFilters - Filter results by item edition.
 *  <br /><br />
 *  NOTE: This string must be an <b>exact match</b> on the edition name.
 * You can retrieve all available item edition names from the <a href="#.ListingEditionNames">ListingEditionNames method</a>.
 *  @param {Array<Object>} attributeFilters - Filter results by item attributes. Each entry should include name and value (e.g. `[{name: "attribute-name", value: "attribute-value"}]`)
 *  <br /><br />
 *  NOTE: These filters must be an <b>exact match</b> on the attribute name and value.
 * You can retrieve all available item attributes from the <a href="#.ListingAttributes">ListingAttributes method</a>.
 * @param {Object=} priceRange - Filter min and/or max price (e.g. `{min: 1}` `{max: 2}` `{min: 1.50, max: 10.50})
 * @param {string=} sellerAddress - Filter by a specific seller
 * @param {string=} contractAddress - Filter results by the address of the NFT contract
 * @param {string=} tokenId - Filter by token ID (if filtering by contract address)
 * @param {string=} currency - Filter results by purchase currency. Available options: `usdc`
 * @param {Object=} marketplaceParams - Filter results by marketplace
 * @param {Array<integer>=} collectionIndexes - If filtering by marketplace, filter by collection(s). The index refers to the index in the array `marketplace.collections`
 * @param {integer=} lastNDays - Filter by results listed in the past N days
 *
 * @returns {Promise<Object>} - Statistics about listings. All prices in USD.
 */

exports.ListingStats = /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee21() {
  var _args21 = arguments;
  return _regeneratorRuntime.wrap(function _callee21$(_context21) {
    while (1) {
      switch (_context21.prev = _context21.next) {
        case 0:
          return _context21.abrupt("return", this.FilteredQuery(_objectSpread({
            mode: "listing-stats"
          }, _args21[0] || {})));

        case 1:
        case "end":
          return _context21.stop();
      }
    }
  }, _callee21, this);
}));
/**
 * Retrieve sales matching the specified parameters.
 *
 * @methodGroup Listings
 * @namedParams
 * @param {integer=} start=0 - PAGINATION: Index from which the results should start
 * @param {integer=} limit=50 - PAGINATION: Maximum number of results to return
 * @param {string=} sortBy="created" - Sort order. Options: `created`, `price`, `name`
 * @param {boolean=} sortDesc=false - Sort results descending instead of ascending
 * @param {string=} filter - Filter results by item name.
 *  <br /><br />
 *  NOTE: This string must be an <b>exact match</b> on the item name.
 * You can retrieve all available item names from the <a href="#.ListingNames">ListingNames method</a>.
 *  @param {Array<string>} editionFilters - Filter results by item edition.
 *  <br /><br />
 *  NOTE: This string must be an <b>exact match</b> on the edition name.
 * You can retrieve all available item edition names from the <a href="#.ListingEditionNames">ListingEditionNames method</a>.
 *  @param {Array<Object>} attributeFilters - Filter results by item attributes. Each entry should include name and value (e.g. `[{name: "attribute-name", value: "attribute-value"}]`)
 *  <br /><br />
 *  NOTE: These filters must be an <b>exact match</b> on the attribute name and value.
 * You can retrieve all available item attributes from the <a href="#.ListingAttributes">ListingAttributes method</a>.
 * @param {string=} sellerAddress - Filter by a specific seller
 * @param {string=} contractAddress - Filter results by the address of the NFT contract
 * @param {string=} tokenId - Filter by token ID (if filtering by contract address)
 * @param {string=} currency - Filter results by purchase currency. Available options: `usdc`
 * @param {Object=} marketplaceParams - Filter results by marketplace
 * @param {Array<integer>=} collectionIndexes - If filtering by marketplace, filter by collection(s). The index refers to the index in the array `marketplace.collections`
 * @param {integer=} lastNDays - Filter by results listed in the past N days
 *
 * @returns {Promise<Object>} - Results of the query and pagination info
 */

exports.Sales = /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee22() {
  var _args22 = arguments;
  return _regeneratorRuntime.wrap(function _callee22$(_context22) {
    while (1) {
      switch (_context22.prev = _context22.next) {
        case 0:
          return _context22.abrupt("return", this.FilteredQuery(_objectSpread({
            mode: "sales"
          }, _args22[0] || {})));

        case 1:
        case "end":
          return _context22.stop();
      }
    }
  }, _callee22, this);
}));
/**
 * Retrieve sales and transfers matching the specified parameters.
 *
 * @methodGroup Listings
 * @namedParams
 * @param {integer=} start=0 - PAGINATION: Index from which the results should start
 * @param {integer=} limit=50 - PAGINATION: Maximum number of results to return
 * @param {string=} sortBy="created" - Sort order. Options: `created`, `price`, `name`
 * @param {boolean=} sortDesc=false - Sort results descending instead of ascending
 * @param {string=} filter - Filter results by item name.
 *  <br /><br />
 *  NOTE: This string must be an <b>exact match</b> on the item name.
 * You can retrieve all available item names from the <a href="#.ListingNames">ListingNames method</a>.
 *  @param {Array<string>} editionFilters - Filter results by item edition.
 *  <br /><br />
 *  NOTE: This string must be an <b>exact match</b> on the edition name.
 * You can retrieve all available item edition names from the <a href="#.ListingEditionNames">ListingEditionNames method</a>.
 *  @param {Array<Object>} attributeFilters - Filter results by item attributes. Each entry should include name and value (e.g. `[{name: "attribute-name", value: "attribute-value"}]`)
 *  <br /><br />
 *  NOTE: These filters must be an <b>exact match</b> on the attribute name and value.
 * You can retrieve all available item attributes from the <a href="#.ListingAttributes">ListingAttributes method</a>.
 * @param {string=} sellerAddress - Filter by a specific seller
 * @param {string=} contractAddress - Filter results by the address of the NFT contract
 * @param {string=} tokenId - Filter by token ID (if filtering by contract address)
 * @param {string=} currency - Filter results by purchase currency. Available options: `usdc`
 * @param {Object=} marketplaceParams - Filter results by marketplace
 * @param {Array<integer>=} collectionIndexes - If filtering by marketplace, filter by collection(s). The index refers to the index in the array `marketplace.collections`
 * @param {integer=} lastNDays - Filter by results listed in the past N days
 *
 * @returns {Promise<Object>} - Results of the query and pagination info
 */

exports.Transfers = /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee23() {
  var _args23 = arguments;
  return _regeneratorRuntime.wrap(function _callee23$(_context23) {
    while (1) {
      switch (_context23.prev = _context23.next) {
        case 0:
          return _context23.abrupt("return", this.FilteredQuery(_objectSpread({
            mode: "transfers"
          }, _args23[0] || {})));

        case 1:
        case "end":
          return _context23.stop();
      }
    }
  }, _callee23, this);
}));
/**
 * Retrieve stats for listings matching the specified parameters.
 *
 * @methodGroup Listings
 * @namedParams
 * @param {integer=} start=0 - PAGINATION: Index from which the results should start
 * @param {integer=} limit=50 - PAGINATION: Maximum number of results to return
 * @param {string=} sortBy="created" -
 * @param {boolean=} sortDesc=false - Sort results descending instead of ascending
 * @param {string=} filter - Filter results by item name.
 *  <br /><br />
 *  NOTE: This string must be an <b>exact match</b> on the item name.
 * You can retrieve all available item names from the <a href="#.ListingNames">ListingNames method</a>.
 *  @param {Array<string>} editionFilters - Filter results by item edition.
 *  <br /><br />
 *  NOTE: This string must be an <b>exact match</b> on the edition name.
 * You can retrieve all available item edition names from the <a href="#.ListingEditionNames">ListingEditionNames method</a>.
 *  @param {Array<Object>} attributeFilters - Filter results by item attributes. Each entry should include name and value (e.g. `[{name: "attribute-name", value: "attribute-value"}]`)
 *  <br /><br />
 *  NOTE: These filters must be an <b>exact match</b> on the attribute name and value.
 * You can retrieve all available item attributes from the <a href="#.ListingAttributes">ListingAttributes method</a>.
 * @param {string=} sellerAddress - Filter by a specific seller
 * @param {string=} contractAddress - Filter results by the address of the NFT contract
 * @param {string=} tokenId - Filter by token ID (if filtering by contract address)
 * @param {string=} currency - Filter results by purchase currency. Available options: `usdc`
 * @param {Object=} marketplaceParams - Filter results by marketplace
 * @param {Array<integer>=} collectionIndexes - If filtering by marketplace, filter by collection(s). The index refers to the index in the array `marketplace.collections`
 * @param {integer=} lastNDays - Filter by results listed in the past N days
 *
 * @returns {Promise<Object>} - Statistics about sales. All prices in USD.
 */

exports.SalesStats = /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee24() {
  var _args24 = arguments;
  return _regeneratorRuntime.wrap(function _callee24$(_context24) {
    while (1) {
      switch (_context24.prev = _context24.next) {
        case 0:
          return _context24.abrupt("return", this.FilteredQuery(_objectSpread({
            mode: "sales-stats"
          }, _args24[0] || {})));

        case 1:
        case "end":
          return _context24.stop();
      }
    }
  }, _callee24, this);
}));
/**
 * Get the leaderboard rankings for the specified marketplace. If user address is specified, will return the ranking for the specified user (if present)
 *
 * @methodGroup Leaderboard
 * @namedParams
 * @param {Object=} marketplaceParams - Filter results by marketplace
 * @param {string=} userAddress - Retrieve the ranking for a specific user
 * @param {integer=} start=0 - PAGINATION: Index from which the results should start
 * @param {integer=} limit=50 - PAGINATION: Maximum number of results to return
 *
 * @returns {Promise<Array|Object>} - Returns a list of leaderboard rankings or, if userAddress is specified, ranking for that user.
 */

exports.Leaderboard = /*#__PURE__*/function () {
  var _ref48 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee25(_ref47) {
    var userAddress,
        marketplaceParams,
        params,
        _args25 = arguments;
    return _regeneratorRuntime.wrap(function _callee25$(_context25) {
      while (1) {
        switch (_context25.prev = _context25.next) {
          case 0:
            userAddress = _ref47.userAddress, marketplaceParams = _ref47.marketplaceParams;

            if (!userAddress) {
              _context25.next = 20;
              break;
            }

            params = {
              addr: Utils.FormatAddress(userAddress)
            };

            if (!marketplaceParams) {
              _context25.next = 10;
              break;
            }

            _context25.t0 = "tenant:eq:";
            _context25.next = 7;
            return this.MarketplaceInfo({
              marketplaceParams: marketplaceParams
            });

          case 7:
            _context25.t1 = _context25.sent.tenantId;
            _context25.t2 = _context25.t0.concat.call(_context25.t0, _context25.t1);
            params.filter = [_context25.t2];

          case 10:
            _context25.t4 = Utils;
            _context25.next = 13;
            return this.client.authClient.MakeAuthServiceRequest({
              path: UrlJoin("as", "wlt", "ranks"),
              method: "GET",
              queryParams: params
            });

          case 13:
            _context25.t5 = _context25.sent;
            _context25.next = 16;
            return _context25.t4.ResponseToJson.call(_context25.t4, _context25.t5);

          case 16:
            _context25.t3 = _context25.sent;

            if (_context25.t3) {
              _context25.next = 19;
              break;
            }

            _context25.t3 = [];

          case 19:
            return _context25.abrupt("return", _context25.t3[0]);

          case 20:
            return _context25.abrupt("return", this.FilteredQuery(_objectSpread({
              mode: "leaderboard"
            }, _args25[0] || {})));

          case 21:
          case "end":
            return _context25.stop();
        }
      }
    }, _callee25, this);
  }));

  return function (_x12) {
    return _ref48.apply(this, arguments);
  };
}();
/**
 * <b><i>Requires login</i></b>
 *
 * Create or update a listing for the specified item
 *
 * @methodGroup Listings
 * @namedParams
 * @param {string} contractAddress - The NFT contract address of the item
 * @param {string} tokenId - The token ID of the item
 * @param {number} price - The price of the listing, in USD
 * @param {string=} listingId - (When editing a listing) The ID of the existing listing
 *
 * @returns {Promise<string>} - The listing ID of the created listing
 */


exports.CreateListing = /*#__PURE__*/function () {
  var _ref50 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee26(_ref49) {
    var contractAddress, tokenId, price, listingId;
    return _regeneratorRuntime.wrap(function _callee26$(_context26) {
      while (1) {
        switch (_context26.prev = _context26.next) {
          case 0:
            contractAddress = _ref49.contractAddress, tokenId = _ref49.tokenId, price = _ref49.price, listingId = _ref49.listingId;
            contractAddress = Utils.FormatAddress(contractAddress);

            if (!listingId) {
              _context26.next = 12;
              break;
            }

            _context26.t0 = Utils;
            _context26.next = 6;
            return this.client.authClient.MakeAuthServiceRequest({
              path: UrlJoin("as", "wlt", "mkt"),
              method: "PUT",
              body: {
                id: listingId,
                price: parseFloat(price)
              },
              headers: {
                Authorization: "Bearer ".concat(this.AuthToken())
              }
            });

          case 6:
            _context26.t1 = _context26.sent;
            _context26.next = 9;
            return _context26.t0.ResponseToFormat.call(_context26.t0, "text", _context26.t1);

          case 9:
            return _context26.abrupt("return", _context26.sent);

          case 12:
            _context26.t2 = Utils;
            _context26.next = 15;
            return this.client.authClient.MakeAuthServiceRequest({
              path: UrlJoin("as", "wlt", "mkt"),
              method: "POST",
              body: {
                contract: contractAddress,
                token: tokenId,
                price: parseFloat(price)
              },
              headers: {
                Authorization: "Bearer ".concat(this.AuthToken())
              }
            });

          case 15:
            _context26.t3 = _context26.sent;
            _context26.next = 18;
            return _context26.t2.ResponseToJson.call(_context26.t2, _context26.t3);

          case 18:
            return _context26.abrupt("return", _context26.sent);

          case 19:
          case "end":
            return _context26.stop();
        }
      }
    }, _callee26, this);
  }));

  return function (_x13) {
    return _ref50.apply(this, arguments);
  };
}();
/**
 * <b><i>Requires login</i></b>
 *
 * Remove the specified listing
 *
 * @methodGroup Listings
 * @namedParams
 * @param {string} listingId - The ID of the listing to remove
 */


exports.RemoveListing = /*#__PURE__*/function () {
  var _ref52 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee27(_ref51) {
    var listingId;
    return _regeneratorRuntime.wrap(function _callee27$(_context27) {
      while (1) {
        switch (_context27.prev = _context27.next) {
          case 0:
            listingId = _ref51.listingId;
            _context27.next = 3;
            return this.client.authClient.MakeAuthServiceRequest({
              path: UrlJoin("as", "wlt", "mkt", listingId),
              method: "DELETE",
              headers: {
                Authorization: "Bearer ".concat(this.AuthToken())
              }
            });

          case 3:
          case "end":
            return _context27.stop();
        }
      }
    }, _callee27, this);
  }));

  return function (_x14) {
    return _ref52.apply(this, arguments);
  };
}();
/**
 * Retrieve all valid names for filtering listing sales names. Full item names are required for filtering sales results by name.
 *
 * Specify marketplace information to filter the results to only items offered in that marketplace.
 *
 * @methodGroup Listings
 * @namedParams
 * @param {Object} marketplaceParams - Parameters of a marketplace to filter results by
 *
 * @returns {Promise<Array<String>>} - A list of item names
 */


exports.SalesNames = /*#__PURE__*/function () {
  var _ref54 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee28(_ref53) {
    var marketplaceParams, tenantId;
    return _regeneratorRuntime.wrap(function _callee28$(_context28) {
      while (1) {
        switch (_context28.prev = _context28.next) {
          case 0:
            marketplaceParams = _ref53.marketplaceParams;

            if (!marketplaceParams) {
              _context28.next = 5;
              break;
            }

            _context28.next = 4;
            return this.MarketplaceInfo({
              marketplaceParams: marketplaceParams
            });

          case 4:
            tenantId = _context28.sent.tenantId;

          case 5:
            _context28.t0 = Utils;
            _context28.next = 8;
            return this.client.authClient.MakeAuthServiceRequest({
              path: UrlJoin("as", "mkt", "names", "hst"),
              method: "GET",
              queryParams: tenantId ? {
                filter: "tenant:eq:".concat(tenantId)
              } : {}
            });

          case 8:
            _context28.t1 = _context28.sent;
            _context28.next = 11;
            return _context28.t0.ResponseToJson.call(_context28.t0, _context28.t1);

          case 11:
            return _context28.abrupt("return", _context28.sent);

          case 12:
          case "end":
            return _context28.stop();
        }
      }
    }, _callee28, this);
  }));

  return function (_x15) {
    return _ref54.apply(this, arguments);
  };
}();
/**
 * Retrieve all valid names for filtering listings. Full item names are required for filtering listing results by name.
 *
 * Specify marketplace information to filter the results to only items offered in that marketplace.
 *
 * @methodGroup Listings
 * @namedParams
 * @param {Object} marketplaceParams - Parameters of a marketplace to filter results by
 *
 * @returns {Promise<Array<String>>} - A list of item names
 */


exports.ListingNames = /*#__PURE__*/function () {
  var _ref56 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee29(_ref55) {
    var marketplaceParams, tenantId;
    return _regeneratorRuntime.wrap(function _callee29$(_context29) {
      while (1) {
        switch (_context29.prev = _context29.next) {
          case 0:
            marketplaceParams = _ref55.marketplaceParams;

            if (!marketplaceParams) {
              _context29.next = 5;
              break;
            }

            _context29.next = 4;
            return this.MarketplaceInfo({
              marketplaceParams: marketplaceParams
            });

          case 4:
            tenantId = _context29.sent.tenantId;

          case 5:
            _context29.t0 = Utils;
            _context29.next = 8;
            return this.client.authClient.MakeAuthServiceRequest({
              path: UrlJoin("as", "mkt", "names"),
              method: "GET",
              queryParams: tenantId ? {
                filter: "tenant:eq:".concat(tenantId)
              } : {}
            });

          case 8:
            _context29.t1 = _context29.sent;
            _context29.next = 11;
            return _context29.t0.ResponseToJson.call(_context29.t0, _context29.t1);

          case 11:
            return _context29.abrupt("return", _context29.sent);

          case 12:
          case "end":
            return _context29.stop();
        }
      }
    }, _callee29, this);
  }));

  return function (_x16) {
    return _ref56.apply(this, arguments);
  };
}();
/**
 * Retrieve all valid edition names of the specified item. Full item edition names are required for filtering listing results by edition.
 *
 * @methodGroup Listings
 * @namedParams
 * @param {string} displayName - Display name of the item from which to request edition names
 *
 * @returns {Promise<Array<String>>} - A list of item editions
 */


exports.ListingEditionNames = /*#__PURE__*/function () {
  var _ref58 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee30(_ref57) {
    var displayName;
    return _regeneratorRuntime.wrap(function _callee30$(_context30) {
      while (1) {
        switch (_context30.prev = _context30.next) {
          case 0:
            displayName = _ref57.displayName;
            _context30.t0 = Utils;
            _context30.next = 4;
            return this.client.authClient.MakeAuthServiceRequest({
              path: UrlJoin("as", "mkt", "editions"),
              queryParams: {
                filter: "nft/display_name:eq:".concat(displayName)
              },
              method: "GET"
            });

          case 4:
            _context30.t1 = _context30.sent;
            _context30.next = 7;
            return _context30.t0.ResponseToJson.call(_context30.t0, _context30.t1);

          case 7:
            return _context30.abrupt("return", _context30.sent);

          case 8:
          case "end":
            return _context30.stop();
        }
      }
    }, _callee30, this);
  }));

  return function (_x17) {
    return _ref58.apply(this, arguments);
  };
}();
/**
 * Retrieve names of all valid attributes for listed items. Full attribute names and values are required for filtering listing results by attributes.
 *
 * Specify marketplace information to filter the results to only items offered in that marketplace.
 *
 * @methodGroup Listings
 * @namedParams
 * @param {Object=} marketplaceParams - Parameters of a marketplace to filter results by
 * @param {string=} displayName - Display name of the item from which to request attributes
 *
 * @returns {Promise<Array<String>>} - A list of valid attributes
 */


exports.ListingAttributes = /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee31() {
  var _ref60,
      marketplaceParams,
      displayName,
      filters,
      attributes,
      _args31 = arguments;

  return _regeneratorRuntime.wrap(function _callee31$(_context31) {
    while (1) {
      switch (_context31.prev = _context31.next) {
        case 0:
          _ref60 = _args31.length > 0 && _args31[0] !== undefined ? _args31[0] : {}, marketplaceParams = _ref60.marketplaceParams, displayName = _ref60.displayName;
          filters = [];

          if (!marketplaceParams) {
            _context31.next = 10;
            break;
          }

          _context31.t0 = filters;
          _context31.t1 = "tenant:eq:";
          _context31.next = 7;
          return this.MarketplaceInfo({
            marketplaceParams: marketplaceParams
          });

        case 7:
          _context31.t2 = _context31.sent.tenantId;
          _context31.t3 = _context31.t1.concat.call(_context31.t1, _context31.t2);

          _context31.t0.push.call(_context31.t0, _context31.t3);

        case 10:
          if (displayName) {
            filters.push("nft/display_name:eq:".concat(displayName));
          }

          _context31.t4 = Utils;
          _context31.next = 14;
          return this.client.authClient.MakeAuthServiceRequest({
            path: UrlJoin("as", "mkt", "attributes"),
            method: "GET",
            queryParams: {
              filter: filters
            }
          });

        case 14:
          _context31.t5 = _context31.sent;
          _context31.next = 17;
          return _context31.t4.ResponseToJson.call(_context31.t4, _context31.t5);

        case 17:
          attributes = _context31.sent;
          return _context31.abrupt("return", attributes.map(function (_ref61) {
            var trait_type = _ref61.trait_type,
                values = _ref61.values;
            return {
              name: trait_type,
              values: values
            };
          }).filter(function (_ref62) {
            var name = _ref62.name;
            return !["Content Fabric Hash", "Total Minted Supply", "Creator"].includes(name);
          }));

        case 19:
        case "end":
          return _context31.stop();
      }
    }
  }, _callee31, this);
}));
/* PURCHASE / CLAIM */

/**
 * Claim the specified item from the specified marketplace
 *
 * Use the <a href="#.ClaimStatus">ClaimStatus</a> method to check minting status after claiming
 *
 * @methodGroup Purchase
 * @namedParams
 * @param {Object} marketplaceParams - Parameters of the marketplace
 * @param {string} sku - The SKU of the item to claim
 * @param {string=} email - Email address of the user. If specified, this will bind the user to the tenant of the specified marketplace
 */

exports.ClaimItem = /*#__PURE__*/function () {
  var _ref64 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee32(_ref63) {
    var marketplaceParams, sku, email, marketplaceInfo;
    return _regeneratorRuntime.wrap(function _callee32$(_context32) {
      while (1) {
        switch (_context32.prev = _context32.next) {
          case 0:
            marketplaceParams = _ref63.marketplaceParams, sku = _ref63.sku, email = _ref63.email;
            _context32.next = 3;
            return this.MarketplaceInfo({
              marketplaceParams: marketplaceParams
            });

          case 3:
            marketplaceInfo = _context32.sent;
            _context32.next = 6;
            return this.client.authClient.MakeAuthServiceRequest({
              method: "POST",
              path: UrlJoin("as", "wlt", "act", marketplaceInfo.tenant_id),
              body: {
                op: "nft-claim",
                sid: marketplaceInfo.marketplaceId,
                sku: sku,
                email: email
              },
              headers: {
                Authorization: "Bearer ".concat(this.AuthToken())
              }
            });

          case 6:
          case "end":
            return _context32.stop();
        }
      }
    }, _callee32, this);
  }));

  return function (_x18) {
    return _ref64.apply(this, arguments);
  };
}();
/* MINTING STATUS */

/**
 * Return status of the specified listing purchase
 *
 * @methodGroup Status
 * @namedParams
 * @param {string} listingId - The ID of the listing
 * @param {string} confirmationId - The confirmation ID of the purchase
 *
 * @returns {Promise<Object>} - The status of the purchase
 */


exports.ListingPurchaseStatus = /*#__PURE__*/function () {
  var _ref66 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee33(_ref65) {
    var listingId, confirmationId, listingStatus, statuses;
    return _regeneratorRuntime.wrap(function _callee33$(_context33) {
      while (1) {
        switch (_context33.prev = _context33.next) {
          case 0:
            listingId = _ref65.listingId, confirmationId = _ref65.confirmationId;
            _context33.prev = 1;
            _context33.next = 4;
            return this.ListingStatus({
              listingId: listingId
            });

          case 4:
            listingStatus = _context33.sent;

            if (listingStatus) {
              _context33.next = 7;
              break;
            }

            throw Error("Unable to find info for listing " + listingId);

          case 7:
            _context33.next = 9;
            return this.MintingStatus({
              tenantId: listingStatus.tenant
            });

          case 9:
            statuses = _context33.sent;
            return _context33.abrupt("return", statuses.find(function (status) {
              return status.op === "nft-transfer" && status.extra && status.extra[0] === confirmationId;
            }) || {
              status: "none"
            });

          case 13:
            _context33.prev = 13;
            _context33.t0 = _context33["catch"](1);
            this.Log(_context33.t0, true);
            return _context33.abrupt("return", {
              status: "unknown"
            });

          case 17:
          case "end":
            return _context33.stop();
        }
      }
    }, _callee33, this, [[1, 13]]);
  }));

  return function (_x19) {
    return _ref66.apply(this, arguments);
  };
}();
/**
 * Return status of the specified marketplace purchase
 *
 * @methodGroup Status
 * @namedParams
 * @param {Object} marketplaceParams - Parameters of the marketplace
 * @param {string} confirmationId - The confirmation ID of the purchase
 *
 * @returns {Promise<Object>} - The minting status of the purchaseed item(s)
 */


exports.PurchaseStatus = /*#__PURE__*/function () {
  var _ref68 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee34(_ref67) {
    var marketplaceParams, confirmationId, marketplaceInfo, statuses;
    return _regeneratorRuntime.wrap(function _callee34$(_context34) {
      while (1) {
        switch (_context34.prev = _context34.next) {
          case 0:
            marketplaceParams = _ref67.marketplaceParams, confirmationId = _ref67.confirmationId;
            _context34.prev = 1;
            _context34.next = 4;
            return this.MarketplaceInfo({
              marketplaceParams: marketplaceParams
            });

          case 4:
            marketplaceInfo = _context34.sent;
            _context34.next = 7;
            return this.MintingStatus({
              tenantId: marketplaceInfo.tenant_id
            });

          case 7:
            statuses = _context34.sent;
            return _context34.abrupt("return", statuses.find(function (status) {
              return status.op === "nft-buy" && status.confirmationId === confirmationId;
            }) || {
              status: "none"
            });

          case 11:
            _context34.prev = 11;
            _context34.t0 = _context34["catch"](1);
            this.Log(_context34.t0, true);
            return _context34.abrupt("return", {
              status: "unknown"
            });

          case 15:
          case "end":
            return _context34.stop();
        }
      }
    }, _callee34, this, [[1, 11]]);
  }));

  return function (_x20) {
    return _ref68.apply(this, arguments);
  };
}();
/**
 * Return status of the specified item claim
 *
 * @methodGroup Status
 * @namedParams
 * @param {Object} marketplaceParams - Parameters of the marketplace
 * @param {string} sku - The SKU of the item claimed
 *
 * @returns {Promise<Object>} - The minting status of the claim
 */


exports.ClaimStatus = /*#__PURE__*/function () {
  var _ref70 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee35(_ref69) {
    var marketplaceParams, sku, marketplaceInfo, statuses;
    return _regeneratorRuntime.wrap(function _callee35$(_context35) {
      while (1) {
        switch (_context35.prev = _context35.next) {
          case 0:
            marketplaceParams = _ref69.marketplaceParams, sku = _ref69.sku;
            _context35.prev = 1;
            _context35.next = 4;
            return this.MarketplaceInfo({
              marketplaceParams: marketplaceParams
            });

          case 4:
            marketplaceInfo = _context35.sent;
            _context35.next = 7;
            return this.MintingStatus({
              tenantId: marketplaceInfo.tenantId
            });

          case 7:
            statuses = _context35.sent;
            return _context35.abrupt("return", statuses.find(function (status) {
              return status.op === "nft-claim" && status.marketplaceId === marketplaceInfo.marketplaceId && status.confirmationId === sku;
            }) || {
              status: "none"
            });

          case 11:
            _context35.prev = 11;
            _context35.t0 = _context35["catch"](1);
            this.Log(_context35.t0, true);
            return _context35.abrupt("return", {
              status: "unknown"
            });

          case 15:
          case "end":
            return _context35.stop();
        }
      }
    }, _callee35, this, [[1, 11]]);
  }));

  return function (_x21) {
    return _ref70.apply(this, arguments);
  };
}();
/**
 * Return status of the specified pack opening
 *
 * @methodGroup Status
 * @namedParams
 * @param {string} contractAddress - The NFT contract address of the opened pack
 * @param {string} tokenId - The token ID of the opened pack
 *
 * @returns {Promise<Object>} - The status of the pack opening
 */


exports.PackOpenStatus = /*#__PURE__*/function () {
  var _ref72 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee36(_ref71) {
    var contractAddress, tokenId, tenantConfig, statuses;
    return _regeneratorRuntime.wrap(function _callee36$(_context36) {
      while (1) {
        switch (_context36.prev = _context36.next) {
          case 0:
            contractAddress = _ref71.contractAddress, tokenId = _ref71.tokenId;
            _context36.prev = 1;
            _context36.next = 4;
            return this.TenantConfiguration({
              contractAddress: contractAddress
            });

          case 4:
            tenantConfig = _context36.sent;
            _context36.next = 7;
            return this.MintingStatus({
              tenantId: tenantConfig.tenant
            });

          case 7:
            statuses = _context36.sent;
            return _context36.abrupt("return", statuses.find(function (status) {
              return status.op === "nft-open" && Utils.EqualAddress(contractAddress, status.address) && status.tokenId === tokenId;
            }) || {
              status: "none"
            });

          case 11:
            _context36.prev = 11;
            _context36.t0 = _context36["catch"](1);
            this.Log(_context36.t0, true);
            return _context36.abrupt("return", {
              status: "unknown"
            });

          case 15:
          case "end":
            return _context36.stop();
        }
      }
    }, _callee36, this, [[1, 11]]);
  }));

  return function (_x22) {
    return _ref72.apply(this, arguments);
  };
}();
/**
 * Return status of the specified collection redemption
 *
 * @methodGroup Status
 * @namedParams
 * @param {Object} marketplaceParams - Parameters of the marketplace
 * @param {string} confirmationId - The confirmation ID of the redemption
 *
 * @returns {Promise<Object>} - The status of the collection redemption
 */


exports.CollectionRedemptionStatus = /*#__PURE__*/function () {
  var _ref74 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee37(_ref73) {
    var marketplaceParams, confirmationId, statuses;
    return _regeneratorRuntime.wrap(function _callee37$(_context37) {
      while (1) {
        switch (_context37.prev = _context37.next) {
          case 0:
            marketplaceParams = _ref73.marketplaceParams, confirmationId = _ref73.confirmationId;
            _context37.prev = 1;
            _context37.next = 4;
            return this.MintingStatus({
              marketplaceParams: marketplaceParams
            });

          case 4:
            statuses = _context37.sent;
            return _context37.abrupt("return", statuses.find(function (status) {
              return status.op === "nft-redeem" && status.confirmationId === confirmationId;
            }) || {
              status: "none"
            });

          case 8:
            _context37.prev = 8;
            _context37.t0 = _context37["catch"](1);
            this.Log(_context37.t0, true);
            return _context37.abrupt("return", {
              status: "unknown"
            });

          case 12:
          case "end":
            return _context37.stop();
        }
      }
    }, _callee37, this, [[1, 8]]);
  }));

  return function (_x23) {
    return _ref74.apply(this, arguments);
  };
}();
/* EVENTS */


exports.LoadDrop = /*#__PURE__*/function () {
  var _ref76 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee38(_ref75) {
    var _this = this;

    var tenantSlug, eventSlug, dropId, mainSiteHash, event, eventId;
    return _regeneratorRuntime.wrap(function _callee38$(_context38) {
      while (1) {
        switch (_context38.prev = _context38.next) {
          case 0:
            tenantSlug = _ref75.tenantSlug, eventSlug = _ref75.eventSlug, dropId = _ref75.dropId;

            if (!this.drops) {
              this.drops = {};
            }

            if (!this.drops[tenantSlug]) {
              this.drops[tenantSlug] = {};
            }

            if (!this.drops[tenantSlug][eventSlug]) {
              this.drops[tenantSlug][eventSlug] = {};
            }

            if (this.drops[tenantSlug][eventSlug][dropId]) {
              _context38.next = 16;
              break;
            }

            _context38.next = 7;
            return this.client.LatestVersionHash({
              objectId: this.mainSiteId
            });

          case 7:
            mainSiteHash = _context38.sent;
            _context38.next = 10;
            return this.client.ContentObjectMetadata({
              versionHash: mainSiteHash,
              metadataSubtree: UrlJoin("public", "asset_metadata", "tenants", tenantSlug, "sites", eventSlug, "info"),
              resolveLinks: true,
              linkDepthLimit: 2,
              resolveIncludeSource: true,
              produceLinkUrls: true,
              select: [".", "drops"],
              noAuth: true
            });

          case 10:
            _context38.t0 = _context38.sent;

            if (_context38.t0) {
              _context38.next = 13;
              break;
            }

            _context38.t0 = [];

          case 13:
            event = _context38.t0;
            eventId = Utils.DecodeVersionHash(event["."].source).objectId;
            event.drops.forEach(function (drop) {
              drop = _objectSpread(_objectSpread({}, drop), {}, {
                eventId: eventId
              });
              _this.drops[tenantSlug][eventSlug][drop.uuid] = drop;
              _this.drops[drop.uuid] = drop;
            });

          case 16:
            return _context38.abrupt("return", this.drops[dropId]);

          case 17:
          case "end":
            return _context38.stop();
        }
      }
    }, _callee38, this);
  }));

  return function (_x24) {
    return _ref76.apply(this, arguments);
  };
}();

exports.SubmitDropVote = /*#__PURE__*/function () {
  var _ref78 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee39(_ref77) {
    var marketplaceParams, eventId, dropId, sku, marketplaceInfo;
    return _regeneratorRuntime.wrap(function _callee39$(_context39) {
      while (1) {
        switch (_context39.prev = _context39.next) {
          case 0:
            marketplaceParams = _ref77.marketplaceParams, eventId = _ref77.eventId, dropId = _ref77.dropId, sku = _ref77.sku;
            _context39.next = 3;
            return this.MarketplaceInfo({
              marketplaceParams: marketplaceParams
            });

          case 3:
            marketplaceInfo = _context39.sent;
            _context39.next = 6;
            return this.client.authClient.MakeAuthServiceRequest({
              path: UrlJoin("as", "wlt", "act", marketplaceInfo.tenant_id),
              method: "POST",
              body: {
                op: "vote-drop",
                evt: eventId,
                id: dropId,
                itm: sku
              },
              headers: {
                Authorization: "Bearer ".concat(this.AuthToken())
              }
            });

          case 6:
          case "end":
            return _context39.stop();
        }
      }
    }, _callee39, this);
  }));

  return function (_x25) {
    return _ref78.apply(this, arguments);
  };
}();

exports.DropStatus = /*#__PURE__*/function () {
  var _ref80 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee40(_ref79) {
    var marketplace, eventId, dropId, response;
    return _regeneratorRuntime.wrap(function _callee40$(_context40) {
      while (1) {
        switch (_context40.prev = _context40.next) {
          case 0:
            marketplace = _ref79.marketplace, eventId = _ref79.eventId, dropId = _ref79.dropId;
            _context40.prev = 1;
            _context40.next = 4;
            return Utils.ResponseToJson(this.client.authClient.MakeAuthServiceRequest({
              path: UrlJoin("as", "wlt", "act", marketplace.tenant_id, eventId, dropId),
              method: "GET",
              headers: {
                Authorization: "Bearer ".concat(this.AuthToken())
              }
            }));

          case 4:
            response = _context40.sent;
            return _context40.abrupt("return", response.sort(function (a, b) {
              return a.ts > b.ts ? 1 : -1;
            })[0] || {
              status: "none"
            });

          case 8:
            _context40.prev = 8;
            _context40.t0 = _context40["catch"](1);
            this.Log(_context40.t0, true);
            return _context40.abrupt("return", "");

          case 12:
          case "end":
            return _context40.stop();
        }
      }
    }, _callee40, this, [[1, 8]]);
  }));

  return function (_x26) {
    return _ref80.apply(this, arguments);
  };
}();