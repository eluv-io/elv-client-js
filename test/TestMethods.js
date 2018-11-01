let TestQueries = async (client, signer) => {
  let output = "";
  try {
    let libraryIds = await client.ContentLibraries();

    output += "LIBRARIES \n";
    output += JSON.stringify(libraryIds, null, 2) + "\n\n";

    output += "CREATING LIBRARY \n";

    let libraryId = await (
      client.CreateContentLibrary({
        libraryName: "New library",
        libraryDescription: "Library Description",
        signer
      })
    );

    output += "LIBRARY CREATED: " + libraryId + "\n\n";
    let libraryResponse = await(
      client.ContentLibrary({libraryId})
    );
    output += JSON.stringify(libraryResponse, null, 2) + "\n\n";

    output += "CREATING OBJECT... \n";

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
        }
      })
    );

    let objectId = createResponse.id;

    output += "CREATED " + objectId + "\n\n";

    output += "CREATING PART...\n";

    let partResponse = await (
      client.UploadPart({
        libraryId,
        writeToken: createResponse.write_token,
        data: "some form of data"
      })
    );

    let partHash = partResponse.part.hash;

    output += "CREATED " + partHash + "\n\n";

    output += "FINALIZING OBJECT... \n";

    await (
      client.FinalizeContentObject({
        libraryId,
        writeToken: createResponse.write_token
      })
    );

    output += "FINALIZED " + objectId + "\n\n";

    output += "CONTENT OBJECT METADATA: \n";
    let metadataResponse = await(
      client.ContentObjectMetadata({
        libraryId,
        contentHash: objectId
      })
    );

    output += JSON.stringify(metadataResponse, null, 2) + "\n\n";

    output += "EDITING " + objectId + "...\n";
    let editResponse = await client.EditContentObject({
      libraryId: libraryId,
      contentId: objectId,
      options: {
        meta: {
          "meta": "changed",
          "sub": {
            "tree": "value"
          }
        }
      }
    });

    output += JSON.stringify(editResponse, null, 2) + "\n\n";

    output += "MERGING METADATA...\n\n";

    await client.MergeMetadata({
      libraryId,
      writeToken: editResponse.write_token,
      metadata: { newField: "newValue"}
    });

    output += "MERGED TOP LEVEL METADATA \n";

    await client.MergeMetadata({
      libraryId,
      writeToken: editResponse.write_token,
      metadataSubtree: "sub",
      metadata: { newField: "newValue"}
    });

    output += "MERGED SUBTREE METADATA \n\n";

    output += "DELETING METADATA...\n\n";

    await client.DeleteMetadata({
      libraryId,
      writeToken: editResponse.write_token,
      metadataSubtree: "to_delete"
    });

    await client.DeleteMetadata({
      libraryId,
      writeToken: editResponse.write_token,
      metadataSubtree: "subtree/to_delete",
    });

    output += "DELETED METADATA \n\n";


    output += "FINALIZING EDIT... \n";

    await (
      client.FinalizeContentObject({
        libraryId,
        writeToken: editResponse.write_token
      })
    );

    output += "FINALIZED EDIT " + objectId + "\n\n";


    let contentObjects = await client.ContentObjects({libraryId: libraryId});

    output += "LIBRARY CONTENTS " + libraryId + "\n";
    output += JSON.stringify(contentObjects, null, 2) + "\n\n";

    output += "CONTENT OBJECT: \n";
    let contentObjectData = await(
      client.ContentObject({
        libraryId,
        contentHash: objectId
      })
    );

    output += JSON.stringify(contentObjectData, null, 2) + "\n\n";

    let contentHash = contentObjectData.hash;

    output += "CONTENT OBJECT METADATA: \n";
    let contentObjectMetadata = await(
      client.ContentObjectMetadata({
        libraryId,
        contentHash
      })
    );

    output += JSON.stringify(contentObjectMetadata, null, 2) + "\n\n";

    output += "CONTENT OBJECT VERSIONS: \n";
    let contentObjectVersions = await(
      client.ContentObjectVersions({
        libraryId,
        objectId
      })
    );

    output += JSON.stringify(contentObjectVersions, null, 2) + "\n\n";


    let contentParts = await client.ContentParts({libraryId: libraryId, contentHash});

    output += "CONTENT PARTS " + objectId + "\n";
    output += JSON.stringify(contentParts, null, 2) + "\n\n";

    output += "DOWNLOADING PART... \n";

    let downloadResponse = await client.DownloadPart({
      libraryId,
      contentHash,
      partHash,
      format: "text"
    });

    output += "DOWNLOADED: \n";
    output += downloadResponse + "\n\n";

    output += "NAMING... \n";

    await client.SetObjectByName({
      name: "test",
      libraryId,
      objectId
    });

    output += "RETRIEVING OBJECT BY NAME...\n";

    let nameResponse = await client.GetObjectByName({
      name: "test"
    });
    output += JSON.stringify(nameResponse, null, 2) + "\n\n";

    output += "DELETING NAME...\n";
    await client.DeleteName({
      name: "test"
    });

    try {
      await client.GetObjectByName({
        name: "test"
      });
    } catch (e) {
      if(e.status === 404) {
        output += "SUCCESSFULLY DELETED NAME\n\n";
      } else {
        throw Error("FAILED TO DELETE NAME: " + JSON.stringify(e));
      }
    }

    let proofs = await client.Proofs({libraryId: libraryId, contentHash, partHash: partHash});

    output += "PROOFS: \n";
    output += JSON.stringify(proofs, null, 2) + "\n\n";

    let qparts = await (
      client.QParts({
        partHash: contentHash.replace("hq__", "hqp_"),
        format: "text"
      })
    );

    output += "QPARTS: \n";
    output += qparts + "\n\n";

    output += "DELETING PART... \n";

    let partEditResponse = await client.EditContentObject({
      libraryId: libraryId,
      contentId: objectId
    });

    await client.DeletePart({
      libraryId,
      writeToken: partEditResponse.write_token,
      partHash
    });

    await client.FinalizeContentObject({
      libraryId,
      writeToken: partEditResponse.write_token
    });

    output += "DELETED\n\n";


    let contentVerification = await (
      client.VerifyContentObject({libraryId: libraryId, partHash: contentHash})
        .then(response => {
          return response;
        })
    );

    output += "CONTENT VERIFICATION: " + contentHash + "\n";
    output += JSON.stringify(contentVerification, null, 2) + "\n";
  } catch(error) {
    console.log(error);
    output += "ERROR: \n";
    output += JSON.stringify(error, null, 2);
  }

  return output;
};


if(typeof window === "undefined") {
  exports.TestQueries = TestQueries;
}
