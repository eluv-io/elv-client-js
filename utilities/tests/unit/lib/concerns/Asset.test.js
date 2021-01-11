const {expect} = require("chai");

const {concern, concern2utility} = require("../../../helpers/concerns");
const {removeElvEnvVars} = require("../../../helpers/params");

removeElvEnvVars();

const Asset = concern("Asset");

describe("Asset.statusMapProcess()", () => {

  it("should include --asset-metadata.FIELD_NAME args in metadata under /public/asset-metadata", () => {
    const assetUtility = concern2utility(
      Asset,
      [
        "--asset-metadata.title_type", "clip",
        "--asset-metadata.asset_type", "episode",
        "--asset-metadata.title", "myTitle"
      ]);

    const publicMetadata = assetUtility.concerns.Asset.publicMetadata({},"FOO");
    expect(publicMetadata.asset_metadata.title_type).to.equal("clip");
    expect(publicMetadata.asset_metadata.asset_type).to.equal("episode");
    expect(publicMetadata.asset_metadata.title).to.equal("myTitle");
  });

});
