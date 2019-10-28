const crypto = require("crypto");
const ClientConfiguration = require("../TestConfiguration");
const fs = require("fs");
const Path = require("path");

Object.defineProperty(global.self, "crypto", {
  value: {
    getRandomValues: arr => crypto.randomBytes(arr.length),
  },
});

const UrlJoin = require("url-join");
const URI = require("urijs");
const BaseLibraryContract = require("../src/contracts/BaseLibrary");
const BaseContentContract = require("../src/contracts/BaseContent");
const CustomContract = require("../src/contracts/SampleContentLicensing");

const {ElvClient} = require("../src/ElvClient");

const OutputLogger = require("./utils/OutputLogger");
const {
  RandomBytes,
  RandomString,
  CreateClient,
  ReturnBalance
} = require("./utils/Utils");

const testFileSize = 100000;

let client, accessClient;
let libraryId, objectId, versionHash, typeId, typeName, typeHash, accessGroupAddress;
let mediaLibraryId, masterHash, mezzanineId;

let testFile1, testFile2, testFile3, testHash;
let fileInfo = [];
let partInfo = {};

// Describe blocks and  tests within them are run in order
describe("Test ElvClient", () => {
  beforeAll(async () => {
    jest.setTimeout(60000);

    client = OutputLogger(ElvClient, await CreateClient("ElvClient", "50"));
    accessClient = OutputLogger(ElvClient, await CreateClient("ElvClient Access"));

    testFile1 = RandomBytes(testFileSize);
    testFile2 = RandomBytes(testFileSize);
    testFile3 = RandomBytes(testFileSize);
    testHash = RandomString(10);
  });

  afterAll(async () => {
    await Promise.all([client, accessClient].map(async client => ReturnBalance(client)));
  });

  describe("Initialize From Configuration Url", () => {
    test("Initialization", async () => {
      const bootstrapClient = await ElvClient.FromConfigurationUrl({
        configUrl: ClientConfiguration["config-url"]
      });

      expect(bootstrapClient).toBeDefined();
      expect(bootstrapClient.fabricURIs).toBeDefined();
      expect(bootstrapClient.fabricURIs.length).toBeGreaterThan(0);
      expect(bootstrapClient.ethereumURIs).toBeDefined();
      expect(bootstrapClient.ethereumURIs.length).toBeGreaterThan(0);
      expect(bootstrapClient.ContentSpaceId()).toBeDefined();
    });

    test("Initialization with region", async () => {
      const bootstrapClient = await ElvClient.FromConfigurationUrl({
        configUrl: ClientConfiguration["config-url"],
        region: "eu-west"
      });

      expect(bootstrapClient).toBeDefined();
      expect(bootstrapClient.fabricURIs).toBeDefined();
      expect(bootstrapClient.fabricURIs.length).toBeGreaterThan(0);
      expect(bootstrapClient.ethereumURIs).toBeDefined();
      expect(bootstrapClient.ethereumURIs.length).toBeGreaterThan(0);

      const fabricURIs = bootstrapClient.fabricURIs;

      await bootstrapClient.UseRegion({region: "na-west-south"});

      expect(bootstrapClient.fabricURIs[0]).not.toEqual(fabricURIs[0]);

      await bootstrapClient.UseRegion({region: "eu-west"});

      expect(bootstrapClient.fabricURIs[0]).toEqual(fabricURIs[0]);
    });
  });

  describe("Access Groups", () => {
    test("Create Access Group", async () => {
      accessGroupAddress = await client.CreateAccessGroup({
        name: "Test Access Group",
        description: "Test Access Group Description",
        metadata: {
          group: "metadata"
        }
      });
      expect(accessGroupAddress).toBeDefined();
    });

    test("Get Access Group Owner", async () => {
      const accessGroupOwner = await client.AccessGroupOwner({contractAddress: accessGroupAddress});
      expect(accessGroupOwner).toBeDefined();
      expect(client.utils.FormatAddress(accessGroupOwner)).toEqual(client.utils.FormatAddress(client.signer.address));
    });

    test("Access Group Members", async () => {
      // Ensure user wallets are created
      await client.userProfileClient.WalletAddress();
      await accessClient.userProfileClient.WalletAddress();

      const clientAddress = client.utils.FormatAddress(client.signer.address);
      const accessAddress = client.utils.FormatAddress(accessClient.signer.address);

      await client.AddAccessGroupMember({
        contractAddress: accessGroupAddress,
        memberAddress: clientAddress
      });

      await client.AddAccessGroupMember({
        contractAddress: accessGroupAddress,
        memberAddress: accessAddress
      });

      const members = await client.AccessGroupMembers({
        contractAddress: accessGroupAddress
      });

      expect(members.length).toEqual(2);
      expect(members.includes(clientAddress)).toBeTruthy();
      expect(members.includes(accessAddress)).toBeTruthy();

      await client.AddAccessGroupManager({
        contractAddress: accessGroupAddress,
        memberAddress: clientAddress.replace("0x", "")
      });

      await client.AddAccessGroupManager({
        contractAddress: accessGroupAddress,
        memberAddress: accessAddress
      });

      const managers = await client.AccessGroupManagers({
        contractAddress: accessGroupAddress
      });

      expect(managers.length).toEqual(2);
      expect(managers.includes(clientAddress)).toBeTruthy();
      expect(managers.includes(accessAddress)).toBeTruthy();

      await client.RemoveAccessGroupMember({
        contractAddress: accessGroupAddress,
        memberAddress: clientAddress
      });

      await client.RemoveAccessGroupManager({
        contractAddress: accessGroupAddress,
        memberAddress: clientAddress
      });

      const newMembers = await client.AccessGroupMembers({
        contractAddress: accessGroupAddress
      });

      expect(newMembers.length).toEqual(1);
      expect(newMembers.includes(clientAddress)).toBeFalsy();
      expect(newMembers.includes(accessAddress)).toBeTruthy();


      const newManagers = await client.AccessGroupManagers({
        contractAddress: accessGroupAddress
      });

      expect(newManagers.length).toEqual(1);
      expect(newManagers.includes(clientAddress)).toBeFalsy();
      expect(newManagers.includes(accessAddress)).toBeTruthy();
    });

    test("Retrieve Access Group Metadata", async () => {
      const groupMetadata = await client.ContentObjectMetadata({
        libraryId: client.contentSpaceLibraryId,
        objectId: client.utils.AddressToObjectId(accessGroupAddress)
      });

      expect(groupMetadata.group).toEqual("metadata");
      expect(groupMetadata.public).toEqual({
        name: "Test Access Group",
        description: "Test Access Group Description"
      });
    });
  });

  describe("Content Types", () => {
    test("Create Content Type", async () => {
      // Ensure unique name for later lookup
      typeName = "Test Content Type " + testHash;

      typeId = await client.CreateContentType({name: typeName});
    });

    test("List Content Types", async () => {
      const types = await client.ContentTypes();

      expect(types).toBeDefined();
      expect(Object.values(types).find(type => type.id === typeId)).toBeDefined();
    });

    test("Get Content Type", async () => {
      const typeById = await client.ContentType({typeId});
      expect(typeById).toBeDefined();
      expect(typeById.id).toEqual(typeId);

      typeHash = typeById.hash;

      const typeByName = await client.ContentType({name: typeName});
      expect(typeByName).toBeDefined();
      expect(typeByName.id).toEqual(typeId);

      const typeByHash = await client.ContentType({versionHash: typeHash});
      expect(typeByHash).toBeDefined();
      expect(typeByHash.id).toEqual(typeId);

      const invalidType = await client.ContentType({name: "Invalid Type Name"});
      expect(invalidType).not.toBeDefined();
    });

    test("Get Content Type Owner", async () => {
      const owner = await client.ContentTypeOwner({name: typeName});

      expect(owner).toBeDefined();
      expect(client.utils.FormatAddress(owner)).toEqual(client.utils.FormatAddress(client.signer.address));
    });
  });

  describe("Content Libraries", () => {
    test("Create Content Library", async () => {
      libraryId = await client.CreateContentLibrary({
        name: "Test Library " + testHash,
        description: "Test Library Description",
        //image,
        metadata: {
          private: {
            meta: "data"
          }
        }
      });

      const libraryObjectId = client.utils.AddressToObjectId(client.utils.HashToAddress(libraryId));
      const privateMetadata = await client.ContentObjectMetadata({
        libraryId,
        objectId: libraryObjectId,
        metadataSubtree: "private"
      });

      expect(privateMetadata).toEqual({meta: "data"});
    });

    test("List Content Libraries", async () => {
      const libraries = await client.ContentLibraries();

      expect(libraries).toBeDefined();
      expect(libraries).toContain(libraryId);
    });

    test("Get Content Library", async () => {
      const library = await client.ContentLibrary({libraryId});

      expect(library).toBeDefined();
      expect(library).toMatchObject({
        id: libraryId
      });
    });

    test("Get Content Library Owner", async () => {
      const owner = await client.ContentLibraryOwner({libraryId});
      expect(owner).toBeDefined();
      expect(client.utils.FormatAddress(owner)).toEqual(client.utils.FormatAddress(client.signer.address));
    });

    test("Content Library Types", async () => {
      let libraryTypes = await client.LibraryContentTypes({libraryId});
      expect(libraryTypes).toEqual({});

      // Add/remove type by name
      await client.AddLibraryContentType({libraryId, typeName});

      libraryTypes = await client.LibraryContentTypes({libraryId});
      expect(libraryTypes[typeId]).toBeDefined();

      await client.RemoveLibraryContentType({libraryId, typeName});

      libraryTypes = await client.LibraryContentTypes({libraryId});
      expect(libraryTypes).toEqual({});

      // Add/remove type by type ID
      await client.AddLibraryContentType({libraryId, typeId});

      libraryTypes = await client.LibraryContentTypes({libraryId});
      expect(libraryTypes[typeId]).toBeDefined();

      await client.RemoveLibraryContentType({libraryId, typeId});

      libraryTypes = await client.LibraryContentTypes({libraryId});
      expect(libraryTypes).toEqual({});
    });

    test("Test Content Library Group Permissions", async () => {
      await client.AddContentLibraryGroup({
        libraryId,
        groupAddress: accessGroupAddress,
        permission: "contributor"
      });

      await client.AddContentLibraryGroup({
        libraryId,
        groupAddress: accessGroupAddress,
        permission: "reviewer"
      });

      const permissions = await client.ContentLibraryGroupPermissions({libraryId});
      expect(permissions[accessGroupAddress]).toBeDefined();
      expect(permissions[accessGroupAddress]).toEqual(["contributor", "reviewer"]);

      // Maintain accessor permissions so accessClient has access to library
      await client.AddContentLibraryGroup({
        libraryId,
        groupAddress: accessGroupAddress,
        permission: "accessor"
      });

      await client.RemoveContentLibraryGroup({
        libraryId,
        groupAddress: accessGroupAddress,
        permission: "reviewer"
      });

      const newPermissions = await client.ContentLibraryGroupPermissions({libraryId});
      expect(newPermissions[accessGroupAddress]).toBeDefined();
      expect(newPermissions[accessGroupAddress]).toEqual(["accessor", "contributor"]);
    });

    test("Set Library Image", async () => {
      const buffer = fs.readFileSync(Path.resolve(__dirname, "files", "test-image1.png"));
      const image = client.utils.BufferToArrayBuffer(buffer);

      await client.SetContentLibraryImage({libraryId, image});

      const libraryMetadata = await client.ContentObjectMetadata({
        libraryId,
        objectId: libraryId.replace("ilib", "iq__")
      });

      expect(libraryMetadata.image).toBeDefined();
      expect(libraryMetadata.public.image).toBeDefined();
    });
  });

  describe("Content Objects", () => {
    test("Create Content Object", async () => {
      const testMetadata = {
        name: "Test Content Object",
        toMerge: {
          merge: "me"
        },
        toReplace: {
          replace: "me"
        },
        toDelete: {
          delete: "me"
        }
      };

      const createResponse = await client.CreateContentObject({
        libraryId,
        options: {
          type: typeName,
          meta: testMetadata,
          visibility: 100
        }
      });
      const writeToken = createResponse.write_token;

      expect(createResponse).toBeDefined();
      expect(createResponse.type).toEqual(typeHash);

      objectId = createResponse.id;

      const finalizeResponse = await client.FinalizeContentObject({libraryId, objectId, writeToken});

      await expect(finalizeResponse).toBeDefined();

      const metadata = await client.ContentObjectMetadata({libraryId, objectId});
      expect(metadata).toEqual(testMetadata);

      versionHash = finalizeResponse.hash;
    });

    test("Content Object Metadata", async () => {
      const metadata = await client.ContentObjectMetadata({libraryId, objectId});
      expect(metadata).toEqual({
        name: "Test Content Object",
        toMerge: {
          merge: "me"
        },
        toReplace: {
          replace: "me"
        },
        toDelete: {
          delete: "me"
        }
      });

      const subMetadata = await client.ContentObjectMetadata({libraryId, objectId, metadataSubtree: "toMerge"});
      expect(subMetadata).toEqual({
        merge: "me"
      });

      // Missing subtree should not throw
      const invalidMetadata = await client.ContentObjectMetadata({libraryId, objectId, metadataSubtree: "bad"});
      expect(invalidMetadata).not.toBeDefined();
    });

    test("Edit content object", async () => {
      const editResponse = await client.EditContentObject({libraryId, objectId});
      const writeToken = editResponse.write_token;

      expect(editResponse).toBeDefined();

      await client.MergeMetadata({
        libraryId,
        objectId,
        writeToken,
        metadataSubtree: "toMerge",
        metadata: {
          new: "metadata"
        }
      });

      await client.ReplaceMetadata({
        libraryId,
        objectId,
        writeToken,
        metadataSubtree: "toReplace",
        metadata: {
          new: "metadata"
        }
      });

      await client.DeleteMetadata({libraryId, objectId, writeToken, metadataSubtree: "toDelete"});

      const finalizeResponse = await client.FinalizeContentObject({libraryId, objectId, writeToken});

      expect(finalizeResponse).toBeDefined();

      const metadata = await client.ContentObjectMetadata({libraryId, objectId});
      expect(metadata).toEqual({
        name: "Test Content Object",
        toMerge: {
          new: "metadata",
          merge: "me"
        },
        toReplace: {
          new: "metadata"
        }
      });

      versionHash = finalizeResponse.hash;
    });

    test("List Content Objects", async () => {
      const testLibraryId = await client.CreateContentLibrary({name: "Test Object Filtering"});

      let objectNames = [];
      // Create a bunch of objects
      await Promise.all(
        Array(10).fill().map(async (_, i) => {
          const name = `Test Object ${10 - i}`;
          objectNames.push(name);
          const createResponse = await client.CreateContentObject({
            libraryId: testLibraryId,
            options: {
              meta: {
                name,
                otherKey: i
              }
            }
          });

          await client.FinalizeContentObject({
            libraryId: testLibraryId,
            objectId: createResponse.id,
            writeToken: createResponse.write_token
          });
        })
      );

      objectNames = objectNames.sort();

      /* No filters */
      const unfiltered = await client.ContentObjects({libraryId: testLibraryId});

      expect(unfiltered).toBeDefined();
      expect(unfiltered.contents).toBeDefined();
      expect(unfiltered.contents.length).toEqual(10);
      expect(unfiltered.paging).toBeDefined();

      unfiltered.contents.forEach(object => {
        expect(object.versions[0].meta.name).toBeDefined();
        expect(object.versions[0].meta.otherKey).toBeDefined();
      });

      /* Sorting */
      const sorted = await client.ContentObjects({
        libraryId: testLibraryId,
        filterOptions: { sort: "name" }
      });

      const sortedNames = sorted.contents.map(object => object.versions[0].meta.name);

      expect(sortedNames).toEqual(objectNames);

      const descSorted = await client.ContentObjects({
        libraryId: testLibraryId,
        filterOptions: { sort: "name", sortDesc: true }
      });

      const descSortedNames = descSorted.contents.map(object => object.versions[0].meta.name);

      const descObjectNames = [...objectNames].reverse();
      expect(descSortedNames).toEqual(descObjectNames);

      /* Filtering */
      const filtered = await client.ContentObjects({
        libraryId: testLibraryId,
        filterOptions: {
          sort: ["name"],
          filter: [
            {key: "name", type: "gte", filter: objectNames[3]},
            {key: "name", type: "lte", filter: objectNames[7]}
          ]
        }
      });

      expect(filtered.contents.length).toEqual(5);
      const filteredNames = filtered.contents.map(object => object.versions[0].meta.name);
      expect(filteredNames).toEqual(objectNames.slice(3, 8));

      /* Selecting metadata fields */
      const selected = await client.ContentObjects({
        libraryId: testLibraryId,
        filterOptions: {
          sort: "name",
          select: ["name"]
        }
      });

      selected.contents.forEach(object => {
        expect(object.versions[0].meta.name).toBeDefined();
        expect(object.versions[0].meta.otherKey).not.toBeDefined();
      });
    });

    test("Get Content Object", async () => {
      const object = await client.ContentObject({libraryId, objectId});

      expect(object).toBeDefined();
      expect(object.id).toEqual(objectId);
      expect(object.hash).toEqual(versionHash);
      expect(object.type).toEqual(typeHash);

      const versions = await client.ContentObjectVersions({libraryId, objectId});
      expect(versions).toBeDefined();
    });

    test("Get Content Object By Version Hash", async () => {
      const object = await client.ContentObject({versionHash});

      expect(object).toBeDefined();
      expect(object.id).toEqual(objectId);
      expect(object.hash).toEqual(versionHash);
      expect(object.type).toEqual(typeHash);
    });

    test("Get Content Object Owner", async () => {
      const owner = await client.ContentObjectOwner({libraryId, objectId});

      expect(client.utils.FormatAddress(owner)).toEqual(client.utils.FormatAddress(client.signer.address));
    });

    test.skip("Copy Content Object", async () => {
      const objectCopy = await client.CopyContentObject({
        libraryId,
        originalVersionHash: versionHash,
        options: {
          type: "",
          meta: {
            copy: "metadata"
          }
        }
      });
      expect(objectCopy).toBeDefined();
      expect(objectCopy.id).not.toEqual(objectId);
      expect(objectCopy.type).toEqual("");

      await client.FinalizeContentObject({libraryId, objectId: objectCopy.id, writeToken: objectCopy.write_token});

      const originalMetadata = await client.ContentObjectMetadata({libraryId, objectId});
      const metadata = await client.ContentObjectMetadata({libraryId, objectId: objectCopy.id});

      expect(metadata).toEqual({
        ...originalMetadata,
        copy: "metadata"
      });
    });
  });

  describe("Parts", () => {
    test("Upload Whole Part", async () => {
      const writeToken = (await client.EditContentObject({libraryId, objectId})).write_token;

      const uploadResponse = await client.UploadPart({
        libraryId,
        objectId,
        writeToken,
        data: testFile1
      });

      expect(uploadResponse).toBeDefined();

      partInfo.whole = uploadResponse.part.hash;

      await client.FinalizeContentObject({libraryId, objectId, writeToken});
    });

    test("Upload Whole Encrypted Part", async () => {
      const writeToken = (await client.EditContentObject({libraryId, objectId})).write_token;

      const uploadResponse = await client.UploadPart({
        libraryId,
        objectId,
        writeToken,
        data: testFile3,
        encryption: "cgck"
      });

      expect(uploadResponse).toBeDefined();

      partInfo.encrypted = uploadResponse.part.hash;

      await client.FinalizeContentObject({libraryId, objectId, writeToken});
    });

    test("Upload Part In Chunks", async () => {
      const writeToken = (await client.EditContentObject({libraryId, objectId})).write_token;

      const partWriteToken = await client.CreatePart({libraryId, objectId, writeToken});

      const chunks = 10;
      const chunkSize = testFileSize / chunks;
      for(let i = 0; i < chunks; i++) {
        const from = chunkSize * i;
        const to = Math.min(from + chunkSize, testFileSize);

        await client.UploadPartChunk({
          libraryId,
          objectId,
          writeToken,
          partWriteToken,
          chunk: testFile2.slice(from, to)
        });
      }

      let finalizeResponse = await client.FinalizePart({libraryId, objectId, writeToken, partWriteToken});
      expect(finalizeResponse).toBeDefined();
      expect(finalizeResponse.part).toBeDefined();
      expect(finalizeResponse.part.size).toEqual(testFileSize);

      partInfo.chunked = finalizeResponse.part.hash;

      await client.FinalizeContentObject({libraryId, objectId, writeToken});
    });

    test("Upload Encrypted Part In Chunks", async () => {
      const writeToken = (await client.EditContentObject({libraryId, objectId})).write_token;
      const encryption = "cgck";

      const partWriteToken = await client.CreatePart({libraryId, objectId, writeToken, encryption});

      const chunks = 10;
      const chunkSize = testFileSize / chunks;
      for(let i = 0; i < chunks; i++) {
        const from = chunkSize * i;
        const to = Math.min(from + chunkSize, testFileSize);

        await client.UploadPartChunk({
          libraryId,
          objectId,
          writeToken,
          partWriteToken,
          chunk: testFile3.slice(from, to),
          encryption
        });
      }

      let finalizeResponse = await client.FinalizePart({libraryId, objectId, writeToken, partWriteToken, encryption});
      expect(finalizeResponse).toBeDefined();
      expect(finalizeResponse.part).toBeDefined();
      expect(finalizeResponse.part.size).toBeGreaterThan(testFileSize);

      partInfo.encryptedChunked = finalizeResponse.part.hash;

      await client.FinalizeContentObject({libraryId, objectId, writeToken});
    });


    test("Download Whole Part", async () => {
      let wholePart = await client.DownloadPart({libraryId, objectId, partHash: partInfo.whole, format: "arrayBuffer"});
      wholePart = new Uint8Array(wholePart);

      expect(wholePart.byteLength).toEqual(testFileSize);
      expect(wholePart.toString()).toEqual(new Uint8Array(testFile1).toString());
      expect(new Uint8Array(wholePart).toString()).not.toEqual(new Uint8Array(testFile2).toString());
    });

    test("Download Whole Encrypted Part", async () => {
      let wholePart = await client.DownloadPart({libraryId, objectId, partHash: partInfo.encrypted, format: "arrayBuffer"});
      wholePart = new Uint8Array(wholePart);

      expect(wholePart.byteLength).toEqual(testFileSize);
      expect(wholePart.toString()).toEqual(new Uint8Array(testFile3).toString());
      expect(new Uint8Array(wholePart).toString()).not.toEqual(new Uint8Array(testFile2).toString());
    });

    test("Download Part In Chunks", async () => {
      let partChunks = [];
      const mockCallback = jest.fn();
      const callback = ({chunk}) => {
        partChunks.push(Buffer.from(chunk));
        mockCallback();
      };

      await client.DownloadPart({
        libraryId,
        objectId,
        partHash: partInfo.chunked,
        chunked: true,
        chunkSize: testFileSize / 10,
        callback
      });

      expect(mockCallback).toHaveBeenCalledTimes(10);

      const chunkedPart = Buffer.concat(partChunks);
      expect(new Uint8Array(chunkedPart).toString()).toEqual(new Uint8Array(testFile2).toString());
    });

    test("Download Encrypted Part In Chunks", async () => {
      let partChunks = [];
      const mockCallback = jest.fn();
      const callback = ({chunk}) => {
        partChunks.push(Buffer.from(chunk));
        mockCallback();
      };

      await client.DownloadPart({
        libraryId,
        objectId,
        partHash: partInfo.encryptedChunked,
        chunked: true,
        chunkSize: testFileSize / 10,
        callback
      });

      expect(mockCallback).toHaveBeenCalledTimes(10);

      const chunkedPart = Buffer.concat(partChunks);
      expect(new Uint8Array(chunkedPart).toString()).toEqual(new Uint8Array(testFile3).toString());
    });

    test("Download Part With Proxy Re-encryption", async () => {
      const encryptedPart = await accessClient.DownloadPart({libraryId, objectId, partHash: partInfo.encrypted, format: "arrayBuffer"});
      expect(new Uint8Array(encryptedPart).toString()).toEqual(new Uint8Array(encryptedPart).toString());
    });

    test("List Parts", async () => {
      const parts = await client.ContentParts({libraryId, objectId});

      expect(parts.find(part => part.hash === partInfo.whole)).toBeDefined();
      expect(parts.find(part => part.hash === partInfo.chunked)).toBeDefined();
      expect(parts.find(part => part.hash === partInfo.encrypted)).toBeDefined();
    });

    test("Proofs", async () => {
      const proofs = await client.Proofs({libraryId, objectId, partHash: partInfo.whole});
      expect(proofs).toBeDefined();
    });
  });

  describe("Files", () => {
    test("Upload Files", async () => {
      fileInfo = [
        {
          path: "testDirectory/File 1",
          type: "file",
          mime_type: "text/plain",
          size: testFileSize,
          data: testFile1
        },
        {
          path: "testDirectory/File 2",
          type: "file",
          mime_type: "text/plain",
          size: testFileSize,
          data: testFile2
        }
      ];

      const writeToken = (await client.EditContentObject({libraryId, objectId})).write_token;

      await client.UploadFiles({
        libraryId,
        objectId,
        writeToken,
        fileInfo
      });

      await client.FinalizeContentObject({libraryId, objectId, writeToken});
    });

    test("Download Files", async () => {
      const fileData1 = await client.DownloadFile({libraryId, objectId, filePath: "testDirectory/File 1", format: "arrayBuffer"});
      expect(new Uint8Array(fileData1).toString()).toEqual(new Uint8Array(testFile1).toString());
      expect(new Uint8Array(fileData1).toString()).not.toEqual(new Uint8Array(testFile2).toString());

      const fileData2 = await client.DownloadFile({libraryId, objectId, filePath: "testDirectory/File 2", format: "arrayBuffer"});
      expect(new Uint8Array(fileData2).toString()).toEqual(new Uint8Array(testFile2).toString());
    });

    test("List Files", async () => {
      const files = await client.ListFiles({libraryId, objectId});
      expect(files.testDirectory).toBeDefined();
      expect(files.testDirectory["File 1"]).toBeDefined();
      expect(files.testDirectory["File 2"]).toBeDefined();
    });
  });

  describe("Media", () => {
    test("Create Production Master", async () => {
      jest.setTimeout(600000);

      mediaLibraryId = await client.CreateContentLibrary({
        name: "Test Media Library",
        metadata: {
          "abr_profile": {
            "ladder_specs": {
              "{\"media_type\":\"audio\",\"channels\":2}": {
                "rung_specs": [
                  {
                    "media_type": "audio",
                    "bit_rate": 128000,
                    "pregenerate": true
                  }
                ]
              },
              "{\"media_type\":\"video\",\"aspect_ratio_height\":3,\"aspect_ratio_width\":4}": {
                "rung_specs": [
                  {
                    "media_type": "video",
                    "bit_rate": 4900000,
                    "pregenerate": true,
                    "height": 1080,
                    "width": 1452
                  },
                  {
                    "media_type": "video",
                    "bit_rate": 3375000,
                    "pregenerate": false,
                    "height": 720,
                    "width": 968
                  },
                  {
                    "media_type": "video",
                    "bit_rate": 1500000,
                    "pregenerate": false,
                    "height": 540,
                    "width": 726
                  },
                  {
                    "media_type": "video",
                    "bit_rate": 825000,
                    "pregenerate": false,
                    "height": 432,
                    "width": 580
                  },
                  {
                    "media_type": "video",
                    "bit_rate": 300000,
                    "pregenerate": false,
                    "height": 360,
                    "width": 484
                  }
                ]
              },
              "{\"media_type\":\"video\",\"aspect_ratio_height\":9,\"aspect_ratio_width\":16}": {
                "rung_specs": [
                  {
                    "media_type": "video",
                    "bit_rate": 6500000,
                    "pregenerate": true,
                    "height": 1080,
                    "width": 1920
                  },
                  {
                    "media_type": "video",
                    "bit_rate": 4500000,
                    "pregenerate": false,
                    "height": 720,
                    "width": 1280
                  },
                  {
                    "media_type": "video",
                    "bit_rate": 2000000,
                    "pregenerate": false,
                    "height": 540,
                    "width": 960
                  },
                  {
                    "media_type": "video",
                    "bit_rate": 1100000,
                    "pregenerate": false,
                    "height": 432,
                    "width": 768
                  },
                  {
                    "media_type": "video",
                    "bit_rate": 400000,
                    "pregenerate": false,
                    "height": 360,
                    "width": 640
                  }
                ]
              }
            },
            "playout_formats": {
              "dash-clear": {
                "drm": null,
                "protocol": {
                  "min_buffer_length": 2,
                  "type": "ProtoDash"
                }
              },
              "dash-widevine": {
                "drm": {
                  "type": "DrmWidevine",
                  "license_servers": [],
                  "enc_scheme_name": "cenc",
                  "content_id": ""
                },
                "protocol": {
                  "type": "ProtoDash",
                  "min_buffer_length": 2
                }
              },
              "hls-aes128": {
                "drm": {
                  "type": "DrmAes128",
                  "enc_scheme_name": "aes-128"
                },
                "protocol": {
                  "type": "ProtoHls"
                }
              },
              "hls-clear": {
                "drm": null,
                "protocol": {
                  "type": "ProtoHls"
                }
              }
            },
            "segment_specs": {
              "audio": {
                "segs_per_chunk": 15,
                "target_dur": 2
              },
              "video": {
                "segs_per_chunk": 15,
                "target_dur": 2.03
              }
            }
          }
        }
      });

      const buffer = fs.readFileSync(Path.resolve(__dirname, "files", "Video.mp4"));
      const data = client.utils.BufferToArrayBuffer(buffer);
      const fileInfo = [{
        path: "Video.mp4",
        mime_type: "video/mp4",
        size: data.byteLength,
        data: data
      }];

      const {id, hash} = await client.CreateProductionMaster({
        libraryId: mediaLibraryId,
        name: "Production Master Test",
        description: "Production Master Test Description",
        metadata: {test: "master"},
        fileInfo
      });

      expect(id).toBeDefined();
      expect(hash).toBeDefined();

      const metadata = await client.ContentObjectMetadata({
        versionHash: hash
      });

      expect(metadata).toBeDefined();
      expect(metadata.test).toEqual("master");
      expect(metadata.public.name).toEqual("Production Master Test");
      expect(metadata.public.description).toEqual("Production Master Test Description");

      masterHash = hash;
    });

    test("Create Mezzanine", async () => {
      const {id, hash} = await client.CreateABRMezzanine({
        libraryId: mediaLibraryId,
        masterVersionHash: masterHash,
        name: "Mezzanine Test",
        description: "Mezzanine Test Description",
        metadata: {test: "mezzanine"}
      });

      expect(id).toBeDefined();
      expect(hash).toBeDefined();

      const metadata = await client.ContentObjectMetadata({
        versionHash: hash
      });

      expect(metadata).toBeDefined();
      expect(metadata.test).toEqual("mezzanine");
      expect(metadata.public.name).toEqual("Mezzanine Test");
      expect(metadata.public.description).toEqual("Mezzanine Test Description");

      mezzanineId = id;
    });

    test("Process Mezzanine", async () => {
      jest.setTimeout(600000);

      const startResponse = await client.StartABRMezzanineJobs({
        libraryId: mediaLibraryId,
        objectId: mezzanineId,
        offeringKey: "default",
      });

      const writeToken = startResponse.writeToken;

      // eslint-disable-next-line no-constant-condition
      while(true) {
        const status = await client.ContentObjectMetadata({
          libraryId: mediaLibraryId,
          objectId: mezzanineId,
          writeToken,
          metadataSubtree: "lro_status"
        });

        if(status.end) {
          console.log(status.run_state);
          break;
        }

        await new Promise(resolve => setTimeout(resolve, 10000));
      }

      await client.FinalizeABRMezzanine({
        libraryId: mediaLibraryId,
        objectId: mezzanineId,
        writeToken,
        offeringKey: "default"
      });

      await new Promise(resolve => setTimeout(resolve, 5000));
    });

    test("Playout Options", async () => {
      const playoutOptions = await accessClient.PlayoutOptions({
        objectId: mezzanineId,
        protocols: ["hls", "dash"],
        drms: ["widevine", "aes-128"]
      });

      expect(playoutOptions.dash).toBeDefined();
      expect(playoutOptions.dash.playoutUrl).toBeDefined();

      expect(playoutOptions.hls).toBeDefined();
      expect(playoutOptions.hls.playoutUrl).toBeDefined();

      const bitmovinPlayoutOptions = await accessClient.BitmovinPlayoutOptions({
        objectId: mezzanineId,
        protocols: ["hls", "dash"],
        drms: ["widevine", "aes-128"]
      });

      expect(bitmovinPlayoutOptions).toBeDefined();
    });
  });

  describe("Access Requests", () => {
    test("Cached Access Transactions", async () => {
      const transactionHash = await client.CachedAccessTransaction({versionHash});
      expect(transactionHash).toBeDefined();

      client.ClearCache();
      const noTransaction = await client.CachedAccessTransaction({versionHash});
      expect(noTransaction).not.toBeDefined();
    });

    test("Access Charge and Info", async () => {
      await client.CallContractMethod({
        abi: BaseContentContract.abi,
        contractAddress: client.utils.HashToAddress(objectId),
        methodName: "setVisibility",
        methodArgs: [10]
      });

      await client.SetAccessCharge({objectId, accessCharge: "0.5"});

      const {accessible, accessCode, accessCharge} = await accessClient.AccessInfo({
        objectId,
      });

      expect(accessible).toBeTruthy();
      expect(accessCode).toEqual(10);
      expect(accessCharge).toEqual("0.5");

      const initialBalance = parseFloat(await accessClient.GetBalance({address: accessClient.signer.address}));
      await accessClient.ContentObjectMetadata({libraryId, objectId});
      const finalBalance = parseFloat(await accessClient.GetBalance({address: accessClient.signer.address}));

      expect(finalBalance < (initialBalance - 0.5));
    });

    test("Make Manual Access Request", async () => {
      const accessRequest = await client.AccessRequest({
        versionHash,
        args: [
          0, // Access level
          undefined, // Public key - will be injected automatically
          "", // AFGH string
          [], // Custom values
          [] // Stakeholders
        ]
      });
      expect(accessRequest).toBeDefined();
      expect(accessRequest.transactionHash).toBeDefined();
    });

    test("Access Complete", async () => {
      const accessComplete = await client.ContentObjectAccessComplete({objectId, score: 90});
      expect(accessComplete).toBeDefined();
      expect(accessComplete.transactionHash).toBeDefined();
    });
  });

  describe("Contracts", () => {
    test("Contract Events", async () => {
      const events = await client.ContractEvents({
        contractAddress: client.utils.HashToAddress(libraryId),
        abi: BaseLibraryContract.abi
      });

      expect(events).toBeDefined();
      expect(events[0]).toBeDefined();
    });

    test("Custom Content Object Contract", async () => {
      const {contractAddress} = await client.DeployContract({
        abi: CustomContract.abi,
        bytecode: CustomContract.bytecode,
        constructorArgs: []
      });

      expect(contractAddress).toBeDefined();

      const event = await client.SetCustomContentContract({
        libraryId,
        objectId,
        name: "Custom Contract",
        description: "Custom Contract Description",
        customContractAddress: contractAddress,
        abi: CustomContract.abi,
        factoryAbi: CustomContract.abi
      });

      expect(event).toBeDefined();

      const eventLog = client.ExtractEventFromLogs({
        abi: BaseContentContract.abi,
        event,
        eventName: "SetContentContract"
      });

      expect(eventLog).toBeDefined();
      expect(client.utils.FormatAddress(eventLog.values.contentContractAddress))
        .toEqual(client.utils.FormatAddress(contractAddress));

      const customContractAddress = await client.CustomContractAddress({
        libraryId,
        objectId
      });

      expect(client.utils.FormatAddress(customContractAddress))
        .toEqual(client.utils.FormatAddress(contractAddress));

      const customContractMetadata = await client.ContentObjectMetadata({libraryId, objectId, metadataSubtree: "custom_contract"});

      expect(customContractMetadata).toBeDefined();
      expect(customContractMetadata).toMatchObject({
        address: contractAddress,
        name: "Custom Contract",
        description: "Custom Contract Description",
        abi: CustomContract.abi,
        factoryAbi: CustomContract.abi
      });
    });

    test("Send Funds To Contract", async () => {
      const contractAddress = client.utils.HashToAddress(objectId);

      const transacton = await client.SendFunds({recipient: contractAddress, ether: 0.01});
      expect(transacton).toBeDefined();

      const balance = await client.GetBalance({address: contractAddress});
      expect(balance).toBeDefined();
      expect(parseFloat(balance)).toBeGreaterThan(0);
    });
  });

  describe("Blockchain Events", () => {
    test("Count", async () => {
      const fiveEvents = await client.Events({count: 5});
      expect(fiveEvents).toBeDefined();
      expect(fiveEvents.length).toEqual(5);

      const twentyEvents = await client.Events({count: 20});
      expect(twentyEvents).toBeDefined();
      expect(twentyEvents.length).toEqual(20);

      const zeroEvents = await client.Events({count: 0});
      expect(zeroEvents).toBeDefined();
      expect(zeroEvents.length).toEqual(0);
    });

    test("To/From", async () => {
      const latestBlock = await client.signer.provider.getBlockNumber();

      const fromLatest = await client.Events({fromBlock: latestBlock - 5});
      expect(fromLatest).toBeDefined();
      expect(fromLatest.length).toEqual(6);

      const toBlock = await client.Events({toBlock: latestBlock - 10, fromBlock: latestBlock - 20});
      expect(toBlock).toBeDefined();
      expect(toBlock.length).toEqual(11);
    });

    test("With Transactions", async () => {
      const events = await client.Events({count: 100, includeTransaction: false});
      expect(events).toBeDefined();
      expect(events.length).toEqual(100);
      expect(events.every(event => event)).toBeTruthy();

      const eventsWithTransaction = await client.Events({count: 100, includeTransaction: true});
      expect(eventsWithTransaction).toBeDefined();
      expect(eventsWithTransaction.length).toEqual(100);
      expect(eventsWithTransaction.every(event => event[0].from)).toBeTruthy();
    });
  });

  describe("Verification", () => {
    test.skip("Verify Content Version", async () => {
      const verification = await client.VerifyContentObject({libraryId, objectId, versionHash});

      expect(verification).toBeDefined();
      expect(verification.hash).toEqual(versionHash);
      expect(verification.valid).toBeTruthy();
      expect(verification.qref.valid).toBeTruthy();
      expect(verification.qmd.valid).toBeTruthy();
      expect(verification.qstruct.valid).toBeTruthy();
    });
  });

  describe("URL generation", () => {
    const validateUrl = (url, expectedPath, expectedQueryParams, authorization=true) => {
      expect(url).toBeDefined();
      url = URI(url);

      expect(url.path()).toEqual(expectedPath);

      const authToken = url.query(true).authorization;
      expect(authToken).toBeDefined();

      const token = client.utils.DecodeAuthorizationToken(authToken);

      if(authorization) {
        expect(token.tx_id).toBeDefined();
      } else {
        expect(token.tx_id).not.toBeDefined();
      }

      if(expectedQueryParams) {
        let queryParams = url.query(true);

        delete queryParams["authorization"];

        expect(queryParams).toEqual(expectedQueryParams);
      }
    };

    test("FabricURL", async () => {
      const libraryUrl = await client.FabricUrl({libraryId});
      validateUrl(libraryUrl, UrlJoin("/qlibs", libraryId));

      const objectUrl = await client.FabricUrl({libraryId, objectId});
      validateUrl(objectUrl, UrlJoin("/qlibs", libraryId, "q", objectId));

      const versionUrl = await client.FabricUrl({libraryId, objectId, versionHash});
      validateUrl(versionUrl, UrlJoin("/qlibs", libraryId, "q", versionHash));

      const partUrl = await client.FabricUrl({libraryId, objectId, partHash: partInfo.whole});
      validateUrl(partUrl, UrlJoin("/qlibs", libraryId, "q", objectId, "data", partInfo.whole));

      const versionOnlyPartUrl = await client.FabricUrl({versionHash, partHash: partInfo.whole});
      validateUrl(versionOnlyPartUrl, UrlJoin("/q", versionHash, "data", partInfo.whole), {});

      const versionOnlyCallUrl = await client.FabricUrl({versionHash, call: "method"});
      validateUrl(versionOnlyCallUrl, UrlJoin("/q", versionHash, "call", "method"), {});

      const versionOnlyRepUrl = await client.FabricUrl({versionHash, rep: "image"});
      validateUrl(versionOnlyRepUrl, UrlJoin("/q", versionHash, "rep", "image"), {});

      const versionOnlyAuthUrl = await client.FabricUrl({versionHash, objectId, partHash: partInfo.whole});
      validateUrl(versionOnlyAuthUrl, UrlJoin("/q", versionHash, "data", partInfo.whole));

      const testQuery = {
        param1: "value1",
        param2: "value2",
        param3: "value3"
      };

      const paramUrl = await client.FabricUrl({libraryId, objectId, queryParams: testQuery});
      validateUrl(paramUrl, UrlJoin("/qlibs", libraryId, "q", objectId), testQuery);

      const noAuthUrl = await client.FabricUrl({libraryId, objectId, noAuth: true});
      validateUrl(noAuthUrl, UrlJoin("/qlibs", libraryId, "q", objectId), {}, false);
    });

    test("Rep URL", async () => {
      const repUrl = await client.Rep({libraryId, objectId, rep: "image"});
      validateUrl(repUrl, UrlJoin("/qlibs", libraryId, "q", objectId, "rep", "image"));

      const noAuthUrl = await client.Rep({libraryId, objectId, rep: "image", noAuth: true});
      validateUrl(noAuthUrl, UrlJoin("/qlibs", libraryId, "q", objectId, "rep", "image"), {}, false);
    });

    test("File URL", async () => {
      const topLevelFile = await client.FileUrl({libraryId, objectId, filePath: "file"});
      validateUrl(topLevelFile, UrlJoin("/qlibs", libraryId, "q", objectId, "files", "file"));

      const nestedFile = await client.FileUrl({libraryId, objectId, filePath: UrlJoin("dir", "file")});
      validateUrl(nestedFile, UrlJoin("/qlibs", libraryId, "q", objectId, "files", "dir", "file"));

      const testQuery = {
        param1: "value1",
        param2: "value2",
        param3: "value3"
      };

      const withQueryParams = await client.FileUrl({libraryId, objectId, filePath: "file", queryParams: testQuery});
      validateUrl(withQueryParams, UrlJoin("/qlibs", libraryId, "q", objectId, "files", "file"), testQuery);

      const withVersionOnly = await client.FileUrl({objectId, versionHash, filePath: "file"});
      validateUrl(withVersionOnly, UrlJoin("/q", versionHash, "files", "file"));
    });
  });

  describe("Deletes", () => {
    test("Delete Part", async () => {
      const writeToken = (await client.EditContentObject({libraryId, objectId})).write_token;

      await client.DeletePart({libraryId, objectId, writeToken, partHash: partInfo.chunked});
      await client.DeletePart({libraryId, objectId, writeToken, partHash: partInfo.whole});

      await client.FinalizeContentObject({libraryId, objectId, writeToken});

      const parts = await client.ContentParts({libraryId, objectId});
      expect(parts.find(part => part.hash === partInfo.chunked)).not.toBeDefined();
      expect(parts.find(part => part.hash === partInfo.whole)).not.toBeDefined();
    });

    test("Delete Content Version", async () => {
      await client.DeleteContentVersion({libraryId, objectId, versionHash});

      try {
        await client.ContentObject({libraryId, objectId, versionHash});
        expect(undefined).toBeDefined();
      // eslint-disable-next-line no-empty
      } catch(error) {}
    });

    test("Delete Content Object", async () => {
      await client.DeleteContentObject({libraryId, objectId});

      try {
        await client.ContentObject({libraryId, objectId});
        expect(undefined).toBeDefined();
      // eslint-disable-next-line no-empty
      } catch(error) {}
    });

    /*

    test("Delete Content Type", async () => {
      await client.DeleteContentObject({libraryId: contentSpaceLibraryId, objectId: typeId});

      try {
        await client.ContentObject({libraryId: contentSpaceLibraryId, objectId: typeId});
        expect(undefined).toBeDefined();
      } catch(error) {
        expect(error.status).toEqual(404);
      }
    });

    test("Delete Content Library", async () => {
      await client.DeleteContentLibrary({libraryId});

      try {
        await client.ContentLibrary({libraryId});
        expect(undefined).toBeDefined();
      } catch(error) {
        expect(error.status).toEqual(404);
      }
    });
    */

    test("Delete Access Group", async () => {
      await client.DeleteAccessGroup({contractAddress: accessGroupAddress});
    });
  });
});



































