/**
 * Methods for accessing and managing access groups
 *
 * @module ElvClient/Files+Parts
 */

const Utils = require("../Utils");
const URI = require("urijs");

let fs;
if(Utils.Platform() === Utils.PLATFORM_NODE) {
  // Define Response in node
  // eslint-disable-next-line no-global-assign
  globalThis.Response = (require("node-fetch")).Response;
  fs = require("fs");
}

const UrlJoin = require("url-join");

const {
  ValidatePresence,
  ValidateWriteToken,
  ValidatePartHash,
  ValidateParameters
} = require("../Validation");

// normalizedURI : string -> URI
// creates a normalized URI from string
const normalizedURI = str => URI(str)
  .normalizeProtocol()
  .normalizeHostname()
  .normalizePath()
  .normalizeQuery()
  .normalizeHash();

// isHttpUrl : URI -> boolean
// Returns true if uri looks like a well-formed http or https url
const isHttpUrl = uri => uri.is("url") && uri.is("absolute") && ["http", "https"].contains(uri.protocol());

// isS3SignedUrl: uri -> boolean
// returns true if uri looks like an S3 signed URL
const isSignedS3Url = uri => isHttpUrl(uri) &&
  // doesn't end in '/'
  uri.filename() !== "" &&
  // has a bucket
  uri.directory() !== "" &&
  // has at least the following S3 query parameters
  uri.hasQuery("X-Amz-Credential") &&
  uri.hasQuery("X-Amz-Security-Token") &&
  uri.hasQuery("X-Amz-Signature") &&
  uri.hasQuery("X-Amz-Credential");

// isS3Path : URI -> boolean
// Returns true if uri looks like an s3 path "s3://bucket/file_path"
const isS3Path = uri => uri.is("url") &&
  uri.is("absolute") &&
  // starts with "s3://"
  uri.protocol() === "s3" &&
  // doesn't end in '/'
  uri.filename() !== "" &&
  // has a bucket
  uri.directory() !== "/" &&
  // doesn't have query params
  uri.query() === "";

// s3PathBucket : URI -> string
// Returns a string containing the bucket name, e.g.:
// s3PathBucket(URI("s3://myHost/myBucket/foo/bar/video.mp4")) === "myBucket"
const s3PathBucket = uri => "/" + uri.segmentCoded(0);

// s3PathWithoutBucket : URI -> string
// Returns a string containing the path after the bucket name, e.g.:
// s3PathWithoutBucket(URI("s3://myHost/myBucket/foo/bar/video.mp4")) === "/foo/bar/video.mp4"
const s3PathWithoutBucket = uri => "/" + uri.segmentCoded().slice(1).join("/");

// parseSourcePathS3 : string -> Object
// Parses source path info based on whether it is:
//   a plain path
//   an s3 unsigned url "s3://..."
//   an s3 signed url "http://...?X-Amz-..."
const parseSourcePathS3 = sourcePath => {
  let uri;

  let pathBucket;
  let pathType;
  let plainSourcePath;

  try {
    uri = normalizedURI(sourcePath);
    if(isS3Path(uri)) {
      pathType = "s3unsigned";
    } else if(isSignedS3Url(uri)) {
      pathType = "s3signed";
    } else pathType = "plain";
  } catch(e) {
    pathType = "plain";
  }

  switch(pathType) {
    case "plain":
      plainSourcePath = sourcePath;
      break;
    case "s3signed":
    case "s3unsigned":
      pathBucket = s3PathBucket(uri);
      plainSourcePath = s3PathWithoutBucket(uri);
      break;
    default:
      // not expected, but check in case of future code changes:
      throw Error(`Unrecognized path type "${pathType}"`);
  }

  return {
    pathBucket,
    pathType,
    plainSourcePath
  };
};

// s3op : Object -> Object
// Creates one ops array element for an S3 file upload job
// sourcePath is a string containing plain file path, s3://host/bucket/file_path, or pre-signed s3 url http[s]://host/bucket/file_path...?X-Amz-...
const s3opsElement = ({
  copy,
  destPath,
  encryption,
  sourcePath,
  s3accessKey,
  s3bucket,
  // s3endpoint,  // AWS_ENDPOINT_URL, not yet supported
  s3region,
  s3secret
}) => {

  const s3pathInfo = parseSourcePathS3(sourcePath);
  const pathIsSignedUrl = s3pathInfo.pathType === "s3signed";
  const s3bucketFromPath = s3pathInfo.pathBucket;

  if(s3bucket && s3bucketFromPath && s3bucket !== s3bucketFromPath) {
    throw Error(`S3 bucket '${s3bucket}' does not match bucket '${s3bucketFromPath}' in path '${sourcePath}'`);
  }

  let cloud_credentials;
  if(pathIsSignedUrl) {
    cloud_credentials = {
      signed_url: sourcePath
    };
  } else {
    if(!s3accessKey) throw Error(`AWS_KEY needed for source file ${sourcePath}`);
    if(!s3secret) throw Error(`AWS_SECRET needed for source file ${sourcePath}`);
    if(!s3region) throw Error(`AWS_REGION needed for source file ${sourcePath}`);
    if(!s3bucket && !s3bucketFromPath) throw Error(`AWS_BUCKET needed for source file ${sourcePath}`);
    cloud_credentials = {
      access_key_id: s3accessKey,
      secret_access_key: s3secret
    };
  }

  let access = {
    cloud_credentials,
    path: pathIsSignedUrl ? undefined : (s3bucketFromPath || s3bucket),
    platform: "aws",
    protocol: "s3",
    storage_endpoint: {     // eventually add s3endpoint
      region: s3region
    }
  };

  const sourceInfo = {
    type: "key",
    path: s3pathInfo.plainSourcePath,
  };

  let ingest;
  let reference;
  if(copy) {
    ingest = sourceInfo;
  } else {
    reference = sourceInfo;
  }

  return {
    access,
    encryption: {scheme: encryption === "cgck" ? "cgck" : "none"},
    ingest,
    op: copy ? "ingest-copy" : "add-reference",
    path: destPath,
    reference
  };
};

/* Files */

/**
 * List the file information about this object
 *
 * @memberof module:ElvClient/Files+Parts
 * @methodGroup Files
 * @namedParams
 * @param {string=} libraryId - ID of the library
 * @param {string=} objectId - ID of the object
 * @param {string=} path - ID of the object
 * @param {string=} versionHash - Hash of the object version - if not specified, most recent version will be used
 * @param {string=} writeToken - Write token of a draft (incompatible with versionHash)
 */
exports.ListFiles = async function({libraryId, objectId, path = "", versionHash, writeToken}) {
  ValidateParameters({libraryId, objectId, versionHash, writeToken});

  if(versionHash) { objectId = this.utils.DecodeVersionHash(versionHash).objectId; }

  let urlPath = UrlJoin("q", writeToken || versionHash || objectId, "files_list", path);

  return this.HttpClient.RequestJsonBody({
    headers: await this.authClient.AuthorizationHeader({libraryId, objectId, versionHash}),
    method: "GET",
    path: urlPath,
  });
};

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
         source: string // a presigned URL "https://BUCKET_NAME/path", an unsigned S3 full path e.g. "s3://BUCKET_NAME/path...", or just the path part without "s3://BUCKET_NAME/"
       }
     ]
 *
 * @memberof module:ElvClient/Files+Parts
 * @methodGroup Files
 * @namedParams
 * @param {string} libraryId - ID of the library
 * @param {string} objectId - ID of the object
 * @param {string} writeToken - Write token of the draft
 * @param {string} region - AWS region to use (not needed for presigned URLs)
 * @param {string} bucket - AWS bucket to use (not needed for presigned URLs)
 * @param {Array<Object>} fileInfo - List of files to reference/copy
 * @param {string} accessKey - AWS access key (not needed for presigned URLs)
 * @param {string} secret - AWS secret (not needed for presigned URLs)
 * @param {string} encryption="none" - Encryption for uploaded files (copy only) - cgck | none
 * @param {boolean} copy=false - If true, will copy the data from S3 into the fabric. Otherwise, a reference to the content will be made.
 * @param {function=} callback - If specified, will be periodically called with current upload status
 * - Arguments (copy): { done: boolean, uploaded: number, total: number, uploadedFiles: number, totalFiles: number, fileStatus: Object }
 * - Arguments (reference): { done: boolean, uploadedFiles: number, totalFiles: number }
 */
exports.UploadFilesFromS3 = async function({
  libraryId,
  objectId,
  writeToken,
  region,
  bucket,
  fileInfo,
  accessKey,
  secret,
  encryption="none",
  copy=false,
  callback
}) {
  ValidateParameters({libraryId, objectId});
  ValidateWriteToken(writeToken);

  if(copy) {
    this.Log(`Copying files from S3: ${libraryId} ${objectId} ${writeToken}`);
  } else {
    if(encryption !== "none") throw Error("cannot specify encrypted storage when linking to S3 storage");
    this.Log(`Adding links to files in S3: ${libraryId} ${objectId} ${writeToken}`);
  }

  let encryption_key;
  if(encryption === "cgck") {
    let conk = await this.EncryptionConk({
      libraryId,
      objectId,
      writeToken
    });

    conk = {
      ...conk,
      secret_key: ""
    };

    encryption_key = `kp__${this.utils.B58(Buffer.from(JSON.stringify(conk)))}`;
  }

  const defaults = {
    encryption_key,
    access: {
      protocol: "s3",
      platform: "aws"
    }
  };

  const ops = fileInfo.map(info => s3opsElement({
    copy,
    destPath: info.path,
    encryption,
    sourcePath: info.source,
    s3accessKey: accessKey,
    s3bucket: bucket,
    s3region: region,
    s3secret: secret
  })
  );

  // eslint-disable-next-line no-unused-vars
  const {id} = await this.CreateFileUploadJob({libraryId, objectId, writeToken, ops, defaults});

  // eslint-disable-next-line no-constant-condition
  while(true) {
    await new Promise(resolve => setTimeout(resolve, 1000));

    const status = await this.UploadStatus({libraryId, objectId, writeToken, uploadId: id});

    if(status.errors && status.errors.length > 1) {
      throw status.errors.join("\n");
    } else if(status.error) {
      this.Log(`S3 file upload failed:\n${JSON.stringify(status, null, 2)}`);
      throw status.error;
    } else if(status.status.toLowerCase() === "failed") {
      throw "File upload failed";
    }

    let done = false;
    if(copy) {
      done = status.ingest_copy.done;

      if(callback) {
        const progress = status.ingest_copy.progress;

        callback({
          done,
          uploaded: progress.bytes.completed,
          total: progress.bytes.total,
          uploadedFiles: progress.files.completed,
          totalFiles: progress.files.total,
          fileStatus: progress.files.details
        });
      }
    } else {
      done = status.add_reference.done;

      if(callback) {
        const progress = status.add_reference.progress;

        callback({
          done,
          uploadedFiles: progress.completed,
          totalFiles: progress.total,
        });
      }
    }

    if(done) { break; }
  }
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
exports.UploadFiles = async function({libraryId, objectId, writeToken, fileInfo, encryption="none", callback}) {
  ValidateParameters({libraryId, objectId});
  ValidateWriteToken(writeToken);
  ValidatePresence("fileInfo", fileInfo);

  this.Log(`Uploading files: ${libraryId} ${objectId} ${writeToken}`);

  let conk;
  if(encryption === "cgck") {
    conk = await this.EncryptionConk({libraryId, objectId, writeToken});
  }

  // Extract file data into easily accessible hash while removing the data from the fileinfo for upload job creation
  let progress = {};
  let fileDataMap = {};

  let originalFileInfo = fileInfo;
  fileInfo = [];
  for(let i = 0; i < originalFileInfo.length; i++) {
    let entry = { ...originalFileInfo[i], data: undefined };

    entry.path = entry.path.replace(/^\/+/, "");

    if(encryption === "cgck") {
      entry.encryption = {
        scheme: "cgck"
      };
    }

    fileDataMap[entry.path] = originalFileInfo[i].data;

    entry.type = "file";

    progress[entry.path] = {
      uploaded: 0,
      total: entry.size
    };

    fileInfo.push(entry);
  }

  this.Log(fileInfo);

  if(callback) {
    callback(progress);
  }

  const {id, jobs} = await this.CreateFileUploadJob({
    libraryId,
    objectId,
    writeToken,
    ops: fileInfo,
    encryption
  });

  this.Log(`Upload ID: ${id}`);
  this.Log(jobs);

  // How far encryption can get ahead of upload
  const bufferSize = 500 * 1024 * 1024;

  let jobSpecs = [];
  let prepared = 0;
  let uploaded = 0;

  // Insert the data to upload into the job spec, encrypting if necessary
  const PrepareJobs = async () => {
    for(let j = 0; j < jobs.length; j++) {
      while(prepared - uploaded > bufferSize) {
        // Wait for more data to be uploaded
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      // Retrieve job info
      const jobId = jobs[j];
      let job = await this.UploadJobStatus({
        libraryId,
        objectId,
        writeToken,
        uploadId: id,
        jobId
      });

      for(let f = 0; f < job.files.length; f++) {
        const fileInfo = job.files[f];

        let data;
        if(typeof fileDataMap[fileInfo.path] === "number") {
          // File descriptor - Read data from file
          data = Buffer.alloc(fileInfo.len);
          fs.readSync(fileDataMap[fileInfo.path], data, 0, fileInfo.len, fileInfo.off);
        } else {
          // Full data - Slice requested chunk
          data = fileDataMap[fileInfo.path].slice(fileInfo.off, fileInfo.off + fileInfo.len);
        }

        if(encryption === "cgck") {
          data = await this.Crypto.Encrypt(conk, data);
        }

        job.files[f].data = data;

        prepared += fileInfo.len;
      }

      jobSpecs[j] = job;

      // Wait for a bit to let upload start
      await new Promise(resolve => setTimeout(resolve, 50));
    }
  };

  const UploadJob = async (jobId, j)  => {
    while(!jobSpecs[j]) {
      // Wait for more jobs to be prepared
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    const jobSpec = jobSpecs[j];
    const files = jobSpec.files;

    // Upload each item
    for(let f = 0; f < files.length; f++) {
      const fileInfo = files[f];

      let retries = 0;
      let succeeded = false;
      do {
        try {
          await this.UploadFileData({
            libraryId,
            objectId,
            writeToken,
            uploadId: id,
            jobId,
            filePath: fileInfo.path,
            fileData: fileInfo.data,
            encryption
          });

          succeeded = true;
        } catch(error) {
          this.Log(error, true);

          retries += 1;

          if(retries >= 10) {
            throw error;
          }

          await new Promise(resolve => setTimeout(resolve, 10 * retries * 1000));
        }
      } while(!succeeded && retries < 10);

      delete jobSpecs[j].files[f].data;
      uploaded += fileInfo.len;

      if(callback) {
        progress[fileInfo.path] = {
          ...progress[fileInfo.path],
          uploaded: progress[fileInfo.path].uploaded + fileInfo.len
        };

        callback(progress);
      }
    }
  };

  // Preparing jobs is done asynchronously
  PrepareJobs().catch(e => {
    throw e;
  });

  // Upload the first several chunks in sequence, to determine average upload rate
  const rateTestJobs = Math.min(3, jobs.length);
  let rates = [];
  for(let j = 0; j < rateTestJobs; j++) {
    const start = new Date().getTime();
    await UploadJob(jobs[j], j);
    const elapsed = (new Date().getTime() - start) / 1000;
    const size = jobSpecs[j].files.map(file => file.len).reduce((length, total) => length + total, 0);
    rates.push(size / elapsed / (1024 * 1024));
  }

  const averageRate = rates.reduce((mbps, total) => mbps + total, 0) / rateTestJobs;

  // Upload remaining jobs in parallel
  const concurrentUploads = Math.min(5, Math.ceil(averageRate / 2));
  await this.utils.LimitedMap(
    concurrentUploads,
    jobs,
    async (jobId, j)  => {
      if(j < rateTestJobs) { return; }

      await UploadJob(jobId, j);
    }
  );
};

exports.CreateFileUploadJob = async function({libraryId, objectId, writeToken, ops, defaults={}, encryption="none"}) {
  ValidateParameters({libraryId, objectId});
  ValidateWriteToken(writeToken);

  this.Log(`Creating file upload job: ${libraryId} ${objectId} ${writeToken}`);
  this.Log(ops);

  if(encryption === "cgck") {
    defaults.encryption = { scheme: "cgck" };
  }

  const body = {
    seq: 0,
    seq_complete: true,
    defaults,
    ops
  };

  const path = UrlJoin("q", writeToken, "file_jobs");

  return this.HttpClient.RequestJsonBody({
    headers: await this.authClient.AuthorizationHeader({libraryId, objectId, update: true, encryption}),
    method: "POST",
    path: path,
    body,
    allowFailover: false
  });
};

exports.UploadStatus = async function({libraryId, objectId, writeToken, uploadId}) {
  ValidateParameters({libraryId, objectId});
  ValidateWriteToken(writeToken);

  const path = UrlJoin("q", writeToken, "file_jobs", uploadId);

  return this.HttpClient.RequestJsonBody({
    headers: await this.authClient.AuthorizationHeader({libraryId, objectId, update: true}),
    method: "GET",
    path: path,
    allowFailover: false
  });
};

exports.UploadJobStatus = async function({libraryId, objectId, writeToken, uploadId, jobId}) {
  ValidateParameters({libraryId, objectId});
  ValidateWriteToken(writeToken);

  const path = UrlJoin("q", writeToken, "file_jobs", uploadId, "uploads", jobId);

  let response = await this.HttpClient.RequestJsonBody({
    headers: await this.authClient.AuthorizationHeader({libraryId, objectId, update: true}),
    method: "GET",
    path: path,
    allowFailover: false,
    queryParams: { start: 0, limit: 10000 }
  });

  while(response.next !== response.total && response.next >= 0) {
    const newResponse = await this.HttpClient.RequestJsonBody({
      headers: await this.authClient.AuthorizationHeader({libraryId, objectId, update: true}),
      method: "GET",
      path: path,
      allowFailover: false,
      queryParams: { start: response.next }
    });

    response.files = [
      ...response.files,
      ...newResponse.files
    ];
    response.next = newResponse.next;
  }

  return response;
};

exports.UploadFileData = async function({libraryId, objectId, writeToken, encryption, uploadId, jobId, filePath, fileData}) {
  ValidateParameters({libraryId, objectId});
  ValidateWriteToken(writeToken);

  const jobStatus = await this.UploadJobStatus({libraryId, objectId, writeToken, uploadId, jobId});

  // Find the status of this file
  let fileStatus = jobStatus.files.find(item => item.path === filePath);
  if(encryption && encryption !== "none") {
    fileStatus = fileStatus.encrypted;
  }

  if(fileStatus.rem === 0) {
    // Job is actually done
    return;
  } else if(fileStatus.skip) {
    fileData = fileData.slice(fileStatus.skip);
  }

  let path = UrlJoin("q", writeToken, "file_jobs", uploadId, jobId);

  return await this.HttpClient.RequestJsonBody({
    method: "POST",
    path: path,
    body: fileData,
    bodyType: "BINARY",
    headers: {
      "Content-type": "application/octet-stream",
      ...(await this.authClient.AuthorizationHeader({libraryId, objectId, update: true}))
    },
    allowFailover: false,
    allowRetry: false
  });
};

exports.FinalizeUploadJob = async function({libraryId, objectId, writeToken}) {
  ValidateParameters({libraryId, objectId});
  ValidateWriteToken(writeToken);

  this.Log(`Finalizing upload job: ${libraryId} ${objectId} ${writeToken}`);

  const path = UrlJoin("q", writeToken, "files");

  await this.HttpClient.Request({
    method: "POST",
    path: path,
    bodyType: "BINARY",
    headers: await this.authClient.AuthorizationHeader({libraryId, objectId, update: true}),
    allowFailover: false
  });
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
exports.CreateFileDirectories = async function({libraryId, objectId, writeToken, filePaths}) {
  ValidateParameters({libraryId, objectId});
  ValidateWriteToken(writeToken);

  this.Log(`Creating Directories: ${libraryId} ${objectId} ${writeToken}`);
  this.Log(filePaths);

  const ops = filePaths.map(path => ({op: "add", type: "directory", path}));

  await this.CreateFileUploadJob({libraryId, objectId, writeToken, ops});
};

/**
 * Move or rename the specified list of files/directories
 *
 * @memberof module:ElvClient/Files+Parts
 * @methodGroup Files
 * @namedParams
 * @param {string} libraryId - ID of the library
 * @param {string} objectId - ID of the object
 * @param {string} writeToken - Write token of the draft
 * @param {Array<string>} filePaths - List of file paths to move. Format: ```[ { "path": "original/path", to: "new/path" } ]```
 */
exports.MoveFiles = async function({libraryId, objectId, writeToken, filePaths}) {
  ValidateParameters({libraryId, objectId});
  ValidateWriteToken(writeToken);

  this.Log(`Moving Files: ${libraryId} ${objectId} ${writeToken}`);
  this.Log(filePaths);

  const ops = filePaths.map(({path, to}) => ({op: "move", copy_move_source_path: path, path: to}));

  await this.CreateFileUploadJob({libraryId, objectId, writeToken, ops});
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
exports.DeleteFiles = async function({libraryId, objectId, writeToken, filePaths}) {
  ValidateParameters({libraryId, objectId});
  ValidateWriteToken(writeToken);

  this.Log(`Deleting Files: ${libraryId} ${objectId} ${writeToken}`);
  this.Log(filePaths);

  const ops = filePaths.map(path => ({op: "del", path}));

  await this.CreateFileUploadJob({libraryId, objectId, writeToken, ops});
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
 * @param {string=} format="arrayBuffer" - Format in which to return the data ("blob" | "arraybuffer" | "buffer")
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
exports.DownloadFile = async function({
  libraryId,
  objectId,
  versionHash,
  writeToken,
  filePath,
  format="arrayBuffer",
  chunked=false,
  chunkSize,
  clientSideDecryption=false,
  callback
}) {
  ValidateParameters({libraryId, objectId, versionHash});
  ValidatePresence("filePath", filePath);

  if(versionHash) { objectId = this.utils.DecodeVersionHash(versionHash).objectId; }

  const fileInfo = await this.ContentObjectMetadata({
    libraryId,
    objectId,
    versionHash,
    writeToken,
    metadataSubtree: UrlJoin("files", filePath)
  });

  const encrypted = fileInfo && fileInfo["."].encryption && fileInfo["."].encryption.scheme === "cgck";
  const encryption = encrypted ? "cgck" : undefined;

  const path =
    encrypted && !clientSideDecryption ?
      UrlJoin("q", writeToken || versionHash || objectId, "rep", "files_download", filePath) :
      UrlJoin("q", writeToken || versionHash || objectId, "files", filePath);


  const headers = await this.authClient.AuthorizationHeader({libraryId, objectId, versionHash, encryption, makeAccessRequest: encryption === "cgck"});
  headers.Accept = "*/*";

  // If not owner, indicate re-encryption
  const ownerCapKey = `eluv.caps.iusr${this.utils.AddressToHash(this.signer.address)}`;
  const ownerCap = await this.ContentObjectMetadata({libraryId, objectId, versionHash, metadataSubtree: ownerCapKey});

  if(encrypted && !this.utils.EqualAddress(this.signer.address, await this.ContentObjectOwner({objectId})) && !ownerCap) {
    headers["X-Content-Fabric-Decryption-Mode"] = "reencrypt";
  }

  // If using server side decryption, specify in header
  if(encrypted && !clientSideDecryption) {
    headers["X-Content-Fabric-Decryption-Mode"] = "decrypt";
    // rep/files_download endpoint doesn't currently support Range header
    chunkSize = Number.MAX_SAFE_INTEGER;
  }

  const bytesTotal = fileInfo["."].size;

  if(encrypted && clientSideDecryption) {
    return await this.DownloadEncrypted({
      conk: await this.EncryptionConk({libraryId, objectId, versionHash, download: true}),
      downloadPath: path,
      bytesTotal,
      headers,
      callback,
      format,
      clientSideDecryption,
      chunked
    });
  } else {
    if(!chunkSize) {
      chunkSize = 10000000;
    }

    try {
      return await this.Download({
        downloadPath: path,
        bytesTotal,
        headers,
        callback,
        format,
        chunked,
        chunkSize
      });
    } catch(error) {
      if(encrypted && !clientSideDecryption) {
        // If encrypted download with rep/files_download failed, retry with client side decryption
        return (
          this.DownloadFile({
            ...arguments[0],
            clientSideDecryption: true
          })
        );
      }

      throw error;
    }
  }
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
exports.ContentParts = async function({libraryId, objectId, versionHash}) {
  ValidateParameters({libraryId, objectId, versionHash});

  this.Log(`Retrieving parts: ${libraryId} ${objectId || versionHash}`);

  if(versionHash) { objectId = this.utils.DecodeVersionHash(versionHash).objectId; }

  const path = UrlJoin("q", versionHash || objectId, "parts");

  const response = await this.HttpClient.RequestJsonBody({
    headers: await this.authClient.AuthorizationHeader({libraryId, objectId, versionHash}),
    method: "GET",
    path: path
  });

  return response.parts;
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
exports.ContentPart = async function({libraryId, objectId, versionHash, partHash}) {
  ValidateParameters({libraryId, objectId, versionHash});
  ValidatePartHash(partHash);

  this.Log(`Retrieving part: ${libraryId} ${objectId || versionHash} ${partHash}`);

  if(versionHash) { objectId = this.utils.DecodeVersionHash(versionHash).objectId; }

  let path = UrlJoin("q", versionHash || objectId, "parts", partHash);

  return await this.HttpClient.RequestJsonBody({
    headers: await this.authClient.AuthorizationHeader({libraryId, objectId, versionHash}),
    method: "GET",
    path: path
  });
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
exports.DownloadPart = async function({
  libraryId,
  objectId,
  versionHash,
  writeToken,
  partHash,
  format="arrayBuffer",
  chunked=false,
  chunkSize=10000000,
  callback
}) {
  ValidateParameters({libraryId, objectId, versionHash});
  ValidatePartHash(partHash);

  if(versionHash) { objectId = this.utils.DecodeVersionHash(versionHash).objectId; }

  const encrypted = partHash.startsWith("hqpe");
  const encryption = encrypted ? "cgck" : undefined;
  const path = UrlJoin("q", writeToken || versionHash || objectId, "data", partHash);

  let headers = await this.authClient.AuthorizationHeader({libraryId, objectId, versionHash, encryption, makeAccessRequest: true});

  const bytesTotal = (await this.ContentPart({libraryId, objectId, versionHash, partHash})).part.size;

  if(encrypted) {
    // If not owner, indicate re-encryption
    if(!this.utils.EqualAddress(this.signer.address, await this.ContentObjectOwner({objectId}))) {
      headers["X-Content-Fabric-Decryption-Mode"] = "reencrypt";
    }

    return await this.DownloadEncrypted({
      conk: await this.EncryptionConk({libraryId, objectId, download: true}),
      downloadPath: path,
      bytesTotal,
      headers,
      callback,
      format,
      chunked
    });
  } else {
    return await this.Download({
      downloadPath: path,
      bytesTotal,
      headers,
      callback,
      format,
      chunked,
      chunkSize
    });
  }
};

exports.Download = async function({
  downloadPath,
  headers,
  bytesTotal,
  chunked=false,
  chunkSize=2000000,
  callback,
  format="arrayBuffer"
}) {
  if(chunked && !callback) { throw Error("No callback specified for chunked download"); }

  // Non-chunked file is still downloaded in parts, but assembled into a full file by the client
  // instead of being returned in chunks via callback
  let outputChunks;
  if(!chunked) {
    outputChunks = [];
  }

  // Download file in chunks
  let bytesFinished = 0;
  const totalChunks = Math.ceil(bytesTotal / chunkSize);
  for(let i = 0; i < totalChunks; i++) {
    headers["Range"] = `bytes=${bytesFinished}-${bytesFinished + chunkSize - 1}`;
    const response = await this.HttpClient.Request({path: downloadPath, headers, method: "GET"});

    bytesFinished = Math.min(bytesFinished + chunkSize, bytesTotal);

    if(chunked) {
      callback({bytesFinished, bytesTotal, chunk: await this.utils.ResponseToFormat(format, response)});
    } else {
      outputChunks.push(
        Buffer.from(await response.arrayBuffer())
      );

      if(callback) {
        callback({bytesFinished, bytesTotal});
      }
    }
  }

  if(!chunked) {
    return await this.utils.ResponseToFormat(
      format,
      new Response(Buffer.concat(outputChunks))
    );
  }
};

exports.DownloadEncrypted = async function({
  conk,
  downloadPath,
  bytesTotal,
  headers,
  callback,
  format="arrayBuffer",
  chunked=false
}) {
  if(chunked && !callback) { throw Error("No callback specified for chunked download"); }

  // Must align chunk size with encryption block size
  const isReencryption = conk.public_key.startsWith("ktpk");
  const chunkSize = this.Crypto.EncryptedBlockSize(1000000, isReencryption);

  let bytesFinished = 0;
  format = format.toLowerCase();

  let outputChunks = [];

  // Set up decryption stream
  const stream = await this.Crypto.OpenDecryptionStream(conk);
  stream.on("data", async chunk => {
    if(chunked) {
      // Turn buffer into desired format, if necessary
      if(format !== "buffer") {
        const arrayBuffer = chunk.buffer.slice(chunk.byteOffset, chunk.byteOffset + chunk.byteLength);

        if(format === "arraybuffer") {
          chunk = arrayBuffer;
        } else {
          chunk = await this.utils.ResponseToFormat(
            format,
            new Response(arrayBuffer)
          );
        }
      }

      callback({
        bytesFinished,
        bytesTotal,
        chunk
      });
    } else {
      if(callback) {
        callback({
          bytesFinished,
          bytesTotal
        });
      }

      outputChunks.push(chunk);
    }
  });

  const totalChunks = Math.ceil(bytesTotal / chunkSize);
  for(let i = 0; i < totalChunks; i++) {
    headers["Range"] = `bytes=${bytesFinished}-${bytesFinished + chunkSize - 1}`;
    const response = await this.HttpClient.Request({headers, method: "GET", path: downloadPath});

    bytesFinished = Math.min(bytesFinished + chunkSize, bytesTotal);

    stream.write(new Uint8Array(await response.arrayBuffer()));
  }

  // Wait for decryption to complete
  stream.end();
  await new Promise(resolve =>
    stream.on("finish", () => {
      resolve();
    })
  );

  if(!chunked) {
    return await this.utils.ResponseToFormat(format, new Response(Buffer.concat(outputChunks)));
  }
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
 * @param {string=} encryption=none - Desired encryption scheme. Options: 'none' (default), 'cgck'
 *
 * @returns {Promise<string>} - The part write token for the part draft
 */
exports.CreatePart = async function({libraryId, objectId, writeToken, encryption}) {
  ValidateParameters({libraryId, objectId});
  ValidateWriteToken(writeToken);

  const path = UrlJoin("q", writeToken, "parts");

  const openResponse = await this.HttpClient.RequestJsonBody({
    headers: await this.authClient.AuthorizationHeader({libraryId, objectId, update: true, encryption}),
    method: "POST",
    path,
    bodyType: "BINARY",
    body: "",
    allowFailover: false
  });

  return openResponse.part.write_token;
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
 * @param {string=} encryption=none - Desired encryption scheme. Options: 'none' (default), 'cgck'
 *
 * @returns {Promise<string>} - The part write token for the part draft
 */
exports.UploadPartChunk = async function({libraryId, objectId, writeToken, partWriteToken, chunk, encryption}) {
  ValidateParameters({libraryId, objectId});
  ValidateWriteToken(writeToken);

  if(encryption && encryption !== "none") {
    const conk = await this.EncryptionConk({libraryId, objectId, writeToken});
    chunk = await this.Crypto.Encrypt(conk, chunk);
  }

  const path = UrlJoin("q", writeToken, "parts");
  await this.HttpClient.RequestJsonBody({
    headers: await this.authClient.AuthorizationHeader({libraryId, objectId, update: true, encryption}),
    method: "POST",
    path: UrlJoin(path, partWriteToken),
    body: chunk,
    bodyType: "BINARY",
    allowFailover: false
  });
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
 * @param {string=} encryption=none - Desired encryption scheme. Options: 'none' (default), 'cgck'
 *
 * @returns {Promise<object>} - The finalize response for the new part
 */
exports.FinalizePart = async function({libraryId, objectId, writeToken, partWriteToken, encryption}) {
  ValidateParameters({libraryId, objectId});
  ValidateWriteToken(writeToken);

  const path = UrlJoin("q", writeToken, "parts");
  return await this.HttpClient.RequestJsonBody({
    headers: await this.authClient.AuthorizationHeader({libraryId, objectId, update: true, encryption}),
    method: "POST",
    path: UrlJoin(path, partWriteToken),
    bodyType: "BINARY",
    body: "",
    allowFailover: false
  });
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
 * @param {string=} encryption=none - Desired encryption scheme. Options: 'none' (default), 'cgck'
 * @param {function=} callback - If specified, will be periodically called with current upload status
 * - Signature: ({bytesFinished, bytesTotal}) => {}
 *
 * @returns {Promise<Object>} - Response containing information about the uploaded part
 */
exports.UploadPart = async function({libraryId, objectId, writeToken, data, encryption="none", chunkSize=10000000, callback}) {
  ValidateParameters({libraryId, objectId});
  ValidateWriteToken(writeToken);

  const partWriteToken = await this.CreatePart({libraryId, objectId, writeToken, encryption});

  const size = data.length || data.byteLength || data.size;

  if(callback) {
    callback({bytesFinished: 0, bytesTotal: size});
  }

  for(let i = 0; i < size; i += chunkSize) {
    const chunk = data.slice(i, i + chunkSize);
    await this.UploadPartChunk({
      libraryId,
      objectId,
      writeToken,
      partWriteToken,
      chunk,
      encryption
    });

    if(callback) {
      callback({bytesFinished: Math.min(i + chunkSize, size), bytesTotal: size});
    }
  }

  return await this.FinalizePart({libraryId, objectId, writeToken, partWriteToken, encryption});
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
exports.DeletePart = async function({libraryId, objectId, writeToken, partHash}) {
  ValidateParameters({libraryId, objectId});
  ValidateWriteToken(writeToken);
  ValidatePartHash(partHash);

  let path = UrlJoin("q", writeToken, "parts", partHash);

  await this.HttpClient.Request({
    headers: await this.authClient.AuthorizationHeader({libraryId, objectId, update: true}),
    method: "DELETE",
    path: path,
    allowFailover: false
  });
};
