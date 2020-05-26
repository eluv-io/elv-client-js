/**
 * Methods for accessing and managing access groups
 *
 * @module ElvClient/AccessGroups
 */

/*
const LibraryContract = require("../contracts/BaseLibrary");
const AccessGroupContract = require("../contracts/BaseAccessControlGroup");
const AccessIndexorContract = require("../contracts/AccessIndexor");

 */

const {
  ValidatePresence,
  ValidateLibrary,
  ValidateObject,
  ValidateAddress
} = require("../Validation");

/**
 * Returns the address of the owner of the specified content object
 *
 * @memberof module:ElvClient/AccessGroups
 * @methodGroup Access Groups
 * @namedParams
 * @param {string} libraryId
 *
 * @returns {Promise<string>} - The account address of the owner
 */
exports.AccessGroupOwner = async function({contractAddress}) {
  contractAddress = ValidateAddress(contractAddress);

  this.Log(`Retrieving owner of access group ${contractAddress}`);

  return await this.authClient.Owner({address: contractAddress});
};

/**
 * Get a list of addresses of members of the specified group
 *
 * @memberof module:ElvClient/AccessGroups
 * @methodGroup Access Groups
 * @namedParams
 * @param contractAddress - The address of the access group contract
 *
 * @return {Promise<Array<string>>} - List of member addresses
 */
exports.AccessGroupMembers = async function({contractAddress}) {
  contractAddress = ValidateAddress(contractAddress);

  this.Log(`Retrieving members for group ${contractAddress}`);

  const length = (await this.CallContractMethod({
    contractAddress,
    methodName: "membersNum"
  })).toNumber();

  return await Promise.all(
    [...Array(length)].map(async (_, i) =>
      this.utils.FormatAddress(
        await this.CallContractMethod({
          contractAddress,
          methodName: "membersList",
          methodArgs: [i]
        })
      )
    )
  );
};

/**
 * Get a list of addresses of managers of the specified group
 *
 * @memberof module:ElvClient/AccessGroups
 * @methodGroup Access Groups
 * @namedParams
 * @param contractAddress - The address of the access group contract
 *
 * @return {Promise<Array<string>>} - List of manager addresses
 */
exports.AccessGroupManagers = async function({contractAddress}) {
  contractAddress = ValidateAddress(contractAddress);

  this.Log(`Retrieving managers for group ${contractAddress}`);

  const length = (await this.CallContractMethod({
    contractAddress,
    methodName: "managersNum"
  })).toNumber();

  return await Promise.all(
    [...Array(length)].map(async (_, i) =>
      this.utils.FormatAddress(
        await this.CallContractMethod({
          contractAddress,
          methodName: "managersList",
          methodArgs: [i]
        })
      )
    )
  );
};

/**
 * Create a access group
 *
 * A new access group contract is deployed from the content space
 *
 * @memberof module:ElvClient/AccessGroups
 * @methodGroup Access Groups
 * @namedParams
 * @param {string=} name - Name of the access group
 * @param {string=} description - Description for the access group
 * @param {object=} meta - Metadata for the access group
 *
 * @returns {Promise<string>} - Contract address of created access group
 */
exports.CreateAccessGroup = async function({name, description, metadata={}}={}) {
  this.Log(`Creating access group: ${name || ""} ${description || ""}`);
  let { contractAddress } = await this.authClient.CreateAccessGroup();
  contractAddress = this.utils.FormatAddress(contractAddress);

  const objectId = this.utils.AddressToObjectId(contractAddress);

  this.Log(`Access group: ${contractAddress} ${objectId}`);

  const editResponse = await this.EditContentObject({
    libraryId: this.contentSpaceLibraryId,
    objectId: objectId
  });

  await this.ReplaceMetadata({
    libraryId: this.contentSpaceLibraryId,
    objectId,
    writeToken: editResponse.write_token,
    metadata: {
      public: {
        name,
        description
      },
      name,
      description,
      ...metadata
    }
  });

  await this.FinalizeContentObject({
    libraryId: this.contentSpaceLibraryId,
    objectId,
    writeToken: editResponse.write_token
  });

  return contractAddress;
};

/**
 * Delete an access group
 *
 * Calls the kill method on the specified access group's contract
 *
 * @memberof module:ElvClient/AccessGroups
 * @methodGroup Access Groups
 * @namedParams
 * @param {string} contractAddress - The address of the access group contract
 */
exports.DeleteAccessGroup = async function({contractAddress}) {
  contractAddress = ValidateAddress(contractAddress);

  this.Log(`Deleting access group ${contractAddress}`);

  await this.CallContractMethodAndWait({
    contractAddress,
    methodName: "kill",
    methodArgs: []
  });
};

exports.AccessGroupMembershipMethod = async function({
  contractAddress,
  memberAddress,
  methodName,
  eventName
}) {
  contractAddress = ValidateAddress(contractAddress);
  memberAddress = ValidateAddress(memberAddress);

  // Ensure caller is the member being acted upon or a manager/owner of the group
  if(!this.utils.EqualAddress(this.signer.address, memberAddress)) {
    const isManager = await this.CallContractMethod({
      contractAddress,
      methodName: "hasManagerAccess",
      methodArgs: [this.utils.FormatAddress(this.signer.address)]
    });

    if(!isManager) {
      throw Error("Manager access required");
    }
  }

  this.Log(`Calling ${methodName} on group ${contractAddress} for user ${memberAddress}`);

  const event = await this.CallContractMethodAndWait({
    contractAddress,
    methodName,
    methodArgs: [memberAddress],
    eventName,
    eventValue: "candidate",
  });

  const abi = await this.ContractAbi({contractAddress});
  const candidate = this.ExtractValueFromEvent({
    abi,
    event,
    eventName,
    eventValue: "candidate"
  });

  if(this.utils.FormatAddress(candidate) !== this.utils.FormatAddress(memberAddress)) {
    // eslint-disable-next-line no-console
    console.error("Mismatch: " + candidate + " :: " + memberAddress);
    throw Error("Access group method " + methodName + " failed");
  }

  return event.transactionHash;
};

/**
 * Add a member to the access group at the specified contract address. This client's signer must
 * be a manager of the access group.
 *
 * @memberof module:ElvClient/AccessGroups
 * @methodGroup Access Groups
 * @namedParams
 * @param {string} contractAddress - Address of the access group contract
 * @param {string} memberAddress - Address of the member to add
 *
 * @returns {Promise<string>} - The transaction hash of the call to the grantAccess method
 */
exports.AddAccessGroupMember = async function({contractAddress, memberAddress}) {
  contractAddress = ValidateAddress(contractAddress);
  memberAddress = ValidateAddress(memberAddress);

  return await this.AccessGroupMembershipMethod({
    contractAddress,
    memberAddress,
    methodName: "grantAccess",
    eventName: "MemberAdded"
  });
};

/**
 * Remove a member from the access group at the specified contract address. This client's signer must
 * be a manager of the access group.
 *
 * @memberof module:ElvClient/AccessGroups
 * @methodGroup Access Groups
 * @namedParams
 * @param {string} contractAddress - Address of the access group contract
 * @param {string} memberAddress - Address of the member to remove
 *
 * @returns {Promise<string>} - The transaction hash of the call to the revokeAccess method
 */
exports.RemoveAccessGroupMember = async function({contractAddress, memberAddress}) {
  contractAddress = ValidateAddress(contractAddress);
  memberAddress = ValidateAddress(memberAddress);

  return await this.AccessGroupMembershipMethod({
    contractAddress,
    memberAddress,
    methodName: "revokeAccess",
    eventName: "MemberRevoked"
  });
};

/**
 * Add a manager to the access group at the specified contract address. This client's signer must
 * be a manager of the access group.
 *
 * @memberof module:ElvClient/AccessGroups
 * @methodGroup Access Groups
 * @namedParams
 * @param {string} contractAddress - Address of the access group contract
 * @param {string} memberAddress - Address of the manager to add
 *
 * @returns {Promise<string>} - The transaction hash of the call to the grantManagerAccess method
 */
exports.AddAccessGroupManager = async function({contractAddress, memberAddress}) {
  contractAddress = ValidateAddress(contractAddress);
  memberAddress = ValidateAddress(memberAddress);

  return await this.AccessGroupMembershipMethod({
    contractAddress,
    memberAddress,
    methodName: "grantManagerAccess",
    eventName: "ManagerAccessGranted"
  });
};

/**
 * Remove a manager from the access group at the specified contract address. This client's signer must
 * be a manager of the access group.
 *
 * @memberof module:ElvClient/AccessGroups
 * @methodGroup Access Groups
 * @namedParams
 * @param {string} contractAddress - Address of the access group contract
 * @param {string} memberAddress - Address of the manager to remove
 *
 * @returns {Promise<string>} - The transaction hash of the call to the revokeManagerAccess method
 */
exports.RemoveAccessGroupManager = async function({contractAddress, memberAddress}) {
  contractAddress = ValidateAddress(contractAddress);
  memberAddress = ValidateAddress(memberAddress);

  return await this.AccessGroupMembershipMethod({
    contractAddress,
    memberAddress,
    methodName: "revokeManagerAccess",
    eventName: "ManagerAccessRevoked"
  });
};

/**
 * List all of the groups with permissions on the specified library.
 *
 * @memberof module:ElvClient/AccessGroups
 * @methodGroup Library Access Groups
 * @namedParams
 * @param {string} libraryId - The ID of the library* @param {string} libraryId - The ID of the library
 * @param {(Array<string>)=} permissions - Limit permission types. If not specified, all permissions will be included
 *
 * @return {Promise<Object>} - Object mapping group addresses to permissions, as an array
 * - Example: { "0x0": ["accessor", "contributor"], ...}
 */
exports.ContentLibraryGroupPermissions = async function({libraryId, permissions=[]}) {
  ValidateLibrary(libraryId);

  let libraryPermissions = {};

  if(!permissions || permissions.length === 0) {
    permissions = ["accessor", "contributor", "reviewer"];
  } else {
    // Format and validate specified permissions
    permissions = permissions.map(permission => {
      permission = permission.toLowerCase();

      if(!["accessor", "contributor", "reviewer"].includes(permission)) {
        throw Error(`Invalid permission: ${permission}`);
      }

      return permission;
    });
  }

  this.Log(`Retrieving ${permissions.join(", ")} group(s) for library ${libraryId}`);

  await Promise.all(
    permissions.map(async type => {
      // Get library access groups of the specified type
      let numGroups = await this.CallContractMethod({
        contractAddress: this.utils.HashToAddress(libraryId),
        methodName: type + "GroupsLength"
      });

      numGroups = parseInt(numGroups._hex, 16);

      const accessGroupAddresses = await this.utils.LimitedMap(
        3,
        [...Array(numGroups).keys()],
        async i => {
          try {
            return this.utils.FormatAddress(
              await this.CallContractMethod({
                contractAddress: this.utils.HashToAddress(libraryId),
                methodName: type + "Groups",
                methodArgs: [i]
              })
            );
          } catch(error) {
            // eslint-disable-next-line no-console
            console.error(error);
          }
        }
      );

      accessGroupAddresses.forEach(address =>
        libraryPermissions[address] = [...(libraryPermissions[address] || []), type].sort());
    })
  );

  return libraryPermissions;
};

/**
 * Add accessor, contributor or reviewer permissions for the specified group on the specified library
 *
 * @memberof module:ElvClient/AccessGroups
 * @methodGroup Library Access Groups
 * @namedParams
 * @param {string} libraryId - The ID of the library
 * @param {string} groupAddress - The address of the group
 * @param {string} permission - The type of permission to add ("accessor", "contributor", "reviewer")
 */
exports.AddContentLibraryGroup = async function({libraryId, groupAddress, permission}) {
  ValidateLibrary(libraryId);
  groupAddress = ValidateAddress(groupAddress);

  if(!["accessor", "contributor", "reviewer"].includes(permission.toLowerCase())) {
    throw Error(`Invalid group type: ${permission}`);
  }

  this.Log(`Adding ${permission} group ${groupAddress} to library ${libraryId}`);

  const existingPermissions = await this.ContentLibraryGroupPermissions({
    libraryId,
    permissions: [permission]
  });

  if(existingPermissions[groupAddress]) { return; }

  // Capitalize permission to match method and event names
  permission = permission.charAt(0).toUpperCase() + permission.substr(1).toLowerCase();

  const event = await this.CallContractMethodAndWait({
    contractAddress: this.utils.HashToAddress(libraryId),
    methodName: `add${permission}Group`,
    methodArgs: [groupAddress]
  });

  const abi = await this.ContractAbi({id: libraryId});
  await this.ExtractEventFromLogs({
    abi,
    event,
    eventName: `${permission}GroupAdded`
  });
};

/**
 * Remove accessor, contributor or reviewer permissions for the specified group on the specified library
 *
 * @memberof module:ElvClient/AccessGroups
 * @methodGroup Library Access Groups
 * @namedParams
 * @param {string} libraryId - The ID of the library
 * @param {string} groupAddress - The address of the group
 * @param {string} permission - The type of permission to remove ("accessor", "contributor", "reviewer")
 */
exports.RemoveContentLibraryGroup = async function({libraryId, groupAddress, permission}) {
  ValidateLibrary(libraryId);
  groupAddress = ValidateAddress(groupAddress);

  if(!["accessor", "contributor", "reviewer"].includes(permission.toLowerCase())) {
    throw Error(`Invalid group type: ${permission}`);
  }

  this.Log(`Removing ${permission} group ${groupAddress} from library ${libraryId}`);

  const existingPermissions = await this.ContentLibraryGroupPermissions({
    libraryId,
    permissions: [permission]
  });

  if(!existingPermissions[groupAddress]) { return; }

  // Capitalize permission to match method and event names
  permission = permission.charAt(0).toUpperCase() + permission.substr(1).toLowerCase();

  const event = await this.CallContractMethodAndWait({
    contractAddress: this.utils.HashToAddress(libraryId),
    methodName: `remove${permission}Group`,
    methodArgs: [groupAddress]
  });

  const abi = await this.ContractAbi({id: libraryId});
  await this.ExtractEventFromLogs({
    abi,
    event,
    eventName: `${permission}GroupRemoved`
  });
};

/**
 * List all of the groups with permissions on the specified object or content type
 *
 * @memberof module:ElvClient/AccessGroups
 * @methodGroup Object Access Groups
 * @namedParams
 * @param {string} objectId - The ID of the object
 *
 * @return {Promise<Object>} - Object mapping group addresses to permissions, as an array
 * - Example: { "0x0": ["see", "access", "manage"], ...}
 */
exports.ContentObjectGroupPermissions = async function({objectId}) {
  ValidateObject(objectId);

  this.Log(`Retrieving group permissions for object ${objectId}`);

  const contractAddress = this.utils.HashToAddress(objectId);

  // Access indexor only available on access groups, so must ask each access group
  // we belong to about this object

  const groupAddresses = await this.Collection({collectionType: "accessGroups"});

  const isType = (await this.AccessType({id: objectId})) === this.authClient.ACCESS_TYPES.TYPE;
  const methodName = isType ? "getContentTypeRights" : "getContentObjectRights";

  const groupPermissions = {};
  await Promise.all(
    groupAddresses.map(async groupAddress => {
      groupAddress = this.utils.FormatAddress(groupAddress);

      let permission = await this.CallContractMethod({
        contractAddress: groupAddress,
        methodName,
        methodArgs: [contractAddress]
      });

      if(permission === 0) { return; }

      let permissions = [];

      if(permission >= 100) {
        permissions.push("manage");
      }

      if(permission % 100 >= 10) {
        permissions.push("access");
      }

      if(permission % 10 > 0) {
        permissions.push("see");
      }

      groupPermissions[groupAddress] = permissions;
    })
  );

  return groupPermissions;
};

/**
 * Add a permission on the specified group for the specified object or content type
 *
 * @memberof module:ElvClient/AccessGroups
 * @methodGroup Object Access Groups
 * @namedParams
 * @param {string} objectId - The ID of the object
 * @param {string} groupAddress - The address of the group
 * @param {string} permission - The type of permission to add ("see", "access", "manage")
 */
exports.AddContentObjectGroupPermission = async function({objectId, groupAddress, permission}) {
  ValidatePresence("permission", permission);
  ValidateObject(objectId);
  groupAddress = ValidateAddress(groupAddress);

  permission = permission.toLowerCase();

  if(!["see", "access", "manage"].includes(permission)) {
    throw Error(`Invalid permission type: ${permission}`);
  }

  this.Log(`Adding ${permission} permission to group ${groupAddress} for ${objectId}`);

  const isType = (await this.AccessType({id: objectId})) === this.authClient.ACCESS_TYPES.TYPE;
  const methodName = isType ? "setContentTypeRights" : "setContentObjectRights";

  const event = await this.CallContractMethodAndWait({
    contractAddress: groupAddress,
    methodName,
    methodArgs: [
      this.utils.HashToAddress(objectId),
      permission === "manage" ? 2 : (permission === "access" ? 1 : 0),
      permission === "none" ? 0 : 2
    ]
  });

  const abi = await this.ContractAbi({contractAddress: groupAddress});
  await this.ExtractEventFromLogs({
    abi,
    event,
    eventName: "RightsChanged"
  });
};

/**
 * Remove a permission on the specified group for the specified object or content type
 *
 * @memberof module:ElvClient/AccessGroups
 * @methodGroup Object Access Groups
 * @namedParams
 * @param {string} objectId - The ID of the object
 * @param {string} groupAddress - The address of the group
 * @param {string} permission - The type of permission to remove ("see", "access", "manage")
 */
exports.RemoveContentObjectGroupPermission = async function({objectId, groupAddress, permission}) {
  ValidatePresence("permission", permission);
  ValidateObject(objectId);
  groupAddress = ValidateAddress(groupAddress);

  permission = permission.toLowerCase();

  if(!["see", "access", "manage"].includes(permission)) {
    throw Error(`Invalid permission type: ${permission}`);
  }

  this.Log(`Removing ${permission} permission from group ${groupAddress} for ${objectId}`);

  const isType = (await this.AccessType({id: objectId})) === this.authClient.ACCESS_TYPES.TYPE;
  const methodName = isType ? "setContentTypeRights" : "setContentObjectRights";

  const event = await this.CallContractMethodAndWait({
    contractAddress: groupAddress,
    methodName,
    methodArgs: [
      this.utils.HashToAddress(objectId),
      permission === "manage" ? 2 : (permission === "access" ? 1 : 0),
      0
    ]
  });

  const abi = await this.ContractAbi({contractAddress: groupAddress});
  await this.ExtractEventFromLogs({
    abi,
    event,
    eventName: "RightsChanged"
  });
};

/**
 * Link the specified group to an OAuth provider with the specified credentials
 *
 * @param {string} groupAddress - The address of the group
 * @param {string} kmsId - The ID of the KMS (or trust authority ID)
 * @param {string | Object} oauthConfig - The configuration for the OAuth settings
 * @return {Promise<void>}
 * @constructor
 */
exports.LinkAccessGroupToOauth = async function({groupAddress, kmsId, oauthConfig}) {
  ValidateAddress(groupAddress);
  ValidatePresence("kmsId", kmsId);
  ValidatePresence("oauthConfig", oauthConfig);

  if(typeof oauthConfig === "string") {
    oauthConfig = JSON.parse(oauthConfig);
  }

  const { publicKey } = await this.authClient.KMSInfo({kmsId});

  const config = JSON.stringify(oauthConfig);

  const kmsKey = `eluv.jwtv.${kmsId}`;
  const kmsConfig = await this.Crypto.EncryptConk(config, publicKey);

  const userKey = `eluv.jwtv.iusr${this.utils.AddressToHash(this.signer.address)}`;
  const userConfig = await this.EncryptECIES(config);

  const objectId = this.utils.AddressToObjectId(groupAddress);
  const writeToken = (await this.EditContentObject({libraryId: this.contentSpaceLibraryId, objectId})).write_token;

  await this.ReplaceMetadata({
    libraryId: this.contentSpaceLibraryId,
    objectId,
    writeToken,
    metadataSubtree: kmsKey,
    metadata: kmsConfig
  });

  await this.ReplaceMetadata({
    libraryId: this.contentSpaceLibraryId,
    objectId,
    writeToken,
    metadataSubtree: userKey,
    metadata: userConfig
  });

  await this.FinalizeContentObject({libraryId: this.contentSpaceLibraryId, objectId, writeToken});

  await this.CallContractMethodAndWait({
    contractAddress: groupAddress,
    methodName: "setOAuthEnabled",
    methodArgs: [true]
  });
};
