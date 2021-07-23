/**
 * Methods for creating and managing NTP instances and tickets
 *
 * @module ElvClient/NTP
 */

const UrlJoin = require("url-join");
const Ethers = require("ethers");

const {
  ValidateAddress,
  ValidateDate,
  ValidateObject,
  ValidatePresence
} = require("../Validation");

const FormatNTPInfo = info => {
  const params = info.pm || {};

  let response = {
    ntpId: info.id,
    ntpClass: `Class ${info.de}`,
    tenantId: info.ti,
    kmsId: info.ki,
    objectId: params.qid,
    updatedAt: parseInt(info.ts),
    startTime: parseInt(params.vat),
    endTime: parseInt(params.exp),
    ticketLength: params.sen,
    maxRedemptions: params.ntp,
    maxTickets: info.mx
  };

  if(typeof info.cnt !== "undefined") {
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
 * @param {number=} ntpClass=4 - Class of NTP instance to create
 * @param {number=} maxTickets=0 - The maximum number of tickets that may be issued for this instance (if 0, no limit)
 * @param {number=} maxRedemptions=100 - The maximum number of times each ticket may be redeemed
 * @param {string|number=} startTime - The time when issued tickets can be redeemed
 * @param {string|number=} endTime - The time when issued tickets can no longer be redeemed
 * @param {number=} ticketLength=6 - The number of characters in each ticket code
 *
 * @return {Promise<string>} - The ID of the NTP instance. This ID can be used when issuing tickets (See IssueNTPCode)
 */
exports.CreateNTPInstance = async function({
  tenantId,
  objectId,
  groupAddresses,
  ntpClass=4,
  maxTickets=0,
  maxRedemptions=100,
  startTime,
  endTime,
  ticketLength=6
}) {
  ValidatePresence("tenantId", tenantId);
  ValidatePresence("objectId or groupAddresses", objectId || groupAddresses);

  if(objectId) { ValidateObject(objectId); }
  if(groupAddresses) { groupAddresses.forEach(address => ValidateAddress(address)); }

  startTime = ValidateDate(startTime);
  endTime = ValidateDate(endTime);

  let paramsJSON = [`ntp:${parseInt(maxRedemptions)}`, `sen:${parseInt(ticketLength)}`];

  if(objectId) {
    paramsJSON.push(`qid:${objectId}`);
  } else if(groupAddresses) {
    const groupIds = groupAddresses.map(address => `igrp${this.utils.AddressToHash(address)}`);

    paramsJSON.push(`gid:${groupIds.join(",")}`);
  }

  if(startTime) {
    paramsJSON.push(`vat:${startTime}`);
  }

  if(endTime) {
    paramsJSON.push(`exp:${endTime}`);
  }

  return await this.authClient.MakeKMSCall({
    tenantId,
    methodName: "elv_createOTPInstance",
    params: [
      tenantId,
      ntpClass,
      JSON.stringify(paramsJSON),
      parseInt(maxTickets),
      Date.now()
    ],
    paramTypes: [
      "string",
      "int",
      "string",
      "int",
      "int"
    ]
  });
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
exports.UpdateNTPInstance = async function({
  tenantId,
  ntpId,
  maxTickets=0,
  maxRedemptions=100,
  startTime,
  endTime,
}) {
  ValidatePresence("tenantId", tenantId);
  ValidatePresence("ntpId", ntpId);

  startTime = ValidateDate(startTime);
  endTime = ValidateDate(endTime);

  let paramsJSON = [];

  if(maxRedemptions) {
    paramsJSON.push(`ntp:${parseInt(maxRedemptions)}`);
  }

  if(startTime) {
    paramsJSON.push(`vat:${startTime}`);
  }

  if(endTime) {
    paramsJSON.push(`exp:${endTime}`);
  }

  if(maxTickets) {
    paramsJSON.push(`max:${parseInt(maxTickets)}`);
  }

  const {Ret} = await this.authClient.MakeKMSCall({
    tenantId,
    methodName: "elv_updateOTPInstance",
    params: [
      tenantId,
      ntpId,
      "update",
      JSON.stringify(paramsJSON),
      Date.now()
    ],
    paramTypes: [
      "string",
      "string",
      "string",
      "string",
      "int"
    ]
  });

  return FormatNTPInfo(JSON.parse(Ret));
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
exports.SuspendNTPInstance = async function({tenantId, ntpId}) {
  ValidatePresence("tenantId", tenantId);
  ValidatePresence("ntpId", ntpId);

  await this.authClient.MakeKMSCall({
    tenantId,
    methodName: "elv_updateOTPInstance",
    params: [
      tenantId,
      ntpId,
      "cancel",
      "[]",
      Date.now()
    ],
    paramTypes: [
      "string",
      "string",
      "string",
      "string",
      "int"
    ]
  });
};

/**
 * Delete the specified NTP instance. This action cannot be undone.
 *
 * @methodGroup NTP Instances
 * @namedParams
 * @param {string} tenantId - The ID of the tenant in which this NTP instance was created
 * @param {string} ntpId - The ID of the NTP instance
 */
exports.DeleteNTPInstance = async function({tenantId, ntpId}) {
  ValidatePresence("tenantId", tenantId);
  ValidatePresence("ntpId", ntpId);

  await this.authClient.MakeKMSCall({
    tenantId,
    methodName: "elv_updateOTPInstance",
    params: [
      tenantId,
      ntpId,
      "delete",
      "[]",
      Date.now()
    ],
    paramTypes: [
      "string",
      "string",
      "string",
      "string",
      "int"
    ]
  });
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
exports.ListNTPInstances = async function({tenantId, count=10, offset=0}) {
  ValidatePresence("tenantId", tenantId);

  const {Defs, Total} = await this.authClient.MakeKMSCall({
    tenantId,
    methodName: "elv_listOTPInfo",
    params: [
      tenantId,
      offset,
      count
    ],
    paramTypes: [
      "string",
      "int",
      "int"
    ],
    signature: false
  });

  return {
    ntpInstances: Object.values(Defs || {}).map(FormatNTPInfo),
    start: offset,
    end: Math.min(Total, offset + count),
    total: Total
  };
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
exports.NTPInstance = async function({tenantId, ntpId}) {
  ValidatePresence("tenantId", tenantId);
  ValidatePresence("ntpId", ntpId);

  return FormatNTPInfo(
    await this.authClient.MakeKMSCall({
      tenantId,
      methodName: "elv_getOTPInfo",
      params: [
        tenantId,
        ntpId
      ],
      paramTypes: [
        "string",
        "string"
      ],
      signature: false
    })
  );
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
exports.IssueNTPCode = async function({tenantId, ntpId, email, maxRedemptions}) {
  ValidatePresence("tenantId", tenantId);
  ValidatePresence("ntpId", ntpId);

  let options = [];
  if(email) {
    options.push(`eml:${email}`);
  }

  if(maxRedemptions) {
    options.push(`cnt:${parseInt(maxRedemptions)}`);
  }

  const params = [tenantId, ntpId, JSON.stringify(options), Date.now()];
  const paramTypes = ["string", "string", "string", "uint"];

  return await this.authClient.MakeKMSCall({
    methodName: "elv_issueOTPCode",
    params,
    paramTypes
  });
};

/**
 * Identical to IssueNTPCode, but the token is also signed by the current user.
 *
 * @see <a href="#IssueNTPCode">IssueNTPCode</a>
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
 * @return {Promise<Object>} - The generated signed ticket code and additional information about the ticket.
 */
exports.IssueSignedNTPCode = async function({tenantId, ntpId, email, maxRedemptions}) {
  let result = await this.IssueNTPCode({tenantId, ntpId, email, maxRedemptions});

  if(result.token) {
    const signature = await this.authClient.Sign(Ethers.utils.keccak256(Ethers.utils.toUtf8Bytes(result.token)));
    const multiSig = this.utils.FormatSignature(signature);
    result.token = `${result.token}.${this.utils.B64(multiSig)}`;
  }

  return result;
};

/**
 * Redeem the specified ticket/code to authorize the client. Must provide either issuer or tenantId and ntpId
 *
 * @methodGroup Tickets
 * @namedParams
 * @param {string=} issuer - Issuer to authorize against
 * @param {string=} tenantId - The ID of the tenant from which the ticket was issued
 * @param {string=} ntpId - The ID of the NTP instance from which the ticket was issued
 * @param {string} code - Access code
 * @param {string=} email - Email address associated with the code
 * @param {boolean=} includeNTPId - If specified, the response will include both the target object ID as well as the NTP ID associated with the ticket
 *
 * @return {Promise<string|Object>} - The object ID which the ticket is authorized to, or an object containing the object ID and NTP ID if `includeNTPId` is specified
 */
exports.RedeemCode = async function({issuer, tenantId, ntpId, code, email, includeNTPId=false}) {
  const wallet = this.GenerateWallet();

  issuer = issuer || "";

  if(!this.signer) {
    this.SetSigner({
      signer: wallet.AddAccountFromMnemonic({mnemonic: wallet.GenerateMnemonic()})
    });
  }

  if(issuer.startsWith("iq__")) {
    ValidateObject(issuer);
  } else if(issuer && !issuer.replace(/^\//, "").startsWith("otp/ntp/iten")) {
    throw Error("Invalid issuer: " + issuer);
  } else {
    // Ticket API

    ValidatePresence("issuer or tenantId", issuer || tenantId);

    if(!issuer) {
      issuer = UrlJoin("/otp", "ntp", tenantId, ntpId || "");
    }

    try {
      const token = await this.authClient.GenerateChannelContentToken({
        issuer,
        code,
        email
      });

      this.SetStaticToken({token});

      const response = JSON.parse(this.utils.FromB64(token));

      return includeNTPId ? { objectId: response.qid, ntpId: response.oid } : response.qid;
    } catch(error) {
      this.Log("Failed to redeem code:", true);
      this.Log(error, true);

      throw error;

      /*
      if((error.body || "").toString().includes("exceed configured maximum")) {
        throw Error("Code exceeded maximum number of uses");
      } else {
        throw Error("Invalid code");
      }
      */
    }
  }

  // Site selector

  const objectId = issuer;
  const libraryId = await this.ContentObjectLibraryId({objectId});

  const Hash = (code) => {
    const chars = code.split("").map(code => code.charCodeAt(0));
    return chars.reduce((sum, char, i) => (chars[i + 1] ? (sum * 2) + char * chars[i+1] * (i + 1) : sum + char), 0).toString();
  };

  const codeHash = Hash(code);
  const codeInfo = await this.ContentObjectMetadata({libraryId, objectId, metadataSubtree: `public/codes/${codeHash}`});

  if(!codeInfo){
    this.Log(`Code redemption failed:\n\t${issuer}\n\t${code}`);
    throw Error("Invalid code: " + code);
  }

  const { ak, sites, info } = codeInfo;

  const signer = await wallet.AddAccountFromEncryptedPK({
    encryptedPrivateKey: this.utils.FromB64(ak),
    password: code
  });

  this.SetSigner({signer});

  // Ensure wallet is initialized
  await this.userProfileClient.WalletAddress();

  return {
    addr: this.utils.FormatAddress(signer.address),
    sites,
    info: info || {}
  };
};
