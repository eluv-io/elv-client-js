var _regeneratorRuntime = require("@babel/runtime/regenerator");

/**
 * Methods for creating and managing NTP instances and tickets
 *
 * @module ElvClient/NTP
 */
var _require = require("../Validation"),
    ValidateAddress = _require.ValidateAddress,
    ValidateDate = _require.ValidateDate,
    ValidateObject = _require.ValidateObject,
    ValidatePresence = _require.ValidatePresence;

var FormatNTPInfo = function FormatNTPInfo(info) {
  var params = info.pm || {};
  var response = {
    ntpId: info.id,
    tenantId: info.ti,
    kmsId: info.ki,
    objectId: params.qid,
    type: info.de === 4 ? "NTP" : "Other",
    updatedAt: parseInt(info.ts),
    startTime: parseInt(params.vat),
    endTime: parseInt(params.exp),
    ticketLength: params.sen,
    maxRedemptions: params.ntp,
    maxTickets: info.mx
  };

  if (typeof info.cnt !== "undefined") {
    response.issuedTickets = info.cnt;
  }

  return response;
};
/**
 * Issue an n-time-password (NTP) instance. This instance contains a specification for the tickets (AKA codes) to be issued, including
 * the target(s) to be authorized, how many tickets can be issued, and when and how many times tickets can be redeemed.
 *
 * Note: For date types (startTime/endTime), you may specify the date in any format parsable by JavaScript's `new Date()` constructor,
 * including Unix epoch timestamps and ISO strings
 *
 * @see <a href="#IssueNTPCode">IssueNTPCode</a>
 *
 * @methodGroup NTP Instances
 * @namedParams
 * @param {string} tenantId - The ID of the tenant in which to create the NTP instance
 * @param {string} objectId - ID of the object for the tickets to be authorized to
 * @param {Array<string>=} groupAddresses - List of group addresses for the tickets to inherit permissions from
 * @param {number=} maxTickets=0 - The maximum number of tickets that may be issued for this instance (if 0, no limit)
 * @param {number=} maxRedemptions=100 - The maximum number of times each ticket may be redeemed
 * @param {string|number=} startTime - The time when issued tickets can be redeemed
 * @param {string|number=} endTime - The time when issued tickets can no longer be redeemed
 * @param {number=} ticketLength=6 - The number of characters in each ticket code
 *
 * @return {Promise<string>} - The ID of the NTP instance. This ID can be used when issuing tickets (See IssueNTPCode)
 */


exports.CreateNTPInstance = function _callee(_ref) {
  var _this = this;

  var tenantId, objectId, groupAddresses, _ref$maxTickets, maxTickets, _ref$maxRedemptions, maxRedemptions, startTime, endTime, _ref$ticketLength, ticketLength, paramsJSON, groupIds;

  return _regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          tenantId = _ref.tenantId, objectId = _ref.objectId, groupAddresses = _ref.groupAddresses, _ref$maxTickets = _ref.maxTickets, maxTickets = _ref$maxTickets === void 0 ? 0 : _ref$maxTickets, _ref$maxRedemptions = _ref.maxRedemptions, maxRedemptions = _ref$maxRedemptions === void 0 ? 100 : _ref$maxRedemptions, startTime = _ref.startTime, endTime = _ref.endTime, _ref$ticketLength = _ref.ticketLength, ticketLength = _ref$ticketLength === void 0 ? 6 : _ref$ticketLength;
          ValidatePresence("tenantId", tenantId);
          ValidatePresence("objectId or groupAddresses", objectId || groupAddresses);

          if (objectId) {
            ValidateObject(objectId);
          }

          if (groupAddresses) {
            groupAddresses.forEach(function (address) {
              return ValidateAddress(address);
            });
          }

          startTime = ValidateDate(startTime);
          endTime = ValidateDate(endTime);
          paramsJSON = ["ntp:".concat(parseInt(maxRedemptions)), "sen:".concat(parseInt(ticketLength))];

          if (objectId) {
            paramsJSON.push("qid:".concat(objectId));
          } else if (groupAddresses) {
            groupIds = groupAddresses.map(function (address) {
              return "igrp".concat(_this.utils.AddressToHash(address));
            });
            paramsJSON.push("gid:".concat(groupIds.join(",")));
          }

          if (startTime) {
            paramsJSON.push("vat:".concat(startTime));
          }

          if (endTime) {
            paramsJSON.push("exp:".concat(endTime));
          }

          _context.next = 13;
          return _regeneratorRuntime.awrap(this.authClient.MakeKMSCall({
            tenantId: tenantId,
            methodName: "elv_createOTPInstance",
            params: [tenantId, 4, JSON.stringify(paramsJSON), parseInt(maxTickets), Date.now()],
            paramTypes: ["string", "int", "string", "int", "int"]
          }));

        case 13:
          return _context.abrupt("return", _context.sent);

        case 14:
        case "end":
          return _context.stop();
      }
    }
  }, null, this);
};
/**
 * Update the attributes of the specified NTP instance. Only the specified attributes will be updated ; others will be unchanged.
 *
 * @methodGroup NTP Instances
 * @namedParams
 * @param {string} tenantId - The ID of the tenant in which this NTP instance was created
 * @param {string} ntpId - The ID of the NTP instance to update
 * @param {number=} maxTickets=0 - The maximum number of tickets that may be issued for this instance (if 0, no limit)
 * @param {number=} maxRedemptions=100 - The maximum number of times each ticket may be redeemed
 * @param {string|number=} startTime - The time when issued tickets can be redeemed
 * @param {string|number=} endTime - The time when issued tickets can no longer be redeemed
 *
 * @return {Object} - Info about the NTP Instance
 */


exports.UpdateNTPInstance = function _callee2(_ref2) {
  var tenantId, ntpId, _ref2$maxTickets, maxTickets, _ref2$maxRedemptions, maxRedemptions, startTime, endTime, paramsJSON, _ref3, Ret;

  return _regeneratorRuntime.async(function _callee2$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          tenantId = _ref2.tenantId, ntpId = _ref2.ntpId, _ref2$maxTickets = _ref2.maxTickets, maxTickets = _ref2$maxTickets === void 0 ? 0 : _ref2$maxTickets, _ref2$maxRedemptions = _ref2.maxRedemptions, maxRedemptions = _ref2$maxRedemptions === void 0 ? 100 : _ref2$maxRedemptions, startTime = _ref2.startTime, endTime = _ref2.endTime;
          ValidatePresence("tenantId", tenantId);
          ValidatePresence("ntpId", ntpId);
          startTime = ValidateDate(startTime);
          endTime = ValidateDate(endTime);
          paramsJSON = [];

          if (maxRedemptions) {
            paramsJSON.push("ntp:".concat(parseInt(maxRedemptions)));
          }

          if (startTime) {
            paramsJSON.push("vat:".concat(startTime));
          }

          if (endTime) {
            paramsJSON.push("exp:".concat(endTime));
          }

          if (maxTickets) {
            paramsJSON.push("max:".concat(parseInt(maxTickets)));
          }

          _context2.next = 12;
          return _regeneratorRuntime.awrap(this.authClient.MakeKMSCall({
            tenantId: tenantId,
            methodName: "elv_updateOTPInstance",
            params: [tenantId, ntpId, "update", JSON.stringify(paramsJSON), Date.now()],
            paramTypes: ["string", "string", "string", "string", "int"]
          }));

        case 12:
          _ref3 = _context2.sent;
          Ret = _ref3.Ret;
          return _context2.abrupt("return", FormatNTPInfo(JSON.parse(Ret)));

        case 15:
        case "end":
          return _context2.stop();
      }
    }
  }, null, this);
};
/**
 * Suspend the specified NTP instance. All tickets issued for this instance will be considered expired.
 *
 * To reactivate the NTP instance, reset the expiration date using `UpdateNTPInstance`
 *
 * @methodGroup NTP Instances
 * @namedParams
 * @param {string} tenantId - The ID of the tenant in which this NTP instance was created
 * @param {string} ntpId - The ID of the NTP instance
 */


exports.SuspendNTPInstance = function _callee3(_ref4) {
  var tenantId, ntpId;
  return _regeneratorRuntime.async(function _callee3$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          tenantId = _ref4.tenantId, ntpId = _ref4.ntpId;
          ValidatePresence("tenantId", tenantId);
          ValidatePresence("ntpId", ntpId);
          _context3.next = 5;
          return _regeneratorRuntime.awrap(this.authClient.MakeKMSCall({
            tenantId: tenantId,
            methodName: "elv_updateOTPInstance",
            params: [tenantId, ntpId, "cancel", "[]", Date.now()],
            paramTypes: ["string", "string", "string", "string", "int"]
          }));

        case 5:
        case "end":
          return _context3.stop();
      }
    }
  }, null, this);
};
/**
 * Delete the specified NTP instance. This action cannot be undone.
 *
 * @methodGroup NTP Instances
 * @namedParams
 * @param {string} tenantId - The ID of the tenant in which this NTP instance was created
 * @param {string} ntpId - The ID of the NTP instance
 */


exports.DeleteNTPInstance = function _callee4(_ref5) {
  var tenantId, ntpId;
  return _regeneratorRuntime.async(function _callee4$(_context4) {
    while (1) {
      switch (_context4.prev = _context4.next) {
        case 0:
          tenantId = _ref5.tenantId, ntpId = _ref5.ntpId;
          ValidatePresence("tenantId", tenantId);
          ValidatePresence("ntpId", ntpId);
          _context4.next = 5;
          return _regeneratorRuntime.awrap(this.authClient.MakeKMSCall({
            tenantId: tenantId,
            methodName: "elv_updateOTPInstance",
            params: [tenantId, ntpId, "delete", "[]", Date.now()],
            paramTypes: ["string", "string", "string", "string", "int"]
          }));

        case 5:
        case "end":
          return _context4.stop();
      }
    }
  }, null, this);
};
/**
 * Retrieve info for NTP instances in the specified tenant
 *
 * @methodGroup NTP Instances
 * @namedParams
 * @param {string} tenantId - The ID of the tenant
 * @param {number=} count=10 - Maximum number of results to return
 * @param {number=} offset=0 - Offset from which to return results
 *
 * @return {Object} - List of NTP instances along with pagination information
 */


exports.ListNTPInstances = function _callee5(_ref6) {
  var tenantId, _ref6$count, count, _ref6$offset, offset, _ref7, Defs, Total;

  return _regeneratorRuntime.async(function _callee5$(_context5) {
    while (1) {
      switch (_context5.prev = _context5.next) {
        case 0:
          tenantId = _ref6.tenantId, _ref6$count = _ref6.count, count = _ref6$count === void 0 ? 10 : _ref6$count, _ref6$offset = _ref6.offset, offset = _ref6$offset === void 0 ? 0 : _ref6$offset;
          ValidatePresence("tenantId", tenantId);
          _context5.next = 4;
          return _regeneratorRuntime.awrap(this.authClient.MakeKMSCall({
            tenantId: tenantId,
            methodName: "elv_listOTPInfo",
            params: [tenantId, offset, count],
            paramTypes: ["string", "int", "int"],
            signature: false
          }));

        case 4:
          _ref7 = _context5.sent;
          Defs = _ref7.Defs;
          Total = _ref7.Total;
          return _context5.abrupt("return", {
            ntpInstances: Object.values(Defs || {}).map(FormatNTPInfo),
            start: offset,
            end: Math.min(Total, offset + count),
            total: Total
          });

        case 8:
        case "end":
          return _context5.stop();
      }
    }
  }, null, this);
};
/**
 * Retrieve a info about the specified NTP instance
 *
 * @methodGroup NTP Instances
 * @namedParams
 * @param {string} tenantId - The ID of the tenant
 * @param {string} ntpId - The ID of the NTP instance
 *
 * @return {Object} - Info about the NTP instance
 */


exports.NTPInstance = function _callee6(_ref8) {
  var tenantId, ntpId;
  return _regeneratorRuntime.async(function _callee6$(_context6) {
    while (1) {
      switch (_context6.prev = _context6.next) {
        case 0:
          tenantId = _ref8.tenantId, ntpId = _ref8.ntpId;
          ValidatePresence("tenantId", tenantId);
          ValidatePresence("ntpId", ntpId);
          _context6.t0 = FormatNTPInfo;
          _context6.next = 6;
          return _regeneratorRuntime.awrap(this.authClient.MakeKMSCall({
            tenantId: tenantId,
            methodName: "elv_getOTPInfo",
            params: [tenantId, ntpId],
            paramTypes: ["string", "string"],
            signature: false
          }));

        case 6:
          _context6.t1 = _context6.sent;
          return _context6.abrupt("return", (0, _context6.t0)(_context6.t1));

        case 8:
        case "end":
          return _context6.stop();
      }
    }
  }, null, this);
};
/**
 * Issue a ticket from the specified NTP ID
 *
 * @see <a href="#CreateNTPInstance">CreateNTPInstance</a>
 *
 * @methodGroup Tickets
 * @namedParams
 * @param {string} tenantId - The ID of the tenant in the NTP instance was created
 * @param {string} ntpId - The ID of the NTP instance from which to issue a ticket
 * @param {string=} email - The email address associated with this ticket. If specified, the email address will have to
 * be provided along with the ticket code in order to redeem the ticket.
 * @param {number=} maxRedemptions - Maximum number of times this ticket may be redeemed. If less than the max redemptions
 * of the NTP instance, the lower limit will be used.
 *
 * @return {Promise<Object>} - The generated ticket code and additional information about the ticket.
 */


exports.IssueNTPCode = function _callee7(_ref9) {
  var tenantId, ntpId, email, maxRedemptions, options, params, paramTypes;
  return _regeneratorRuntime.async(function _callee7$(_context7) {
    while (1) {
      switch (_context7.prev = _context7.next) {
        case 0:
          tenantId = _ref9.tenantId, ntpId = _ref9.ntpId, email = _ref9.email, maxRedemptions = _ref9.maxRedemptions;
          ValidatePresence("tenantId", tenantId);
          ValidatePresence("ntpId", ntpId);
          options = [];

          if (email) {
            options.push("eml:".concat(email));
          }

          if (maxRedemptions) {
            options.push("cnt:".concat(parseInt(maxRedemptions)));
          }

          params = [tenantId, ntpId, JSON.stringify(options), Date.now()];
          paramTypes = ["string", "string", "string", "uint"];
          _context7.next = 10;
          return _regeneratorRuntime.awrap(this.authClient.MakeKMSCall({
            methodName: "elv_issueOTPCode",
            params: params,
            paramTypes: paramTypes
          }));

        case 10:
          return _context7.abrupt("return", _context7.sent);

        case 11:
        case "end":
          return _context7.stop();
      }
    }
  }, null, this);
};
/**
 * Redeem the specified ticket/code to authorize the client. Must provide either issuer or tenantId and ntpId
 *
 * @methodGroup Tickets
 * @namedParams
 * @param {string=} issuer - Issuer to authorize against
 * @param {string=} tenantId - The ID of the tenant from which the ticket was issued
 * @param {string} ntpId - The ID of the NTP instance from which the ticket was issued
 * @param {string} code - Access code
 * @param {string=} email - Email address associated with the code
 *
 * @return {Promise<string>} - The object ID which the ticket is authorized to
 */


exports.RedeemCode = function _callee8(_ref10) {
  var issuer, tenantId, ntpId, code, email, wallet, token, objectId, libraryId, Hash, codeHash, codeInfo, ak, sites, info, signer;
  return _regeneratorRuntime.async(function _callee8$(_context8) {
    while (1) {
      switch (_context8.prev = _context8.next) {
        case 0:
          issuer = _ref10.issuer, tenantId = _ref10.tenantId, ntpId = _ref10.ntpId, code = _ref10.code, email = _ref10.email;
          wallet = this.GenerateWallet();
          issuer = issuer || "";

          if (!this.signer) {
            this.SetSigner({
              signer: wallet.AddAccountFromMnemonic({
                mnemonic: wallet.GenerateMnemonic()
              })
            });
          }

          if (!issuer.startsWith("iq__")) {
            _context8.next = 8;
            break;
          }

          ValidateObject(issuer);
          _context8.next = 27;
          break;

        case 8:
          if (!(issuer && !issuer.replace(/^\//, "").startsWith("otp/ntp/iten"))) {
            _context8.next = 12;
            break;
          }

          throw Error("Invalid issuer: " + issuer);

        case 12:
          // Ticket API
          ValidatePresence("issuer or tenantId and ntpId", issuer || tenantId && ntpId);

          if (!issuer) {
            issuer = "/otp/ntp/".concat(tenantId, "/").concat(ntpId);
          }

          _context8.prev = 14;
          _context8.next = 17;
          return _regeneratorRuntime.awrap(this.authClient.GenerateChannelContentToken({
            issuer: issuer,
            code: code,
            email: email
          }));

        case 17:
          token = _context8.sent;
          this.SetStaticToken({
            token: token
          });
          return _context8.abrupt("return", JSON.parse(this.utils.FromB64(token)).qid);

        case 22:
          _context8.prev = 22;
          _context8.t0 = _context8["catch"](14);
          this.Log("Failed to redeem code:", true);
          this.Log(_context8.t0, true);
          throw _context8.t0;

        case 27:
          // Site selector
          objectId = issuer;
          _context8.next = 30;
          return _regeneratorRuntime.awrap(this.ContentObjectLibraryId({
            objectId: objectId
          }));

        case 30:
          libraryId = _context8.sent;

          Hash = function Hash(code) {
            var chars = code.split("").map(function (code) {
              return code.charCodeAt(0);
            });
            return chars.reduce(function (sum, _char, i) {
              return chars[i + 1] ? sum * 2 + _char * chars[i + 1] * (i + 1) : sum + _char;
            }, 0).toString();
          };

          codeHash = Hash(code);
          _context8.next = 35;
          return _regeneratorRuntime.awrap(this.ContentObjectMetadata({
            libraryId: libraryId,
            objectId: objectId,
            metadataSubtree: "public/codes/".concat(codeHash)
          }));

        case 35:
          codeInfo = _context8.sent;

          if (codeInfo) {
            _context8.next = 39;
            break;
          }

          this.Log("Code redemption failed:\n\t".concat(issuer, "\n\t").concat(code));
          throw Error("Invalid code: " + code);

        case 39:
          ak = codeInfo.ak, sites = codeInfo.sites, info = codeInfo.info;
          _context8.next = 42;
          return _regeneratorRuntime.awrap(wallet.AddAccountFromEncryptedPK({
            encryptedPrivateKey: this.utils.FromB64(ak),
            password: code
          }));

        case 42:
          signer = _context8.sent;
          this.SetSigner({
            signer: signer
          }); // Ensure wallet is initialized

          _context8.next = 46;
          return _regeneratorRuntime.awrap(this.userProfileClient.WalletAddress());

        case 46:
          return _context8.abrupt("return", {
            addr: this.utils.FormatAddress(signer.address),
            sites: sites,
            info: info || {}
          });

        case 47:
        case "end":
          return _context8.stop();
      }
    }
  }, null, this, [[14, 22]]);
};