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

exports.Visibility = function _callee(_ref) {
  var id, address, hasVisibility;
  return _regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          id = _ref.id;
          _context.prev = 1;
          address = this.utils.HashToAddress(id);

          if (this.visibilityInfo[address]) {
            _context.next = 12;
            break;
          }

          _context.next = 6;
          return _regeneratorRuntime.awrap(this.authClient.ContractHasMethod({
            contractAddress: address,
            methodName: "visibility"
          }));

        case 6:
          hasVisibility = _context.sent;

          if (hasVisibility) {
            _context.next = 9;
            break;
          }

          return _context.abrupt("return", 0);

        case 9:
          _context.next = 11;
          return _regeneratorRuntime.awrap(this.CallContractMethod({
            contractAddress: this.utils.HashToAddress(id),
            methodName: "visibility"
          }));

        case 11:
          this.visibilityInfo[address] = _context.sent;

        case 12:
          return _context.abrupt("return", this.visibilityInfo[address]);

        case 15:
          _context.prev = 15;
          _context.t0 = _context["catch"](1);

          if (!(_context.t0.code === "CALL_EXCEPTION")) {
            _context.next = 19;
            break;
          }

          return _context.abrupt("return", 0);

        case 19:
          throw _context.t0;

        case 20:
        case "end":
          return _context.stop();
      }
    }
  }, null, this, [[1, 15]]);
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


exports.Permission = function _callee2(_ref2) {
  var _this = this;

  var objectId, visibility, kmsAddress, kmsId, hasKmsConk, statusCode, permission;
  return _regeneratorRuntime.async(function _callee2$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          objectId = _ref2.objectId;
          ValidateObject(objectId);
          _context2.next = 4;
          return _regeneratorRuntime.awrap(this.AccessType({
            id: objectId
          }));

        case 4:
          _context2.t0 = _context2.sent;
          _context2.t1 = this.authClient.ACCESS_TYPES.OBJECT;

          if (!(_context2.t0 !== _context2.t1)) {
            _context2.next = 8;
            break;
          }

          throw Error("Permission only valid for normal content objects: " + objectId);

        case 8:
          _context2.next = 10;
          return _regeneratorRuntime.awrap(this.Visibility({
            id: objectId
          }));

        case 10:
          visibility = _context2.sent;
          _context2.next = 13;
          return _regeneratorRuntime.awrap(this.CallContractMethod({
            contractAddress: this.utils.HashToAddress(objectId),
            methodName: "addressKMS"
          }));

        case 13:
          kmsAddress = _context2.sent;
          kmsId = kmsAddress && "ikms".concat(this.utils.AddressToHash(kmsAddress));
          hasKmsConk = false;

          if (!kmsId) {
            _context2.next = 29;
            break;
          }

          _context2.t2 = _regeneratorRuntime;
          _context2.t3 = this;
          _context2.next = 21;
          return _regeneratorRuntime.awrap(this.ContentObjectLibraryId({
            objectId: objectId
          }));

        case 21:
          _context2.t4 = _context2.sent;
          _context2.t5 = objectId;
          _context2.t6 = "eluv.caps.".concat(kmsId);
          _context2.t7 = {
            libraryId: _context2.t4,
            objectId: _context2.t5,
            metadataSubtree: _context2.t6
          };
          _context2.t8 = _context2.t3.ContentObjectMetadata.call(_context2.t3, _context2.t7);
          _context2.next = 28;
          return _context2.t2.awrap.call(_context2.t2, _context2.t8);

        case 28:
          hasKmsConk = !!_context2.sent;

        case 29:
          _context2.next = 31;
          return _regeneratorRuntime.awrap(this.CallContractMethod({
            contractAddress: this.utils.HashToAddress(objectId),
            methodName: "statusCode"
          }));

        case 31:
          statusCode = _context2.sent;
          statusCode = parseInt(statusCode._hex, 16);
          permission = Object.keys(this.permissionLevels).filter(function (permissionKey) {
            var settings = _this.permissionLevels[permissionKey].settings;
            return visibility >= settings.visibility && statusCode >= settings.statusCode && hasKmsConk === settings.kmsConk;
          });

          if (!permission) {
            permission = hasKmsConk ? ["editable"] : ["owner"];
          }

          return _context2.abrupt("return", permission.slice(-1)[0]);

        case 36:
        case "end":
          return _context2.stop();
      }
    }
  }, null, this);
};
/* Content Spaces */

/**
 * Get the address of the default KMS of the content space
 *
 * @methodGroup Content Space
 *
 * @returns {Promise<string>} - Address of the KMS
 */


exports.DefaultKMSAddress = function _callee3() {
  return _regeneratorRuntime.async(function _callee3$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          _context3.next = 2;
          return _regeneratorRuntime.awrap(this.CallContractMethod({
            contractAddress: this.contentSpaceAddress,
            methodName: "addressKMS"
          }));

        case 2:
          return _context3.abrupt("return", _context3.sent);

        case 3:
        case "end":
          return _context3.stop();
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


exports.ContentTypeOwner = function _callee4(_ref3) {
  var name, typeId, versionHash, contentType;
  return _regeneratorRuntime.async(function _callee4$(_context4) {
    while (1) {
      switch (_context4.prev = _context4.next) {
        case 0:
          name = _ref3.name, typeId = _ref3.typeId, versionHash = _ref3.versionHash;
          _context4.next = 3;
          return _regeneratorRuntime.awrap(this.ContentType({
            name: name,
            typeId: typeId,
            versionHash: versionHash
          }));

        case 3:
          contentType = _context4.sent;
          _context4.t0 = this.utils;
          _context4.next = 7;
          return _regeneratorRuntime.awrap(this.ethClient.CallContractMethod({
            contractAddress: this.utils.HashToAddress(contentType.id),
            methodName: "owner",
            methodArgs: []
          }));

        case 7:
          _context4.t1 = _context4.sent;
          return _context4.abrupt("return", _context4.t0.FormatAddress.call(_context4.t0, _context4.t1));

        case 9:
        case "end":
          return _context4.stop();
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


exports.ContentType = function _callee5(_ref4) {
  var name, typeId, versionHash, _ref4$publicOnly, publicOnly, types, metadata;

  return _regeneratorRuntime.async(function _callee5$(_context5) {
    while (1) {
      switch (_context5.prev = _context5.next) {
        case 0:
          name = _ref4.name, typeId = _ref4.typeId, versionHash = _ref4.versionHash, _ref4$publicOnly = _ref4.publicOnly, publicOnly = _ref4$publicOnly === void 0 ? false : _ref4$publicOnly;
          this.Log("Retrieving content type: ".concat(name || typeId || versionHash));

          if (versionHash) {
            typeId = this.utils.DecodeVersionHash(versionHash).objectId;
          }

          if (!name) {
            _context5.next = 8;
            break;
          }

          this.Log("Looking up type by name in content space metadata..."); // Look up named type in content space metadata

          _context5.next = 7;
          return _regeneratorRuntime.awrap(this.ContentObjectMetadata({
            libraryId: this.contentSpaceLibraryId,
            objectId: this.contentSpaceObjectId,
            metadataSubtree: UrlJoin("public", "contentTypes", name)
          }));

        case 7:
          typeId = _context5.sent;

        case 8:
          if (typeId) {
            _context5.next = 18;
            break;
          }

          this.Log("Looking up type by name in available types...");
          _context5.next = 12;
          return _regeneratorRuntime.awrap(this.ContentTypes());

        case 12:
          types = _context5.sent;

          if (!name) {
            _context5.next = 17;
            break;
          }

          return _context5.abrupt("return", Object.values(types).find(function (type) {
            return (type.name || "").toLowerCase() === name.toLowerCase();
          }));

        case 17:
          return _context5.abrupt("return", Object.values(types).find(function (type) {
            return type.hash === versionHash;
          }));

        case 18:
          if (versionHash) {
            _context5.next = 22;
            break;
          }

          _context5.next = 21;
          return _regeneratorRuntime.awrap(this.LatestVersionHash({
            objectId: typeId
          }));

        case 21:
          versionHash = _context5.sent;

        case 22:
          _context5.prev = 22;
          this.Log("Looking up type by ID...");

          if (!publicOnly) {
            _context5.next = 34;
            break;
          }

          _context5.next = 27;
          return _regeneratorRuntime.awrap(this.ContentObjectMetadata({
            libraryId: this.contentSpaceLibraryId,
            objectId: typeId,
            versionHash: versionHash,
            metadataSubtree: "public"
          }));

        case 27:
          _context5.t0 = _context5.sent;

          if (_context5.t0) {
            _context5.next = 30;
            break;
          }

          _context5.t0 = {};

        case 30:
          _context5.t1 = _context5.t0;
          metadata = {
            "public": _context5.t1
          };
          _context5.next = 40;
          break;

        case 34:
          _context5.next = 36;
          return _regeneratorRuntime.awrap(this.ContentObjectMetadata({
            libraryId: this.contentSpaceLibraryId,
            objectId: typeId,
            versionHash: versionHash
          }));

        case 36:
          _context5.t2 = _context5.sent;

          if (_context5.t2) {
            _context5.next = 39;
            break;
          }

          _context5.t2 = {};

        case 39:
          metadata = _context5.t2;

        case 40:
          return _context5.abrupt("return", {
            id: typeId,
            hash: versionHash,
            name: metadata["public"] && metadata["public"].name || metadata.name || typeId,
            meta: metadata
          });

        case 43:
          _context5.prev = 43;
          _context5.t3 = _context5["catch"](22);
          this.Log("Error looking up content type:");
          this.Log(_context5.t3);
          throw new Error("Content Type ".concat(name || typeId, " is invalid"));

        case 48:
        case "end":
          return _context5.stop();
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


exports.ContentTypes = function _callee7() {
  var _this2 = this;

  var typeAddresses, contentSpaceTypes, contentSpaceTypeAddresses;
  return _regeneratorRuntime.async(function _callee7$(_context7) {
    while (1) {
      switch (_context7.prev = _context7.next) {
        case 0:
          this.contentTypes = this.contentTypes || {};
          this.Log("Looking up all available content types"); // Personally available types

          _context7.next = 4;
          return _regeneratorRuntime.awrap(this.Collection({
            collectionType: "contentTypes"
          }));

        case 4:
          typeAddresses = _context7.sent;
          this.Log("Personally available types:");
          this.Log(typeAddresses); // Content space types

          _context7.next = 9;
          return _regeneratorRuntime.awrap(this.ContentObjectMetadata({
            libraryId: this.contentSpaceLibraryId,
            objectId: this.contentSpaceObjectId,
            metadataSubtree: "public/contentTypes"
          }));

        case 9:
          _context7.t0 = _context7.sent;

          if (_context7.t0) {
            _context7.next = 12;
            break;
          }

          _context7.t0 = {};

        case 12:
          contentSpaceTypes = _context7.t0;
          contentSpaceTypeAddresses = Object.values(contentSpaceTypes).map(function (typeId) {
            return _this2.utils.HashToAddress(typeId);
          });
          this.Log("Content space types:");
          this.Log(contentSpaceTypeAddresses);
          typeAddresses = typeAddresses.concat(contentSpaceTypeAddresses).filter(function (address) {
            return address;
          }).map(function (address) {
            return _this2.utils.FormatAddress(address);
          }).filter(function (v, i, a) {
            return a.indexOf(v) === i;
          });
          _context7.next = 19;
          return _regeneratorRuntime.awrap(Promise.all(typeAddresses.map(function _callee6(typeAddress) {
            var typeId;
            return _regeneratorRuntime.async(function _callee6$(_context6) {
              while (1) {
                switch (_context6.prev = _context6.next) {
                  case 0:
                    typeId = _this2.utils.AddressToObjectId(typeAddress);

                    if (_this2.contentTypes[typeId]) {
                      _context6.next = 11;
                      break;
                    }

                    _context6.prev = 2;
                    _context6.next = 5;
                    return _regeneratorRuntime.awrap(_this2.ContentType({
                      typeId: typeId,
                      publicOnly: true
                    }));

                  case 5:
                    _this2.contentTypes[typeId] = _context6.sent;
                    _context6.next = 11;
                    break;

                  case 8:
                    _context6.prev = 8;
                    _context6.t0 = _context6["catch"](2);
                    // eslint-disable-next-line no-console
                    console.error(_context6.t0);

                  case 11:
                  case "end":
                    return _context6.stop();
                }
              }
            }, null, null, [[2, 8]]);
          })));

        case 19:
          return _context7.abrupt("return", this.contentTypes);

        case 20:
        case "end":
          return _context7.stop();
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


exports.ContentLibraries = function _callee8() {
  var _this3 = this;

  var libraryAddresses;
  return _regeneratorRuntime.async(function _callee8$(_context8) {
    while (1) {
      switch (_context8.prev = _context8.next) {
        case 0:
          _context8.next = 2;
          return _regeneratorRuntime.awrap(this.Collection({
            collectionType: "libraries"
          }));

        case 2:
          libraryAddresses = _context8.sent;
          return _context8.abrupt("return", libraryAddresses.map(function (address) {
            return _this3.utils.AddressToLibraryId(address);
          }));

        case 4:
        case "end":
          return _context8.stop();
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


exports.ContentLibrary = function _callee9(_ref5) {
  var libraryId, path, library;
  return _regeneratorRuntime.async(function _callee9$(_context9) {
    while (1) {
      switch (_context9.prev = _context9.next) {
        case 0:
          libraryId = _ref5.libraryId;
          ValidateLibrary(libraryId);
          path = UrlJoin("qlibs", libraryId);
          _context9.t0 = _regeneratorRuntime;
          _context9.t1 = this.utils;
          _context9.t2 = this.HttpClient;
          _context9.next = 8;
          return _regeneratorRuntime.awrap(this.authClient.AuthorizationHeader({
            libraryId: libraryId
          }));

        case 8:
          _context9.t3 = _context9.sent;
          _context9.t4 = path;
          _context9.t5 = {
            headers: _context9.t3,
            method: "GET",
            path: _context9.t4
          };
          _context9.t6 = _context9.t2.Request.call(_context9.t2, _context9.t5);
          _context9.t7 = _context9.t1.ResponseToJson.call(_context9.t1, _context9.t6);
          _context9.next = 15;
          return _context9.t0.awrap.call(_context9.t0, _context9.t7);

        case 15:
          library = _context9.sent;
          return _context9.abrupt("return", _objectSpread({}, library, {
            meta: library.meta || {}
          }));

        case 17:
        case "end":
          return _context9.stop();
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


exports.ContentLibraryOwner = function _callee10(_ref6) {
  var libraryId;
  return _regeneratorRuntime.async(function _callee10$(_context10) {
    while (1) {
      switch (_context10.prev = _context10.next) {
        case 0:
          libraryId = _ref6.libraryId;
          ValidateLibrary(libraryId);
          _context10.t0 = this.utils;
          _context10.next = 5;
          return _regeneratorRuntime.awrap(this.ethClient.CallContractMethod({
            contractAddress: this.utils.HashToAddress(libraryId),
            methodName: "owner",
            methodArgs: []
          }));

        case 5:
          _context10.t1 = _context10.sent;
          return _context10.abrupt("return", _context10.t0.FormatAddress.call(_context10.t0, _context10.t1));

        case 7:
        case "end":
          return _context10.stop();
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


exports.LibraryContentTypes = function _callee12(_ref7) {
  var _this4 = this;

  var libraryId, typesLength, allowedTypes;
  return _regeneratorRuntime.async(function _callee12$(_context12) {
    while (1) {
      switch (_context12.prev = _context12.next) {
        case 0:
          libraryId = _ref7.libraryId;
          ValidateLibrary(libraryId);
          this.Log("Retrieving library content types for ".concat(libraryId));
          _context12.next = 5;
          return _regeneratorRuntime.awrap(this.ethClient.CallContractMethod({
            contractAddress: this.utils.HashToAddress(libraryId),
            methodName: "contentTypesLength",
            methodArgs: []
          }));

        case 5:
          typesLength = _context12.sent.toNumber();
          this.Log("".concat(typesLength, " types")); // No allowed types set - any type accepted

          if (!(typesLength === 0)) {
            _context12.next = 9;
            break;
          }

          return _context12.abrupt("return", {});

        case 9:
          // Get the list of allowed content type addresses
          allowedTypes = {};
          _context12.next = 12;
          return _regeneratorRuntime.awrap(Promise.all(Array.from(new Array(typesLength), function _callee11(_, i) {
            var typeAddress, typeId;
            return _regeneratorRuntime.async(function _callee11$(_context11) {
              while (1) {
                switch (_context11.prev = _context11.next) {
                  case 0:
                    _context11.next = 2;
                    return _regeneratorRuntime.awrap(_this4.ethClient.CallContractMethod({
                      contractAddress: _this4.utils.HashToAddress(libraryId),
                      methodName: "contentTypes",
                      methodArgs: [i]
                    }));

                  case 2:
                    typeAddress = _context11.sent;
                    typeId = _this4.utils.AddressToObjectId(typeAddress);
                    _context11.next = 6;
                    return _regeneratorRuntime.awrap(_this4.ContentType({
                      typeId: typeId
                    }));

                  case 6:
                    allowedTypes[typeId] = _context11.sent;

                  case 7:
                  case "end":
                    return _context11.stop();
                }
              }
            });
          })));

        case 12:
          this.Log(allowedTypes);
          return _context12.abrupt("return", allowedTypes);

        case 14:
        case "end":
          return _context12.stop();
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
 * @param {boolean=} filterOptions.latestOnly=true - If specified, only latest version of objects will be included
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


exports.ContentObjects = function _callee13(_ref8) {
  var libraryId, _ref8$filterOptions, filterOptions, path, queryParams, filterTypeMap, addFilter;

  return _regeneratorRuntime.async(function _callee13$(_context13) {
    while (1) {
      switch (_context13.prev = _context13.next) {
        case 0:
          libraryId = _ref8.libraryId, _ref8$filterOptions = _ref8.filterOptions, filterOptions = _ref8$filterOptions === void 0 ? {} : _ref8$filterOptions;
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
          }

          if (filterOptions.latestOnly === false) {
            queryParams.latest_version_only = false;
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

          addFilter = function addFilter(_ref9) {
            var key = _ref9.key,
                type = _ref9.type,
                filter = _ref9.filter;
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
          _context13.t0 = _regeneratorRuntime;
          _context13.t1 = this.utils;
          _context13.t2 = this.HttpClient;
          _context13.next = 21;
          return _regeneratorRuntime.awrap(this.authClient.AuthorizationHeader({
            libraryId: libraryId
          }));

        case 21:
          _context13.t3 = _context13.sent;
          _context13.t4 = path;
          _context13.t5 = queryParams;
          _context13.t6 = {
            headers: _context13.t3,
            method: "GET",
            path: _context13.t4,
            queryParams: _context13.t5
          };
          _context13.t7 = _context13.t2.Request.call(_context13.t2, _context13.t6);
          _context13.t8 = _context13.t1.ResponseToJson.call(_context13.t1, _context13.t7);
          _context13.next = 29;
          return _context13.t0.awrap.call(_context13.t0, _context13.t8);

        case 29:
          return _context13.abrupt("return", _context13.sent);

        case 30:
        case "end":
          return _context13.stop();
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


exports.ContentObject = function _callee14(_ref10) {
  var libraryId, objectId, versionHash, path;
  return _regeneratorRuntime.async(function _callee14$(_context14) {
    while (1) {
      switch (_context14.prev = _context14.next) {
        case 0:
          libraryId = _ref10.libraryId, objectId = _ref10.objectId, versionHash = _ref10.versionHash;
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
          _context14.t0 = _regeneratorRuntime;
          _context14.t1 = this.utils;
          _context14.t2 = this.HttpClient;
          _context14.next = 10;
          return _regeneratorRuntime.awrap(this.authClient.AuthorizationHeader({
            libraryId: libraryId,
            objectId: objectId,
            versionHash: versionHash
          }));

        case 10:
          _context14.t3 = _context14.sent;
          _context14.t4 = path;
          _context14.t5 = {
            headers: _context14.t3,
            method: "GET",
            path: _context14.t4
          };
          _context14.t6 = _context14.t2.Request.call(_context14.t2, _context14.t5);
          _context14.t7 = _context14.t1.ResponseToJson.call(_context14.t1, _context14.t6);
          _context14.next = 17;
          return _context14.t0.awrap.call(_context14.t0, _context14.t7);

        case 17:
          return _context14.abrupt("return", _context14.sent);

        case 18:
        case "end":
          return _context14.stop();
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


exports.ContentObjectOwner = function _callee15(_ref11) {
  var objectId;
  return _regeneratorRuntime.async(function _callee15$(_context15) {
    while (1) {
      switch (_context15.prev = _context15.next) {
        case 0:
          objectId = _ref11.objectId;
          ValidateObject(objectId);
          this.Log("Retrieving content object owner: ".concat(objectId));
          _context15.t0 = this.utils;
          _context15.next = 6;
          return _regeneratorRuntime.awrap(this.ethClient.CallContractMethod({
            contractAddress: this.utils.HashToAddress(objectId),
            methodName: "owner",
            methodArgs: []
          }));

        case 6:
          _context15.t1 = _context15.sent;
          return _context15.abrupt("return", _context15.t0.FormatAddress.call(_context15.t0, _context15.t1));

        case 8:
        case "end":
          return _context15.stop();
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


exports.ContentObjectLibraryId = function _callee16(_ref12) {
  var objectId, versionHash;
  return _regeneratorRuntime.async(function _callee16$(_context16) {
    while (1) {
      switch (_context16.prev = _context16.next) {
        case 0:
          objectId = _ref12.objectId, versionHash = _ref12.versionHash;
          versionHash ? ValidateVersion(versionHash) : ValidateObject(objectId);

          if (versionHash) {
            objectId = this.utils.DecodeVersionHash(versionHash).objectId;
          }

          _context16.next = 5;
          return _regeneratorRuntime.awrap(this.authClient.AccessType(objectId));

        case 5:
          _context16.t0 = _context16.sent;
          _context16.next = _context16.t0 === this.authClient.ACCESS_TYPES.LIBRARY ? 8 : _context16.t0 === this.authClient.ACCESS_TYPES.OBJECT ? 9 : 17;
          break;

        case 8:
          return _context16.abrupt("return", this.utils.AddressToLibraryId(this.utils.HashToAddress(objectId)));

        case 9:
          if (this.objectLibraryIds[objectId]) {
            _context16.next = 16;
            break;
          }

          this.Log("Retrieving content object library ID: ".concat(objectId || versionHash));
          _context16.t1 = this.utils;
          _context16.next = 14;
          return _regeneratorRuntime.awrap(this.CallContractMethod({
            contractAddress: this.utils.HashToAddress(objectId),
            methodName: "libraryAddress"
          }));

        case 14:
          _context16.t2 = _context16.sent;
          this.objectLibraryIds[objectId] = _context16.t1.AddressToLibraryId.call(_context16.t1, _context16.t2);

        case 16:
          return _context16.abrupt("return", this.objectLibraryIds[objectId]);

        case 17:
          return _context16.abrupt("return", this.contentSpaceLibraryId);

        case 18:
        case "end":
          return _context16.stop();
      }
    }
  }, null, this);
};

exports.ProduceMetadataLinks = function _callee19(_ref13) {
  var _this5 = this;

  var libraryId, objectId, versionHash, _ref13$path, path, metadata, result;

  return _regeneratorRuntime.async(function _callee19$(_context19) {
    while (1) {
      switch (_context19.prev = _context19.next) {
        case 0:
          libraryId = _ref13.libraryId, objectId = _ref13.objectId, versionHash = _ref13.versionHash, _ref13$path = _ref13.path, path = _ref13$path === void 0 ? "/" : _ref13$path, metadata = _ref13.metadata;

          if (!(!metadata || _typeof(metadata) !== "object")) {
            _context19.next = 3;
            break;
          }

          return _context19.abrupt("return", metadata);

        case 3:
          if (!Array.isArray(metadata)) {
            _context19.next = 7;
            break;
          }

          _context19.next = 6;
          return _regeneratorRuntime.awrap(this.utils.LimitedMap(5, metadata, function _callee17(entry, i) {
            return _regeneratorRuntime.async(function _callee17$(_context17) {
              while (1) {
                switch (_context17.prev = _context17.next) {
                  case 0:
                    _context17.next = 2;
                    return _regeneratorRuntime.awrap(_this5.ProduceMetadataLinks({
                      libraryId: libraryId,
                      objectId: objectId,
                      versionHash: versionHash,
                      path: UrlJoin(path, i.toString()),
                      metadata: entry
                    }));

                  case 2:
                    return _context17.abrupt("return", _context17.sent);

                  case 3:
                  case "end":
                    return _context17.stop();
                }
              }
            });
          }));

        case 6:
          return _context19.abrupt("return", _context19.sent);

        case 7:
          if (!(metadata["/"] && (metadata["/"].match(/\.\/(rep|files)\/.+/) || metadata["/"].match(/^\/?qfab\/([\w]+)\/?(rep|files)\/.+/)))) {
            _context19.next = 16;
            break;
          }

          _context19.t0 = _objectSpread;
          _context19.t1 = {};
          _context19.t2 = metadata;
          _context19.next = 13;
          return _regeneratorRuntime.awrap(this.LinkUrl({
            libraryId: libraryId,
            objectId: objectId,
            versionHash: versionHash,
            linkPath: path
          }));

        case 13:
          _context19.t3 = _context19.sent;
          _context19.t4 = {
            url: _context19.t3
          };
          return _context19.abrupt("return", (0, _context19.t0)(_context19.t1, _context19.t2, _context19.t4));

        case 16:
          result = {};
          _context19.next = 19;
          return _regeneratorRuntime.awrap(this.utils.LimitedMap(5, Object.keys(metadata), function _callee18(key) {
            return _regeneratorRuntime.async(function _callee18$(_context18) {
              while (1) {
                switch (_context18.prev = _context18.next) {
                  case 0:
                    _context18.next = 2;
                    return _regeneratorRuntime.awrap(_this5.ProduceMetadataLinks({
                      libraryId: libraryId,
                      objectId: objectId,
                      versionHash: versionHash,
                      path: UrlJoin(path, key),
                      metadata: metadata[key]
                    }));

                  case 2:
                    result[key] = _context18.sent;

                  case 3:
                  case "end":
                    return _context18.stop();
                }
              }
            });
          }));

        case 19:
          return _context19.abrupt("return", result);

        case 20:
        case "end":
          return _context19.stop();
      }
    }
  }, null, this);
};

exports.MetadataAuth = function _callee20(_ref14) {
  var libraryId, objectId, versionHash, _ref14$path, path, visibility, accessType, isPublic, noAuth, kmsAddress;

  return _regeneratorRuntime.async(function _callee20$(_context20) {
    while (1) {
      switch (_context20.prev = _context20.next) {
        case 0:
          libraryId = _ref14.libraryId, objectId = _ref14.objectId, versionHash = _ref14.versionHash, _ref14$path = _ref14.path, path = _ref14$path === void 0 ? "/" : _ref14$path;
          ValidateParameters({
            libraryId: libraryId,
            objectId: objectId,
            versionHash: versionHash
          });

          if (versionHash) {
            objectId = this.utils.DecodeVersionHash(versionHash).objectId;
          }

          _context20.next = 5;
          return _regeneratorRuntime.awrap(this.Visibility({
            id: objectId
          }));

        case 5:
          visibility = _context20.sent;
          _context20.next = 8;
          return _regeneratorRuntime.awrap(this.AccessType({
            id: objectId
          }));

        case 8:
          accessType = _context20.sent;
          isPublic = (path || "").replace(/^\/+/, "").startsWith("public");
          noAuth = true;

          if (this.fabricVersion >= 3) {
            noAuth = visibility >= 10 || isPublic && visibility >= 1;
          }

          if (!this.oauthToken) {
            _context20.next = 20;
            break;
          }

          _context20.next = 15;
          return _regeneratorRuntime.awrap(this.authClient.KMSAddress({
            objectId: objectId,
            versionHash: versionHash
          }));

        case 15:
          kmsAddress = _context20.sent;

          if (!(kmsAddress && !this.utils.EqualAddress(kmsAddress, this.utils.nullAddress))) {
            _context20.next = 20;
            break;
          }

          _context20.next = 19;
          return _regeneratorRuntime.awrap(this.authClient.AuthorizationToken({
            libraryId: libraryId,
            objectId: objectId,
            versionHash: versionHash,
            channelAuth: true,
            oauthToken: this.oauthToken
          }));

        case 19:
          return _context20.abrupt("return", _context20.sent);

        case 20:
          if (!(isPublic && accessType === this.authClient.ACCESS_TYPES.OBJECT)) {
            _context20.next = 37;
            break;
          }

          _context20.t0 = _regeneratorRuntime;
          _context20.t1 = this.authClient;
          _context20.t2 = libraryId;

          if (_context20.t2) {
            _context20.next = 28;
            break;
          }

          _context20.next = 27;
          return _regeneratorRuntime.awrap(this.ContentObjectLibraryId({
            objectId: objectId,
            versionHash: versionHash
          }));

        case 27:
          _context20.t2 = _context20.sent;

        case 28:
          _context20.t3 = _context20.t2;
          _context20.t4 = noAuth;
          _context20.t5 = {
            libraryId: _context20.t3,
            noAuth: _context20.t4
          };
          _context20.t6 = _context20.t1.AuthorizationToken.call(_context20.t1, _context20.t5);
          _context20.next = 34;
          return _context20.t0.awrap.call(_context20.t0, _context20.t6);

        case 34:
          return _context20.abrupt("return", _context20.sent);

        case 37:
          _context20.next = 39;
          return _regeneratorRuntime.awrap(this.authClient.AuthorizationToken({
            libraryId: libraryId,
            objectId: objectId,
            versionHash: versionHash,
            noAuth: noAuth
          }));

        case 39:
          return _context20.abrupt("return", _context20.sent);

        case 40:
        case "end":
          return _context20.stop();
      }
    }
  }, null, this);
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
 * @param {boolean=} noAuth=false - If specified, authorization will not be performed for this call
 *
 * @returns {Promise<Object | string>} - Metadata of the content object
 */


exports.ContentObjectMetadata = function _callee21(_ref15) {
  var libraryId, objectId, versionHash, writeToken, _ref15$metadataSubtre, metadataSubtree, _ref15$queryParams, queryParams, _ref15$select, select, _ref15$remove, remove, _ref15$resolveLinks, resolveLinks, _ref15$resolveInclude, resolveIncludeSource, _ref15$resolveIgnoreE, resolveIgnoreErrors, _ref15$linkDepthLimit, linkDepthLimit, _ref15$produceLinkUrl, produceLinkUrls, path, metadata, authToken;

  return _regeneratorRuntime.async(function _callee21$(_context21) {
    while (1) {
      switch (_context21.prev = _context21.next) {
        case 0:
          libraryId = _ref15.libraryId, objectId = _ref15.objectId, versionHash = _ref15.versionHash, writeToken = _ref15.writeToken, _ref15$metadataSubtre = _ref15.metadataSubtree, metadataSubtree = _ref15$metadataSubtre === void 0 ? "/" : _ref15$metadataSubtre, _ref15$queryParams = _ref15.queryParams, queryParams = _ref15$queryParams === void 0 ? {} : _ref15$queryParams, _ref15$select = _ref15.select, select = _ref15$select === void 0 ? [] : _ref15$select, _ref15$remove = _ref15.remove, remove = _ref15$remove === void 0 ? [] : _ref15$remove, _ref15$resolveLinks = _ref15.resolveLinks, resolveLinks = _ref15$resolveLinks === void 0 ? false : _ref15$resolveLinks, _ref15$resolveInclude = _ref15.resolveIncludeSource, resolveIncludeSource = _ref15$resolveInclude === void 0 ? false : _ref15$resolveInclude, _ref15$resolveIgnoreE = _ref15.resolveIgnoreErrors, resolveIgnoreErrors = _ref15$resolveIgnoreE === void 0 ? false : _ref15$resolveIgnoreE, _ref15$linkDepthLimit = _ref15.linkDepthLimit, linkDepthLimit = _ref15$linkDepthLimit === void 0 ? 1 : _ref15$linkDepthLimit, _ref15$produceLinkUrl = _ref15.produceLinkUrls, produceLinkUrls = _ref15$produceLinkUrl === void 0 ? false : _ref15$produceLinkUrl;
          ValidateParameters({
            libraryId: libraryId,
            objectId: objectId,
            versionHash: versionHash
          });
          this.Log("Retrieving content object metadata: ".concat(libraryId || "", " ").concat(objectId || versionHash, " ").concat(writeToken || "", "\n       Subtree: ").concat(metadataSubtree));

          if (versionHash) {
            objectId = this.utils.DecodeVersionHash(versionHash).objectId;
          }

          path = UrlJoin("q", writeToken || versionHash || objectId, "meta", metadataSubtree);
          _context21.prev = 5;
          _context21.next = 8;
          return _regeneratorRuntime.awrap(this.MetadataAuth({
            libraryId: libraryId,
            objectId: objectId,
            versionHash: versionHash,
            path: metadataSubtree
          }));

        case 8:
          authToken = _context21.sent;
          _context21.next = 11;
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

        case 11:
          metadata = _context21.sent;
          _context21.next = 19;
          break;

        case 14:
          _context21.prev = 14;
          _context21.t0 = _context21["catch"](5);

          if (!(_context21.t0.status !== 404)) {
            _context21.next = 18;
            break;
          }

          throw _context21.t0;

        case 18:
          metadata = metadataSubtree === "/" ? {} : undefined;

        case 19:
          if (produceLinkUrls) {
            _context21.next = 21;
            break;
          }

          return _context21.abrupt("return", metadata);

        case 21:
          _context21.next = 23;
          return _regeneratorRuntime.awrap(this.ProduceMetadataLinks({
            libraryId: libraryId,
            objectId: objectId,
            versionHash: versionHash,
            path: metadataSubtree,
            metadata: metadata
          }));

        case 23:
          return _context21.abrupt("return", _context21.sent);

        case 24:
        case "end":
          return _context21.stop();
      }
    }
  }, null, this, [[5, 14]]);
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


exports.ContentObjectVersions = function _callee22(_ref16) {
  var libraryId, objectId, path;
  return _regeneratorRuntime.async(function _callee22$(_context22) {
    while (1) {
      switch (_context22.prev = _context22.next) {
        case 0:
          libraryId = _ref16.libraryId, objectId = _ref16.objectId;
          ValidateParameters({
            libraryId: libraryId,
            objectId: objectId
          });
          this.Log("Retrieving content object versions: ".concat(libraryId || "", " ").concat(objectId));
          path = UrlJoin("qid", objectId);
          _context22.t0 = this.utils;
          _context22.t1 = this.HttpClient;
          _context22.next = 8;
          return _regeneratorRuntime.awrap(this.authClient.AuthorizationHeader({
            libraryId: libraryId,
            objectId: objectId
          }));

        case 8:
          _context22.t2 = _context22.sent;
          _context22.t3 = path;
          _context22.t4 = {
            headers: _context22.t2,
            method: "GET",
            path: _context22.t3
          };
          _context22.t5 = _context22.t1.Request.call(_context22.t1, _context22.t4);
          return _context22.abrupt("return", _context22.t0.ResponseToJson.call(_context22.t0, _context22.t5));

        case 13:
        case "end":
          return _context22.stop();
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


exports.LatestVersionHash = function _callee23(_ref17) {
  var objectId, versionHash, latestHash, versions;
  return _regeneratorRuntime.async(function _callee23$(_context23) {
    while (1) {
      switch (_context23.prev = _context23.next) {
        case 0:
          objectId = _ref17.objectId, versionHash = _ref17.versionHash;

          if (versionHash) {
            objectId = this.utils.DecodeVersionHash(versionHash).objectId;
          }

          ValidateObject(objectId);
          _context23.next = 5;
          return _regeneratorRuntime.awrap(this.CallContractMethod({
            contractAddress: this.utils.HashToAddress(objectId),
            methodName: "objectHash"
          }));

        case 5:
          latestHash = _context23.sent;

          if (latestHash) {
            _context23.next = 19;
            break;
          }

          _context23.t0 = _regeneratorRuntime;
          _context23.t1 = this;
          _context23.next = 11;
          return _regeneratorRuntime.awrap(this.ContentObjectLibraryId({
            objectId: objectId
          }));

        case 11:
          _context23.t2 = _context23.sent;
          _context23.t3 = objectId;
          _context23.t4 = {
            libraryId: _context23.t2,
            objectId: _context23.t3
          };
          _context23.t5 = _context23.t1.ContentObjectVersions.call(_context23.t1, _context23.t4);
          _context23.next = 17;
          return _context23.t0.awrap.call(_context23.t0, _context23.t5);

        case 17:
          versions = _context23.sent;

          if (versions && versions.versions && versions.versions[0]) {
            latestHash = versions.versions[0].hash;
          }

        case 19:
          return _context23.abrupt("return", latestHash);

        case 20:
        case "end":
          return _context23.stop();
      }
    }
  }, null, this);
};
/* URL Methods */

/**
 * Determine available DRM types available in this browser environment.
 *
 * @methodGroup Media
 * @return {Promise<Array<string>>}
 */


exports.AvailableDRMs = function _callee24() {
  var availableDRMs, info, version, major, minor, _version, _major, _minor, config;

  return _regeneratorRuntime.async(function _callee24$(_context24) {
    while (1) {
      switch (_context24.prev = _context24.next) {
        case 0:
          availableDRMs = ["clear", "aes-128"];

          if (!(typeof window === "undefined")) {
            _context24.next = 3;
            break;
          }

          return _context24.abrupt("return", availableDRMs);

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
              }
            } // Test Safari


            if (/^((?!chrome|android).)*safari/i.test(window.navigator.userAgent)) {
              _version = window.navigator.userAgent.match(/.+Version\/(\d+)\.(\d+)/);

              if (_version && _version[2]) {
                _major = parseInt(_version[1]);
                _minor = parseInt(_version[2]);

                if (_major > 13 || _major === 13 && _minor >= 1) {
                  availableDRMs[1] = "sample-aes";
                }
              }
            }
          }

          if (!(typeof window !== "undefined" && typeof window.navigator.requestMediaKeySystemAccess !== "function")) {
            _context24.next = 6;
            break;
          }

          return _context24.abrupt("return", availableDRMs);

        case 6:
          _context24.prev = 6;
          config = [{
            initDataTypes: ["cenc"],
            audioCapabilities: [{
              contentType: "audio/mp4;codecs=\"mp4a.40.2\""
            }],
            videoCapabilities: [{
              contentType: "video/mp4;codecs=\"avc1.42E01E\""
            }]
          }];
          _context24.next = 10;
          return _regeneratorRuntime.awrap(navigator.requestMediaKeySystemAccess("com.widevine.alpha", config));

        case 10:
          availableDRMs.push("widevine"); // eslint-disable-next-line no-empty

          _context24.next = 15;
          break;

        case 13:
          _context24.prev = 13;
          _context24.t0 = _context24["catch"](6);

        case 15:
          return _context24.abrupt("return", availableDRMs);

        case 16:
        case "end":
          return _context24.stop();
      }
    }
  }, null, null, [[6, 13]]);
};

exports.AudienceData = function (_ref18) {
  var objectId = _ref18.objectId,
      versionHash = _ref18.versionHash,
      _ref18$protocols = _ref18.protocols,
      protocols = _ref18$protocols === void 0 ? [] : _ref18$protocols,
      _ref18$drms = _ref18.drms,
      drms = _ref18$drms === void 0 ? [] : _ref18$drms;
  versionHash ? ValidateVersion(versionHash) : ValidateObject(objectId);
  this.Log("Retrieving audience data: ".concat(objectId));
  var data = {
    user_address: this.utils.FormatAddress(this.signer.address),
    content_id: objectId || this.utils.DecodeVersionHash(versionHash).id,
    content_hash: versionHash,
    hostname: this.HttpClient.BaseURI().hostname(),
    access_time: Math.round(new Date().getTime()).toString(),
    format: protocols.join(","),
    drm: drms.join(",")
  };

  if (typeof window !== "undefined" && window.navigator) {
    data.user_string = window.navigator.userAgent;
    data.language = window.navigator.language;
  }

  this.Log(data);
  return data;
};
/**
 * Retrieve available playout offerings for the specified content
 *
 * @methodGroup Media
 * @param {string=} objectId - Id of the content
 * @param {string=} versionHash - Version hash of the content
 * @param {string=} writeToken - Write token for the content
 * @param {string=} linkPath - If playing from a link, the path to the link
 *
 * @return {Promise<Object>} - The available offerings
 */


exports.AvailableOfferings = function _callee25(_ref19) {
  var objectId, versionHash, writeToken, linkPath, path, audienceData;
  return _regeneratorRuntime.async(function _callee25$(_context25) {
    while (1) {
      switch (_context25.prev = _context25.next) {
        case 0:
          objectId = _ref19.objectId, versionHash = _ref19.versionHash, writeToken = _ref19.writeToken, linkPath = _ref19.linkPath;

          if (objectId) {
            _context25.next = 5;
            break;
          }

          objectId = this.utils.DecodeVersionHash(versionHash).objectId;
          _context25.next = 9;
          break;

        case 5:
          if (versionHash) {
            _context25.next = 9;
            break;
          }

          _context25.next = 8;
          return _regeneratorRuntime.awrap(this.LatestVersionHash({
            objectId: objectId
          }));

        case 8:
          versionHash = _context25.sent;

        case 9:
          if (!linkPath) {
            _context25.next = 14;
            break;
          }

          _context25.next = 12;
          return _regeneratorRuntime.awrap(this.LinkTarget({
            objectId: objectId,
            versionHash: versionHash,
            writeToken: writeToken,
            linkPath: linkPath
          }));

        case 12:
          versionHash = _context25.sent;
          objectId = this.utils.DecodeVersionHash(versionHash).objectId;

        case 14:
          path = UrlJoin("q", versionHash, "rep", "playout", "options.json");
          audienceData = this.AudienceData({
            objectId: objectId,
            versionHash: versionHash
          });
          _context25.prev = 16;
          _context25.t0 = _regeneratorRuntime;
          _context25.t1 = this.utils;
          _context25.t2 = this.HttpClient;
          _context25.t3 = path;
          _context25.next = 23;
          return _regeneratorRuntime.awrap(this.authClient.AuthorizationHeader({
            objectId: objectId,
            channelAuth: true,
            oauthToken: this.oauthToken,
            audienceData: audienceData
          }));

        case 23:
          _context25.t4 = _context25.sent;
          _context25.t5 = {
            path: _context25.t3,
            method: "GET",
            headers: _context25.t4
          };
          _context25.t6 = _context25.t2.Request.call(_context25.t2, _context25.t5);
          _context25.t7 = _context25.t1.ResponseToJson.call(_context25.t1, _context25.t6);
          _context25.next = 29;
          return _context25.t0.awrap.call(_context25.t0, _context25.t7);

        case 29:
          return _context25.abrupt("return", _context25.sent);

        case 32:
          _context25.prev = 32;
          _context25.t8 = _context25["catch"](16);

          if (!(_context25.t8.status && parseInt(_context25.t8.status) === 500)) {
            _context25.next = 36;
            break;
          }

          return _context25.abrupt("return", {});

        case 36:
          throw _context25.t8;

        case 37:
        case "end":
          return _context25.stop();
      }
    }
  }, null, this, [[16, 32]]);
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
 * @param {string=} objectId - Id of the content
 * @param {string=} versionHash - Version hash of the content
 * @param {string=} writeToken - Write token for the content
 * @param {string=} linkPath - If playing from a link, the path to the link
 * @param {Array<string>} protocols=["dash", "hls"] - Acceptable playout protocols ("dash", "hls")
 * @param {Array<string>} drms - Acceptable DRM formats ("clear", "aes-128", "widevine")
 * @param {string=} offering=default - The offering to play
 */


exports.PlayoutOptions = function _callee26(_ref20) {
  var objectId, versionHash, writeToken, linkPath, _ref20$protocols, protocols, _ref20$offering, offering, _ref20$drms, drms, _ref20$hlsjsProfile, hlsjsProfile, libraryId, path, linkTargetLibraryId, linkTargetId, linkTargetHash, audienceData, queryParams, playoutOptions, playoutMap, i, option, protocol, drm, playoutPath, licenseServers, protocolMatch, drmMatch;

  return _regeneratorRuntime.async(function _callee26$(_context26) {
    while (1) {
      switch (_context26.prev = _context26.next) {
        case 0:
          objectId = _ref20.objectId, versionHash = _ref20.versionHash, writeToken = _ref20.writeToken, linkPath = _ref20.linkPath, _ref20$protocols = _ref20.protocols, protocols = _ref20$protocols === void 0 ? ["dash", "hls"] : _ref20$protocols, _ref20$offering = _ref20.offering, offering = _ref20$offering === void 0 ? "default" : _ref20$offering, _ref20$drms = _ref20.drms, drms = _ref20$drms === void 0 ? [] : _ref20$drms, _ref20$hlsjsProfile = _ref20.hlsjsProfile, hlsjsProfile = _ref20$hlsjsProfile === void 0 ? true : _ref20$hlsjsProfile;
          versionHash ? ValidateVersion(versionHash) : ValidateObject(objectId);
          protocols = protocols.map(function (p) {
            return p.toLowerCase();
          });
          drms = drms.map(function (d) {
            return d.toLowerCase();
          });

          if (objectId) {
            _context26.next = 8;
            break;
          }

          objectId = this.utils.DecodeVersionHash(versionHash).objectId;
          _context26.next = 12;
          break;

        case 8:
          if (versionHash) {
            _context26.next = 12;
            break;
          }

          _context26.next = 11;
          return _regeneratorRuntime.awrap(this.LatestVersionHash({
            objectId: objectId
          }));

        case 11:
          versionHash = _context26.sent;

        case 12:
          _context26.next = 14;
          return _regeneratorRuntime.awrap(this.ContentObjectLibraryId({
            objectId: objectId
          }));

        case 14:
          libraryId = _context26.sent;

          if (!linkPath) {
            _context26.next = 26;
            break;
          }

          _context26.next = 18;
          return _regeneratorRuntime.awrap(this.LinkTarget({
            libraryId: libraryId,
            objectId: objectId,
            versionHash: versionHash,
            writeToken: writeToken,
            linkPath: linkPath
          }));

        case 18:
          linkTargetHash = _context26.sent;
          linkTargetId = this.utils.DecodeVersionHash(linkTargetHash).objectId;
          _context26.next = 22;
          return _regeneratorRuntime.awrap(this.ContentObjectLibraryId({
            objectId: linkTargetId
          }));

        case 22:
          linkTargetLibraryId = _context26.sent;

          if (writeToken) {
            path = UrlJoin("qlibs", libraryId, "q", writeToken, "meta", linkPath);
          } else {
            path = UrlJoin("q", versionHash, "meta", linkPath);
          }

          _context26.next = 27;
          break;

        case 26:
          path = UrlJoin("q", versionHash, "rep", "playout", offering, "options.json");

        case 27:
          _context26.t0 = this;
          _context26.t1 = linkTargetId || objectId;
          _context26.t2 = linkTargetHash || versionHash;

          if (_context26.t2) {
            _context26.next = 34;
            break;
          }

          _context26.next = 33;
          return _regeneratorRuntime.awrap(this.LatestVersionHash({
            objectId: objectId
          }));

        case 33:
          _context26.t2 = _context26.sent;

        case 34:
          _context26.t3 = _context26.t2;
          _context26.t4 = protocols;
          _context26.t5 = drms;
          _context26.t6 = {
            objectId: _context26.t1,
            versionHash: _context26.t3,
            protocols: _context26.t4,
            drms: _context26.t5
          };
          audienceData = _context26.t0.AudienceData.call(_context26.t0, _context26.t6);
          _context26.next = 41;
          return _regeneratorRuntime.awrap(this.authClient.AuthorizationToken({
            libraryId: linkTargetLibraryId || libraryId,
            objectId: linkTargetId || objectId,
            channelAuth: true,
            oauthToken: this.oauthToken,
            audienceData: audienceData
          }));

        case 41:
          _context26.t7 = _context26.sent;
          queryParams = {
            authorization: _context26.t7
          };

          if (linkPath) {
            queryParams.resolve = true;
          }

          _context26.t8 = Object;
          _context26.next = 47;
          return _regeneratorRuntime.awrap(this.utils.ResponseToJson(this.HttpClient.Request({
            path: path,
            method: "GET",
            queryParams: queryParams
          })));

        case 47:
          _context26.t9 = _context26.sent;
          playoutOptions = _context26.t8.values.call(_context26.t8, _context26.t9);
          playoutMap = {};
          i = 0;

        case 51:
          if (!(i < playoutOptions.length)) {
            _context26.next = 83;
            break;
          }

          option = playoutOptions[i];
          protocol = option.properties.protocol;
          drm = option.properties.drm; // Remove authorization parameter from playout path - it's re-added by Rep

          playoutPath = option.uri.split("?")[0];
          licenseServers = option.properties.license_servers; // Create full playout URLs for this protocol / drm combo

          _context26.t10 = _objectSpread;
          _context26.t11 = {};
          _context26.t12 = playoutMap[protocol] || {};
          _context26.t13 = _objectSpread;
          _context26.t14 = {};
          _context26.t15 = (playoutMap[protocol] || {}).playoutMethods || {};
          _context26.t16 = _defineProperty;
          _context26.t17 = {};
          _context26.t18 = drm || "clear";
          _context26.next = 68;
          return _regeneratorRuntime.awrap(this.Rep({
            libraryId: linkTargetLibraryId || libraryId,
            objectId: linkTargetId || objectId,
            versionHash: linkTargetHash || versionHash,
            rep: UrlJoin("playout", offering, playoutPath),
            channelAuth: true,
            queryParams: hlsjsProfile && protocol === "hls" && drm === "aes-128" ? {
              player_profile: "hls-js"
            } : {}
          }));

        case 68:
          _context26.t19 = _context26.sent;
          _context26.t20 = drm ? _defineProperty({}, drm, {
            licenseServers: licenseServers
          }) : undefined;
          _context26.t21 = {
            playoutUrl: _context26.t19,
            drms: _context26.t20
          };
          _context26.t22 = (0, _context26.t16)(_context26.t17, _context26.t18, _context26.t21);
          _context26.t23 = (0, _context26.t13)(_context26.t14, _context26.t15, _context26.t22);
          _context26.t24 = {
            playoutMethods: _context26.t23
          };
          playoutMap[protocol] = (0, _context26.t10)(_context26.t11, _context26.t12, _context26.t24);
          // Exclude any options that do not satisfy the specified protocols and/or DRMs
          protocolMatch = protocols.includes(protocol);
          drmMatch = drms.includes(drm || "clear") || drms.length === 0 && !drm;

          if (!(!protocolMatch || !drmMatch)) {
            _context26.next = 79;
            break;
          }

          return _context26.abrupt("continue", 80);

        case 79:
          // This protocol / DRM satisfies the specifications (prefer DRM over clear, if available)
          if (!playoutMap[protocol].playoutUrl || drm && drm !== "clear") {
            playoutMap[protocol].playoutUrl = playoutMap[protocol].playoutMethods[drm || "clear"].playoutUrl;
            playoutMap[protocol].drms = playoutMap[protocol].playoutMethods[drm || "clear"].drms;
          }

        case 80:
          i++;
          _context26.next = 51;
          break;

        case 83:
          this.Log(playoutMap);
          return _context26.abrupt("return", playoutMap);

        case 85:
        case "end":
          return _context26.stop();
      }
    }
  }, null, this);
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
 * @param {string=} objectId - Id of the content
 * @param {string} versionHash - Version hash of the content
 * @param {string=} linkPath - If playing from a link, the path to the link
 * @param {Array<string>} protocols=["dash", "hls"] - Acceptable playout protocols ("dash", "hls")
 * @param {Array<string>} drms - Acceptable DRM formats ("clear", "aes-128", "sample-aes", "widevine")
 * @param {string=} offering=default - The offering to play
 */


exports.BitmovinPlayoutOptions = function _callee27(_ref22) {
  var objectId, versionHash, linkPath, _ref22$protocols, protocols, _ref22$drms, drms, _ref22$offering, offering, playoutOptions, linkTargetId, linkTargetHash, libraryId, authToken, config;

  return _regeneratorRuntime.async(function _callee27$(_context27) {
    while (1) {
      switch (_context27.prev = _context27.next) {
        case 0:
          objectId = _ref22.objectId, versionHash = _ref22.versionHash, linkPath = _ref22.linkPath, _ref22$protocols = _ref22.protocols, protocols = _ref22$protocols === void 0 ? ["dash", "hls"] : _ref22$protocols, _ref22$drms = _ref22.drms, drms = _ref22$drms === void 0 ? [] : _ref22$drms, _ref22$offering = _ref22.offering, offering = _ref22$offering === void 0 ? "default" : _ref22$offering;
          versionHash ? ValidateVersion(versionHash) : ValidateObject(objectId);

          if (!objectId) {
            objectId = this.utils.DecodeVersionHash(versionHash).objectId;
          }

          _context27.next = 5;
          return _regeneratorRuntime.awrap(this.PlayoutOptions({
            objectId: objectId,
            versionHash: versionHash,
            linkPath: linkPath,
            protocols: protocols,
            drms: drms,
            offering: offering,
            hlsjsProfile: false
          }));

        case 5:
          playoutOptions = _context27.sent;
          delete playoutOptions.playoutMethods;

          if (!linkPath) {
            _context27.next = 15;
            break;
          }

          _context27.next = 10;
          return _regeneratorRuntime.awrap(this.ContentObjectLibraryId({
            objectId: objectId,
            versionHash: versionHash
          }));

        case 10:
          libraryId = _context27.sent;
          _context27.next = 13;
          return _regeneratorRuntime.awrap(this.LinkTarget({
            libraryId: libraryId,
            objectId: objectId,
            versionHash: versionHash,
            linkPath: linkPath
          }));

        case 13:
          linkTargetHash = _context27.sent;
          linkTargetId = this.utils.DecodeVersionHash(linkTargetHash).objectId;

        case 15:
          _context27.next = 17;
          return _regeneratorRuntime.awrap(this.authClient.AuthorizationToken({
            objectId: linkTargetId || objectId,
            channelAuth: true,
            oauthToken: this.oauthToken
          }));

        case 17:
          authToken = _context27.sent;
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
                      Authorization: "Bearer ".concat(authToken)
                    }
                  };
                }
              });
            }
          });
          return _context27.abrupt("return", config);

        case 21:
        case "end":
          return _context27.stop();
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


exports.CallBitcodeMethod = function _callee28(_ref23) {
  var libraryId, objectId, versionHash, writeToken, method, _ref23$queryParams, queryParams, _ref23$body, body, _ref23$headers, headers, _ref23$constant, constant, _ref23$format, format, path, authHeader;

  return _regeneratorRuntime.async(function _callee28$(_context28) {
    while (1) {
      switch (_context28.prev = _context28.next) {
        case 0:
          libraryId = _ref23.libraryId, objectId = _ref23.objectId, versionHash = _ref23.versionHash, writeToken = _ref23.writeToken, method = _ref23.method, _ref23$queryParams = _ref23.queryParams, queryParams = _ref23$queryParams === void 0 ? {} : _ref23$queryParams, _ref23$body = _ref23.body, body = _ref23$body === void 0 ? {} : _ref23$body, _ref23$headers = _ref23.headers, headers = _ref23$headers === void 0 ? {} : _ref23$headers, _ref23$constant = _ref23.constant, constant = _ref23$constant === void 0 ? true : _ref23$constant, _ref23$format = _ref23.format, format = _ref23$format === void 0 ? "json" : _ref23$format;
          ValidateParameters({
            libraryId: libraryId,
            objectId: objectId,
            versionHash: versionHash
          });

          if (method) {
            _context28.next = 4;
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
            _context28.next = 12;
            break;
          }

          _context28.next = 11;
          return _regeneratorRuntime.awrap(this.authClient.AuthorizationHeader({
            libraryId: libraryId,
            objectId: objectId,
            update: !constant
          }));

        case 11:
          headers.Authorization = _context28.sent.Authorization;

        case 12:
          this.Log("Calling bitcode method: ".concat(libraryId || "", " ").concat(objectId || versionHash, " ").concat(writeToken || "", "\n      ").concat(constant ? "GET" : "POST", " ").concat(path, "\n      Query Params:\n      ").concat(JSON.stringify(queryParams || ""), "\n      Body:\n      ").concat(JSON.stringify(body || ""), "\n      Headers\n      ").concat(JSON.stringify(headers || "")));
          _context28.t0 = this.utils;
          _context28.t1 = format;
          _context28.next = 17;
          return _regeneratorRuntime.awrap(this.HttpClient.Request({
            body: body,
            headers: headers,
            method: constant ? "GET" : "POST",
            path: path,
            queryParams: queryParams,
            failover: false
          }));

        case 17:
          _context28.t2 = _context28.sent;
          return _context28.abrupt("return", _context28.t0.ResponseToFormat.call(_context28.t0, _context28.t1, _context28.t2));

        case 19:
        case "end":
          return _context28.stop();
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


exports.Rep = function _callee29(_ref24) {
  var libraryId, objectId, versionHash, rep, _ref24$queryParams, queryParams, _ref24$channelAuth, channelAuth, _ref24$noAuth, noAuth, _ref24$noCache, noCache;

  return _regeneratorRuntime.async(function _callee29$(_context29) {
    while (1) {
      switch (_context29.prev = _context29.next) {
        case 0:
          libraryId = _ref24.libraryId, objectId = _ref24.objectId, versionHash = _ref24.versionHash, rep = _ref24.rep, _ref24$queryParams = _ref24.queryParams, queryParams = _ref24$queryParams === void 0 ? {} : _ref24$queryParams, _ref24$channelAuth = _ref24.channelAuth, channelAuth = _ref24$channelAuth === void 0 ? false : _ref24$channelAuth, _ref24$noAuth = _ref24.noAuth, noAuth = _ref24$noAuth === void 0 ? false : _ref24$noAuth, _ref24$noCache = _ref24.noCache, noCache = _ref24$noCache === void 0 ? false : _ref24$noCache;
          ValidateParameters({
            libraryId: libraryId,
            objectId: objectId,
            versionHash: versionHash
          });

          if (rep) {
            _context29.next = 4;
            break;
          }

          throw "Rep not specified";

        case 4:
          return _context29.abrupt("return", this.FabricUrl({
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
          return _context29.stop();
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


exports.PublicRep = function _callee30(_ref25) {
  var libraryId, objectId, versionHash, rep, _ref25$queryParams, queryParams;

  return _regeneratorRuntime.async(function _callee30$(_context30) {
    while (1) {
      switch (_context30.prev = _context30.next) {
        case 0:
          libraryId = _ref25.libraryId, objectId = _ref25.objectId, versionHash = _ref25.versionHash, rep = _ref25.rep, _ref25$queryParams = _ref25.queryParams, queryParams = _ref25$queryParams === void 0 ? {} : _ref25$queryParams;
          ValidateParameters({
            libraryId: libraryId,
            objectId: objectId,
            versionHash: versionHash
          });

          if (rep) {
            _context30.next = 4;
            break;
          }

          throw "Rep not specified";

        case 4:
          return _context30.abrupt("return", this.FabricUrl({
            libraryId: libraryId,
            objectId: objectId,
            versionHash: versionHash,
            publicRep: rep,
            queryParams: queryParams,
            noAuth: true
          }));

        case 5:
        case "end":
          return _context30.stop();
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


exports.FabricUrl = function _callee31(_ref26) {
  var libraryId, objectId, versionHash, writeToken, partHash, rep, publicRep, call, _ref26$queryParams, queryParams, _ref26$channelAuth, channelAuth, _ref26$noAuth, noAuth, _ref26$noCache, noCache, path;

  return _regeneratorRuntime.async(function _callee31$(_context31) {
    while (1) {
      switch (_context31.prev = _context31.next) {
        case 0:
          libraryId = _ref26.libraryId, objectId = _ref26.objectId, versionHash = _ref26.versionHash, writeToken = _ref26.writeToken, partHash = _ref26.partHash, rep = _ref26.rep, publicRep = _ref26.publicRep, call = _ref26.call, _ref26$queryParams = _ref26.queryParams, queryParams = _ref26$queryParams === void 0 ? {} : _ref26$queryParams, _ref26$channelAuth = _ref26.channelAuth, channelAuth = _ref26$channelAuth === void 0 ? false : _ref26$channelAuth, _ref26$noAuth = _ref26.noAuth, noAuth = _ref26$noAuth === void 0 ? false : _ref26$noAuth, _ref26$noCache = _ref26.noCache, noCache = _ref26$noCache === void 0 ? false : _ref26$noCache;

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

          this.Log("Building Fabric URL:\n      libraryId: ".concat(libraryId, "\n      objectId: ").concat(objectId, "\n      versionHash: ").concat(versionHash, "\n      writeToken: ").concat(writeToken, "\n      partHash: ").concat(partHash, "\n      rep: ").concat(rep, "\n      publicRep: ").concat(publicRep, "\n      call: ").concat(call, "\n      channelAuth: ").concat(channelAuth, "\n      noAuth: ").concat(noAuth, "\n      noCache: ").concat(noCache, "\n      queryParams: ").concat(JSON.stringify(queryParams || {}, null, 2))); // Clone queryParams to avoid modification of the original

          queryParams = _objectSpread({}, queryParams);
          _context31.next = 7;
          return _regeneratorRuntime.awrap(this.authClient.AuthorizationToken({
            libraryId: libraryId,
            objectId: objectId,
            versionHash: versionHash,
            channelAuth: channelAuth,
            noAuth: noAuth,
            noCache: noCache
          }));

        case 7:
          queryParams.authorization = _context31.sent;

          if (!((rep || publicRep) && objectId && !versionHash)) {
            _context31.next = 12;
            break;
          }

          _context31.next = 11;
          return _regeneratorRuntime.awrap(this.LatestVersionHash({
            objectId: objectId
          }));

        case 11:
          versionHash = _context31.sent;

        case 12:
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

          return _context31.abrupt("return", this.HttpClient.URL({
            path: path,
            queryParams: queryParams
          }));

        case 16:
        case "end":
          return _context31.stop();
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


exports.FileUrl = function _callee32(_ref27) {
  var libraryId, objectId, versionHash, writeToken, filePath, _ref27$queryParams, queryParams, _ref27$noCache, noCache, path, authorizationToken, fileInfo, encrypted;

  return _regeneratorRuntime.async(function _callee32$(_context32) {
    while (1) {
      switch (_context32.prev = _context32.next) {
        case 0:
          libraryId = _ref27.libraryId, objectId = _ref27.objectId, versionHash = _ref27.versionHash, writeToken = _ref27.writeToken, filePath = _ref27.filePath, _ref27$queryParams = _ref27.queryParams, queryParams = _ref27$queryParams === void 0 ? {} : _ref27$queryParams, _ref27$noCache = _ref27.noCache, noCache = _ref27$noCache === void 0 ? false : _ref27$noCache;
          ValidateParameters({
            libraryId: libraryId,
            objectId: objectId,
            versionHash: versionHash
          });

          if (filePath) {
            _context32.next = 4;
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

          _context32.next = 8;
          return _regeneratorRuntime.awrap(this.authClient.AuthorizationToken({
            libraryId: libraryId,
            objectId: objectId,
            noCache: noCache
          }));

        case 8:
          authorizationToken = _context32.sent;
          queryParams = _objectSpread({}, queryParams, {
            authorization: authorizationToken
          });
          _context32.next = 12;
          return _regeneratorRuntime.awrap(this.ContentObjectMetadata({
            libraryId: libraryId,
            objectId: objectId,
            versionHash: versionHash,
            writeToken: writeToken,
            metadataSubtree: UrlJoin("files", filePath)
          }));

        case 12:
          fileInfo = _context32.sent;
          encrypted = fileInfo && fileInfo["."].encryption && fileInfo["."].encryption.scheme === "cgck";

          if (encrypted) {
            path = UrlJoin(path, "rep", "files_download", filePath);
            queryParams["header-x_decryption_mode"] = "decrypt";
          } else {
            path = UrlJoin(path, "files", filePath);
          }

          return _context32.abrupt("return", this.HttpClient.URL({
            path: path,
            queryParams: queryParams
          }));

        case 16:
        case "end":
          return _context32.stop();
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


exports.ContentObjectImageUrl = function _callee33(_ref28) {
  var libraryId, objectId, versionHash, height, _ref28$imagePath, imagePath, imageMetadata, _queryParams;

  return _regeneratorRuntime.async(function _callee33$(_context33) {
    while (1) {
      switch (_context33.prev = _context33.next) {
        case 0:
          libraryId = _ref28.libraryId, objectId = _ref28.objectId, versionHash = _ref28.versionHash, height = _ref28.height, _ref28$imagePath = _ref28.imagePath, imagePath = _ref28$imagePath === void 0 ? "public/display_image" : _ref28$imagePath;
          ValidateParameters({
            libraryId: libraryId,
            objectId: objectId,
            versionHash: versionHash
          });

          if (versionHash) {
            _context33.next = 6;
            break;
          }

          _context33.next = 5;
          return _regeneratorRuntime.awrap(this.LatestVersionHash({
            objectId: objectId
          }));

        case 5:
          versionHash = _context33.sent;

        case 6:
          this.Log("Retrieving content object image url: ".concat(libraryId, " ").concat(objectId, " ").concat(versionHash));

          if (this.objectImageUrls[versionHash]) {
            _context33.next = 26;
            break;
          }

          _context33.prev = 8;
          _context33.next = 11;
          return _regeneratorRuntime.awrap(this.ContentObjectMetadata({
            versionHash: versionHash,
            metadataSubtree: imagePath
          }));

        case 11:
          imageMetadata = _context33.sent;

          if (imageMetadata) {
            _context33.next = 15;
            break;
          }

          this.Log("No image url set: ".concat(libraryId, " ").concat(objectId, " ").concat(versionHash));
          return _context33.abrupt("return");

        case 15:
          _context33.next = 21;
          break;

        case 17:
          _context33.prev = 17;
          _context33.t0 = _context33["catch"](8);
          this.Log("Unable to query for image metadata: ".concat(libraryId, " ").concat(objectId, " ").concat(versionHash), true);
          this.Log(_context33.t0, true);

        case 21:
          _queryParams = {};

          if (height && !isNaN(parseInt(height))) {
            _queryParams["height"] = parseInt(height);
          }

          _context33.next = 25;
          return _regeneratorRuntime.awrap(this.LinkUrl({
            versionHash: versionHash,
            linkPath: imagePath,
            queryParams: _queryParams
          }));

        case 25:
          this.objectImageUrls[versionHash] = _context33.sent;

        case 26:
          return _context33.abrupt("return", this.objectImageUrls[versionHash]);

        case 27:
        case "end":
          return _context33.stop();
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


exports.ContentObjectGraph = function _callee35(_ref29) {
  var _this6 = this;

  var libraryId, objectId, versionHash, _ref29$autoUpdate, autoUpdate, select, path, errorInfo, cycles, info;

  return _regeneratorRuntime.async(function _callee35$(_context35) {
    while (1) {
      switch (_context35.prev = _context35.next) {
        case 0:
          libraryId = _ref29.libraryId, objectId = _ref29.objectId, versionHash = _ref29.versionHash, _ref29$autoUpdate = _ref29.autoUpdate, autoUpdate = _ref29$autoUpdate === void 0 ? false : _ref29$autoUpdate, select = _ref29.select;
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
          _context35.prev = 5;
          _context35.t0 = _regeneratorRuntime;
          _context35.t1 = this.utils;
          _context35.t2 = this.HttpClient;
          _context35.next = 11;
          return _regeneratorRuntime.awrap(this.authClient.AuthorizationHeader({
            libraryId: libraryId,
            objectId: objectId,
            versionHash: versionHash,
            noAuth: this.fabricVersion < 3
          }));

        case 11:
          _context35.t3 = _context35.sent;
          _context35.t4 = {
            auto_update: autoUpdate,
            select: select
          };
          _context35.t5 = path;
          _context35.t6 = {
            headers: _context35.t3,
            queryParams: _context35.t4,
            method: "GET",
            path: _context35.t5
          };
          _context35.t7 = _context35.t2.Request.call(_context35.t2, _context35.t6);
          _context35.t8 = _context35.t1.ResponseToJson.call(_context35.t1, _context35.t7);
          _context35.next = 19;
          return _context35.t0.awrap.call(_context35.t0, _context35.t8);

        case 19:
          return _context35.abrupt("return", _context35.sent);

        case 22:
          _context35.prev = 22;
          _context35.t9 = _context35["catch"](5);
          _context35.prev = 24;
          cycles = _context35.t9.body.errors[0].cause.cause.cause.cycle;

          if (!(!cycles || cycles.length === 0)) {
            _context35.next = 28;
            break;
          }

          throw _context35.t9;

        case 28:
          info = {};
          _context35.next = 31;
          return _regeneratorRuntime.awrap(Promise.all(cycles.map(function _callee34(cycleHash) {
            var cycleId, name;
            return _regeneratorRuntime.async(function _callee34$(_context34) {
              while (1) {
                switch (_context34.prev = _context34.next) {
                  case 0:
                    if (!info[cycleHash]) {
                      _context34.next = 2;
                      break;
                    }

                    return _context34.abrupt("return");

                  case 2:
                    cycleId = _this6.utils.DecodeVersionHash(cycleHash).objectId;
                    _context34.next = 5;
                    return _regeneratorRuntime.awrap(_this6.ContentObjectMetadata({
                      versionHash: cycleHash,
                      metadataSubtree: "public/asset_metadata/display_title"
                    }));

                  case 5:
                    _context34.t2 = _context34.sent;

                    if (_context34.t2) {
                      _context34.next = 10;
                      break;
                    }

                    _context34.next = 9;
                    return _regeneratorRuntime.awrap(_this6.ContentObjectMetadata({
                      versionHash: cycleHash,
                      metadataSubtree: "public/name"
                    }));

                  case 9:
                    _context34.t2 = _context34.sent;

                  case 10:
                    _context34.t1 = _context34.t2;

                    if (_context34.t1) {
                      _context34.next = 15;
                      break;
                    }

                    _context34.next = 14;
                    return _regeneratorRuntime.awrap(_this6.ContentObjectMetadata({
                      versionHash: cycleHash,
                      metadataSubtree: "name"
                    }));

                  case 14:
                    _context34.t1 = _context34.sent;

                  case 15:
                    _context34.t0 = _context34.t1;

                    if (_context34.t0) {
                      _context34.next = 18;
                      break;
                    }

                    _context34.t0 = cycleId;

                  case 18:
                    name = _context34.t0;
                    info[cycleHash] = {
                      name: name,
                      objectId: cycleId
                    };

                  case 20:
                  case "end":
                    return _context34.stop();
                }
              }
            });
          })));

        case 31:
          errorInfo = cycles.map(function (cycleHash) {
            return "".concat(info[cycleHash].name, " (").concat(info[cycleHash].objectId, ")");
          });
          _context35.next = 37;
          break;

        case 34:
          _context35.prev = 34;
          _context35.t10 = _context35["catch"](24);
          throw _context35.t9;

        case 37:
          throw new Error("Cycle found in links: ".concat(errorInfo.join(" -> ")));

        case 38:
        case "end":
          return _context35.stop();
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
 *
 * @returns {Promise<string>} - Version hash of the link's target
 */


exports.LinkTarget = function _callee36(_ref30) {
  var libraryId, objectId, versionHash, writeToken, linkPath, linkInfo, targetHash, subPath;
  return _regeneratorRuntime.async(function _callee36$(_context36) {
    while (1) {
      switch (_context36.prev = _context36.next) {
        case 0:
          libraryId = _ref30.libraryId, objectId = _ref30.objectId, versionHash = _ref30.versionHash, writeToken = _ref30.writeToken, linkPath = _ref30.linkPath;
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
            _context36.next = 8;
            break;
          }

          _context36.next = 7;
          return _regeneratorRuntime.awrap(this.ContentObjectLibraryId({
            objectId: objectId
          }));

        case 7:
          libraryId = _context36.sent;

        case 8:
          _context36.next = 10;
          return _regeneratorRuntime.awrap(this.ContentObjectMetadata({
            libraryId: libraryId,
            objectId: objectId,
            versionHash: versionHash,
            writeToken: writeToken,
            metadataSubtree: linkPath,
            resolveLinks: false,
            resolveIgnoreErrors: true,
            resolveIncludeSource: true
          }));

        case 10:
          linkInfo = _context36.sent;

          if (!(linkInfo && linkInfo["/"])) {
            _context36.next = 26;
            break;
          }

          /* For absolute links - extract the hash from the link itself. Otherwise use "container" */
          targetHash = ((linkInfo["/"] || "").match(/^\/?qfab\/([\w]+)\/?.+/) || [])[1];

          if (!targetHash) {
            targetHash = linkInfo["."].container;
          }

          if (!targetHash) {
            _context36.next = 18;
            break;
          }

          return _context36.abrupt("return", targetHash);

        case 18:
          if (!versionHash) {
            _context36.next = 20;
            break;
          }

          return _context36.abrupt("return", versionHash);

        case 20:
          _context36.t0 = versionHash;

          if (_context36.t0) {
            _context36.next = 25;
            break;
          }

          _context36.next = 24;
          return _regeneratorRuntime.awrap(this.LatestVersionHash({
            objectId: objectId
          }));

        case 24:
          _context36.t0 = _context36.sent;

        case 25:
          return _context36.abrupt("return", _context36.t0);

        case 26:
          _context36.next = 28;
          return _regeneratorRuntime.awrap(this.ContentObjectMetadata({
            libraryId: libraryId,
            objectId: objectId,
            versionHash: versionHash,
            writeToken: writeToken,
            metadataSubtree: linkPath,
            resolveIncludeSource: true
          }));

        case 28:
          linkInfo = _context36.sent;

          if (!(!linkInfo || !linkInfo["."])) {
            _context36.next = 48;
            break;
          }

          if (!(_typeof(linkInfo) === "object")) {
            _context36.next = 37;
            break;
          }

          _context36.t1 = versionHash;

          if (_context36.t1) {
            _context36.next = 36;
            break;
          }

          _context36.next = 35;
          return _regeneratorRuntime.awrap(this.LatestVersionHash({
            objectId: objectId
          }));

        case 35:
          _context36.t1 = _context36.sent;

        case 36:
          return _context36.abrupt("return", _context36.t1);

        case 37:
          // linkPath is not a direct link, but points to a literal value - back up one path element to find the container
          subPath = linkPath.split("/").slice(0, -1).join("/");

          if (subPath) {
            _context36.next = 45;
            break;
          }

          _context36.t2 = versionHash;

          if (_context36.t2) {
            _context36.next = 44;
            break;
          }

          _context36.next = 43;
          return _regeneratorRuntime.awrap(this.LatestVersionHash({
            objectId: objectId
          }));

        case 43:
          _context36.t2 = _context36.sent;

        case 44:
          return _context36.abrupt("return", _context36.t2);

        case 45:
          _context36.next = 47;
          return _regeneratorRuntime.awrap(this.ContentObjectMetadata({
            libraryId: libraryId,
            objectId: objectId,
            versionHash: versionHash,
            writeToken: writeToken,
            metadataSubtree: subPath,
            resolveIncludeSource: true
          }));

        case 47:
          linkInfo = _context36.sent;

        case 48:
          return _context36.abrupt("return", linkInfo["."].source);

        case 49:
        case "end":
          return _context36.stop();
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
 *
 * @returns {Promise<string>} - URL to the specified file with authorization token
 */


exports.LinkUrl = function _callee37(_ref31) {
  var libraryId, objectId, versionHash, writeToken, linkPath, mimeType, _ref31$queryParams, queryParams, path;

  return _regeneratorRuntime.async(function _callee37$(_context37) {
    while (1) {
      switch (_context37.prev = _context37.next) {
        case 0:
          libraryId = _ref31.libraryId, objectId = _ref31.objectId, versionHash = _ref31.versionHash, writeToken = _ref31.writeToken, linkPath = _ref31.linkPath, mimeType = _ref31.mimeType, _ref31$queryParams = _ref31.queryParams, queryParams = _ref31$queryParams === void 0 ? {} : _ref31$queryParams;
          ValidateParameters({
            libraryId: libraryId,
            objectId: objectId,
            versionHash: versionHash
          });

          if (writeToken) {
            ValidateWriteToken(writeToken);
          }

          if (linkPath) {
            _context37.next = 5;
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

          _context37.t0 = _objectSpread;
          _context37.t1 = {};
          _context37.t2 = queryParams;
          _context37.next = 12;
          return _regeneratorRuntime.awrap(this.MetadataAuth({
            libraryId: libraryId,
            objectId: objectId,
            versionHash: versionHash,
            path: linkPath
          }));

        case 12:
          _context37.t3 = _context37.sent;
          _context37.t4 = {
            resolve: true,
            authorization: _context37.t3
          };
          queryParams = (0, _context37.t0)(_context37.t1, _context37.t2, _context37.t4);

          if (mimeType) {
            queryParams["header-accept"] = mimeType;
          }

          return _context37.abrupt("return", this.HttpClient.URL({
            path: path,
            queryParams: queryParams
          }));

        case 17:
        case "end":
          return _context37.stop();
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
 * @param {string=} format=json - Format of the response
 */


exports.LinkData = function _callee38(_ref32) {
  var libraryId, objectId, versionHash, writeToken, linkPath, _ref32$format, format, linkUrl;

  return _regeneratorRuntime.async(function _callee38$(_context38) {
    while (1) {
      switch (_context38.prev = _context38.next) {
        case 0:
          libraryId = _ref32.libraryId, objectId = _ref32.objectId, versionHash = _ref32.versionHash, writeToken = _ref32.writeToken, linkPath = _ref32.linkPath, _ref32$format = _ref32.format, format = _ref32$format === void 0 ? "json" : _ref32$format;
          _context38.next = 3;
          return _regeneratorRuntime.awrap(this.LinkUrl({
            libraryId: libraryId,
            objectId: objectId,
            versionHash: versionHash,
            writeToken: writeToken,
            linkPath: linkPath
          }));

        case 3:
          linkUrl = _context38.sent;
          _context38.t0 = this.utils;
          _context38.t1 = format;
          _context38.next = 8;
          return _regeneratorRuntime.awrap(HttpClient.Fetch(linkUrl));

        case 8:
          _context38.t2 = _context38.sent;
          return _context38.abrupt("return", _context38.t0.ResponseToFormat.call(_context38.t0, _context38.t1, _context38.t2));

        case 10:
        case "end":
          return _context38.stop();
      }
    }
  }, null, this);
};
/* Encryption */


exports.CreateEncryptionConk = function _callee39(_ref33) {
  var libraryId, objectId, versionHash, writeToken, _ref33$createKMSConk, createKMSConk, capKey, existingUserCap, kmsAddress, kmsPublicKey, kmsCapKey, existingKMSCap;

  return _regeneratorRuntime.async(function _callee39$(_context39) {
    while (1) {
      switch (_context39.prev = _context39.next) {
        case 0:
          libraryId = _ref33.libraryId, objectId = _ref33.objectId, versionHash = _ref33.versionHash, writeToken = _ref33.writeToken, _ref33$createKMSConk = _ref33.createKMSConk, createKMSConk = _ref33$createKMSConk === void 0 ? true : _ref33$createKMSConk;
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
            _context39.next = 8;
            break;
          }

          _context39.next = 7;
          return _regeneratorRuntime.awrap(this.ContentObjectLibraryId({
            objectId: objectId
          }));

        case 7:
          libraryId = _context39.sent;

        case 8:
          capKey = "eluv.caps.iusr".concat(this.utils.AddressToHash(this.signer.address));
          _context39.next = 11;
          return _regeneratorRuntime.awrap(this.ContentObjectMetadata({
            libraryId: libraryId,
            objectId: objectId,
            writeToken: writeToken,
            metadataSubtree: capKey
          }));

        case 11:
          existingUserCap = _context39.sent;

          if (!existingUserCap) {
            _context39.next = 18;
            break;
          }

          _context39.next = 15;
          return _regeneratorRuntime.awrap(this.Crypto.DecryptCap(existingUserCap, this.signer.signingKey.privateKey));

        case 15:
          this.encryptionConks[objectId] = _context39.sent;
          _context39.next = 34;
          break;

        case 18:
          _context39.next = 20;
          return _regeneratorRuntime.awrap(this.Crypto.GeneratePrimaryConk());

        case 20:
          this.encryptionConks[objectId] = _context39.sent;
          _context39.t0 = _regeneratorRuntime;
          _context39.t1 = this;
          _context39.t2 = libraryId;
          _context39.t3 = objectId;
          _context39.t4 = writeToken;
          _context39.t5 = capKey;
          _context39.next = 29;
          return _regeneratorRuntime.awrap(this.Crypto.EncryptConk(this.encryptionConks[objectId], this.signer.signingKey.publicKey));

        case 29:
          _context39.t6 = _context39.sent;
          _context39.t7 = {
            libraryId: _context39.t2,
            objectId: _context39.t3,
            writeToken: _context39.t4,
            metadataSubtree: _context39.t5,
            metadata: _context39.t6
          };
          _context39.t8 = _context39.t1.ReplaceMetadata.call(_context39.t1, _context39.t7);
          _context39.next = 34;
          return _context39.t0.awrap.call(_context39.t0, _context39.t8);

        case 34:
          if (!createKMSConk) {
            _context39.next = 66;
            break;
          }

          _context39.prev = 35;
          _context39.next = 38;
          return _regeneratorRuntime.awrap(this.authClient.KMSAddress({
            objectId: objectId
          }));

        case 38:
          kmsAddress = _context39.sent;
          _context39.next = 41;
          return _regeneratorRuntime.awrap(this.authClient.KMSInfo({
            objectId: objectId
          }));

        case 41:
          kmsPublicKey = _context39.sent.publicKey;
          kmsCapKey = "eluv.caps.ikms".concat(this.utils.AddressToHash(kmsAddress));
          _context39.next = 45;
          return _regeneratorRuntime.awrap(this.ContentObjectMetadata({
            libraryId: libraryId,
            // Cap may only exist in draft
            objectId: objectId,
            writeToken: writeToken,
            metadataSubtree: kmsCapKey
          }));

        case 45:
          existingKMSCap = _context39.sent;

          if (existingKMSCap) {
            _context39.next = 60;
            break;
          }

          _context39.t9 = _regeneratorRuntime;
          _context39.t10 = this;
          _context39.t11 = libraryId;
          _context39.t12 = objectId;
          _context39.t13 = writeToken;
          _context39.t14 = kmsCapKey;
          _context39.next = 55;
          return _regeneratorRuntime.awrap(this.Crypto.EncryptConk(this.encryptionConks[objectId], kmsPublicKey));

        case 55:
          _context39.t15 = _context39.sent;
          _context39.t16 = {
            libraryId: _context39.t11,
            objectId: _context39.t12,
            writeToken: _context39.t13,
            metadataSubtree: _context39.t14,
            metadata: _context39.t15
          };
          _context39.t17 = _context39.t10.ReplaceMetadata.call(_context39.t10, _context39.t16);
          _context39.next = 60;
          return _context39.t9.awrap.call(_context39.t9, _context39.t17);

        case 60:
          _context39.next = 66;
          break;

        case 62:
          _context39.prev = 62;
          _context39.t18 = _context39["catch"](35);
          // eslint-disable-next-line no-console
          console.error("Failed to create encryption cap for KMS:"); // eslint-disable-next-line no-console

          console.error(_context39.t18);

        case 66:
          return _context39.abrupt("return", this.encryptionConks[objectId]);

        case 67:
        case "end":
          return _context39.stop();
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
 * @param {string} objectId - Version hash of the object
 * @param {string=} writeToken - Write token of the content object draft
 *
 * @return Promise<Object> - The encryption conk for the object
 */


exports.EncryptionConk = function _callee40(_ref34) {
  var libraryId, objectId, versionHash, writeToken, owner, capKey, existingUserCap;
  return _regeneratorRuntime.async(function _callee40$(_context40) {
    while (1) {
      switch (_context40.prev = _context40.next) {
        case 0:
          libraryId = _ref34.libraryId, objectId = _ref34.objectId, versionHash = _ref34.versionHash, writeToken = _ref34.writeToken;
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

          _context40.next = 6;
          return _regeneratorRuntime.awrap(this.authClient.Owner({
            id: objectId
          }));

        case 6:
          owner = _context40.sent;

          if (this.utils.EqualAddress(owner, this.signer.address)) {
            _context40.next = 13;
            break;
          }

          if (this.reencryptionConks[objectId]) {
            _context40.next = 12;
            break;
          }

          _context40.next = 11;
          return _regeneratorRuntime.awrap(this.authClient.ReEncryptionConk({
            libraryId: libraryId,
            objectId: objectId
          }));

        case 11:
          this.reencryptionConks[objectId] = _context40.sent;

        case 12:
          return _context40.abrupt("return", this.reencryptionConks[objectId]);

        case 13:
          if (this.encryptionConks[objectId]) {
            _context40.next = 30;
            break;
          }

          capKey = "eluv.caps.iusr".concat(this.utils.AddressToHash(this.signer.address));
          _context40.next = 17;
          return _regeneratorRuntime.awrap(this.ContentObjectMetadata({
            libraryId: libraryId,
            objectId: objectId,
            versionHash: versionHash,
            // Cap may only exist in draft
            writeToken: writeToken,
            metadataSubtree: capKey
          }));

        case 17:
          existingUserCap = _context40.sent;

          if (!existingUserCap) {
            _context40.next = 24;
            break;
          }

          _context40.next = 21;
          return _regeneratorRuntime.awrap(this.Crypto.DecryptCap(existingUserCap, this.signer.signingKey.privateKey));

        case 21:
          this.encryptionConks[objectId] = _context40.sent;
          _context40.next = 30;
          break;

        case 24:
          if (!writeToken) {
            _context40.next = 29;
            break;
          }

          _context40.next = 27;
          return _regeneratorRuntime.awrap(this.CreateEncryptionConk({
            libraryId: libraryId,
            objectId: objectId,
            versionHash: versionHash,
            writeToken: writeToken,
            createKMSConk: false
          }));

        case 27:
          _context40.next = 30;
          break;

        case 29:
          throw "No encryption conk present for " + objectId;

        case 30:
          return _context40.abrupt("return", this.encryptionConks[objectId]);

        case 31:
        case "end":
          return _context40.stop();
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


exports.Encrypt = function _callee41(_ref35) {
  var libraryId, objectId, writeToken, chunk, conk, data;
  return _regeneratorRuntime.async(function _callee41$(_context41) {
    while (1) {
      switch (_context41.prev = _context41.next) {
        case 0:
          libraryId = _ref35.libraryId, objectId = _ref35.objectId, writeToken = _ref35.writeToken, chunk = _ref35.chunk;
          ValidateParameters({
            libraryId: libraryId,
            objectId: objectId
          });
          _context41.next = 4;
          return _regeneratorRuntime.awrap(this.EncryptionConk({
            libraryId: libraryId,
            objectId: objectId,
            writeToken: writeToken
          }));

        case 4:
          conk = _context41.sent;
          _context41.next = 7;
          return _regeneratorRuntime.awrap(this.Crypto.Encrypt(conk, chunk));

        case 7:
          data = _context41.sent;
          return _context41.abrupt("return", data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength));

        case 9:
        case "end":
          return _context41.stop();
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


exports.Decrypt = function _callee42(_ref36) {
  var libraryId, objectId, writeToken, chunk, conk, data;
  return _regeneratorRuntime.async(function _callee42$(_context42) {
    while (1) {
      switch (_context42.prev = _context42.next) {
        case 0:
          libraryId = _ref36.libraryId, objectId = _ref36.objectId, writeToken = _ref36.writeToken, chunk = _ref36.chunk;
          ValidateParameters({
            libraryId: libraryId,
            objectId: objectId
          });
          _context42.next = 4;
          return _regeneratorRuntime.awrap(this.EncryptionConk({
            libraryId: libraryId,
            objectId: objectId,
            writeToken: writeToken
          }));

        case 4:
          conk = _context42.sent;
          _context42.next = 7;
          return _regeneratorRuntime.awrap(this.Crypto.Decrypt(conk, chunk));

        case 7:
          data = _context42.sent;
          return _context42.abrupt("return", data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength));

        case 9:
        case "end":
          return _context42.stop();
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


exports.AccessType = function _callee43(_ref37) {
  var id;
  return _regeneratorRuntime.async(function _callee43$(_context43) {
    while (1) {
      switch (_context43.prev = _context43.next) {
        case 0:
          id = _ref37.id;
          _context43.next = 3;
          return _regeneratorRuntime.awrap(this.authClient.AccessType(id));

        case 3:
          return _context43.abrupt("return", _context43.sent);

        case 4:
        case "end":
          return _context43.stop();
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


exports.AccessInfo = function _callee44(_ref38) {
  var objectId, args, info;
  return _regeneratorRuntime.async(function _callee44$(_context44) {
    while (1) {
      switch (_context44.prev = _context44.next) {
        case 0:
          objectId = _ref38.objectId, args = _ref38.args;
          ValidateObject(objectId);

          if (!args) {
            args = [0, // Access level
            [], // Custom values
            [] // Stakeholders
            ];
          }

          this.Log("Retrieving access info: ".concat(objectId));
          _context44.next = 6;
          return _regeneratorRuntime.awrap(this.ethClient.CallContractMethod({
            contractAddress: this.utils.HashToAddress(objectId),
            methodName: "getAccessInfo",
            methodArgs: args
          }));

        case 6:
          info = _context44.sent;
          this.Log(info);
          return _context44.abrupt("return", {
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
          return _context44.stop();
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


exports.AccessRequest = function _callee45(_ref39) {
  var libraryId, objectId, versionHash, _ref39$args, args, _ref39$update, update, _ref39$noCache, noCache;

  return _regeneratorRuntime.async(function _callee45$(_context45) {
    while (1) {
      switch (_context45.prev = _context45.next) {
        case 0:
          libraryId = _ref39.libraryId, objectId = _ref39.objectId, versionHash = _ref39.versionHash, _ref39$args = _ref39.args, args = _ref39$args === void 0 ? [] : _ref39$args, _ref39$update = _ref39.update, update = _ref39$update === void 0 ? false : _ref39$update, _ref39$noCache = _ref39.noCache, noCache = _ref39$noCache === void 0 ? false : _ref39$noCache;
          ValidateParameters({
            libraryId: libraryId,
            objectId: objectId,
            versionHash: versionHash
          });

          if (versionHash) {
            objectId = this.utils.DecodeVersionHash(versionHash).objectId;
          }

          _context45.next = 5;
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
          return _context45.abrupt("return", _context45.sent);

        case 6:
        case "end":
          return _context45.stop();
      }
    }
  }, null, this);
};
/**
 * Generate a state channel token.
 *
 * @methodGroup Access Requests
 * @namedParams
 * @param {string=} objectId - ID of the object
 * @param {string=} versionHash - Version hash of the object
 * @param {boolean=} noCache=false - If specified, a new state channel token will be generated
 * regardless whether or not one has been previously cached
 *
 * @return {Promise<string>} - The state channel token
 */


exports.GenerateStateChannelToken = function _callee46(_ref40) {
  var objectId, versionHash, _ref40$noCache, noCache, audienceData;

  return _regeneratorRuntime.async(function _callee46$(_context46) {
    while (1) {
      switch (_context46.prev = _context46.next) {
        case 0:
          objectId = _ref40.objectId, versionHash = _ref40.versionHash, _ref40$noCache = _ref40.noCache, noCache = _ref40$noCache === void 0 ? false : _ref40$noCache;
          versionHash ? ValidateVersion(versionHash) : ValidateObject(objectId);

          if (!versionHash) {
            _context46.next = 6;
            break;
          }

          objectId = this.utils.DecodeVersionHash(versionHash).objectId;
          _context46.next = 10;
          break;

        case 6:
          if (this.stateChannelAccess[objectId]) {
            _context46.next = 10;
            break;
          }

          _context46.next = 9;
          return _regeneratorRuntime.awrap(this.LatestVersionHash({
            objectId: objectId
          }));

        case 9:
          versionHash = _context46.sent;

        case 10:
          this.stateChannelAccess[objectId] = versionHash;
          audienceData = this.AudienceData({
            objectId: objectId,
            versionHash: versionHash
          });
          _context46.next = 14;
          return _regeneratorRuntime.awrap(this.authClient.AuthorizationToken({
            objectId: objectId,
            channelAuth: true,
            oauthToken: this.oauthToken,
            audienceData: audienceData,
            noCache: noCache
          }));

        case 14:
          return _context46.abrupt("return", _context46.sent);

        case 15:
        case "end":
          return _context46.stop();
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


exports.FinalizeStateChannelAccess = function _callee47(_ref41) {
  var objectId, versionHash, percentComplete, audienceData;
  return _regeneratorRuntime.async(function _callee47$(_context47) {
    while (1) {
      switch (_context47.prev = _context47.next) {
        case 0:
          objectId = _ref41.objectId, versionHash = _ref41.versionHash, percentComplete = _ref41.percentComplete;
          versionHash ? ValidateVersion(versionHash) : ValidateObject(objectId);

          if (!versionHash) {
            _context47.next = 6;
            break;
          }

          objectId = this.utils.DecodeVersionHash(versionHash).objectId;
          _context47.next = 13;
          break;

        case 6:
          if (!this.stateChannelAccess[objectId]) {
            _context47.next = 10;
            break;
          }

          versionHash = this.stateChannelAccess[objectId];
          _context47.next = 13;
          break;

        case 10:
          _context47.next = 12;
          return _regeneratorRuntime.awrap(this.LatestVersionHash({
            objectId: objectId
          }));

        case 12:
          versionHash = _context47.sent;

        case 13:
          this.stateChannelAccess[objectId] = undefined;
          audienceData = this.AudienceData({
            objectId: objectId,
            versionHash: versionHash
          });
          _context47.next = 17;
          return _regeneratorRuntime.awrap(this.authClient.ChannelContentFinalize({
            objectId: objectId,
            audienceData: audienceData,
            percent: percentComplete
          }));

        case 17:
        case "end":
          return _context47.stop();
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


exports.ContentObjectAccessComplete = function _callee48(_ref42) {
  var objectId, _ref42$score, score;

  return _regeneratorRuntime.async(function _callee48$(_context48) {
    while (1) {
      switch (_context48.prev = _context48.next) {
        case 0:
          objectId = _ref42.objectId, _ref42$score = _ref42.score, score = _ref42$score === void 0 ? 100 : _ref42$score;
          ValidateObject(objectId);

          if (!(score < 0 || score > 100)) {
            _context48.next = 4;
            break;
          }

          throw Error("Invalid AccessComplete score: " + score);

        case 4:
          _context48.next = 6;
          return _regeneratorRuntime.awrap(this.authClient.AccessComplete({
            id: objectId,
            score: score
          }));

        case 6:
          return _context48.abrupt("return", _context48.sent);

        case 7:
        case "end":
          return _context48.stop();
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


exports.Collection = function _callee49(_ref43) {
  var collectionType, validCollectionTypes, walletAddress;
  return _regeneratorRuntime.async(function _callee49$(_context49) {
    while (1) {
      switch (_context49.prev = _context49.next) {
        case 0:
          collectionType = _ref43.collectionType;
          validCollectionTypes = ["accessGroups", "contentObjects", "contentTypes", "contracts", "libraries"];

          if (validCollectionTypes.includes(collectionType)) {
            _context49.next = 4;
            break;
          }

          throw new Error("Invalid collection type: " + collectionType);

        case 4:
          if (!this.signer) {
            _context49.next = 10;
            break;
          }

          _context49.next = 7;
          return _regeneratorRuntime.awrap(this.userProfileClient.WalletAddress());

        case 7:
          _context49.t0 = _context49.sent;
          _context49.next = 11;
          break;

        case 10:
          _context49.t0 = undefined;

        case 11:
          walletAddress = _context49.t0;

          if (walletAddress) {
            _context49.next = 14;
            break;
          }

          throw new Error("Unable to get collection: User wallet doesn't exist");

        case 14:
          this.Log("Retrieving ".concat(collectionType, " contract collection for user ").concat(this.signer.address));
          _context49.next = 17;
          return _regeneratorRuntime.awrap(this.ethClient.MakeProviderCall({
            methodName: "send",
            args: ["elv_getWalletCollection", [this.contentSpaceId, "iusr".concat(this.utils.AddressToHash(this.signer.address)), collectionType]]
          }));

        case 17:
          return _context49.abrupt("return", _context49.sent);

        case 18:
        case "end":
          return _context49.stop();
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


exports.VerifyContentObject = function _callee50(_ref44) {
  var libraryId, objectId, versionHash;
  return _regeneratorRuntime.async(function _callee50$(_context50) {
    while (1) {
      switch (_context50.prev = _context50.next) {
        case 0:
          libraryId = _ref44.libraryId, objectId = _ref44.objectId, versionHash = _ref44.versionHash;
          ValidateParameters({
            libraryId: libraryId,
            objectId: objectId,
            versionHash: versionHash
          });
          _context50.next = 4;
          return _regeneratorRuntime.awrap(ContentObjectVerification.VerifyContentObject({
            client: this,
            libraryId: libraryId,
            objectId: objectId,
            versionHash: versionHash
          }));

        case 4:
          return _context50.abrupt("return", _context50.sent);

        case 5:
        case "end":
          return _context50.stop();
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


exports.Proofs = function _callee51(_ref45) {
  var libraryId, objectId, versionHash, partHash, path;
  return _regeneratorRuntime.async(function _callee51$(_context51) {
    while (1) {
      switch (_context51.prev = _context51.next) {
        case 0:
          libraryId = _ref45.libraryId, objectId = _ref45.objectId, versionHash = _ref45.versionHash, partHash = _ref45.partHash;
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
          _context51.t0 = this.utils;
          _context51.t1 = this.HttpClient;
          _context51.next = 9;
          return _regeneratorRuntime.awrap(this.authClient.AuthorizationHeader({
            libraryId: libraryId,
            objectId: objectId,
            versionHash: versionHash
          }));

        case 9:
          _context51.t2 = _context51.sent;
          _context51.t3 = path;
          _context51.t4 = {
            headers: _context51.t2,
            method: "GET",
            path: _context51.t3
          };
          _context51.t5 = _context51.t1.Request.call(_context51.t1, _context51.t4);
          return _context51.abrupt("return", _context51.t0.ResponseToJson.call(_context51.t0, _context51.t5));

        case 14:
        case "end":
          return _context51.stop();
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


exports.QParts = function _callee52(_ref46) {
  var libraryId, objectId, partHash, _ref46$format, format, path;

  return _regeneratorRuntime.async(function _callee52$(_context52) {
    while (1) {
      switch (_context52.prev = _context52.next) {
        case 0:
          libraryId = _ref46.libraryId, objectId = _ref46.objectId, partHash = _ref46.partHash, _ref46$format = _ref46.format, format = _ref46$format === void 0 ? "blob" : _ref46$format;
          ValidateParameters({
            libraryId: libraryId,
            objectId: objectId,
            versionHash: versionHash
          });
          ValidatePartHash(partHash);
          path = UrlJoin("qparts", partHash);
          _context52.t0 = this.utils;
          _context52.t1 = format;
          _context52.t2 = this.HttpClient;
          _context52.next = 9;
          return _regeneratorRuntime.awrap(this.authClient.AuthorizationHeader({
            libraryId: libraryId,
            objectId: objectId,
            partHash: partHash
          }));

        case 9:
          _context52.t3 = _context52.sent;
          _context52.t4 = path;
          _context52.t5 = {
            headers: _context52.t3,
            method: "GET",
            path: _context52.t4
          };
          _context52.t6 = _context52.t2.Request.call(_context52.t2, _context52.t5);
          return _context52.abrupt("return", _context52.t0.ResponseToFormat.call(_context52.t0, _context52.t1, _context52.t6));

        case 14:
        case "end":
          return _context52.stop();
      }
    }
  }, null, this);
};