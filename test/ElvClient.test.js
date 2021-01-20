const {Initialize} = require("./utils/Utils");
const {
  afterAll,
  beforeAll,
  describe,
  expect,
  mockCallback,
  runTests,
  test
} = Initialize();

const ClientConfiguration = require("../TestConfiguration");
const fs = require("fs");
const Path = require("path");

const Fetch = (input, init={}) => {
  if(typeof fetch === "undefined") {
    return (require("node-fetch")(input, init));
  } else {
    return fetch(input, init);
  }
};

const UrlJoin = require("url-join");
const URI = require("urijs");

//const CustomContract = require("../src/contracts/SampleContentLicensing");

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
let mediaLibraryId, masterId, masterHash, mezzanineId, linkLibraryId, linkObjectId;
let s3Access;

let playoutResult;

let testFile1, testFile2, testFile3, testHash;
let fileInfo = [];
let partInfo = {};

// Describe blocks and  tests within them are run in order
describe("Test ElvClient", () => {
  beforeAll(async () => {
    client = OutputLogger(ElvClient, await CreateClient("ElvClient", "2"));
    accessClient = OutputLogger(ElvClient, await CreateClient("ElvClient Access"));

    testFile1 = RandomBytes(testFileSize);
    testFile2 = RandomBytes(testFileSize);
    testFile3 = RandomBytes(testFileSize);
    testHash = RandomString(10);

    s3Access = {
      region: process.env.AWS_REGION,
      bucket: process.env.AWS_BUCKET,
      accessKey: process.env.AWS_KEY,
      secret: process.env.AWS_SECRET,
      testFile: process.env.AWS_TEST_FILE
    };

    await client.userProfileClient.WalletAddress();
    await accessClient.userProfileClient.WalletAddress();

    // Create required types
    const requiredContentTypes = ["ABR Master", "Library", "Production Master"];

    await Promise.all(
      requiredContentTypes.map(async typeName => {
        const type = await client.ContentType({name: typeName});

        if(!type) {
          await client.CreateContentType({
            name: typeName,
            metadata: {
              "bitcode_flags": "abrmaster",
              "bitcode_format": "builtin"
            }
          });
        }
      })
    );
  });

  afterAll(async () => {
    await Promise.all([client, accessClient].map(async client => ReturnBalance(client)));

    console.log("\nPlayout Options:");
    console.log(JSON.stringify(playoutResult, null, 2));
    console.log("\n");
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

    test("Initialization With Region", async () => {
      const bootstrapClient = await ElvClient.FromConfigurationUrl({
        configUrl: ClientConfiguration["config-url"],
        region: "eu-west"
      });

      expect(bootstrapClient).toBeDefined();
      expect(bootstrapClient.fabricURIs).toBeDefined();
      expect(bootstrapClient.fabricURIs.length).toBeGreaterThan(0);
      expect(bootstrapClient.ethereumURIs).toBeDefined();
      expect(bootstrapClient.ethereumURIs.length).toBeGreaterThan(0);

      await bootstrapClient.UseRegion({region: "na-west-south"});
      await bootstrapClient.UseRegion({region: "eu-west"});
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

      typeId = await client.CreateContentType({
        name: typeName,
        bitcode: testFile1
      });
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
    test("Set Tenant ID For User", async () => {
      const tenantId = `iten${client.utils.AddressToHash(accessGroupAddress)}`;

      await client.userProfileClient.SetTenantId({id: tenantId});
      const tenantById = await client.userProfileClient.TenantId();
      expect(tenantById).toEqual(tenantId);

      await client.userProfileClient.SetTenantId({address: accessGroupAddress});
      const tenantByAddress = await client.userProfileClient.TenantId();
      expect(tenantByAddress).toEqual(tenantId);
    });

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

      const libraryTenant = await client.CallContractMethod({
        contractAddress: client.utils.HashToAddress(libraryId),
        methodName: "getMeta",
        methodArgs: [
          "_tenantId"
        ]
      });

      const tenantId = `iten${client.utils.AddressToHash(accessGroupAddress)}`;
      const libraryTenantId = Buffer.from(libraryTenant.replace("0x", ""), "hex").toString("utf8");

      expect(libraryTenantId).toEqual(tenantId);

      console.log(`\n\nLibraryId: ${libraryId}\nTenant ID: ${tenantId}\n`);
    });

    test("Clear Tenancy", async () => {
      // Remove the tenant ID from the library
      await client.CallContractMethodAndWait({
        contractAddress: client.utils.HashToAddress(libraryId),
        methodName: "putMeta",
        methodArgs: [
          "_tenantId",
          ""
        ]
      });

      const libraryTenant = await client.CallContractMethod({
        contractAddress: client.utils.HashToAddress(libraryId),
        methodName: "getMeta",
        methodArgs: [
          "_tenantId"
        ]
      });

      expect(libraryTenant).toEqual("0x");

      // Remove tenantId from user metadata
      await client.userProfileClient.DeleteUserMetadata({metadataSubtree: "tenantId"});
      client.userProfileClient.tenantId = undefined;

      const userMetadata = client.userProfileClient.UserMetadata();
      expect(userMetadata.tenantId).not.toBeDefined();

      // Create a new library and ensure tenant ID is not set
      const newLibraryId = await client.CreateContentLibrary({name: "No Tenant ID"});
      const newLibraryTenant = await client.CallContractMethod({
        contractAddress: client.utils.HashToAddress(newLibraryId),
        methodName: "getMeta",
        methodArgs: [
          "_tenantId"
        ]
      });

      expect(newLibraryTenant).toEqual("0x");
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

    test("Content Library Group Permissions", async () => {
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

      // Maintain accessor permissions so accessClient has access to library
      await client.AddContentLibraryGroup({
        libraryId,
        groupAddress: accessGroupAddress,
        permission: "accessor"
      });

      const permissions = await client.ContentLibraryGroupPermissions({libraryId});
      expect(permissions[accessGroupAddress]).toBeDefined();
      expect(permissions[accessGroupAddress]).toEqual(["accessor", "contributor", "reviewer"]);

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
      const libraryObjectId = client.utils.AddressToObjectId(client.utils.HashToAddress(libraryId));
      const buffer = fs.readFileSync(Path.resolve(__dirname, "files", "test-image1.png"));
      const image = client.utils.BufferToArrayBuffer(buffer);

      const editResponse = await client.EditContentObject({libraryId, objectId: libraryObjectId});
      const writeToken = editResponse.write_token;
      await client.SetContentLibraryImage({libraryId, image, writeToken});
      await client.FinalizeContentObject({libraryId, objectId: libraryObjectId, writeToken});

      const libraryImageMeta = await client.ContentObjectMetadata({
        libraryId,
        objectId: libraryId.replace("ilib", "iq__"),
        metadataSubtree: "public/display_image"
      });

      expect(libraryImageMeta).toBeDefined();

      const imageUrl = await client.ContentObjectImageUrl({
        libraryId,
        objectId: libraryObjectId
      });

      expect(imageUrl).toBeDefined();
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
        },
        toLink: {
          meta: {
            data: {
              some: "meta",
              data: {
                to: "show"
              }
            }
          }
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
      delete metadata.commit;

      expect(metadata).toEqual(testMetadata);

      versionHash = finalizeResponse.hash;
    });

    test("Content Object Metadata", async () => {
      const metadata = await client.ContentObjectMetadata({libraryId, objectId});
      delete metadata.commit;

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
        },
        toLink: {
          meta: {
            data: {
              some: "meta",
              data: {
                to: "show"
              }
            }
          }
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

    test("Edit Content Object", async () => {
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
      delete metadata.commit;

      expect(metadata).toEqual({
        name: "Test Content Object",
        toMerge: {
          new: "metadata",
          merge: "me"
        },
        toReplace: {
          new: "metadata"
        },
        toLink: {
          meta: {
            data: {
              some: "meta",
              data: {
                to: "show"
              }
            }
          }
        }
      });

      versionHash = finalizeResponse.hash;
    });

    test("List Content Objects", async () => {
      const testLibraryId = await client.CreateContentLibrary({name: "Test Object Filtering"});

      let objectNames = [];
      // Create a bunch of objects
      for(let i = 0; i < 5; i++) {
        const name = `Test Object ${10 - i}`;
        objectNames.push(name);
        const createResponse = await client.CreateContentObject({
          libraryId: testLibraryId,
          options: {
            meta: {
              public: {
                name,
                otherKey: i
              }
            }
          }
        });

        await client.FinalizeContentObject({
          libraryId: testLibraryId,
          objectId: createResponse.id,
          writeToken: createResponse.write_token
        });
      }

      objectNames = objectNames.sort();

      /* No filters */
      const unfiltered = await client.ContentObjects({
        libraryId: testLibraryId,
        filterOptions: {
          select: ["/public"],
          limit: 10
        }
      });

      expect(unfiltered).toBeDefined();
      expect(unfiltered.contents).toBeDefined();
      expect(unfiltered.contents.length).toEqual(5);
      expect(unfiltered.paging).toBeDefined();

      /* Sorting */
      const sorted = await client.ContentObjects({
        libraryId: testLibraryId,
        filterOptions: {
          select: ["/public"],
          sort: "/public/name"
        }
      });

      const sortedNames = sorted.contents.map(object => object.versions[0].meta.public.name);

      expect(sortedNames).toEqual(objectNames);

      const descSorted = await client.ContentObjects({
        libraryId: testLibraryId,
        filterOptions: {
          select: ["/public"],
          sort: "/public/name",
          sortDesc: true
        }
      });

      const descSortedNames = descSorted.contents.map(object => object.versions[0].meta.public.name);

      const descObjectNames = [...objectNames].reverse();
      expect(descSortedNames).toEqual(descObjectNames);

      /* Filtering */
      const filtered = await client.ContentObjects({
        libraryId: testLibraryId,
        filterOptions: {
          select: ["/public"],
          sort: ["/public/name"],
          filter: [
            {key: "/public/name", type: "gte", filter: objectNames[1]},
            {key: "/public/name", type: "lte", filter: objectNames[3]}
          ]
        }
      });

      expect(filtered.contents.length).toEqual(3);
      const filteredNames = filtered.contents.map(object => object.versions[0].meta.public.name);
      expect(filteredNames).toEqual(objectNames.slice(1, 4));

      /* Selecting metadata fields */
      const selected = await client.ContentObjects({
        libraryId: testLibraryId,
        filterOptions: {
          sort: "/public/name",
          select: ["/public/name"]
        }
      });

      selected.contents.forEach(object => {
        expect(object.versions[0].meta.public.name).toBeDefined();
        expect(object.versions[0].meta.public.otherKey).not.toBeDefined();
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

      const latestVersionHash = await client.LatestVersionHash({objectId});
      expect(latestVersionHash).toBeDefined();
      expect(latestVersionHash).toEqual(versionHash);
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

  test("Set Commit Message", async () => {
    // Check automatic commit
    const automaticCommit = await client.ContentObjectMetadata({
      libraryId,
      objectId,
      metadataSubtree: "commit"
    });

    expect(automaticCommit).toBeDefined();
    expect(client.utils.EqualAddress(client.CurrentAccountAddress(), automaticCommit.author)).toBeTruthy();
    expect(client.utils.EqualAddress(client.CurrentAccountAddress(), automaticCommit.author_address)).toBeTruthy();
    expect(automaticCommit.message).toBeDefined();
    expect(automaticCommit.timestamp).toBeDefined();
    expect(isNaN((new Date(automaticCommit.timestamp)).getTime())).toBeFalsy();

    // Create new commit with message and user name
    await client.userProfileClient.ReplaceUserMetadata({
      metadataSubtree: "public/name",
      metadata: "Test User"
    });

    await client.EditAndFinalizeContentObject({
      libraryId,
      objectId,
      commitMessage: "Test Commit Message",
      callback: () => {}
    });

    const customCommit = await client.ContentObjectMetadata({
      libraryId,
      objectId,
      metadataSubtree: "commit"
    });

    expect(customCommit).toBeDefined();
    expect(customCommit.author).toEqual("Test User");
    expect(client.utils.EqualAddress(client.CurrentAccountAddress(), customCommit.author_address)).toBeTruthy();
    expect(customCommit.timestamp).toBeDefined();
    expect(isNaN((new Date(customCommit.timestamp)).getTime())).toBeFalsy();
    expect(customCommit.message).toEqual("Test Commit Message");
  });

  describe("Content Object Group Permissions", () => {
    test("Content Object Group Permissions", async () => {
      const {id, write_token} = await client.CreateContentObject({libraryId});
      await client.FinalizeContentObject({libraryId, objectId: id, writeToken: write_token});

      const groupObjectId = id;

      const initialPermissions = await client.ContentObjectGroupPermissions({objectId: groupObjectId});

      expect(initialPermissions).toBeDefined();
      expect(Object.keys(initialPermissions).length).toEqual(0);

      const groupAddress = await client.CreateAccessGroup({name: "Test Object Permissions"});

      await client.AddContentObjectGroupPermission({
        objectId: groupObjectId,
        groupAddress,
        permission: "see"
      });

      await client.AddContentObjectGroupPermission({
        objectId: groupObjectId,
        groupAddress,
        permission: "access"
      });

      await client.AddContentObjectGroupPermission({
        objectId: groupObjectId,
        groupAddress,
        permission: "manage"
      });

      const fullPermissions = await client.ContentObjectGroupPermissions({objectId: groupObjectId});

      expect(fullPermissions).toBeDefined();
      expect(Object.keys(fullPermissions).length).toEqual(1);
      expect(fullPermissions[groupAddress]).toBeDefined();
      expect(fullPermissions[groupAddress].sort()).toEqual(["access", "manage", "see"]);

      await client.RemoveContentObjectGroupPermission({
        objectId: groupObjectId,
        groupAddress,
        permission: "manage"
      });

      const reducedPermissions = await client.ContentObjectGroupPermissions({objectId: groupObjectId});

      expect(reducedPermissions).toBeDefined();
      expect(Object.keys(reducedPermissions).length).toEqual(1);
      expect(reducedPermissions[groupAddress]).toBeDefined();
      expect(reducedPermissions[groupAddress].sort()).toEqual(["access", "see"]);

      await client.RemoveContentObjectGroupPermission({
        objectId: groupObjectId,
        groupAddress,
        permission: "access"
      });

      await client.RemoveContentObjectGroupPermission({
        objectId: groupObjectId,
        groupAddress,
        permission: "see"
      });

      const noPermissions = await client.ContentObjectGroupPermissions({objectId: groupObjectId});

      expect(noPermissions).toBeDefined();
      expect(Object.keys(noPermissions).length).toEqual(0);
    });
  });

  describe("Encryption", () => {
    test("Encrypt and Decrypt", async () => {
      // Ensure encryption conk is set
      const writeToken = (await client.EditContentObject({libraryId, objectId})).write_token;
      await client.CreateEncryptionConk({libraryId, objectId, writeToken, createKMSConk: true});
      await client.FinalizeContentObject({libraryId, objectId, writeToken});

      const encrypted = await client.Encrypt({libraryId, objectId, chunk: testFile1});
      const decrypted = new Uint8Array(await client.Decrypt({libraryId, objectId, chunk: encrypted}));

      expect(decrypted.byteLength).toEqual(testFileSize);
      expect(decrypted.toString()).toEqual(new Uint8Array(testFile1).toString());
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
      const mock = mockCallback();
      const callback = ({chunk}) => {
        partChunks.push(Buffer.from(chunk));
        mock();
      };

      await client.DownloadPart({
        libraryId,
        objectId,
        partHash: partInfo.chunked,
        chunked: true,
        chunkSize: testFileSize / 10,
        callback
      });

      expect(mock).toHaveBeenCalledTimes(10);

      const chunkedPart = Buffer.concat(partChunks);
      expect(new Uint8Array(chunkedPart).toString()).toEqual(new Uint8Array(testFile2).toString());
    });

    test("Download Encrypted Part In Chunks", async () => {
      let partChunks = [];
      const mock = mockCallback();
      const callback = ({chunk}) => {
        partChunks.push(Buffer.from(chunk));
        mock();
      };

      await client.DownloadPart({
        libraryId,
        objectId,
        partHash: partInfo.encryptedChunked,
        chunked: true,
        chunkSize: testFileSize / 10,
        callback
      });

      expect(mock).toHaveBeenCalledTimes(10);

      const chunkedPart = Buffer.concat(partChunks);
      expect(new Uint8Array(chunkedPart).toString()).toEqual(new Uint8Array(testFile3).toString());
    });

    test.skip("Download Part With Proxy Re-encryption", async () => {
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

      /* Example Callback
        {
          "testDirectory/File 1": {
          "uploaded": 0,
            "total": 100000
        },
          "testDirectory/File 2": {
          "uploaded": 0,
            "total": 100000
        }
      */
      const callback = fileUploadStatus => {
        expect(fileUploadStatus).toBeDefined();
        expect(fileUploadStatus["testDirectory/File 1"]).toBeDefined();
        expect(fileUploadStatus["testDirectory/File 2"]).toBeDefined();

        expect(fileUploadStatus["testDirectory/File 1"].uploaded).toBeDefined();
        expect(fileUploadStatus["testDirectory/File 1"].total).toBeDefined();

        expect(fileUploadStatus["testDirectory/File 2"].uploaded).toBeDefined();
        expect(fileUploadStatus["testDirectory/File 2"].total).toBeDefined();
      };

      await client.UploadFiles({
        libraryId,
        objectId,
        writeToken,
        fileInfo,
        callback
      });

      await client.FinalizeContentObject({libraryId, objectId, writeToken});
    });

    test("Copy Files From S3", async () => {
      if(!(s3Access.accessKey && s3Access.bucket && s3Access.region && s3Access.secret)) {
        throw Error("S3 info and credentials not specified");
      }

      const writeToken = (await client.EditContentObject({libraryId, objectId})).write_token;

      /* Example callback:
        {
          "done": true,
          "uploaded": 97944174,
          "total": 97944174,
          "uploadedFiles": 1,
          "totalFiles": 1,
          "fileStatus": {
            "/eluvio-mez-test/ENTIRE_CREED_2min_.mp4": {
              "size": 97944174,
              "written": 83757796,
              "percent": 85.51585314303635
            }
          }
        }
      */
      const callback = ({done, uploaded, total, uploadedFiles, totalFiles, fileStatus}) => {
        expect(done).toBeDefined();
        expect(uploaded).toBeDefined();
        expect(total).toBeDefined();
        expect(uploadedFiles).toBeDefined();
        expect(totalFiles).toBeDefined();
        expect(totalFiles).toEqual(1);

        if(done) {
          expect(uploaded).toEqual(total);
          expect(uploadedFiles).toEqual(totalFiles);
        } else {
          expect(Object.keys(fileStatus).length).toEqual(1);
        }
      };

      await client.UploadFilesFromS3({
        libraryId,
        objectId,
        writeToken,
        fileInfo: [{
          path: "s3-copy",
          source: s3Access.testFile
        }],
        region: s3Access.region,
        bucket: s3Access.bucket,
        accessKey: s3Access.accessKey,
        secret: s3Access.secret,
        copy: true,
        callback
      });

      await client.FinalizeContentObject({libraryId, objectId, writeToken});
    });

    test("Copy Files From S3 With Encryption", async () => {
      if(!(s3Access.accessKey && s3Access.bucket && s3Access.region && s3Access.secret)) {
        throw Error("S3 info and credentials not specified");
      }

      const writeToken = (await client.EditContentObject({libraryId, objectId})).write_token;

      /* Example callback:
        {
          "done": true,
          "uploaded": 97944174,
          "total": 97944174,
          "uploadedFiles": 1,
          "totalFiles": 1,
          "fileStatus": {
            "/eluvio-mez-test/ENTIRE_CREED_2min_.mp4": {
              "size": 97944174,
              "written": 83757796,
              "percent": 85.51585314303635
            }
          }
        }
      */
      const callback = ({done, uploaded, total, uploadedFiles, totalFiles, fileStatus}) => {
        expect(done).toBeDefined();
        expect(uploaded).toBeDefined();
        expect(total).toBeDefined();
        expect(uploadedFiles).toBeDefined();
        expect(totalFiles).toBeDefined();
        expect(totalFiles).toEqual(1);

        if(done) {
          expect(uploaded).toEqual(total);
          expect(uploadedFiles).toEqual(totalFiles);
        } else {
          expect(Object.keys(fileStatus).length).toEqual(1);
        }
      };

      await client.UploadFilesFromS3({
        libraryId,
        objectId,
        writeToken,
        encryption: "cgck",
        fileInfo: [{
          path: "s3-copy-encrypted",
          source: s3Access.testFile
        }],
        region: s3Access.region,
        bucket: s3Access.bucket,
        accessKey: s3Access.accessKey,
        secret: s3Access.secret,
        copy: true,
        callback
      });

      await client.FinalizeContentObject({libraryId, objectId, writeToken});
    });

    test("Reference Files From S3", async () => {
      if(!(s3Access.accessKey && s3Access.bucket && s3Access.region && s3Access.secret)) {
        throw Error("S3 info and credentials not specified");
      }

      const writeToken = (await client.EditContentObject({libraryId, objectId})).write_token;

      /* Example callback:
        {
          "done": true,
          "uploadedFiles": 1,
          "totalFiles": 1
        }
      */
      const callback = ({done, uploadedFiles, totalFiles}) => {
        expect(done).toBeDefined();
        expect(uploadedFiles).toBeDefined();
        expect(totalFiles).toBeDefined();

        if(done) {
          expect(uploadedFiles).toEqual(totalFiles);
        } else {
          expect(uploadedFiles).not.toEqual(totalFiles);
        }
      };

      await client.UploadFilesFromS3({
        libraryId,
        objectId,
        writeToken,
        fileInfo: [{
          path: "s3-reference",
          source: s3Access.testFile
        }],
        region: s3Access.region,
        bucket: s3Access.bucket,
        accessKey: s3Access.accessKey,
        secret: s3Access.secret,
        copy: false,
        callback
      });

      await client.FinalizeContentObject({libraryId, objectId, writeToken});
    });

    test("Upload Files From S3 - Errors", async () => {
      if(!(s3Access.accessKey && s3Access.bucket && s3Access.region && s3Access.secret)) {
        throw Error("S3 info and credentials not specified");
      }

      const writeToken = (await client.EditContentObject({libraryId, objectId})).write_token;

      try {
        await client.UploadFilesFromS3({
          libraryId,
          objectId,
          writeToken,
          fileInfo: [{
            path: "s3-reference",
            source: "invalid-file"
          }],
          region: s3Access.region,
          bucket: s3Access.bucket,
          accessKey: s3Access.accessKey,
          secret: s3Access.secret,
          copy: true
        });

        expect(undefined).toBeDefined();
      // eslint-disable-next-line no-empty
      } catch(error) {}

      try {
        await client.UploadFilesFromS3({
          libraryId,
          objectId,
          writeToken,
          fileInfo: [{
            path: "s3-reference",
            source: "invalid-file"
          }],
          region: s3Access.region,
          bucket: s3Access.bucket,
          accessKey: s3Access.accessKey,
          secret: s3Access.secret,
          copy: false
        });

        expect(undefined).toBeDefined();
      // eslint-disable-next-line no-empty
      } catch(error) {}
    });

    test("Download Files", async () => {
      const fileData1 = await client.DownloadFile({libraryId, objectId, filePath: "testDirectory/File 1", format: "arrayBuffer"});
      expect(new Uint8Array(fileData1).toString()).toEqual(new Uint8Array(testFile1).toString());
      expect(new Uint8Array(fileData1).toString()).not.toEqual(new Uint8Array(testFile2).toString());

      const fileData2 = await client.DownloadFile({libraryId, objectId, filePath: "testDirectory/File 2", format: "arrayBuffer"});
      expect(new Uint8Array(fileData2).toString()).toEqual(new Uint8Array(testFile2).toString());
    });

    test("Download S3 File", async () => {
      const s3CopyData = await client.DownloadFile({libraryId, objectId, filePath: "s3-copy", format: "arrayBuffer"});
      expect(s3CopyData).toBeDefined();
    });

    test("Download Encrypted S3 File", async () => {
      const s3CopyDataDecrypted = await client.DownloadFile({
        libraryId,
        objectId,
        filePath: "s3-copy-encrypted",
        format: "arrayBuffer",
        clientSideDecryption: true
      });

      expect(s3CopyDataDecrypted).toBeDefined();
    });

    test("Create File Directories", async () => {
      const writeToken = (await client.EditContentObject({libraryId, objectId})).write_token;

      await client.CreateFileDirectories({
        libraryId,
        objectId,
        writeToken,
        filePaths: [
          "new-directory-1",
          "new-directory-2",
          "new-directory-3",
        ]
      });

      await client.FinalizeContentObject({libraryId, objectId, writeToken});
    });

    test("List Files", async () => {
      const files = await client.ListFiles({libraryId, objectId});

      expect(files.testDirectory).toBeDefined();
      expect(files.testDirectory["File 1"]).toBeDefined();
      expect(files.testDirectory["File 2"]).toBeDefined();
      expect(files["s3-copy"]).toBeDefined();
      expect(files["s3-reference"]).toBeDefined();
      expect(files["new-directory-1"]).toBeDefined();
      expect(files["new-directory-2"]).toBeDefined();
      expect(files["new-directory-3"]).toBeDefined();
    });

    test("Create Local File Links", async () => {
      const writeToken = (await client.EditContentObject({libraryId, objectId})).write_token;

      await client.CreateLinks({
        libraryId,
        objectId,
        writeToken,
        links: [
          {
            target: "testDirectory/File 1",
            path: "myLink",
            type: "file"
          },
          {
            target: "testDirectory/File 2",
            path: "links/myLink2",
            type: "file"
          },
          {
            target: "toLink/meta/data",
            path: "links/metadataLink",
            type: "meta"
          }
        ]
      });

      await client.FinalizeContentObject({libraryId, objectId, writeToken});
    });

    test("Create Link URLs", async () => {
      const link1 = await client.LinkUrl({
        libraryId,
        objectId,
        linkPath: "myLink",
        mimeType: "application/octet-stream"
      });

      expect(link1).toBeDefined();
      expect(decodeURIComponent(link1).includes("header-accept=application/octet-stream")).toBeTruthy();

      const data = await (await Fetch(link1)).arrayBuffer();
      expect(new Uint8Array(data).toString()).toEqual(new Uint8Array(testFile1).toString());

      const link2 = await client.LinkUrl({
        libraryId,
        objectId,
        linkPath: "links/myLink2",
        mimeType: "image/*"
      });

      expect(link2).toBeDefined();
      expect(decodeURIComponent(link2).includes("header-accept=image/*")).toBeTruthy();

      const data2 = await (await Fetch(link2)).arrayBuffer();
      expect(new Uint8Array(data2).toString()).toEqual(new Uint8Array(testFile2).toString());
    });

    test("Fetch link data", async () => {
      const data1 = await client.LinkData({
        libraryId,
        objectId,
        linkPath: "myLink",
        format: "arrayBuffer"
      });

      expect(data1).toBeDefined();
      expect(new Uint8Array(data1).toString()).toEqual(new Uint8Array(testFile1).toString());

      const data2 = await client.LinkData({
        libraryId,
        objectId,
        linkPath: "links/myLink2",
        format: "arrayBuffer"
      });

      expect(data2).toBeDefined();
      expect(new Uint8Array(data2).toString()).toEqual(new Uint8Array(testFile2).toString());

      const data3 = await client.LinkData({
        libraryId,
        objectId,
        linkPath: "links/metadataLink",
        format: "json"
      });

      const expected = {
        some: "meta",
        data: {
          to: "show"
        }
      };

      expect(data3).toBeDefined();
      expect(data3).toEqual(expected);
    });

    test("Get Metadata With Link URLs", async () => {
      const metadata = await client.ContentObjectMetadata({
        libraryId,
        objectId,
        resolveLinks: true,
        produceLinkUrls: true
      });

      expect(metadata).toBeDefined();

      expect(metadata.myLink).toBeDefined();
      expect(metadata.myLink["/"]).toBeDefined();
      expect(metadata.myLink.url).toBeDefined();

      expect(metadata.links).toBeDefined();
      expect(metadata.links.myLink2).toBeDefined();
      expect(metadata.links.myLink2["/"]).toBeDefined();
      expect(metadata.links.myLink2.url).toBeDefined();

      expect(metadata.links).toBeDefined();
      expect(metadata.links.metadataLink).toEqual({
        some: "meta",
        data: {
          to: "show"
        }
      });

      const subMetadata = await client.ContentObjectMetadata({
        libraryId,
        objectId,
        metadataSubtree: "links",
        resolveLinks: true,
        produceLinkUrls: true
      });

      expect(subMetadata).toBeDefined();
      expect(subMetadata.myLink2).toBeDefined();
      expect(subMetadata.myLink2["/"]).toBeDefined();
      expect(subMetadata.myLink2.url).toBeDefined();

      expect(subMetadata.metadataLink).toEqual({
        some: "meta",
        data: {
          to: "show"
        }
      });
    });

    test("Delete Files", async () => {
      const writeToken = (await client.EditContentObject({libraryId, objectId})).write_token;

      await client.DeleteFiles({
        libraryId,
        objectId,
        writeToken,
        filePaths: [
          "new-directory-1",
          "new-directory-2",
          "testDirectory/File 2"
        ]
      });

      await client.FinalizeContentObject({libraryId, objectId, writeToken});

      const files = await client.ListFiles({libraryId, objectId});

      expect(files.testDirectory).toBeDefined();
      expect(files.testDirectory["File 1"]).toBeDefined();
      expect(files.testDirectory["File 2"]).not.toBeDefined();
      expect(files["new-directory-1"]).not.toBeDefined();
      expect(files["new-directory-2"]).not.toBeDefined();
      expect(files["new-directory-3"]).toBeDefined();
    });
  });

  describe("Media", () => {
    test("Create Production Master", async () => {
      mediaLibraryId = await client.CreateContentLibrary({
        name: "Test Media Library",
        metadata: {
          "abr_profile": {
            "drm_optional": true,
            "store_clear": true,
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
        type: "Production Master",
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

      masterId = id;
      masterHash = hash;
    });

    test("Create Mezzanine", async () => {
      const {id, hash} = await client.CreateABRMezzanine({
        libraryId: mediaLibraryId,
        masterVersionHash: masterHash,
        type: "ABR Master",
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

      // Add group permission to mezzanine so accessClient can access it
      await client.AddContentObjectGroupPermission({
        objectId: id,
        groupAddress: accessGroupAddress,
        permission: "access"
      });

      mezzanineId = id;
    });

    test("Process Mezzanine", async () => {
      try {
        const startResponse = await client.StartABRMezzanineJobs({
          libraryId: mediaLibraryId,
          objectId: mezzanineId,
          offeringKey: "default",
        });

        expect(startResponse).toBeDefined();
        expect(startResponse.lro_draft).toBeDefined();
        expect(startResponse.lro_draft.write_token).toBeDefined();
        expect(startResponse.lro_draft.node).toBeDefined();

        const startTime = new Date().getTime();

        // eslint-disable-next-line no-constant-condition
        while(true) {
          const status = await client.LROStatus({libraryId: mediaLibraryId, objectId: mezzanineId});

          let done = true;
          Object.keys(status).forEach(id => {
            const info = status[id];

            if(!info.end) {
              done = false;
            }
          });

          if(done) {
            break;
          }

          if(new Date().getTime() - startTime > 120000) {
            // If processing takes too long, start logging status for debugging
            console.log(status);
          }

          await new Promise(resolve => setTimeout(resolve, 5000));
        }

        await client.FinalizeABRMezzanine({
          libraryId: mediaLibraryId,
          objectId: mezzanineId,
          offeringKey: "default"
        });

        await new Promise(resolve => setTimeout(resolve, 5000));
      } catch(error) {
        console.log("\n\nERROR:");
        console.log(JSON.stringify(error, null, 2));
        console.log();
      }
    });

    test("Available Offerings", async () => {
      const offerings = await accessClient.AvailableOfferings({objectId: mezzanineId});

      expect(offerings).toBeDefined();
      expect(offerings.default).toBeDefined();
      expect(offerings.default.display_name).toEqual("default");
    });

    test("Playout Options", async () => {
      const playoutOptions = await accessClient.PlayoutOptions({
        objectId: mezzanineId,
        protocols: ["hls", "dash"],
        drms: []
      });

      expect(playoutOptions.dash).toBeDefined();
      expect(playoutOptions.dash.playoutUrl).toBeDefined();
      expect(playoutOptions.dash.playoutMethods.clear).toBeDefined();

      expect(playoutOptions.hls).toBeDefined();
      expect(playoutOptions.hls.playoutUrl).toBeDefined();
      expect(playoutOptions.hls.playoutMethods.clear).toBeDefined();

      const bitmovinPlayoutOptions = await accessClient.BitmovinPlayoutOptions({
        objectId: mezzanineId,
        protocols: ["hls", "dash"],
        drms: []
      });

      expect(bitmovinPlayoutOptions).toBeDefined();

      const clearPlayoutOptions = await accessClient.PlayoutOptions({
        objectId: mezzanineId,
        protocols: ["hls", "dash"],
        drms: []
      });

      playoutResult = {
        hls: clearPlayoutOptions.hls.playoutUrl,
        dash: clearPlayoutOptions.dash.playoutUrl
      };
    });

    test("Playout Options From Self Link", async () => {
      try {
        // Create a link to default playout
        const {write_token} = await client.EditContentObject({
          libraryId: mediaLibraryId,
          objectId: mezzanineId
        });

        await client.CreateLinks({
          libraryId: mediaLibraryId,
          objectId: mezzanineId,
          writeToken: write_token,
          links: [{
            type: "rep",
            path: "public/videoLink/default",
            target: "playout/default/options.json"
          }]
        });
        const {id, hash} = await client.FinalizeContentObject({
          libraryId: mediaLibraryId,
          objectId: mezzanineId,
          writeToken: write_token
        });

        await client.SetVisibility({
          id,
          visibility: 10
        });

        // Produce playout options from link
        const playoutOptions = await accessClient.PlayoutOptions({
          versionHash: hash,
          linkPath: "public/videoLink/default",
          protocols: ["hls", "dash"],
          drms: []
        });

        expect(playoutOptions.dash).toBeDefined();
        expect(playoutOptions.dash.playoutUrl).toBeDefined();
        expect(playoutOptions.dash.playoutMethods.clear).toBeDefined();

        expect(playoutOptions.hls).toBeDefined();
        expect(playoutOptions.hls.playoutUrl).toBeDefined();
        expect(playoutOptions.hls.playoutMethods.clear).toBeDefined();

        const bitmovinPlayoutOptions = await accessClient.BitmovinPlayoutOptions({
          versionHash: hash,
          linkPath: "public/videoLink/default",
          protocols: ["hls", "dash"],
          drms: []
        });

        expect(bitmovinPlayoutOptions).toBeDefined();
      } catch(error) {
        console.error("ERROR:");
        console.error(JSON.stringify(error, null, 2));
        throw error;
      }
    });

    test("Playout Options Through Public Links", async () => {
      try {
        // Create a new object that accessClient should not have access to,
        // then attempt to access playout options through a link in that object
        linkLibraryId = await client.CreateContentLibrary({
          name: "Test Playout Link"
        });

        const {id, write_token} = await client.CreateContentObject({
          libraryId: linkLibraryId,
          options: {
            visibility: 1
          }
        });

        linkObjectId = id;

        await client.CreateLinks({
          libraryId: linkLibraryId,
          objectId: linkObjectId,
          writeToken: write_token,
          links: [
            {
              type: "rep",
              path: "public/videoLink",
              targetHash: await client.LatestVersionHash({objectId: mezzanineId}),
              target: "playout/default/options.json"
            },
            {
              type: "rep",
              path: "public/multiOfferingVideoLink",
              targetHash: await client.LatestVersionHash({objectId: mezzanineId}),
              target: "playout"
            }
          ]
        });

        await client.FinalizeContentObject({
          libraryId: linkLibraryId,
          objectId: linkObjectId,
          writeToken: write_token
        });

        await client.CallContractMethodAndWait({
          contractAddress: client.utils.HashToAddress(linkObjectId),
          methodName: "publish"
        });

        await client.SetVisibility({id: linkObjectId, visibility: 10});

        // Produce playout options from link
        const playoutOptions = await accessClient.PlayoutOptions({
          objectId: id,
          linkPath: "public/videoLink",
          protocols: ["hls", "dash"],
          drms: []
        });

        expect(playoutOptions.dash).toBeDefined();
        expect(playoutOptions.dash.playoutUrl).toBeDefined();
        expect(playoutOptions.dash.playoutMethods.clear).toBeDefined();

        expect(playoutOptions.hls).toBeDefined();
        expect(playoutOptions.hls.playoutUrl).toBeDefined();
        expect(playoutOptions.hls.playoutMethods.clear).toBeDefined();

        // Produce playout options from multi offering link
        const moPlayoutOptions = await accessClient.PlayoutOptions({
          objectId: id,
          protocols: ["hls", "dash"],
          linkPath: "public/multiOfferingVideoLink",
          offering: "default",
          drms: []
        });

        expect(moPlayoutOptions.dash).toBeDefined();
        expect(moPlayoutOptions.dash.playoutUrl).toBeDefined();
        expect(moPlayoutOptions.dash.playoutMethods.clear).toBeDefined();

        expect(moPlayoutOptions.hls).toBeDefined();
        expect(moPlayoutOptions.hls.playoutUrl).toBeDefined();
        expect(moPlayoutOptions.hls.playoutMethods.clear).toBeDefined();


        const bitmovinPlayoutOptions = await accessClient.BitmovinPlayoutOptions({
          objectId: linkObjectId,
          linkPath: "public/videoLink",
          protocols: ["hls", "dash"],
          drms: []
        });

        expect(bitmovinPlayoutOptions).toBeDefined();

        const moBitmovinPlayoutOptions = await accessClient.BitmovinPlayoutOptions({
          objectId: linkObjectId,
          linkPath: "public/multiOfferingVideoLink",
          protocols: ["hls", "dash"],
          drms: []
        });

        expect(moBitmovinPlayoutOptions).toBeDefined();
      } catch(error) {
        console.error("ERROR:");
        console.error(JSON.stringify(error, null, 2));
        throw error;
      }
    });
  });

  describe("Content Object Link Graph", () => {
    let targetId;

    test("Create Object With Links", async () => {
      const {id, write_token} = await client.CreateContentObject({
        libraryId
      });

      await client.ReplaceMetadata({
        libraryId,
        objectId: id,
        writeToken: write_token,
        metadata: {
          public: {
            asset_metadata: {
              link: {
                target: "content"
              }
            }
          }
        }
      });

      await client.FinalizeContentObject({
        libraryId,
        objectId: id,
        writeToken: write_token
      });

      targetId = id;
    });

    test("View Graph", async () => {
      const writeToken = (await client.EditContentObject({libraryId, objectId})).write_token;

      await client.CreateLinks({
        libraryId,
        objectId,
        writeToken,
        links: [{
          path: "/test/link",
          targetHash: await client.LatestVersionHash({objectId: targetId}),
          target: "/public/asset_metadata",
          type: "metadata",
          autoUpdate: true
        }]
      });

      await client.FinalizeContentObject({libraryId, objectId, writeToken});

      const linkContent = await client.ContentObjectMetadata({
        libraryId,
        objectId,
        resolveLinks: true,
        metadataSubtree: "/test/link"
      });

      expect(linkContent).toBeDefined();
      expect(linkContent).toEqual({link: { target: "content" }});

      const graphInfo = await client.ContentObjectGraph({
        libraryId,
        objectId,
        autoUpdate: true
      });

      expect(graphInfo).toBeDefined();
      expect(Object.keys(graphInfo.auto_updates).length).toEqual(0);
    });

    test("Update Graph", async () => {
      // Update link target
      const writeToken = (await client.EditContentObject({libraryId, objectId: targetId})).write_token;
      await client.FinalizeContentObject({libraryId, objectId: targetId, writeToken});

      // Expect graph to report available updates
      const graphInfo = await client.ContentObjectGraph({
        libraryId,
        objectId,
        autoUpdate: true
      });

      expect(graphInfo).toBeDefined();
      expect(Object.keys(graphInfo.auto_updates).length).not.toEqual(0);

      // Update graph and expect root object to have been updated
      const latestHash = await client.LatestVersionHash({objectId});

      const callback = mockCallback();
      await client.UpdateContentObjectGraph({libraryId, objectId, callback});

      expect(callback).toHaveBeenCalled();

      const newLatestHash = await client.LatestVersionHash({objectId});

      expect(newLatestHash).not.toEqual(latestHash);

      const newGraphInfo = await client.ContentObjectGraph({
        libraryId,
        objectId,
        autoUpdate: true
      });

      expect(newGraphInfo).toBeDefined();
      expect(Object.keys(newGraphInfo.auto_updates).length).toEqual(0);
    });
  });

  describe("Access Requests", () => {
    test("Access Charge and Info", async () => {

      // Object must be published for access request with access charge to work
      await client.CallContractMethodAndWait({
        contractAddress: client.utils.HashToAddress(objectId),
        methodName: "publish"
      });

      await client.SetVisibility({
        id: objectId,
        visibility: 10
      });

      await client.SetAccessCharge({objectId, accessCharge: "0.5"});

      const {accessCharge} = await accessClient.AccessInfo({
        objectId,
      });

      expect(accessCharge).toEqual("0.5");

      const initialBalance = parseFloat(await accessClient.GetBalance({address: accessClient.signer.address}));
      await accessClient.ContentObjectMetadata({libraryId, objectId});
      const finalBalance = parseFloat(await accessClient.GetBalance({address: accessClient.signer.address}));

      expect(finalBalance < (initialBalance - 0.5));
    });

    test("Make Manual Access Request", async () => {
      let accessRequest;
      if(await client.authClient.IsV3({id: objectId})) {
        accessRequest = await client.AccessRequest({
          versionHash,
          args: [
            [], // Custom values
            [] // Stakeholders
          ]
        });
      } else {
        accessRequest = await client.AccessRequest({
          versionHash,
          args: [
            0, // Access level
            undefined, // Public key - will be injected automatically
            "", // AFGH string
            [], // Custom values
            [] // Stakeholders
          ]
        });
      }


      expect(accessRequest).toBeDefined();
      expect(accessRequest.transactionHash).toBeDefined();
    });

    test("Access Complete", async () => {
      const accessComplete = await client.ContentObjectAccessComplete({objectId, score: 90});
      expect(accessComplete).toBeDefined();
      expect(accessComplete.transactionHash).toBeDefined();
    });

    test.skip("State Channel Access", async () => {
      const token = await client.GenerateStateChannelToken({objectId});

      expect(token).toBeDefined();

      const decodedToken = JSON.parse(client.utils.FromB64(token.split(".")[0]));
      expect(decodedToken).toBeDefined();
      expect(client.utils.FormatAddress(decodedToken.addr))
        .toEqual(client.utils.FormatAddress(client.signer.address));
      expect(decodedToken.qid).toEqual(objectId);

      expect(client.stateChannelAccess[objectId]).toBeDefined();

      await client.FinalizeStateChannelAccess({
        objectId,
        percentComplete: 100
      });

      expect(client.stateChannelAccess[objectId]).not.toBeDefined();
    });

    test("Audience Data", async () => {
      const audienceData = client.authClient.AudienceData({
        objectId,
        versionHash
      });

      expect(audienceData).toBeDefined();
      expect(audienceData.user_address).toEqual(client.utils.FormatAddress(client.signer.address));
      expect(audienceData.content_id).toEqual(objectId);
      expect(audienceData.content_hash).toEqual(versionHash);

      client.SetAuthContext({context: {custom: "attribute"}});
      const audienceDataGlobalContext = client.authClient.AudienceData({
        objectId,
        versionHash
      });

      expect(audienceDataGlobalContext.custom).toEqual("attribute");

      const audienceDataSpecificContext = client.authClient.AudienceData({
        objectId,
        versionHash,
        context: {custom: "attribute"}
      });

      expect(audienceDataSpecificContext.custom).toEqual("attribute");
    });
  });

  describe("Contracts", () => {
    test("Contract Events", async () => {
      const events = await client.ContractEvents({
        contractAddress: client.utils.HashToAddress(libraryId),
      });

      expect(events).toBeDefined();
      expect(events[0]).toBeDefined();
    });

    test.skip("Custom Content Object Contract", async () => {
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

      const abi = await client.ContractAbi({id: objectId});
      const eventLog = client.ExtractEventFromLogs({
        abi,
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

      const toBlock = await client.Events({toBlock: latestBlock - 10, fromBlock: latestBlock - 20});
      expect(toBlock).toBeDefined();
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
      const latestVersionHash = await client.LatestVersionHash({objectId});

      const repUrl = await client.Rep({libraryId, objectId, rep: "image"});
      validateUrl(repUrl, UrlJoin("/qlibs", libraryId, "q", latestVersionHash, "rep", "image"));

      const noAuthUrl = await client.Rep({libraryId, objectId, rep: "image", noAuth: true});
      validateUrl(noAuthUrl, UrlJoin("/qlibs", libraryId, "q", latestVersionHash, "rep", "image"), {}, false);
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
      // Delete test object
      await client.DeleteContentObject({libraryId, objectId});

      try {
        await client.ContentObject({libraryId, objectId});

        // If test reaches this point, object has not been deleted successfully
        expect(undefined).toBeDefined();
        // eslint-disable-next-line no-empty
      } catch(error) {}

      // Delete master
      await client.DeleteContentObject({libraryId: mediaLibraryId, objectId: masterId});

      try {
        await client.ContentObject({libraryId: mediaLibraryId, objectId: masterId});

        expect(undefined).toBeDefined();
        // eslint-disable-next-line no-empty
      } catch(error) {}

      // Keep mezzanine for playout validation
      /*
      await client.DeleteContentObject({libraryId: mediaLibraryId, objectId: mezzanineId});

      try {
        await client.ContentObject({libraryId: mediaLibraryId, objectId: mezzanineId});

        expect(undefined).toBeDefined();
        // eslint-disable-next-line no-empty
      } catch(error) {}

       */

      // Delete link test object
      await client.DeleteContentObject({libraryId: linkLibraryId, objectId: linkObjectId});

      try {
        await client.ContentObject({libraryId: linkLibraryId, objectId: linkObjectId});

        // If test reaches this point, object has not been deleted successfully
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

    test.skip("Delete Access Group", async () => {
      await client.DeleteAccessGroup({contractAddress: accessGroupAddress});
    });
  });
});

if(!module.parent) { runTests(); }
module.exports = runTests;





























