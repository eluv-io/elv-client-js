var _typeof = require("@babel/runtime/helpers/typeof");

var _defineProperty = require("@babel/runtime/helpers/defineProperty");

var _regeneratorRuntime = require("@babel/runtime/regenerator");

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

/**
 * Methods for managing content types, libraries and objects
 *
 * @module ElvClient/ContentManagement
 */
var UrlJoin = require("url-join");

var ImageType = require("image-type");

var Ethers = require("ethers");
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
    ValidatePresence = _require.ValidatePresence,
    ValidateAddress = _require.ValidateAddress;

exports.SetVisibility = function _callee(_ref) {
  var id, visibility, hasSetVisibility, event;
  return _regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          id = _ref.id, visibility = _ref.visibility;
          this.Log("Setting visibility ".concat(visibility, " on ").concat(id));
          _context.next = 4;
          return _regeneratorRuntime.awrap(this.authClient.ContractHasMethod({
            contractAddress: this.utils.HashToAddress(id),
            methodName: "setVisibility"
          }));

        case 4:
          hasSetVisibility = _context.sent;

          if (hasSetVisibility) {
            _context.next = 7;
            break;
          }

          return _context.abrupt("return");

        case 7:
          _context.next = 9;
          return _regeneratorRuntime.awrap(this.CallContractMethodAndWait({
            contractAddress: this.utils.HashToAddress(id),
            methodName: "setVisibility",
            methodArgs: [visibility]
          }));

        case 9:
          event = _context.sent;
          _context.next = 12;
          return _regeneratorRuntime.awrap(new Promise(function (resolve) {
            return setTimeout(resolve, 5000);
          }));

        case 12:
          return _context.abrupt("return", event);

        case 13:
        case "end":
          return _context.stop();
      }
    }
  }, null, this);
};
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


exports.SetPermission = function _callee2(_ref2) {
  var _this = this;

  var objectId, permission, writeToken, permissionSettings, settings, libraryId, statusCode, kmsAddress, kmsConkKey, kmsConk, finalize;
  return _regeneratorRuntime.async(function _callee2$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          objectId = _ref2.objectId, permission = _ref2.permission, writeToken = _ref2.writeToken;
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
          return _regeneratorRuntime.awrap(this.AccessType({
            id: objectId
          }));

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
          return _regeneratorRuntime.awrap(this.ContentObjectLibraryId({
            objectId: objectId
          }));

        case 15:
          libraryId = _context3.sent;
          _context3.next = 18;
          return _regeneratorRuntime.awrap(this.SetVisibility({
            id: objectId,
            visibility: settings.visibility
          }));

        case 18:
          _context3.next = 20;
          return _regeneratorRuntime.awrap(this.CallContractMethod({
            contractAddress: this.utils.HashToAddress(objectId),
            methodName: "statusCode"
          }));

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
          return _regeneratorRuntime.awrap(this.CallContractMethod({
            contractAddress: this.utils.HashToAddress(objectId),
            methodName: "setStatusCode",
            methodArgs: [-1]
          }));

        case 25:
          _context3.next = 29;
          break;

        case 27:
          _context3.next = 29;
          return _regeneratorRuntime.awrap(this.CallContractMethod({
            contractAddress: this.utils.HashToAddress(objectId),
            methodName: "publish"
          }));

        case 29:
          _context3.next = 31;
          return _regeneratorRuntime.awrap(this.CallContractMethod({
            contractAddress: this.utils.HashToAddress(objectId),
            methodName: "addressKMS"
          }));

        case 31:
          kmsAddress = _context3.sent;
          kmsConkKey = "eluv.caps.ikms".concat(this.utils.AddressToHash(kmsAddress));
          _context3.next = 35;
          return _regeneratorRuntime.awrap(this.ContentObjectMetadata({
            libraryId: libraryId,
            objectId: objectId,
            metadataSubtree: kmsConkKey
          }));

        case 35:
          kmsConk = _context3.sent;

          if (!(kmsConk && !settings.kmsConk)) {
            _context3.next = 41;
            break;
          }

          _context3.next = 39;
          return _regeneratorRuntime.awrap(this.EditAndFinalizeContentObject({
            libraryId: libraryId,
            objectId: objectId,
            commitMessage: "Remove encryption conk",
            callback: function callback(_ref3) {
              var writeToken;
              return _regeneratorRuntime.async(function callback$(_context2) {
                while (1) {
                  switch (_context2.prev = _context2.next) {
                    case 0:
                      writeToken = _ref3.writeToken;
                      _context2.next = 3;
                      return _regeneratorRuntime.awrap(_this.DeleteMetadata({
                        libraryId: libraryId,
                        objectId: objectId,
                        writeToken: writeToken,
                        metadataSubtree: kmsConkKey
                      }));

                    case 3:
                    case "end":
                      return _context2.stop();
                  }
                }
              });
            }
          }));

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
          return _regeneratorRuntime.awrap(this.EditContentObject({
            libraryId: libraryId,
            objectId: objectId
          }));

        case 46:
          writeToken = _context3.sent.writeToken;

        case 47:
          _context3.next = 49;
          return _regeneratorRuntime.awrap(this.CreateEncryptionConk({
            libraryId: libraryId,
            objectId: objectId,
            writeToken: writeToken,
            createKMSConk: true
          }));

        case 49:
          if (!finalize) {
            _context3.next = 52;
            break;
          }

          _context3.next = 52;
          return _regeneratorRuntime.awrap(this.FinalizeContentObject({
            libraryId: libraryId,
            objectId: objectId,
            writeToken: writeToken,
            commitMessage: "Set permissions to ".concat(permission)
          }));

        case 52:
        case "end":
          return _context3.stop();
      }
    }
  }, null, this);
};
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


exports.CreateContentType = function _callee3(_ref4) {
  var name, _ref4$metadata, metadata, bitcode, _ref5, contractAddress, objectId, path, createResponse, uploadResponse;

  return _regeneratorRuntime.async(function _callee3$(_context4) {
    while (1) {
      switch (_context4.prev = _context4.next) {
        case 0:
          name = _ref4.name, _ref4$metadata = _ref4.metadata, metadata = _ref4$metadata === void 0 ? {} : _ref4$metadata, bitcode = _ref4.bitcode;
          this.Log("Creating content type: ".concat(name));
          metadata.name = name;
          metadata["public"] = _objectSpread({
            name: name
          }, metadata["public"] || {});
          _context4.next = 6;
          return _regeneratorRuntime.awrap(this.authClient.CreateContentType());

        case 6:
          _ref5 = _context4.sent;
          contractAddress = _ref5.contractAddress;
          objectId = this.utils.AddressToObjectId(contractAddress);
          _context4.next = 11;
          return _regeneratorRuntime.awrap(this.SetVisibility({
            id: objectId,
            visibility: 1
          }));

        case 11:
          path = UrlJoin("qlibs", this.contentSpaceLibraryId, "qid", objectId);
          this.Log("Created type: ".concat(contractAddress, " ").concat(objectId));
          /* Create object, upload bitcode and finalize */

          _context4.t0 = _regeneratorRuntime;
          _context4.t1 = this.utils;
          _context4.t2 = this.HttpClient;
          _context4.next = 18;
          return _regeneratorRuntime.awrap(this.authClient.AuthorizationHeader({
            libraryId: this.contentSpaceLibraryId,
            objectId: objectId,
            update: true
          }));

        case 18:
          _context4.t3 = _context4.sent;
          _context4.t4 = path;
          _context4.t5 = {
            headers: _context4.t3,
            method: "POST",
            path: _context4.t4
          };
          _context4.t6 = _context4.t2.Request.call(_context4.t2, _context4.t5);
          _context4.t7 = _context4.t1.ResponseToJson.call(_context4.t1, _context4.t6);
          _context4.next = 25;
          return _context4.t0.awrap.call(_context4.t0, _context4.t7);

        case 25:
          createResponse = _context4.sent;
          // Record the node used in creating this write token
          this.HttpClient.RecordWriteToken(createResponse.write_token);
          _context4.next = 29;
          return _regeneratorRuntime.awrap(this.ReplaceMetadata({
            libraryId: this.contentSpaceLibraryId,
            objectId: objectId,
            writeToken: createResponse.write_token,
            metadata: metadata
          }));

        case 29:
          if (!bitcode) {
            _context4.next = 35;
            break;
          }

          _context4.next = 32;
          return _regeneratorRuntime.awrap(this.UploadPart({
            libraryId: this.contentSpaceLibraryId,
            objectId: objectId,
            writeToken: createResponse.write_token,
            data: bitcode,
            encrypted: false
          }));

        case 32:
          uploadResponse = _context4.sent;
          _context4.next = 35;
          return _regeneratorRuntime.awrap(this.ReplaceMetadata({
            libraryId: this.contentSpaceLibraryId,
            objectId: objectId,
            writeToken: createResponse.write_token,
            metadataSubtree: "bitcode_part",
            metadata: uploadResponse.part.hash
          }));

        case 35:
          _context4.next = 37;
          return _regeneratorRuntime.awrap(this.FinalizeContentObject({
            libraryId: this.contentSpaceLibraryId,
            objectId: objectId,
            writeToken: createResponse.write_token,
            commitMessage: "Create content type"
          }));

        case 37:
          return _context4.abrupt("return", objectId);

        case 38:
        case "end":
          return _context4.stop();
      }
    }
  }, null, this);
};
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
 *
 * @returns {Promise<string>} - Library ID of created library
 */


exports.CreateContentLibrary = function _callee4(_ref6) {
  var name, description, image, imageName, _ref6$metadata, metadata, kmsId, _ref7, contractAddress, tenantId, libraryId, objectId, editResponse;

  return _regeneratorRuntime.async(function _callee4$(_context5) {
    while (1) {
      switch (_context5.prev = _context5.next) {
        case 0:
          name = _ref6.name, description = _ref6.description, image = _ref6.image, imageName = _ref6.imageName, _ref6$metadata = _ref6.metadata, metadata = _ref6$metadata === void 0 ? {} : _ref6$metadata, kmsId = _ref6.kmsId;

          if (kmsId) {
            _context5.next = 9;
            break;
          }

          _context5.t0 = "ikms";
          _context5.t1 = this.utils;
          _context5.next = 6;
          return _regeneratorRuntime.awrap(this.DefaultKMSAddress());

        case 6:
          _context5.t2 = _context5.sent;
          _context5.t3 = _context5.t1.AddressToHash.call(_context5.t1, _context5.t2);
          kmsId = _context5.t0.concat.call(_context5.t0, _context5.t3);

        case 9:
          this.Log("Creating content library");
          this.Log("KMS ID: ".concat(kmsId));
          _context5.next = 13;
          return _regeneratorRuntime.awrap(this.authClient.CreateContentLibrary({
            kmsId: kmsId
          }));

        case 13:
          _ref7 = _context5.sent;
          contractAddress = _ref7.contractAddress;
          _context5.next = 17;
          return _regeneratorRuntime.awrap(this.userProfileClient.TenantId());

        case 17:
          tenantId = _context5.sent;

          if (!tenantId) {
            _context5.next = 21;
            break;
          }

          _context5.next = 21;
          return _regeneratorRuntime.awrap(this.CallContractMethod({
            contractAddress: contractAddress,
            methodName: "putMeta",
            methodArgs: ["_tenantId", tenantId]
          }));

        case 21:
          metadata = _objectSpread({}, metadata, {
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
          _context5.next = 28;
          return _regeneratorRuntime.awrap(this.EditContentObject({
            libraryId: libraryId,
            objectId: objectId
          }));

        case 28:
          editResponse = _context5.sent;
          _context5.next = 31;
          return _regeneratorRuntime.awrap(this.ReplaceMetadata({
            libraryId: libraryId,
            objectId: objectId,
            metadata: metadata,
            writeToken: editResponse.write_token
          }));

        case 31:
          _context5.next = 33;
          return _regeneratorRuntime.awrap(this.FinalizeContentObject({
            libraryId: libraryId,
            objectId: objectId,
            writeToken: editResponse.write_token,
            commitMessage: "Create library"
          }));

        case 33:
          if (!image) {
            _context5.next = 36;
            break;
          }

          _context5.next = 36;
          return _regeneratorRuntime.awrap(this.SetContentLibraryImage({
            libraryId: libraryId,
            image: image,
            imageName: imageName
          }));

        case 36:
          this.Log("Library ".concat(libraryId, " created"));
          return _context5.abrupt("return", libraryId);

        case 38:
        case "end":
          return _context5.stop();
      }
    }
  }, null, this);
};
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


exports.SetContentLibraryImage = function _callee5(_ref8) {
  var libraryId, writeToken, image, imageName, objectId;
  return _regeneratorRuntime.async(function _callee5$(_context6) {
    while (1) {
      switch (_context6.prev = _context6.next) {
        case 0:
          libraryId = _ref8.libraryId, writeToken = _ref8.writeToken, image = _ref8.image, imageName = _ref8.imageName;
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
  }, null, this);
};
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


exports.SetContentObjectImage = function _callee6(_ref9) {
  var libraryId, objectId, writeToken, image, imageName, _ref9$imagePath, imagePath, type, mimeType;

  return _regeneratorRuntime.async(function _callee6$(_context7) {
    while (1) {
      switch (_context7.prev = _context7.next) {
        case 0:
          libraryId = _ref9.libraryId, objectId = _ref9.objectId, writeToken = _ref9.writeToken, image = _ref9.image, imageName = _ref9.imageName, _ref9$imagePath = _ref9.imagePath, imagePath = _ref9$imagePath === void 0 ? "public/display_image" : _ref9$imagePath;
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
          return _regeneratorRuntime.awrap(new Response(image).arrayBuffer());

        case 8:
          image = _context7.sent;

        case 9:
          // Determine image type
          type = ImageType(image);
          mimeType = ["jpg", "jpeg", "png", "gif", "webp"].includes(type.ext) ? type.mime : "image/*";
          _context7.next = 13;
          return _regeneratorRuntime.awrap(this.UploadFiles({
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
          }));

        case 13:
          _context7.next = 15;
          return _regeneratorRuntime.awrap(this.ReplaceMetadata({
            libraryId: libraryId,
            objectId: objectId,
            writeToken: writeToken,
            metadataSubtree: imagePath,
            metadata: {
              "/": "./files/".concat(imageName)
            }
          }));

        case 15:
        case "end":
          return _context7.stop();
      }
    }
  }, null, this);
};
/**
 * NOT YET SUPPORTED - Delete the specified content library
 *
 * @methodGroup Content Libraries
 *
 * @namedParams
 * @param {string} libraryId - ID of the library to delete
 */


exports.DeleteContentLibrary = function _callee7(_ref10) {
  var libraryId, path, authorizationHeader;
  return _regeneratorRuntime.async(function _callee7$(_context8) {
    while (1) {
      switch (_context8.prev = _context8.next) {
        case 0:
          libraryId = _ref10.libraryId;
          throw Error("Not supported");

        case 6:
          authorizationHeader = _context8.sent;
          _context8.next = 9;
          return _regeneratorRuntime.awrap(this.CallContractMethodAndWait({
            contractAddress: this.utils.HashToAddress(libraryId),
            methodName: "kill",
            methodArgs: []
          }));

        case 9:
          _context8.next = 11;
          return _regeneratorRuntime.awrap(this.HttpClient.Request({
            headers: authorizationHeader,
            method: "DELETE",
            path: path
          }));

        case 11:
        case "end":
          return _context8.stop();
      }
    }
  }, null, this);
};
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


exports.AddLibraryContentType = function _callee8(_ref11) {
  var libraryId, typeId, typeName, typeHash, customContractAddress, type, typeAddress, event;
  return _regeneratorRuntime.async(function _callee8$(_context9) {
    while (1) {
      switch (_context9.prev = _context9.next) {
        case 0:
          libraryId = _ref11.libraryId, typeId = _ref11.typeId, typeName = _ref11.typeName, typeHash = _ref11.typeHash, customContractAddress = _ref11.customContractAddress;
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
          return _regeneratorRuntime.awrap(this.ContentType({
            name: typeName
          }));

        case 7:
          type = _context9.sent;
          typeId = type.id;

        case 9:
          this.Log("Type ID: ".concat(typeId));
          typeAddress = this.utils.HashToAddress(typeId);
          customContractAddress = customContractAddress || this.utils.nullAddress;
          _context9.next = 14;
          return _regeneratorRuntime.awrap(this.ethClient.CallContractMethodAndWait({
            contractAddress: this.utils.HashToAddress(libraryId),
            methodName: "addContentType",
            methodArgs: [typeAddress, customContractAddress]
          }));

        case 14:
          event = _context9.sent;
          return _context9.abrupt("return", event.transactionHash);

        case 16:
        case "end":
          return _context9.stop();
      }
    }
  }, null, this);
};
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


exports.RemoveLibraryContentType = function _callee9(_ref12) {
  var libraryId, typeId, typeName, typeHash, type, typeAddress, event;
  return _regeneratorRuntime.async(function _callee9$(_context10) {
    while (1) {
      switch (_context10.prev = _context10.next) {
        case 0:
          libraryId = _ref12.libraryId, typeId = _ref12.typeId, typeName = _ref12.typeName, typeHash = _ref12.typeHash;
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
          return _regeneratorRuntime.awrap(this.ContentType({
            name: typeName
          }));

        case 7:
          type = _context10.sent;
          typeId = type.id;

        case 9:
          this.Log("Type ID: ".concat(typeId));
          typeAddress = this.utils.HashToAddress(typeId);
          _context10.next = 13;
          return _regeneratorRuntime.awrap(this.ethClient.CallContractMethodAndWait({
            contractAddress: this.utils.HashToAddress(libraryId),
            methodName: "removeContentType",
            methodArgs: [typeAddress]
          }));

        case 13:
          event = _context10.sent;
          return _context10.abrupt("return", event.transactionHash);

        case 15:
        case "end":
          return _context10.stop();
      }
    }
  }, null, this);
};
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


exports.CreateContentObject = function _callee10(_ref13) {
  var libraryId, objectId, _ref13$options, options, typeId, type, currentAccountAddress, canContribute, _ref14, contractAddress, path, createResponse;

  return _regeneratorRuntime.async(function _callee10$(_context11) {
    while (1) {
      switch (_context11.prev = _context11.next) {
        case 0:
          libraryId = _ref13.libraryId, objectId = _ref13.objectId, _ref13$options = _ref13.options, options = _ref13$options === void 0 ? {} : _ref13$options;
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
          return _regeneratorRuntime.awrap(this.ContentType({
            versionHash: type
          }));

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
          return _regeneratorRuntime.awrap(this.ContentType({
            typeId: type
          }));

        case 16:
          type = _context11.sent;
          _context11.next = 22;
          break;

        case 19:
          _context11.next = 21;
          return _regeneratorRuntime.awrap(this.ContentType({
            name: type
          }));

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
          return _regeneratorRuntime.awrap(this.CurrentAccountAddress());

        case 29:
          currentAccountAddress = _context11.sent;
          _context11.next = 32;
          return _regeneratorRuntime.awrap(this.CallContractMethod({
            contractAddress: this.utils.HashToAddress(libraryId),
            methodName: "canContribute",
            methodArgs: [currentAccountAddress]
          }));

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
          return _regeneratorRuntime.awrap(this.authClient.CreateContentObject({
            libraryId: libraryId,
            typeId: typeId
          }));

        case 38:
          _ref14 = _context11.sent;
          contractAddress = _ref14.contractAddress;
          objectId = this.utils.AddressToObjectId(contractAddress);
          this.Log("Contract deployed: ".concat(contractAddress, " ").concat(objectId));
          _context11.next = 51;
          break;

        case 44:
          _context11.t0 = this;
          _context11.t1 = "Contract already deployed for contract type: ";
          _context11.next = 48;
          return _regeneratorRuntime.awrap(this.AccessType({
            id: objectId
          }));

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
          return _regeneratorRuntime.awrap(this.SetVisibility({
            id: objectId,
            visibility: options.visibility
          }));

        case 55:
          path = UrlJoin("qid", objectId);
          _context11.t4 = _regeneratorRuntime;
          _context11.t5 = this.utils;
          _context11.t6 = this.HttpClient;
          _context11.next = 61;
          return _regeneratorRuntime.awrap(this.authClient.AuthorizationHeader({
            libraryId: libraryId,
            objectId: objectId,
            update: true
          }));

        case 61:
          _context11.t7 = _context11.sent;
          _context11.t8 = path;
          _context11.t9 = options;
          _context11.t10 = {
            headers: _context11.t7,
            method: "POST",
            path: _context11.t8,
            body: _context11.t9
          };
          _context11.t11 = _context11.t6.Request.call(_context11.t6, _context11.t10);
          _context11.t12 = _context11.t5.ResponseToJson.call(_context11.t5, _context11.t11);
          _context11.next = 69;
          return _context11.t4.awrap.call(_context11.t4, _context11.t12);

        case 69:
          createResponse = _context11.sent;
          // Record the node used in creating this write token
          this.HttpClient.RecordWriteToken(createResponse.write_token);
          createResponse.writeToken = createResponse.write_token;
          createResponse.objectId = createResponse.id;
          return _context11.abrupt("return", createResponse);

        case 74:
        case "end":
          return _context11.stop();
      }
    }
  }, null, this);
};
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


exports.CopyContentObject = function _callee12(_ref15) {
  var _this2 = this;

  var libraryId, originalVersionHash, _ref15$options, options, _ref16, objectId, writeToken, originalObjectId, metadata, permission, userCapKey, isOwner, userConkKey;

  return _regeneratorRuntime.async(function _callee12$(_context13) {
    while (1) {
      switch (_context13.prev = _context13.next) {
        case 0:
          libraryId = _ref15.libraryId, originalVersionHash = _ref15.originalVersionHash, _ref15$options = _ref15.options, options = _ref15$options === void 0 ? {} : _ref15$options;
          ValidateLibrary(libraryId);
          ValidateVersion(originalVersionHash);
          options.copy_from = originalVersionHash;
          _context13.next = 6;
          return _regeneratorRuntime.awrap(this.CreateContentObject({
            libraryId: libraryId,
            options: options
          }));

        case 6:
          _ref16 = _context13.sent;
          objectId = _ref16.objectId;
          writeToken = _ref16.writeToken;
          originalObjectId = this.utils.DecodeVersionHash(originalVersionHash).objectId;
          _context13.next = 12;
          return _regeneratorRuntime.awrap(this.ContentObjectMetadata({
            versionHash: originalVersionHash
          }));

        case 12:
          metadata = _context13.sent;
          _context13.next = 15;
          return _regeneratorRuntime.awrap(this.Permission({
            objectId: originalObjectId
          }));

        case 15:
          permission = _context13.sent;
          // User CAP
          userCapKey = "eluv.caps.iusr".concat(this.utils.AddressToHash(this.signer.address));

          if (!metadata[userCapKey]) {
            _context13.next = 40;
            break;
          }

          _context13.t0 = this.utils;
          _context13.t1 = this.signer.address;
          _context13.next = 22;
          return _regeneratorRuntime.awrap(this.ContentObjectOwner({
            objectId: originalObjectId
          }));

        case 22:
          _context13.t2 = _context13.sent;
          isOwner = _context13.t0.EqualAddress.call(_context13.t0, _context13.t1, _context13.t2);

          if (isOwner) {
            _context13.next = 26;
            break;
          }

          throw Error("Current user is not owner of object ".concat(metadata));

        case 26:
          _context13.next = 28;
          return _regeneratorRuntime.awrap(this.Crypto.DecryptCap(metadata[userCapKey], this.signer.signingKey.privateKey));

        case 28:
          userConkKey = _context13.sent;
          userConkKey.qid = objectId;
          _context13.t3 = this;
          _context13.t4 = libraryId;
          _context13.t5 = objectId;
          _context13.t6 = writeToken;
          _context13.t7 = userCapKey;
          _context13.next = 37;
          return _regeneratorRuntime.awrap(this.Crypto.EncryptConk(userConkKey, this.signer.signingKey.publicKey));

        case 37:
          _context13.t8 = _context13.sent;
          _context13.t9 = {
            libraryId: _context13.t4,
            objectId: _context13.t5,
            writeToken: _context13.t6,
            metadataSubtree: _context13.t7,
            metadata: _context13.t8
          };

          _context13.t3.ReplaceMetadata.call(_context13.t3, _context13.t9);

        case 40:
          _context13.next = 42;
          return _regeneratorRuntime.awrap(Promise.all(Object.keys(metadata).filter(function (key) {
            return key.startsWith("eluv.caps.ikms");
          }).map(function _callee11(kmsCapKey) {
            return _regeneratorRuntime.async(function _callee11$(_context12) {
              while (1) {
                switch (_context12.prev = _context12.next) {
                  case 0:
                    _context12.next = 2;
                    return _regeneratorRuntime.awrap(_this2.DeleteMetadata({
                      libraryId: libraryId,
                      objectId: objectId,
                      writeToken: writeToken,
                      metadataSubtree: kmsCapKey
                    }));

                  case 2:
                    return _context12.abrupt("return", _context12.sent);

                  case 3:
                  case "end":
                    return _context12.stop();
                }
              }
            });
          })));

        case 42:
          if (!(permission !== "owner")) {
            _context13.next = 45;
            break;
          }

          _context13.next = 45;
          return _regeneratorRuntime.awrap(this.SetPermission({
            objectId: objectId,
            permission: permission,
            writeToken: writeToken
          }));

        case 45:
          _context13.next = 47;
          return _regeneratorRuntime.awrap(this.FinalizeContentObject({
            libraryId: libraryId,
            objectId: objectId,
            writeToken: writeToken
          }));

        case 47:
          return _context13.abrupt("return", _context13.sent);

        case 48:
        case "end":
          return _context13.stop();
      }
    }
  }, null, this);
};
/**
 * Create a non-owner cap key using the specified public key and address
 *
 * @methodGroup Access Requests
 * @namedParams
 * @param {string} libraryId - ID of the library
 * @param {string} objectId - ID of the object
 * @param {string} publicKey - Public key for the target cap
 * @param {string} publicAddress - Public address for the target cap key
 * @param {string} writeToken - Write token for the content object - If specified, info will be retrieved from the write draft instead of creating a new draft and finalizing
 *
 * @returns {Promise<Object>}
 */


exports.CreateNonOwnerCap = function _callee13(_ref17) {
  var objectId, libraryId, publicKey, publicAddress, writeToken, userCapKey, userCapValue, userConk, targetUserCapKey, targetUserCapValue, finalize;
  return _regeneratorRuntime.async(function _callee13$(_context14) {
    while (1) {
      switch (_context14.prev = _context14.next) {
        case 0:
          objectId = _ref17.objectId, libraryId = _ref17.libraryId, publicKey = _ref17.publicKey, publicAddress = _ref17.publicAddress, writeToken = _ref17.writeToken;
          publicAddress = ValidateAddress(publicAddress);
          userCapKey = "eluv.caps.iusr".concat(this.utils.AddressToHash(this.signer.address));
          _context14.next = 5;
          return _regeneratorRuntime.awrap(this.ContentObjectMetadata({
            objectId: objectId,
            libraryId: libraryId,
            metadataSubtree: userCapKey
          }));

        case 5:
          userCapValue = _context14.sent;

          if (userCapValue) {
            _context14.next = 8;
            break;
          }

          throw Error("No user cap found for current user");

        case 8:
          _context14.next = 10;
          return _regeneratorRuntime.awrap(this.Crypto.DecryptCap(userCapValue, this.signer.signingKey.privateKey));

        case 10:
          userConk = _context14.sent;
          targetUserCapKey = "eluv.caps.iusr".concat(this.utils.AddressToHash(publicAddress));
          _context14.next = 14;
          return _regeneratorRuntime.awrap(this.Crypto.EncryptConk(userConk, publicKey));

        case 14:
          targetUserCapValue = _context14.sent;
          finalize = !writeToken;

          if (writeToken) {
            _context14.next = 20;
            break;
          }

          _context14.next = 19;
          return _regeneratorRuntime.awrap(this.EditContentObject({
            libraryId: libraryId,
            objectId: objectId
          }).writeToken);

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
          return _regeneratorRuntime.awrap(this.FinalizeContentObject({
            libraryId: libraryId,
            objectId: objectId,
            writeToken: writeToken,
            commitMessage: "Create non-owner cap"
          }));

        case 24:
        case "end":
          return _context14.stop();
      }
    }
  }, null, this);
};
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
 * @returns {Promise<object>} - Response containing the object ID and write token of the draft
 */


exports.EditContentObject = function _callee14(_ref18) {
  var libraryId, objectId, _ref18$options, options, path, editResponse;

  return _regeneratorRuntime.async(function _callee14$(_context15) {
    while (1) {
      switch (_context15.prev = _context15.next) {
        case 0:
          libraryId = _ref18.libraryId, objectId = _ref18.objectId, _ref18$options = _ref18.options, options = _ref18$options === void 0 ? {} : _ref18$options;
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
          return _regeneratorRuntime.awrap(this.ContentType({
            versionHash: options.type
          }));

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
          return _regeneratorRuntime.awrap(this.ContentType({
            typeId: options.type
          }));

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
          return _regeneratorRuntime.awrap(this.ContentType({
            name: options.type
          }));

        case 19:
          options.type = _context15.sent.hash;
          _context15.next = 23;
          break;

        case 22:
          options.type = "";

        case 23:
          path = UrlJoin("qid", objectId);
          _context15.t0 = _regeneratorRuntime;
          _context15.t1 = this.utils;
          _context15.t2 = this.HttpClient;
          _context15.next = 29;
          return _regeneratorRuntime.awrap(this.authClient.AuthorizationHeader({
            libraryId: libraryId,
            objectId: objectId,
            update: true
          }));

        case 29:
          _context15.t3 = _context15.sent;
          _context15.t4 = path;
          _context15.t5 = options;
          _context15.t6 = {
            headers: _context15.t3,
            method: "POST",
            path: _context15.t4,
            body: _context15.t5
          };
          _context15.t7 = _context15.t2.Request.call(_context15.t2, _context15.t6);
          _context15.t8 = _context15.t1.ResponseToJson.call(_context15.t1, _context15.t7);
          _context15.next = 37;
          return _context15.t0.awrap.call(_context15.t0, _context15.t8);

        case 37:
          editResponse = _context15.sent;
          // Record the node used in creating this write token
          this.HttpClient.RecordWriteToken(editResponse.write_token);
          editResponse.writeToken = editResponse.write_token;
          editResponse.objectId = editResponse.id;
          return _context15.abrupt("return", editResponse);

        case 42:
        case "end":
          return _context15.stop();
      }
    }
  }, null, this);
};
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


exports.CreateAndFinalizeContentObject = function _callee15(_ref19) {
  var libraryId, callback, _ref19$options, options, _ref19$commitMessage, commitMessage, _ref19$publish, publish, _ref19$awaitCommitCon, awaitCommitConfirmation, args, id, writeToken;

  return _regeneratorRuntime.async(function _callee15$(_context16) {
    while (1) {
      switch (_context16.prev = _context16.next) {
        case 0:
          libraryId = _ref19.libraryId, callback = _ref19.callback, _ref19$options = _ref19.options, options = _ref19$options === void 0 ? {} : _ref19$options, _ref19$commitMessage = _ref19.commitMessage, commitMessage = _ref19$commitMessage === void 0 ? "" : _ref19$commitMessage, _ref19$publish = _ref19.publish, publish = _ref19$publish === void 0 ? true : _ref19$publish, _ref19$awaitCommitCon = _ref19.awaitCommitConfirmation, awaitCommitConfirmation = _ref19$awaitCommitCon === void 0 ? true : _ref19$awaitCommitCon;
          _context16.next = 3;
          return _regeneratorRuntime.awrap(this.CreateContentObject({
            libraryId: libraryId,
            options: options
          }));

        case 3:
          args = _context16.sent;
          id = args.id, writeToken = args.writeToken;

          if (!callback) {
            _context16.next = 8;
            break;
          }

          _context16.next = 8;
          return _regeneratorRuntime.awrap(callback({
            objectId: id,
            writeToken: writeToken
          }));

        case 8:
          _context16.next = 10;
          return _regeneratorRuntime.awrap(this.FinalizeContentObject({
            libraryId: libraryId,
            objectId: id,
            writeToken: writeToken,
            commitMessage: commitMessage,
            publish: publish,
            awaitCommitConfirmation: awaitCommitConfirmation
          }));

        case 10:
          return _context16.abrupt("return", _context16.sent);

        case 11:
        case "end":
          return _context16.stop();
      }
    }
  }, null, this);
};
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


exports.EditAndFinalizeContentObject = function _callee16(_ref20) {
  var libraryId, objectId, callback, _ref20$options, options, _ref20$commitMessage, commitMessage, _ref20$publish, publish, _ref20$awaitCommitCon, awaitCommitConfirmation, _ref21, writeToken;

  return _regeneratorRuntime.async(function _callee16$(_context17) {
    while (1) {
      switch (_context17.prev = _context17.next) {
        case 0:
          libraryId = _ref20.libraryId, objectId = _ref20.objectId, callback = _ref20.callback, _ref20$options = _ref20.options, options = _ref20$options === void 0 ? {} : _ref20$options, _ref20$commitMessage = _ref20.commitMessage, commitMessage = _ref20$commitMessage === void 0 ? "" : _ref20$commitMessage, _ref20$publish = _ref20.publish, publish = _ref20$publish === void 0 ? true : _ref20$publish, _ref20$awaitCommitCon = _ref20.awaitCommitConfirmation, awaitCommitConfirmation = _ref20$awaitCommitCon === void 0 ? true : _ref20$awaitCommitCon;
          _context17.next = 3;
          return _regeneratorRuntime.awrap(this.EditContentObject({
            libraryId: libraryId,
            objectId: objectId,
            options: options
          }));

        case 3:
          _ref21 = _context17.sent;
          writeToken = _ref21.writeToken;

          if (!callback) {
            _context17.next = 8;
            break;
          }

          _context17.next = 8;
          return _regeneratorRuntime.awrap(callback({
            writeToken: writeToken
          }));

        case 8:
          _context17.next = 10;
          return _regeneratorRuntime.awrap(this.FinalizeContentObject({
            libraryId: libraryId,
            objectId: objectId,
            writeToken: writeToken,
            commitMessage: commitMessage,
            publish: publish,
            awaitCommitConfirmation: awaitCommitConfirmation
          }));

        case 10:
          return _context17.abrupt("return", _context17.sent);

        case 11:
        case "end":
          return _context17.stop();
      }
    }
  }, null, this);
};

exports.AwaitPending = function _callee17(objectId) {
  var _this3 = this;

  var PendingHash, pending, isWallet, timeout, i;
  return _regeneratorRuntime.async(function _callee17$(_context19) {
    while (1) {
      switch (_context19.prev = _context19.next) {
        case 0:
          PendingHash = function PendingHash() {
            return _regeneratorRuntime.async(function PendingHash$(_context18) {
              while (1) {
                switch (_context18.prev = _context18.next) {
                  case 0:
                    _context18.next = 2;
                    return _regeneratorRuntime.awrap(_this3.CallContractMethod({
                      contractAddress: _this3.utils.HashToAddress(objectId),
                      methodName: "pendingHash"
                    }));

                  case 2:
                    return _context18.abrupt("return", _context18.sent);

                  case 3:
                  case "end":
                    return _context18.stop();
                }
              }
            });
          };

          this.Log("Checking for pending commit");
          _context19.next = 4;
          return _regeneratorRuntime.awrap(PendingHash());

        case 4:
          pending = _context19.sent;

          if (pending) {
            _context19.next = 7;
            break;
          }

          return _context19.abrupt("return");

        case 7:
          _context19.next = 9;
          return _regeneratorRuntime.awrap(this.authClient.AccessType(objectId));

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
          return _regeneratorRuntime.awrap(new Promise(function (resolve) {
            return setTimeout(resolve, 1000);
          }));

        case 18:
          _context19.next = 20;
          return _regeneratorRuntime.awrap(PendingHash());

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
          return _regeneratorRuntime.awrap(this.CallContractMethodAndWait({
            contractAddress: this.utils.HashToAddress(objectId),
            methodName: "clearPending"
          }));

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
  }, null, this);
};
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


exports.FinalizeContentObject = function _callee18(_ref22) {
  var libraryId, objectId, writeToken, _ref22$commitMessage, commitMessage, _ref22$publish, publish, _ref22$awaitCommitCon, awaitCommitConfirmation, path, finalizeResponse;

  return _regeneratorRuntime.async(function _callee18$(_context20) {
    while (1) {
      switch (_context20.prev = _context20.next) {
        case 0:
          libraryId = _ref22.libraryId, objectId = _ref22.objectId, writeToken = _ref22.writeToken, _ref22$commitMessage = _ref22.commitMessage, commitMessage = _ref22$commitMessage === void 0 ? "" : _ref22$commitMessage, _ref22$publish = _ref22.publish, publish = _ref22$publish === void 0 ? true : _ref22$publish, _ref22$awaitCommitCon = _ref22.awaitCommitConfirmation, awaitCommitConfirmation = _ref22$awaitCommitCon === void 0 ? true : _ref22$awaitCommitCon;
          ValidateParameters({
            libraryId: libraryId,
            objectId: objectId
          });
          ValidateWriteToken(writeToken);
          _context20.t0 = _regeneratorRuntime;
          _context20.t1 = this;
          _context20.t2 = libraryId;
          _context20.t3 = objectId;
          _context20.t4 = writeToken;
          _context20.t5 = commitMessage;
          _context20.next = 11;
          return _regeneratorRuntime.awrap(this.userProfileClient.UserMetadata({
            metadataSubtree: "public/name"
          }));

        case 11:
          _context20.t6 = _context20.sent;

          if (_context20.t6) {
            _context20.next = 14;
            break;
          }

          _context20.t6 = this.CurrentAccountAddress();

        case 14:
          _context20.t7 = _context20.t6;
          _context20.t8 = this.CurrentAccountAddress();
          _context20.t9 = new Date().toISOString();
          _context20.t10 = {
            message: _context20.t5,
            author: _context20.t7,
            author_address: _context20.t8,
            timestamp: _context20.t9
          };
          _context20.t11 = {
            libraryId: _context20.t2,
            objectId: _context20.t3,
            writeToken: _context20.t4,
            metadataSubtree: "commit",
            metadata: _context20.t10
          };
          _context20.t12 = _context20.t1.ReplaceMetadata.call(_context20.t1, _context20.t11);
          _context20.next = 22;
          return _context20.t0.awrap.call(_context20.t0, _context20.t12);

        case 22:
          this.Log("Finalizing content draft: ".concat(libraryId, " ").concat(objectId, " ").concat(writeToken));
          _context20.next = 25;
          return _regeneratorRuntime.awrap(this.AwaitPending(objectId));

        case 25:
          path = UrlJoin("q", writeToken);
          _context20.t13 = _regeneratorRuntime;
          _context20.t14 = this.utils;
          _context20.t15 = this.HttpClient;
          _context20.next = 31;
          return _regeneratorRuntime.awrap(this.authClient.AuthorizationHeader({
            libraryId: libraryId,
            objectId: objectId,
            update: true
          }));

        case 31:
          _context20.t16 = _context20.sent;
          _context20.t17 = path;
          _context20.t18 = {
            headers: _context20.t16,
            method: "POST",
            path: _context20.t17,
            failover: false
          };
          _context20.t19 = _context20.t15.Request.call(_context20.t15, _context20.t18);
          _context20.t20 = _context20.t14.ResponseToJson.call(_context20.t14, _context20.t19);
          _context20.next = 38;
          return _context20.t13.awrap.call(_context20.t13, _context20.t20);

        case 38:
          finalizeResponse = _context20.sent;
          this.Log("Finalized: ".concat(finalizeResponse.hash));

          if (!publish) {
            _context20.next = 43;
            break;
          }

          _context20.next = 43;
          return _regeneratorRuntime.awrap(this.PublishContentVersion({
            objectId: objectId,
            versionHash: finalizeResponse.hash,
            awaitCommitConfirmation: awaitCommitConfirmation
          }));

        case 43:
          // Invalidate cached content type, if this is one.
          delete this.contentTypes[objectId];
          return _context20.abrupt("return", finalizeResponse);

        case 45:
        case "end":
          return _context20.stop();
      }
    }
  }, null, this);
};
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


exports.PublishContentVersion = function _callee20(_ref23) {
  var _this4 = this;

  var objectId, versionHash, _ref23$awaitCommitCon, awaitCommitConfirmation, commit, abi, fromBlock, objectHash, pendingHash;

  return _regeneratorRuntime.async(function _callee20$(_context22) {
    while (1) {
      switch (_context22.prev = _context22.next) {
        case 0:
          objectId = _ref23.objectId, versionHash = _ref23.versionHash, _ref23$awaitCommitCon = _ref23.awaitCommitConfirmation, awaitCommitConfirmation = _ref23$awaitCommitCon === void 0 ? true : _ref23$awaitCommitCon;
          versionHash ? ValidateVersion(versionHash) : ValidateObject(objectId);
          this.Log("Publishing: ".concat(objectId || versionHash));

          if (versionHash) {
            objectId = this.utils.DecodeVersionHash(versionHash).objectId;
          }

          _context22.next = 6;
          return _regeneratorRuntime.awrap(this.ethClient.CommitContent({
            contentObjectAddress: this.utils.HashToAddress(objectId),
            versionHash: versionHash,
            signer: this.signer
          }));

        case 6:
          commit = _context22.sent;
          _context22.next = 9;
          return _regeneratorRuntime.awrap(this.ContractAbi({
            id: objectId
          }));

        case 9:
          abi = _context22.sent;
          fromBlock = commit.blockNumber + 1;
          _context22.next = 13;
          return _regeneratorRuntime.awrap(this.ExtractValueFromEvent({
            abi: abi,
            event: commit,
            eventName: "CommitPending",
            eventValue: "objectHash"
          }));

        case 13:
          objectHash = _context22.sent;
          _context22.next = 16;
          return _regeneratorRuntime.awrap(this.CallContractMethod({
            contractAddress: this.utils.HashToAddress(objectId),
            methodName: "pendingHash"
          }));

        case 16:
          pendingHash = _context22.sent;

          if (!(pendingHash && pendingHash !== objectHash)) {
            _context22.next = 19;
            break;
          }

          throw Error("Pending version hash mismatch on ".concat(objectId, ": expected ").concat(objectHash, ", currently ").concat(pendingHash));

        case 19:
          if (!awaitCommitConfirmation) {
            _context22.next = 22;
            break;
          }

          _context22.next = 22;
          return _regeneratorRuntime.awrap(function _callee19() {
            var pollingInterval, events, confirmEvent;
            return _regeneratorRuntime.async(function _callee19$(_context21) {
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
                    return _regeneratorRuntime.awrap(new Promise(function (resolve) {
                      return setTimeout(resolve, pollingInterval);
                    }));

                  case 5:
                    _context21.next = 7;
                    return _regeneratorRuntime.awrap(_this4.ContractEvents({
                      contractAddress: _this4.utils.HashToAddress(objectId),
                      abi: abi,
                      fromBlock: fromBlock,
                      count: 1000
                    }));

                  case 7:
                    events = _context21.sent;
                    confirmEvent = events.find(function (blockEvents) {
                      return blockEvents.find(function (event) {
                        return objectHash === (event && event.values && event.values.objectHash);
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
            });
          }());

        case 22:
        case "end":
          return _context22.stop();
      }
    }
  }, null, this);
};
/**
 * Delete specified version of the content object
 *
 * @methodGroup Content Objects
 * @namedParams
 * @param {string=} versionHash - Hash of the object version - if not specified, most recent version will be deleted
 */


exports.DeleteContentVersion = function _callee21(_ref24) {
  var versionHash, _this$utils$DecodeVer, objectId;

  return _regeneratorRuntime.async(function _callee21$(_context23) {
    while (1) {
      switch (_context23.prev = _context23.next) {
        case 0:
          versionHash = _ref24.versionHash;
          ValidateVersion(versionHash);
          this.Log("Deleting content version: ".concat(versionHash));
          _this$utils$DecodeVer = this.utils.DecodeVersionHash(versionHash), objectId = _this$utils$DecodeVer.objectId;
          _context23.next = 6;
          return _regeneratorRuntime.awrap(this.CallContractMethodAndWait({
            contractAddress: this.utils.HashToAddress(objectId),
            methodName: "deleteVersion",
            methodArgs: [versionHash]
          }));

        case 6:
        case "end":
          return _context23.stop();
      }
    }
  }, null, this);
};
/**
 * Delete specified content object
 *
 * @methodGroup Content Objects
 * @namedParams
 * @param {string} libraryId - ID of the library
 * @param {string} objectId - ID of the object
 */


exports.DeleteContentObject = function _callee22(_ref25) {
  var libraryId, objectId;
  return _regeneratorRuntime.async(function _callee22$(_context24) {
    while (1) {
      switch (_context24.prev = _context24.next) {
        case 0:
          libraryId = _ref25.libraryId, objectId = _ref25.objectId;
          ValidateParameters({
            libraryId: libraryId,
            objectId: objectId
          });
          this.Log("Deleting content version: ".concat(libraryId, " ").concat(objectId));
          _context24.next = 5;
          return _regeneratorRuntime.awrap(this.CallContractMethodAndWait({
            contractAddress: this.utils.HashToAddress(libraryId),
            methodName: "deleteContent",
            methodArgs: [this.utils.HashToAddress(objectId)]
          }));

        case 5:
        case "end":
          return _context24.stop();
      }
    }
  }, null, this);
};
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


exports.MergeMetadata = function _callee23(_ref26) {
  var libraryId, objectId, writeToken, _ref26$metadataSubtre, metadataSubtree, _ref26$metadata, metadata, path;

  return _regeneratorRuntime.async(function _callee23$(_context25) {
    while (1) {
      switch (_context25.prev = _context25.next) {
        case 0:
          libraryId = _ref26.libraryId, objectId = _ref26.objectId, writeToken = _ref26.writeToken, _ref26$metadataSubtre = _ref26.metadataSubtree, metadataSubtree = _ref26$metadataSubtre === void 0 ? "/" : _ref26$metadataSubtre, _ref26$metadata = _ref26.metadata, metadata = _ref26$metadata === void 0 ? {} : _ref26$metadata;
          ValidateParameters({
            libraryId: libraryId,
            objectId: objectId
          });
          ValidateWriteToken(writeToken);
          this.Log("Merging metadata: ".concat(libraryId, " ").concat(objectId, " ").concat(writeToken, "\n      Subtree: ").concat(metadataSubtree));
          this.Log(metadata);
          path = UrlJoin("q", writeToken, "meta", metadataSubtree);
          _context25.t0 = _regeneratorRuntime;
          _context25.t1 = this.HttpClient;
          _context25.next = 10;
          return _regeneratorRuntime.awrap(this.authClient.AuthorizationHeader({
            libraryId: libraryId,
            objectId: objectId,
            update: true
          }));

        case 10:
          _context25.t2 = _context25.sent;
          _context25.t3 = path;
          _context25.t4 = metadata;
          _context25.t5 = {
            headers: _context25.t2,
            method: "POST",
            path: _context25.t3,
            body: _context25.t4,
            failover: false
          };
          _context25.t6 = _context25.t1.Request.call(_context25.t1, _context25.t5);
          _context25.next = 17;
          return _context25.t0.awrap.call(_context25.t0, _context25.t6);

        case 17:
        case "end":
          return _context25.stop();
      }
    }
  }, null, this);
};
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


exports.ReplaceMetadata = function _callee24(_ref27) {
  var libraryId, objectId, writeToken, _ref27$metadataSubtre, metadataSubtree, _ref27$metadata, metadata, path;

  return _regeneratorRuntime.async(function _callee24$(_context26) {
    while (1) {
      switch (_context26.prev = _context26.next) {
        case 0:
          libraryId = _ref27.libraryId, objectId = _ref27.objectId, writeToken = _ref27.writeToken, _ref27$metadataSubtre = _ref27.metadataSubtree, metadataSubtree = _ref27$metadataSubtre === void 0 ? "/" : _ref27$metadataSubtre, _ref27$metadata = _ref27.metadata, metadata = _ref27$metadata === void 0 ? {} : _ref27$metadata;
          ValidateParameters({
            libraryId: libraryId,
            objectId: objectId
          });
          ValidateWriteToken(writeToken);
          this.Log("Replacing metadata: ".concat(libraryId, " ").concat(objectId, " ").concat(writeToken, "\n      Subtree: ").concat(metadataSubtree));
          this.Log(metadata);
          path = UrlJoin("q", writeToken, "meta", metadataSubtree);
          _context26.t0 = _regeneratorRuntime;
          _context26.t1 = this.HttpClient;
          _context26.next = 10;
          return _regeneratorRuntime.awrap(this.authClient.AuthorizationHeader({
            libraryId: libraryId,
            objectId: objectId,
            update: true
          }));

        case 10:
          _context26.t2 = _context26.sent;
          _context26.t3 = path;
          _context26.t4 = metadata;
          _context26.t5 = {
            headers: _context26.t2,
            method: "PUT",
            path: _context26.t3,
            body: _context26.t4,
            failover: false
          };
          _context26.t6 = _context26.t1.Request.call(_context26.t1, _context26.t5);
          _context26.next = 17;
          return _context26.t0.awrap.call(_context26.t0, _context26.t6);

        case 17:
        case "end":
          return _context26.stop();
      }
    }
  }, null, this);
};
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


exports.DeleteMetadata = function _callee25(_ref28) {
  var libraryId, objectId, writeToken, _ref28$metadataSubtre, metadataSubtree, path;

  return _regeneratorRuntime.async(function _callee25$(_context27) {
    while (1) {
      switch (_context27.prev = _context27.next) {
        case 0:
          libraryId = _ref28.libraryId, objectId = _ref28.objectId, writeToken = _ref28.writeToken, _ref28$metadataSubtre = _ref28.metadataSubtree, metadataSubtree = _ref28$metadataSubtre === void 0 ? "/" : _ref28$metadataSubtre;
          ValidateParameters({
            libraryId: libraryId,
            objectId: objectId
          });
          ValidateWriteToken(writeToken);
          this.Log("Deleting metadata: ".concat(libraryId, " ").concat(objectId, " ").concat(writeToken, "\n      Subtree: ").concat(metadataSubtree));
          this.Log("Subtree: ".concat(metadataSubtree));
          path = UrlJoin("q", writeToken, "meta", metadataSubtree);
          _context27.t0 = _regeneratorRuntime;
          _context27.t1 = this.HttpClient;
          _context27.next = 10;
          return _regeneratorRuntime.awrap(this.authClient.AuthorizationHeader({
            libraryId: libraryId,
            objectId: objectId,
            update: true
          }));

        case 10:
          _context27.t2 = _context27.sent;
          _context27.t3 = path;
          _context27.t4 = {
            headers: _context27.t2,
            method: "DELETE",
            path: _context27.t3,
            failover: false
          };
          _context27.t5 = _context27.t1.Request.call(_context27.t1, _context27.t4);
          _context27.next = 16;
          return _context27.t0.awrap.call(_context27.t0, _context27.t5);

        case 16:
        case "end":
          return _context27.stop();
      }
    }
  }, null, this);
};
/**
 * Set the access charge for the specified object
 *
 * @methodGroup Access Requests
 * @namedParams
 * @param {string} objectId - ID of the object
 * @param {number | string} accessCharge - The new access charge, in ether
 */


exports.SetAccessCharge = function _callee26(_ref29) {
  var objectId, accessCharge;
  return _regeneratorRuntime.async(function _callee26$(_context28) {
    while (1) {
      switch (_context28.prev = _context28.next) {
        case 0:
          objectId = _ref29.objectId, accessCharge = _ref29.accessCharge;
          ValidateObject(objectId);
          this.Log("Setting access charge: ".concat(objectId, " ").concat(accessCharge));
          _context28.next = 5;
          return _regeneratorRuntime.awrap(this.ethClient.CallContractMethodAndWait({
            contractAddress: this.utils.HashToAddress(objectId),
            methodName: "setAccessCharge",
            methodArgs: [this.utils.EtherToWei(accessCharge).toString()]
          }));

        case 5:
        case "end":
          return _context28.stop();
      }
    }
  }, null, this);
};
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


exports.UpdateContentObjectGraph = function _callee28(_ref30) {
  var _this5 = this;

  var libraryId, objectId, versionHash, callback, total, completed, _loop, _ret;

  return _regeneratorRuntime.async(function _callee28$(_context31) {
    while (1) {
      switch (_context31.prev = _context31.next) {
        case 0:
          libraryId = _ref30.libraryId, objectId = _ref30.objectId, versionHash = _ref30.versionHash, callback = _ref30.callback;
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

          _loop = function _loop() {
            var graph, currentHash, links, details, name, currentLibraryId, currentObjectId, _ref31, write_token, _ref33, hash;

            return _regeneratorRuntime.async(function _loop$(_context30) {
              while (1) {
                switch (_context30.prev = _context30.next) {
                  case 0:
                    _context30.next = 2;
                    return _regeneratorRuntime.awrap(_this5.ContentObjectGraph({
                      libraryId: libraryId,
                      objectId: objectId,
                      versionHash: versionHash,
                      autoUpdate: true,
                      select: ["name", "public/name", "public/asset_metadata/display_title"]
                    }));

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
                    return _regeneratorRuntime.awrap(_this5.ContentObjectLibraryId({
                      versionHash: currentHash
                    }));

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
                    return _regeneratorRuntime.awrap(_this5.EditContentObject({
                      libraryId: currentLibraryId,
                      objectId: currentObjectId
                    }));

                  case 19:
                    _ref31 = _context30.sent;
                    write_token = _ref31.write_token;
                    _context30.next = 23;
                    return _regeneratorRuntime.awrap(Promise.all(links.map(function _callee27(_ref32) {
                      var path, updated;
                      return _regeneratorRuntime.async(function _callee27$(_context29) {
                        while (1) {
                          switch (_context29.prev = _context29.next) {
                            case 0:
                              path = _ref32.path, updated = _ref32.updated;
                              _context29.next = 3;
                              return _regeneratorRuntime.awrap(_this5.ReplaceMetadata({
                                libraryId: currentLibraryId,
                                objectId: currentObjectId,
                                writeToken: write_token,
                                metadataSubtree: path,
                                metadata: updated
                              }));

                            case 3:
                            case "end":
                              return _context29.stop();
                          }
                        }
                      });
                    })));

                  case 23:
                    _context30.next = 25;
                    return _regeneratorRuntime.awrap(_this5.FinalizeContentObject({
                      libraryId: currentLibraryId,
                      objectId: currentObjectId,
                      writeToken: write_token,
                      commitMessage: "Update links"
                    }));

                  case 25:
                    _ref33 = _context30.sent;
                    hash = _ref33.hash;

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
            });
          };

        case 6:
          if (!1) {
            _context31.next = 14;
            break;
          }

          _context31.next = 9;
          return _regeneratorRuntime.awrap(_loop());

        case 9:
          _ret = _context31.sent;

          if (!(_typeof(_ret) === "object")) {
            _context31.next = 12;
            break;
          }

          return _context31.abrupt("return", _ret.v);

        case 12:
          _context31.next = 6;
          break;

        case 14:
        case "end":
          return _context31.stop();
      }
    }
  }, null, this);
};
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
      autoUpdate: boolean (if specified, link will be automatically updated to latest version by UpdateContentObjectGraph method)
    }
 ]

 * @methodGroup Links
 * @namedParams
 * @param {string} libraryId - ID of the library
 * @param {string} objectId - ID of the object
 * @param {string} writeToken - Write token of the draft
 * @param {Array<Object>} links - Link specifications
 */


exports.CreateLinks = function _callee30(_ref34) {
  var _this6 = this;

  var libraryId, objectId, writeToken, _ref34$links, links;

  return _regeneratorRuntime.async(function _callee30$(_context33) {
    while (1) {
      switch (_context33.prev = _context33.next) {
        case 0:
          libraryId = _ref34.libraryId, objectId = _ref34.objectId, writeToken = _ref34.writeToken, _ref34$links = _ref34.links, links = _ref34$links === void 0 ? [] : _ref34$links;
          ValidateParameters({
            libraryId: libraryId,
            objectId: objectId
          });
          ValidateWriteToken(writeToken);
          _context33.next = 5;
          return _regeneratorRuntime.awrap(this.utils.LimitedMap(10, links, function _callee29(info) {
            var path, type, target, link;
            return _regeneratorRuntime.async(function _callee29$(_context32) {
              while (1) {
                switch (_context32.prev = _context32.next) {
                  case 0:
                    path = info.path.replace(/^(\/|\.)+/, "");
                    type = (info.type || "file") === "file" ? "files" : info.type;

                    if (type === "metadata") {
                      type = "meta";
                    }

                    target = info.target.replace(/^(\/|\.)+/, "");

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
                    }

                    _context32.next = 9;
                    return _regeneratorRuntime.awrap(_this6.ReplaceMetadata({
                      libraryId: libraryId,
                      objectId: objectId,
                      writeToken: writeToken,
                      metadataSubtree: path,
                      metadata: link
                    }));

                  case 9:
                  case "end":
                    return _context32.stop();
                }
              }
            });
          }));

        case 5:
        case "end":
          return _context33.stop();
      }
    }
  }, null, this);
};
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


exports.InitializeAuthPolicy = function _callee31(_ref35) {
  var libraryId, objectId, writeToken, _ref35$target, target, body, version, description, id, authPolicy, string;

  return _regeneratorRuntime.async(function _callee31$(_context34) {
    while (1) {
      switch (_context34.prev = _context34.next) {
        case 0:
          libraryId = _ref35.libraryId, objectId = _ref35.objectId, writeToken = _ref35.writeToken, _ref35$target = _ref35.target, target = _ref35$target === void 0 ? "auth_policy_spec" : _ref35$target, body = _ref35.body, version = _ref35.version, description = _ref35.description, id = _ref35.id;
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
          _context34.t0 = this.utils;
          _context34.next = 6;
          return _regeneratorRuntime.awrap(this.authClient.Sign(Ethers.utils.keccak256(Ethers.utils.toUtf8Bytes(string))));

        case 6:
          _context34.t1 = _context34.sent;
          authPolicy.signature = _context34.t0.FormatSignature.call(_context34.t0, _context34.t1);
          _context34.next = 10;
          return _regeneratorRuntime.awrap(this.ReplaceMetadata({
            libraryId: libraryId,
            objectId: objectId,
            writeToken: writeToken,
            metadataSubtree: "auth_policy",
            metadata: authPolicy
          }));

        case 10:
          _context34.next = 12;
          return _regeneratorRuntime.awrap(this.SetAuthPolicy({
            objectId: objectId,
            policyId: objectId
          }));

        case 12:
        case "end":
          return _context34.stop();
      }
    }
  }, null, this);
};
/**
 * Set the authorization policy for the specified object
 *
 * @methodGroup Auth Policies
 * @namedParams
 * @param {string} objectId - The ID of the object
 * @param {string} policyId - The ID of the policy
 */


exports.SetAuthPolicy = function _callee32(_ref36) {
  var objectId, policyId;
  return _regeneratorRuntime.async(function _callee32$(_context35) {
    while (1) {
      switch (_context35.prev = _context35.next) {
        case 0:
          objectId = _ref36.objectId, policyId = _ref36.policyId;
          _context35.next = 3;
          return _regeneratorRuntime.awrap(this.MergeContractMetadata({
            contractAddress: this.utils.HashToAddress(objectId),
            metadataKey: "_AUTH_CONTEXT",
            metadata: {
              "elv:delegation-id": policyId
            }
          }));

        case 3:
        case "end":
          return _context35.stop();
      }
    }
  }, null, this);
};