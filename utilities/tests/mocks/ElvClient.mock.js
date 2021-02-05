const objectPath = require("object-path");
const R = require("ramda");
const simple = require("simple-mock");

const {loadFixture} = require("../helpers/fixtures");

// ==========================================
// Stub local var
// ==========================================

let calls = [];

// ==========================================
// Exported methods: activate / remove stub
// ==========================================

const removeStubs = () => simple.restore();

const stubClient = (clientConcern) => {
  simple.mock(clientConcern, "get").resolveWith(MockClient);
  return Stub;
};


// ==========================================
// Stub query/control methods
// ==========================================

const callHistory = () => R.clone(calls);

const callHistoryMismatches = list => {
  const result = [];
  const history = callHistory();
  if(list.length !== history.length) result.push(`call count mismatch - expected ${list.length}, actual ${history.length}`);
  for(let i = 0; i < list.length; i++) {
    const matchString = list[i];
    const callDesc = (history.length > i ? history[i] : "");
    if(!callDesc.includes(matchString)) result.push(`mismatch on call #${i+1}, ${matchString} not found in ${callDesc}`);
  }
  if(history.length > list.length) {
    for(let i = list.length; i < history.length; i++) {
      result.push(`Unexpected call #${i+1}, ${history[i]}`);
    }
  }

  if(result.length > 0){
    // eslint-disable-next-line no-console
    console.warn(JSON.stringify(result,null,2));
  }
  return result;
};

const resetHistory = () => calls = [];

// ==========================================
// mocked ElvClient methods
// ==========================================

const AddContentObjectGroupPermission = async (args) => {
  calls.push("AddContentObjectGroupPermission: " + JSON.stringify(args));
};

const CallBitcodeMethod = async (args) => {
  calls.push("CallBitcodeMethod: " + JSON.stringify(args));
  const {method, writeToken} = args;
  if(!writeTokens.hasOwnProperty(writeToken)) throw Error(`writeToken ${writeToken} not found`);

  if(method === "/media/production_master/init") {

    writeTokens[writeToken].draft.metadata = R.mergeDeepRight(
      writeTokens[writeToken].draft.metadata,
      {
        production_master:
          {
            variants:
              {
                default:
                  {
                    streams: {
                      audio: {
                        default_for_media_type: false,
                        label: "",
                        language: "",
                        mapping_info: "",
                        sources: [
                          {
                            files_api_path: "MyFile.mov",
                            stream_index: 1
                          }
                        ]
                      },
                      video: {
                        default_for_media_type: false,
                        label: "",
                        language: "",
                        mapping_info: "",
                        sources: [
                          {
                            files_api_path: "MyFile.mov",
                            stream_index: 0
                          }
                        ]
                      }
                    }
                  }
              }
          }
      }
    );
    return {errors: [], warnings: []};
  }
};

const ContentLibrary = async (args) => {
  calls.push("ContentLibrary: " + JSON.stringify(args));
  const {libraryId} = args;
  if(libraries.hasOwnProperty(libraryId)) {
    const lib = libraries[libraryId];
    return {
      id: libraryId,
      qid: lib.qid,
      meta: lib.contractMetadata
    };
  } else {
    throw Error(`Unable to determine contract info for ${libraryId}`);
  }
};


const ContentObject = async (args) => {
  calls.push("ContentObject: " + JSON.stringify(args));
  // eslint-disable-next-line no-unused-vars
  const {libraryId, objectId, versionHash} = args;
  if(objects.hasOwnProperty(objectId)) {
    const obj = objects[objectId];
    const ver = obj.versions[obj.versions.length - 1];
    return {
      id: objectId,
      hash: ver.version_hash,
      type: ver.type,
      qlib_id: obj.libraryId
    };
  } else {
    throw Error(`Unable to find object ${objectId}`);
  }
};

const ContentObjectLibraryId = async (args) => {
  calls.push("ContentObjectLibraryId: " + JSON.stringify(args));
  const {objectId} = args;
  if(objects.hasOwnProperty(objectId)) {
    const obj = objects[objectId];
    return obj.libraryId;
  } else {
    throw Error(`Unable to find object ${objectId}`);
  }
};

const ContentObjectMetadata = async (args) => {
  calls.push("ContentObjectMetadata: " + JSON.stringify(args));
  // eslint-disable-next-line no-unused-vars
  const {libraryId, objectId, versionHash, writeToken} = args;
  if(objects.hasOwnProperty(objectId)) {
    const obj = objects[objectId];
    const ver = obj.versions[obj.versions.length - 1];
    if(args.metadataSubtree) {
      return objectPath.get(ver.metadata, args.metadataSubtree.split("/").slice(1));
    } else {
      return ver.metadata;
    }
  } else {
    throw Error(`Unable to find object ${objectId}`);
  }
};

const ContentLibraries = async (args) => {
  calls.push("ContentLibraries: " + JSON.stringify(args));
  return Object.keys(libraries);
};

const ContentObjects = async (args) => {
  calls.push("ContentObjects: " + JSON.stringify(args));

  const contentObjectsReplyVersion = R.curry((libId, objId, versionInfo) => {
    return {
      hash: versionInfo.version_hash,
      id: objId,
      meta: versionInfo.metadata,
      qlib_id: libId,
      type: versionInfo.type
    };
  });

  const contentObjectsReply = R.curry((libId, objId) => {
    if(!objects.hasOwnProperty(objId)) throw Error(`objId ${objId} not found`);
    return {
      id: objId,
      versions: objects[objId].versions.map(contentObjectsReplyVersion(libId, objId))
    };
  });

  const {libraryId} = args;
  return {contents: libraries[libraryId].objects.map(contentObjectsReply(libraryId))};
};

const ContentParts = async (args) => {
  calls.push("ContentParts: " + JSON.stringify(args));
  const {objectId} = args;
  if(!objects.hasOwnProperty(objectId)) throw Error(`objId ${objectId} not found`);
  return objects[objectId].versions[0].parts.map((x) => Object({hash: x.part_hash, size: x.size}));
};

const ContentType = async (args) => {
  calls.push("ContentType: " + JSON.stringify(args));
  let fieldName;
  if(args.name) fieldName = "name";
  if(args.typeId) fieldName = "typeId";
  if(args.versionHash) fieldName = "versionHash";
  const value = args[fieldName];
  switch(fieldName) {
    case "name":
      throw Error("mock does not support content type lookup by name yet");
    case "typeId":
      if(!objects.hasOwnProperty(value)) throw Error(`objId ${value} not found`);
      return {hash: objects[value].versions[0].versionHash};
    case "versionHash":
      throw Error("mock does not support content type lookup by hash yet");
    default:
      throw Error("mock.ContentType() - unrecognized fieldName");
  }
};

const CreateABRMezzanine = async (args) => {
  calls.push("CreateABRMezzanine: " + JSON.stringify(args));
  return {
    errors: [],
    id: "iq__dummy_new_id",
    warnings: [],
    write_token: "tqw_001"
  };
};

const CreateContentLibrary = async (args) => {
  calls.push("CreateContentLibrary: " + JSON.stringify(args));
  return "ilib_dummy_new_lib";
};


const CreateProductionMaster = async (args) => {
  calls.push("CreateProductionMaster: " + JSON.stringify(args));
  return {
    errors: [],
    hash: "hq__001xxx002xxx001xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    id: "iq__001xxx002xxxxxxxxxxxxxxxxxxx",
    warnings: []
  };
};

const DeleteContentObject = async (args) => {
  calls.push("DeleteContentObject: " + JSON.stringify(args));
};

const EditContentObject = async (args) => {
  calls.push("EditContentObject: " + JSON.stringify(args));
  const {objectId} = args;
  if(!objects.hasOwnProperty(objectId)) throw Error(`objId ${objectId} not found`);
  const obj = objects[objectId];
  if(obj.versions.length === 0) throw Error(`objId ${objectId} has no versions`);
  const ver = obj.versions.slice(-1)[0];
  writeTokens["tqw_001"] = {objectId, versionHash: ver.version_hash, draft: R.clone(ver)};
  writeTokens["tqw_001"].draft.version_hash = undefined;
  return {write_token: "tqw_001"};
};

const FinalizeContentObject = async (args) => {
  calls.push("FinalizeContentObject: " + JSON.stringify(args));
  const {writeToken} = args;
  if(!writeTokens.hasOwnProperty(writeToken)) throw Error(`writeToken ${writeToken} not found`);
  writeTokens[writeToken].draft.version_hash = "hq__fake_new_hash";
  objects[writeTokens[writeToken].objectId].versions.push(writeTokens[writeToken].draft);
  return {hash: writeTokens[writeToken].draft.version_hash};
};

const LROStatus = async (args) => {
  const lroStatus = loadFixture("lro.status.finished.good.json");
  calls.push("LROStatus: " + JSON.stringify(args));
  return lroStatus;
};

const ReplaceMetadata = async (args) => {
  calls.push("ReplaceMetadata: " + JSON.stringify(args));
  const {writeToken} = args;
  if(!writeTokens.hasOwnProperty(writeToken)) throw Error(`writeToken ${writeToken} not found`);
};

const SetVisibility = async (args) => {
  calls.push("SetVisibility: " + JSON.stringify(args));
};

const StartABRMezzanineJobs = async (args) => {
  calls.push("StartABRMezzanineJobs: " + JSON.stringify(args));
  return {
    errors: [],
    id: "iq__dummy_new_id",
    warnings: [],
    write_token: "tqw_001"
  };
};

const UploadFiles = async (args) => {
  calls.push("UploadFiles: " + JSON.stringify(args));
};

const MockClient = {
  AddContentObjectGroupPermission,
  CallBitcodeMethod,
  ContentLibraries,
  ContentLibrary,
  ContentObject,
  ContentObjectLibraryId,
  ContentObjectMetadata,
  ContentObjects,
  ContentParts,
  ContentType,
  CreateABRMezzanine,
  CreateContentLibrary,
  CreateProductionMaster,
  DeleteContentObject,
  EditContentObject,
  FinalizeContentObject,
  LROStatus,
  ReplaceMetadata,
  SetVisibility,
  StartABRMezzanineJobs,
  UploadFiles
};

const Stub = {
  callHistory,
  callHistoryMismatches,
  resetHistory
};

// ==========================================
// Mock node data
// ==========================================

const libraries = {
  ilib001xxxxxxxxxxxxxxxxxxxxxxxx: {
    contractMetadata: {},
    qid: "iq__001xxxxxxxxxxxxxxxxxxxxxxxx",
    objects: ["iq__001xxx001xxxxxxxxxxxxxxxxxxx"]
  },
  ilib002xxxxxxxxxxxxxxxxxxxxxxxx: {
    contractMetadata: {},
    qid: "iq__002xxxxxxxxxxxxxxxxxxxxxxxx",
    objects: ["iq__002xxx001xxxxxxxxxxxxxxxxxxx"]
  }
};

const objects = {
  iq__001xxxxxxxxxxxxxxxxxxxxxxxx: {  // library 001 object (masters)
    libraryId: "ilib001xxxxxxxxxxxxxxxxxxxxxxxx",
    versions: [
      {
        metadata: {
          commit: {
            author: "dev-tenant-elv-admin",
            author_address: "0x0000000000000000000000000000000000000000",
            message: "",
            timestamp: "2021-02-01T22:13:51.994Z"
          },
          name: "dev-tenant - Title Masters",
          public: {
            name: "dev-tenant - Title Masters"
          }
        },
        parts: [],
        type: "",
        version_hash: "hq__001xxxxxxxxx001xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
      }
    ]
  },
  iq__001xxx001xxxxxxxxxxxxxxxxxxx: {
    libraryId: "ilib001xxxxxxxxxxxxxxxxxxxxxxxx",
    versions: [
      {
        metadata: {public: {name: "mock generic object 001 version 001"}},
        parts: [
          {
            part_hash: "hqp_001xxx001xxx001xxx001xxxxxxxxxxxxxxxxxxxxxxxxxxx",
            size: 100
          }
        ],
        type: "",
        version_hash: "hq__001xxx001xxx001xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
      }
    ]
  },
  iq__001xxx002xxxxxxxxxxxxxxxxxxx: {
    libraryId: "ilib001xxxxxxxxxxxxxxxxxxxxxxxx",
    versions: [
      {
        metadata: {
          production_master: {
            variants: {
              default: {
                streams: {
                  audio: {},
                  video: {}
                }
              }
            }
          },
          public: {name: "mock master object 002 version 001"}},
        parts: [
          {
            part_hash: "hqp_001xxx002xxx001xxx001xxxxxxxxxxxxxxxxxxxxxxxxxxx",
            size: 100
          }
        ],
        type: "",
        version_hash: "hq__001xxx002xxx001xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
      }
    ]
  },
  iq__002xxxxxxxxxxxxxxxxxxxxxxxx: {  // library 002 object - Content Types
    libraryId: "ilib002xxxxxxxxxxxxxxxxxxxxxxxx",
    versions: [
      {
        metadata: {
          public: {
            name: "Content Types"
          }
        },
        parts: [],
        type: "",
        version_hash: "hq__002xxxxxxxxx001xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
      }
    ]
  },
  iq__002xxx001xxxxxxxxxxxxxxxxxx: {  // master type
    libraryId: "ilib002xxxxxxxxxxxxxxxxxxxxxxxx",
    versions: [
      {
        metadata: {
          public: {
            name: "dev-tenant - Title Master"
          }
        },
        parts: [],
        type: "",
        version_hash: "hq__002xxx001xxx001xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
      }
    ]
  },
  iq__002xxx002xxxxxxxxxxxxxxxxxx: {  // mez type
    libraryId: "ilib002xxxxxxxxxxxxxxxxxxxxxxxx",
    versions: [
      {
        metadata: {
          public: {
            name: "dev-tenant - Title"
          }
        },
        parts: [],
        type: "",
        version_hash: "hq__002xxx002xxx001xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
      }
    ]
  }
};

const writeTokens = {};




module.exports = {removeStubs, stubClient};