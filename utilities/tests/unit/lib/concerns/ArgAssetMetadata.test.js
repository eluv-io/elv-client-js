const {expect} = require("chai");

const {concern, concern2utility} = require("../../../helpers/concerns");
const {removeElvEnvVars} = require("../../../helpers/params");

removeElvEnvVars();

const ArgAssetMetadata = concern("ArgAssetMetadata");

describe("ArgAssetMetadata.statusMapProcess()", () => {

  it("should include --asset-metadata.FIELD_NAME args in metadata under /public/asset-metadata, and also compute derived fields correctly", () => {
    const assetUtility = concern2utility(
      ArgAssetMetadata,
      [
        "--asset-metadata.title_type", "clip",
        "--asset-metadata.asset_type", "episode",
        "--asset-metadata.title", "myTitle"
      ]);

    const publicMetadata = assetUtility.concerns.ArgAssetMetadata.publicMetadata({oldPublicMetadata:{}, backupNameSuffix: "FOO"});

    expect(publicMetadata.asset_metadata.title_type).to.equal("clip");
    expect(publicMetadata.asset_metadata.asset_type).to.equal("episode");
    expect(publicMetadata.asset_metadata.title).to.equal("myTitle");
    expect(publicMetadata.asset_metadata.display_title).to.equal("myTitle");
    expect(publicMetadata.asset_metadata.slug).to.equal("my-title");
    expect(publicMetadata.asset_metadata.ip_title_id).to.equal("my-title");
    expect(publicMetadata.name).to.equal("myTitle FOO");
  });

});
