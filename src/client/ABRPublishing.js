/**
 * Methods for ABR video creation and management
 *
 * For more information on how to publish ABR content see <a href="./abr/index.html">this detailed guide</a>
 *
 * @module ElvClient/ABRPublishing
 */

const UrlJoin = require("url-join");
const HttpClient = require("../HttpClient");

const {
  ValidateLibrary,
  ValidateVersion,
  ValidateParameters
} = require("../Validation");

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
exports.CreateProductionMaster = async function({
  libraryId,
  type,
  name,
  description,
  metadata={},
  fileInfo,
  encrypt=false,
  access=[],
  copy=false,
  callback
}) {
  ValidateLibrary(libraryId);

  const {id, write_token} = await this.CreateContentObject({
    libraryId,
    options: type ? { type } : {}
  });

  // any files specified?
  if(fileInfo) {
    // are they stored in cloud?
    if(access.length > 0) {
      // S3 Upload

      const s3prefixRegex = /^s3:\/\/([^/]+)\//i; // for matching and extracting bucket name when full s3:// path is specified

      // batch the cloud storage files by matching credential set, check each file's source path against credential set path_matchers
      for(let i = 0; i < fileInfo.length; i++) {
        const oneFileInfo = fileInfo[i];
        let matched = false;
        for(let j = 0; !matched && j < access.length; j++) {
          let credentialSet = access[j];
          // strip trailing slash to get bucket name for credential set
          const credentialSetBucket = credentialSet.remote_access.path.replace(/\/$/, "");
          const matchers = credentialSet.path_matchers;
          for(let k = 0; !matched && k < matchers.length; k++) {
            const matcher = new RegExp(matchers[k]);
            const fileSourcePath = oneFileInfo.source;
            if(matcher.test(fileSourcePath)) {
              matched = true;
              // if full s3 path supplied, check bucket name
              const s3prefixMatch = (s3prefixRegex.exec(fileSourcePath));
              if(s3prefixMatch) {
                const bucketName = s3prefixMatch[1];
                if(bucketName !== credentialSetBucket) {
                  throw Error("Full S3 file path \"" + fileSourcePath + "\" matched to credential set with different bucket name '" + credentialSetBucket + "'");
                }
              }
              if(credentialSet.hasOwnProperty("matched")) {
                credentialSet.matched.push(oneFileInfo);
              } else {
                // first matching file path for this credential set,
                // initialize new 'matched' property to 1-element array
                credentialSet.matched = [oneFileInfo];
              }
            }
          }
        }
        if(!matched) {
          throw Error("no credential set found for file path: \"" + filePath + "\"");
        }
      }

      // iterate over credential sets, if any matching files were found, upload them using that credential set
      for(let i = 0; i < access.length; i++) {
        const credentialSet = access[i];
        if(credentialSet.hasOwnProperty("matched") && credentialSet.matched.length > 0) {
          const region = credentialSet.remote_access.storage_endpoint.region;
          const bucket = credentialSet.remote_access.path.replace(/\/$/, "");
          const accessKey = credentialSet.remote_access.cloud_credentials.access_key_id;
          const secret = credentialSet.remote_access.cloud_credentials.secret_access_key;

          await this.UploadFilesFromS3({
            libraryId,
            objectId: id,
            writeToken: write_token,
            fileInfo: credentialSet.matched,
            region,
            bucket,
            accessKey,
            secret,
            copy,
            callback
          });
        }
      }

    } else {
      await this.UploadFiles({
        libraryId,
        objectId: id,
        writeToken: write_token,
        fileInfo,
        callback,
        encryption: encrypt ? "cgck" : "none"
      });
    }
  }

  const { logs, errors, warnings } = await this.CallBitcodeMethod({
    libraryId,
    objectId: id,
    writeToken: write_token,
    method: UrlJoin("media", "production_master", "init"),
    body: {
      access
    },
    constant: false
  });

  await this.MergeMetadata({
    libraryId,
    objectId: id,
    writeToken: write_token,
    metadata: {
      ...(metadata || {}),
      name,
      description,
      reference: access && !copy,
      public: {
        ...((metadata || {}).public || {}),
        name: name || "",
        description: description || ""
      },
      elv_created_at: new Date().getTime(),
    }
  });

  const finalizeResponse = await this.FinalizeContentObject({
    libraryId,
    objectId: id,
    writeToken: write_token,
    awaitCommitConfirmation: false
  });

  return {
    errors: errors || [],
    logs: logs || [],
    warnings: warnings || [],
    ...finalizeResponse
  };
};

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
exports.CreateABRMezzanine = async function({
  libraryId,
  objectId,
  type,
  name,
  description,
  metadata,
  masterVersionHash,
  abrProfile,
  variant="default",
  offeringKey="default"
}) {
  ValidateLibrary(libraryId);
  ValidateVersion(masterVersionHash);

  if(!masterVersionHash) {
    throw Error("Master version hash not specified");
  }

  const existingMez = !!objectId;

  let options = type ? { type } : {};

  let id, write_token;
  if(existingMez) {
    // Edit existing
    const editResponse = await this.EditContentObject({
      libraryId,
      objectId,
      options
    });

    id = editResponse.id;
    write_token = editResponse.write_token;
  } else {
    // Create new
    const createResponse = await this.CreateContentObject({
      libraryId,
      options
    });

    id = createResponse.id;
    write_token = createResponse.write_token;
  }

  await this.CreateEncryptionConk({libraryId, objectId: id, writeToken: write_token, createKMSConk: true});

  const masterName = await this.ContentObjectMetadata({
    versionHash: masterVersionHash,
    metadataSubtree: "public/name"
  });

  // Include authorization for library, master, and mezzanine
  let authorizationTokens = [];
  authorizationTokens.push(await this.authClient.AuthorizationToken({libraryId, objectId: id, update: true}));
  authorizationTokens.push(await this.authClient.AuthorizationToken({libraryId}));
  authorizationTokens.push(await this.authClient.AuthorizationToken({versionHash: masterVersionHash}));

  const headers = {
    Authorization: authorizationTokens.map(token => `Bearer ${token}`).join(",")
  };

  const body = {
    offering_key: offeringKey,
    variant_key: variant,
    prod_master_hash: masterVersionHash
  };

  let storeClear = false;
  if(abrProfile) {
    body.abr_profile = abrProfile;
    storeClear = abrProfile.store_clear;
  } else {
    // Retrieve ABR profile from library to check store clear
    storeClear = await this.ContentObjectMetadata({
      libraryId,
      objectId: this.utils.AddressToObjectId(this.utils.HashToAddress(libraryId)),
      metadataSubtree: "abr_profile/store_clear"
    });
  }

  if(!storeClear) {
    // If files are encrypted, generate encryption conks
    await this.EncryptionConk({
      libraryId,
      objectId: id,
      writeToken: write_token
    });
  }

  const {logs, errors, warnings} = await this.CallBitcodeMethod({
    libraryId,
    objectId: id,
    writeToken: write_token,
    method: UrlJoin("media", "abr_mezzanine", "init"),
    headers,
    body,
    constant: false
  });

  if(!metadata) { metadata = {}; }
  if(!metadata.public) { metadata.public = {}; }
  if(!metadata.public.asset_metadata) { metadata.public.asset_metadata = {}; }

  metadata.master = {
    name: masterName,
    id: this.utils.DecodeVersionHash(masterVersionHash).objectId,
    hash: masterVersionHash,
    variant
  };

  metadata.public = {
    ...metadata.public
  };

  metadata.public.asset_metadata = {
    sources: {
      [offeringKey]: {
        "/": `./rep/playout/${offeringKey}/options.json`
      }
    },
    ...metadata.public.asset_metadata
  };

  metadata.elv_created_at = new Date().getTime();

  if(name || !existingMez) {
    metadata.name = name || `${masterName} Mezzanine`;
    metadata.public.name = name || `${masterName} Mezzanine`;
  }

  if(description || !existingMez) {
    metadata.description = description || "";
    metadata.public.description = description || "";
  }

  await this.MergeMetadata({
    libraryId,
    objectId: id,
    writeToken: write_token,
    metadata
  });

  const finalizeResponse = await this.FinalizeContentObject({
    libraryId,
    objectId: id,
    writeToken: write_token
  });

  return {
    logs: logs || [],
    warnings: warnings || [],
    errors: errors || [],
    ...finalizeResponse
  };
};

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
exports.StartABRMezzanineJobs = async function({
  libraryId,
  objectId,
  offeringKey="default",
  access=[],
  jobIndexes = null
}) {
  ValidateParameters({libraryId, objectId});

  const mezzanineMetadata = await this.ContentObjectMetadata({
    libraryId,
    objectId,
    metadataSubtree: UrlJoin("abr_mezzanine", "offerings")
  });

  const prepSpecs = mezzanineMetadata[offeringKey].mez_prep_specs || [];

  // Retrieve all masters associated with this offering
  let masterVersionHashes = Object.keys(prepSpecs).map(spec =>
    (prepSpecs[spec].source_streams || []).map(stream => stream.source_hash)
  );

  // Flatten and filter
  masterVersionHashes = [].concat.apply([], masterVersionHashes)
    .filter(hash => hash)
    .filter((v, i, a) => a.indexOf(v) === i);

  // Retrieve authorization tokens for all masters and the mezzanine

  let authorizationTokens = await Promise.all(
    masterVersionHashes.map(async versionHash => await this.authClient.AuthorizationToken({versionHash}))
  );

  authorizationTokens = [
    await this.authClient.AuthorizationToken({libraryId, objectId, update: true}),
    ...authorizationTokens
  ];

  const headers = {
    Authorization: authorizationTokens.map(token => `Bearer ${token}`).join(",")
  };

  const processingDraft = await this.EditContentObject({libraryId, objectId});

  const lroInfo = {
    write_token: processingDraft.write_token,
    node: this.HttpClient.BaseURI().toString(),
    offering: offeringKey
  };

  // Update metadata with LRO version write token
  const statusDraft = await this.EditContentObject({libraryId, objectId});
  await this.ReplaceMetadata({
    libraryId,
    objectId,
    writeToken: statusDraft.write_token,
    metadataSubtree: `lro_draft_${offeringKey}`,
    metadata: lroInfo
  });
  await this.FinalizeContentObject({libraryId, objectId, writeToken: statusDraft.write_token});

  const {data, errors, warnings, logs} = await this.CallBitcodeMethod({
    libraryId,
    objectId,
    writeToken: processingDraft.write_token,
    headers,
    method: UrlJoin("media", "abr_mezzanine", "prep_start"),
    constant: false,
    body: {
      access,
      offering_key: offeringKey,
      job_indexes: jobIndexes
    }
  });

  return {
    lro_draft: lroInfo,
    writeToken: processingDraft.write_token,
    data,
    logs: logs || [],
    warnings: warnings || [],
    errors: errors || []
  };
};

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
exports.LROStatus = async function({libraryId, objectId, offeringKey="default"}) {
  ValidateParameters({libraryId, objectId});

  const lroDraft =
    await this.ContentObjectMetadata({
      libraryId,
      objectId,
      metadataSubtree: `lro_draft_${offeringKey}`
    }) ||
    await this.ContentObjectMetadata({
      libraryId,
      objectId,
      metadataSubtree: "lro_draft"
    });

  if(!lroDraft || !lroDraft.write_token) {
    // Write token not present - check if mezz has already been finalized
    const ready = await this.ContentObjectMetadata({
      libraryId,
      objectId,
      metadataSubtree: UrlJoin("abr_mezzanine", "offerings", offeringKey, "ready")
    });

    if(ready) {
      throw Error(`Mezzanine already finalized for offering '${offeringKey}'`);
    } else {
      throw Error("No LRO draft found for this mezzanine");
    }
  }

  let error, result;
  const fabricURIs = this.fabricURIs;
  try {
    this.SetNodes({fabricURIs: [lroDraft.node, ...fabricURIs]});

    result = await this.ContentObjectMetadata({
      libraryId,
      objectId,
      writeToken: lroDraft.write_token,
      metadataSubtree: "lro_status"
    });
  } catch(err) {
    error = err;
  } finally {
    this.SetNodes({fabricURIs});
  }

  if(error) { throw error; }

  return result;
};

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
exports.FinalizeABRMezzanine = async function({libraryId, objectId, offeringKey="default"}) {
  ValidateParameters({libraryId, objectId});

  const lroDraft = await this.ContentObjectMetadata({
    libraryId,
    objectId,
    metadataSubtree: `lro_draft_${offeringKey}`
  });

  if(!lroDraft || !lroDraft.write_token) {
    throw Error("No LRO draft found for this mezzanine");
  }

  const httpClient = this.HttpClient;
  let error, result;
  try {
    // Point directly to the node containing the draft
    this.HttpClient = new HttpClient({uris: [lroDraft.node], debug: httpClient.debug});

    const mezzanineMetadata = await this.ContentObjectMetadata({
      libraryId,
      objectId,
      writeToken: lroDraft.write_token,
      metadataSubtree: UrlJoin("abr_mezzanine", "offerings")
    });

    const masterHash = mezzanineMetadata[offeringKey].prod_master_hash;

    // Authorization token for mezzanine and master
    let authorizationTokens = [
      await this.authClient.AuthorizationToken({libraryId, objectId, update: true}),
      await this.authClient.AuthorizationToken({versionHash: masterHash})
    ];

    const headers = {
      Authorization: authorizationTokens.map(token => `Bearer ${token}`).join(",")
    };

    const {data, errors, warnings, logs} = await this.CallBitcodeMethod({
      objectId,
      libraryId,
      writeToken: lroDraft.write_token,
      method: UrlJoin("media", "abr_mezzanine", "offerings", offeringKey, "finalize"),
      headers,
      constant: false
    });

    const finalizeResponse = await this.FinalizeContentObject({
      libraryId,
      objectId: objectId,
      writeToken: lroDraft.write_token,
      awaitCommitConfirmation: false
    });

    result = {
      data,
      logs: logs || [],
      warnings: warnings || [],
      errors: errors || [],
      ...finalizeResponse
    };
  } catch(err) {
    error = err;
  } finally {
    // Ensure original http client is restored
    this.HttpClient = httpClient;
  }

  if(error) { throw error; }

  return result;
};
