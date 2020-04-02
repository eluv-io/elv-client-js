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

var _require = require("../Validation"),
    ValidateLibrary = _require.ValidateLibrary,
    ValidateObject = _require.ValidateObject,
    ValidateVersion = _require.ValidateVersion,
    ValidatePartHash = _require.ValidatePartHash,
    ValidateWriteToken = _require.ValidateWriteToken,
    ValidateParameters = _require.ValidateParameters;

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

          return _context.abrupt("return", 1);

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
/* Content Spaces */

/**
 * Get the address of the default KMS of the content space
 *
 * @methodGroup Content Space
 *
 * @returns {Promise<string>} - Address of the KMS
 */


exports.DefaultKMSAddress = function _callee2() {
  return _regeneratorRuntime.async(function _callee2$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          _context2.next = 2;
          return _regeneratorRuntime.awrap(this.CallContractMethod({
            contractAddress: this.contentSpaceAddress,
            methodName: "addressKMS"
          }));

        case 2:
          return _context2.abrupt("return", _context2.sent);

        case 3:
        case "end":
          return _context2.stop();
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


exports.ContentTypeOwner = function _callee3(_ref2) {
  var name, typeId, versionHash, contentType;
  return _regeneratorRuntime.async(function _callee3$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          name = _ref2.name, typeId = _ref2.typeId, versionHash = _ref2.versionHash;
          _context3.next = 3;
          return _regeneratorRuntime.awrap(this.ContentType({
            name: name,
            typeId: typeId,
            versionHash: versionHash
          }));

        case 3:
          contentType = _context3.sent;
          _context3.t0 = this.utils;
          _context3.next = 7;
          return _regeneratorRuntime.awrap(this.ethClient.CallContractMethod({
            contractAddress: this.utils.HashToAddress(contentType.id),
            methodName: "owner",
            methodArgs: []
          }));

        case 7:
          _context3.t1 = _context3.sent;
          return _context3.abrupt("return", _context3.t0.FormatAddress.call(_context3.t0, _context3.t1));

        case 9:
        case "end":
          return _context3.stop();
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


exports.ContentType = function _callee4(_ref3) {
  var name, typeId, versionHash, _ref3$publicOnly, publicOnly, types, metadata;

  return _regeneratorRuntime.async(function _callee4$(_context4) {
    while (1) {
      switch (_context4.prev = _context4.next) {
        case 0:
          name = _ref3.name, typeId = _ref3.typeId, versionHash = _ref3.versionHash, _ref3$publicOnly = _ref3.publicOnly, publicOnly = _ref3$publicOnly === void 0 ? false : _ref3$publicOnly;
          this.Log("Retrieving content type: ".concat(name || typeId || versionHash));

          if (versionHash) {
            typeId = this.utils.DecodeVersionHash(versionHash).objectId;
          }

          if (!name) {
            _context4.next = 8;
            break;
          }

          this.Log("Looking up type by name in content space metadata..."); // Look up named type in content space metadata

          _context4.next = 7;
          return _regeneratorRuntime.awrap(this.ContentObjectMetadata({
            libraryId: this.contentSpaceLibraryId,
            objectId: this.contentSpaceObjectId,
            metadataSubtree: UrlJoin("contentTypes", name)
          }));

        case 7:
          typeId = _context4.sent;

        case 8:
          if (typeId) {
            _context4.next = 18;
            break;
          }

          this.Log("Looking up type by name in available types...");
          _context4.next = 12;
          return _regeneratorRuntime.awrap(this.ContentTypes());

        case 12:
          types = _context4.sent;

          if (!name) {
            _context4.next = 17;
            break;
          }

          return _context4.abrupt("return", Object.values(types).find(function (type) {
            return (type.name || "").toLowerCase() === name.toLowerCase();
          }));

        case 17:
          return _context4.abrupt("return", Object.values(types).find(function (type) {
            return type.hash === versionHash;
          }));

        case 18:
          if (versionHash) {
            _context4.next = 22;
            break;
          }

          _context4.next = 21;
          return _regeneratorRuntime.awrap(this.LatestVersionHash({
            objectId: typeId
          }));

        case 21:
          versionHash = _context4.sent;

        case 22:
          _context4.prev = 22;
          this.Log("Looking up type by ID...");

          if (!publicOnly) {
            _context4.next = 34;
            break;
          }

          _context4.next = 27;
          return _regeneratorRuntime.awrap(this.ContentObjectMetadata({
            libraryId: this.contentSpaceLibraryId,
            objectId: typeId,
            metadataSubtree: "public"
          }));

        case 27:
          _context4.t0 = _context4.sent;

          if (_context4.t0) {
            _context4.next = 30;
            break;
          }

          _context4.t0 = {};

        case 30:
          _context4.t1 = _context4.t0;
          metadata = {
            "public": _context4.t1
          };
          _context4.next = 40;
          break;

        case 34:
          _context4.next = 36;
          return _regeneratorRuntime.awrap(this.ContentObjectMetadata({
            libraryId: this.contentSpaceLibraryId,
            objectId: typeId
          }));

        case 36:
          _context4.t2 = _context4.sent;

          if (_context4.t2) {
            _context4.next = 39;
            break;
          }

          _context4.t2 = {};

        case 39:
          metadata = _context4.t2;

        case 40:
          return _context4.abrupt("return", {
            id: typeId,
            hash: versionHash,
            name: metadata.name || typeId,
            meta: metadata
          });

        case 43:
          _context4.prev = 43;
          _context4.t3 = _context4["catch"](22);
          this.Log("Error looking up content type:");
          this.Log(_context4.t3);
          throw new Error("Content Type ".concat(name || typeId, " is invalid"));

        case 48:
        case "end":
          return _context4.stop();
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


exports.ContentTypes = function _callee6() {
  var _this = this;

  var typeAddresses, contentSpaceTypes, contentSpaceTypeAddresses;
  return _regeneratorRuntime.async(function _callee6$(_context6) {
    while (1) {
      switch (_context6.prev = _context6.next) {
        case 0:
          this.contentTypes = this.contentTypes || {};
          this.Log("Looking up all available content types"); // Personally available types

          _context6.next = 4;
          return _regeneratorRuntime.awrap(this.Collection({
            collectionType: "contentTypes"
          }));

        case 4:
          typeAddresses = _context6.sent;
          this.Log("Personally available types:");
          this.Log(typeAddresses); // Content space types

          _context6.next = 9;
          return _regeneratorRuntime.awrap(this.ContentObjectMetadata({
            libraryId: this.contentSpaceLibraryId,
            objectId: this.contentSpaceObjectId,
            metadataSubtree: "public/contentTypes"
          }));

        case 9:
          _context6.t0 = _context6.sent;

          if (_context6.t0) {
            _context6.next = 12;
            break;
          }

          _context6.t0 = {};

        case 12:
          contentSpaceTypes = _context6.t0;
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
          _context6.next = 19;
          return _regeneratorRuntime.awrap(Promise.all(typeAddresses.map(function _callee5(typeAddress) {
            var typeId;
            return _regeneratorRuntime.async(function _callee5$(_context5) {
              while (1) {
                switch (_context5.prev = _context5.next) {
                  case 0:
                    typeId = _this.utils.AddressToObjectId(typeAddress);

                    if (_this.contentTypes[typeId]) {
                      _context5.next = 11;
                      break;
                    }

                    _context5.prev = 2;
                    _context5.next = 5;
                    return _regeneratorRuntime.awrap(_this.ContentType({
                      typeId: typeId,
                      publicOnly: true
                    }));

                  case 5:
                    _this.contentTypes[typeId] = _context5.sent;
                    _context5.next = 11;
                    break;

                  case 8:
                    _context5.prev = 8;
                    _context5.t0 = _context5["catch"](2);
                    // eslint-disable-next-line no-console
                    console.error(_context5.t0);

                  case 11:
                  case "end":
                    return _context5.stop();
                }
              }
            }, null, null, [[2, 8]]);
          })));

        case 19:
          return _context6.abrupt("return", this.contentTypes);

        case 20:
        case "end":
          return _context6.stop();
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


exports.ContentLibraries = function _callee7() {
  var _this2 = this;

  var libraryAddresses;
  return _regeneratorRuntime.async(function _callee7$(_context7) {
    while (1) {
      switch (_context7.prev = _context7.next) {
        case 0:
          _context7.next = 2;
          return _regeneratorRuntime.awrap(this.Collection({
            collectionType: "libraries"
          }));

        case 2:
          libraryAddresses = _context7.sent;
          return _context7.abrupt("return", libraryAddresses.map(function (address) {
            return _this2.utils.AddressToLibraryId(address);
          }));

        case 4:
        case "end":
          return _context7.stop();
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


exports.ContentLibrary = function _callee8(_ref4) {
  var libraryId, path, library;
  return _regeneratorRuntime.async(function _callee8$(_context8) {
    while (1) {
      switch (_context8.prev = _context8.next) {
        case 0:
          libraryId = _ref4.libraryId;
          ValidateLibrary(libraryId);
          path = UrlJoin("qlibs", libraryId);
          _context8.t0 = _regeneratorRuntime;
          _context8.t1 = this.utils;
          _context8.t2 = this.HttpClient;
          _context8.next = 8;
          return _regeneratorRuntime.awrap(this.authClient.AuthorizationHeader({
            libraryId: libraryId
          }));

        case 8:
          _context8.t3 = _context8.sent;
          _context8.t4 = path;
          _context8.t5 = {
            headers: _context8.t3,
            method: "GET",
            path: _context8.t4
          };
          _context8.t6 = _context8.t2.Request.call(_context8.t2, _context8.t5);
          _context8.t7 = _context8.t1.ResponseToJson.call(_context8.t1, _context8.t6);
          _context8.next = 15;
          return _context8.t0.awrap.call(_context8.t0, _context8.t7);

        case 15:
          library = _context8.sent;
          return _context8.abrupt("return", _objectSpread({}, library, {
            meta: library.meta || {}
          }));

        case 17:
        case "end":
          return _context8.stop();
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


exports.ContentLibraryOwner = function _callee9(_ref5) {
  var libraryId;
  return _regeneratorRuntime.async(function _callee9$(_context9) {
    while (1) {
      switch (_context9.prev = _context9.next) {
        case 0:
          libraryId = _ref5.libraryId;
          ValidateLibrary(libraryId);
          _context9.t0 = this.utils;
          _context9.next = 5;
          return _regeneratorRuntime.awrap(this.ethClient.CallContractMethod({
            contractAddress: this.utils.HashToAddress(libraryId),
            methodName: "owner",
            methodArgs: []
          }));

        case 5:
          _context9.t1 = _context9.sent;
          return _context9.abrupt("return", _context9.t0.FormatAddress.call(_context9.t0, _context9.t1));

        case 7:
        case "end":
          return _context9.stop();
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


exports.LibraryContentTypes = function _callee11(_ref6) {
  var _this3 = this;

  var libraryId, typesLength, allowedTypes;
  return _regeneratorRuntime.async(function _callee11$(_context11) {
    while (1) {
      switch (_context11.prev = _context11.next) {
        case 0:
          libraryId = _ref6.libraryId;
          ValidateLibrary(libraryId);
          this.Log("Retrieving library content types for ".concat(libraryId));
          _context11.next = 5;
          return _regeneratorRuntime.awrap(this.ethClient.CallContractMethod({
            contractAddress: this.utils.HashToAddress(libraryId),
            methodName: "contentTypesLength",
            methodArgs: []
          }));

        case 5:
          typesLength = _context11.sent.toNumber();
          this.Log("".concat(typesLength, " types")); // No allowed types set - any type accepted

          if (!(typesLength === 0)) {
            _context11.next = 9;
            break;
          }

          return _context11.abrupt("return", {});

        case 9:
          // Get the list of allowed content type addresses
          allowedTypes = {};
          _context11.next = 12;
          return _regeneratorRuntime.awrap(Promise.all(Array.from(new Array(typesLength), function _callee10(_, i) {
            var typeAddress, typeId;
            return _regeneratorRuntime.async(function _callee10$(_context10) {
              while (1) {
                switch (_context10.prev = _context10.next) {
                  case 0:
                    _context10.next = 2;
                    return _regeneratorRuntime.awrap(_this3.ethClient.CallContractMethod({
                      contractAddress: _this3.utils.HashToAddress(libraryId),
                      methodName: "contentTypes",
                      methodArgs: [i]
                    }));

                  case 2:
                    typeAddress = _context10.sent;
                    typeId = _this3.utils.AddressToObjectId(typeAddress);
                    _context10.next = 6;
                    return _regeneratorRuntime.awrap(_this3.ContentType({
                      typeId: typeId
                    }));

                  case 6:
                    allowedTypes[typeId] = _context10.sent;

                  case 7:
                  case "end":
                    return _context10.stop();
                }
              }
            });
          })));

        case 12:
          this.Log(allowedTypes);
          return _context11.abrupt("return", allowedTypes);

        case 14:
        case "end":
          return _context11.stop();
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


exports.ContentObjects = function _callee12(_ref7) {
  var libraryId, _ref7$filterOptions, filterOptions, path, queryParams, filterTypeMap, addFilter;

  return _regeneratorRuntime.async(function _callee12$(_context12) {
    while (1) {
      switch (_context12.prev = _context12.next) {
        case 0:
          libraryId = _ref7.libraryId, _ref7$filterOptions = _ref7.filterOptions, filterOptions = _ref7$filterOptions === void 0 ? {} : _ref7$filterOptions;
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

          addFilter = function addFilter(_ref8) {
            var key = _ref8.key,
                type = _ref8.type,
                filter = _ref8.filter;
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
          _context12.t0 = _regeneratorRuntime;
          _context12.t1 = this.utils;
          _context12.t2 = this.HttpClient;
          _context12.next = 21;
          return _regeneratorRuntime.awrap(this.authClient.AuthorizationHeader({
            libraryId: libraryId
          }));

        case 21:
          _context12.t3 = _context12.sent;
          _context12.t4 = path;
          _context12.t5 = queryParams;
          _context12.t6 = {
            headers: _context12.t3,
            method: "GET",
            path: _context12.t4,
            queryParams: _context12.t5
          };
          _context12.t7 = _context12.t2.Request.call(_context12.t2, _context12.t6);
          _context12.t8 = _context12.t1.ResponseToJson.call(_context12.t1, _context12.t7);
          _context12.next = 29;
          return _context12.t0.awrap.call(_context12.t0, _context12.t8);

        case 29:
          return _context12.abrupt("return", _context12.sent);

        case 30:
        case "end":
          return _context12.stop();
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


exports.ContentObject = function _callee13(_ref9) {
  var libraryId, objectId, versionHash, path;
  return _regeneratorRuntime.async(function _callee13$(_context13) {
    while (1) {
      switch (_context13.prev = _context13.next) {
        case 0:
          libraryId = _ref9.libraryId, objectId = _ref9.objectId, versionHash = _ref9.versionHash;
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
          _context13.t0 = _regeneratorRuntime;
          _context13.t1 = this.utils;
          _context13.t2 = this.HttpClient;
          _context13.next = 10;
          return _regeneratorRuntime.awrap(this.authClient.AuthorizationHeader({
            libraryId: libraryId,
            objectId: objectId,
            versionHash: versionHash
          }));

        case 10:
          _context13.t3 = _context13.sent;
          _context13.t4 = path;
          _context13.t5 = {
            headers: _context13.t3,
            method: "GET",
            path: _context13.t4
          };
          _context13.t6 = _context13.t2.Request.call(_context13.t2, _context13.t5);
          _context13.t7 = _context13.t1.ResponseToJson.call(_context13.t1, _context13.t6);
          _context13.next = 17;
          return _context13.t0.awrap.call(_context13.t0, _context13.t7);

        case 17:
          return _context13.abrupt("return", _context13.sent);

        case 18:
        case "end":
          return _context13.stop();
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


exports.ContentObjectOwner = function _callee14(_ref10) {
  var objectId;
  return _regeneratorRuntime.async(function _callee14$(_context14) {
    while (1) {
      switch (_context14.prev = _context14.next) {
        case 0:
          objectId = _ref10.objectId;
          ValidateObject(objectId);
          this.Log("Retrieving content object owner: ".concat(objectId));
          _context14.t0 = this.utils;
          _context14.next = 6;
          return _regeneratorRuntime.awrap(this.ethClient.CallContractMethod({
            contractAddress: this.utils.HashToAddress(objectId),
            methodName: "owner",
            methodArgs: []
          }));

        case 6:
          _context14.t1 = _context14.sent;
          return _context14.abrupt("return", _context14.t0.FormatAddress.call(_context14.t0, _context14.t1));

        case 8:
        case "end":
          return _context14.stop();
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


exports.ContentObjectLibraryId = function _callee15(_ref11) {
  var objectId, versionHash;
  return _regeneratorRuntime.async(function _callee15$(_context15) {
    while (1) {
      switch (_context15.prev = _context15.next) {
        case 0:
          objectId = _ref11.objectId, versionHash = _ref11.versionHash;
          versionHash ? ValidateVersion(versionHash) : ValidateObject(objectId);

          if (versionHash) {
            objectId = this.utils.DecodeVersionHash(versionHash).objectId;
          }

          _context15.next = 5;
          return _regeneratorRuntime.awrap(this.authClient.AccessType(objectId));

        case 5:
          _context15.t0 = _context15.sent;
          _context15.next = _context15.t0 === this.authClient.ACCESS_TYPES.LIBRARY ? 8 : _context15.t0 === this.authClient.ACCESS_TYPES.OBJECT ? 9 : 17;
          break;

        case 8:
          return _context15.abrupt("return", this.utils.AddressToLibraryId(this.utils.HashToAddress(objectId)));

        case 9:
          if (this.objectLibraryIds[objectId]) {
            _context15.next = 16;
            break;
          }

          this.Log("Retrieving content object library ID: ".concat(objectId || versionHash));
          _context15.t1 = this.utils;
          _context15.next = 14;
          return _regeneratorRuntime.awrap(this.CallContractMethod({
            contractAddress: this.utils.HashToAddress(objectId),
            methodName: "libraryAddress"
          }));

        case 14:
          _context15.t2 = _context15.sent;
          this.objectLibraryIds[objectId] = _context15.t1.AddressToLibraryId.call(_context15.t1, _context15.t2);

        case 16:
          return _context15.abrupt("return", this.objectLibraryIds[objectId]);

        case 17:
          return _context15.abrupt("return", this.contentSpaceLibraryId);

        case 18:
        case "end":
          return _context15.stop();
      }
    }
  }, null, this);
};

exports.ProduceMetadataLinks = function _callee18(_ref12) {
  var _this4 = this;

  var libraryId, objectId, versionHash, _ref12$path, path, metadata, _ref12$noAuth, noAuth, result;

  return _regeneratorRuntime.async(function _callee18$(_context18) {
    while (1) {
      switch (_context18.prev = _context18.next) {
        case 0:
          libraryId = _ref12.libraryId, objectId = _ref12.objectId, versionHash = _ref12.versionHash, _ref12$path = _ref12.path, path = _ref12$path === void 0 ? "/" : _ref12$path, metadata = _ref12.metadata, _ref12$noAuth = _ref12.noAuth, noAuth = _ref12$noAuth === void 0 ? true : _ref12$noAuth;

          if (!(!metadata || _typeof(metadata) !== "object")) {
            _context18.next = 3;
            break;
          }

          return _context18.abrupt("return", metadata);

        case 3:
          if (!Array.isArray(metadata)) {
            _context18.next = 7;
            break;
          }

          _context18.next = 6;
          return _regeneratorRuntime.awrap(this.utils.LimitedMap(5, metadata, function _callee16(entry, i) {
            return _regeneratorRuntime.async(function _callee16$(_context16) {
              while (1) {
                switch (_context16.prev = _context16.next) {
                  case 0:
                    _context16.next = 2;
                    return _regeneratorRuntime.awrap(_this4.ProduceMetadataLinks({
                      libraryId: libraryId,
                      objectId: objectId,
                      versionHash: versionHash,
                      path: UrlJoin(path, i.toString()),
                      metadata: entry,
                      noAuth: noAuth
                    }));

                  case 2:
                    return _context16.abrupt("return", _context16.sent);

                  case 3:
                  case "end":
                    return _context16.stop();
                }
              }
            });
          }));

        case 6:
          return _context18.abrupt("return", _context18.sent);

        case 7:
          if (!(metadata["/"] && (metadata["/"].match(/\.\/(rep|files)\/.+/) || metadata["/"].match(/^\/?qfab\/([\w]+)\/?(rep|files)\/.+/)))) {
            _context18.next = 16;
            break;
          }

          _context18.t0 = _objectSpread;
          _context18.t1 = {};
          _context18.t2 = metadata;
          _context18.next = 13;
          return _regeneratorRuntime.awrap(this.LinkUrl({
            libraryId: libraryId,
            objectId: objectId,
            versionHash: versionHash,
            linkPath: path
          }));

        case 13:
          _context18.t3 = _context18.sent;
          _context18.t4 = {
            url: _context18.t3
          };
          return _context18.abrupt("return", (0, _context18.t0)(_context18.t1, _context18.t2, _context18.t4));

        case 16:
          result = {};
          _context18.next = 19;
          return _regeneratorRuntime.awrap(this.utils.LimitedMap(5, Object.keys(metadata), function _callee17(key) {
            return _regeneratorRuntime.async(function _callee17$(_context17) {
              while (1) {
                switch (_context17.prev = _context17.next) {
                  case 0:
                    _context17.next = 2;
                    return _regeneratorRuntime.awrap(_this4.ProduceMetadataLinks({
                      libraryId: libraryId,
                      objectId: objectId,
                      versionHash: versionHash,
                      path: UrlJoin(path, key),
                      metadata: metadata[key],
                      noAuth: noAuth
                    }));

                  case 2:
                    result[key] = _context17.sent;

                  case 3:
                  case "end":
                    return _context17.stop();
                }
              }
            });
          }));

        case 19:
          return _context18.abrupt("return", result);

        case 20:
        case "end":
          return _context18.stop();
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


exports.ContentObjectMetadata = function _callee19(_ref13) {
  var libraryId, objectId, versionHash, writeToken, _ref13$metadataSubtre, metadataSubtree, _ref13$resolveLinks, resolveLinks, _ref13$resolveInclude, resolveIncludeSource, _ref13$produceLinkUrl, produceLinkUrls, path, metadata, visibility, _noAuth;

  return _regeneratorRuntime.async(function _callee19$(_context19) {
    while (1) {
      switch (_context19.prev = _context19.next) {
        case 0:
          libraryId = _ref13.libraryId, objectId = _ref13.objectId, versionHash = _ref13.versionHash, writeToken = _ref13.writeToken, _ref13$metadataSubtre = _ref13.metadataSubtree, metadataSubtree = _ref13$metadataSubtre === void 0 ? "/" : _ref13$metadataSubtre, _ref13$resolveLinks = _ref13.resolveLinks, resolveLinks = _ref13$resolveLinks === void 0 ? false : _ref13$resolveLinks, _ref13$resolveInclude = _ref13.resolveIncludeSource, resolveIncludeSource = _ref13$resolveInclude === void 0 ? false : _ref13$resolveInclude, _ref13$produceLinkUrl = _ref13.produceLinkUrls, produceLinkUrls = _ref13$produceLinkUrl === void 0 ? false : _ref13$produceLinkUrl;
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
          _context19.prev = 5;
          _context19.next = 8;
          return _regeneratorRuntime.awrap(this.Visibility({
            id: objectId
          }));

        case 8:
          visibility = _context19.sent;
          _noAuth = visibility >= 10 || (metadataSubtree || "").replace(/^\/+/, "").startsWith("public") && visibility >= 1;
          _context19.t0 = _regeneratorRuntime;
          _context19.t1 = this.utils;
          _context19.t2 = this.HttpClient;
          _context19.next = 15;
          return _regeneratorRuntime.awrap(this.authClient.AuthorizationHeader({
            libraryId: libraryId,
            objectId: objectId,
            versionHash: versionHash,
            noAuth: _noAuth
          }));

        case 15:
          _context19.t3 = _context19.sent;
          _context19.t4 = {
            resolve: resolveLinks,
            resolve_include_source: resolveIncludeSource
          };
          _context19.t5 = path;
          _context19.t6 = {
            headers: _context19.t3,
            queryParams: _context19.t4,
            method: "GET",
            path: _context19.t5
          };
          _context19.t7 = _context19.t2.Request.call(_context19.t2, _context19.t6);
          _context19.t8 = _context19.t1.ResponseToJson.call(_context19.t1, _context19.t7);
          _context19.next = 23;
          return _context19.t0.awrap.call(_context19.t0, _context19.t8);

        case 23:
          metadata = _context19.sent;
          _context19.next = 31;
          break;

        case 26:
          _context19.prev = 26;
          _context19.t9 = _context19["catch"](5);

          if (!(_context19.t9.status !== 404)) {
            _context19.next = 30;
            break;
          }

          throw _context19.t9;

        case 30:
          metadata = metadataSubtree === "/" ? {} : undefined;

        case 31:
          if (produceLinkUrls) {
            _context19.next = 33;
            break;
          }

          return _context19.abrupt("return", metadata);

        case 33:
          _context19.next = 35;
          return _regeneratorRuntime.awrap(this.ProduceMetadataLinks({
            libraryId: libraryId,
            objectId: objectId,
            versionHash: versionHash,
            path: metadataSubtree,
            metadata: metadata,
            noAuth: noAuth
          }));

        case 35:
          return _context19.abrupt("return", _context19.sent);

        case 36:
        case "end":
          return _context19.stop();
      }
    }
  }, null, this, [[5, 26]]);
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


exports.ContentObjectVersions = function _callee20(_ref14) {
  var libraryId, objectId, path;
  return _regeneratorRuntime.async(function _callee20$(_context20) {
    while (1) {
      switch (_context20.prev = _context20.next) {
        case 0:
          libraryId = _ref14.libraryId, objectId = _ref14.objectId;
          ValidateParameters({
            libraryId: libraryId,
            objectId: objectId
          });
          this.Log("Retrieving content object versions: ".concat(libraryId || "", " ").concat(objectId));
          path = UrlJoin("qid", objectId);
          _context20.t0 = this.utils;
          _context20.t1 = this.HttpClient;
          _context20.next = 8;
          return _regeneratorRuntime.awrap(this.authClient.AuthorizationHeader({
            libraryId: libraryId,
            objectId: objectId
          }));

        case 8:
          _context20.t2 = _context20.sent;
          _context20.t3 = path;
          _context20.t4 = {
            headers: _context20.t2,
            method: "GET",
            path: _context20.t3
          };
          _context20.t5 = _context20.t1.Request.call(_context20.t1, _context20.t4);
          return _context20.abrupt("return", _context20.t0.ResponseToJson.call(_context20.t0, _context20.t5));

        case 13:
        case "end":
          return _context20.stop();
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


exports.LatestVersionHash = function _callee21(_ref15) {
  var objectId, versionHash;
  return _regeneratorRuntime.async(function _callee21$(_context21) {
    while (1) {
      switch (_context21.prev = _context21.next) {
        case 0:
          objectId = _ref15.objectId, versionHash = _ref15.versionHash;

          if (versionHash) {
            objectId = this.utils.DecodeVersionHash(versionHash).objectId;
          }

          ValidateObject(objectId);
          _context21.next = 5;
          return _regeneratorRuntime.awrap(this.CallContractMethod({
            contractAddress: this.utils.HashToAddress(objectId),
            methodName: "objectHash"
          }));

        case 5:
          return _context21.abrupt("return", _context21.sent);

        case 6:
        case "end":
          return _context21.stop();
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


exports.AvailableDRMs = function _callee22() {
  var availableDRMs, config;
  return _regeneratorRuntime.async(function _callee22$(_context22) {
    while (1) {
      switch (_context22.prev = _context22.next) {
        case 0:
          availableDRMs = ["clear", "aes-128"];

          if (window) {
            _context22.next = 3;
            break;
          }

          return _context22.abrupt("return", availableDRMs);

        case 3:
          if (!(typeof window.navigator.requestMediaKeySystemAccess !== "function")) {
            _context22.next = 5;
            break;
          }

          return _context22.abrupt("return", availableDRMs);

        case 5:
          _context22.prev = 5;
          config = [{
            initDataTypes: ["cenc"],
            audioCapabilities: [{
              contentType: "audio/mp4;codecs=\"mp4a.40.2\""
            }],
            videoCapabilities: [{
              contentType: "video/mp4;codecs=\"avc1.42E01E\""
            }]
          }];
          _context22.next = 9;
          return _regeneratorRuntime.awrap(navigator.requestMediaKeySystemAccess("com.widevine.alpha", config));

        case 9:
          availableDRMs.push("widevine"); // eslint-disable-next-line no-empty

          _context22.next = 14;
          break;

        case 12:
          _context22.prev = 12;
          _context22.t0 = _context22["catch"](5);

        case 14:
          return _context22.abrupt("return", availableDRMs);

        case 15:
        case "end":
          return _context22.stop();
      }
    }
  }, null, null, [[5, 12]]);
};

exports.AudienceData = function (_ref16) {
  var objectId = _ref16.objectId,
      versionHash = _ref16.versionHash,
      _ref16$protocols = _ref16.protocols,
      protocols = _ref16$protocols === void 0 ? [] : _ref16$protocols,
      _ref16$drms = _ref16.drms,
      drms = _ref16$drms === void 0 ? [] : _ref16$drms;
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


exports.PlayoutOptions = function _callee23(_ref17) {
  var objectId, versionHash, linkPath, _ref17$protocols, protocols, _ref17$offering, offering, _ref17$drms, drms, _ref17$hlsjsProfile, hlsjsProfile, libraryId, path, linkTargetLibraryId, linkTargetId, linkTargetHash, audienceData, queryParams, playoutOptions, playoutMap, i, option, protocol, drm, playoutPath, licenseServers, protocolMatch, drmMatch;

  return _regeneratorRuntime.async(function _callee23$(_context23) {
    while (1) {
      switch (_context23.prev = _context23.next) {
        case 0:
          objectId = _ref17.objectId, versionHash = _ref17.versionHash, linkPath = _ref17.linkPath, _ref17$protocols = _ref17.protocols, protocols = _ref17$protocols === void 0 ? ["dash", "hls"] : _ref17$protocols, _ref17$offering = _ref17.offering, offering = _ref17$offering === void 0 ? "default" : _ref17$offering, _ref17$drms = _ref17.drms, drms = _ref17$drms === void 0 ? [] : _ref17$drms, _ref17$hlsjsProfile = _ref17.hlsjsProfile, hlsjsProfile = _ref17$hlsjsProfile === void 0 ? true : _ref17$hlsjsProfile;
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

          _context23.next = 7;
          return _regeneratorRuntime.awrap(this.ContentObjectLibraryId({
            objectId: objectId
          }));

        case 7:
          libraryId = _context23.sent;

          if (!linkPath) {
            _context23.next = 19;
            break;
          }

          _context23.next = 11;
          return _regeneratorRuntime.awrap(this.LinkTarget({
            libraryId: libraryId,
            objectId: objectId,
            versionHash: versionHash,
            linkPath: linkPath
          }));

        case 11:
          linkTargetHash = _context23.sent;
          linkTargetId = this.utils.DecodeVersionHash(linkTargetHash).objectId;
          _context23.next = 15;
          return _regeneratorRuntime.awrap(this.ContentObjectLibraryId({
            objectId: linkTargetId
          }));

        case 15:
          linkTargetLibraryId = _context23.sent;
          path = UrlJoin("q", versionHash || objectId, "meta", linkPath);
          _context23.next = 20;
          break;

        case 19:
          path = UrlJoin("q", versionHash || objectId, "rep", "playout", offering, "options.json");

        case 20:
          _context23.t0 = this;
          _context23.t1 = linkTargetId || objectId;
          _context23.t2 = linkTargetHash || versionHash;

          if (_context23.t2) {
            _context23.next = 27;
            break;
          }

          _context23.next = 26;
          return _regeneratorRuntime.awrap(this.LatestVersionHash({
            objectId: objectId
          }));

        case 26:
          _context23.t2 = _context23.sent;

        case 27:
          _context23.t3 = _context23.t2;
          _context23.t4 = protocols;
          _context23.t5 = drms;
          _context23.t6 = {
            objectId: _context23.t1,
            versionHash: _context23.t3,
            protocols: _context23.t4,
            drms: _context23.t5
          };
          audienceData = _context23.t0.AudienceData.call(_context23.t0, _context23.t6);
          _context23.next = 34;
          return _regeneratorRuntime.awrap(this.authClient.AuthorizationToken({
            libraryId: linkTargetLibraryId || libraryId,
            objectId: linkTargetId || objectId,
            channelAuth: true,
            oauthToken: this.oauthToken,
            audienceData: audienceData
          }));

        case 34:
          _context23.t7 = _context23.sent;
          queryParams = {
            authorization: _context23.t7
          };

          if (linkPath) {
            queryParams.resolve = true;
          }

          _context23.t8 = Object;
          _context23.next = 40;
          return _regeneratorRuntime.awrap(this.utils.ResponseToJson(this.HttpClient.Request({
            path: path,
            method: "GET",
            queryParams: queryParams
          })));

        case 40:
          _context23.t9 = _context23.sent;
          playoutOptions = _context23.t8.values.call(_context23.t8, _context23.t9);
          playoutMap = {};
          i = 0;

        case 44:
          if (!(i < playoutOptions.length)) {
            _context23.next = 76;
            break;
          }

          option = playoutOptions[i];
          protocol = option.properties.protocol;
          drm = option.properties.drm; // Remove authorization parameter from playout path - it's re-added by Rep

          playoutPath = option.uri.split("?")[0];
          licenseServers = option.properties.license_servers; // Create full playout URLs for this protocol / drm combo

          _context23.t10 = _objectSpread;
          _context23.t11 = {};
          _context23.t12 = playoutMap[protocol] || {};
          _context23.t13 = _objectSpread;
          _context23.t14 = {};
          _context23.t15 = (playoutMap[protocol] || {}).playoutMethods || {};
          _context23.t16 = _defineProperty;
          _context23.t17 = {};
          _context23.t18 = drm || "clear";
          _context23.next = 61;
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
          _context23.t19 = _context23.sent;
          _context23.t20 = drm ? _defineProperty({}, drm, {
            licenseServers: licenseServers
          }) : undefined;
          _context23.t21 = {
            playoutUrl: _context23.t19,
            drms: _context23.t20
          };
          _context23.t22 = (0, _context23.t16)(_context23.t17, _context23.t18, _context23.t21);
          _context23.t23 = (0, _context23.t13)(_context23.t14, _context23.t15, _context23.t22);
          _context23.t24 = {
            playoutMethods: _context23.t23
          };
          playoutMap[protocol] = (0, _context23.t10)(_context23.t11, _context23.t12, _context23.t24);
          // Exclude any options that do not satisfy the specified protocols and/or DRMs
          protocolMatch = protocols.includes(protocol);
          drmMatch = drms.includes(drm || "clear") || drms.length === 0 && !drm;

          if (!(!protocolMatch || !drmMatch)) {
            _context23.next = 72;
            break;
          }

          return _context23.abrupt("continue", 73);

        case 72:
          // This protocol / DRM satisfies the specifications (prefer DRM over clear, if available)
          if (!playoutMap[protocol].playoutUrl || drm && drm !== "clear") {
            playoutMap[protocol].playoutUrl = playoutMap[protocol].playoutMethods[drm || "clear"].playoutUrl;
            playoutMap[protocol].drms = playoutMap[protocol].playoutMethods[drm || "clear"].drms;
          }

        case 73:
          i++;
          _context23.next = 44;
          break;

        case 76:
          this.Log(playoutMap);
          return _context23.abrupt("return", playoutMap);

        case 78:
        case "end":
          return _context23.stop();
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


exports.BitmovinPlayoutOptions = function _callee24(_ref19) {
  var objectId, versionHash, linkPath, _ref19$protocols, protocols, _ref19$drms, drms, _ref19$offering, offering, playoutOptions, linkTargetId, linkTargetHash, libraryId, authToken, config;

  return _regeneratorRuntime.async(function _callee24$(_context24) {
    while (1) {
      switch (_context24.prev = _context24.next) {
        case 0:
          objectId = _ref19.objectId, versionHash = _ref19.versionHash, linkPath = _ref19.linkPath, _ref19$protocols = _ref19.protocols, protocols = _ref19$protocols === void 0 ? ["dash", "hls"] : _ref19$protocols, _ref19$drms = _ref19.drms, drms = _ref19$drms === void 0 ? [] : _ref19$drms, _ref19$offering = _ref19.offering, offering = _ref19$offering === void 0 ? "default" : _ref19$offering;
          versionHash ? ValidateVersion(versionHash) : ValidateObject(objectId);

          if (!objectId) {
            objectId = this.utils.DecodeVersionHash(versionHash).objectId;
          }

          _context24.next = 5;
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
          playoutOptions = _context24.sent;
          delete playoutOptions.playoutMethods;

          if (!linkPath) {
            _context24.next = 15;
            break;
          }

          _context24.next = 10;
          return _regeneratorRuntime.awrap(this.ContentObjectLibraryId({
            objectId: objectId,
            versionHash: versionHash
          }));

        case 10:
          libraryId = _context24.sent;
          _context24.next = 13;
          return _regeneratorRuntime.awrap(this.LinkTarget({
            libraryId: libraryId,
            objectId: objectId,
            versionHash: versionHash,
            linkPath: linkPath
          }));

        case 13:
          linkTargetHash = _context24.sent;
          linkTargetId = this.utils.DecodeVersionHash(linkTargetHash).objectId;

        case 15:
          _context24.next = 17;
          return _regeneratorRuntime.awrap(this.authClient.AuthorizationToken({
            objectId: linkTargetId || objectId,
            channelAuth: true,
            oauthToken: this.oauthToken
          }));

        case 17:
          authToken = _context24.sent;
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
          return _context24.abrupt("return", config);

        case 21:
        case "end":
          return _context24.stop();
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


exports.CallBitcodeMethod = function _callee25(_ref20) {
  var libraryId, objectId, versionHash, writeToken, method, _ref20$queryParams, queryParams, _ref20$body, body, _ref20$headers, headers, _ref20$constant, constant, _ref20$format, format, path, authHeader;

  return _regeneratorRuntime.async(function _callee25$(_context25) {
    while (1) {
      switch (_context25.prev = _context25.next) {
        case 0:
          libraryId = _ref20.libraryId, objectId = _ref20.objectId, versionHash = _ref20.versionHash, writeToken = _ref20.writeToken, method = _ref20.method, _ref20$queryParams = _ref20.queryParams, queryParams = _ref20$queryParams === void 0 ? {} : _ref20$queryParams, _ref20$body = _ref20.body, body = _ref20$body === void 0 ? {} : _ref20$body, _ref20$headers = _ref20.headers, headers = _ref20$headers === void 0 ? {} : _ref20$headers, _ref20$constant = _ref20.constant, constant = _ref20$constant === void 0 ? true : _ref20$constant, _ref20$format = _ref20.format, format = _ref20$format === void 0 ? "json" : _ref20$format;
          ValidateParameters({
            libraryId: libraryId,
            objectId: objectId,
            versionHash: versionHash
          });

          if (method) {
            _context25.next = 4;
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
            _context25.next = 12;
            break;
          }

          _context25.next = 11;
          return _regeneratorRuntime.awrap(this.authClient.AuthorizationHeader({
            libraryId: libraryId,
            objectId: objectId,
            update: !constant
          }));

        case 11:
          headers.Authorization = _context25.sent.Authorization;

        case 12:
          this.Log("Calling bitcode method: ".concat(libraryId || "", " ").concat(objectId || versionHash, " ").concat(writeToken || "", "\n      ").concat(constant ? "GET" : "POST", " ").concat(path, "\n      Query Params:\n      ").concat(queryParams, "\n      Body:\n      ").concat(body, "\n      Headers\n      ").concat(headers));
          _context25.t0 = this.utils;
          _context25.t1 = format;
          _context25.next = 17;
          return _regeneratorRuntime.awrap(this.HttpClient.Request({
            body: body,
            headers: headers,
            method: constant ? "GET" : "POST",
            path: path,
            queryParams: queryParams,
            failover: false
          }));

        case 17:
          _context25.t2 = _context25.sent;
          return _context25.abrupt("return", _context25.t0.ResponseToFormat.call(_context25.t0, _context25.t1, _context25.t2));

        case 19:
        case "end":
          return _context25.stop();
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


exports.Rep = function _callee26(_ref21) {
  var libraryId, objectId, versionHash, rep, _ref21$queryParams, queryParams, _ref21$channelAuth, channelAuth, _ref21$noAuth, noAuth, _ref21$noCache, noCache;

  return _regeneratorRuntime.async(function _callee26$(_context26) {
    while (1) {
      switch (_context26.prev = _context26.next) {
        case 0:
          libraryId = _ref21.libraryId, objectId = _ref21.objectId, versionHash = _ref21.versionHash, rep = _ref21.rep, _ref21$queryParams = _ref21.queryParams, queryParams = _ref21$queryParams === void 0 ? {} : _ref21$queryParams, _ref21$channelAuth = _ref21.channelAuth, channelAuth = _ref21$channelAuth === void 0 ? false : _ref21$channelAuth, _ref21$noAuth = _ref21.noAuth, noAuth = _ref21$noAuth === void 0 ? false : _ref21$noAuth, _ref21$noCache = _ref21.noCache, noCache = _ref21$noCache === void 0 ? false : _ref21$noCache;
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
            rep: rep,
            queryParams: queryParams,
            channelAuth: channelAuth,
            noAuth: noAuth,
            noCache: noCache
          }));

        case 5:
        case "end":
          return _context26.stop();
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


exports.PublicRep = function _callee27(_ref22) {
  var libraryId, objectId, versionHash, rep, _ref22$queryParams, queryParams;

  return _regeneratorRuntime.async(function _callee27$(_context27) {
    while (1) {
      switch (_context27.prev = _context27.next) {
        case 0:
          libraryId = _ref22.libraryId, objectId = _ref22.objectId, versionHash = _ref22.versionHash, rep = _ref22.rep, _ref22$queryParams = _ref22.queryParams, queryParams = _ref22$queryParams === void 0 ? {} : _ref22$queryParams;
          ValidateParameters({
            libraryId: libraryId,
            objectId: objectId,
            versionHash: versionHash
          });

          if (rep) {
            _context27.next = 4;
            break;
          }

          throw "Rep not specified";

        case 4:
          return _context27.abrupt("return", this.FabricUrl({
            libraryId: libraryId,
            objectId: objectId,
            versionHash: versionHash,
            publicRep: rep,
            queryParams: queryParams,
            noAuth: true
          }));

        case 5:
        case "end":
          return _context27.stop();
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


exports.FabricUrl = function _callee28(_ref23) {
  var libraryId, objectId, versionHash, writeToken, partHash, rep, publicRep, call, _ref23$queryParams, queryParams, _ref23$channelAuth, channelAuth, _ref23$noAuth, noAuth, _ref23$noCache, noCache, path;

  return _regeneratorRuntime.async(function _callee28$(_context28) {
    while (1) {
      switch (_context28.prev = _context28.next) {
        case 0:
          libraryId = _ref23.libraryId, objectId = _ref23.objectId, versionHash = _ref23.versionHash, writeToken = _ref23.writeToken, partHash = _ref23.partHash, rep = _ref23.rep, publicRep = _ref23.publicRep, call = _ref23.call, _ref23$queryParams = _ref23.queryParams, queryParams = _ref23$queryParams === void 0 ? {} : _ref23$queryParams, _ref23$channelAuth = _ref23.channelAuth, channelAuth = _ref23$channelAuth === void 0 ? false : _ref23$channelAuth, _ref23$noAuth = _ref23.noAuth, noAuth = _ref23$noAuth === void 0 ? false : _ref23$noAuth, _ref23$noCache = _ref23.noCache, noCache = _ref23$noCache === void 0 ? false : _ref23$noCache;

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
          _context28.next = 7;
          return _regeneratorRuntime.awrap(this.authClient.AuthorizationToken({
            libraryId: libraryId,
            objectId: objectId,
            versionHash: versionHash,
            channelAuth: channelAuth,
            noAuth: noAuth,
            noCache: noCache
          }));

        case 7:
          queryParams.authorization = _context28.sent;
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

          return _context28.abrupt("return", this.HttpClient.URL({
            path: path,
            queryParams: queryParams
          }));

        case 12:
        case "end":
          return _context28.stop();
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


exports.FileUrl = function _callee29(_ref24) {
  var libraryId, objectId, versionHash, writeToken, filePath, _ref24$queryParams, queryParams, _ref24$noCache, noCache, path, authorizationToken;

  return _regeneratorRuntime.async(function _callee29$(_context29) {
    while (1) {
      switch (_context29.prev = _context29.next) {
        case 0:
          libraryId = _ref24.libraryId, objectId = _ref24.objectId, versionHash = _ref24.versionHash, writeToken = _ref24.writeToken, filePath = _ref24.filePath, _ref24$queryParams = _ref24.queryParams, queryParams = _ref24$queryParams === void 0 ? {} : _ref24$queryParams, _ref24$noCache = _ref24.noCache, noCache = _ref24$noCache === void 0 ? false : _ref24$noCache;
          ValidateParameters({
            libraryId: libraryId,
            objectId: objectId,
            versionHash: versionHash
          });

          if (filePath) {
            _context29.next = 4;
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

          _context29.next = 8;
          return _regeneratorRuntime.awrap(this.authClient.AuthorizationToken({
            libraryId: libraryId,
            objectId: objectId,
            noCache: noCache
          }));

        case 8:
          authorizationToken = _context29.sent;
          return _context29.abrupt("return", this.HttpClient.URL({
            path: path,
            queryParams: _objectSpread({}, queryParams, {
              authorization: authorizationToken
            })
          }));

        case 10:
        case "end":
          return _context29.stop();
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


exports.ContentObjectImageUrl = function _callee30(_ref25) {
  var libraryId, objectId, versionHash, imageMetadata;
  return _regeneratorRuntime.async(function _callee30$(_context30) {
    while (1) {
      switch (_context30.prev = _context30.next) {
        case 0:
          libraryId = _ref25.libraryId, objectId = _ref25.objectId, versionHash = _ref25.versionHash;
          ValidateParameters({
            libraryId: libraryId,
            objectId: objectId,
            versionHash: versionHash
          });

          if (versionHash) {
            _context30.next = 6;
            break;
          }

          _context30.next = 5;
          return _regeneratorRuntime.awrap(this.LatestVersionHash({
            objectId: objectId
          }));

        case 5:
          versionHash = _context30.sent;

        case 6:
          this.Log("Retrieving content object image url: ".concat(libraryId, " ").concat(objectId, " ").concat(versionHash));

          if (this.objectImageUrls[versionHash]) {
            _context30.next = 17;
            break;
          }

          _context30.next = 10;
          return _regeneratorRuntime.awrap(this.ContentObjectMetadata({
            versionHash: versionHash,
            metadataSubtree: "public/display_image"
          }));

        case 10:
          imageMetadata = _context30.sent;

          if (imageMetadata) {
            _context30.next = 14;
            break;
          }

          this.Log("No image url set: ".concat(libraryId, " ").concat(objectId, " ").concat(versionHash));
          return _context30.abrupt("return");

        case 14:
          _context30.next = 16;
          return _regeneratorRuntime.awrap(this.LinkUrl({
            versionHash: versionHash,
            linkPath: "public/display_image"
          }));

        case 16:
          this.objectImageUrls[versionHash] = _context30.sent;

        case 17:
          return _context30.abrupt("return", this.objectImageUrls[versionHash]);

        case 18:
        case "end":
          return _context30.stop();
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


exports.ContentObjectGraph = function _callee32(_ref26) {
  var _this5 = this;

  var libraryId, objectId, versionHash, _ref26$autoUpdate, autoUpdate, select, path, errorInfo, cycles, info;

  return _regeneratorRuntime.async(function _callee32$(_context32) {
    while (1) {
      switch (_context32.prev = _context32.next) {
        case 0:
          libraryId = _ref26.libraryId, objectId = _ref26.objectId, versionHash = _ref26.versionHash, _ref26$autoUpdate = _ref26.autoUpdate, autoUpdate = _ref26$autoUpdate === void 0 ? false : _ref26$autoUpdate, select = _ref26.select;
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
          _context32.prev = 5;
          _context32.t0 = _regeneratorRuntime;
          _context32.t1 = this.utils;
          _context32.t2 = this.HttpClient;
          _context32.next = 11;
          return _regeneratorRuntime.awrap(this.authClient.AuthorizationHeader({
            libraryId: libraryId,
            objectId: objectId,
            versionHash: versionHash,
            noAuth: true
          }));

        case 11:
          _context32.t3 = _context32.sent;
          _context32.t4 = {
            auto_update: autoUpdate,
            select: select
          };
          _context32.t5 = path;
          _context32.t6 = {
            headers: _context32.t3,
            queryParams: _context32.t4,
            method: "GET",
            path: _context32.t5
          };
          _context32.t7 = _context32.t2.Request.call(_context32.t2, _context32.t6);
          _context32.t8 = _context32.t1.ResponseToJson.call(_context32.t1, _context32.t7);
          _context32.next = 19;
          return _context32.t0.awrap.call(_context32.t0, _context32.t8);

        case 19:
          return _context32.abrupt("return", _context32.sent);

        case 22:
          _context32.prev = 22;
          _context32.t9 = _context32["catch"](5);
          _context32.prev = 24;
          cycles = _context32.t9.body.errors[0].cause.cause.cause.cycle;

          if (!(!cycles || cycles.length === 0)) {
            _context32.next = 28;
            break;
          }

          throw _context32.t9;

        case 28:
          info = {};
          _context32.next = 31;
          return _regeneratorRuntime.awrap(Promise.all(cycles.map(function _callee31(cycleHash) {
            var cycleId, name;
            return _regeneratorRuntime.async(function _callee31$(_context31) {
              while (1) {
                switch (_context31.prev = _context31.next) {
                  case 0:
                    if (!info[cycleHash]) {
                      _context31.next = 2;
                      break;
                    }

                    return _context31.abrupt("return");

                  case 2:
                    cycleId = _this5.utils.DecodeVersionHash(cycleHash).objectId;
                    _context31.next = 5;
                    return _regeneratorRuntime.awrap(_this5.ContentObjectMetadata({
                      versionHash: cycleHash,
                      metadataSubtree: "public/asset_metadata/display_title"
                    }));

                  case 5:
                    _context31.t2 = _context31.sent;

                    if (_context31.t2) {
                      _context31.next = 10;
                      break;
                    }

                    _context31.next = 9;
                    return _regeneratorRuntime.awrap(_this5.ContentObjectMetadata({
                      versionHash: cycleHash,
                      metadataSubtree: "public/name"
                    }));

                  case 9:
                    _context31.t2 = _context31.sent;

                  case 10:
                    _context31.t1 = _context31.t2;

                    if (_context31.t1) {
                      _context31.next = 15;
                      break;
                    }

                    _context31.next = 14;
                    return _regeneratorRuntime.awrap(_this5.ContentObjectMetadata({
                      versionHash: cycleHash,
                      metadataSubtree: "name"
                    }));

                  case 14:
                    _context31.t1 = _context31.sent;

                  case 15:
                    _context31.t0 = _context31.t1;

                    if (_context31.t0) {
                      _context31.next = 18;
                      break;
                    }

                    _context31.t0 = cycleId;

                  case 18:
                    name = _context31.t0;
                    info[cycleHash] = {
                      name: name,
                      objectId: cycleId
                    };

                  case 20:
                  case "end":
                    return _context31.stop();
                }
              }
            });
          })));

        case 31:
          errorInfo = cycles.map(function (cycleHash) {
            return "".concat(info[cycleHash].name, " (").concat(info[cycleHash].objectId, ")");
          });
          _context32.next = 37;
          break;

        case 34:
          _context32.prev = 34;
          _context32.t10 = _context32["catch"](24);
          throw _context32.t9;

        case 37:
          throw new Error("Cycle found in links: ".concat(errorInfo.join(" -> ")));

        case 38:
        case "end":
          return _context32.stop();
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


exports.LinkTarget = function _callee33(_ref27) {
  var libraryId, objectId, versionHash, linkPath, linkInfo, targetHash;
  return _regeneratorRuntime.async(function _callee33$(_context33) {
    while (1) {
      switch (_context33.prev = _context33.next) {
        case 0:
          libraryId = _ref27.libraryId, objectId = _ref27.objectId, versionHash = _ref27.versionHash, linkPath = _ref27.linkPath;

          if (versionHash) {
            objectId = this.utils.DecodeVersionHash(versionHash).objectId;
          }

          _context33.next = 4;
          return _regeneratorRuntime.awrap(this.ContentObjectMetadata({
            libraryId: libraryId,
            objectId: objectId,
            versionHash: versionHash,
            metadataSubtree: UrlJoin(linkPath),
            resolveLinks: false
          }));

        case 4:
          linkInfo = _context33.sent;

          if (!(!linkInfo || !linkInfo["/"])) {
            _context33.next = 7;
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
            _context33.next = 13;
            break;
          }

          return _context33.abrupt("return", targetHash);

        case 13:
          if (!versionHash) {
            _context33.next = 15;
            break;
          }

          return _context33.abrupt("return", versionHash);

        case 15:
          _context33.next = 17;
          return _regeneratorRuntime.awrap(this.LatestVersionHash({
            objectId: objectId
          }));

        case 17:
          return _context33.abrupt("return", _context33.sent);

        case 18:
        case "end":
          return _context33.stop();
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


exports.LinkUrl = function _callee34(_ref28) {
  var libraryId, objectId, versionHash, linkPath, mimeType, _ref28$queryParams, queryParams, _ref28$noCache, noCache, path;

  return _regeneratorRuntime.async(function _callee34$(_context34) {
    while (1) {
      switch (_context34.prev = _context34.next) {
        case 0:
          libraryId = _ref28.libraryId, objectId = _ref28.objectId, versionHash = _ref28.versionHash, linkPath = _ref28.linkPath, mimeType = _ref28.mimeType, _ref28$queryParams = _ref28.queryParams, queryParams = _ref28$queryParams === void 0 ? {} : _ref28$queryParams, _ref28$noCache = _ref28.noCache, noCache = _ref28$noCache === void 0 ? false : _ref28$noCache;
          ValidateParameters({
            libraryId: libraryId,
            objectId: objectId,
            versionHash: versionHash
          });

          if (linkPath) {
            _context34.next = 4;
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

          _context34.t0 = _objectSpread;
          _context34.t1 = {};
          _context34.t2 = queryParams;
          _context34.next = 11;
          return _regeneratorRuntime.awrap(this.authClient.AuthorizationToken({
            libraryId: libraryId,
            objectId: objectId,
            noCache: noCache,
            noAuth: true
          }));

        case 11:
          _context34.t3 = _context34.sent;
          _context34.t4 = {
            resolve: true,
            authorization: _context34.t3
          };
          queryParams = (0, _context34.t0)(_context34.t1, _context34.t2, _context34.t4);

          if (mimeType) {
            queryParams["header-accept"] = mimeType;
          }

          return _context34.abrupt("return", this.HttpClient.URL({
            path: path,
            queryParams: queryParams
          }));

        case 16:
        case "end":
          return _context34.stop();
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


exports.LinkData = function _callee35(_ref29) {
  var libraryId, objectId, versionHash, linkPath, _ref29$format, format, linkUrl;

  return _regeneratorRuntime.async(function _callee35$(_context35) {
    while (1) {
      switch (_context35.prev = _context35.next) {
        case 0:
          libraryId = _ref29.libraryId, objectId = _ref29.objectId, versionHash = _ref29.versionHash, linkPath = _ref29.linkPath, _ref29$format = _ref29.format, format = _ref29$format === void 0 ? "json" : _ref29$format;
          _context35.next = 3;
          return _regeneratorRuntime.awrap(this.LinkUrl({
            libraryId: libraryId,
            objectId: objectId,
            versionHash: versionHash,
            linkPath: linkPath
          }));

        case 3:
          linkUrl = _context35.sent;
          _context35.t0 = this.utils;
          _context35.t1 = format;
          _context35.next = 8;
          return _regeneratorRuntime.awrap(HttpClient.Fetch(linkUrl));

        case 8:
          _context35.t2 = _context35.sent;
          return _context35.abrupt("return", _context35.t0.ResponseToFormat.call(_context35.t0, _context35.t1, _context35.t2));

        case 10:
        case "end":
          return _context35.stop();
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


exports.EncryptionConk = function _callee36(_ref30) {
  var libraryId, objectId, writeToken, owner, capKey, existingUserCap, metadata, kmsAddress, _kmsPublicKey, kmsCapKey, existingKMSCap;

  return _regeneratorRuntime.async(function _callee36$(_context36) {
    while (1) {
      switch (_context36.prev = _context36.next) {
        case 0:
          libraryId = _ref30.libraryId, objectId = _ref30.objectId, writeToken = _ref30.writeToken;
          ValidateParameters({
            libraryId: libraryId,
            objectId: objectId
          });

          if (writeToken) {
            ValidateWriteToken(writeToken);
          }

          _context36.next = 5;
          return _regeneratorRuntime.awrap(this.authClient.Owner({
            id: objectId
          }));

        case 5:
          owner = _context36.sent;

          if (this.utils.EqualAddress(owner, this.signer.address)) {
            _context36.next = 12;
            break;
          }

          if (this.reencryptionConks[objectId]) {
            _context36.next = 11;
            break;
          }

          _context36.next = 10;
          return _regeneratorRuntime.awrap(this.authClient.ReEncryptionConk({
            libraryId: libraryId,
            objectId: objectId
          }));

        case 10:
          this.reencryptionConks[objectId] = _context36.sent;

        case 11:
          return _context36.abrupt("return", this.reencryptionConks[objectId]);

        case 12:
          if (this.encryptionConks[objectId]) {
            _context36.next = 53;
            break;
          }

          capKey = "eluv.caps.iusr".concat(this.utils.AddressToHash(this.signer.address));
          _context36.next = 16;
          return _regeneratorRuntime.awrap(this.ContentObjectMetadata({
            libraryId: libraryId,
            // Cap may only exist in draft
            objectId: objectId,
            writeToken: writeToken,
            metadataSubtree: capKey
          }));

        case 16:
          existingUserCap = _context36.sent;

          if (!existingUserCap) {
            _context36.next = 23;
            break;
          }

          _context36.next = 20;
          return _regeneratorRuntime.awrap(Crypto.DecryptCap(existingUserCap, this.signer.signingKey.privateKey));

        case 20:
          this.encryptionConks[objectId] = _context36.sent;
          _context36.next = 53;
          break;

        case 23:
          _context36.next = 25;
          return _regeneratorRuntime.awrap(Crypto.GeneratePrimaryConk());

        case 25:
          this.encryptionConks[objectId] = _context36.sent;

          if (!writeToken) {
            _context36.next = 53;
            break;
          }

          metadata = {};
          _context36.next = 30;
          return _regeneratorRuntime.awrap(Crypto.EncryptConk(this.encryptionConks[objectId], this.signer.signingKey.publicKey));

        case 30:
          metadata[capKey] = _context36.sent;
          _context36.prev = 31;
          _context36.next = 34;
          return _regeneratorRuntime.awrap(this.authClient.KMSAddress({
            objectId: objectId
          }));

        case 34:
          kmsAddress = _context36.sent;
          _context36.next = 37;
          return _regeneratorRuntime.awrap(this.authClient.KMSInfo({
            objectId: objectId
          }));

        case 37:
          _kmsPublicKey = _context36.sent.publicKey;
          kmsCapKey = "eluv.caps.ikms".concat(this.utils.AddressToHash(kmsAddress));
          _context36.next = 41;
          return _regeneratorRuntime.awrap(this.ContentObjectMetadata({
            libraryId: libraryId,
            // Cap may only exist in draft
            objectId: objectId,
            writeToken: writeToken,
            metadataSubtree: kmsCapKey
          }));

        case 41:
          existingKMSCap = _context36.sent;

          if (existingKMSCap) {
            _context36.next = 46;
            break;
          }

          _context36.next = 45;
          return _regeneratorRuntime.awrap(Crypto.EncryptConk(this.encryptionConks[objectId], _kmsPublicKey));

        case 45:
          metadata[kmsCapKey] = _context36.sent;

        case 46:
          _context36.next = 51;
          break;

        case 48:
          _context36.prev = 48;
          _context36.t0 = _context36["catch"](31);
          // eslint-disable-next-line no-console
          console.error("Failed to create encryption cap for KMS with public key " + kmsPublicKey);

        case 51:
          _context36.next = 53;
          return _regeneratorRuntime.awrap(this.MergeMetadata({
            libraryId: libraryId,
            objectId: objectId,
            writeToken: writeToken,
            metadata: metadata
          }));

        case 53:
          return _context36.abrupt("return", this.encryptionConks[objectId]);

        case 54:
        case "end":
          return _context36.stop();
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


exports.Encrypt = function _callee37(_ref31) {
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
          return _regeneratorRuntime.awrap(Crypto.Encrypt(conk, chunk));

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


exports.Decrypt = function _callee38(_ref32) {
  var libraryId, objectId, writeToken, chunk, conk, data;
  return _regeneratorRuntime.async(function _callee38$(_context38) {
    while (1) {
      switch (_context38.prev = _context38.next) {
        case 0:
          libraryId = _ref32.libraryId, objectId = _ref32.objectId, writeToken = _ref32.writeToken, chunk = _ref32.chunk;
          ValidateParameters({
            libraryId: libraryId,
            objectId: objectId
          });
          _context38.next = 4;
          return _regeneratorRuntime.awrap(this.EncryptionConk({
            libraryId: libraryId,
            objectId: objectId,
            writeToken: writeToken
          }));

        case 4:
          conk = _context38.sent;
          _context38.next = 7;
          return _regeneratorRuntime.awrap(Crypto.Decrypt(conk, chunk));

        case 7:
          data = _context38.sent;
          return _context38.abrupt("return", data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength));

        case 9:
        case "end":
          return _context38.stop();
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


exports.AccessType = function _callee39(_ref33) {
  var id;
  return _regeneratorRuntime.async(function _callee39$(_context39) {
    while (1) {
      switch (_context39.prev = _context39.next) {
        case 0:
          id = _ref33.id;
          _context39.next = 3;
          return _regeneratorRuntime.awrap(this.authClient.AccessType(id));

        case 3:
          return _context39.abrupt("return", _context39.sent);

        case 4:
        case "end":
          return _context39.stop();
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


exports.AccessInfo = function _callee40(_ref34) {
  var objectId, args, info;
  return _regeneratorRuntime.async(function _callee40$(_context40) {
    while (1) {
      switch (_context40.prev = _context40.next) {
        case 0:
          objectId = _ref34.objectId, args = _ref34.args;
          ValidateObject(objectId);

          if (!args) {
            args = [0, // Access level
            [], // Custom values
            [] // Stakeholders
            ];
          }

          this.Log("Retrieving access info: ".concat(objectId));
          _context40.next = 6;
          return _regeneratorRuntime.awrap(this.ethClient.CallContractMethod({
            contractAddress: this.utils.HashToAddress(objectId),
            methodName: "getAccessInfo",
            methodArgs: args
          }));

        case 6:
          info = _context40.sent;
          this.Log(info);
          return _context40.abrupt("return", {
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
          return _context40.stop();
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


exports.AccessRequest = function _callee41(_ref35) {
  var libraryId, objectId, versionHash, _ref35$args, args, _ref35$update, update, _ref35$noCache, noCache;

  return _regeneratorRuntime.async(function _callee41$(_context41) {
    while (1) {
      switch (_context41.prev = _context41.next) {
        case 0:
          libraryId = _ref35.libraryId, objectId = _ref35.objectId, versionHash = _ref35.versionHash, _ref35$args = _ref35.args, args = _ref35$args === void 0 ? [] : _ref35$args, _ref35$update = _ref35.update, update = _ref35$update === void 0 ? false : _ref35$update, _ref35$noCache = _ref35.noCache, noCache = _ref35$noCache === void 0 ? false : _ref35$noCache;
          ValidateParameters({
            libraryId: libraryId,
            objectId: objectId,
            versionHash: versionHash
          });

          if (versionHash) {
            objectId = this.utils.DecodeVersionHash(versionHash).objectId;
          }

          _context41.next = 5;
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
          return _context41.abrupt("return", _context41.sent);

        case 6:
        case "end":
          return _context41.stop();
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


exports.GenerateStateChannelToken = function _callee42(_ref36) {
  var objectId, versionHash, _ref36$noCache, noCache, audienceData;

  return _regeneratorRuntime.async(function _callee42$(_context42) {
    while (1) {
      switch (_context42.prev = _context42.next) {
        case 0:
          objectId = _ref36.objectId, versionHash = _ref36.versionHash, _ref36$noCache = _ref36.noCache, noCache = _ref36$noCache === void 0 ? false : _ref36$noCache;
          versionHash ? ValidateVersion(versionHash) : ValidateObject(objectId);

          if (!versionHash) {
            _context42.next = 6;
            break;
          }

          objectId = this.utils.DecodeVersionHash(versionHash).objectId;
          _context42.next = 10;
          break;

        case 6:
          if (this.stateChannelAccess[objectId]) {
            _context42.next = 10;
            break;
          }

          _context42.next = 9;
          return _regeneratorRuntime.awrap(this.LatestVersionHash({
            objectId: objectId
          }));

        case 9:
          versionHash = _context42.sent;

        case 10:
          this.stateChannelAccess[objectId] = versionHash;
          audienceData = this.AudienceData({
            objectId: objectId,
            versionHash: versionHash
          });
          _context42.next = 14;
          return _regeneratorRuntime.awrap(this.authClient.AuthorizationToken({
            objectId: objectId,
            channelAuth: true,
            oauthToken: this.oauthToken,
            audienceData: audienceData,
            noCache: noCache
          }));

        case 14:
          return _context42.abrupt("return", _context42.sent);

        case 15:
        case "end":
          return _context42.stop();
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


exports.FinalizeStateChannelAccess = function _callee43(_ref37) {
  var objectId, versionHash, percentComplete, audienceData;
  return _regeneratorRuntime.async(function _callee43$(_context43) {
    while (1) {
      switch (_context43.prev = _context43.next) {
        case 0:
          objectId = _ref37.objectId, versionHash = _ref37.versionHash, percentComplete = _ref37.percentComplete;
          versionHash ? ValidateVersion(versionHash) : ValidateObject(objectId);

          if (!versionHash) {
            _context43.next = 6;
            break;
          }

          objectId = this.utils.DecodeVersionHash(versionHash).objectId;
          _context43.next = 13;
          break;

        case 6:
          if (!this.stateChannelAccess[objectId]) {
            _context43.next = 10;
            break;
          }

          versionHash = this.stateChannelAccess[objectId];
          _context43.next = 13;
          break;

        case 10:
          _context43.next = 12;
          return _regeneratorRuntime.awrap(this.LatestVersionHash({
            objectId: objectId
          }));

        case 12:
          versionHash = _context43.sent;

        case 13:
          this.stateChannelAccess[objectId] = undefined;
          audienceData = this.AudienceData({
            objectId: objectId,
            versionHash: versionHash
          });
          _context43.next = 17;
          return _regeneratorRuntime.awrap(this.authClient.ChannelContentFinalize({
            objectId: objectId,
            audienceData: audienceData,
            percent: percentComplete
          }));

        case 17:
        case "end":
          return _context43.stop();
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


exports.ContentObjectAccessComplete = function _callee44(_ref38) {
  var objectId, _ref38$score, score;

  return _regeneratorRuntime.async(function _callee44$(_context44) {
    while (1) {
      switch (_context44.prev = _context44.next) {
        case 0:
          objectId = _ref38.objectId, _ref38$score = _ref38.score, score = _ref38$score === void 0 ? 100 : _ref38$score;
          ValidateObject(objectId);

          if (!(score < 0 || score > 100)) {
            _context44.next = 4;
            break;
          }

          throw Error("Invalid AccessComplete score: " + score);

        case 4:
          _context44.next = 6;
          return _regeneratorRuntime.awrap(this.authClient.AccessComplete({
            id: objectId,
            score: score
          }));

        case 6:
          return _context44.abrupt("return", _context44.sent);

        case 7:
        case "end":
          return _context44.stop();
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


exports.Collection = function _callee45(_ref39) {
  var collectionType, validCollectionTypes, walletAddress;
  return _regeneratorRuntime.async(function _callee45$(_context45) {
    while (1) {
      switch (_context45.prev = _context45.next) {
        case 0:
          collectionType = _ref39.collectionType;
          validCollectionTypes = ["accessGroups", "contentObjects", "contentTypes", "contracts", "libraries"];

          if (validCollectionTypes.includes(collectionType)) {
            _context45.next = 4;
            break;
          }

          throw new Error("Invalid collection type: " + collectionType);

        case 4:
          if (!this.signer) {
            _context45.next = 10;
            break;
          }

          _context45.next = 7;
          return _regeneratorRuntime.awrap(this.userProfileClient.WalletAddress());

        case 7:
          _context45.t0 = _context45.sent;
          _context45.next = 11;
          break;

        case 10:
          _context45.t0 = undefined;

        case 11:
          walletAddress = _context45.t0;

          if (walletAddress) {
            _context45.next = 14;
            break;
          }

          throw new Error("Unable to get collection: User wallet doesn't exist");

        case 14:
          this.Log("Retrieving ".concat(collectionType, " contract collection for user ").concat(this.signer.address));
          _context45.next = 17;
          return _regeneratorRuntime.awrap(this.ethClient.MakeProviderCall({
            methodName: "send",
            args: ["elv_getWalletCollection", [this.contentSpaceId, "iusr".concat(this.utils.AddressToHash(this.signer.address)), collectionType]]
          }));

        case 17:
          return _context45.abrupt("return", _context45.sent);

        case 18:
        case "end":
          return _context45.stop();
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


exports.VerifyContentObject = function _callee46(_ref40) {
  var libraryId, objectId, versionHash;
  return _regeneratorRuntime.async(function _callee46$(_context46) {
    while (1) {
      switch (_context46.prev = _context46.next) {
        case 0:
          libraryId = _ref40.libraryId, objectId = _ref40.objectId, versionHash = _ref40.versionHash;
          ValidateParameters({
            libraryId: libraryId,
            objectId: objectId,
            versionHash: versionHash
          });
          _context46.next = 4;
          return _regeneratorRuntime.awrap(ContentObjectVerification.VerifyContentObject({
            client: this,
            libraryId: libraryId,
            objectId: objectId,
            versionHash: versionHash
          }));

        case 4:
          return _context46.abrupt("return", _context46.sent);

        case 5:
        case "end":
          return _context46.stop();
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


exports.Proofs = function _callee47(_ref41) {
  var libraryId, objectId, versionHash, partHash, path;
  return _regeneratorRuntime.async(function _callee47$(_context47) {
    while (1) {
      switch (_context47.prev = _context47.next) {
        case 0:
          libraryId = _ref41.libraryId, objectId = _ref41.objectId, versionHash = _ref41.versionHash, partHash = _ref41.partHash;
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
          _context47.t0 = this.utils;
          _context47.t1 = this.HttpClient;
          _context47.next = 9;
          return _regeneratorRuntime.awrap(this.authClient.AuthorizationHeader({
            libraryId: libraryId,
            objectId: objectId,
            versionHash: versionHash
          }));

        case 9:
          _context47.t2 = _context47.sent;
          _context47.t3 = path;
          _context47.t4 = {
            headers: _context47.t2,
            method: "GET",
            path: _context47.t3
          };
          _context47.t5 = _context47.t1.Request.call(_context47.t1, _context47.t4);
          return _context47.abrupt("return", _context47.t0.ResponseToJson.call(_context47.t0, _context47.t5));

        case 14:
        case "end":
          return _context47.stop();
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


exports.QParts = function _callee48(_ref42) {
  var libraryId, objectId, partHash, _ref42$format, format, path;

  return _regeneratorRuntime.async(function _callee48$(_context48) {
    while (1) {
      switch (_context48.prev = _context48.next) {
        case 0:
          libraryId = _ref42.libraryId, objectId = _ref42.objectId, partHash = _ref42.partHash, _ref42$format = _ref42.format, format = _ref42$format === void 0 ? "blob" : _ref42$format;
          ValidateParameters({
            libraryId: libraryId,
            objectId: objectId,
            versionHash: versionHash
          });
          ValidatePartHash(partHash);
          path = UrlJoin("qparts", partHash);
          _context48.t0 = this.utils;
          _context48.t1 = format;
          _context48.t2 = this.HttpClient;
          _context48.next = 9;
          return _regeneratorRuntime.awrap(this.authClient.AuthorizationHeader({
            libraryId: libraryId,
            objectId: objectId,
            partHash: partHash
          }));

        case 9:
          _context48.t3 = _context48.sent;
          _context48.t4 = path;
          _context48.t5 = {
            headers: _context48.t3,
            method: "GET",
            path: _context48.t4
          };
          _context48.t6 = _context48.t2.Request.call(_context48.t2, _context48.t5);
          return _context48.abrupt("return", _context48.t0.ResponseToFormat.call(_context48.t0, _context48.t1, _context48.t6));

        case 14:
        case "end":
          return _context48.stop();
      }
    }
  }, null, this);
};