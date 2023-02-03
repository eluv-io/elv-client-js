var _regeneratorRuntime = require("@babel/runtime/regenerator");
var _asyncToGenerator = require("@babel/runtime/helpers/asyncToGenerator");
var _defineProperty = require("@babel/runtime/helpers/defineProperty");
var _slicedToArray = require("@babel/runtime/helpers/slicedToArray");
function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }
function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }
var Utils = require("../Utils");
var RarityToPercentage = function RarityToPercentage(rarity) {
  if (!rarity) {
    return "";
  }
  rarity = rarity.toString();
  if (!rarity.includes("/")) {
    return rarity;
  }
  var _rarity$split = rarity.split("/"),
    _rarity$split2 = _slicedToArray(_rarity$split, 2),
    numerator = _rarity$split2[0],
    denominator = _rarity$split2[1];
  var percentage = 100 * parseInt(numerator) / parseInt(denominator);
  if (percentage < 1) {
    percentage = percentage.toFixed(2);
  } else {
    percentage = percentage.toFixed(1).toString().replace(".0", "");
  }
  return percentage;
};
var LinkTargetHash = function LinkTargetHash(link) {
  if (!link) {
    return;
  }
  if (link["."] && link["."].source) {
    return link["."].source;
  }
  if (link["/"] && link["/"].startsWith("/qfab/")) {
    return link["/"].split("/").find(function (segment) {
      return segment.startsWith("hq__");
    });
  }
  if (link["."] && link["."].container) {
    return link["."].container;
  }
};
exports.LinkTargetHash = LinkTargetHash;

// Format NFT or listing result into consistent format
var FormatNFTDetails = function FormatNFTDetails(entry) {
  var isListing = !!entry.id;
  var metadata = (isListing ? entry.nft : entry.meta) || {};
  var info = isListing ? entry.info : entry;
  var paymentAccounts = entry.accepts || [];
  var details = {
    USDCAccepted: paymentAccounts.length > 0,
    USDCOnly: !!paymentAccounts.find(function (entry) {
      return entry.preferred;
    }),
    EthUSDCAccepted: !!paymentAccounts.find(function (account) {
      return account.type === "eth";
    }),
    EthUSDCOnly: !!paymentAccounts.find(function (account) {
      return account.type === "eth" && account.preferred;
    }),
    SolUSDCAccepted: !!paymentAccounts.find(function (account) {
      return account.type === "sol";
    }),
    SolUSDCOnly: !!paymentAccounts.find(function (account) {
      return account.type === "sol" && account.preferred;
    }),
    TenantId: entry.tenant || entry.tenant_id,
    ContractAddr: info.contract_addr,
    ContractId: "ictr".concat(Utils.AddressToHash(info.contract_addr)),
    ContractName: info.contract_name,
    Cap: info.cap,
    TokenIdStr: info.token_id_str,
    TokenUri: info.token_uri,
    TokenOrdinal: info.ordinal,
    TokenHold: info.hold,
    TokenHoldDate: info.hold ? new Date(parseInt(info.hold) * 1000) : undefined,
    TokenOwner: info.token_owner ? Utils.FormatAddress(info.token_owner) : "",
    VersionHash: (info.token_uri || "").split("/").find(function (s) {
      return (s || "").startsWith("hq__");
    })
  };
  if (isListing) {
    details = _objectSpread(_objectSpread({}, details), {}, {
      // Listing specific fields
      ListingId: entry.id,
      CreatedAt: entry.created * 1000,
      UpdatedAt: entry.updated * 1000,
      CheckoutLockedUntil: entry.checkout ? entry.checkout * 1000 : undefined,
      SellerAddress: Utils.FormatAddress(entry.seller),
      Price: entry.price,
      Fee: entry.fee
    });
  } else {
    details.Offers = info.offers || [];
  }
  return {
    metadata: metadata,
    details: details
  };
};
exports.FormatNFTDetails = FormatNFTDetails;
var FormatNFTMetadata = function FormatNFTMetadata(walletClient, nft) {
  nft.formatted = true;

  // Surface relevant details to top level
  nft.contractAddress = nft.details.ContractAddr;
  nft.contractId = nft.details.ContractId;
  nft.tokenId = nft.details.TokenIdStr;
  nft.name = nft.metadata.display_name;
  if (nft.details.ListingId) {
    nft.listingId = nft.details.ListingId;
  }

  // Format traits
  var FILTERED_ATTRIBUTES = ["Content Fabric Hash", "Creator", "Total Minted Supply"];
  nft.metadata.attributes = (nft.metadata.attributes || []).filter(function (attribute) {
    return attribute && !FILTERED_ATTRIBUTES.includes(attribute.trait_type);
  }).map(function (trait) {
    return _objectSpread(_objectSpread({}, trait), {}, {
      name: trait.trait_type,
      rarity_percent: RarityToPercentage(trait.rarity)
    });
  });

  // Generate embed URLs for additional media
  if (nft.metadata.additional_media) {
    nft.metadata.additional_media = nft.metadata.additional_media.map(function (media) {
      try {
        // Generate embed URLs for additional media
        var mediaType = (media.media_type || "").toLowerCase();
        if (mediaType === "image") {
          return _objectSpread(_objectSpread({}, media), {}, {
            embed_url: media.media_file.url
          });
        }
        var embedUrl = new URL("https://embed.v3.contentfabric.io");
        embedUrl.searchParams.set("p", "");
        embedUrl.searchParams.set("net", walletClient.network === "demo" ? "demo" : "main");
        if (media.requires_permissions) {
          embedUrl.searchParams.set("ath", walletClient.AuthToken());
        }
        if (["video", "audio"].includes(mediaType)) {
          embedUrl.searchParams.set("vid", LinkTargetHash(media.media_link));
          embedUrl.searchParams.set("ct", "h");
          embedUrl.searchParams.set("ap", "");
        } else if (mediaType === "ebook") {
          embedUrl.searchParams.set("type", "ebook");
          embedUrl.searchParams.set("vid", media.media_file["."].container);
          embedUrl.searchParams.set("murl", btoa(media.media_file.url));
        }
        return _objectSpread(_objectSpread({}, media), {}, {
          embed_url: embedUrl.toString()
        });
      } catch (error) {
        walletClient.Log(error, true);
        return media;
      }
    });
  }

  // Generate embed URLs for pack opening animations
  ["open_animation", "open_animation__mobile", "reveal_animation", "reveal_animation_mobile"].forEach(function (key) {
    try {
      if (nft.metadata.pack_options && nft.metadata.pack_options[key]) {
        var embedUrl = new URL("https://embed.v3.contentfabric.io");
        embedUrl.searchParams.set("p", "");
        embedUrl.searchParams.set("net", walletClient.network === "demo" ? "demo" : "main");
        embedUrl.searchParams.set("vid", LinkTargetHash(nft.metadata.pack_options[key]));
        embedUrl.searchParams.set("ap", "");
        if (!key.startsWith("reveal")) {
          embedUrl.searchParams.set("m", "");
          embedUrl.searchParams.set("lp", "");
        }
        nft.metadata.pack_options["".concat(key, "_embed_url")] = embedUrl.toString();
      }
      // eslint-disable-next-line no-empty
    } catch (error) {}
  });
  return nft;
};
exports.FormatNFTMetadata = FormatNFTMetadata;
exports.FormatNFT = function (walletClient, item) {
  return FormatNFTMetadata(walletClient, FormatNFTDetails(item));
};

// https://stackoverflow.com/questions/4068373/center-a-popup-window-on-screen
var Popup = function Popup(_ref) {
  var url = _ref.url,
    title = _ref.title,
    w = _ref.w,
    h = _ref.h;
  // Fixes dual-screen position
  var dualScreenLeft = window.screenLeft || window.screenX;
  var dualScreenTop = window.screenTop || window.screenY;
  var width = window.innerWidth || document.documentElement.clientWidth || screen.width;
  var height = window.innerHeight || document.documentElement.clientHeight || screen.height;
  var systemZoom = width / window.screen.availWidth;
  var left = (width - w) / 2 / systemZoom + dualScreenLeft;
  var top = (height - h) / 2 / systemZoom + dualScreenTop;
  var newWindow = window.open(url, title, "\n      width=".concat(w / systemZoom, ",\n      height=").concat(h / systemZoom, ",\n      top=").concat(top, ",\n      left=").concat(left, "\n    "));
  if (window.focus) newWindow.focus();
  return newWindow;
};
exports.ActionPopup = /*#__PURE__*/function () {
  var _ref3 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee3(_ref2) {
    var _ref2$mode, mode, url, onMessage, onCancel;
    return _regeneratorRuntime.wrap(function _callee3$(_context3) {
      while (1) switch (_context3.prev = _context3.next) {
        case 0:
          _ref2$mode = _ref2.mode, mode = _ref2$mode === void 0 ? "tab" : _ref2$mode, url = _ref2.url, onMessage = _ref2.onMessage, onCancel = _ref2.onCancel;
          _context3.next = 3;
          return new Promise(function (resolve) {
            var newWindow = mode === "popup" ? Popup({
              url: url,
              title: "Eluvio Media Wallet",
              w: 500,
              h: 850
            }) : window.open(url);
            var closeCheck = setInterval( /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee() {
              return _regeneratorRuntime.wrap(function _callee$(_context) {
                while (1) switch (_context.prev = _context.next) {
                  case 0:
                    if (!newWindow.closed) {
                      _context.next = 6;
                      break;
                    }
                    clearInterval(closeCheck);
                    if (!onCancel) {
                      _context.next = 5;
                      break;
                    }
                    _context.next = 5;
                    return onCancel();
                  case 5:
                    resolve();
                  case 6:
                  case "end":
                    return _context.stop();
                }
              }, _callee);
            })), 1000);
            window.addEventListener("message", /*#__PURE__*/function () {
              var _ref5 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee2(event) {
                return _regeneratorRuntime.wrap(function _callee2$(_context2) {
                  while (1) switch (_context2.prev = _context2.next) {
                    case 0:
                      _context2.next = 2;
                      return onMessage(event, function () {
                        clearInterval(closeCheck);
                        newWindow.close();
                        resolve();
                      });
                    case 2:
                    case "end":
                      return _context2.stop();
                  }
                }, _callee2);
              }));
              return function (_x2) {
                return _ref5.apply(this, arguments);
              };
            }());
          });
        case 3:
        case "end":
          return _context3.stop();
      }
    }, _callee3);
  }));
  return function (_x) {
    return _ref3.apply(this, arguments);
  };
}();