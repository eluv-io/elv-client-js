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
 * @returns {Promise<{Object}>} - Returns balances for the user. All values are in USD.
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
 * Returns basic contract info about the items the specified/current user owns, organized by contract address + token ID
 *
 * This method is significantly faster than <a href="#.UserItems">UserItems</a>, but does not include any NFT metadata.
 *
 * @methodGroup User
 * @namedParams
 * @param {string=} userAddress - Address of the user to query for. If unspecified, will use the currently logged in user.
 *
 * @returns {Promise<Object>} - Basic info about all owned items.
 */

exports.UserItemInfo = /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee2() {
  var _this = this;

  var _ref3,
      userAddress,
      accountId,
      nftInfo,
      _args2 = arguments;

  return _regeneratorRuntime.wrap(function _callee2$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          _ref3 = _args2.length > 0 && _args2[0] !== undefined ? _args2[0] : {}, userAddress = _ref3.userAddress;
          accountId = "iusr".concat(Utils.AddressToHash(userAddress || this.UserAddress()));
          _context2.next = 4;
          return this.client.ethClient.MakeProviderCall({
            methodName: "send",
            args: ["elv_getAccountProfile", [this.client.contentSpaceId, accountId]]
          });

        case 4:
          this.profileData = _context2.sent;

          if (!(!this.profileData || !this.profileData.NFTs)) {
            _context2.next = 7;
            break;
          }

          return _context2.abrupt("return", {});

        case 7:
          nftInfo = {};
          Object.keys(this.profileData.NFTs).map(function (tenantId) {
            return _this.profileData.NFTs[tenantId].forEach(function (details) {
              var versionHash = (details.TokenUri || "").split("/").find(function (s) {
                return (s || "").startsWith("hq__");
              });

              if (!versionHash) {
                return;
              }

              if (details.TokenHold) {
                details.TokenHoldDate = new Date(parseInt(details.TokenHold) * 1000);
              }

              var contractAddress = Utils.FormatAddress(details.ContractAddr);
              var key = "".concat(contractAddress, "-").concat(details.TokenIdStr);
              nftInfo[key] = _objectSpread(_objectSpread({}, details), {}, {
                ContractAddr: Utils.FormatAddress(details.ContractAddr),
                ContractId: "ictr".concat(Utils.AddressToHash(details.ContractAddr)),
                VersionHash: versionHash
              });
            });
          });
          this.nftInfo = nftInfo;
          return _context2.abrupt("return", this.nftInfo);

        case 11:
        case "end":
          return _context2.stop();
      }
    }
  }, _callee2, this);
}));
/**
 * <b><i>Requires login</i></b>
 *
 * Retrieve items owned by the current user matching the specified parameters.
 *
 * @methodGroup User
 * @namedParams
 * @param {integer=} start=0 - PAGINATION: Index from which the results should start
 * @param {integer=} limit=50 - PAGINATION: Maximum number of results to return
 * @param {string=} sortBy="created" - Sort order. Options: `default`, `meta/display_name`
 * @param {boolean=} sortDesc=false - Sort results descending instead of ascending
 * @param {string=} filter - Filter results by item name.
 * @param {string=} contractAddress - Filter results by the address of the NFT contract
 * @param {string=} tokenId - Filter by token ID (if filtering by contract address)
 * @param {Object=} marketplaceParams - Filter results by marketplace
 * @param {Array<integer>=} collectionIndexes - If filtering by marketplace, filter by collection(s). The index refers to the index in the array `marketplace.collections`
 *
 * @returns {Promise<Object>} - Results of the query and pagination info
 */

exports.UserItems = /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee3() {
  var _args3 = arguments;
  return _regeneratorRuntime.wrap(function _callee3$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          return _context3.abrupt("return", this.FilteredQuery(_objectSpread({
            mode: "owned"
          }, _args3[0] || {})));

        case 1:
        case "end":
          return _context3.stop();
      }
    }
  }, _callee3, this);
}));
/**
 * Return all listings for the current user. Not paginated.
 *
 * @methodGroup User
 * @namedParams
 * @param {string=} sortBy="created" - Sort order. Options: `created`, `info/token_id`, `info/ordinal`, `price`, `nft/display_name`
 * @param {boolean=} sortDesc=false - Sort results descending instead of ascending
 * @param {Object=} marketplaceParams - Filter results by marketplace
 * @param {string=} contractAddress - Filter results by the address of the NFT contract
 * @param {string=} tokenId - Filter by token ID (if filtering by contract address)
 *
 * @returns {Promise<Array<Object>>} - List of current user's listings
 */

exports.UserListings = /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee4() {
  var _ref6,
      _ref6$sortBy,
      sortBy,
      _ref6$sortDesc,
      sortDesc,
      contractAddress,
      tokenId,
      marketplaceParams,
      _args4 = arguments;

  return _regeneratorRuntime.wrap(function _callee4$(_context4) {
    while (1) {
      switch (_context4.prev = _context4.next) {
        case 0:
          _ref6 = _args4.length > 0 && _args4[0] !== undefined ? _args4[0] : {}, _ref6$sortBy = _ref6.sortBy, sortBy = _ref6$sortBy === void 0 ? "created" : _ref6$sortBy, _ref6$sortDesc = _ref6.sortDesc, sortDesc = _ref6$sortDesc === void 0 ? false : _ref6$sortDesc, contractAddress = _ref6.contractAddress, tokenId = _ref6.tokenId, marketplaceParams = _ref6.marketplaceParams;
          _context4.next = 3;
          return this.FilteredQuery({
            mode: "listings",
            start: 0,
            limit: 10000,
            sortBy: sortBy,
            sortDesc: sortDesc,
            sellerAddress: this.UserAddress(),
            marketplaceParams: marketplaceParams,
            contractAddress: contractAddress,
            tokenId: tokenId
          });

        case 3:
          return _context4.abrupt("return", _context4.sent.results);

        case 4:
        case "end":
          return _context4.stop();
      }
    }
  }, _callee4, this);
}));
/**
 * Return all sales for the current user. Not paginated.
 *
 * @methodGroup User
 * @namedParams
 * @param {string=} sortBy="created" - Sort order. Options: `created`, `price`, `name`
 * @param {boolean=} sortDesc=false - Sort results descending instead of ascending
 * @param {Object=} marketplaceParams - Filter results by marketplace
 * @param {string=} contractAddress - Filter results by the address of the NFT contract
 * @param {string=} tokenId - Filter by token ID (if filtering by contract address)
 * @param {integer=} lastNDays - Filter by results listed in the past N days
 *
 * @returns {Promise<Array<Object>>} - List of current user's sales
 */

exports.UserSales = /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee5() {
  var _ref8,
      _ref8$sortBy,
      sortBy,
      _ref8$sortDesc,
      sortDesc,
      contractAddress,
      tokenId,
      marketplaceParams,
      _args5 = arguments;

  return _regeneratorRuntime.wrap(function _callee5$(_context5) {
    while (1) {
      switch (_context5.prev = _context5.next) {
        case 0:
          _ref8 = _args5.length > 0 && _args5[0] !== undefined ? _args5[0] : {}, _ref8$sortBy = _ref8.sortBy, sortBy = _ref8$sortBy === void 0 ? "created" : _ref8$sortBy, _ref8$sortDesc = _ref8.sortDesc, sortDesc = _ref8$sortDesc === void 0 ? false : _ref8$sortDesc, contractAddress = _ref8.contractAddress, tokenId = _ref8.tokenId, marketplaceParams = _ref8.marketplaceParams;
          _context5.next = 3;
          return this.FilteredQuery({
            mode: "sales",
            start: 0,
            limit: 10000,
            sortBy: sortBy,
            sortDesc: sortDesc,
            sellerAddress: this.UserAddress(),
            marketplaceParams: marketplaceParams,
            contractAddress: contractAddress,
            tokenId: tokenId
          });

        case 3:
          return _context5.abrupt("return", _context5.sent.results);

        case 4:
        case "end":
          return _context5.stop();
      }
    }
  }, _callee5, this);
}));
/**
 * Return all transfers and sales for the current user. Not paginated.
 *
 * @methodGroup User
 * @namedParams
 * @param {string=} sortBy="created" - Sort order. Options: `created`, `price`, `name`
 * @param {boolean=} sortDesc=false - Sort results descending instead of ascending
 * @param {Object=} marketplaceParams - Filter results by marketplace
 * @param {string=} contractAddress - Filter results by the address of the NFT contract
 * @param {string=} tokenId - Filter by token ID (if filtering by contract address)
 * @param {integer=} lastNDays - Filter by results listed in the past N days
 *
 * @returns {Promise<Array<Object>>} - List of current user's sales
 */

exports.UserTransfers = /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee6() {
  var _ref10,
      _ref10$sortBy,
      sortBy,
      _ref10$sortDesc,
      sortDesc,
      contractAddress,
      tokenId,
      marketplaceParams,
      _args6 = arguments;

  return _regeneratorRuntime.wrap(function _callee6$(_context6) {
    while (1) {
      switch (_context6.prev = _context6.next) {
        case 0:
          _ref10 = _args6.length > 0 && _args6[0] !== undefined ? _args6[0] : {}, _ref10$sortBy = _ref10.sortBy, sortBy = _ref10$sortBy === void 0 ? "created" : _ref10$sortBy, _ref10$sortDesc = _ref10.sortDesc, sortDesc = _ref10$sortDesc === void 0 ? false : _ref10$sortDesc, contractAddress = _ref10.contractAddress, tokenId = _ref10.tokenId, marketplaceParams = _ref10.marketplaceParams;
          _context6.next = 3;
          return this.FilteredQuery({
            mode: "transfers",
            start: 0,
            limit: 10000,
            sortBy: sortBy,
            sortDesc: sortDesc,
            sellerAddress: this.UserAddress(),
            marketplaceParams: marketplaceParams,
            contractAddress: contractAddress,
            tokenId: tokenId
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
 * @returns {Promise<{Object}>} - The tenant configuration
 */

exports.TenantConfiguration = /*#__PURE__*/function () {
  var _ref12 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee7(_ref11) {
    var tenantId, contractAddress;
    return _regeneratorRuntime.wrap(function _callee7$(_context7) {
      while (1) {
        switch (_context7.prev = _context7.next) {
          case 0:
            tenantId = _ref11.tenantId, contractAddress = _ref11.contractAddress;
            _context7.prev = 1;
            _context7.next = 4;
            return Utils.ResponseToJson(this.client.authClient.MakeAuthServiceRequest({
              path: contractAddress ? UrlJoin("as", "config", "nft", contractAddress) : UrlJoin("as", "config", "tnt", tenantId),
              method: "GET"
            }));

          case 4:
            return _context7.abrupt("return", _context7.sent);

          case 7:
            _context7.prev = 7;
            _context7.t0 = _context7["catch"](1);
            this.Log("Failed to load tenant configuration", true);
            this.Log(_context7.t0, true);
            return _context7.abrupt("return", {});

          case 12:
          case "end":
            return _context7.stop();
        }
      }
    }, _callee7, this, [[1, 7]]);
  }));

  return function (_x) {
    return _ref12.apply(this, arguments);
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
  var _ref14 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee8(_ref13) {
    var marketplaceParams, tenantId, marketplaceInfo;
    return _regeneratorRuntime.wrap(function _callee8$(_context8) {
      while (1) {
        switch (_context8.prev = _context8.next) {
          case 0:
            marketplaceParams = _ref13.marketplaceParams, tenantId = _ref13.tenantId;

            if (!tenantId) {
              marketplaceInfo = this.MarketplaceInfo({
                marketplaceParams: marketplaceParams
              });
              tenantId = marketplaceInfo.tenantId;
            }

            if (!this.loggedIn) {
              _context8.next = 6;
              break;
            }

            _context8.next = 5;
            return Utils.ResponseToJson(this.client.authClient.MakeAuthServiceRequest({
              path: UrlJoin("as", "wlt", "nft", "info", tenantId),
              method: "GET",
              headers: {
                Authorization: "Bearer ".concat(this.AuthToken())
              }
            }));

          case 5:
            return _context8.abrupt("return", _context8.sent);

          case 6:
            _context8.next = 8;
            return Utils.ResponseToJson(this.client.authClient.MakeAuthServiceRequest({
              path: UrlJoin("as", "nft", "stock", tenantId),
              method: "GET"
            }));

          case 8:
            return _context8.abrupt("return", _context8.sent);

          case 9:
          case "end":
            return _context8.stop();
        }
      }
    }, _callee8, this);
  }));

  return function (_x2) {
    return _ref14.apply(this, arguments);
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


exports.MarketplaceInfo = function (_ref15) {
  var marketplaceParams = _ref15.marketplaceParams;

  var _ref16 = marketplaceParams || {},
      tenantSlug = _ref16.tenantSlug,
      marketplaceSlug = _ref16.marketplaceSlug,
      marketplaceId = _ref16.marketplaceId,
      marketplaceHash = _ref16.marketplaceHash;

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
  var _ref18 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee9(_ref17) {
    var marketplaceParams, marketplaceInfo, marketplaceHash;
    return _regeneratorRuntime.wrap(function _callee9$(_context9) {
      while (1) {
        switch (_context9.prev = _context9.next) {
          case 0:
            marketplaceParams = _ref17.marketplaceParams;
            marketplaceInfo = this.MarketplaceInfo({
              marketplaceParams: marketplaceParams
            });
            marketplaceHash = marketplaceInfo.marketplaceHash;

            if (this.cachedCSS[marketplaceHash]) {
              _context9.next = 7;
              break;
            }

            _context9.next = 6;
            return this.client.ContentObjectMetadata({
              versionHash: marketplaceHash,
              metadataSubtree: "public/asset_metadata/info/branding/custom_css",
              authorizationToken: this.publicStaticToken,
              noAuth: true
            });

          case 6:
            this.cachedCSS[marketplaceHash] = _context9.sent;

          case 7:
            return _context9.abrupt("return", this.cachedCSS[marketplaceHash] || "");

          case 8:
          case "end":
            return _context9.stop();
        }
      }
    }, _callee9, this);
  }));

  return function (_x3) {
    return _ref18.apply(this, arguments);
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
 * @returns {Promise<{Object}>} - Info about available marketplaces
 */


exports.AvailableMarketplaces = /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee10() {
  var _ref20,
      organizeById,
      _ref20$forceReload,
      forceReload,
      _args10 = arguments;

  return _regeneratorRuntime.wrap(function _callee10$(_context10) {
    while (1) {
      switch (_context10.prev = _context10.next) {
        case 0:
          _ref20 = _args10.length > 0 && _args10[0] !== undefined ? _args10[0] : {}, organizeById = _ref20.organizeById, _ref20$forceReload = _ref20.forceReload, forceReload = _ref20$forceReload === void 0 ? false : _ref20$forceReload;

          if (!forceReload) {
            _context10.next = 4;
            break;
          }

          _context10.next = 4;
          return this.LoadAvailableMarketplaces(true);

        case 4:
          return _context10.abrupt("return", _objectSpread({}, organizeById ? this.availableMarketplacesById : this.availableMarketplaces));

        case 5:
        case "end":
          return _context10.stop();
      }
    }
  }, _callee10, this);
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
  var _ref22 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee11(_ref21) {
    var marketplaceParams;
    return _regeneratorRuntime.wrap(function _callee11$(_context11) {
      while (1) {
        switch (_context11.prev = _context11.next) {
          case 0:
            marketplaceParams = _ref21.marketplaceParams;
            return _context11.abrupt("return", this.LoadMarketplace(marketplaceParams));

          case 2:
          case "end":
            return _context11.stop();
        }
      }
    }, _callee11, this);
  }));

  return function (_x4) {
    return _ref22.apply(this, arguments);
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
  var _ref24 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee12(_ref23) {
    var contractAddress;
    return _regeneratorRuntime.wrap(function _callee12$(_context12) {
      while (1) {
        switch (_context12.prev = _context12.next) {
          case 0:
            contractAddress = _ref23.contractAddress;
            _context12.next = 3;
            return Utils.ResponseToJson(this.client.authClient.MakeAuthServiceRequest({
              path: UrlJoin("as", "nft", "info", contractAddress),
              method: "GET"
            }));

          case 3:
            return _context12.abrupt("return", _context12.sent);

          case 4:
          case "end":
            return _context12.stop();
        }
      }
    }, _callee12, this);
  }));

  return function (_x5) {
    return _ref24.apply(this, arguments);
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
  var _ref26 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee13(_ref25) {
    var tokenId, contractAddress, nft;
    return _regeneratorRuntime.wrap(function _callee13$(_context13) {
      while (1) {
        switch (_context13.prev = _context13.next) {
          case 0:
            tokenId = _ref25.tokenId, contractAddress = _ref25.contractAddress;
            _context13.t0 = FormatNFTDetails;
            _context13.next = 4;
            return Utils.ResponseToJson(this.client.authClient.MakeAuthServiceRequest({
              path: UrlJoin("as", "nft", "info", contractAddress, tokenId),
              method: "GET"
            }));

          case 4:
            _context13.t1 = _context13.sent;
            nft = (0, _context13.t0)(_context13.t1);
            _context13.t2 = _objectSpread;
            _context13.t3 = _objectSpread;
            _context13.t4 = {};
            _context13.next = 11;
            return this.client.ContentObjectMetadata({
              versionHash: nft.details.VersionHash,
              metadataSubtree: "public/asset_metadata/nft",
              produceLinkUrls: true
            });

          case 11:
            _context13.t5 = _context13.sent;

            if (_context13.t5) {
              _context13.next = 14;
              break;
            }

            _context13.t5 = {};

          case 14:
            _context13.t6 = _context13.t5;
            _context13.t7 = (0, _context13.t3)(_context13.t4, _context13.t6);
            _context13.t8 = nft.metadata || {};
            nft.metadata = (0, _context13.t2)(_context13.t7, _context13.t8);
            _context13.next = 20;
            return this.TenantConfiguration({
              contractAddress: contractAddress
            });

          case 20:
            nft.config = _context13.sent;
            return _context13.abrupt("return", FormatNFTMetadata(nft));

          case 22:
          case "end":
            return _context13.stop();
        }
      }
    }, _callee13, this);
  }));

  return function (_x6) {
    return _ref26.apply(this, arguments);
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
  var _ref28 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee14(_ref27) {
    var contractAddress, tokenId, targetAddress;
    return _regeneratorRuntime.wrap(function _callee14$(_context14) {
      while (1) {
        switch (_context14.prev = _context14.next) {
          case 0:
            contractAddress = _ref27.contractAddress, tokenId = _ref27.tokenId, targetAddress = _ref27.targetAddress;

            if (!(!targetAddress || !Utils.ValidAddress(targetAddress))) {
              _context14.next = 3;
              break;
            }

            throw Error("Eluvio Wallet Client: Invalid or missing target address in UserTransferNFT");

          case 3:
            _context14.next = 5;
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
            return _context14.abrupt("return", _context14.sent);

          case 6:
          case "end":
            return _context14.stop();
        }
      }
    }, _callee14, this);
  }));

  return function (_x7) {
    return _ref28.apply(this, arguments);
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
  var _ref30 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee15(_ref29) {
    var listingId;
    return _regeneratorRuntime.wrap(function _callee15$(_context15) {
      while (1) {
        switch (_context15.prev = _context15.next) {
          case 0:
            listingId = _ref29.listingId;
            _context15.prev = 1;
            _context15.t0 = Utils;
            _context15.next = 5;
            return this.client.authClient.MakeAuthServiceRequest({
              path: UrlJoin("as", "mkt", "status", listingId),
              method: "GET"
            });

          case 5:
            _context15.t1 = _context15.sent;
            _context15.next = 8;
            return _context15.t0.ResponseToJson.call(_context15.t0, _context15.t1);

          case 8:
            return _context15.abrupt("return", _context15.sent);

          case 11:
            _context15.prev = 11;
            _context15.t2 = _context15["catch"](1);

            if (!(_context15.t2.status === 404)) {
              _context15.next = 15;
              break;
            }

            return _context15.abrupt("return");

          case 15:
            throw _context15.t2;

          case 16:
          case "end":
            return _context15.stop();
        }
      }
    }, _callee15, this, [[1, 11]]);
  }));

  return function (_x8) {
    return _ref30.apply(this, arguments);
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
  var _ref32 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee16(_ref31) {
    var listingId;
    return _regeneratorRuntime.wrap(function _callee16$(_context16) {
      while (1) {
        switch (_context16.prev = _context16.next) {
          case 0:
            listingId = _ref31.listingId;
            _context16.t0 = FormatNFT;
            _context16.t1 = Utils;
            _context16.next = 5;
            return this.client.authClient.MakeAuthServiceRequest({
              path: UrlJoin("as", "mkt", "l", listingId),
              method: "GET"
            });

          case 5:
            _context16.t2 = _context16.sent;
            _context16.next = 8;
            return _context16.t1.ResponseToJson.call(_context16.t1, _context16.t2);

          case 8:
            _context16.t3 = _context16.sent;
            return _context16.abrupt("return", (0, _context16.t0)(_context16.t3));

          case 10:
          case "end":
            return _context16.stop();
        }
      }
    }, _callee16, this);
  }));

  return function (_x9) {
    return _ref32.apply(this, arguments);
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
 *
 * @returns {Promise<Object>} - Results of the query and pagination info
 */


exports.Listings = /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee17() {
  var _args17 = arguments;
  return _regeneratorRuntime.wrap(function _callee17$(_context17) {
    while (1) {
      switch (_context17.prev = _context17.next) {
        case 0:
          return _context17.abrupt("return", this.FilteredQuery(_objectSpread({
            mode: "listings"
          }, _args17[0] || {})));

        case 1:
        case "end":
          return _context17.stop();
      }
    }
  }, _callee17, this);
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

exports.ListingStats = /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee18() {
  var _args18 = arguments;
  return _regeneratorRuntime.wrap(function _callee18$(_context18) {
    while (1) {
      switch (_context18.prev = _context18.next) {
        case 0:
          return _context18.abrupt("return", this.FilteredQuery(_objectSpread({
            mode: "listing-stats"
          }, _args18[0] || {})));

        case 1:
        case "end":
          return _context18.stop();
      }
    }
  }, _callee18, this);
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

exports.Sales = /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee19() {
  var _args19 = arguments;
  return _regeneratorRuntime.wrap(function _callee19$(_context19) {
    while (1) {
      switch (_context19.prev = _context19.next) {
        case 0:
          return _context19.abrupt("return", this.FilteredQuery(_objectSpread({
            mode: "sales"
          }, _args19[0] || {})));

        case 1:
        case "end":
          return _context19.stop();
      }
    }
  }, _callee19, this);
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

exports.Transfers = /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee20() {
  var _args20 = arguments;
  return _regeneratorRuntime.wrap(function _callee20$(_context20) {
    while (1) {
      switch (_context20.prev = _context20.next) {
        case 0:
          return _context20.abrupt("return", this.FilteredQuery(_objectSpread({
            mode: "transfers"
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

exports.SalesStats = /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee21() {
  var _args21 = arguments;
  return _regeneratorRuntime.wrap(function _callee21$(_context21) {
    while (1) {
      switch (_context21.prev = _context21.next) {
        case 0:
          return _context21.abrupt("return", this.FilteredQuery(_objectSpread({
            mode: "sales-stats"
          }, _args21[0] || {})));

        case 1:
        case "end":
          return _context21.stop();
      }
    }
  }, _callee21, this);
}));
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
  var _ref39 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee22(_ref38) {
    var contractAddress, tokenId, price, listingId;
    return _regeneratorRuntime.wrap(function _callee22$(_context22) {
      while (1) {
        switch (_context22.prev = _context22.next) {
          case 0:
            contractAddress = _ref38.contractAddress, tokenId = _ref38.tokenId, price = _ref38.price, listingId = _ref38.listingId;
            contractAddress = Utils.FormatAddress(contractAddress);

            if (!listingId) {
              _context22.next = 12;
              break;
            }

            _context22.t0 = Utils;
            _context22.next = 6;
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
            _context22.t1 = _context22.sent;
            _context22.next = 9;
            return _context22.t0.ResponseToFormat.call(_context22.t0, "text", _context22.t1);

          case 9:
            return _context22.abrupt("return", _context22.sent);

          case 12:
            _context22.t2 = Utils;
            _context22.next = 15;
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
            _context22.t3 = _context22.sent;
            _context22.next = 18;
            return _context22.t2.ResponseToJson.call(_context22.t2, _context22.t3);

          case 18:
            return _context22.abrupt("return", _context22.sent);

          case 19:
          case "end":
            return _context22.stop();
        }
      }
    }, _callee22, this);
  }));

  return function (_x10) {
    return _ref39.apply(this, arguments);
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
  var _ref41 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee23(_ref40) {
    var listingId;
    return _regeneratorRuntime.wrap(function _callee23$(_context23) {
      while (1) {
        switch (_context23.prev = _context23.next) {
          case 0:
            listingId = _ref40.listingId;
            _context23.next = 3;
            return this.client.authClient.MakeAuthServiceRequest({
              path: UrlJoin("as", "wlt", "mkt", listingId),
              method: "DELETE",
              headers: {
                Authorization: "Bearer ".concat(this.AuthToken())
              }
            });

          case 3:
          case "end":
            return _context23.stop();
        }
      }
    }, _callee23, this);
  }));

  return function (_x11) {
    return _ref41.apply(this, arguments);
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
  var _ref43 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee24(_ref42) {
    var marketplaceParams, tenantId;
    return _regeneratorRuntime.wrap(function _callee24$(_context24) {
      while (1) {
        switch (_context24.prev = _context24.next) {
          case 0:
            marketplaceParams = _ref42.marketplaceParams;

            if (!marketplaceParams) {
              _context24.next = 5;
              break;
            }

            _context24.next = 4;
            return this.MarketplaceInfo({
              marketplaceParams: marketplaceParams
            });

          case 4:
            tenantId = _context24.sent.tenantId;

          case 5:
            _context24.t0 = Utils;
            _context24.next = 8;
            return this.client.authClient.MakeAuthServiceRequest({
              path: UrlJoin("as", "mkt", "names"),
              method: "GET",
              queryParams: tenantId ? {
                filter: "tenant:eq:".concat(tenantId)
              } : {}
            });

          case 8:
            _context24.t1 = _context24.sent;
            _context24.next = 11;
            return _context24.t0.ResponseToJson.call(_context24.t0, _context24.t1);

          case 11:
            return _context24.abrupt("return", _context24.sent);

          case 12:
          case "end":
            return _context24.stop();
        }
      }
    }, _callee24, this);
  }));

  return function (_x12) {
    return _ref43.apply(this, arguments);
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
  var _ref45 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee25(_ref44) {
    var displayName;
    return _regeneratorRuntime.wrap(function _callee25$(_context25) {
      while (1) {
        switch (_context25.prev = _context25.next) {
          case 0:
            displayName = _ref44.displayName;
            _context25.t0 = Utils;
            _context25.next = 4;
            return this.client.authClient.MakeAuthServiceRequest({
              path: UrlJoin("as", "mkt", "editions"),
              queryParams: {
                filter: "nft/display_name:eq:".concat(displayName)
              },
              method: "GET"
            });

          case 4:
            _context25.t1 = _context25.sent;
            _context25.next = 7;
            return _context25.t0.ResponseToJson.call(_context25.t0, _context25.t1);

          case 7:
            return _context25.abrupt("return", _context25.sent);

          case 8:
          case "end":
            return _context25.stop();
        }
      }
    }, _callee25, this);
  }));

  return function (_x13) {
    return _ref45.apply(this, arguments);
  };
}();
/**
 * Retrieve names of all valid attributes for listed tiems. Full attribute names and values are required for filtering listing results by attributes.
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


exports.ListingAttributes = /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee26() {
  var _ref47,
      marketplaceParams,
      displayName,
      filters,
      attributes,
      _args26 = arguments;

  return _regeneratorRuntime.wrap(function _callee26$(_context26) {
    while (1) {
      switch (_context26.prev = _context26.next) {
        case 0:
          _ref47 = _args26.length > 0 && _args26[0] !== undefined ? _args26[0] : {}, marketplaceParams = _ref47.marketplaceParams, displayName = _ref47.displayName;
          filters = [];

          if (!marketplaceParams) {
            _context26.next = 10;
            break;
          }

          _context26.t0 = filters;
          _context26.t1 = "tenant:eq:";
          _context26.next = 7;
          return this.MarketplaceInfo({
            marketplaceParams: marketplaceParams
          });

        case 7:
          _context26.t2 = _context26.sent.tenantId;
          _context26.t3 = _context26.t1.concat.call(_context26.t1, _context26.t2);

          _context26.t0.push.call(_context26.t0, _context26.t3);

        case 10:
          if (displayName) {
            filters.push("nft/display_name:eq:".concat(displayName));
          }

          _context26.t4 = Utils;
          _context26.next = 14;
          return this.client.authClient.MakeAuthServiceRequest({
            path: UrlJoin("as", "mkt", "attributes"),
            method: "GET",
            queryParams: {
              filter: filters
            }
          });

        case 14:
          _context26.t5 = _context26.sent;
          _context26.next = 17;
          return _context26.t4.ResponseToJson.call(_context26.t4, _context26.t5);

        case 17:
          attributes = _context26.sent;
          return _context26.abrupt("return", attributes.map(function (_ref48) {
            var trait_type = _ref48.trait_type,
                values = _ref48.values;
            return {
              name: trait_type,
              values: values
            };
          }).filter(function (_ref49) {
            var name = _ref49.name;
            return !["Content Fabric Hash", "Total Minted Supply", "Creator"].includes(name);
          }));

        case 19:
        case "end":
          return _context26.stop();
      }
    }
  }, _callee26, this);
}));
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
  var _ref51 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee27(_ref50) {
    var listingId, confirmationId, listingStatus, statuses;
    return _regeneratorRuntime.wrap(function _callee27$(_context27) {
      while (1) {
        switch (_context27.prev = _context27.next) {
          case 0:
            listingId = _ref50.listingId, confirmationId = _ref50.confirmationId;
            _context27.prev = 1;
            _context27.next = 4;
            return this.ListingStatus({
              listingId: listingId
            });

          case 4:
            listingStatus = _context27.sent;

            if (listingStatus) {
              _context27.next = 7;
              break;
            }

            throw Error("Unable to find info for listing " + listingId);

          case 7:
            _context27.next = 9;
            return this.MintingStatus({
              tenantId: listingStatus.tenant
            });

          case 9:
            statuses = _context27.sent;
            return _context27.abrupt("return", statuses.find(function (status) {
              return status.op === "nft-transfer" && status.extra && status.extra[0] === confirmationId;
            }) || {
              status: "none"
            });

          case 13:
            _context27.prev = 13;
            _context27.t0 = _context27["catch"](1);
            this.Log(_context27.t0, true);
            return _context27.abrupt("return", {
              status: "unknown"
            });

          case 17:
          case "end":
            return _context27.stop();
        }
      }
    }, _callee27, this, [[1, 13]]);
  }));

  return function (_x14) {
    return _ref51.apply(this, arguments);
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
  var _ref53 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee28(_ref52) {
    var marketplaceParams, confirmationId, marketplaceInfo, statuses;
    return _regeneratorRuntime.wrap(function _callee28$(_context28) {
      while (1) {
        switch (_context28.prev = _context28.next) {
          case 0:
            marketplaceParams = _ref52.marketplaceParams, confirmationId = _ref52.confirmationId;
            _context28.prev = 1;
            _context28.next = 4;
            return this.MarketplaceInfo({
              marketplaceParams: marketplaceParams
            });

          case 4:
            marketplaceInfo = _context28.sent;
            _context28.next = 7;
            return this.MintingStatus({
              tenantId: marketplaceInfo.tenant_id
            });

          case 7:
            statuses = _context28.sent;
            return _context28.abrupt("return", statuses.find(function (status) {
              return status.op === "nft-buy" && status.confirmationId === confirmationId;
            }) || {
              status: "none"
            });

          case 11:
            _context28.prev = 11;
            _context28.t0 = _context28["catch"](1);
            this.Log(_context28.t0, true);
            return _context28.abrupt("return", {
              status: "unknown"
            });

          case 15:
          case "end":
            return _context28.stop();
        }
      }
    }, _callee28, this, [[1, 11]]);
  }));

  return function (_x15) {
    return _ref53.apply(this, arguments);
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
  var _ref55 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee29(_ref54) {
    var marketplaceParams, sku, marketplaceInfo, statuses;
    return _regeneratorRuntime.wrap(function _callee29$(_context29) {
      while (1) {
        switch (_context29.prev = _context29.next) {
          case 0:
            marketplaceParams = _ref54.marketplaceParams, sku = _ref54.sku;
            _context29.prev = 1;
            _context29.next = 4;
            return this.MarketplaceInfo({
              marketplaceParams: marketplaceParams
            });

          case 4:
            marketplaceInfo = _context29.sent;
            _context29.next = 7;
            return this.MintingStatus({
              tenantId: marketplaceInfo.tenantId
            });

          case 7:
            statuses = _context29.sent;
            return _context29.abrupt("return", statuses.find(function (status) {
              return status.op === "nft-claim" && status.marketplaceId === marketplaceInfo.marketplaceId && status.confirmationId === sku;
            }) || {
              status: "none"
            });

          case 11:
            _context29.prev = 11;
            _context29.t0 = _context29["catch"](1);
            this.Log(_context29.t0, true);
            return _context29.abrupt("return", {
              status: "unknown"
            });

          case 15:
          case "end":
            return _context29.stop();
        }
      }
    }, _callee29, this, [[1, 11]]);
  }));

  return function (_x16) {
    return _ref55.apply(this, arguments);
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
  var _ref57 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee30(_ref56) {
    var contractAddress, tokenId, tenantConfig, statuses;
    return _regeneratorRuntime.wrap(function _callee30$(_context30) {
      while (1) {
        switch (_context30.prev = _context30.next) {
          case 0:
            contractAddress = _ref56.contractAddress, tokenId = _ref56.tokenId;
            _context30.prev = 1;
            _context30.next = 4;
            return this.TenantConfiguration({
              contractAddress: contractAddress
            });

          case 4:
            tenantConfig = _context30.sent;
            _context30.next = 7;
            return this.MintingStatus({
              tenantId: tenantConfig.tenant
            });

          case 7:
            statuses = _context30.sent;
            return _context30.abrupt("return", statuses.find(function (status) {
              return status.op === "nft-open" && Utils.EqualAddress(contractAddress, status.address) && status.tokenId === tokenId;
            }) || {
              status: "none"
            });

          case 11:
            _context30.prev = 11;
            _context30.t0 = _context30["catch"](1);
            this.Log(_context30.t0, true);
            return _context30.abrupt("return", {
              status: "unknown"
            });

          case 15:
          case "end":
            return _context30.stop();
        }
      }
    }, _callee30, this, [[1, 11]]);
  }));

  return function (_x17) {
    return _ref57.apply(this, arguments);
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
  var _ref59 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee31(_ref58) {
    var marketplaceParams, confirmationId, statuses;
    return _regeneratorRuntime.wrap(function _callee31$(_context31) {
      while (1) {
        switch (_context31.prev = _context31.next) {
          case 0:
            marketplaceParams = _ref58.marketplaceParams, confirmationId = _ref58.confirmationId;
            _context31.prev = 1;
            _context31.next = 4;
            return this.MintingStatus({
              marketplaceParams: marketplaceParams
            });

          case 4:
            statuses = _context31.sent;
            return _context31.abrupt("return", statuses.find(function (status) {
              return status.op === "nft-redeem" && status.confirmationId === confirmationId;
            }) || {
              status: "none"
            });

          case 8:
            _context31.prev = 8;
            _context31.t0 = _context31["catch"](1);
            this.Log(_context31.t0, true);
            return _context31.abrupt("return", {
              status: "unknown"
            });

          case 12:
          case "end":
            return _context31.stop();
        }
      }
    }, _callee31, this, [[1, 8]]);
  }));

  return function (_x18) {
    return _ref59.apply(this, arguments);
  };
}();
/* EVENTS */


exports.LoadDrop = /*#__PURE__*/function () {
  var _ref61 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee32(_ref60) {
    var _this2 = this;

    var tenantSlug, eventSlug, dropId, mainSiteHash, event, eventId;
    return _regeneratorRuntime.wrap(function _callee32$(_context32) {
      while (1) {
        switch (_context32.prev = _context32.next) {
          case 0:
            tenantSlug = _ref60.tenantSlug, eventSlug = _ref60.eventSlug, dropId = _ref60.dropId;

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
              _context32.next = 16;
              break;
            }

            _context32.next = 7;
            return this.client.LatestVersionHash({
              objectId: this.mainSiteId
            });

          case 7:
            mainSiteHash = _context32.sent;
            _context32.next = 10;
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
            _context32.t0 = _context32.sent;

            if (_context32.t0) {
              _context32.next = 13;
              break;
            }

            _context32.t0 = [];

          case 13:
            event = _context32.t0;
            eventId = Utils.DecodeVersionHash(event["."].source).objectId;
            event.drops.forEach(function (drop) {
              drop = _objectSpread(_objectSpread({}, drop), {}, {
                eventId: eventId
              });
              _this2.drops[tenantSlug][eventSlug][drop.uuid] = drop;
              _this2.drops[drop.uuid] = drop;
            });

          case 16:
            return _context32.abrupt("return", this.drops[dropId]);

          case 17:
          case "end":
            return _context32.stop();
        }
      }
    }, _callee32, this);
  }));

  return function (_x19) {
    return _ref61.apply(this, arguments);
  };
}();

exports.SubmitDropVote = /*#__PURE__*/function () {
  var _ref63 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee33(_ref62) {
    var marketplaceParams, eventId, dropId, sku, marketplaceInfo;
    return _regeneratorRuntime.wrap(function _callee33$(_context33) {
      while (1) {
        switch (_context33.prev = _context33.next) {
          case 0:
            marketplaceParams = _ref62.marketplaceParams, eventId = _ref62.eventId, dropId = _ref62.dropId, sku = _ref62.sku;
            _context33.next = 3;
            return this.MarketplaceInfo({
              marketplaceParams: marketplaceParams
            });

          case 3:
            marketplaceInfo = _context33.sent;
            _context33.next = 6;
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
            return _context33.stop();
        }
      }
    }, _callee33, this);
  }));

  return function (_x20) {
    return _ref63.apply(this, arguments);
  };
}();

exports.DropStatus = /*#__PURE__*/function () {
  var _ref65 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee34(_ref64) {
    var marketplace, eventId, dropId, response;
    return _regeneratorRuntime.wrap(function _callee34$(_context34) {
      while (1) {
        switch (_context34.prev = _context34.next) {
          case 0:
            marketplace = _ref64.marketplace, eventId = _ref64.eventId, dropId = _ref64.dropId;
            _context34.prev = 1;
            _context34.next = 4;
            return Utils.ResponseToJson(this.client.authClient.MakeAuthServiceRequest({
              path: UrlJoin("as", "wlt", "act", marketplace.tenant_id, eventId, dropId),
              method: "GET",
              headers: {
                Authorization: "Bearer ".concat(this.AuthToken())
              }
            }));

          case 4:
            response = _context34.sent;
            return _context34.abrupt("return", response.sort(function (a, b) {
              return a.ts > b.ts ? 1 : -1;
            })[0] || {
              status: "none"
            });

          case 8:
            _context34.prev = 8;
            _context34.t0 = _context34["catch"](1);
            this.Log(_context34.t0, true);
            return _context34.abrupt("return", "");

          case 12:
          case "end":
            return _context34.stop();
        }
      }
    }, _callee34, this, [[1, 8]]);
  }));

  return function (_x21) {
    return _ref65.apply(this, arguments);
  };
}();