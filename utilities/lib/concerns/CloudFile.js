const path = require("path");

const kindOf = require("kind-of");
const R = require("ramda");

const {removeTrailingSlash, throwError} = require("../helpers");

const {StdOpt, NewOpt} = require("../options");

const Client = require("./Client");
const CloudAccess = require("./CloudAccess");
const Logger = require("./Logger");

const s3BucketRegex = /^s3:\/\/([^/]+)\//i; // for matching and extracting bucket name when full s3:// path is specified

const chkCredsButNoS3 = (argv) => {
  if(argv.credentials) {
    if(!argv.s3Copy && !argv.s3Reference) {
      throw Error("--credentials supplied but neither --s3Copy nor --s3Reference specified");
    }
  }
  return true; // tell yargs that the arguments passed the check
};

const accessMatchIndex = R.curry(
  (access, filePath) => access.findIndex(
    (creds) => creds.path_matchers.findIndex(
      (reStr) => (new RegExp(reStr)).test(filePath)
    ) > -1
  )
);

// group the cloud storage files by matching credential set, check each file's source path against credential set path_matchers
const groupByPathMatch = (access, fileList) => R.groupBy(accessMatchIndex(access), fileList);

const validateBucketMatch = R.curry((credentialSet, sourceFilePath) => {
  const credentialSetBucket = removeTrailingSlash(credentialSet.remote_access.path);
  // if full s3 path supplied, check bucket name
  const s3prefixMatch = s3BucketRegex.exec(sourceFilePath);
  if(s3prefixMatch) {
    const bucketName = s3prefixMatch[1];
    if(bucketName !== credentialSetBucket) {
      throw Error("Full S3 file path \"" + sourceFilePath + "\" matched to credential set with different bucket name '" + credentialSetBucket + "'");
    }
  }
});

const validatePathMatchGroups = (access, groupedFiles) => {
  for(const [index, matchedFiles] of R.toPairs(groupedFiles)) {
    if(index === -1) {
      throw Error("Could not determine credentials to use (not path match found) for the following files(s): '" + matchedFiles.join("','") + "'");
    }
    matchedFiles.map(validateBucketMatch(access[index]));
  }
};

const blueprint = {
  name: "CloudFile",
  concerns: [Logger, CloudAccess, Client],
  options: [
    StdOpt("files", {demand: true}),
    NewOpt("s3Copy", {
      conflicts: "s3Reference",
      descTemplate: "If specified, files will be copied from an S3 bucket instead of uploaded from the local filesystem",
      group: "Cloud",
      type: "boolean"
    }),
    NewOpt("s3Reference", {
      conflicts: ["s3Copy", "encrypt"],
      descTemplate: "If specified, files will be added as links to S3 bucket items rather than uploaded from the local filesystem",
      group: "Cloud",
      type: "boolean"
    }),
    NewOpt("resume", {
      descTemplate: "If specified, resume jobs for the given write token",
      group: "Cloud",
      type: "string"
    })
  ],
  checksMap: {chkCredsButNoS3}
};

const New = context => {

  const credentialSet = context.concerns.CloudAccess.credentialSet;
  const callback = context.concerns.Logger.log;

  const fileInfo = (files) => {
    files = files || context.args.files;
    return files.map(
      (filePath) => {
        return {
          path: path.basename(filePath),
          source: filePath,
        };
      }
    );
  };

  const add = async ({libraryId, objectId, writeToken, files, access, encrypt, copy}) => {
    if(kindOf(copy) === "undefined") copy = isCopy();
    files = files || context.args.files;
    const groupedFiles = groupByPathMatch(access, files);
    validatePathMatchGroups(groupedFiles);

    const client = await context.concerns.Client.get();

    // iterate over file groups, add to fabric object using credential set for group
    for(const [index, fileList] of R.toPairs(groupedFiles)) {
      const credentialSet = access[index];
      const region = credentialSet.remote_access.storage_endpoint.region;
      const bucket = removeTrailingSlash(credentialSet.remote_access.path);
      const accessKey = credentialSet.remote_access.cloud_credentials.access_key_id;
      const secret = credentialSet.remote_access.cloud_credentials.secret_access_key;

      await client.UploadFilesFromS3({
        libraryId,
        objectId,
        writeToken,
        fileInfo: fileInfo(fileList),
        region,
        bucket,
        accessKey,
        secret,
        copy,
        callback,
        encryption: encrypt ? "cgck" : "none"
      });
    }
  };

  const resume = async ({libraryId, objectId, writeToken, files, access, encrypt, copy}) => {
    if(kindOf(copy) === "undefined") copy = isCopy();
    files = files || context.args.files;
    const groupedFiles = groupByPathMatch(access, files);
    validatePathMatchGroups(groupedFiles);

    const client = await context.concerns.Client.get();

    // iterate over file groups, add to fabric object using credential set for group
    for(const [index, fileList] of R.toPairs(groupedFiles)) {
      const credentialSet = access[index];
      const region = credentialSet.remote_access.storage_endpoint.region;
      const bucket = removeTrailingSlash(credentialSet.remote_access.path);
      const accessKey = credentialSet.remote_access.cloud_credentials.access_key_id;
      const secret = credentialSet.remote_access.cloud_credentials.secret_access_key;

      await client.ResumeFilesFromS3({
        libraryId,
        objectId,
        writeToken,
        fileInfo: fileInfo(fileList),
        region,
        bucket,
        accessKey,
        secret,
        copy,
        callback,
        encryption: encrypt ? "cgck" : "none"
      });
    }
  };

  const isCopy = () => kindOf(context.args.s3Copy) === "undefined"
    ? kindOf(context.args.s3Reference) === "undefined"
      ? throwError("Neither --s3Copy nor --s3Reference were specified")
      : !context.args.s3Reference
    : context.args.s3Copy;


  return {add, callback, credentialSet, fileInfo, isCopy, resume};
};

module.exports = {blueprint, New};