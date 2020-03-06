/**
 * Methods for accessing and managing access groups
 *
 * @module ElvClient/Files+Parts
 */

const Utils = require("../Utils");

let fs;
if(Utils.Platform() === Utils.PLATFORM_NODE) {
  // Define Response in node
  // eslint-disable-next-line no-global-assign
  global.Response = (require("node-fetch")).Response;
  fs = require("fs");
}

const Crypto = require("../Crypto");
const UrlJoin = require("url-join");

const {
  ValidatePresence,
  ValidateWriteToken,
  ValidatePartHash,
  ValidateParameters
} = require("../Validation");


exports.access = {};
exports.manage = {};


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
exports.manage.ListFiles = async function({libraryId, objectId, versionHash}) {
  ValidateParameters({libraryId, objectId, versionHash});

  if(versionHash) { objectId = this.utils.DecodeVersionHash(versionHash).objectId; }

  let path = UrlJoin("q", versionHash || objectId, "meta", "files");

  return this.utils.ResponseToJson(
    this.HttpClient.Request({
      headers: await this.authClient.AuthorizationHeader({libraryId, objectId, versionHash}),
      method: "GET",
      path: path,
    })
  );
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
 * @param {boolean} copy=false - If true, will copy the data from S3 into the fabric. Otherwise, a reference to the content will be made.
 * @param {function=} callback - If specified, will be periodically called with current upload status
 * - Arguments (copy): { done: boolean, uploaded: number, total: number, uploadedFiles: number, totalFiles: number, fileStatus: Object }
 * - Arguments (reference): { done: boolean, uploadedFiles: number, totalFiles: number }
 */
exports.manage.UploadFilesFromS3 = async function({
  libraryId,
  objectId,
  writeToken,
  region,
  bucket,
  fileInfo,
  accessKey,
  secret,
  copy=false,
  callback
}) {
  ValidateParameters({libraryId, objectId});
  ValidateWriteToken(writeToken);

  this.Log(`Uploading files from S3: ${libraryId} ${objectId} ${writeToken}`);

  const defaults = {
    access: {
      protocol: "s3",
      platform: "aws",
      path: bucket,
      storage_endpoint: {
        region
      },
      cloud_credentials: {
        access_key_id: accessKey,
        secret_access_key: secret
      }
    }
  };

  const ops = fileInfo.map(info => {
    if(copy) {
      return {
        op: "ingest-copy",
        path: info.path,
        ingest: {
          type: "key",
          path: info.source,
        }
      };
    } else {
      return {
        op: "add-reference",
        path: info.path,
        reference: {
          type: "key",
          path: info.source,
        }
      };
    }
  });

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
exports.manage.UploadFiles = async function({libraryId, objectId, writeToken, fileInfo, encryption="none", callback}) {
  ValidateParameters({libraryId, objectId});
  ValidateWriteToken(writeToken);

  this.Log(`Uploading files: ${libraryId} ${objectId} ${writeToken}`);

  let conk;
  if(encryption === "cgck") {
    conk = await this.EncryptionConk({libraryId, objectId, writeToken});
  }

  // Extract file data into easily accessible hash while removing the data from the fileinfo for upload job creation
  let progress = {};
  let fileDataMap = {};

  for(let i = 0; i < fileInfo.length; i++) {
    let entry = fileInfo[i];

    entry.path = entry.path.replace(/^\/+/, "");

    if(encryption === "cgck") {
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
  const bufferSize = 100 * 1024 * 1024;

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
          data = await Crypto.Encrypt(conk, data);
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

      await this.UploadFileData({libraryId, objectId, writeToken, uploadId: id, jobId, fileData: fileInfo.data});

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

  // Preparing jobs is done asyncronously
  PrepareJobs();

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

exports.manage.CreateFileUploadJob = async function({libraryId, objectId, writeToken, ops, defaults={}, encryption="none"}) {
  ValidateParameters({libraryId, objectId});
  ValidateWriteToken(writeToken);

  this.Log(`Creating file upload job: ${libraryId} ${objectId} ${writeToken}`);
  this.Log(ops);

  let path = UrlJoin("q", writeToken, "file_jobs");

  if(encryption === "cgck") {
    defaults.encryption = { scheme: "cgck" };
  }

  const body = {
    seq: 0,
    seq_complete: true,
    defaults,
    ops
  };

  return this.utils.ResponseToJson(
    this.HttpClient.Request({
      headers: await this.authClient.AuthorizationHeader({libraryId, objectId, update: true, encryption}),
      method: "POST",
      path: path,
      body,
      failover: false
    })
  );
};

exports.manage.UploadStatus = async function({libraryId, objectId, writeToken, uploadId}) {
  ValidateParameters({libraryId, objectId});
  ValidateWriteToken(writeToken);

  let path = UrlJoin("q", writeToken, "file_jobs", uploadId);

  return this.utils.ResponseToJson(
    this.HttpClient.Request({
      headers: await this.authClient.AuthorizationHeader({libraryId, objectId, update: true}),
      method: "GET",
      path: path,
      failover: false
    })
  );
};

exports.manage.UploadJobStatus = async function({libraryId, objectId, writeToken, uploadId, jobId}) {
  ValidateParameters({libraryId, objectId});
  ValidateWriteToken(writeToken);

  let path = UrlJoin("q", writeToken, "file_jobs", uploadId, "uploads", jobId);

  return this.utils.ResponseToJson(
    this.HttpClient.Request({
      headers: await this.authClient.AuthorizationHeader({libraryId, objectId, update: true}),
      method: "GET",
      path: path,
      failover: false
    })
  );
};

exports.manage.UploadFileData = async function({libraryId, objectId, writeToken, uploadId, jobId, fileData}) {
  ValidateParameters({libraryId, objectId});
  ValidateWriteToken(writeToken);

  const path = UrlJoin("q", writeToken, "file_jobs", uploadId, jobId);

  await this.utils.ResponseToJson(
    this.HttpClient.Request({
      method: "POST",
      path: path,
      body: fileData,
      bodyType: "BINARY",
      headers: {
        "Content-type": "application/octet-stream",
        ...(await this.authClient.AuthorizationHeader({libraryId, objectId, update: true}))
      },
      failover: false
    })
  );
};

exports.manage.FinalizeUploadJob = async function({libraryId, objectId, writeToken}) {
  ValidateParameters({libraryId, objectId});
  ValidateWriteToken(writeToken);

  this.Log(`Finalizing upload job: ${libraryId} ${objectId} ${writeToken}`);

  const path = UrlJoin("q", writeToken, "files");

  await this.HttpClient.Request({
    method: "POST",
    path: path,
    bodyType: "BINARY",
    headers: await this.authClient.AuthorizationHeader({libraryId, objectId, update: true}),
    failover: false
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
exports.manage.CreateFileDirectories = async function({libraryId, objectId, writeToken, filePaths}) {
  ValidateParameters({libraryId, objectId});
  ValidateWriteToken(writeToken);

  this.Log(`Creating Directories: ${libraryId} ${objectId} ${writeToken}`);
  this.Log(filePaths);

  const ops = filePaths.map(path => ({op: "add", type: "directory", path}));

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
exports.manage.DeleteFiles = async function({libraryId, objectId, writeToken, filePaths}) {
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
exports.access.DownloadFile = async function({
  libraryId,
  objectId,
  versionHash,
  writeToken,
  filePath,
  format="arrayBuffer",
  chunked=false,
  chunkSize=1000000,
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
  const path = UrlJoin("q", writeToken || versionHash || objectId, "files", filePath);

  const headers = await this.authClient.AuthorizationHeader({libraryId, objectId, versionHash, encryption});
  headers.Accept = "*/*";

  // If not owner, indicate re-encryption
  if(!this.utils.EqualAddress(this.signer.address, await this.ContentObjectOwner({objectId}))) {
    headers["X-Content-Fabric-Decryption-Mode"] = "reencrypt";
  }

  const bytesTotal = fileInfo["."].size;

  if(encrypted) {
    return await this.DownloadEncrypted({
      conk: await this.EncryptionConk({libraryId, objectId}),
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
exports.access.ContentParts = async function({libraryId, objectId, versionHash}) {
  ValidateParameters({libraryId, objectId, versionHash});

  this.Log(`Retrieving parts: ${libraryId} ${objectId || versionHash}`);

  if(versionHash) { objectId = this.utils.DecodeVersionHash(versionHash).objectId; }

  let path = UrlJoin("q", versionHash || objectId, "parts");

  const response = await this.utils.ResponseToJson(
    this.HttpClient.Request({
      headers: await this.authClient.AuthorizationHeader({libraryId, objectId, versionHash}),
      method: "GET",
      path: path
    })
  );

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
exports.access.ContentPart = async function({libraryId, objectId, versionHash, partHash}) {
  ValidateParameters({libraryId, objectId, versionHash});
  ValidatePartHash(partHash);

  this.Log(`Retrieving part: ${libraryId} ${objectId || versionHash} ${partHash}`);

  if(versionHash) { objectId = this.utils.DecodeVersionHash(versionHash).objectId; }

  let path = UrlJoin("q", versionHash || objectId, "parts", partHash);

  return await this.utils.ResponseToJson(
    this.HttpClient.Request({
      headers: await this.authClient.AuthorizationHeader({libraryId, objectId, versionHash}),
      method: "GET",
      path: path
    })
  );
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
exports.access.DownloadPart = async function({
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

  let headers = await this.authClient.AuthorizationHeader({libraryId, objectId, versionHash, encryption});

  const bytesTotal = (await this.ContentPart({libraryId, objectId, versionHash, partHash})).part.size;

  if(encrypted) {
    return await this.DownloadEncrypted({
      conk: await this.EncryptionConk({libraryId, objectId}),
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

exports.access.Download = async function({
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
      if(callback) {
        callback({bytesFinished, bytesTotal});
      }

      outputChunks.push(
        Buffer.from(await response.arrayBuffer())
      );
    }
  }

  if(!chunked) {
    return await this.utils.ResponseToFormat(
      format,
      new Response(Buffer.concat(outputChunks))
    );
  }
};

exports.access.DownloadEncrypted = async function({
  conk,
  downloadPath,
  bytesTotal,
  headers,
  callback,
  format="arrayBuffer",
  chunked=false,
  chunkSize=1000000,
}) {
  if(chunked && !callback) { throw Error("No callback specified for chunked download"); }

  let bytesFinished = 0;
  format = format.toLowerCase();

  let outputChunks = [];

  // Set up decryption stream
  const stream = await Crypto.OpenDecryptionStream(conk);
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
 * @param {string=} encryption=none - Desired encryption scheme. Options: 'none (default)', 'cgck'
 *
 * @returns {Promise<string>} - The part write token for the part draft
 */
exports.manage.CreatePart = async function({libraryId, objectId, writeToken, encryption}) {
  ValidateParameters({libraryId, objectId});
  ValidateWriteToken(writeToken);

  const path = UrlJoin("q", writeToken, "parts");

  const openResponse = await this.utils.ResponseToJson(
    this.HttpClient.Request({
      headers: await this.authClient.AuthorizationHeader({libraryId, objectId, update: true, encryption}),
      method: "POST",
      path,
      bodyType: "BINARY",
      body: "",
      failover: false
    })
  );

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
 * @param {string=} encryption=none - Desired encryption scheme. Options: 'none (default)', 'cgck'
 *
 * @returns {Promise<string>} - The part write token for the part draft
 */
exports.manage.UploadPartChunk = async function({libraryId, objectId, writeToken, partWriteToken, chunk, encryption}) {
  ValidateParameters({libraryId, objectId});
  ValidateWriteToken(writeToken);

  if(encryption && encryption !== "none") {
    const conk = await this.EncryptionConk({libraryId, objectId, writeToken});
    chunk = await Crypto.Encrypt(conk, chunk);
  }

  const path = UrlJoin("q", writeToken, "parts");
  await this.utils.ResponseToJson(
    this.HttpClient.Request({
      headers: await this.authClient.AuthorizationHeader({libraryId, objectId, update: true, encryption}),
      method: "POST",
      path: UrlJoin(path, partWriteToken),
      body: chunk,
      bodyType: "BINARY",
      failover: false
    })
  );
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
exports.manage.FinalizePart = async function({libraryId, objectId, writeToken, partWriteToken, encryption}) {
  ValidateParameters({libraryId, objectId});
  ValidateWriteToken(writeToken);

  const path = UrlJoin("q", writeToken, "parts");
  return await this.utils.ResponseToJson(
    await this.HttpClient.Request({
      headers: await this.authClient.AuthorizationHeader({libraryId, objectId, update: true, encryption}),
      method: "POST",
      path: UrlJoin(path, partWriteToken),
      bodyType: "BINARY",
      body: "",
      failover: false
    })
  );
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
 *
 * @returns {Promise<Object>} - Response containing information about the uploaded part
 */
exports.manage.UploadPart = async function({libraryId, objectId, writeToken, data, encryption="none"}) {
  ValidateParameters({libraryId, objectId});
  ValidateWriteToken(writeToken);

  const partWriteToken = await this.CreatePart({libraryId, objectId, writeToken, encryption});

  await this.UploadPartChunk({libraryId, objectId, writeToken, partWriteToken, chunk: data, encryption});

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
exports.manage.DeletePart = async function({libraryId, objectId, writeToken, partHash}) {
  ValidateParameters({libraryId, objectId});
  ValidateWriteToken(writeToken);
  ValidatePartHash(partHash);

  let path = UrlJoin("q", writeToken, "parts", partHash);

  await this.HttpClient.Request({
    headers: await this.authClient.AuthorizationHeader({libraryId, objectId, update: true}),
    method: "DELETE",
    path: path,
    failover: false
  });
};