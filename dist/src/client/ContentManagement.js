var _typeof = require("@babel/runtime/helpers/typeof");

var _regeneratorRuntime = require("@babel/runtime/regenerator");

var _defineProperty = require("@babel/runtime/helpers/defineProperty");

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

/**
 * Methods for managing content types, libraries and objects
 *
 * @module ElvClient/ContentManagement
 */
var UrlJoin = require("url-join");

var LibraryContract = require("../contracts/BaseLibrary");

var ContentContract = require("../contracts/BaseContent");

var _require = require("../Validation"),
    ValidateLibrary = _require.ValidateLibrary,
    ValidateObject = _require.ValidateObject,
    ValidateVersion = _require.ValidateVersion,
    ValidateWriteToken = _require.ValidateWriteToken,
    ValidateParameters = _require.ValidateParameters;
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


exports.CreateContentType = function _callee(_ref) {
  var name, _ref$metadata, metadata, bitcode, _ref2, contractAddress, objectId, path, createResponse, uploadResponse;

  return _regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          name = _ref.name, _ref$metadata = _ref.metadata, metadata = _ref$metadata === void 0 ? {} : _ref$metadata, bitcode = _ref.bitcode;
          this.Log("Creating content type: ".concat(name));
          metadata.name = name;
          metadata["public"] = _objectSpread({
            name: name
          }, metadata["public"] || {});
          _context.next = 6;
          return _regeneratorRuntime.awrap(this.authClient.CreateContentType());

        case 6:
          _ref2 = _context.sent;
          contractAddress = _ref2.contractAddress;
          objectId = this.utils.AddressToObjectId(contractAddress);
          path = UrlJoin("qlibs", this.contentSpaceLibraryId, "qid", objectId);
          this.Log("Created type: ".concat(contractAddress, " ").concat(objectId));
          /* Create object, upload bitcode and finalize */

          _context.t0 = _regeneratorRuntime;
          _context.t1 = this.utils;
          _context.t2 = this.HttpClient;
          _context.next = 16;
          return _regeneratorRuntime.awrap(this.authClient.AuthorizationHeader({
            libraryId: this.contentSpaceLibraryId,
            objectId: objectId,
            update: true
          }));

        case 16:
          _context.t3 = _context.sent;
          _context.t4 = path;
          _context.t5 = {
            headers: _context.t3,
            method: "POST",
            path: _context.t4,
            failover: false
          };
          _context.t6 = _context.t2.Request.call(_context.t2, _context.t5);
          _context.t7 = _context.t1.ResponseToJson.call(_context.t1, _context.t6);
          _context.next = 23;
          return _context.t0.awrap.call(_context.t0, _context.t7);

        case 23:
          createResponse = _context.sent;
          _context.next = 26;
          return _regeneratorRuntime.awrap(this.ReplaceMetadata({
            libraryId: this.contentSpaceLibraryId,
            objectId: objectId,
            writeToken: createResponse.write_token,
            metadata: metadata
          }));

        case 26:
          if (!bitcode) {
            _context.next = 32;
            break;
          }

          _context.next = 29;
          return _regeneratorRuntime.awrap(this.UploadPart({
            libraryId: this.contentSpaceLibraryId,
            objectId: objectId,
            writeToken: createResponse.write_token,
            data: bitcode,
            encrypted: false
          }));

        case 29:
          uploadResponse = _context.sent;
          _context.next = 32;
          return _regeneratorRuntime.awrap(this.ReplaceMetadata({
            libraryId: this.contentSpaceLibraryId,
            objectId: objectId,
            writeToken: createResponse.write_token,
            metadataSubtree: "bitcode_part",
            metadata: uploadResponse.part.hash
          }));

        case 32:
          _context.next = 34;
          return _regeneratorRuntime.awrap(this.FinalizeContentObject({
            libraryId: this.contentSpaceLibraryId,
            objectId: objectId,
            writeToken: createResponse.write_token
          }));

        case 34:
          return _context.abrupt("return", objectId);

        case 35:
        case "end":
          return _context.stop();
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
 * @param {Object=} metadata - Metadata of library object
 * @param {string=} kmsId - ID of the KMS to use for content in this library. If not specified,
 * the default KMS will be used.
 *
 * @returns {Promise<string>} - Library ID of created library
 */


exports.CreateContentLibrary = function _callee2(_ref3) {
  var name, description, image, _ref3$metadata, metadata, kmsId, _ref4, contractAddress, libraryId, objectId, editResponse;

  return _regeneratorRuntime.async(function _callee2$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          name = _ref3.name, description = _ref3.description, image = _ref3.image, _ref3$metadata = _ref3.metadata, metadata = _ref3$metadata === void 0 ? {} : _ref3$metadata, kmsId = _ref3.kmsId;

          if (kmsId) {
            _context2.next = 9;
            break;
          }

          _context2.t0 = "ikms";
          _context2.t1 = this.utils;
          _context2.next = 6;
          return _regeneratorRuntime.awrap(this.DefaultKMSAddress());

        case 6:
          _context2.t2 = _context2.sent;
          _context2.t3 = _context2.t1.AddressToHash.call(_context2.t1, _context2.t2);
          kmsId = _context2.t0.concat.call(_context2.t0, _context2.t3);

        case 9:
          this.Log("Creating content library");
          this.Log("KMS ID: ".concat(kmsId));
          _context2.next = 13;
          return _regeneratorRuntime.awrap(this.authClient.CreateContentLibrary({
            kmsId: kmsId
          }));

        case 13:
          _ref4 = _context2.sent;
          contractAddress = _ref4.contractAddress;
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
          _context2.next = 22;
          return _regeneratorRuntime.awrap(this.EditContentObject({
            libraryId: libraryId,
            objectId: objectId,
            options: {
              type: "library"
            }
          }));

        case 22:
          editResponse = _context2.sent;
          _context2.next = 25;
          return _regeneratorRuntime.awrap(this.ReplaceMetadata({
            libraryId: libraryId,
            objectId: objectId,
            metadata: metadata,
            writeToken: editResponse.write_token
          }));

        case 25:
          _context2.next = 27;
          return _regeneratorRuntime.awrap(this.FinalizeContentObject({
            libraryId: libraryId,
            objectId: objectId,
            writeToken: editResponse.write_token
          }));

        case 27:
          if (!image) {
            _context2.next = 30;
            break;
          }

          _context2.next = 30;
          return _regeneratorRuntime.awrap(this.SetContentLibraryImage({
            libraryId: libraryId,
            image: image
          }));

        case 30:
          this.Log("Library ".concat(libraryId, " created"));
          return _context2.abrupt("return", libraryId);

        case 32:
        case "end":
          return _context2.stop();
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
 * @param {Blob | ArrayBuffer | Buffer} image - Image to upload
 */


exports.SetContentLibraryImage = function _callee3(_ref5) {
  var libraryId, image, objectId;
  return _regeneratorRuntime.async(function _callee3$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          libraryId = _ref5.libraryId, image = _ref5.image;
          ValidateLibrary(libraryId);
          objectId = libraryId.replace("ilib", "iq__");
          return _context3.abrupt("return", this.SetContentObjectImage({
            libraryId: libraryId,
            objectId: objectId,
            image: image
          }));

        case 4:
        case "end":
          return _context3.stop();
      }
    }
  }, null, this);
};
/**
 * Set the image associated with this object
 *
 * Note: The content type of the object must support /rep/image
 *
 * @methodGroup Content Objects
 * @namedParams
 * @param {string} libraryId - ID of the library
 * @param {string} objectId - ID of the object
 * @param {Blob | ArrayBuffer | Buffer} image - Image to upload
 */


exports.SetContentObjectImage = function _callee4(_ref6) {
  var libraryId, objectId, image, editResponse, uploadResponse;
  return _regeneratorRuntime.async(function _callee4$(_context4) {
    while (1) {
      switch (_context4.prev = _context4.next) {
        case 0:
          libraryId = _ref6.libraryId, objectId = _ref6.objectId, image = _ref6.image;
          ValidateParameters({
            libraryId: libraryId,
            objectId: objectId
          });
          _context4.next = 4;
          return _regeneratorRuntime.awrap(this.EditContentObject({
            libraryId: libraryId,
            objectId: objectId
          }));

        case 4:
          editResponse = _context4.sent;
          _context4.next = 7;
          return _regeneratorRuntime.awrap(this.UploadPart({
            libraryId: libraryId,
            objectId: objectId,
            writeToken: editResponse.write_token,
            data: image,
            encrypted: false
          }));

        case 7:
          uploadResponse = _context4.sent;
          _context4.next = 10;
          return _regeneratorRuntime.awrap(this.MergeMetadata({
            libraryId: libraryId,
            objectId: objectId,
            writeToken: editResponse.write_token,
            metadata: {
              "image": uploadResponse.part.hash
            }
          }));

        case 10:
          _context4.next = 12;
          return _regeneratorRuntime.awrap(this.MergeMetadata({
            libraryId: libraryId,
            objectId: objectId,
            writeToken: editResponse.write_token,
            metadataSubtree: "public",
            metadata: {
              "image": uploadResponse.part.hash
            }
          }));

        case 12:
          _context4.next = 14;
          return _regeneratorRuntime.awrap(this.FinalizeContentObject({
            libraryId: libraryId,
            objectId: objectId,
            writeToken: editResponse.write_token
          }));

        case 14:
        case "end":
          return _context4.stop();
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


exports.DeleteContentLibrary = function _callee5(_ref7) {
  var libraryId, path, authorizationHeader;
  return _regeneratorRuntime.async(function _callee5$(_context5) {
    while (1) {
      switch (_context5.prev = _context5.next) {
        case 0:
          libraryId = _ref7.libraryId;
          ValidateLibrary(libraryId);
          path = UrlJoin("qlibs", libraryId);
          _context5.next = 5;
          return _regeneratorRuntime.awrap(this.authClient.AuthorizationHeader({
            libraryId: libraryId,
            update: true
          }));

        case 5:
          authorizationHeader = _context5.sent;
          _context5.next = 8;
          return _regeneratorRuntime.awrap(this.CallContractMethodAndWait({
            contractAddress: this.utils.HashToAddress(libraryId),
            abi: LibraryContract.abi,
            methodName: "kill",
            methodArgs: []
          }));

        case 8:
          _context5.next = 10;
          return _regeneratorRuntime.awrap(this.HttpClient.Request({
            headers: authorizationHeader,
            method: "DELETE",
            path: path
          }));

        case 10:
        case "end":
          return _context5.stop();
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


exports.AddLibraryContentType = function _callee6(_ref8) {
  var libraryId, typeId, typeName, typeHash, customContractAddress, type, typeAddress, event;
  return _regeneratorRuntime.async(function _callee6$(_context6) {
    while (1) {
      switch (_context6.prev = _context6.next) {
        case 0:
          libraryId = _ref8.libraryId, typeId = _ref8.typeId, typeName = _ref8.typeName, typeHash = _ref8.typeHash, customContractAddress = _ref8.customContractAddress;
          ValidateLibrary(libraryId);
          this.Log("Adding library content type to ".concat(libraryId, ": ").concat(typeId || typeHash || typeName));

          if (typeHash) {
            typeId = this.utils.DecodeVersionHash(typeHash).objectId;
          }

          if (typeId) {
            _context6.next = 9;
            break;
          }

          _context6.next = 7;
          return _regeneratorRuntime.awrap(this.ContentType({
            name: typeName
          }));

        case 7:
          type = _context6.sent;
          typeId = type.id;

        case 9:
          this.Log("Type ID: ".concat(typeId));
          typeAddress = this.utils.HashToAddress(typeId);
          customContractAddress = customContractAddress || this.utils.nullAddress;
          _context6.next = 14;
          return _regeneratorRuntime.awrap(this.ethClient.CallContractMethodAndWait({
            contractAddress: this.utils.HashToAddress(libraryId),
            abi: LibraryContract.abi,
            methodName: "addContentType",
            methodArgs: [typeAddress, customContractAddress],
            signer: this.signer
          }));

        case 14:
          event = _context6.sent;
          return _context6.abrupt("return", event.transactionHash);

        case 16:
        case "end":
          return _context6.stop();
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


exports.RemoveLibraryContentType = function _callee7(_ref9) {
  var libraryId, typeId, typeName, typeHash, type, typeAddress, event;
  return _regeneratorRuntime.async(function _callee7$(_context7) {
    while (1) {
      switch (_context7.prev = _context7.next) {
        case 0:
          libraryId = _ref9.libraryId, typeId = _ref9.typeId, typeName = _ref9.typeName, typeHash = _ref9.typeHash;
          ValidateLibrary(libraryId);
          this.Log("Removing library content type from ".concat(libraryId, ": ").concat(typeId || typeHash || typeName));

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
          _context7.next = 13;
          return _regeneratorRuntime.awrap(this.ethClient.CallContractMethodAndWait({
            contractAddress: this.utils.HashToAddress(libraryId),
            abi: LibraryContract.abi,
            methodName: "removeContentType",
            methodArgs: [typeAddress],
            signer: this.signer
          }));

        case 13:
          event = _context7.sent;
          return _context7.abrupt("return", event.transactionHash);

        case 15:
        case "end":
          return _context7.stop();
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


exports.CreateContentObject = function _callee8(_ref10) {
  var libraryId, objectId, _ref10$options, options, typeId, type, _ref11, contractAddress, path;

  return _regeneratorRuntime.async(function _callee8$(_context8) {
    while (1) {
      switch (_context8.prev = _context8.next) {
        case 0:
          libraryId = _ref10.libraryId, objectId = _ref10.objectId, _ref10$options = _ref10.options, options = _ref10$options === void 0 ? {} : _ref10$options;
          ValidateLibrary(libraryId);

          if (objectId) {
            ValidateObject(objectId);
          }

          this.Log("Creating content object: ".concat(libraryId, " ").concat(objectId || "")); // Look up content type, if specified

          if (!options.type) {
            _context8.next = 26;
            break;
          }

          this.Log("Type specified: ".concat(options.type));
          type = options.type;

          if (!type.startsWith("hq__")) {
            _context8.next = 13;
            break;
          }

          _context8.next = 10;
          return _regeneratorRuntime.awrap(this.ContentType({
            versionHash: type
          }));

        case 10:
          type = _context8.sent;
          _context8.next = 22;
          break;

        case 13:
          if (!type.startsWith("iq__")) {
            _context8.next = 19;
            break;
          }

          _context8.next = 16;
          return _regeneratorRuntime.awrap(this.ContentType({
            typeId: type
          }));

        case 16:
          type = _context8.sent;
          _context8.next = 22;
          break;

        case 19:
          _context8.next = 21;
          return _regeneratorRuntime.awrap(this.ContentType({
            name: type
          }));

        case 21:
          type = _context8.sent;

        case 22:
          if (type) {
            _context8.next = 24;
            break;
          }

          throw Error("Unable to find content type '".concat(options.type, "'"));

        case 24:
          typeId = type.id;
          options.type = type.hash;

        case 26:
          if (objectId) {
            _context8.next = 36;
            break;
          }

          this.Log("Deploying contract...");
          _context8.next = 30;
          return _regeneratorRuntime.awrap(this.authClient.CreateContentObject({
            libraryId: libraryId,
            typeId: typeId
          }));

        case 30:
          _ref11 = _context8.sent;
          contractAddress = _ref11.contractAddress;
          objectId = this.utils.AddressToObjectId(contractAddress);
          this.Log("Contract deployed: ".concat(contractAddress, " ").concat(objectId));
          _context8.next = 43;
          break;

        case 36:
          _context8.t0 = this;
          _context8.t1 = "Contract already deployed for contract type: ";
          _context8.next = 40;
          return _regeneratorRuntime.awrap(this.AccessType({
            id: objectId
          }));

        case 40:
          _context8.t2 = _context8.sent;
          _context8.t3 = _context8.t1.concat.call(_context8.t1, _context8.t2);

          _context8.t0.Log.call(_context8.t0, _context8.t3);

        case 43:
          if (!options.visibility) {
            _context8.next = 47;
            break;
          }

          this.Log("Setting visibility to ".concat(options.visibility));
          _context8.next = 47;
          return _regeneratorRuntime.awrap(this.CallContractMethod({
            abi: ContentContract.abi,
            contractAddress: this.utils.HashToAddress(objectId),
            methodName: "setVisibility",
            methodArgs: [options.visibility]
          }));

        case 47:
          path = UrlJoin("qid", objectId);
          _context8.t4 = _regeneratorRuntime;
          _context8.t5 = this.utils;
          _context8.t6 = this.HttpClient;
          _context8.next = 53;
          return _regeneratorRuntime.awrap(this.authClient.AuthorizationHeader({
            libraryId: libraryId,
            objectId: objectId,
            update: true
          }));

        case 53:
          _context8.t7 = _context8.sent;
          _context8.t8 = path;
          _context8.t9 = options;
          _context8.t10 = {
            headers: _context8.t7,
            method: "POST",
            path: _context8.t8,
            body: _context8.t9,
            failover: false
          };
          _context8.t11 = _context8.t6.Request.call(_context8.t6, _context8.t10);
          _context8.t12 = _context8.t5.ResponseToJson.call(_context8.t5, _context8.t11);
          _context8.next = 61;
          return _context8.t4.awrap.call(_context8.t4, _context8.t12);

        case 61:
          return _context8.abrupt("return", _context8.sent);

        case 62:
        case "end":
          return _context8.stop();
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


exports.CopyContentObject = function _callee9(_ref12) {
  var libraryId, originalVersionHash, _ref12$options, options;

  return _regeneratorRuntime.async(function _callee9$(_context9) {
    while (1) {
      switch (_context9.prev = _context9.next) {
        case 0:
          libraryId = _ref12.libraryId, originalVersionHash = _ref12.originalVersionHash, _ref12$options = _ref12.options, options = _ref12$options === void 0 ? {} : _ref12$options;
          ValidateLibrary(libraryId);
          ValidateVersion(originalVersionHash);
          options.copy_from = originalVersionHash;
          _context9.next = 6;
          return _regeneratorRuntime.awrap(this.CreateContentObject({
            libraryId: libraryId,
            options: options
          }));

        case 6:
          return _context9.abrupt("return", _context9.sent);

        case 7:
        case "end":
          return _context9.stop();
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


exports.EditContentObject = function _callee10(_ref13) {
  var libraryId, objectId, _ref13$options, options, path;

  return _regeneratorRuntime.async(function _callee10$(_context10) {
    while (1) {
      switch (_context10.prev = _context10.next) {
        case 0:
          libraryId = _ref13.libraryId, objectId = _ref13.objectId, _ref13$options = _ref13.options, options = _ref13$options === void 0 ? {} : _ref13$options;
          ValidateParameters({
            libraryId: libraryId,
            objectId: objectId
          });
          this.Log("Opening content draft: ".concat(libraryId, " ").concat(objectId));

          if (!options.type) {
            _context10.next = 19;
            break;
          }

          if (!options.type.startsWith("hq__")) {
            _context10.next = 10;
            break;
          }

          _context10.next = 7;
          return _regeneratorRuntime.awrap(this.ContentType({
            versionHash: options.type
          }));

        case 7:
          options.type = _context10.sent.hash;
          _context10.next = 19;
          break;

        case 10:
          if (!options.type.startsWith("iq__")) {
            _context10.next = 16;
            break;
          }

          _context10.next = 13;
          return _regeneratorRuntime.awrap(this.ContentType({
            typeId: options.type
          }));

        case 13:
          options.type = _context10.sent.hash;
          _context10.next = 19;
          break;

        case 16:
          _context10.next = 18;
          return _regeneratorRuntime.awrap(this.ContentType({
            name: options.type
          }));

        case 18:
          options.type = _context10.sent.hash;

        case 19:
          path = UrlJoin("qid", objectId);
          _context10.t0 = this.utils;
          _context10.t1 = this.HttpClient;
          _context10.next = 24;
          return _regeneratorRuntime.awrap(this.authClient.AuthorizationHeader({
            libraryId: libraryId,
            objectId: objectId,
            update: true
          }));

        case 24:
          _context10.t2 = _context10.sent;
          _context10.t3 = path;
          _context10.t4 = options;
          _context10.t5 = {
            headers: _context10.t2,
            method: "POST",
            path: _context10.t3,
            body: _context10.t4,
            failover: false
          };
          _context10.t6 = _context10.t1.Request.call(_context10.t1, _context10.t5);
          return _context10.abrupt("return", _context10.t0.ResponseToJson.call(_context10.t0, _context10.t6));

        case 30:
        case "end":
          return _context10.stop();
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


exports.FinalizeContentObject = function _callee11(_ref14) {
  var libraryId, objectId, writeToken, _ref14$publish, publish, _ref14$awaitCommitCon, awaitCommitConfirmation, path, finalizeResponse;

  return _regeneratorRuntime.async(function _callee11$(_context11) {
    while (1) {
      switch (_context11.prev = _context11.next) {
        case 0:
          libraryId = _ref14.libraryId, objectId = _ref14.objectId, writeToken = _ref14.writeToken, _ref14$publish = _ref14.publish, publish = _ref14$publish === void 0 ? true : _ref14$publish, _ref14$awaitCommitCon = _ref14.awaitCommitConfirmation, awaitCommitConfirmation = _ref14$awaitCommitCon === void 0 ? true : _ref14$awaitCommitCon;
          ValidateParameters({
            libraryId: libraryId,
            objectId: objectId
          });
          ValidateWriteToken(writeToken);
          this.Log("Finalizing content draft: ".concat(libraryId, " ").concat(objectId, " ").concat(writeToken));
          path = UrlJoin("q", writeToken);
          _context11.t0 = _regeneratorRuntime;
          _context11.t1 = this.utils;
          _context11.t2 = this.HttpClient;
          _context11.next = 10;
          return _regeneratorRuntime.awrap(this.authClient.AuthorizationHeader({
            libraryId: libraryId,
            objectId: objectId,
            update: true
          }));

        case 10:
          _context11.t3 = _context11.sent;
          _context11.t4 = path;
          _context11.t5 = {
            headers: _context11.t3,
            method: "POST",
            path: _context11.t4,
            failover: false
          };
          _context11.t6 = _context11.t2.Request.call(_context11.t2, _context11.t5);
          _context11.t7 = _context11.t1.ResponseToJson.call(_context11.t1, _context11.t6);
          _context11.next = 17;
          return _context11.t0.awrap.call(_context11.t0, _context11.t7);

        case 17:
          finalizeResponse = _context11.sent;
          this.Log("Finalized: ".concat(finalizeResponse.hash));

          if (!publish) {
            _context11.next = 22;
            break;
          }

          _context11.next = 22;
          return _regeneratorRuntime.awrap(this.PublishContentVersion({
            objectId: objectId,
            versionHash: finalizeResponse.hash,
            awaitCommitConfirmation: awaitCommitConfirmation
          }));

        case 22:
          // Invalidate cached content type, if this is one.
          delete this.contentTypes[objectId];
          return _context11.abrupt("return", finalizeResponse);

        case 24:
        case "end":
          return _context11.stop();
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


exports.PublishContentVersion = function _callee12(_ref15) {
  var objectId, versionHash, _ref15$awaitCommitCon, awaitCommitConfirmation;

  return _regeneratorRuntime.async(function _callee12$(_context12) {
    while (1) {
      switch (_context12.prev = _context12.next) {
        case 0:
          objectId = _ref15.objectId, versionHash = _ref15.versionHash, _ref15$awaitCommitCon = _ref15.awaitCommitConfirmation, awaitCommitConfirmation = _ref15$awaitCommitCon === void 0 ? true : _ref15$awaitCommitCon;
          versionHash ? ValidateVersion(versionHash) : ValidateObject(objectId);
          this.Log("Publishing: ".concat(objectId || versionHash));

          if (versionHash) {
            objectId = this.utils.DecodeVersionHash(versionHash).objectId;
          }

          _context12.next = 6;
          return _regeneratorRuntime.awrap(this.ethClient.CommitContent({
            contentObjectAddress: this.utils.HashToAddress(objectId),
            versionHash: versionHash,
            signer: this.signer
          }));

        case 6:
          if (!awaitCommitConfirmation) {
            _context12.next = 10;
            break;
          }

          this.Log("Awaiting commit confirmation...");
          _context12.next = 10;
          return _regeneratorRuntime.awrap(this.ethClient.AwaitEvent({
            contractAddress: this.utils.HashToAddress(objectId),
            abi: ContentContract.abi,
            eventName: "VersionConfirm",
            signer: this.signer
          }));

        case 10:
        case "end":
          return _context12.stop();
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


exports.DeleteContentVersion = function _callee13(_ref16) {
  var versionHash, _this$utils$DecodeVer, objectId;

  return _regeneratorRuntime.async(function _callee13$(_context13) {
    while (1) {
      switch (_context13.prev = _context13.next) {
        case 0:
          versionHash = _ref16.versionHash;
          ValidateVersion(versionHash);
          this.Log("Deleting content version: ".concat(versionHash));
          _this$utils$DecodeVer = this.utils.DecodeVersionHash(versionHash), objectId = _this$utils$DecodeVer.objectId;
          _context13.next = 6;
          return _regeneratorRuntime.awrap(this.CallContractMethodAndWait({
            contractAddress: this.utils.HashToAddress(objectId),
            abi: ContentContract.abi,
            methodName: "deleteVersion",
            methodArgs: [versionHash]
          }));

        case 6:
        case "end":
          return _context13.stop();
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


exports.DeleteContentObject = function _callee14(_ref17) {
  var libraryId, objectId;
  return _regeneratorRuntime.async(function _callee14$(_context14) {
    while (1) {
      switch (_context14.prev = _context14.next) {
        case 0:
          libraryId = _ref17.libraryId, objectId = _ref17.objectId;
          ValidateParameters({
            libraryId: libraryId,
            objectId: objectId
          });
          this.Log("Deleting content version: ".concat(libraryId, " ").concat(objectId));
          _context14.next = 5;
          return _regeneratorRuntime.awrap(this.CallContractMethodAndWait({
            contractAddress: this.utils.HashToAddress(libraryId),
            abi: LibraryContract.abi,
            methodName: "deleteContent",
            methodArgs: [this.utils.HashToAddress(objectId)]
          }));

        case 5:
        case "end":
          return _context14.stop();
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


exports.MergeMetadata = function _callee15(_ref18) {
  var libraryId, objectId, writeToken, _ref18$metadataSubtre, metadataSubtree, _ref18$metadata, metadata, path;

  return _regeneratorRuntime.async(function _callee15$(_context15) {
    while (1) {
      switch (_context15.prev = _context15.next) {
        case 0:
          libraryId = _ref18.libraryId, objectId = _ref18.objectId, writeToken = _ref18.writeToken, _ref18$metadataSubtre = _ref18.metadataSubtree, metadataSubtree = _ref18$metadataSubtre === void 0 ? "/" : _ref18$metadataSubtre, _ref18$metadata = _ref18.metadata, metadata = _ref18$metadata === void 0 ? {} : _ref18$metadata;
          ValidateParameters({
            libraryId: libraryId,
            objectId: objectId
          });
          ValidateWriteToken(writeToken);
          this.Log("Merging metadata: ".concat(libraryId, " ").concat(objectId, " ").concat(writeToken, "\n      Subtree: ").concat(metadataSubtree));
          this.Log(metadata);
          path = UrlJoin("q", writeToken, "meta", metadataSubtree);
          _context15.t0 = _regeneratorRuntime;
          _context15.t1 = this.HttpClient;
          _context15.next = 10;
          return _regeneratorRuntime.awrap(this.authClient.AuthorizationHeader({
            libraryId: libraryId,
            objectId: objectId,
            update: true
          }));

        case 10:
          _context15.t2 = _context15.sent;
          _context15.t3 = path;
          _context15.t4 = metadata;
          _context15.t5 = {
            headers: _context15.t2,
            method: "POST",
            path: _context15.t3,
            body: _context15.t4,
            failover: false
          };
          _context15.t6 = _context15.t1.Request.call(_context15.t1, _context15.t5);
          _context15.next = 17;
          return _context15.t0.awrap.call(_context15.t0, _context15.t6);

        case 17:
        case "end":
          return _context15.stop();
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


exports.ReplaceMetadata = function _callee16(_ref19) {
  var libraryId, objectId, writeToken, _ref19$metadataSubtre, metadataSubtree, _ref19$metadata, metadata, path;

  return _regeneratorRuntime.async(function _callee16$(_context16) {
    while (1) {
      switch (_context16.prev = _context16.next) {
        case 0:
          libraryId = _ref19.libraryId, objectId = _ref19.objectId, writeToken = _ref19.writeToken, _ref19$metadataSubtre = _ref19.metadataSubtree, metadataSubtree = _ref19$metadataSubtre === void 0 ? "/" : _ref19$metadataSubtre, _ref19$metadata = _ref19.metadata, metadata = _ref19$metadata === void 0 ? {} : _ref19$metadata;
          ValidateParameters({
            libraryId: libraryId,
            objectId: objectId
          });
          ValidateWriteToken(writeToken);
          this.Log("Replacing metadata: ".concat(libraryId, " ").concat(objectId, " ").concat(writeToken, "\n      Subtree: ").concat(metadataSubtree));
          this.Log(metadata);
          path = UrlJoin("q", writeToken, "meta", metadataSubtree);
          _context16.t0 = _regeneratorRuntime;
          _context16.t1 = this.HttpClient;
          _context16.next = 10;
          return _regeneratorRuntime.awrap(this.authClient.AuthorizationHeader({
            libraryId: libraryId,
            objectId: objectId,
            update: true
          }));

        case 10:
          _context16.t2 = _context16.sent;
          _context16.t3 = path;
          _context16.t4 = metadata;
          _context16.t5 = {
            headers: _context16.t2,
            method: "PUT",
            path: _context16.t3,
            body: _context16.t4,
            failover: false
          };
          _context16.t6 = _context16.t1.Request.call(_context16.t1, _context16.t5);
          _context16.next = 17;
          return _context16.t0.awrap.call(_context16.t0, _context16.t6);

        case 17:
        case "end":
          return _context16.stop();
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


exports.DeleteMetadata = function _callee17(_ref20) {
  var libraryId, objectId, writeToken, _ref20$metadataSubtre, metadataSubtree, path;

  return _regeneratorRuntime.async(function _callee17$(_context17) {
    while (1) {
      switch (_context17.prev = _context17.next) {
        case 0:
          libraryId = _ref20.libraryId, objectId = _ref20.objectId, writeToken = _ref20.writeToken, _ref20$metadataSubtre = _ref20.metadataSubtree, metadataSubtree = _ref20$metadataSubtre === void 0 ? "/" : _ref20$metadataSubtre;
          ValidateParameters({
            libraryId: libraryId,
            objectId: objectId
          });
          ValidateWriteToken(writeToken);
          this.Log("Deleting metadata: ".concat(libraryId, " ").concat(objectId, " ").concat(writeToken, "\n      Subtree: ").concat(metadataSubtree));
          this.Log("Subtree: ".concat(metadataSubtree));
          path = UrlJoin("q", writeToken, "meta", metadataSubtree);
          _context17.t0 = _regeneratorRuntime;
          _context17.t1 = this.HttpClient;
          _context17.next = 10;
          return _regeneratorRuntime.awrap(this.authClient.AuthorizationHeader({
            libraryId: libraryId,
            objectId: objectId,
            update: true
          }));

        case 10:
          _context17.t2 = _context17.sent;
          _context17.t3 = path;
          _context17.t4 = {
            headers: _context17.t2,
            method: "DELETE",
            path: _context17.t3,
            failover: false
          };
          _context17.t5 = _context17.t1.Request.call(_context17.t1, _context17.t4);
          _context17.next = 16;
          return _context17.t0.awrap.call(_context17.t0, _context17.t5);

        case 16:
        case "end":
          return _context17.stop();
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


exports.SetAccessCharge = function _callee18(_ref21) {
  var objectId, accessCharge;
  return _regeneratorRuntime.async(function _callee18$(_context18) {
    while (1) {
      switch (_context18.prev = _context18.next) {
        case 0:
          objectId = _ref21.objectId, accessCharge = _ref21.accessCharge;
          ValidateObject(objectId);
          this.Log("Setting access charge: ".concat(objectId, " ").concat(accessCharge));
          _context18.next = 5;
          return _regeneratorRuntime.awrap(this.ethClient.CallContractMethodAndWait({
            contractAddress: this.utils.HashToAddress(objectId),
            abi: ContentContract.abi,
            methodName: "setAccessCharge",
            methodArgs: [this.utils.EtherToWei(accessCharge).toString()],
            signer: this.signer
          }));

        case 5:
        case "end":
          return _context18.stop();
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


exports.UpdateContentObjectGraph = function _callee20(_ref22) {
  var _this = this;

  var libraryId, objectId, versionHash, callback, total, completed, _loop, _ret;

  return _regeneratorRuntime.async(function _callee20$(_context21) {
    while (1) {
      switch (_context21.prev = _context21.next) {
        case 0:
          libraryId = _ref22.libraryId, objectId = _ref22.objectId, versionHash = _ref22.versionHash, callback = _ref22.callback;
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
            var graph, currentHash, links, details, name, currentLibraryId, currentObjectId, _ref23, write_token, _ref25, hash;

            return _regeneratorRuntime.async(function _loop$(_context20) {
              while (1) {
                switch (_context20.prev = _context20.next) {
                  case 0:
                    _context20.next = 2;
                    return _regeneratorRuntime.awrap(_this.ContentObjectGraph({
                      libraryId: libraryId,
                      objectId: objectId,
                      versionHash: versionHash,
                      autoUpdate: true,
                      select: ["name", "public/name", "public/asset_metadata/display_title"]
                    }));

                  case 2:
                    graph = _context20.sent;

                    if (!(Object.keys(graph.auto_updates).length === 0)) {
                      _context20.next = 6;
                      break;
                    }

                    _this.Log("No more updates required");

                    return _context20.abrupt("return", {
                      v: void 0
                    });

                  case 6:
                    if (!total) {
                      total = graph.auto_updates.order.length;
                    }

                    currentHash = graph.auto_updates.order[0];
                    links = graph.auto_updates.links[currentHash];
                    details = graph.details[currentHash].meta;
                    name = details["public"] && details["public"].asset_metadata && details["public"].asset_metadata.display_title || details["public"] && details["public"].name || details.name || versionHash || objectId;
                    _context20.next = 13;
                    return _regeneratorRuntime.awrap(_this.ContentObjectLibraryId({
                      versionHash: currentHash
                    }));

                  case 13:
                    currentLibraryId = _context20.sent;
                    currentObjectId = _this.utils.DecodeVersionHash(currentHash).objectId;

                    if (callback) {
                      callback({
                        completed: completed,
                        total: total,
                        action: "Updating ".concat(name, " (").concat(currentObjectId, ")...")
                      });
                    }

                    _this.Log("Updating links for ".concat(name, " (").concat(currentObjectId, " / ").concat(currentHash, ")"));

                    _context20.next = 19;
                    return _regeneratorRuntime.awrap(_this.EditContentObject({
                      libraryId: currentLibraryId,
                      objectId: currentObjectId
                    }));

                  case 19:
                    _ref23 = _context20.sent;
                    write_token = _ref23.write_token;
                    _context20.next = 23;
                    return _regeneratorRuntime.awrap(Promise.all(links.map(function _callee19(_ref24) {
                      var path, updated;
                      return _regeneratorRuntime.async(function _callee19$(_context19) {
                        while (1) {
                          switch (_context19.prev = _context19.next) {
                            case 0:
                              path = _ref24.path, updated = _ref24.updated;
                              _context19.next = 3;
                              return _regeneratorRuntime.awrap(_this.ReplaceMetadata({
                                libraryId: currentLibraryId,
                                objectId: currentObjectId,
                                writeToken: write_token,
                                metadataSubtree: path,
                                metadata: updated
                              }));

                            case 3:
                            case "end":
                              return _context19.stop();
                          }
                        }
                      });
                    })));

                  case 23:
                    _context20.next = 25;
                    return _regeneratorRuntime.awrap(_this.FinalizeContentObject({
                      libraryId: currentLibraryId,
                      objectId: currentObjectId,
                      writeToken: write_token
                    }));

                  case 25:
                    _ref25 = _context20.sent;
                    hash = _ref25.hash;

                    // If root object was specified by hash and updated, update hash
                    if (currentHash === versionHash) {
                      versionHash = hash;
                    }

                    completed += 1;

                  case 29:
                  case "end":
                    return _context20.stop();
                }
              }
            });
          };

        case 6:
          if (!1) {
            _context21.next = 14;
            break;
          }

          _context21.next = 9;
          return _regeneratorRuntime.awrap(_loop());

        case 9:
          _ret = _context21.sent;

          if (!(_typeof(_ret) === "object")) {
            _context21.next = 12;
            break;
          }

          return _context21.abrupt("return", _ret.v);

        case 12:
          _context21.next = 6;
          break;

        case 14:
        case "end":
          return _context21.stop();
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


exports.CreateLinks = function _callee21(_ref26) {
  var libraryId, objectId, writeToken, _ref26$links, links, i, info, path, type, target, link;

  return _regeneratorRuntime.async(function _callee21$(_context22) {
    while (1) {
      switch (_context22.prev = _context22.next) {
        case 0:
          libraryId = _ref26.libraryId, objectId = _ref26.objectId, writeToken = _ref26.writeToken, _ref26$links = _ref26.links, links = _ref26$links === void 0 ? [] : _ref26$links;
          ValidateParameters({
            libraryId: libraryId,
            objectId: objectId
          });
          ValidateWriteToken(writeToken);
          i = 0;

        case 4:
          if (!(i < links.length)) {
            _context22.next = 18;
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

          _context22.next = 15;
          return _regeneratorRuntime.awrap(this.ReplaceMetadata({
            libraryId: libraryId,
            objectId: objectId,
            writeToken: writeToken,
            metadataSubtree: path,
            metadata: link
          }));

        case 15:
          i++;
          _context22.next = 4;
          break;

        case 18:
        case "end":
          return _context22.stop();
      }
    }
  }, null, this);
};