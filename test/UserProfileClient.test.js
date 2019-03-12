const fs = require("fs");
const OutputLogger = require("./utils/OutputLogger");
const {CreateClient, BufferToArrayBuffer} = require("./utils/Utils");

const UserProfileClient = require("../src/UserProfileClient");

let client, tagClient;
let tagLibraryId;

const CreateTaggedObject = async (tags) => {
  if(!tagLibraryId) {
    tagLibraryId = await tagClient.CreateContentLibrary({name: "Test Tagging"});
  }

  const createResponse = await tagClient.CreateContentObject({
    libraryId: tagLibraryId,
    options: { meta: { video_tags: [{ tags }] } }
  });
  await tagClient.FinalizeContentObject({libraryId: tagLibraryId, objectId: createResponse.id, writeToken: createResponse.write_token});

  return {
    libraryId: tagLibraryId,
    objectId: createResponse.id
  };
};

// Describe blocks and tests within them are run in order
describe("Test UserProfileClient", () => {
  beforeAll(async () => {
    jest.setTimeout(1000000);

    client = await CreateClient();
    tagClient = await CreateClient();

    client.userProfile = OutputLogger(UserProfileClient, client.userProfile);
  });

  test("Create User Profile", async () => {
    const image = BufferToArrayBuffer(fs.readFileSync("test/images/test-image1.png"));

    const publicMetadata = {
      meta: "data",
      nested: {
        meta: "data"
      }
    };

    const privateMetadata = {
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

    const accountLibraryId = await client.userProfile.CreateAccountLibrary({
      publicMetadata,
      privateMetadata,
      image
    });

    expect(accountLibraryId).toBeDefined();
    expect(accountLibraryId).toEqual(client.utils.AddressToLibraryId(client.signer.address));
  });

  test("Public Metadata", async () => {
    const publicMetadata = await client.userProfile.PublicUserMetadata({accountAddress: client.signer.address});
    expect(publicMetadata).toBeDefined();
    expect(publicMetadata.image).toBeDefined();
    expect(publicMetadata).toMatchObject({
      meta: "data",
      nested: {
        meta: "data"
      }
    });

    const subPublicMetadata = await client.userProfile.PublicUserMetadata({accountAddress: client.signer.address, metadataSubtree: "nested"});
    expect(subPublicMetadata).toBeDefined();
    expect(subPublicMetadata).toEqual({meta: "data"});
  });

  test("Private Metadata", async () => {
    const privateMetadata = await client.userProfile.PrivateUserMetadata({});
    expect(privateMetadata).toBeDefined();
    expect(privateMetadata.image).toBeDefined();
    expect(privateMetadata).toMatchObject({
      toMerge: {
        meta: "data"
      },
      toReplace: {
        meta: "data"
      },
      toDelete: {
        meta: "data"
      }
    });

    const subPrivateMetadata = await client.userProfile.PrivateUserMetadata({metadataSubtree: "toMerge"});
    expect(subPrivateMetadata).toBeDefined();
    expect(subPrivateMetadata).toEqual({meta: "data"});

    await client.userProfile.MergePrivateUserMetadata({metadataSubtree: "toMerge", metadata: {new: "metadata"}});
    await client.userProfile.ReplacePrivateUserMetadata({metadataSubtree: "toReplace", metadata: {new: "metadata"}});
    await client.userProfile.DeletePrivateUserMetadata({metadataSubtree: "toDelete"});

    const updatedMetadata = await client.userProfile.PrivateUserMetadata();
    expect(updatedMetadata).toBeDefined();
    expect(updatedMetadata).toMatchObject({
      toMerge: {
        meta: "data",
        new: "metadata"
      },
      toReplace: {
        new: "metadata"
      }
    });
    expect(updatedMetadata.toDelete).not.toBeDefined();
  });

  test("User Profile Image", async () => {
    const oldImageHash = await client.userProfile.PrivateUserMetadata({metadataSubtree: "image"});
    expect(oldImageHash).toBeDefined();

    const oldImageUrl = await client.userProfile.UserProfileImage({accountAddress: client.signer.address});
    expect(oldImageUrl).toBeDefined();

    const newImage = BufferToArrayBuffer(fs.readFileSync("test/images/test-image2.png"));
    await client.userProfile.SetUserProfileImage({image: newImage});

    const newImageHash = await client.userProfile.PrivateUserMetadata({metadataSubtree: "image"});
    expect(newImageHash).toBeDefined();
    expect(newImageHash).not.toEqual(oldImageHash);

    const newImageUrl = await client.userProfile.UserProfileImage({accountAddress: client.signer.address});
    expect(newImageUrl).toBeDefined();
  });

  test("Access Level", async () => {
    const accessLevel = await client.userProfile.AccessLevel();
    expect(accessLevel).toBeDefined();
    expect(accessLevel.toLowerCase()).toEqual("prompt");

    await client.userProfile.SetAccessLevel({level: "public"});

    const newAccessLevel = await client.userProfile.AccessLevel();
    expect(newAccessLevel).toBeDefined();
    expect(newAccessLevel.toLowerCase()).toEqual("public");

    await client.userProfile.SetAccessLevel({level: "invalid"});

    const unchangedAccessLevel = await client.userProfile.AccessLevel();
    expect(unchangedAccessLevel).toBeDefined();
    expect(unchangedAccessLevel.toLowerCase()).toEqual("public");
  });

  test("Content Tagging", async () => {
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
        { "score": 0.8, "tag": "person" },
        { "score": 0.9, "tag": "boat" }
      ],
    ];

    const recordTagsSpy = jest.spyOn(client.userProfile, "RecordTags");

    // Create tagged objects with another user, then access them with this user
    for(let i = 0; i < testTags.length; i++) {
      const {libraryId, objectId} = await CreateTaggedObject(testTags[i]);
      await client.ContentObjectMetadata({libraryId, objectId});
    }

    expect(recordTagsSpy).toHaveBeenCalledTimes(testTags.length);

    const collectedTags = await client.userProfile.CollectedTags();
    expect(collectedTags).toBeDefined();
    expect(collectedTags).toEqual({
      boat: { aggregate: 1.5, occurrences: 2 },
      buoy: { aggregate: 0.6, occurrences: 1 },
      cherry: { aggregate: 1, occurrences: 2 },
      chocolate: { aggregate: 0.8, occurrences: 1 },
      duck: { aggregate: 0.5, occurrences: 1 },
      mayhem: { aggregate: 0.5, occurrences: 1 },
      person: { aggregate: 0.8, occurrences: 1 }
    });

    await client.DeleteContentLibrary({libraryId: tagLibraryId});
  });

  test("Delete User Profile", async () => {
    await client.userProfile.DeleteAccountLibrary();

    const libraryExists = await client.userProfile.__IsLibraryCreated({accountAddress: client.signer.address});
    expect(libraryExists).not.toBeTruthy();
  });
});
