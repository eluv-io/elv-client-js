const UrlJoin = require("url-join");
const URI = require("urijs");
const fs = require("fs");
const BaseLibraryContract = require("../src/contracts/BaseLibrary");
const BaseContentContract = require("../src/contracts/BaseContent");
const CustomContract = require("../src/contracts/SampleContentLicensing");

const {ElvClient} = require("../src/ElvClient");

const OutputLogger = require("./utils/OutputLogger");
const {
  RandomBytes,
  RandomString,
  BufferToArrayBuffer,
  CreateClient
} = require("./utils/Utils");

const testFileSize = 100000;

let client, accessClient;
let contentSpaceLibraryId, libraryId, objectId, versionHash, typeId, typeName, typeHash, accessGroupAddress;

let testFile1, testFile2, testHash;
let fileInfo = [];
let partInfo = {};

// Describe blocks and tests within them are run in order
describe("Test ElvClient", () => {
  beforeAll(async () => {
    jest.setTimeout(60000);

    client = OutputLogger(ElvClient, await CreateClient());
    accessClient = OutputLogger(ElvClient, await CreateClient("1"));

    contentSpaceLibraryId = client.utils.AddressToLibraryId(client.utils.HashToAddress(client.contentSpaceId));

    libraryId = "ilib2t71GCq5VNaAkg9ZAkmy1EJJss3";
    objectId = "iq__4XyAFvdwaTWxa4rkKhvgDXvUhRzB";
    versionHash = "hq__QmNjMeY9B9M6T7sHBcdnryMeyHC5BkztC3aATHkSnbfj79";

    testFile1 = RandomBytes(testFileSize);
    testFile2 = RandomBytes(testFileSize);
    testHash = RandomString(10);
  });

  describe("Initialize From Configuration Url", () => {
    test("Initialization", async () => {
      const bootstrapClient = await ElvClient.FromConfigurationUrl({configUrl: "http://main.net955304.contentfabric.io/config"});

      expect(bootstrapClient).toBeDefined();
      expect(bootstrapClient.fabricURIs).toBeDefined();
      expect(bootstrapClient.fabricURIs.length).toBeGreaterThan(0);
      expect(bootstrapClient.ethereumURIs).toBeDefined();
      expect(bootstrapClient.ethereumURIs.length).toBeGreaterThan(0);
      expect(bootstrapClient.stateChannelURIs).toBeDefined();
      expect(bootstrapClient.stateChannelURIs.length).toBeGreaterThan(0);
    });
  });

  describe("Access Groups", () => {
    test("Create Access Group", async () => {
      accessGroupAddress = await client.CreateAccessGroup();
      expect(accessGroupAddress).toBeDefined();
    });

    test("Get Access Group Owner", async () => {
      const accessGroupOwner = await client.AccessGroupOwner({contractAddress: accessGroupAddress});
      expect(accessGroupOwner).toBeDefined();
      expect(client.utils.FormatAddress(accessGroupOwner)).toEqual(client.utils.FormatAddress(client.signer.address));
    });

    test("Access Group Members", async () => {
      await client.AddAccessGroupMember({
        contractAddress: accessGroupAddress,
        memberAddress: client.signer.address
      });

      await client.RemoveAccessGroupMember({
        contractAddress: accessGroupAddress,
        memberAddress: client.signer.address
      });

      await client.AddAccessGroupManager({
        contractAddress: accessGroupAddress,
        memberAddress: client.signer.address.replace("0x", "")
      });

      await client.RemoveAccessGroupManager({
        contractAddress: accessGroupAddress,
        memberAddress: client.signer.address
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
      //const image = BufferToArrayBuffer(fs.readFileSync("test/images/test-image1.png"));

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
      expect(libraryTypes[typeHash]).toBeDefined();

      await client.RemoveLibraryContentType({libraryId, typeName});

      libraryTypes = await client.LibraryContentTypes({libraryId});
      expect(libraryTypes).toEqual({});

      // Add/remove type by type ID
      await client.AddLibraryContentType({libraryId, typeId});

      libraryTypes = await client.LibraryContentTypes({libraryId});
      expect(libraryTypes[typeHash]).toBeDefined();

      await client.RemoveLibraryContentType({libraryId, typeId});

      libraryTypes = await client.LibraryContentTypes({libraryId});
      expect(libraryTypes).toEqual({});
    });
  });

  describe("Content Objects", () => {
    test("Create Content Object", async () => {
      const testMetadata = {
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
          meta: testMetadata
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
      const objects = await client.ContentObjects({libraryId});

      expect(objects).toBeDefined();

      const object = objects.find(object => object.id === objectId);
      expect(object).toBeDefined();
      expect(object.versions[0].hash).toEqual(versionHash);
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

    test("Copy Content Object", async () => {
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
    test("Upload Part", async () => {
      const writeToken = (await client.EditContentObject({libraryId, objectId})).write_token;

      // Upload first part as a single chunk
      const wholeCallback = jest.fn();
      const wholeUploadResponse = await client.UploadPart({
        libraryId,
        objectId,
        writeToken,
        data: testFile1,
        chunkSize: testFileSize,
        callback: wholeCallback
      });

      expect(wholeCallback).toBeCalledTimes(2);
      expect(wholeUploadResponse).toBeDefined();

      partInfo.whole = wholeUploadResponse.part.hash;

      // Upload second file in 10 chunks
      const chunkedCallback = jest.fn();
      const chunkedUploadResponse = await client.UploadPart({
        libraryId,
        objectId,
        writeToken,
        data: testFile2,
        chunkSize: testFileSize / 10,
        callback: chunkedCallback
      });
      expect(chunkedCallback).toBeCalledTimes(11);
      expect(chunkedUploadResponse).toBeDefined();

      partInfo.chunked = chunkedUploadResponse.part.hash;

      await client.FinalizeContentObject({libraryId, objectId, writeToken});
    });

    test("Download Parts", async () => {
      const wholePart = await client.DownloadPart({libraryId, objectId, partHash: partInfo.whole, format: "arrayBuffer"});
      expect(new Uint8Array(wholePart).toString()).toEqual(new Uint8Array(testFile1).toString());
      expect(new Uint8Array(wholePart).toString()).not.toEqual(new Uint8Array(testFile2).toString());

      const chunkedPart = await client.DownloadPart({libraryId, objectId, partHash: partInfo.chunked, format: "arrayBuffer"});
      expect(new Uint8Array(chunkedPart).toString()).toEqual(new Uint8Array(testFile2).toString());
    });

    test("List Parts", async () => {
      const parts = await client.ContentParts({libraryId, objectId});

      expect(parts.find(part => part.hash === partInfo.whole)).toBeDefined();
      expect(parts.find(part => part.hash === partInfo.chunked)).toBeDefined();
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
          path: "testDirectory",
          type: "directory"
        },
        {
          path: "testDirectory/File 1",
          type: "file",
          size: testFileSize,
          data: testFile1
        },
        {
          path: "testDirectory/File 2",
          type: "file",
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
      expect(new Uint8Array(fileData1).toString()).toEqual(new Uint8Array(fileInfo[1].data).toString());
      expect(new Uint8Array(fileData1).toString()).not.toEqual(new Uint8Array(fileInfo[2].data).toString());

      const fileData2 = await client.DownloadFile({libraryId, objectId, filePath: "testDirectory/File 2", format: "arrayBuffer"});
      expect(new Uint8Array(fileData2).toString()).toEqual(new Uint8Array(fileInfo[2].data).toString());
    });

    test("List Files", async () => {
      const files = await client.ListFiles({libraryId, objectId});
      expect(files.testDirectory).toBeDefined();
      expect(files.testDirectory["File 1"]).toBeDefined();
      expect(files.testDirectory["File 2"]).toBeDefined();
    });
  });

  describe("Access Requests", () => {
    test("Cached Access Transactions", async () => {
      const transactionHash = await client.CachedAccessTransaction({libraryId, objectId});
      expect(transactionHash).toBeDefined();

      client.ClearCache({objectId});
      const noTransaction = await client.CachedAccessTransaction({libraryId, objectId});
      expect(noTransaction).not.toBeDefined();

      client.ClearCache({libraryId});
      client.ClearCache({});
      expect(client.authClient.accessTransactions).toEqual({
        spaces: {},
        libraries: {},
        objects: {}
      });
      expect(client.authClient.modifyTransactions).toEqual({
        spaces: {},
        libraries: {},
        objects: {}
      });
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
      expect(accessCode).toEqual(0);
      expect(accessCharge).toEqual("0.5");

      const initialBalance = parseFloat(await accessClient.GetBalance({address: accessClient.signer.address}));
      await accessClient.ContentObjectMetadata({libraryId, objectId});
      const finalBalance = parseFloat(await accessClient.GetBalance({address: accessClient.signer.address}));

      expect(finalBalance < (initialBalance - 0.5));
    });

    test("Make Manual Access Request", async () => {
      const accessRequest = await client.AccessRequest({
        libraryId,
        objectId,
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
    test("Verify Content Version", async () => {
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

      if(authorization) {
        expect(url.query(true).authorization).toBeDefined();
      } else {
        expect(url.query(true).authorization).not.toBeDefined();
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

    test("Bitcode Method URL", async () => {
      const callUrl = await client.BitcodeMethodUrl({libraryId, objectId, method: "image"});
      validateUrl(callUrl, UrlJoin("/qlibs", libraryId, "q", objectId, "call", "image"));

      const noAuthUrl = await client.BitcodeMethodUrl({libraryId, objectId, method: "image", noAuth: true});
      validateUrl(noAuthUrl, UrlJoin("/qlibs", libraryId, "q", objectId, "call", "image"), {}, false);
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

    /*

    test("Delete Content Version", async () => {
      await client.DeleteContentVersion({libraryId, objectId, versionHash});

      try {
        await client.ContentObject({libraryId, objectId, versionHash});
        expect(undefined).toBeDefined();
      } catch(error) {
        expect(error.status).toEqual(404);
      }
    });

    test("Delete Content Object", async () => {
      await client.DeleteContentObject({libraryId, objectId});

      try {
        await client.ContentObject({libraryId, objectId});
        expect(undefined).toBeDefined();
      } catch(error) {
        expect(error.status).toEqual(404);
      }
    });

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



































