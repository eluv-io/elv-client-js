const { AccessClient } = require("./AccessClient");

const ManagementClient = Object.assign(AccessClient, {});

Object.assign(ManagementClient.prototype, require("./client/ABRPublishing"));
Object.assign(ManagementClient.prototype, require("./client/AccessGroups").manage);
Object.assign(ManagementClient.prototype, require("./client/ContentManagement"));
Object.assign(ManagementClient.prototype, require("./client/Files").manage);

exports.ElvClient = ManagementClient;
