const runningInBrowser = typeof window !== "undefined";

let fs, path;
if(!runningInBrowser) {
  fs = require("fs");
  path = require("path");
}

const TestQueries = async (client) => {
  //let output = "";
  try {
    console.log("CURRENT ACCOUNT: " + await client.CurrentAccountAddress() + "\n");

    console.log("AUTHORIZING CONTENT SPACE...\n");

    const contentTypes = await client.ContentTypes();

    console.log("CONTENT TYPES: ");
    console.log(JSON.stringify(contentTypes, null, 2) + "\n");

    const libraryIds = await client.ContentLibraries();

    console.log("LIBRARIES ");
    console.log(JSON.stringify(libraryIds, null, 2));

    console.log("CREATING LIBRARY ");

    let image;
    if(!runningInBrowser) {
      image = fs.readFileSync(path.join(__dirname, "images/logo-dark.png"));
    }

    const libraryId = await (
      client.CreateContentLibrary({
        name: "New library",
        description: "Library Description",
        image,
        publicMetadata: {
          public: {
            meta: "data"
          }, toReplace: {
            will: "be replaced"
          }
        },
        privateMetadata: {
          sshhhh: {
            its: "a secret"
          }
        }
      })
    );

    console.log("LIBRARY CREATED: " + libraryId);

    const libraryOwner = await client.ContentLibraryOwner({libraryId});
    console.log("LIBRARY OWNER: " + libraryOwner);

    const libraryResponse = await(
      client.ContentLibrary({libraryId})
    );
    console.log("LIBRARY RESPONSE: ");
    console.log(JSON.stringify(libraryResponse, null, 2));

    const libraryContentObject = (await client.ContentObjects({libraryId: libraryId})).contents[0];
    console.log("LIBRARY CONTENT OBJECT: ");
    console.log(JSON.stringify(libraryContentObject, null, 2));


    // Clear auth cache to force an accessRequest to the library on next call
    console.log("\nFORCING REAUTHORIZATION TO LIBRARY ON NEXT CALL\n");
    client.authClient && client.authClient.ClearCache({libraryId});


    console.log("UPDATING PUBLIC LIBRARY METADATA...");
    await client.ReplacePublicLibraryMetadata({
      libraryId,
      metadataSubtree: "toReplace",
      metadata: { new: "value"}
    });

    const libraryMetadata = await client.PublicLibraryMetadata({libraryId});

    console.log("NEW PUBLIC LIBRARY METADATA:");
    console.log(JSON.stringify(libraryMetadata, null, 2) +"");


    console.log("CREATING OBJECT... ");

    const createResponse = await (
      client.CreateContentObject({
        libraryId,
        options: {
          type: "avmaster2000",
          meta: {
            "meta": "data",
            "to_delete": {
              "value": "value"
            },
            "subtree": {
              "to_delete": "value"
            }
          }
        }
      })
    );

    const objectId = createResponse.id;

    console.log("CREATED " + objectId);

    const objectOwner = await client.ContentObjectOwner({objectId});
    console.log("OBJECT OWNER: " + objectOwner);

    console.log("CREATING PART...");

    const partResponse = await (
      client.UploadPart({
        libraryId,
        objectId,
        writeToken: createResponse.write_token,
        data: "some form of data"
      })
    );

    const partHash = partResponse.part.hash;

    console.log("CREATED " + partHash);

    console.log("FINALIZING OBJECT... ");

    await (
      client.FinalizeContentObject({
        libraryId,
        objectId,
        writeToken: createResponse.write_token
      })
    );

    console.log("FINALIZED " + objectId);

    console.log("CONTENT OBJECT METADATA: ");
    const metadataResponse = await(
      client.ContentObjectMetadata({
        libraryId,
        objectId
      })
    );

    console.log(JSON.stringify(metadataResponse, null, 2));

    console.log("EDITING " + objectId + "...");
    const editResponse = await client.EditContentObject({
      libraryId,
      objectId,
      options: {
        meta: {
          "meta": "changed",
          "sub": {
            "tree": "value"
          }
        }
      }
    });

    console.log(JSON.stringify(editResponse, null, 2));

    console.log("MERGING METADATA...");

    await client.MergeMetadata({
      libraryId,
      objectId,
      writeToken: editResponse.write_token,
      metadata: { newField: "newValue"}
    });

    console.log("MERGED TOP LEVEL METADATA ");

    await client.MergeMetadata({
      libraryId,
      objectId,
      writeToken: editResponse.write_token,
      metadataSubtree: "sub",
      metadata: { newField: "newValue"}
    });

    console.log("MERGED SUBTREE METADATA ");

    console.log("\nDELETING METADATA...");

    await client.DeleteMetadata({
      libraryId,
      objectId,
      writeToken: editResponse.write_token,
      metadataSubtree: "to_delete"
    });

    await client.DeleteMetadata({
      libraryId,
      objectId,
      writeToken: editResponse.write_token,
      metadataSubtree: "subtree/to_delete",
    });

    console.log("DELETED METADATA ");

    console.log("\nFINALIZING EDIT... ");

    await (
      client.FinalizeContentObject({
        libraryId,
        objectId,
        writeToken: editResponse.write_token
      })
    );

    console.log("FINALIZED EDIT " + objectId);


    const contentObjects = await client.ContentObjects({libraryId: libraryId});

    console.log("\nLIBRARY CONTENTS " + libraryId);
    console.log(JSON.stringify(contentObjects, null, 2));

    console.log("\nCONTENT OBJECT: ");
    const contentObjectData = await(
      client.ContentObject({
        libraryId,
        objectId
      })
    );

    console.log(JSON.stringify(contentObjectData, null, 2));

    // Clear auth cache to force an accessRequest to the object
    console.log("\nFORCING REAUTHORIZATION TO OBJECT ON NEXT CALL\n");
    client.authClient && client.authClient.ClearCache({objectId});

    const versionHash = contentObjectData.hash;

    console.log("\nCONTENT OBJECT METADATA: ");
    const contentObjectMetadata = await(
      client.ContentObjectMetadata({
        libraryId,
        objectId,
        versionHash
      })
    );

    console.log(JSON.stringify(contentObjectMetadata, null, 2));

    console.log("\nCONTENT OBJECT VERSIONS: ");
    const contentObjectVersions = await(
      client.ContentObjectVersions({
        libraryId,
        objectId
      })
    );

    console.log(JSON.stringify(contentObjectVersions, null, 2));


    const contentParts = await client.ContentParts({libraryId: libraryId, versionHash});

    console.log("\nCONTENT PARTS " + objectId);
    console.log(JSON.stringify(contentParts, null, 2));

    console.log("DOWNLOADING PART... ");

    const downloadResponse = await client.DownloadPart({
      libraryId,
      objectId,
      versionHash,
      partHash,
      format: "text"
    });

    console.log("DOWNLOADED: ");
    console.log(downloadResponse);

    console.log("\nNAMING... ");

    await client.SetObjectByName({
      name: "test",
      libraryId,
      objectId
    });

    console.log("RETRIEVING OBJECT BY NAME...");

    const nameResponse = await client.GetObjectByName({
      name: "test"
    });
    console.log(JSON.stringify(nameResponse, null, 2));

    console.log("DELETING NAME...");
    await client.DeleteName({
      name: "test"
    });

    try {
      await client.GetObjectByName({
        name: "test"
      });
    } catch (e) {
      if(e.status === 404) {
        console.log("SUCCESSFULLY DELETED NAME");
      } else {
        throw Error("FAILED TO DELETE NAME: " + JSON.stringify(e));
      }
    }

    const proofs = await client.Proofs({libraryId: libraryId, objectId, versionHash, partHash: partHash});

    console.log("\nPROOFS: ");
    console.log(JSON.stringify(proofs, null, 2));

    const qparts = await (
      client.QParts({
        objectId,
        partHash: versionHash.replace("hq__", "hqp_"),
        format: "text"
      })
    );

    console.log("\nQPARTS: ");
    console.log(qparts);

    console.log("\nDELETING PART... ");

    const partEditResponse = await client.EditContentObject({
      libraryId,
      objectId
    });

    await client.DeletePart({
      libraryId,
      objectId,
      writeToken: partEditResponse.write_token,
      partHash
    });

    await client.FinalizeContentObject({
      libraryId,
      objectId,
      writeToken: partEditResponse.write_token
    });

    console.log("DELETED\n");

    const newPartsResponse = await client.ContentParts({
      libraryId,
      objectId,
      versionHash
    });

    console.log("NEW PARTS: ");

    console.log(JSON.stringify(newPartsResponse, null, 2));

    console.log("URLS: ");
    console.log(await client.FabricUrl({libraryId}));
    console.log(await client.FabricUrl({libraryId, objectId}));
    console.log(await client.FabricUrl({libraryId, objectId, partHash}));
    console.log(await client.FabricUrl({libraryId, objectId, partHash, queryParams: {query: "params", params: "query"}}));
    console.log("\nNOCACHE URL");
    console.log(await client.FabricUrl({libraryId, objectId, partHash, noCache: true}));

    console.log("\nREP: ");
    console.log(await client.Rep({libraryId, objectId, rep: "image"}));

    console.log("\nCALL BITCODE");
    console.log(await client.CallBitcodeMethod({libraryId, objectId, method: "specialMethod"}));


    const contentVerification = await (
      client.VerifyContentObject({libraryId, objectId, versionHash})
        .then(response => {
          return response;
        })
    );

    console.log("\nUTILS: ");
    console.log("LIBRARY ID: " + libraryId);

    const address = client.utils.HashToAddress({hash: libraryId});
    console.log("TO ADDRESS: " + address);

    const newLibraryId = client.utils.AddressToLibraryId({address});
    console.log("TO HASH: " + newLibraryId);

    if(newLibraryId.toLowerCase() !== libraryId.toLowerCase()) {
      throw Error("Address/hash conversion mismatch: " + libraryId + " : " + newLibraryId);
    }

    const bytes32Hash = client.utils.HashToBytes32({hash: versionHash});
    console.log("CONTENT HASH TO BYTES32 STRING: ");
    console.log("HASH: " + versionHash);
    console.log("BYTES32: " + bytes32Hash + "\n");

    // Ensure ToBytes32 is correct
    const bytes32Test = client.utils.ToBytes32({string: "Hello World!"});
    const bytes32Expected = "0x48656c6c6f20576f726c64210000000000000000000000000000000000000000";
    if(bytes32Test !== bytes32Expected) {
      throw Error("Bytes 32 mismatch: " + bytes32Test + " : " + bytes32Expected);
    }

    console.log("CONTENT VERIFICATION: " + versionHash);
    console.log(JSON.stringify(contentVerification, null, 2) + "\n");

    console.log("\nDELETING CONTENT VERSION: ");
    await client.DeleteContentVersion({
      libraryId,
      objectId,
      versionHash
    });

    console.log("DELETED");

    console.log("\nDELETING CONTENT OBJECT: ");
    await client.DeleteContentObject({
      libraryId,
      objectId
    });

    console.log("DELETED");

    console.log("\nDELETING CONTENT LIBRARY: ");
    await client.DeleteContentLibrary({libraryId});

    console.log("DELETED\n");

    console.log("CREATING ACCESS GROUP: ");
    const accessGroupAddress = await client.CreateAccessGroup();
    console.log(accessGroupAddress + "\n");

    const accessGroupOwner = await client.AccessGroupOwner({contractAddress: accessGroupAddress});
    console.log("ACCESS GROUP OWNER: " + accessGroupOwner);

    console.log("ADDING MEMBER TO ACCESS GROUP: ");
    console.log(await client.AddAccessGroupMember({
      contractAddress: accessGroupAddress,
      memberAddress: "0x71b011B67dc8f5C323A34Cd14b952721D5750C93"
    }));

    console.log("REMOVING MEMBER FROM ACCESS GROUP: ");
    console.log(await client.RemoveAccessGroupMember({
      contractAddress: accessGroupAddress,
      memberAddress: "0x71b011B67dc8f5C323A34Cd14b952721D5750C93"
    }));

    console.log("ADDING MANAGER TO ACCESS GROUP: ");
    console.log(await client.AddAccessGroupManager({
      contractAddress: accessGroupAddress,
      memberAddress: "0x71b011B67dc8f5C323A34Cd14b952721D5750C93"
    }));

    console.log("REMOVING MANAGER FROM ACCESS GROUP: ");
    console.log(await client.RemoveAccessGroupManager({
      contractAddress: accessGroupAddress,
      memberAddress: "0x71b011B67dc8f5C323A34Cd14b952721D5750C93"
    }));

    console.log("DELETING ACCESS GROUP...");
    await client.DeleteAccessGroup({contractAddress: accessGroupAddress});

    console.log("\n\nDONE\n\n");
  } catch(error) {
    console.log(error.stack);
    console.error(error);
  }
};

if(!runningInBrowser) {
  exports.TestQueries = TestQueries;
}
