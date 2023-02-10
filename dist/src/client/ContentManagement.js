var _typeof = require("@babel/runtime/helpers/typeof");

var _defineProperty = require("@babel/runtime/helpers/defineProperty");

var _regeneratorRuntime = require("@babel/runtime/regenerator");

var _asyncToGenerator = require("@babel/runtime/helpers/asyncToGenerator");

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }

/**
 * Methods for managing content types, libraries and objects
 *
 * @module ElvClient/ContentManagement
 */
var UrlJoin = require("url-join");

var ImageType = require("image-type");

var Ethers = require("ethers");

var Pako = require("pako");
/*
const LibraryContract = require("../contracts/BaseLibrary");
const ContentContract = require("../contracts/BaseContent");
const EditableContract = require("../contracts/Editable");

 */


var _require = require("../Validation"),
    ValidateLibrary = _require.ValidateLibrary,
    ValidateObject = _require.ValidateObject,
    ValidateVersion = _require.ValidateVersion,
    ValidateWriteToken = _require.ValidateWriteToken,
    ValidateParameters = _require.ValidateParameters,
    ValidatePresence = _require.ValidatePresence;

exports.SetVisibility = /*#__PURE__*/function () {
  var _ref2 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee(_ref) {
    var id, visibility, hasSetVisibility, event;
    return _regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            id = _ref.id, visibility = _ref.visibility;
            this.Log("Setting visibility ".concat(visibility, " on ").concat(id));
            _context.next = 4;
            return this.authClient.ContractHasMethod({
              contractAddress: this.utils.HashToAddress(id),
              methodName: "setVisibility"
            });

          case 4:
            hasSetVisibility = _context.sent;

            if (hasSetVisibility) {
              _context.next = 7;
              break;
            }

            return _context.abrupt("return");

          case 7:
            _context.next = 9;
            return this.CallContractMethodAndWait({
              contractAddress: this.utils.HashToAddress(id),
              methodName: "setVisibility",
              methodArgs: [visibility]
            });

          case 9:
            event = _context.sent;
            _context.next = 12;
            return new Promise(function (resolve) {
              return setTimeout(resolve, 5000);
            });

          case 12:
            return _context.abrupt("return", event);

          case 13:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, this);
  }));

  return function (_x) {
    return _ref2.apply(this, arguments);
  };
}();
/**
 * Set the current permission level for the specified object. See client.permissionLevels for all available permissions.
 *
 * Note: This method is only intended for normal content objects, not types, libraries, etc.
 *
 * @methodGroup Content Objects
 * @param {string} objectId - The ID of the object
 * @param {string} permission - The key for the permission to set - See client.permissionLevels for available permissions
 * @param {string} writeToken - Write token for the content object - If specified, info will be retrieved from the write draft instead of creating a new draft and finalizing
 */


exports.SetPermission = /*#__PURE__*/function () {
  var _ref4 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee3(_ref3) {
    var _this = this;

    var objectId, permission, writeToken, permissionSettings, settings, libraryId, statusCode, kmsAddress, kmsConkKey, kmsConk, finalize;
    return _regeneratorRuntime.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            objectId = _ref3.objectId, permission = _ref3.permission, writeToken = _ref3.writeToken;
            ValidateObject(objectId);
            ValidatePresence("permission", permission);
            permissionSettings = this.permissionLevels[permission];

            if (permissionSettings) {
              _context3.next = 6;
              break;
            }

            throw Error("Unknown permission level: " + permission);

          case 6:
            _context3.next = 8;
            return this.AccessType({
              id: objectId
            });

          case 8:
            _context3.t0 = _context3.sent;
            _context3.t1 = this.authClient.ACCESS_TYPES.OBJECT;

            if (!(_context3.t0 !== _context3.t1)) {
              _context3.next = 12;
              break;
            }

            throw Error("Permission only valid for normal content objects: " + objectId);

          case 12:
            settings = permissionSettings.settings;
            _context3.next = 15;
            return this.ContentObjectLibraryId({
              objectId: objectId
            });

          case 15:
            libraryId = _context3.sent;
            _context3.next = 18;
            return this.SetVisibility({
              id: objectId,
              visibility: settings.visibility
            });

          case 18:
            _context3.next = 20;
            return this.CallContractMethod({
              contractAddress: this.utils.HashToAddress(objectId),
              methodName: "statusCode"
            });

          case 20:
            statusCode = _context3.sent;

            if (!(statusCode !== settings.statusCode)) {
              _context3.next = 29;
              break;
            }

            if (!(settings.statusCode < 0)) {
              _context3.next = 27;
              break;
            }

            _context3.next = 25;
            return this.CallContractMethod({
              contractAddress: this.utils.HashToAddress(objectId),
              methodName: "setStatusCode",
              methodArgs: [-1]
            });

          case 25:
            _context3.next = 29;
            break;

          case 27:
            _context3.next = 29;
            return this.CallContractMethod({
              contractAddress: this.utils.HashToAddress(objectId),
              methodName: "publish"
            });

          case 29:
            _context3.next = 31;
            return this.CallContractMethod({
              contractAddress: this.utils.HashToAddress(objectId),
              methodName: "addressKMS"
            });

          case 31:
            kmsAddress = _context3.sent;
            kmsConkKey = "eluv.caps.ikms".concat(this.utils.AddressToHash(kmsAddress));
            _context3.next = 35;
            return this.ContentObjectMetadata({
              libraryId: libraryId,
              objectId: objectId,
              metadataSubtree: kmsConkKey
            });

          case 35:
            kmsConk = _context3.sent;

            if (!(kmsConk && !settings.kmsConk)) {
              _context3.next = 41;
              break;
            }

            _context3.next = 39;
            return this.EditAndFinalizeContentObject({
              libraryId: libraryId,
              objectId: objectId,
              commitMessage: "Remove encryption conk",
              callback: function () {
                var _callback = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee2(_ref5) {
                  var writeToken;
                  return _regeneratorRuntime.wrap(function _callee2$(_context2) {
                    while (1) {
                      switch (_context2.prev = _context2.next) {
                        case 0:
                          writeToken = _ref5.writeToken;
                          _context2.next = 3;
                          return _this.DeleteMetadata({
                            libraryId: libraryId,
                            objectId: objectId,
                            writeToken: writeToken,
                            metadataSubtree: kmsConkKey
                          });

                        case 3:
                        case "end":
                          return _context2.stop();
                      }
                    }
                  }, _callee2);
                }));

                function callback(_x3) {
                  return _callback.apply(this, arguments);
                }

                return callback;
              }()
            });

          case 39:
            _context3.next = 52;
            break;

          case 41:
            if (!(!kmsConk && settings.kmsConk)) {
              _context3.next = 52;
              break;
            }

            finalize = !writeToken;

            if (writeToken) {
              _context3.next = 47;
              break;
            }

            _context3.next = 46;
            return this.EditContentObject({
              libraryId: libraryId,
              objectId: objectId
            });

          case 46:
            writeToken = _context3.sent.writeToken;

          case 47:
            _context3.next = 49;
            return this.CreateEncryptionConk({
              libraryId: libraryId,
              objectId: objectId,
              writeToken: writeToken,
              createKMSConk: true
            });

          case 49:
            if (!finalize) {
              _context3.next = 52;
              break;
            }

            _context3.next = 52;
            return this.FinalizeContentObject({
              libraryId: libraryId,
              objectId: objectId,
              writeToken: writeToken,
              commitMessage: "Set permissions to ".concat(permission)
            });

          case 52:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3, this);
  }));

  return function (_x2) {
    return _ref4.apply(this, arguments);
  };
}();
/* Content Type Creation */

/**
 * Create a new content type.
 *
 * A new content type contract is deployed from
 * the content space, and that contract ID is used to determine the object ID to
 * create in the fabric. The content type object will be created in the special
 * content space library (ilib<content-space-hash>)
 *
 * @methodGroup Content Types
 * @namedParams
 * @param libraryId {string=} - ID of the library in which to create the content type. If not specified,
 * it will be created in the content space library
 * @param {string} name - Name of the content type
 * @param {object} metadata - Metadata for the new content type
 * @param {(Blob | Buffer)=} bitcode - Bitcode to be used for the content type
 *
 * @returns {Promise<string>} - Object ID of created content type
 */


exports.CreateContentType = /*#__PURE__*/function () {
  var _ref7 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee4(_ref6) {
    var name, _ref6$metadata, metadata, bitcode, _yield$this$authClien, contractAddress, objectId, path, rawCreateResponse, nodeUrl, createResponse, uploadResponse;

    return _regeneratorRuntime.wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            name = _ref6.name, _ref6$metadata = _ref6.metadata, metadata = _ref6$metadata === void 0 ? {} : _ref6$metadata, bitcode = _ref6.bitcode;
            this.Log("Creating content type: ".concat(name));
            metadata.name = name;
            metadata["public"] = _objectSpread({
              name: name
            }, metadata["public"] || {});
            _context4.next = 6;
            return this.authClient.CreateContentType();

          case 6:
            _yield$this$authClien = _context4.sent;
            contractAddress = _yield$this$authClien.contractAddress;
            objectId = this.utils.AddressToObjectId(contractAddress);
            _context4.next = 11;
            return this.SetVisibility({
              id: objectId,
              visibility: 1
            });

          case 11:
            path = UrlJoin("qlibs", this.contentSpaceLibraryId, "qid", objectId);
            this.Log("Created type: ".concat(contractAddress, " ").concat(objectId));
            /* Create object, upload bitcode and finalize */

            _context4.t0 = this.HttpClient;
            _context4.next = 16;
            return this.authClient.AuthorizationHeader({
              libraryId: this.contentSpaceLibraryId,
              objectId: objectId,
              update: true
            });

          case 16:
            _context4.t1 = _context4.sent;
            _context4.t2 = path;
            _context4.t3 = {
              headers: _context4.t1,
              method: "POST",
              path: _context4.t2
            };
            _context4.next = 21;
            return _context4.t0.Request.call(_context4.t0, _context4.t3);

          case 21:
            rawCreateResponse = _context4.sent;
            nodeUrl = new URL(rawCreateResponse.url).origin;
            _context4.next = 25;
            return this.utils.ResponseToJson(rawCreateResponse);

          case 25:
            createResponse = _context4.sent;
            // Record the node used in creating this write token
            this.HttpClient.RecordWriteToken(createResponse.write_token, nodeUrl);
            _context4.next = 29;
            return this.ReplaceMetadata({
              libraryId: this.contentSpaceLibraryId,
              objectId: objectId,
              writeToken: createResponse.write_token,
              metadata: metadata
            });

          case 29:
            if (!bitcode) {
              _context4.next = 35;
              break;
            }

            _context4.next = 32;
            return this.UploadPart({
              libraryId: this.contentSpaceLibraryId,
              objectId: objectId,
              writeToken: createResponse.write_token,
              data: bitcode,
              encrypted: false
            });

          case 32:
            uploadResponse = _context4.sent;
            _context4.next = 35;
            return this.ReplaceMetadata({
              libraryId: this.contentSpaceLibraryId,
              objectId: objectId,
              writeToken: createResponse.write_token,
              metadataSubtree: "bitcode_part",
              metadata: uploadResponse.part.hash
            });

          case 35:
            _context4.next = 37;
            return this.FinalizeContentObject({
              libraryId: this.contentSpaceLibraryId,
              objectId: objectId,
              writeToken: createResponse.write_token,
              commitMessage: "Create content type"
            });

          case 37:
            return _context4.abrupt("return", objectId);

          case 38:
          case "end":
            return _context4.stop();
        }
      }
    }, _callee4, this);
  }));

  return function (_x4) {
    return _ref7.apply(this, arguments);
  };
}();
/* Library creation and deletion */

/**
 * Create a new content library.
 *
 * A new content library contract is deployed from
 * the content space, and that contract ID is used to determine the library ID to
 * create in the fabric.
 *
 * @methodGroup Content Libraries
 *
 * @namedParams
 * @param {string} name - Library name
 * @param {string=} description - Library description
 * @param {blob=} image - Image associated with the library
 * @param {string=} - imageName - Name of the image associated with the library (required if image specified)
 * @param {Object=} metadata - Metadata of library object
 * @param {string=} kmsId - ID of the KMS to use for content in this library. If not specified,
 * the default KMS will be used.
 * @param {string=} tenantId - ID of the tenant to use for this library
 *
 * @returns {Promise<string>} - Library ID of created library
 */


exports.CreateContentLibrary = /*#__PURE__*/function () {
  var _ref9 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee5(_ref8) {
    var name, description, image, imageName, _ref8$metadata, metadata, kmsId, tenantId, _yield$this$authClien2, contractAddress, libraryId, objectId, editResponse;

    return _regeneratorRuntime.wrap(function _callee5$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            name = _ref8.name, description = _ref8.description, image = _ref8.image, imageName = _ref8.imageName, _ref8$metadata = _ref8.metadata, metadata = _ref8$metadata === void 0 ? {} : _ref8$metadata, kmsId = _ref8.kmsId, tenantId = _ref8.tenantId;

            if (kmsId) {
              _context5.next = 9;
              break;
            }

            _context5.t0 = "ikms";
            _context5.t1 = this.utils;
            _context5.next = 6;
            return this.DefaultKMSAddress();

          case 6:
            _context5.t2 = _context5.sent;
            _context5.t3 = _context5.t1.AddressToHash.call(_context5.t1, _context5.t2);
            kmsId = _context5.t0.concat.call(_context5.t0, _context5.t3);

          case 9:
            this.Log("Creating content library");
            this.Log("KMS ID: ".concat(kmsId));
            _context5.next = 13;
            return this.authClient.CreateContentLibrary({
              kmsId: kmsId
            });

          case 13:
            _yield$this$authClien2 = _context5.sent;
            contractAddress = _yield$this$authClien2.contractAddress;

            if (tenantId) {
              _context5.next = 19;
              break;
            }

            _context5.next = 18;
            return this.userProfileClient.TenantId();

          case 18:
            tenantId = _context5.sent;

          case 19:
            if (!tenantId) {
              _context5.next = 24;
              break;
            }

            if (this.utils.ValidHash(tenantId)) {
              _context5.next = 22;
              break;
            }

            throw Error("Invalid tenant ID: ".concat(tenantId));

          case 22:
            _context5.next = 24;
            return this.CallContractMethod({
              contractAddress: contractAddress,
              methodName: "putMeta",
              methodArgs: ["_tenantId", tenantId]
            });

          case 24:
            metadata = _objectSpread(_objectSpread({}, metadata), {}, {
              name: name,
              description: description,
              "public": {
                name: name,
                description: description
              }
            });
            libraryId = this.utils.AddressToLibraryId(contractAddress);
            this.Log("Library ID: ".concat(libraryId));
            this.Log("Contract address: ".concat(contractAddress)); // Set library content object type and metadata on automatically created library object

            objectId = libraryId.replace("ilib", "iq__");
            _context5.next = 31;
            return this.EditContentObject({
              libraryId: libraryId,
              objectId: objectId
            });

          case 31:
            editResponse = _context5.sent;
            _context5.next = 34;
            return this.ReplaceMetadata({
              libraryId: libraryId,
              objectId: objectId,
              metadata: metadata,
              writeToken: editResponse.write_token
            });

          case 34:
            _context5.next = 36;
            return this.FinalizeContentObject({
              libraryId: libraryId,
              objectId: objectId,
              writeToken: editResponse.write_token,
              commitMessage: "Create library"
            });

          case 36:
            if (!image) {
              _context5.next = 39;
              break;
            }

            _context5.next = 39;
            return this.SetContentLibraryImage({
              libraryId: libraryId,
              image: image,
              imageName: imageName
            });

          case 39:
            this.Log("Library ".concat(libraryId, " created"));
            return _context5.abrupt("return", libraryId);

          case 41:
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
 * Set the image associated with this library
 *
 * @methodGroup Content Libraries
 * @namedParams
 * @param {string} libraryId - ID of the library
 * @param {string} writeToken - Write token for the draft
 * @param {Blob | ArrayBuffer | Buffer} image - Image to upload
 * @param {string=} imageName - Name of the image file
 */


exports.SetContentLibraryImage = /*#__PURE__*/function () {
  var _ref11 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee6(_ref10) {
    var libraryId, writeToken, image, imageName, objectId;
    return _regeneratorRuntime.wrap(function _callee6$(_context6) {
      while (1) {
        switch (_context6.prev = _context6.next) {
          case 0:
            libraryId = _ref10.libraryId, writeToken = _ref10.writeToken, image = _ref10.image, imageName = _ref10.imageName;
            ValidateLibrary(libraryId);
            objectId = libraryId.replace("ilib", "iq__");
            return _context6.abrupt("return", this.SetContentObjectImage({
              libraryId: libraryId,
              objectId: objectId,
              writeToken: writeToken,
              image: image,
              imageName: imageName
            }));

          case 4:
          case "end":
            return _context6.stop();
        }
      }
    }, _callee6, this);
  }));

  return function (_x6) {
    return _ref11.apply(this, arguments);
  };
}();
/**
 * Set the image associated with this object
 *
 * @methodGroup Content Objects
 * @namedParams
 * @param {string} libraryId - ID of the library
 * @param {string} objectId - ID of the object
 * @param {string} writeToken - Write token of the draft
 * @param {Blob | ArrayBuffer | Buffer} image - Image to upload
 * @param {string=} imageName - Name of the image file
 * @param {string=} imagePath=public/display_image - Metadata path of the image link (default is recommended)
 */


exports.SetContentObjectImage = /*#__PURE__*/function () {
  var _ref13 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee7(_ref12) {
    var libraryId, objectId, writeToken, image, imageName, _ref12$imagePath, imagePath, type, mimeType;

    return _regeneratorRuntime.wrap(function _callee7$(_context7) {
      while (1) {
        switch (_context7.prev = _context7.next) {
          case 0:
            libraryId = _ref12.libraryId, objectId = _ref12.objectId, writeToken = _ref12.writeToken, image = _ref12.image, imageName = _ref12.imageName, _ref12$imagePath = _ref12.imagePath, imagePath = _ref12$imagePath === void 0 ? "public/display_image" : _ref12$imagePath;
            ValidateParameters({
              libraryId: libraryId,
              objectId: objectId
            });
            ValidateWriteToken(writeToken);
            ValidatePresence("image", image);
            imageName = imageName || "display_image";

            if (!(_typeof(image) === "object")) {
              _context7.next = 9;
              break;
            }

            _context7.next = 8;
            return new Response(image).arrayBuffer();

          case 8:
            image = _context7.sent;

          case 9:
            // Determine image type
            type = ImageType(image);
            mimeType = ["jpg", "jpeg", "png", "gif", "webp"].includes(type.ext) ? type.mime : "image/*";
            _context7.next = 13;
            return this.UploadFiles({
              libraryId: libraryId,
              objectId: objectId,
              writeToken: writeToken,
              encrypted: false,
              fileInfo: [{
                path: imageName,
                mime_type: mimeType,
                size: image.size || image.length || image.byteLength,
                data: image
              }]
            });

          case 13:
            _context7.next = 15;
            return this.ReplaceMetadata({
              libraryId: libraryId,
              objectId: objectId,
              writeToken: writeToken,
              metadataSubtree: imagePath,
              metadata: {
                "/": "./files/".concat(imageName)
              }
            });

          case 15:
          case "end":
            return _context7.stop();
        }
      }
    }, _callee7, this);
  }));

  return function (_x7) {
    return _ref13.apply(this, arguments);
  };
}();
/**
 * NOT YET SUPPORTED - Delete the specified content library
 *
 * @methodGroup Content Libraries
 *
 * @namedParams
 * @param {string} libraryId - ID of the library to delete
 */


exports.DeleteContentLibrary = /*#__PURE__*/function () {
  var _ref15 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee8(_ref14) {
    var libraryId, path, authorizationHeader;
    return _regeneratorRuntime.wrap(function _callee8$(_context8) {
      while (1) {
        switch (_context8.prev = _context8.next) {
          case 0:
            libraryId = _ref14.libraryId;
            throw Error("Not supported");

          case 6:
            authorizationHeader = _context8.sent;
            _context8.next = 9;
            return this.CallContractMethodAndWait({
              contractAddress: this.utils.HashToAddress(libraryId),
              methodName: "kill",
              methodArgs: []
            });

          case 9:
            _context8.next = 11;
            return this.HttpClient.Request({
              headers: authorizationHeader,
              method: "DELETE",
              path: path
            });

          case 11:
          case "end":
            return _context8.stop();
        }
      }
    }, _callee8, this);
  }));

  return function (_x8) {
    return _ref15.apply(this, arguments);
  };
}();
/* Library Content Type Management */

/**
 * Add a specified content type to a library
 *
 * @methodGroup Content Libraries
 * @namedParams
 * @param {string} libraryId - ID of the library
 * @param {string=} typeId - ID of the content type
 * @param {string=} typeName - Name of the content type
 * @param {string=} typeHash - Version hash of the content type
 * @param {string=} customContractAddress - Address of the custom contract to associate with
 * this content type for this library
 *
 * @returns {Promise<string>} - Hash of the addContentType transaction
 */


exports.AddLibraryContentType = /*#__PURE__*/function () {
  var _ref17 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee9(_ref16) {
    var libraryId, typeId, typeName, typeHash, customContractAddress, type, typeAddress, event;
    return _regeneratorRuntime.wrap(function _callee9$(_context9) {
      while (1) {
        switch (_context9.prev = _context9.next) {
          case 0:
            libraryId = _ref16.libraryId, typeId = _ref16.typeId, typeName = _ref16.typeName, typeHash = _ref16.typeHash, customContractAddress = _ref16.customContractAddress;
            ValidateLibrary(libraryId);
            this.Log("Adding library content type to ".concat(libraryId, ": ").concat(typeId || typeHash || typeName));

            if (typeHash) {
              typeId = this.utils.DecodeVersionHash(typeHash).objectId;
            }

            if (typeId) {
              _context9.next = 9;
              break;
            }

            _context9.next = 7;
            return this.ContentType({
              name: typeName
            });

          case 7:
            type = _context9.sent;
            typeId = type.id;

          case 9:
            this.Log("Type ID: ".concat(typeId));
            typeAddress = this.utils.HashToAddress(typeId);
            customContractAddress = customContractAddress || this.utils.nullAddress;
            _context9.next = 14;
            return this.ethClient.CallContractMethodAndWait({
              contractAddress: this.utils.HashToAddress(libraryId),
              methodName: "addContentType",
              methodArgs: [typeAddress, customContractAddress]
            });

          case 14:
            event = _context9.sent;
            return _context9.abrupt("return", event.transactionHash);

          case 16:
          case "end":
            return _context9.stop();
        }
      }
    }, _callee9, this);
  }));

  return function (_x9) {
    return _ref17.apply(this, arguments);
  };
}();
/**
 * Remove the specified content type from a library
 *
 * @methodGroup Content Libraries
 * @namedParams
 * @param {string} libraryId - ID of the library
 * @param {string=} typeId - ID of the content type (required unless typeName is specified)
 * @param {string=} typeName - Name of the content type (required unless typeId is specified)
 * @param {string=} typeHash - Version hash of the content type
 *
 * @returns {Promise<string>} - Hash of the removeContentType transaction
 */


exports.RemoveLibraryContentType = /*#__PURE__*/function () {
  var _ref19 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee10(_ref18) {
    var libraryId, typeId, typeName, typeHash, type, typeAddress, event;
    return _regeneratorRuntime.wrap(function _callee10$(_context10) {
      while (1) {
        switch (_context10.prev = _context10.next) {
          case 0:
            libraryId = _ref18.libraryId, typeId = _ref18.typeId, typeName = _ref18.typeName, typeHash = _ref18.typeHash;
            ValidateLibrary(libraryId);
            this.Log("Removing library content type from ".concat(libraryId, ": ").concat(typeId || typeHash || typeName));

            if (typeHash) {
              typeId = this.utils.DecodeVersionHash(typeHash).objectId;
            }

            if (typeId) {
              _context10.next = 9;
              break;
            }

            _context10.next = 7;
            return this.ContentType({
              name: typeName
            });

          case 7:
            type = _context10.sent;
            typeId = type.id;

          case 9:
            this.Log("Type ID: ".concat(typeId));
            typeAddress = this.utils.HashToAddress(typeId);
            _context10.next = 13;
            return this.ethClient.CallContractMethodAndWait({
              contractAddress: this.utils.HashToAddress(libraryId),
              methodName: "removeContentType",
              methodArgs: [typeAddress]
            });

          case 13:
            event = _context10.sent;
            return _context10.abrupt("return", event.transactionHash);

          case 15:
          case "end":
            return _context10.stop();
        }
      }
    }, _callee10, this);
  }));

  return function (_x10) {
    return _ref19.apply(this, arguments);
  };
}();
/* Content object creation, modification, deletion */

/**
 * Create a new content object draft.
 *
 * A new content object contract is deployed from
 * the content library, and that contract ID is used to determine the object ID to
 * create in the fabric.
 *
 * @methodGroup Content Objects
 * @namedParams
 * @param {string} libraryId - ID of the library
 * @param {string=} objectId - ID of the object (if contract already exists)
 * @param {Object=} options -
 * type: Version hash of the content type to associate with the object
 *
 * meta: Metadata to use for the new object
 *
 * @returns {Promise<Object>} - Response containing the object ID and write token of the draft
 */


exports.CreateContentObject = /*#__PURE__*/function () {
  var _ref21 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee11(_ref20) {
    var libraryId, objectId, _ref20$options, options, typeId, type, currentAccountAddress, canContribute, _yield$this$authClien3, contractAddress, path, rawCreateResponse, nodeUrl, createResponse;

    return _regeneratorRuntime.wrap(function _callee11$(_context11) {
      while (1) {
        switch (_context11.prev = _context11.next) {
          case 0:
            libraryId = _ref20.libraryId, objectId = _ref20.objectId, _ref20$options = _ref20.options, options = _ref20$options === void 0 ? {} : _ref20$options;
            ValidateLibrary(libraryId);

            if (objectId) {
              ValidateObject(objectId);
            }

            this.Log("Creating content object: ".concat(libraryId, " ").concat(objectId || "")); // Look up content type, if specified

            if (!options.type) {
              _context11.next = 26;
              break;
            }

            this.Log("Type specified: ".concat(options.type));
            type = options.type;

            if (!type.startsWith("hq__")) {
              _context11.next = 13;
              break;
            }

            _context11.next = 10;
            return this.ContentType({
              versionHash: type
            });

          case 10:
            type = _context11.sent;
            _context11.next = 22;
            break;

          case 13:
            if (!type.startsWith("iq__")) {
              _context11.next = 19;
              break;
            }

            _context11.next = 16;
            return this.ContentType({
              typeId: type
            });

          case 16:
            type = _context11.sent;
            _context11.next = 22;
            break;

          case 19:
            _context11.next = 21;
            return this.ContentType({
              name: type
            });

          case 21:
            type = _context11.sent;

          case 22:
            if (type) {
              _context11.next = 24;
              break;
            }

            throw Error("Unable to find content type '".concat(options.type, "'"));

          case 24:
            typeId = type.id;
            options.type = type.hash;

          case 26:
            if (objectId) {
              _context11.next = 44;
              break;
            }

            _context11.next = 29;
            return this.CurrentAccountAddress();

          case 29:
            currentAccountAddress = _context11.sent;
            _context11.next = 32;
            return this.CallContractMethod({
              contractAddress: this.utils.HashToAddress(libraryId),
              methodName: "canContribute",
              methodArgs: [currentAccountAddress]
            });

          case 32:
            canContribute = _context11.sent;

            if (canContribute) {
              _context11.next = 35;
              break;
            }

            throw Error("Current user does not have permission to create content in library ".concat(libraryId));

          case 35:
            this.Log("Deploying contract...");
            _context11.next = 38;
            return this.authClient.CreateContentObject({
              libraryId: libraryId,
              typeId: typeId
            });

          case 38:
            _yield$this$authClien3 = _context11.sent;
            contractAddress = _yield$this$authClien3.contractAddress;
            objectId = this.utils.AddressToObjectId(contractAddress);
            this.Log("Contract deployed: ".concat(contractAddress, " ").concat(objectId));
            _context11.next = 51;
            break;

          case 44:
            _context11.t0 = this;
            _context11.t1 = "Contract already deployed for contract type: ";
            _context11.next = 48;
            return this.AccessType({
              id: objectId
            });

          case 48:
            _context11.t2 = _context11.sent;
            _context11.t3 = _context11.t1.concat.call(_context11.t1, _context11.t2);

            _context11.t0.Log.call(_context11.t0, _context11.t3);

          case 51:
            if (!options.visibility) {
              _context11.next = 55;
              break;
            }

            this.Log("Setting visibility to ".concat(options.visibility));
            _context11.next = 55;
            return this.SetVisibility({
              id: objectId,
              visibility: options.visibility
            });

          case 55:
            path = UrlJoin("qid", objectId);
            _context11.t4 = this.HttpClient;
            _context11.next = 59;
            return this.authClient.AuthorizationHeader({
              libraryId: libraryId,
              objectId: objectId,
              update: true
            });

          case 59:
            _context11.t5 = _context11.sent;
            _context11.t6 = path;
            _context11.t7 = options;
            _context11.t8 = {
              headers: _context11.t5,
              method: "POST",
              path: _context11.t6,
              body: _context11.t7
            };
            _context11.next = 65;
            return _context11.t4.Request.call(_context11.t4, _context11.t8);

          case 65:
            rawCreateResponse = _context11.sent;
            nodeUrl = new URL(rawCreateResponse.url).origin;
            _context11.next = 69;
            return this.utils.ResponseToJson(rawCreateResponse);

          case 69:
            createResponse = _context11.sent;
            // Record the node used in creating this write token
            this.HttpClient.RecordWriteToken(createResponse.write_token, nodeUrl);
            createResponse.writeToken = createResponse.write_token;
            createResponse.objectId = createResponse.id;
            createResponse.nodeUrl = nodeUrl;
            return _context11.abrupt("return", createResponse);

          case 75:
          case "end":
            return _context11.stop();
        }
      }
    }, _callee11, this);
  }));

  return function (_x11) {
    return _ref21.apply(this, arguments);
  };
}();
/**
 * Create a new content object draft from an existing content object version.
 *
 * Note: The type of the new copy can be different from the original object.
 *
 * @see <a href="#CreateContentObject">CreateContentObject</a>
 *
 * @methodGroup Content Objects
 * @namedParams
 * @param {string} libraryId - ID of the library in which to create the new object
 * @param originalVersionHash - Version hash of the object to copy
 * @param {Object=} options -
 * type: Version hash of the content type to associate with the object - may be different from the original object
 *
 * meta: Metadata to use for the new object - This will be merged into the metadata of the original object
 *
 * @returns {Promise<Object>} - Response containing the object ID and write token of the draft
 */


exports.CopyContentObject = /*#__PURE__*/function () {
  var _ref23 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee13(_ref22) {
    var _this2 = this;

    var libraryId, originalVersionHash, _ref22$options, options, _yield$this$CreateCon, objectId, writeToken, originalObjectId, metadata, permission, userCapKey, userConkKey;

    return _regeneratorRuntime.wrap(function _callee13$(_context13) {
      while (1) {
        switch (_context13.prev = _context13.next) {
          case 0:
            libraryId = _ref22.libraryId, originalVersionHash = _ref22.originalVersionHash, _ref22$options = _ref22.options, options = _ref22$options === void 0 ? {} : _ref22$options;
            ValidateLibrary(libraryId);
            ValidateVersion(originalVersionHash);
            options.copy_from = originalVersionHash;
            _context13.next = 6;
            return this.CreateContentObject({
              libraryId: libraryId,
              options: options
            });

          case 6:
            _yield$this$CreateCon = _context13.sent;
            objectId = _yield$this$CreateCon.objectId;
            writeToken = _yield$this$CreateCon.writeToken;
            originalObjectId = this.utils.DecodeVersionHash(originalVersionHash).objectId;
            _context13.next = 12;
            return this.ContentObjectMetadata({
              versionHash: originalVersionHash
            });

          case 12:
            metadata = _context13.sent;
            _context13.next = 15;
            return this.Permission({
              objectId: originalObjectId
            });

          case 15:
            permission = _context13.sent;
            // User CAP
            userCapKey = "eluv.caps.iusr".concat(this.utils.AddressToHash(this.signer.address));

            if (!metadata[userCapKey]) {
              _context13.next = 33;
              break;
            }

            _context13.next = 20;
            return this.Crypto.DecryptCap(metadata[userCapKey], this.signer._signingKey().privateKey);

          case 20:
            userConkKey = _context13.sent;
            userConkKey.qid = objectId;
            _context13.t0 = this;
            _context13.t1 = libraryId;
            _context13.t2 = objectId;
            _context13.t3 = writeToken;
            _context13.t4 = userCapKey;
            _context13.next = 29;
            return this.Crypto.EncryptConk(userConkKey, this.signer._signingKey().publicKey);

          case 29:
            _context13.t5 = _context13.sent;
            _context13.t6 = {
              libraryId: _context13.t1,
              objectId: _context13.t2,
              writeToken: _context13.t3,
              metadataSubtree: _context13.t4,
              metadata: _context13.t5
            };
            _context13.next = 33;
            return _context13.t0.ReplaceMetadata.call(_context13.t0, _context13.t6);

          case 33:
            _context13.next = 35;
            return Promise.all(Object.keys(metadata).filter(function (key) {
              return key.startsWith("eluv.caps.ikms");
            }).map( /*#__PURE__*/function () {
              var _ref24 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee12(kmsCapKey) {
                return _regeneratorRuntime.wrap(function _callee12$(_context12) {
                  while (1) {
                    switch (_context12.prev = _context12.next) {
                      case 0:
                        _context12.next = 2;
                        return _this2.DeleteMetadata({
                          libraryId: libraryId,
                          objectId: objectId,
                          writeToken: writeToken,
                          metadataSubtree: kmsCapKey
                        });

                      case 2:
                        return _context12.abrupt("return", _context12.sent);

                      case 3:
                      case "end":
                        return _context12.stop();
                    }
                  }
                }, _callee12);
              }));

              return function (_x13) {
                return _ref24.apply(this, arguments);
              };
            }()));

          case 35:
            if (!(permission !== "owner")) {
              _context13.next = 38;
              break;
            }

            _context13.next = 38;
            return this.CreateEncryptionConk({
              libraryId: libraryId,
              objectId: objectId,
              writeToken: writeToken,
              createKMSConk: true
            });

          case 38:
            _context13.next = 40;
            return this.FinalizeContentObject({
              libraryId: libraryId,
              objectId: objectId,
              writeToken: writeToken
            });

          case 40:
            return _context13.abrupt("return", _context13.sent);

          case 41:
          case "end":
            return _context13.stop();
        }
      }
    }, _callee13, this);
  }));

  return function (_x12) {
    return _ref23.apply(this, arguments);
  };
}();
/**
 * Create a non-owner cap key using the specified public key and address
 *
 * @methodGroup Access Requests
 * @namedParams
 * @param {string} libraryId - ID of the library
 * @param {string} objectId - ID of the object
 * @param {string} publicKey - Public key for the target cap
 * @param {string} writeToken - Write token for the content object - If specified, info will be retrieved from the write draft instead of creating a new draft and finalizing
 *
 * @returns {Promise<Object>}
 */


exports.CreateNonOwnerCap = /*#__PURE__*/function () {
  var _ref26 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee14(_ref25) {
    var objectId, libraryId, publicKey, writeToken, userCapKey, userCapValue, userConk, publicAddress, targetUserCapKey, targetUserCapValue, finalize;
    return _regeneratorRuntime.wrap(function _callee14$(_context14) {
      while (1) {
        switch (_context14.prev = _context14.next) {
          case 0:
            objectId = _ref25.objectId, libraryId = _ref25.libraryId, publicKey = _ref25.publicKey, writeToken = _ref25.writeToken;
            userCapKey = "eluv.caps.iusr".concat(this.utils.AddressToHash(this.signer.address));
            _context14.next = 4;
            return this.ContentObjectMetadata({
              objectId: objectId,
              libraryId: libraryId,
              metadataSubtree: userCapKey
            });

          case 4:
            userCapValue = _context14.sent;

            if (userCapValue) {
              _context14.next = 7;
              break;
            }

            throw Error("No user cap found for current user");

          case 7:
            _context14.next = 9;
            return this.Crypto.DecryptCap(userCapValue, this.signer._signingKey().privateKey);

          case 9:
            userConk = _context14.sent;
            publicAddress = this.utils.PublicKeyToAddress(publicKey);
            targetUserCapKey = "eluv.caps.iusr".concat(this.utils.AddressToHash(publicAddress));
            _context14.next = 14;
            return this.Crypto.EncryptConk(userConk, publicKey);

          case 14:
            targetUserCapValue = _context14.sent;
            finalize = !writeToken;

            if (writeToken) {
              _context14.next = 20;
              break;
            }

            _context14.next = 19;
            return this.EditContentObject({
              libraryId: libraryId,
              objectId: objectId
            }).writeToken;

          case 19:
            writeToken = _context14.sent;

          case 20:
            this.ReplaceMetadata({
              libraryId: libraryId,
              objectId: objectId,
              writeToken: writeToken,
              metadataSubtree: targetUserCapKey,
              metadata: targetUserCapValue
            });

            if (!finalize) {
              _context14.next = 24;
              break;
            }

            _context14.next = 24;
            return this.FinalizeContentObject({
              libraryId: libraryId,
              objectId: objectId,
              writeToken: writeToken,
              commitMessage: "Create non-owner cap"
            });

          case 24:
          case "end":
            return _context14.stop();
        }
      }
    }, _callee14, this);
  }));

  return function (_x14) {
    return _ref26.apply(this, arguments);
  };
}();
/**
 * Create a new content object draft from an existing object.
 *
 * @methodGroup Content Objects
 * @namedParams
 * @param {string} libraryId - ID of the library
 * @param {string} objectId - ID of the object
 * @param {object=} options -
 * meta: New metadata for the object - will be merged into existing metadata if specified
 * type: New type for the object - Object ID, version hash or name of type
 *
 * @returns {Promise<object>} - Response containing the object ID and write token of the draft, as well as URL of node handling the draft
 */


exports.EditContentObject = /*#__PURE__*/function () {
  var _ref28 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee15(_ref27) {
    var libraryId, objectId, _ref27$options, options, path, rawEditResponse, nodeUrl, editResponse;

    return _regeneratorRuntime.wrap(function _callee15$(_context15) {
      while (1) {
        switch (_context15.prev = _context15.next) {
          case 0:
            libraryId = _ref27.libraryId, objectId = _ref27.objectId, _ref27$options = _ref27.options, options = _ref27$options === void 0 ? {} : _ref27$options;
            ValidateParameters({
              libraryId: libraryId,
              objectId: objectId
            });
            this.Log("Opening content draft: ".concat(libraryId, " ").concat(objectId));

            if (!("type" in options && options.type)) {
              _context15.next = 23;
              break;
            }

            if (!options.type.startsWith("hq__")) {
              _context15.next = 10;
              break;
            }

            _context15.next = 7;
            return this.ContentType({
              versionHash: options.type
            });

          case 7:
            options.type = _context15.sent.hash;
            _context15.next = 23;
            break;

          case 10:
            if (!options.type.startsWith("iq__")) {
              _context15.next = 16;
              break;
            }

            _context15.next = 13;
            return this.ContentType({
              typeId: options.type
            });

          case 13:
            options.type = _context15.sent.hash;
            _context15.next = 23;
            break;

          case 16:
            if (!options.type) {
              _context15.next = 22;
              break;
            }

            _context15.next = 19;
            return this.ContentType({
              name: options.type
            });

          case 19:
            options.type = _context15.sent.hash;
            _context15.next = 23;
            break;

          case 22:
            options.type = "";

          case 23:
            path = UrlJoin("qid", objectId);
            _context15.t0 = this.HttpClient;
            _context15.next = 27;
            return this.authClient.AuthorizationHeader({
              libraryId: libraryId,
              objectId: objectId,
              update: true
            });

          case 27:
            _context15.t1 = _context15.sent;
            _context15.t2 = path;
            _context15.t3 = options;
            _context15.t4 = {
              headers: _context15.t1,
              method: "POST",
              path: _context15.t2,
              body: _context15.t3
            };
            _context15.next = 33;
            return _context15.t0.Request.call(_context15.t0, _context15.t4);

          case 33:
            rawEditResponse = _context15.sent;
            nodeUrl = new URL(rawEditResponse.url).origin;
            _context15.next = 37;
            return this.utils.ResponseToJson(rawEditResponse);

          case 37:
            editResponse = _context15.sent;
            // Record the node used in creating this write token
            this.HttpClient.RecordWriteToken(editResponse.write_token, nodeUrl);
            editResponse.writeToken = editResponse.write_token;
            editResponse.objectId = editResponse.id;
            editResponse.nodeUrl = nodeUrl;
            return _context15.abrupt("return", editResponse);

          case 43:
          case "end":
            return _context15.stop();
        }
      }
    }, _callee15, this);
  }));

  return function (_x15) {
    return _ref28.apply(this, arguments);
  };
}();
/**
 * Create and finalize new content object draft from an existing object.
 *
 * Equivalent to:
 *
 * CreateContentObject()
 *
 * callback({objectId, writeToken})
 *
 * FinalizeContentObject()
 *
 *
 * @methodGroup Content Objects
 * @namedParams
 * @param {string} libraryId - ID of the library
 * @param {function=} callback - Async function to perform after creating the content draft and before finalizing. Object ID and write token are passed as named parameters.
 * @param {object=} options -
 * meta: New metadata for the object - will be merged into existing metadata if specified
 * type: New type for the object - Object ID, version hash or name of type
 * @param {string=} commitMessage - Message to include about this commit
 * @param {boolean=} publish=true - If specified, the object will also be published
 * @param {boolean=} awaitCommitConfirmation=true - If specified, will wait for the publish commit to be confirmed.
 * Irrelevant if not publishing.
 *
 * @returns {Promise<object>} - Response from FinalizeContentObject
 */


exports.CreateAndFinalizeContentObject = /*#__PURE__*/function () {
  var _ref30 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee16(_ref29) {
    var libraryId, callback, _ref29$options, options, _ref29$commitMessage, commitMessage, _ref29$publish, publish, _ref29$awaitCommitCon, awaitCommitConfirmation, args, id, writeToken;

    return _regeneratorRuntime.wrap(function _callee16$(_context16) {
      while (1) {
        switch (_context16.prev = _context16.next) {
          case 0:
            libraryId = _ref29.libraryId, callback = _ref29.callback, _ref29$options = _ref29.options, options = _ref29$options === void 0 ? {} : _ref29$options, _ref29$commitMessage = _ref29.commitMessage, commitMessage = _ref29$commitMessage === void 0 ? "" : _ref29$commitMessage, _ref29$publish = _ref29.publish, publish = _ref29$publish === void 0 ? true : _ref29$publish, _ref29$awaitCommitCon = _ref29.awaitCommitConfirmation, awaitCommitConfirmation = _ref29$awaitCommitCon === void 0 ? true : _ref29$awaitCommitCon;
            _context16.next = 3;
            return this.CreateContentObject({
              libraryId: libraryId,
              options: options
            });

          case 3:
            args = _context16.sent;
            id = args.id, writeToken = args.writeToken;

            if (!callback) {
              _context16.next = 8;
              break;
            }

            _context16.next = 8;
            return callback({
              objectId: id,
              writeToken: writeToken
            });

          case 8:
            _context16.next = 10;
            return this.FinalizeContentObject({
              libraryId: libraryId,
              objectId: id,
              writeToken: writeToken,
              commitMessage: commitMessage,
              publish: publish,
              awaitCommitConfirmation: awaitCommitConfirmation
            });

          case 10:
            return _context16.abrupt("return", _context16.sent);

          case 11:
          case "end":
            return _context16.stop();
        }
      }
    }, _callee16, this);
  }));

  return function (_x16) {
    return _ref30.apply(this, arguments);
  };
}();
/**
 * Create and finalize new content object draft from an existing object.
 *
 * Equivalent to:
 *
 * EditContentObject()
 *
 * callback({writeToken})
 *
 * FinalizeContentObject()
 *
 *
 * @methodGroup Content Objects
 * @namedParams
 * @param {string} libraryId - ID of the library
 * @param {string} objectId - ID of the object
 * @param {function=} callback - Async function to perform after creating the content draft and before finalizing. Write token is passed as a named parameter.
 * @param {object=} options -
 * meta: New metadata for the object - will be merged into existing metadata if specified
 * type: New type for the object - Object ID, version hash or name of type
 * @param {string=} commitMessage - Message to include about this commit
 * @param {boolean=} publish=true - If specified, the object will also be published
 * @param {boolean=} awaitCommitConfirmation=true - If specified, will wait for the publish commit to be confirmed.
 * Irrelevant if not publishing.
 *
 * @returns {Promise<object>} - Response from FinalizeContentObject
 */


exports.EditAndFinalizeContentObject = /*#__PURE__*/function () {
  var _ref32 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee17(_ref31) {
    var libraryId, objectId, callback, _ref31$options, options, _ref31$commitMessage, commitMessage, _ref31$publish, publish, _ref31$awaitCommitCon, awaitCommitConfirmation, _yield$this$EditConte, writeToken;

    return _regeneratorRuntime.wrap(function _callee17$(_context17) {
      while (1) {
        switch (_context17.prev = _context17.next) {
          case 0:
            libraryId = _ref31.libraryId, objectId = _ref31.objectId, callback = _ref31.callback, _ref31$options = _ref31.options, options = _ref31$options === void 0 ? {} : _ref31$options, _ref31$commitMessage = _ref31.commitMessage, commitMessage = _ref31$commitMessage === void 0 ? "" : _ref31$commitMessage, _ref31$publish = _ref31.publish, publish = _ref31$publish === void 0 ? true : _ref31$publish, _ref31$awaitCommitCon = _ref31.awaitCommitConfirmation, awaitCommitConfirmation = _ref31$awaitCommitCon === void 0 ? true : _ref31$awaitCommitCon;
            _context17.next = 3;
            return this.EditContentObject({
              libraryId: libraryId,
              objectId: objectId,
              options: options
            });

          case 3:
            _yield$this$EditConte = _context17.sent;
            writeToken = _yield$this$EditConte.writeToken;

            if (!callback) {
              _context17.next = 8;
              break;
            }

            _context17.next = 8;
            return callback({
              writeToken: writeToken
            });

          case 8:
            _context17.next = 10;
            return this.FinalizeContentObject({
              libraryId: libraryId,
              objectId: objectId,
              writeToken: writeToken,
              commitMessage: commitMessage,
              publish: publish,
              awaitCommitConfirmation: awaitCommitConfirmation
            });

          case 10:
            return _context17.abrupt("return", _context17.sent);

          case 11:
          case "end":
            return _context17.stop();
        }
      }
    }, _callee17, this);
  }));

  return function (_x17) {
    return _ref32.apply(this, arguments);
  };
}();

exports.AwaitPending = /*#__PURE__*/function () {
  var _ref33 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee19(objectId) {
    var _this3 = this;

    var PendingHash, pending, isWallet, timeout, i;
    return _regeneratorRuntime.wrap(function _callee19$(_context19) {
      while (1) {
        switch (_context19.prev = _context19.next) {
          case 0:
            PendingHash = /*#__PURE__*/function () {
              var _ref34 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee18() {
                return _regeneratorRuntime.wrap(function _callee18$(_context18) {
                  while (1) {
                    switch (_context18.prev = _context18.next) {
                      case 0:
                        _context18.next = 2;
                        return _this3.CallContractMethod({
                          contractAddress: _this3.utils.HashToAddress(objectId),
                          methodName: "pendingHash"
                        });

                      case 2:
                        return _context18.abrupt("return", _context18.sent);

                      case 3:
                      case "end":
                        return _context18.stop();
                    }
                  }
                }, _callee18);
              }));

              return function PendingHash() {
                return _ref34.apply(this, arguments);
              };
            }();

            this.Log("Checking for pending commit");
            _context19.next = 4;
            return PendingHash();

          case 4:
            pending = _context19.sent;

            if (pending) {
              _context19.next = 7;
              break;
            }

            return _context19.abrupt("return");

          case 7:
            _context19.next = 9;
            return this.authClient.AccessType(objectId);

          case 9:
            _context19.t0 = _context19.sent;
            _context19.t1 = this.authClient.ACCESS_TYPES.WALLET;
            isWallet = _context19.t0 === _context19.t1;
            timeout = isWallet ? 3 : 10;
            this.Log("Waiting for pending commit to clear for ".concat(objectId));
            i = 0;

          case 15:
            if (!(i < timeout)) {
              _context19.next = 25;
              break;
            }

            _context19.next = 18;
            return new Promise(function (resolve) {
              return setTimeout(resolve, 1000);
            });

          case 18:
            _context19.next = 20;
            return PendingHash();

          case 20:
            if (_context19.sent) {
              _context19.next = 22;
              break;
            }

            return _context19.abrupt("return");

          case 22:
            i++;
            _context19.next = 15;
            break;

          case 25:
            if (!isWallet) {
              _context19.next = 31;
              break;
            }

            this.Log("Clearing stuck wallet commit", true); // Clear pending commit, it's probably stuck

            _context19.next = 29;
            return this.CallContractMethodAndWait({
              contractAddress: this.utils.HashToAddress(objectId),
              methodName: "clearPending"
            });

          case 29:
            _context19.next = 32;
            break;

          case 31:
            throw Error("Unable to finalize ".concat(objectId, " - Another commit is pending"));

          case 32:
          case "end":
            return _context19.stop();
        }
      }
    }, _callee19, this);
  }));

  return function (_x18) {
    return _ref33.apply(this, arguments);
  };
}();
/**
 * Finalize content draft
 *
 * @methodGroup Content Objects
 * @namedParams
 * @param {string} libraryId - ID of the library
 * @param {string} objectId - ID of the object
 * @param {string} writeToken - Write token of the draft
 * @param {string=} commitMessage - Message to include about this commit
 * @param {boolean=} publish=true - If specified, the object will also be published
 * @param {boolean=} awaitCommitConfirmation=true - If specified, will wait for the publish commit to be confirmed.
 * Irrelevant if not publishing.
 */


exports.FinalizeContentObject = /*#__PURE__*/function () {
  var _ref36 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee20(_ref35) {
    var libraryId, objectId, writeToken, _ref35$commitMessage, commitMessage, _ref35$publish, publish, _ref35$awaitCommitCon, awaitCommitConfirmation, path, finalizeResponse;

    return _regeneratorRuntime.wrap(function _callee20$(_context20) {
      while (1) {
        switch (_context20.prev = _context20.next) {
          case 0:
            libraryId = _ref35.libraryId, objectId = _ref35.objectId, writeToken = _ref35.writeToken, _ref35$commitMessage = _ref35.commitMessage, commitMessage = _ref35$commitMessage === void 0 ? "" : _ref35$commitMessage, _ref35$publish = _ref35.publish, publish = _ref35$publish === void 0 ? true : _ref35$publish, _ref35$awaitCommitCon = _ref35.awaitCommitConfirmation, awaitCommitConfirmation = _ref35$awaitCommitCon === void 0 ? true : _ref35$awaitCommitCon;
            ValidateParameters({
              libraryId: libraryId,
              objectId: objectId
            });
            ValidateWriteToken(writeToken);
            _context20.t0 = this;
            _context20.t1 = libraryId;
            _context20.t2 = objectId;
            _context20.t3 = writeToken;
            _context20.t4 = commitMessage;
            _context20.next = 10;
            return this.userProfileClient.UserMetadata({
              metadataSubtree: "public/name"
            });

          case 10:
            _context20.t5 = _context20.sent;

            if (_context20.t5) {
              _context20.next = 13;
              break;
            }

            _context20.t5 = this.CurrentAccountAddress();

          case 13:
            _context20.t6 = _context20.t5;
            _context20.t7 = this.CurrentAccountAddress();
            _context20.t8 = new Date().toISOString();
            _context20.t9 = {
              message: _context20.t4,
              author: _context20.t6,
              author_address: _context20.t7,
              timestamp: _context20.t8
            };
            _context20.t10 = {
              libraryId: _context20.t1,
              objectId: _context20.t2,
              writeToken: _context20.t3,
              metadataSubtree: "commit",
              metadata: _context20.t9
            };
            _context20.next = 20;
            return _context20.t0.ReplaceMetadata.call(_context20.t0, _context20.t10);

          case 20:
            this.Log("Finalizing content draft: ".concat(libraryId, " ").concat(objectId, " ").concat(writeToken));
            _context20.next = 23;
            return this.AwaitPending(objectId);

          case 23:
            path = UrlJoin("q", writeToken);
            _context20.t11 = this.utils;
            _context20.t12 = this.HttpClient;
            _context20.next = 28;
            return this.authClient.AuthorizationHeader({
              libraryId: libraryId,
              objectId: objectId,
              update: true
            });

          case 28:
            _context20.t13 = _context20.sent;
            _context20.t14 = path;
            _context20.t15 = {
              headers: _context20.t13,
              method: "POST",
              path: _context20.t14,
              failover: false
            };
            _context20.t16 = _context20.t12.Request.call(_context20.t12, _context20.t15);
            _context20.next = 34;
            return _context20.t11.ResponseToJson.call(_context20.t11, _context20.t16);

          case 34:
            finalizeResponse = _context20.sent;
            this.Log("Finalized: ".concat(finalizeResponse.hash));

            if (!publish) {
              _context20.next = 39;
              break;
            }

            _context20.next = 39;
            return this.PublishContentVersion({
              objectId: objectId,
              versionHash: finalizeResponse.hash,
              awaitCommitConfirmation: awaitCommitConfirmation
            });

          case 39:
            // Invalidate cached content type, if this is one.
            delete this.contentTypes[objectId];
            return _context20.abrupt("return", finalizeResponse);

          case 41:
          case "end":
            return _context20.stop();
        }
      }
    }, _callee20, this);
  }));

  return function (_x19) {
    return _ref36.apply(this, arguments);
  };
}();
/**
 * Publish a previously finalized content object version
 *
 * @methodGroup Content Objects
 * @namedParams
 * @param {string} libraryId - ID of the library
 * @param {string} objectId - ID of the object
 * @param {string} versionHash - The version hash of the content object to publish
 * @param {boolean=} awaitCommitConfirmation=true - If specified, will wait for the publish commit to be confirmed.
 */


exports.PublishContentVersion = /*#__PURE__*/function () {
  var _ref38 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee22(_ref37) {
    var _this4 = this;

    var objectId, versionHash, _ref37$awaitCommitCon, awaitCommitConfirmation, commit, abi, fromBlock, objectHash, pendingHash;

    return _regeneratorRuntime.wrap(function _callee22$(_context22) {
      while (1) {
        switch (_context22.prev = _context22.next) {
          case 0:
            objectId = _ref37.objectId, versionHash = _ref37.versionHash, _ref37$awaitCommitCon = _ref37.awaitCommitConfirmation, awaitCommitConfirmation = _ref37$awaitCommitCon === void 0 ? true : _ref37$awaitCommitCon;
            versionHash ? ValidateVersion(versionHash) : ValidateObject(objectId);
            this.Log("Publishing: ".concat(objectId || versionHash));

            if (versionHash) {
              objectId = this.utils.DecodeVersionHash(versionHash).objectId;
            }

            _context22.next = 6;
            return this.ethClient.CommitContent({
              contentObjectAddress: this.utils.HashToAddress(objectId),
              versionHash: versionHash,
              signer: this.signer
            });

          case 6:
            commit = _context22.sent;
            _context22.next = 9;
            return this.ContractAbi({
              id: objectId
            });

          case 9:
            abi = _context22.sent;
            fromBlock = commit.blockNumber + 1;
            _context22.next = 13;
            return this.ExtractValueFromEvent({
              abi: abi,
              event: commit,
              eventName: "CommitPending",
              eventValue: "objectHash"
            });

          case 13:
            objectHash = _context22.sent;
            _context22.next = 16;
            return this.CallContractMethod({
              contractAddress: this.utils.HashToAddress(objectId),
              methodName: "pendingHash"
            });

          case 16:
            pendingHash = _context22.sent;

            if (!(pendingHash && pendingHash !== objectHash)) {
              _context22.next = 19;
              break;
            }

            throw Error("Pending version hash mismatch on ".concat(objectId, ": expected ").concat(objectHash, ", currently ").concat(pendingHash));

          case 19:
            if (!awaitCommitConfirmation) {
              _context22.next = 21;
              break;
            }

            return _context22.delegateYield( /*#__PURE__*/_regeneratorRuntime.mark(function _callee21() {
              var pollingInterval, events, confirmEvent;
              return _regeneratorRuntime.wrap(function _callee21$(_context21) {
                while (1) {
                  switch (_context21.prev = _context21.next) {
                    case 0:
                      _this4.Log("Awaiting commit confirmation for ".concat(objectHash));

                      pollingInterval = _this4.ethClient.Provider().pollingInterval || 500; // eslint-disable-next-line no-constant-condition

                    case 2:
                      if (!true) {
                        _context21.next = 14;
                        break;
                      }

                      _context21.next = 5;
                      return new Promise(function (resolve) {
                        return setTimeout(resolve, pollingInterval);
                      });

                    case 5:
                      _context21.next = 7;
                      return _this4.ContractEvents({
                        contractAddress: _this4.utils.HashToAddress(objectId),
                        abi: abi,
                        fromBlock: fromBlock,
                        count: 1000
                      });

                    case 7:
                      events = _context21.sent;
                      confirmEvent = events.find(function (blockEvents) {
                        return blockEvents.find(function (event) {
                          return objectHash === (event && event.args && event.args.objectHash);
                        });
                      });

                      if (!confirmEvent) {
                        _context21.next = 12;
                        break;
                      }

                      // Found confirmation
                      _this4.Log("Commit confirmed: ".concat(objectHash));

                      return _context21.abrupt("break", 14);

                    case 12:
                      _context21.next = 2;
                      break;

                    case 14:
                    case "end":
                      return _context21.stop();
                  }
                }
              }, _callee21);
            })(), "t0", 21);

          case 21:
          case "end":
            return _context22.stop();
        }
      }
    }, _callee22, this);
  }));

  return function (_x20) {
    return _ref38.apply(this, arguments);
  };
}();
/**
 * Delete specified version of the content object
 *
 * @methodGroup Content Objects
 * @namedParams
 * @param {string=} versionHash - Hash of the object version - if not specified, most recent version will be deleted
 */


exports.DeleteContentVersion = /*#__PURE__*/function () {
  var _ref40 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee23(_ref39) {
    var versionHash, _this$utils$DecodeVer, objectId;

    return _regeneratorRuntime.wrap(function _callee23$(_context23) {
      while (1) {
        switch (_context23.prev = _context23.next) {
          case 0:
            versionHash = _ref39.versionHash;
            ValidateVersion(versionHash);
            this.Log("Deleting content version: ".concat(versionHash));
            _this$utils$DecodeVer = this.utils.DecodeVersionHash(versionHash), objectId = _this$utils$DecodeVer.objectId;
            _context23.next = 6;
            return this.CallContractMethodAndWait({
              contractAddress: this.utils.HashToAddress(objectId),
              methodName: "deleteVersion",
              methodArgs: [versionHash]
            });

          case 6:
          case "end":
            return _context23.stop();
        }
      }
    }, _callee23, this);
  }));

  return function (_x21) {
    return _ref40.apply(this, arguments);
  };
}();
/**
 * Delete specified content object
 *
 * @methodGroup Content Objects
 * @namedParams
 * @param {string} libraryId - ID of the library
 * @param {string} objectId - ID of the object
 */


exports.DeleteContentObject = /*#__PURE__*/function () {
  var _ref42 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee24(_ref41) {
    var libraryId, objectId;
    return _regeneratorRuntime.wrap(function _callee24$(_context24) {
      while (1) {
        switch (_context24.prev = _context24.next) {
          case 0:
            libraryId = _ref41.libraryId, objectId = _ref41.objectId;
            ValidateParameters({
              libraryId: libraryId,
              objectId: objectId
            });
            this.Log("Deleting content version: ".concat(libraryId, " ").concat(objectId));
            _context24.next = 5;
            return this.CallContractMethodAndWait({
              contractAddress: this.utils.HashToAddress(libraryId),
              methodName: "deleteContent",
              methodArgs: [this.utils.HashToAddress(objectId)]
            });

          case 5:
          case "end":
            return _context24.stop();
        }
      }
    }, _callee24, this);
  }));

  return function (_x22) {
    return _ref42.apply(this, arguments);
  };
}();
/* Content object metadata */

/**
 * Merge specified metadata into existing content object metadata
 *
 * @methodGroup Metadata
 * @namedParams
 * @param {string} libraryId - ID of the library
 * @param {string} objectId - ID of the object
 * @param {string} writeToken - Write token of the draft
 * @param {Object} metadata - New metadata to merge
 * @param {string=} metadataSubtree - Subtree of the object metadata to modify
 */


exports.MergeMetadata = /*#__PURE__*/function () {
  var _ref44 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee25(_ref43) {
    var libraryId, objectId, writeToken, _ref43$metadataSubtre, metadataSubtree, _ref43$metadata, metadata, path;

    return _regeneratorRuntime.wrap(function _callee25$(_context25) {
      while (1) {
        switch (_context25.prev = _context25.next) {
          case 0:
            libraryId = _ref43.libraryId, objectId = _ref43.objectId, writeToken = _ref43.writeToken, _ref43$metadataSubtre = _ref43.metadataSubtree, metadataSubtree = _ref43$metadataSubtre === void 0 ? "/" : _ref43$metadataSubtre, _ref43$metadata = _ref43.metadata, metadata = _ref43$metadata === void 0 ? {} : _ref43$metadata;
            ValidateParameters({
              libraryId: libraryId,
              objectId: objectId
            });
            ValidateWriteToken(writeToken);
            this.Log("Merging metadata: ".concat(libraryId, " ").concat(objectId, " ").concat(writeToken, "\n      Subtree: ").concat(metadataSubtree));
            this.Log(metadata);
            path = UrlJoin("q", writeToken, "meta", metadataSubtree);
            _context25.t0 = this.HttpClient;
            _context25.next = 9;
            return this.authClient.AuthorizationHeader({
              libraryId: libraryId,
              objectId: objectId,
              update: true
            });

          case 9:
            _context25.t1 = _context25.sent;
            _context25.t2 = path;
            _context25.t3 = metadata;
            _context25.t4 = {
              headers: _context25.t1,
              method: "POST",
              path: _context25.t2,
              body: _context25.t3,
              failover: false
            };
            _context25.next = 15;
            return _context25.t0.Request.call(_context25.t0, _context25.t4);

          case 15:
          case "end":
            return _context25.stop();
        }
      }
    }, _callee25, this);
  }));

  return function (_x23) {
    return _ref44.apply(this, arguments);
  };
}();
/**
 * Replace content object metadata with specified metadata
 *
 * @methodGroup Metadata
 * @namedParams
 * @param {string} libraryId - ID of the library
 * @param {string} objectId - ID of the object
 * @param {string} writeToken - Write token of the draft
 * @param {Object} metadata - New metadata to merge
 * @param {string=} metadataSubtree - Subtree of the object metadata to modify
 */


exports.ReplaceMetadata = /*#__PURE__*/function () {
  var _ref46 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee26(_ref45) {
    var libraryId, objectId, writeToken, _ref45$metadataSubtre, metadataSubtree, _ref45$metadata, metadata, path;

    return _regeneratorRuntime.wrap(function _callee26$(_context26) {
      while (1) {
        switch (_context26.prev = _context26.next) {
          case 0:
            libraryId = _ref45.libraryId, objectId = _ref45.objectId, writeToken = _ref45.writeToken, _ref45$metadataSubtre = _ref45.metadataSubtree, metadataSubtree = _ref45$metadataSubtre === void 0 ? "/" : _ref45$metadataSubtre, _ref45$metadata = _ref45.metadata, metadata = _ref45$metadata === void 0 ? {} : _ref45$metadata;
            ValidateParameters({
              libraryId: libraryId,
              objectId: objectId
            });
            ValidateWriteToken(writeToken);
            this.Log("Replacing metadata: ".concat(libraryId, " ").concat(objectId, " ").concat(writeToken, "\n      Subtree: ").concat(metadataSubtree));
            this.Log(metadata);
            path = UrlJoin("q", writeToken, "meta", metadataSubtree);
            _context26.t0 = this.HttpClient;
            _context26.next = 9;
            return this.authClient.AuthorizationHeader({
              libraryId: libraryId,
              objectId: objectId,
              update: true
            });

          case 9:
            _context26.t1 = _context26.sent;
            _context26.t2 = path;
            _context26.t3 = metadata;
            _context26.t4 = {
              headers: _context26.t1,
              method: "PUT",
              path: _context26.t2,
              body: _context26.t3,
              failover: false
            };
            _context26.next = 15;
            return _context26.t0.Request.call(_context26.t0, _context26.t4);

          case 15:
          case "end":
            return _context26.stop();
        }
      }
    }, _callee26, this);
  }));

  return function (_x24) {
    return _ref46.apply(this, arguments);
  };
}();
/**
 * Delete content object metadata of specified subtree
 *
 * @methodGroup Metadata
 * @namedParams
 * @param {string} libraryId - ID of the library
 * @param {string} objectId - ID of the object
 * @param {string} writeToken - Write token of the draft
 * @param {string=} metadataSubtree - Subtree of the object metadata to modify
 * - if not specified, all metadata will be deleted
 */


exports.DeleteMetadata = /*#__PURE__*/function () {
  var _ref48 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee27(_ref47) {
    var libraryId, objectId, writeToken, _ref47$metadataSubtre, metadataSubtree, path;

    return _regeneratorRuntime.wrap(function _callee27$(_context27) {
      while (1) {
        switch (_context27.prev = _context27.next) {
          case 0:
            libraryId = _ref47.libraryId, objectId = _ref47.objectId, writeToken = _ref47.writeToken, _ref47$metadataSubtre = _ref47.metadataSubtree, metadataSubtree = _ref47$metadataSubtre === void 0 ? "/" : _ref47$metadataSubtre;
            ValidateParameters({
              libraryId: libraryId,
              objectId: objectId
            });
            ValidateWriteToken(writeToken);
            this.Log("Deleting metadata: ".concat(libraryId, " ").concat(objectId, " ").concat(writeToken, "\n      Subtree: ").concat(metadataSubtree));
            this.Log("Subtree: ".concat(metadataSubtree));
            path = UrlJoin("q", writeToken, "meta", metadataSubtree);
            _context27.t0 = this.HttpClient;
            _context27.next = 9;
            return this.authClient.AuthorizationHeader({
              libraryId: libraryId,
              objectId: objectId,
              update: true
            });

          case 9:
            _context27.t1 = _context27.sent;
            _context27.t2 = path;
            _context27.t3 = {
              headers: _context27.t1,
              method: "DELETE",
              path: _context27.t2,
              failover: false
            };
            _context27.next = 14;
            return _context27.t0.Request.call(_context27.t0, _context27.t3);

          case 14:
          case "end":
            return _context27.stop();
        }
      }
    }, _callee27, this);
  }));

  return function (_x25) {
    return _ref48.apply(this, arguments);
  };
}();
/**
 * Set the access charge for the specified object
 *
 * @methodGroup Access Requests
 * @namedParams
 * @param {string} objectId - ID of the object
 * @param {number | string} accessCharge - The new access charge, in ether
 */


exports.SetAccessCharge = /*#__PURE__*/function () {
  var _ref50 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee28(_ref49) {
    var objectId, accessCharge;
    return _regeneratorRuntime.wrap(function _callee28$(_context28) {
      while (1) {
        switch (_context28.prev = _context28.next) {
          case 0:
            objectId = _ref49.objectId, accessCharge = _ref49.accessCharge;
            ValidateObject(objectId);
            this.Log("Setting access charge: ".concat(objectId, " ").concat(accessCharge));
            _context28.next = 5;
            return this.ethClient.CallContractMethodAndWait({
              contractAddress: this.utils.HashToAddress(objectId),
              methodName: "setAccessCharge",
              methodArgs: [this.utils.EtherToWei(accessCharge).toString()]
            });

          case 5:
          case "end":
            return _context28.stop();
        }
      }
    }, _callee28, this);
  }));

  return function (_x26) {
    return _ref50.apply(this, arguments);
  };
}();
/**
 * Recursively update all auto_update links in the specified object.
 *
 * Note: Links will not be updated unless they are specifically marked as auto_update
 *
 * @methodGroup Links
 * @param {string=} libraryId - ID of the library
 * @param {string=} objectId - ID of the object
 * @param {string=} versionHash - Version hash of the object -- if not specified, latest version is returned
 * @param {function=} callback - If specified, the callback will be called each time an object is updated with
 * current progress as well as information about the last update (action)
 * - Format: {completed: number, total: number, action: string}
 */


exports.UpdateContentObjectGraph = /*#__PURE__*/function () {
  var _ref52 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee30(_ref51) {
    var _this5 = this;

    var libraryId, objectId, versionHash, callback, total, completed, _loop, _ret;

    return _regeneratorRuntime.wrap(function _callee30$(_context31) {
      while (1) {
        switch (_context31.prev = _context31.next) {
          case 0:
            libraryId = _ref51.libraryId, objectId = _ref51.objectId, versionHash = _ref51.versionHash, callback = _ref51.callback;
            ValidateParameters({
              libraryId: libraryId,
              objectId: objectId,
              versionHash: versionHash
            });
            this.Log("Updating content object graph: ".concat(libraryId || "", " ").concat(objectId || versionHash));

            if (versionHash) {
              objectId = this.utils.DecodeVersionHash(versionHash).objectId;
            }

            completed = 0; // eslint-disable-next-line no-constant-condition

            _loop = /*#__PURE__*/_regeneratorRuntime.mark(function _loop() {
              var graph, currentHash, links, details, name, currentLibraryId, currentObjectId, _yield$_this5$EditCon, write_token, _yield$_this5$Finaliz, hash;

              return _regeneratorRuntime.wrap(function _loop$(_context30) {
                while (1) {
                  switch (_context30.prev = _context30.next) {
                    case 0:
                      _context30.next = 2;
                      return _this5.ContentObjectGraph({
                        libraryId: libraryId,
                        objectId: objectId,
                        versionHash: versionHash,
                        autoUpdate: true,
                        select: ["name", "public/name", "public/asset_metadata/display_title"]
                      });

                    case 2:
                      graph = _context30.sent;

                      if (!(Object.keys(graph.auto_updates).length === 0)) {
                        _context30.next = 6;
                        break;
                      }

                      _this5.Log("No more updates required");

                      return _context30.abrupt("return", {
                        v: void 0
                      });

                    case 6:
                      if (!total) {
                        total = graph.auto_updates.order.length;
                      }

                      currentHash = graph.auto_updates.order[0];
                      links = graph.auto_updates.links[currentHash];
                      details = graph.details[currentHash].meta || {};
                      name = details["public"] && details["public"].asset_metadata && details["public"].asset_metadata.display_title || details["public"] && details["public"].name || details.name || versionHash || objectId;
                      _context30.next = 13;
                      return _this5.ContentObjectLibraryId({
                        versionHash: currentHash
                      });

                    case 13:
                      currentLibraryId = _context30.sent;
                      currentObjectId = _this5.utils.DecodeVersionHash(currentHash).objectId;

                      if (callback) {
                        callback({
                          completed: completed,
                          total: total,
                          action: "Updating ".concat(name, " (").concat(currentObjectId, ")...")
                        });
                      }

                      _this5.Log("Updating links for ".concat(name, " (").concat(currentObjectId, " / ").concat(currentHash, ")"));

                      _context30.next = 19;
                      return _this5.EditContentObject({
                        libraryId: currentLibraryId,
                        objectId: currentObjectId
                      });

                    case 19:
                      _yield$_this5$EditCon = _context30.sent;
                      write_token = _yield$_this5$EditCon.write_token;
                      _context30.next = 23;
                      return Promise.all(links.map( /*#__PURE__*/function () {
                        var _ref54 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee29(_ref53) {
                          var path, updated;
                          return _regeneratorRuntime.wrap(function _callee29$(_context29) {
                            while (1) {
                              switch (_context29.prev = _context29.next) {
                                case 0:
                                  path = _ref53.path, updated = _ref53.updated;
                                  _context29.next = 3;
                                  return _this5.ReplaceMetadata({
                                    libraryId: currentLibraryId,
                                    objectId: currentObjectId,
                                    writeToken: write_token,
                                    metadataSubtree: path,
                                    metadata: updated
                                  });

                                case 3:
                                case "end":
                                  return _context29.stop();
                              }
                            }
                          }, _callee29);
                        }));

                        return function (_x28) {
                          return _ref54.apply(this, arguments);
                        };
                      }()));

                    case 23:
                      _context30.next = 25;
                      return _this5.FinalizeContentObject({
                        libraryId: currentLibraryId,
                        objectId: currentObjectId,
                        writeToken: write_token,
                        commitMessage: "Update links"
                      });

                    case 25:
                      _yield$_this5$Finaliz = _context30.sent;
                      hash = _yield$_this5$Finaliz.hash;

                      // If root object was specified by hash and updated, update hash
                      if (currentHash === versionHash) {
                        versionHash = hash;
                      }

                      completed += 1;

                    case 29:
                    case "end":
                      return _context30.stop();
                  }
                }
              }, _loop);
            });

          case 6:
            if (!1) {
              _context31.next = 13;
              break;
            }

            return _context31.delegateYield(_loop(), "t0", 8);

          case 8:
            _ret = _context31.t0;

            if (!(_typeof(_ret) === "object")) {
              _context31.next = 11;
              break;
            }

            return _context31.abrupt("return", _ret.v);

          case 11:
            _context31.next = 6;
            break;

          case 13:
          case "end":
            return _context31.stop();
        }
      }
    }, _callee30, this);
  }));

  return function (_x27) {
    return _ref52.apply(this, arguments);
  };
}();
/**
 * Generate a signed link token.
 *
 * @methodGroup Links
 * @namedParams
 * @param {string=} containerId - ID of the container object
 * @param {string=} versionHash - Version hash of the object
 * @param {string=} link - Path
 * @param {string=} duration - How long the link should last in milliseconds
 *
 * @return {Promise<string>} - The state channel token
 */


exports.GenerateSignedLinkToken = /*#__PURE__*/function () {
  var _ref56 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee31(_ref55) {
    var containerId, versionHash, link, duration, canEdit, _this$utils$DecodeVer2, objectId, signerAddress, token, compressedToken, signature;

    return _regeneratorRuntime.wrap(function _callee31$(_context32) {
      while (1) {
        switch (_context32.prev = _context32.next) {
          case 0:
            containerId = _ref55.containerId, versionHash = _ref55.versionHash, link = _ref55.link, duration = _ref55.duration;
            ValidateObject(containerId);
            _context32.next = 4;
            return this.CallContractMethod({
              contractAddress: this.utils.HashToAddress(containerId),
              methodName: "canEdit"
            });

          case 4:
            canEdit = _context32.sent;
            _this$utils$DecodeVer2 = this.utils.DecodeVersionHash(versionHash), objectId = _this$utils$DecodeVer2.objectId;

            if (canEdit) {
              _context32.next = 8;
              break;
            }

            throw Error("Current user does not have permission to edit content object ".concat(objectId));

          case 8:
            signerAddress = this.CurrentAccountAddress();
            _context32.t0 = this.utils.B64(signerAddress.replace("0x", ""), "hex");
            _context32.next = 12;
            return this.ContentSpaceId();

          case 12:
            _context32.t1 = _context32.sent;
            _context32.next = 15;
            return this.ContentObjectLibraryId({
              objectId: objectId
            });

          case 15:
            _context32.t2 = _context32.sent;
            _context32.t3 = objectId;
            _context32.t4 = "iusr".concat(this.utils.AddressToHash(signerAddress));
            _context32.t5 = Date.now();
            _context32.t6 = duration ? Date.now() + duration : "";
            _context32.t7 = {
              elv: {
                lnk: link,
                src: containerId
              }
            };
            token = {
              adr: _context32.t0,
              spc: _context32.t1,
              lib: _context32.t2,
              qid: _context32.t3,
              sub: _context32.t4,
              gra: "read",
              iat: _context32.t5,
              exp: _context32.t6,
              ctx: _context32.t7
            };
            compressedToken = Pako.deflateRaw(Buffer.from(JSON.stringify(token), "utf-8"));
            _context32.next = 25;
            return this.authClient.Sign(Ethers.utils.keccak256(compressedToken));

          case 25:
            signature = _context32.sent;
            return _context32.abrupt("return", "aslsjc".concat(this.utils.B58(Buffer.concat([Buffer.from(signature.replace(/^0x/, ""), "hex"), Buffer.from(compressedToken)]))));

          case 27:
          case "end":
            return _context32.stop();
        }
      }
    }, _callee31, this);
  }));

  return function (_x29) {
    return _ref56.apply(this, arguments);
  };
}();
/**
 * Create links to files, metadata and/or representations of this or or other
 * content objects.
 *
 * Expected format of links:
 *

 [
    {
      path: string (metadata path for the link)
      target: string (path to link target),
      type: string ("file", "meta" | "metadata", "rep" - default "metadata")
      targetHash: string (optional, for cross-object links),
      autoUpdate: boolean (if specified, link will be automatically updated to latest version by UpdateContentObjectGraph method),
      authContainer: string (optional, object id of container object if creating a signed link)
    }
 ]

 * @methodGroup Links
 * @namedParams
 * @param {string} libraryId - ID of the library
 * @param {string} objectId - ID of the object
 * @param {string} writeToken - Write token of the draft
 * @param {Array<Object>} links - Link specifications
 */


exports.CreateLinks = /*#__PURE__*/function () {
  var _ref58 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee33(_ref57) {
    var _this6 = this;

    var libraryId, objectId, writeToken, _ref57$links, links;

    return _regeneratorRuntime.wrap(function _callee33$(_context34) {
      while (1) {
        switch (_context34.prev = _context34.next) {
          case 0:
            libraryId = _ref57.libraryId, objectId = _ref57.objectId, writeToken = _ref57.writeToken, _ref57$links = _ref57.links, links = _ref57$links === void 0 ? [] : _ref57$links;
            ValidateParameters({
              libraryId: libraryId,
              objectId: objectId
            });
            ValidateWriteToken(writeToken);
            _context34.next = 5;
            return this.utils.LimitedMap(10, links, /*#__PURE__*/function () {
              var _ref59 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee32(info) {
                var path, type, target, authTarget, link, linkMetadata;
                return _regeneratorRuntime.wrap(function _callee32$(_context33) {
                  while (1) {
                    switch (_context33.prev = _context33.next) {
                      case 0:
                        path = info.path.replace(/^(\/|\.)+/, "");
                        type = (info.type || "file") === "file" ? "files" : info.type;

                        if (type === "metadata") {
                          type = "meta";
                        }

                        target = authTarget = info.target.replace(/^(\/|\.)+/, "");

                        if (info.targetHash) {
                          target = "/qfab/".concat(info.targetHash, "/").concat(type, "/").concat(target);
                        } else {
                          target = "./".concat(type, "/").concat(target);
                        }

                        link = {
                          "/": target
                        };

                        if (info.autoUpdate) {
                          link["."] = {
                            auto_update: {
                              tag: "latest"
                            }
                          };
                        } // Sign link


                        if (!info.authContainer) {
                          _context33.next = 17;
                          break;
                        }

                        _context33.next = 10;
                        return _this6.ContentObjectMetadata({
                          libraryId: libraryId,
                          objectId: objectId,
                          metadataSubtree: path
                        });

                      case 10:
                        linkMetadata = _context33.sent;

                        if (linkMetadata) {
                          link = linkMetadata;
                        }

                        if (!link["."]) link["."] = {};

                        if (linkMetadata["."]["authorization"]) {
                          _context33.next = 17;
                          break;
                        }

                        _context33.next = 16;
                        return _this6.GenerateSignedLinkToken({
                          containerId: info.authContainer,
                          versionHash: info.targetHash,
                          link: "./".concat(type, "/").concat(authTarget)
                        });

                      case 16:
                        link["."]["authorization"] = _context33.sent;

                      case 17:
                        _context33.next = 19;
                        return _this6.ReplaceMetadata({
                          libraryId: libraryId,
                          objectId: objectId,
                          writeToken: writeToken,
                          metadataSubtree: path,
                          metadata: link
                        });

                      case 19:
                      case "end":
                        return _context33.stop();
                    }
                  }
                }, _callee32);
              }));

              return function (_x31) {
                return _ref59.apply(this, arguments);
              };
            }());

          case 5:
          case "end":
            return _context34.stop();
        }
      }
    }, _callee33, this);
  }));

  return function (_x30) {
    return _ref58.apply(this, arguments);
  };
}();
/**
 * Initialize or replace the signed auth policy for the specified object
 *
 * @methodGroup Auth Policies
 * @namedParams
 * @param {string} libraryId - ID of the library
 * @param {string} objectId - ID of the object
 * @param {string} writeToken - Write token of the draft
 * @param {string=} target="auth_policy_spec" - The metadata location of the auth policy
 * @param {string} body - The body of the policy
 * @param {string} version - The version of the policy
 * @param {string=} description - A description for the policy
 * @param {string=} id - The ID of the policy
 */


exports.InitializeAuthPolicy = /*#__PURE__*/function () {
  var _ref61 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee34(_ref60) {
    var libraryId, objectId, writeToken, _ref60$target, target, body, version, description, id, authPolicy, string;

    return _regeneratorRuntime.wrap(function _callee34$(_context35) {
      while (1) {
        switch (_context35.prev = _context35.next) {
          case 0:
            libraryId = _ref60.libraryId, objectId = _ref60.objectId, writeToken = _ref60.writeToken, _ref60$target = _ref60.target, target = _ref60$target === void 0 ? "auth_policy_spec" : _ref60$target, body = _ref60.body, version = _ref60.version, description = _ref60.description, id = _ref60.id;
            authPolicy = {
              type: "epl-ast",
              version: version,
              body: body,
              data: {
                "/": UrlJoin(".", "meta", target)
              },
              signer: "iusr".concat(this.utils.AddressToHash(this.signer.address)),
              description: description || "",
              id: id || ""
            };
            string = "".concat(authPolicy.type, "|").concat(authPolicy.version, "|").concat(authPolicy.body, "|").concat(authPolicy.data["/"]);
            _context35.t0 = this.utils;
            _context35.next = 6;
            return this.authClient.Sign(Ethers.utils.keccak256(Ethers.utils.toUtf8Bytes(string)));

          case 6:
            _context35.t1 = _context35.sent;
            authPolicy.signature = _context35.t0.FormatSignature.call(_context35.t0, _context35.t1);
            _context35.next = 10;
            return this.ReplaceMetadata({
              libraryId: libraryId,
              objectId: objectId,
              writeToken: writeToken,
              metadataSubtree: "auth_policy",
              metadata: authPolicy
            });

          case 10:
            _context35.next = 12;
            return this.SetAuthPolicy({
              objectId: objectId,
              policyId: objectId
            });

          case 12:
          case "end":
            return _context35.stop();
        }
      }
    }, _callee34, this);
  }));

  return function (_x32) {
    return _ref61.apply(this, arguments);
  };
}();
/**
 * Set the authorization policy for the specified object
 *
 * @methodGroup Auth Policies
 * @namedParams
 * @param {string} objectId - The ID of the object
 * @param {string} policyId - The ID of the policy
 */


exports.SetAuthPolicy = /*#__PURE__*/function () {
  var _ref63 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee35(_ref62) {
    var objectId, policyId;
    return _regeneratorRuntime.wrap(function _callee35$(_context36) {
      while (1) {
        switch (_context36.prev = _context36.next) {
          case 0:
            objectId = _ref62.objectId, policyId = _ref62.policyId;
            _context36.next = 3;
            return this.MergeContractMetadata({
              contractAddress: this.utils.HashToAddress(objectId),
              metadataKey: "_AUTH_CONTEXT",
              metadata: {
                "elv:delegation-id": policyId
              }
            });

          case 3:
          case "end":
            return _context36.stop();
        }
      }
    }, _callee35, this);
  }));

  return function (_x33) {
    return _ref63.apply(this, arguments);
  };
}();