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

exports.SetVisibility = function _callee(_ref) {
  var id, visibility, hasSetVisibility;
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
          return _regeneratorRuntime.awrap(this.CallContractMethod({
            contractAddress: this.utils.HashToAddress(id),
            methodName: "setVisibility",
            methodArgs: [visibility]
          }));

        case 9:
          return _context.abrupt("return", _context.sent);

        case 10:
        case "end":
          return _context.stop();
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


exports.CreateContentType = function _callee2(_ref2) {
  var name, _ref2$metadata, metadata, bitcode, _ref3, contractAddress, objectId, path, createResponse, uploadResponse;

  return _regeneratorRuntime.async(function _callee2$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          name = _ref2.name, _ref2$metadata = _ref2.metadata, metadata = _ref2$metadata === void 0 ? {} : _ref2$metadata, bitcode = _ref2.bitcode;
          this.Log("Creating content type: ".concat(name));
          metadata.name = name;
          metadata["public"] = _objectSpread({
            name: name
          }, metadata["public"] || {});
          _context2.next = 6;
          return _regeneratorRuntime.awrap(this.authClient.CreateContentType());

        case 6:
          _ref3 = _context2.sent;
          contractAddress = _ref3.contractAddress;
          objectId = this.utils.AddressToObjectId(contractAddress);
          _context2.next = 11;
          return _regeneratorRuntime.awrap(this.SetVisibility({
            id: objectId,
            visibility: 1
          }));

        case 11:
          path = UrlJoin("qlibs", this.contentSpaceLibraryId, "qid", objectId);
          this.Log("Created type: ".concat(contractAddress, " ").concat(objectId));
          /* Create object, upload bitcode and finalize */

          _context2.t0 = _regeneratorRuntime;
          _context2.t1 = this.utils;
          _context2.t2 = this.HttpClient;
          _context2.next = 18;
          return _regeneratorRuntime.awrap(this.authClient.AuthorizationHeader({
            libraryId: this.contentSpaceLibraryId,
            objectId: objectId,
            update: true
          }));

        case 18:
          _context2.t3 = _context2.sent;
          _context2.t4 = path;
          _context2.t5 = {
            headers: _context2.t3,
            method: "POST",
            path: _context2.t4,
            failover: false
          };
          _context2.t6 = _context2.t2.Request.call(_context2.t2, _context2.t5);
          _context2.t7 = _context2.t1.ResponseToJson.call(_context2.t1, _context2.t6);
          _context2.next = 25;
          return _context2.t0.awrap.call(_context2.t0, _context2.t7);

        case 25:
          createResponse = _context2.sent;
          _context2.next = 28;
          return _regeneratorRuntime.awrap(this.ReplaceMetadata({
            libraryId: this.contentSpaceLibraryId,
            objectId: objectId,
            writeToken: createResponse.write_token,
            metadata: metadata
          }));

        case 28:
          if (!bitcode) {
            _context2.next = 34;
            break;
          }

          _context2.next = 31;
          return _regeneratorRuntime.awrap(this.UploadPart({
            libraryId: this.contentSpaceLibraryId,
            objectId: objectId,
            writeToken: createResponse.write_token,
            data: bitcode,
            encrypted: false
          }));

        case 31:
          uploadResponse = _context2.sent;
          _context2.next = 34;
          return _regeneratorRuntime.awrap(this.ReplaceMetadata({
            libraryId: this.contentSpaceLibraryId,
            objectId: objectId,
            writeToken: createResponse.write_token,
            metadataSubtree: "bitcode_part",
            metadata: uploadResponse.part.hash
          }));

        case 34:
          _context2.next = 36;
          return _regeneratorRuntime.awrap(this.FinalizeContentObject({
            libraryId: this.contentSpaceLibraryId,
            objectId: objectId,
            writeToken: createResponse.write_token
          }));

        case 36:
          return _context2.abrupt("return", objectId);

        case 37:
        case "end":
          return _context2.stop();
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


exports.CreateContentLibrary = function _callee3(_ref4) {
  var name, description, image, imageName, _ref4$metadata, metadata, kmsId, _ref5, contractAddress, libraryId, objectId, editResponse;

  return _regeneratorRuntime.async(function _callee3$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          name = _ref4.name, description = _ref4.description, image = _ref4.image, imageName = _ref4.imageName, _ref4$metadata = _ref4.metadata, metadata = _ref4$metadata === void 0 ? {} : _ref4$metadata, kmsId = _ref4.kmsId;

          if (kmsId) {
            _context3.next = 9;
            break;
          }

          _context3.t0 = "ikms";
          _context3.t1 = this.utils;
          _context3.next = 6;
          return _regeneratorRuntime.awrap(this.DefaultKMSAddress());

        case 6:
          _context3.t2 = _context3.sent;
          _context3.t3 = _context3.t1.AddressToHash.call(_context3.t1, _context3.t2);
          kmsId = _context3.t0.concat.call(_context3.t0, _context3.t3);

        case 9:
          this.Log("Creating content library");
          this.Log("KMS ID: ".concat(kmsId));
          _context3.next = 13;
          return _regeneratorRuntime.awrap(this.authClient.CreateContentLibrary({
            kmsId: kmsId
          }));

        case 13:
          _ref5 = _context3.sent;
          contractAddress = _ref5.contractAddress;
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
          _context3.next = 22;
          return _regeneratorRuntime.awrap(this.EditContentObject({
            libraryId: libraryId,
            objectId: objectId,
            options: {
              type: "library"
            }
          }));

        case 22:
          editResponse = _context3.sent;
          _context3.next = 25;
          return _regeneratorRuntime.awrap(this.ReplaceMetadata({
            libraryId: libraryId,
            objectId: objectId,
            metadata: metadata,
            writeToken: editResponse.write_token
          }));

        case 25:
          _context3.next = 27;
          return _regeneratorRuntime.awrap(this.FinalizeContentObject({
            libraryId: libraryId,
            objectId: objectId,
            writeToken: editResponse.write_token
          }));

        case 27:
          if (!image) {
            _context3.next = 30;
            break;
          }

          _context3.next = 30;
          return _regeneratorRuntime.awrap(this.SetContentLibraryImage({
            libraryId: libraryId,
            image: image,
            imageName: imageName
          }));

        case 30:
          this.Log("Library ".concat(libraryId, " created"));
          return _context3.abrupt("return", libraryId);

        case 32:
        case "end":
          return _context3.stop();
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


exports.SetContentLibraryImage = function _callee4(_ref6) {
  var libraryId, writeToken, image, imageName, objectId;
  return _regeneratorRuntime.async(function _callee4$(_context4) {
    while (1) {
      switch (_context4.prev = _context4.next) {
        case 0:
          libraryId = _ref6.libraryId, writeToken = _ref6.writeToken, image = _ref6.image, imageName = _ref6.imageName;
          ValidateLibrary(libraryId);
          objectId = libraryId.replace("ilib", "iq__");
          return _context4.abrupt("return", this.SetContentObjectImage({
            libraryId: libraryId,
            objectId: objectId,
            writeToken: writeToken,
            image: image,
            imageName: imageName
          }));

        case 4:
        case "end":
          return _context4.stop();
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
 */


exports.SetContentObjectImage = function _callee5(_ref7) {
  var libraryId, objectId, writeToken, image, imageName;
  return _regeneratorRuntime.async(function _callee5$(_context5) {
    while (1) {
      switch (_context5.prev = _context5.next) {
        case 0:
          libraryId = _ref7.libraryId, objectId = _ref7.objectId, writeToken = _ref7.writeToken, image = _ref7.image, imageName = _ref7.imageName;
          ValidateParameters({
            libraryId: libraryId,
            objectId: objectId
          });
          ValidateWriteToken(writeToken);
          ValidatePresence("image", image);
          imageName = imageName || "display_image";
          _context5.next = 7;
          return _regeneratorRuntime.awrap(this.UploadFiles({
            libraryId: libraryId,
            objectId: objectId,
            writeToken: writeToken,
            data: image,
            encrypted: false,
            fileInfo: [{
              path: imageName,
              mime_type: "image/*",
              size: image.size || image.length || image.byteLength,
              data: image
            }]
          }));

        case 7:
          _context5.next = 9;
          return _regeneratorRuntime.awrap(this.ReplaceMetadata({
            libraryId: libraryId,
            objectId: objectId,
            writeToken: writeToken,
            metadataSubtree: "public/display_image",
            metadata: {
              "/": "./files/".concat(imageName)
            }
          }));

        case 9:
        case "end":
          return _context5.stop();
      }
    }
  }, null, this);
};
/**
 * Delete the specified content library
 *
 * @methodGroup Content Libraries
 *
 * @namedParams
 * @param {string} libraryId - ID of the library to delete
 */


exports.DeleteContentLibrary = function _callee6(_ref8) {
  var libraryId, path, authorizationHeader;
  return _regeneratorRuntime.async(function _callee6$(_context6) {
    while (1) {
      switch (_context6.prev = _context6.next) {
        case 0:
          libraryId = _ref8.libraryId;
          ValidateLibrary(libraryId);
          path = UrlJoin("qlibs", libraryId);
          _context6.next = 5;
          return _regeneratorRuntime.awrap(this.authClient.AuthorizationHeader({
            libraryId: libraryId,
            update: true
          }));

        case 5:
          authorizationHeader = _context6.sent;
          _context6.next = 8;
          return _regeneratorRuntime.awrap(this.CallContractMethodAndWait({
            contractAddress: this.utils.HashToAddress(libraryId),
            methodName: "kill",
            methodArgs: []
          }));

        case 8:
          _context6.next = 10;
          return _regeneratorRuntime.awrap(this.HttpClient.Request({
            headers: authorizationHeader,
            method: "DELETE",
            path: path
          }));

        case 10:
        case "end":
          return _context6.stop();
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


exports.AddLibraryContentType = function _callee7(_ref9) {
  var libraryId, typeId, typeName, typeHash, customContractAddress, type, typeAddress, event;
  return _regeneratorRuntime.async(function _callee7$(_context7) {
    while (1) {
      switch (_context7.prev = _context7.next) {
        case 0:
          libraryId = _ref9.libraryId, typeId = _ref9.typeId, typeName = _ref9.typeName, typeHash = _ref9.typeHash, customContractAddress = _ref9.customContractAddress;
          ValidateLibrary(libraryId);
          this.Log("Adding library content type to ".concat(libraryId, ": ").concat(typeId || typeHash || typeName));

          if (typeHash) {
            typeId = this.utils.DecodeVersionHash(typeHash).objectId;
          }

          if (typeId) {
            _context7.next = 9;
            break;
          }

          _context7.next = 7;
          return _regeneratorRuntime.awrap(this.ContentType({
            name: typeName
          }));

        case 7:
          type = _context7.sent;
          typeId = type.id;

        case 9:
          this.Log("Type ID: ".concat(typeId));
          typeAddress = this.utils.HashToAddress(typeId);
          customContractAddress = customContractAddress || this.utils.nullAddress;
          _context7.next = 14;
          return _regeneratorRuntime.awrap(this.ethClient.CallContractMethodAndWait({
            contractAddress: this.utils.HashToAddress(libraryId),
            methodName: "addContentType",
            methodArgs: [typeAddress, customContractAddress]
          }));

        case 14:
          event = _context7.sent;
          return _context7.abrupt("return", event.transactionHash);

        case 16:
        case "end":
          return _context7.stop();
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


exports.RemoveLibraryContentType = function _callee8(_ref10) {
  var libraryId, typeId, typeName, typeHash, type, typeAddress, event;
  return _regeneratorRuntime.async(function _callee8$(_context8) {
    while (1) {
      switch (_context8.prev = _context8.next) {
        case 0:
          libraryId = _ref10.libraryId, typeId = _ref10.typeId, typeName = _ref10.typeName, typeHash = _ref10.typeHash;
          ValidateLibrary(libraryId);
          this.Log("Removing library content type from ".concat(libraryId, ": ").concat(typeId || typeHash || typeName));

          if (typeHash) {
            typeId = this.utils.DecodeVersionHash(typeHash).objectId;
          }

          if (typeId) {
            _context8.next = 9;
            break;
          }

          _context8.next = 7;
          return _regeneratorRuntime.awrap(this.ContentType({
            name: typeName
          }));

        case 7:
          type = _context8.sent;
          typeId = type.id;

        case 9:
          this.Log("Type ID: ".concat(typeId));
          typeAddress = this.utils.HashToAddress(typeId);
          _context8.next = 13;
          return _regeneratorRuntime.awrap(this.ethClient.CallContractMethodAndWait({
            contractAddress: this.utils.HashToAddress(libraryId),
            methodName: "removeContentType",
            methodArgs: [typeAddress]
          }));

        case 13:
          event = _context8.sent;
          return _context8.abrupt("return", event.transactionHash);

        case 15:
        case "end":
          return _context8.stop();
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


exports.CreateContentObject = function _callee9(_ref11) {
  var libraryId, objectId, _ref11$options, options, typeId, type, _ref12, contractAddress, path;

  return _regeneratorRuntime.async(function _callee9$(_context9) {
    while (1) {
      switch (_context9.prev = _context9.next) {
        case 0:
          libraryId = _ref11.libraryId, objectId = _ref11.objectId, _ref11$options = _ref11.options, options = _ref11$options === void 0 ? {} : _ref11$options;
          ValidateLibrary(libraryId);

          if (objectId) {
            ValidateObject(objectId);
          }

          this.Log("Creating content object: ".concat(libraryId, " ").concat(objectId || "")); // Look up content type, if specified

          if (!options.type) {
            _context9.next = 26;
            break;
          }

          this.Log("Type specified: ".concat(options.type));
          type = options.type;

          if (!type.startsWith("hq__")) {
            _context9.next = 13;
            break;
          }

          _context9.next = 10;
          return _regeneratorRuntime.awrap(this.ContentType({
            versionHash: type
          }));

        case 10:
          type = _context9.sent;
          _context9.next = 22;
          break;

        case 13:
          if (!type.startsWith("iq__")) {
            _context9.next = 19;
            break;
          }

          _context9.next = 16;
          return _regeneratorRuntime.awrap(this.ContentType({
            typeId: type
          }));

        case 16:
          type = _context9.sent;
          _context9.next = 22;
          break;

        case 19:
          _context9.next = 21;
          return _regeneratorRuntime.awrap(this.ContentType({
            name: type
          }));

        case 21:
          type = _context9.sent;

        case 22:
          if (type) {
            _context9.next = 24;
            break;
          }

          throw Error("Unable to find content type '".concat(options.type, "'"));

        case 24:
          typeId = type.id;
          options.type = type.hash;

        case 26:
          if (objectId) {
            _context9.next = 36;
            break;
          }

          this.Log("Deploying contract...");
          _context9.next = 30;
          return _regeneratorRuntime.awrap(this.authClient.CreateContentObject({
            libraryId: libraryId,
            typeId: typeId
          }));

        case 30:
          _ref12 = _context9.sent;
          contractAddress = _ref12.contractAddress;
          objectId = this.utils.AddressToObjectId(contractAddress);
          this.Log("Contract deployed: ".concat(contractAddress, " ").concat(objectId));
          _context9.next = 43;
          break;

        case 36:
          _context9.t0 = this;
          _context9.t1 = "Contract already deployed for contract type: ";
          _context9.next = 40;
          return _regeneratorRuntime.awrap(this.AccessType({
            id: objectId
          }));

        case 40:
          _context9.t2 = _context9.sent;
          _context9.t3 = _context9.t1.concat.call(_context9.t1, _context9.t2);

          _context9.t0.Log.call(_context9.t0, _context9.t3);

        case 43:
          if (!options.visibility) {
            _context9.next = 47;
            break;
          }

          this.Log("Setting visibility to ".concat(options.visibility));
          _context9.next = 47;
          return _regeneratorRuntime.awrap(this.SetVisibility({
            id: objectId,
            visibility: options.visibility
          }));

        case 47:
          path = UrlJoin("qid", objectId);
          _context9.t4 = _regeneratorRuntime;
          _context9.t5 = this.utils;
          _context9.t6 = this.HttpClient;
          _context9.next = 53;
          return _regeneratorRuntime.awrap(this.authClient.AuthorizationHeader({
            libraryId: libraryId,
            objectId: objectId,
            update: true
          }));

        case 53:
          _context9.t7 = _context9.sent;
          _context9.t8 = path;
          _context9.t9 = options;
          _context9.t10 = {
            headers: _context9.t7,
            method: "POST",
            path: _context9.t8,
            body: _context9.t9,
            failover: false
          };
          _context9.t11 = _context9.t6.Request.call(_context9.t6, _context9.t10);
          _context9.t12 = _context9.t5.ResponseToJson.call(_context9.t5, _context9.t11);
          _context9.next = 61;
          return _context9.t4.awrap.call(_context9.t4, _context9.t12);

        case 61:
          return _context9.abrupt("return", _context9.sent);

        case 62:
        case "end":
          return _context9.stop();
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


exports.CopyContentObject = function _callee10(_ref13) {
  var libraryId, originalVersionHash, _ref13$options, options;

  return _regeneratorRuntime.async(function _callee10$(_context10) {
    while (1) {
      switch (_context10.prev = _context10.next) {
        case 0:
          libraryId = _ref13.libraryId, originalVersionHash = _ref13.originalVersionHash, _ref13$options = _ref13.options, options = _ref13$options === void 0 ? {} : _ref13$options;
          ValidateLibrary(libraryId);
          ValidateVersion(originalVersionHash);
          options.copy_from = originalVersionHash;
          _context10.next = 6;
          return _regeneratorRuntime.awrap(this.CreateContentObject({
            libraryId: libraryId,
            options: options
          }));

        case 6:
          return _context10.abrupt("return", _context10.sent);

        case 7:
        case "end":
          return _context10.stop();
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


exports.EditContentObject = function _callee11(_ref14) {
  var libraryId, objectId, _ref14$options, options, path;

  return _regeneratorRuntime.async(function _callee11$(_context11) {
    while (1) {
      switch (_context11.prev = _context11.next) {
        case 0:
          libraryId = _ref14.libraryId, objectId = _ref14.objectId, _ref14$options = _ref14.options, options = _ref14$options === void 0 ? {} : _ref14$options;
          ValidateParameters({
            libraryId: libraryId,
            objectId: objectId
          });
          this.Log("Opening content draft: ".concat(libraryId, " ").concat(objectId));

          if (!options.type) {
            _context11.next = 19;
            break;
          }

          if (!options.type.startsWith("hq__")) {
            _context11.next = 10;
            break;
          }

          _context11.next = 7;
          return _regeneratorRuntime.awrap(this.ContentType({
            versionHash: options.type
          }));

        case 7:
          options.type = _context11.sent.hash;
          _context11.next = 19;
          break;

        case 10:
          if (!options.type.startsWith("iq__")) {
            _context11.next = 16;
            break;
          }

          _context11.next = 13;
          return _regeneratorRuntime.awrap(this.ContentType({
            typeId: options.type
          }));

        case 13:
          options.type = _context11.sent.hash;
          _context11.next = 19;
          break;

        case 16:
          _context11.next = 18;
          return _regeneratorRuntime.awrap(this.ContentType({
            name: options.type
          }));

        case 18:
          options.type = _context11.sent.hash;

        case 19:
          path = UrlJoin("qid", objectId);
          _context11.t0 = this.utils;
          _context11.t1 = this.HttpClient;
          _context11.next = 24;
          return _regeneratorRuntime.awrap(this.authClient.AuthorizationHeader({
            libraryId: libraryId,
            objectId: objectId,
            update: true
          }));

        case 24:
          _context11.t2 = _context11.sent;
          _context11.t3 = path;
          _context11.t4 = options;
          _context11.t5 = {
            headers: _context11.t2,
            method: "POST",
            path: _context11.t3,
            body: _context11.t4,
            failover: false
          };
          _context11.t6 = _context11.t1.Request.call(_context11.t1, _context11.t5);
          return _context11.abrupt("return", _context11.t0.ResponseToJson.call(_context11.t0, _context11.t6));

        case 30:
        case "end":
          return _context11.stop();
      }
    }
  }, null, this);
};

exports.AwaitPending = function _callee12(objectId) {
  var _this = this;

  var PendingHash, pending, isWallet, timeout, i;
  return _regeneratorRuntime.async(function _callee12$(_context13) {
    while (1) {
      switch (_context13.prev = _context13.next) {
        case 0:
          PendingHash = function PendingHash() {
            return _regeneratorRuntime.async(function PendingHash$(_context12) {
              while (1) {
                switch (_context12.prev = _context12.next) {
                  case 0:
                    _context12.next = 2;
                    return _regeneratorRuntime.awrap(_this.CallContractMethod({
                      contractAddress: _this.utils.HashToAddress(objectId),
                      methodName: "pendingHash"
                    }));

                  case 2:
                    return _context12.abrupt("return", _context12.sent);

                  case 3:
                  case "end":
                    return _context12.stop();
                }
              }
            });
          };

          this.Log("Checking for pending commit");
          _context13.next = 4;
          return _regeneratorRuntime.awrap(PendingHash());

        case 4:
          pending = _context13.sent;

          if (pending) {
            _context13.next = 7;
            break;
          }

          return _context13.abrupt("return");

        case 7:
          _context13.next = 9;
          return _regeneratorRuntime.awrap(this.authClient.AccessType(objectId));

        case 9:
          _context13.t0 = _context13.sent;
          _context13.t1 = this.authClient.ACCESS_TYPES.WALLET;
          isWallet = _context13.t0 === _context13.t1;
          timeout = isWallet ? 3 : 10;
          this.Log("Waiting for pending commit to clear for ".concat(objectId));
          i = 0;

        case 15:
          if (!(i < timeout)) {
            _context13.next = 25;
            break;
          }

          _context13.next = 18;
          return _regeneratorRuntime.awrap(new Promise(function (resolve) {
            return setTimeout(resolve, 1000);
          }));

        case 18:
          _context13.next = 20;
          return _regeneratorRuntime.awrap(PendingHash());

        case 20:
          if (_context13.sent) {
            _context13.next = 22;
            break;
          }

          return _context13.abrupt("return");

        case 22:
          i++;
          _context13.next = 15;
          break;

        case 25:
          if (!isWallet) {
            _context13.next = 31;
            break;
          }

          this.Log("Clearing stuck wallet commit", true); // Clear pending commit, it's probably stuck

          _context13.next = 29;
          return _regeneratorRuntime.awrap(this.CallContractMethodAndWait({
            contractAddress: this.utils.HashToAddress(objectId),
            methodName: "clearPending"
          }));

        case 29:
          _context13.next = 32;
          break;

        case 31:
          throw Error("Unable to finalize ".concat(objectId, " - Another commit is pending"));

        case 32:
        case "end":
          return _context13.stop();
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
 * @param {boolean=} publish=true - If specified, the object will also be published
 * @param {boolean=} awaitCommitConfirmation=true - If specified, will wait for the publish commit to be confirmed.
 * Irrelevant if not publishing.
 */


exports.FinalizeContentObject = function _callee13(_ref15) {
  var libraryId, objectId, writeToken, _ref15$publish, publish, _ref15$awaitCommitCon, awaitCommitConfirmation, path, finalizeResponse;

  return _regeneratorRuntime.async(function _callee13$(_context14) {
    while (1) {
      switch (_context14.prev = _context14.next) {
        case 0:
          libraryId = _ref15.libraryId, objectId = _ref15.objectId, writeToken = _ref15.writeToken, _ref15$publish = _ref15.publish, publish = _ref15$publish === void 0 ? true : _ref15$publish, _ref15$awaitCommitCon = _ref15.awaitCommitConfirmation, awaitCommitConfirmation = _ref15$awaitCommitCon === void 0 ? true : _ref15$awaitCommitCon;
          ValidateParameters({
            libraryId: libraryId,
            objectId: objectId
          });
          ValidateWriteToken(writeToken);
          this.Log("Finalizing content draft: ".concat(libraryId, " ").concat(objectId, " ").concat(writeToken));
          _context14.next = 6;
          return _regeneratorRuntime.awrap(this.AwaitPending(objectId));

        case 6:
          path = UrlJoin("q", writeToken);
          _context14.t0 = _regeneratorRuntime;
          _context14.t1 = this.utils;
          _context14.t2 = this.HttpClient;
          _context14.next = 12;
          return _regeneratorRuntime.awrap(this.authClient.AuthorizationHeader({
            libraryId: libraryId,
            objectId: objectId,
            update: true
          }));

        case 12:
          _context14.t3 = _context14.sent;
          _context14.t4 = path;
          _context14.t5 = {
            headers: _context14.t3,
            method: "POST",
            path: _context14.t4,
            failover: false
          };
          _context14.t6 = _context14.t2.Request.call(_context14.t2, _context14.t5);
          _context14.t7 = _context14.t1.ResponseToJson.call(_context14.t1, _context14.t6);
          _context14.next = 19;
          return _context14.t0.awrap.call(_context14.t0, _context14.t7);

        case 19:
          finalizeResponse = _context14.sent;
          this.Log("Finalized: ".concat(finalizeResponse.hash));

          if (!publish) {
            _context14.next = 24;
            break;
          }

          _context14.next = 24;
          return _regeneratorRuntime.awrap(this.PublishContentVersion({
            objectId: objectId,
            versionHash: finalizeResponse.hash,
            awaitCommitConfirmation: awaitCommitConfirmation
          }));

        case 24:
          // Invalidate cached content type, if this is one.
          delete this.contentTypes[objectId];
          return _context14.abrupt("return", finalizeResponse);

        case 26:
        case "end":
          return _context14.stop();
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


exports.PublishContentVersion = function _callee14(_ref16) {
  var objectId, versionHash, _ref16$awaitCommitCon, awaitCommitConfirmation, abi;

  return _regeneratorRuntime.async(function _callee14$(_context15) {
    while (1) {
      switch (_context15.prev = _context15.next) {
        case 0:
          objectId = _ref16.objectId, versionHash = _ref16.versionHash, _ref16$awaitCommitCon = _ref16.awaitCommitConfirmation, awaitCommitConfirmation = _ref16$awaitCommitCon === void 0 ? true : _ref16$awaitCommitCon;
          versionHash ? ValidateVersion(versionHash) : ValidateObject(objectId);
          this.Log("Publishing: ".concat(objectId || versionHash));

          if (versionHash) {
            objectId = this.utils.DecodeVersionHash(versionHash).objectId;
          }

          _context15.next = 6;
          return _regeneratorRuntime.awrap(this.ethClient.CommitContent({
            contentObjectAddress: this.utils.HashToAddress(objectId),
            versionHash: versionHash,
            signer: this.signer
          }));

        case 6:
          if (!awaitCommitConfirmation) {
            _context15.next = 13;
            break;
          }

          this.Log("Awaiting commit confirmation...");
          _context15.next = 10;
          return _regeneratorRuntime.awrap(this.ContractAbi({
            id: objectId
          }));

        case 10:
          abi = _context15.sent;
          _context15.next = 13;
          return _regeneratorRuntime.awrap(this.ethClient.AwaitEvent({
            contractAddress: this.utils.HashToAddress(objectId),
            abi: abi,
            eventName: "VersionConfirm",
            signer: this.signer
          }));

        case 13:
        case "end":
          return _context15.stop();
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


exports.DeleteContentVersion = function _callee15(_ref17) {
  var versionHash, _this$utils$DecodeVer, objectId;

  return _regeneratorRuntime.async(function _callee15$(_context16) {
    while (1) {
      switch (_context16.prev = _context16.next) {
        case 0:
          versionHash = _ref17.versionHash;
          ValidateVersion(versionHash);
          this.Log("Deleting content version: ".concat(versionHash));
          _this$utils$DecodeVer = this.utils.DecodeVersionHash(versionHash), objectId = _this$utils$DecodeVer.objectId;
          _context16.next = 6;
          return _regeneratorRuntime.awrap(this.CallContractMethodAndWait({
            contractAddress: this.utils.HashToAddress(objectId),
            methodName: "deleteVersion",
            methodArgs: [versionHash]
          }));

        case 6:
        case "end":
          return _context16.stop();
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


exports.DeleteContentObject = function _callee16(_ref18) {
  var libraryId, objectId;
  return _regeneratorRuntime.async(function _callee16$(_context17) {
    while (1) {
      switch (_context17.prev = _context17.next) {
        case 0:
          libraryId = _ref18.libraryId, objectId = _ref18.objectId;
          ValidateParameters({
            libraryId: libraryId,
            objectId: objectId
          });
          this.Log("Deleting content version: ".concat(libraryId, " ").concat(objectId));
          _context17.next = 5;
          return _regeneratorRuntime.awrap(this.CallContractMethodAndWait({
            contractAddress: this.utils.HashToAddress(libraryId),
            methodName: "deleteContent",
            methodArgs: [this.utils.HashToAddress(objectId)]
          }));

        case 5:
        case "end":
          return _context17.stop();
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


exports.MergeMetadata = function _callee17(_ref19) {
  var libraryId, objectId, writeToken, _ref19$metadataSubtre, metadataSubtree, _ref19$metadata, metadata, path;

  return _regeneratorRuntime.async(function _callee17$(_context18) {
    while (1) {
      switch (_context18.prev = _context18.next) {
        case 0:
          libraryId = _ref19.libraryId, objectId = _ref19.objectId, writeToken = _ref19.writeToken, _ref19$metadataSubtre = _ref19.metadataSubtree, metadataSubtree = _ref19$metadataSubtre === void 0 ? "/" : _ref19$metadataSubtre, _ref19$metadata = _ref19.metadata, metadata = _ref19$metadata === void 0 ? {} : _ref19$metadata;
          ValidateParameters({
            libraryId: libraryId,
            objectId: objectId
          });
          ValidateWriteToken(writeToken);
          this.Log("Merging metadata: ".concat(libraryId, " ").concat(objectId, " ").concat(writeToken, "\n      Subtree: ").concat(metadataSubtree));
          this.Log(metadata);
          path = UrlJoin("q", writeToken, "meta", metadataSubtree);
          _context18.t0 = _regeneratorRuntime;
          _context18.t1 = this.HttpClient;
          _context18.next = 10;
          return _regeneratorRuntime.awrap(this.authClient.AuthorizationHeader({
            libraryId: libraryId,
            objectId: objectId,
            update: true
          }));

        case 10:
          _context18.t2 = _context18.sent;
          _context18.t3 = path;
          _context18.t4 = metadata;
          _context18.t5 = {
            headers: _context18.t2,
            method: "POST",
            path: _context18.t3,
            body: _context18.t4,
            failover: false
          };
          _context18.t6 = _context18.t1.Request.call(_context18.t1, _context18.t5);
          _context18.next = 17;
          return _context18.t0.awrap.call(_context18.t0, _context18.t6);

        case 17:
        case "end":
          return _context18.stop();
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


exports.ReplaceMetadata = function _callee18(_ref20) {
  var libraryId, objectId, writeToken, _ref20$metadataSubtre, metadataSubtree, _ref20$metadata, metadata, path;

  return _regeneratorRuntime.async(function _callee18$(_context19) {
    while (1) {
      switch (_context19.prev = _context19.next) {
        case 0:
          libraryId = _ref20.libraryId, objectId = _ref20.objectId, writeToken = _ref20.writeToken, _ref20$metadataSubtre = _ref20.metadataSubtree, metadataSubtree = _ref20$metadataSubtre === void 0 ? "/" : _ref20$metadataSubtre, _ref20$metadata = _ref20.metadata, metadata = _ref20$metadata === void 0 ? {} : _ref20$metadata;
          ValidateParameters({
            libraryId: libraryId,
            objectId: objectId
          });
          ValidateWriteToken(writeToken);
          this.Log("Replacing metadata: ".concat(libraryId, " ").concat(objectId, " ").concat(writeToken, "\n      Subtree: ").concat(metadataSubtree));
          this.Log(metadata);
          path = UrlJoin("q", writeToken, "meta", metadataSubtree);
          _context19.t0 = _regeneratorRuntime;
          _context19.t1 = this.HttpClient;
          _context19.next = 10;
          return _regeneratorRuntime.awrap(this.authClient.AuthorizationHeader({
            libraryId: libraryId,
            objectId: objectId,
            update: true
          }));

        case 10:
          _context19.t2 = _context19.sent;
          _context19.t3 = path;
          _context19.t4 = metadata;
          _context19.t5 = {
            headers: _context19.t2,
            method: "PUT",
            path: _context19.t3,
            body: _context19.t4,
            failover: false
          };
          _context19.t6 = _context19.t1.Request.call(_context19.t1, _context19.t5);
          _context19.next = 17;
          return _context19.t0.awrap.call(_context19.t0, _context19.t6);

        case 17:
        case "end":
          return _context19.stop();
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


exports.DeleteMetadata = function _callee19(_ref21) {
  var libraryId, objectId, writeToken, _ref21$metadataSubtre, metadataSubtree, path;

  return _regeneratorRuntime.async(function _callee19$(_context20) {
    while (1) {
      switch (_context20.prev = _context20.next) {
        case 0:
          libraryId = _ref21.libraryId, objectId = _ref21.objectId, writeToken = _ref21.writeToken, _ref21$metadataSubtre = _ref21.metadataSubtree, metadataSubtree = _ref21$metadataSubtre === void 0 ? "/" : _ref21$metadataSubtre;
          ValidateParameters({
            libraryId: libraryId,
            objectId: objectId
          });
          ValidateWriteToken(writeToken);
          this.Log("Deleting metadata: ".concat(libraryId, " ").concat(objectId, " ").concat(writeToken, "\n      Subtree: ").concat(metadataSubtree));
          this.Log("Subtree: ".concat(metadataSubtree));
          path = UrlJoin("q", writeToken, "meta", metadataSubtree);
          _context20.t0 = _regeneratorRuntime;
          _context20.t1 = this.HttpClient;
          _context20.next = 10;
          return _regeneratorRuntime.awrap(this.authClient.AuthorizationHeader({
            libraryId: libraryId,
            objectId: objectId,
            update: true
          }));

        case 10:
          _context20.t2 = _context20.sent;
          _context20.t3 = path;
          _context20.t4 = {
            headers: _context20.t2,
            method: "DELETE",
            path: _context20.t3,
            failover: false
          };
          _context20.t5 = _context20.t1.Request.call(_context20.t1, _context20.t4);
          _context20.next = 16;
          return _context20.t0.awrap.call(_context20.t0, _context20.t5);

        case 16:
        case "end":
          return _context20.stop();
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


exports.SetAccessCharge = function _callee20(_ref22) {
  var objectId, accessCharge;
  return _regeneratorRuntime.async(function _callee20$(_context21) {
    while (1) {
      switch (_context21.prev = _context21.next) {
        case 0:
          objectId = _ref22.objectId, accessCharge = _ref22.accessCharge;
          ValidateObject(objectId);
          this.Log("Setting access charge: ".concat(objectId, " ").concat(accessCharge));
          _context21.next = 5;
          return _regeneratorRuntime.awrap(this.ethClient.CallContractMethodAndWait({
            contractAddress: this.utils.HashToAddress(objectId),
            methodName: "setAccessCharge",
            methodArgs: [this.utils.EtherToWei(accessCharge).toString()]
          }));

        case 5:
        case "end":
          return _context21.stop();
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


exports.UpdateContentObjectGraph = function _callee22(_ref23) {
  var _this2 = this;

  var libraryId, objectId, versionHash, callback, total, completed, _loop, _ret;

  return _regeneratorRuntime.async(function _callee22$(_context24) {
    while (1) {
      switch (_context24.prev = _context24.next) {
        case 0:
          libraryId = _ref23.libraryId, objectId = _ref23.objectId, versionHash = _ref23.versionHash, callback = _ref23.callback;
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
            var graph, currentHash, links, details, name, currentLibraryId, currentObjectId, _ref24, write_token, _ref26, hash;

            return _regeneratorRuntime.async(function _loop$(_context23) {
              while (1) {
                switch (_context23.prev = _context23.next) {
                  case 0:
                    _context23.next = 2;
                    return _regeneratorRuntime.awrap(_this2.ContentObjectGraph({
                      libraryId: libraryId,
                      objectId: objectId,
                      versionHash: versionHash,
                      autoUpdate: true,
                      select: ["name", "public/name", "public/asset_metadata/display_title"]
                    }));

                  case 2:
                    graph = _context23.sent;

                    if (!(Object.keys(graph.auto_updates).length === 0)) {
                      _context23.next = 6;
                      break;
                    }

                    _this2.Log("No more updates required");

                    return _context23.abrupt("return", {
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
                    _context23.next = 13;
                    return _regeneratorRuntime.awrap(_this2.ContentObjectLibraryId({
                      versionHash: currentHash
                    }));

                  case 13:
                    currentLibraryId = _context23.sent;
                    currentObjectId = _this2.utils.DecodeVersionHash(currentHash).objectId;

                    if (callback) {
                      callback({
                        completed: completed,
                        total: total,
                        action: "Updating ".concat(name, " (").concat(currentObjectId, ")...")
                      });
                    }

                    _this2.Log("Updating links for ".concat(name, " (").concat(currentObjectId, " / ").concat(currentHash, ")"));

                    _context23.next = 19;
                    return _regeneratorRuntime.awrap(_this2.EditContentObject({
                      libraryId: currentLibraryId,
                      objectId: currentObjectId
                    }));

                  case 19:
                    _ref24 = _context23.sent;
                    write_token = _ref24.write_token;
                    _context23.next = 23;
                    return _regeneratorRuntime.awrap(Promise.all(links.map(function _callee21(_ref25) {
                      var path, updated;
                      return _regeneratorRuntime.async(function _callee21$(_context22) {
                        while (1) {
                          switch (_context22.prev = _context22.next) {
                            case 0:
                              path = _ref25.path, updated = _ref25.updated;
                              _context22.next = 3;
                              return _regeneratorRuntime.awrap(_this2.ReplaceMetadata({
                                libraryId: currentLibraryId,
                                objectId: currentObjectId,
                                writeToken: write_token,
                                metadataSubtree: path,
                                metadata: updated
                              }));

                            case 3:
                            case "end":
                              return _context22.stop();
                          }
                        }
                      });
                    })));

                  case 23:
                    _context23.next = 25;
                    return _regeneratorRuntime.awrap(_this2.FinalizeContentObject({
                      libraryId: currentLibraryId,
                      objectId: currentObjectId,
                      writeToken: write_token
                    }));

                  case 25:
                    _ref26 = _context23.sent;
                    hash = _ref26.hash;

                    // If root object was specified by hash and updated, update hash
                    if (currentHash === versionHash) {
                      versionHash = hash;
                    }

                    completed += 1;

                  case 29:
                  case "end":
                    return _context23.stop();
                }
              }
            });
          };

        case 6:
          if (!1) {
            _context24.next = 14;
            break;
          }

          _context24.next = 9;
          return _regeneratorRuntime.awrap(_loop());

        case 9:
          _ret = _context24.sent;

          if (!(_typeof(_ret) === "object")) {
            _context24.next = 12;
            break;
          }

          return _context24.abrupt("return", _ret.v);

        case 12:
          _context24.next = 6;
          break;

        case 14:
        case "end":
          return _context24.stop();
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


exports.CreateLinks = function _callee23(_ref27) {
  var libraryId, objectId, writeToken, _ref27$links, links, i, info, path, type, target, link;

  return _regeneratorRuntime.async(function _callee23$(_context25) {
    while (1) {
      switch (_context25.prev = _context25.next) {
        case 0:
          libraryId = _ref27.libraryId, objectId = _ref27.objectId, writeToken = _ref27.writeToken, _ref27$links = _ref27.links, links = _ref27$links === void 0 ? [] : _ref27$links;
          ValidateParameters({
            libraryId: libraryId,
            objectId: objectId
          });
          ValidateWriteToken(writeToken);
          i = 0;

        case 4:
          if (!(i < links.length)) {
            _context25.next = 18;
            break;
          }

          info = links[i];
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

          _context25.next = 15;
          return _regeneratorRuntime.awrap(this.ReplaceMetadata({
            libraryId: libraryId,
            objectId: objectId,
            writeToken: writeToken,
            metadataSubtree: path,
            metadata: link
          }));

        case 15:
          i++;
          _context25.next = 4;
          break;

        case 18:
        case "end":
          return _context25.stop();
      }
    }
  }, null, this);
};