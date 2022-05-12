var _defineProperty = require("@babel/runtime/helpers/defineProperty");

var _regeneratorRuntime = require("@babel/runtime/regenerator");

var _asyncToGenerator = require("@babel/runtime/helpers/asyncToGenerator");

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }

/**
 * Methods for accessing and managing access groups
 *
 * @module ElvClient/Files+Parts
 */
var Utils = require("../Utils");

var fs;

if (Utils.Platform() === Utils.PLATFORM_NODE) {
  // Define Response in node
  // eslint-disable-next-line no-global-assign
  global.Response = require("node-fetch").Response;
  fs = require("fs");
}

var UrlJoin = require("url-join");

var _require = require("../Validation"),
    ValidatePresence = _require.ValidatePresence,
    ValidateWriteToken = _require.ValidateWriteToken,
    ValidatePartHash = _require.ValidatePartHash,
    ValidateParameters = _require.ValidateParameters;
/* Files */

/**
 * List the file information about this object
 *
 * @memberof module:ElvClient/Files+Parts
 * @methodGroup Files
 * @namedParams
 * @param {string=} libraryId - ID of the library
 * @param {string=} objectId - ID of the object
 * @param {string=} versionHash - Hash of the object version - if not specified, most recent version will be used
 */


exports.ListFiles = /*#__PURE__*/function () {
  var _ref2 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee(_ref) {
    var libraryId, objectId, versionHash, path;
    return _regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            libraryId = _ref.libraryId, objectId = _ref.objectId, versionHash = _ref.versionHash;
            ValidateParameters({
              libraryId: libraryId,
              objectId: objectId,
              versionHash: versionHash
            });

            if (versionHash) {
              objectId = this.utils.DecodeVersionHash(versionHash).objectId;
            }

            path = UrlJoin("q", versionHash || objectId, "meta", "files");
            _context.t0 = this.utils;
            _context.t1 = this.HttpClient;
            _context.next = 8;
            return this.authClient.AuthorizationHeader({
              libraryId: libraryId,
              objectId: objectId,
              versionHash: versionHash
            });

          case 8:
            _context.t2 = _context.sent;
            _context.t3 = path;
            _context.t4 = {
              headers: _context.t2,
              method: "GET",
              path: _context.t3
            };
            _context.t5 = _context.t1.Request.call(_context.t1, _context.t4);
            return _context.abrupt("return", _context.t0.ResponseToJson.call(_context.t0, _context.t5));

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
 * Copy/reference files from S3 to a content object.
 *
 * S3 authentication is done by either providing an access key and secret or a presigned URL. The credentials will not be stored (neither in the client nor in the Fabric)
 *
 * NOTE: When providing a presigned URL instead of an access key + secret, the accessKey, secret, region and bucket parameters are not required.
 *
 * Expected format of fileInfo:
 *
     [
       {
         path: string,
         source: string // either a full path e.g. "s3://BUCKET_NAME/path..." or just the path part without "s3://BUCKET_NAME/"
       }
     ]
 *
 * @memberof module:ElvClient/Files+Parts
 * @methodGroup Files
 * @namedParams
 * @param {string} libraryId - ID of the library
 * @param {string} objectId - ID of the object
 * @param {string} writeToken - Write token of the draft
 * @param {string} region - AWS region to use
 * @param {string} bucket - AWS bucket to use
 * @param {Array<Object>} fileInfo - List of files to reference/copy
 * @param {string} accessKey - AWS access key
 * @param {string} secret - AWS secret
 * @param {string=} signedUrl
 * @param {string} encryption="none" - Encryption for uploaded files (copy only) - cgck | none
 * @param {boolean} copy=false - If true, will copy the data from S3 into the fabric. Otherwise, a reference to the content will be made.
 * @param {function=} callback - If specified, will be periodically called with current upload status
 * - Arguments (copy): { done: boolean, uploaded: number, total: number, uploadedFiles: number, totalFiles: number, fileStatus: Object }
 * - Arguments (reference): { done: boolean, uploadedFiles: number, totalFiles: number }
 */


exports.UploadFilesFromS3 = /*#__PURE__*/function () {
  var _ref4 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee2(_ref3) {
    var libraryId, objectId, writeToken, region, bucket, fileInfo, accessKey, secret, signedUrl, _ref3$encryption, encryption, _ref3$copy, copy, callback, s3prefixRegex, i, fileSourcePath, s3prefixMatch, bucketName, encryption_key, conk, cloudCredentials, defaults, ops, _yield$this$CreateFil, id, status, done, progress, _progress;

    return _regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            libraryId = _ref3.libraryId, objectId = _ref3.objectId, writeToken = _ref3.writeToken, region = _ref3.region, bucket = _ref3.bucket, fileInfo = _ref3.fileInfo, accessKey = _ref3.accessKey, secret = _ref3.secret, signedUrl = _ref3.signedUrl, _ref3$encryption = _ref3.encryption, encryption = _ref3$encryption === void 0 ? "none" : _ref3$encryption, _ref3$copy = _ref3.copy, copy = _ref3$copy === void 0 ? false : _ref3$copy, callback = _ref3.callback;
            ValidateParameters({
              libraryId: libraryId,
              objectId: objectId
            });
            ValidateWriteToken(writeToken);
            s3prefixRegex = /^s3:\/\/([^/]+)\//i; // for matching and extracting bucket name when full s3:// path is specified
            // if fileInfo source paths start with s3://bucketName/, check against bucket arg passed in, and strip

            i = 0;

          case 5:
            if (!(i < fileInfo.length)) {
              _context2.next = 18;
              break;
            }

            fileSourcePath = fileInfo[i].source;
            s3prefixMatch = s3prefixRegex.exec(fileSourcePath);

            if (!s3prefixMatch) {
              _context2.next = 15;
              break;
            }

            bucketName = s3prefixMatch[1];

            if (!(bucketName !== bucket)) {
              _context2.next = 14;
              break;
            }

            throw Error("Full S3 file path \"" + fileSourcePath + "\" specified, but does not match provided bucket name '" + bucket + "'");

          case 14:
            // strip prefix
            fileInfo[i].source = fileSourcePath.replace(s3prefixRegex, "");

          case 15:
            i++;
            _context2.next = 5;
            break;

          case 18:
            this.Log("Uploading files from S3: ".concat(libraryId, " ").concat(objectId, " ").concat(writeToken));

            if (!(encryption === "cgck")) {
              _context2.next = 25;
              break;
            }

            _context2.next = 22;
            return this.EncryptionConk({
              libraryId: libraryId,
              objectId: objectId,
              writeToken: writeToken
            });

          case 22:
            conk = _context2.sent;
            conk = _objectSpread(_objectSpread({}, conk), {}, {
              secret_key: ""
            });
            encryption_key = "kp__".concat(this.utils.B58(Buffer.from(JSON.stringify(conk))));

          case 25:
            cloudCredentials = {
              access_key_id: accessKey,
              secret_access_key: secret
            };

            if (signedUrl) {
              cloudCredentials = {
                signed_url: signedUrl
              };
            }

            defaults = {
              encryption_key: encryption_key,
              access: {
                protocol: "s3",
                platform: "aws",
                path: bucket,
                storage_endpoint: {
                  region: region
                },
                cloud_credentials: cloudCredentials
              }
            };
            ops = fileInfo.map(function (info) {
              if (copy) {
                return {
                  op: "ingest-copy",
                  path: info.path,
                  encryption: {
                    scheme: encryption === "cgck" ? "cgck" : "none"
                  },
                  ingest: {
                    type: "key",
                    path: info.source
                  }
                };
              } else {
                return {
                  op: "add-reference",
                  path: info.path,
                  reference: {
                    type: "key",
                    path: info.source
                  }
                };
              }
            }); // eslint-disable-next-line no-unused-vars

            _context2.next = 31;
            return this.CreateFileUploadJob({
              libraryId: libraryId,
              objectId: objectId,
              writeToken: writeToken,
              ops: ops,
              defaults: defaults
            });

          case 31:
            _yield$this$CreateFil = _context2.sent;
            id = _yield$this$CreateFil.id;

          case 33:
            if (!true) {
              _context2.next = 56;
              break;
            }

            _context2.next = 36;
            return new Promise(function (resolve) {
              return setTimeout(resolve, 1000);
            });

          case 36:
            _context2.next = 38;
            return this.UploadStatus({
              libraryId: libraryId,
              objectId: objectId,
              writeToken: writeToken,
              uploadId: id
            });

          case 38:
            status = _context2.sent;

            if (!(status.errors && status.errors.length > 1)) {
              _context2.next = 43;
              break;
            }

            throw status.errors.join("\n");

          case 43:
            if (!status.error) {
              _context2.next = 48;
              break;
            }

            this.Log("S3 file upload failed:\n".concat(JSON.stringify(status, null, 2)));
            throw status.error;

          case 48:
            if (!(status.status.toLowerCase() === "failed")) {
              _context2.next = 50;
              break;
            }

            throw "File upload failed";

          case 50:
            done = false;

            if (copy) {
              done = status.ingest_copy.done;

              if (callback) {
                progress = status.ingest_copy.progress;
                callback({
                  done: done,
                  uploaded: progress.bytes.completed,
                  total: progress.bytes.total,
                  uploadedFiles: progress.files.completed,
                  totalFiles: progress.files.total,
                  fileStatus: progress.files.details
                });
              }
            } else {
              done = status.add_reference.done;

              if (callback) {
                _progress = status.add_reference.progress;
                callback({
                  done: done,
                  uploadedFiles: _progress.completed,
                  totalFiles: _progress.total
                });
              }
            }

            if (!done) {
              _context2.next = 54;
              break;
            }

            return _context2.abrupt("break", 56);

          case 54:
            _context2.next = 33;
            break;

          case 56:
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
 * Upload files to a content object.
 *
 * Expected format of fileInfo:
 *
     [
         {
            path: string,
            mime_type: string,
            size: number,
            data: File | ArrayBuffer | Buffer | File Descriptor (Node)
          }
     ]
 *
 *
 * @memberof module:ElvClient/Files+Parts
 * @methodGroup Files
 * @namedParams
 * @param {string} libraryId - ID of the library
 * @param {string} objectId - ID of the object
 * @param {string} writeToken - Write token of the draft
 * @param {Array<object>} fileInfo - List of files to upload, including their size, type, and contents
 * @param {string} encryption="none" - Encryption for uploaded files - cgck | none
 * @param {function=} callback - If specified, will be called after each job segment is finished with the current upload progress
 * - Format: {"filename1": {uploaded: number, total: number}, ...}
 */


exports.UploadFiles = /*#__PURE__*/function () {
  var _ref6 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee6(_ref5) {
    var _this = this;

    var libraryId, objectId, writeToken, fileInfo, _ref5$encryption, encryption, callback, conk, progress, fileDataMap, i, entry, _yield$this$CreateFil2, id, jobs, bufferSize, jobSpecs, prepared, uploaded, PrepareJobs, UploadJob, rateTestJobs, rates, j, start, elapsed, size, averageRate, concurrentUploads;

    return _regeneratorRuntime.wrap(function _callee6$(_context6) {
      while (1) {
        switch (_context6.prev = _context6.next) {
          case 0:
            libraryId = _ref5.libraryId, objectId = _ref5.objectId, writeToken = _ref5.writeToken, fileInfo = _ref5.fileInfo, _ref5$encryption = _ref5.encryption, encryption = _ref5$encryption === void 0 ? "none" : _ref5$encryption, callback = _ref5.callback;
            ValidateParameters({
              libraryId: libraryId,
              objectId: objectId
            });
            ValidateWriteToken(writeToken);
            this.Log("Uploading files: ".concat(libraryId, " ").concat(objectId, " ").concat(writeToken));

            if (!(encryption === "cgck")) {
              _context6.next = 8;
              break;
            }

            _context6.next = 7;
            return this.EncryptionConk({
              libraryId: libraryId,
              objectId: objectId,
              writeToken: writeToken
            });

          case 7:
            conk = _context6.sent;

          case 8:
            // Extract file data into easily accessible hash while removing the data from the fileinfo for upload job creation
            progress = {};
            fileDataMap = {};

            for (i = 0; i < fileInfo.length; i++) {
              entry = _objectSpread(_objectSpread({}, fileInfo[i]), {}, {
                data: undefined
              });
              entry.path = entry.path.replace(/^\/+/, "");

              if (encryption === "cgck") {
                entry.encryption = {
                  scheme: "cgck"
                };
              }

              fileDataMap[entry.path] = fileInfo[i].data;
              delete entry.data;
              entry.type = "file";
              progress[entry.path] = {
                uploaded: 0,
                total: entry.size
              };
              fileInfo[i] = entry;
            }

            this.Log(fileInfo);

            if (callback) {
              callback(progress);
            }

            _context6.next = 15;
            return this.CreateFileUploadJob({
              libraryId: libraryId,
              objectId: objectId,
              writeToken: writeToken,
              ops: fileInfo,
              encryption: encryption
            });

          case 15:
            _yield$this$CreateFil2 = _context6.sent;
            id = _yield$this$CreateFil2.id;
            jobs = _yield$this$CreateFil2.jobs;
            this.Log("Upload ID: ".concat(id));
            this.Log(jobs); // How far encryption can get ahead of upload

            bufferSize = 100 * 1024 * 1024;
            jobSpecs = [];
            prepared = 0;
            uploaded = 0; // Insert the data to upload into the job spec, encrypting if necessary

            PrepareJobs = /*#__PURE__*/function () {
              var _ref7 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee3() {
                var j, jobId, job, f, _fileInfo, data;

                return _regeneratorRuntime.wrap(function _callee3$(_context3) {
                  while (1) {
                    switch (_context3.prev = _context3.next) {
                      case 0:
                        j = 0;

                      case 1:
                        if (!(j < jobs.length)) {
                          _context3.next = 31;
                          break;
                        }

                      case 2:
                        if (!(prepared - uploaded > bufferSize)) {
                          _context3.next = 7;
                          break;
                        }

                        _context3.next = 5;
                        return new Promise(function (resolve) {
                          return setTimeout(resolve, 500);
                        });

                      case 5:
                        _context3.next = 2;
                        break;

                      case 7:
                        // Retrieve job info
                        jobId = jobs[j];
                        _context3.next = 10;
                        return _this.UploadJobStatus({
                          libraryId: libraryId,
                          objectId: objectId,
                          writeToken: writeToken,
                          uploadId: id,
                          jobId: jobId
                        });

                      case 10:
                        job = _context3.sent;
                        f = 0;

                      case 12:
                        if (!(f < job.files.length)) {
                          _context3.next = 25;
                          break;
                        }

                        _fileInfo = job.files[f];
                        data = void 0;

                        if (typeof fileDataMap[_fileInfo.path] === "number") {
                          // File descriptor - Read data from file
                          data = Buffer.alloc(_fileInfo.len);
                          fs.readSync(fileDataMap[_fileInfo.path], data, 0, _fileInfo.len, _fileInfo.off);
                        } else {
                          // Full data - Slice requested chunk
                          data = fileDataMap[_fileInfo.path].slice(_fileInfo.off, _fileInfo.off + _fileInfo.len);
                        }

                        if (!(encryption === "cgck")) {
                          _context3.next = 20;
                          break;
                        }

                        _context3.next = 19;
                        return _this.Crypto.Encrypt(conk, data);

                      case 19:
                        data = _context3.sent;

                      case 20:
                        job.files[f].data = data;
                        prepared += _fileInfo.len;

                      case 22:
                        f++;
                        _context3.next = 12;
                        break;

                      case 25:
                        jobSpecs[j] = job; // Wait for a bit to let upload start

                        _context3.next = 28;
                        return new Promise(function (resolve) {
                          return setTimeout(resolve, 50);
                        });

                      case 28:
                        j++;
                        _context3.next = 1;
                        break;

                      case 31:
                      case "end":
                        return _context3.stop();
                    }
                  }
                }, _callee3);
              }));

              return function PrepareJobs() {
                return _ref7.apply(this, arguments);
              };
            }();

            UploadJob = /*#__PURE__*/function () {
              var _ref8 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee4(jobId, j) {
                var jobSpec, files, f, _fileInfo2;

                return _regeneratorRuntime.wrap(function _callee4$(_context4) {
                  while (1) {
                    switch (_context4.prev = _context4.next) {
                      case 0:
                        if (jobSpecs[j]) {
                          _context4.next = 5;
                          break;
                        }

                        _context4.next = 3;
                        return new Promise(function (resolve) {
                          return setTimeout(resolve, 500);
                        });

                      case 3:
                        _context4.next = 0;
                        break;

                      case 5:
                        jobSpec = jobSpecs[j];
                        files = jobSpec.files; // Upload each item

                        f = 0;

                      case 8:
                        if (!(f < files.length)) {
                          _context4.next = 18;
                          break;
                        }

                        _fileInfo2 = files[f];
                        _context4.next = 12;
                        return _this.UploadFileData({
                          libraryId: libraryId,
                          objectId: objectId,
                          writeToken: writeToken,
                          uploadId: id,
                          jobId: jobId,
                          fileData: _fileInfo2.data
                        });

                      case 12:
                        delete jobSpecs[j].files[f].data;
                        uploaded += _fileInfo2.len;

                        if (callback) {
                          progress[_fileInfo2.path] = _objectSpread(_objectSpread({}, progress[_fileInfo2.path]), {}, {
                            uploaded: progress[_fileInfo2.path].uploaded + _fileInfo2.len
                          });
                          callback(progress);
                        }

                      case 15:
                        f++;
                        _context4.next = 8;
                        break;

                      case 18:
                      case "end":
                        return _context4.stop();
                    }
                  }
                }, _callee4);
              }));

              return function UploadJob(_x4, _x5) {
                return _ref8.apply(this, arguments);
              };
            }(); // Preparing jobs is done asyncronously


            PrepareJobs(); // Upload the first several chunks in sequence, to determine average upload rate

            rateTestJobs = Math.min(3, jobs.length);
            rates = [];
            j = 0;

          case 30:
            if (!(j < rateTestJobs)) {
              _context6.next = 40;
              break;
            }

            start = new Date().getTime();
            _context6.next = 34;
            return UploadJob(jobs[j], j);

          case 34:
            elapsed = (new Date().getTime() - start) / 1000;
            size = jobSpecs[j].files.map(function (file) {
              return file.len;
            }).reduce(function (length, total) {
              return length + total;
            }, 0);
            rates.push(size / elapsed / (1024 * 1024));

          case 37:
            j++;
            _context6.next = 30;
            break;

          case 40:
            averageRate = rates.reduce(function (mbps, total) {
              return mbps + total;
            }, 0) / rateTestJobs; // Upload remaining jobs in parallel

            concurrentUploads = Math.min(5, Math.ceil(averageRate / 2));
            _context6.next = 44;
            return this.utils.LimitedMap(concurrentUploads, jobs, /*#__PURE__*/function () {
              var _ref9 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee5(jobId, j) {
                return _regeneratorRuntime.wrap(function _callee5$(_context5) {
                  while (1) {
                    switch (_context5.prev = _context5.next) {
                      case 0:
                        if (!(j < rateTestJobs)) {
                          _context5.next = 2;
                          break;
                        }

                        return _context5.abrupt("return");

                      case 2:
                        _context5.next = 4;
                        return UploadJob(jobId, j);

                      case 4:
                      case "end":
                        return _context5.stop();
                    }
                  }
                }, _callee5);
              }));

              return function (_x6, _x7) {
                return _ref9.apply(this, arguments);
              };
            }());

          case 44:
          case "end":
            return _context6.stop();
        }
      }
    }, _callee6, this);
  }));

  return function (_x3) {
    return _ref6.apply(this, arguments);
  };
}();

exports.CreateFileUploadJob = /*#__PURE__*/function () {
  var _ref11 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee7(_ref10) {
    var libraryId, objectId, writeToken, ops, _ref10$defaults, defaults, _ref10$encryption, encryption, body, path;

    return _regeneratorRuntime.wrap(function _callee7$(_context7) {
      while (1) {
        switch (_context7.prev = _context7.next) {
          case 0:
            libraryId = _ref10.libraryId, objectId = _ref10.objectId, writeToken = _ref10.writeToken, ops = _ref10.ops, _ref10$defaults = _ref10.defaults, defaults = _ref10$defaults === void 0 ? {} : _ref10$defaults, _ref10$encryption = _ref10.encryption, encryption = _ref10$encryption === void 0 ? "none" : _ref10$encryption;
            ValidateParameters({
              libraryId: libraryId,
              objectId: objectId
            });
            ValidateWriteToken(writeToken);
            this.Log("Creating file upload job: ".concat(libraryId, " ").concat(objectId, " ").concat(writeToken));
            this.Log(ops);

            if (encryption === "cgck") {
              defaults.encryption = {
                scheme: "cgck"
              };
            }

            body = {
              seq: 0,
              seq_complete: true,
              defaults: defaults,
              ops: ops
            };
            path = UrlJoin("q", writeToken, "file_jobs");
            _context7.t0 = this.utils;
            _context7.t1 = this.HttpClient;
            _context7.next = 12;
            return this.authClient.AuthorizationHeader({
              libraryId: libraryId,
              objectId: objectId,
              update: true,
              encryption: encryption
            });

          case 12:
            _context7.t2 = _context7.sent;
            _context7.t3 = path;
            _context7.t4 = body;
            _context7.t5 = {
              headers: _context7.t2,
              method: "POST",
              path: _context7.t3,
              body: _context7.t4,
              failover: false
            };
            _context7.t6 = _context7.t1.Request.call(_context7.t1, _context7.t5);
            return _context7.abrupt("return", _context7.t0.ResponseToJson.call(_context7.t0, _context7.t6));

          case 18:
          case "end":
            return _context7.stop();
        }
      }
    }, _callee7, this);
  }));

  return function (_x8) {
    return _ref11.apply(this, arguments);
  };
}();

exports.UploadStatus = /*#__PURE__*/function () {
  var _ref13 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee8(_ref12) {
    var libraryId, objectId, writeToken, uploadId, path;
    return _regeneratorRuntime.wrap(function _callee8$(_context8) {
      while (1) {
        switch (_context8.prev = _context8.next) {
          case 0:
            libraryId = _ref12.libraryId, objectId = _ref12.objectId, writeToken = _ref12.writeToken, uploadId = _ref12.uploadId;
            ValidateParameters({
              libraryId: libraryId,
              objectId: objectId
            });
            ValidateWriteToken(writeToken);
            path = UrlJoin("q", writeToken, "file_jobs", uploadId);
            _context8.t0 = this.utils;
            _context8.t1 = this.HttpClient;
            _context8.next = 8;
            return this.authClient.AuthorizationHeader({
              libraryId: libraryId,
              objectId: objectId,
              update: true
            });

          case 8:
            _context8.t2 = _context8.sent;
            _context8.t3 = path;
            _context8.t4 = {
              headers: _context8.t2,
              method: "GET",
              path: _context8.t3,
              failover: false
            };
            _context8.t5 = _context8.t1.Request.call(_context8.t1, _context8.t4);
            return _context8.abrupt("return", _context8.t0.ResponseToJson.call(_context8.t0, _context8.t5));

          case 13:
          case "end":
            return _context8.stop();
        }
      }
    }, _callee8, this);
  }));

  return function (_x9) {
    return _ref13.apply(this, arguments);
  };
}();

exports.UploadJobStatus = /*#__PURE__*/function () {
  var _ref15 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee9(_ref14) {
    var libraryId, objectId, writeToken, uploadId, jobId, path;
    return _regeneratorRuntime.wrap(function _callee9$(_context9) {
      while (1) {
        switch (_context9.prev = _context9.next) {
          case 0:
            libraryId = _ref14.libraryId, objectId = _ref14.objectId, writeToken = _ref14.writeToken, uploadId = _ref14.uploadId, jobId = _ref14.jobId;
            ValidateParameters({
              libraryId: libraryId,
              objectId: objectId
            });
            ValidateWriteToken(writeToken);
            path = UrlJoin("q", writeToken, "file_jobs", uploadId, "uploads", jobId);
            _context9.t0 = this.utils;
            _context9.t1 = this.HttpClient;
            _context9.next = 8;
            return this.authClient.AuthorizationHeader({
              libraryId: libraryId,
              objectId: objectId,
              update: true
            });

          case 8:
            _context9.t2 = _context9.sent;
            _context9.t3 = path;
            _context9.t4 = {
              headers: _context9.t2,
              method: "GET",
              path: _context9.t3,
              failover: false
            };
            _context9.t5 = _context9.t1.Request.call(_context9.t1, _context9.t4);
            return _context9.abrupt("return", _context9.t0.ResponseToJson.call(_context9.t0, _context9.t5));

          case 13:
          case "end":
            return _context9.stop();
        }
      }
    }, _callee9, this);
  }));

  return function (_x10) {
    return _ref15.apply(this, arguments);
  };
}();

exports.UploadFileData = /*#__PURE__*/function () {
  var _ref17 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee10(_ref16) {
    var libraryId, objectId, writeToken, uploadId, jobId, fileData, path;
    return _regeneratorRuntime.wrap(function _callee10$(_context10) {
      while (1) {
        switch (_context10.prev = _context10.next) {
          case 0:
            libraryId = _ref16.libraryId, objectId = _ref16.objectId, writeToken = _ref16.writeToken, uploadId = _ref16.uploadId, jobId = _ref16.jobId, fileData = _ref16.fileData;
            ValidateParameters({
              libraryId: libraryId,
              objectId: objectId
            });
            ValidateWriteToken(writeToken);
            path = UrlJoin("q", writeToken, "file_jobs", uploadId, jobId);
            _context10.t0 = this.utils;
            _context10.t1 = this.HttpClient;
            _context10.t2 = path;
            _context10.t3 = fileData;
            _context10.t4 = _objectSpread;
            _context10.t5 = {
              "Content-type": "application/octet-stream"
            };
            _context10.next = 12;
            return this.authClient.AuthorizationHeader({
              libraryId: libraryId,
              objectId: objectId,
              update: true
            });

          case 12:
            _context10.t6 = _context10.sent;
            _context10.t7 = (0, _context10.t4)(_context10.t5, _context10.t6);
            _context10.t8 = {
              method: "POST",
              path: _context10.t2,
              body: _context10.t3,
              bodyType: "BINARY",
              headers: _context10.t7,
              failover: false
            };
            _context10.t9 = _context10.t1.Request.call(_context10.t1, _context10.t8);
            _context10.next = 18;
            return _context10.t0.ResponseToJson.call(_context10.t0, _context10.t9);

          case 18:
          case "end":
            return _context10.stop();
        }
      }
    }, _callee10, this);
  }));

  return function (_x11) {
    return _ref17.apply(this, arguments);
  };
}();

exports.FinalizeUploadJob = /*#__PURE__*/function () {
  var _ref19 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee11(_ref18) {
    var libraryId, objectId, writeToken, path;
    return _regeneratorRuntime.wrap(function _callee11$(_context11) {
      while (1) {
        switch (_context11.prev = _context11.next) {
          case 0:
            libraryId = _ref18.libraryId, objectId = _ref18.objectId, writeToken = _ref18.writeToken;
            ValidateParameters({
              libraryId: libraryId,
              objectId: objectId
            });
            ValidateWriteToken(writeToken);
            this.Log("Finalizing upload job: ".concat(libraryId, " ").concat(objectId, " ").concat(writeToken));
            path = UrlJoin("q", writeToken, "files");
            _context11.t0 = this.HttpClient;
            _context11.t1 = path;
            _context11.next = 9;
            return this.authClient.AuthorizationHeader({
              libraryId: libraryId,
              objectId: objectId,
              update: true
            });

          case 9:
            _context11.t2 = _context11.sent;
            _context11.t3 = {
              method: "POST",
              path: _context11.t1,
              bodyType: "BINARY",
              headers: _context11.t2,
              failover: false
            };
            _context11.next = 13;
            return _context11.t0.Request.call(_context11.t0, _context11.t3);

          case 13:
          case "end":
            return _context11.stop();
        }
      }
    }, _callee11, this);
  }));

  return function (_x12) {
    return _ref19.apply(this, arguments);
  };
}();
/**
 * Create the specified directories on the specified object
 *
 * @memberof module:ElvClient/Files+Parts
 * @methodGroup Files
 * @namedParams
 * @param {string} libraryId - ID of the library
 * @param {string} objectId - ID of the object
 * @param {string} writeToken - Write token of the draft
 * @param {Array<string>} filePaths - List of file paths to create
 */


exports.CreateFileDirectories = /*#__PURE__*/function () {
  var _ref21 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee12(_ref20) {
    var libraryId, objectId, writeToken, filePaths, ops;
    return _regeneratorRuntime.wrap(function _callee12$(_context12) {
      while (1) {
        switch (_context12.prev = _context12.next) {
          case 0:
            libraryId = _ref20.libraryId, objectId = _ref20.objectId, writeToken = _ref20.writeToken, filePaths = _ref20.filePaths;
            ValidateParameters({
              libraryId: libraryId,
              objectId: objectId
            });
            ValidateWriteToken(writeToken);
            this.Log("Creating Directories: ".concat(libraryId, " ").concat(objectId, " ").concat(writeToken));
            this.Log(filePaths);
            ops = filePaths.map(function (path) {
              return {
                op: "add",
                type: "directory",
                path: path
              };
            });
            _context12.next = 8;
            return this.CreateFileUploadJob({
              libraryId: libraryId,
              objectId: objectId,
              writeToken: writeToken,
              ops: ops
            });

          case 8:
          case "end":
            return _context12.stop();
        }
      }
    }, _callee12, this);
  }));

  return function (_x13) {
    return _ref21.apply(this, arguments);
  };
}();
/**
 * Delete the specified list of files/directories
 *
 * @memberof module:ElvClient/Files+Parts
 * @methodGroup Files
 * @namedParams
 * @param {string} libraryId - ID of the library
 * @param {string} objectId - ID of the object
 * @param {string} writeToken - Write token of the draft
 * @param {Array<string>} filePaths - List of file paths to delete
 */


exports.DeleteFiles = /*#__PURE__*/function () {
  var _ref23 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee13(_ref22) {
    var libraryId, objectId, writeToken, filePaths, ops;
    return _regeneratorRuntime.wrap(function _callee13$(_context13) {
      while (1) {
        switch (_context13.prev = _context13.next) {
          case 0:
            libraryId = _ref22.libraryId, objectId = _ref22.objectId, writeToken = _ref22.writeToken, filePaths = _ref22.filePaths;
            ValidateParameters({
              libraryId: libraryId,
              objectId: objectId
            });
            ValidateWriteToken(writeToken);
            this.Log("Deleting Files: ".concat(libraryId, " ").concat(objectId, " ").concat(writeToken));
            this.Log(filePaths);
            ops = filePaths.map(function (path) {
              return {
                op: "del",
                path: path
              };
            });
            _context13.next = 8;
            return this.CreateFileUploadJob({
              libraryId: libraryId,
              objectId: objectId,
              writeToken: writeToken,
              ops: ops
            });

          case 8:
          case "end":
            return _context13.stop();
        }
      }
    }, _callee13, this);
  }));

  return function (_x14) {
    return _ref23.apply(this, arguments);
  };
}();
/**
 * Download a file from a content object
 *
 * @memberof module:ElvClient/Files+Parts
 * @methodGroup Files
 * @namedParams
 * @param {string=} libraryId - ID of the library
 * @param {string=} objectId - ID of the object
 * @param {string=} versionHash - Hash of the object version - if not specified, latest version will be used
 * @param {string=} writeToken - Write token for the draft from which to download the file
 * @param {string} filePath - Path to the file to download
 * @param {string=} format="blob" - Format in which to return the data ("blob" | "arraybuffer" | "buffer)
 * @param {boolean=} chunked=false - If specified, file will be downloaded and decrypted in chunks. The
 * specified callback will be invoked on completion of each chunk. This is recommended for large files.
 * @param {number=} chunkSize=1000000 - Size of file chunks to request for download
 * - NOTE: If the file is encrypted, the size of the chunks returned via the callback function will not be affected by this value
 * @param {boolean=} clientSideDecryption=false - If specified, decryption of the file (if necessary) will be done by the client
 * instead of on the fabric node
 * @param {function=} callback - If specified, will be periodically called with current download status - Required if `chunked` is true
 * - Signature: ({bytesFinished, bytesTotal}) => {}
 * - Signature (chunked): ({bytesFinished, bytesTotal, chunk}) => {}
 *
 * @returns {Promise<ArrayBuffer> | undefined} - No return if chunked is specified, file data in the requested format otherwise
 */


exports.DownloadFile = /*#__PURE__*/function () {
  var _ref25 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee14(_ref24) {
    var libraryId,
        objectId,
        versionHash,
        writeToken,
        filePath,
        _ref24$format,
        format,
        _ref24$chunked,
        chunked,
        chunkSize,
        _ref24$clientSideDecr,
        clientSideDecryption,
        callback,
        fileInfo,
        encrypted,
        encryption,
        path,
        headers,
        ownerCapKey,
        ownerCap,
        bytesTotal,
        _args14 = arguments;

    return _regeneratorRuntime.wrap(function _callee14$(_context14) {
      while (1) {
        switch (_context14.prev = _context14.next) {
          case 0:
            libraryId = _ref24.libraryId, objectId = _ref24.objectId, versionHash = _ref24.versionHash, writeToken = _ref24.writeToken, filePath = _ref24.filePath, _ref24$format = _ref24.format, format = _ref24$format === void 0 ? "arrayBuffer" : _ref24$format, _ref24$chunked = _ref24.chunked, chunked = _ref24$chunked === void 0 ? false : _ref24$chunked, chunkSize = _ref24.chunkSize, _ref24$clientSideDecr = _ref24.clientSideDecryption, clientSideDecryption = _ref24$clientSideDecr === void 0 ? false : _ref24$clientSideDecr, callback = _ref24.callback;
            ValidateParameters({
              libraryId: libraryId,
              objectId: objectId,
              versionHash: versionHash
            });
            ValidatePresence("filePath", filePath);

            if (versionHash) {
              objectId = this.utils.DecodeVersionHash(versionHash).objectId;
            }

            _context14.next = 6;
            return this.ContentObjectMetadata({
              libraryId: libraryId,
              objectId: objectId,
              versionHash: versionHash,
              writeToken: writeToken,
              metadataSubtree: UrlJoin("files", filePath)
            });

          case 6:
            fileInfo = _context14.sent;
            encrypted = fileInfo && fileInfo["."].encryption && fileInfo["."].encryption.scheme === "cgck";
            encryption = encrypted ? "cgck" : undefined;
            path = encrypted && !clientSideDecryption ? UrlJoin("q", writeToken || versionHash || objectId, "rep", "files_download", filePath) : UrlJoin("q", writeToken || versionHash || objectId, "files", filePath);
            _context14.next = 12;
            return this.authClient.AuthorizationHeader({
              libraryId: libraryId,
              objectId: objectId,
              versionHash: versionHash,
              encryption: encryption
            });

          case 12:
            headers = _context14.sent;
            headers.Accept = "*/*"; // If not owner, indicate re-encryption

            ownerCapKey = "eluv.caps.iusr".concat(this.utils.AddressToHash(this.signer.address));
            _context14.next = 17;
            return this.ContentObjectMetadata({
              libraryId: libraryId,
              objectId: objectId,
              metadataSubtree: ownerCapKey
            });

          case 17:
            ownerCap = _context14.sent;
            _context14.t1 = encrypted;

            if (!_context14.t1) {
              _context14.next = 26;
              break;
            }

            _context14.t2 = this.utils;
            _context14.t3 = this.signer.address;
            _context14.next = 24;
            return this.ContentObjectOwner({
              objectId: objectId
            });

          case 24:
            _context14.t4 = _context14.sent;
            _context14.t1 = !_context14.t2.EqualAddress.call(_context14.t2, _context14.t3, _context14.t4);

          case 26:
            _context14.t0 = _context14.t1;

            if (!_context14.t0) {
              _context14.next = 29;
              break;
            }

            _context14.t0 = !ownerCap;

          case 29:
            if (!_context14.t0) {
              _context14.next = 31;
              break;
            }

            headers["X-Content-Fabric-Decryption-Mode"] = "reencrypt";

          case 31:
            // If using server side decryption, specify in header
            if (encrypted && !clientSideDecryption) {
              headers["X-Content-Fabric-Decryption-Mode"] = "decrypt"; // rep/files_download endpoint doesn't currently support Range header

              chunkSize = Number.MAX_SAFE_INTEGER;
            }

            bytesTotal = fileInfo["."].size;

            if (!(encrypted && clientSideDecryption)) {
              _context14.next = 51;
              break;
            }

            _context14.t5 = this;
            _context14.next = 37;
            return this.EncryptionConk({
              libraryId: libraryId,
              objectId: objectId,
              versionHash: versionHash,
              download: true
            });

          case 37:
            _context14.t6 = _context14.sent;
            _context14.t7 = path;
            _context14.t8 = bytesTotal;
            _context14.t9 = headers;
            _context14.t10 = callback;
            _context14.t11 = format;
            _context14.t12 = clientSideDecryption;
            _context14.t13 = chunked;
            _context14.t14 = {
              conk: _context14.t6,
              downloadPath: _context14.t7,
              bytesTotal: _context14.t8,
              headers: _context14.t9,
              callback: _context14.t10,
              format: _context14.t11,
              clientSideDecryption: _context14.t12,
              chunked: _context14.t13
            };
            _context14.next = 48;
            return _context14.t5.DownloadEncrypted.call(_context14.t5, _context14.t14);

          case 48:
            return _context14.abrupt("return", _context14.sent);

          case 51:
            if (!chunkSize) {
              chunkSize = 10000000;
            }

            _context14.prev = 52;
            _context14.next = 55;
            return this.Download({
              downloadPath: path,
              bytesTotal: bytesTotal,
              headers: headers,
              callback: callback,
              format: format,
              chunked: chunked,
              chunkSize: chunkSize
            });

          case 55:
            return _context14.abrupt("return", _context14.sent);

          case 58:
            _context14.prev = 58;
            _context14.t15 = _context14["catch"](52);

            if (!(encrypted && !clientSideDecryption)) {
              _context14.next = 62;
              break;
            }

            return _context14.abrupt("return", this.DownloadFile(_objectSpread(_objectSpread({}, _args14[0]), {}, {
              clientSideDecryption: true
            })));

          case 62:
            throw _context14.t15;

          case 63:
          case "end":
            return _context14.stop();
        }
      }
    }, _callee14, this, [[52, 58]]);
  }));

  return function (_x15) {
    return _ref25.apply(this, arguments);
  };
}();
/* Parts */

/**
 * List content object parts
 *
 * @memberof module:ElvClient/Files+Parts
 * @methodGroup Parts
 * @namedParams
 * @param {string=} libraryId - ID of the library
 * @param {string=} objectId - ID of the object
 * @param {string=} versionHash - Hash of the object version - if not specified, latest version will be used
 *
 * @returns {Promise<Object>} - Response containing list of parts of the object
 */


exports.ContentParts = /*#__PURE__*/function () {
  var _ref27 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee15(_ref26) {
    var libraryId, objectId, versionHash, path, response;
    return _regeneratorRuntime.wrap(function _callee15$(_context15) {
      while (1) {
        switch (_context15.prev = _context15.next) {
          case 0:
            libraryId = _ref26.libraryId, objectId = _ref26.objectId, versionHash = _ref26.versionHash;
            ValidateParameters({
              libraryId: libraryId,
              objectId: objectId,
              versionHash: versionHash
            });
            this.Log("Retrieving parts: ".concat(libraryId, " ").concat(objectId || versionHash));

            if (versionHash) {
              objectId = this.utils.DecodeVersionHash(versionHash).objectId;
            }

            path = UrlJoin("q", versionHash || objectId, "parts");
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
            response = _context15.sent;
            return _context15.abrupt("return", response.parts);

          case 17:
          case "end":
            return _context15.stop();
        }
      }
    }, _callee15, this);
  }));

  return function (_x16) {
    return _ref27.apply(this, arguments);
  };
}();
/**
 * Get information on a specific part
 *
 * @memberof module:ElvClient/Files+Parts
 * @methodGroup Parts
 * @namedParams
 * @param {string=} libraryId - ID of the library
 * @param {string=} objectId - ID of the object
 * @param {string=} versionHash - Hash of the object version - if not specified, latest version will be used
 * @param {string} partHash - Hash of the part to retrieve
 *
 * @returns {Promise<Object>} - Response containing information about the specified part
 */


exports.ContentPart = /*#__PURE__*/function () {
  var _ref29 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee16(_ref28) {
    var libraryId, objectId, versionHash, partHash, path;
    return _regeneratorRuntime.wrap(function _callee16$(_context16) {
      while (1) {
        switch (_context16.prev = _context16.next) {
          case 0:
            libraryId = _ref28.libraryId, objectId = _ref28.objectId, versionHash = _ref28.versionHash, partHash = _ref28.partHash;
            ValidateParameters({
              libraryId: libraryId,
              objectId: objectId,
              versionHash: versionHash
            });
            ValidatePartHash(partHash);
            this.Log("Retrieving part: ".concat(libraryId, " ").concat(objectId || versionHash, " ").concat(partHash));

            if (versionHash) {
              objectId = this.utils.DecodeVersionHash(versionHash).objectId;
            }

            path = UrlJoin("q", versionHash || objectId, "parts", partHash);
            _context16.t0 = this.utils;
            _context16.t1 = this.HttpClient;
            _context16.next = 10;
            return this.authClient.AuthorizationHeader({
              libraryId: libraryId,
              objectId: objectId,
              versionHash: versionHash
            });

          case 10:
            _context16.t2 = _context16.sent;
            _context16.t3 = path;
            _context16.t4 = {
              headers: _context16.t2,
              method: "GET",
              path: _context16.t3
            };
            _context16.t5 = _context16.t1.Request.call(_context16.t1, _context16.t4);
            _context16.next = 16;
            return _context16.t0.ResponseToJson.call(_context16.t0, _context16.t5);

          case 16:
            return _context16.abrupt("return", _context16.sent);

          case 17:
          case "end":
            return _context16.stop();
        }
      }
    }, _callee16, this);
  }));

  return function (_x17) {
    return _ref29.apply(this, arguments);
  };
}();
/**
 * Download a part from a content object. The fromByte and range parameters can be used to specify a
 * specific section of the part to download.
 *
 * @memberof module:ElvClient/Files+Parts
 * @methodGroup Parts
 * @namedParams
 * @param {string=} libraryId - ID of the library
 * @param {string=} objectId - ID of the object
 * @param {string=} versionHash - Hash of the object version - if not specified, latest version will be used
 * @param {string=} writeToken - Write token for the draft from which to download the part
 * @param {string} partHash - Hash of the part to download
 * @param {string=} format="arrayBuffer" - Format in which to return the data ("blob" | "arraybuffer" | "buffer)
 * @param {boolean=} chunked=false - If specified, part will be downloaded and decrypted in chunks. The
 * specified callback will be invoked on completion of each chunk. This is recommended for large files,
 * especially if they are encrypted.
 * @param {number=} chunkSize=1000000 - Size of file chunks to request for download
 * - NOTE: If the file is encrypted, the size of the chunks returned via the callback function will not be affected by this value
 * @param {function=} callback - If specified, will be periodically called with current download status - Required if `chunked` is true
 * - Signature: ({bytesFinished, bytesTotal}) => {}
 * - Signature (chunked): ({bytesFinished, bytesTotal, chunk}) => {}
 *
 * @returns {Promise<ArrayBuffer> | undefined} - No return if chunked is specified, part data in the requested format otherwise
 */


exports.DownloadPart = /*#__PURE__*/function () {
  var _ref31 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee17(_ref30) {
    var libraryId, objectId, versionHash, writeToken, partHash, _ref30$format, format, _ref30$chunked, chunked, _ref30$chunkSize, chunkSize, callback, encrypted, encryption, path, headers, bytesTotal;

    return _regeneratorRuntime.wrap(function _callee17$(_context17) {
      while (1) {
        switch (_context17.prev = _context17.next) {
          case 0:
            libraryId = _ref30.libraryId, objectId = _ref30.objectId, versionHash = _ref30.versionHash, writeToken = _ref30.writeToken, partHash = _ref30.partHash, _ref30$format = _ref30.format, format = _ref30$format === void 0 ? "arrayBuffer" : _ref30$format, _ref30$chunked = _ref30.chunked, chunked = _ref30$chunked === void 0 ? false : _ref30$chunked, _ref30$chunkSize = _ref30.chunkSize, chunkSize = _ref30$chunkSize === void 0 ? 10000000 : _ref30$chunkSize, callback = _ref30.callback;
            ValidateParameters({
              libraryId: libraryId,
              objectId: objectId,
              versionHash: versionHash
            });
            ValidatePartHash(partHash);

            if (versionHash) {
              objectId = this.utils.DecodeVersionHash(versionHash).objectId;
            }

            encrypted = partHash.startsWith("hqpe");
            encryption = encrypted ? "cgck" : undefined;
            path = UrlJoin("q", writeToken || versionHash || objectId, "data", partHash);
            _context17.next = 9;
            return this.authClient.AuthorizationHeader({
              libraryId: libraryId,
              objectId: objectId,
              versionHash: versionHash,
              encryption: encryption
            });

          case 9:
            headers = _context17.sent;
            _context17.next = 12;
            return this.ContentPart({
              libraryId: libraryId,
              objectId: objectId,
              versionHash: versionHash,
              partHash: partHash
            });

          case 12:
            bytesTotal = _context17.sent.part.size;

            if (!encrypted) {
              _context17.next = 37;
              break;
            }

            _context17.t0 = this.utils;
            _context17.t1 = this.signer.address;
            _context17.next = 18;
            return this.ContentObjectOwner({
              objectId: objectId
            });

          case 18:
            _context17.t2 = _context17.sent;

            if (_context17.t0.EqualAddress.call(_context17.t0, _context17.t1, _context17.t2)) {
              _context17.next = 21;
              break;
            }

            headers["X-Content-Fabric-Decryption-Mode"] = "reencrypt";

          case 21:
            _context17.t3 = this;
            _context17.next = 24;
            return this.EncryptionConk({
              libraryId: libraryId,
              objectId: objectId,
              download: true
            });

          case 24:
            _context17.t4 = _context17.sent;
            _context17.t5 = path;
            _context17.t6 = bytesTotal;
            _context17.t7 = headers;
            _context17.t8 = callback;
            _context17.t9 = format;
            _context17.t10 = chunked;
            _context17.t11 = {
              conk: _context17.t4,
              downloadPath: _context17.t5,
              bytesTotal: _context17.t6,
              headers: _context17.t7,
              callback: _context17.t8,
              format: _context17.t9,
              chunked: _context17.t10
            };
            _context17.next = 34;
            return _context17.t3.DownloadEncrypted.call(_context17.t3, _context17.t11);

          case 34:
            return _context17.abrupt("return", _context17.sent);

          case 37:
            _context17.next = 39;
            return this.Download({
              downloadPath: path,
              bytesTotal: bytesTotal,
              headers: headers,
              callback: callback,
              format: format,
              chunked: chunked,
              chunkSize: chunkSize
            });

          case 39:
            return _context17.abrupt("return", _context17.sent);

          case 40:
          case "end":
            return _context17.stop();
        }
      }
    }, _callee17, this);
  }));

  return function (_x18) {
    return _ref31.apply(this, arguments);
  };
}();

exports.Download = /*#__PURE__*/function () {
  var _ref33 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee18(_ref32) {
    var downloadPath, headers, bytesTotal, _ref32$chunked, chunked, _ref32$chunkSize, chunkSize, callback, _ref32$format, format, outputChunks, bytesFinished, totalChunks, i, response;

    return _regeneratorRuntime.wrap(function _callee18$(_context18) {
      while (1) {
        switch (_context18.prev = _context18.next) {
          case 0:
            downloadPath = _ref32.downloadPath, headers = _ref32.headers, bytesTotal = _ref32.bytesTotal, _ref32$chunked = _ref32.chunked, chunked = _ref32$chunked === void 0 ? false : _ref32$chunked, _ref32$chunkSize = _ref32.chunkSize, chunkSize = _ref32$chunkSize === void 0 ? 2000000 : _ref32$chunkSize, callback = _ref32.callback, _ref32$format = _ref32.format, format = _ref32$format === void 0 ? "arrayBuffer" : _ref32$format;

            if (!(chunked && !callback)) {
              _context18.next = 3;
              break;
            }

            throw Error("No callback specified for chunked download");

          case 3:
            if (!chunked) {
              outputChunks = [];
            } // Download file in chunks


            bytesFinished = 0;
            totalChunks = Math.ceil(bytesTotal / chunkSize);
            i = 0;

          case 7:
            if (!(i < totalChunks)) {
              _context18.next = 35;
              break;
            }

            headers["Range"] = "bytes=".concat(bytesFinished, "-").concat(bytesFinished + chunkSize - 1);
            _context18.next = 11;
            return this.HttpClient.Request({
              path: downloadPath,
              headers: headers,
              method: "GET"
            });

          case 11:
            response = _context18.sent;
            bytesFinished = Math.min(bytesFinished + chunkSize, bytesTotal);

            if (!chunked) {
              _context18.next = 24;
              break;
            }

            _context18.t0 = callback;
            _context18.t1 = bytesFinished;
            _context18.t2 = bytesTotal;
            _context18.next = 19;
            return this.utils.ResponseToFormat(format, response);

          case 19:
            _context18.t3 = _context18.sent;
            _context18.t4 = {
              bytesFinished: _context18.t1,
              bytesTotal: _context18.t2,
              chunk: _context18.t3
            };
            (0, _context18.t0)(_context18.t4);
            _context18.next = 32;
            break;

          case 24:
            _context18.t5 = outputChunks;
            _context18.t6 = Buffer;
            _context18.next = 28;
            return response.arrayBuffer();

          case 28:
            _context18.t7 = _context18.sent;
            _context18.t8 = _context18.t6.from.call(_context18.t6, _context18.t7);

            _context18.t5.push.call(_context18.t5, _context18.t8);

            if (callback) {
              callback({
                bytesFinished: bytesFinished,
                bytesTotal: bytesTotal
              });
            }

          case 32:
            i++;
            _context18.next = 7;
            break;

          case 35:
            if (chunked) {
              _context18.next = 39;
              break;
            }

            _context18.next = 38;
            return this.utils.ResponseToFormat(format, new Response(Buffer.concat(outputChunks)));

          case 38:
            return _context18.abrupt("return", _context18.sent);

          case 39:
          case "end":
            return _context18.stop();
        }
      }
    }, _callee18, this);
  }));

  return function (_x19) {
    return _ref33.apply(this, arguments);
  };
}();

exports.DownloadEncrypted = /*#__PURE__*/function () {
  var _ref35 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee20(_ref34) {
    var _this2 = this;

    var conk, downloadPath, bytesTotal, headers, callback, _ref34$format, format, _ref34$chunked, chunked, isReencryption, chunkSize, bytesFinished, outputChunks, stream, totalChunks, i, response;

    return _regeneratorRuntime.wrap(function _callee20$(_context20) {
      while (1) {
        switch (_context20.prev = _context20.next) {
          case 0:
            conk = _ref34.conk, downloadPath = _ref34.downloadPath, bytesTotal = _ref34.bytesTotal, headers = _ref34.headers, callback = _ref34.callback, _ref34$format = _ref34.format, format = _ref34$format === void 0 ? "arrayBuffer" : _ref34$format, _ref34$chunked = _ref34.chunked, chunked = _ref34$chunked === void 0 ? false : _ref34$chunked;

            if (!(chunked && !callback)) {
              _context20.next = 3;
              break;
            }

            throw Error("No callback specified for chunked download");

          case 3:
            // Must align chunk size with encryption block size
            isReencryption = conk.public_key.startsWith("ktpk");
            chunkSize = this.Crypto.EncryptedBlockSize(1000000, isReencryption);
            bytesFinished = 0;
            format = format.toLowerCase();
            outputChunks = []; // Set up decryption stream

            _context20.next = 10;
            return this.Crypto.OpenDecryptionStream(conk);

          case 10:
            stream = _context20.sent;
            stream.on("data", /*#__PURE__*/function () {
              var _ref36 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee19(chunk) {
                var arrayBuffer;
                return _regeneratorRuntime.wrap(function _callee19$(_context19) {
                  while (1) {
                    switch (_context19.prev = _context19.next) {
                      case 0:
                        if (!chunked) {
                          _context19.next = 13;
                          break;
                        }

                        if (!(format !== "buffer")) {
                          _context19.next = 10;
                          break;
                        }

                        arrayBuffer = chunk.buffer.slice(chunk.byteOffset, chunk.byteOffset + chunk.byteLength);

                        if (!(format === "arraybuffer")) {
                          _context19.next = 7;
                          break;
                        }

                        chunk = arrayBuffer;
                        _context19.next = 10;
                        break;

                      case 7:
                        _context19.next = 9;
                        return _this2.utils.ResponseToFormat(format, new Response(arrayBuffer));

                      case 9:
                        chunk = _context19.sent;

                      case 10:
                        callback({
                          bytesFinished: bytesFinished,
                          bytesTotal: bytesTotal,
                          chunk: chunk
                        });
                        _context19.next = 15;
                        break;

                      case 13:
                        if (callback) {
                          callback({
                            bytesFinished: bytesFinished,
                            bytesTotal: bytesTotal
                          });
                        }

                        outputChunks.push(chunk);

                      case 15:
                      case "end":
                        return _context19.stop();
                    }
                  }
                }, _callee19);
              }));

              return function (_x21) {
                return _ref36.apply(this, arguments);
              };
            }());
            totalChunks = Math.ceil(bytesTotal / chunkSize);
            i = 0;

          case 14:
            if (!(i < totalChunks)) {
              _context20.next = 30;
              break;
            }

            headers["Range"] = "bytes=".concat(bytesFinished, "-").concat(bytesFinished + chunkSize - 1);
            _context20.next = 18;
            return this.HttpClient.Request({
              headers: headers,
              method: "GET",
              path: downloadPath
            });

          case 18:
            response = _context20.sent;
            bytesFinished = Math.min(bytesFinished + chunkSize, bytesTotal);
            _context20.t0 = stream;
            _context20.t1 = Uint8Array;
            _context20.next = 24;
            return response.arrayBuffer();

          case 24:
            _context20.t2 = _context20.sent;
            _context20.t3 = new _context20.t1(_context20.t2);

            _context20.t0.write.call(_context20.t0, _context20.t3);

          case 27:
            i++;
            _context20.next = 14;
            break;

          case 30:
            // Wait for decryption to complete
            stream.end();
            _context20.next = 33;
            return new Promise(function (resolve) {
              return stream.on("finish", function () {
                resolve();
              });
            });

          case 33:
            if (chunked) {
              _context20.next = 37;
              break;
            }

            _context20.next = 36;
            return this.utils.ResponseToFormat(format, new Response(Buffer.concat(outputChunks)));

          case 36:
            return _context20.abrupt("return", _context20.sent);

          case 37:
          case "end":
            return _context20.stop();
        }
      }
    }, _callee20, this);
  }));

  return function (_x20) {
    return _ref35.apply(this, arguments);
  };
}();
/**
 * Create a part upload draft
 *
 * @memberof module:ElvClient/Files+Parts
 * @methodGroup Parts
 * @namedParams
 * @param {string} libraryId - ID of the library
 * @param {string} objectId - ID of the object
 * @param {string} writeToken - Write token of the content object draft
 * @param {string=} encryption=none - Desired encryption scheme. Options: 'none' (default), 'cgck'
 *
 * @returns {Promise<string>} - The part write token for the part draft
 */


exports.CreatePart = /*#__PURE__*/function () {
  var _ref38 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee21(_ref37) {
    var libraryId, objectId, writeToken, encryption, path, openResponse;
    return _regeneratorRuntime.wrap(function _callee21$(_context21) {
      while (1) {
        switch (_context21.prev = _context21.next) {
          case 0:
            libraryId = _ref37.libraryId, objectId = _ref37.objectId, writeToken = _ref37.writeToken, encryption = _ref37.encryption;
            ValidateParameters({
              libraryId: libraryId,
              objectId: objectId
            });
            ValidateWriteToken(writeToken);
            path = UrlJoin("q", writeToken, "parts");
            _context21.t0 = this.utils;
            _context21.t1 = this.HttpClient;
            _context21.next = 8;
            return this.authClient.AuthorizationHeader({
              libraryId: libraryId,
              objectId: objectId,
              update: true,
              encryption: encryption
            });

          case 8:
            _context21.t2 = _context21.sent;
            _context21.t3 = path;
            _context21.t4 = {
              headers: _context21.t2,
              method: "POST",
              path: _context21.t3,
              bodyType: "BINARY",
              body: "",
              failover: false
            };
            _context21.t5 = _context21.t1.Request.call(_context21.t1, _context21.t4);
            _context21.next = 14;
            return _context21.t0.ResponseToJson.call(_context21.t0, _context21.t5);

          case 14:
            openResponse = _context21.sent;
            return _context21.abrupt("return", openResponse.part.write_token);

          case 16:
          case "end":
            return _context21.stop();
        }
      }
    }, _callee21, this);
  }));

  return function (_x22) {
    return _ref38.apply(this, arguments);
  };
}();
/**
 * Upload data to an open part draft
 *
 * @memberof module:ElvClient/Files+Parts
 * @methodGroup Parts
 * @namedParams
 * @param {string} libraryId - ID of the library
 * @param {string} objectId - ID of the object
 * @param {string} writeToken - Write token of the content object draft
 * @param {string} partWriteToken - Write token of the part
 * @param {(ArrayBuffer | Buffer)} chunk - Data to upload
 * @param {string=} encryption=none - Desired encryption scheme. Options: 'none' (default), 'cgck'
 *
 * @returns {Promise<string>} - The part write token for the part draft
 */


exports.UploadPartChunk = /*#__PURE__*/function () {
  var _ref40 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee22(_ref39) {
    var libraryId, objectId, writeToken, partWriteToken, chunk, encryption, conk, path;
    return _regeneratorRuntime.wrap(function _callee22$(_context22) {
      while (1) {
        switch (_context22.prev = _context22.next) {
          case 0:
            libraryId = _ref39.libraryId, objectId = _ref39.objectId, writeToken = _ref39.writeToken, partWriteToken = _ref39.partWriteToken, chunk = _ref39.chunk, encryption = _ref39.encryption;
            ValidateParameters({
              libraryId: libraryId,
              objectId: objectId
            });
            ValidateWriteToken(writeToken);

            if (!(encryption && encryption !== "none")) {
              _context22.next = 10;
              break;
            }

            _context22.next = 6;
            return this.EncryptionConk({
              libraryId: libraryId,
              objectId: objectId,
              writeToken: writeToken
            });

          case 6:
            conk = _context22.sent;
            _context22.next = 9;
            return this.Crypto.Encrypt(conk, chunk);

          case 9:
            chunk = _context22.sent;

          case 10:
            path = UrlJoin("q", writeToken, "parts");
            _context22.t0 = this.utils;
            _context22.t1 = this.HttpClient;
            _context22.next = 15;
            return this.authClient.AuthorizationHeader({
              libraryId: libraryId,
              objectId: objectId,
              update: true,
              encryption: encryption
            });

          case 15:
            _context22.t2 = _context22.sent;
            _context22.t3 = UrlJoin(path, partWriteToken);
            _context22.t4 = chunk;
            _context22.t5 = {
              headers: _context22.t2,
              method: "POST",
              path: _context22.t3,
              body: _context22.t4,
              bodyType: "BINARY",
              failover: false
            };
            _context22.t6 = _context22.t1.Request.call(_context22.t1, _context22.t5);
            _context22.next = 22;
            return _context22.t0.ResponseToJson.call(_context22.t0, _context22.t6);

          case 22:
          case "end":
            return _context22.stop();
        }
      }
    }, _callee22, this);
  }));

  return function (_x23) {
    return _ref40.apply(this, arguments);
  };
}();
/**
 * Finalize an open part draft
 *
 * @memberof module:ElvClient/Files+Parts
 * @methodGroup Parts
 * @namedParams
 * @param {string} libraryId - ID of the library
 * @param {string} objectId - ID of the object
 * @param {string} writeToken - Write token of the content object draft
 * @param {string} partWriteToken - Write token of the part
 * @param {string=} encryption=none - Desired encryption scheme. Options: 'none' (default), 'cgck'
 *
 * @returns {Promise<object>} - The finalize response for the new part
 */


exports.FinalizePart = /*#__PURE__*/function () {
  var _ref42 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee23(_ref41) {
    var libraryId, objectId, writeToken, partWriteToken, encryption, path;
    return _regeneratorRuntime.wrap(function _callee23$(_context23) {
      while (1) {
        switch (_context23.prev = _context23.next) {
          case 0:
            libraryId = _ref41.libraryId, objectId = _ref41.objectId, writeToken = _ref41.writeToken, partWriteToken = _ref41.partWriteToken, encryption = _ref41.encryption;
            ValidateParameters({
              libraryId: libraryId,
              objectId: objectId
            });
            ValidateWriteToken(writeToken);
            path = UrlJoin("q", writeToken, "parts");
            _context23.t0 = this.utils;
            _context23.t1 = this.HttpClient;
            _context23.next = 8;
            return this.authClient.AuthorizationHeader({
              libraryId: libraryId,
              objectId: objectId,
              update: true,
              encryption: encryption
            });

          case 8:
            _context23.t2 = _context23.sent;
            _context23.t3 = UrlJoin(path, partWriteToken);
            _context23.t4 = {
              headers: _context23.t2,
              method: "POST",
              path: _context23.t3,
              bodyType: "BINARY",
              body: "",
              failover: false
            };
            _context23.next = 13;
            return _context23.t1.Request.call(_context23.t1, _context23.t4);

          case 13:
            _context23.t5 = _context23.sent;
            _context23.next = 16;
            return _context23.t0.ResponseToJson.call(_context23.t0, _context23.t5);

          case 16:
            return _context23.abrupt("return", _context23.sent);

          case 17:
          case "end":
            return _context23.stop();
        }
      }
    }, _callee23, this);
  }));

  return function (_x24) {
    return _ref42.apply(this, arguments);
  };
}();
/**
 * Upload part to an object draft
 *
 * Note: If uploading a large file (especially with an HTML file and/or when using the FrameClient) it is
 * recommended to use the CreatePart + UploadPartChunk + FinalizePart flow to upload the file in
 * smaller chunks.
 *
 * @memberof module:ElvClient/Files+Parts
 * @methodGroup Parts
 * @namedParams
 * @param {string} libraryId - ID of the library
 * @param {string} objectId - ID of the object
 * @param {string} writeToken - Write token of the content object draft
 * @param {(File | ArrayBuffer | Buffer)} data - Data to upload
 * @param {number=} chunkSize=1000000 (1MB) - Chunk size, in bytes
 * @param {string=} encryption=none - Desired encryption scheme. Options: 'none' (default), 'cgck'
 * @param {function=} callback - If specified, will be periodically called with current upload status
 * - Signature: ({bytesFinished, bytesTotal}) => {}
 *
 * @returns {Promise<Object>} - Response containing information about the uploaded part
 */


exports.UploadPart = /*#__PURE__*/function () {
  var _ref44 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee24(_ref43) {
    var libraryId, objectId, writeToken, data, _ref43$encryption, encryption, _ref43$chunkSize, chunkSize, callback, partWriteToken, size, i, chunk;

    return _regeneratorRuntime.wrap(function _callee24$(_context24) {
      while (1) {
        switch (_context24.prev = _context24.next) {
          case 0:
            libraryId = _ref43.libraryId, objectId = _ref43.objectId, writeToken = _ref43.writeToken, data = _ref43.data, _ref43$encryption = _ref43.encryption, encryption = _ref43$encryption === void 0 ? "none" : _ref43$encryption, _ref43$chunkSize = _ref43.chunkSize, chunkSize = _ref43$chunkSize === void 0 ? 10000000 : _ref43$chunkSize, callback = _ref43.callback;
            ValidateParameters({
              libraryId: libraryId,
              objectId: objectId
            });
            ValidateWriteToken(writeToken);
            _context24.next = 5;
            return this.CreatePart({
              libraryId: libraryId,
              objectId: objectId,
              writeToken: writeToken,
              encryption: encryption
            });

          case 5:
            partWriteToken = _context24.sent;
            size = data.length || data.byteLength || data.size;

            if (callback) {
              callback({
                bytesFinished: 0,
                bytesTotal: size
              });
            }

            i = 0;

          case 9:
            if (!(i < size)) {
              _context24.next = 17;
              break;
            }

            chunk = data.slice(i, i + chunkSize);
            _context24.next = 13;
            return this.UploadPartChunk({
              libraryId: libraryId,
              objectId: objectId,
              writeToken: writeToken,
              partWriteToken: partWriteToken,
              chunk: chunk,
              encryption: encryption
            });

          case 13:
            if (callback) {
              callback({
                bytesFinished: Math.min(i + chunkSize, size),
                bytesTotal: size
              });
            }

          case 14:
            i += chunkSize;
            _context24.next = 9;
            break;

          case 17:
            _context24.next = 19;
            return this.FinalizePart({
              libraryId: libraryId,
              objectId: objectId,
              writeToken: writeToken,
              partWriteToken: partWriteToken,
              encryption: encryption
            });

          case 19:
            return _context24.abrupt("return", _context24.sent);

          case 20:
          case "end":
            return _context24.stop();
        }
      }
    }, _callee24, this);
  }));

  return function (_x25) {
    return _ref44.apply(this, arguments);
  };
}();
/**
 * Delete the specified part from a content draft
 *
 * @memberof module:ElvClient/Files+Parts
 * @methodGroup Parts
 * @namedParams
 * @param {string} libraryId - ID of the library
 * @param {string} objectId - ID of the object
 * @param {string} writeToken - Write token of the content object draft
 * @param {string} partHash - Hash of the part to delete
 */


exports.DeletePart = /*#__PURE__*/function () {
  var _ref46 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee25(_ref45) {
    var libraryId, objectId, writeToken, partHash, path;
    return _regeneratorRuntime.wrap(function _callee25$(_context25) {
      while (1) {
        switch (_context25.prev = _context25.next) {
          case 0:
            libraryId = _ref45.libraryId, objectId = _ref45.objectId, writeToken = _ref45.writeToken, partHash = _ref45.partHash;
            ValidateParameters({
              libraryId: libraryId,
              objectId: objectId
            });
            ValidateWriteToken(writeToken);
            ValidatePartHash(partHash);
            path = UrlJoin("q", writeToken, "parts", partHash);
            _context25.t0 = this.HttpClient;
            _context25.next = 8;
            return this.authClient.AuthorizationHeader({
              libraryId: libraryId,
              objectId: objectId,
              update: true
            });

          case 8:
            _context25.t1 = _context25.sent;
            _context25.t2 = path;
            _context25.t3 = {
              headers: _context25.t1,
              method: "DELETE",
              path: _context25.t2,
              failover: false
            };
            _context25.next = 13;
            return _context25.t0.Request.call(_context25.t0, _context25.t3);

          case 13:
          case "end":
            return _context25.stop();
        }
      }
    }, _callee25, this);
  }));

  return function (_x26) {
    return _ref46.apply(this, arguments);
  };
}();