/**
 * Methods for ABR video creation and management
 *
 * For more information on how to publish ABR content see <a href="https://docs.eluv.io/docs/guides/media-ingest/">this detailed guide</a>
 *
 * @module ElvClient/ABRPublishing
 */

const R = require("ramda");
const UrlJoin = require("url-join");

const {
  ValidateLibrary,
  ValidateVersion,
  ValidateParameters,
  ValidateWriteToken
} = require("../Validation");

// When `/abr_mezzanine/offerings` contains more than one entry, only 1 is the 'real' offering, the others are
// additional copies to be modified upon finalization due to addlOfferingSpecs having been specified in call to
// `CreateABRMezzanine()`. The 'real' offering will have an object stored in `mez_prep_specs`, the copies will not.
// This function accepts the metadata retrieved from `/abr_mezzanine/offerings` and returns the offering key for the
// 'real' offering that actually has transcode LROs.
// If no suitable offering is found, throws an error.
const MezJobMainOfferingKey = function(abrMezOfferings) {
  if(!abrMezOfferings) throw Error("No mezzanine preparation job info found at /abr_mezzanine");
  const mainOfferingKey = Object.keys(abrMezOfferings).find(offKey => abrMezOfferings[offKey].mez_prep_specs);
  if(!mainOfferingKey) throw Error("Could not determine offering key for last submitted job");
  return mainOfferingKey;
};

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
 * @param {string=} writeToken - Write token of the draft. If specified, the object will not be finalized.
 * @param {Object=} metadata - Additional metadata for the content object
 * @param {Array<Object>=} fileInfo - Files to upload (See UploadFiles/UploadFilesFromS3 method)
 * @param {boolean=} encrypt=true - (Local or copied files only) - Unless `false` is passed in explicitly, any uploaded/copied files will be stored encrypted
 * @param {boolean=} copy=false - (S3) If specified, files will be copied from S3
 * @param {function=} callback - Progress callback for file upload (See UploadFiles/UploadFilesFromS3 method)
 * @param {("warn"|"info"|"debug")=} respLogLevel=warn - The level of logging to return in http response
 * @param {("none"|"error"|"warn"|"info"|"debug")=} structLogLevel=none - The level of logging to save to object metadata
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
  writeToken,
  name,
  description,
  metadata={},
  fileInfo,
  encrypt=true,
  access=[],
  copy=false,
  callback,
  respLogLevel = "warn",
  structLogLevel="none"
}) {
  ValidateLibrary(libraryId);
  let objectId;
  const finalize = !writeToken;

  if(writeToken) {
    // if write token passed in, don't create a new object
    objectId = this.utils.DecodeWriteToken(writeToken).objectId;
  } else {
    // no write token supplied - create a new object and get write token
    ({objectId, writeToken} = await this.CreateContentObject({
      libraryId,
      options: type ? { type } : {}
    }));
  }

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
            objectId,
            writeToken,
            fileInfo: credentialSet.matched,
            region,
            bucket,
            accessKey,
            secret,
            copy,
            callback,
            encryption: encrypt ? "cgck" : "none"
          });
        }
      }

    } else {
      await this.UploadFiles({
        libraryId,
        objectId,
        writeToken,
        fileInfo,
        callback,
        encryption: encrypt ? "cgck" : "none"
      });
    }
  }

  await this.CreateEncryptionConk({libraryId, objectId, writeToken, createKMSConk: true});

  const { logs, errors, warnings } = await this.CallBitcodeMethod({
    libraryId,
    objectId,
    writeToken,
    method: UrlJoin("media", "production_master", "init"),
    queryParams: {
      response_log_level: respLogLevel,
      struct_log_level: structLogLevel
    },
    body: {
      access
    },
    constant: false
  });

  await this.MergeMetadata({
    libraryId,
    objectId,
    writeToken,
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

  let additionalReturnVals;

  if(finalize) {
    additionalReturnVals = await this.FinalizeContentObject({
      libraryId,
      objectId,
      writeToken,
      commitMessage: "Create master",
      awaitCommitConfirmation: false
    });
  } else {
    additionalReturnVals = {
      write_token: writeToken,
      type,
      qlib_id: libraryId,
      id: objectId
    };
  }

  return {
    errors: errors || [],
    logs: logs || [],
    warnings: warnings || [],
    ...additionalReturnVals
  };
};

/**
 * Create (or edit) a mezzanine offering based on a given master content object version and variant key
 *
 * @methodGroup ABR Publishing
 * @namedParams
 * @param {Object=} abrProfile - Custom ABR profile. If not specified, the profile of the mezzanine library will be used
 * @param {Object=} addlOfferingSpecs - Specs for additional offerings to create by patching the offering being created/edited
 * @param {string=} description - Description for mezzanine content object
 * @param {boolean=} keepOtherStreams=false - If objectId is specified, whether to preserve existing streams with keys other than the ones specified in production master
 * @param {string} libraryId - ID of the mezzanine library
 * @param {string} masterVersionHash - The version hash of the production master content object
 * @param {string=} masterWriteToken - The write token of the production master content object draft.
 * @param {string=} writeToken - The write token of the mezzanine object draft. If specified, the object will not be finalized, and no extra version of the object will be created to hold "bread crumb" metadata entry /lro_draft
 * @param {Object=} metadata - Additional metadata for mezzanine content object
 * @param {string} name - Name for mezzanine content object
 * @param {string=} objectId - ID of existing object (if not specified, new object will be created)
 * @param {string=} offeringKey=default - The key of the offering to create
 * @param {("warn"|"info"|"debug")=} respLogLevel=warn - The level of logging to return in http response
 * @param {("none"|"error"|"warn"|"info"|"debug")=} structLogLevel=none - The level of logging to save to object metadata
 * @param {Array<string>} streamKeys - List of stream keys from variant to include. If not supplied all streams will be included.
 * @param {string=} type - ID or version hash of the content type for the mezzanine
 * @param {string=} variant=default - What variant of the master content object to use
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
  masterWriteToken,
  writeToken,
  abrProfile,
  addlOfferingSpecs,
  variant="default",
  offeringKey="default",
  keepOtherStreams= false,
  respLogLevel = "warn",
  structLogLevel="none",
  streamKeys
}) {

  if(!masterVersionHash && !masterWriteToken) {
    throw Error("Neither master version hash nor master write token specified. One must be provided");
  }

  if(masterVersionHash && masterWriteToken) {
    throw Error("Both master version hash and master write token specified. Only one can be provided");
  }

  // double-check library id for mez
  ValidateLibrary(libraryId);

  // The following 2 vars are used only if masterWriteToken is passed in (to retrieve master name)
  let masterObjectId;
  let masterLibId;
  if(masterVersionHash) {
    // NOTE: masterObjectId is left undefined if masterWriteToken not passed in
    ValidateVersion(masterVersionHash);
  } else if(masterWriteToken) {
    // determine master object id if a master write token was passed in
    ValidateWriteToken(masterWriteToken);
    masterObjectId = this.utils.DecodeWriteToken(masterWriteToken).objectId;
    masterLibId = await client.ContentObjectLibraryId({masterObjectId});
  }

  // if pre-existing mez object id passed in, validate
  if(objectId) ValidateObject(objectId);

  // if mez write token supplied, validate it
  if(writeToken) {
    ValidateWriteToken(writeToken, objectId);

    // if pre-existing mez object id not passed in, decode it from write token
    objectId = objectId || this.utils.DecodeWriteToken(writeToken).objectId;
  }
  // After above, if objectId is undefined then no mez writeToken was passed in, no mez objectId was passed in,
  // meaning we must create a new object
  const useExistingMez = !!objectId; // type coerce string or undefined to boolean: "" -> false, undefined -> false, all else -> true

  if(!objectId && (keepOtherStreams)) throw Error("Existing mezzanine object ID required in order to use 'keepOtherStreams'");

  if(addlOfferingSpecs && !abrProfile) throw Error("abrProfile required when using addlOfferingSpecs");

  let options = type ? { type } : {};

  const finalize = !writeToken;

  // are we ingesting to an existing mez (and did NOT supply a write token?)
  if(useExistingMez && !writeToken) {
    // then we need to obtain a write token for the existing object
    ({writeToken} = await this.EditContentObject({
      libraryId,
      objectId,
      options
    }));
  }

  // if we are not using an existing mez, we need to create a brand new object (in draft form)
  if(!useExistingMez) {
    // Create new mez object
    ({objectId, writeToken} = await this.CreateContentObject({
      libraryId,
      options
    }));
  }

  // from here forwards, objectId and writeToken can be assumed to be populated (both refer to mez)

  // ensure this object has encryption/kms conk
  await this.CreateEncryptionConk({libraryId, objectId, writeToken, createKMSConk: true});

  // figure out where to read master metadata from
  const masterMetaSource = masterWriteToken ? {
    libraryId: masterLibId,
    objectId: masterObjectId,
    writeToken: masterWriteToken
  } : {versionHash: masterVersionHash};

  const masterName = await this.ContentObjectMetadata({
    ...masterMetaSource,
    metadataSubtree: "public/name"
  });

  // Include authorization for library, master, and mezzanine
  let authorizationTokens = [];
  authorizationTokens.push(await this.authClient.AuthorizationToken({libraryId, objectId, update: true}));
  authorizationTokens.push(await this.authClient.AuthorizationToken({libraryId}));
  // only 1 of the vars masterVersionHash and masterObjectId below will contain a value
  authorizationTokens.push(await this.authClient.AuthorizationToken({versionHash: masterVersionHash, objectId: masterObjectId}));

  const headers = {
    Authorization: authorizationTokens.map(token => `Bearer ${token}`).join(",")
  };

  const body = {
    additional_offering_specs: addlOfferingSpecs,
    offering_key: offeringKey,
    keep_other_streams: keepOtherStreams,
    prod_master_hash: masterWriteToken || masterVersionHash,
    stream_keys: streamKeys,
    variant_key: variant
  };

  let storeClear;
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
    // If mez parts are to be encrypted, generate encryption conks
    await this.EncryptionConk({
      libraryId,
      objectId,
      writeToken
    });
  }

  const {logs, errors, warnings} = await this.CallBitcodeMethod({
    libraryId,
    objectId,
    writeToken,
    method: UrlJoin("media", "abr_mezzanine", "init"),
    queryParams: {
      response_log_level: respLogLevel,
      struct_log_level: structLogLevel
    },
    headers,
    body,
    constant: false
  });

  if(!metadata) { metadata = {}; }
  if(!metadata.public) { metadata.public = {}; }
  if(!metadata.public.asset_metadata) { metadata.public.asset_metadata = {}; }

  let masterId;
  if(masterWriteToken) {
    masterId = this.utils.DecodeWriteToken(masterWriteToken).objectId;
  } else if(masterVersionHash) {
    masterId = this.utils.DecodeVersionHash(masterVersionHash).objectId;
  }

  metadata.master = {
    name: masterName,
    id: masterId,
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

  if(name || !useExistingMez) {
    metadata.name = name || `${masterName} Mezzanine`;
    metadata.public.name = name || `${masterName} Mezzanine`;
  }

  if(description || !useExistingMez) {
    metadata.description = description || "";
    metadata.public.description = description || "";
  }

  // retrieve existing metadata to merge with updated metadata
  const existingMetadata = await this.ContentObjectMetadata({
    libraryId,
    objectId,
    writeToken,
  });
  // newer metadata values replace existing metadata, unless both new and old values are objects,
  // in which case their keys are merged recursively
  metadata = R.mergeDeepRight(existingMetadata, metadata);

  if(!useExistingMez) {
    // set creation date
    metadata.elv_created_at = new Date().getTime();
  }

  // write metadata to mezzanine object
  await this.ReplaceMetadata({
    libraryId,
    objectId,
    writeToken,
    metadata
  });

  let additionalReturnVals;
  if(finalize) {
    additionalReturnVals = await this.FinalizeContentObject({
      libraryId,
      objectId,
      writeToken,
      commitMessage: "Create ABR mezzanine"
    });
  } else {
    additionalReturnVals = {
      write_token: writeToken,
      type,
      qlib_id: libraryId,
      id: objectId
    };
  }

  return {
    logs: logs || [],
    warnings: warnings || [],
    errors: errors || [],
    ...additionalReturnVals
  };
};

/**
 * Start transcoding jobs previously set up by CreateABRMezzanine() on the specified mezzanine
 *
 * @methodGroup ABR Publishing
 * @namedParams
 * @param {string} libraryId - ID of the mezzanine library
 * @param {string} objectId - ID of the mezzanine object
 * @param {string=} writeToken - Write token of the mezzanine object draft. If provided, no "bread crumb" metadata /lro_draft will be created, nor saved as an extra finalized version
 * @param {Array<Object>=} access - Array of S3 credentials, along with path matching regexes - Required if any files in the masters are S3 references (See CreateProductionMaster method)
 * - Format: {region, bucket, accessKey, secret}
 * @param {number[]} jobIndexes - Array of LRO job indexes to start. LROs are listed in a map under metadata key /abr_mezzanine/offerings/(offeringKey)/mez_prep_specs/, and job indexes start with 0, corresponding to map keys in alphabetical order
 *
 * @return {Promise<Object>} - A write token for the mezzanine object, as well as any logs, warnings and errors from the job initialization
 */
exports.StartABRMezzanineJobs = async function({
  libraryId,
  objectId,
  writeToken,
  access=[],
  jobIndexes = null
}) {
  ValidateParameters({libraryId, objectId});

  const writeTokenSupplied = !!writeToken;

  if(writeTokenSupplied) {
    ValidateWriteToken(writeToken, objectId);
    objectId = objectId || this.utils.DecodeWriteToken(writeToken).objectId;
  }

  const lastJobOfferingsInfo = await this.ContentObjectMetadata({
    libraryId,
    objectId,
    writeToken,
    metadataSubtree: UrlJoin("abr_mezzanine", "offerings")
  });
  const offeringKey = MezJobMainOfferingKey(lastJobOfferingsInfo);

  const prepSpecs = lastJobOfferingsInfo[offeringKey].mez_prep_specs;
  if(!prepSpecs) throw Error("No stream preparation specs found");

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
    masterVersionHashes.map(async versionHash => {
      let payload = {};
      // Hash may be a write token since media/abr_mezzanine/init doesn't support write token, only prod_master_hash
      if(versionHash.startsWith("tqw__")) {
        payload["objectId"] = this.utils.DecodeWriteToken(versionHash).objectId;
      } else {
        payload["versionHash"] = versionHash;
      }
      return await this.authClient.AuthorizationToken({...payload});
    })
  );

  authorizationTokens = [
    await this.authClient.AuthorizationToken({libraryId, objectId, update: true}),
    ...authorizationTokens
  ];

  const headers = {Authorization: authorizationTokens.map(token => `Bearer ${token}`).join(",")};

  let breadCrumb;
  let breadCrumbHash;
  // If we did not have a write token passed in, get a new write token for the LROs to write to
  if(!writeTokenSupplied) {
    const lroWorkingDraft = await this.EditContentObject({libraryId, objectId});
    writeToken = lroWorkingDraft.writeToken;

    // Save this write token (and node url, and offering key) to ANOTHER, NEW write token in order to
    // record "bread crumb" metadata at /lro_draft, and save (finalize) this second write token
    const breadCrumbDraft = await this.EditContentObject({libraryId, objectId});
    breadCrumb = {
      write_token: lroWorkingDraft.writeToken,
      node: lroWorkingDraft.nodeUrl,
      offering: offeringKey
    };

    await this.ReplaceMetadata({
      libraryId,
      objectId,
      writeToken: breadCrumbDraft.writeToken,
      metadataSubtree: "lro_draft",
      metadata: breadCrumb
    });

    const finalizeResponse = await this.FinalizeContentObject({
      libraryId,
      objectId,
      writeToken: breadCrumbDraft.write_token,
      commitMessage: "Save mez LRO write token to /lro_draft"
    });
    breadCrumbHash = finalizeResponse.hash;
  }

  // make sure we have correct nodeUrl for this token
  const nodeUrl = await this.WriteTokenNodeUrlNetwork({writeToken});
  // tell http client what node to contact for this write token
  this.RecordWriteToken({writeToken, fabricNodeUrl: nodeUrl});

  // Make the API call that actually starts the LROs
  const {data, errors, warnings, logs} = await this.CallBitcodeMethod({
    libraryId,
    objectId,
    writeToken,
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
    hash: breadCrumbHash,
    lro_draft: breadCrumb,
    writeToken,
    nodeUrl,
    data,
    logs: logs || [],
    warnings: warnings || [],
    errors: errors || []
  };
};

/**
 * Retrieve node and write token for a mezzanine's current offering preparation job (if any).
 * Also returns the offering key.
 *
 * This information is contained in metadata at /lro_draft, in an extra version of the object
 * that gets created and finalized as part of creating a mezzanine. This serves as a "bread crumb trail" to
 * allow users to find the active draft/write token that the ingest LROs are writing to.
 *
 * @methodGroup ABR Publishing
 * @namedParams
 * @param {string} libraryId - ID of the library
 * @param {string} objectId - ID of the object
 *
 * @return {Promise<Object>} - LRO status
 */
exports.LRODraftInfo = async function({libraryId, objectId}) {
  const standardPathContents = await this.ContentObjectMetadata({
    libraryId,
    objectId,
    metadataSubtree: "lro_draft"
  });

  if(standardPathContents) return standardPathContents;

  // get last job info, under /abr_mezzanine/offerings/
  const lastJobOfferingsInfo = await this.ContentObjectMetadata({
    libraryId,
    objectId,
    writeToken,
    metadataSubtree: UrlJoin("abr_mezzanine", "offerings")
  });

  if(!lastJobOfferingsInfo) throw Error("No metadata for mezzanine preparation job found at /abr_mezzanine");

  const mainOfferingKey = MezJobMainOfferingKey(lastJobOfferingsInfo);
  if(!mainOfferingKey) throw Error("Could not determine offering key for last submitted job");

  // see if offering from last job was finalized
  const ready = lastJobOfferingsInfo[mainOfferingKey].ready;

  // old location for LRO draft info
  const oldPathContents = await this.ContentObjectMetadata({
    libraryId,
    objectId,
    writeToken,
    metadataSubtree: `lro_draft_${mainOfferingKey}`
  });
  if(oldPathContents) {
    return oldPathContents;
  } else {
    if(ready) {
      throw Error("No LRO draft found for this mezzanine - looks like last mez prep job was already finalized.");
    } else {
      throw Error("No LRO draft found for this mezzanine - looks like last mez prep job was either cancelled or discarded.");
    }
  }
};

/**
 * Retrieve status information for mezzanine transcoding jobs, aka long running operations (LROs) on the given object.
 * If a write token is passed in, its draft will be checked directly by lookiing at /lro_status.
 * If a write token is not passed in, then the latest version of objectId will be checked for "bread crumb" entry
 * at /lro_draft, to determine the write token that current ingest LRO(s) are writing to.
 *
 * @methodGroup ABR Publishing
 * @namedParams
 * @param {string} libraryId - ID of the library
 * @param {string} objectId - ID of the object
 * @param {string=} writeToken - Write token of the active draft (that the transcode LROs are writing to)
 *
 * @return {Promise<Object>} - LRO status
 */
exports.LROStatus = async function({libraryId, objectId, writeToken= ""}) {
  ValidateParameters({libraryId, objectId});

  let activeWriteToken;
  if(writeToken) {
    ValidateWriteToken(writeToken, objectId);
    activeWriteToken = writeToken;
  } else {
    const lroDraft = await this.LRODraftInfo({libraryId, objectId});
    activeWriteToken = lroDraft.write_token;
    const fabricNodeUrl = await this.WriteTokenNodeUrlNetwork({writeToken: activeWriteToken});
    this.RecordWriteToken({writeToken: lroDraft.write_token, fabricNodeUrl});
  }

  return await this.ContentObjectMetadata({
    libraryId,
    objectId,
    writeToken: activeWriteToken,
    metadataSubtree: "lro_status"
  });
};

/**
 * Process completed mezzanine transcoding LRO(s), creating the final offering(s) from the transcode(s)
 * Unless a writeToken is passed in, finalize the mez object working draft as well.
 *
 * If a writeToken is not passed in, then it will be retrieved from /lro_draft of most recent version of object.
 * This is a "bread crumb" entry that gets created by StartABRMezzanineJobs() - unless a writeToken was passed in to StartABRMezzanineJobs() also.
 *
 * @methodGroup ABR Publishing
 * @namedParams
 * @param {string} libraryId - ID of the mezzanine library
 * @param {string} objectId - ID of the mezzanine object
 * @param {string=} writeToken - Write token for the mezzanine object. If specified, the object will not be finalized.
 * @param {function=} preFinalizeFn - A function to call before finalizing changes, to allow further modifications to offering. The function will be invoked with {elvClient, nodeUrl, writeToken} to allow access to the draft and MUST NOT finalize the draft.
 * @param {boolean=} preFinalizeThrow - If set to `true` then any error thrown by preFinalizeFn will not be caught. Otherwise, any exception will be appended to the `warnings` array returned after finalization.
 *
 * @return {Promise<Object>} - The finalize response for the mezzanine object, as well as any logs, warnings and errors from the finalization
 */
exports.FinalizeABRMezzanine = async function({libraryId, objectId, preFinalizeFn, preFinalizeThrow, writeToken=""}) {
  ValidateParameters({libraryId, objectId});

  if(writeToken) {
    ValidateWriteToken(writeToken, objectId);
    objectId = objectId || this.utils.DecodeWriteToken(writeToken).objectId;
  } else {
    // get write token from draft info
    const lroDraft = await this.LRODraftInfo({libraryId, objectId});
    writeToken = lroDraft.write_token;
  }

  const fabricNodeUrl = await this.WriteTokenNodeUrlNetwork({writeToken});
  // tell http client what node to contact for this write token
  this.RecordWriteToken({writeToken, fabricNodeUrl});

  const lastJobOfferingsInfo = await this.ContentObjectMetadata({
    libraryId,
    objectId,
    writeToken,
    metadataSubtree: UrlJoin("abr_mezzanine", "offerings")
  });

  const offeringKey = MezJobMainOfferingKey(lastJobOfferingsInfo);
  const masterHash = lastJobOfferingsInfo[offeringKey].prod_master_hash;

  let masterIdentifier = {};
  if(masterHash.startsWith("tqw__")) {
    masterIdentifier["objectId"] = this.utils.DecodeWriteToken(masterHash).objectId;
  } else {
    masterIdentifier["versionHash"] = masterHash;
  }

  // Authorization token for mezzanine and master
  let authorizationTokens = [
    await this.authClient.AuthorizationToken({libraryId, objectId, update: true}),
    await this.authClient.AuthorizationToken({...masterIdentifier})
  ];

  const headers = {Authorization: authorizationTokens.map(token => `Bearer ${token}`).join(",")};

  const {data, errors, warnings, logs} = await this.CallBitcodeMethod({
    objectId,
    libraryId,
    writeToken,
    method: UrlJoin("media", "abr_mezzanine", "offerings", offeringKey, "finalize"),
    headers,
    constant: false
  });

  let preFinalizeWarnings = [];
  if(preFinalizeFn) {
    const params = {
      nodeUrl,
      offeringKey,
      writeToken
    };
    try {
      await preFinalizeFn(params);
    } catch(err) {
      if(preFinalizeThrow) {
        // noinspection ExceptionCaughtLocallyJS
        throw new Error("Error running preFinalize function", {cause: err});
      } else {
        preFinalizeWarnings = `Error running preFinalize function: ${err}`;
      }
    }
  }

  // only finalize if we did NOT have a writeToken passed in
  const finalizeResponse = writeToken ? {} : await this.FinalizeContentObject({
    libraryId,
    objectId,
    writeToken,
    commitMessage: "Finalize ABR mezzanine",
    awaitCommitConfirmation: false
  });

  return {
    data,
    logs: logs || [],
    warnings: (warnings || []).concat(preFinalizeWarnings),
    errors: errors || [],
    ...finalizeResponse
  };
};
