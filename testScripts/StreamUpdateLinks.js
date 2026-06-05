const { ElvClient } = require("../src/index");

const Test = async () => {
  try {
    const client = await ElvClient.FromNetworkName({
      networkName: "demo"
    });

    const wallet = client.GenerateWallet();
    const signer = wallet.AddAccount({
      privateKey: process.env.PRIVATE_KEY
    });

    client.SetSigner({signer});

    CreateLink = ({
      targetHash,
      linkTarget="meta/public/asset_metadata",
      options={},
      autoUpdate=true
    }) => {
      return {
        ...options,
        ".": {
          ...(options["."] || {}),
          ...autoUpdate ? {"auto_update": {"tag": "latest"}} : undefined
        },
        "/": `/qfab/${targetHash}/${linkTarget}`
      };
    };

    UpdateStreamLink = async ({siteLibraryId, siteId, objectId, slug}) => {
      try {
        const originalLink = await client.ContentObjectMetadata({
          libraryId: siteLibraryId,
          objectId: siteId,
          metadataSubtree: `public/asset_metadata/live_streams/${slug}`,
        });

        const link = CreateLink({
          targetHash: await client.LatestVersionHash({objectId}),
          options: {order: originalLink.order}
        });

        await client.ReplaceMetadata({
          libraryId: siteLibraryId,
          objectId: siteId,
          writeToken,
          metadataSubtree: `public/asset_metadata/live_streams/${slug}`,
          metadata: link
        });
      } catch(error) {
        // eslint-disable-next-line no-console
        console.error("Unable to update stream link", error);
      }
    }

    const {streamMetadata, siteObjectId, siteLibraryId} = await client.StreamGetSiteData({streamOptions: {resolveIncludeSource: false, resolveLinks: false}});

    const {writeToken} = await client.EditContentObject({
      libraryId: siteLibraryId,
      objectId: siteObjectId
    });

    for(let streamSlug in streamMetadata) {
      const obj = streamMetadata[streamSlug];

      const versionHash = obj["/"] ? obj["/"].split("/")[2] : obj["."].source;
      const objId = client.utils.DecodeVersionHash(versionHash).objectId;

      await UpdateStreamLink({
        siteLibraryId,
        objectId: objId,
        siteId: siteObjectId,
        slug: streamSlug
      });
    }

    await client.FinalizeContentObject({
      libraryId: siteLibraryId,
      objectId: siteObjectId,
      writeToken,
      commitMessage: "Update stream link",
      awaitCommitConfirmation: true
    });

  } catch(error) {
    console.error(error);
    console.error(JSON.stringify(error, null, 2));
  }

  process.exit(0);
};

Test();
