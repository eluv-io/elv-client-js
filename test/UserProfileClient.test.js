const TestSuite = require("./TestSuite/TestSuite");
const {
  afterAll,
  beforeAll,
  describe,
  expect,
  spyOn,
  runTests,
  test
} = new TestSuite();

const fs = require("fs");
const OutputLogger = require("./utils/OutputLogger");
const {CreateClient, BufferToArrayBuffer, ReturnBalance, RandomBytes} = require("./utils/Utils");
const UserProfileClient = require("../src/UserProfileClient");

let client, tagClient, testFile;
const testFileSize = 10000;

const CreateTaggedObject = async (tagLibraryId, tags) => {
  const createResponse = await tagClient.CreateContentObject({
    libraryId: tagLibraryId,
    options: {
      visibility: 100
    }
  });

  await tagClient.ReplaceMetadata({
    libraryId: tagLibraryId,
    objectId: createResponse.id,
    writeToken: createResponse.write_token,
    metadata: { video_tags: [{ tags }] }
  });

  await tagClient.FinalizeContentObject({libraryId: tagLibraryId, objectId: createResponse.id, writeToken: createResponse.write_token});

  return createResponse.id;
};

// Describe blocks and tests within them are run in order
describe("Test UserProfileClient", () => {
  beforeAll(async () => {
    client = await CreateClient("UserProfileClient");
    tagClient = await CreateClient("UserProfileClient Tags");
    testFile = RandomBytes(testFileSize);

    client.userProfileClient = OutputLogger(UserProfileClient, client.userProfileClient);
  });

  afterAll(async () => {
    await Promise.all([client, tagClient].map(async client => ReturnBalance(client)));
  });

  test("User Profile Automatically Created", async () => {
    const walletAddress = await client.userProfileClient.WalletAddress();
    expect(walletAddress).toBeDefined();
  });

  test("Metadata", async () => {
    const initialMetadata = {
      public: {
        meta: "data"
      },
      toMerge: {
        meta: "data"
      },
      toReplace: {
        meta: "data"
      },
      toDelete: {
        meta: "data"
      }
    };

    await client.userProfileClient.MergeUserMetadata({metadata: initialMetadata});

    const metadata = await client.userProfileClient.UserMetadata();
    expect(metadata).toBeDefined();
    expect(metadata).toMatchObject(initialMetadata);

    const subMetadata = await client.userProfileClient.UserMetadata({metadataSubtree: "toMerge"});
    expect(subMetadata).toBeDefined();
    expect(subMetadata).toEqual({meta: "data"});

    await client.userProfileClient.MergeUserMetadata({metadataSubtree: "toMerge", metadata: {new: "metadata"}});
    await new Promise(resolve => setTimeout(resolve, 1000));
    await client.userProfileClient.ReplaceUserMetadata({metadataSubtree: "toReplace", metadata: {new: "metadata"}});
    await new Promise(resolve => setTimeout(resolve, 1000));
    await client.userProfileClient.DeleteUserMetadata({metadataSubtree: "toDelete"});
    await new Promise(resolve => setTimeout(resolve, 1000));

    const updatedMetadata = await client.userProfileClient.UserMetadata();
    expect(updatedMetadata).toBeDefined();
    expect(updatedMetadata).toMatchObject({
      public: {
        meta: "data"
      },
      toMerge: {
        meta: "data",
        new: "metadata"
      },
      toReplace: {
        new: "metadata"
      }
    });
    expect(updatedMetadata.toDelete).not.toBeDefined();

    const publicMetadata = await client.userProfileClient.PublicUserMetadata({address: client.signer.address});
    expect(publicMetadata).toBeDefined();
    expect(publicMetadata).toMatchObject({meta: "data"});
  });

  test("User Profile Image", async () => {
    const image = BufferToArrayBuffer(fs.readFileSync("test/files/test-image1.png"));
    await client.userProfileClient.SetUserProfileImage({image});
    const oldImage = await client.userProfileClient.PublicUserMetadata({address: client.signer.address, metadataSubtree: "profile_image"});
    expect(oldImage).toBeDefined();

    const oldImageUrl = await client.userProfileClient.UserProfileImage();
    expect(oldImageUrl).toBeDefined();

    const image2 = BufferToArrayBuffer(fs.readFileSync("test/files/test-image2.png"));
    await client.userProfileClient.SetUserProfileImage({image: image2});

    const newImage = await client.userProfileClient.PublicUserMetadata({address: client.signer.address, metadataSubtree: "profile_image"});
    expect(newImage).toBeDefined();
    expect(newImage).not.toEqual(oldImage);

    const newImageUrl = await client.userProfileClient.UserProfileImage({address: client.signer.address});
    expect(newImageUrl).toBeDefined();
  });

  test("Links in User Profile Metadata", async () => {
    const libraryId = await client.CreateContentLibrary({name: "Test User Profile Links"});
    const {id, write_token} = await client.CreateContentObject({libraryId});
    await client.ReplaceMetadata({
      libraryId,
      objectId: id,
      writeToken: write_token,
      metadata: {
        public: {
          target: {
            meta: {
              data: "metadata"
            }
          }
        }
      }
    });

    await client.UploadFiles({
      libraryId,
      objectId: id,
      writeToken: write_token,
      fileInfo: [{
        path: "testDirectory/File 1",
        type: "file",
        mime_type: "text/plain",
        size: testFileSize,
        data: testFile
      }]
    });

    const { hash } = await client.FinalizeContentObject({
      libraryId,
      objectId: id,
      writeToken: write_token
    });

    const userProfile = await client.userProfileClient.UserWalletObjectInfo();

    const profileDraft = await client.EditContentObject({
      libraryId: userProfile.libraryId,
      objectId: userProfile.objectId
    });

    await client.CreateLinks({
      libraryId: userProfile.libraryId,
      objectId: userProfile.objectId,
      writeToken: profileDraft.write_token,
      links: [
        {
          target: "testDirectory/File 1",
          targetHash: hash,
          path: "links/fileLink",
          type: "file"
        },
        {
          target: "public/target/meta",
          targetHash: hash,
          path: "links/metadataLink",
          type: "metadata"
        },
      ]
    });

    await client.FinalizeContentObject({
      libraryId: userProfile.libraryId,
      objectId: userProfile.objectId,
      writeToken: profileDraft.write_token
    });

    const linkedMeta = await client.userProfileClient.UserMetadata({
      metadataSubtree: "links/metadataLink",
      resolveLinks: true
    });

    expect(linkedMeta).toBeDefined();
    expect(linkedMeta).toEqual({data: "metadata"});

    const walletObjectInfo = await client.userProfileClient.UserWalletObjectInfo();

    const linkedFile = await client.LinkData({
      libraryId: walletObjectInfo.libraryId,
      objectId: walletObjectInfo.objectId,
      linkPath: "links/fileLink",
      format: "arrayBuffer"
    });

    expect(linkedFile).toBeDefined();
    expect(new Uint8Array(linkedFile).toString()).toEqual(new Uint8Array(testFile).toString());
  });

  test("Access Level", async () => {
    const accessLevel = await client.userProfileClient.AccessLevel();
    expect(accessLevel).toBeDefined();
    expect(accessLevel.toLowerCase()).toEqual("prompt");

    await client.userProfileClient.SetAccessLevel({level: "public"});

    const newAccessLevel = await client.userProfileClient.AccessLevel();
    expect(newAccessLevel).toBeDefined();
    expect(newAccessLevel.toLowerCase()).toEqual("public");

    try {
      // Expect invalid access level to fail
      await client.userProfileClient.SetAccessLevel({level: "invalid"});
      expect(true).toBeFalsy();
    } catch(error) {
      expect(error).toEqual(new Error("Invalid access level: invalid"));
    }

    const unchangedAccessLevel = await client.userProfileClient.AccessLevel();
    expect(unchangedAccessLevel).toBeDefined();
    expect(unchangedAccessLevel.toLowerCase()).toEqual("public");
  });

  test.skip("Content Tagging", async () => {
    const testTags = [
      [
        { "score": 0.3, "tag": "cherry" },
        { "score": 0.8, "tag": "chocolate" },
        { "score": 0.6, "tag": "boat" }
      ],
      [
        { "score": 0.7, "tag": "cherry" },
        { "score": 0.5, "tag": "duck" },
        { "score": 0.6, "tag": "buoy" }
      ],
      [
        { "score": 0.5, "tag": "mayhem" },
        { "score": 0.8, "tag": "shark" },
        { "score": 0.9, "tag": "boat" }
      ]
    ];

    const recordTagsSpy = spyOn(client.userProfileClient, "RecordTags");

    const tagLibraryId = await tagClient.CreateContentLibrary({name: "Test Tagging"});
    // Create tagged objects with another user, then access them with this user
    client.ClearCache();

    for(let i = 0; i < testTags.length; i++) {
      const objectId = await CreateTaggedObject(tagLibraryId, testTags[i]);

      await client.ContentObjectMetadata({libraryId: tagLibraryId, objectId, noAuth: false});
    }

    // Tag recording is asynchronous - give the tag updates time to settle.
    await new Promise(resolve => setTimeout(resolve, 5000));

    expect(recordTagsSpy).toHaveBeenCalledTimes(testTags.length);

    const collectedTags = await client.userProfileClient.CollectedTags();

    expect(collectedTags).toBeDefined();
    expect(collectedTags).toEqual({
      boat: { aggregate: 1.5, occurrences: 2 },
      buoy: { aggregate: 0.6, occurrences: 1 },
      cherry: { aggregate: 1, occurrences: 2 },
      chocolate: { aggregate: 0.8, occurrences: 1 },
      duck: { aggregate: 0.5, occurrences: 1 },
      mayhem: { aggregate: 0.5, occurrences: 1 },
      shark: { aggregate: 0.8, occurrences: 1 }
    });
  });
});

if(!module.parent) { runTests(); }
module.exports = runTests;
