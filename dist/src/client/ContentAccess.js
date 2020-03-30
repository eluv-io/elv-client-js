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

var Crypto = require("../Crypto");

var SpaceContract = require("../contracts/BaseContentSpace");

var LibraryContract = require("../contracts/BaseLibrary");

var ContentContract = require("../contracts/BaseContent");

var ContentTypeContract = require("../contracts/BaseContentType");

var _require = require("../Validation"),
    ValidateLibrary = _require.ValidateLibrary,
    ValidateObject = _require.ValidateObject,
    ValidateVersion = _require.ValidateVersion,
    ValidatePartHash = _require.ValidatePartHash,
    ValidateWriteToken = _require.ValidateWriteToken,
    ValidateParameters = _require.ValidateParameters;
/* Content Spaces */

/**
 * Get the address of the default KMS of the content space
 *
 * @methodGroup Content Space
 *
 * @returns {Promise<string>} - Address of the KMS
 */


exports.DefaultKMSAddress = function _callee() {
  return _regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.next = 2;
          return _regeneratorRuntime.awrap(this.CallContractMethod({
            contractAddress: this.contentSpaceAddress,
            abi: SpaceContract.abi,
            methodName: "addressKMS"
          }));

        case 2:
          return _context.abrupt("return", _context.sent);

        case 3:
        case "end":
          return _context.stop();
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


exports.ContentTypeOwner = function _callee2(_ref) {
  var name, typeId, versionHash, contentType;
  return _regeneratorRuntime.async(function _callee2$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          name = _ref.name, typeId = _ref.typeId, versionHash = _ref.versionHash;
          _context2.next = 3;
          return _regeneratorRuntime.awrap(this.ContentType({
            name: name,
            typeId: typeId,
            versionHash: versionHash
          }));

        case 3:
          contentType = _context2.sent;
          _context2.t0 = this.utils;
          _context2.next = 7;
          return _regeneratorRuntime.awrap(this.ethClient.CallContractMethod({
            contractAddress: this.utils.HashToAddress(contentType.id),
            abi: ContentTypeContract.abi,
            methodName: "owner",
            methodArgs: [],
            signer: this.signer
          }));

        case 7:
          _context2.t1 = _context2.sent;
          return _context2.abrupt("return", _context2.t0.FormatAddress.call(_context2.t0, _context2.t1));

        case 9:
        case "end":
          return _context2.stop();
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
 *
 * @return {Promise<Object>} - The content type, if found
 */


exports.ContentType = function _callee3(_ref2) {
  var name, typeId, versionHash, types, typeInfo, metadata;
  return _regeneratorRuntime.async(function _callee3$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          name = _ref2.name, typeId = _ref2.typeId, versionHash = _ref2.versionHash;
          this.Log("Retrieving content type: ".concat(name || typeId || versionHash));

          if (versionHash) {
            typeId = this.utils.DecodeVersionHash(versionHash).objectId;
          }

          if (!name) {
            _context3.next = 8;
            break;
          }

          this.Log("Looking up type by name in content space metadata..."); // Look up named type in content space metadata

          _context3.next = 7;
          return _regeneratorRuntime.awrap(this.ContentObjectMetadata({
            libraryId: this.contentSpaceLibraryId,
            objectId: this.contentSpaceObjectId,
            metadataSubtree: UrlJoin("contentTypes", name)
          }));

        case 7:
          typeId = _context3.sent;

        case 8:
          if (typeId) {
            _context3.next = 18;
            break;
          }

          this.Log("Looking up type by name in available types...");
          _context3.next = 12;
          return _regeneratorRuntime.awrap(this.ContentTypes());

        case 12:
          types = _context3.sent;

          if (!name) {
            _context3.next = 17;
            break;
          }

          return _context3.abrupt("return", Object.values(types).find(function (type) {
            return (type.name || "").toLowerCase() === name.toLowerCase();
          }));

        case 17:
          return _context3.abrupt("return", Object.values(types).find(function (type) {
            return type.hash === versionHash;
          }));

        case 18:
          _context3.prev = 18;
          this.Log("Looking up type by ID...");
          _context3.next = 22;
          return _regeneratorRuntime.awrap(this.ContentObject({
            libraryId: this.contentSpaceLibraryId,
            objectId: typeId
          }));

        case 22:
          typeInfo = _context3.sent;
          delete typeInfo.type;
          _context3.next = 26;
          return _regeneratorRuntime.awrap(this.ContentObjectMetadata({
            libraryId: this.contentSpaceLibraryId,
            objectId: typeId
          }));

        case 26:
          _context3.t0 = _context3.sent;

          if (_context3.t0) {
            _context3.next = 29;
            break;
          }

          _context3.t0 = {};

        case 29:
          metadata = _context3.t0;
          return _context3.abrupt("return", _objectSpread({}, typeInfo, {
            name: metadata.name,
            meta: metadata
          }));

        case 33:
          _context3.prev = 33;
          _context3.t1 = _context3["catch"](18);
          this.Log("Error looking up content type:");
          this.Log(_context3.t1);
          throw new Error("Content Type ".concat(name || typeId, " is invalid"));

        case 38:
        case "end":
          return _context3.stop();
      }
    }
  }, null, this, [[18, 33]]);
};
/**
 * List all content types accessible to this user.
 *
 * @methodGroup Content Types
 * @namedParams
 *
 * @return {Promise<Object>} - Available content types
 */


exports.ContentTypes = function _callee5() {
  var _this = this;

  var typeAddresses, contentSpaceTypes, contentSpaceTypeAddresses;
  return _regeneratorRuntime.async(function _callee5$(_context5) {
    while (1) {
      switch (_context5.prev = _context5.next) {
        case 0:
          this.contentTypes = this.contentTypes || {};
          this.Log("Looking up all available content types"); // Personally available types

          _context5.next = 4;
          return _regeneratorRuntime.awrap(this.Collection({
            collectionType: "contentTypes"
          }));

        case 4:
          typeAddresses = _context5.sent;
          this.Log("Personally available types:");
          this.Log(typeAddresses); // Content space types

          _context5.next = 9;
          return _regeneratorRuntime.awrap(this.ContentObjectMetadata({
            libraryId: this.contentSpaceLibraryId,
            objectId: this.contentSpaceObjectId,
            metadataSubtree: "contentTypes"
          }));

        case 9:
          _context5.t0 = _context5.sent;

          if (_context5.t0) {
            _context5.next = 12;
            break;
          }

          _context5.t0 = {};

        case 12:
          contentSpaceTypes = _context5.t0;
          contentSpaceTypeAddresses = Object.values(contentSpaceTypes).map(function (typeId) {
            return _this.utils.HashToAddress(typeId);
          });
          this.Log("Content space types:");
          this.Log(contentSpaceTypeAddresses);
          typeAddresses = typeAddresses.concat(contentSpaceTypeAddresses).filter(function (address) {
            return address;
          }).map(function (address) {
            return _this.utils.FormatAddress(address);
          }).filter(function (v, i, a) {
            return a.indexOf(v) === i;
          });
          _context5.next = 19;
          return _regeneratorRuntime.awrap(Promise.all(typeAddresses.map(function _callee4(typeAddress) {
            var typeId;
            return _regeneratorRuntime.async(function _callee4$(_context4) {
              while (1) {
                switch (_context4.prev = _context4.next) {
                  case 0:
                    typeId = _this.utils.AddressToObjectId(typeAddress);

                    if (_this.contentTypes[typeId]) {
                      _context4.next = 10;
                      break;
                    }

                    _context4.prev = 2;
                    _context4.next = 5;
                    return _regeneratorRuntime.awrap(_this.ContentType({
                      typeId: typeId
                    }));

                  case 5:
                    _this.contentTypes[typeId] = _context4.sent;
                    _context4.next = 10;
                    break;

                  case 8:
                    _context4.prev = 8;
                    _context4.t0 = _context4["catch"](2);

                  case 10:
                  case "end":
                    return _context4.stop();
                }
              }
            }, null, null, [[2, 8]]);
          })));

        case 19:
          return _context5.abrupt("return", this.contentTypes);

        case 20:
        case "end":
          return _context5.stop();
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


exports.ContentLibraries = function _callee6() {
  var _this2 = this;

  var libraryAddresses;
  return _regeneratorRuntime.async(function _callee6$(_context6) {
    while (1) {
      switch (_context6.prev = _context6.next) {
        case 0:
          _context6.next = 2;
          return _regeneratorRuntime.awrap(this.Collection({
            collectionType: "libraries"
          }));

        case 2:
          libraryAddresses = _context6.sent;
          return _context6.abrupt("return", libraryAddresses.map(function (address) {
            return _this2.utils.AddressToLibraryId(address);
          }));

        case 4:
        case "end":
          return _context6.stop();
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


exports.ContentLibrary = function _callee7(_ref3) {
  var libraryId, path, library;
  return _regeneratorRuntime.async(function _callee7$(_context7) {
    while (1) {
      switch (_context7.prev = _context7.next) {
        case 0:
          libraryId = _ref3.libraryId;
          ValidateLibrary(libraryId);
          path = UrlJoin("qlibs", libraryId);
          _context7.t0 = _regeneratorRuntime;
          _context7.t1 = this.utils;
          _context7.t2 = this.HttpClient;
          _context7.next = 8;
          return _regeneratorRuntime.awrap(this.authClient.AuthorizationHeader({
            libraryId: libraryId
          }));

        case 8:
          _context7.t3 = _context7.sent;
          _context7.t4 = path;
          _context7.t5 = {
            headers: _context7.t3,
            method: "GET",
            path: _context7.t4
          };
          _context7.t6 = _context7.t2.Request.call(_context7.t2, _context7.t5);
          _context7.t7 = _context7.t1.ResponseToJson.call(_context7.t1, _context7.t6);
          _context7.next = 15;
          return _context7.t0.awrap.call(_context7.t0, _context7.t7);

        case 15:
          library = _context7.sent;
          return _context7.abrupt("return", _objectSpread({}, library, {
            meta: library.meta || {}
          }));

        case 17:
        case "end":
          return _context7.stop();
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


exports.ContentLibraryOwner = function _callee8(_ref4) {
  var libraryId;
  return _regeneratorRuntime.async(function _callee8$(_context8) {
    while (1) {
      switch (_context8.prev = _context8.next) {
        case 0:
          libraryId = _ref4.libraryId;
          ValidateLibrary(libraryId);
          _context8.t0 = this.utils;
          _context8.next = 5;
          return _regeneratorRuntime.awrap(this.ethClient.CallContractMethod({
            contractAddress: this.utils.HashToAddress(libraryId),
            abi: LibraryContract.abi,
            methodName: "owner",
            methodArgs: [],
            signer: this.signer
          }));

        case 5:
          _context8.t1 = _context8.sent;
          return _context8.abrupt("return", _context8.t0.FormatAddress.call(_context8.t0, _context8.t1));

        case 7:
        case "end":
          return _context8.stop();
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


exports.LibraryContentTypes = function _callee10(_ref5) {
  var _this3 = this;

  var libraryId, typesLength, allowedTypes;
  return _regeneratorRuntime.async(function _callee10$(_context10) {
    while (1) {
      switch (_context10.prev = _context10.next) {
        case 0:
          libraryId = _ref5.libraryId;
          ValidateLibrary(libraryId);
          this.Log("Retrieving library content types for ".concat(libraryId));
          _context10.next = 5;
          return _regeneratorRuntime.awrap(this.ethClient.CallContractMethod({
            contractAddress: this.utils.HashToAddress(libraryId),
            abi: LibraryContract.abi,
            methodName: "contentTypesLength",
            methodArgs: [],
            signer: this.signer
          }));

        case 5:
          typesLength = _context10.sent.toNumber();
          this.Log("".concat(typesLength, " types")); // No allowed types set - any type accepted

          if (!(typesLength === 0)) {
            _context10.next = 9;
            break;
          }

          return _context10.abrupt("return", {});

        case 9:
          // Get the list of allowed content type addresses
          allowedTypes = {};
          _context10.next = 12;
          return _regeneratorRuntime.awrap(Promise.all(Array.from(new Array(typesLength), function _callee9(_, i) {
            var typeAddress, typeId;
            return _regeneratorRuntime.async(function _callee9$(_context9) {
              while (1) {
                switch (_context9.prev = _context9.next) {
                  case 0:
                    _context9.next = 2;
                    return _regeneratorRuntime.awrap(_this3.ethClient.CallContractMethod({
                      contractAddress: _this3.utils.HashToAddress(libraryId),
                      abi: LibraryContract.abi,
                      methodName: "contentTypes",
                      methodArgs: [i],
                      signer: _this3.signer
                    }));

                  case 2:
                    typeAddress = _context9.sent;
                    typeId = _this3.utils.AddressToObjectId(typeAddress);
                    _context9.next = 6;
                    return _regeneratorRuntime.awrap(_this3.ContentType({
                      typeId: typeId
                    }));

                  case 6:
                    allowedTypes[typeId] = _context9.sent;

                  case 7:
                  case "end":
                    return _context9.stop();
                }
              }
            });
          })));

        case 12:
          this.Log(allowedTypes);
          return _context10.abrupt("return", allowedTypes);

        case 14:
        case "end":
          return _context10.stop();
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


exports.ContentObjects = function _callee11(_ref6) {
  var libraryId, _ref6$filterOptions, filterOptions, path, queryParams, filterTypeMap, addFilter;

  return _regeneratorRuntime.async(function _callee11$(_context11) {
    while (1) {
      switch (_context11.prev = _context11.next) {
        case 0:
          libraryId = _ref6.libraryId, _ref6$filterOptions = _ref6.filterOptions, filterOptions = _ref6$filterOptions === void 0 ? {} : _ref6$filterOptions;
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

          addFilter = function addFilter(_ref7) {
            var key = _ref7.key,
                type = _ref7.type,
                filter = _ref7.filter;
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
          _context11.t0 = _regeneratorRuntime;
          _context11.t1 = this.utils;
          _context11.t2 = this.HttpClient;
          _context11.next = 21;
          return _regeneratorRuntime.awrap(this.authClient.AuthorizationHeader({
            libraryId: libraryId
          }));

        case 21:
          _context11.t3 = _context11.sent;
          _context11.t4 = path;
          _context11.t5 = queryParams;
          _context11.t6 = {
            headers: _context11.t3,
            method: "GET",
            path: _context11.t4,
            queryParams: _context11.t5
          };
          _context11.t7 = _context11.t2.Request.call(_context11.t2, _context11.t6);
          _context11.t8 = _context11.t1.ResponseToJson.call(_context11.t1, _context11.t7);
          _context11.next = 29;
          return _context11.t0.awrap.call(_context11.t0, _context11.t8);

        case 29:
          return _context11.abrupt("return", _context11.sent);

        case 30:
        case "end":
          return _context11.stop();
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


exports.ContentObject = function _callee12(_ref8) {
  var libraryId, objectId, versionHash, path;
  return _regeneratorRuntime.async(function _callee12$(_context12) {
    while (1) {
      switch (_context12.prev = _context12.next) {
        case 0:
          libraryId = _ref8.libraryId, objectId = _ref8.objectId, versionHash = _ref8.versionHash;
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
          _context12.t0 = _regeneratorRuntime;
          _context12.t1 = this.utils;
          _context12.t2 = this.HttpClient;
          _context12.next = 10;
          return _regeneratorRuntime.awrap(this.authClient.AuthorizationHeader({
            libraryId: libraryId,
            objectId: objectId,
            versionHash: versionHash,
            noAuth: true
          }));

        case 10:
          _context12.t3 = _context12.sent;
          _context12.t4 = path;
          _context12.t5 = {
            headers: _context12.t3,
            method: "GET",
            path: _context12.t4
          };
          _context12.t6 = _context12.t2.Request.call(_context12.t2, _context12.t5);
          _context12.t7 = _context12.t1.ResponseToJson.call(_context12.t1, _context12.t6);
          _context12.next = 17;
          return _context12.t0.awrap.call(_context12.t0, _context12.t7);

        case 17:
          return _context12.abrupt("return", _context12.sent);

        case 18:
        case "end":
          return _context12.stop();
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


exports.ContentObjectOwner = function _callee13(_ref9) {
  var objectId;
  return _regeneratorRuntime.async(function _callee13$(_context13) {
    while (1) {
      switch (_context13.prev = _context13.next) {
        case 0:
          objectId = _ref9.objectId;
          ValidateObject(objectId);
          this.Log("Retrieving content object owner: ".concat(objectId));
          _context13.t0 = this.utils;
          _context13.next = 6;
          return _regeneratorRuntime.awrap(this.ethClient.CallContractMethod({
            contractAddress: this.utils.HashToAddress(objectId),
            abi: ContentContract.abi,
            methodName: "owner",
            methodArgs: [],
            cacheContract: false,
            signer: this.signer
          }));

        case 6:
          _context13.t1 = _context13.sent;
          return _context13.abrupt("return", _context13.t0.FormatAddress.call(_context13.t0, _context13.t1));

        case 8:
        case "end":
          return _context13.stop();
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


exports.ContentObjectLibraryId = function _callee14(_ref10) {
  var objectId, versionHash;
  return _regeneratorRuntime.async(function _callee14$(_context14) {
    while (1) {
      switch (_context14.prev = _context14.next) {
        case 0:
          objectId = _ref10.objectId, versionHash = _ref10.versionHash;
          versionHash ? ValidateVersion(versionHash) : ValidateObject(objectId);

          if (versionHash) {
            objectId = this.utils.DecodeVersionHash(versionHash).objectId;
          }

          _context14.next = 5;
          return _regeneratorRuntime.awrap(this.authClient.AccessType(objectId));

        case 5:
          _context14.t0 = _context14.sent;
          _context14.next = _context14.t0 === this.authClient.ACCESS_TYPES.LIBRARY ? 8 : _context14.t0 === this.authClient.ACCESS_TYPES.OBJECT ? 9 : 17;
          break;

        case 8:
          return _context14.abrupt("return", this.utils.AddressToLibraryId(this.utils.HashToAddress(objectId)));

        case 9:
          if (this.objectLibraryIds[objectId]) {
            _context14.next = 16;
            break;
          }

          this.Log("Retrieving content object library ID: ".concat(objectId || versionHash));
          _context14.t1 = this.utils;
          _context14.next = 14;
          return _regeneratorRuntime.awrap(this.CallContractMethod({
            contractAddress: this.utils.HashToAddress(objectId),
            abi: ContentContract.abi,
            methodName: "libraryAddress"
          }));

        case 14:
          _context14.t2 = _context14.sent;
          this.objectLibraryIds[objectId] = _context14.t1.AddressToLibraryId.call(_context14.t1, _context14.t2);

        case 16:
          return _context14.abrupt("return", this.objectLibraryIds[objectId]);

        case 17:
          return _context14.abrupt("return", this.contentSpaceLibraryId);

        case 18:
        case "end":
          return _context14.stop();
      }
    }
  }, null, this);
};

exports.ProduceMetadataLinks = function _callee17(_ref11) {
  var _this4 = this;

  var libraryId, objectId, versionHash, _ref11$path, path, metadata, _ref11$noAuth, noAuth, result;

  return _regeneratorRuntime.async(function _callee17$(_context17) {
    while (1) {
      switch (_context17.prev = _context17.next) {
        case 0:
          libraryId = _ref11.libraryId, objectId = _ref11.objectId, versionHash = _ref11.versionHash, _ref11$path = _ref11.path, path = _ref11$path === void 0 ? "/" : _ref11$path, metadata = _ref11.metadata, _ref11$noAuth = _ref11.noAuth, noAuth = _ref11$noAuth === void 0 ? true : _ref11$noAuth;

          if (!(!metadata || _typeof(metadata) !== "object")) {
            _context17.next = 3;
            break;
          }

          return _context17.abrupt("return", metadata);

        case 3:
          if (!Array.isArray(metadata)) {
            _context17.next = 7;
            break;
          }

          _context17.next = 6;
          return _regeneratorRuntime.awrap(this.utils.LimitedMap(5, metadata, function _callee15(entry, i) {
            return _regeneratorRuntime.async(function _callee15$(_context15) {
              while (1) {
                switch (_context15.prev = _context15.next) {
                  case 0:
                    _context15.next = 2;
                    return _regeneratorRuntime.awrap(_this4.ProduceMetadataLinks({
                      libraryId: libraryId,
                      objectId: objectId,
                      versionHash: versionHash,
                      path: UrlJoin(path, i.toString()),
                      metadata: entry,
                      noAuth: noAuth
                    }));

                  case 2:
                    return _context15.abrupt("return", _context15.sent);

                  case 3:
                  case "end":
                    return _context15.stop();
                }
              }
            });
          }));

        case 6:
          return _context17.abrupt("return", _context17.sent);

        case 7:
          if (!(metadata["/"] && (metadata["/"].match(/\.\/(rep|files)\/.+/) || metadata["/"].match(/^\/?qfab\/([\w]+)\/?(rep|files)\/.+/)))) {
            _context17.next = 16;
            break;
          }

          _context17.t0 = _objectSpread;
          _context17.t1 = {};
          _context17.t2 = metadata;
          _context17.next = 13;
          return _regeneratorRuntime.awrap(this.LinkUrl({
            libraryId: libraryId,
            objectId: objectId,
            versionHash: versionHash,
            linkPath: path
          }));

        case 13:
          _context17.t3 = _context17.sent;
          _context17.t4 = {
            url: _context17.t3
          };
          return _context17.abrupt("return", (0, _context17.t0)(_context17.t1, _context17.t2, _context17.t4));

        case 16:
          result = {};
          _context17.next = 19;
          return _regeneratorRuntime.awrap(this.utils.LimitedMap(5, Object.keys(metadata), function _callee16(key) {
            return _regeneratorRuntime.async(function _callee16$(_context16) {
              while (1) {
                switch (_context16.prev = _context16.next) {
                  case 0:
                    _context16.next = 2;
                    return _regeneratorRuntime.awrap(_this4.ProduceMetadataLinks({
                      libraryId: libraryId,
                      objectId: objectId,
                      versionHash: versionHash,
                      path: UrlJoin(path, key),
                      metadata: metadata[key],
                      noAuth: noAuth
                    }));

                  case 2:
                    result[key] = _context16.sent;

                  case 3:
                  case "end":
                    return _context16.stop();
                }
              }
            });
          }));

        case 19:
          return _context17.abrupt("return", result);

        case 20:
        case "end":
          return _context17.stop();
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
 * @param {boolean=} resolveLinks=false - If specified, links in the metadata will be resolved
 * @param {boolean=} resolveIncludeSource=false - If specified, resolved links will include the hash of the link at the root of the metadata

 Example:
 {
          "resolved-link": {
            ".": {
              "source": "hq__HPXNia6UtXyuUr6G3Lih8PyUhvYYHuyLTt3i7qSfYgYBB7sF1suR7ky7YRXsUARUrTB1Um1x5a"
            },
            ...
          }
       }

 * @param {boolean=} produceLinkUrls=false - If specified, file and rep links will automatically be populated with a
 * full URL
 * @param {boolean=} noAuth=false - If specified, authorization will not be performed for this call
 *
 * @returns {Promise<Object | string>} - Metadata of the content object
 */


exports.ContentObjectMetadata = function _callee18(_ref12) {
  var libraryId, objectId, versionHash, writeToken, _ref12$metadataSubtre, metadataSubtree, _ref12$resolveLinks, resolveLinks, _ref12$resolveInclude, resolveIncludeSource, _ref12$produceLinkUrl, produceLinkUrls, _ref12$noAuth, noAuth, path, metadata;

  return _regeneratorRuntime.async(function _callee18$(_context18) {
    while (1) {
      switch (_context18.prev = _context18.next) {
        case 0:
          libraryId = _ref12.libraryId, objectId = _ref12.objectId, versionHash = _ref12.versionHash, writeToken = _ref12.writeToken, _ref12$metadataSubtre = _ref12.metadataSubtree, metadataSubtree = _ref12$metadataSubtre === void 0 ? "/" : _ref12$metadataSubtre, _ref12$resolveLinks = _ref12.resolveLinks, resolveLinks = _ref12$resolveLinks === void 0 ? false : _ref12$resolveLinks, _ref12$resolveInclude = _ref12.resolveIncludeSource, resolveIncludeSource = _ref12$resolveInclude === void 0 ? false : _ref12$resolveInclude, _ref12$produceLinkUrl = _ref12.produceLinkUrls, produceLinkUrls = _ref12$produceLinkUrl === void 0 ? false : _ref12$produceLinkUrl, _ref12$noAuth = _ref12.noAuth, noAuth = _ref12$noAuth === void 0 ? true : _ref12$noAuth;
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
          _context18.prev = 5;
          _context18.t0 = _regeneratorRuntime;
          _context18.t1 = this.utils;
          _context18.t2 = this.HttpClient;
          _context18.next = 11;
          return _regeneratorRuntime.awrap(this.authClient.AuthorizationHeader({
            libraryId: libraryId,
            objectId: objectId,
            versionHash: versionHash,
            noAuth: noAuth
          }));

        case 11:
          _context18.t3 = _context18.sent;
          _context18.t4 = {
            resolve: resolveLinks,
            resolve_include_source: resolveIncludeSource
          };
          _context18.t5 = path;
          _context18.t6 = {
            headers: _context18.t3,
            queryParams: _context18.t4,
            method: "GET",
            path: _context18.t5
          };
          _context18.t7 = _context18.t2.Request.call(_context18.t2, _context18.t6);
          _context18.t8 = _context18.t1.ResponseToJson.call(_context18.t1, _context18.t7);
          _context18.next = 19;
          return _context18.t0.awrap.call(_context18.t0, _context18.t8);

        case 19:
          metadata = _context18.sent;
          _context18.next = 27;
          break;

        case 22:
          _context18.prev = 22;
          _context18.t9 = _context18["catch"](5);

          if (!(_context18.t9.status !== 404)) {
            _context18.next = 26;
            break;
          }

          throw _context18.t9;

        case 26:
          metadata = metadataSubtree === "/" ? {} : undefined;

        case 27:
          if (produceLinkUrls) {
            _context18.next = 29;
            break;
          }

          return _context18.abrupt("return", metadata);

        case 29:
          _context18.next = 31;
          return _regeneratorRuntime.awrap(this.ProduceMetadataLinks({
            libraryId: libraryId,
            objectId: objectId,
            versionHash: versionHash,
            path: metadataSubtree,
            metadata: metadata,
            noAuth: noAuth
          }));

        case 31:
          return _context18.abrupt("return", _context18.sent);

        case 32:
        case "end":
          return _context18.stop();
      }
    }
  }, null, this, [[5, 22]]);
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


exports.ContentObjectVersions = function _callee19(_ref13) {
  var libraryId, objectId, _ref13$noAuth, noAuth, path;

  return _regeneratorRuntime.async(function _callee19$(_context19) {
    while (1) {
      switch (_context19.prev = _context19.next) {
        case 0:
          libraryId = _ref13.libraryId, objectId = _ref13.objectId, _ref13$noAuth = _ref13.noAuth, noAuth = _ref13$noAuth === void 0 ? false : _ref13$noAuth;
          ValidateParameters({
            libraryId: libraryId,
            objectId: objectId
          });
          this.Log("Retrieving content object versions: ".concat(libraryId || "", " ").concat(objectId || versionHash));
          path = UrlJoin("qid", objectId);
          _context19.t0 = this.utils;
          _context19.t1 = this.HttpClient;
          _context19.next = 8;
          return _regeneratorRuntime.awrap(this.authClient.AuthorizationHeader({
            libraryId: libraryId,
            objectId: objectId,
            noAuth: noAuth
          }));

        case 8:
          _context19.t2 = _context19.sent;
          _context19.t3 = path;
          _context19.t4 = {
            headers: _context19.t2,
            method: "GET",
            path: _context19.t3
          };
          _context19.t5 = _context19.t1.Request.call(_context19.t1, _context19.t4);
          return _context19.abrupt("return", _context19.t0.ResponseToJson.call(_context19.t0, _context19.t5));

        case 13:
        case "end":
          return _context19.stop();
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


exports.LatestVersionHash = function _callee20(_ref14) {
  var objectId, versionHash;
  return _regeneratorRuntime.async(function _callee20$(_context20) {
    while (1) {
      switch (_context20.prev = _context20.next) {
        case 0:
          objectId = _ref14.objectId, versionHash = _ref14.versionHash;

          if (versionHash) {
            objectId = this.utils.DecodeVersionHash(versionHash).objectId;
          }

          ValidateObject(objectId); // TODO: Remove cache contract bit

          _context20.next = 5;
          return _regeneratorRuntime.awrap(this.CallContractMethod({
            contractAddress: this.utils.HashToAddress(objectId),
            abi: ContentContract.abi,
            methodName: "objectHash",
            cacheContract: false
          }));

        case 5:
          return _context20.abrupt("return", _context20.sent);

        case 6:
        case "end":
          return _context20.stop();
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


exports.AvailableDRMs = function _callee21() {
  var availableDRMs, config;
  return _regeneratorRuntime.async(function _callee21$(_context21) {
    while (1) {
      switch (_context21.prev = _context21.next) {
        case 0:
          availableDRMs = ["clear", "aes-128"];

          if (window) {
            _context21.next = 3;
            break;
          }

          return _context21.abrupt("return", availableDRMs);

        case 3:
          if (!(typeof window.navigator.requestMediaKeySystemAccess !== "function")) {
            _context21.next = 5;
            break;
          }

          return _context21.abrupt("return", availableDRMs);

        case 5:
          _context21.prev = 5;
          config = [{
            initDataTypes: ["cenc"],
            audioCapabilities: [{
              contentType: "audio/mp4;codecs=\"mp4a.40.2\""
            }],
            videoCapabilities: [{
              contentType: "video/mp4;codecs=\"avc1.42E01E\""
            }]
          }];
          _context21.next = 9;
          return _regeneratorRuntime.awrap(navigator.requestMediaKeySystemAccess("com.widevine.alpha", config));

        case 9:
          availableDRMs.push("widevine"); // eslint-disable-next-line no-empty

          _context21.next = 14;
          break;

        case 12:
          _context21.prev = 12;
          _context21.t0 = _context21["catch"](5);

        case 14:
          return _context21.abrupt("return", availableDRMs);

        case 15:
        case "end":
          return _context21.stop();
      }
    }
  }, null, null, [[5, 12]]);
};

exports.AudienceData = function (_ref15) {
  var objectId = _ref15.objectId,
      versionHash = _ref15.versionHash,
      _ref15$protocols = _ref15.protocols,
      protocols = _ref15$protocols === void 0 ? [] : _ref15$protocols,
      _ref15$drms = _ref15.drms,
      drms = _ref15$drms === void 0 ? [] : _ref15$drms;
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
 * @param {string=} linkPath - If playing from a link, the path to the link
 * @param {Array<string>} protocols=["dash", "hls"] - Acceptable playout protocols ("dash", "hls")
 * @param {Array<string>} drms - Acceptable DRM formats ("clear", "aes-128", "widevine")
 * @param {string=} offering=default - The offering to play
 */


exports.PlayoutOptions = function _callee22(_ref16) {
  var objectId, versionHash, linkPath, _ref16$protocols, protocols, _ref16$offering, offering, _ref16$drms, drms, _ref16$hlsjsProfile, hlsjsProfile, libraryId, path, linkTargetLibraryId, linkTargetId, linkTargetHash, audienceData, queryParams, playoutOptions, playoutMap, i, option, protocol, drm, playoutPath, licenseServers, protocolMatch, drmMatch;

  return _regeneratorRuntime.async(function _callee22$(_context22) {
    while (1) {
      switch (_context22.prev = _context22.next) {
        case 0:
          objectId = _ref16.objectId, versionHash = _ref16.versionHash, linkPath = _ref16.linkPath, _ref16$protocols = _ref16.protocols, protocols = _ref16$protocols === void 0 ? ["dash", "hls"] : _ref16$protocols, _ref16$offering = _ref16.offering, offering = _ref16$offering === void 0 ? "default" : _ref16$offering, _ref16$drms = _ref16.drms, drms = _ref16$drms === void 0 ? [] : _ref16$drms, _ref16$hlsjsProfile = _ref16.hlsjsProfile, hlsjsProfile = _ref16$hlsjsProfile === void 0 ? true : _ref16$hlsjsProfile;
          versionHash ? ValidateVersion(versionHash) : ValidateObject(objectId);
          protocols = protocols.map(function (p) {
            return p.toLowerCase();
          });
          drms = drms.map(function (d) {
            return d.toLowerCase();
          });

          if (!objectId) {
            objectId = this.utils.DecodeVersionHash(versionHash).objectId;
          }

          _context22.next = 7;
          return _regeneratorRuntime.awrap(this.ContentObjectLibraryId({
            objectId: objectId
          }));

        case 7:
          libraryId = _context22.sent;

          if (!linkPath) {
            _context22.next = 19;
            break;
          }

          _context22.next = 11;
          return _regeneratorRuntime.awrap(this.LinkTarget({
            libraryId: libraryId,
            objectId: objectId,
            versionHash: versionHash,
            linkPath: linkPath
          }));

        case 11:
          linkTargetHash = _context22.sent;
          linkTargetId = this.utils.DecodeVersionHash(linkTargetHash).objectId;
          _context22.next = 15;
          return _regeneratorRuntime.awrap(this.ContentObjectLibraryId({
            objectId: linkTargetId
          }));

        case 15:
          linkTargetLibraryId = _context22.sent;
          path = UrlJoin("q", versionHash || objectId, "meta", linkPath);
          _context22.next = 20;
          break;

        case 19:
          path = UrlJoin("q", versionHash || objectId, "rep", "playout", offering, "options.json");

        case 20:
          _context22.t0 = this;
          _context22.t1 = linkTargetId || objectId;
          _context22.t2 = linkTargetHash || versionHash;

          if (_context22.t2) {
            _context22.next = 27;
            break;
          }

          _context22.next = 26;
          return _regeneratorRuntime.awrap(this.LatestVersionHash({
            objectId: objectId
          }));

        case 26:
          _context22.t2 = _context22.sent;

        case 27:
          _context22.t3 = _context22.t2;
          _context22.t4 = protocols;
          _context22.t5 = drms;
          _context22.t6 = {
            objectId: _context22.t1,
            versionHash: _context22.t3,
            protocols: _context22.t4,
            drms: _context22.t5
          };
          audienceData = _context22.t0.AudienceData.call(_context22.t0, _context22.t6);
          _context22.next = 34;
          return _regeneratorRuntime.awrap(this.authClient.AuthorizationToken({
            libraryId: linkTargetLibraryId || libraryId,
            objectId: linkTargetId || objectId,
            channelAuth: true,
            oauthToken: this.oauthToken,
            audienceData: audienceData
          }));

        case 34:
          _context22.t7 = _context22.sent;
          queryParams = {
            authorization: _context22.t7
          };

          if (linkPath) {
            queryParams.resolve = true;
          }

          _context22.t8 = Object;
          _context22.next = 40;
          return _regeneratorRuntime.awrap(this.utils.ResponseToJson(this.HttpClient.Request({
            path: path,
            method: "GET",
            queryParams: queryParams
          })));

        case 40:
          _context22.t9 = _context22.sent;
          playoutOptions = _context22.t8.values.call(_context22.t8, _context22.t9);
          playoutMap = {};
          i = 0;

        case 44:
          if (!(i < playoutOptions.length)) {
            _context22.next = 76;
            break;
          }

          option = playoutOptions[i];
          protocol = option.properties.protocol;
          drm = option.properties.drm; // Remove authorization parameter from playout path - it's re-added by Rep

          playoutPath = option.uri.split("?")[0];
          licenseServers = option.properties.license_servers; // Create full playout URLs for this protocol / drm combo

          _context22.t10 = _objectSpread;
          _context22.t11 = {};
          _context22.t12 = playoutMap[protocol] || {};
          _context22.t13 = _objectSpread;
          _context22.t14 = {};
          _context22.t15 = (playoutMap[protocol] || {}).playoutMethods || {};
          _context22.t16 = _defineProperty;
          _context22.t17 = {};
          _context22.t18 = drm || "clear";
          _context22.next = 61;
          return _regeneratorRuntime.awrap(this.Rep({
            libraryId: linkTargetLibraryId || libraryId,
            objectId: linkTargetId || objectId,
            versionHash: linkTargetHash || versionHash,
            rep: UrlJoin("playout", offering, playoutPath),
            channelAuth: true,
            queryParams: hlsjsProfile && protocol === "hls" ? {
              player_profile: "hls-js"
            } : {}
          }));

        case 61:
          _context22.t19 = _context22.sent;
          _context22.t20 = drm ? _defineProperty({}, drm, {
            licenseServers: licenseServers
          }) : undefined;
          _context22.t21 = {
            playoutUrl: _context22.t19,
            drms: _context22.t20
          };
          _context22.t22 = (0, _context22.t16)(_context22.t17, _context22.t18, _context22.t21);
          _context22.t23 = (0, _context22.t13)(_context22.t14, _context22.t15, _context22.t22);
          _context22.t24 = {
            playoutMethods: _context22.t23
          };
          playoutMap[protocol] = (0, _context22.t10)(_context22.t11, _context22.t12, _context22.t24);
          // Exclude any options that do not satisfy the specified protocols and/or DRMs
          protocolMatch = protocols.includes(protocol);
          drmMatch = drms.includes(drm || "clear") || drms.length === 0 && !drm;

          if (!(!protocolMatch || !drmMatch)) {
            _context22.next = 72;
            break;
          }

          return _context22.abrupt("continue", 73);

        case 72:
          // This protocol / DRM satisfies the specifications (prefer DRM over clear, if available)
          if (!playoutMap[protocol].playoutUrl || drm && drm !== "clear") {
            playoutMap[protocol].playoutUrl = playoutMap[protocol].playoutMethods[drm || "clear"].playoutUrl;
            playoutMap[protocol].drms = playoutMap[protocol].playoutMethods[drm || "clear"].drms;
          }

        case 73:
          i++;
          _context22.next = 44;
          break;

        case 76:
          this.Log(playoutMap);
          return _context22.abrupt("return", playoutMap);

        case 78:
        case "end":
          return _context22.stop();
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
 * @param {Array<string>} drms - Acceptable DRM formats ("clear", "aes-128", "widevine")
 * @param {string=} offering=default - The offering to play
 */


exports.BitmovinPlayoutOptions = function _callee23(_ref18) {
  var objectId, versionHash, linkPath, _ref18$protocols, protocols, _ref18$drms, drms, _ref18$offering, offering, playoutOptions, linkTargetId, linkTargetHash, libraryId, authToken, config;

  return _regeneratorRuntime.async(function _callee23$(_context23) {
    while (1) {
      switch (_context23.prev = _context23.next) {
        case 0:
          objectId = _ref18.objectId, versionHash = _ref18.versionHash, linkPath = _ref18.linkPath, _ref18$protocols = _ref18.protocols, protocols = _ref18$protocols === void 0 ? ["dash", "hls"] : _ref18$protocols, _ref18$drms = _ref18.drms, drms = _ref18$drms === void 0 ? [] : _ref18$drms, _ref18$offering = _ref18.offering, offering = _ref18$offering === void 0 ? "default" : _ref18$offering;
          versionHash ? ValidateVersion(versionHash) : ValidateObject(objectId);

          if (!objectId) {
            objectId = this.utils.DecodeVersionHash(versionHash).objectId;
          }

          _context23.next = 5;
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
          playoutOptions = _context23.sent;
          delete playoutOptions.playoutMethods;

          if (!linkPath) {
            _context23.next = 15;
            break;
          }

          _context23.next = 10;
          return _regeneratorRuntime.awrap(this.ContentObjectLibraryId({
            objectId: objectId,
            versionHash: versionHash
          }));

        case 10:
          libraryId = _context23.sent;
          _context23.next = 13;
          return _regeneratorRuntime.awrap(this.LinkTarget({
            libraryId: libraryId,
            objectId: objectId,
            versionHash: versionHash,
            linkPath: linkPath
          }));

        case 13:
          linkTargetHash = _context23.sent;
          linkTargetId = this.utils.DecodeVersionHash(linkTargetHash).objectId;

        case 15:
          _context23.next = 17;
          return _regeneratorRuntime.awrap(this.authClient.AuthorizationToken({
            objectId: linkTargetId || objectId,
            channelAuth: true,
            oauthToken: this.oauthToken
          }));

        case 17:
          authToken = _context23.sent;
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
          return _context23.abrupt("return", config);

        case 21:
        case "end":
          return _context23.stop();
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


exports.CallBitcodeMethod = function _callee24(_ref19) {
  var libraryId, objectId, versionHash, writeToken, method, _ref19$queryParams, queryParams, _ref19$body, body, _ref19$headers, headers, _ref19$constant, constant, _ref19$format, format, path, authHeader;

  return _regeneratorRuntime.async(function _callee24$(_context24) {
    while (1) {
      switch (_context24.prev = _context24.next) {
        case 0:
          libraryId = _ref19.libraryId, objectId = _ref19.objectId, versionHash = _ref19.versionHash, writeToken = _ref19.writeToken, method = _ref19.method, _ref19$queryParams = _ref19.queryParams, queryParams = _ref19$queryParams === void 0 ? {} : _ref19$queryParams, _ref19$body = _ref19.body, body = _ref19$body === void 0 ? {} : _ref19$body, _ref19$headers = _ref19.headers, headers = _ref19$headers === void 0 ? {} : _ref19$headers, _ref19$constant = _ref19.constant, constant = _ref19$constant === void 0 ? true : _ref19$constant, _ref19$format = _ref19.format, format = _ref19$format === void 0 ? "json" : _ref19$format;
          ValidateParameters({
            libraryId: libraryId,
            objectId: objectId,
            versionHash: versionHash
          });

          if (method) {
            _context24.next = 4;
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
            _context24.next = 12;
            break;
          }

          _context24.next = 11;
          return _regeneratorRuntime.awrap(this.authClient.AuthorizationHeader({
            libraryId: libraryId,
            objectId: objectId,
            update: !constant
          }));

        case 11:
          headers.Authorization = _context24.sent.Authorization;

        case 12:
          this.Log("Calling bitcode method: ".concat(libraryId || "", " ").concat(objectId || versionHash, " ").concat(writeToken || "", "\n      ").concat(constant ? "GET" : "POST", " ").concat(path, "\n      Query Params:\n      ").concat(queryParams, "\n      Body:\n      ").concat(body, "\n      Headers\n      ").concat(headers));
          _context24.t0 = this.utils;
          _context24.t1 = format;
          _context24.next = 17;
          return _regeneratorRuntime.awrap(this.HttpClient.Request({
            body: body,
            headers: headers,
            method: constant ? "GET" : "POST",
            path: path,
            queryParams: queryParams,
            failover: false
          }));

        case 17:
          _context24.t2 = _context24.sent;
          return _context24.abrupt("return", _context24.t0.ResponseToFormat.call(_context24.t0, _context24.t1, _context24.t2));

        case 19:
        case "end":
          return _context24.stop();
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


exports.Rep = function _callee25(_ref20) {
  var libraryId, objectId, versionHash, rep, _ref20$queryParams, queryParams, _ref20$channelAuth, channelAuth, _ref20$noAuth, noAuth, _ref20$noCache, noCache;

  return _regeneratorRuntime.async(function _callee25$(_context25) {
    while (1) {
      switch (_context25.prev = _context25.next) {
        case 0:
          libraryId = _ref20.libraryId, objectId = _ref20.objectId, versionHash = _ref20.versionHash, rep = _ref20.rep, _ref20$queryParams = _ref20.queryParams, queryParams = _ref20$queryParams === void 0 ? {} : _ref20$queryParams, _ref20$channelAuth = _ref20.channelAuth, channelAuth = _ref20$channelAuth === void 0 ? false : _ref20$channelAuth, _ref20$noAuth = _ref20.noAuth, noAuth = _ref20$noAuth === void 0 ? false : _ref20$noAuth, _ref20$noCache = _ref20.noCache, noCache = _ref20$noCache === void 0 ? false : _ref20$noCache;
          ValidateParameters({
            libraryId: libraryId,
            objectId: objectId,
            versionHash: versionHash
          });

          if (rep) {
            _context25.next = 4;
            break;
          }

          throw "Rep not specified";

        case 4:
          return _context25.abrupt("return", this.FabricUrl({
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
          return _context25.stop();
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


exports.PublicRep = function _callee26(_ref21) {
  var libraryId, objectId, versionHash, rep, _ref21$queryParams, queryParams;

  return _regeneratorRuntime.async(function _callee26$(_context26) {
    while (1) {
      switch (_context26.prev = _context26.next) {
        case 0:
          libraryId = _ref21.libraryId, objectId = _ref21.objectId, versionHash = _ref21.versionHash, rep = _ref21.rep, _ref21$queryParams = _ref21.queryParams, queryParams = _ref21$queryParams === void 0 ? {} : _ref21$queryParams;
          ValidateParameters({
            libraryId: libraryId,
            objectId: objectId,
            versionHash: versionHash
          });

          if (rep) {
            _context26.next = 4;
            break;
          }

          throw "Rep not specified";

        case 4:
          return _context26.abrupt("return", this.FabricUrl({
            libraryId: libraryId,
            objectId: objectId,
            versionHash: versionHash,
            publicRep: rep,
            queryParams: queryParams,
            noAuth: true
          }));

        case 5:
        case "end":
          return _context26.stop();
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


exports.FabricUrl = function _callee27(_ref22) {
  var libraryId, objectId, versionHash, writeToken, partHash, rep, publicRep, call, _ref22$queryParams, queryParams, _ref22$channelAuth, channelAuth, _ref22$noAuth, noAuth, _ref22$noCache, noCache, path;

  return _regeneratorRuntime.async(function _callee27$(_context27) {
    while (1) {
      switch (_context27.prev = _context27.next) {
        case 0:
          libraryId = _ref22.libraryId, objectId = _ref22.objectId, versionHash = _ref22.versionHash, writeToken = _ref22.writeToken, partHash = _ref22.partHash, rep = _ref22.rep, publicRep = _ref22.publicRep, call = _ref22.call, _ref22$queryParams = _ref22.queryParams, queryParams = _ref22$queryParams === void 0 ? {} : _ref22$queryParams, _ref22$channelAuth = _ref22.channelAuth, channelAuth = _ref22$channelAuth === void 0 ? false : _ref22$channelAuth, _ref22$noAuth = _ref22.noAuth, noAuth = _ref22$noAuth === void 0 ? false : _ref22$noAuth, _ref22$noCache = _ref22.noCache, noCache = _ref22$noCache === void 0 ? false : _ref22$noCache;

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
          _context27.next = 7;
          return _regeneratorRuntime.awrap(this.authClient.AuthorizationToken({
            libraryId: libraryId,
            objectId: objectId,
            versionHash: versionHash,
            channelAuth: channelAuth,
            noAuth: noAuth,
            noCache: noCache
          }));

        case 7:
          queryParams.authorization = _context27.sent;
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

          return _context27.abrupt("return", this.HttpClient.URL({
            path: path,
            queryParams: queryParams
          }));

        case 12:
        case "end":
          return _context27.stop();
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


exports.FileUrl = function _callee28(_ref23) {
  var libraryId, objectId, versionHash, writeToken, filePath, _ref23$queryParams, queryParams, _ref23$noCache, noCache, path, authorizationToken;

  return _regeneratorRuntime.async(function _callee28$(_context28) {
    while (1) {
      switch (_context28.prev = _context28.next) {
        case 0:
          libraryId = _ref23.libraryId, objectId = _ref23.objectId, versionHash = _ref23.versionHash, writeToken = _ref23.writeToken, filePath = _ref23.filePath, _ref23$queryParams = _ref23.queryParams, queryParams = _ref23$queryParams === void 0 ? {} : _ref23$queryParams, _ref23$noCache = _ref23.noCache, noCache = _ref23$noCache === void 0 ? false : _ref23$noCache;
          ValidateParameters({
            libraryId: libraryId,
            objectId: objectId,
            versionHash: versionHash
          });

          if (filePath) {
            _context28.next = 4;
            break;
          }

          throw "File path not specified";

        case 4:
          if (versionHash) {
            objectId = this.utils.DecodeVersionHash(versionHash).objectId;
          }

          if (libraryId) {
            path = UrlJoin("qlibs", libraryId, "q", writeToken || versionHash || objectId, "files", filePath);
          } else {
            path = UrlJoin("q", versionHash, "files", filePath);
          }

          _context28.next = 8;
          return _regeneratorRuntime.awrap(this.authClient.AuthorizationToken({
            libraryId: libraryId,
            objectId: objectId,
            noCache: noCache
          }));

        case 8:
          authorizationToken = _context28.sent;
          return _context28.abrupt("return", this.HttpClient.URL({
            path: path,
            queryParams: _objectSpread({}, queryParams, {
              authorization: authorizationToken
            })
          }));

        case 10:
        case "end":
          return _context28.stop();
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
 *
 * @returns {Promise<string | undefined>} - If the object has an image, will return a URL for that image.
 */


exports.ContentObjectImageUrl = function _callee29(_ref24) {
  var libraryId, objectId, versionHash, imageMetadata;
  return _regeneratorRuntime.async(function _callee29$(_context29) {
    while (1) {
      switch (_context29.prev = _context29.next) {
        case 0:
          libraryId = _ref24.libraryId, objectId = _ref24.objectId, versionHash = _ref24.versionHash;
          ValidateParameters({
            libraryId: libraryId,
            objectId: objectId,
            versionHash: versionHash
          });

          if (versionHash) {
            _context29.next = 6;
            break;
          }

          _context29.next = 5;
          return _regeneratorRuntime.awrap(this.LatestVersionHash({
            objectId: objectId
          }));

        case 5:
          versionHash = _context29.sent;

        case 6:
          this.Log("Retrieving content object image url: ".concat(libraryId, " ").concat(objectId, " ").concat(versionHash));

          if (this.objectImageUrls[versionHash]) {
            _context29.next = 17;
            break;
          }

          _context29.next = 10;
          return _regeneratorRuntime.awrap(this.ContentObjectMetadata({
            versionHash: versionHash,
            metadataSubtree: "public/display_image"
          }));

        case 10:
          imageMetadata = _context29.sent;

          if (imageMetadata) {
            _context29.next = 14;
            break;
          }

          this.Log("No image url set: ".concat(libraryId, " ").concat(objectId, " ").concat(versionHash));
          return _context29.abrupt("return");

        case 14:
          _context29.next = 16;
          return _regeneratorRuntime.awrap(this.LinkUrl({
            versionHash: versionHash,
            linkPath: "public/display_image"
          }));

        case 16:
          this.objectImageUrls[versionHash] = _context29.sent;

        case 17:
          return _context29.abrupt("return", this.objectImageUrls[versionHash]);

        case 18:
        case "end":
          return _context29.stop();
      }
    }
  }, null, this);
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


exports.ContentObjectGraph = function _callee31(_ref25) {
  var _this5 = this;

  var libraryId, objectId, versionHash, _ref25$autoUpdate, autoUpdate, select, path, errorInfo, cycles, info;

  return _regeneratorRuntime.async(function _callee31$(_context31) {
    while (1) {
      switch (_context31.prev = _context31.next) {
        case 0:
          libraryId = _ref25.libraryId, objectId = _ref25.objectId, versionHash = _ref25.versionHash, _ref25$autoUpdate = _ref25.autoUpdate, autoUpdate = _ref25$autoUpdate === void 0 ? false : _ref25$autoUpdate, select = _ref25.select;
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
          _context31.prev = 5;
          _context31.t0 = _regeneratorRuntime;
          _context31.t1 = this.utils;
          _context31.t2 = this.HttpClient;
          _context31.next = 11;
          return _regeneratorRuntime.awrap(this.authClient.AuthorizationHeader({
            libraryId: libraryId,
            objectId: objectId,
            versionHash: versionHash,
            noAuth: true
          }));

        case 11:
          _context31.t3 = _context31.sent;
          _context31.t4 = {
            auto_update: autoUpdate,
            select: select
          };
          _context31.t5 = path;
          _context31.t6 = {
            headers: _context31.t3,
            queryParams: _context31.t4,
            method: "GET",
            path: _context31.t5
          };
          _context31.t7 = _context31.t2.Request.call(_context31.t2, _context31.t6);
          _context31.t8 = _context31.t1.ResponseToJson.call(_context31.t1, _context31.t7);
          _context31.next = 19;
          return _context31.t0.awrap.call(_context31.t0, _context31.t8);

        case 19:
          return _context31.abrupt("return", _context31.sent);

        case 22:
          _context31.prev = 22;
          _context31.t9 = _context31["catch"](5);
          _context31.prev = 24;
          cycles = _context31.t9.body.errors[0].cause.cause.cause.cycle;

          if (!(!cycles || cycles.length === 0)) {
            _context31.next = 28;
            break;
          }

          throw _context31.t9;

        case 28:
          info = {};
          _context31.next = 31;
          return _regeneratorRuntime.awrap(Promise.all(cycles.map(function _callee30(cycleHash) {
            var cycleId, name;
            return _regeneratorRuntime.async(function _callee30$(_context30) {
              while (1) {
                switch (_context30.prev = _context30.next) {
                  case 0:
                    if (!info[cycleHash]) {
                      _context30.next = 2;
                      break;
                    }

                    return _context30.abrupt("return");

                  case 2:
                    cycleId = _this5.utils.DecodeVersionHash(cycleHash).objectId;
                    _context30.next = 5;
                    return _regeneratorRuntime.awrap(_this5.ContentObjectMetadata({
                      versionHash: cycleHash,
                      metadataSubtree: "public/asset_metadata/display_title"
                    }));

                  case 5:
                    _context30.t2 = _context30.sent;

                    if (_context30.t2) {
                      _context30.next = 10;
                      break;
                    }

                    _context30.next = 9;
                    return _regeneratorRuntime.awrap(_this5.ContentObjectMetadata({
                      versionHash: cycleHash,
                      metadataSubtree: "public/name"
                    }));

                  case 9:
                    _context30.t2 = _context30.sent;

                  case 10:
                    _context30.t1 = _context30.t2;

                    if (_context30.t1) {
                      _context30.next = 15;
                      break;
                    }

                    _context30.next = 14;
                    return _regeneratorRuntime.awrap(_this5.ContentObjectMetadata({
                      versionHash: cycleHash,
                      metadataSubtree: "name"
                    }));

                  case 14:
                    _context30.t1 = _context30.sent;

                  case 15:
                    _context30.t0 = _context30.t1;

                    if (_context30.t0) {
                      _context30.next = 18;
                      break;
                    }

                    _context30.t0 = cycleId;

                  case 18:
                    name = _context30.t0;
                    info[cycleHash] = {
                      name: name,
                      objectId: cycleId
                    };

                  case 20:
                  case "end":
                    return _context30.stop();
                }
              }
            });
          })));

        case 31:
          errorInfo = cycles.map(function (cycleHash) {
            return "".concat(info[cycleHash].name, " (").concat(info[cycleHash].objectId, ")");
          });
          _context31.next = 37;
          break;

        case 34:
          _context31.prev = 34;
          _context31.t10 = _context31["catch"](24);
          throw _context31.t9;

        case 37:
          throw new Error("Cycle found in links: ".concat(errorInfo.join(" -> ")));

        case 38:
        case "end":
          return _context31.stop();
      }
    }
  }, null, this, [[5, 22], [24, 34]]);
};
/**
 * Retrieve the version hash of the specified link's target. If the target is the same as the specified
 * object and versionHash is not specified, will return the latest version hash.
 *
 * @methodGroup Links
 * @namedParams
 * @param {string=} libraryId - ID of an library
 * @param {string=} objectId - ID of an object
 * @param {string=} versionHash - Hash of an object version
 * @param {string} linkPath - Path to the content object link
 *
 * @returns {Promise<string>} - Version hash of the link's target
 */


exports.LinkTarget = function _callee32(_ref26) {
  var libraryId, objectId, versionHash, linkPath, linkInfo, targetHash;
  return _regeneratorRuntime.async(function _callee32$(_context32) {
    while (1) {
      switch (_context32.prev = _context32.next) {
        case 0:
          libraryId = _ref26.libraryId, objectId = _ref26.objectId, versionHash = _ref26.versionHash, linkPath = _ref26.linkPath;

          if (versionHash) {
            objectId = this.utils.DecodeVersionHash(versionHash).objectId;
          }

          _context32.next = 4;
          return _regeneratorRuntime.awrap(this.ContentObjectMetadata({
            libraryId: libraryId,
            objectId: objectId,
            versionHash: versionHash,
            metadataSubtree: UrlJoin(linkPath),
            resolveLinks: false
          }));

        case 4:
          linkInfo = _context32.sent;

          if (!(!linkInfo || !linkInfo["/"])) {
            _context32.next = 7;
            break;
          }

          throw Error("No valid link at ".concat(linkPath));

        case 7:
          /* For absolute links - extract the hash from the link itself. Otherwise use "container" */
          targetHash = ((linkInfo["/"] || "").match(/^\/?qfab\/([\w]+)\/?.+/) || [])[1];

          if (!targetHash) {
            targetHash = linkInfo["."].container;
          }

          if (!targetHash) {
            _context32.next = 13;
            break;
          }

          return _context32.abrupt("return", targetHash);

        case 13:
          if (!versionHash) {
            _context32.next = 15;
            break;
          }

          return _context32.abrupt("return", versionHash);

        case 15:
          _context32.next = 17;
          return _regeneratorRuntime.awrap(this.LatestVersionHash({
            objectId: objectId
          }));

        case 17:
          return _context32.abrupt("return", _context32.sent);

        case 18:
        case "end":
          return _context32.stop();
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
 * @param {string} linkPath - Path to the content object link
 * @param {string=} mimeType - Mime type to use when rendering the file
 * @param {Object=} queryParams - Query params to add to the URL
 * @param {boolean=} noCache=false - If specified, a new access request will be made for the authorization regardless of
 * whether such a request exists in the client cache. This request will not be cached.
 *
 * @returns {Promise<string>} - URL to the specified file with authorization token
 */


exports.LinkUrl = function _callee33(_ref27) {
  var libraryId, objectId, versionHash, linkPath, mimeType, _ref27$queryParams, queryParams, _ref27$noCache, noCache, path;

  return _regeneratorRuntime.async(function _callee33$(_context33) {
    while (1) {
      switch (_context33.prev = _context33.next) {
        case 0:
          libraryId = _ref27.libraryId, objectId = _ref27.objectId, versionHash = _ref27.versionHash, linkPath = _ref27.linkPath, mimeType = _ref27.mimeType, _ref27$queryParams = _ref27.queryParams, queryParams = _ref27$queryParams === void 0 ? {} : _ref27$queryParams, _ref27$noCache = _ref27.noCache, noCache = _ref27$noCache === void 0 ? false : _ref27$noCache;
          ValidateParameters({
            libraryId: libraryId,
            objectId: objectId,
            versionHash: versionHash
          });

          if (linkPath) {
            _context33.next = 4;
            break;
          }

          throw Error("Link path not specified");

        case 4:
          if (versionHash) {
            objectId = this.utils.DecodeVersionHash(versionHash).objectId;
          }

          if (libraryId) {
            path = UrlJoin("qlibs", libraryId, "q", versionHash || objectId, "meta", linkPath);
          } else {
            path = UrlJoin("q", versionHash, "meta", linkPath);
          }

          _context33.t0 = _objectSpread;
          _context33.t1 = {};
          _context33.t2 = queryParams;
          _context33.next = 11;
          return _regeneratorRuntime.awrap(this.authClient.AuthorizationToken({
            libraryId: libraryId,
            objectId: objectId,
            noCache: noCache,
            noAuth: true
          }));

        case 11:
          _context33.t3 = _context33.sent;
          _context33.t4 = {
            resolve: true,
            authorization: _context33.t3
          };
          queryParams = (0, _context33.t0)(_context33.t1, _context33.t2, _context33.t4);

          if (mimeType) {
            queryParams["header-accept"] = mimeType;
          }

          return _context33.abrupt("return", this.HttpClient.URL({
            path: path,
            queryParams: queryParams
          }));

        case 16:
        case "end":
          return _context33.stop();
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
 * @param {string} linkPath - Path to the content object link
 * @param {string=} format=json - Format of the response
 */


exports.LinkData = function _callee34(_ref28) {
  var libraryId, objectId, versionHash, linkPath, _ref28$format, format, linkUrl;

  return _regeneratorRuntime.async(function _callee34$(_context34) {
    while (1) {
      switch (_context34.prev = _context34.next) {
        case 0:
          libraryId = _ref28.libraryId, objectId = _ref28.objectId, versionHash = _ref28.versionHash, linkPath = _ref28.linkPath, _ref28$format = _ref28.format, format = _ref28$format === void 0 ? "json" : _ref28$format;
          _context34.next = 3;
          return _regeneratorRuntime.awrap(this.LinkUrl({
            libraryId: libraryId,
            objectId: objectId,
            versionHash: versionHash,
            linkPath: linkPath
          }));

        case 3:
          linkUrl = _context34.sent;
          _context34.t0 = this.utils;
          _context34.t1 = format;
          _context34.next = 8;
          return _regeneratorRuntime.awrap(HttpClient.Fetch(linkUrl));

        case 8:
          _context34.t2 = _context34.sent;
          return _context34.abrupt("return", _context34.t0.ResponseToFormat.call(_context34.t0, _context34.t1, _context34.t2));

        case 10:
        case "end":
          return _context34.stop();
      }
    }
  }, null, this);
};
/* Encryption */

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
 * @param {string=} writeToken - Write token of the content object draft
 *
 * @return Promise<Object> - The encryption conk for the object
 */


exports.EncryptionConk = function _callee35(_ref29) {
  var libraryId, objectId, writeToken, owner, capKey, existingUserCap, metadata, kmsAddress, _kmsPublicKey, kmsCapKey, existingKMSCap;

  return _regeneratorRuntime.async(function _callee35$(_context35) {
    while (1) {
      switch (_context35.prev = _context35.next) {
        case 0:
          libraryId = _ref29.libraryId, objectId = _ref29.objectId, writeToken = _ref29.writeToken;
          ValidateParameters({
            libraryId: libraryId,
            objectId: objectId
          });

          if (writeToken) {
            ValidateWriteToken(writeToken);
          }

          _context35.next = 5;
          return _regeneratorRuntime.awrap(this.authClient.Owner({
            id: objectId,
            abi: ContentContract.abi
          }));

        case 5:
          owner = _context35.sent;

          if (this.utils.EqualAddress(owner, this.signer.address)) {
            _context35.next = 12;
            break;
          }

          if (this.reencryptionConks[objectId]) {
            _context35.next = 11;
            break;
          }

          _context35.next = 10;
          return _regeneratorRuntime.awrap(this.authClient.ReEncryptionConk({
            libraryId: libraryId,
            objectId: objectId
          }));

        case 10:
          this.reencryptionConks[objectId] = _context35.sent;

        case 11:
          return _context35.abrupt("return", this.reencryptionConks[objectId]);

        case 12:
          if (this.encryptionConks[objectId]) {
            _context35.next = 53;
            break;
          }

          capKey = "eluv.caps.iusr".concat(this.utils.AddressToHash(this.signer.address));
          _context35.next = 16;
          return _regeneratorRuntime.awrap(this.ContentObjectMetadata({
            libraryId: libraryId,
            // Cap may only exist in draft
            objectId: objectId,
            writeToken: writeToken,
            metadataSubtree: capKey
          }));

        case 16:
          existingUserCap = _context35.sent;

          if (!existingUserCap) {
            _context35.next = 23;
            break;
          }

          _context35.next = 20;
          return _regeneratorRuntime.awrap(Crypto.DecryptCap(existingUserCap, this.signer.signingKey.privateKey));

        case 20:
          this.encryptionConks[objectId] = _context35.sent;
          _context35.next = 53;
          break;

        case 23:
          _context35.next = 25;
          return _regeneratorRuntime.awrap(Crypto.GeneratePrimaryConk());

        case 25:
          this.encryptionConks[objectId] = _context35.sent;

          if (!writeToken) {
            _context35.next = 53;
            break;
          }

          metadata = {};
          _context35.next = 30;
          return _regeneratorRuntime.awrap(Crypto.EncryptConk(this.encryptionConks[objectId], this.signer.signingKey.publicKey));

        case 30:
          metadata[capKey] = _context35.sent;
          _context35.prev = 31;
          _context35.next = 34;
          return _regeneratorRuntime.awrap(this.authClient.KMSAddress({
            objectId: objectId
          }));

        case 34:
          kmsAddress = _context35.sent;
          _context35.next = 37;
          return _regeneratorRuntime.awrap(this.authClient.KMSInfo({
            objectId: objectId
          }));

        case 37:
          _kmsPublicKey = _context35.sent.publicKey;
          kmsCapKey = "eluv.caps.ikms".concat(this.utils.AddressToHash(kmsAddress));
          _context35.next = 41;
          return _regeneratorRuntime.awrap(this.ContentObjectMetadata({
            libraryId: libraryId,
            // Cap may only exist in draft
            objectId: objectId,
            writeToken: writeToken,
            metadataSubtree: kmsCapKey
          }));

        case 41:
          existingKMSCap = _context35.sent;

          if (existingKMSCap) {
            _context35.next = 46;
            break;
          }

          _context35.next = 45;
          return _regeneratorRuntime.awrap(Crypto.EncryptConk(this.encryptionConks[objectId], _kmsPublicKey));

        case 45:
          metadata[kmsCapKey] = _context35.sent;

        case 46:
          _context35.next = 51;
          break;

        case 48:
          _context35.prev = 48;
          _context35.t0 = _context35["catch"](31);
          // eslint-disable-next-line no-console
          console.error("Failed to create encryption cap for KMS with public key " + kmsPublicKey);

        case 51:
          _context35.next = 53;
          return _regeneratorRuntime.awrap(this.MergeMetadata({
            libraryId: libraryId,
            objectId: objectId,
            writeToken: writeToken,
            metadata: metadata
          }));

        case 53:
          return _context35.abrupt("return", this.encryptionConks[objectId]);

        case 54:
        case "end":
          return _context35.stop();
      }
    }
  }, null, this, [[31, 48]]);
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


exports.Encrypt = function _callee36(_ref30) {
  var libraryId, objectId, writeToken, chunk, conk, data;
  return _regeneratorRuntime.async(function _callee36$(_context36) {
    while (1) {
      switch (_context36.prev = _context36.next) {
        case 0:
          libraryId = _ref30.libraryId, objectId = _ref30.objectId, writeToken = _ref30.writeToken, chunk = _ref30.chunk;
          ValidateParameters({
            libraryId: libraryId,
            objectId: objectId
          });
          _context36.next = 4;
          return _regeneratorRuntime.awrap(this.EncryptionConk({
            libraryId: libraryId,
            objectId: objectId,
            writeToken: writeToken
          }));

        case 4:
          conk = _context36.sent;
          _context36.next = 7;
          return _regeneratorRuntime.awrap(Crypto.Encrypt(conk, chunk));

        case 7:
          data = _context36.sent;
          return _context36.abrupt("return", data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength));

        case 9:
        case "end":
          return _context36.stop();
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


exports.Decrypt = function _callee37(_ref31) {
  var libraryId, objectId, writeToken, chunk, conk, data;
  return _regeneratorRuntime.async(function _callee37$(_context37) {
    while (1) {
      switch (_context37.prev = _context37.next) {
        case 0:
          libraryId = _ref31.libraryId, objectId = _ref31.objectId, writeToken = _ref31.writeToken, chunk = _ref31.chunk;
          ValidateParameters({
            libraryId: libraryId,
            objectId: objectId
          });
          _context37.next = 4;
          return _regeneratorRuntime.awrap(this.EncryptionConk({
            libraryId: libraryId,
            objectId: objectId,
            writeToken: writeToken
          }));

        case 4:
          conk = _context37.sent;
          _context37.next = 7;
          return _regeneratorRuntime.awrap(Crypto.Decrypt(conk, chunk));

        case 7:
          data = _context37.sent;
          return _context37.abrupt("return", data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength));

        case 9:
        case "end":
          return _context37.stop();
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


exports.AccessType = function _callee38(_ref32) {
  var id;
  return _regeneratorRuntime.async(function _callee38$(_context38) {
    while (1) {
      switch (_context38.prev = _context38.next) {
        case 0:
          id = _ref32.id;
          _context38.next = 3;
          return _regeneratorRuntime.awrap(this.authClient.AccessType(id));

        case 3:
          return _context38.abrupt("return", _context38.sent);

        case 4:
        case "end":
          return _context38.stop();
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


exports.AccessInfo = function _callee39(_ref33) {
  var objectId, args, info;
  return _regeneratorRuntime.async(function _callee39$(_context39) {
    while (1) {
      switch (_context39.prev = _context39.next) {
        case 0:
          objectId = _ref33.objectId, args = _ref33.args;
          ValidateObject(objectId);

          if (!args) {
            args = [0, // Access level
            [], // Custom values
            [] // Stakeholders
            ];
          }

          this.Log("Retrieving access info: ".concat(objectId));
          _context39.next = 6;
          return _regeneratorRuntime.awrap(this.ethClient.CallContractMethod({
            contractAddress: this.utils.HashToAddress(objectId),
            abi: ContentContract.abi,
            methodName: "getAccessInfo",
            methodArgs: args,
            signer: this.signer
          }));

        case 6:
          info = _context39.sent;
          this.Log(info);
          return _context39.abrupt("return", {
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
          return _context39.stop();
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


exports.AccessRequest = function _callee40(_ref34) {
  var libraryId, objectId, versionHash, _ref34$args, args, _ref34$update, update, _ref34$noCache, noCache;

  return _regeneratorRuntime.async(function _callee40$(_context40) {
    while (1) {
      switch (_context40.prev = _context40.next) {
        case 0:
          libraryId = _ref34.libraryId, objectId = _ref34.objectId, versionHash = _ref34.versionHash, _ref34$args = _ref34.args, args = _ref34$args === void 0 ? [] : _ref34$args, _ref34$update = _ref34.update, update = _ref34$update === void 0 ? false : _ref34$update, _ref34$noCache = _ref34.noCache, noCache = _ref34$noCache === void 0 ? false : _ref34$noCache;
          ValidateParameters({
            libraryId: libraryId,
            objectId: objectId,
            versionHash: versionHash
          });

          if (versionHash) {
            objectId = this.utils.DecodeVersionHash(versionHash).objectId;
          }

          _context40.next = 5;
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
          return _context40.abrupt("return", _context40.sent);

        case 6:
        case "end":
          return _context40.stop();
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


exports.GenerateStateChannelToken = function _callee41(_ref35) {
  var objectId, versionHash, _ref35$noCache, noCache, audienceData;

  return _regeneratorRuntime.async(function _callee41$(_context41) {
    while (1) {
      switch (_context41.prev = _context41.next) {
        case 0:
          objectId = _ref35.objectId, versionHash = _ref35.versionHash, _ref35$noCache = _ref35.noCache, noCache = _ref35$noCache === void 0 ? false : _ref35$noCache;
          versionHash ? ValidateVersion(versionHash) : ValidateObject(objectId);

          if (!versionHash) {
            _context41.next = 6;
            break;
          }

          objectId = this.utils.DecodeVersionHash(versionHash).objectId;
          _context41.next = 10;
          break;

        case 6:
          if (this.stateChannelAccess[objectId]) {
            _context41.next = 10;
            break;
          }

          _context41.next = 9;
          return _regeneratorRuntime.awrap(this.LatestVersionHash({
            objectId: objectId
          }));

        case 9:
          versionHash = _context41.sent;

        case 10:
          this.stateChannelAccess[objectId] = versionHash;
          audienceData = this.AudienceData({
            objectId: objectId,
            versionHash: versionHash
          });
          _context41.next = 14;
          return _regeneratorRuntime.awrap(this.authClient.AuthorizationToken({
            objectId: objectId,
            channelAuth: true,
            oauthToken: this.oauthToken,
            audienceData: audienceData,
            noCache: noCache
          }));

        case 14:
          return _context41.abrupt("return", _context41.sent);

        case 15:
        case "end":
          return _context41.stop();
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


exports.FinalizeStateChannelAccess = function _callee42(_ref36) {
  var objectId, versionHash, percentComplete, audienceData;
  return _regeneratorRuntime.async(function _callee42$(_context42) {
    while (1) {
      switch (_context42.prev = _context42.next) {
        case 0:
          objectId = _ref36.objectId, versionHash = _ref36.versionHash, percentComplete = _ref36.percentComplete;
          versionHash ? ValidateVersion(versionHash) : ValidateObject(objectId);

          if (!versionHash) {
            _context42.next = 6;
            break;
          }

          objectId = this.utils.DecodeVersionHash(versionHash).objectId;
          _context42.next = 13;
          break;

        case 6:
          if (!this.stateChannelAccess[objectId]) {
            _context42.next = 10;
            break;
          }

          versionHash = this.stateChannelAccess[objectId];
          _context42.next = 13;
          break;

        case 10:
          _context42.next = 12;
          return _regeneratorRuntime.awrap(this.LatestVersionHash({
            objectId: objectId
          }));

        case 12:
          versionHash = _context42.sent;

        case 13:
          this.stateChannelAccess[objectId] = undefined;
          audienceData = this.AudienceData({
            objectId: objectId,
            versionHash: versionHash
          });
          _context42.next = 17;
          return _regeneratorRuntime.awrap(this.authClient.ChannelContentFinalize({
            objectId: objectId,
            audienceData: audienceData,
            percent: percentComplete
          }));

        case 17:
        case "end":
          return _context42.stop();
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


exports.ContentObjectAccessComplete = function _callee43(_ref37) {
  var objectId, _ref37$score, score;

  return _regeneratorRuntime.async(function _callee43$(_context43) {
    while (1) {
      switch (_context43.prev = _context43.next) {
        case 0:
          objectId = _ref37.objectId, _ref37$score = _ref37.score, score = _ref37$score === void 0 ? 100 : _ref37$score;
          ValidateObject(objectId);

          if (!(score < 0 || score > 100)) {
            _context43.next = 4;
            break;
          }

          throw Error("Invalid AccessComplete score: " + score);

        case 4:
          _context43.next = 6;
          return _regeneratorRuntime.awrap(this.authClient.AccessComplete({
            id: objectId,
            abi: ContentContract.abi,
            score: score
          }));

        case 6:
          return _context43.abrupt("return", _context43.sent);

        case 7:
        case "end":
          return _context43.stop();
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


exports.Collection = function _callee44(_ref38) {
  var collectionType, validCollectionTypes, walletAddress;
  return _regeneratorRuntime.async(function _callee44$(_context44) {
    while (1) {
      switch (_context44.prev = _context44.next) {
        case 0:
          collectionType = _ref38.collectionType;
          validCollectionTypes = ["accessGroups", "contentObjects", "contentTypes", "contracts", "libraries"];

          if (validCollectionTypes.includes(collectionType)) {
            _context44.next = 4;
            break;
          }

          throw new Error("Invalid collection type: " + collectionType);

        case 4:
          if (!this.signer) {
            _context44.next = 10;
            break;
          }

          _context44.next = 7;
          return _regeneratorRuntime.awrap(this.userProfileClient.WalletAddress());

        case 7:
          _context44.t0 = _context44.sent;
          _context44.next = 11;
          break;

        case 10:
          _context44.t0 = undefined;

        case 11:
          walletAddress = _context44.t0;

          if (walletAddress) {
            _context44.next = 14;
            break;
          }

          throw new Error("Unable to get collection: User wallet doesn't exist");

        case 14:
          this.Log("Retrieving ".concat(collectionType, " contract collection for user ").concat(this.signer.address));
          _context44.next = 17;
          return _regeneratorRuntime.awrap(this.ethClient.MakeProviderCall({
            methodName: "send",
            args: ["elv_getWalletCollection", [this.contentSpaceId, "iusr".concat(this.utils.AddressToHash(this.signer.address)), collectionType]]
          }));

        case 17:
          return _context44.abrupt("return", _context44.sent);

        case 18:
        case "end":
          return _context44.stop();
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


exports.VerifyContentObject = function _callee45(_ref39) {
  var libraryId, objectId, versionHash;
  return _regeneratorRuntime.async(function _callee45$(_context45) {
    while (1) {
      switch (_context45.prev = _context45.next) {
        case 0:
          libraryId = _ref39.libraryId, objectId = _ref39.objectId, versionHash = _ref39.versionHash;
          ValidateParameters({
            libraryId: libraryId,
            objectId: objectId,
            versionHash: versionHash
          });
          _context45.next = 4;
          return _regeneratorRuntime.awrap(ContentObjectVerification.VerifyContentObject({
            client: this,
            libraryId: libraryId,
            objectId: objectId,
            versionHash: versionHash
          }));

        case 4:
          return _context45.abrupt("return", _context45.sent);

        case 5:
        case "end":
          return _context45.stop();
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


exports.Proofs = function _callee46(_ref40) {
  var libraryId, objectId, versionHash, partHash, path;
  return _regeneratorRuntime.async(function _callee46$(_context46) {
    while (1) {
      switch (_context46.prev = _context46.next) {
        case 0:
          libraryId = _ref40.libraryId, objectId = _ref40.objectId, versionHash = _ref40.versionHash, partHash = _ref40.partHash;
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
          _context46.t0 = this.utils;
          _context46.t1 = this.HttpClient;
          _context46.next = 9;
          return _regeneratorRuntime.awrap(this.authClient.AuthorizationHeader({
            libraryId: libraryId,
            objectId: objectId,
            versionHash: versionHash
          }));

        case 9:
          _context46.t2 = _context46.sent;
          _context46.t3 = path;
          _context46.t4 = {
            headers: _context46.t2,
            method: "GET",
            path: _context46.t3
          };
          _context46.t5 = _context46.t1.Request.call(_context46.t1, _context46.t4);
          return _context46.abrupt("return", _context46.t0.ResponseToJson.call(_context46.t0, _context46.t5));

        case 14:
        case "end":
          return _context46.stop();
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


exports.QParts = function _callee47(_ref41) {
  var libraryId, objectId, partHash, _ref41$format, format, path;

  return _regeneratorRuntime.async(function _callee47$(_context47) {
    while (1) {
      switch (_context47.prev = _context47.next) {
        case 0:
          libraryId = _ref41.libraryId, objectId = _ref41.objectId, partHash = _ref41.partHash, _ref41$format = _ref41.format, format = _ref41$format === void 0 ? "blob" : _ref41$format;
          ValidateParameters({
            libraryId: libraryId,
            objectId: objectId,
            versionHash: versionHash
          });
          ValidatePartHash(partHash);
          path = UrlJoin("qparts", partHash);
          _context47.t0 = this.utils;
          _context47.t1 = format;
          _context47.t2 = this.HttpClient;
          _context47.next = 9;
          return _regeneratorRuntime.awrap(this.authClient.AuthorizationHeader({
            libraryId: libraryId,
            objectId: objectId,
            partHash: partHash
          }));

        case 9:
          _context47.t3 = _context47.sent;
          _context47.t4 = path;
          _context47.t5 = {
            headers: _context47.t3,
            method: "GET",
            path: _context47.t4
          };
          _context47.t6 = _context47.t2.Request.call(_context47.t2, _context47.t5);
          return _context47.abrupt("return", _context47.t0.ResponseToFormat.call(_context47.t0, _context47.t1, _context47.t6));

        case 14:
        case "end":
          return _context47.stop();
      }
    }
  }, null, this);
};