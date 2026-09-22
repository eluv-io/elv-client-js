// List all info for an object: details, profile, tags, content groups and query fields

const R = require("ramda");

const {NewOpt} = require("./lib/options");

const Utility = require("./lib/Utility");

const Client = require("./lib/concerns/Client");
const ExistObjOrVer = require("./lib/concerns/ExistObjOrVer");
const ArgOutfile = require("./lib/concerns/ArgOutfile");

// Sections that come from the Fabric's tags/groups/query_fields endpoints. A node that does not
// serve them should not prevent the rest of the info from being reported.
const FABRIC_PROPERTIES = [
  {key: "tags", method: "ContentObjectTags", empty: []},
  {key: "groups", method: "ContentObjectGroups", empty: []},
  {key: "query_fields", method: "ContentObjectQueryFields", empty: {}}
];

class ObjectInfo extends Utility {
  blueprint() {
    return {
      concerns: [Client, ExistObjOrVer, ArgOutfile],
      options: [
        NewOpt("details", {
          descTemplate: "Include object details (id, hash, type, size stats). Default: true",
          default: true,
          type: "boolean"
        }),
        NewOpt("profile", {
          descTemplate: "Include the content profile (owner, visibility, status code, KMS, tenant). Default: true",
          default: true,
          type: "boolean"
        }),
        NewOpt("properties", {
          descTemplate: "Include Fabric tags, content groups and query fields. Default: true",
          default: true,
          type: "boolean"
        })
      ]
    };
  }

  async body() {
    const logger = this.logger;
    const client = await this.concerns.Client.get();

    const {libraryId, objectId, versionHash} = await this.concerns.ExistObjOrVer.argsProc();

    const info = {
      object_id: objectId,
      version_hash: versionHash,
      library_id: libraryId
    };

    if(this.args.details || this.args.profile) {
      // ContentObject requests details and profile together
      const contentObject = await client.ContentObject({objectId, versionHash});

      if(this.args.profile) {
        info.profile = contentObject.content_profile;
      }

      if(this.args.details) {
        info.details = R.omit(["content_profile"], contentObject);
      }
    }

    if(this.args.properties) {
      for(const {key, method, empty} of FABRIC_PROPERTIES) {
        try {
          info[key] = await client[method]({objectId, versionHash}) || empty;
        } catch(error) {
          logger.warn(`Unable to retrieve ${key}: ${error.message || error}`);
          info[key] = {error: error.message || String(error)};
        }
      }
    }

    logger.data("object_info", info);

    if(this.args.outfile) {
      this.concerns.ArgOutfile.writeJson({obj: info});
    } else {
      logger.logObject(info);
    }
  }

  header() {
    return `Get info for object ${this.args.versionHash || this.args.objectId}`;
  }
}

if(require.main === module) {
  Utility.cmdLineInvoke(ObjectInfo);
} else {
  module.exports = ObjectInfo;
}
