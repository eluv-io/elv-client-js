const R = require("ramda");
const simple = require("simple-mock");

const libraries = {
  ilib001xxxxxxxxxxxxxxxxxxxxxxxx: {
    objects: {
      iq__001xxx001xxxxxxxxxxxxxxxxxxx: {
        versions: [
          {
            version_hash: "hq__001xxx001xxx001xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
            parts: [
              {
                part_hash: "hqp_001xxx001xxx001xxx001xxxxxxxxxxxxxxxxxxxxxxxxxxx",
                size: 100
              }
            ]
          }
        ]
      }
    }
  }
};

let calls = [];

const callHistory = () => R.clone(calls);

const CreateContentLibrary = async (args) => {
  calls.push("CreateContentLibrary: " + JSON.stringify(args));
  return "ilib_dummy_new_lib";
};

const contentObjectsReplyVersion = R.curry((libId, objId, versionInfo) => {
  return {
    hash: versionInfo.version_hash,
    type: ""
  };
});

const contentObjectsReply = R.curry((libId, [objId, objInfo]) => {
  return {
    id: objId,
    versions: objInfo.versions.map(contentObjectsReplyVersion(libId, objId))
  };
});

const ContentObjects = async (args) => {
  calls.push("ContentObjects: " + JSON.stringify(args));
  const {libraryId} = args;
  return {contents: R.toPairs(libraries[libraryId].objects).map(contentObjectsReply(libraryId))};
};

const DeleteContentObject = async (args) => {
  calls.push("DeleteContentObject: " + JSON.stringify(args));
};

const resetHistory = () => calls = [];

const MockClient = {
  callHistory,
  ContentObjects,
  CreateContentLibrary,
  DeleteContentObject,
  resetHistory
};

const removeStubs = () => simple.restore();

const stubClient = (clientConcern) => {
  simple.mock(clientConcern, "get").resolveWith(MockClient);
  return {callHistory, resetHistory};
};

module.exports = {removeStubs, stubClient};