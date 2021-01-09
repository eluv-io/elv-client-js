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
  access_key_id: NonBlankString,
  secret_access_key: NonBlankString
});

const RemoteAccessModel = ObjectModel({
  protocol: "s3",
  platform: "aws",
  path: NonBlankString,
  storage_endpoint: StorageEndpointModel,
  cloud_credentials: CloudCredentialsModel
});

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