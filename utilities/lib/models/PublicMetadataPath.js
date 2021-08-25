// Validator for public metadata paths /public/...

const {
  BasicModel,
  TypedArrayNonEmpty
} = require("./Models");

const RegExPublicMetadataPath = /^\/public\/.+$/;

const PublicMetadataPathModel = BasicModel(String).assert(function matchesRegex(str) {
  return RegExPublicMetadataPath.exec(str) !== null;
}).as("PublicMetadataPath");

const PublicMetadataPathArrayModel = TypedArrayNonEmpty(PublicMetadataPathModel);

module.exports = {
  PublicMetadataPathArrayModel,
  PublicMetadataPathModel
};
