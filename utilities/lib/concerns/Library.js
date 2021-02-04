// code related to libraries / library IDs
const R = require("ramda");

const Client = require("./Client");
const Logger = require("./Logger");

const blueprint = {
  name: "Library",
  concerns: [Client, Logger]
};

const stdDrmCert = require("../data/elv.media.drm.fps.cert.json");

const New = context => {
  const logger = context.concerns.Logger;

  const forObject = async ({objectId, versionHash}) => {
    const client = await context.concerns.Client.get();
    let stringPart = " for";
    if(objectId) stringPart += ` object ${objectId}`;
    if(versionHash) stringPart += ` version ${versionHash}`;
    logger.log(`Looking up library ID${stringPart}...`);
    const libId = await client.ContentObjectLibraryId({objectId, versionHash});
    logger.log(`Found library ID: ${libId}`);
    return libId;
  };

  const info = async ({libraryId}) => {
    logger.log(`Getting info for library ${libraryId}...`);
    const client = await context.concerns.Client.get();

    const libResponse = await client.ContentLibrary({libraryId});
    const contractMetadata = libResponse.meta;
    const objectId = libResponse.qid;

    const objResponse = await client.ContentObject({libraryId, objectId});
    const latestHash = objResponse.hash;
    const type = objResponse.type;

    const metadata = await client.ContentObjectMetadata({libraryId, objectId});

    return {
      contractMetadata,
      latestHash,
      metadata,
      objectId,
      type
    };
  };

  // list of libraries
  const list = async () => {
    const logger = context.concerns.Logger;
    logger.log("Getting list of libraries...");
    const client = await context.concerns.Client.get();
    return await client.ContentLibraries();
    // const libIds = await client.ContentLibraries();
    // if(libIds.length > 0) {
    //   logger.log("Getting library names...");
    // }

  };

  // list of objects within a library
  const objectList = async ({filterOptions, libraryId}) => {

    filterOptions = R.mergeDeepRight(
      {limit: 100000},
      filterOptions || {}
    );

    const logger = context.concerns.Logger;
    logger.log("Getting list of objects...");
    const client = await context.concerns.Client.get();
    const reply = await client.ContentObjects({
      libraryId,
      filterOptions
    });
    return reply.contents.map(x => ({objectId: x.id, latestHash: x.versions[0].hash, metadata: x.versions[0].meta}));
  };

  return {forObject, info, list, objectList};
};

module.exports = {
  blueprint,
  New,
  stdDrmCert
};