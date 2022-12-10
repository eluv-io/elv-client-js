// helpers for scripts that work with one or more offerings

const Metadata = require("./Metadata");

const blueprint = {
  name: "Offerings",
  concerns: [Metadata]
};

const New = context => {

  const all = async  ({libraryId, objectId, versionHash, writeToken}) => {
    return await context.concerns.Metadata.get({
      libraryId,
      objectId,
      versionHash,
      writeToken,
      subtree: "/offerings"
    });
  };

  const list = async ({libraryId, objectId, versionHash, writeToken}) => {
    const offerings = await all({
      libraryId,
      objectId,
      versionHash,
      writeToken
    });
    return Object.keys(offerings);
  };

  // instance interface
  return {
    all,
    list
  };
};

module.exports = {
  blueprint,
  New
};
