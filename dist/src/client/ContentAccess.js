var _toConsumableArray = require("@babel/runtime/helpers/toConsumableArray");

var _typeof = require("@babel/runtime/helpers/typeof");

var _defineProperty = require("@babel/runtime/helpers/defineProperty");

var _regeneratorRuntime = require("@babel/runtime/regenerator");

var _asyncToGenerator = require("@babel/runtime/helpers/asyncToGenerator");

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }

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
    ValidateParameters = _require.ValidateParameters;

var MergeWith = require("lodash/mergeWith"); // Note: Keep these ordered by most-restrictive to least-restrictive


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

exports.Visibility = /*#__PURE__*/function () {
  var _ref2 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee2(_ref) {
    var _this = this;

    var id, clearCache, address;
    return _regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            id = _ref.id, clearCache = _ref.clearCache;
            _context2.prev = 1;
            address = this.utils.HashToAddress(id);

            if (clearCache) {
              delete this.visibilityInfo[address];
            }

            if (!this.visibilityInfo[address]) {
              this.visibilityInfo[address] = new Promise( /*#__PURE__*/function () {
                var _ref3 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee(resolve, reject) {
                  var hasVisibility;
                  return _regeneratorRuntime.wrap(function _callee$(_context) {
                    while (1) {
                      switch (_context.prev = _context.next) {
                        case 0:
                          _context.prev = 0;
                          _context.next = 3;
                          return _this.authClient.ContractHasMethod({
                            contractAddress: address,
                            methodName: "visibility"
                          });

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
                          return _this.CallContractMethod({
                            contractAddress: _this.utils.HashToAddress(id),
                            methodName: "visibility"
                          });

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
                  }, _callee, null, [[0, 14]]);
                }));

                return function (_x2, _x3) {
                  return _ref3.apply(this, arguments);
                };
              }());
            }

            _context2.prev = 5;
            _context2.next = 8;
            return this.visibilityInfo[address];

          case 8:
            return _context2.abrupt("return", _context2.sent);

          case 11:
            _context2.prev = 11;
            _context2.t0 = _context2["catch"](5);
            delete this.visibilityInfo[address];
            throw _context2.t0;

          case 15:
            _context2.next = 22;
            break;

          case 17:
            _context2.prev = 17;
            _context2.t1 = _context2["catch"](1);

            if (!(_context2.t1.code === "CALL_EXCEPTION")) {
              _context2.next = 21;
              break;
            }

            return _context2.abrupt("return", 0);

          case 21:
            throw _context2.t1;

          case 22:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2, this, [[1, 17], [5, 11]]);
  }));

  return function (_x) {
    return _ref2.apply(this, arguments);
  };
}();
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


exports.Permission = /*#__PURE__*/function () {
  var _ref5 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee3(_ref4) {
    var _this2 = this;

    var objectId, clearCache, visibility, kmsAddress, kmsId, hasKmsConk, statusCode, permission;
    return _regeneratorRuntime.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            objectId = _ref4.objectId, clearCache = _ref4.clearCache;
            ValidateObject(objectId);
            _context3.next = 4;
            return this.AccessType({
              id: objectId
            });

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
            return this.Visibility({
              id: objectId,
              clearCache: clearCache
            });

          case 10:
            visibility = _context3.sent;
            _context3.next = 13;
            return this.CallContractMethod({
              contractAddress: this.utils.HashToAddress(objectId),
              methodName: "addressKMS"
            });

          case 13:
            kmsAddress = _context3.sent;
            kmsId = kmsAddress && "ikms".concat(this.utils.AddressToHash(kmsAddress));
            hasKmsConk = false;

            if (!kmsId) {
              _context3.next = 27;
              break;
            }

            _context3.t2 = this;
            _context3.next = 20;
            return this.ContentObjectLibraryId({
              objectId: objectId
            });

          case 20:
            _context3.t3 = _context3.sent;
            _context3.t4 = objectId;
            _context3.t5 = "eluv.caps.".concat(kmsId);
            _context3.t6 = {
              libraryId: _context3.t3,
              objectId: _context3.t4,
              metadataSubtree: _context3.t5
            };
            _context3.next = 26;
            return _context3.t2.ContentObjectMetadata.call(_context3.t2, _context3.t6);

          case 26:
            hasKmsConk = !!_context3.sent;

          case 27:
            _context3.next = 29;
            return this.CallContractMethod({
              contractAddress: this.utils.HashToAddress(objectId),
              methodName: "statusCode"
            });

          case 29:
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

          case 34:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3, this);
  }));

  return function (_x4) {
    return _ref5.apply(this, arguments);
  };
}();
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


exports.DefaultKMSAddress = /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee4() {
  var _ref7,
      tenantId,
      kmsAddress,
      _args4 = arguments;

  return _regeneratorRuntime.wrap(function _callee4$(_context4) {
    while (1) {
      switch (_context4.prev = _context4.next) {
        case 0:
          _ref7 = _args4.length > 0 && _args4[0] !== undefined ? _args4[0] : {}, tenantId = _ref7.tenantId;
          _context4.t0 = tenantId;

          if (!_context4.t0) {
            _context4.next = 8;
            break;
          }

          _context4.next = 5;
          return this.AccessType({
            id: tenantId
          });

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
          return this.CallContractMethod({
            contractAddress: this.utils.HashToAddress(tenantId),
            methodName: "addressKMS"
          });

        case 11:
          kmsAddress = _context4.sent;

          if (!kmsAddress) {
            _context4.next = 14;
            break;
          }

          return _context4.abrupt("return", kmsAddress);

        case 14:
          _context4.next = 16;
          return this.CallContractMethod({
            contractAddress: this.contentSpaceAddress,
            methodName: "addressKMS"
          });

        case 16:
          return _context4.abrupt("return", _context4.sent);

        case 17:
        case "end":
          return _context4.stop();
      }
    }
  }, _callee4, this);
}));
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


exports.ContentTypeOwner = /*#__PURE__*/function () {
  var _ref9 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee5(_ref8) {
    var name, typeId, versionHash, contentType;
    return _regeneratorRuntime.wrap(function _callee5$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            name = _ref8.name, typeId = _ref8.typeId, versionHash = _ref8.versionHash;
            _context5.next = 3;
            return this.ContentType({
              name: name,
              typeId: typeId,
              versionHash: versionHash
            });

          case 3:
            contentType = _context5.sent;
            _context5.t0 = this.utils;
            _context5.next = 7;
            return this.ethClient.CallContractMethod({
              contractAddress: this.utils.HashToAddress(contentType.id),
              methodName: "owner",
              methodArgs: []
            });

          case 7:
            _context5.t1 = _context5.sent;
            return _context5.abrupt("return", _context5.t0.FormatAddress.call(_context5.t0, _context5.t1));

          case 9:
          case "end":
            return _context5.stop();
        }
      }
    }, _callee5, this);
  }));

  return function (_x5) {
    return _ref9.apply(this, arguments);
  };
}();
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


exports.ContentType = /*#__PURE__*/function () {
  var _ref11 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee6(_ref10) {
    var name, typeId, versionHash, _ref10$publicOnly, publicOnly, types, metadata;

    return _regeneratorRuntime.wrap(function _callee6$(_context6) {
      while (1) {
        switch (_context6.prev = _context6.next) {
          case 0:
            name = _ref10.name, typeId = _ref10.typeId, versionHash = _ref10.versionHash, _ref10$publicOnly = _ref10.publicOnly, publicOnly = _ref10$publicOnly === void 0 ? false : _ref10$publicOnly;
            this.Log("Retrieving content type: ".concat(name || typeId || versionHash));

            if (versionHash) {
              typeId = this.utils.DecodeVersionHash(versionHash).objectId;
            }

            if (!name) {
              _context6.next = 13;
              break;
            }

            this.Log("Looking up type by name in content space metadata..."); // Look up named type in content space metadata

            _context6.prev = 5;
            _context6.next = 8;
            return this.ContentObjectMetadata({
              libraryId: this.contentSpaceLibraryId,
              objectId: this.contentSpaceObjectId,
              metadataSubtree: UrlJoin("public", "contentTypes", name)
            });

          case 8:
            typeId = _context6.sent;
            _context6.next = 13;
            break;

          case 11:
            _context6.prev = 11;
            _context6.t0 = _context6["catch"](5);

          case 13:
            if (typeId) {
              _context6.next = 23;
              break;
            }

            this.Log("Looking up type by name in available types...");
            _context6.next = 17;
            return this.ContentTypes();

          case 17:
            types = _context6.sent;

            if (!name) {
              _context6.next = 22;
              break;
            }

            return _context6.abrupt("return", Object.values(types).find(function (type) {
              return (type.name || "").toLowerCase() === name.toLowerCase();
            }));

          case 22:
            return _context6.abrupt("return", Object.values(types).find(function (type) {
              return type.hash === versionHash;
            }));

          case 23:
            if (versionHash) {
              _context6.next = 27;
              break;
            }

            _context6.next = 26;
            return this.LatestVersionHash({
              objectId: typeId
            });

          case 26:
            versionHash = _context6.sent;

          case 27:
            _context6.prev = 27;
            this.Log("Looking up type by ID...");

            if (!publicOnly) {
              _context6.next = 39;
              break;
            }

            _context6.next = 32;
            return this.ContentObjectMetadata({
              libraryId: this.contentSpaceLibraryId,
              objectId: typeId,
              versionHash: versionHash,
              metadataSubtree: "public"
            });

          case 32:
            _context6.t1 = _context6.sent;

            if (_context6.t1) {
              _context6.next = 35;
              break;
            }

            _context6.t1 = {};

          case 35:
            _context6.t2 = _context6.t1;
            metadata = {
              "public": _context6.t2
            };
            _context6.next = 45;
            break;

          case 39:
            _context6.next = 41;
            return this.ContentObjectMetadata({
              libraryId: this.contentSpaceLibraryId,
              objectId: typeId,
              versionHash: versionHash
            });

          case 41:
            _context6.t3 = _context6.sent;

            if (_context6.t3) {
              _context6.next = 44;
              break;
            }

            _context6.t3 = {};

          case 44:
            metadata = _context6.t3;

          case 45:
            return _context6.abrupt("return", {
              id: typeId,
              hash: versionHash,
              name: metadata["public"] && metadata["public"].name || metadata.name || typeId,
              meta: metadata
            });

          case 48:
            _context6.prev = 48;
            _context6.t4 = _context6["catch"](27);
            this.Log("Error looking up content type:");
            this.Log(_context6.t4);
            throw new Error("Content Type ".concat(name || typeId, " is invalid"));

          case 53:
          case "end":
            return _context6.stop();
        }
      }
    }, _callee6, this, [[5, 11], [27, 48]]);
  }));

  return function (_x6) {
    return _ref11.apply(this, arguments);
  };
}();
/**
 * List all content types accessible to this user.
 *
 * @methodGroup Content Types
 * @namedParams
 *
 * @return {Promise<Object>} - Available content types
 */


exports.ContentTypes = /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee8() {
  var _this3 = this;

  var typeAddresses, contentSpaceTypes, contentSpaceTypeAddresses;
  return _regeneratorRuntime.wrap(function _callee8$(_context8) {
    while (1) {
      switch (_context8.prev = _context8.next) {
        case 0:
          this.contentTypes = this.contentTypes || {};
          this.Log("Looking up all available content types"); // Personally available types

          _context8.next = 4;
          return this.Collection({
            collectionType: "contentTypes"
          });

        case 4:
          typeAddresses = _context8.sent;
          this.Log("Personally available types:");
          this.Log(typeAddresses); // Content space types

          contentSpaceTypes = {};
          _context8.prev = 8;
          _context8.next = 11;
          return this.ContentObjectMetadata({
            libraryId: this.contentSpaceLibraryId,
            objectId: this.contentSpaceObjectId,
            metadataSubtree: "public/contentTypes"
          });

        case 11:
          _context8.t0 = _context8.sent;

          if (_context8.t0) {
            _context8.next = 14;
            break;
          }

          _context8.t0 = {};

        case 14:
          contentSpaceTypes = _context8.t0;
          _context8.next = 19;
          break;

        case 17:
          _context8.prev = 17;
          _context8.t1 = _context8["catch"](8);

        case 19:
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
          _context8.next = 25;
          return Promise.all(typeAddresses.map( /*#__PURE__*/function () {
            var _ref13 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee7(typeAddress) {
              var typeId;
              return _regeneratorRuntime.wrap(function _callee7$(_context7) {
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
                      return _this3.ContentType({
                        typeId: typeId,
                        publicOnly: true
                      });

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
              }, _callee7, null, [[2, 8]]);
            }));

            return function (_x7) {
              return _ref13.apply(this, arguments);
            };
          }()));

        case 25:
          return _context8.abrupt("return", this.contentTypes);

        case 26:
        case "end":
          return _context8.stop();
      }
    }
  }, _callee8, this, [[8, 17]]);
}));
/* Content Libraries */

/**
 * List content libraries - returns a list of content library IDs available to the current user
 *
 * @methodGroup Content Libraries
 *
 * @returns {Promise<Array<string>>}
 */

exports.ContentLibraries = /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee9() {
  var _this4 = this;

  var libraryAddresses;
  return _regeneratorRuntime.wrap(function _callee9$(_context9) {
    while (1) {
      switch (_context9.prev = _context9.next) {
        case 0:
          _context9.next = 2;
          return this.Collection({
            collectionType: "libraries"
          });

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
  }, _callee9, this);
}));
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

exports.ContentLibrary = /*#__PURE__*/function () {
  var _ref16 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee10(_ref15) {
    var libraryId, path, library;
    return _regeneratorRuntime.wrap(function _callee10$(_context10) {
      while (1) {
        switch (_context10.prev = _context10.next) {
          case 0:
            libraryId = _ref15.libraryId;
            ValidateLibrary(libraryId);
            path = UrlJoin("qlibs", libraryId);
            _context10.t0 = this.utils;
            _context10.t1 = this.HttpClient;
            _context10.next = 7;
            return this.authClient.AuthorizationHeader({
              libraryId: libraryId
            });

          case 7:
            _context10.t2 = _context10.sent;
            _context10.t3 = path;
            _context10.t4 = {
              headers: _context10.t2,
              method: "GET",
              path: _context10.t3
            };
            _context10.t5 = _context10.t1.Request.call(_context10.t1, _context10.t4);
            _context10.next = 13;
            return _context10.t0.ResponseToJson.call(_context10.t0, _context10.t5);

          case 13:
            library = _context10.sent;
            return _context10.abrupt("return", _objectSpread(_objectSpread({}, library), {}, {
              meta: library.meta || {}
            }));

          case 15:
          case "end":
            return _context10.stop();
        }
      }
    }, _callee10, this);
  }));

  return function (_x8) {
    return _ref16.apply(this, arguments);
  };
}();
/**
 * Returns the address of the owner of the specified content library
 *
 * @methodGroup Content Libraries
 * @namedParams
 * @param {string} libraryId
 *
 * @returns {Promise<string>} - The account address of the owner
 */


exports.ContentLibraryOwner = /*#__PURE__*/function () {
  var _ref18 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee11(_ref17) {
    var libraryId;
    return _regeneratorRuntime.wrap(function _callee11$(_context11) {
      while (1) {
        switch (_context11.prev = _context11.next) {
          case 0:
            libraryId = _ref17.libraryId;
            ValidateLibrary(libraryId);
            _context11.t0 = this.utils;
            _context11.next = 5;
            return this.ethClient.CallContractMethod({
              contractAddress: this.utils.HashToAddress(libraryId),
              methodName: "owner",
              methodArgs: []
            });

          case 5:
            _context11.t1 = _context11.sent;
            return _context11.abrupt("return", _context11.t0.FormatAddress.call(_context11.t0, _context11.t1));

          case 7:
          case "end":
            return _context11.stop();
        }
      }
    }, _callee11, this);
  }));

  return function (_x9) {
    return _ref18.apply(this, arguments);
  };
}();
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


exports.LibraryContentTypes = /*#__PURE__*/function () {
  var _ref20 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee13(_ref19) {
    var _this5 = this;

    var libraryId, typesLength, allowedTypes;
    return _regeneratorRuntime.wrap(function _callee13$(_context13) {
      while (1) {
        switch (_context13.prev = _context13.next) {
          case 0:
            libraryId = _ref19.libraryId;
            ValidateLibrary(libraryId);
            this.Log("Retrieving library content types for ".concat(libraryId));
            _context13.next = 5;
            return this.ethClient.CallContractMethod({
              contractAddress: this.utils.HashToAddress(libraryId),
              methodName: "contentTypesLength",
              methodArgs: []
            });

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
            return Promise.all(Array.from(new Array(typesLength), /*#__PURE__*/function () {
              var _ref21 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee12(_, i) {
                var typeAddress, typeId;
                return _regeneratorRuntime.wrap(function _callee12$(_context12) {
                  while (1) {
                    switch (_context12.prev = _context12.next) {
                      case 0:
                        _context12.next = 2;
                        return _this5.ethClient.CallContractMethod({
                          contractAddress: _this5.utils.HashToAddress(libraryId),
                          methodName: "contentTypes",
                          methodArgs: [i]
                        });

                      case 2:
                        typeAddress = _context12.sent;
                        typeId = _this5.utils.AddressToObjectId(typeAddress);
                        _context12.next = 6;
                        return _this5.ContentType({
                          typeId: typeId
                        });

                      case 6:
                        allowedTypes[typeId] = _context12.sent;

                      case 7:
                      case "end":
                        return _context12.stop();
                    }
                  }
                }, _callee12);
              }));

              return function (_x11, _x12) {
                return _ref21.apply(this, arguments);
              };
            }()));

          case 12:
            this.Log(allowedTypes);
            return _context13.abrupt("return", allowedTypes);

          case 14:
          case "end":
            return _context13.stop();
        }
      }
    }, _callee13, this);
  }));

  return function (_x10) {
    return _ref20.apply(this, arguments);
  };
}();
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
 * @param {(Array<string> | string)=} filterOptions.sort - Sort by the specified key(s)
 * @param {boolean=} filterOptions.sortDesc - Sort in descending order
 * @param {(Array<string> | string)=} filterOptions.select - Include only the specified metadata keys (all must start with /public)
 * @param {(Array<object> | object)=} filterOptions.filter - Filter objects by metadata
 * @param {string=} filterOptions.filter.key - Key to filter on (must start with /public)
 * @param {string=} filterOptions.filter.type - Type of filter to use for the specified key:
 * - eq, neq, lt, lte, gt, gte, cnt (contains), ncnt (does not contain),
 * @param {string=} filterOptions.filter.filter - Filter for the specified key
 *
 * @returns {Promise<Array<Object>>} - List of objects in library
 */


exports.ContentObjects = /*#__PURE__*/function () {
  var _ref23 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee14(_ref22) {
    var libraryId, _ref22$filterOptions, filterOptions, path, queryParams, filterTypeMap, addFilter;

    return _regeneratorRuntime.wrap(function _callee14$(_context14) {
      while (1) {
        switch (_context14.prev = _context14.next) {
          case 0:
            libraryId = _ref22.libraryId, _ref22$filterOptions = _ref22.filterOptions, filterOptions = _ref22$filterOptions === void 0 ? {} : _ref22$filterOptions;
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

            addFilter = function addFilter(_ref24) {
              var key = _ref24.key,
                  type = _ref24.type,
                  filter = _ref24.filter;
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
            _context14.t0 = this.utils;
            _context14.t1 = this.HttpClient;
            _context14.next = 19;
            return this.authClient.AuthorizationHeader({
              libraryId: libraryId
            });

          case 19:
            _context14.t2 = _context14.sent;
            _context14.t3 = path;
            _context14.t4 = queryParams;
            _context14.t5 = {
              headers: _context14.t2,
              method: "GET",
              path: _context14.t3,
              queryParams: _context14.t4
            };
            _context14.t6 = _context14.t1.Request.call(_context14.t1, _context14.t5);
            _context14.next = 26;
            return _context14.t0.ResponseToJson.call(_context14.t0, _context14.t6);

          case 26:
            return _context14.abrupt("return", _context14.sent);

          case 27:
          case "end":
            return _context14.stop();
        }
      }
    }, _callee14, this);
  }));

  return function (_x13) {
    return _ref23.apply(this, arguments);
  };
}();
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


exports.ContentObject = /*#__PURE__*/function () {
  var _ref26 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee15(_ref25) {
    var libraryId, objectId, versionHash, path;
    return _regeneratorRuntime.wrap(function _callee15$(_context15) {
      while (1) {
        switch (_context15.prev = _context15.next) {
          case 0:
            libraryId = _ref25.libraryId, objectId = _ref25.objectId, versionHash = _ref25.versionHash;
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
            _context15.t0 = this.utils;
            _context15.t1 = this.HttpClient;
            _context15.next = 9;
            return this.authClient.AuthorizationHeader({
              libraryId: libraryId,
              objectId: objectId,
              versionHash: versionHash
            });

          case 9:
            _context15.t2 = _context15.sent;
            _context15.t3 = path;
            _context15.t4 = {
              headers: _context15.t2,
              method: "GET",
              path: _context15.t3
            };
            _context15.t5 = _context15.t1.Request.call(_context15.t1, _context15.t4);
            _context15.next = 15;
            return _context15.t0.ResponseToJson.call(_context15.t0, _context15.t5);

          case 15:
            return _context15.abrupt("return", _context15.sent);

          case 16:
          case "end":
            return _context15.stop();
        }
      }
    }, _callee15, this);
  }));

  return function (_x14) {
    return _ref26.apply(this, arguments);
  };
}();
/**
 * Returns the address of the owner of the specified content object
 *
 * @methodGroup Content Objects
 * @namedParams
 * @param {string} libraryId
 *
 * @returns {Promise<string>} - The account address of the owner
 */


exports.ContentObjectOwner = /*#__PURE__*/function () {
  var _ref28 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee16(_ref27) {
    var objectId;
    return _regeneratorRuntime.wrap(function _callee16$(_context16) {
      while (1) {
        switch (_context16.prev = _context16.next) {
          case 0:
            objectId = _ref27.objectId;
            ValidateObject(objectId);
            this.Log("Retrieving content object owner: ".concat(objectId));
            _context16.t0 = this.utils;
            _context16.next = 6;
            return this.ethClient.CallContractMethod({
              contractAddress: this.utils.HashToAddress(objectId),
              methodName: "owner",
              methodArgs: []
            });

          case 6:
            _context16.t1 = _context16.sent;
            return _context16.abrupt("return", _context16.t0.FormatAddress.call(_context16.t0, _context16.t1));

          case 8:
          case "end":
            return _context16.stop();
        }
      }
    }, _callee16, this);
  }));

  return function (_x15) {
    return _ref28.apply(this, arguments);
  };
}();
/**
 * Retrieve the tenant ID associated with the specified content object
 *
 * @methodGroup Content Objects
 *
 * @namedParams
 * @param {string=} objectId - ID of the object
 * @param {string=} versionHash - Version hash of the object
 *
 * @returns {Promise<string>} - Tenant ID of the object
 */


exports.ContentObjectTenantId = /*#__PURE__*/function () {
  var _ref30 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee17(_ref29) {
    var objectId, versionHash;
    return _regeneratorRuntime.wrap(function _callee17$(_context17) {
      while (1) {
        switch (_context17.prev = _context17.next) {
          case 0:
            objectId = _ref29.objectId, versionHash = _ref29.versionHash;
            versionHash ? ValidateVersion(versionHash) : ValidateObject(objectId);

            if (versionHash) {
              objectId = this.utils.DecodeVersionHash(versionHash).objectId;
            }

            if (this.objectTenantIds[objectId]) {
              _context17.next = 7;
              break;
            }

            _context17.next = 6;
            return this.authClient.MakeElvMasterCall({
              methodName: "elv_getTenantById",
              params: [this.contentSpaceId, objectId]
            });

          case 6:
            this.objectTenantIds[objectId] = _context17.sent;

          case 7:
            return _context17.abrupt("return", this.objectTenantIds[objectId]);

          case 8:
          case "end":
            return _context17.stop();
        }
      }
    }, _callee17, this);
  }));

  return function (_x16) {
    return _ref30.apply(this, arguments);
  };
}();
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


exports.ContentObjectLibraryId = /*#__PURE__*/function () {
  var _ref32 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee19(_ref31) {
    var _this6 = this;

    var objectId, versionHash;
    return _regeneratorRuntime.wrap(function _callee19$(_context19) {
      while (1) {
        switch (_context19.prev = _context19.next) {
          case 0:
            objectId = _ref31.objectId, versionHash = _ref31.versionHash;
            versionHash ? ValidateVersion(versionHash) : ValidateObject(objectId);

            if (versionHash) {
              objectId = this.utils.DecodeVersionHash(versionHash).objectId;
            }

            _context19.next = 5;
            return this.authClient.AccessType(objectId);

          case 5:
            _context19.t0 = _context19.sent;
            _context19.next = _context19.t0 === this.authClient.ACCESS_TYPES.LIBRARY ? 8 : _context19.t0 === this.authClient.ACCESS_TYPES.OBJECT ? 9 : _context19.t0 === this.authClient.ACCESS_TYPES.OTHER ? 20 : 21;
            break;

          case 8:
            return _context19.abrupt("return", this.utils.AddressToLibraryId(this.utils.HashToAddress(objectId)));

          case 9:
            if (!this.objectLibraryIds[objectId]) {
              this.Log("Retrieving content object library ID: ".concat(objectId || versionHash));
              this.objectLibraryIds[objectId] = new Promise( /*#__PURE__*/function () {
                var _ref33 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee18(resolve, reject) {
                  return _regeneratorRuntime.wrap(function _callee18$(_context18) {
                    while (1) {
                      switch (_context18.prev = _context18.next) {
                        case 0:
                          _context18.prev = 0;
                          _context18.t0 = resolve;
                          _context18.t1 = _this6.utils;
                          _context18.next = 5;
                          return _this6.CallContractMethod({
                            contractAddress: _this6.utils.HashToAddress(objectId),
                            methodName: "libraryAddress"
                          });

                        case 5:
                          _context18.t2 = _context18.sent;
                          _context18.t3 = _context18.t1.AddressToLibraryId.call(_context18.t1, _context18.t2);
                          (0, _context18.t0)(_context18.t3);
                          _context18.next = 13;
                          break;

                        case 10:
                          _context18.prev = 10;
                          _context18.t4 = _context18["catch"](0);
                          reject(_context18.t4);

                        case 13:
                        case "end":
                          return _context18.stop();
                      }
                    }
                  }, _callee18, null, [[0, 10]]);
                }));

                return function (_x18, _x19) {
                  return _ref33.apply(this, arguments);
                };
              }());
            }

            _context19.prev = 10;
            _context19.next = 13;
            return this.objectLibraryIds[objectId];

          case 13:
            return _context19.abrupt("return", _context19.sent);

          case 16:
            _context19.prev = 16;
            _context19.t1 = _context19["catch"](10);
            delete this.objectLibraryIds[objectId];
            throw _context19.t1;

          case 20:
            throw Error("Unable to retrieve library ID for ".concat(versionHash || objectId, ": Unknown type. (wrong network or deleted object?)"));

          case 21:
            return _context19.abrupt("return", this.contentSpaceLibraryId);

          case 22:
          case "end":
            return _context19.stop();
        }
      }
    }, _callee19, this, [[10, 16]]);
  }));

  return function (_x17) {
    return _ref32.apply(this, arguments);
  };
}();

exports.ProduceMetadataLinks = /*#__PURE__*/function () {
  var _ref35 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee22(_ref34) {
    var _this7 = this;

    var libraryId, objectId, versionHash, _ref34$path, path, metadata, authorizationToken, noAuth, result;

    return _regeneratorRuntime.wrap(function _callee22$(_context22) {
      while (1) {
        switch (_context22.prev = _context22.next) {
          case 0:
            libraryId = _ref34.libraryId, objectId = _ref34.objectId, versionHash = _ref34.versionHash, _ref34$path = _ref34.path, path = _ref34$path === void 0 ? "/" : _ref34$path, metadata = _ref34.metadata, authorizationToken = _ref34.authorizationToken, noAuth = _ref34.noAuth;

            if (!(!metadata || _typeof(metadata) !== "object")) {
              _context22.next = 3;
              break;
            }

            return _context22.abrupt("return", metadata);

          case 3:
            if (!Array.isArray(metadata)) {
              _context22.next = 7;
              break;
            }

            _context22.next = 6;
            return this.utils.LimitedMap(5, metadata, /*#__PURE__*/function () {
              var _ref36 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee20(entry, i) {
                return _regeneratorRuntime.wrap(function _callee20$(_context20) {
                  while (1) {
                    switch (_context20.prev = _context20.next) {
                      case 0:
                        _context20.next = 2;
                        return _this7.ProduceMetadataLinks({
                          libraryId: libraryId,
                          objectId: objectId,
                          versionHash: versionHash,
                          path: UrlJoin(path, i.toString()),
                          metadata: entry,
                          authorizationToken: authorizationToken,
                          noAuth: noAuth
                        });

                      case 2:
                        return _context20.abrupt("return", _context20.sent);

                      case 3:
                      case "end":
                        return _context20.stop();
                    }
                  }
                }, _callee20);
              }));

              return function (_x21, _x22) {
                return _ref36.apply(this, arguments);
              };
            }());

          case 6:
            return _context22.abrupt("return", _context22.sent);

          case 7:
            if (!(metadata["/"] && (metadata["/"].match(/\.\/(rep|files)\/.+/) || metadata["/"].match(/^\/?qfab\/([\w]+)\/?(rep|files)\/.+/)))) {
              _context22.next = 16;
              break;
            }

            _context22.t0 = _objectSpread;
            _context22.t1 = _objectSpread({}, metadata);
            _context22.t2 = {};
            _context22.next = 13;
            return this.LinkUrl({
              libraryId: libraryId,
              objectId: objectId,
              versionHash: versionHash,
              linkPath: path,
              authorizationToken: authorizationToken
            });

          case 13:
            _context22.t3 = _context22.sent;
            _context22.t4 = {
              url: _context22.t3
            };
            return _context22.abrupt("return", (0, _context22.t0)(_context22.t1, _context22.t2, _context22.t4));

          case 16:
            result = {};
            _context22.next = 19;
            return this.utils.LimitedMap(5, Object.keys(metadata), /*#__PURE__*/function () {
              var _ref37 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee21(key) {
                return _regeneratorRuntime.wrap(function _callee21$(_context21) {
                  while (1) {
                    switch (_context21.prev = _context21.next) {
                      case 0:
                        _context21.next = 2;
                        return _this7.ProduceMetadataLinks({
                          libraryId: libraryId,
                          objectId: objectId,
                          versionHash: versionHash,
                          path: UrlJoin(path, key),
                          metadata: metadata[key],
                          authorizationToken: authorizationToken,
                          noAuth: noAuth
                        });

                      case 2:
                        result[key] = _context21.sent;

                      case 3:
                      case "end":
                        return _context21.stop();
                    }
                  }
                }, _callee21);
              }));

              return function (_x23) {
                return _ref37.apply(this, arguments);
              };
            }());

          case 19:
            return _context22.abrupt("return", result);

          case 20:
          case "end":
            return _context22.stop();
        }
      }
    }, _callee22, this);
  }));

  return function (_x20) {
    return _ref35.apply(this, arguments);
  };
}();

exports.MetadataAuth = /*#__PURE__*/function () {
  var _ref39 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee23(_ref38) {
    var libraryId, objectId, versionHash, _ref38$path, path, _ref38$channelAuth, channelAuth, _ref38$noAuth, noAuth, isPublic, accessType, visibility, kmsAddress;

    return _regeneratorRuntime.wrap(function _callee23$(_context23) {
      while (1) {
        switch (_context23.prev = _context23.next) {
          case 0:
            libraryId = _ref38.libraryId, objectId = _ref38.objectId, versionHash = _ref38.versionHash, _ref38$path = _ref38.path, path = _ref38$path === void 0 ? "/" : _ref38$path, _ref38$channelAuth = _ref38.channelAuth, channelAuth = _ref38$channelAuth === void 0 ? false : _ref38$channelAuth, _ref38$noAuth = _ref38.noAuth, noAuth = _ref38$noAuth === void 0 ? false : _ref38$noAuth;
            ValidateParameters({
              libraryId: libraryId,
              objectId: objectId,
              versionHash: versionHash
            });

            if (versionHash) {
              objectId = this.utils.DecodeVersionHash(versionHash).objectId;
            }

            noAuth = this.noAuth || noAuth;
            isPublic = noAuth;

            if (noAuth) {
              _context23.next = 14;
              break;
            }

            _context23.next = 8;
            return this.Visibility({
              id: objectId
            });

          case 8:
            visibility = _context23.sent;
            _context23.next = 11;
            return this.AccessType({
              id: objectId
            });

          case 11:
            accessType = _context23.sent;
            isPublic = (path || "").replace(/^\/+/, "").startsWith("public");
            noAuth = visibility >= 10 || isPublic && visibility >= 1;

          case 14:
            if (!this.oauthToken) {
              _context23.next = 22;
              break;
            }

            _context23.next = 17;
            return this.authClient.KMSAddress({
              objectId: objectId,
              versionHash: versionHash
            });

          case 17:
            kmsAddress = _context23.sent;

            if (!(kmsAddress && !this.utils.EqualAddress(kmsAddress, this.utils.nullAddress))) {
              _context23.next = 22;
              break;
            }

            _context23.next = 21;
            return this.authClient.AuthorizationToken({
              libraryId: libraryId,
              objectId: objectId,
              versionHash: versionHash,
              channelAuth: true,
              oauthToken: this.oauthToken
            });

          case 21:
            return _context23.abrupt("return", _context23.sent);

          case 22:
            if (!(!this.inaccessibleLibraries[libraryId] && isPublic && accessType === this.authClient.ACCESS_TYPES.OBJECT && !channelAuth)) {
              _context23.next = 48;
              break;
            }

            _context23.prev = 23;
            _context23.t0 = this.authClient;
            _context23.t1 = libraryId;

            if (_context23.t1) {
              _context23.next = 30;
              break;
            }

            _context23.next = 29;
            return this.ContentObjectLibraryId({
              objectId: objectId,
              versionHash: versionHash
            });

          case 29:
            _context23.t1 = _context23.sent;

          case 30:
            _context23.t2 = _context23.t1;
            _context23.t3 = noAuth;
            _context23.t4 = {
              libraryId: _context23.t2,
              noAuth: _context23.t3
            };
            _context23.next = 35;
            return _context23.t0.AuthorizationToken.call(_context23.t0, _context23.t4);

          case 35:
            return _context23.abrupt("return", _context23.sent);

          case 38:
            _context23.prev = 38;
            _context23.t5 = _context23["catch"](23);

            if (!(_context23.t5.message && _context23.t5.message.toLowerCase().startsWith("access denied"))) {
              _context23.next = 45;
              break;
            }

            this.inaccessibleLibraries[libraryId] = true;
            _context23.next = 44;
            return this.authClient.AuthorizationToken({
              libraryId: libraryId,
              objectId: objectId,
              versionHash: versionHash,
              noAuth: noAuth,
              channelAuth: channelAuth
            });

          case 44:
            return _context23.abrupt("return", _context23.sent);

          case 45:
            throw _context23.t5;

          case 46:
            _context23.next = 51;
            break;

          case 48:
            _context23.next = 50;
            return this.authClient.AuthorizationToken({
              libraryId: libraryId,
              objectId: objectId,
              versionHash: versionHash,
              noAuth: noAuth,
              channelAuth: channelAuth
            });

          case 50:
            return _context23.abrupt("return", _context23.sent);

          case 51:
          case "end":
            return _context23.stop();
        }
      }
    }, _callee23, this, [[23, 38]]);
  }));

  return function (_x24) {
    return _ref39.apply(this, arguments);
  };
}();
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
 * @param {string=} noAuth=false - If specified, the normal authorization flow will be skipped. Useful if you know the metadata you're retrieving is publicly accessible
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


exports.ContentObjectMetadata = /*#__PURE__*/function () {
  var _ref41 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee24(_ref40) {
    var libraryId, objectId, versionHash, writeToken, _ref40$metadataSubtre, metadataSubtree, _ref40$queryParams, queryParams, _ref40$select, select, _ref40$remove, remove, authorizationToken, _ref40$noAuth, noAuth, _ref40$resolveLinks, resolveLinks, _ref40$resolveInclude, resolveIncludeSource, _ref40$resolveIgnoreE, resolveIgnoreErrors, _ref40$linkDepthLimit, linkDepthLimit, _ref40$produceLinkUrl, produceLinkUrls, path, defaultAuthToken, authTokens, metadata;

    return _regeneratorRuntime.wrap(function _callee24$(_context24) {
      while (1) {
        switch (_context24.prev = _context24.next) {
          case 0:
            libraryId = _ref40.libraryId, objectId = _ref40.objectId, versionHash = _ref40.versionHash, writeToken = _ref40.writeToken, _ref40$metadataSubtre = _ref40.metadataSubtree, metadataSubtree = _ref40$metadataSubtre === void 0 ? "/" : _ref40$metadataSubtre, _ref40$queryParams = _ref40.queryParams, queryParams = _ref40$queryParams === void 0 ? {} : _ref40$queryParams, _ref40$select = _ref40.select, select = _ref40$select === void 0 ? [] : _ref40$select, _ref40$remove = _ref40.remove, remove = _ref40$remove === void 0 ? [] : _ref40$remove, authorizationToken = _ref40.authorizationToken, _ref40$noAuth = _ref40.noAuth, noAuth = _ref40$noAuth === void 0 ? false : _ref40$noAuth, _ref40$resolveLinks = _ref40.resolveLinks, resolveLinks = _ref40$resolveLinks === void 0 ? false : _ref40$resolveLinks, _ref40$resolveInclude = _ref40.resolveIncludeSource, resolveIncludeSource = _ref40$resolveInclude === void 0 ? false : _ref40$resolveInclude, _ref40$resolveIgnoreE = _ref40.resolveIgnoreErrors, resolveIgnoreErrors = _ref40$resolveIgnoreE === void 0 ? false : _ref40$resolveIgnoreE, _ref40$linkDepthLimit = _ref40.linkDepthLimit, linkDepthLimit = _ref40$linkDepthLimit === void 0 ? 1 : _ref40$linkDepthLimit, _ref40$produceLinkUrl = _ref40.produceLinkUrls, produceLinkUrls = _ref40$produceLinkUrl === void 0 ? false : _ref40$produceLinkUrl;
            ValidateParameters({
              libraryId: libraryId,
              objectId: objectId,
              versionHash: versionHash
            });
            this.Log("Retrieving content object metadata: ".concat(libraryId || "", " ").concat(objectId || versionHash, " ").concat(writeToken || "", "\n       Subtree: ").concat(metadataSubtree));
            queryParams = _objectSpread({}, queryParams || {});

            if (versionHash) {
              objectId = this.utils.DecodeVersionHash(versionHash).objectId;
            }

            path = UrlJoin("q", writeToken || versionHash || objectId, "meta", metadataSubtree); // Main authorization

            _context24.next = 8;
            return this.MetadataAuth({
              libraryId: libraryId,
              objectId: objectId,
              versionHash: versionHash,
              path: metadataSubtree,
              noAuth: noAuth
            });

          case 8:
            defaultAuthToken = _context24.sent;
            // All authorization
            authTokens = [authorizationToken, queryParams.authorization, defaultAuthToken].flat().filter(function (token) {
              return token;
            });
            delete queryParams.authorization;
            _context24.prev = 11;
            _context24.next = 14;
            return this.utils.ResponseToJson(this.HttpClient.Request({
              headers: {
                "Authorization": authTokens.map(function (token) {
                  return "Bearer ".concat(token);
                })
              },
              queryParams: _objectSpread(_objectSpread({}, queryParams), {}, {
                select: select,
                remove: remove,
                link_depth: linkDepthLimit,
                resolve: resolveLinks,
                resolve_include_source: resolveIncludeSource,
                resolve_ignore_errors: resolveIgnoreErrors
              }),
              method: "GET",
              path: path
            }));

          case 14:
            metadata = _context24.sent;
            _context24.next = 22;
            break;

          case 17:
            _context24.prev = 17;
            _context24.t0 = _context24["catch"](11);

            if (!(_context24.t0.status !== 404)) {
              _context24.next = 21;
              break;
            }

            throw _context24.t0;

          case 21:
            metadata = metadataSubtree === "/" ? {} : undefined;

          case 22:
            if (produceLinkUrls) {
              _context24.next = 24;
              break;
            }

            return _context24.abrupt("return", metadata);

          case 24:
            _context24.next = 26;
            return this.ProduceMetadataLinks({
              libraryId: libraryId,
              objectId: objectId,
              versionHash: versionHash,
              path: metadataSubtree,
              metadata: metadata,
              authorizationToken: authorizationToken,
              noAuth: noAuth
            });

          case 26:
            return _context24.abrupt("return", _context24.sent);

          case 27:
          case "end":
            return _context24.stop();
        }
      }
    }, _callee24, this, [[11, 17]]);
  }));

  return function (_x25) {
    return _ref41.apply(this, arguments);
  };
}();
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


exports.AssetMetadata = /*#__PURE__*/function () {
  var _ref43 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee25(_ref42) {
    var _this8 = this;

    var libraryId, objectId, versionHash, metadata, localization, noAuth, _ref42$produceLinkUrl, produceLinkUrls, mergedMetadata;

    return _regeneratorRuntime.wrap(function _callee25$(_context25) {
      while (1) {
        switch (_context25.prev = _context25.next) {
          case 0:
            libraryId = _ref42.libraryId, objectId = _ref42.objectId, versionHash = _ref42.versionHash, metadata = _ref42.metadata, localization = _ref42.localization, noAuth = _ref42.noAuth, _ref42$produceLinkUrl = _ref42.produceLinkUrls, produceLinkUrls = _ref42$produceLinkUrl === void 0 ? false : _ref42$produceLinkUrl;
            ValidateParameters({
              libraryId: libraryId,
              objectId: objectId,
              versionHash: versionHash
            });

            if (!objectId) {
              objectId = this.utils.DecodeVersionHash(versionHash).objectId;
            }

            if (metadata) {
              _context25.next = 12;
              break;
            }

            _context25.next = 6;
            return this.ContentObjectMetadata({
              libraryId: libraryId,
              objectId: objectId,
              versionHash: versionHash,
              metadataSubtree: "public/asset_metadata",
              resolveLinks: true,
              linkDepthLimit: 2,
              resolveIgnoreErrors: true,
              produceLinkUrls: produceLinkUrls,
              noAuth: noAuth
            });

          case 6:
            _context25.t0 = _context25.sent;

            if (_context25.t0) {
              _context25.next = 9;
              break;
            }

            _context25.t0 = {};

          case 9:
            metadata = _context25.t0;
            _context25.next = 16;
            break;

          case 12:
            if (!produceLinkUrls) {
              _context25.next = 16;
              break;
            }

            _context25.next = 15;
            return this.ProduceMetadataLinks({
              libraryId: libraryId,
              objectId: objectId,
              versionHash: versionHash,
              path: UrlJoin("public", "asset_metadata"),
              metadata: metadata,
              noAuth: noAuth
            });

          case 15:
            metadata = _context25.sent;

          case 16:
            if (!metadata.info) {
              metadata.info = {};
            }

            mergedMetadata = _objectSpread({}, metadata);

            if (localization) {
              localization.reverse().forEach(function (keys) {
                var _this8$utils;

                var localizedMetadata = (_this8$utils = _this8.utils).SafeTraverse.apply(_this8$utils, [metadata].concat(_toConsumableArray(keys))) || {};
                mergedMetadata = MergeWith({}, mergedMetadata, localizedMetadata, function (a, b) {
                  return b === null || b === "" ? a : undefined;
                });
              });
            }

            return _context25.abrupt("return", mergedMetadata);

          case 20:
          case "end":
            return _context25.stop();
        }
      }
    }, _callee25, this);
  }));

  return function (_x26) {
    return _ref43.apply(this, arguments);
  };
}();
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


exports.ContentObjectVersions = /*#__PURE__*/function () {
  var _ref45 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee26(_ref44) {
    var libraryId, objectId, path;
    return _regeneratorRuntime.wrap(function _callee26$(_context26) {
      while (1) {
        switch (_context26.prev = _context26.next) {
          case 0:
            libraryId = _ref44.libraryId, objectId = _ref44.objectId;
            ValidateParameters({
              libraryId: libraryId,
              objectId: objectId
            });
            this.Log("Retrieving content object versions: ".concat(libraryId || "", " ").concat(objectId));
            path = UrlJoin("qid", objectId);
            _context26.t0 = this.utils;
            _context26.t1 = this.HttpClient;
            _context26.next = 8;
            return this.authClient.AuthorizationHeader({
              libraryId: libraryId,
              objectId: objectId
            });

          case 8:
            _context26.t2 = _context26.sent;
            _context26.t3 = path;
            _context26.t4 = {
              headers: _context26.t2,
              method: "GET",
              path: _context26.t3
            };
            _context26.t5 = _context26.t1.Request.call(_context26.t1, _context26.t4);
            return _context26.abrupt("return", _context26.t0.ResponseToJson.call(_context26.t0, _context26.t5));

          case 13:
          case "end":
            return _context26.stop();
        }
      }
    }, _callee26, this);
  }));

  return function (_x27) {
    return _ref45.apply(this, arguments);
  };
}();
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


exports.LatestVersionHash = /*#__PURE__*/function () {
  var _ref47 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee27(_ref46) {
    var objectId, versionHash, latestHash, versionCount;
    return _regeneratorRuntime.wrap(function _callee27$(_context27) {
      while (1) {
        switch (_context27.prev = _context27.next) {
          case 0:
            objectId = _ref46.objectId, versionHash = _ref46.versionHash;

            if (versionHash) {
              objectId = this.utils.DecodeVersionHash(versionHash).objectId;
            }

            ValidateObject(objectId);
            _context27.prev = 3;
            _context27.next = 6;
            return this.CallContractMethod({
              contractAddress: this.utils.HashToAddress(objectId),
              methodName: "objectHash"
            });

          case 6:
            latestHash = _context27.sent;
            _context27.next = 11;
            break;

          case 9:
            _context27.prev = 9;
            _context27.t0 = _context27["catch"](3);

          case 11:
            if (latestHash) {
              _context27.next = 20;
              break;
            }

            _context27.next = 14;
            return this.CallContractMethod({
              contractAddress: this.utils.HashToAddress(objectId),
              methodName: "countVersionHashes"
            });

          case 14:
            versionCount = _context27.sent;

            if (versionCount.toNumber()) {
              _context27.next = 17;
              break;
            }

            throw Error("Unable to determine latest version hash for ".concat(versionHash || objectId, " - Item deleted?"));

          case 17:
            _context27.next = 19;
            return this.CallContractMethod({
              contractAddress: this.utils.HashToAddress(objectId),
              methodName: "versionHashes",
              methodArgs: [versionCount - 1]
            });

          case 19:
            latestHash = _context27.sent;

          case 20:
            return _context27.abrupt("return", latestHash);

          case 21:
          case "end":
            return _context27.stop();
        }
      }
    }, _callee27, this, [[3, 9]]);
  }));

  return function (_x28) {
    return _ref47.apply(this, arguments);
  };
}();
/* URL Methods */

/**
 * Determine available DRM types available in this browser environment.
 *
 * @methodGroup Media
 * @return {Promise<Array<string>>}
 */


exports.AvailableDRMs = /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee28() {
  var availableDRMs, info, version, major, minor, _version, _major, _minor, config;

  return _regeneratorRuntime.wrap(function _callee28$(_context28) {
    while (1) {
      switch (_context28.prev = _context28.next) {
        case 0:
          availableDRMs = ["clear", "aes-128"];

          if (!(typeof window === "undefined")) {
            _context28.next = 3;
            break;
          }

          return _context28.abrupt("return", availableDRMs);

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
            _context28.next = 6;
            break;
          }

          return _context28.abrupt("return", availableDRMs);

        case 6:
          _context28.prev = 6;
          config = [{
            initDataTypes: ["cenc"],
            audioCapabilities: [{
              contentType: "audio/mp4;codecs=\"mp4a.40.2\""
            }],
            videoCapabilities: [{
              contentType: "video/mp4;codecs=\"avc1.42E01E\""
            }]
          }];
          _context28.next = 10;
          return navigator.requestMediaKeySystemAccess("com.widevine.alpha", config);

        case 10:
          availableDRMs.push("widevine"); // eslint-disable-next-line no-empty

          _context28.next = 15;
          break;

        case 13:
          _context28.prev = 13;
          _context28.t0 = _context28["catch"](6);

        case 15:
          return _context28.abrupt("return", availableDRMs);

        case 16:
        case "end":
          return _context28.stop();
      }
    }
  }, _callee28, null, [[6, 13]]);
}));

exports.PlayoutPathResolution = /*#__PURE__*/function () {
  var _ref50 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee29(_ref49) {
    var libraryId, objectId, versionHash, writeToken, linkPath, handler, _ref49$offering, offering, _ref49$signedLink, signedLink, authorizationToken, path, linkTargetLibraryId, linkTargetId, linkTargetHash, multiOfferingLink, linkInfo;

    return _regeneratorRuntime.wrap(function _callee29$(_context29) {
      while (1) {
        switch (_context29.prev = _context29.next) {
          case 0:
            libraryId = _ref49.libraryId, objectId = _ref49.objectId, versionHash = _ref49.versionHash, writeToken = _ref49.writeToken, linkPath = _ref49.linkPath, handler = _ref49.handler, _ref49$offering = _ref49.offering, offering = _ref49$offering === void 0 ? "" : _ref49$offering, _ref49$signedLink = _ref49.signedLink, signedLink = _ref49$signedLink === void 0 ? false : _ref49$signedLink, authorizationToken = _ref49.authorizationToken;

            if (libraryId) {
              _context29.next = 5;
              break;
            }

            _context29.next = 4;
            return this.ContentObjectLibraryId({
              objectId: objectId
            });

          case 4:
            libraryId = _context29.sent;

          case 5:
            if (versionHash) {
              _context29.next = 9;
              break;
            }

            _context29.next = 8;
            return this.LatestVersionHash({
              objectId: objectId
            });

          case 8:
            versionHash = _context29.sent;

          case 9:
            path = UrlJoin("qlibs", libraryId, "q", writeToken || versionHash, "rep", handler, offering, "options.json");

            if (!linkPath) {
              _context29.next = 26;
              break;
            }

            _context29.next = 13;
            return this.ContentObjectMetadata({
              libraryId: libraryId,
              objectId: objectId,
              versionHash: versionHash,
              writeToken: writeToken,
              metadataSubtree: linkPath,
              resolveLinks: false,
              resolveIgnoreErrors: true,
              resolveIncludeSource: true,
              authorizationToken: authorizationToken
            });

          case 13:
            linkInfo = _context29.sent;
            multiOfferingLink = !!linkInfo && !!linkInfo["/"] && !linkInfo["/"].endsWith("options.json"); // Default case: Use link path directly

            path = UrlJoin("qlibs", libraryId, "q", writeToken || versionHash, "meta", linkPath);

            if (signedLink) {
              _context29.next = 25;
              break;
            }

            _context29.next = 19;
            return this.LinkTarget({
              libraryId: libraryId,
              objectId: objectId,
              versionHash: versionHash,
              writeToken: writeToken,
              linkPath: linkPath,
              linkInfo: linkInfo,
              authorizationToken: authorizationToken
            });

          case 19:
            linkTargetHash = _context29.sent;
            linkTargetId = this.utils.DecodeVersionHash(linkTargetHash).objectId;
            _context29.next = 23;
            return this.ContentObjectLibraryId({
              objectId: linkTargetId
            });

          case 23:
            linkTargetLibraryId = _context29.sent;

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
            return _context29.abrupt("return", {
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
            return _context29.stop();
        }
      }
    }, _callee29, this);
  }));

  return function (_x29) {
    return _ref50.apply(this, arguments);
  };
}();
/**
 * Retrieve available playout offerings for the specified content
 *
 * @methodGroup Media
 * @param {string=} objectId - Id of the content
 * @param {string=} versionHash - Version hash of the content
 * @param {string=} writeToken - Write token for the content
 * @param {string=} linkPath - If playing from a link, the path to the link
 * @param {boolean=} signedLink - Specify if linkPath is referring to a signed link
 * @param {boolean=} directLink - Specify if linkPath is pointing directly to the offerings endpoint
 * @param {string=} handler=playout - The handler to use for playout (not used with links)
 * @param {Object=} authorizationToken - Additional authorization token for authorizing this request
 *
 * @return {Promise<Object>} - The available offerings
 */


exports.AvailableOfferings = /*#__PURE__*/function () {
  var _ref52 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee30(_ref51) {
    var objectId, versionHash, writeToken, linkPath, signedLink, directLink, _ref51$handler, handler, authorizationToken, _yield$this$PlayoutPa, path, authorization;

    return _regeneratorRuntime.wrap(function _callee30$(_context30) {
      while (1) {
        switch (_context30.prev = _context30.next) {
          case 0:
            objectId = _ref51.objectId, versionHash = _ref51.versionHash, writeToken = _ref51.writeToken, linkPath = _ref51.linkPath, signedLink = _ref51.signedLink, directLink = _ref51.directLink, _ref51$handler = _ref51.handler, handler = _ref51$handler === void 0 ? "playout" : _ref51$handler, authorizationToken = _ref51.authorizationToken;

            if (!objectId) {
              objectId = this.utils.DecodeVersionHash(versionHash).objectId;
            }

            if (!directLink) {
              _context30.next = 15;
              break;
            }

            _context30.t0 = this;
            _context30.next = 6;
            return this.ContentObjectLibraryId({
              objectId: objectId
            });

          case 6:
            _context30.t1 = _context30.sent;
            _context30.t2 = objectId;
            _context30.t3 = versionHash;
            _context30.t4 = linkPath;
            _context30.t5 = authorizationToken;
            _context30.t6 = {
              libraryId: _context30.t1,
              objectId: _context30.t2,
              versionHash: _context30.t3,
              metadataSubtree: _context30.t4,
              resolveLinks: true,
              authorizationToken: _context30.t5
            };
            _context30.next = 14;
            return _context30.t0.ContentObjectMetadata.call(_context30.t0, _context30.t6);

          case 14:
            return _context30.abrupt("return", _context30.sent);

          case 15:
            _context30.next = 17;
            return this.PlayoutPathResolution({
              objectId: objectId,
              versionHash: versionHash,
              writeToken: writeToken,
              linkPath: linkPath,
              signedLink: signedLink,
              handler: handler,
              authorizationToken: authorizationToken
            });

          case 17:
            _yield$this$PlayoutPa = _context30.sent;
            path = _yield$this$PlayoutPa.path;
            _context30.prev = 19;
            _context30.t7 = authorizationToken;
            _context30.next = 23;
            return this.authClient.AuthorizationToken({
              objectId: objectId,
              channelAuth: true,
              oauthToken: this.oauthToken
            });

          case 23:
            _context30.t8 = _context30.sent;
            authorization = [_context30.t7, _context30.t8].flat().filter(function (token) {
              return token;
            });
            _context30.next = 27;
            return this.utils.ResponseToJson(this.HttpClient.Request({
              path: path,
              method: "GET",
              headers: {
                Authorization: "Bearer ".concat(authorization.join(","))
              }
            }));

          case 27:
            return _context30.abrupt("return", _context30.sent);

          case 30:
            _context30.prev = 30;
            _context30.t9 = _context30["catch"](19);

            if (!(_context30.t9.status && parseInt(_context30.t9.status) === 500)) {
              _context30.next = 34;
              break;
            }

            return _context30.abrupt("return", {});

          case 34:
            throw _context30.t9;

          case 35:
          case "end":
            return _context30.stop();
        }
      }
    }, _callee30, this, [[19, 30]]);
  }));

  return function (_x30) {
    return _ref52.apply(this, arguments);
  };
}();
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
 * @param {string=} offeringURI - A URI pointing directly to the playout options endpoint
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
 * @param {Object=} options - Additional query parameters to pass when requesting available playout options, such as clipping parameters.
 */


exports.PlayoutOptions = /*#__PURE__*/function () {
  var _ref54 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee33(_ref53) {
    var _this9 = this;

    var offeringURI, objectId, versionHash, writeToken, linkPath, _ref53$signedLink, signedLink, _ref53$protocols, protocols, _ref53$handler, handler, _ref53$offering, offering, playoutType, _ref53$drms, drms, context, _ref53$hlsjsProfile, hlsjsProfile, authorizationToken, _ref53$options, options, uriInfo, libraryId, offeringPath, link, _yield$this$PlayoutPa2, path, linkTarget, audienceData, authorization, queryParams, playoutOptions, playoutMap, sessionId, multiview, i, option, protocol, drm, playoutPath, licenseServers, cert, method, certUrl, protocolMatch, drmMatch;

    return _regeneratorRuntime.wrap(function _callee33$(_context33) {
      while (1) {
        switch (_context33.prev = _context33.next) {
          case 0:
            offeringURI = _ref53.offeringURI, objectId = _ref53.objectId, versionHash = _ref53.versionHash, writeToken = _ref53.writeToken, linkPath = _ref53.linkPath, _ref53$signedLink = _ref53.signedLink, signedLink = _ref53$signedLink === void 0 ? false : _ref53$signedLink, _ref53$protocols = _ref53.protocols, protocols = _ref53$protocols === void 0 ? ["dash", "hls"] : _ref53$protocols, _ref53$handler = _ref53.handler, handler = _ref53$handler === void 0 ? "playout" : _ref53$handler, _ref53$offering = _ref53.offering, offering = _ref53$offering === void 0 ? "default" : _ref53$offering, playoutType = _ref53.playoutType, _ref53$drms = _ref53.drms, drms = _ref53$drms === void 0 ? [] : _ref53$drms, context = _ref53.context, _ref53$hlsjsProfile = _ref53.hlsjsProfile, hlsjsProfile = _ref53$hlsjsProfile === void 0 ? true : _ref53$hlsjsProfile, authorizationToken = _ref53.authorizationToken, _ref53$options = _ref53.options, options = _ref53$options === void 0 ? {} : _ref53$options;

            if (!offeringURI) {
              _context33.next = 8;
              break;
            }

            uriInfo = offeringURI.match(/(hq__[^/]+)\/rep\/([^/]+)\/([^/]+)\/options.json/);
            versionHash = uriInfo[1];
            handler = uriInfo[2];
            offering = uriInfo[3];

            if (!(!versionHash || !handler || !offering)) {
              _context33.next = 8;
              break;
            }

            throw Error("Invalid offering URI: ".concat(offeringURI));

          case 8:
            versionHash ? ValidateVersion(versionHash) : ValidateObject(objectId);
            protocols = protocols.map(function (p) {
              return p.toLowerCase();
            });
            drms = drms.map(function (d) {
              return d.toLowerCase();
            });

            if (objectId) {
              _context33.next = 15;
              break;
            }

            objectId = this.utils.DecodeVersionHash(versionHash).objectId;
            _context33.next = 19;
            break;

          case 15:
            if (versionHash) {
              _context33.next = 19;
              break;
            }

            _context33.next = 18;
            return this.LatestVersionHash({
              objectId: objectId
            });

          case 18:
            versionHash = _context33.sent;

          case 19:
            _context33.next = 21;
            return this.ContentObjectLibraryId({
              objectId: objectId
            });

          case 21:
            libraryId = _context33.sent;
            _context33.prev = 22;

            if (linkPath) {
              _context33.next = 29;
              break;
            }

            offeringPath = UrlJoin("public", "asset_metadata", "sources", offering);
            _context33.next = 27;
            return this.ContentObjectMetadata({
              libraryId: libraryId,
              objectId: objectId,
              versionHash: versionHash,
              metadataSubtree: offeringPath,
              authorizationToken: authorizationToken
            });

          case 27:
            link = _context33.sent;

            if (link) {
              linkPath = offeringPath;
            }

          case 29:
            _context33.next = 33;
            break;

          case 31:
            _context33.prev = 31;
            _context33.t0 = _context33["catch"](22);

          case 33:
            _context33.next = 35;
            return this.PlayoutPathResolution({
              libraryId: libraryId,
              objectId: objectId,
              versionHash: versionHash,
              writeToken: writeToken,
              linkPath: linkPath,
              signedLink: signedLink,
              handler: handler,
              offering: offering,
              authorizationToken: authorizationToken
            });

          case 35:
            _yield$this$PlayoutPa2 = _context33.sent;
            path = _yield$this$PlayoutPa2.path;
            linkTarget = _yield$this$PlayoutPa2.linkTarget;
            _context33.t1 = this.authClient;
            _context33.t2 = linkTarget.objectId || objectId;
            _context33.t3 = linkTarget.versionHash || versionHash;

            if (_context33.t3) {
              _context33.next = 45;
              break;
            }

            _context33.next = 44;
            return this.LatestVersionHash({
              objectId: objectId
            });

          case 44:
            _context33.t3 = _context33.sent;

          case 45:
            _context33.t4 = _context33.t3;
            _context33.t5 = protocols;
            _context33.t6 = drms;
            _context33.t7 = context;
            _context33.t8 = {
              objectId: _context33.t2,
              versionHash: _context33.t4,
              protocols: _context33.t5,
              drms: _context33.t6,
              context: _context33.t7
            };
            audienceData = _context33.t1.AudienceData.call(_context33.t1, _context33.t8);
            _context33.t9 = authorizationToken;
            _context33.next = 54;
            return this.authClient.AuthorizationToken({
              libraryId: libraryId,
              objectId: objectId,
              channelAuth: true,
              oauthToken: this.oauthToken,
              audienceData: audienceData
            });

          case 54:
            _context33.t10 = _context33.sent;
            authorization = [_context33.t9, _context33.t10].flat().filter(function (token) {
              return token;
            });
            queryParams = _objectSpread({
              authorization: authorization,
              resolve: !!linkPath
            }, options);
            _context33.t11 = Object;
            _context33.next = 60;
            return this.utils.ResponseToJson(this.HttpClient.Request({
              path: path,
              method: "GET",
              queryParams: queryParams
            }));

          case 60:
            _context33.t12 = _context33.sent;
            playoutOptions = _context33.t11.values.call(_context33.t11, _context33.t12);

            if (!(!signedLink && linkTarget.versionHash)) {
              _context33.next = 68;
              break;
            }

            _context33.t13 = authorizationToken;
            _context33.next = 66;
            return this.authClient.AuthorizationToken({
              libraryId: linkTarget.libraryId,
              objectId: linkTarget.objectId,
              channelAuth: true,
              oauthToken: this.oauthToken,
              audienceData: audienceData
            });

          case 66:
            _context33.t14 = _context33.sent;
            queryParams.authorization = [_context33.t13, _context33.t14].flat().filter(function (token) {
              return token;
            });

          case 68:
            playoutMap = {};
            i = 0;

          case 70:
            if (!(i < playoutOptions.length)) {
              _context33.next = 116;
              break;
            }

            option = playoutOptions[i];
            protocol = option.properties.protocol;
            drm = option.properties.drm;
            sessionId = sessionId || option.sid;
            multiview = multiview || !!option.properties.multiview;

            if (sessionId) {
              queryParams.sid = sessionId;
            } // Remove authorization parameter from playout path - it's re-added by Rep


            playoutPath = option.uri.split("?")[0];

            if (playoutType) {
              playoutPath = playoutPath.replace("playlist", "playlist-".concat(playoutType));
            }

            licenseServers = option.properties.license_servers;
            cert = option.properties.cert;

            if (hlsjsProfile && protocol === "hls" && drm === "aes-128") {
              queryParams.player_profile = "hls-js";
            } // Create full playout URLs for this protocol / drm combo


            _context33.t15 = _objectSpread;
            _context33.t16 = _objectSpread({}, playoutMap[protocol] || {});
            _context33.t17 = {};
            _context33.t18 = _objectSpread;
            _context33.t19 = _objectSpread({}, (playoutMap[protocol] || {}).playoutMethods || {});
            _context33.t20 = {};
            _context33.t21 = _defineProperty;
            _context33.t22 = {};
            _context33.t23 = drm || "clear";

            if (!signedLink) {
              _context33.next = 97;
              break;
            }

            _context33.next = 94;
            return this.LinkUrl({
              versionHash: versionHash,
              linkPath: UrlJoin(linkPath, offering, playoutPath),
              queryParams: queryParams,
              noAuth: true
            });

          case 94:
            _context33.t24 = _context33.sent;
            _context33.next = 100;
            break;

          case 97:
            _context33.next = 99;
            return this.Rep({
              libraryId: linkTarget.libraryId || libraryId,
              objectId: linkTarget.objectId || objectId,
              versionHash: linkTarget.versionHash || versionHash,
              rep: UrlJoin(handler, offering, playoutPath),
              noAuth: true,
              queryParams: queryParams
            });

          case 99:
            _context33.t24 = _context33.sent;

          case 100:
            _context33.t25 = _context33.t24;
            _context33.t26 = drm ? _defineProperty({}, drm, {
              licenseServers: licenseServers,
              cert: cert
            }) : undefined;
            _context33.t27 = {
              playoutUrl: _context33.t25,
              drms: _context33.t26
            };
            _context33.t28 = (0, _context33.t21)(_context33.t22, _context33.t23, _context33.t27);
            _context33.t29 = (0, _context33.t18)(_context33.t19, _context33.t20, _context33.t28);
            _context33.t30 = {
              playoutMethods: _context33.t29
            };
            playoutMap[protocol] = (0, _context33.t15)(_context33.t16, _context33.t17, _context33.t30);

            // Add .cert_url if playoutMap[protocol].playoutMethods[].drms[].cert is present
            // (for clients that need cert supplied as a URL reference rather than as a string literal)
            for (method in playoutMap[protocol].playoutMethods) {
              if (playoutMap[protocol].playoutMethods[method].drms && playoutMap[protocol].playoutMethods[method].drms[drm] && playoutMap[protocol].playoutMethods[method].drms[drm].cert) {
                // construct by replacing last part of playout URL path (e.g. "playlist.m3u8", "live.m3u8") with "drm.cert"
                certUrl = new URL(playoutMap[protocol].playoutMethods[method].playoutUrl);
                certUrl.pathname = certUrl.pathname.split("/").slice(0, -1).concat(["drm.cert"]).join("/");
                playoutMap[protocol].playoutMethods[method].drms[drm].cert_url = certUrl.toString();
              }
            } // Exclude any options that do not satisfy the specified protocols and/or DRMs


            protocolMatch = protocols.includes(protocol);
            drmMatch = drms.includes(drm || "clear") || drms.length === 0 && !drm;

            if (!(!protocolMatch || !drmMatch)) {
              _context33.next = 112;
              break;
            }

            return _context33.abrupt("continue", 113);

          case 112:
            // This protocol / DRM satisfies the specifications (prefer DRM over clear, if available)
            if (!playoutMap[protocol].playoutUrl || drm && drm !== "clear") {
              playoutMap[protocol].playoutUrl = playoutMap[protocol].playoutMethods[drm || "clear"].playoutUrl;
              playoutMap[protocol].drms = playoutMap[protocol].playoutMethods[drm || "clear"].drms;
            }

          case 113:
            i++;
            _context33.next = 70;
            break;

          case 116:
            // Callbacks for retrieving and setting multiview views
            if (multiview && sessionId) {
              playoutMap.sessionId = sessionId;
              playoutMap.multiview = true;
              playoutMap.AvailableViews = /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee31() {
                return _regeneratorRuntime.wrap(function _callee31$(_context31) {
                  while (1) {
                    switch (_context31.prev = _context31.next) {
                      case 0:
                        _context31.t0 = _this9.utils;
                        _context31.next = 3;
                        return _this9.HttpClient.Request({
                          path: UrlJoin("q", linkTarget.versionHash || versionHash, "rep", handler, offering, "views.json"),
                          method: "GET",
                          queryParams: {
                            sid: sessionId,
                            authorization: authorization
                          }
                        });

                      case 3:
                        _context31.t1 = _context31.sent;
                        _context31.next = 6;
                        return _context31.t0.ResponseToFormat.call(_context31.t0, "json", _context31.t1);

                      case 6:
                        return _context31.abrupt("return", _context31.sent);

                      case 7:
                      case "end":
                        return _context31.stop();
                    }
                  }
                }, _callee31);
              }));

              playoutMap.SwitchView = /*#__PURE__*/function () {
                var _ref57 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee32(view) {
                  return _regeneratorRuntime.wrap(function _callee32$(_context32) {
                    while (1) {
                      switch (_context32.prev = _context32.next) {
                        case 0:
                          _context32.next = 2;
                          return _this9.HttpClient.Request({
                            path: UrlJoin("q", linkTarget.versionHash || versionHash, "rep", handler, offering, "select_view"),
                            method: "POST",
                            queryParams: {
                              sid: sessionId,
                              authorization: authorization
                            },
                            body: {
                              view: view
                            }
                          });

                        case 2:
                        case "end":
                          return _context32.stop();
                      }
                    }
                  }, _callee32);
                }));

                return function (_x32) {
                  return _ref57.apply(this, arguments);
                };
              }();
            }

            this.Log(playoutMap);
            return _context33.abrupt("return", playoutMap);

          case 119:
          case "end":
            return _context33.stop();
        }
      }
    }, _callee33, this, [[22, 31]]);
  }));

  return function (_x31) {
    return _ref54.apply(this, arguments);
  };
}();
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
 * @param {Object=} options - Additional query parameters to pass when requesting available playout options, such as clipping parameters.
 */


exports.BitmovinPlayoutOptions = /*#__PURE__*/function () {
  var _ref59 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee34(_ref58) {
    var objectId, versionHash, writeToken, linkPath, _ref58$signedLink, signedLink, _ref58$protocols, protocols, _ref58$drms, drms, _ref58$handler, handler, _ref58$offering, offering, playoutType, context, authorizationToken, _ref58$options, options, playoutOptions, _yield$this$PlayoutPa3, linkTarget, authorization, config;

    return _regeneratorRuntime.wrap(function _callee34$(_context34) {
      while (1) {
        switch (_context34.prev = _context34.next) {
          case 0:
            objectId = _ref58.objectId, versionHash = _ref58.versionHash, writeToken = _ref58.writeToken, linkPath = _ref58.linkPath, _ref58$signedLink = _ref58.signedLink, signedLink = _ref58$signedLink === void 0 ? false : _ref58$signedLink, _ref58$protocols = _ref58.protocols, protocols = _ref58$protocols === void 0 ? ["dash", "hls"] : _ref58$protocols, _ref58$drms = _ref58.drms, drms = _ref58$drms === void 0 ? [] : _ref58$drms, _ref58$handler = _ref58.handler, handler = _ref58$handler === void 0 ? "playout" : _ref58$handler, _ref58$offering = _ref58.offering, offering = _ref58$offering === void 0 ? "default" : _ref58$offering, playoutType = _ref58.playoutType, context = _ref58.context, authorizationToken = _ref58.authorizationToken, _ref58$options = _ref58.options, options = _ref58$options === void 0 ? {} : _ref58$options;
            versionHash ? ValidateVersion(versionHash) : ValidateObject(objectId);

            if (!objectId) {
              objectId = this.utils.DecodeVersionHash(versionHash).objectId;
            }

            _context34.next = 5;
            return this.PlayoutOptions({
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
              authorizationToken: authorizationToken,
              options: options
            });

          case 5:
            playoutOptions = _context34.sent;
            delete playoutOptions.playoutMethods;
            _context34.next = 9;
            return this.PlayoutPathResolution({
              objectId: objectId,
              versionHash: versionHash,
              writeToken: writeToken,
              linkPath: linkPath,
              signedLink: signedLink,
              handler: handler,
              offering: offering,
              authorizationToken: authorizationToken
            });

          case 9:
            _yield$this$PlayoutPa3 = _context34.sent;
            linkTarget = _yield$this$PlayoutPa3.linkTarget;
            authorization = [];

            if (authorizationToken) {
              authorization.push(authorizationToken);
            }

            if (!(signedLink || !linkTarget.versionHash)) {
              _context34.next = 21;
              break;
            }

            _context34.t0 = authorization;
            _context34.next = 17;
            return this.authClient.AuthorizationToken({
              objectId: objectId,
              channelAuth: true,
              oauthToken: this.oauthToken
            });

          case 17:
            _context34.t1 = _context34.sent;

            _context34.t0.push.call(_context34.t0, _context34.t1);

            _context34.next = 26;
            break;

          case 21:
            _context34.t2 = authorization;
            _context34.next = 24;
            return this.authClient.AuthorizationToken({
              libraryId: linkTarget.libraryId,
              objectId: linkTarget.objectId,
              channelAuth: true,
              oauthToken: this.oauthToken
            });

          case 24:
            _context34.t3 = _context34.sent;

            _context34.t2.push.call(_context34.t2, _context34.t3);

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
            return _context34.abrupt("return", config);

          case 29:
          case "end":
            return _context34.stop();
        }
      }
    }, _callee34, this);
  }));

  return function (_x33) {
    return _ref59.apply(this, arguments);
  };
}();
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


exports.CallBitcodeMethod = /*#__PURE__*/function () {
  var _ref61 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee35(_ref60) {
    var libraryId, objectId, versionHash, writeToken, method, _ref60$queryParams, queryParams, _ref60$body, body, _ref60$headers, headers, _ref60$constant, constant, _ref60$format, format, path, authHeader;

    return _regeneratorRuntime.wrap(function _callee35$(_context35) {
      while (1) {
        switch (_context35.prev = _context35.next) {
          case 0:
            libraryId = _ref60.libraryId, objectId = _ref60.objectId, versionHash = _ref60.versionHash, writeToken = _ref60.writeToken, method = _ref60.method, _ref60$queryParams = _ref60.queryParams, queryParams = _ref60$queryParams === void 0 ? {} : _ref60$queryParams, _ref60$body = _ref60.body, body = _ref60$body === void 0 ? {} : _ref60$body, _ref60$headers = _ref60.headers, headers = _ref60$headers === void 0 ? {} : _ref60$headers, _ref60$constant = _ref60.constant, constant = _ref60$constant === void 0 ? true : _ref60$constant, _ref60$format = _ref60.format, format = _ref60$format === void 0 ? "json" : _ref60$format;
            ValidateParameters({
              libraryId: libraryId,
              objectId: objectId,
              versionHash: versionHash
            });

            if (method) {
              _context35.next = 4;
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
              _context35.next = 12;
              break;
            }

            _context35.next = 11;
            return this.authClient.AuthorizationHeader({
              libraryId: libraryId,
              objectId: objectId,
              update: !constant
            });

          case 11:
            headers.Authorization = _context35.sent.Authorization;

          case 12:
            this.Log("Calling bitcode method: ".concat(libraryId || "", " ").concat(objectId || versionHash, " ").concat(writeToken || "", "\n      ").concat(constant ? "GET" : "POST", " ").concat(path, "\n      Query Params:\n      ").concat(JSON.stringify(queryParams || ""), "\n      Body:\n      ").concat(JSON.stringify(body || ""), "\n      Headers\n      ").concat(JSON.stringify(headers || "")));
            _context35.t0 = this.utils;
            _context35.t1 = format;
            _context35.next = 17;
            return this.HttpClient.Request({
              body: body,
              headers: headers,
              method: constant ? "GET" : "POST",
              path: path,
              queryParams: queryParams,
              failover: false
            });

          case 17:
            _context35.t2 = _context35.sent;
            return _context35.abrupt("return", _context35.t0.ResponseToFormat.call(_context35.t0, _context35.t1, _context35.t2));

          case 19:
          case "end":
            return _context35.stop();
        }
      }
    }, _callee35, this);
  }));

  return function (_x34) {
    return _ref61.apply(this, arguments);
  };
}();
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


exports.Rep = /*#__PURE__*/function () {
  var _ref63 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee36(_ref62) {
    var libraryId, objectId, versionHash, rep, _ref62$queryParams, queryParams, _ref62$channelAuth, channelAuth, _ref62$noAuth, noAuth, _ref62$noCache, noCache;

    return _regeneratorRuntime.wrap(function _callee36$(_context36) {
      while (1) {
        switch (_context36.prev = _context36.next) {
          case 0:
            libraryId = _ref62.libraryId, objectId = _ref62.objectId, versionHash = _ref62.versionHash, rep = _ref62.rep, _ref62$queryParams = _ref62.queryParams, queryParams = _ref62$queryParams === void 0 ? {} : _ref62$queryParams, _ref62$channelAuth = _ref62.channelAuth, channelAuth = _ref62$channelAuth === void 0 ? false : _ref62$channelAuth, _ref62$noAuth = _ref62.noAuth, noAuth = _ref62$noAuth === void 0 ? false : _ref62$noAuth, _ref62$noCache = _ref62.noCache, noCache = _ref62$noCache === void 0 ? false : _ref62$noCache;
            ValidateParameters({
              libraryId: libraryId,
              objectId: objectId,
              versionHash: versionHash
            });

            if (rep) {
              _context36.next = 4;
              break;
            }

            throw "Rep not specified";

          case 4:
            return _context36.abrupt("return", this.FabricUrl({
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
            return _context36.stop();
        }
      }
    }, _callee36, this);
  }));

  return function (_x35) {
    return _ref63.apply(this, arguments);
  };
}();
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


exports.PublicRep = /*#__PURE__*/function () {
  var _ref65 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee37(_ref64) {
    var libraryId, objectId, versionHash, rep, _ref64$queryParams, queryParams;

    return _regeneratorRuntime.wrap(function _callee37$(_context37) {
      while (1) {
        switch (_context37.prev = _context37.next) {
          case 0:
            libraryId = _ref64.libraryId, objectId = _ref64.objectId, versionHash = _ref64.versionHash, rep = _ref64.rep, _ref64$queryParams = _ref64.queryParams, queryParams = _ref64$queryParams === void 0 ? {} : _ref64$queryParams;
            ValidateParameters({
              libraryId: libraryId,
              objectId: objectId,
              versionHash: versionHash
            });

            if (rep) {
              _context37.next = 4;
              break;
            }

            throw "Rep not specified";

          case 4:
            return _context37.abrupt("return", this.FabricUrl({
              libraryId: libraryId,
              objectId: objectId,
              versionHash: versionHash,
              publicRep: rep,
              queryParams: queryParams,
              noAuth: true
            }));

          case 5:
          case "end":
            return _context37.stop();
        }
      }
    }, _callee37, this);
  }));

  return function (_x36) {
    return _ref65.apply(this, arguments);
  };
}();
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


exports.FabricUrl = /*#__PURE__*/function () {
  var _ref67 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee38(_ref66) {
    var libraryId, objectId, versionHash, writeToken, partHash, rep, publicRep, call, _ref66$queryParams, queryParams, _ref66$channelAuth, channelAuth, _ref66$noAuth, noAuth, _ref66$noCache, noCache, authorization, path;

    return _regeneratorRuntime.wrap(function _callee38$(_context38) {
      while (1) {
        switch (_context38.prev = _context38.next) {
          case 0:
            libraryId = _ref66.libraryId, objectId = _ref66.objectId, versionHash = _ref66.versionHash, writeToken = _ref66.writeToken, partHash = _ref66.partHash, rep = _ref66.rep, publicRep = _ref66.publicRep, call = _ref66.call, _ref66$queryParams = _ref66.queryParams, queryParams = _ref66$queryParams === void 0 ? {} : _ref66$queryParams, _ref66$channelAuth = _ref66.channelAuth, channelAuth = _ref66$channelAuth === void 0 ? false : _ref66$channelAuth, _ref66$noAuth = _ref66.noAuth, noAuth = _ref66$noAuth === void 0 ? false : _ref66$noAuth, _ref66$noCache = _ref66.noCache, noCache = _ref66$noCache === void 0 ? false : _ref66$noCache;

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
            authorization = [];

            if (queryParams.authorization) {
              authorization.push(queryParams.authorization);
            }

            if (noAuth && queryParams.authorization) {
              _context38.next = 12;
              break;
            }

            _context38.t0 = authorization;
            _context38.next = 10;
            return this.authClient.AuthorizationToken({
              libraryId: libraryId,
              objectId: objectId,
              versionHash: versionHash,
              channelAuth: channelAuth,
              noAuth: noAuth,
              noCache: noCache
            });

          case 10:
            _context38.t1 = _context38.sent;

            _context38.t0.push.call(_context38.t0, _context38.t1);

          case 12:
            // Clone queryParams to avoid modification of the original
            queryParams = _objectSpread(_objectSpread({}, queryParams), {}, {
              authorization: authorization.flat()
            });

            if (!((rep || publicRep) && objectId && !versionHash)) {
              _context38.next = 17;
              break;
            }

            _context38.next = 16;
            return this.LatestVersionHash({
              objectId: objectId
            });

          case 16:
            versionHash = _context38.sent;

          case 17:
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

            return _context38.abrupt("return", this.HttpClient.URL({
              path: path,
              queryParams: queryParams
            }));

          case 21:
          case "end":
            return _context38.stop();
        }
      }
    }, _callee38, this);
  }));

  return function (_x37) {
    return _ref67.apply(this, arguments);
  };
}();
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


exports.FileUrl = /*#__PURE__*/function () {
  var _ref69 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee39(_ref68) {
    var libraryId, objectId, versionHash, writeToken, filePath, _ref68$queryParams, queryParams, _ref68$noCache, noCache, path, authorizationToken, fileInfo, encrypted;

    return _regeneratorRuntime.wrap(function _callee39$(_context39) {
      while (1) {
        switch (_context39.prev = _context39.next) {
          case 0:
            libraryId = _ref68.libraryId, objectId = _ref68.objectId, versionHash = _ref68.versionHash, writeToken = _ref68.writeToken, filePath = _ref68.filePath, _ref68$queryParams = _ref68.queryParams, queryParams = _ref68$queryParams === void 0 ? {} : _ref68$queryParams, _ref68$noCache = _ref68.noCache, noCache = _ref68$noCache === void 0 ? false : _ref68$noCache;
            ValidateParameters({
              libraryId: libraryId,
              objectId: objectId,
              versionHash: versionHash
            });

            if (filePath) {
              _context39.next = 4;
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

            _context39.next = 8;
            return this.authClient.AuthorizationToken({
              libraryId: libraryId,
              objectId: objectId,
              noCache: noCache
            });

          case 8:
            authorizationToken = _context39.sent;
            queryParams = _objectSpread(_objectSpread({}, queryParams), {}, {
              authorization: authorizationToken
            });
            _context39.next = 12;
            return this.ContentObjectMetadata({
              libraryId: libraryId,
              objectId: objectId,
              versionHash: versionHash,
              writeToken: writeToken,
              metadataSubtree: UrlJoin("files", filePath)
            });

          case 12:
            fileInfo = _context39.sent;
            encrypted = fileInfo && fileInfo["."].encryption && fileInfo["."].encryption.scheme === "cgck";

            if (encrypted) {
              path = UrlJoin(path, "rep", "files_download", filePath);
              queryParams["header-x_decryption_mode"] = "decrypt";
            } else {
              path = UrlJoin(path, "files", filePath);
            }

            return _context39.abrupt("return", this.HttpClient.URL({
              path: path,
              queryParams: queryParams
            }));

          case 16:
          case "end":
            return _context39.stop();
        }
      }
    }, _callee39, this);
  }));

  return function (_x38) {
    return _ref69.apply(this, arguments);
  };
}();
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


exports.ContentObjectImageUrl = /*#__PURE__*/function () {
  var _ref71 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee40(_ref70) {
    var libraryId, objectId, versionHash, height, _ref70$imagePath, imagePath, imageMetadata, _queryParams;

    return _regeneratorRuntime.wrap(function _callee40$(_context40) {
      while (1) {
        switch (_context40.prev = _context40.next) {
          case 0:
            libraryId = _ref70.libraryId, objectId = _ref70.objectId, versionHash = _ref70.versionHash, height = _ref70.height, _ref70$imagePath = _ref70.imagePath, imagePath = _ref70$imagePath === void 0 ? "public/display_image" : _ref70$imagePath;
            ValidateParameters({
              libraryId: libraryId,
              objectId: objectId,
              versionHash: versionHash
            });

            if (versionHash) {
              _context40.next = 6;
              break;
            }

            _context40.next = 5;
            return this.LatestVersionHash({
              objectId: objectId
            });

          case 5:
            versionHash = _context40.sent;

          case 6:
            this.Log("Retrieving content object image url: ".concat(libraryId, " ").concat(objectId, " ").concat(versionHash));

            if (this.objectImageUrls[versionHash]) {
              _context40.next = 26;
              break;
            }

            _context40.prev = 8;
            _context40.next = 11;
            return this.ContentObjectMetadata({
              versionHash: versionHash,
              metadataSubtree: imagePath
            });

          case 11:
            imageMetadata = _context40.sent;

            if (imageMetadata) {
              _context40.next = 15;
              break;
            }

            this.Log("No image url set: ".concat(libraryId, " ").concat(objectId, " ").concat(versionHash));
            return _context40.abrupt("return");

          case 15:
            _context40.next = 21;
            break;

          case 17:
            _context40.prev = 17;
            _context40.t0 = _context40["catch"](8);
            this.Log("Unable to query for image metadata: ".concat(libraryId, " ").concat(objectId, " ").concat(versionHash), true);
            this.Log(_context40.t0, true);

          case 21:
            _queryParams = {};

            if (height && !isNaN(parseInt(height))) {
              _queryParams["height"] = parseInt(height);
            }

            _context40.next = 25;
            return this.LinkUrl({
              versionHash: versionHash,
              linkPath: imagePath,
              queryParams: _queryParams
            });

          case 25:
            this.objectImageUrls[versionHash] = _context40.sent;

          case 26:
            return _context40.abrupt("return", this.objectImageUrls[versionHash]);

          case 27:
          case "end":
            return _context40.stop();
        }
      }
    }, _callee40, this, [[8, 17]]);
  }));

  return function (_x39) {
    return _ref71.apply(this, arguments);
  };
}();
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


exports.ContentObjectGraph = /*#__PURE__*/function () {
  var _ref73 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee42(_ref72) {
    var _this10 = this;

    var libraryId, objectId, versionHash, _ref72$autoUpdate, autoUpdate, select, path, errorInfo, cycles, info;

    return _regeneratorRuntime.wrap(function _callee42$(_context42) {
      while (1) {
        switch (_context42.prev = _context42.next) {
          case 0:
            libraryId = _ref72.libraryId, objectId = _ref72.objectId, versionHash = _ref72.versionHash, _ref72$autoUpdate = _ref72.autoUpdate, autoUpdate = _ref72$autoUpdate === void 0 ? false : _ref72$autoUpdate, select = _ref72.select;
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
            _context42.prev = 5;
            _context42.t0 = this.utils;
            _context42.t1 = this.HttpClient;
            _context42.next = 10;
            return this.authClient.AuthorizationHeader({
              libraryId: libraryId,
              objectId: objectId,
              versionHash: versionHash
            });

          case 10:
            _context42.t2 = _context42.sent;
            _context42.t3 = {
              auto_update: autoUpdate,
              select: select
            };
            _context42.t4 = path;
            _context42.t5 = {
              headers: _context42.t2,
              queryParams: _context42.t3,
              method: "GET",
              path: _context42.t4
            };
            _context42.t6 = _context42.t1.Request.call(_context42.t1, _context42.t5);
            _context42.next = 17;
            return _context42.t0.ResponseToJson.call(_context42.t0, _context42.t6);

          case 17:
            return _context42.abrupt("return", _context42.sent);

          case 20:
            _context42.prev = 20;
            _context42.t7 = _context42["catch"](5);
            _context42.prev = 22;
            cycles = _context42.t7.body.errors[0].cause.cause.cause.cycle;

            if (!(!cycles || cycles.length === 0)) {
              _context42.next = 26;
              break;
            }

            throw _context42.t7;

          case 26:
            info = {};
            _context42.next = 29;
            return Promise.all(cycles.map( /*#__PURE__*/function () {
              var _ref74 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee41(cycleHash) {
                var cycleId, name;
                return _regeneratorRuntime.wrap(function _callee41$(_context41) {
                  while (1) {
                    switch (_context41.prev = _context41.next) {
                      case 0:
                        if (!info[cycleHash]) {
                          _context41.next = 2;
                          break;
                        }

                        return _context41.abrupt("return");

                      case 2:
                        cycleId = _this10.utils.DecodeVersionHash(cycleHash).objectId;
                        _context41.next = 5;
                        return _this10.ContentObjectMetadata({
                          versionHash: cycleHash,
                          metadataSubtree: "public/asset_metadata/display_title"
                        });

                      case 5:
                        _context41.t2 = _context41.sent;

                        if (_context41.t2) {
                          _context41.next = 10;
                          break;
                        }

                        _context41.next = 9;
                        return _this10.ContentObjectMetadata({
                          versionHash: cycleHash,
                          metadataSubtree: "public/name"
                        });

                      case 9:
                        _context41.t2 = _context41.sent;

                      case 10:
                        _context41.t1 = _context41.t2;

                        if (_context41.t1) {
                          _context41.next = 15;
                          break;
                        }

                        _context41.next = 14;
                        return _this10.ContentObjectMetadata({
                          versionHash: cycleHash,
                          metadataSubtree: "name"
                        });

                      case 14:
                        _context41.t1 = _context41.sent;

                      case 15:
                        _context41.t0 = _context41.t1;

                        if (_context41.t0) {
                          _context41.next = 18;
                          break;
                        }

                        _context41.t0 = cycleId;

                      case 18:
                        name = _context41.t0;
                        info[cycleHash] = {
                          name: name,
                          objectId: cycleId
                        };

                      case 20:
                      case "end":
                        return _context41.stop();
                    }
                  }
                }, _callee41);
              }));

              return function (_x41) {
                return _ref74.apply(this, arguments);
              };
            }()));

          case 29:
            errorInfo = cycles.map(function (cycleHash) {
              return "".concat(info[cycleHash].name, " (").concat(info[cycleHash].objectId, ")");
            });
            _context42.next = 35;
            break;

          case 32:
            _context42.prev = 32;
            _context42.t8 = _context42["catch"](22);
            throw _context42.t7;

          case 35:
            throw new Error("Cycle found in links: ".concat(errorInfo.join(" -> ")));

          case 36:
          case "end":
            return _context42.stop();
        }
      }
    }, _callee42, this, [[5, 20], [22, 32]]);
  }));

  return function (_x40) {
    return _ref73.apply(this, arguments);
  };
}();
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


exports.LinkTarget = /*#__PURE__*/function () {
  var _ref76 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee43(_ref75) {
    var libraryId, objectId, versionHash, writeToken, linkPath, authorizationToken, linkInfo, targetHash, subPath;
    return _regeneratorRuntime.wrap(function _callee43$(_context43) {
      while (1) {
        switch (_context43.prev = _context43.next) {
          case 0:
            libraryId = _ref75.libraryId, objectId = _ref75.objectId, versionHash = _ref75.versionHash, writeToken = _ref75.writeToken, linkPath = _ref75.linkPath, authorizationToken = _ref75.authorizationToken, linkInfo = _ref75.linkInfo;
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
              _context43.next = 8;
              break;
            }

            _context43.next = 7;
            return this.ContentObjectLibraryId({
              objectId: objectId
            });

          case 7:
            libraryId = _context43.sent;

          case 8:
            if (linkInfo) {
              _context43.next = 12;
              break;
            }

            _context43.next = 11;
            return this.ContentObjectMetadata({
              libraryId: libraryId,
              objectId: objectId,
              versionHash: versionHash,
              writeToken: writeToken,
              metadataSubtree: linkPath,
              resolveLinks: false,
              resolveIgnoreErrors: true,
              resolveIncludeSource: true,
              authorizationToken: authorizationToken
            });

          case 11:
            linkInfo = _context43.sent;

          case 12:
            if (!(linkInfo && linkInfo["/"])) {
              _context43.next = 27;
              break;
            }

            /* For absolute links - extract the hash from the link itself. Otherwise use "container" */
            targetHash = ((linkInfo["/"] || "").match(/^\/?qfab\/([\w]+)\/?.+/) || [])[1];

            if (!targetHash) {
              targetHash = linkInfo["."].container;
            }

            if (!targetHash) {
              _context43.next = 19;
              break;
            }

            return _context43.abrupt("return", targetHash);

          case 19:
            if (!versionHash) {
              _context43.next = 21;
              break;
            }

            return _context43.abrupt("return", versionHash);

          case 21:
            _context43.t0 = versionHash;

            if (_context43.t0) {
              _context43.next = 26;
              break;
            }

            _context43.next = 25;
            return this.LatestVersionHash({
              objectId: objectId
            });

          case 25:
            _context43.t0 = _context43.sent;

          case 26:
            return _context43.abrupt("return", _context43.t0);

          case 27:
            _context43.next = 29;
            return this.ContentObjectMetadata({
              libraryId: libraryId,
              objectId: objectId,
              versionHash: versionHash,
              writeToken: writeToken,
              metadataSubtree: linkPath,
              resolveIncludeSource: true,
              authorizationToken: authorizationToken
            });

          case 29:
            linkInfo = _context43.sent;

            if (!(!linkInfo || !linkInfo["."])) {
              _context43.next = 49;
              break;
            }

            if (!(_typeof(linkInfo) === "object")) {
              _context43.next = 38;
              break;
            }

            _context43.t1 = versionHash;

            if (_context43.t1) {
              _context43.next = 37;
              break;
            }

            _context43.next = 36;
            return this.LatestVersionHash({
              objectId: objectId
            });

          case 36:
            _context43.t1 = _context43.sent;

          case 37:
            return _context43.abrupt("return", _context43.t1);

          case 38:
            // linkPath is not a direct link, but points to a literal value - back up one path element to find the container
            subPath = linkPath.split("/").slice(0, -1).join("/");

            if (subPath) {
              _context43.next = 46;
              break;
            }

            _context43.t2 = versionHash;

            if (_context43.t2) {
              _context43.next = 45;
              break;
            }

            _context43.next = 44;
            return this.LatestVersionHash({
              objectId: objectId
            });

          case 44:
            _context43.t2 = _context43.sent;

          case 45:
            return _context43.abrupt("return", _context43.t2);

          case 46:
            _context43.next = 48;
            return this.ContentObjectMetadata({
              libraryId: libraryId,
              objectId: objectId,
              versionHash: versionHash,
              writeToken: writeToken,
              metadataSubtree: subPath,
              resolveIncludeSource: true,
              authorizationToken: authorizationToken
            });

          case 48:
            linkInfo = _context43.sent;

          case 49:
            return _context43.abrupt("return", linkInfo["."].source);

          case 50:
          case "end":
            return _context43.stop();
        }
      }
    }, _callee43, this);
  }));

  return function (_x42) {
    return _ref76.apply(this, arguments);
  };
}();
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


exports.LinkUrl = /*#__PURE__*/function () {
  var _ref78 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee44(_ref77) {
    var libraryId, objectId, versionHash, writeToken, linkPath, mimeType, authorizationToken, _ref77$queryParams, queryParams, _ref77$channelAuth, channelAuth, _ref77$noAuth, noAuth, path, authorization;

    return _regeneratorRuntime.wrap(function _callee44$(_context44) {
      while (1) {
        switch (_context44.prev = _context44.next) {
          case 0:
            libraryId = _ref77.libraryId, objectId = _ref77.objectId, versionHash = _ref77.versionHash, writeToken = _ref77.writeToken, linkPath = _ref77.linkPath, mimeType = _ref77.mimeType, authorizationToken = _ref77.authorizationToken, _ref77$queryParams = _ref77.queryParams, queryParams = _ref77$queryParams === void 0 ? {} : _ref77$queryParams, _ref77$channelAuth = _ref77.channelAuth, channelAuth = _ref77$channelAuth === void 0 ? false : _ref77$channelAuth, _ref77$noAuth = _ref77.noAuth, noAuth = _ref77$noAuth === void 0 ? false : _ref77$noAuth;
            ValidateParameters({
              libraryId: libraryId,
              objectId: objectId,
              versionHash: versionHash
            });

            if (writeToken) {
              ValidateWriteToken(writeToken);
            }

            if (linkPath) {
              _context44.next = 5;
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
            _context44.t0 = authorization;
            _context44.next = 11;
            return this.MetadataAuth({
              libraryId: libraryId,
              objectId: objectId,
              versionHash: versionHash,
              path: linkPath,
              channelAuth: channelAuth,
              noAuth: noAuth
            });

          case 11:
            _context44.t1 = _context44.sent;

            _context44.t0.push.call(_context44.t0, _context44.t1);

            if (queryParams.authorization) {
              authorization.push(queryParams.authorization);
            }

            queryParams = _objectSpread(_objectSpread({}, queryParams), {}, {
              authorization: authorization.flat().filter(function (token) {
                return token;
              }),
              resolve: true
            });

            if (mimeType) {
              queryParams["header-accept"] = mimeType;
            }

            return _context44.abrupt("return", this.HttpClient.URL({
              path: path,
              queryParams: queryParams
            }));

          case 17:
          case "end":
            return _context44.stop();
        }
      }
    }, _callee44, this);
  }));

  return function (_x43) {
    return _ref78.apply(this, arguments);
  };
}();
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


exports.LinkData = /*#__PURE__*/function () {
  var _ref80 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee45(_ref79) {
    var libraryId, objectId, versionHash, writeToken, linkPath, _ref79$queryParams, queryParams, _ref79$format, format, channelAuth, linkUrl;

    return _regeneratorRuntime.wrap(function _callee45$(_context45) {
      while (1) {
        switch (_context45.prev = _context45.next) {
          case 0:
            libraryId = _ref79.libraryId, objectId = _ref79.objectId, versionHash = _ref79.versionHash, writeToken = _ref79.writeToken, linkPath = _ref79.linkPath, _ref79$queryParams = _ref79.queryParams, queryParams = _ref79$queryParams === void 0 ? {} : _ref79$queryParams, _ref79$format = _ref79.format, format = _ref79$format === void 0 ? "json" : _ref79$format, channelAuth = _ref79.channelAuth;
            _context45.next = 3;
            return this.LinkUrl({
              libraryId: libraryId,
              objectId: objectId,
              versionHash: versionHash,
              writeToken: writeToken,
              linkPath: linkPath,
              queryParams: queryParams,
              channelAuth: channelAuth
            });

          case 3:
            linkUrl = _context45.sent;
            _context45.t0 = this.utils;
            _context45.t1 = format;
            _context45.next = 8;
            return HttpClient.Fetch(linkUrl);

          case 8:
            _context45.t2 = _context45.sent;
            return _context45.abrupt("return", _context45.t0.ResponseToFormat.call(_context45.t0, _context45.t1, _context45.t2));

          case 10:
          case "end":
            return _context45.stop();
        }
      }
    }, _callee45, this);
  }));

  return function (_x44) {
    return _ref80.apply(this, arguments);
  };
}();
/* Encryption */


exports.CreateEncryptionConk = /*#__PURE__*/function () {
  var _ref82 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee46(_ref81) {
    var libraryId, objectId, versionHash, writeToken, _ref81$createKMSConk, createKMSConk, capKey, existingUserCap, kmsAddress, kmsPublicKey, kmsCapKey, existingKMSCap;

    return _regeneratorRuntime.wrap(function _callee46$(_context46) {
      while (1) {
        switch (_context46.prev = _context46.next) {
          case 0:
            libraryId = _ref81.libraryId, objectId = _ref81.objectId, versionHash = _ref81.versionHash, writeToken = _ref81.writeToken, _ref81$createKMSConk = _ref81.createKMSConk, createKMSConk = _ref81$createKMSConk === void 0 ? true : _ref81$createKMSConk;

            if (!this.signer.remoteSigner) {
              _context46.next = 3;
              break;
            }

            return _context46.abrupt("return");

          case 3:
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
              _context46.next = 10;
              break;
            }

            _context46.next = 9;
            return this.ContentObjectLibraryId({
              objectId: objectId
            });

          case 9:
            libraryId = _context46.sent;

          case 10:
            capKey = "eluv.caps.iusr".concat(this.utils.AddressToHash(this.signer.address));
            _context46.next = 13;
            return this.ContentObjectMetadata({
              libraryId: libraryId,
              objectId: objectId,
              writeToken: writeToken,
              metadataSubtree: capKey
            });

          case 13:
            existingUserCap = _context46.sent;

            if (!existingUserCap) {
              _context46.next = 20;
              break;
            }

            _context46.next = 17;
            return this.Crypto.DecryptCap(existingUserCap, this.signer.signingKey.privateKey);

          case 17:
            this.encryptionConks[objectId] = _context46.sent;
            _context46.next = 34;
            break;

          case 20:
            _context46.next = 22;
            return this.Crypto.GeneratePrimaryConk({
              spaceId: this.contentSpaceId,
              objectId: objectId
            });

          case 22:
            this.encryptionConks[objectId] = _context46.sent;
            _context46.t0 = this;
            _context46.t1 = libraryId;
            _context46.t2 = objectId;
            _context46.t3 = writeToken;
            _context46.t4 = capKey;
            _context46.next = 30;
            return this.Crypto.EncryptConk(this.encryptionConks[objectId], this.signer.signingKey.publicKey);

          case 30:
            _context46.t5 = _context46.sent;
            _context46.t6 = {
              libraryId: _context46.t1,
              objectId: _context46.t2,
              writeToken: _context46.t3,
              metadataSubtree: _context46.t4,
              metadata: _context46.t5
            };
            _context46.next = 34;
            return _context46.t0.ReplaceMetadata.call(_context46.t0, _context46.t6);

          case 34:
            if (!createKMSConk) {
              _context46.next = 64;
              break;
            }

            _context46.prev = 35;
            _context46.next = 38;
            return this.authClient.KMSAddress({
              objectId: objectId
            });

          case 38:
            kmsAddress = _context46.sent;
            _context46.next = 41;
            return this.authClient.KMSInfo({
              objectId: objectId
            });

          case 41:
            kmsPublicKey = _context46.sent.publicKey;
            kmsCapKey = "eluv.caps.ikms".concat(this.utils.AddressToHash(kmsAddress));
            _context46.next = 45;
            return this.ContentObjectMetadata({
              libraryId: libraryId,
              // Cap may only exist in draft
              objectId: objectId,
              writeToken: writeToken,
              metadataSubtree: kmsCapKey
            });

          case 45:
            existingKMSCap = _context46.sent;

            if (existingKMSCap) {
              _context46.next = 58;
              break;
            }

            _context46.t7 = this;
            _context46.t8 = libraryId;
            _context46.t9 = objectId;
            _context46.t10 = writeToken;
            _context46.t11 = kmsCapKey;
            _context46.next = 54;
            return this.Crypto.EncryptConk(this.encryptionConks[objectId], kmsPublicKey);

          case 54:
            _context46.t12 = _context46.sent;
            _context46.t13 = {
              libraryId: _context46.t8,
              objectId: _context46.t9,
              writeToken: _context46.t10,
              metadataSubtree: _context46.t11,
              metadata: _context46.t12
            };
            _context46.next = 58;
            return _context46.t7.ReplaceMetadata.call(_context46.t7, _context46.t13);

          case 58:
            _context46.next = 64;
            break;

          case 60:
            _context46.prev = 60;
            _context46.t14 = _context46["catch"](35);
            // eslint-disable-next-line no-console
            console.error("Failed to create encryption cap for KMS:"); // eslint-disable-next-line no-console

            console.error(_context46.t14);

          case 64:
            return _context46.abrupt("return", this.encryptionConks[objectId]);

          case 65:
          case "end":
            return _context46.stop();
        }
      }
    }, _callee46, this, [[35, 60]]);
  }));

  return function (_x45) {
    return _ref82.apply(this, arguments);
  };
}();
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


exports.EncryptionConk = /*#__PURE__*/function () {
  var _ref84 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee47(_ref83) {
    var libraryId, objectId, versionHash, writeToken, _ref83$download, download, owner, ownerCapKey, ownerCap, capKey, existingUserCap;

    return _regeneratorRuntime.wrap(function _callee47$(_context47) {
      while (1) {
        switch (_context47.prev = _context47.next) {
          case 0:
            libraryId = _ref83.libraryId, objectId = _ref83.objectId, versionHash = _ref83.versionHash, writeToken = _ref83.writeToken, _ref83$download = _ref83.download, download = _ref83$download === void 0 ? false : _ref83$download;
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

            _context47.next = 6;
            return this.authClient.Owner({
              id: objectId
            });

          case 6:
            owner = _context47.sent;
            ownerCapKey = "eluv.caps.iusr".concat(this.utils.AddressToHash(this.signer.address));
            _context47.next = 10;
            return this.ContentObjectMetadata({
              libraryId: libraryId,
              objectId: objectId,
              metadataSubtree: ownerCapKey
            });

          case 10:
            ownerCap = _context47.sent;

            if (!(!this.utils.EqualAddress(owner, this.signer.address) && !ownerCap)) {
              _context47.next = 21;
              break;
            }

            if (!download) {
              _context47.next = 18;
              break;
            }

            _context47.next = 15;
            return this.authClient.ReEncryptionConk({
              libraryId: libraryId,
              objectId: objectId,
              versionHash: versionHash
            });

          case 15:
            return _context47.abrupt("return", _context47.sent);

          case 18:
            _context47.next = 20;
            return this.authClient.EncryptionConk({
              libraryId: libraryId,
              objectId: objectId,
              versionHash: versionHash
            });

          case 20:
            return _context47.abrupt("return", _context47.sent);

          case 21:
            if (this.encryptionConks[objectId]) {
              _context47.next = 38;
              break;
            }

            capKey = "eluv.caps.iusr".concat(this.utils.AddressToHash(this.signer.address));
            _context47.next = 25;
            return this.ContentObjectMetadata({
              libraryId: libraryId,
              objectId: objectId,
              versionHash: versionHash,
              // Cap may only exist in draft
              writeToken: writeToken,
              metadataSubtree: capKey
            });

          case 25:
            existingUserCap = _context47.sent;

            if (!existingUserCap) {
              _context47.next = 32;
              break;
            }

            _context47.next = 29;
            return this.Crypto.DecryptCap(existingUserCap, this.signer.signingKey.privateKey);

          case 29:
            this.encryptionConks[objectId] = _context47.sent;
            _context47.next = 38;
            break;

          case 32:
            if (!writeToken) {
              _context47.next = 37;
              break;
            }

            _context47.next = 35;
            return this.CreateEncryptionConk({
              libraryId: libraryId,
              objectId: objectId,
              versionHash: versionHash,
              writeToken: writeToken,
              createKMSConk: false
            });

          case 35:
            _context47.next = 38;
            break;

          case 37:
            throw "No encryption conk present for " + objectId;

          case 38:
            return _context47.abrupt("return", this.encryptionConks[objectId]);

          case 39:
          case "end":
            return _context47.stop();
        }
      }
    }, _callee47, this);
  }));

  return function (_x46) {
    return _ref84.apply(this, arguments);
  };
}();
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


exports.Encrypt = /*#__PURE__*/function () {
  var _ref86 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee48(_ref85) {
    var libraryId, objectId, writeToken, chunk, conk, data;
    return _regeneratorRuntime.wrap(function _callee48$(_context48) {
      while (1) {
        switch (_context48.prev = _context48.next) {
          case 0:
            libraryId = _ref85.libraryId, objectId = _ref85.objectId, writeToken = _ref85.writeToken, chunk = _ref85.chunk;
            ValidateParameters({
              libraryId: libraryId,
              objectId: objectId
            });
            _context48.next = 4;
            return this.EncryptionConk({
              libraryId: libraryId,
              objectId: objectId,
              writeToken: writeToken
            });

          case 4:
            conk = _context48.sent;
            _context48.next = 7;
            return this.Crypto.Encrypt(conk, chunk);

          case 7:
            data = _context48.sent;
            return _context48.abrupt("return", data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength));

          case 9:
          case "end":
            return _context48.stop();
        }
      }
    }, _callee48, this);
  }));

  return function (_x47) {
    return _ref86.apply(this, arguments);
  };
}();
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


exports.Decrypt = /*#__PURE__*/function () {
  var _ref88 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee49(_ref87) {
    var libraryId, objectId, writeToken, chunk, conk, data;
    return _regeneratorRuntime.wrap(function _callee49$(_context49) {
      while (1) {
        switch (_context49.prev = _context49.next) {
          case 0:
            libraryId = _ref87.libraryId, objectId = _ref87.objectId, writeToken = _ref87.writeToken, chunk = _ref87.chunk;
            ValidateParameters({
              libraryId: libraryId,
              objectId: objectId
            });
            _context49.next = 4;
            return this.EncryptionConk({
              libraryId: libraryId,
              objectId: objectId,
              writeToken: writeToken,
              download: true
            });

          case 4:
            conk = _context49.sent;
            _context49.next = 7;
            return this.Crypto.Decrypt(conk, chunk);

          case 7:
            data = _context49.sent;
            return _context49.abrupt("return", data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength));

          case 9:
          case "end":
            return _context49.stop();
        }
      }
    }, _callee49, this);
  }));

  return function (_x48) {
    return _ref88.apply(this, arguments);
  };
}();
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


exports.AccessType = /*#__PURE__*/function () {
  var _ref90 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee50(_ref89) {
    var id;
    return _regeneratorRuntime.wrap(function _callee50$(_context50) {
      while (1) {
        switch (_context50.prev = _context50.next) {
          case 0:
            id = _ref89.id;
            _context50.next = 3;
            return this.authClient.AccessType(id);

          case 3:
            return _context50.abrupt("return", _context50.sent);

          case 4:
          case "end":
            return _context50.stop();
        }
      }
    }, _callee50, this);
  }));

  return function (_x49) {
    return _ref90.apply(this, arguments);
  };
}();
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


exports.AccessInfo = /*#__PURE__*/function () {
  var _ref92 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee51(_ref91) {
    var objectId, args, info;
    return _regeneratorRuntime.wrap(function _callee51$(_context51) {
      while (1) {
        switch (_context51.prev = _context51.next) {
          case 0:
            objectId = _ref91.objectId, args = _ref91.args;
            ValidateObject(objectId);

            if (!args) {
              args = [0, // Access level
              [], // Custom values
              [] // Stakeholders
              ];
            }

            this.Log("Retrieving access info: ".concat(objectId));
            _context51.next = 6;
            return this.ethClient.CallContractMethod({
              contractAddress: this.utils.HashToAddress(objectId),
              methodName: "getAccessInfo",
              methodArgs: args
            });

          case 6:
            info = _context51.sent;
            this.Log(info);
            return _context51.abrupt("return", {
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
            return _context51.stop();
        }
      }
    }, _callee51, this);
  }));

  return function (_x50) {
    return _ref92.apply(this, arguments);
  };
}();
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


exports.AccessRequest = /*#__PURE__*/function () {
  var _ref94 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee52(_ref93) {
    var libraryId, objectId, versionHash, _ref93$args, args, _ref93$update, update, _ref93$noCache, noCache;

    return _regeneratorRuntime.wrap(function _callee52$(_context52) {
      while (1) {
        switch (_context52.prev = _context52.next) {
          case 0:
            libraryId = _ref93.libraryId, objectId = _ref93.objectId, versionHash = _ref93.versionHash, _ref93$args = _ref93.args, args = _ref93$args === void 0 ? [] : _ref93$args, _ref93$update = _ref93.update, update = _ref93$update === void 0 ? false : _ref93$update, _ref93$noCache = _ref93.noCache, noCache = _ref93$noCache === void 0 ? false : _ref93$noCache;
            ValidateParameters({
              libraryId: libraryId,
              objectId: objectId,
              versionHash: versionHash
            });

            if (versionHash) {
              objectId = this.utils.DecodeVersionHash(versionHash).objectId;
            }

            _context52.next = 5;
            return this.authClient.MakeAccessRequest({
              libraryId: libraryId,
              objectId: objectId,
              versionHash: versionHash,
              args: args,
              update: update,
              skipCache: true,
              noCache: noCache
            });

          case 5:
            return _context52.abrupt("return", _context52.sent);

          case 6:
          case "end":
            return _context52.stop();
        }
      }
    }, _callee52, this);
  }));

  return function (_x51) {
    return _ref94.apply(this, arguments);
  };
}();
/**
 * Specify additional context to include in all state channel requests made by the client (e.g. for playout)
 *
 * @methodGroup Access Requests
 * @namedParams
 * @param {Object=} context - Additional context to include in state channel requests
 * - Note: Context must be a map of string->string
 */


exports.SetAuthContext = function (_ref95) {
  var context = _ref95.context;

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


exports.GenerateStateChannelToken = /*#__PURE__*/function () {
  var _ref97 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee53(_ref96) {
    var objectId, versionHash, context, _ref96$noCache, noCache;

    return _regeneratorRuntime.wrap(function _callee53$(_context53) {
      while (1) {
        switch (_context53.prev = _context53.next) {
          case 0:
            objectId = _ref96.objectId, versionHash = _ref96.versionHash, context = _ref96.context, _ref96$noCache = _ref96.noCache, noCache = _ref96$noCache === void 0 ? false : _ref96$noCache;
            versionHash ? ValidateVersion(versionHash) : ValidateObject(objectId);

            if (!versionHash) {
              _context53.next = 6;
              break;
            }

            objectId = this.utils.DecodeVersionHash(versionHash).objectId;
            _context53.next = 10;
            break;

          case 6:
            if (this.stateChannelAccess[objectId]) {
              _context53.next = 10;
              break;
            }

            _context53.next = 9;
            return this.LatestVersionHash({
              objectId: objectId
            });

          case 9:
            versionHash = _context53.sent;

          case 10:
            this.stateChannelAccess[objectId] = versionHash;
            _context53.next = 13;
            return this.authClient.AuthorizationToken({
              objectId: objectId,
              channelAuth: true,
              oauthToken: this.oauthToken,
              context: context,
              noCache: noCache
            });

          case 13:
            return _context53.abrupt("return", _context53.sent);

          case 14:
          case "end":
            return _context53.stop();
        }
      }
    }, _callee53, this);
  }));

  return function (_x52) {
    return _ref97.apply(this, arguments);
  };
}();
/**
 * Finalize state channel access
 *
 * @methodGroup Access Requests
 * @namedParams
 * @param {string=} objectId - ID of the object
 * @param {string=} versionHash - Version hash of the object
 * @param {number} percentComplete - Completion percentage of the content
 */


exports.FinalizeStateChannelAccess = /*#__PURE__*/function () {
  var _ref99 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee54(_ref98) {
    var objectId, versionHash, percentComplete;
    return _regeneratorRuntime.wrap(function _callee54$(_context54) {
      while (1) {
        switch (_context54.prev = _context54.next) {
          case 0:
            objectId = _ref98.objectId, versionHash = _ref98.versionHash, percentComplete = _ref98.percentComplete;
            versionHash ? ValidateVersion(versionHash) : ValidateObject(objectId);

            if (!versionHash) {
              _context54.next = 6;
              break;
            }

            objectId = this.utils.DecodeVersionHash(versionHash).objectId;
            _context54.next = 13;
            break;

          case 6:
            if (!this.stateChannelAccess[objectId]) {
              _context54.next = 10;
              break;
            }

            versionHash = this.stateChannelAccess[objectId];
            _context54.next = 13;
            break;

          case 10:
            _context54.next = 12;
            return this.LatestVersionHash({
              objectId: objectId
            });

          case 12:
            versionHash = _context54.sent;

          case 13:
            this.stateChannelAccess[objectId] = undefined;
            _context54.next = 16;
            return this.authClient.ChannelContentFinalize({
              objectId: objectId,
              versionHash: versionHash,
              percent: percentComplete
            });

          case 16:
          case "end":
            return _context54.stop();
        }
      }
    }, _callee54, this);
  }));

  return function (_x53) {
    return _ref99.apply(this, arguments);
  };
}();
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


exports.ContentObjectAccessComplete = /*#__PURE__*/function () {
  var _ref101 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee55(_ref100) {
    var objectId, _ref100$score, score;

    return _regeneratorRuntime.wrap(function _callee55$(_context55) {
      while (1) {
        switch (_context55.prev = _context55.next) {
          case 0:
            objectId = _ref100.objectId, _ref100$score = _ref100.score, score = _ref100$score === void 0 ? 100 : _ref100$score;
            ValidateObject(objectId);

            if (!(score < 0 || score > 100)) {
              _context55.next = 4;
              break;
            }

            throw Error("Invalid AccessComplete score: " + score);

          case 4:
            _context55.next = 6;
            return this.authClient.AccessComplete({
              id: objectId,
              score: score
            });

          case 6:
            return _context55.abrupt("return", _context55.sent);

          case 7:
          case "end":
            return _context55.stop();
        }
      }
    }, _callee55, this);
  }));

  return function (_x54) {
    return _ref101.apply(this, arguments);
  };
}();
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


exports.Collection = /*#__PURE__*/function () {
  var _ref103 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee56(_ref102) {
    var collectionType, validCollectionTypes, walletAddress;
    return _regeneratorRuntime.wrap(function _callee56$(_context56) {
      while (1) {
        switch (_context56.prev = _context56.next) {
          case 0:
            collectionType = _ref102.collectionType;
            validCollectionTypes = ["accessGroups", "contentObjects", "contentTypes", "contracts", "libraries"];

            if (validCollectionTypes.includes(collectionType)) {
              _context56.next = 4;
              break;
            }

            throw new Error("Invalid collection type: " + collectionType);

          case 4:
            if (!this.signer) {
              _context56.next = 10;
              break;
            }

            _context56.next = 7;
            return this.userProfileClient.WalletAddress();

          case 7:
            _context56.t0 = _context56.sent;
            _context56.next = 11;
            break;

          case 10:
            _context56.t0 = undefined;

          case 11:
            walletAddress = _context56.t0;

            if (walletAddress) {
              _context56.next = 14;
              break;
            }

            throw new Error("Unable to get collection: User wallet doesn't exist");

          case 14:
            this.Log("Retrieving ".concat(collectionType, " contract collection for user ").concat(this.signer.address));
            _context56.next = 17;
            return this.ethClient.MakeProviderCall({
              methodName: "send",
              args: ["elv_getWalletCollection", [this.contentSpaceId, "iusr".concat(this.utils.AddressToHash(this.signer.address)), collectionType]]
            });

          case 17:
            _context56.t1 = _context56.sent;

            if (_context56.t1) {
              _context56.next = 20;
              break;
            }

            _context56.t1 = [];

          case 20:
            return _context56.abrupt("return", _context56.t1);

          case 21:
          case "end":
            return _context56.stop();
        }
      }
    }, _callee56, this);
  }));

  return function (_x55) {
    return _ref103.apply(this, arguments);
  };
}();
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


exports.VerifyContentObject = /*#__PURE__*/function () {
  var _ref105 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee57(_ref104) {
    var libraryId, objectId, versionHash;
    return _regeneratorRuntime.wrap(function _callee57$(_context57) {
      while (1) {
        switch (_context57.prev = _context57.next) {
          case 0:
            libraryId = _ref104.libraryId, objectId = _ref104.objectId, versionHash = _ref104.versionHash;
            ValidateParameters({
              libraryId: libraryId,
              objectId: objectId,
              versionHash: versionHash
            });
            _context57.next = 4;
            return ContentObjectVerification.VerifyContentObject({
              client: this,
              libraryId: libraryId,
              objectId: objectId,
              versionHash: versionHash
            });

          case 4:
            return _context57.abrupt("return", _context57.sent);

          case 5:
          case "end":
            return _context57.stop();
        }
      }
    }, _callee57, this);
  }));

  return function (_x56) {
    return _ref105.apply(this, arguments);
  };
}();
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


exports.Proofs = /*#__PURE__*/function () {
  var _ref107 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee58(_ref106) {
    var libraryId, objectId, versionHash, partHash, path;
    return _regeneratorRuntime.wrap(function _callee58$(_context58) {
      while (1) {
        switch (_context58.prev = _context58.next) {
          case 0:
            libraryId = _ref106.libraryId, objectId = _ref106.objectId, versionHash = _ref106.versionHash, partHash = _ref106.partHash;
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
            _context58.t0 = this.utils;
            _context58.t1 = this.HttpClient;
            _context58.next = 9;
            return this.authClient.AuthorizationHeader({
              libraryId: libraryId,
              objectId: objectId,
              versionHash: versionHash
            });

          case 9:
            _context58.t2 = _context58.sent;
            _context58.t3 = path;
            _context58.t4 = {
              headers: _context58.t2,
              method: "GET",
              path: _context58.t3
            };
            _context58.t5 = _context58.t1.Request.call(_context58.t1, _context58.t4);
            return _context58.abrupt("return", _context58.t0.ResponseToJson.call(_context58.t0, _context58.t5));

          case 14:
          case "end":
            return _context58.stop();
        }
      }
    }, _callee58, this);
  }));

  return function (_x57) {
    return _ref107.apply(this, arguments);
  };
}();
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


exports.QParts = /*#__PURE__*/function () {
  var _ref109 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee59(_ref108) {
    var libraryId, objectId, partHash, _ref108$format, format, path;

    return _regeneratorRuntime.wrap(function _callee59$(_context59) {
      while (1) {
        switch (_context59.prev = _context59.next) {
          case 0:
            libraryId = _ref108.libraryId, objectId = _ref108.objectId, partHash = _ref108.partHash, _ref108$format = _ref108.format, format = _ref108$format === void 0 ? "blob" : _ref108$format;
            ValidateParameters({
              libraryId: libraryId,
              objectId: objectId,
              versionHash: versionHash
            });
            ValidatePartHash(partHash);
            path = UrlJoin("qparts", partHash);
            _context59.t0 = this.utils;
            _context59.t1 = format;
            _context59.t2 = this.HttpClient;
            _context59.next = 9;
            return this.authClient.AuthorizationHeader({
              libraryId: libraryId,
              objectId: objectId,
              partHash: partHash
            });

          case 9:
            _context59.t3 = _context59.sent;
            _context59.t4 = path;
            _context59.t5 = {
              headers: _context59.t3,
              method: "GET",
              path: _context59.t4
            };
            _context59.t6 = _context59.t2.Request.call(_context59.t2, _context59.t5);
            return _context59.abrupt("return", _context59.t0.ResponseToFormat.call(_context59.t0, _context59.t1, _context59.t6));

          case 14:
          case "end":
            return _context59.stop();
        }
      }
    }, _callee59, this);
  }));

  return function (_x58) {
    return _ref109.apply(this, arguments);
  };
}();