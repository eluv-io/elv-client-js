var _toConsumableArray = require("@babel/runtime/helpers/toConsumableArray");

var _typeof = require("@babel/runtime/helpers/typeof");

var _defineProperty = require("@babel/runtime/helpers/defineProperty");

var _regeneratorRuntime = require("@babel/runtime/regenerator");

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

/**
 * Methods for accessing content types, libraries and objects
 *
 * @module ElvClient/ContentAccess
 */
var UrlJoin = require("url-join");

var HttpClient = require("../HttpClient");

var _require = require("../Validation"),
    ValidateLibrary = _require.ValidateLibrary,
    ValidateObject = _require.ValidateObject,
    ValidateVersion = _require.ValidateVersion,
    ValidatePartHash = _require.ValidatePartHash,
    ValidateWriteToken = _require.ValidateWriteToken,
    ValidateParameters = _require.ValidateParameters; // Note: Keep these ordered by most-restrictive to least-restrictive


exports.permissionLevels = {
  "owner": {
    "short": "Owner Only",
    description: "Only the owner has access to the object and ability to change permissions",
    settings: {
      visibility: 0,
      statusCode: -1,
      kmsConk: false
    }
  },
  "editable": {
    "short": "Editable",
    description: "Members of the editors group have full access to the object and the ability to change permissions",
    settings: {
      visibility: 0,
      statusCode: -1,
      kmsConk: true
    }
  },
  "viewable": {
    "short": "Viewable",
    description: "In addition to editors, members of the 'accessor' group can have read-only access to the object including playing video and retrieving metadata, images and documents",
    settings: {
      visibility: 0,
      statusCode: 0,
      kmsConk: true
    }
  },
  "listable": {
    "short": "Publicly Listable",
    description: "Anyone can list the public portion of this object but only accounts with specific rights can access",
    settings: {
      visibility: 1,
      statusCode: 0,
      kmsConk: true
    }
  },
  "public": {
    "short": "Public",
    description: "Anyone can access this object",
    settings: {
      visibility: 10,
      statusCode: 0,
      kmsConk: true
    }
  }
};

exports.Visibility = function _callee2(_ref) {
  var _this = this;

  var id, address;
  return _regeneratorRuntime.async(function _callee2$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          id = _ref.id;
          _context2.prev = 1;
          address = this.utils.HashToAddress(id);

          if (!this.visibilityInfo[address]) {
            this.visibilityInfo[address] = new Promise(function _callee(resolve, reject) {
              var hasVisibility;
              return _regeneratorRuntime.async(function _callee$(_context) {
                while (1) {
                  switch (_context.prev = _context.next) {
                    case 0:
                      _context.prev = 0;
                      _context.next = 3;
                      return _regeneratorRuntime.awrap(_this.authClient.ContractHasMethod({
                        contractAddress: address,
                        methodName: "visibility"
                      }));

                    case 3:
                      hasVisibility = _context.sent;

                      if (hasVisibility) {
                        _context.next = 7;
                        break;
                      }

                      resolve(0);
                      return _context.abrupt("return");

                    case 7:
                      _context.t0 = resolve;
                      _context.next = 10;
                      return _regeneratorRuntime.awrap(_this.CallContractMethod({
                        contractAddress: _this.utils.HashToAddress(id),
                        methodName: "visibility"
                      }));

                    case 10:
                      _context.t1 = _context.sent;
                      (0, _context.t0)(_context.t1);
                      _context.next = 17;
                      break;

                    case 14:
                      _context.prev = 14;
                      _context.t2 = _context["catch"](0);
                      reject(_context.t2);

                    case 17:
                    case "end":
                      return _context.stop();
                  }
                }
              }, null, null, [[0, 14]]);
            });
          }

          _context2.prev = 4;
          _context2.next = 7;
          return _regeneratorRuntime.awrap(this.visibilityInfo[address]);

        case 7:
          return _context2.abrupt("return", _context2.sent);

        case 10:
          _context2.prev = 10;
          _context2.t0 = _context2["catch"](4);
          delete this.visibilityInfo[address];
          throw _context2.t0;

        case 14:
          _context2.next = 21;
          break;

        case 16:
          _context2.prev = 16;
          _context2.t1 = _context2["catch"](1);

          if (!(_context2.t1.code === "CALL_EXCEPTION")) {
            _context2.next = 20;
            break;
          }

          return _context2.abrupt("return", 0);

        case 20:
          throw _context2.t1;

        case 21:
        case "end":
          return _context2.stop();
      }
    }
  }, null, this, [[1, 16], [4, 10]]);
};
/**
 * Get the current permission level for the specified object. See client.permissionLevels for all available permissions.
 *
 * Note: This method is only intended for normal content objects, not types, libraries, etc.
 *
 * @methodGroup Content Objects
 * @param {string} objectId - The ID of the object
 *
 * @return {string} - Key for the permission of the object - Use this to retrieve more details from client.permissionLevels
 */


exports.Permission = function _callee3(_ref2) {
  var _this2 = this;

  var objectId, visibility, kmsAddress, kmsId, hasKmsConk, statusCode, permission;
  return _regeneratorRuntime.async(function _callee3$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          objectId = _ref2.objectId;
          ValidateObject(objectId);
          _context3.next = 4;
          return _regeneratorRuntime.awrap(this.AccessType({
            id: objectId
          }));

        case 4:
          _context3.t0 = _context3.sent;
          _context3.t1 = this.authClient.ACCESS_TYPES.OBJECT;

          if (!(_context3.t0 !== _context3.t1)) {
            _context3.next = 8;
            break;
          }

          throw Error("Permission only valid for normal content objects: " + objectId);

        case 8:
          _context3.next = 10;
          return _regeneratorRuntime.awrap(this.Visibility({
            id: objectId
          }));

        case 10:
          visibility = _context3.sent;
          _context3.next = 13;
          return _regeneratorRuntime.awrap(this.CallContractMethod({
            contractAddress: this.utils.HashToAddress(objectId),
            methodName: "addressKMS"
          }));

        case 13:
          kmsAddress = _context3.sent;
          kmsId = kmsAddress && "ikms".concat(this.utils.AddressToHash(kmsAddress));
          hasKmsConk = false;

          if (!kmsId) {
            _context3.next = 29;
            break;
          }

          _context3.t2 = _regeneratorRuntime;
          _context3.t3 = this;
          _context3.next = 21;
          return _regeneratorRuntime.awrap(this.ContentObjectLibraryId({
            objectId: objectId
          }));

        case 21:
          _context3.t4 = _context3.sent;
          _context3.t5 = objectId;
          _context3.t6 = "eluv.caps.".concat(kmsId);
          _context3.t7 = {
            libraryId: _context3.t4,
            objectId: _context3.t5,
            metadataSubtree: _context3.t6
          };
          _context3.t8 = _context3.t3.ContentObjectMetadata.call(_context3.t3, _context3.t7);
          _context3.next = 28;
          return _context3.t2.awrap.call(_context3.t2, _context3.t8);

        case 28:
          hasKmsConk = !!_context3.sent;

        case 29:
          _context3.next = 31;
          return _regeneratorRuntime.awrap(this.CallContractMethod({
            contractAddress: this.utils.HashToAddress(objectId),
            methodName: "statusCode"
          }));

        case 31:
          statusCode = _context3.sent;
          statusCode = parseInt(statusCode._hex, 16);
          permission = Object.keys(this.permissionLevels).filter(function (permissionKey) {
            var settings = _this2.permissionLevels[permissionKey].settings;
            return visibility >= settings.visibility && statusCode >= settings.statusCode && hasKmsConk === settings.kmsConk;
          });

          if (!permission) {
            permission = hasKmsConk ? ["editable"] : ["owner"];
          }

          return _context3.abrupt("return", permission.slice(-1)[0]);

        case 36:
        case "end":
          return _context3.stop();
      }
    }
  }, null, this);
};
/* Content Spaces */

/**
 * Get the address of the default KMS of the content space or the provided tenant
 *
 * @methodGroup Content Space
 * @namedParams
 * @param {string=} tenantId - An ID of a tenant contract - if not specified, the content space contract will be used
 *
 * @returns {Promise<string>} - Address of the KMS
 */


exports.DefaultKMSAddress = function _callee4() {
  var _ref3,
      tenantId,
      kmsAddress,
      _args4 = arguments;

  return _regeneratorRuntime.async(function _callee4$(_context4) {
    while (1) {
      switch (_context4.prev = _context4.next) {
        case 0:
          _ref3 = _args4.length > 0 && _args4[0] !== undefined ? _args4[0] : {}, tenantId = _ref3.tenantId;
          _context4.t0 = tenantId;

          if (!_context4.t0) {
            _context4.next = 8;
            break;
          }

          _context4.next = 5;
          return _regeneratorRuntime.awrap(this.AccessType({
            id: tenantId
          }));

        case 5:
          _context4.t1 = _context4.sent;
          _context4.t2 = this.authClient.ACCESS_TYPES.TENANT;
          _context4.t0 = _context4.t1 === _context4.t2;

        case 8:
          if (!_context4.t0) {
            _context4.next = 14;
            break;
          }

          _context4.next = 11;
          return _regeneratorRuntime.awrap(this.CallContractMethod({
            contractAddress: this.utils.HashToAddress(tenantId),
            methodName: "addressKMS"
          }));

        case 11:
          kmsAddress = _context4.sent;

          if (!kmsAddress) {
            _context4.next = 14;
            break;
          }

          return _context4.abrupt("return", kmsAddress);

        case 14:
          _context4.next = 16;
          return _regeneratorRuntime.awrap(this.CallContractMethod({
            contractAddress: this.contentSpaceAddress,
            methodName: "addressKMS"
          }));

        case 16:
          return _context4.abrupt("return", _context4.sent);

        case 17:
        case "end":
          return _context4.stop();
      }
    }
  }, null, this);
};
/**
 * Get the ID of the current content space
 *
 * @methodGroup Content Space
 *
 * @return {string} contentSpaceId - The ID of the current content space
 */


exports.ContentSpaceId = function () {
  return this.contentSpaceId;
};
/* Content Types */

/**
 * Returns the address of the owner of the specified content type
 *
 * @methodGroup Content Types
 * @namedParams
 * @param {string=} name - Name of the content type to find
 * @param {string=} typeId - ID of the content type to find
 * @param {string=} versionHash - Version hash of the content type to find
 *
 * @returns {Promise<string>} - The account address of the owner
 */


exports.ContentTypeOwner = function _callee5(_ref4) {
  var name, typeId, versionHash, contentType;
  return _regeneratorRuntime.async(function _callee5$(_context5) {
    while (1) {
      switch (_context5.prev = _context5.next) {
        case 0:
          name = _ref4.name, typeId = _ref4.typeId, versionHash = _ref4.versionHash;
          _context5.next = 3;
          return _regeneratorRuntime.awrap(this.ContentType({
            name: name,
            typeId: typeId,
            versionHash: versionHash
          }));

        case 3:
          contentType = _context5.sent;
          _context5.t0 = this.utils;
          _context5.next = 7;
          return _regeneratorRuntime.awrap(this.ethClient.CallContractMethod({
            contractAddress: this.utils.HashToAddress(contentType.id),
            methodName: "owner",
            methodArgs: []
          }));

        case 7:
          _context5.t1 = _context5.sent;
          return _context5.abrupt("return", _context5.t0.FormatAddress.call(_context5.t0, _context5.t1));

        case 9:
        case "end":
          return _context5.stop();
      }
    }
  }, null, this);
};
/**
 * Find the content type accessible to the current user by name, ID, or version hash
 *
 * @methodGroup Content Types
 * @namedParams
 * @param {string=} name - Name of the content type to find
 * @param {string=} typeId - ID of the content type to find
 * @param {string=} versionHash - Version hash of the content type to find
 * @param {boolean=} publicOnly=false - If specified, will only retrieve public metadata (no access request needed)
 *
 * @return {Promise<Object>} - The content type, if found
 */


exports.ContentType = function _callee6(_ref5) {
  var name, typeId, versionHash, _ref5$publicOnly, publicOnly, types, metadata;

  return _regeneratorRuntime.async(function _callee6$(_context6) {
    while (1) {
      switch (_context6.prev = _context6.next) {
        case 0:
          name = _ref5.name, typeId = _ref5.typeId, versionHash = _ref5.versionHash, _ref5$publicOnly = _ref5.publicOnly, publicOnly = _ref5$publicOnly === void 0 ? false : _ref5$publicOnly;
          this.Log("Retrieving content type: ".concat(name || typeId || versionHash));

          if (versionHash) {
            typeId = this.utils.DecodeVersionHash(versionHash).objectId;
          }

          if (!name) {
            _context6.next = 8;
            break;
          }

          this.Log("Looking up type by name in content space metadata..."); // Look up named type in content space metadata

          _context6.next = 7;
          return _regeneratorRuntime.awrap(this.ContentObjectMetadata({
            libraryId: this.contentSpaceLibraryId,
            objectId: this.contentSpaceObjectId,
            metadataSubtree: UrlJoin("public", "contentTypes", name)
          }));

        case 7:
          typeId = _context6.sent;

        case 8:
          if (typeId) {
            _context6.next = 18;
            break;
          }

          this.Log("Looking up type by name in available types...");
          _context6.next = 12;
          return _regeneratorRuntime.awrap(this.ContentTypes());

        case 12:
          types = _context6.sent;

          if (!name) {
            _context6.next = 17;
            break;
          }

          return _context6.abrupt("return", Object.values(types).find(function (type) {
            return (type.name || "").toLowerCase() === name.toLowerCase();
          }));

        case 17:
          return _context6.abrupt("return", Object.values(types).find(function (type) {
            return type.hash === versionHash;
          }));

        case 18:
          if (versionHash) {
            _context6.next = 22;
            break;
          }

          _context6.next = 21;
          return _regeneratorRuntime.awrap(this.LatestVersionHash({
            objectId: typeId
          }));

        case 21:
          versionHash = _context6.sent;

        case 22:
          _context6.prev = 22;
          this.Log("Looking up type by ID...");

          if (!publicOnly) {
            _context6.next = 34;
            break;
          }

          _context6.next = 27;
          return _regeneratorRuntime.awrap(this.ContentObjectMetadata({
            libraryId: this.contentSpaceLibraryId,
            objectId: typeId,
            versionHash: versionHash,
            metadataSubtree: "public"
          }));

        case 27:
          _context6.t0 = _context6.sent;

          if (_context6.t0) {
            _context6.next = 30;
            break;
          }

          _context6.t0 = {};

        case 30:
          _context6.t1 = _context6.t0;
          metadata = {
            "public": _context6.t1
          };
          _context6.next = 40;
          break;

        case 34:
          _context6.next = 36;
          return _regeneratorRuntime.awrap(this.ContentObjectMetadata({
            libraryId: this.contentSpaceLibraryId,
            objectId: typeId,
            versionHash: versionHash
          }));

        case 36:
          _context6.t2 = _context6.sent;

          if (_context6.t2) {
            _context6.next = 39;
            break;
          }

          _context6.t2 = {};

        case 39:
          metadata = _context6.t2;

        case 40:
          return _context6.abrupt("return", {
            id: typeId,
            hash: versionHash,
            name: metadata["public"] && metadata["public"].name || metadata.name || typeId,
            meta: metadata
          });

        case 43:
          _context6.prev = 43;
          _context6.t3 = _context6["catch"](22);
          this.Log("Error looking up content type:");
          this.Log(_context6.t3);
          throw new Error("Content Type ".concat(name || typeId, " is invalid"));

        case 48:
        case "end":
          return _context6.stop();
      }
    }
  }, null, this, [[22, 43]]);
};
/**
 * List all content types accessible to this user.
 *
 * @methodGroup Content Types
 * @namedParams
 *
 * @return {Promise<Object>} - Available content types
 */


exports.ContentTypes = function _callee8() {
  var _this3 = this;

  var typeAddresses, contentSpaceTypes, contentSpaceTypeAddresses;
  return _regeneratorRuntime.async(function _callee8$(_context8) {
    while (1) {
      switch (_context8.prev = _context8.next) {
        case 0:
          this.contentTypes = this.contentTypes || {};
          this.Log("Looking up all available content types"); // Personally available types

          _context8.next = 4;
          return _regeneratorRuntime.awrap(this.Collection({
            collectionType: "contentTypes"
          }));

        case 4:
          typeAddresses = _context8.sent;
          this.Log("Personally available types:");
          this.Log(typeAddresses); // Content space types

          _context8.next = 9;
          return _regeneratorRuntime.awrap(this.ContentObjectMetadata({
            libraryId: this.contentSpaceLibraryId,
            objectId: this.contentSpaceObjectId,
            metadataSubtree: "public/contentTypes"
          }));

        case 9:
          _context8.t0 = _context8.sent;

          if (_context8.t0) {
            _context8.next = 12;
            break;
          }

          _context8.t0 = {};

        case 12:
          contentSpaceTypes = _context8.t0;
          contentSpaceTypeAddresses = Object.values(contentSpaceTypes).map(function (typeId) {
            return _this3.utils.HashToAddress(typeId);
          });
          this.Log("Content space types:");
          this.Log(contentSpaceTypeAddresses);
          typeAddresses = typeAddresses.concat(contentSpaceTypeAddresses).filter(function (address) {
            return address;
          }).map(function (address) {
            return _this3.utils.FormatAddress(address);
          }).filter(function (v, i, a) {
            return a.indexOf(v) === i;
          });
          _context8.next = 19;
          return _regeneratorRuntime.awrap(Promise.all(typeAddresses.map(function _callee7(typeAddress) {
            var typeId;
            return _regeneratorRuntime.async(function _callee7$(_context7) {
              while (1) {
                switch (_context7.prev = _context7.next) {
                  case 0:
                    typeId = _this3.utils.AddressToObjectId(typeAddress);

                    if (_this3.contentTypes[typeId]) {
                      _context7.next = 11;
                      break;
                    }

                    _context7.prev = 2;
                    _context7.next = 5;
                    return _regeneratorRuntime.awrap(_this3.ContentType({
                      typeId: typeId,
                      publicOnly: true
                    }));

                  case 5:
                    _this3.contentTypes[typeId] = _context7.sent;
                    _context7.next = 11;
                    break;

                  case 8:
                    _context7.prev = 8;
                    _context7.t0 = _context7["catch"](2);
                    // eslint-disable-next-line no-console
                    console.error(_context7.t0);

                  case 11:
                  case "end":
                    return _context7.stop();
                }
              }
            }, null, null, [[2, 8]]);
          })));

        case 19:
          return _context8.abrupt("return", this.contentTypes);

        case 20:
        case "end":
          return _context8.stop();
      }
    }
  }, null, this);
};
/* Content Libraries */

/**
 * List content libraries - returns a list of content library IDs available to the current user
 *
 * @methodGroup Content Libraries
 *
 * @returns {Promise<Array<string>>}
 */


exports.ContentLibraries = function _callee9() {
  var _this4 = this;

  var libraryAddresses;
  return _regeneratorRuntime.async(function _callee9$(_context9) {
    while (1) {
      switch (_context9.prev = _context9.next) {
        case 0:
          _context9.next = 2;
          return _regeneratorRuntime.awrap(this.Collection({
            collectionType: "libraries"
          }));

        case 2:
          libraryAddresses = _context9.sent;
          return _context9.abrupt("return", libraryAddresses.map(function (address) {
            return _this4.utils.AddressToLibraryId(address);
          }));

        case 4:
        case "end":
          return _context9.stop();
      }
    }
  }, null, this);
};
/**
 * Returns information about the content library
 *
 * @methodGroup Content Libraries
 *
 * @namedParams
 * @param {string} libraryId
 *
 * @returns {Promise<Object>}
 */


exports.ContentLibrary = function _callee10(_ref6) {
  var libraryId, path, library;
  return _regeneratorRuntime.async(function _callee10$(_context10) {
    while (1) {
      switch (_context10.prev = _context10.next) {
        case 0:
          libraryId = _ref6.libraryId;
          ValidateLibrary(libraryId);
          path = UrlJoin("qlibs", libraryId);
          _context10.t0 = _regeneratorRuntime;
          _context10.t1 = this.utils;
          _context10.t2 = this.HttpClient;
          _context10.next = 8;
          return _regeneratorRuntime.awrap(this.authClient.AuthorizationHeader({
            libraryId: libraryId
          }));

        case 8:
          _context10.t3 = _context10.sent;
          _context10.t4 = path;
          _context10.t5 = {
            headers: _context10.t3,
            method: "GET",
            path: _context10.t4
          };
          _context10.t6 = _context10.t2.Request.call(_context10.t2, _context10.t5);
          _context10.t7 = _context10.t1.ResponseToJson.call(_context10.t1, _context10.t6);
          _context10.next = 15;
          return _context10.t0.awrap.call(_context10.t0, _context10.t7);

        case 15:
          library = _context10.sent;
          return _context10.abrupt("return", _objectSpread({}, library, {
            meta: library.meta || {}
          }));

        case 17:
        case "end":
          return _context10.stop();
      }
    }
  }, null, this);
};
/**
 * Returns the address of the owner of the specified content library
 *
 * @methodGroup Content Libraries
 * @namedParams
 * @param {string} libraryId
 *
 * @returns {Promise<string>} - The account address of the owner
 */


exports.ContentLibraryOwner = function _callee11(_ref7) {
  var libraryId;
  return _regeneratorRuntime.async(function _callee11$(_context11) {
    while (1) {
      switch (_context11.prev = _context11.next) {
        case 0:
          libraryId = _ref7.libraryId;
          ValidateLibrary(libraryId);
          _context11.t0 = this.utils;
          _context11.next = 5;
          return _regeneratorRuntime.awrap(this.ethClient.CallContractMethod({
            contractAddress: this.utils.HashToAddress(libraryId),
            methodName: "owner",
            methodArgs: []
          }));

        case 5:
          _context11.t1 = _context11.sent;
          return _context11.abrupt("return", _context11.t0.FormatAddress.call(_context11.t0, _context11.t1));

        case 7:
        case "end":
          return _context11.stop();
      }
    }
  }, null, this);
};
/**
 * Retrieve the allowed content types for the specified library.
 *
 * Note: If no content types have been set on the library, all types are allowed, but an empty hash will be returned.
 *
 * @see <a href="#ContentTypes">ContentTypes</a>
 *
 * @methodGroup Content Libraries
 * @namedParams
 * @param {string} libraryId - ID of the library
 *
 * @returns {Promise<Object>} - List of accepted content types - return format is equivalent to ContentTypes method
 */


exports.LibraryContentTypes = function _callee13(_ref8) {
  var _this5 = this;

  var libraryId, typesLength, allowedTypes;
  return _regeneratorRuntime.async(function _callee13$(_context13) {
    while (1) {
      switch (_context13.prev = _context13.next) {
        case 0:
          libraryId = _ref8.libraryId;
          ValidateLibrary(libraryId);
          this.Log("Retrieving library content types for ".concat(libraryId));
          _context13.next = 5;
          return _regeneratorRuntime.awrap(this.ethClient.CallContractMethod({
            contractAddress: this.utils.HashToAddress(libraryId),
            methodName: "contentTypesLength",
            methodArgs: []
          }));

        case 5:
          typesLength = _context13.sent.toNumber();
          this.Log("".concat(typesLength, " types")); // No allowed types set - any type accepted

          if (!(typesLength === 0)) {
            _context13.next = 9;
            break;
          }

          return _context13.abrupt("return", {});

        case 9:
          // Get the list of allowed content type addresses
          allowedTypes = {};
          _context13.next = 12;
          return _regeneratorRuntime.awrap(Promise.all(Array.from(new Array(typesLength), function _callee12(_, i) {
            var typeAddress, typeId;
            return _regeneratorRuntime.async(function _callee12$(_context12) {
              while (1) {
                switch (_context12.prev = _context12.next) {
                  case 0:
                    _context12.next = 2;
                    return _regeneratorRuntime.awrap(_this5.ethClient.CallContractMethod({
                      contractAddress: _this5.utils.HashToAddress(libraryId),
                      methodName: "contentTypes",
                      methodArgs: [i]
                    }));

                  case 2:
                    typeAddress = _context12.sent;
                    typeId = _this5.utils.AddressToObjectId(typeAddress);
                    _context12.next = 6;
                    return _regeneratorRuntime.awrap(_this5.ContentType({
                      typeId: typeId
                    }));

                  case 6:
                    allowedTypes[typeId] = _context12.sent;

                  case 7:
                  case "end":
                    return _context12.stop();
                }
              }
            });
          })));

        case 12:
          this.Log(allowedTypes);
          return _context13.abrupt("return", allowedTypes);

        case 14:
        case "end":
          return _context13.stop();
      }
    }
  }, null, this);
};
/* Content Objects */

/**
 * List content objects in the specified library
 *
 * @methodGroup Content Objects
 * @namedParams
 * @param {string} libraryId - ID of the library
 * @param {object=} filterOptions - Pagination, sorting and filtering options
 * @param {number=} filterOptions.start - Start index for pagination
 * @param {number=} filterOptions.limit - Max number of objects to return
 * @param {string=} filterOptions.cacheId - Cache ID corresponding a previous query
 * @param {(Array<string> | string)=} filterOptions.sort - Sort by the specified key(s)
 * * @param {boolean=} filterOptions.sortDesc=false - Sort in descending order
 * @param {(Array<string> | string)=} filterOptions.select - Include only the specified metadata keys
 * @param {(Array<object> | object)=} filterOptions.filter - Filter objects by metadata
 * @param {string=} filterOptions.filter.key - Key to filter on
 * @param {string=} filterOptions.filter.type - Type of filter to use for the specified key:
 * - eq, neq, lt, lte, gt, gte, cnt (contains), ncnt (does not contain),
 * @param {string=} filterOptions.filter.filter - Filter for the specified key
 *
 * @returns {Promise<Array<Object>>} - List of objects in library
 */


exports.ContentObjects = function _callee14(_ref9) {
  var libraryId, _ref9$filterOptions, filterOptions, path, queryParams, filterTypeMap, addFilter;

  return _regeneratorRuntime.async(function _callee14$(_context14) {
    while (1) {
      switch (_context14.prev = _context14.next) {
        case 0:
          libraryId = _ref9.libraryId, _ref9$filterOptions = _ref9.filterOptions, filterOptions = _ref9$filterOptions === void 0 ? {} : _ref9$filterOptions;
          ValidateLibrary(libraryId);
          this.Log("Retrieving content objects from ".concat(libraryId));
          path = UrlJoin("qlibs", libraryId, "q");
          queryParams = {
            filter: []
          }; // Cache ID

          if (filterOptions.cacheId) {
            queryParams.cache_id = filterOptions.cacheId;
          } // Start index


          if (filterOptions.start) {
            queryParams.start = filterOptions.start;
          } // Limit


          if (filterOptions.limit) {
            queryParams.limit = filterOptions.limit;
          } // Metadata select options


          if (filterOptions.select) {
            queryParams.select = filterOptions.select;
          } // Sorting options


          if (filterOptions.sort) {
            // Sort keys
            queryParams.sort_by = filterOptions.sort; // Sort order

            if (filterOptions.sortDesc) {
              queryParams.sort_descending = true;
            }
          } // Filters


          filterTypeMap = {
            eq: ":eq:",
            neq: ":ne:",
            lt: ":lt:",
            lte: ":le:",
            gt: ":gt:",
            gte: ":ge:",
            cnt: ":co:",
            ncnt: ":nc:"
          };

          addFilter = function addFilter(_ref10) {
            var key = _ref10.key,
                type = _ref10.type,
                filter = _ref10.filter;
            queryParams.filter.push("".concat(key).concat(filterTypeMap[type]).concat(filter));
          };

          if (filterOptions.filter) {
            if (Array.isArray(filterOptions.filter)) {
              filterOptions.filter.forEach(function (filter) {
                return addFilter(filter);
              });
            } else {
              addFilter(filterOptions.filter);
            }
          }

          this.Log("Filter options:");
          this.Log(filterOptions);
          _context14.t0 = _regeneratorRuntime;
          _context14.t1 = this.utils;
          _context14.t2 = this.HttpClient;
          _context14.next = 20;
          return _regeneratorRuntime.awrap(this.authClient.AuthorizationHeader({
            libraryId: libraryId
          }));

        case 20:
          _context14.t3 = _context14.sent;
          _context14.t4 = path;
          _context14.t5 = queryParams;
          _context14.t6 = {
            headers: _context14.t3,
            method: "GET",
            path: _context14.t4,
            queryParams: _context14.t5
          };
          _context14.t7 = _context14.t2.Request.call(_context14.t2, _context14.t6);
          _context14.t8 = _context14.t1.ResponseToJson.call(_context14.t1, _context14.t7);
          _context14.next = 28;
          return _context14.t0.awrap.call(_context14.t0, _context14.t8);

        case 28:
          return _context14.abrupt("return", _context14.sent);

        case 29:
        case "end":
          return _context14.stop();
      }
    }
  }, null, this);
};
/**
 * Get a specific content object in the library
 *
 * @methodGroup Content Objects
 * @namedParams
 * @param {string=} libraryId - ID of the library
 * @param {string=} objectId - ID of the object
 * @param {string=} versionHash - Version hash of the object -- if not specified, latest version is returned
 *
 * @returns {Promise<Object>} - Description of content object
 */


exports.ContentObject = function _callee15(_ref11) {
  var libraryId, objectId, versionHash, path;
  return _regeneratorRuntime.async(function _callee15$(_context15) {
    while (1) {
      switch (_context15.prev = _context15.next) {
        case 0:
          libraryId = _ref11.libraryId, objectId = _ref11.objectId, versionHash = _ref11.versionHash;
          ValidateParameters({
            libraryId: libraryId,
            objectId: objectId,
            versionHash: versionHash
          });
          this.Log("Retrieving content object: ".concat(libraryId || "", " ").concat(objectId || versionHash));

          if (versionHash) {
            objectId = this.utils.DecodeVersionHash(versionHash).objectId;
          }

          path = UrlJoin("q", versionHash || objectId);
          _context15.t0 = _regeneratorRuntime;
          _context15.t1 = this.utils;
          _context15.t2 = this.HttpClient;
          _context15.next = 10;
          return _regeneratorRuntime.awrap(this.authClient.AuthorizationHeader({
            libraryId: libraryId,
            objectId: objectId,
            versionHash: versionHash
          }));

        case 10:
          _context15.t3 = _context15.sent;
          _context15.t4 = path;
          _context15.t5 = {
            headers: _context15.t3,
            method: "GET",
            path: _context15.t4
          };
          _context15.t6 = _context15.t2.Request.call(_context15.t2, _context15.t5);
          _context15.t7 = _context15.t1.ResponseToJson.call(_context15.t1, _context15.t6);
          _context15.next = 17;
          return _context15.t0.awrap.call(_context15.t0, _context15.t7);

        case 17:
          return _context15.abrupt("return", _context15.sent);

        case 18:
        case "end":
          return _context15.stop();
      }
    }
  }, null, this);
};
/**
 * Returns the address of the owner of the specified content object
 *
 * @methodGroup Content Objects
 * @namedParams
 * @param {string} libraryId
 *
 * @returns {Promise<string>} - The account address of the owner
 */


exports.ContentObjectOwner = function _callee16(_ref12) {
  var objectId;
  return _regeneratorRuntime.async(function _callee16$(_context16) {
    while (1) {
      switch (_context16.prev = _context16.next) {
        case 0:
          objectId = _ref12.objectId;
          ValidateObject(objectId);
          this.Log("Retrieving content object owner: ".concat(objectId));
          _context16.t0 = this.utils;
          _context16.next = 6;
          return _regeneratorRuntime.awrap(this.ethClient.CallContractMethod({
            contractAddress: this.utils.HashToAddress(objectId),
            methodName: "owner",
            methodArgs: []
          }));

        case 6:
          _context16.t1 = _context16.sent;
          return _context16.abrupt("return", _context16.t0.FormatAddress.call(_context16.t0, _context16.t1));

        case 8:
        case "end":
          return _context16.stop();
      }
    }
  }, null, this);
};
/**
 * Retrieve the library ID for the specified content object
 *
 * @methodGroup Content Objects
 *
 * @namedParams
 * @param {string=} objectId - ID of the object
 * @param {string=} versionHash - Version hash of the object
 *
 * @returns {Promise<string>} - Library ID of the object
 */


exports.ContentObjectLibraryId = function _callee18(_ref13) {
  var _this6 = this;

  var objectId, versionHash;
  return _regeneratorRuntime.async(function _callee18$(_context18) {
    while (1) {
      switch (_context18.prev = _context18.next) {
        case 0:
          objectId = _ref13.objectId, versionHash = _ref13.versionHash;
          versionHash ? ValidateVersion(versionHash) : ValidateObject(objectId);

          if (versionHash) {
            objectId = this.utils.DecodeVersionHash(versionHash).objectId;
          }

          _context18.next = 5;
          return _regeneratorRuntime.awrap(this.authClient.AccessType(objectId));

        case 5:
          _context18.t0 = _context18.sent;
          _context18.next = _context18.t0 === this.authClient.ACCESS_TYPES.LIBRARY ? 8 : _context18.t0 === this.authClient.ACCESS_TYPES.OBJECT ? 9 : _context18.t0 === this.authClient.ACCESS_TYPES.OTHER ? 20 : 21;
          break;

        case 8:
          return _context18.abrupt("return", this.utils.AddressToLibraryId(this.utils.HashToAddress(objectId)));

        case 9:
          if (!this.objectLibraryIds[objectId]) {
            this.Log("Retrieving content object library ID: ".concat(objectId || versionHash));
            this.objectLibraryIds[objectId] = new Promise(function _callee17(resolve, reject) {
              return _regeneratorRuntime.async(function _callee17$(_context17) {
                while (1) {
                  switch (_context17.prev = _context17.next) {
                    case 0:
                      _context17.prev = 0;
                      _context17.t0 = resolve;
                      _context17.t1 = _this6.utils;
                      _context17.next = 5;
                      return _regeneratorRuntime.awrap(_this6.CallContractMethod({
                        contractAddress: _this6.utils.HashToAddress(objectId),
                        methodName: "libraryAddress"
                      }));

                    case 5:
                      _context17.t2 = _context17.sent;
                      _context17.t3 = _context17.t1.AddressToLibraryId.call(_context17.t1, _context17.t2);
                      (0, _context17.t0)(_context17.t3);
                      _context17.next = 13;
                      break;

                    case 10:
                      _context17.prev = 10;
                      _context17.t4 = _context17["catch"](0);
                      reject(_context17.t4);

                    case 13:
                    case "end":
                      return _context17.stop();
                  }
                }
              }, null, null, [[0, 10]]);
            });
          }

          _context18.prev = 10;
          _context18.next = 13;
          return _regeneratorRuntime.awrap(this.objectLibraryIds[objectId]);

        case 13:
          return _context18.abrupt("return", _context18.sent);

        case 16:
          _context18.prev = 16;
          _context18.t1 = _context18["catch"](10);
          delete this.objectLibraryIds[objectId];
          throw _context18.t1;

        case 20:
          throw Error("Unable to retrieve library ID for ".concat(versionHash || objectId, ": Unknown type. (wrong network or deleted object?)"));

        case 21:
          return _context18.abrupt("return", this.contentSpaceLibraryId);

        case 22:
        case "end":
          return _context18.stop();
      }
    }
  }, null, this, [[10, 16]]);
};

exports.ProduceMetadataLinks = function _callee21(_ref14) {
  var _this7 = this;

  var libraryId, objectId, versionHash, _ref14$path, path, metadata, authorizationToken, result;

  return _regeneratorRuntime.async(function _callee21$(_context21) {
    while (1) {
      switch (_context21.prev = _context21.next) {
        case 0:
          libraryId = _ref14.libraryId, objectId = _ref14.objectId, versionHash = _ref14.versionHash, _ref14$path = _ref14.path, path = _ref14$path === void 0 ? "/" : _ref14$path, metadata = _ref14.metadata, authorizationToken = _ref14.authorizationToken;

          if (!(!metadata || _typeof(metadata) !== "object")) {
            _context21.next = 3;
            break;
          }

          return _context21.abrupt("return", metadata);

        case 3:
          if (!Array.isArray(metadata)) {
            _context21.next = 7;
            break;
          }

          _context21.next = 6;
          return _regeneratorRuntime.awrap(this.utils.LimitedMap(5, metadata, function _callee19(entry, i) {
            return _regeneratorRuntime.async(function _callee19$(_context19) {
              while (1) {
                switch (_context19.prev = _context19.next) {
                  case 0:
                    _context19.next = 2;
                    return _regeneratorRuntime.awrap(_this7.ProduceMetadataLinks({
                      libraryId: libraryId,
                      objectId: objectId,
                      versionHash: versionHash,
                      path: UrlJoin(path, i.toString()),
                      metadata: entry,
                      authorizationToken: authorizationToken
                    }));

                  case 2:
                    return _context19.abrupt("return", _context19.sent);

                  case 3:
                  case "end":
                    return _context19.stop();
                }
              }
            });
          }));

        case 6:
          return _context21.abrupt("return", _context21.sent);

        case 7:
          if (!(metadata["/"] && (metadata["/"].match(/\.\/(rep|files)\/.+/) || metadata["/"].match(/^\/?qfab\/([\w]+)\/?(rep|files)\/.+/)))) {
            _context21.next = 16;
            break;
          }

          _context21.t0 = _objectSpread;
          _context21.t1 = {};
          _context21.t2 = metadata;
          _context21.next = 13;
          return _regeneratorRuntime.awrap(this.LinkUrl({
            libraryId: libraryId,
            objectId: objectId,
            versionHash: versionHash,
            linkPath: path,
            authorizationToken: authorizationToken
          }));

        case 13:
          _context21.t3 = _context21.sent;
          _context21.t4 = {
            url: _context21.t3
          };
          return _context21.abrupt("return", (0, _context21.t0)(_context21.t1, _context21.t2, _context21.t4));

        case 16:
          result = {};
          _context21.next = 19;
          return _regeneratorRuntime.awrap(this.utils.LimitedMap(5, Object.keys(metadata), function _callee20(key) {
            return _regeneratorRuntime.async(function _callee20$(_context20) {
              while (1) {
                switch (_context20.prev = _context20.next) {
                  case 0:
                    _context20.next = 2;
                    return _regeneratorRuntime.awrap(_this7.ProduceMetadataLinks({
                      libraryId: libraryId,
                      objectId: objectId,
                      versionHash: versionHash,
                      path: UrlJoin(path, key),
                      metadata: metadata[key],
                      authorizationToken: authorizationToken
                    }));

                  case 2:
                    result[key] = _context20.sent;

                  case 3:
                  case "end":
                    return _context20.stop();
                }
              }
            });
          }));

        case 19:
          return _context21.abrupt("return", result);

        case 20:
        case "end":
          return _context21.stop();
      }
    }
  }, null, this);
};

exports.MetadataAuth = function _callee22(_ref15) {
  var libraryId, objectId, versionHash, _ref15$path, path, _ref15$channelAuth, channelAuth, visibility, accessType, isPublic, noAuth, kmsAddress;

  return _regeneratorRuntime.async(function _callee22$(_context22) {
    while (1) {
      switch (_context22.prev = _context22.next) {
        case 0:
          libraryId = _ref15.libraryId, objectId = _ref15.objectId, versionHash = _ref15.versionHash, _ref15$path = _ref15.path, path = _ref15$path === void 0 ? "/" : _ref15$path, _ref15$channelAuth = _ref15.channelAuth, channelAuth = _ref15$channelAuth === void 0 ? false : _ref15$channelAuth;
          ValidateParameters({
            libraryId: libraryId,
            objectId: objectId,
            versionHash: versionHash
          });

          if (versionHash) {
            objectId = this.utils.DecodeVersionHash(versionHash).objectId;
          }

          _context22.next = 5;
          return _regeneratorRuntime.awrap(this.Visibility({
            id: objectId
          }));

        case 5:
          visibility = _context22.sent;
          _context22.next = 8;
          return _regeneratorRuntime.awrap(this.AccessType({
            id: objectId
          }));

        case 8:
          accessType = _context22.sent;
          isPublic = (path || "").replace(/^\/+/, "").startsWith("public");
          noAuth = visibility >= 10 || isPublic && visibility >= 1;

          if (!this.oauthToken) {
            _context22.next = 19;
            break;
          }

          _context22.next = 14;
          return _regeneratorRuntime.awrap(this.authClient.KMSAddress({
            objectId: objectId,
            versionHash: versionHash
          }));

        case 14:
          kmsAddress = _context22.sent;

          if (!(kmsAddress && !this.utils.EqualAddress(kmsAddress, this.utils.nullAddress))) {
            _context22.next = 19;
            break;
          }

          _context22.next = 18;
          return _regeneratorRuntime.awrap(this.authClient.AuthorizationToken({
            libraryId: libraryId,
            objectId: objectId,
            versionHash: versionHash,
            channelAuth: true,
            oauthToken: this.oauthToken
          }));

        case 18:
          return _context22.abrupt("return", _context22.sent);

        case 19:
          if (!(!this.inaccessibleLibraries[libraryId] && isPublic && accessType === this.authClient.ACCESS_TYPES.OBJECT && !channelAuth)) {
            _context22.next = 47;
            break;
          }

          _context22.prev = 20;
          _context22.t0 = _regeneratorRuntime;
          _context22.t1 = this.authClient;
          _context22.t2 = libraryId;

          if (_context22.t2) {
            _context22.next = 28;
            break;
          }

          _context22.next = 27;
          return _regeneratorRuntime.awrap(this.ContentObjectLibraryId({
            objectId: objectId,
            versionHash: versionHash
          }));

        case 27:
          _context22.t2 = _context22.sent;

        case 28:
          _context22.t3 = _context22.t2;
          _context22.t4 = noAuth;
          _context22.t5 = {
            libraryId: _context22.t3,
            noAuth: _context22.t4
          };
          _context22.t6 = _context22.t1.AuthorizationToken.call(_context22.t1, _context22.t5);
          _context22.next = 34;
          return _context22.t0.awrap.call(_context22.t0, _context22.t6);

        case 34:
          return _context22.abrupt("return", _context22.sent);

        case 37:
          _context22.prev = 37;
          _context22.t7 = _context22["catch"](20);

          if (!(_context22.t7.message && _context22.t7.message.toLowerCase().startsWith("access denied"))) {
            _context22.next = 44;
            break;
          }

          this.inaccessibleLibraries[libraryId] = true;
          _context22.next = 43;
          return _regeneratorRuntime.awrap(this.authClient.AuthorizationToken({
            libraryId: libraryId,
            objectId: objectId,
            versionHash: versionHash,
            noAuth: noAuth,
            channelAuth: channelAuth
          }));

        case 43:
          return _context22.abrupt("return", _context22.sent);

        case 44:
          throw _context22.t7;

        case 45:
          _context22.next = 50;
          break;

        case 47:
          _context22.next = 49;
          return _regeneratorRuntime.awrap(this.authClient.AuthorizationToken({
            libraryId: libraryId,
            objectId: objectId,
            versionHash: versionHash,
            noAuth: noAuth,
            channelAuth: channelAuth
          }));

        case 49:
          return _context22.abrupt("return", _context22.sent);

        case 50:
        case "end":
          return _context22.stop();
      }
    }
  }, null, this, [[20, 37]]);
};
/**
 * Get the metadata of a content object
 *
 * @methodGroup Metadata
 * @namedParams
 * @param {string=} libraryId - ID of the library
 * @param {string=} objectId - ID of the object
 * @param {string=} versionHash - Version of the object -- if not specified, latest version is used
 * @param {string=} writeToken - Write token of an object draft - if specified, will read metadata from the draft
 * @param {string=} metadataSubtree - Subtree of the object metadata to retrieve
 * @param {Object=} queryParams={} - Additional query params for the call
 * @param {Array<string>=} select - Limit the returned metadata to the specified attributes
 * - Note: Selection is relative to "metadataSubtree". For example, metadataSubtree="public" and select=["name", "description"] would select "public/name" and "public/description"
 * @param {Array<string>=} remove - Exclude the specified items from the retrieved metadata
 * @param {string=} authorizationToken - Additional authorization token for this request
 * @param {boolean=} resolveLinks=false - If specified, links in the metadata will be resolved
 * @param {boolean=} resolveIncludeSource=false - If specified, resolved links will include the hash of the link at the root of the metadata

   Example:

       {
          "resolved-link": {
            ".": {
              "source": "hq__HPXNia6UtXyuUr6G3Lih8PyUhvYYHuyLTt3i7qSfYgYBB7sF1suR7ky7YRXsUARUrTB1Um1x5a"
            },
            "public": {
              "name": "My Linked Object",
            }
            ...
          }
       }

 * @param {boolean=} resolveIgnoreErrors=false - If specified, link errors within the requested metadata will not cause the entire response to result in an error
 * @param {number=} linkDepthLimit=1 - Limit link resolution to the specified depth. Default link depth is 1 (only links directly in the object's metadata will be resolved)
 * @param {boolean=} produceLinkUrls=false - If specified, file and rep links will automatically be populated with a
 * full URL
 *
 * @returns {Promise<Object | string>} - Metadata of the content object
 */


exports.ContentObjectMetadata = function _callee23(_ref16) {
  var libraryId, objectId, versionHash, writeToken, _ref16$metadataSubtre, metadataSubtree, _ref16$queryParams, queryParams, _ref16$select, select, _ref16$remove, remove, authorizationToken, _ref16$resolveLinks, resolveLinks, _ref16$resolveInclude, resolveIncludeSource, _ref16$resolveIgnoreE, resolveIgnoreErrors, _ref16$linkDepthLimit, linkDepthLimit, _ref16$produceLinkUrl, produceLinkUrls, path, authToken, metadata;

  return _regeneratorRuntime.async(function _callee23$(_context23) {
    while (1) {
      switch (_context23.prev = _context23.next) {
        case 0:
          libraryId = _ref16.libraryId, objectId = _ref16.objectId, versionHash = _ref16.versionHash, writeToken = _ref16.writeToken, _ref16$metadataSubtre = _ref16.metadataSubtree, metadataSubtree = _ref16$metadataSubtre === void 0 ? "/" : _ref16$metadataSubtre, _ref16$queryParams = _ref16.queryParams, queryParams = _ref16$queryParams === void 0 ? {} : _ref16$queryParams, _ref16$select = _ref16.select, select = _ref16$select === void 0 ? [] : _ref16$select, _ref16$remove = _ref16.remove, remove = _ref16$remove === void 0 ? [] : _ref16$remove, authorizationToken = _ref16.authorizationToken, _ref16$resolveLinks = _ref16.resolveLinks, resolveLinks = _ref16$resolveLinks === void 0 ? false : _ref16$resolveLinks, _ref16$resolveInclude = _ref16.resolveIncludeSource, resolveIncludeSource = _ref16$resolveInclude === void 0 ? false : _ref16$resolveInclude, _ref16$resolveIgnoreE = _ref16.resolveIgnoreErrors, resolveIgnoreErrors = _ref16$resolveIgnoreE === void 0 ? false : _ref16$resolveIgnoreE, _ref16$linkDepthLimit = _ref16.linkDepthLimit, linkDepthLimit = _ref16$linkDepthLimit === void 0 ? 1 : _ref16$linkDepthLimit, _ref16$produceLinkUrl = _ref16.produceLinkUrls, produceLinkUrls = _ref16$produceLinkUrl === void 0 ? false : _ref16$produceLinkUrl;
          ValidateParameters({
            libraryId: libraryId,
            objectId: objectId,
            versionHash: versionHash
          });
          this.Log("Retrieving content object metadata: ".concat(libraryId || "", " ").concat(objectId || versionHash, " ").concat(writeToken || "", "\n       Subtree: ").concat(metadataSubtree));

          if (versionHash) {
            objectId = this.utils.DecodeVersionHash(versionHash).objectId;
          }

          path = UrlJoin("q", writeToken || versionHash || objectId, "meta", metadataSubtree); // Main authorization

          _context23.next = 7;
          return _regeneratorRuntime.awrap(this.MetadataAuth({
            libraryId: libraryId,
            objectId: objectId,
            versionHash: versionHash,
            path: metadataSubtree
          }));

        case 7:
          authToken = _context23.sent;
          // Additional authorization
          queryParams.authorization = [queryParams.authorization, authorizationToken].flat().filter(function (token) {
            return token;
          });
          _context23.prev = 9;
          _context23.next = 12;
          return _regeneratorRuntime.awrap(this.utils.ResponseToJson(this.HttpClient.Request({
            headers: {
              "Authorization": "Bearer ".concat(authToken)
            },
            queryParams: _objectSpread({}, queryParams, {
              select: select,
              remove: remove,
              link_depth: linkDepthLimit,
              resolve: resolveLinks,
              resolve_include_source: resolveIncludeSource,
              resolve_ignore_errors: resolveIgnoreErrors
            }),
            method: "GET",
            path: path
          })));

        case 12:
          metadata = _context23.sent;
          _context23.next = 20;
          break;

        case 15:
          _context23.prev = 15;
          _context23.t0 = _context23["catch"](9);

          if (!(_context23.t0.status !== 404)) {
            _context23.next = 19;
            break;
          }

          throw _context23.t0;

        case 19:
          metadata = metadataSubtree === "/" ? {} : undefined;

        case 20:
          if (produceLinkUrls) {
            _context23.next = 22;
            break;
          }

          return _context23.abrupt("return", metadata);

        case 22:
          _context23.next = 24;
          return _regeneratorRuntime.awrap(this.ProduceMetadataLinks({
            libraryId: libraryId,
            objectId: objectId,
            versionHash: versionHash,
            path: metadataSubtree,
            metadata: metadata,
            authorizationToken: authorizationToken
          }));

        case 24:
          return _context23.abrupt("return", _context23.sent);

        case 25:
        case "end":
          return _context23.stop();
      }
    }
  }, null, this, [[9, 15]]);
};
/** Retrive public/asset_metadata from the specified object, performing automatic localization override based on the specified localization info.
 *
 * File and rep links will have urls generated automatically within them (See the `produceLinkUrls` parameter in `ContentObjectMetadata`)
 *
 * @methodGroup Content Objects
 * @namedParams
 * @param {string=} libraryId - ID of the library
 * @param {string=} objectId - ID of the object
 * @param {string=} versionHash - Version of the object -- if not specified, latest version is used
 * @param {Object=} metadata - If you have already retrieved metadata for the object and just want to perform localization, the metadata <i>(Starting from public/asset_metadata)</i> can be
 * provided to avoid re-fetching the metadata.
 * @param {Array} localization - A list of locations of localized metadata, ordered from highest to lowest priority

     localization: [
       ["info_territories", "France", "FR"],
       ["info_locals", "FR"]
     ]

 * @returns {Promise<Object>} - public/asset_metadata of the specified object, overwritten with specified localization
 * @param {boolean=} produceLinkUrls=false - If specified, file and rep links will automatically be populated with a
 * full URL
 */


exports.AssetMetadata = function _callee24(_ref17) {
  var _this8 = this;

  var libraryId, objectId, versionHash, metadata, localization, _ref17$produceLinkUrl, produceLinkUrls;

  return _regeneratorRuntime.async(function _callee24$(_context24) {
    while (1) {
      switch (_context24.prev = _context24.next) {
        case 0:
          libraryId = _ref17.libraryId, objectId = _ref17.objectId, versionHash = _ref17.versionHash, metadata = _ref17.metadata, localization = _ref17.localization, _ref17$produceLinkUrl = _ref17.produceLinkUrls, produceLinkUrls = _ref17$produceLinkUrl === void 0 ? false : _ref17$produceLinkUrl;
          ValidateParameters({
            libraryId: libraryId,
            objectId: objectId,
            versionHash: versionHash
          });

          if (!objectId) {
            objectId = this.utils.DecodeVersionHash(versionHash).objectId;
          }

          if (metadata) {
            _context24.next = 12;
            break;
          }

          _context24.next = 6;
          return _regeneratorRuntime.awrap(this.ContentObjectMetadata({
            libraryId: libraryId,
            objectId: objectId,
            versionHash: versionHash,
            metadataSubtree: "public/asset_metadata",
            resolveLinks: true,
            linkDepthLimit: 2,
            resolveIgnoreErrors: true,
            produceLinkUrls: produceLinkUrls
          }));

        case 6:
          _context24.t0 = _context24.sent;

          if (_context24.t0) {
            _context24.next = 9;
            break;
          }

          _context24.t0 = {};

        case 9:
          metadata = _context24.t0;
          _context24.next = 16;
          break;

        case 12:
          if (!produceLinkUrls) {
            _context24.next = 16;
            break;
          }

          _context24.next = 15;
          return _regeneratorRuntime.awrap(this.ProduceMetadataLinks({
            libraryId: libraryId,
            objectId: objectId,
            versionHash: versionHash,
            path: UrlJoin("public", "asset_metadata"),
            metadata: metadata
          }));

        case 15:
          metadata = _context24.sent;

        case 16:
          if (!metadata.info) {
            metadata.info = {};
          }

          if (localization) {
            localization.reverse().forEach(function (keys) {
              var _this8$utils;

              var overrides = (_this8$utils = _this8.utils).SafeTraverse.apply(_this8$utils, [metadata].concat(_toConsumableArray(keys)));

              if (!overrides) {
                return;
              }

              Object.keys(overrides).forEach(function (overrideKey) {
                if (overrideKey === "info") {
                  Object.keys(overrides.info).forEach(function (infoOverrideKey) {
                    var value = overrides.info[infoOverrideKey];

                    if (_typeof(value) === "object" && Object.keys(value).length === 0 || Array.isArray(value) && value.length === 0) {
                      return;
                    }

                    metadata.info[infoOverrideKey] = value;
                  });
                } else {
                  var value = overrides[overrideKey];

                  if (_typeof(value) === "object" && Object.keys(value).length === 0 || Array.isArray(value) && value.length === 0) {
                    return;
                  }

                  metadata[overrideKey] = value;
                }
              }); //delete metadata[keys[0]];
            });
          }

          return _context24.abrupt("return", metadata);

        case 19:
        case "end":
          return _context24.stop();
      }
    }
  }, null, this);
};
/**
 * List the versions of a content object
 *
 * @methodGroup Content Objects
 * @namedParams
 * @param {string} libraryId - ID of the library
 * @param {string} objectId - ID of the object
 *
 * @returns {Promise<Object>} - Response containing versions of the object
 */


exports.ContentObjectVersions = function _callee25(_ref18) {
  var libraryId, objectId, path;
  return _regeneratorRuntime.async(function _callee25$(_context25) {
    while (1) {
      switch (_context25.prev = _context25.next) {
        case 0:
          libraryId = _ref18.libraryId, objectId = _ref18.objectId;
          ValidateParameters({
            libraryId: libraryId,
            objectId: objectId
          });
          this.Log("Retrieving content object versions: ".concat(libraryId || "", " ").concat(objectId));
          path = UrlJoin("qid", objectId);
          _context25.t0 = this.utils;
          _context25.t1 = this.HttpClient;
          _context25.next = 8;
          return _regeneratorRuntime.awrap(this.authClient.AuthorizationHeader({
            libraryId: libraryId,
            objectId: objectId
          }));

        case 8:
          _context25.t2 = _context25.sent;
          _context25.t3 = path;
          _context25.t4 = {
            headers: _context25.t2,
            method: "GET",
            path: _context25.t3
          };
          _context25.t5 = _context25.t1.Request.call(_context25.t1, _context25.t4);
          return _context25.abrupt("return", _context25.t0.ResponseToJson.call(_context25.t0, _context25.t5));

        case 13:
        case "end":
          return _context25.stop();
      }
    }
  }, null, this);
};
/**
 * Retrieve the version hash of the latest version of the specified object
 *
 * @methodGroup Content Objects
 * @namedParams
 * @param {string=} objectId - ID of the object
 * @param {string=} versionHash - Version hash of the object
 *
 * @returns {Promise<string>} - The latest version hash of the object
 */


exports.LatestVersionHash = function _callee26(_ref19) {
  var objectId, versionHash, latestHash, versionCount;
  return _regeneratorRuntime.async(function _callee26$(_context26) {
    while (1) {
      switch (_context26.prev = _context26.next) {
        case 0:
          objectId = _ref19.objectId, versionHash = _ref19.versionHash;

          if (versionHash) {
            objectId = this.utils.DecodeVersionHash(versionHash).objectId;
          }

          ValidateObject(objectId);
          _context26.prev = 3;
          _context26.next = 6;
          return _regeneratorRuntime.awrap(this.CallContractMethod({
            contractAddress: this.utils.HashToAddress(objectId),
            methodName: "objectHash"
          }));

        case 6:
          latestHash = _context26.sent;
          _context26.next = 11;
          break;

        case 9:
          _context26.prev = 9;
          _context26.t0 = _context26["catch"](3);

        case 11:
          if (latestHash) {
            _context26.next = 20;
            break;
          }

          _context26.next = 14;
          return _regeneratorRuntime.awrap(this.CallContractMethod({
            contractAddress: this.utils.HashToAddress(objectId),
            methodName: "countVersionHashes"
          }));

        case 14:
          versionCount = _context26.sent;

          if (versionCount.toNumber()) {
            _context26.next = 17;
            break;
          }

          throw Error("Unable to determine latest version hash for ".concat(versionHash || objectId, " - Item deleted?"));

        case 17:
          _context26.next = 19;
          return _regeneratorRuntime.awrap(this.CallContractMethod({
            contractAddress: this.utils.HashToAddress(objectId),
            methodName: "versionHashes",
            methodArgs: [versionCount - 1]
          }));

        case 19:
          latestHash = _context26.sent;

        case 20:
          return _context26.abrupt("return", latestHash);

        case 21:
        case "end":
          return _context26.stop();
      }
    }
  }, null, this, [[3, 9]]);
};
/* URL Methods */

/**
 * Determine available DRM types available in this browser environment.
 *
 * @methodGroup Media
 * @return {Promise<Array<string>>}
 */


exports.AvailableDRMs = function _callee27() {
  var availableDRMs, info, version, major, minor, _version, _major, _minor, config;

  return _regeneratorRuntime.async(function _callee27$(_context27) {
    while (1) {
      switch (_context27.prev = _context27.next) {
        case 0:
          availableDRMs = ["clear", "aes-128"];

          if (!(typeof window === "undefined")) {
            _context27.next = 3;
            break;
          }

          return _context27.abrupt("return", availableDRMs);

        case 3:
          // Detect iOS > 13.1 or Safari > 13.1 and replace aes-128 with sample-aes
          if (window.navigator && window.navigator.userAgent) {
            // Test iOS
            info = window.navigator.userAgent.match(/(iPad|iPhone|iphone|iPod).*?(OS |os |OS_)(\d+((_|\.)\d)?((_|\.)\d)?)/);

            if (info && info[3]) {
              version = info[3].split("_");
              major = parseInt(version[0]);
              minor = parseInt(version[1]);

              if (major > 13 || major === 13 && minor >= 1) {
                availableDRMs[1] = "sample-aes";
                availableDRMs[2] = "fairplay";
              }
            } // Test Safari


            if (/^((?!chrome|android).)*safari/i.test(window.navigator.userAgent)) {
              _version = window.navigator.userAgent.match(/.+Version\/(\d+)\.(\d+)/);

              if (_version && _version[2]) {
                _major = parseInt(_version[1]);
                _minor = parseInt(_version[2]);

                if (_major > 13 || _major === 13 && _minor >= 1) {
                  availableDRMs[1] = "sample-aes";
                  availableDRMs[2] = "fairplay";
                }
              }
            }
          }

          if (!(typeof window !== "undefined" && typeof window.navigator.requestMediaKeySystemAccess !== "function")) {
            _context27.next = 6;
            break;
          }

          return _context27.abrupt("return", availableDRMs);

        case 6:
          _context27.prev = 6;
          config = [{
            initDataTypes: ["cenc"],
            audioCapabilities: [{
              contentType: "audio/mp4;codecs=\"mp4a.40.2\""
            }],
            videoCapabilities: [{
              contentType: "video/mp4;codecs=\"avc1.42E01E\""
            }]
          }];
          _context27.next = 10;
          return _regeneratorRuntime.awrap(navigator.requestMediaKeySystemAccess("com.widevine.alpha", config));

        case 10:
          availableDRMs.push("widevine"); // eslint-disable-next-line no-empty

          _context27.next = 15;
          break;

        case 13:
          _context27.prev = 13;
          _context27.t0 = _context27["catch"](6);

        case 15:
          return _context27.abrupt("return", availableDRMs);

        case 16:
        case "end":
          return _context27.stop();
      }
    }
  }, null, null, [[6, 13]]);
};

exports.PlayoutPathResolution = function _callee28(_ref20) {
  var libraryId, objectId, versionHash, writeToken, linkPath, handler, _ref20$offering, offering, _ref20$signedLink, signedLink, authorizationToken, path, linkTargetLibraryId, linkTargetId, linkTargetHash, multiOfferingLink, linkInfo;

  return _regeneratorRuntime.async(function _callee28$(_context28) {
    while (1) {
      switch (_context28.prev = _context28.next) {
        case 0:
          libraryId = _ref20.libraryId, objectId = _ref20.objectId, versionHash = _ref20.versionHash, writeToken = _ref20.writeToken, linkPath = _ref20.linkPath, handler = _ref20.handler, _ref20$offering = _ref20.offering, offering = _ref20$offering === void 0 ? "" : _ref20$offering, _ref20$signedLink = _ref20.signedLink, signedLink = _ref20$signedLink === void 0 ? false : _ref20$signedLink, authorizationToken = _ref20.authorizationToken;

          if (libraryId) {
            _context28.next = 5;
            break;
          }

          _context28.next = 4;
          return _regeneratorRuntime.awrap(this.ContentObjectLibraryId({
            objectId: objectId
          }));

        case 4:
          libraryId = _context28.sent;

        case 5:
          if (versionHash) {
            _context28.next = 9;
            break;
          }

          _context28.next = 8;
          return _regeneratorRuntime.awrap(this.LatestVersionHash({
            objectId: objectId
          }));

        case 8:
          versionHash = _context28.sent;

        case 9:
          path = UrlJoin("qlibs", libraryId, "q", writeToken || versionHash, "rep", handler, offering, "options.json");

          if (!linkPath) {
            _context28.next = 26;
            break;
          }

          _context28.next = 13;
          return _regeneratorRuntime.awrap(this.ContentObjectMetadata({
            libraryId: libraryId,
            objectId: objectId,
            versionHash: versionHash,
            writeToken: writeToken,
            metadataSubtree: linkPath,
            resolveLinks: false,
            resolveIgnoreErrors: true,
            resolveIncludeSource: true,
            authorizationToken: authorizationToken
          }));

        case 13:
          linkInfo = _context28.sent;
          multiOfferingLink = !!linkInfo && !!linkInfo["/"] && !linkInfo["/"].endsWith("options.json"); // Default case: Use link path directly

          path = UrlJoin("qlibs", libraryId, "q", writeToken || versionHash, "meta", linkPath);

          if (signedLink) {
            _context28.next = 25;
            break;
          }

          _context28.next = 19;
          return _regeneratorRuntime.awrap(this.LinkTarget({
            libraryId: libraryId,
            objectId: objectId,
            versionHash: versionHash,
            writeToken: writeToken,
            linkPath: linkPath,
            linkInfo: linkInfo,
            authorizationToken: authorizationToken
          }));

        case 19:
          linkTargetHash = _context28.sent;
          linkTargetId = this.utils.DecodeVersionHash(linkTargetHash).objectId;
          _context28.next = 23;
          return _regeneratorRuntime.awrap(this.ContentObjectLibraryId({
            objectId: linkTargetId
          }));

        case 23:
          linkTargetLibraryId = _context28.sent;

          if (!multiOfferingLink && !offering) {
            // If the offering is not specified, the intent is to get available offerings. For a single offering link, must
            // access available offerings on the object directly
            path = UrlJoin("q", linkTargetHash, "rep", handler, "options.json");
          }

        case 25:
          if (multiOfferingLink) {
            // The link points to rep/<handler> instead of rep/<handler>/<offering>/options.json
            path = UrlJoin(path, offering, "options.json");
          }

        case 26:
          return _context28.abrupt("return", {
            path: path,
            multiOfferingLink: multiOfferingLink,
            linkTarget: {
              libraryId: linkTargetLibraryId,
              objectId: linkTargetId,
              versionHash: linkTargetHash
            }
          });

        case 27:
        case "end":
          return _context28.stop();
      }
    }
  }, null, this);
};
/**
 * Retrieve available playout offerings for the specified content
 *
 * @methodGroup Media
 * @param {string=} objectId - Id of the content
 * @param {string=} versionHash - Version hash of the content
 * @param {string=} writeToken - Write token for the content
 * @param {string=} linkPath - If playing from a link, the path to the link
 * @param {boolean=} signedLink - Specify if linkPath is referring to a signed link
 * @param {string=} handler=playout - The handler to use for playout (not used with links)
 * @param {Object=} authorizationToken - Additional authorization token for authorizing this request
 *
 * @return {Promise<Object>} - The available offerings
 */


exports.AvailableOfferings = function _callee29(_ref21) {
  var objectId, versionHash, writeToken, linkPath, signedLink, _ref21$handler, handler, authorizationToken, _ref22, path, authorization;

  return _regeneratorRuntime.async(function _callee29$(_context29) {
    while (1) {
      switch (_context29.prev = _context29.next) {
        case 0:
          objectId = _ref21.objectId, versionHash = _ref21.versionHash, writeToken = _ref21.writeToken, linkPath = _ref21.linkPath, signedLink = _ref21.signedLink, _ref21$handler = _ref21.handler, handler = _ref21$handler === void 0 ? "playout" : _ref21$handler, authorizationToken = _ref21.authorizationToken;

          if (!objectId) {
            objectId = this.utils.DecodeVersionHash(versionHash).objectId;
          }

          _context29.next = 4;
          return _regeneratorRuntime.awrap(this.PlayoutPathResolution({
            objectId: objectId,
            versionHash: versionHash,
            writeToken: writeToken,
            linkPath: linkPath,
            signedLink: signedLink,
            handler: handler
          }));

        case 4:
          _ref22 = _context29.sent;
          path = _ref22.path;
          _context29.prev = 6;
          _context29.t0 = authorizationToken;
          _context29.next = 10;
          return _regeneratorRuntime.awrap(this.authClient.AuthorizationToken({
            objectId: objectId,
            channelAuth: true,
            oauthToken: this.oauthToken
          }));

        case 10:
          _context29.t1 = _context29.sent;

          _context29.t2 = function (token) {
            return token;
          };

          authorization = [_context29.t0, _context29.t1].flat().filter(_context29.t2);
          _context29.next = 15;
          return _regeneratorRuntime.awrap(this.utils.ResponseToJson(this.HttpClient.Request({
            path: path,
            method: "GET",
            headers: {
              Authorization: "Bearer ".concat(authorization.join(","))
            }
          })));

        case 15:
          return _context29.abrupt("return", _context29.sent);

        case 18:
          _context29.prev = 18;
          _context29.t3 = _context29["catch"](6);

          if (!(_context29.t3.status && parseInt(_context29.t3.status) === 500)) {
            _context29.next = 22;
            break;
          }

          return _context29.abrupt("return", {});

        case 22:
          throw _context29.t3;

        case 23:
        case "end":
          return _context29.stop();
      }
    }
  }, null, this, [[6, 18]]);
};
/**
 * Retrieve playout options for the specified content that satisfy the given protocol and DRM requirements
 *
 * The root level playoutOptions[protocol].playoutUrl and playoutOptions[protocol].drms will contain playout
 * information that satisfies the specified DRM requirements (if possible), while playoutOptions[protocol].playoutMethods
 * will contain all available playout options for this content.
 *
 * If only objectId is specified, latest version will be played. To retrieve playout options for
 * a specific version of the content, provide the versionHash parameter (in which case objectId is unnecessary)
 *
 * @methodGroup Media
 * @namedParams
 * @param {string=} objectId - ID of the content
 * @param {string=} versionHash - Version hash of the content
 * @param {string=} writeToken - Write token for the content
 * @param {string=} linkPath - If playing from a link, the path to the link
 * @param {boolean=} signedLink - Specify if linkPath is referring to a signed link
 * @param {Array<string>} protocols=["dash","hls"]] - Acceptable playout protocols ("dash", "hls")
 * @param {Array<string>} drms - Acceptable DRM formats ("clear", "aes-128", "widevine")
 * @param {string=} handler=playout - The handler to use for playout (not used with links)
 * @param {string=} offering=default - The offering to play
 * @param {string=} playoutType - The type of playout
 * @param {Object=} context - Additional audience data to include in the authorization request.
 * - Note: Context must be a map of string->string
 * @param {Object=} authorizationToken - Additional authorization token for authorizing this request
 */


exports.PlayoutOptions = function _callee30(_ref23) {
  var objectId, versionHash, writeToken, linkPath, _ref23$signedLink, signedLink, _ref23$protocols, protocols, _ref23$handler, handler, _ref23$offering, offering, playoutType, _ref23$drms, drms, context, _ref23$hlsjsProfile, hlsjsProfile, authorizationToken, libraryId, offeringPath, link, _ref24, path, linkTarget, audienceData, authorization, queryParams, playoutOptions, playoutMap, i, option, protocol, drm, playoutPath, licenseServers, cert, protocolMatch, drmMatch;

  return _regeneratorRuntime.async(function _callee30$(_context30) {
    while (1) {
      switch (_context30.prev = _context30.next) {
        case 0:
          objectId = _ref23.objectId, versionHash = _ref23.versionHash, writeToken = _ref23.writeToken, linkPath = _ref23.linkPath, _ref23$signedLink = _ref23.signedLink, signedLink = _ref23$signedLink === void 0 ? false : _ref23$signedLink, _ref23$protocols = _ref23.protocols, protocols = _ref23$protocols === void 0 ? ["dash", "hls"] : _ref23$protocols, _ref23$handler = _ref23.handler, handler = _ref23$handler === void 0 ? "playout" : _ref23$handler, _ref23$offering = _ref23.offering, offering = _ref23$offering === void 0 ? "default" : _ref23$offering, playoutType = _ref23.playoutType, _ref23$drms = _ref23.drms, drms = _ref23$drms === void 0 ? [] : _ref23$drms, context = _ref23.context, _ref23$hlsjsProfile = _ref23.hlsjsProfile, hlsjsProfile = _ref23$hlsjsProfile === void 0 ? true : _ref23$hlsjsProfile, authorizationToken = _ref23.authorizationToken;
          versionHash ? ValidateVersion(versionHash) : ValidateObject(objectId);
          protocols = protocols.map(function (p) {
            return p.toLowerCase();
          });
          drms = drms.map(function (d) {
            return d.toLowerCase();
          });

          if (objectId) {
            _context30.next = 8;
            break;
          }

          objectId = this.utils.DecodeVersionHash(versionHash).objectId;
          _context30.next = 12;
          break;

        case 8:
          if (versionHash) {
            _context30.next = 12;
            break;
          }

          _context30.next = 11;
          return _regeneratorRuntime.awrap(this.LatestVersionHash({
            objectId: objectId
          }));

        case 11:
          versionHash = _context30.sent;

        case 12:
          _context30.next = 14;
          return _regeneratorRuntime.awrap(this.ContentObjectLibraryId({
            objectId: objectId
          }));

        case 14:
          libraryId = _context30.sent;
          _context30.prev = 15;

          if (linkPath) {
            _context30.next = 22;
            break;
          }

          offeringPath = UrlJoin("public", "asset_metadata", "sources", offering);
          _context30.next = 20;
          return _regeneratorRuntime.awrap(this.ContentObjectMetadata({
            libraryId: libraryId,
            objectId: objectId,
            versionHash: versionHash,
            metadataSubtree: offeringPath,
            authorizationToken: authorizationToken
          }));

        case 20:
          link = _context30.sent;

          if (link) {
            linkPath = offeringPath;
          }

        case 22:
          _context30.next = 26;
          break;

        case 24:
          _context30.prev = 24;
          _context30.t0 = _context30["catch"](15);

        case 26:
          _context30.next = 28;
          return _regeneratorRuntime.awrap(this.PlayoutPathResolution({
            libraryId: libraryId,
            objectId: objectId,
            versionHash: versionHash,
            writeToken: writeToken,
            linkPath: linkPath,
            signedLink: signedLink,
            handler: handler,
            offering: offering,
            authorizationToken: authorizationToken
          }));

        case 28:
          _ref24 = _context30.sent;
          path = _ref24.path;
          linkTarget = _ref24.linkTarget;
          _context30.t1 = this.authClient;
          _context30.t2 = linkTarget.objectId || objectId;
          _context30.t3 = linkTarget.versionHash || versionHash;

          if (_context30.t3) {
            _context30.next = 38;
            break;
          }

          _context30.next = 37;
          return _regeneratorRuntime.awrap(this.LatestVersionHash({
            objectId: objectId
          }));

        case 37:
          _context30.t3 = _context30.sent;

        case 38:
          _context30.t4 = _context30.t3;
          _context30.t5 = protocols;
          _context30.t6 = drms;
          _context30.t7 = context;
          _context30.t8 = {
            objectId: _context30.t2,
            versionHash: _context30.t4,
            protocols: _context30.t5,
            drms: _context30.t6,
            context: _context30.t7
          };
          audienceData = _context30.t1.AudienceData.call(_context30.t1, _context30.t8);
          _context30.t9 = authorizationToken;
          _context30.next = 47;
          return _regeneratorRuntime.awrap(this.authClient.AuthorizationToken({
            libraryId: libraryId,
            objectId: objectId,
            channelAuth: true,
            oauthToken: this.oauthToken,
            audienceData: audienceData
          }));

        case 47:
          _context30.t10 = _context30.sent;

          _context30.t11 = function (token) {
            return token;
          };

          authorization = [_context30.t9, _context30.t10].flat().filter(_context30.t11);
          queryParams = {
            authorization: authorization,
            resolve: !!linkPath
          };
          _context30.t12 = Object;
          _context30.next = 54;
          return _regeneratorRuntime.awrap(this.utils.ResponseToJson(this.HttpClient.Request({
            path: path,
            method: "GET",
            queryParams: queryParams
          })));

        case 54:
          _context30.t13 = _context30.sent;
          playoutOptions = _context30.t12.values.call(_context30.t12, _context30.t13);

          if (!(!signedLink && linkTarget.versionHash)) {
            _context30.next = 63;
            break;
          }

          _context30.t14 = authorizationToken;
          _context30.next = 60;
          return _regeneratorRuntime.awrap(this.authClient.AuthorizationToken({
            libraryId: linkTarget.libraryId,
            objectId: linkTarget.objectId,
            channelAuth: true,
            oauthToken: this.oauthToken,
            audienceData: audienceData
          }));

        case 60:
          _context30.t15 = _context30.sent;

          _context30.t16 = function (token) {
            return token;
          };

          queryParams.authorization = [_context30.t14, _context30.t15].flat().filter(_context30.t16);

        case 63:
          playoutMap = {};
          i = 0;

        case 65:
          if (!(i < playoutOptions.length)) {
            _context30.next = 107;
            break;
          }

          option = playoutOptions[i];
          protocol = option.properties.protocol;
          drm = option.properties.drm; // Remove authorization parameter from playout path - it's re-added by Rep

          playoutPath = option.uri.split("?")[0];

          if (playoutType) {
            playoutPath = playoutPath.replace("playlist", "playlist-".concat(playoutType));
          }

          licenseServers = option.properties.license_servers;
          cert = option.properties.cert;

          if (hlsjsProfile && protocol === "hls" && drm === "aes-128") {
            queryParams.player_profile = "hls-js";
          } // Create full playout URLs for this protocol / drm combo


          _context30.t17 = _objectSpread;
          _context30.t18 = {};
          _context30.t19 = playoutMap[protocol] || {};
          _context30.t20 = _objectSpread;
          _context30.t21 = {};
          _context30.t22 = (playoutMap[protocol] || {}).playoutMethods || {};
          _context30.t23 = _defineProperty;
          _context30.t24 = {};
          _context30.t25 = drm || "clear";

          if (!signedLink) {
            _context30.next = 89;
            break;
          }

          _context30.next = 86;
          return _regeneratorRuntime.awrap(this.LinkUrl({
            versionHash: versionHash,
            linkPath: UrlJoin(linkPath, offering, playoutPath),
            queryParams: queryParams,
            noAuth: true
          }));

        case 86:
          _context30.t26 = _context30.sent;
          _context30.next = 92;
          break;

        case 89:
          _context30.next = 91;
          return _regeneratorRuntime.awrap(this.Rep({
            libraryId: linkTarget.libraryId || libraryId,
            objectId: linkTarget.objectId || objectId,
            versionHash: linkTarget.versionHash || versionHash,
            rep: UrlJoin(handler, offering, playoutPath),
            noAuth: true,
            queryParams: queryParams
          }));

        case 91:
          _context30.t26 = _context30.sent;

        case 92:
          _context30.t27 = _context30.t26;
          _context30.t28 = drm ? _defineProperty({}, drm, {
            licenseServers: licenseServers,
            cert: cert
          }) : undefined;
          _context30.t29 = {
            playoutUrl: _context30.t27,
            drms: _context30.t28
          };
          _context30.t30 = (0, _context30.t23)(_context30.t24, _context30.t25, _context30.t29);
          _context30.t31 = (0, _context30.t20)(_context30.t21, _context30.t22, _context30.t30);
          _context30.t32 = {
            playoutMethods: _context30.t31
          };
          playoutMap[protocol] = (0, _context30.t17)(_context30.t18, _context30.t19, _context30.t32);
          // Exclude any options that do not satisfy the specified protocols and/or DRMs
          protocolMatch = protocols.includes(protocol);
          drmMatch = drms.includes(drm || "clear") || drms.length === 0 && !drm;

          if (!(!protocolMatch || !drmMatch)) {
            _context30.next = 103;
            break;
          }

          return _context30.abrupt("continue", 104);

        case 103:
          // This protocol / DRM satisfies the specifications (prefer DRM over clear, if available)
          if (!playoutMap[protocol].playoutUrl || drm && drm !== "clear") {
            playoutMap[protocol].playoutUrl = playoutMap[protocol].playoutMethods[drm || "clear"].playoutUrl;
            playoutMap[protocol].drms = playoutMap[protocol].playoutMethods[drm || "clear"].drms;
          }

        case 104:
          i++;
          _context30.next = 65;
          break;

        case 107:
          this.Log(playoutMap);
          return _context30.abrupt("return", playoutMap);

        case 109:
        case "end":
          return _context30.stop();
      }
    }
  }, null, this, [[15, 24]]);
};
/**
 * Retrieve playout options in BitMovin player format for the specified content that satisfy
 * the given protocol and DRM requirements
 *
 * If only objectId is specified, latest version will be played. To retrieve playout options for
 * a specific version of the content, provide the versionHash parameter (in which case objectId is unnecessary)
 *
 * @methodGroup Media
 * @namedParams
 * @param {string=} objectId - ID of the content
 * @param {string=} versionHash - Version hash of the content
 * @param {string=} writeToken - Write token for the content
 * @param {string=} linkPath - If playing from a link, the path to the link
 * @param {boolean=} signedLink - Specify if linkPath is referring to a signed link
 * @param {Array<string>} protocols=["dash","hls"]] - Acceptable playout protocols ("dash", "hls")
 * @param {Array<string>} drms - Acceptable DRM formats ("clear", "aes-128", "sample-aes", "widevine")
 * @param {string=} handler=playout - The handler to use for playout
 * @param {string=} offering=default - The offering to play
 * @param {string=} playoutType - The type of playout
 * @param {Object=} context - Additional audience data to include in the authorization request
 * - Note: Context must be a map of string->string
 * @param {Object=} authorizationToken - Additional authorization token for authorizing this request
 */


exports.BitmovinPlayoutOptions = function _callee31(_ref26) {
  var objectId, versionHash, writeToken, linkPath, _ref26$signedLink, signedLink, _ref26$protocols, protocols, _ref26$drms, drms, _ref26$handler, handler, _ref26$offering, offering, playoutType, context, authorizationToken, playoutOptions, _ref27, linkTarget, authorization, config;

  return _regeneratorRuntime.async(function _callee31$(_context31) {
    while (1) {
      switch (_context31.prev = _context31.next) {
        case 0:
          objectId = _ref26.objectId, versionHash = _ref26.versionHash, writeToken = _ref26.writeToken, linkPath = _ref26.linkPath, _ref26$signedLink = _ref26.signedLink, signedLink = _ref26$signedLink === void 0 ? false : _ref26$signedLink, _ref26$protocols = _ref26.protocols, protocols = _ref26$protocols === void 0 ? ["dash", "hls"] : _ref26$protocols, _ref26$drms = _ref26.drms, drms = _ref26$drms === void 0 ? [] : _ref26$drms, _ref26$handler = _ref26.handler, handler = _ref26$handler === void 0 ? "playout" : _ref26$handler, _ref26$offering = _ref26.offering, offering = _ref26$offering === void 0 ? "default" : _ref26$offering, playoutType = _ref26.playoutType, context = _ref26.context, authorizationToken = _ref26.authorizationToken;
          versionHash ? ValidateVersion(versionHash) : ValidateObject(objectId);

          if (!objectId) {
            objectId = this.utils.DecodeVersionHash(versionHash).objectId;
          }

          _context31.next = 5;
          return _regeneratorRuntime.awrap(this.PlayoutOptions({
            objectId: objectId,
            versionHash: versionHash,
            writeToken: writeToken,
            linkPath: linkPath,
            signedLink: signedLink,
            protocols: protocols,
            drms: drms,
            handler: handler,
            offering: offering,
            playoutType: playoutType,
            hlsjsProfile: false,
            context: context,
            authorizationToken: authorizationToken
          }));

        case 5:
          playoutOptions = _context31.sent;
          delete playoutOptions.playoutMethods;
          _context31.next = 9;
          return _regeneratorRuntime.awrap(this.PlayoutPathResolution({
            objectId: objectId,
            versionHash: versionHash,
            writeToken: writeToken,
            linkPath: linkPath,
            signedLink: signedLink,
            handler: handler,
            offering: offering,
            authorizationToken: authorizationToken
          }));

        case 9:
          _ref27 = _context31.sent;
          linkTarget = _ref27.linkTarget;
          authorization = [];

          if (authorizationToken) {
            authorization.push(authorizationToken);
          }

          if (!(signedLink || !linkTarget.versionHash)) {
            _context31.next = 21;
            break;
          }

          _context31.t0 = authorization;
          _context31.next = 17;
          return _regeneratorRuntime.awrap(this.authClient.AuthorizationToken({
            objectId: objectId,
            channelAuth: true,
            oauthToken: this.oauthToken
          }));

        case 17:
          _context31.t1 = _context31.sent;

          _context31.t0.push.call(_context31.t0, _context31.t1);

          _context31.next = 26;
          break;

        case 21:
          _context31.t2 = authorization;
          _context31.next = 24;
          return _regeneratorRuntime.awrap(this.authClient.AuthorizationToken({
            libraryId: linkTarget.libraryId,
            objectId: linkTarget.objectId,
            channelAuth: true,
            oauthToken: this.oauthToken
          }));

        case 24:
          _context31.t3 = _context31.sent;

          _context31.t2.push.call(_context31.t2, _context31.t3);

        case 26:
          config = {
            drm: {}
          };
          Object.keys(playoutOptions).forEach(function (protocol) {
            var option = playoutOptions[protocol];
            config[protocol] = option.playoutUrl;

            if (option.drms) {
              Object.keys(option.drms).forEach(function (drm) {
                // No license URL specified
                if (!option.drms[drm].licenseServers || option.drms[drm].licenseServers.length === 0) {
                  return;
                } // Opt for https urls


                var filterHTTPS = function filterHTTPS(uri) {
                  return uri.toLowerCase().startsWith("https");
                };

                var licenseUrls = option.drms[drm].licenseServers;

                if (licenseUrls.find(filterHTTPS)) {
                  licenseUrls = licenseUrls.filter(filterHTTPS);
                } // Choose a random license server from the available list


                var licenseUrl = licenseUrls.sort(function () {
                  return 0.5 - Math.random();
                })[0];

                if (!config.drm[drm]) {
                  config.drm[drm] = {
                    LA_URL: licenseUrl,
                    headers: {
                      Authorization: "Bearer ".concat(authorization.flat().filter(function (token) {
                        return token;
                      }).join(","))
                    }
                  };
                }
              });
            }
          });
          return _context31.abrupt("return", config);

        case 29:
        case "end":
          return _context31.stop();
      }
    }
  }, null, this);
};
/**
 * Call the specified bitcode method on the specified object
 *
 * @methodGroup URL Generation
 * @namedParams
 * @param {string=} libraryId - ID of the library
 * @param {string=} objectId - ID of the object
 * @param {string=} versionHash - Hash of the object version - if not specified, latest version will be used
 * @param {string=} writeToken - Write token of an object draft - if calling bitcode of a draft object
 * @param {string} method - Bitcode method to call
 * @param {Object=} queryParams - Query parameters to include in the request
 * @param {Object=} body - Request body to include, if calling a non-constant method
 * @param {Object=} headers - Request headers to include
 * @param {boolean=} constant=true - If specified, a GET request authenticated with an AccessRequest will be made.
 * Otherwise, a POST with an UpdateRequest will be performed
 * @param {string=} format=json - The format of the response
 *
 * @returns {Promise<format>} - The response from the call in the specified format
 */


exports.CallBitcodeMethod = function _callee32(_ref28) {
  var libraryId, objectId, versionHash, writeToken, method, _ref28$queryParams, queryParams, _ref28$body, body, _ref28$headers, headers, _ref28$constant, constant, _ref28$format, format, path, authHeader;

  return _regeneratorRuntime.async(function _callee32$(_context32) {
    while (1) {
      switch (_context32.prev = _context32.next) {
        case 0:
          libraryId = _ref28.libraryId, objectId = _ref28.objectId, versionHash = _ref28.versionHash, writeToken = _ref28.writeToken, method = _ref28.method, _ref28$queryParams = _ref28.queryParams, queryParams = _ref28$queryParams === void 0 ? {} : _ref28$queryParams, _ref28$body = _ref28.body, body = _ref28$body === void 0 ? {} : _ref28$body, _ref28$headers = _ref28.headers, headers = _ref28$headers === void 0 ? {} : _ref28$headers, _ref28$constant = _ref28.constant, constant = _ref28$constant === void 0 ? true : _ref28$constant, _ref28$format = _ref28.format, format = _ref28$format === void 0 ? "json" : _ref28$format;
          ValidateParameters({
            libraryId: libraryId,
            objectId: objectId,
            versionHash: versionHash
          });

          if (method) {
            _context32.next = 4;
            break;
          }

          throw "Bitcode method not specified";

        case 4:
          if (versionHash) {
            objectId = this.utils.DecodeVersionHash(versionHash).objectId;
          }

          path = UrlJoin("q", writeToken || versionHash || objectId, "call", method);

          if (libraryId) {
            path = UrlJoin("qlibs", libraryId, path);
          }

          authHeader = headers.authorization || headers.Authorization;

          if (authHeader) {
            _context32.next = 12;
            break;
          }

          _context32.next = 11;
          return _regeneratorRuntime.awrap(this.authClient.AuthorizationHeader({
            libraryId: libraryId,
            objectId: objectId,
            update: !constant
          }));

        case 11:
          headers.Authorization = _context32.sent.Authorization;

        case 12:
          this.Log("Calling bitcode method: ".concat(libraryId || "", " ").concat(objectId || versionHash, " ").concat(writeToken || "", "\n      ").concat(constant ? "GET" : "POST", " ").concat(path, "\n      Query Params:\n      ").concat(JSON.stringify(queryParams || ""), "\n      Body:\n      ").concat(JSON.stringify(body || ""), "\n      Headers\n      ").concat(JSON.stringify(headers || "")));
          _context32.t0 = this.utils;
          _context32.t1 = format;
          _context32.next = 17;
          return _regeneratorRuntime.awrap(this.HttpClient.Request({
            body: body,
            headers: headers,
            method: constant ? "GET" : "POST",
            path: path,
            queryParams: queryParams,
            failover: false
          }));

        case 17:
          _context32.t2 = _context32.sent;
          return _context32.abrupt("return", _context32.t0.ResponseToFormat.call(_context32.t0, _context32.t1, _context32.t2));

        case 19:
        case "end":
          return _context32.stop();
      }
    }
  }, null, this);
};
/**
 * Generate a URL to the specified /rep endpoint of a content object. URL includes authorization token.
 *
 * Alias for the FabricUrl method with the "rep" parameter
 *
 * @methodGroup URL Generation
 * @namedParams
 * @param {string=} libraryId - ID of the library
 * @param {string=} objectId - ID of the object
 * @param {string=} versionHash - Hash of the object version - if not specified, latest version will be used
 * @param {string} rep - Representation to use
 * @param {Object=} queryParams - Query params to add to the URL
 * @param {boolean=} channelAuth=false - If specified, state channel authorization will be performed instead of access request authorization
 * @param {boolean=} noAuth=false - If specified, authorization will not be performed and the URL will not have an authorization
 * token. This is useful for accessing public assets.
 * @param {boolean=} noCache=false - If specified, a new access request will be made for the authorization regardless of
 * whether such a request exists in the client cache. This request will not be cached. This option has no effect if noAuth is true.
 *
 * @see <a href="#FabricUrl">FabricUrl</a> for creating arbitrary fabric URLs
 *
 * @returns {Promise<string>} - URL to the specified rep endpoint with authorization token
 */


exports.Rep = function _callee33(_ref29) {
  var libraryId, objectId, versionHash, rep, _ref29$queryParams, queryParams, _ref29$channelAuth, channelAuth, _ref29$noAuth, noAuth, _ref29$noCache, noCache;

  return _regeneratorRuntime.async(function _callee33$(_context33) {
    while (1) {
      switch (_context33.prev = _context33.next) {
        case 0:
          libraryId = _ref29.libraryId, objectId = _ref29.objectId, versionHash = _ref29.versionHash, rep = _ref29.rep, _ref29$queryParams = _ref29.queryParams, queryParams = _ref29$queryParams === void 0 ? {} : _ref29$queryParams, _ref29$channelAuth = _ref29.channelAuth, channelAuth = _ref29$channelAuth === void 0 ? false : _ref29$channelAuth, _ref29$noAuth = _ref29.noAuth, noAuth = _ref29$noAuth === void 0 ? false : _ref29$noAuth, _ref29$noCache = _ref29.noCache, noCache = _ref29$noCache === void 0 ? false : _ref29$noCache;
          ValidateParameters({
            libraryId: libraryId,
            objectId: objectId,
            versionHash: versionHash
          });

          if (rep) {
            _context33.next = 4;
            break;
          }

          throw "Rep not specified";

        case 4:
          return _context33.abrupt("return", this.FabricUrl({
            libraryId: libraryId,
            objectId: objectId,
            versionHash: versionHash,
            rep: rep,
            queryParams: queryParams,
            channelAuth: channelAuth,
            noAuth: noAuth,
            noCache: noCache
          }));

        case 5:
        case "end":
          return _context33.stop();
      }
    }
  }, null, this);
};
/**
 * Generate a URL to the specified /public endpoint of a content object. URL includes authorization token.
 *
 * Alias for the FabricUrl method with the "rep" parameter
 *
 * @methodGroup URL Generation
 * @namedParams
 * @param {string=} libraryId - ID of the library
 * @param {string=} objectId - ID of the object
 * @param {string=} versionHash - Hash of the object version - if not specified, latest version will be used
 * @param {string} rep - Representation to use
 * @param {Object=} queryParams - Query params to add to the URL
 *
 * @see <a href="#FabricUrl">FabricUrl</a> for creating arbitrary fabric URLs
 *
 * @returns {Promise<string>} - URL to the specified rep endpoint with authorization token
 */


exports.PublicRep = function _callee34(_ref30) {
  var libraryId, objectId, versionHash, rep, _ref30$queryParams, queryParams;

  return _regeneratorRuntime.async(function _callee34$(_context34) {
    while (1) {
      switch (_context34.prev = _context34.next) {
        case 0:
          libraryId = _ref30.libraryId, objectId = _ref30.objectId, versionHash = _ref30.versionHash, rep = _ref30.rep, _ref30$queryParams = _ref30.queryParams, queryParams = _ref30$queryParams === void 0 ? {} : _ref30$queryParams;
          ValidateParameters({
            libraryId: libraryId,
            objectId: objectId,
            versionHash: versionHash
          });

          if (rep) {
            _context34.next = 4;
            break;
          }

          throw "Rep not specified";

        case 4:
          return _context34.abrupt("return", this.FabricUrl({
            libraryId: libraryId,
            objectId: objectId,
            versionHash: versionHash,
            publicRep: rep,
            queryParams: queryParams,
            noAuth: true
          }));

        case 5:
        case "end":
          return _context34.stop();
      }
    }
  }, null, this);
};
/**
 * Generate a URL to the specified item in the content fabric with appropriate authorization token.
 *
 * @methodGroup URL Generation
 * @namedParams
 * @param {string=} libraryId - ID of an library
 * @param {string=} objectId - ID of an object
 * @param {string=} versionHash - Hash of an object version
 * @param {string=} writeToken - A write token for a draft of the object (requires libraryId)
 * @param {string=} partHash - Hash of a part - Requires object ID
 * @param {string=} rep - Rep parameter of the url
 * @param {string=} publicRep - Public rep parameter of the url
 * @param {string=} call - Bitcode method to call
 * @param {Object=} queryParams - Query params to add to the URL
 * @param {boolean=} channelAuth=false - If specified, state channel authorization will be used instead of access request authorization
 * @param {boolean=} noAuth=false - If specified, authorization will not be performed and the URL will not have an authorization
 * token. This is useful for accessing public assets.
 * @param {boolean=} noCache=false - If specified, a new access request will be made for the authorization regardless of
 * whether such a request exists in the client cache. This request will not be cached. This option has no effect if noAuth is true.
 *
 * @returns {Promise<string>} - URL to the specified endpoint with authorization token
 */


exports.FabricUrl = function _callee35(_ref31) {
  var libraryId, objectId, versionHash, writeToken, partHash, rep, publicRep, call, _ref31$queryParams, queryParams, _ref31$channelAuth, channelAuth, _ref31$noAuth, noAuth, _ref31$noCache, noCache, authorization, path;

  return _regeneratorRuntime.async(function _callee35$(_context35) {
    while (1) {
      switch (_context35.prev = _context35.next) {
        case 0:
          libraryId = _ref31.libraryId, objectId = _ref31.objectId, versionHash = _ref31.versionHash, writeToken = _ref31.writeToken, partHash = _ref31.partHash, rep = _ref31.rep, publicRep = _ref31.publicRep, call = _ref31.call, _ref31$queryParams = _ref31.queryParams, queryParams = _ref31$queryParams === void 0 ? {} : _ref31$queryParams, _ref31$channelAuth = _ref31.channelAuth, channelAuth = _ref31$channelAuth === void 0 ? false : _ref31$channelAuth, _ref31$noAuth = _ref31.noAuth, noAuth = _ref31$noAuth === void 0 ? false : _ref31$noAuth, _ref31$noCache = _ref31.noCache, noCache = _ref31$noCache === void 0 ? false : _ref31$noCache;

          if (objectId || versionHash) {
            ValidateParameters({
              libraryId: libraryId,
              objectId: objectId,
              versionHash: versionHash
            });
          }

          if (versionHash) {
            objectId = this.utils.DecodeVersionHash(versionHash).objectId;
          }

          this.Log("Building Fabric URL:\n      libraryId: ".concat(libraryId, "\n      objectId: ").concat(objectId, "\n      versionHash: ").concat(versionHash, "\n      writeToken: ").concat(writeToken, "\n      partHash: ").concat(partHash, "\n      rep: ").concat(rep, "\n      publicRep: ").concat(publicRep, "\n      call: ").concat(call, "\n      channelAuth: ").concat(channelAuth, "\n      noAuth: ").concat(noAuth, "\n      noCache: ").concat(noCache, "\n      queryParams: ").concat(JSON.stringify(queryParams || {}, null, 2)));
          _context35.next = 6;
          return _regeneratorRuntime.awrap(this.authClient.AuthorizationToken({
            libraryId: libraryId,
            objectId: objectId,
            versionHash: versionHash,
            channelAuth: channelAuth,
            noAuth: noAuth,
            noCache: noCache
          }));

        case 6:
          _context35.t0 = _context35.sent;
          authorization = [_context35.t0];

          if (queryParams.authorization) {
            authorization.push(queryParams.authorization);
          } // Clone queryParams to avoid modification of the original


          queryParams = _objectSpread({}, queryParams, {
            authorization: authorization.flat()
          });

          if (!((rep || publicRep) && objectId && !versionHash)) {
            _context35.next = 14;
            break;
          }

          _context35.next = 13;
          return _regeneratorRuntime.awrap(this.LatestVersionHash({
            objectId: objectId
          }));

        case 13:
          versionHash = _context35.sent;

        case 14:
          path = "";

          if (libraryId) {
            path = UrlJoin(path, "qlibs", libraryId);

            if (objectId || versionHash) {
              path = UrlJoin(path, "q", writeToken || versionHash || objectId);
            }
          } else if (versionHash) {
            path = UrlJoin("q", versionHash);
          }

          if (partHash) {
            path = UrlJoin(path, "data", partHash);
          } else if (rep) {
            path = UrlJoin(path, "rep", rep);
          } else if (publicRep) {
            path = UrlJoin(path, "public", publicRep);
          } else if (call) {
            path = UrlJoin(path, "call", call);
          }

          return _context35.abrupt("return", this.HttpClient.URL({
            path: path,
            queryParams: queryParams
          }));

        case 18:
        case "end":
          return _context35.stop();
      }
    }
  }, null, this);
};
/**
 * Generate a URL to the specified content object file with appropriate authorization token.
 *
 * @methodGroup URL Generation
 * @namedParams
 * @param {string=} libraryId - ID of an library
 * @param {string=} objectId - ID of an object
 * @param {string=} versionHash - Hash of an object version
 * @param {string=} writeToken - A write token for a draft of the object (requires libraryId)
 * @param {string} filePath - Path to the content object file
 * @param {Object=} queryParams - Query params to add to the URL
 * @param {boolean=} noCache=false - If specified, a new access request will be made for the authorization regardless of
 * whether such a request exists in the client cache. This request will not be cached.
 *
 * @returns {Promise<string>} - URL to the specified file with authorization token
 */


exports.FileUrl = function _callee36(_ref32) {
  var libraryId, objectId, versionHash, writeToken, filePath, _ref32$queryParams, queryParams, _ref32$noCache, noCache, path, authorizationToken, fileInfo, encrypted;

  return _regeneratorRuntime.async(function _callee36$(_context36) {
    while (1) {
      switch (_context36.prev = _context36.next) {
        case 0:
          libraryId = _ref32.libraryId, objectId = _ref32.objectId, versionHash = _ref32.versionHash, writeToken = _ref32.writeToken, filePath = _ref32.filePath, _ref32$queryParams = _ref32.queryParams, queryParams = _ref32$queryParams === void 0 ? {} : _ref32$queryParams, _ref32$noCache = _ref32.noCache, noCache = _ref32$noCache === void 0 ? false : _ref32$noCache;
          ValidateParameters({
            libraryId: libraryId,
            objectId: objectId,
            versionHash: versionHash
          });

          if (filePath) {
            _context36.next = 4;
            break;
          }

          throw "File path not specified";

        case 4:
          if (versionHash) {
            objectId = this.utils.DecodeVersionHash(versionHash).objectId;
          }

          if (libraryId) {
            path = UrlJoin("qlibs", libraryId, "q", writeToken || versionHash || objectId);
          } else {
            path = UrlJoin("q", versionHash);
          }

          _context36.next = 8;
          return _regeneratorRuntime.awrap(this.authClient.AuthorizationToken({
            libraryId: libraryId,
            objectId: objectId,
            noCache: noCache
          }));

        case 8:
          authorizationToken = _context36.sent;
          queryParams = _objectSpread({}, queryParams, {
            authorization: authorizationToken
          });
          _context36.next = 12;
          return _regeneratorRuntime.awrap(this.ContentObjectMetadata({
            libraryId: libraryId,
            objectId: objectId,
            versionHash: versionHash,
            writeToken: writeToken,
            metadataSubtree: UrlJoin("files", filePath)
          }));

        case 12:
          fileInfo = _context36.sent;
          encrypted = fileInfo && fileInfo["."].encryption && fileInfo["."].encryption.scheme === "cgck";

          if (encrypted) {
            path = UrlJoin(path, "rep", "files_download", filePath);
            queryParams["header-x_decryption_mode"] = "decrypt";
          } else {
            path = UrlJoin(path, "files", filePath);
          }

          return _context36.abrupt("return", this.HttpClient.URL({
            path: path,
            queryParams: queryParams
          }));

        case 16:
        case "end":
          return _context36.stop();
      }
    }
  }, null, this);
};
/**
 * Get the image URL for the specified object
 *
 * @methodGroup URL Generation
 * @namedParams
 * @param {string=} libraryId - ID of the library
 * @param {string=} objectId - ID of the object
 * @param {string=} versionHash - Version hash of the object -- if not specified, latest version is used
 * @param {number=} height - If specified, the image will be scaled to the specified maximum height
 * @param {string=} imagePath=public/display_image - Metadata path to the image link
 *
 * @see <a href="Utils.html#.ResizeImage">Utils#ResizeImage</a>
 *
 * @returns {Promise<string | undefined>} - If the object has an image, will return a URL for that image.
 */


exports.ContentObjectImageUrl = function _callee37(_ref33) {
  var libraryId, objectId, versionHash, height, _ref33$imagePath, imagePath, imageMetadata, _queryParams;

  return _regeneratorRuntime.async(function _callee37$(_context37) {
    while (1) {
      switch (_context37.prev = _context37.next) {
        case 0:
          libraryId = _ref33.libraryId, objectId = _ref33.objectId, versionHash = _ref33.versionHash, height = _ref33.height, _ref33$imagePath = _ref33.imagePath, imagePath = _ref33$imagePath === void 0 ? "public/display_image" : _ref33$imagePath;
          ValidateParameters({
            libraryId: libraryId,
            objectId: objectId,
            versionHash: versionHash
          });

          if (versionHash) {
            _context37.next = 6;
            break;
          }

          _context37.next = 5;
          return _regeneratorRuntime.awrap(this.LatestVersionHash({
            objectId: objectId
          }));

        case 5:
          versionHash = _context37.sent;

        case 6:
          this.Log("Retrieving content object image url: ".concat(libraryId, " ").concat(objectId, " ").concat(versionHash));

          if (this.objectImageUrls[versionHash]) {
            _context37.next = 26;
            break;
          }

          _context37.prev = 8;
          _context37.next = 11;
          return _regeneratorRuntime.awrap(this.ContentObjectMetadata({
            versionHash: versionHash,
            metadataSubtree: imagePath
          }));

        case 11:
          imageMetadata = _context37.sent;

          if (imageMetadata) {
            _context37.next = 15;
            break;
          }

          this.Log("No image url set: ".concat(libraryId, " ").concat(objectId, " ").concat(versionHash));
          return _context37.abrupt("return");

        case 15:
          _context37.next = 21;
          break;

        case 17:
          _context37.prev = 17;
          _context37.t0 = _context37["catch"](8);
          this.Log("Unable to query for image metadata: ".concat(libraryId, " ").concat(objectId, " ").concat(versionHash), true);
          this.Log(_context37.t0, true);

        case 21:
          _queryParams = {};

          if (height && !isNaN(parseInt(height))) {
            _queryParams["height"] = parseInt(height);
          }

          _context37.next = 25;
          return _regeneratorRuntime.awrap(this.LinkUrl({
            versionHash: versionHash,
            linkPath: imagePath,
            queryParams: _queryParams
          }));

        case 25:
          this.objectImageUrls[versionHash] = _context37.sent;

        case 26:
          return _context37.abrupt("return", this.objectImageUrls[versionHash]);

        case 27:
        case "end":
          return _context37.stop();
      }
    }
  }, null, this, [[8, 17]]);
};
/* Links */

/**
 * Get a specific content object in the library
 *
 * @methodGroup Links
 * @namedParams
 * @param {string=} libraryId - ID of the library
 * @param {string=} objectId - ID of the object
 * @param {string=} versionHash - Version hash of the object -- if not specified, latest version is returned
 * @param {boolean=} autoUpdate=false - If true, lists only links marked as auto-update links
 * @param {(string | Array<string>)=} select - Limit metadata fields return in link details
 *
 * @returns {Promise<Object>} - Description of created object
 */


exports.ContentObjectGraph = function _callee39(_ref34) {
  var _this9 = this;

  var libraryId, objectId, versionHash, _ref34$autoUpdate, autoUpdate, select, path, errorInfo, cycles, info;

  return _regeneratorRuntime.async(function _callee39$(_context39) {
    while (1) {
      switch (_context39.prev = _context39.next) {
        case 0:
          libraryId = _ref34.libraryId, objectId = _ref34.objectId, versionHash = _ref34.versionHash, _ref34$autoUpdate = _ref34.autoUpdate, autoUpdate = _ref34$autoUpdate === void 0 ? false : _ref34$autoUpdate, select = _ref34.select;
          ValidateParameters({
            libraryId: libraryId,
            objectId: objectId,
            versionHash: versionHash
          });
          this.Log("Retrieving content object graph: ".concat(libraryId || "", " ").concat(objectId || versionHash));

          if (versionHash) {
            objectId = this.utils.DecodeVersionHash(versionHash).objectId;
          }

          path = UrlJoin("q", versionHash || objectId, "links");
          _context39.prev = 5;
          _context39.t0 = _regeneratorRuntime;
          _context39.t1 = this.utils;
          _context39.t2 = this.HttpClient;
          _context39.next = 11;
          return _regeneratorRuntime.awrap(this.authClient.AuthorizationHeader({
            libraryId: libraryId,
            objectId: objectId,
            versionHash: versionHash
          }));

        case 11:
          _context39.t3 = _context39.sent;
          _context39.t4 = {
            auto_update: autoUpdate,
            select: select
          };
          _context39.t5 = path;
          _context39.t6 = {
            headers: _context39.t3,
            queryParams: _context39.t4,
            method: "GET",
            path: _context39.t5
          };
          _context39.t7 = _context39.t2.Request.call(_context39.t2, _context39.t6);
          _context39.t8 = _context39.t1.ResponseToJson.call(_context39.t1, _context39.t7);
          _context39.next = 19;
          return _context39.t0.awrap.call(_context39.t0, _context39.t8);

        case 19:
          return _context39.abrupt("return", _context39.sent);

        case 22:
          _context39.prev = 22;
          _context39.t9 = _context39["catch"](5);
          _context39.prev = 24;
          cycles = _context39.t9.body.errors[0].cause.cause.cause.cycle;

          if (!(!cycles || cycles.length === 0)) {
            _context39.next = 28;
            break;
          }

          throw _context39.t9;

        case 28:
          info = {};
          _context39.next = 31;
          return _regeneratorRuntime.awrap(Promise.all(cycles.map(function _callee38(cycleHash) {
            var cycleId, name;
            return _regeneratorRuntime.async(function _callee38$(_context38) {
              while (1) {
                switch (_context38.prev = _context38.next) {
                  case 0:
                    if (!info[cycleHash]) {
                      _context38.next = 2;
                      break;
                    }

                    return _context38.abrupt("return");

                  case 2:
                    cycleId = _this9.utils.DecodeVersionHash(cycleHash).objectId;
                    _context38.next = 5;
                    return _regeneratorRuntime.awrap(_this9.ContentObjectMetadata({
                      versionHash: cycleHash,
                      metadataSubtree: "public/asset_metadata/display_title"
                    }));

                  case 5:
                    _context38.t2 = _context38.sent;

                    if (_context38.t2) {
                      _context38.next = 10;
                      break;
                    }

                    _context38.next = 9;
                    return _regeneratorRuntime.awrap(_this9.ContentObjectMetadata({
                      versionHash: cycleHash,
                      metadataSubtree: "public/name"
                    }));

                  case 9:
                    _context38.t2 = _context38.sent;

                  case 10:
                    _context38.t1 = _context38.t2;

                    if (_context38.t1) {
                      _context38.next = 15;
                      break;
                    }

                    _context38.next = 14;
                    return _regeneratorRuntime.awrap(_this9.ContentObjectMetadata({
                      versionHash: cycleHash,
                      metadataSubtree: "name"
                    }));

                  case 14:
                    _context38.t1 = _context38.sent;

                  case 15:
                    _context38.t0 = _context38.t1;

                    if (_context38.t0) {
                      _context38.next = 18;
                      break;
                    }

                    _context38.t0 = cycleId;

                  case 18:
                    name = _context38.t0;
                    info[cycleHash] = {
                      name: name,
                      objectId: cycleId
                    };

                  case 20:
                  case "end":
                    return _context38.stop();
                }
              }
            });
          })));

        case 31:
          errorInfo = cycles.map(function (cycleHash) {
            return "".concat(info[cycleHash].name, " (").concat(info[cycleHash].objectId, ")");
          });
          _context39.next = 37;
          break;

        case 34:
          _context39.prev = 34;
          _context39.t10 = _context39["catch"](24);
          throw _context39.t9;

        case 37:
          throw new Error("Cycle found in links: ".concat(errorInfo.join(" -> ")));

        case 38:
        case "end":
          return _context39.stop();
      }
    }
  }, null, this, [[5, 22], [24, 34]]);
};
/**
 * Retrieve the version hash of the target of the specified link. If the target is the same as the specified
 * object and versionHash is not specified, will return the latest version hash.
 *
 * @methodGroup Links
 * @namedParams
 * @param {string=} libraryId - ID of an library
 * @param {string=} objectId - ID of an object
 * @param {string=} versionHash - Hash of an object version
 * @param {string=} writeToken - The write token for the object
 * @param {string} linkPath - Path to the content object link
 * @param {string=} authorizationToken - Additional authorization token for this request
 *
 * @returns {Promise<string>} - Version hash of the link's target
 */


exports.LinkTarget = function _callee40(_ref35) {
  var libraryId, objectId, versionHash, writeToken, linkPath, authorizationToken, linkInfo, targetHash, subPath;
  return _regeneratorRuntime.async(function _callee40$(_context40) {
    while (1) {
      switch (_context40.prev = _context40.next) {
        case 0:
          libraryId = _ref35.libraryId, objectId = _ref35.objectId, versionHash = _ref35.versionHash, writeToken = _ref35.writeToken, linkPath = _ref35.linkPath, authorizationToken = _ref35.authorizationToken, linkInfo = _ref35.linkInfo;
          ValidateParameters({
            libraryId: libraryId,
            objectId: objectId,
            versionHash: versionHash
          });

          if (writeToken) {
            ValidateWriteToken(writeToken);
          }

          if (versionHash) {
            objectId = this.utils.DecodeVersionHash(versionHash).objectId;
          }

          if (!(writeToken && !libraryId)) {
            _context40.next = 8;
            break;
          }

          _context40.next = 7;
          return _regeneratorRuntime.awrap(this.ContentObjectLibraryId({
            objectId: objectId
          }));

        case 7:
          libraryId = _context40.sent;

        case 8:
          if (linkInfo) {
            _context40.next = 12;
            break;
          }

          _context40.next = 11;
          return _regeneratorRuntime.awrap(this.ContentObjectMetadata({
            libraryId: libraryId,
            objectId: objectId,
            versionHash: versionHash,
            writeToken: writeToken,
            metadataSubtree: linkPath,
            resolveLinks: false,
            resolveIgnoreErrors: true,
            resolveIncludeSource: true,
            authorizationToken: authorizationToken
          }));

        case 11:
          linkInfo = _context40.sent;

        case 12:
          if (!(linkInfo && linkInfo["/"])) {
            _context40.next = 27;
            break;
          }

          /* For absolute links - extract the hash from the link itself. Otherwise use "container" */
          targetHash = ((linkInfo["/"] || "").match(/^\/?qfab\/([\w]+)\/?.+/) || [])[1];

          if (!targetHash) {
            targetHash = linkInfo["."].container;
          }

          if (!targetHash) {
            _context40.next = 19;
            break;
          }

          return _context40.abrupt("return", targetHash);

        case 19:
          if (!versionHash) {
            _context40.next = 21;
            break;
          }

          return _context40.abrupt("return", versionHash);

        case 21:
          _context40.t0 = versionHash;

          if (_context40.t0) {
            _context40.next = 26;
            break;
          }

          _context40.next = 25;
          return _regeneratorRuntime.awrap(this.LatestVersionHash({
            objectId: objectId
          }));

        case 25:
          _context40.t0 = _context40.sent;

        case 26:
          return _context40.abrupt("return", _context40.t0);

        case 27:
          _context40.next = 29;
          return _regeneratorRuntime.awrap(this.ContentObjectMetadata({
            libraryId: libraryId,
            objectId: objectId,
            versionHash: versionHash,
            writeToken: writeToken,
            metadataSubtree: linkPath,
            resolveIncludeSource: true,
            authorizationToken: authorizationToken
          }));

        case 29:
          linkInfo = _context40.sent;

          if (!(!linkInfo || !linkInfo["."])) {
            _context40.next = 49;
            break;
          }

          if (!(_typeof(linkInfo) === "object")) {
            _context40.next = 38;
            break;
          }

          _context40.t1 = versionHash;

          if (_context40.t1) {
            _context40.next = 37;
            break;
          }

          _context40.next = 36;
          return _regeneratorRuntime.awrap(this.LatestVersionHash({
            objectId: objectId
          }));

        case 36:
          _context40.t1 = _context40.sent;

        case 37:
          return _context40.abrupt("return", _context40.t1);

        case 38:
          // linkPath is not a direct link, but points to a literal value - back up one path element to find the container
          subPath = linkPath.split("/").slice(0, -1).join("/");

          if (subPath) {
            _context40.next = 46;
            break;
          }

          _context40.t2 = versionHash;

          if (_context40.t2) {
            _context40.next = 45;
            break;
          }

          _context40.next = 44;
          return _regeneratorRuntime.awrap(this.LatestVersionHash({
            objectId: objectId
          }));

        case 44:
          _context40.t2 = _context40.sent;

        case 45:
          return _context40.abrupt("return", _context40.t2);

        case 46:
          _context40.next = 48;
          return _regeneratorRuntime.awrap(this.ContentObjectMetadata({
            libraryId: libraryId,
            objectId: objectId,
            versionHash: versionHash,
            writeToken: writeToken,
            metadataSubtree: subPath,
            resolveIncludeSource: true,
            authorizationToken: authorizationToken
          }));

        case 48:
          linkInfo = _context40.sent;

        case 49:
          return _context40.abrupt("return", linkInfo["."].source);

        case 50:
        case "end":
          return _context40.stop();
      }
    }
  }, null, this);
};
/**
 * Generate a URL to the specified file link with appropriate authentication
 *
 * @methodGroup Links
 * @namedParams
 * @param {string=} libraryId - ID of an library
 * @param {string=} objectId - ID of an object
 * @param {string=} versionHash - Hash of an object version
 * @param {string=} writeToken - The write token for the object
 * @param {string} linkPath - Path to the content object link
 * @param {string=} mimeType - Mime type to use when rendering the file
 * @param {Object=} queryParams - Query params to add to the URL
 * @param {string=} authorizationToken - Additional authorization token
 * @param {boolean=} channelAuth=false - If specified, state channel authorization will be performed instead of access request authorization
 * @param {boolean=} noAuth - If specified, no authorization (other than the authorizationToken parameter and queryParams.authorization) will be added
 *
 * @returns {Promise<string>} - URL to the specified file with authorization token
 */


exports.LinkUrl = function _callee41(_ref36) {
  var libraryId, objectId, versionHash, writeToken, linkPath, mimeType, authorizationToken, _ref36$queryParams, queryParams, _ref36$channelAuth, channelAuth, _ref36$noAuth, noAuth, path, authorization;

  return _regeneratorRuntime.async(function _callee41$(_context41) {
    while (1) {
      switch (_context41.prev = _context41.next) {
        case 0:
          libraryId = _ref36.libraryId, objectId = _ref36.objectId, versionHash = _ref36.versionHash, writeToken = _ref36.writeToken, linkPath = _ref36.linkPath, mimeType = _ref36.mimeType, authorizationToken = _ref36.authorizationToken, _ref36$queryParams = _ref36.queryParams, queryParams = _ref36$queryParams === void 0 ? {} : _ref36$queryParams, _ref36$channelAuth = _ref36.channelAuth, channelAuth = _ref36$channelAuth === void 0 ? false : _ref36$channelAuth, _ref36$noAuth = _ref36.noAuth, noAuth = _ref36$noAuth === void 0 ? false : _ref36$noAuth;
          ValidateParameters({
            libraryId: libraryId,
            objectId: objectId,
            versionHash: versionHash
          });

          if (writeToken) {
            ValidateWriteToken(writeToken);
          }

          if (linkPath) {
            _context41.next = 5;
            break;
          }

          throw Error("Link path not specified");

        case 5:
          if (versionHash) {
            objectId = this.utils.DecodeVersionHash(versionHash).objectId;
          }

          if (libraryId) {
            path = UrlJoin("qlibs", libraryId, "q", writeToken || versionHash || objectId, "meta", linkPath);
          } else {
            path = UrlJoin("q", versionHash, "meta", linkPath);
          }

          authorization = [authorizationToken];

          if (noAuth) {
            _context41.next = 14;
            break;
          }

          _context41.t0 = authorization;
          _context41.next = 12;
          return _regeneratorRuntime.awrap(this.MetadataAuth({
            libraryId: libraryId,
            objectId: objectId,
            versionHash: versionHash,
            path: linkPath,
            channelAuth: channelAuth
          }));

        case 12:
          _context41.t1 = _context41.sent;

          _context41.t0.push.call(_context41.t0, _context41.t1);

        case 14:
          if (queryParams.authorization) {
            authorization.push(queryParams.authorization);
          }

          queryParams = _objectSpread({}, queryParams, {
            authorization: authorization.flat().filter(function (token) {
              return token;
            }),
            resolve: true
          });

          if (mimeType) {
            queryParams["header-accept"] = mimeType;
          }

          return _context41.abrupt("return", this.HttpClient.URL({
            path: path,
            queryParams: queryParams
          }));

        case 18:
        case "end":
          return _context41.stop();
      }
    }
  }, null, this);
};
/**
 * Retrieve the data at the specified link in the specified format
 *
 * @methodGroup Links
 * @namedParams
 * @param {string=} libraryId - ID of an library
 * @param {string=} objectId - ID of an object
 * @param {string=} versionHash - Hash of an object version
 * @param {string=} writeToken - The write token for the object
 * @param {string} linkPath - Path to the content object link
 * @param {Object=} queryParams - Query params to add to the URL
 * @param {string=} format=json - Format of the response
 * @param {boolean=} channelAuth=false - If specified, state channel authorization will be performed instead of access request authorization
 */


exports.LinkData = function _callee42(_ref37) {
  var libraryId, objectId, versionHash, writeToken, linkPath, _ref37$queryParams, queryParams, _ref37$format, format, channelAuth, linkUrl;

  return _regeneratorRuntime.async(function _callee42$(_context42) {
    while (1) {
      switch (_context42.prev = _context42.next) {
        case 0:
          libraryId = _ref37.libraryId, objectId = _ref37.objectId, versionHash = _ref37.versionHash, writeToken = _ref37.writeToken, linkPath = _ref37.linkPath, _ref37$queryParams = _ref37.queryParams, queryParams = _ref37$queryParams === void 0 ? {} : _ref37$queryParams, _ref37$format = _ref37.format, format = _ref37$format === void 0 ? "json" : _ref37$format, channelAuth = _ref37.channelAuth;
          _context42.next = 3;
          return _regeneratorRuntime.awrap(this.LinkUrl({
            libraryId: libraryId,
            objectId: objectId,
            versionHash: versionHash,
            writeToken: writeToken,
            linkPath: linkPath,
            queryParams: queryParams,
            channelAuth: channelAuth
          }));

        case 3:
          linkUrl = _context42.sent;
          _context42.t0 = this.utils;
          _context42.t1 = format;
          _context42.next = 8;
          return _regeneratorRuntime.awrap(HttpClient.Fetch(linkUrl));

        case 8:
          _context42.t2 = _context42.sent;
          return _context42.abrupt("return", _context42.t0.ResponseToFormat.call(_context42.t0, _context42.t1, _context42.t2));

        case 10:
        case "end":
          return _context42.stop();
      }
    }
  }, null, this);
};
/* Encryption */


exports.CreateEncryptionConk = function _callee43(_ref38) {
  var libraryId, objectId, versionHash, writeToken, _ref38$createKMSConk, createKMSConk, capKey, existingUserCap, kmsAddress, kmsPublicKey, kmsCapKey, existingKMSCap;

  return _regeneratorRuntime.async(function _callee43$(_context43) {
    while (1) {
      switch (_context43.prev = _context43.next) {
        case 0:
          libraryId = _ref38.libraryId, objectId = _ref38.objectId, versionHash = _ref38.versionHash, writeToken = _ref38.writeToken, _ref38$createKMSConk = _ref38.createKMSConk, createKMSConk = _ref38$createKMSConk === void 0 ? true : _ref38$createKMSConk;
          ValidateParameters({
            libraryId: libraryId,
            objectId: objectId,
            versionHash: versionHash
          });
          ValidateWriteToken(writeToken);

          if (!objectId) {
            objectId = client.DecodeVersionHash(versionHash).objectId;
          }

          if (libraryId) {
            _context43.next = 8;
            break;
          }

          _context43.next = 7;
          return _regeneratorRuntime.awrap(this.ContentObjectLibraryId({
            objectId: objectId
          }));

        case 7:
          libraryId = _context43.sent;

        case 8:
          capKey = "eluv.caps.iusr".concat(this.utils.AddressToHash(this.signer.address));
          _context43.next = 11;
          return _regeneratorRuntime.awrap(this.ContentObjectMetadata({
            libraryId: libraryId,
            objectId: objectId,
            writeToken: writeToken,
            metadataSubtree: capKey
          }));

        case 11:
          existingUserCap = _context43.sent;

          if (!existingUserCap) {
            _context43.next = 18;
            break;
          }

          _context43.next = 15;
          return _regeneratorRuntime.awrap(this.Crypto.DecryptCap(existingUserCap, this.signer.signingKey.privateKey));

        case 15:
          this.encryptionConks[objectId] = _context43.sent;
          _context43.next = 34;
          break;

        case 18:
          _context43.next = 20;
          return _regeneratorRuntime.awrap(this.Crypto.GeneratePrimaryConk({
            spaceId: this.contentSpaceId,
            objectId: objectId
          }));

        case 20:
          this.encryptionConks[objectId] = _context43.sent;
          _context43.t0 = _regeneratorRuntime;
          _context43.t1 = this;
          _context43.t2 = libraryId;
          _context43.t3 = objectId;
          _context43.t4 = writeToken;
          _context43.t5 = capKey;
          _context43.next = 29;
          return _regeneratorRuntime.awrap(this.Crypto.EncryptConk(this.encryptionConks[objectId], this.signer.signingKey.publicKey));

        case 29:
          _context43.t6 = _context43.sent;
          _context43.t7 = {
            libraryId: _context43.t2,
            objectId: _context43.t3,
            writeToken: _context43.t4,
            metadataSubtree: _context43.t5,
            metadata: _context43.t6
          };
          _context43.t8 = _context43.t1.ReplaceMetadata.call(_context43.t1, _context43.t7);
          _context43.next = 34;
          return _context43.t0.awrap.call(_context43.t0, _context43.t8);

        case 34:
          if (!createKMSConk) {
            _context43.next = 66;
            break;
          }

          _context43.prev = 35;
          _context43.next = 38;
          return _regeneratorRuntime.awrap(this.authClient.KMSAddress({
            objectId: objectId
          }));

        case 38:
          kmsAddress = _context43.sent;
          _context43.next = 41;
          return _regeneratorRuntime.awrap(this.authClient.KMSInfo({
            objectId: objectId
          }));

        case 41:
          kmsPublicKey = _context43.sent.publicKey;
          kmsCapKey = "eluv.caps.ikms".concat(this.utils.AddressToHash(kmsAddress));
          _context43.next = 45;
          return _regeneratorRuntime.awrap(this.ContentObjectMetadata({
            libraryId: libraryId,
            // Cap may only exist in draft
            objectId: objectId,
            writeToken: writeToken,
            metadataSubtree: kmsCapKey
          }));

        case 45:
          existingKMSCap = _context43.sent;

          if (existingKMSCap) {
            _context43.next = 60;
            break;
          }

          _context43.t9 = _regeneratorRuntime;
          _context43.t10 = this;
          _context43.t11 = libraryId;
          _context43.t12 = objectId;
          _context43.t13 = writeToken;
          _context43.t14 = kmsCapKey;
          _context43.next = 55;
          return _regeneratorRuntime.awrap(this.Crypto.EncryptConk(this.encryptionConks[objectId], kmsPublicKey));

        case 55:
          _context43.t15 = _context43.sent;
          _context43.t16 = {
            libraryId: _context43.t11,
            objectId: _context43.t12,
            writeToken: _context43.t13,
            metadataSubtree: _context43.t14,
            metadata: _context43.t15
          };
          _context43.t17 = _context43.t10.ReplaceMetadata.call(_context43.t10, _context43.t16);
          _context43.next = 60;
          return _context43.t9.awrap.call(_context43.t9, _context43.t17);

        case 60:
          _context43.next = 66;
          break;

        case 62:
          _context43.prev = 62;
          _context43.t18 = _context43["catch"](35);
          // eslint-disable-next-line no-console
          console.error("Failed to create encryption cap for KMS:"); // eslint-disable-next-line no-console

          console.error(_context43.t18);

        case 66:
          return _context43.abrupt("return", this.encryptionConks[objectId]);

        case 67:
        case "end":
          return _context43.stop();
      }
    }
  }, null, this, [[35, 62]]);
};
/**
 * Retrieve the encryption conk for the specified object. If one has not yet been created
 * and a writeToken has been specified, this method will create a new conk and
 * save it to the draft metadata
 *
 * @methodGroup Encryption
 *
 * @namedParams
 * @param {string} libraryId - ID of the library
 * @param {string} objectId - ID of the object
 * @param {string} versionHash - Version hash of the object
 * @param {string=} writeToken - Write token of the content object draft
 * @param {boolean=} download=false - If specified, will return keys appropriate for download (if the current user is not
 * the owner of the object, download will be performed via proxy-reencryption)
 *
 * @return Promise<Object> - The encryption conk for the object
 */


exports.EncryptionConk = function _callee44(_ref39) {
  var libraryId, objectId, versionHash, writeToken, _ref39$download, download, owner, capKey, existingUserCap;

  return _regeneratorRuntime.async(function _callee44$(_context44) {
    while (1) {
      switch (_context44.prev = _context44.next) {
        case 0:
          libraryId = _ref39.libraryId, objectId = _ref39.objectId, versionHash = _ref39.versionHash, writeToken = _ref39.writeToken, _ref39$download = _ref39.download, download = _ref39$download === void 0 ? false : _ref39$download;
          ValidateParameters({
            libraryId: libraryId,
            objectId: objectId,
            versionHash: versionHash
          });

          if (writeToken) {
            ValidateWriteToken(writeToken);
          }

          if (!objectId) {
            objectId = client.DecodeVersionHash(versionHash).objectId;
          }

          _context44.next = 6;
          return _regeneratorRuntime.awrap(this.authClient.Owner({
            id: objectId
          }));

        case 6:
          owner = _context44.sent;

          if (this.utils.EqualAddress(owner, this.signer.address)) {
            _context44.next = 17;
            break;
          }

          if (!download) {
            _context44.next = 14;
            break;
          }

          _context44.next = 11;
          return _regeneratorRuntime.awrap(this.authClient.ReEncryptionConk({
            libraryId: libraryId,
            objectId: objectId,
            versionHash: versionHash
          }));

        case 11:
          return _context44.abrupt("return", _context44.sent);

        case 14:
          _context44.next = 16;
          return _regeneratorRuntime.awrap(this.authClient.EncryptionConk({
            libraryId: libraryId,
            objectId: objectId,
            versionHash: versionHash
          }));

        case 16:
          return _context44.abrupt("return", _context44.sent);

        case 17:
          if (this.encryptionConks[objectId]) {
            _context44.next = 34;
            break;
          }

          capKey = "eluv.caps.iusr".concat(this.utils.AddressToHash(this.signer.address));
          _context44.next = 21;
          return _regeneratorRuntime.awrap(this.ContentObjectMetadata({
            libraryId: libraryId,
            objectId: objectId,
            versionHash: versionHash,
            // Cap may only exist in draft
            writeToken: writeToken,
            metadataSubtree: capKey
          }));

        case 21:
          existingUserCap = _context44.sent;

          if (!existingUserCap) {
            _context44.next = 28;
            break;
          }

          _context44.next = 25;
          return _regeneratorRuntime.awrap(this.Crypto.DecryptCap(existingUserCap, this.signer.signingKey.privateKey));

        case 25:
          this.encryptionConks[objectId] = _context44.sent;
          _context44.next = 34;
          break;

        case 28:
          if (!writeToken) {
            _context44.next = 33;
            break;
          }

          _context44.next = 31;
          return _regeneratorRuntime.awrap(this.CreateEncryptionConk({
            libraryId: libraryId,
            objectId: objectId,
            versionHash: versionHash,
            writeToken: writeToken,
            createKMSConk: false
          }));

        case 31:
          _context44.next = 34;
          break;

        case 33:
          throw "No encryption conk present for " + objectId;

        case 34:
          return _context44.abrupt("return", this.encryptionConks[objectId]);

        case 35:
        case "end":
          return _context44.stop();
      }
    }
  }, null, this);
};
/**
 * Encrypt the specified chunk for the specified object or draft
 *
 * @methodGroup Encryption
 *
 * @namedParams
 * @param {string} libraryId - ID of the library
 * @param {string} objectId - ID of the object
 * @param {string} writeToken - Write token of the content object draft
 * @param {ArrayBuffer | Buffer} chunk - The data to encrypt
 *
 * @return {Promise<ArrayBuffer>}
 */


exports.Encrypt = function _callee45(_ref40) {
  var libraryId, objectId, writeToken, chunk, conk, data;
  return _regeneratorRuntime.async(function _callee45$(_context45) {
    while (1) {
      switch (_context45.prev = _context45.next) {
        case 0:
          libraryId = _ref40.libraryId, objectId = _ref40.objectId, writeToken = _ref40.writeToken, chunk = _ref40.chunk;
          ValidateParameters({
            libraryId: libraryId,
            objectId: objectId
          });
          _context45.next = 4;
          return _regeneratorRuntime.awrap(this.EncryptionConk({
            libraryId: libraryId,
            objectId: objectId,
            writeToken: writeToken
          }));

        case 4:
          conk = _context45.sent;
          _context45.next = 7;
          return _regeneratorRuntime.awrap(this.Crypto.Encrypt(conk, chunk));

        case 7:
          data = _context45.sent;
          return _context45.abrupt("return", data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength));

        case 9:
        case "end":
          return _context45.stop();
      }
    }
  }, null, this);
};
/**
 * Decrypt the specified chunk for the specified object or draft
 *
 * @methodGroup Encryption
 *
 * @namedParams
 * @param {string} libraryId - ID of the library
 * @param {string} objectId - ID of the object
 * @param {string} writeToken - Write token of the content object draft
 * @param {ArrayBuffer | Buffer} chunk - The data to decrypt
 *
 * @return {Promise<ArrayBuffer>}
 */


exports.Decrypt = function _callee46(_ref41) {
  var libraryId, objectId, writeToken, chunk, conk, data;
  return _regeneratorRuntime.async(function _callee46$(_context46) {
    while (1) {
      switch (_context46.prev = _context46.next) {
        case 0:
          libraryId = _ref41.libraryId, objectId = _ref41.objectId, writeToken = _ref41.writeToken, chunk = _ref41.chunk;
          ValidateParameters({
            libraryId: libraryId,
            objectId: objectId
          });
          _context46.next = 4;
          return _regeneratorRuntime.awrap(this.EncryptionConk({
            libraryId: libraryId,
            objectId: objectId,
            writeToken: writeToken,
            download: true
          }));

        case 4:
          conk = _context46.sent;
          _context46.next = 7;
          return _regeneratorRuntime.awrap(this.Crypto.Decrypt(conk, chunk));

        case 7:
          data = _context46.sent;
          return _context46.abrupt("return", data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength));

        case 9:
        case "end":
          return _context46.stop();
      }
    }
  }, null, this);
};
/* Content Object Access */

/**
 * Return the type of contract backing the specified ID
 *
 * @methodGroup Access Requests
 * @namedParams
 * @param {string} id - ID of the item
 *
 * @return {Promise<string>} - Contract type of the item - "space", "library", "type", "object", "wallet", "group", or "other"
 */


exports.AccessType = function _callee47(_ref42) {
  var id;
  return _regeneratorRuntime.async(function _callee47$(_context47) {
    while (1) {
      switch (_context47.prev = _context47.next) {
        case 0:
          id = _ref42.id;
          _context47.next = 3;
          return _regeneratorRuntime.awrap(this.authClient.AccessType(id));

        case 3:
          return _context47.abrupt("return", _context47.sent);

        case 4:
        case "end":
          return _context47.stop();
      }
    }
  }, null, this);
};
/**
 * Retrieve info about the access charge and permissions for the specified object.
 *
 * Note: Access charge is specified in ether
 *
 * @methodGroup Access Requests
 * @namedParams
 * @param {string} objectId - ID of the object
 * @param {object=} args - Arguments to the getAccessInfo method - See the base content contract
 *
 * @return {Promise<Object>} - Info about the access charge and whether or not the object is accessible to the current user   */


exports.AccessInfo = function _callee48(_ref43) {
  var objectId, args, info;
  return _regeneratorRuntime.async(function _callee48$(_context48) {
    while (1) {
      switch (_context48.prev = _context48.next) {
        case 0:
          objectId = _ref43.objectId, args = _ref43.args;
          ValidateObject(objectId);

          if (!args) {
            args = [0, // Access level
            [], // Custom values
            [] // Stakeholders
            ];
          }

          this.Log("Retrieving access info: ".concat(objectId));
          _context48.next = 6;
          return _regeneratorRuntime.awrap(this.ethClient.CallContractMethod({
            contractAddress: this.utils.HashToAddress(objectId),
            methodName: "getAccessInfo",
            methodArgs: args
          }));

        case 6:
          info = _context48.sent;
          this.Log(info);
          return _context48.abrupt("return", {
            visibilityCode: info[0],
            visible: info[0] >= 1,
            accessible: info[0] >= 10,
            editable: info[0] >= 100,
            hasAccess: info[1] === 0,
            accessCode: info[1],
            accessCharge: this.utils.WeiToEther(info[2]).toString()
          });

        case 9:
        case "end":
          return _context48.stop();
      }
    }
  }, null, this);
};
/**
 * Make an explicit call to accessRequest or updateRequest of the appropriate contract. Unless noCache is specified on
 * this method or on the client, the resultant transaction hash of this method will be cached for all subsequent
 * access to this contract.
 *
 * Note: Access and update requests are handled automatically by ElvClient. Use this method only if you need to make
 * an explicit call. For example, if you need to specify custom arguments to access a content object, you can call
 * this method explicitly with those arguments. Since the result is cached (by default), all subsequent calls to
 * that content object will be authorized with that AccessRequest transaction.
 *
 * Note: If the access request has an associated charge, this charge will be determined and supplied automatically.
 *
 * @methodGroup Access Requests
 * @namedParams
 * @param {string=} libraryId - ID of the library
 * @param {string=} objectId - ID of the object
 * @param {string=} versionHash - Version hash of the object
 * @param {Array=} args=[] - Custom arguments to the accessRequest or updateRequest methods
 * @param {boolean=} update=false - If true, will call updateRequest instead of accessRequest
 * @param {boolean=} noCache=false - If true, the resultant transaction hash will not be cached for future use
 *
 * @return {Promise<Object>} - Resultant AccessRequest or UpdateRequest event
 */


exports.AccessRequest = function _callee49(_ref44) {
  var libraryId, objectId, versionHash, _ref44$args, args, _ref44$update, update, _ref44$noCache, noCache;

  return _regeneratorRuntime.async(function _callee49$(_context49) {
    while (1) {
      switch (_context49.prev = _context49.next) {
        case 0:
          libraryId = _ref44.libraryId, objectId = _ref44.objectId, versionHash = _ref44.versionHash, _ref44$args = _ref44.args, args = _ref44$args === void 0 ? [] : _ref44$args, _ref44$update = _ref44.update, update = _ref44$update === void 0 ? false : _ref44$update, _ref44$noCache = _ref44.noCache, noCache = _ref44$noCache === void 0 ? false : _ref44$noCache;
          ValidateParameters({
            libraryId: libraryId,
            objectId: objectId,
            versionHash: versionHash
          });

          if (versionHash) {
            objectId = this.utils.DecodeVersionHash(versionHash).objectId;
          }

          _context49.next = 5;
          return _regeneratorRuntime.awrap(this.authClient.MakeAccessRequest({
            libraryId: libraryId,
            objectId: objectId,
            versionHash: versionHash,
            args: args,
            update: update,
            skipCache: true,
            noCache: noCache
          }));

        case 5:
          return _context49.abrupt("return", _context49.sent);

        case 6:
        case "end":
          return _context49.stop();
      }
    }
  }, null, this);
};
/**
 * Specify additional context to include in all state channel requests made by the client (e.g. for playout)
 *
 * @methodGroup Access Requests
 * @namedParams
 * @param {Object=} context - Additional context to include in state channel requests
 * - Note: Context must be a map of string->string
 */


exports.SetAuthContext = function (_ref45) {
  var context = _ref45.context;

  if (context && Object.values(context).find(function (value) {
    return typeof value !== "string";
  })) {
    throw Error("Context must be a map of string->string");
  }

  this.authContext = context;
};
/**
 * Generate a state channel token.
 *
 * @methodGroup Access Requests
 * @namedParams
 * @param {string=} objectId - ID of the object
 * @param {string=} versionHash - Version hash of the object
 * @param {Object=} context - Additional audience data to include in the authorization request
 * - Note: Context must be a map of string->string
 * @param {boolean=} noCache=false - If specified, a new state channel token will be generated
 * regardless whether or not one has been previously cached
 *
 * @return {Promise<string>} - The state channel token
 */


exports.GenerateStateChannelToken = function _callee50(_ref46) {
  var objectId, versionHash, context, _ref46$noCache, noCache;

  return _regeneratorRuntime.async(function _callee50$(_context50) {
    while (1) {
      switch (_context50.prev = _context50.next) {
        case 0:
          objectId = _ref46.objectId, versionHash = _ref46.versionHash, context = _ref46.context, _ref46$noCache = _ref46.noCache, noCache = _ref46$noCache === void 0 ? false : _ref46$noCache;
          versionHash ? ValidateVersion(versionHash) : ValidateObject(objectId);

          if (!versionHash) {
            _context50.next = 6;
            break;
          }

          objectId = this.utils.DecodeVersionHash(versionHash).objectId;
          _context50.next = 10;
          break;

        case 6:
          if (this.stateChannelAccess[objectId]) {
            _context50.next = 10;
            break;
          }

          _context50.next = 9;
          return _regeneratorRuntime.awrap(this.LatestVersionHash({
            objectId: objectId
          }));

        case 9:
          versionHash = _context50.sent;

        case 10:
          this.stateChannelAccess[objectId] = versionHash;
          _context50.next = 13;
          return _regeneratorRuntime.awrap(this.authClient.AuthorizationToken({
            objectId: objectId,
            channelAuth: true,
            oauthToken: this.oauthToken,
            context: context,
            noCache: noCache
          }));

        case 13:
          return _context50.abrupt("return", _context50.sent);

        case 14:
        case "end":
          return _context50.stop();
      }
    }
  }, null, this);
};
/**
 * Finalize state channel access
 *
 * @methodGroup Access Requests
 * @namedParams
 * @param {string=} objectId - ID of the object
 * @param {string=} versionHash - Version hash of the object
 * @param {number} percentComplete - Completion percentage of the content
 */


exports.FinalizeStateChannelAccess = function _callee51(_ref47) {
  var objectId, versionHash, percentComplete;
  return _regeneratorRuntime.async(function _callee51$(_context51) {
    while (1) {
      switch (_context51.prev = _context51.next) {
        case 0:
          objectId = _ref47.objectId, versionHash = _ref47.versionHash, percentComplete = _ref47.percentComplete;
          versionHash ? ValidateVersion(versionHash) : ValidateObject(objectId);

          if (!versionHash) {
            _context51.next = 6;
            break;
          }

          objectId = this.utils.DecodeVersionHash(versionHash).objectId;
          _context51.next = 13;
          break;

        case 6:
          if (!this.stateChannelAccess[objectId]) {
            _context51.next = 10;
            break;
          }

          versionHash = this.stateChannelAccess[objectId];
          _context51.next = 13;
          break;

        case 10:
          _context51.next = 12;
          return _regeneratorRuntime.awrap(this.LatestVersionHash({
            objectId: objectId
          }));

        case 12:
          versionHash = _context51.sent;

        case 13:
          this.stateChannelAccess[objectId] = undefined;
          _context51.next = 16;
          return _regeneratorRuntime.awrap(this.authClient.ChannelContentFinalize({
            objectId: objectId,
            versionHash: versionHash,
            percent: percentComplete
          }));

        case 16:
        case "end":
          return _context51.stop();
      }
    }
  }, null, this);
};
/**
 * Call accessComplete on the specified content object contract using a previously cached requestID.
 * Caching must be enabled and an access request must have been previously made on the specified
 * object by this client instance.
 *
 * @methodGroup Access Requests
 * @namedParams
 * @param {string} objectId - ID of the object
 * @param {number} score - Percentage score (0-100)
 *
 * @returns {Promise<Object>} - Transaction log of the AccessComplete event
 */


exports.ContentObjectAccessComplete = function _callee52(_ref48) {
  var objectId, _ref48$score, score;

  return _regeneratorRuntime.async(function _callee52$(_context52) {
    while (1) {
      switch (_context52.prev = _context52.next) {
        case 0:
          objectId = _ref48.objectId, _ref48$score = _ref48.score, score = _ref48$score === void 0 ? 100 : _ref48$score;
          ValidateObject(objectId);

          if (!(score < 0 || score > 100)) {
            _context52.next = 4;
            break;
          }

          throw Error("Invalid AccessComplete score: " + score);

        case 4:
          _context52.next = 6;
          return _regeneratorRuntime.awrap(this.authClient.AccessComplete({
            id: objectId,
            score: score
          }));

        case 6:
          return _context52.abrupt("return", _context52.sent);

        case 7:
        case "end":
          return _context52.stop();
      }
    }
  }, null, this);
};
/* Collection */

/**
 * Get a list of unique addresses of all of the specified type the current user has access
 * to through both their user wallet and through access groups
 *
 * @methodGroup Collections
 * @namedParams
 * @param {string} collectionType - Type of collection to retrieve
 * - accessGroups
 * - contentObjects
 * - contentTypes
 * - contracts
 * - libraries
 *
 * @return {Promise<Array<string>>} - List of addresses of available items
 */


exports.Collection = function _callee53(_ref49) {
  var collectionType, validCollectionTypes, walletAddress;
  return _regeneratorRuntime.async(function _callee53$(_context53) {
    while (1) {
      switch (_context53.prev = _context53.next) {
        case 0:
          collectionType = _ref49.collectionType;
          validCollectionTypes = ["accessGroups", "contentObjects", "contentTypes", "contracts", "libraries"];

          if (validCollectionTypes.includes(collectionType)) {
            _context53.next = 4;
            break;
          }

          throw new Error("Invalid collection type: " + collectionType);

        case 4:
          if (!this.signer) {
            _context53.next = 10;
            break;
          }

          _context53.next = 7;
          return _regeneratorRuntime.awrap(this.userProfileClient.WalletAddress());

        case 7:
          _context53.t0 = _context53.sent;
          _context53.next = 11;
          break;

        case 10:
          _context53.t0 = undefined;

        case 11:
          walletAddress = _context53.t0;

          if (walletAddress) {
            _context53.next = 14;
            break;
          }

          throw new Error("Unable to get collection: User wallet doesn't exist");

        case 14:
          this.Log("Retrieving ".concat(collectionType, " contract collection for user ").concat(this.signer.address));
          _context53.next = 17;
          return _regeneratorRuntime.awrap(this.ethClient.MakeProviderCall({
            methodName: "send",
            args: ["elv_getWalletCollection", [this.contentSpaceId, "iusr".concat(this.utils.AddressToHash(this.signer.address)), collectionType]]
          }));

        case 17:
          return _context53.abrupt("return", _context53.sent);

        case 18:
        case "end":
          return _context53.stop();
      }
    }
  }, null, this);
};
/* Verification */

/**
 * Verify the specified content object
 *
 * @methodGroup Content Objects
 * @namedParams
 * @param {string} libraryId - ID of the library
 * @param {string} objectId - ID of the object
 * @param {string} versionHash - Hash of the content object version
 *
 * @returns {Promise<Object>} - Response describing verification results
 */


exports.VerifyContentObject = function _callee54(_ref50) {
  var libraryId, objectId, versionHash;
  return _regeneratorRuntime.async(function _callee54$(_context54) {
    while (1) {
      switch (_context54.prev = _context54.next) {
        case 0:
          libraryId = _ref50.libraryId, objectId = _ref50.objectId, versionHash = _ref50.versionHash;
          ValidateParameters({
            libraryId: libraryId,
            objectId: objectId,
            versionHash: versionHash
          });
          _context54.next = 4;
          return _regeneratorRuntime.awrap(ContentObjectVerification.VerifyContentObject({
            client: this,
            libraryId: libraryId,
            objectId: objectId,
            versionHash: versionHash
          }));

        case 4:
          return _context54.abrupt("return", _context54.sent);

        case 5:
        case "end":
          return _context54.stop();
      }
    }
  }, null, this);
};
/**
 * Get the proofs associated with a given part
 *
 * @methodGroup Content Objects
 * @namedParams
 * @param {string=} libraryId - ID of the library
 * @param {string=} objectId - ID of the object
 * @param {string=} versionHash - Hash of the object version - If not specified, latest version will be used
 * @param {string} partHash - Hash of the part
 *
 * @returns {Promise<Object>} - Response containing proof information
 */


exports.Proofs = function _callee55(_ref51) {
  var libraryId, objectId, versionHash, partHash, path;
  return _regeneratorRuntime.async(function _callee55$(_context55) {
    while (1) {
      switch (_context55.prev = _context55.next) {
        case 0:
          libraryId = _ref51.libraryId, objectId = _ref51.objectId, versionHash = _ref51.versionHash, partHash = _ref51.partHash;
          ValidateParameters({
            libraryId: libraryId,
            objectId: objectId,
            versionHash: versionHash
          });
          ValidatePartHash(partHash);

          if (versionHash) {
            objectId = this.utils.DecodeVersionHash(versionHash).objectId;
          }

          path = UrlJoin("q", versionHash || objectId, "data", partHash, "proofs");
          _context55.t0 = this.utils;
          _context55.t1 = this.HttpClient;
          _context55.next = 9;
          return _regeneratorRuntime.awrap(this.authClient.AuthorizationHeader({
            libraryId: libraryId,
            objectId: objectId,
            versionHash: versionHash
          }));

        case 9:
          _context55.t2 = _context55.sent;
          _context55.t3 = path;
          _context55.t4 = {
            headers: _context55.t2,
            method: "GET",
            path: _context55.t3
          };
          _context55.t5 = _context55.t1.Request.call(_context55.t1, _context55.t4);
          return _context55.abrupt("return", _context55.t0.ResponseToJson.call(_context55.t0, _context55.t5));

        case 14:
        case "end":
          return _context55.stop();
      }
    }
  }, null, this);
};
/**
 * Get part info in CBOR format
 *
 * @methodGroup Content Objects
 * @namedParams
 * @param {string} libraryId - ID of the library - required for authentication
 * @param {string} objectId - ID of the object - required for authentication
 * @param {string} partHash - Hash of the part
 * @param {string} format - Format to retrieve the response - defaults to Blob
 *
 * @returns {Promise<Format>} - Response containing the CBOR response in the specified format
 */


exports.QParts = function _callee56(_ref52) {
  var libraryId, objectId, partHash, _ref52$format, format, path;

  return _regeneratorRuntime.async(function _callee56$(_context56) {
    while (1) {
      switch (_context56.prev = _context56.next) {
        case 0:
          libraryId = _ref52.libraryId, objectId = _ref52.objectId, partHash = _ref52.partHash, _ref52$format = _ref52.format, format = _ref52$format === void 0 ? "blob" : _ref52$format;
          ValidateParameters({
            libraryId: libraryId,
            objectId: objectId,
            versionHash: versionHash
          });
          ValidatePartHash(partHash);
          path = UrlJoin("qparts", partHash);
          _context56.t0 = this.utils;
          _context56.t1 = format;
          _context56.t2 = this.HttpClient;
          _context56.next = 9;
          return _regeneratorRuntime.awrap(this.authClient.AuthorizationHeader({
            libraryId: libraryId,
            objectId: objectId,
            partHash: partHash
          }));

        case 9:
          _context56.t3 = _context56.sent;
          _context56.t4 = path;
          _context56.t5 = {
            headers: _context56.t3,
            method: "GET",
            path: _context56.t4
          };
          _context56.t6 = _context56.t2.Request.call(_context56.t2, _context56.t5);
          return _context56.abrupt("return", _context56.t0.ResponseToFormat.call(_context56.t0, _context56.t1, _context56.t6));

        case 14:
        case "end":
          return _context56.stop();
      }
    }
  }, null, this);
};