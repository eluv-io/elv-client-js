var _require = require("./AccessClient"),
    AccessClient = _require.AccessClient;

var ManagementClient = Object.assign(AccessClient, {});
Object.assign(ManagementClient.prototype, require("./client/ABRPublishing"));
Object.assign(ManagementClient.prototype, require("./client/AccessGroups").manage);
Object.assign(ManagementClient.prototype, require("./client/ContentManagement"));
Object.assign(ManagementClient.prototype, require("./client/Files").manage);
exports.ElvClient = ManagementClient;