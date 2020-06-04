var _defineProperty = require("@babel/runtime/helpers/defineProperty");

var _regeneratorRuntime = require("@babel/runtime/regenerator");

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

/**
 * Methods for accessing and managing access groups
 *
 * @module ElvClient/Files+Parts
 */
var Utils = require("../Utils");

var bs58 = require("bs58");

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


exports.ListFiles = function _callee(_ref) {
  var libraryId, objectId, versionHash, path;
  return _regeneratorRuntime.async(function _callee$(_context) {
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
          return _regeneratorRuntime.awrap(this.authClient.AuthorizationHeader({
            libraryId: libraryId,
            objectId: objectId,
            versionHash: versionHash
          }));

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
  }, null, this);
};
/**
 * Copy/reference files from S3 to a content object
 *
 * Expected format of fileInfo:
 *
 [
 {
       path: string,
       source: string
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
 * @param {string} encryption="none" - Encryption for uploaded files (copy only) - cgck | none
 * @param {boolean} copy=false - If true, will copy the data from S3 into the fabric. Otherwise, a reference to the content will be made.
 * @param {function=} callback - If specified, will be periodically called with current upload status
 * - Arguments (copy): { done: boolean, uploaded: number, total: number, uploadedFiles: number, totalFiles: number, fileStatus: Object }
 * - Arguments (reference): { done: boolean, uploadedFiles: number, totalFiles: number }
 */


exports.UploadFilesFromS3 = function _callee2(_ref2) {
  var libraryId, objectId, writeToken, region, bucket, fileInfo, accessKey, secret, _ref2$encryption, encryption, _ref2$copy, copy, callback, encryption_key, conk, defaults, ops, _ref3, id, status, done, progress, _progress;

  return _regeneratorRuntime.async(function _callee2$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          libraryId = _ref2.libraryId, objectId = _ref2.objectId, writeToken = _ref2.writeToken, region = _ref2.region, bucket = _ref2.bucket, fileInfo = _ref2.fileInfo, accessKey = _ref2.accessKey, secret = _ref2.secret, _ref2$encryption = _ref2.encryption, encryption = _ref2$encryption === void 0 ? "none" : _ref2$encryption, _ref2$copy = _ref2.copy, copy = _ref2$copy === void 0 ? false : _ref2$copy, callback = _ref2.callback;
          ValidateParameters({
            libraryId: libraryId,
            objectId: objectId
          });
          ValidateWriteToken(writeToken);
          this.Log("Uploading files from S3: ".concat(libraryId, " ").concat(objectId, " ").concat(writeToken));

          if (!(encryption === "cgck")) {
            _context2.next = 10;
            break;
          }

          _context2.next = 7;
          return _regeneratorRuntime.awrap(this.EncryptionConk({
            libraryId: libraryId,
            objectId: objectId,
            writeToken: writeToken
          }));

        case 7:
          conk = _context2.sent;
          conk = _objectSpread({}, conk, {
            secret_key: ""
          });
          encryption_key = "kp__".concat(bs58.encode(Buffer.from(JSON.stringify(conk))));

        case 10:
          defaults = {
            encryption_key: encryption_key,
            access: {
              protocol: "s3",
              platform: "aws",
              path: bucket,
              storage_endpoint: {
                region: region
              },
              cloud_credentials: {
                access_key_id: accessKey,
                secret_access_key: secret
              }
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

          _context2.next = 14;
          return _regeneratorRuntime.awrap(this.CreateFileUploadJob({
            libraryId: libraryId,
            objectId: objectId,
            writeToken: writeToken,
            ops: ops,
            defaults: defaults
          }));

        case 14:
          _ref3 = _context2.sent;
          id = _ref3.id;

        case 16:
          if (!true) {
            _context2.next = 39;
            break;
          }

          _context2.next = 19;
          return _regeneratorRuntime.awrap(new Promise(function (resolve) {
            return setTimeout(resolve, 1000);
          }));

        case 19:
          _context2.next = 21;
          return _regeneratorRuntime.awrap(this.UploadStatus({
            libraryId: libraryId,
            objectId: objectId,
            writeToken: writeToken,
            uploadId: id
          }));

        case 21:
          status = _context2.sent;

          if (!(status.errors && status.errors.length > 1)) {
            _context2.next = 26;
            break;
          }

          throw status.errors.join("\n");

        case 26:
          if (!status.error) {
            _context2.next = 31;
            break;
          }

          this.Log("S3 file upload failed:\n".concat(JSON.stringify(status, null, 2)));
          throw status.error;

        case 31:
          if (!(status.status.toLowerCase() === "failed")) {
            _context2.next = 33;
            break;
          }

          throw "File upload failed";

        case 33:
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
            _context2.next = 37;
            break;
          }

          return _context2.abrupt("break", 39);

        case 37:
          _context2.next = 16;
          break;

        case 39:
        case "end":
          return _context2.stop();
      }
    }
  }, null, this);
};
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


exports.UploadFiles = function _callee4(_ref4) {
  var _this = this;

  var libraryId, objectId, writeToken, fileInfo, _ref4$encryption, encryption, callback, conk, progress, fileDataMap, i, entry, _ref5, id, jobs, bufferSize, jobSpecs, prepared, uploaded, PrepareJobs, UploadJob, rateTestJobs, rates, j, start, elapsed, size, averageRate, concurrentUploads;

  return _regeneratorRuntime.async(function _callee4$(_context6) {
    while (1) {
      switch (_context6.prev = _context6.next) {
        case 0:
          libraryId = _ref4.libraryId, objectId = _ref4.objectId, writeToken = _ref4.writeToken, fileInfo = _ref4.fileInfo, _ref4$encryption = _ref4.encryption, encryption = _ref4$encryption === void 0 ? "none" : _ref4$encryption, callback = _ref4.callback;
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
          return _regeneratorRuntime.awrap(this.EncryptionConk({
            libraryId: libraryId,
            objectId: objectId,
            writeToken: writeToken
          }));

        case 7:
          conk = _context6.sent;

        case 8:
          // Extract file data into easily accessible hash while removing the data from the fileinfo for upload job creation
          progress = {};
          fileDataMap = {};

          for (i = 0; i < fileInfo.length; i++) {
            entry = fileInfo[i];
            entry.path = entry.path.replace(/^\/+/, "");

            if (encryption === "cgck") {
              entry.encryption = {
                scheme: "cgck"
              };
            }

            fileDataMap[entry.path] = entry.data;
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
          return _regeneratorRuntime.awrap(this.CreateFileUploadJob({
            libraryId: libraryId,
            objectId: objectId,
            writeToken: writeToken,
            ops: fileInfo,
            encryption: encryption
          }));

        case 15:
          _ref5 = _context6.sent;
          id = _ref5.id;
          jobs = _ref5.jobs;
          this.Log("Upload ID: ".concat(id));
          this.Log(jobs); // How far encryption can get ahead of upload

          bufferSize = 100 * 1024 * 1024;
          jobSpecs = [];
          prepared = 0;
          uploaded = 0; // Insert the data to upload into the job spec, encrypting if necessary

          PrepareJobs = function PrepareJobs() {
            var j, jobId, job, f, _fileInfo, data;

            return _regeneratorRuntime.async(function PrepareJobs$(_context3) {
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
                    return _regeneratorRuntime.awrap(new Promise(function (resolve) {
                      return setTimeout(resolve, 500);
                    }));

                  case 5:
                    _context3.next = 2;
                    break;

                  case 7:
                    // Retrieve job info
                    jobId = jobs[j];
                    _context3.next = 10;
                    return _regeneratorRuntime.awrap(_this.UploadJobStatus({
                      libraryId: libraryId,
                      objectId: objectId,
                      writeToken: writeToken,
                      uploadId: id,
                      jobId: jobId
                    }));

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
                    return _regeneratorRuntime.awrap(_this.Crypto.Encrypt(conk, data));

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
                    return _regeneratorRuntime.awrap(new Promise(function (resolve) {
                      return setTimeout(resolve, 50);
                    }));

                  case 28:
                    j++;
                    _context3.next = 1;
                    break;

                  case 31:
                  case "end":
                    return _context3.stop();
                }
              }
            });
          };

          UploadJob = function UploadJob(jobId, j) {
            var jobSpec, files, f, _fileInfo2;

            return _regeneratorRuntime.async(function UploadJob$(_context4) {
              while (1) {
                switch (_context4.prev = _context4.next) {
                  case 0:
                    if (jobSpecs[j]) {
                      _context4.next = 5;
                      break;
                    }

                    _context4.next = 3;
                    return _regeneratorRuntime.awrap(new Promise(function (resolve) {
                      return setTimeout(resolve, 500);
                    }));

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
                    return _regeneratorRuntime.awrap(_this.UploadFileData({
                      libraryId: libraryId,
                      objectId: objectId,
                      writeToken: writeToken,
                      uploadId: id,
                      jobId: jobId,
                      fileData: _fileInfo2.data
                    }));

                  case 12:
                    delete jobSpecs[j].files[f].data;
                    uploaded += _fileInfo2.len;

                    if (callback) {
                      progress[_fileInfo2.path] = _objectSpread({}, progress[_fileInfo2.path], {
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
            });
          }; // Preparing jobs is done asyncronously


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
          return _regeneratorRuntime.awrap(UploadJob(jobs[j], j));

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
          return _regeneratorRuntime.awrap(this.utils.LimitedMap(concurrentUploads, jobs, function _callee3(jobId, j) {
            return _regeneratorRuntime.async(function _callee3$(_context5) {
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
                    return _regeneratorRuntime.awrap(UploadJob(jobId, j));

                  case 4:
                  case "end":
                    return _context5.stop();
                }
              }
            });
          }));

        case 44:
        case "end":
          return _context6.stop();
      }
    }
  }, null, this);
};

exports.CreateFileUploadJob = function _callee5(_ref6) {
  var libraryId, objectId, writeToken, ops, _ref6$defaults, defaults, _ref6$encryption, encryption, path, body;

  return _regeneratorRuntime.async(function _callee5$(_context7) {
    while (1) {
      switch (_context7.prev = _context7.next) {
        case 0:
          libraryId = _ref6.libraryId, objectId = _ref6.objectId, writeToken = _ref6.writeToken, ops = _ref6.ops, _ref6$defaults = _ref6.defaults, defaults = _ref6$defaults === void 0 ? {} : _ref6$defaults, _ref6$encryption = _ref6.encryption, encryption = _ref6$encryption === void 0 ? "none" : _ref6$encryption;
          ValidateParameters({
            libraryId: libraryId,
            objectId: objectId
          });
          ValidateWriteToken(writeToken);
          this.Log("Creating file upload job: ".concat(libraryId, " ").concat(objectId, " ").concat(writeToken));
          this.Log(ops);
          path = UrlJoin("q", writeToken, "file_jobs");

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
          _context7.t0 = this.utils;
          _context7.t1 = this.HttpClient;
          _context7.next = 12;
          return _regeneratorRuntime.awrap(this.authClient.AuthorizationHeader({
            libraryId: libraryId,
            objectId: objectId,
            update: true,
            encryption: encryption
          }));

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
  }, null, this);
};

exports.UploadStatus = function _callee6(_ref7) {
  var libraryId, objectId, writeToken, uploadId, path;
  return _regeneratorRuntime.async(function _callee6$(_context8) {
    while (1) {
      switch (_context8.prev = _context8.next) {
        case 0:
          libraryId = _ref7.libraryId, objectId = _ref7.objectId, writeToken = _ref7.writeToken, uploadId = _ref7.uploadId;
          ValidateParameters({
            libraryId: libraryId,
            objectId: objectId
          });
          ValidateWriteToken(writeToken);
          path = UrlJoin("q", writeToken, "file_jobs", uploadId);
          _context8.t0 = this.utils;
          _context8.t1 = this.HttpClient;
          _context8.next = 8;
          return _regeneratorRuntime.awrap(this.authClient.AuthorizationHeader({
            libraryId: libraryId,
            objectId: objectId,
            update: true
          }));

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
  }, null, this);
};

exports.UploadJobStatus = function _callee7(_ref8) {
  var libraryId, objectId, writeToken, uploadId, jobId, path;
  return _regeneratorRuntime.async(function _callee7$(_context9) {
    while (1) {
      switch (_context9.prev = _context9.next) {
        case 0:
          libraryId = _ref8.libraryId, objectId = _ref8.objectId, writeToken = _ref8.writeToken, uploadId = _ref8.uploadId, jobId = _ref8.jobId;
          ValidateParameters({
            libraryId: libraryId,
            objectId: objectId
          });
          ValidateWriteToken(writeToken);
          path = UrlJoin("q", writeToken, "file_jobs", uploadId, "uploads", jobId);
          _context9.t0 = this.utils;
          _context9.t1 = this.HttpClient;
          _context9.next = 8;
          return _regeneratorRuntime.awrap(this.authClient.AuthorizationHeader({
            libraryId: libraryId,
            objectId: objectId,
            update: true
          }));

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
  }, null, this);
};

exports.UploadFileData = function _callee8(_ref9) {
  var libraryId, objectId, writeToken, uploadId, jobId, fileData, path;
  return _regeneratorRuntime.async(function _callee8$(_context10) {
    while (1) {
      switch (_context10.prev = _context10.next) {
        case 0:
          libraryId = _ref9.libraryId, objectId = _ref9.objectId, writeToken = _ref9.writeToken, uploadId = _ref9.uploadId, jobId = _ref9.jobId, fileData = _ref9.fileData;
          ValidateParameters({
            libraryId: libraryId,
            objectId: objectId
          });
          ValidateWriteToken(writeToken);
          path = UrlJoin("q", writeToken, "file_jobs", uploadId, jobId);
          _context10.t0 = _regeneratorRuntime;
          _context10.t1 = this.utils;
          _context10.t2 = this.HttpClient;
          _context10.t3 = path;
          _context10.t4 = fileData;
          _context10.t5 = _objectSpread;
          _context10.t6 = {
            "Content-type": "application/octet-stream"
          };
          _context10.next = 13;
          return _regeneratorRuntime.awrap(this.authClient.AuthorizationHeader({
            libraryId: libraryId,
            objectId: objectId,
            update: true
          }));

        case 13:
          _context10.t7 = _context10.sent;
          _context10.t8 = (0, _context10.t5)(_context10.t6, _context10.t7);
          _context10.t9 = {
            method: "POST",
            path: _context10.t3,
            body: _context10.t4,
            bodyType: "BINARY",
            headers: _context10.t8,
            failover: false
          };
          _context10.t10 = _context10.t2.Request.call(_context10.t2, _context10.t9);
          _context10.t11 = _context10.t1.ResponseToJson.call(_context10.t1, _context10.t10);
          _context10.next = 20;
          return _context10.t0.awrap.call(_context10.t0, _context10.t11);

        case 20:
        case "end":
          return _context10.stop();
      }
    }
  }, null, this);
};

exports.FinalizeUploadJob = function _callee9(_ref10) {
  var libraryId, objectId, writeToken, path;
  return _regeneratorRuntime.async(function _callee9$(_context11) {
    while (1) {
      switch (_context11.prev = _context11.next) {
        case 0:
          libraryId = _ref10.libraryId, objectId = _ref10.objectId, writeToken = _ref10.writeToken;
          ValidateParameters({
            libraryId: libraryId,
            objectId: objectId
          });
          ValidateWriteToken(writeToken);
          this.Log("Finalizing upload job: ".concat(libraryId, " ").concat(objectId, " ").concat(writeToken));
          path = UrlJoin("q", writeToken, "files");
          _context11.t0 = _regeneratorRuntime;
          _context11.t1 = this.HttpClient;
          _context11.t2 = path;
          _context11.next = 10;
          return _regeneratorRuntime.awrap(this.authClient.AuthorizationHeader({
            libraryId: libraryId,
            objectId: objectId,
            update: true
          }));

        case 10:
          _context11.t3 = _context11.sent;
          _context11.t4 = {
            method: "POST",
            path: _context11.t2,
            bodyType: "BINARY",
            headers: _context11.t3,
            failover: false
          };
          _context11.t5 = _context11.t1.Request.call(_context11.t1, _context11.t4);
          _context11.next = 15;
          return _context11.t0.awrap.call(_context11.t0, _context11.t5);

        case 15:
        case "end":
          return _context11.stop();
      }
    }
  }, null, this);
};
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


exports.CreateFileDirectories = function _callee10(_ref11) {
  var libraryId, objectId, writeToken, filePaths, ops;
  return _regeneratorRuntime.async(function _callee10$(_context12) {
    while (1) {
      switch (_context12.prev = _context12.next) {
        case 0:
          libraryId = _ref11.libraryId, objectId = _ref11.objectId, writeToken = _ref11.writeToken, filePaths = _ref11.filePaths;
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
          return _regeneratorRuntime.awrap(this.CreateFileUploadJob({
            libraryId: libraryId,
            objectId: objectId,
            writeToken: writeToken,
            ops: ops
          }));

        case 8:
        case "end":
          return _context12.stop();
      }
    }
  }, null, this);
};
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


exports.DeleteFiles = function _callee11(_ref12) {
  var libraryId, objectId, writeToken, filePaths, ops;
  return _regeneratorRuntime.async(function _callee11$(_context13) {
    while (1) {
      switch (_context13.prev = _context13.next) {
        case 0:
          libraryId = _ref12.libraryId, objectId = _ref12.objectId, writeToken = _ref12.writeToken, filePaths = _ref12.filePaths;
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
          return _regeneratorRuntime.awrap(this.CreateFileUploadJob({
            libraryId: libraryId,
            objectId: objectId,
            writeToken: writeToken,
            ops: ops
          }));

        case 8:
        case "end":
          return _context13.stop();
      }
    }
  }, null, this);
};
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
 * @param {function=} callback - If specified, will be periodically called with current download status - Required if `chunked` is true
 * - Signature: ({bytesFinished, bytesTotal}) => {}
 * - Signature (chunked): ({bytesFinished, bytesTotal, chunk}) => {}
 *
 * @returns {Promise<ArrayBuffer> | undefined} - No return if chunked is specified, file data in the requested format otherwise
 */


exports.DownloadFile = function _callee12(_ref13) {
  var libraryId, objectId, versionHash, writeToken, filePath, _ref13$format, format, _ref13$chunked, chunked, _ref13$chunkSize, chunkSize, callback, fileInfo, encrypted, encryption, path, headers, bytesTotal;

  return _regeneratorRuntime.async(function _callee12$(_context14) {
    while (1) {
      switch (_context14.prev = _context14.next) {
        case 0:
          libraryId = _ref13.libraryId, objectId = _ref13.objectId, versionHash = _ref13.versionHash, writeToken = _ref13.writeToken, filePath = _ref13.filePath, _ref13$format = _ref13.format, format = _ref13$format === void 0 ? "arrayBuffer" : _ref13$format, _ref13$chunked = _ref13.chunked, chunked = _ref13$chunked === void 0 ? false : _ref13$chunked, _ref13$chunkSize = _ref13.chunkSize, chunkSize = _ref13$chunkSize === void 0 ? 1000000 : _ref13$chunkSize, callback = _ref13.callback;
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
          return _regeneratorRuntime.awrap(this.ContentObjectMetadata({
            libraryId: libraryId,
            objectId: objectId,
            versionHash: versionHash,
            writeToken: writeToken,
            metadataSubtree: UrlJoin("files", filePath)
          }));

        case 6:
          fileInfo = _context14.sent;
          encrypted = fileInfo && fileInfo["."].encryption && fileInfo["."].encryption.scheme === "cgck";
          encryption = encrypted ? "cgck" : undefined;
          path = UrlJoin("q", writeToken || versionHash || objectId, "files", filePath);
          _context14.next = 12;
          return _regeneratorRuntime.awrap(this.authClient.AuthorizationHeader({
            libraryId: libraryId,
            objectId: objectId,
            versionHash: versionHash,
            encryption: encryption
          }));

        case 12:
          headers = _context14.sent;
          headers.Accept = "*/*"; // If not owner, indicate re-encryption

          _context14.t0 = this.utils;
          _context14.t1 = this.signer.address;
          _context14.next = 18;
          return _regeneratorRuntime.awrap(this.ContentObjectOwner({
            objectId: objectId
          }));

        case 18:
          _context14.t2 = _context14.sent;

          if (_context14.t0.EqualAddress.call(_context14.t0, _context14.t1, _context14.t2)) {
            _context14.next = 21;
            break;
          }

          headers["X-Content-Fabric-Decryption-Mode"] = "reencrypt";

        case 21:
          bytesTotal = fileInfo["."].size;

          if (!encrypted) {
            _context14.next = 41;
            break;
          }

          _context14.t3 = _regeneratorRuntime;
          _context14.t4 = this;
          _context14.next = 27;
          return _regeneratorRuntime.awrap(this.EncryptionConk({
            libraryId: libraryId,
            objectId: objectId
          }));

        case 27:
          _context14.t5 = _context14.sent;
          _context14.t6 = path;
          _context14.t7 = bytesTotal;
          _context14.t8 = headers;
          _context14.t9 = callback;
          _context14.t10 = format;
          _context14.t11 = chunked;
          _context14.t12 = {
            conk: _context14.t5,
            downloadPath: _context14.t6,
            bytesTotal: _context14.t7,
            headers: _context14.t8,
            callback: _context14.t9,
            format: _context14.t10,
            chunked: _context14.t11
          };
          _context14.t13 = _context14.t4.DownloadEncrypted.call(_context14.t4, _context14.t12);
          _context14.next = 38;
          return _context14.t3.awrap.call(_context14.t3, _context14.t13);

        case 38:
          return _context14.abrupt("return", _context14.sent);

        case 41:
          _context14.next = 43;
          return _regeneratorRuntime.awrap(this.Download({
            downloadPath: path,
            bytesTotal: bytesTotal,
            headers: headers,
            callback: callback,
            format: format,
            chunked: chunked,
            chunkSize: chunkSize
          }));

        case 43:
          return _context14.abrupt("return", _context14.sent);

        case 44:
        case "end":
          return _context14.stop();
      }
    }
  }, null, this);
};
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


exports.ContentParts = function _callee13(_ref14) {
  var libraryId, objectId, versionHash, path, response;
  return _regeneratorRuntime.async(function _callee13$(_context15) {
    while (1) {
      switch (_context15.prev = _context15.next) {
        case 0:
          libraryId = _ref14.libraryId, objectId = _ref14.objectId, versionHash = _ref14.versionHash;
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
          _context15.t0 = _regeneratorRuntime;
          _context15.t1 = this.utils;
          _context15.t2 = this.HttpClient;
          _context15.next = 10;
          return _regeneratorRuntime.awrap(this.authClient.AuthorizationHeader({
            libraryId: libraryId,
            objectId: objectId,
            versionHash: versionHash
          }));

        case 10:
          _context15.t3 = _context15.sent;
          _context15.t4 = path;
          _context15.t5 = {
            headers: _context15.t3,
            method: "GET",
            path: _context15.t4
          };
          _context15.t6 = _context15.t2.Request.call(_context15.t2, _context15.t5);
          _context15.t7 = _context15.t1.ResponseToJson.call(_context15.t1, _context15.t6);
          _context15.next = 17;
          return _context15.t0.awrap.call(_context15.t0, _context15.t7);

        case 17:
          response = _context15.sent;
          return _context15.abrupt("return", response.parts);

        case 19:
        case "end":
          return _context15.stop();
      }
    }
  }, null, this);
};
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


exports.ContentPart = function _callee14(_ref15) {
  var libraryId, objectId, versionHash, partHash, path;
  return _regeneratorRuntime.async(function _callee14$(_context16) {
    while (1) {
      switch (_context16.prev = _context16.next) {
        case 0:
          libraryId = _ref15.libraryId, objectId = _ref15.objectId, versionHash = _ref15.versionHash, partHash = _ref15.partHash;
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
          _context16.t0 = _regeneratorRuntime;
          _context16.t1 = this.utils;
          _context16.t2 = this.HttpClient;
          _context16.next = 11;
          return _regeneratorRuntime.awrap(this.authClient.AuthorizationHeader({
            libraryId: libraryId,
            objectId: objectId,
            versionHash: versionHash
          }));

        case 11:
          _context16.t3 = _context16.sent;
          _context16.t4 = path;
          _context16.t5 = {
            headers: _context16.t3,
            method: "GET",
            path: _context16.t4
          };
          _context16.t6 = _context16.t2.Request.call(_context16.t2, _context16.t5);
          _context16.t7 = _context16.t1.ResponseToJson.call(_context16.t1, _context16.t6);
          _context16.next = 18;
          return _context16.t0.awrap.call(_context16.t0, _context16.t7);

        case 18:
          return _context16.abrupt("return", _context16.sent);

        case 19:
        case "end":
          return _context16.stop();
      }
    }
  }, null, this);
};
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


exports.DownloadPart = function _callee15(_ref16) {
  var libraryId, objectId, versionHash, writeToken, partHash, _ref16$format, format, _ref16$chunked, chunked, _ref16$chunkSize, chunkSize, callback, encrypted, encryption, path, headers, bytesTotal;

  return _regeneratorRuntime.async(function _callee15$(_context17) {
    while (1) {
      switch (_context17.prev = _context17.next) {
        case 0:
          libraryId = _ref16.libraryId, objectId = _ref16.objectId, versionHash = _ref16.versionHash, writeToken = _ref16.writeToken, partHash = _ref16.partHash, _ref16$format = _ref16.format, format = _ref16$format === void 0 ? "arrayBuffer" : _ref16$format, _ref16$chunked = _ref16.chunked, chunked = _ref16$chunked === void 0 ? false : _ref16$chunked, _ref16$chunkSize = _ref16.chunkSize, chunkSize = _ref16$chunkSize === void 0 ? 10000000 : _ref16$chunkSize, callback = _ref16.callback;
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
          return _regeneratorRuntime.awrap(this.authClient.AuthorizationHeader({
            libraryId: libraryId,
            objectId: objectId,
            versionHash: versionHash,
            encryption: encryption
          }));

        case 9:
          headers = _context17.sent;
          _context17.next = 12;
          return _regeneratorRuntime.awrap(this.ContentPart({
            libraryId: libraryId,
            objectId: objectId,
            versionHash: versionHash,
            partHash: partHash
          }));

        case 12:
          bytesTotal = _context17.sent.part.size;

          if (!encrypted) {
            _context17.next = 32;
            break;
          }

          _context17.t0 = _regeneratorRuntime;
          _context17.t1 = this;
          _context17.next = 18;
          return _regeneratorRuntime.awrap(this.EncryptionConk({
            libraryId: libraryId,
            objectId: objectId
          }));

        case 18:
          _context17.t2 = _context17.sent;
          _context17.t3 = path;
          _context17.t4 = bytesTotal;
          _context17.t5 = headers;
          _context17.t6 = callback;
          _context17.t7 = format;
          _context17.t8 = chunked;
          _context17.t9 = {
            conk: _context17.t2,
            downloadPath: _context17.t3,
            bytesTotal: _context17.t4,
            headers: _context17.t5,
            callback: _context17.t6,
            format: _context17.t7,
            chunked: _context17.t8
          };
          _context17.t10 = _context17.t1.DownloadEncrypted.call(_context17.t1, _context17.t9);
          _context17.next = 29;
          return _context17.t0.awrap.call(_context17.t0, _context17.t10);

        case 29:
          return _context17.abrupt("return", _context17.sent);

        case 32:
          _context17.next = 34;
          return _regeneratorRuntime.awrap(this.Download({
            downloadPath: path,
            bytesTotal: bytesTotal,
            headers: headers,
            callback: callback,
            format: format,
            chunked: chunked,
            chunkSize: chunkSize
          }));

        case 34:
          return _context17.abrupt("return", _context17.sent);

        case 35:
        case "end":
          return _context17.stop();
      }
    }
  }, null, this);
};

exports.Download = function _callee16(_ref17) {
  var downloadPath, headers, bytesTotal, _ref17$chunked, chunked, _ref17$chunkSize, chunkSize, callback, _ref17$format, format, outputChunks, bytesFinished, totalChunks, i, response;

  return _regeneratorRuntime.async(function _callee16$(_context18) {
    while (1) {
      switch (_context18.prev = _context18.next) {
        case 0:
          downloadPath = _ref17.downloadPath, headers = _ref17.headers, bytesTotal = _ref17.bytesTotal, _ref17$chunked = _ref17.chunked, chunked = _ref17$chunked === void 0 ? false : _ref17$chunked, _ref17$chunkSize = _ref17.chunkSize, chunkSize = _ref17$chunkSize === void 0 ? 2000000 : _ref17$chunkSize, callback = _ref17.callback, _ref17$format = _ref17.format, format = _ref17$format === void 0 ? "arrayBuffer" : _ref17$format;

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
          return _regeneratorRuntime.awrap(this.HttpClient.Request({
            path: downloadPath,
            headers: headers,
            method: "GET"
          }));

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
          return _regeneratorRuntime.awrap(this.utils.ResponseToFormat(format, response));

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
          if (callback) {
            callback({
              bytesFinished: bytesFinished,
              bytesTotal: bytesTotal
            });
          }

          _context18.t5 = outputChunks;
          _context18.t6 = Buffer;
          _context18.next = 29;
          return _regeneratorRuntime.awrap(response.arrayBuffer());

        case 29:
          _context18.t7 = _context18.sent;
          _context18.t8 = _context18.t6.from.call(_context18.t6, _context18.t7);

          _context18.t5.push.call(_context18.t5, _context18.t8);

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
          return _regeneratorRuntime.awrap(this.utils.ResponseToFormat(format, new Response(Buffer.concat(outputChunks))));

        case 38:
          return _context18.abrupt("return", _context18.sent);

        case 39:
        case "end":
          return _context18.stop();
      }
    }
  }, null, this);
};

exports.DownloadEncrypted = function _callee18(_ref18) {
  var _this2 = this;

  var conk, downloadPath, bytesTotal, headers, callback, _ref18$format, format, _ref18$chunked, chunked, isReencryption, chunkSize, bytesFinished, outputChunks, stream, totalChunks, i, response;

  return _regeneratorRuntime.async(function _callee18$(_context20) {
    while (1) {
      switch (_context20.prev = _context20.next) {
        case 0:
          conk = _ref18.conk, downloadPath = _ref18.downloadPath, bytesTotal = _ref18.bytesTotal, headers = _ref18.headers, callback = _ref18.callback, _ref18$format = _ref18.format, format = _ref18$format === void 0 ? "arrayBuffer" : _ref18$format, _ref18$chunked = _ref18.chunked, chunked = _ref18$chunked === void 0 ? false : _ref18$chunked;

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
          return _regeneratorRuntime.awrap(this.Crypto.OpenDecryptionStream(conk));

        case 10:
          stream = _context20.sent;
          stream.on("data", function _callee17(chunk) {
            var arrayBuffer;
            return _regeneratorRuntime.async(function _callee17$(_context19) {
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
                    return _regeneratorRuntime.awrap(_this2.utils.ResponseToFormat(format, new Response(arrayBuffer)));

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
            });
          });
          totalChunks = Math.ceil(bytesTotal / chunkSize);
          i = 0;

        case 14:
          if (!(i < totalChunks)) {
            _context20.next = 30;
            break;
          }

          headers["Range"] = "bytes=".concat(bytesFinished, "-").concat(bytesFinished + chunkSize - 1);
          _context20.next = 18;
          return _regeneratorRuntime.awrap(this.HttpClient.Request({
            headers: headers,
            method: "GET",
            path: downloadPath
          }));

        case 18:
          response = _context20.sent;
          bytesFinished = Math.min(bytesFinished + chunkSize, bytesTotal);
          _context20.t0 = stream;
          _context20.t1 = Uint8Array;
          _context20.next = 24;
          return _regeneratorRuntime.awrap(response.arrayBuffer());

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
          return _regeneratorRuntime.awrap(new Promise(function (resolve) {
            return stream.on("finish", function () {
              resolve();
            });
          }));

        case 33:
          if (chunked) {
            _context20.next = 37;
            break;
          }

          _context20.next = 36;
          return _regeneratorRuntime.awrap(this.utils.ResponseToFormat(format, new Response(Buffer.concat(outputChunks))));

        case 36:
          return _context20.abrupt("return", _context20.sent);

        case 37:
        case "end":
          return _context20.stop();
      }
    }
  }, null, this);
};
/**
 * Create a part upload draft
 *
 * @memberof module:ElvClient/Files+Parts
 * @methodGroup Parts
 * @namedParams
 * @param {string} libraryId - ID of the library
 * @param {string} objectId - ID of the object
 * @param {string} writeToken - Write token of the content object draft
 * @param {string=} encryption=none - Desired encryption scheme. Options: 'none (default)', 'cgck'
 *
 * @returns {Promise<string>} - The part write token for the part draft
 */


exports.CreatePart = function _callee19(_ref19) {
  var libraryId, objectId, writeToken, encryption, path, openResponse;
  return _regeneratorRuntime.async(function _callee19$(_context21) {
    while (1) {
      switch (_context21.prev = _context21.next) {
        case 0:
          libraryId = _ref19.libraryId, objectId = _ref19.objectId, writeToken = _ref19.writeToken, encryption = _ref19.encryption;
          ValidateParameters({
            libraryId: libraryId,
            objectId: objectId
          });
          ValidateWriteToken(writeToken);
          path = UrlJoin("q", writeToken, "parts");
          _context21.t0 = _regeneratorRuntime;
          _context21.t1 = this.utils;
          _context21.t2 = this.HttpClient;
          _context21.next = 9;
          return _regeneratorRuntime.awrap(this.authClient.AuthorizationHeader({
            libraryId: libraryId,
            objectId: objectId,
            update: true,
            encryption: encryption
          }));

        case 9:
          _context21.t3 = _context21.sent;
          _context21.t4 = path;
          _context21.t5 = {
            headers: _context21.t3,
            method: "POST",
            path: _context21.t4,
            bodyType: "BINARY",
            body: "",
            failover: false
          };
          _context21.t6 = _context21.t2.Request.call(_context21.t2, _context21.t5);
          _context21.t7 = _context21.t1.ResponseToJson.call(_context21.t1, _context21.t6);
          _context21.next = 16;
          return _context21.t0.awrap.call(_context21.t0, _context21.t7);

        case 16:
          openResponse = _context21.sent;
          return _context21.abrupt("return", openResponse.part.write_token);

        case 18:
        case "end":
          return _context21.stop();
      }
    }
  }, null, this);
};
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
 * @param {string=} encryption=none - Desired encryption scheme. Options: 'none (default)', 'cgck'
 *
 * @returns {Promise<string>} - The part write token for the part draft
 */


exports.UploadPartChunk = function _callee20(_ref20) {
  var libraryId, objectId, writeToken, partWriteToken, chunk, encryption, _conk, path;

  return _regeneratorRuntime.async(function _callee20$(_context22) {
    while (1) {
      switch (_context22.prev = _context22.next) {
        case 0:
          libraryId = _ref20.libraryId, objectId = _ref20.objectId, writeToken = _ref20.writeToken, partWriteToken = _ref20.partWriteToken, chunk = _ref20.chunk, encryption = _ref20.encryption;
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
          return _regeneratorRuntime.awrap(this.EncryptionConk({
            libraryId: libraryId,
            objectId: objectId,
            writeToken: writeToken
          }));

        case 6:
          _conk = _context22.sent;
          _context22.next = 9;
          return _regeneratorRuntime.awrap(this.Crypto.Encrypt(_conk, chunk));

        case 9:
          chunk = _context22.sent;

        case 10:
          path = UrlJoin("q", writeToken, "parts");
          _context22.t0 = _regeneratorRuntime;
          _context22.t1 = this.utils;
          _context22.t2 = this.HttpClient;
          _context22.next = 16;
          return _regeneratorRuntime.awrap(this.authClient.AuthorizationHeader({
            libraryId: libraryId,
            objectId: objectId,
            update: true,
            encryption: encryption
          }));

        case 16:
          _context22.t3 = _context22.sent;
          _context22.t4 = UrlJoin(path, partWriteToken);
          _context22.t5 = chunk;
          _context22.t6 = {
            headers: _context22.t3,
            method: "POST",
            path: _context22.t4,
            body: _context22.t5,
            bodyType: "BINARY",
            failover: false
          };
          _context22.t7 = _context22.t2.Request.call(_context22.t2, _context22.t6);
          _context22.t8 = _context22.t1.ResponseToJson.call(_context22.t1, _context22.t7);
          _context22.next = 24;
          return _context22.t0.awrap.call(_context22.t0, _context22.t8);

        case 24:
        case "end":
          return _context22.stop();
      }
    }
  }, null, this);
};
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
 * @param {string=} encryption=none - Desired encryption scheme. Options: 'none (default)', 'cgck'
 *
 * @returns {Promise<object>} - The finalize response for the new part
 */


exports.FinalizePart = function _callee21(_ref21) {
  var libraryId, objectId, writeToken, partWriteToken, encryption, path;
  return _regeneratorRuntime.async(function _callee21$(_context23) {
    while (1) {
      switch (_context23.prev = _context23.next) {
        case 0:
          libraryId = _ref21.libraryId, objectId = _ref21.objectId, writeToken = _ref21.writeToken, partWriteToken = _ref21.partWriteToken, encryption = _ref21.encryption;
          ValidateParameters({
            libraryId: libraryId,
            objectId: objectId
          });
          ValidateWriteToken(writeToken);
          path = UrlJoin("q", writeToken, "parts");
          _context23.t0 = _regeneratorRuntime;
          _context23.t1 = this.utils;
          _context23.t2 = _regeneratorRuntime;
          _context23.t3 = this.HttpClient;
          _context23.next = 10;
          return _regeneratorRuntime.awrap(this.authClient.AuthorizationHeader({
            libraryId: libraryId,
            objectId: objectId,
            update: true,
            encryption: encryption
          }));

        case 10:
          _context23.t4 = _context23.sent;
          _context23.t5 = UrlJoin(path, partWriteToken);
          _context23.t6 = {
            headers: _context23.t4,
            method: "POST",
            path: _context23.t5,
            bodyType: "BINARY",
            body: "",
            failover: false
          };
          _context23.t7 = _context23.t3.Request.call(_context23.t3, _context23.t6);
          _context23.next = 16;
          return _context23.t2.awrap.call(_context23.t2, _context23.t7);

        case 16:
          _context23.t8 = _context23.sent;
          _context23.t9 = _context23.t1.ResponseToJson.call(_context23.t1, _context23.t8);
          _context23.next = 20;
          return _context23.t0.awrap.call(_context23.t0, _context23.t9);

        case 20:
          return _context23.abrupt("return", _context23.sent);

        case 21:
        case "end":
          return _context23.stop();
      }
    }
  }, null, this);
};
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
 * @param {string=} encryption=none - Desired encryption scheme. Options: 'none (default)', 'cgck'
 * @param {function=} callback - If specified, will be periodically called with current upload status
 * - Signature: ({bytesFinished, bytesTotal}) => {}
 *
 * @returns {Promise<Object>} - Response containing information about the uploaded part
 */


exports.UploadPart = function _callee22(_ref22) {
  var libraryId, objectId, writeToken, data, _ref22$encryption, encryption, _ref22$chunkSize, chunkSize, callback, partWriteToken, size, i, chunk;

  return _regeneratorRuntime.async(function _callee22$(_context24) {
    while (1) {
      switch (_context24.prev = _context24.next) {
        case 0:
          libraryId = _ref22.libraryId, objectId = _ref22.objectId, writeToken = _ref22.writeToken, data = _ref22.data, _ref22$encryption = _ref22.encryption, encryption = _ref22$encryption === void 0 ? "none" : _ref22$encryption, _ref22$chunkSize = _ref22.chunkSize, chunkSize = _ref22$chunkSize === void 0 ? 10000000 : _ref22$chunkSize, callback = _ref22.callback;
          ValidateParameters({
            libraryId: libraryId,
            objectId: objectId
          });
          ValidateWriteToken(writeToken);
          _context24.next = 5;
          return _regeneratorRuntime.awrap(this.CreatePart({
            libraryId: libraryId,
            objectId: objectId,
            writeToken: writeToken,
            encryption: encryption
          }));

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
          return _regeneratorRuntime.awrap(this.UploadPartChunk({
            libraryId: libraryId,
            objectId: objectId,
            writeToken: writeToken,
            partWriteToken: partWriteToken,
            chunk: chunk,
            encryption: encryption
          }));

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
          return _regeneratorRuntime.awrap(this.FinalizePart({
            libraryId: libraryId,
            objectId: objectId,
            writeToken: writeToken,
            partWriteToken: partWriteToken,
            encryption: encryption
          }));

        case 19:
          return _context24.abrupt("return", _context24.sent);

        case 20:
        case "end":
          return _context24.stop();
      }
    }
  }, null, this);
};
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


exports.DeletePart = function _callee23(_ref23) {
  var libraryId, objectId, writeToken, partHash, path;
  return _regeneratorRuntime.async(function _callee23$(_context25) {
    while (1) {
      switch (_context25.prev = _context25.next) {
        case 0:
          libraryId = _ref23.libraryId, objectId = _ref23.objectId, writeToken = _ref23.writeToken, partHash = _ref23.partHash;
          ValidateParameters({
            libraryId: libraryId,
            objectId: objectId
          });
          ValidateWriteToken(writeToken);
          ValidatePartHash(partHash);
          path = UrlJoin("q", writeToken, "parts", partHash);
          _context25.t0 = _regeneratorRuntime;
          _context25.t1 = this.HttpClient;
          _context25.next = 9;
          return _regeneratorRuntime.awrap(this.authClient.AuthorizationHeader({
            libraryId: libraryId,
            objectId: objectId,
            update: true
          }));

        case 9:
          _context25.t2 = _context25.sent;
          _context25.t3 = path;
          _context25.t4 = {
            headers: _context25.t2,
            method: "DELETE",
            path: _context25.t3,
            failover: false
          };
          _context25.t5 = _context25.t1.Request.call(_context25.t1, _context25.t4);
          _context25.next = 15;
          return _context25.t0.awrap.call(_context25.t0, _context25.t5);

        case 15:
        case "end":
          return _context25.stop();
      }
    }
  }, null, this);
};