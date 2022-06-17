var _toConsumableArray = require("@babel/runtime/helpers/toConsumableArray");

var _regeneratorRuntime = require("@babel/runtime/regenerator");

var _defineProperty = require("@babel/runtime/helpers/defineProperty");

var _asyncToGenerator = require("@babel/runtime/helpers/asyncToGenerator");

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }

/**
 * Methods for ABR video creation and management
 *
 * For more information on how to publish ABR content see <a href="./abr/index.html">this detailed guide</a>
 *
 * @module ElvClient/ABRPublishing
 */
var R = require("ramda");

var UrlJoin = require("url-join");

var HttpClient = require("../HttpClient");

var _require = require("../Validation"),
    ValidateLibrary = _require.ValidateLibrary,
    ValidateVersion = _require.ValidateVersion,
    ValidateParameters = _require.ValidateParameters;
/**
 * Create a master media content object with the given files.
 *
 * - If uploading using local files, use fileInfo parameter (see UploadFiles for format)
 * - If uploading from S3 bucket, use access, filePath and copy, parameters (see UploadFilesFromS3 method)
 *
 * @methodGroup ABR Publishing
 * @namedParams
 * @param {string} libraryId - ID of the library
 * @param {string=} type - ID or version hash of the content type for this master
 * @param {string} name - Name of the content
 * @param {string=} description - Description of the content
 * @param {string} contentTypeName - Name of the content type to use
 * @param {Object=} metadata - Additional metadata for the content object
 * @param {Array<Object>=} fileInfo - Files to upload (See UploadFiles/UploadFilesFromS3 method)
 * @param {boolean=} encrypt=false - (Local files only) - If specified, files will be encrypted
 * @param {boolean=} copy=false - (S3) If specified, files will be copied from S3
 * @param {function=} callback - Progress callback for file upload (See UploadFiles/UploadFilesFromS3 method)
 * @param {Array<Object>=} access=[] - Array of cloud credentials, along with path matching regex strings - Required if any files in the masters are cloud references (currently only AWS S3 is supported)
 * - If this parameter is non-empty, all items in fileInfo are assumed to be items in cloud storage
 * - Format: [
 * -           {
 * -             path_matchers: ["FILE_PATH_MATCH_REGEX_1", "FILE_PATH_MATCH_REGEX_2" ...],
 * -             remote_access: {
 * -               protocol: "s3",
 * -               platform: "aws",
 * -               path: "YOUR_AWS_S3_BUCKET_NAME" + "/",
 * -               storage_endpoint: {
 * -                 region: "YOUR_AWS_REGION_NAME"
 * -               },
 * -               cloud_credentials: {
 * -                 access_key_id: "YOUR_AWS_S3_ACCESS_KEY",
 * -                 secret_access_key: "YOUR_AWS_S3_SECRET"
 * -               }
 * -             }
 * -           },
 * -           {
 * -             path_matchers: [".*"], // <-- catch-all for any remaining unmatched items in fileInfo
 * -             remote_access: {
 * -               ...
 * -             }
 * -           },
 * -           ...
 * -         ]
 * -
 * - The simplest case is a one element array with .path_matchers == [".*"], in which case the same credentials will be used for all items in fileInfo
 *
 * @throws {Object} error - If the initialization of the master fails, error details can be found in error.body
 * @return {Object} - The finalize response for the object, as well as logs, warnings and errors from the master initialization
 */


exports.CreateProductionMaster = /*#__PURE__*/function () {
  var _ref2 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee(_ref) {
    var libraryId, type, name, description, _ref$metadata, metadata, fileInfo, _ref$encrypt, encrypt, _ref$access, access, _ref$copy, copy, callback, _yield$this$CreateCon, id, write_token, s3prefixRegex, i, oneFileInfo, matched, j, credentialSet, credentialSetBucket, matchers, k, matcher, fileSourcePath, s3prefixMatch, bucketName, _i, _credentialSet, region, bucket, accessKey, secret, _yield$this$CallBitco, logs, errors, warnings, finalizeResponse;

    return _regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            libraryId = _ref.libraryId, type = _ref.type, name = _ref.name, description = _ref.description, _ref$metadata = _ref.metadata, metadata = _ref$metadata === void 0 ? {} : _ref$metadata, fileInfo = _ref.fileInfo, _ref$encrypt = _ref.encrypt, encrypt = _ref$encrypt === void 0 ? false : _ref$encrypt, _ref$access = _ref.access, access = _ref$access === void 0 ? [] : _ref$access, _ref$copy = _ref.copy, copy = _ref$copy === void 0 ? false : _ref$copy, callback = _ref.callback;
            ValidateLibrary(libraryId);
            _context.next = 4;
            return this.CreateContentObject({
              libraryId: libraryId,
              options: type ? {
                type: type
              } : {}
            });

          case 4:
            _yield$this$CreateCon = _context.sent;
            id = _yield$this$CreateCon.id;
            write_token = _yield$this$CreateCon.write_token;

            if (!fileInfo) {
              _context.next = 59;
              break;
            }

            if (!(access.length > 0)) {
              _context.next = 57;
              break;
            }

            // S3 Upload
            s3prefixRegex = /^s3:\/\/([^/]+)\//i; // for matching and extracting bucket name when full s3:// path is specified
            // batch the cloud storage files by matching credential set, check each file's source path against credential set path_matchers

            i = 0;

          case 11:
            if (!(i < fileInfo.length)) {
              _context.next = 42;
              break;
            }

            oneFileInfo = fileInfo[i];
            matched = false;
            j = 0;

          case 15:
            if (!(!matched && j < access.length)) {
              _context.next = 37;
              break;
            }

            credentialSet = access[j]; // strip trailing slash to get bucket name for credential set

            credentialSetBucket = credentialSet.remote_access.path.replace(/\/$/, "");
            matchers = credentialSet.path_matchers;
            k = 0;

          case 20:
            if (!(!matched && k < matchers.length)) {
              _context.next = 34;
              break;
            }

            matcher = new RegExp(matchers[k]);
            fileSourcePath = oneFileInfo.source;

            if (!matcher.test(fileSourcePath)) {
              _context.next = 31;
              break;
            }

            matched = true; // if full s3 path supplied, check bucket name

            s3prefixMatch = s3prefixRegex.exec(fileSourcePath);

            if (!s3prefixMatch) {
              _context.next = 30;
              break;
            }

            bucketName = s3prefixMatch[1];

            if (!(bucketName !== credentialSetBucket)) {
              _context.next = 30;
              break;
            }

            throw Error("Full S3 file path \"" + fileSourcePath + "\" matched to credential set with different bucket name '" + credentialSetBucket + "'");

          case 30:
            if (credentialSet.hasOwnProperty("matched")) {
              credentialSet.matched.push(oneFileInfo);
            } else {
              // first matching file path for this credential set,
              // initialize new 'matched' property to 1-element array
              credentialSet.matched = [oneFileInfo];
            }

          case 31:
            k++;
            _context.next = 20;
            break;

          case 34:
            j++;
            _context.next = 15;
            break;

          case 37:
            if (matched) {
              _context.next = 39;
              break;
            }

            throw Error("no credential set found for file path: \"" + filePath + "\"");

          case 39:
            i++;
            _context.next = 11;
            break;

          case 42:
            _i = 0;

          case 43:
            if (!(_i < access.length)) {
              _context.next = 55;
              break;
            }

            _credentialSet = access[_i];

            if (!(_credentialSet.hasOwnProperty("matched") && _credentialSet.matched.length > 0)) {
              _context.next = 52;
              break;
            }

            region = _credentialSet.remote_access.storage_endpoint.region;
            bucket = _credentialSet.remote_access.path.replace(/\/$/, "");
            accessKey = _credentialSet.remote_access.cloud_credentials.access_key_id;
            secret = _credentialSet.remote_access.cloud_credentials.secret_access_key;
            _context.next = 52;
            return this.UploadFilesFromS3({
              libraryId: libraryId,
              objectId: id,
              writeToken: write_token,
              fileInfo: _credentialSet.matched,
              region: region,
              bucket: bucket,
              accessKey: accessKey,
              secret: secret,
              copy: copy,
              callback: callback,
              encryption: encrypt ? "cgck" : "none"
            });

          case 52:
            _i++;
            _context.next = 43;
            break;

          case 55:
            _context.next = 59;
            break;

          case 57:
            _context.next = 59;
            return this.UploadFiles({
              libraryId: libraryId,
              objectId: id,
              writeToken: write_token,
              fileInfo: fileInfo,
              callback: callback,
              encryption: encrypt ? "cgck" : "none"
            });

          case 59:
            _context.next = 61;
            return this.CreateEncryptionConk({
              libraryId: libraryId,
              objectId: id,
              writeToken: write_token,
              createKMSConk: true
            });

          case 61:
            _context.next = 63;
            return this.CallBitcodeMethod({
              libraryId: libraryId,
              objectId: id,
              writeToken: write_token,
              method: UrlJoin("media", "production_master", "init"),
              body: {
                access: access
              },
              constant: false
            });

          case 63:
            _yield$this$CallBitco = _context.sent;
            logs = _yield$this$CallBitco.logs;
            errors = _yield$this$CallBitco.errors;
            warnings = _yield$this$CallBitco.warnings;
            _context.next = 69;
            return this.MergeMetadata({
              libraryId: libraryId,
              objectId: id,
              writeToken: write_token,
              metadata: _objectSpread(_objectSpread({}, metadata || {}), {}, {
                name: name,
                description: description,
                reference: access && !copy,
                "public": _objectSpread(_objectSpread({}, (metadata || {})["public"] || {}), {}, {
                  name: name || "",
                  description: description || ""
                }),
                elv_created_at: new Date().getTime()
              })
            });

          case 69:
            _context.next = 71;
            return this.FinalizeContentObject({
              libraryId: libraryId,
              objectId: id,
              writeToken: write_token,
              commitMessage: "Create master",
              awaitCommitConfirmation: false
            });

          case 71:
            finalizeResponse = _context.sent;
            return _context.abrupt("return", _objectSpread({
              errors: errors || [],
              logs: logs || [],
              warnings: warnings || []
            }, finalizeResponse));

          case 73:
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
 * Create a mezzanine of the given master content object
 *
 * @methodGroup ABR Publishing
 * @namedParams
 * @param {string} libraryId - ID of the mezzanine library
 * @param {string=} objectId - ID of existing object (if not specified, new object will be created)
 * @param {string=} type - ID or version hash of the content type for the mezzanine
 * @param {string} name - Name for mezzanine content object
 * @param {string=} description - Description for mezzanine content object
 * @param {Object=} metadata - Additional metadata for mezzanine content object
 * @param {string} masterVersionHash - The version hash of the production master content object
 * @param {string=} variant=default - What variant of the master content object to use
 * @param {string=} offeringKey=default - The key of the offering to create
 * @param {Object=} abrProfile - Custom ABR profile. If not specified, the profile of the mezzanine library will be used
 *
 * @return {Object} - The finalize response for the object, as well as logs, warnings and errors from the mezzanine initialization
 */


exports.CreateABRMezzanine = /*#__PURE__*/function () {
  var _ref4 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee2(_ref3) {
    var libraryId, objectId, type, name, description, metadata, masterVersionHash, abrProfile, _ref3$variant, variant, _ref3$offeringKey, offeringKey, existingMez, options, id, write_token, editResponse, createResponse, masterName, authorizationTokens, headers, body, storeClear, _yield$this$CallBitco2, logs, errors, warnings, existingMetadata, finalizeResponse;

    return _regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            libraryId = _ref3.libraryId, objectId = _ref3.objectId, type = _ref3.type, name = _ref3.name, description = _ref3.description, metadata = _ref3.metadata, masterVersionHash = _ref3.masterVersionHash, abrProfile = _ref3.abrProfile, _ref3$variant = _ref3.variant, variant = _ref3$variant === void 0 ? "default" : _ref3$variant, _ref3$offeringKey = _ref3.offeringKey, offeringKey = _ref3$offeringKey === void 0 ? "default" : _ref3$offeringKey;
            ValidateLibrary(libraryId);
            ValidateVersion(masterVersionHash);

            if (masterVersionHash) {
              _context2.next = 5;
              break;
            }

            throw Error("Master version hash not specified");

          case 5:
            existingMez = !!objectId;
            options = type ? {
              type: type
            } : {};

            if (!existingMez) {
              _context2.next = 15;
              break;
            }

            _context2.next = 10;
            return this.EditContentObject({
              libraryId: libraryId,
              objectId: objectId,
              options: options
            });

          case 10:
            editResponse = _context2.sent;
            id = editResponse.id;
            write_token = editResponse.write_token;
            _context2.next = 20;
            break;

          case 15:
            _context2.next = 17;
            return this.CreateContentObject({
              libraryId: libraryId,
              options: options
            });

          case 17:
            createResponse = _context2.sent;
            id = createResponse.id;
            write_token = createResponse.write_token;

          case 20:
            _context2.next = 22;
            return this.CreateEncryptionConk({
              libraryId: libraryId,
              objectId: id,
              writeToken: write_token,
              createKMSConk: true
            });

          case 22:
            _context2.next = 24;
            return this.ContentObjectMetadata({
              versionHash: masterVersionHash,
              metadataSubtree: "public/name"
            });

          case 24:
            masterName = _context2.sent;
            // Include authorization for library, master, and mezzanine
            authorizationTokens = [];
            _context2.t0 = authorizationTokens;
            _context2.next = 29;
            return this.authClient.AuthorizationToken({
              libraryId: libraryId,
              objectId: id,
              update: true
            });

          case 29:
            _context2.t1 = _context2.sent;

            _context2.t0.push.call(_context2.t0, _context2.t1);

            _context2.t2 = authorizationTokens;
            _context2.next = 34;
            return this.authClient.AuthorizationToken({
              libraryId: libraryId
            });

          case 34:
            _context2.t3 = _context2.sent;

            _context2.t2.push.call(_context2.t2, _context2.t3);

            _context2.t4 = authorizationTokens;
            _context2.next = 39;
            return this.authClient.AuthorizationToken({
              versionHash: masterVersionHash
            });

          case 39:
            _context2.t5 = _context2.sent;

            _context2.t4.push.call(_context2.t4, _context2.t5);

            headers = {
              Authorization: authorizationTokens.map(function (token) {
                return "Bearer ".concat(token);
              }).join(",")
            };
            body = {
              offering_key: offeringKey,
              variant_key: variant,
              prod_master_hash: masterVersionHash
            };
            storeClear = false;

            if (!abrProfile) {
              _context2.next = 49;
              break;
            }

            body.abr_profile = abrProfile;
            storeClear = abrProfile.store_clear;
            _context2.next = 52;
            break;

          case 49:
            _context2.next = 51;
            return this.ContentObjectMetadata({
              libraryId: libraryId,
              objectId: this.utils.AddressToObjectId(this.utils.HashToAddress(libraryId)),
              metadataSubtree: "abr_profile/store_clear"
            });

          case 51:
            storeClear = _context2.sent;

          case 52:
            if (storeClear) {
              _context2.next = 55;
              break;
            }

            _context2.next = 55;
            return this.EncryptionConk({
              libraryId: libraryId,
              objectId: id,
              writeToken: write_token
            });

          case 55:
            _context2.next = 57;
            return this.CallBitcodeMethod({
              libraryId: libraryId,
              objectId: id,
              writeToken: write_token,
              method: UrlJoin("media", "abr_mezzanine", "init"),
              headers: headers,
              body: body,
              constant: false
            });

          case 57:
            _yield$this$CallBitco2 = _context2.sent;
            logs = _yield$this$CallBitco2.logs;
            errors = _yield$this$CallBitco2.errors;
            warnings = _yield$this$CallBitco2.warnings;

            if (!metadata) {
              metadata = {};
            }

            if (!metadata["public"]) {
              metadata["public"] = {};
            }

            if (!metadata["public"].asset_metadata) {
              metadata["public"].asset_metadata = {};
            }

            metadata.master = {
              name: masterName,
              id: this.utils.DecodeVersionHash(masterVersionHash).objectId,
              hash: masterVersionHash,
              variant: variant
            };
            metadata["public"] = _objectSpread({}, metadata["public"]);
            metadata["public"].asset_metadata = _objectSpread({
              sources: _defineProperty({}, offeringKey, {
                "/": "./rep/playout/".concat(offeringKey, "/options.json")
              })
            }, metadata["public"].asset_metadata);

            if (name || !existingMez) {
              metadata.name = name || "".concat(masterName, " Mezzanine");
              metadata["public"].name = name || "".concat(masterName, " Mezzanine");
            }

            if (description || !existingMez) {
              metadata.description = description || "";
              metadata["public"].description = description || "";
            } // retrieve existing metadata to merge with updated metadata


            _context2.next = 71;
            return this.ContentObjectMetadata({
              libraryId: libraryId,
              objectId: id,
              writeToken: write_token
            });

          case 71:
            existingMetadata = _context2.sent;
            // newer metadata values replace existing metadata, unless both new and old values are objects,
            // in which case their keys are merged recursively
            metadata = R.mergeDeepRight(existingMetadata, metadata);

            if (!existingMez) {
              // set creation date
              metadata.elv_created_at = new Date().getTime();
            } // write metadata to mezzanine object


            _context2.next = 76;
            return this.ReplaceMetadata({
              libraryId: libraryId,
              objectId: id,
              writeToken: write_token,
              metadata: metadata
            });

          case 76:
            _context2.next = 78;
            return this.FinalizeContentObject({
              libraryId: libraryId,
              objectId: id,
              writeToken: write_token,
              commitMessage: "Create ABR mezzanine"
            });

          case 78:
            finalizeResponse = _context2.sent;
            return _context2.abrupt("return", _objectSpread({
              logs: logs || [],
              warnings: warnings || [],
              errors: errors || []
            }, finalizeResponse));

          case 80:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2, this);
  }));

  return function (_x2) {
    return _ref4.apply(this, arguments);
  };
}();
/**
 * Start any incomplete jobs on the specified mezzanine
 *
 * @methodGroup ABR Publishing
 * @namedParams
 * @param {string} libraryId - ID of the mezzanine library
 * @param {string} objectId - ID of the mezzanine object
 * @param {string=} offeringKey=default - The offering to process
 * @param {Array<Object>=} access - Array of S3 credentials, along with path matching regexes - Required if any files in the masters are S3 references (See CreateProductionMaster method)
 * - Format: {region, bucket, accessKey, secret}
 * @param {number[]} jobIndexes - Array of LRO job indexes to start. LROs are listed in a map under metadata key /abr_mezzanine/offerings/(offeringKey)/mez_prep_specs/, and job indexes start with 0, corresponding to map keys in alphabetical order
 *
 * @return {Promise<Object>} - A write token for the mezzanine object, as well as any logs, warnings and errors from the job initialization
 */


exports.StartABRMezzanineJobs = /*#__PURE__*/function () {
  var _ref6 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee4(_ref5) {
    var _this = this;

    var libraryId, objectId, _ref5$offeringKey, offeringKey, _ref5$access, access, _ref5$jobIndexes, jobIndexes, mezzanineMetadata, prepSpecs, masterVersionHashes, authorizationTokens, headers, processingDraft, lroInfo, statusDraft, finalizeResponse, _yield$this$CallBitco3, data, errors, warnings, logs;

    return _regeneratorRuntime.wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            libraryId = _ref5.libraryId, objectId = _ref5.objectId, _ref5$offeringKey = _ref5.offeringKey, offeringKey = _ref5$offeringKey === void 0 ? "default" : _ref5$offeringKey, _ref5$access = _ref5.access, access = _ref5$access === void 0 ? [] : _ref5$access, _ref5$jobIndexes = _ref5.jobIndexes, jobIndexes = _ref5$jobIndexes === void 0 ? null : _ref5$jobIndexes;
            ValidateParameters({
              libraryId: libraryId,
              objectId: objectId
            });
            _context4.next = 4;
            return this.ContentObjectMetadata({
              libraryId: libraryId,
              objectId: objectId,
              metadataSubtree: UrlJoin("abr_mezzanine", "offerings")
            });

          case 4:
            mezzanineMetadata = _context4.sent;
            prepSpecs = mezzanineMetadata[offeringKey].mez_prep_specs || []; // Retrieve all masters associated with this offering

            masterVersionHashes = Object.keys(prepSpecs).map(function (spec) {
              return (prepSpecs[spec].source_streams || []).map(function (stream) {
                return stream.source_hash;
              });
            }); // Flatten and filter

            masterVersionHashes = [].concat.apply([], masterVersionHashes).filter(function (hash) {
              return hash;
            }).filter(function (v, i, a) {
              return a.indexOf(v) === i;
            }); // Retrieve authorization tokens for all masters and the mezzanine

            _context4.next = 10;
            return Promise.all(masterVersionHashes.map( /*#__PURE__*/function () {
              var _ref7 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee3(versionHash) {
                return _regeneratorRuntime.wrap(function _callee3$(_context3) {
                  while (1) {
                    switch (_context3.prev = _context3.next) {
                      case 0:
                        _context3.next = 2;
                        return _this.authClient.AuthorizationToken({
                          versionHash: versionHash
                        });

                      case 2:
                        return _context3.abrupt("return", _context3.sent);

                      case 3:
                      case "end":
                        return _context3.stop();
                    }
                  }
                }, _callee3);
              }));

              return function (_x4) {
                return _ref7.apply(this, arguments);
              };
            }()));

          case 10:
            authorizationTokens = _context4.sent;
            _context4.next = 13;
            return this.authClient.AuthorizationToken({
              libraryId: libraryId,
              objectId: objectId,
              update: true
            });

          case 13:
            _context4.t0 = _context4.sent;
            authorizationTokens = [_context4.t0].concat(_toConsumableArray(authorizationTokens));
            headers = {
              Authorization: authorizationTokens.map(function (token) {
                return "Bearer ".concat(token);
              }).join(",")
            };
            _context4.next = 18;
            return this.EditContentObject({
              libraryId: libraryId,
              objectId: objectId
            });

          case 18:
            processingDraft = _context4.sent;
            lroInfo = {
              write_token: processingDraft.write_token,
              node: this.HttpClient.BaseURI().toString(),
              offering: offeringKey
            }; // Update metadata with LRO version write token

            _context4.next = 22;
            return this.EditContentObject({
              libraryId: libraryId,
              objectId: objectId
            });

          case 22:
            statusDraft = _context4.sent;
            _context4.next = 25;
            return this.ReplaceMetadata({
              libraryId: libraryId,
              objectId: objectId,
              writeToken: statusDraft.write_token,
              metadataSubtree: "lro_draft_".concat(offeringKey),
              metadata: lroInfo
            });

          case 25:
            _context4.next = 27;
            return this.FinalizeContentObject({
              libraryId: libraryId,
              objectId: objectId,
              writeToken: statusDraft.write_token,
              commitMessage: "Mezzanine LRO status"
            });

          case 27:
            finalizeResponse = _context4.sent;
            _context4.next = 30;
            return this.CallBitcodeMethod({
              libraryId: libraryId,
              objectId: objectId,
              writeToken: processingDraft.write_token,
              headers: headers,
              method: UrlJoin("media", "abr_mezzanine", "prep_start"),
              constant: false,
              body: {
                access: access,
                offering_key: offeringKey,
                job_indexes: jobIndexes
              }
            });

          case 30:
            _yield$this$CallBitco3 = _context4.sent;
            data = _yield$this$CallBitco3.data;
            errors = _yield$this$CallBitco3.errors;
            warnings = _yield$this$CallBitco3.warnings;
            logs = _yield$this$CallBitco3.logs;
            return _context4.abrupt("return", {
              hash: finalizeResponse.hash,
              lro_draft: lroInfo,
              writeToken: processingDraft.write_token,
              data: data,
              logs: logs || [],
              warnings: warnings || [],
              errors: errors || []
            });

          case 36:
          case "end":
            return _context4.stop();
        }
      }
    }, _callee4, this);
  }));

  return function (_x3) {
    return _ref6.apply(this, arguments);
  };
}();
/**
 * Retrieve status information for a long running operation (LRO) on the given object.
 *
 * @methodGroup ABR Publishing
 * @namedParams
 * @param {string} libraryId - ID of the library
 * @param {string} objectId - ID of the object
 * @param {string=} offeringKey=default - Offering key of the mezzanine
 *
 * @return {Promise<Object>} - LRO status
 */


exports.LROStatus = /*#__PURE__*/function () {
  var _ref9 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee5(_ref8) {
    var libraryId, objectId, _ref8$offeringKey, offeringKey, lroDraft, ready, error, result, fabricURIs;

    return _regeneratorRuntime.wrap(function _callee5$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            libraryId = _ref8.libraryId, objectId = _ref8.objectId, _ref8$offeringKey = _ref8.offeringKey, offeringKey = _ref8$offeringKey === void 0 ? "default" : _ref8$offeringKey;
            ValidateParameters({
              libraryId: libraryId,
              objectId: objectId
            });
            _context5.next = 4;
            return this.ContentObjectMetadata({
              libraryId: libraryId,
              objectId: objectId,
              metadataSubtree: "lro_draft_".concat(offeringKey)
            });

          case 4:
            _context5.t0 = _context5.sent;

            if (_context5.t0) {
              _context5.next = 9;
              break;
            }

            _context5.next = 8;
            return this.ContentObjectMetadata({
              libraryId: libraryId,
              objectId: objectId,
              metadataSubtree: "lro_draft"
            });

          case 8:
            _context5.t0 = _context5.sent;

          case 9:
            lroDraft = _context5.t0;

            if (!(!lroDraft || !lroDraft.write_token)) {
              _context5.next = 19;
              break;
            }

            _context5.next = 13;
            return this.ContentObjectMetadata({
              libraryId: libraryId,
              objectId: objectId,
              metadataSubtree: UrlJoin("abr_mezzanine", "offerings", offeringKey, "ready")
            });

          case 13:
            ready = _context5.sent;

            if (!ready) {
              _context5.next = 18;
              break;
            }

            throw Error("Mezzanine already finalized for offering '".concat(offeringKey, "'"));

          case 18:
            throw Error("No LRO draft found for this mezzanine");

          case 19:
            fabricURIs = this.fabricURIs;
            _context5.prev = 20;
            this.SetNodes({
              fabricURIs: [lroDraft.node].concat(_toConsumableArray(fabricURIs))
            });
            _context5.next = 24;
            return this.ContentObjectMetadata({
              libraryId: libraryId,
              objectId: objectId,
              writeToken: lroDraft.write_token,
              metadataSubtree: "lro_status"
            });

          case 24:
            result = _context5.sent;
            _context5.next = 30;
            break;

          case 27:
            _context5.prev = 27;
            _context5.t1 = _context5["catch"](20);
            error = _context5.t1;

          case 30:
            _context5.prev = 30;
            this.SetNodes({
              fabricURIs: fabricURIs
            });
            return _context5.finish(30);

          case 33:
            if (!error) {
              _context5.next = 35;
              break;
            }

            throw error;

          case 35:
            return _context5.abrupt("return", result);

          case 36:
          case "end":
            return _context5.stop();
        }
      }
    }, _callee5, this, [[20, 27, 30, 33]]);
  }));

  return function (_x5) {
    return _ref9.apply(this, arguments);
  };
}();
/**
 * Finalize a mezzanine object after all jobs have finished
 *
 * @methodGroup ABR Publishing
 * @namedParams
 * @param {string} libraryId - ID of the mezzanine library
 * @param {string} objectId - ID of the mezzanine object
 * @param {string} writeToken - Write token for the mezzanine object
 * @param {string=} offeringKey=default - The offering to process
 *
 * @return {Promise<Object>} - The finalize response for the mezzanine object, as well as any logs, warnings and errors from the finalization
 */


exports.FinalizeABRMezzanine = /*#__PURE__*/function () {
  var _ref11 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee6(_ref10) {
    var libraryId, objectId, _ref10$offeringKey, offeringKey, lroDraft, httpClient, error, result, mezzanineMetadata, masterHash, authorizationTokens, headers, _yield$this$CallBitco4, data, errors, warnings, logs, finalizeResponse;

    return _regeneratorRuntime.wrap(function _callee6$(_context6) {
      while (1) {
        switch (_context6.prev = _context6.next) {
          case 0:
            libraryId = _ref10.libraryId, objectId = _ref10.objectId, _ref10$offeringKey = _ref10.offeringKey, offeringKey = _ref10$offeringKey === void 0 ? "default" : _ref10$offeringKey;
            ValidateParameters({
              libraryId: libraryId,
              objectId: objectId
            });
            _context6.next = 4;
            return this.ContentObjectMetadata({
              libraryId: libraryId,
              objectId: objectId,
              metadataSubtree: "lro_draft_".concat(offeringKey)
            });

          case 4:
            lroDraft = _context6.sent;

            if (!(!lroDraft || !lroDraft.write_token)) {
              _context6.next = 7;
              break;
            }

            throw Error("No LRO draft found for this mezzanine");

          case 7:
            httpClient = this.HttpClient;
            _context6.prev = 8;
            // Point directly to the node containing the draft
            this.HttpClient = new HttpClient({
              uris: [lroDraft.node],
              debug: httpClient.debug
            });
            _context6.next = 12;
            return this.ContentObjectMetadata({
              libraryId: libraryId,
              objectId: objectId,
              writeToken: lroDraft.write_token,
              metadataSubtree: UrlJoin("abr_mezzanine", "offerings")
            });

          case 12:
            mezzanineMetadata = _context6.sent;
            masterHash = mezzanineMetadata[offeringKey].prod_master_hash; // Authorization token for mezzanine and master

            _context6.next = 16;
            return this.authClient.AuthorizationToken({
              libraryId: libraryId,
              objectId: objectId,
              update: true
            });

          case 16:
            _context6.t0 = _context6.sent;
            _context6.next = 19;
            return this.authClient.AuthorizationToken({
              versionHash: masterHash
            });

          case 19:
            _context6.t1 = _context6.sent;
            authorizationTokens = [_context6.t0, _context6.t1];
            headers = {
              Authorization: authorizationTokens.map(function (token) {
                return "Bearer ".concat(token);
              }).join(",")
            };
            _context6.next = 24;
            return this.CallBitcodeMethod({
              objectId: objectId,
              libraryId: libraryId,
              writeToken: lroDraft.write_token,
              method: UrlJoin("media", "abr_mezzanine", "offerings", offeringKey, "finalize"),
              headers: headers,
              constant: false
            });

          case 24:
            _yield$this$CallBitco4 = _context6.sent;
            data = _yield$this$CallBitco4.data;
            errors = _yield$this$CallBitco4.errors;
            warnings = _yield$this$CallBitco4.warnings;
            logs = _yield$this$CallBitco4.logs;
            _context6.next = 31;
            return this.FinalizeContentObject({
              libraryId: libraryId,
              objectId: objectId,
              writeToken: lroDraft.write_token,
              commitMessage: "Finalize ABR mezzanine",
              awaitCommitConfirmation: false
            });

          case 31:
            finalizeResponse = _context6.sent;
            result = _objectSpread({
              data: data,
              logs: logs || [],
              warnings: warnings || [],
              errors: errors || []
            }, finalizeResponse);
            _context6.next = 38;
            break;

          case 35:
            _context6.prev = 35;
            _context6.t2 = _context6["catch"](8);
            error = _context6.t2;

          case 38:
            _context6.prev = 38;
            // Ensure original http client is restored
            this.HttpClient = httpClient;
            return _context6.finish(38);

          case 41:
            if (!error) {
              _context6.next = 43;
              break;
            }

            throw error;

          case 43:
            return _context6.abrupt("return", result);

          case 44:
          case "end":
            return _context6.stop();
        }
      }
    }, _callee6, this, [[8, 35, 38, 41]]);
  }));

  return function (_x6) {
    return _ref11.apply(this, arguments);
  };
}();