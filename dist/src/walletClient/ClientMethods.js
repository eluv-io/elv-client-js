var _defineProperty = require("@babel/runtime/helpers/defineProperty");

var _regeneratorRuntime = require("@babel/runtime/regenerator");

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

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


exports.UserWalletBalance = function _callee() {
  var checkOnboard,
      _ref,
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

  return _regeneratorRuntime.async(function _callee$(_context) {
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
          _context.t0 = _regeneratorRuntime;
          _context.t1 = this.client.utils;
          _context.next = 7;
          return _regeneratorRuntime.awrap(this.client.authClient.MakeAuthServiceRequest({
            path: UrlJoin("as", "wlt", "mkt", "bal"),
            method: "GET",
            headers: {
              Authorization: "Bearer ".concat(this.AuthToken())
            }
          }));

        case 7:
          _context.t2 = _context.sent;
          _context.t3 = _context.t1.ResponseToJson.call(_context.t1, _context.t2);
          _context.next = 11;
          return _context.t0.awrap.call(_context.t0, _context.t3);

        case 11:
          _ref = _context.sent;
          balance = _ref.balance;
          usage_hold = _ref.usage_hold;
          payout_hold = _ref.payout_hold;
          stripe_id = _ref.stripe_id;
          stripe_payouts_enabled = _ref.stripe_payouts_enabled;
          userStripeId = stripe_id;
          userStripeEnabled = stripe_payouts_enabled;
          totalWalletBalance = parseFloat(balance || 0);
          availableWalletBalance = Math.max(0, totalWalletBalance - parseFloat(usage_hold || 0));
          pendingWalletBalance = Math.max(0, totalWalletBalance - availableWalletBalance);
          withdrawableWalletBalance = Math.max(0, totalWalletBalance - parseFloat(payout_hold || 0));

          if (!(checkOnboard && stripe_id && !stripe_payouts_enabled)) {
            _context.next = 30;
            break;
          }

          // Refresh stripe enabled flag
          rootUrl = new URL(UrlJoin(window.location.origin, window.location.pathname)).toString();
          _context.next = 27;
          return _regeneratorRuntime.awrap(this.client.authClient.MakeAuthServiceRequest({
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
          }));

        case 27:
          _context.next = 29;
          return _regeneratorRuntime.awrap(this.UserWalletBalance(false));

        case 29:
          return _context.abrupt("return", _context.sent);

        case 30:
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

        case 33:
        case "end":
          return _context.stop();
      }
    }
  }, null, this);
};
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


exports.UserItemInfo = function _callee2() {
  var _this = this;

  var _ref2,
      userAddress,
      accountId,
      nftInfo,
      _args2 = arguments;

  return _regeneratorRuntime.async(function _callee2$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          _ref2 = _args2.length > 0 && _args2[0] !== undefined ? _args2[0] : {}, userAddress = _ref2.userAddress;
          accountId = "iusr".concat(Utils.AddressToHash(userAddress || this.UserAddress()));
          _context2.next = 4;
          return _regeneratorRuntime.awrap(this.client.ethClient.MakeProviderCall({
            methodName: "send",
            args: ["elv_getAccountProfile", [this.client.contentSpaceId, accountId]]
          }));

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
              nftInfo[key] = _objectSpread({}, details, {
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
  }, null, this);
};
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


exports.UserItemNames = function _callee3() {
  var _ref3,
      marketplaceParams,
      userAddress,
      filters,
      _args3 = arguments;

  return _regeneratorRuntime.async(function _callee3$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          _ref3 = _args3.length > 0 && _args3[0] !== undefined ? _args3[0] : {}, marketplaceParams = _ref3.marketplaceParams, userAddress = _ref3.userAddress;
          filters = [];

          if (!marketplaceParams) {
            _context3.next = 10;
            break;
          }

          _context3.t0 = filters;
          _context3.t1 = "tenant:eq:";
          _context3.next = 7;
          return _regeneratorRuntime.awrap(this.MarketplaceInfo({
            marketplaceParams: marketplaceParams
          }));

        case 7:
          _context3.t2 = _context3.sent.tenantId;
          _context3.t3 = _context3.t1.concat.call(_context3.t1, _context3.t2);

          _context3.t0.push.call(_context3.t0, _context3.t3);

        case 10:
          if (userAddress) {
            filters.push("wlt:eq:".concat(Utils.FormatAddress(userAddress)));
          }

          _context3.t4 = _regeneratorRuntime;
          _context3.t5 = Utils;
          _context3.next = 15;
          return _regeneratorRuntime.awrap(this.client.authClient.MakeAuthServiceRequest({
            path: UrlJoin("as", "wlt", "names"),
            method: "GET",
            queryParams: {
              filter: filters
            }
          }));

        case 15:
          _context3.t6 = _context3.sent;
          _context3.t7 = _context3.t5.ResponseToJson.call(_context3.t5, _context3.t6);
          _context3.next = 19;
          return _context3.t4.awrap.call(_context3.t4, _context3.t7);

        case 19:
          return _context3.abrupt("return", _context3.sent);

        case 20:
        case "end":
          return _context3.stop();
      }
    }
  }, null, this);
};
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


exports.UserItemEditionNames = function _callee4(_ref4) {
  var displayName;
  return _regeneratorRuntime.async(function _callee4$(_context4) {
    while (1) {
      switch (_context4.prev = _context4.next) {
        case 0:
          displayName = _ref4.displayName;
          _context4.t0 = _regeneratorRuntime;
          _context4.t1 = Utils;
          _context4.next = 5;
          return _regeneratorRuntime.awrap(this.client.authClient.MakeAuthServiceRequest({
            path: UrlJoin("as", "wlt", "editions"),
            method: "GET",
            queryParams: {
              filter: "meta/display_name:eq:".concat(displayName)
            }
          }));

        case 5:
          _context4.t2 = _context4.sent;
          _context4.t3 = _context4.t1.ResponseToJson.call(_context4.t1, _context4.t2);
          _context4.next = 9;
          return _context4.t0.awrap.call(_context4.t0, _context4.t3);

        case 9:
          return _context4.abrupt("return", _context4.sent);

        case 10:
        case "end":
          return _context4.stop();
      }
    }
  }, null, this);
};
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


exports.UserItemAttributes = function _callee5() {
  var _ref5,
      marketplaceParams,
      displayName,
      userAddress,
      filters,
      attributes,
      _args5 = arguments;

  return _regeneratorRuntime.async(function _callee5$(_context5) {
    while (1) {
      switch (_context5.prev = _context5.next) {
        case 0:
          _ref5 = _args5.length > 0 && _args5[0] !== undefined ? _args5[0] : {}, marketplaceParams = _ref5.marketplaceParams, displayName = _ref5.displayName, userAddress = _ref5.userAddress;
          filters = [];

          if (!marketplaceParams) {
            _context5.next = 10;
            break;
          }

          _context5.t0 = filters;
          _context5.t1 = "tenant:eq:";
          _context5.next = 7;
          return _regeneratorRuntime.awrap(this.MarketplaceInfo({
            marketplaceParams: marketplaceParams
          }));

        case 7:
          _context5.t2 = _context5.sent.tenantId;
          _context5.t3 = _context5.t1.concat.call(_context5.t1, _context5.t2);

          _context5.t0.push.call(_context5.t0, _context5.t3);

        case 10:
          if (userAddress) {
            filters.push("wlt:eq:".concat(Utils.FormatAddress(userAddress)));
          }

          if (displayName) {
            filters.push("meta/display_name:eq:".concat(displayName));
          }

          _context5.t4 = _regeneratorRuntime;
          _context5.t5 = Utils;
          _context5.next = 16;
          return _regeneratorRuntime.awrap(this.client.authClient.MakeAuthServiceRequest({
            path: UrlJoin("as", "wlt", "attributes"),
            method: "GET",
            queryParams: {
              filter: filters
            }
          }));

        case 16:
          _context5.t6 = _context5.sent;
          _context5.t7 = _context5.t5.ResponseToJson.call(_context5.t5, _context5.t6);
          _context5.next = 20;
          return _context5.t4.awrap.call(_context5.t4, _context5.t7);

        case 20:
          attributes = _context5.sent;
          return _context5.abrupt("return", attributes.map(function (_ref6) {
            var trait_type = _ref6.trait_type,
                values = _ref6.values;
            return {
              name: trait_type,
              values: values
            };
          }).filter(function (_ref7) {
            var name = _ref7.name;
            return !["Content Fabric Hash", "Total Minted Supply", "Creator"].includes(name);
          }));

        case 22:
        case "end":
          return _context5.stop();
      }
    }
  }, null, this);
};
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


exports.UserItems = function _callee6() {
  var _args6 = arguments;
  return _regeneratorRuntime.async(function _callee6$(_context6) {
    while (1) {
      switch (_context6.prev = _context6.next) {
        case 0:
          return _context6.abrupt("return", this.FilteredQuery(_objectSpread({
            mode: "owned"
          }, _args6[0] || {})));

        case 1:
        case "end":
          return _context6.stop();
      }
    }
  }, null, this);
};
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


exports.UserListings = function _callee7() {
  var _ref8,
      userAddress,
      _ref8$sortBy,
      sortBy,
      _ref8$sortDesc,
      sortDesc,
      contractAddress,
      tokenId,
      marketplaceParams,
      _args7 = arguments;

  return _regeneratorRuntime.async(function _callee7$(_context7) {
    while (1) {
      switch (_context7.prev = _context7.next) {
        case 0:
          _ref8 = _args7.length > 0 && _args7[0] !== undefined ? _args7[0] : {}, userAddress = _ref8.userAddress, _ref8$sortBy = _ref8.sortBy, sortBy = _ref8$sortBy === void 0 ? "created" : _ref8$sortBy, _ref8$sortDesc = _ref8.sortDesc, sortDesc = _ref8$sortDesc === void 0 ? false : _ref8$sortDesc, contractAddress = _ref8.contractAddress, tokenId = _ref8.tokenId, marketplaceParams = _ref8.marketplaceParams;
          _context7.next = 3;
          return _regeneratorRuntime.awrap(this.FilteredQuery({
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
          }));

        case 3:
          return _context7.abrupt("return", _context7.sent.results);

        case 4:
        case "end":
          return _context7.stop();
      }
    }
  }, null, this);
};
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


exports.UserSales = function _callee8() {
  var _ref9,
      userAddress,
      _ref9$sortBy,
      sortBy,
      _ref9$sortDesc,
      sortDesc,
      contractAddress,
      tokenId,
      marketplaceParams,
      _args8 = arguments;

  return _regeneratorRuntime.async(function _callee8$(_context8) {
    while (1) {
      switch (_context8.prev = _context8.next) {
        case 0:
          _ref9 = _args8.length > 0 && _args8[0] !== undefined ? _args8[0] : {}, userAddress = _ref9.userAddress, _ref9$sortBy = _ref9.sortBy, sortBy = _ref9$sortBy === void 0 ? "created" : _ref9$sortBy, _ref9$sortDesc = _ref9.sortDesc, sortDesc = _ref9$sortDesc === void 0 ? false : _ref9$sortDesc, contractAddress = _ref9.contractAddress, tokenId = _ref9.tokenId, marketplaceParams = _ref9.marketplaceParams;
          _context8.next = 3;
          return _regeneratorRuntime.awrap(this.FilteredQuery({
            mode: "sales",
            start: 0,
            limit: 10000,
            sortBy: sortBy,
            sortDesc: sortDesc,
            sellerAddress: userAddress || this.UserAddress(),
            marketplaceParams: marketplaceParams,
            contractAddress: contractAddress,
            tokenId: tokenId
          }));

        case 3:
          return _context8.abrupt("return", _context8.sent.results);

        case 4:
        case "end":
          return _context8.stop();
      }
    }
  }, null, this);
};
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


exports.UserTransfers = function _callee9() {
  var _ref10,
      userAddress,
      _ref10$sortBy,
      sortBy,
      _ref10$sortDesc,
      sortDesc,
      contractAddress,
      tokenId,
      marketplaceParams,
      _args9 = arguments;

  return _regeneratorRuntime.async(function _callee9$(_context9) {
    while (1) {
      switch (_context9.prev = _context9.next) {
        case 0:
          _ref10 = _args9.length > 0 && _args9[0] !== undefined ? _args9[0] : {}, userAddress = _ref10.userAddress, _ref10$sortBy = _ref10.sortBy, sortBy = _ref10$sortBy === void 0 ? "created" : _ref10$sortBy, _ref10$sortDesc = _ref10.sortDesc, sortDesc = _ref10$sortDesc === void 0 ? false : _ref10$sortDesc, contractAddress = _ref10.contractAddress, tokenId = _ref10.tokenId, marketplaceParams = _ref10.marketplaceParams;
          _context9.next = 3;
          return _regeneratorRuntime.awrap(this.FilteredQuery({
            mode: "transfers",
            start: 0,
            limit: 10000,
            sortBy: sortBy,
            sortDesc: sortDesc,
            sellerAddress: userAddress || this.UserAddress(),
            marketplaceParams: marketplaceParams,
            contractAddress: contractAddress,
            tokenId: tokenId
          }));

        case 3:
          return _context9.abrupt("return", _context9.sent.results);

        case 4:
        case "end":
          return _context9.stop();
      }
    }
  }, null, this);
};
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


exports.TenantConfiguration = function _callee10(_ref11) {
  var tenantId, contractAddress;
  return _regeneratorRuntime.async(function _callee10$(_context10) {
    while (1) {
      switch (_context10.prev = _context10.next) {
        case 0:
          tenantId = _ref11.tenantId, contractAddress = _ref11.contractAddress;
          _context10.prev = 1;
          _context10.next = 4;
          return _regeneratorRuntime.awrap(Utils.ResponseToJson(this.client.authClient.MakeAuthServiceRequest({
            path: contractAddress ? UrlJoin("as", "config", "nft", contractAddress) : UrlJoin("as", "config", "tnt", tenantId),
            method: "GET"
          })));

        case 4:
          return _context10.abrupt("return", _context10.sent);

        case 7:
          _context10.prev = 7;
          _context10.t0 = _context10["catch"](1);
          this.Log("Failed to load tenant configuration", true, _context10.t0);
          return _context10.abrupt("return", {});

        case 11:
        case "end":
          return _context10.stop();
      }
    }
  }, null, this, [[1, 7]]);
};
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


exports.MarketplaceStock = function _callee11(_ref12) {
  var marketplaceParams, tenantId, marketplaceInfo;
  return _regeneratorRuntime.async(function _callee11$(_context11) {
    while (1) {
      switch (_context11.prev = _context11.next) {
        case 0:
          marketplaceParams = _ref12.marketplaceParams, tenantId = _ref12.tenantId;

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
          return _regeneratorRuntime.awrap(Utils.ResponseToJson(this.client.authClient.MakeAuthServiceRequest({
            path: UrlJoin("as", "wlt", "nft", "info", tenantId),
            method: "GET",
            headers: {
              Authorization: "Bearer ".concat(this.AuthToken())
            }
          })));

        case 5:
          return _context11.abrupt("return", _context11.sent);

        case 6:
          _context11.next = 8;
          return _regeneratorRuntime.awrap(Utils.ResponseToJson(this.client.authClient.MakeAuthServiceRequest({
            path: UrlJoin("as", "nft", "stock", tenantId),
            method: "GET"
          })));

        case 8:
          return _context11.abrupt("return", _context11.sent);

        case 9:
        case "end":
          return _context11.stop();
      }
    }
  }, null, this);
};
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


exports.MarketplaceInfo = function (_ref13) {
  var marketplaceParams = _ref13.marketplaceParams;

  var _ref14 = marketplaceParams || {},
      tenantSlug = _ref14.tenantSlug,
      marketplaceSlug = _ref14.marketplaceSlug,
      marketplaceId = _ref14.marketplaceId,
      marketplaceHash = _ref14.marketplaceHash;

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


exports.MarketplaceCSS = function _callee12(_ref15) {
  var marketplaceParams, marketplaceInfo, marketplaceHash;
  return _regeneratorRuntime.async(function _callee12$(_context12) {
    while (1) {
      switch (_context12.prev = _context12.next) {
        case 0:
          marketplaceParams = _ref15.marketplaceParams;
          marketplaceInfo = this.MarketplaceInfo({
            marketplaceParams: marketplaceParams
          });
          marketplaceHash = marketplaceInfo.marketplaceHash;

          if (this.cachedCSS[marketplaceHash]) {
            _context12.next = 7;
            break;
          }

          _context12.next = 6;
          return _regeneratorRuntime.awrap(this.client.ContentObjectMetadata({
            versionHash: marketplaceHash,
            metadataSubtree: "public/asset_metadata/info/branding/custom_css",
            authorizationToken: this.publicStaticToken,
            noAuth: true
          }));

        case 6:
          this.cachedCSS[marketplaceHash] = _context12.sent;

        case 7:
          return _context12.abrupt("return", this.cachedCSS[marketplaceHash] || "");

        case 8:
        case "end":
          return _context12.stop();
      }
    }
  }, null, this);
};
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


exports.AvailableMarketplaces = function _callee13() {
  var _ref16,
      organizeById,
      _ref16$forceReload,
      forceReload,
      _args13 = arguments;

  return _regeneratorRuntime.async(function _callee13$(_context13) {
    while (1) {
      switch (_context13.prev = _context13.next) {
        case 0:
          _ref16 = _args13.length > 0 && _args13[0] !== undefined ? _args13[0] : {}, organizeById = _ref16.organizeById, _ref16$forceReload = _ref16.forceReload, forceReload = _ref16$forceReload === void 0 ? false : _ref16$forceReload;

          if (!forceReload) {
            _context13.next = 4;
            break;
          }

          _context13.next = 4;
          return _regeneratorRuntime.awrap(this.LoadAvailableMarketplaces(true));

        case 4:
          return _context13.abrupt("return", _objectSpread({}, organizeById ? this.availableMarketplacesById : this.availableMarketplaces));

        case 5:
        case "end":
          return _context13.stop();
      }
    }
  }, null, this);
};
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


exports.Marketplace = function _callee14(_ref17) {
  var marketplaceParams;
  return _regeneratorRuntime.async(function _callee14$(_context14) {
    while (1) {
      switch (_context14.prev = _context14.next) {
        case 0:
          marketplaceParams = _ref17.marketplaceParams;
          return _context14.abrupt("return", this.LoadMarketplace(marketplaceParams));

        case 2:
        case "end":
          return _context14.stop();
      }
    }
  }, null, this);
};
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


exports.NFTContractStats = function _callee15(_ref18) {
  var contractAddress;
  return _regeneratorRuntime.async(function _callee15$(_context15) {
    while (1) {
      switch (_context15.prev = _context15.next) {
        case 0:
          contractAddress = _ref18.contractAddress;
          _context15.next = 3;
          return _regeneratorRuntime.awrap(Utils.ResponseToJson(this.client.authClient.MakeAuthServiceRequest({
            path: UrlJoin("as", "nft", "info", contractAddress),
            method: "GET"
          })));

        case 3:
          return _context15.abrupt("return", _context15.sent);

        case 4:
        case "end":
          return _context15.stop();
      }
    }
  }, null, this);
};
/**
 * Load full info for the specified NFT
 *
 * @methodGroup NFTs
 * @namedParams
 * @param {string} contractAddress - The contract address of the NFT
 * @param {string} tokenId - The token ID of the NFT
 */


exports.NFT = function _callee16(_ref19) {
  var tokenId, contractAddress, nft;
  return _regeneratorRuntime.async(function _callee16$(_context16) {
    while (1) {
      switch (_context16.prev = _context16.next) {
        case 0:
          tokenId = _ref19.tokenId, contractAddress = _ref19.contractAddress;
          _context16.t0 = FormatNFTDetails;
          _context16.next = 4;
          return _regeneratorRuntime.awrap(Utils.ResponseToJson(this.client.authClient.MakeAuthServiceRequest({
            path: UrlJoin("as", "nft", "info", contractAddress, tokenId),
            method: "GET"
          })));

        case 4:
          _context16.t1 = _context16.sent;
          nft = (0, _context16.t0)(_context16.t1);
          _context16.t2 = _objectSpread;
          _context16.t3 = {};
          _context16.next = 10;
          return _regeneratorRuntime.awrap(this.client.ContentObjectMetadata({
            versionHash: nft.details.VersionHash,
            metadataSubtree: "public/asset_metadata/nft",
            produceLinkUrls: true
          }));

        case 10:
          _context16.t4 = _context16.sent;

          if (_context16.t4) {
            _context16.next = 13;
            break;
          }

          _context16.t4 = {};

        case 13:
          _context16.t5 = _context16.t4;
          _context16.t6 = {};
          _context16.t7 = nft.metadata || {};
          nft.metadata = (0, _context16.t2)(_context16.t3, _context16.t5, _context16.t6, _context16.t7);
          _context16.next = 19;
          return _regeneratorRuntime.awrap(this.TenantConfiguration({
            contractAddress: contractAddress
          }));

        case 19:
          nft.config = _context16.sent;
          return _context16.abrupt("return", FormatNFTMetadata(this, nft));

        case 21:
        case "end":
          return _context16.stop();
      }
    }
  }, null, this);
};
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


exports.TransferNFT = function _callee17(_ref20) {
  var contractAddress, tokenId, targetAddress;
  return _regeneratorRuntime.async(function _callee17$(_context17) {
    while (1) {
      switch (_context17.prev = _context17.next) {
        case 0:
          contractAddress = _ref20.contractAddress, tokenId = _ref20.tokenId, targetAddress = _ref20.targetAddress;

          if (!(!targetAddress || !Utils.ValidAddress(targetAddress))) {
            _context17.next = 3;
            break;
          }

          throw Error("Eluvio Wallet Client: Invalid or missing target address in UserTransferNFT");

        case 3:
          _context17.next = 5;
          return _regeneratorRuntime.awrap(this.client.authClient.MakeAuthServiceRequest({
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
          }));

        case 5:
          return _context17.abrupt("return", _context17.sent);

        case 6:
        case "end":
          return _context17.stop();
      }
    }
  }, null, this);
};
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


exports.ListingStatus = function _callee18(_ref21) {
  var listingId;
  return _regeneratorRuntime.async(function _callee18$(_context18) {
    while (1) {
      switch (_context18.prev = _context18.next) {
        case 0:
          listingId = _ref21.listingId;
          _context18.prev = 1;
          _context18.t0 = _regeneratorRuntime;
          _context18.t1 = Utils;
          _context18.next = 6;
          return _regeneratorRuntime.awrap(this.client.authClient.MakeAuthServiceRequest({
            path: UrlJoin("as", "mkt", "status", listingId),
            method: "GET"
          }));

        case 6:
          _context18.t2 = _context18.sent;
          _context18.t3 = _context18.t1.ResponseToJson.call(_context18.t1, _context18.t2);
          _context18.next = 10;
          return _context18.t0.awrap.call(_context18.t0, _context18.t3);

        case 10:
          return _context18.abrupt("return", _context18.sent);

        case 13:
          _context18.prev = 13;
          _context18.t4 = _context18["catch"](1);

          if (!(_context18.t4.status === 404)) {
            _context18.next = 17;
            break;
          }

          return _context18.abrupt("return");

        case 17:
          throw _context18.t4;

        case 18:
        case "end":
          return _context18.stop();
      }
    }
  }, null, this, [[1, 13]]);
};
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


exports.Listing = function _callee19(_ref22) {
  var listingId;
  return _regeneratorRuntime.async(function _callee19$(_context19) {
    while (1) {
      switch (_context19.prev = _context19.next) {
        case 0:
          listingId = _ref22.listingId;
          _context19.t0 = FormatNFT;
          _context19.t1 = this;
          _context19.t2 = _regeneratorRuntime;
          _context19.t3 = Utils;
          _context19.next = 7;
          return _regeneratorRuntime.awrap(this.client.authClient.MakeAuthServiceRequest({
            path: UrlJoin("as", "mkt", "l", listingId),
            method: "GET"
          }));

        case 7:
          _context19.t4 = _context19.sent;
          _context19.t5 = _context19.t3.ResponseToJson.call(_context19.t3, _context19.t4);
          _context19.next = 11;
          return _context19.t2.awrap.call(_context19.t2, _context19.t5);

        case 11:
          _context19.t6 = _context19.sent;
          return _context19.abrupt("return", (0, _context19.t0)(_context19.t1, _context19.t6));

        case 13:
        case "end":
          return _context19.stop();
      }
    }
  }, null, this);
};
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


exports.Listings = function _callee20() {
  var _args20 = arguments;
  return _regeneratorRuntime.async(function _callee20$(_context20) {
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
  }, null, this);
};
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


exports.ListingStats = function _callee21() {
  var _args21 = arguments;
  return _regeneratorRuntime.async(function _callee21$(_context21) {
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
  }, null, this);
};
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


exports.Sales = function _callee22() {
  var _args22 = arguments;
  return _regeneratorRuntime.async(function _callee22$(_context22) {
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
  }, null, this);
};
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


exports.Transfers = function _callee23() {
  var _args23 = arguments;
  return _regeneratorRuntime.async(function _callee23$(_context23) {
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
  }, null, this);
};
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


exports.SalesStats = function _callee24() {
  var _args24 = arguments;
  return _regeneratorRuntime.async(function _callee24$(_context24) {
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
  }, null, this);
};
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


exports.Leaderboard = function _callee25(_ref23) {
  var userAddress,
      marketplaceParams,
      params,
      _args25 = arguments;
  return _regeneratorRuntime.async(function _callee25$(_context25) {
    while (1) {
      switch (_context25.prev = _context25.next) {
        case 0:
          userAddress = _ref23.userAddress, marketplaceParams = _ref23.marketplaceParams;

          if (!userAddress) {
            _context25.next = 22;
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
          return _regeneratorRuntime.awrap(this.MarketplaceInfo({
            marketplaceParams: marketplaceParams
          }));

        case 7:
          _context25.t1 = _context25.sent.tenantId;
          _context25.t2 = _context25.t0.concat.call(_context25.t0, _context25.t1);
          params.filter = [_context25.t2];

        case 10:
          _context25.t4 = _regeneratorRuntime;
          _context25.t5 = Utils;
          _context25.next = 14;
          return _regeneratorRuntime.awrap(this.client.authClient.MakeAuthServiceRequest({
            path: UrlJoin("as", "wlt", "ranks"),
            method: "GET",
            queryParams: params
          }));

        case 14:
          _context25.t6 = _context25.sent;
          _context25.t7 = _context25.t5.ResponseToJson.call(_context25.t5, _context25.t6);
          _context25.next = 18;
          return _context25.t4.awrap.call(_context25.t4, _context25.t7);

        case 18:
          _context25.t3 = _context25.sent;

          if (_context25.t3) {
            _context25.next = 21;
            break;
          }

          _context25.t3 = [];

        case 21:
          return _context25.abrupt("return", _context25.t3[0]);

        case 22:
          return _context25.abrupt("return", this.FilteredQuery(_objectSpread({
            mode: "leaderboard"
          }, _args25[0] || {})));

        case 23:
        case "end":
          return _context25.stop();
      }
    }
  }, null, this);
};
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


exports.CreateListing = function _callee26(_ref24) {
  var contractAddress, tokenId, price, listingId;
  return _regeneratorRuntime.async(function _callee26$(_context26) {
    while (1) {
      switch (_context26.prev = _context26.next) {
        case 0:
          contractAddress = _ref24.contractAddress, tokenId = _ref24.tokenId, price = _ref24.price, listingId = _ref24.listingId;
          contractAddress = Utils.FormatAddress(contractAddress);

          if (!listingId) {
            _context26.next = 14;
            break;
          }

          _context26.t0 = _regeneratorRuntime;
          _context26.t1 = Utils;
          _context26.next = 7;
          return _regeneratorRuntime.awrap(this.client.authClient.MakeAuthServiceRequest({
            path: UrlJoin("as", "wlt", "mkt"),
            method: "PUT",
            body: {
              id: listingId,
              price: parseFloat(price)
            },
            headers: {
              Authorization: "Bearer ".concat(this.AuthToken())
            }
          }));

        case 7:
          _context26.t2 = _context26.sent;
          _context26.t3 = _context26.t1.ResponseToFormat.call(_context26.t1, "text", _context26.t2);
          _context26.next = 11;
          return _context26.t0.awrap.call(_context26.t0, _context26.t3);

        case 11:
          return _context26.abrupt("return", _context26.sent);

        case 14:
          _context26.t4 = _regeneratorRuntime;
          _context26.t5 = Utils;
          _context26.next = 18;
          return _regeneratorRuntime.awrap(this.client.authClient.MakeAuthServiceRequest({
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
          }));

        case 18:
          _context26.t6 = _context26.sent;
          _context26.t7 = _context26.t5.ResponseToJson.call(_context26.t5, _context26.t6);
          _context26.next = 22;
          return _context26.t4.awrap.call(_context26.t4, _context26.t7);

        case 22:
          return _context26.abrupt("return", _context26.sent);

        case 23:
        case "end":
          return _context26.stop();
      }
    }
  }, null, this);
};
/**
 * <b><i>Requires login</i></b>
 *
 * Remove the specified listing
 *
 * @methodGroup Listings
 * @namedParams
 * @param {string} listingId - The ID of the listing to remove
 */


exports.RemoveListing = function _callee27(_ref25) {
  var listingId;
  return _regeneratorRuntime.async(function _callee27$(_context27) {
    while (1) {
      switch (_context27.prev = _context27.next) {
        case 0:
          listingId = _ref25.listingId;
          _context27.next = 3;
          return _regeneratorRuntime.awrap(this.client.authClient.MakeAuthServiceRequest({
            path: UrlJoin("as", "wlt", "mkt", listingId),
            method: "DELETE",
            headers: {
              Authorization: "Bearer ".concat(this.AuthToken())
            }
          }));

        case 3:
        case "end":
          return _context27.stop();
      }
    }
  }, null, this);
};
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


exports.ListingNames = function _callee28(_ref26) {
  var marketplaceParams, tenantId;
  return _regeneratorRuntime.async(function _callee28$(_context28) {
    while (1) {
      switch (_context28.prev = _context28.next) {
        case 0:
          marketplaceParams = _ref26.marketplaceParams;

          if (!marketplaceParams) {
            _context28.next = 5;
            break;
          }

          _context28.next = 4;
          return _regeneratorRuntime.awrap(this.MarketplaceInfo({
            marketplaceParams: marketplaceParams
          }));

        case 4:
          tenantId = _context28.sent.tenantId;

        case 5:
          _context28.t0 = _regeneratorRuntime;
          _context28.t1 = Utils;
          _context28.next = 9;
          return _regeneratorRuntime.awrap(this.client.authClient.MakeAuthServiceRequest({
            path: UrlJoin("as", "mkt", "names"),
            method: "GET",
            queryParams: tenantId ? {
              filter: "tenant:eq:".concat(tenantId)
            } : {}
          }));

        case 9:
          _context28.t2 = _context28.sent;
          _context28.t3 = _context28.t1.ResponseToJson.call(_context28.t1, _context28.t2);
          _context28.next = 13;
          return _context28.t0.awrap.call(_context28.t0, _context28.t3);

        case 13:
          return _context28.abrupt("return", _context28.sent);

        case 14:
        case "end":
          return _context28.stop();
      }
    }
  }, null, this);
};
/**
 * Retrieve all valid edition names of the specified item. Full item edition names are required for filtering listing results by edition.
 *
 * @methodGroup Listings
 * @namedParams
 * @param {string} displayName - Display name of the item from which to request edition names
 *
 * @returns {Promise<Array<String>>} - A list of item editions
 */


exports.ListingEditionNames = function _callee29(_ref27) {
  var displayName;
  return _regeneratorRuntime.async(function _callee29$(_context29) {
    while (1) {
      switch (_context29.prev = _context29.next) {
        case 0:
          displayName = _ref27.displayName;
          _context29.t0 = _regeneratorRuntime;
          _context29.t1 = Utils;
          _context29.next = 5;
          return _regeneratorRuntime.awrap(this.client.authClient.MakeAuthServiceRequest({
            path: UrlJoin("as", "mkt", "editions"),
            queryParams: {
              filter: "nft/display_name:eq:".concat(displayName)
            },
            method: "GET"
          }));

        case 5:
          _context29.t2 = _context29.sent;
          _context29.t3 = _context29.t1.ResponseToJson.call(_context29.t1, _context29.t2);
          _context29.next = 9;
          return _context29.t0.awrap.call(_context29.t0, _context29.t3);

        case 9:
          return _context29.abrupt("return", _context29.sent);

        case 10:
        case "end":
          return _context29.stop();
      }
    }
  }, null, this);
};
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


exports.ListingAttributes = function _callee30() {
  var _ref28,
      marketplaceParams,
      displayName,
      filters,
      attributes,
      _args30 = arguments;

  return _regeneratorRuntime.async(function _callee30$(_context30) {
    while (1) {
      switch (_context30.prev = _context30.next) {
        case 0:
          _ref28 = _args30.length > 0 && _args30[0] !== undefined ? _args30[0] : {}, marketplaceParams = _ref28.marketplaceParams, displayName = _ref28.displayName;
          filters = [];

          if (!marketplaceParams) {
            _context30.next = 10;
            break;
          }

          _context30.t0 = filters;
          _context30.t1 = "tenant:eq:";
          _context30.next = 7;
          return _regeneratorRuntime.awrap(this.MarketplaceInfo({
            marketplaceParams: marketplaceParams
          }));

        case 7:
          _context30.t2 = _context30.sent.tenantId;
          _context30.t3 = _context30.t1.concat.call(_context30.t1, _context30.t2);

          _context30.t0.push.call(_context30.t0, _context30.t3);

        case 10:
          if (displayName) {
            filters.push("nft/display_name:eq:".concat(displayName));
          }

          _context30.t4 = _regeneratorRuntime;
          _context30.t5 = Utils;
          _context30.next = 15;
          return _regeneratorRuntime.awrap(this.client.authClient.MakeAuthServiceRequest({
            path: UrlJoin("as", "mkt", "attributes"),
            method: "GET",
            queryParams: {
              filter: filters
            }
          }));

        case 15:
          _context30.t6 = _context30.sent;
          _context30.t7 = _context30.t5.ResponseToJson.call(_context30.t5, _context30.t6);
          _context30.next = 19;
          return _context30.t4.awrap.call(_context30.t4, _context30.t7);

        case 19:
          attributes = _context30.sent;
          return _context30.abrupt("return", attributes.map(function (_ref29) {
            var trait_type = _ref29.trait_type,
                values = _ref29.values;
            return {
              name: trait_type,
              values: values
            };
          }).filter(function (_ref30) {
            var name = _ref30.name;
            return !["Content Fabric Hash", "Total Minted Supply", "Creator"].includes(name);
          }));

        case 21:
        case "end":
          return _context30.stop();
      }
    }
  }, null, this);
};
/* PURCHASE / CLAIM */

/**
 * Claim the specified item from the specified marketplace
 *
 * Use the <a href="#.ClaimStatus">ClaimStatus</a> method to check minting status after claiming
 *
 * @methodGroup Purchase
 * @namedParams
 * @param {Object} marketplaceParams - Parameters of the marketplace
 * @param {string} sku - The SKU of the item to claime
 */


exports.ClaimItem = function _callee31(_ref31) {
  var marketplaceParams, sku, marketplaceInfo;
  return _regeneratorRuntime.async(function _callee31$(_context31) {
    while (1) {
      switch (_context31.prev = _context31.next) {
        case 0:
          marketplaceParams = _ref31.marketplaceParams, sku = _ref31.sku;
          _context31.next = 3;
          return _regeneratorRuntime.awrap(this.MarketplaceInfo({
            marketplaceParams: marketplaceParams
          }));

        case 3:
          marketplaceInfo = _context31.sent;
          _context31.next = 6;
          return _regeneratorRuntime.awrap(this.client.authClient.MakeAuthServiceRequest({
            method: "POST",
            path: UrlJoin("as", "wlt", "act", marketplaceInfo.tenant_id),
            body: {
              op: "nft-claim",
              sid: marketplaceInfo.marketplaceId,
              sku: sku
            },
            headers: {
              Authorization: "Bearer ".concat(this.AuthToken())
            }
          }));

        case 6:
        case "end":
          return _context31.stop();
      }
    }
  }, null, this);
};
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


exports.ListingPurchaseStatus = function _callee32(_ref32) {
  var listingId, confirmationId, listingStatus, statuses;
  return _regeneratorRuntime.async(function _callee32$(_context32) {
    while (1) {
      switch (_context32.prev = _context32.next) {
        case 0:
          listingId = _ref32.listingId, confirmationId = _ref32.confirmationId;
          _context32.prev = 1;
          _context32.next = 4;
          return _regeneratorRuntime.awrap(this.ListingStatus({
            listingId: listingId
          }));

        case 4:
          listingStatus = _context32.sent;

          if (listingStatus) {
            _context32.next = 7;
            break;
          }

          throw Error("Unable to find info for listing " + listingId);

        case 7:
          _context32.next = 9;
          return _regeneratorRuntime.awrap(this.MintingStatus({
            tenantId: listingStatus.tenant
          }));

        case 9:
          statuses = _context32.sent;
          return _context32.abrupt("return", statuses.find(function (status) {
            return status.op === "nft-transfer" && status.extra && status.extra[0] === confirmationId;
          }) || {
            status: "none"
          });

        case 13:
          _context32.prev = 13;
          _context32.t0 = _context32["catch"](1);
          this.Log(_context32.t0, true);
          return _context32.abrupt("return", {
            status: "unknown"
          });

        case 17:
        case "end":
          return _context32.stop();
      }
    }
  }, null, this, [[1, 13]]);
};
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


exports.PurchaseStatus = function _callee33(_ref33) {
  var marketplaceParams, confirmationId, marketplaceInfo, statuses;
  return _regeneratorRuntime.async(function _callee33$(_context33) {
    while (1) {
      switch (_context33.prev = _context33.next) {
        case 0:
          marketplaceParams = _ref33.marketplaceParams, confirmationId = _ref33.confirmationId;
          _context33.prev = 1;
          _context33.next = 4;
          return _regeneratorRuntime.awrap(this.MarketplaceInfo({
            marketplaceParams: marketplaceParams
          }));

        case 4:
          marketplaceInfo = _context33.sent;
          _context33.next = 7;
          return _regeneratorRuntime.awrap(this.MintingStatus({
            tenantId: marketplaceInfo.tenant_id
          }));

        case 7:
          statuses = _context33.sent;
          return _context33.abrupt("return", statuses.find(function (status) {
            return status.op === "nft-buy" && status.confirmationId === confirmationId;
          }) || {
            status: "none"
          });

        case 11:
          _context33.prev = 11;
          _context33.t0 = _context33["catch"](1);
          this.Log(_context33.t0, true);
          return _context33.abrupt("return", {
            status: "unknown"
          });

        case 15:
        case "end":
          return _context33.stop();
      }
    }
  }, null, this, [[1, 11]]);
};
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


exports.ClaimStatus = function _callee34(_ref34) {
  var marketplaceParams, sku, marketplaceInfo, statuses;
  return _regeneratorRuntime.async(function _callee34$(_context34) {
    while (1) {
      switch (_context34.prev = _context34.next) {
        case 0:
          marketplaceParams = _ref34.marketplaceParams, sku = _ref34.sku;
          _context34.prev = 1;
          _context34.next = 4;
          return _regeneratorRuntime.awrap(this.MarketplaceInfo({
            marketplaceParams: marketplaceParams
          }));

        case 4:
          marketplaceInfo = _context34.sent;
          _context34.next = 7;
          return _regeneratorRuntime.awrap(this.MintingStatus({
            tenantId: marketplaceInfo.tenantId
          }));

        case 7:
          statuses = _context34.sent;
          return _context34.abrupt("return", statuses.find(function (status) {
            return status.op === "nft-claim" && status.marketplaceId === marketplaceInfo.marketplaceId && status.confirmationId === sku;
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
  }, null, this, [[1, 11]]);
};
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


exports.PackOpenStatus = function _callee35(_ref35) {
  var contractAddress, tokenId, tenantConfig, statuses;
  return _regeneratorRuntime.async(function _callee35$(_context35) {
    while (1) {
      switch (_context35.prev = _context35.next) {
        case 0:
          contractAddress = _ref35.contractAddress, tokenId = _ref35.tokenId;
          _context35.prev = 1;
          _context35.next = 4;
          return _regeneratorRuntime.awrap(this.TenantConfiguration({
            contractAddress: contractAddress
          }));

        case 4:
          tenantConfig = _context35.sent;
          _context35.next = 7;
          return _regeneratorRuntime.awrap(this.MintingStatus({
            tenantId: tenantConfig.tenant
          }));

        case 7:
          statuses = _context35.sent;
          return _context35.abrupt("return", statuses.find(function (status) {
            return status.op === "nft-open" && Utils.EqualAddress(contractAddress, status.address) && status.tokenId === tokenId;
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
  }, null, this, [[1, 11]]);
};
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


exports.CollectionRedemptionStatus = function _callee36(_ref36) {
  var marketplaceParams, confirmationId, statuses;
  return _regeneratorRuntime.async(function _callee36$(_context36) {
    while (1) {
      switch (_context36.prev = _context36.next) {
        case 0:
          marketplaceParams = _ref36.marketplaceParams, confirmationId = _ref36.confirmationId;
          _context36.prev = 1;
          _context36.next = 4;
          return _regeneratorRuntime.awrap(this.MintingStatus({
            marketplaceParams: marketplaceParams
          }));

        case 4:
          statuses = _context36.sent;
          return _context36.abrupt("return", statuses.find(function (status) {
            return status.op === "nft-redeem" && status.confirmationId === confirmationId;
          }) || {
            status: "none"
          });

        case 8:
          _context36.prev = 8;
          _context36.t0 = _context36["catch"](1);
          this.Log(_context36.t0, true);
          return _context36.abrupt("return", {
            status: "unknown"
          });

        case 12:
        case "end":
          return _context36.stop();
      }
    }
  }, null, this, [[1, 8]]);
};
/* EVENTS */


exports.LoadDrop = function _callee37(_ref37) {
  var _this2 = this;

  var tenantSlug, eventSlug, dropId, mainSiteHash, event, eventId;
  return _regeneratorRuntime.async(function _callee37$(_context37) {
    while (1) {
      switch (_context37.prev = _context37.next) {
        case 0:
          tenantSlug = _ref37.tenantSlug, eventSlug = _ref37.eventSlug, dropId = _ref37.dropId;

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
            _context37.next = 16;
            break;
          }

          _context37.next = 7;
          return _regeneratorRuntime.awrap(this.client.LatestVersionHash({
            objectId: this.mainSiteId
          }));

        case 7:
          mainSiteHash = _context37.sent;
          _context37.next = 10;
          return _regeneratorRuntime.awrap(this.client.ContentObjectMetadata({
            versionHash: mainSiteHash,
            metadataSubtree: UrlJoin("public", "asset_metadata", "tenants", tenantSlug, "sites", eventSlug, "info"),
            resolveLinks: true,
            linkDepthLimit: 2,
            resolveIncludeSource: true,
            produceLinkUrls: true,
            select: [".", "drops"],
            noAuth: true
          }));

        case 10:
          _context37.t0 = _context37.sent;

          if (_context37.t0) {
            _context37.next = 13;
            break;
          }

          _context37.t0 = [];

        case 13:
          event = _context37.t0;
          eventId = Utils.DecodeVersionHash(event["."].source).objectId;
          event.drops.forEach(function (drop) {
            drop = _objectSpread({}, drop, {
              eventId: eventId
            });
            _this2.drops[tenantSlug][eventSlug][drop.uuid] = drop;
            _this2.drops[drop.uuid] = drop;
          });

        case 16:
          return _context37.abrupt("return", this.drops[dropId]);

        case 17:
        case "end":
          return _context37.stop();
      }
    }
  }, null, this);
};

exports.SubmitDropVote = function _callee38(_ref38) {
  var marketplaceParams, eventId, dropId, sku, marketplaceInfo;
  return _regeneratorRuntime.async(function _callee38$(_context38) {
    while (1) {
      switch (_context38.prev = _context38.next) {
        case 0:
          marketplaceParams = _ref38.marketplaceParams, eventId = _ref38.eventId, dropId = _ref38.dropId, sku = _ref38.sku;
          _context38.next = 3;
          return _regeneratorRuntime.awrap(this.MarketplaceInfo({
            marketplaceParams: marketplaceParams
          }));

        case 3:
          marketplaceInfo = _context38.sent;
          _context38.next = 6;
          return _regeneratorRuntime.awrap(this.client.authClient.MakeAuthServiceRequest({
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
          }));

        case 6:
        case "end":
          return _context38.stop();
      }
    }
  }, null, this);
};

exports.DropStatus = function _callee39(_ref39) {
  var marketplace, eventId, dropId, response;
  return _regeneratorRuntime.async(function _callee39$(_context39) {
    while (1) {
      switch (_context39.prev = _context39.next) {
        case 0:
          marketplace = _ref39.marketplace, eventId = _ref39.eventId, dropId = _ref39.dropId;
          _context39.prev = 1;
          _context39.next = 4;
          return _regeneratorRuntime.awrap(Utils.ResponseToJson(this.client.authClient.MakeAuthServiceRequest({
            path: UrlJoin("as", "wlt", "act", marketplace.tenant_id, eventId, dropId),
            method: "GET",
            headers: {
              Authorization: "Bearer ".concat(this.AuthToken())
            }
          })));

        case 4:
          response = _context39.sent;
          return _context39.abrupt("return", response.sort(function (a, b) {
            return a.ts > b.ts ? 1 : -1;
          })[0] || {
            status: "none"
          });

        case 8:
          _context39.prev = 8;
          _context39.t0 = _context39["catch"](1);
          this.Log(_context39.t0, true);
          return _context39.abrupt("return", "");

        case 12:
        case "end":
          return _context39.stop();
      }
    }
  }, null, this, [[1, 8]]);
};