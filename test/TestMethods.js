let TestQueries = async (client, signer) => {
  //let output = "";
  try {
    let libraryIds = await client.ContentLibraries();

    console.log("LIBRARIES ");
    console.log(JSON.stringify(libraryIds, null, 2));

    console.log("CREATING LIBRARY ");

    const libraryId = await (
      client.CreateContentLibrary({
        name: "New library",
        description: "Library Description",
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
        },
        signer
      })
    );

    console.log("LIBRARY CREATED: " + libraryId);

    const libraryResponse = await(
      client.ContentLibrary({libraryId})
    );
    console.log("LIBRARY RESPONSE: ");
    console.log(JSON.stringify(libraryResponse, null, 2));

    const libraryContentObject = (await client.ContentObjects({libraryId: libraryId})).contents[0];
    console.log("LIBRARY CONTENT OBJECT: ");
    console.log(JSON.stringify(libraryContentObject, null, 2));

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

    let createResponse = await (
      client.CreateContentObject({
        libraryId,
        options: {
          meta: {
            "meta": "data",
            "to_delete": {
              "value": "value"
            },
            "subtree": {
              "to_delete": "value"
            }
          }
        },
        signer
      })
    );

    let objectId = createResponse.id;

    console.log("CREATED " + objectId);

    console.log("CREATING PART...");

    let partResponse = await (
      client.UploadPart({
        libraryId,
        objectId,
        writeToken: createResponse.write_token,
        data: "some form of data"
      })
    );

    let partHash = partResponse.part.hash;

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
    let metadataResponse = await(
      client.ContentObjectMetadata({
        libraryId,
        objectId
      })
    );

    console.log(JSON.stringify(metadataResponse, null, 2));

    console.log("EDITING " + objectId + "...");
    let editResponse = await client.EditContentObject({
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

    /*
    console.log("DELETING METADATA...");

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
    */

    console.log("FINALIZING EDIT... ");

    await (
      client.FinalizeContentObject({
        libraryId,
        objectId,
        writeToken: editResponse.write_token
      })
    );

    console.log("FINALIZED EDIT " + objectId);


    let contentObjects = await client.ContentObjects({libraryId: libraryId});

    console.log("LIBRARY CONTENTS " + libraryId);
    console.log(JSON.stringify(contentObjects, null, 2));

    console.log("CONTENT OBJECT: ");
    let contentObjectData = await(
      client.ContentObject({
        libraryId,
        objectId
      })
    );

    console.log(JSON.stringify(contentObjectData, null, 2));

    let versionHash = contentObjectData.hash;

    console.log("CONTENT OBJECT METADATA: ");
    let contentObjectMetadata = await(
      client.ContentObjectMetadata({
        libraryId,
        objectId,
        versionHash
      })
    );

    console.log(JSON.stringify(contentObjectMetadata, null, 2));

    console.log("CONTENT OBJECT VERSIONS: ");
    let contentObjectVersions = await(
      client.ContentObjectVersions({
        libraryId,
        objectId
      })
    );

    console.log(JSON.stringify(contentObjectVersions, null, 2));


    let contentParts = await client.ContentParts({libraryId: libraryId, versionHash});

    console.log("CONTENT PARTS " + objectId);
    console.log(JSON.stringify(contentParts, null, 2));

    console.log("DOWNLOADING PART... ");

    let downloadResponse = await client.DownloadPart({
      libraryId,
      objectId,
      versionHash,
      partHash,
      format: "text"
    });

    console.log("DOWNLOADED: ");
    console.log(downloadResponse);

    console.log("NAMING... ");

    await client.SetObjectByName({
      name: "test",
      libraryId,
      objectId
    });

    console.log("RETRIEVING OBJECT BY NAME...");

    let nameResponse = await client.GetObjectByName({
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

    let proofs = await client.Proofs({libraryId: libraryId, objectId, versionHash, partHash: partHash});

    console.log("PROOFS: ");
    console.log(JSON.stringify(proofs, null, 2));

    let qparts = await (
      client.QParts({
        objectId,
        partHash: versionHash.replace("hq__", "hqp_"),
        format: "text"
      })
    );

    console.log("QPARTS: ");
    console.log(qparts);

    console.log("DELETING PART... ");

    let partEditResponse = await client.EditContentObject({
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

    console.log("DELETED");

    console.log("URLS: ");
    console.log(client.FabricUrl({libraryId}));
    console.log(client.FabricUrl({libraryId, objectId}));
    console.log(client.FabricUrl({libraryId, objectId, partHash}));
    console.log(client.FabricUrl({libraryId, objectId, partHash, queryParams: {query: "params", params: "query"}}));

    let contentVerification = await (
      client.VerifyContentObject({libraryId, objectId, partHash: versionHash})
        .then(response => {
          return response;
        })
    );

    console.log("UTILS: ");
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
    console.log("BYTES32: " + bytes32Hash);

    // Ensure ToBytes32 is correct
    const bytes32Test = client.utils.ToBytes32({string: "Hello World!"});
    const bytes32Expected = "0x48656c6c6f20576f726c64210000000000000000000000000000000000000000";
    if(bytes32Test !== bytes32Expected) {
      throw Error("Bytes 32 mismatch: " + bytes32Test + " : " + bytes32Expected);
    }

    console.log("CONTENT VERIFICATION: " + versionHash);
    console.log(JSON.stringify(contentVerification, null, 2));
  } catch(error) {
    console.error(error);
  }
};


if(typeof window === "undefined") {
  exports.TestQueries = TestQueries;
}
