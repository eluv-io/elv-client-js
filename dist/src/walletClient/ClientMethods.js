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
          availableWalletBalance = Math.max(0, this.totalWalletBalance - parseFloat(usage_hold || 0));
          pendingWalletBalance = Math.max(0, this.totalWalletBalance - this.availableWalletBalance);
          withdrawableWalletBalance = Math.max(0, this.totalWalletBalance - parseFloat(payout_hold || 0));

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
 * <b><i>Requires login</i></b>
 *
 * Returns basic contract info about the items the current user owns, organized by contract address + token ID
 *
 * This method is significantly faster than <a href="#.UserItems">UserItems</a>, but does not include any NFT metadata.
 *
 * @methodGroup User
 *
 * @returns {Promise<Object>} - Basic info about all owned items.
 */


exports.UserItemInfo = function _callee2() {
  var _this = this;

  var accountId, nftInfo;
  return _regeneratorRuntime.async(function _callee2$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          if (this.loggedIn) {
            _context2.next = 2;
            break;
          }

          return _context2.abrupt("return", {});

        case 2:
          accountId = "iusr".concat(Utils.AddressToHash(this.UserAddress()));
          _context2.next = 5;
          return _regeneratorRuntime.awrap(this.client.ethClient.MakeProviderCall({
            methodName: "send",
            args: ["elv_getAccountProfile", [this.client.contentSpaceId, accountId]]
          }));

        case 5:
          this.profileData = _context2.sent;

          if (!(!this.profileData || !this.profileData.NFTs)) {
            _context2.next = 8;
            break;
          }

          return _context2.abrupt("return", {});

        case 8:
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

        case 12:
        case "end":
          return _context2.stop();
      }
    }
  }, null, this);
};
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
 * @param {integer=} collectionIndex - If filtering by marketplace, filter by collection. The index refers to the index in the array `marketplace.collections`
 *
 * @returns {Promise<Object>} - Results of the query and pagination info
 */


exports.UserItems = function _callee3() {
  var _args3 = arguments;
  return _regeneratorRuntime.async(function _callee3$(_context3) {
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
  }, null, this);
};
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


exports.UserListings = function _callee4() {
  var _ref2,
      _ref2$sortBy,
      sortBy,
      _ref2$sortDesc,
      sortDesc,
      contractAddress,
      tokenId,
      marketplaceParams,
      _args4 = arguments;

  return _regeneratorRuntime.async(function _callee4$(_context4) {
    while (1) {
      switch (_context4.prev = _context4.next) {
        case 0:
          _ref2 = _args4.length > 0 && _args4[0] !== undefined ? _args4[0] : {}, _ref2$sortBy = _ref2.sortBy, sortBy = _ref2$sortBy === void 0 ? "created" : _ref2$sortBy, _ref2$sortDesc = _ref2.sortDesc, sortDesc = _ref2$sortDesc === void 0 ? false : _ref2$sortDesc, contractAddress = _ref2.contractAddress, tokenId = _ref2.tokenId, marketplaceParams = _ref2.marketplaceParams;
          _context4.next = 3;
          return _regeneratorRuntime.awrap(this.FilteredQuery({
            mode: "listings",
            start: 0,
            limit: 10000,
            sortBy: sortBy,
            sortDesc: sortDesc,
            sellerAddress: this.UserAddress(),
            marketplaceParams: marketplaceParams,
            contractAddress: contractAddress,
            tokenId: tokenId
          }));

        case 3:
          return _context4.abrupt("return", _context4.sent.results);

        case 4:
        case "end":
          return _context4.stop();
      }
    }
  }, null, this);
};
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


exports.UserSales = function _callee5() {
  var _ref3,
      _ref3$sortBy,
      sortBy,
      _ref3$sortDesc,
      sortDesc,
      contractAddress,
      tokenId,
      marketplaceParams,
      _args5 = arguments;

  return _regeneratorRuntime.async(function _callee5$(_context5) {
    while (1) {
      switch (_context5.prev = _context5.next) {
        case 0:
          _ref3 = _args5.length > 0 && _args5[0] !== undefined ? _args5[0] : {}, _ref3$sortBy = _ref3.sortBy, sortBy = _ref3$sortBy === void 0 ? "created" : _ref3$sortBy, _ref3$sortDesc = _ref3.sortDesc, sortDesc = _ref3$sortDesc === void 0 ? false : _ref3$sortDesc, contractAddress = _ref3.contractAddress, tokenId = _ref3.tokenId, marketplaceParams = _ref3.marketplaceParams;
          _context5.next = 3;
          return _regeneratorRuntime.awrap(this.FilteredQuery({
            mode: "sales",
            start: 0,
            limit: 10000,
            sortBy: sortBy,
            sortDesc: sortDesc,
            sellerAddress: this.UserAddress(),
            marketplaceParams: marketplaceParams,
            contractAddress: contractAddress,
            tokenId: tokenId
          }));

        case 3:
          return _context5.abrupt("return", _context5.sent.results);

        case 4:
        case "end":
          return _context5.stop();
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
 * @returns {Promise<{Object}>} - The tenant configuration
 */


exports.TenantConfiguration = function _callee6(_ref4) {
  var tenantId, contractAddress;
  return _regeneratorRuntime.async(function _callee6$(_context6) {
    while (1) {
      switch (_context6.prev = _context6.next) {
        case 0:
          tenantId = _ref4.tenantId, contractAddress = _ref4.contractAddress;
          _context6.prev = 1;
          _context6.next = 4;
          return _regeneratorRuntime.awrap(this.utils.ResponseToJson(this.client.authClient.MakeAuthServiceRequest({
            path: contractAddress ? UrlJoin("as", "config", "nft", contractAddress) : UrlJoin("as", "config", "tnt", tenantId),
            method: "GET"
          })));

        case 4:
          return _context6.abrupt("return", _context6.sent);

        case 7:
          _context6.prev = 7;
          _context6.t0 = _context6["catch"](1);
          this.Log("Failed to load tenant configuration", true);
          this.Log(_context6.t0, true);
          return _context6.abrupt("return", {});

        case 12:
        case "end":
          return _context6.stop();
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


exports.MarketplaceStock = function _callee7(_ref5) {
  var marketplaceParams, tenantId, marketplaceInfo;
  return _regeneratorRuntime.async(function _callee7$(_context7) {
    while (1) {
      switch (_context7.prev = _context7.next) {
        case 0:
          marketplaceParams = _ref5.marketplaceParams, tenantId = _ref5.tenantId;

          if (!tenantId) {
            marketplaceInfo = this.MarketplaceInfo({
              marketplaceParams: marketplaceParams
            });
            tenantId = marketplaceInfo.tenantId;
          }

          if (!this.loggedIn) {
            _context7.next = 6;
            break;
          }

          _context7.next = 5;
          return _regeneratorRuntime.awrap(Utils.ResponseToJson(this.client.authClient.MakeAuthServiceRequest({
            path: UrlJoin("as", "wlt", "nft", "info", tenantId),
            method: "GET",
            headers: {
              Authorization: "Bearer ".concat(this.AuthToken())
            }
          })));

        case 5:
          return _context7.abrupt("return", _context7.sent);

        case 6:
          _context7.next = 8;
          return _regeneratorRuntime.awrap(Utils.ResponseToJson(this.client.authClient.MakeAuthServiceRequest({
            path: UrlJoin("as", "nft", "stock", tenantId),
            method: "GET"
          })));

        case 8:
          return _context7.abrupt("return", _context7.sent);

        case 9:
        case "end":
          return _context7.stop();
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


exports.MarketplaceInfo = function (_ref6) {
  var marketplaceParams = _ref6.marketplaceParams;

  var _ref7 = marketplaceParams || {},
      tenantSlug = _ref7.tenantSlug,
      marketplaceSlug = _ref7.marketplaceSlug,
      marketplaceId = _ref7.marketplaceId,
      marketplaceHash = _ref7.marketplaceHash;

  var marketplaceInfo;

  if (tenantSlug && marketplaceSlug) {
    marketplaceInfo = (this.availableMarketplaces[tenantSlug] || {})[marketplaceSlug];
  } else {
    marketplaceInfo = this.availableMarketplacesById[marketplaceId || this.client.utils.DecodeVersionHash(marketplaceHash).objectId];
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


exports.MarketplaceCSS = function _callee8(_ref8) {
  var marketplaceParams, marketplaceInfo, marketplaceHash;
  return _regeneratorRuntime.async(function _callee8$(_context8) {
    while (1) {
      switch (_context8.prev = _context8.next) {
        case 0:
          marketplaceParams = _ref8.marketplaceParams;
          marketplaceInfo = this.MarketplaceInfo({
            marketplaceParams: marketplaceParams
          });
          marketplaceHash = marketplaceInfo.marketplaceHash;

          if (this.cachedCSS[marketplaceHash]) {
            _context8.next = 7;
            break;
          }

          _context8.next = 6;
          return _regeneratorRuntime.awrap(this.client.ContentObjectMetadata({
            versionHash: marketplaceHash,
            metadataSubtree: "public/asset_metadata/info/branding/custom_css",
            authorizationToken: this.publicStaticToken,
            noAuth: true
          }));

        case 6:
          this.cachedCSS[marketplaceHash] = _context8.sent;

        case 7:
          return _context8.abrupt("return", this.cachedCSS[marketplaceHash] || "");

        case 8:
        case "end":
          return _context8.stop();
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
 * @returns {Promise<{Object}>} - Info about available marketplaces
 */


exports.AvailableMarketplaces = function _callee9() {
  var _ref9,
      organizeById,
      _ref9$forceReload,
      forceReload,
      _args9 = arguments;

  return _regeneratorRuntime.async(function _callee9$(_context9) {
    while (1) {
      switch (_context9.prev = _context9.next) {
        case 0:
          _ref9 = _args9.length > 0 && _args9[0] !== undefined ? _args9[0] : {}, organizeById = _ref9.organizeById, _ref9$forceReload = _ref9.forceReload, forceReload = _ref9$forceReload === void 0 ? false : _ref9$forceReload;

          if (!forceReload) {
            _context9.next = 4;
            break;
          }

          _context9.next = 4;
          return _regeneratorRuntime.awrap(this.LoadAvailableMarketplaces(true));

        case 4:
          return _context9.abrupt("return", _objectSpread({}, organizeById ? this.availableMarketplacesById : this.availableMarketplaces));

        case 5:
        case "end":
          return _context9.stop();
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


exports.Marketplace = function _callee10(_ref10) {
  var marketplaceParams;
  return _regeneratorRuntime.async(function _callee10$(_context10) {
    while (1) {
      switch (_context10.prev = _context10.next) {
        case 0:
          marketplaceParams = _ref10.marketplaceParams;
          return _context10.abrupt("return", this.LoadMarketplace(marketplaceParams));

        case 2:
        case "end":
          return _context10.stop();
      }
    }
  }, null, this);
};
/* NFTS */

/**
 * Load full info for the specified NFT
 *
 * @methodGroup Items
 * @namedParams
 * @param {string} contractAddress - The contract address of the NFT
 * @param {string} tokenId - The token ID of the NFT
 */


exports.NFT = function _callee11(_ref11) {
  var tokenId, contractAddress, nft;
  return _regeneratorRuntime.async(function _callee11$(_context11) {
    while (1) {
      switch (_context11.prev = _context11.next) {
        case 0:
          tokenId = _ref11.tokenId, contractAddress = _ref11.contractAddress;
          _context11.t0 = FormatNFTDetails;
          _context11.next = 4;
          return _regeneratorRuntime.awrap(Utils.ResponseToJson(this.client.authClient.MakeAuthServiceRequest({
            path: UrlJoin("as", "nft", "info", contractAddress, tokenId),
            method: "GET"
          })));

        case 4:
          _context11.t1 = _context11.sent;
          nft = (0, _context11.t0)(_context11.t1);
          _context11.t2 = _objectSpread;
          _context11.t3 = {};
          _context11.next = 10;
          return _regeneratorRuntime.awrap(this.client.ContentObjectMetadata({
            versionHash: nft.details.VersionHash,
            metadataSubtree: "public/asset_metadata/nft",
            produceLinkUrls: true
          }));

        case 10:
          _context11.t4 = _context11.sent;

          if (_context11.t4) {
            _context11.next = 13;
            break;
          }

          _context11.t4 = {};

        case 13:
          _context11.t5 = _context11.t4;
          _context11.t6 = {};
          _context11.t7 = nft.metadata || {};
          nft.metadata = (0, _context11.t2)(_context11.t3, _context11.t5, _context11.t6, _context11.t7);
          _context11.next = 19;
          return _regeneratorRuntime.awrap(this.TenantConfiguration({
            contractAddress: contractAddress
          }));

        case 19:
          nft.config = _context11.sent;
          return _context11.abrupt("return", FormatNFTMetadata(nft));

        case 21:
        case "end":
          return _context11.stop();
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


exports.ListingStatus = function _callee12(_ref12) {
  var listingId;
  return _regeneratorRuntime.async(function _callee12$(_context12) {
    while (1) {
      switch (_context12.prev = _context12.next) {
        case 0:
          listingId = _ref12.listingId;
          _context12.prev = 1;
          _context12.t0 = _regeneratorRuntime;
          _context12.t1 = Utils;
          _context12.next = 6;
          return _regeneratorRuntime.awrap(this.client.authClient.MakeAuthServiceRequest({
            path: UrlJoin("as", "mkt", "status", listingId),
            method: "GET"
          }));

        case 6:
          _context12.t2 = _context12.sent;
          _context12.t3 = _context12.t1.ResponseToJson.call(_context12.t1, _context12.t2);
          _context12.next = 10;
          return _context12.t0.awrap.call(_context12.t0, _context12.t3);

        case 10:
          return _context12.abrupt("return", _context12.sent);

        case 13:
          _context12.prev = 13;
          _context12.t4 = _context12["catch"](1);

          if (!(_context12.t4.status === 404)) {
            _context12.next = 17;
            break;
          }

          return _context12.abrupt("return");

        case 17:
          throw _context12.t4;

        case 18:
        case "end":
          return _context12.stop();
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


exports.Listing = function _callee13(_ref13) {
  var listingId;
  return _regeneratorRuntime.async(function _callee13$(_context13) {
    while (1) {
      switch (_context13.prev = _context13.next) {
        case 0:
          listingId = _ref13.listingId;
          _context13.t0 = FormatNFT;
          _context13.t1 = _regeneratorRuntime;
          _context13.t2 = Utils;
          _context13.next = 6;
          return _regeneratorRuntime.awrap(this.client.authClient.MakeAuthServiceRequest({
            path: UrlJoin("as", "mkt", "l", listingId),
            method: "GET"
          }));

        case 6:
          _context13.t3 = _context13.sent;
          _context13.t4 = _context13.t2.ResponseToJson.call(_context13.t2, _context13.t3);
          _context13.next = 10;
          return _context13.t1.awrap.call(_context13.t1, _context13.t4);

        case 10:
          _context13.t5 = _context13.sent;
          return _context13.abrupt("return", (0, _context13.t0)(_context13.t5));

        case 12:
        case "end":
          return _context13.stop();
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
 *  @param {string=} editionFilter - Filter results by item edition.
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
 * @param {integer=} collectionIndex - If filtering by marketplace, filter by collection. The index refers to the index in the array `marketplace.collections`
 * @param {integer=} lastNDays - Filter by results listed in the past N days
 *
 * @returns {Promise<Object>} - Results of the query and pagination info
 */


exports.Listings = function _callee14() {
  var _args14 = arguments;
  return _regeneratorRuntime.async(function _callee14$(_context14) {
    while (1) {
      switch (_context14.prev = _context14.next) {
        case 0:
          return _context14.abrupt("return", this.FilteredQuery(_objectSpread({
            mode: "listings"
          }, _args14[0] || {})));

        case 1:
        case "end":
          return _context14.stop();
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
 *  @param {string=} editionFilter - Filter results by item edition.
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
 * @param {integer=} collectionIndex - If filtering by marketplace, filter by collection. The index refers to the index in the array `marketplace.collections`
 * @param {integer=} lastNDays - Filter by results listed in the past N days
 *
 * @returns {Promise<Object>} - Statistics about listings. All prices in USD.
 */


exports.ListingStats = function _callee15() {
  var _args15 = arguments;
  return _regeneratorRuntime.async(function _callee15$(_context15) {
    while (1) {
      switch (_context15.prev = _context15.next) {
        case 0:
          return _context15.abrupt("return", this.FilteredQuery(_objectSpread({
            mode: "listing-stats"
          }, _args15[0] || {})));

        case 1:
        case "end":
          return _context15.stop();
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
 *  @param {string=} editionFilter - Filter results by item edition.
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
 * @param {integer=} collectionIndex - If filtering by marketplace, filter by collection. The index refers to the index in the array `marketplace.collections`
 * @param {integer=} lastNDays - Filter by results listed in the past N days
 *
 * @returns {Promise<Object>} - Results of the query and pagination info
 */


exports.Sales = function _callee16() {
  var _args16 = arguments;
  return _regeneratorRuntime.async(function _callee16$(_context16) {
    while (1) {
      switch (_context16.prev = _context16.next) {
        case 0:
          return _context16.abrupt("return", this.FilteredQuery(_objectSpread({
            mode: "sales"
          }, _args16[0] || {})));

        case 1:
        case "end":
          return _context16.stop();
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
 *  @param {string=} editionFilter - Filter results by item edition.
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
 * @param {integer=} collectionIndex - If filtering by marketplace, filter by collection. The index refers to the index in the array `marketplace.collections`
 * @param {integer=} lastNDays - Filter by results listed in the past N days
 *
 * @returns {Promise<Object>} - Statistics about sales. All prices in USD.
 */


exports.SalesStats = function _callee17() {
  var _args17 = arguments;
  return _regeneratorRuntime.async(function _callee17$(_context17) {
    while (1) {
      switch (_context17.prev = _context17.next) {
        case 0:
          return _context17.abrupt("return", this.FilteredQuery(_objectSpread({
            mode: "sales-stats"
          }, _args17[0] || {})));

        case 1:
        case "end":
          return _context17.stop();
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


exports.CreateListing = function _callee18(_ref14) {
  var contractAddress, tokenId, price, listingId;
  return _regeneratorRuntime.async(function _callee18$(_context18) {
    while (1) {
      switch (_context18.prev = _context18.next) {
        case 0:
          contractAddress = _ref14.contractAddress, tokenId = _ref14.tokenId, price = _ref14.price, listingId = _ref14.listingId;
          contractAddress = Utils.FormatAddress(contractAddress);

          if (!listingId) {
            _context18.next = 14;
            break;
          }

          _context18.t0 = _regeneratorRuntime;
          _context18.t1 = Utils;
          _context18.next = 7;
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
          _context18.t2 = _context18.sent;
          _context18.t3 = _context18.t1.ResponseToFormat.call(_context18.t1, "text", _context18.t2);
          _context18.next = 11;
          return _context18.t0.awrap.call(_context18.t0, _context18.t3);

        case 11:
          return _context18.abrupt("return", _context18.sent);

        case 14:
          _context18.t4 = _regeneratorRuntime;
          _context18.t5 = Utils;
          _context18.next = 18;
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
          _context18.t6 = _context18.sent;
          _context18.t7 = _context18.t5.ResponseToJson.call(_context18.t5, _context18.t6);
          _context18.next = 22;
          return _context18.t4.awrap.call(_context18.t4, _context18.t7);

        case 22:
          return _context18.abrupt("return", _context18.sent);

        case 23:
        case "end":
          return _context18.stop();
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


exports.RemoveListing = function _callee19(_ref15) {
  var listingId;
  return _regeneratorRuntime.async(function _callee19$(_context19) {
    while (1) {
      switch (_context19.prev = _context19.next) {
        case 0:
          listingId = _ref15.listingId;
          _context19.next = 3;
          return _regeneratorRuntime.awrap(this.client.authClient.MakeAuthServiceRequest({
            path: UrlJoin("as", "wlt", "mkt", listingId),
            method: "DELETE",
            headers: {
              Authorization: "Bearer ".concat(this.AuthToken())
            }
          }));

        case 3:
        case "end":
          return _context19.stop();
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


exports.ListingNames = function _callee20(_ref16) {
  var marketplaceParams, tenantId;
  return _regeneratorRuntime.async(function _callee20$(_context20) {
    while (1) {
      switch (_context20.prev = _context20.next) {
        case 0:
          marketplaceParams = _ref16.marketplaceParams;

          if (!marketplaceParams) {
            _context20.next = 5;
            break;
          }

          _context20.next = 4;
          return _regeneratorRuntime.awrap(this.MarketplaceInfo({
            marketplaceParams: marketplaceParams
          }));

        case 4:
          tenantId = _context20.sent.tenantId;

        case 5:
          _context20.t0 = _regeneratorRuntime;
          _context20.t1 = Utils;
          _context20.next = 9;
          return _regeneratorRuntime.awrap(this.client.authClient.MakeAuthServiceRequest({
            path: UrlJoin("as", "mkt", "names"),
            method: "GET",
            queryParams: tenantId ? {
              filter: "tenant:eq:".concat(tenantId)
            } : {}
          }));

        case 9:
          _context20.t2 = _context20.sent;
          _context20.t3 = _context20.t1.ResponseToJson.call(_context20.t1, _context20.t2);
          _context20.next = 13;
          return _context20.t0.awrap.call(_context20.t0, _context20.t3);

        case 13:
          return _context20.abrupt("return", _context20.sent);

        case 14:
        case "end":
          return _context20.stop();
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


exports.ListingEditionNames = function _callee21(_ref17) {
  var displayName;
  return _regeneratorRuntime.async(function _callee21$(_context21) {
    while (1) {
      switch (_context21.prev = _context21.next) {
        case 0:
          displayName = _ref17.displayName;
          _context21.t0 = _regeneratorRuntime;
          _context21.t1 = Utils;
          _context21.next = 5;
          return _regeneratorRuntime.awrap(this.client.authClient.MakeAuthServiceRequest({
            path: UrlJoin("as", "mkt", "editions"),
            queryParams: {
              filter: "nft/display_name:eq:".concat(displayName)
            },
            method: "GET"
          }));

        case 5:
          _context21.t2 = _context21.sent;
          _context21.t3 = _context21.t1.ResponseToJson.call(_context21.t1, _context21.t2);
          _context21.next = 9;
          return _context21.t0.awrap.call(_context21.t0, _context21.t3);

        case 9:
          return _context21.abrupt("return", _context21.sent);

        case 10:
        case "end":
          return _context21.stop();
      }
    }
  }, null, this);
};
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


exports.ListingAttributes = function _callee22() {
  var _ref18,
      marketplaceParams,
      displayName,
      filters,
      attributes,
      _args22 = arguments;

  return _regeneratorRuntime.async(function _callee22$(_context22) {
    while (1) {
      switch (_context22.prev = _context22.next) {
        case 0:
          _ref18 = _args22.length > 0 && _args22[0] !== undefined ? _args22[0] : {}, marketplaceParams = _ref18.marketplaceParams, displayName = _ref18.displayName;
          filters = [];

          if (!marketplaceParams) {
            _context22.next = 10;
            break;
          }

          _context22.t0 = filters;
          _context22.t1 = "tenant:eq:";
          _context22.next = 7;
          return _regeneratorRuntime.awrap(this.MarketplaceInfo({
            marketplaceParams: marketplaceParams
          }));

        case 7:
          _context22.t2 = _context22.sent.tenantId;
          _context22.t3 = _context22.t1.concat.call(_context22.t1, _context22.t2);

          _context22.t0.push.call(_context22.t0, _context22.t3);

        case 10:
          if (displayName) {
            filters.push("nft/display_name:eq:".concat(displayName));
          }

          _context22.t4 = _regeneratorRuntime;
          _context22.t5 = Utils;
          _context22.next = 15;
          return _regeneratorRuntime.awrap(this.client.authClient.MakeAuthServiceRequest({
            path: UrlJoin("as", "mkt", "attributes"),
            method: "GET",
            queryParams: {
              filter: filters
            }
          }));

        case 15:
          _context22.t6 = _context22.sent;
          _context22.t7 = _context22.t5.ResponseToJson.call(_context22.t5, _context22.t6);
          _context22.next = 19;
          return _context22.t4.awrap.call(_context22.t4, _context22.t7);

        case 19:
          attributes = _context22.sent;
          return _context22.abrupt("return", attributes.map(function (_ref19) {
            var trait_type = _ref19.trait_type,
                values = _ref19.values;
            return {
              name: trait_type,
              values: values
            };
          }).filter(function (_ref20) {
            var name = _ref20.name;
            return !["Content Fabric Hash", "Total Minted Supply", "Creator"].includes(name);
          }));

        case 21:
        case "end":
          return _context22.stop();
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


exports.ListingPurchaseStatus = function _callee23(_ref21) {
  var listingId, confirmationId, listingStatus, statuses;
  return _regeneratorRuntime.async(function _callee23$(_context23) {
    while (1) {
      switch (_context23.prev = _context23.next) {
        case 0:
          listingId = _ref21.listingId, confirmationId = _ref21.confirmationId;
          _context23.prev = 1;
          _context23.next = 4;
          return _regeneratorRuntime.awrap(this.ListingStatus({
            listingId: listingId
          }));

        case 4:
          listingStatus = _context23.sent;

          if (listingStatus) {
            _context23.next = 7;
            break;
          }

          throw Error("Unable to find info for listing " + listingId);

        case 7:
          _context23.next = 9;
          return _regeneratorRuntime.awrap(this.MintingStatus({
            tenantId: listingStatus.tenant
          }));

        case 9:
          statuses = _context23.sent;
          return _context23.abrupt("return", statuses.find(function (status) {
            return status.op === "nft-transfer" && status.extra && status.extra[0] === confirmationId;
          }) || {
            status: "none"
          });

        case 13:
          _context23.prev = 13;
          _context23.t0 = _context23["catch"](1);
          this.Log(_context23.t0, true);
          return _context23.abrupt("return", {
            status: "unknown"
          });

        case 17:
        case "end":
          return _context23.stop();
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


exports.PurchaseStatus = function _callee24(_ref22) {
  var marketplaceParams, confirmationId, marketplaceInfo, statuses;
  return _regeneratorRuntime.async(function _callee24$(_context24) {
    while (1) {
      switch (_context24.prev = _context24.next) {
        case 0:
          marketplaceParams = _ref22.marketplaceParams, confirmationId = _ref22.confirmationId;
          _context24.prev = 1;
          _context24.next = 4;
          return _regeneratorRuntime.awrap(this.MarketplaceInfo({
            marketplaceParams: marketplaceParams
          }));

        case 4:
          marketplaceInfo = _context24.sent;
          _context24.next = 7;
          return _regeneratorRuntime.awrap(this.MintingStatus({
            tenantId: marketplaceInfo.tenant_id
          }));

        case 7:
          statuses = _context24.sent;
          return _context24.abrupt("return", statuses.find(function (status) {
            return status.op === "nft-buy" && status.confirmationId === confirmationId;
          }) || {
            status: "none"
          });

        case 11:
          _context24.prev = 11;
          _context24.t0 = _context24["catch"](1);
          this.Log(_context24.t0, true);
          return _context24.abrupt("return", {
            status: "unknown"
          });

        case 15:
        case "end":
          return _context24.stop();
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


exports.ClaimStatus = function _callee25(_ref23) {
  var marketplaceParams, sku, marketplaceInfo, statuses;
  return _regeneratorRuntime.async(function _callee25$(_context25) {
    while (1) {
      switch (_context25.prev = _context25.next) {
        case 0:
          marketplaceParams = _ref23.marketplaceParams, sku = _ref23.sku;
          _context25.prev = 1;
          _context25.next = 4;
          return _regeneratorRuntime.awrap(this.MarketplaceInfo({
            marketplaceParams: marketplaceParams
          }));

        case 4:
          marketplaceInfo = _context25.sent;
          _context25.next = 7;
          return _regeneratorRuntime.awrap(this.MintingStatus({
            tenantId: marketplaceInfo.tenantId
          }));

        case 7:
          statuses = _context25.sent;
          return _context25.abrupt("return", statuses.find(function (status) {
            return status.op === "nft-claim" && status.marketplaceId === marketplaceInfo.marketplaceId && status.confirmationId === sku;
          }) || {
            status: "none"
          });

        case 11:
          _context25.prev = 11;
          _context25.t0 = _context25["catch"](1);
          this.Log(_context25.t0, true);
          return _context25.abrupt("return", {
            status: "unknown"
          });

        case 15:
        case "end":
          return _context25.stop();
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


exports.PackOpenStatus = function _callee26(_ref24) {
  var contractAddress, tokenId, tenantConfig, statuses;
  return _regeneratorRuntime.async(function _callee26$(_context26) {
    while (1) {
      switch (_context26.prev = _context26.next) {
        case 0:
          contractAddress = _ref24.contractAddress, tokenId = _ref24.tokenId;
          _context26.prev = 1;
          _context26.next = 4;
          return _regeneratorRuntime.awrap(this.TenantConfiguration({
            contractAddress: contractAddress
          }));

        case 4:
          tenantConfig = _context26.sent;
          _context26.next = 7;
          return _regeneratorRuntime.awrap(this.MintingStatus({
            tenantId: tenantConfig.tenant
          }));

        case 7:
          statuses = _context26.sent;
          return _context26.abrupt("return", statuses.find(function (status) {
            return status.op === "nft-open" && Utils.EqualAddress(contractAddress, status.address) && status.tokenId === tokenId;
          }) || {
            status: "none"
          });

        case 11:
          _context26.prev = 11;
          _context26.t0 = _context26["catch"](1);
          this.Log(_context26.t0, true);
          return _context26.abrupt("return", {
            status: "unknown"
          });

        case 15:
        case "end":
          return _context26.stop();
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


exports.CollectionRedemptionStatus = function _callee27(_ref25) {
  var marketplaceParams, confirmationId, statuses;
  return _regeneratorRuntime.async(function _callee27$(_context27) {
    while (1) {
      switch (_context27.prev = _context27.next) {
        case 0:
          marketplaceParams = _ref25.marketplaceParams, confirmationId = _ref25.confirmationId;
          _context27.prev = 1;
          _context27.next = 4;
          return _regeneratorRuntime.awrap(this.MintingStatus({
            marketplaceParams: marketplaceParams
          }));

        case 4:
          statuses = _context27.sent;
          return _context27.abrupt("return", statuses.find(function (status) {
            return status.op === "nft-redeem" && status.confirmationId === confirmationId;
          }) || {
            status: "none"
          });

        case 8:
          _context27.prev = 8;
          _context27.t0 = _context27["catch"](1);
          this.Log(_context27.t0, true);
          return _context27.abrupt("return", {
            status: "unknown"
          });

        case 12:
        case "end":
          return _context27.stop();
      }
    }
  }, null, this, [[1, 8]]);
};
/* EVENTS */


exports.LoadDrop = function _callee28(_ref26) {
  var _this2 = this;

  var tenantSlug, eventSlug, dropId, mainSiteHash, event, eventId;
  return _regeneratorRuntime.async(function _callee28$(_context28) {
    while (1) {
      switch (_context28.prev = _context28.next) {
        case 0:
          tenantSlug = _ref26.tenantSlug, eventSlug = _ref26.eventSlug, dropId = _ref26.dropId;

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
            _context28.next = 16;
            break;
          }

          _context28.next = 7;
          return _regeneratorRuntime.awrap(this.client.LatestVersionHash({
            objectId: this.mainSiteId
          }));

        case 7:
          mainSiteHash = _context28.sent;
          _context28.next = 10;
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
          _context28.t0 = _context28.sent;

          if (_context28.t0) {
            _context28.next = 13;
            break;
          }

          _context28.t0 = [];

        case 13:
          event = _context28.t0;
          eventId = Utils.DecodeVersionHash(event["."].source).objectId;
          event.drops.forEach(function (drop) {
            drop = _objectSpread({}, drop, {
              eventId: eventId
            });
            _this2.drops[tenantSlug][eventSlug][drop.uuid] = drop;
            _this2.drops[drop.uuid] = drop;
          });

        case 16:
          return _context28.abrupt("return", this.drops[dropId]);

        case 17:
        case "end":
          return _context28.stop();
      }
    }
  }, null, this);
};

exports.SubmitDropVote = function _callee29(_ref27) {
  var marketplaceParams, eventId, dropId, sku, marketplaceInfo;
  return _regeneratorRuntime.async(function _callee29$(_context29) {
    while (1) {
      switch (_context29.prev = _context29.next) {
        case 0:
          marketplaceParams = _ref27.marketplaceParams, eventId = _ref27.eventId, dropId = _ref27.dropId, sku = _ref27.sku;
          _context29.next = 3;
          return _regeneratorRuntime.awrap(this.MarketplaceInfo({
            marketplaceParams: marketplaceParams
          }));

        case 3:
          marketplaceInfo = _context29.sent;
          _context29.next = 6;
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
          return _context29.stop();
      }
    }
  }, null, this);
};

exports.DropStatus = function _callee30(_ref28) {
  var marketplace, eventId, dropId, response;
  return _regeneratorRuntime.async(function _callee30$(_context30) {
    while (1) {
      switch (_context30.prev = _context30.next) {
        case 0:
          marketplace = _ref28.marketplace, eventId = _ref28.eventId, dropId = _ref28.dropId;
          _context30.prev = 1;
          _context30.next = 4;
          return _regeneratorRuntime.awrap(Utils.ResponseToJson(this.client.authClient.MakeAuthServiceRequest({
            path: UrlJoin("as", "wlt", "act", marketplace.tenant_id, eventId, dropId),
            method: "GET",
            headers: {
              Authorization: "Bearer ".concat(this.AuthToken())
            }
          })));

        case 4:
          response = _context30.sent;
          return _context30.abrupt("return", response.sort(function (a, b) {
            return a.ts > b.ts ? 1 : -1;
          })[0] || {
            status: "none"
          });

        case 8:
          _context30.prev = 8;
          _context30.t0 = _context30["catch"](1);
          this.Log(_context30.t0, true);
          return _context30.abrupt("return", "");

        case 12:
        case "end":
          return _context30.stop();
      }
    }
  }, null, this, [[1, 8]]);
};