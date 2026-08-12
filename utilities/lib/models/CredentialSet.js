// Holds sets of credentials for S3, along with path matching rules

const awsRegions = require("../data/aws_regions");
const awsRegionNames = Object.keys(awsRegions);

const {
  CheckedResult,
  NonBlankString,
  ObjectModel,
  SealedModel,
  TypedArrayNonEmpty
} = require("./Models");

const StorageEndpointModel = SealedModel({
  region: awsRegionNames
});

const CloudCredentialsModel = SealedModel({
  access_key_id: [NonBlankString],
  secret_access_key: [NonBlankString],
  signed_url: [NonBlankString]
}).assert(
  function hasOneAuthenticationMethod(credentials) {
    const hasAccessKey = Boolean(credentials.access_key_id);
    const hasSecret = Boolean(credentials.secret_access_key);
    const hasSignedUrl = Boolean(credentials.signed_url);

    return hasSignedUrl
      ? !hasAccessKey && !hasSecret
      : hasAccessKey && hasSecret;
  },
  "cloud_credentials must contain either signed_url or both access_key_id and secret_access_key"
);

const RemoteAccessModel = ObjectModel({
  protocol: "s3",
  platform: "aws",
  path: [NonBlankString],
  storage_endpoint: [StorageEndpointModel],
  cloud_credentials: CloudCredentialsModel
}).assert(
  function hasLocationForAccessKeyCredentials(remoteAccess) {
    if(remoteAccess.cloud_credentials.signed_url) return true;

    return Boolean(remoteAccess.path && remoteAccess.storage_endpoint);
  },
  "path and storage_endpoint are required when using access key credentials"
);

const CredentialModel = ObjectModel({
  path_matchers: TypedArrayNonEmpty(NonBlankString),
  remote_access: RemoteAccessModel
});

const CredentialSetModel = TypedArrayNonEmpty(CredentialModel);

const CheckedCredential = CheckedResult(CredentialModel);
const CheckedCredentialSet = CheckedResult(CredentialSetModel);

module.exports = {
  CheckedCredential,
  CheckedCredentialSet,
  CredentialModel,
  CredentialSetModel,
};
