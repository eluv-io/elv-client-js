const UrlJoin = require("url-join");
const {ValidatePresence, ValidatePermission} = require("./Validation");

class PermissionsClient {
  /**
   * The PermissionsClient is intended to make it easy to setup and maintain permission policies in the fabric.
   *
   * <br/><b>Dates</b>:
   *
   *  - `start` and `end` can be specified in several places in the policy. These can be provided in any format supported by JavaScript's `new Date(date)` constructor, such as Unix epoch timestamps or ISO timestamps.
   *
   *  - Permissions, profiles and custom profile permissions may have start and end times. The effective allowed access is the *most restrictive* combination of applicable start and end times.
   *
   *
   * <br/><b>Subjects</b>:
   *
   *  - A subject is a recipient of a permission - namely Fabric and oauth users and groups.
   *
   *  - When specifying a subject, both the name and ID must be provided. For Fabric users, the ID is either the user or group address, or the igrp/iusr hash format of the address.
   *
   *
   * <br/><b>Items</b>:
   *
   *  - An 'item' in this API is a content object to which permissions are granted. All profiles and permissions are on a per-item basis.
   *
   *
   * <br/><b>Profiles</b>:
   *
   *  - Profiles represent a set of permissions that can be applied to a subject (via a 'permission', see below)
   *
   *  - A profile may have `start` and `end` times
   *
   *  - A profile includes permission specifications for both the assets and the offerings of an item. Both must be specified when creating or modifying a profile.
   *
   *  - For both assets and offerings, there is a `default_permission` entry, which can be either `full-access` or `no-access`. This represents the access allowed to the assets and offerings when a permission for the profile is granted, excepting any custom permissions that override it.
   *
   *  - For both assets and offerings, a profile may have a `custom_permissions` section, which specifies permissions for specific assets or offerings. These permissions must have a `permission` entry which is either `full-access` or `no-access`, and may have `start` and `end` times.
   *
   *
   *  Example Profile Specification:

       "pre-release": {
          "start": "2020-12-10T08:00:00.000Z",
          "end": "2020-12-31T08:00:00.000Z",
          "assets": {
            "custom_permissions": {
              "2wLgQXV5VYvRPZlOEPN0.tif": {
                "start": "2020-09-10T07:00:00.000Z",
                "end": "2020-12-31T08:00:00.000Z",
                "permission": "full-access"
              },
              "781rsItfv8UxrkYgSNhb.tif": {
                "start": "2020-09-10T07:00:00.000Z",
                "end": "2020-12-31T08:00:00.000Z",
                "permission": "full-access"
              },
              "QCVtsOAcUKbA8svZeFRI.tif": {
                "permission": "full-access"
              },
              "QXWQVA7FfUwLlEPlBI1G.tif": {
                "permission": "full-access",
                "start": "2020-09-30T07:00:00.000Z"
              }
            },
            "default_permission": "no-access"
          },
          "offerings": {
            "default_permission": "no-access"
          }
        }

   *
   *
   * <br/><b>Permissions</b>:
   *
   *  - A permission represents a grant of an item profile's permissions to a subject.
   *
   *  - A permission must have a profile that is present in the item's policy
   *
   *  - A permission may have `start` and `end` times. As mentioned above, the effective start and end times of a permission are the *most restrictive* of all applicable start and end times.
   *
   *  - A permission must have a subject, which can be either a user or a group, either from the Fabric or from an OAuth provider
   *
   *  - A subject must have an ID and a name. In the case of certain OAuth providers, the name may be used as an ID in most cases, but the immutable ID for that subject must be used as the ID. For example, in Okta, a group may be specified by its name "Content Admins", but have the Okta ID "00g102tklfAorixGi4x7". The former should be used as the subjectName, and the latter as the subjectId
   *
   *
   * Example Permission:

       {
          "start": "2021-01-01T08:00:00.000Z",
          "end": "2021-03-31T07:00:00.000Z",
          "profileName": "servicing",
          "subjectSource": "oauth",
          "subjectType": "group",
          "subjectName": "Partner1",
          "subjectId: "00g102uednmwrTihN4x7"
        }

   *
   * @param client - An instance of ElvClient
   */
  constructor(client) {
    this.client = client;
  }

  FormatDate(date) {
    if(!date) { return; }

    if(isNaN(new Date(date))) {
      throw Error(`Invalid start time: ${date}`);
    }

    return new Date(date).toISOString();
  }

  FormatProfile(profile) {
    ValidatePermission(profile.default_permission);

    let profileSpec = {};

    if(profile.start) {
      profileSpec.start = this.FormatDate(profile.start);
    }

    if(profile.end) {
      profileSpec.end = this.FormatDate(profile.end);
    }

    ["assets", "offerings"].forEach(type => {
      const typeInfo = profile[type] || {};

      profileSpec[type] = {
        default_permission: typeInfo.default_permission || typeInfo.default_permissions || "no-access"
      };

      if(typeInfo.custom_permissions) {
        profileSpec[type].custom_permissions = {};

        Object.keys(typeInfo.custom_permissions).forEach(id => {
          const permission = typeInfo.custom_permissions[id];

          let spec = {
            permission: ValidatePermission(permission.permission)
          };

          if(permission.start) {
            spec.start = this.FormatDate(permission.start);
          }

          if(permission.end) {
            spec.end = this.FormatDate(permission.end);
          }

          profileSpec[type].custom_permissions[id] = {
            ...permission,
            ...spec
          };
        });
      }
    });

    return profileSpec;
  }

  /* Add / remove overall item permission */

  /**
   * Initialize policy for the specified item
   *
   * @methodGroup Policies
   * @namedParams
   * @param {string} policyId - Object ID of the policy
   * @param {string} policyWriteToken - Write token for the policy
   * @param {string} itemId - Object ID of the item
   * @param {object=} profiles={} - Profiles to create
   */
  async InitializeItemPolicy({policyId, policyWriteToken, itemId, profiles={}}) {
    ValidatePresence("policyId", policyId);
    ValidatePresence("policyWriteToken", policyWriteToken);
    ValidatePresence("itemId", itemId);
    ValidatePresence("profiles", profiles);

    const metadata = (await this.client.ContentObjectMetadata({
      libraryId: await this.client.ContentObjectLibraryId({objectId: itemId}),
      objectId: itemId,
      select: [
        "public/name",
        "public/asset_metadata/title",
        "public/asset_metadata/display_title"
      ]
    })) || {};

    const assetMetadata = (metadata.public || {}).asset_metadata || {};
    const displayTitle = assetMetadata.display_title || assetMetadata.title || (metadata.public || {}).name;

    let itemSpec = {
      display_title: displayTitle,
      permissions: [],
      profiles: {}
    };

    Object.keys(profiles).forEach(profileName => {
      itemSpec.profiles[profileName] = this.FormatProfile(profiles[profileName]);
    });

    await this.client.ReplaceMetadata({
      libraryId: await this.client.ContentObjectLibraryId({objectId: policyId}),
      objectId: policyId,
      writeToken: policyWriteToken,
      metadataSubtree: UrlJoin("auth_policy_spec", itemId),
      metadata: itemSpec
    });
  }

  /**
   * Remove the specified item policy
   *
   * @methodGroup Policies
   * @namedParams
   * @param {string} policyId - Object ID of the policy
   * @param {string} policyWriteToken - Write token for the policy
   * @param {string} itemId - Object ID of the item
   */
  async RemoveItemPolicy({policyId, policyWriteToken, itemId}) {
    ValidatePresence("policyId", policyId);
    ValidatePresence("policyWriteToken", policyWriteToken);
    ValidatePresence("itemId", itemId);

    await this.client.DeleteMetadata({
      libraryId: await this.client.ContentObjectLibraryId({objectId: policyId}),
      objectId: policyId,
      writeToken: policyWriteToken,
      metadataSubtree: UrlJoin("auth_policy_spec", itemId)
    });
  }


  /* Get / set / remove profile permissions */

  /**
   * Retrieve profile information on the specified item policy
   *
   * @methodGroup Profiles
   * @namedParams
   * @param {string} policyId - Object ID of the policy
   * @param {string} itemId - Object ID of the item
   * @param {string=} profileName - The name of the profile. If not specified, all profiles will be returned
   */
  async ItemProfiles({policyId, itemId, profileName}) {
    return await this.client.ContentObjectMetadata({
      libraryId: await this.client.ContentObjectLibraryId({objectId: policyId}),
      objectId: policyId,
      metadataSubtree: UrlJoin("auth_policy_spec", itemId, "profiles", profileName || "")
    });
  }

  /**
   * Create or modify a profile for the specified item policy
   *
   * @methodGroup Profiles
   * @namedParams
   * @param {string} policyId - Object ID of the policy
   * @param {string} policyWriteToken - Write token for the policy
   * @param {string} itemId - Object ID of the item
   * @param {string} profileName - The name of the profile
   * @param {object} profileSpec - Specification for the profile. If not provided, profile
   * will default to no access for both assets and offerings
   */
  async SetProfile({
    policyId,
    policyWriteToken,
    itemId,
    profileName,
    profileSpec
  }) {
    ValidatePresence("policyId", policyId);
    ValidatePresence("policyWriteToken", policyWriteToken);
    ValidatePresence("itemId", itemId);
    ValidatePresence("profileName", profileName);
    ValidatePresence("profileSpec", profileSpec);

    await this.client.ReplaceMetadata({
      libraryId: await this.client.ContentObjectLibraryId({objectId: policyId}),
      objectId: policyId,
      writeToken: policyWriteToken,
      metadataSubtree: UrlJoin("auth_policy_spec", itemId, "profiles", profileName),
      metadata: this.FormatProfile(profileSpec)
    });
  }

  /**
   * Remove a profile from the specified item policy
   *
   * @methodGroup Profiles
   * @namedParams
   * @param {string} policyId - Object ID of the policy
   * @param {string} policyWriteToken - Write token for the policy
   * @param {string} itemId - Object ID of the item
   * @param {string} profileName - The name of the profile
   * @param {object} profileSpec - Specification for the profile. If not provided, profile
   * will default to no access for both assets and offerings
   */
  async RemoveProfile({
    policyId,
    policyWriteToken,
    itemId,
    profileName
  }) {
    ValidatePresence("policyId", policyId);
    ValidatePresence("policyWriteToken", policyWriteToken);
    ValidatePresence("itemId", itemId);
    ValidatePresence("profileName", profileName);

    await this.client.DeleteMetadata({
      libraryId: await this.client.ContentObjectLibraryId({objectId: policyId}),
      objectId: policyId,
      writeToken: policyWriteToken,
      metadataSubtree: UrlJoin("auth_policy_spec", itemId, "profiles", profileName)
    });
  }


  /* Get / set / remove subject permissions */

  /**
   * Retrieve the permissions for the specified item policy
   *
   * @methodGroup Permissions
   * @namedParams
   * @param {string} policyId - Object ID of the policy
   * @param {string} itemId - Object ID of the item
   *
   * @return {Promise<Array>} - The list of permissions for the specified item
   */
  async ItemPermissions({policyId, itemId}) {
    const libraryId = await this.client.ContentObjectLibraryId({objectId: policyId});
    const permissions = (await this.client.ContentObjectMetadata({
      libraryId,
      objectId: policyId,
      metadataSubtree: UrlJoin("auth_policy_spec", itemId, "permissions")
    })) || [];

    return await Promise.all(
      permissions.map(async permission => {
        const subjectSource = permission.subject.type.startsWith("oauth") ? "oauth" : "fabric";
        const subjectType = permission.subject.type.includes("group") ? "group" : "user";
        const subjectId = subjectSource === "oauth" ? permission.subject.oauth_id : this.client.utils.HashToAddress(permission.subject.id);

        let subjectName = permission.subject.id;
        if(subjectSource === "fabric") {
          if(subjectType === "group") {
            const contentSpaceLibraryId = (await this.client.ContentSpaceId()).replace("ispc", "ilib");
            subjectName = (await this.client.ContentObjectMetadata({
              libraryId: contentSpaceLibraryId,
              objectId: this.client.utils.AddressToObjectId(subjectId),
              metadataSubtree: UrlJoin("public", "name")
            })) || subjectId;
          } else {
            subjectName = ((await this.client.ContentObjectMetadata({
              libraryId,
              objectId: policyId,
              metadataSubtree: UrlJoin("auth_policy_settings", "fabric_users", subjectId)
            })) || {}).name || subjectId;
          }
        }

        let permissionSpec = {
          profileName: permission.profile,
          subjectSource,
          subjectType,
          subjectId,
          subjectName
        };

        if(permission.start) {
          permissionSpec.start = permission.start;
        }

        if(permission.end) {
          permissionSpec.end = permission.end;
        }

        return permissionSpec;
      })
    );
  }

  /**
   * Add or modify permission for the specified subject to the specified item policy
   *
   * @methodGroup Permissions
   * @namedParams
   * @param {string} policyId - Object ID of the policy
   * @param {string} policyWriteToken - Write token for the policy
   * @param {string} itemId - Object ID of the item
   * @param {string} subjectSource="fabric" - ("fabric" | "oauth") - The source of the subject
   * @param {string} subjectType="group - ("user" | "group") - The type of the subject
   * @param {string} subjectName - The name of the subject
   * @param {string} subjectId - The ID of the subject
   * @param {string} profileName - The profile to apply for the permission
   * @param {string | number} start - The start time for the permission
   * @param {string | number} end - The end time for the permission
   */
  async SetPermission({
    policyId,
    policyWriteToken,
    itemId,
    subjectSource="fabric",
    subjectType="group",
    subjectName,
    subjectId,
    profileName,
    start,
    end
  }) {
    ValidatePresence("policyId", policyId);
    ValidatePresence("policyWriteToken", policyWriteToken);
    ValidatePresence("itemId", itemId);
    ValidatePresence("subjectType", subjectType);
    ValidatePresence("subjectSource", subjectSource);
    ValidatePresence("subjectId", subjectId);
    ValidatePresence("profileName", profileName);

    start = this.FormatDate(start);
    end = this.FormatDate(end);

    const policyLibraryId = await this.client.ContentObjectLibraryId({objectId: policyId});

    // Allow address to be passed in for fabric subjects, though spec requires iusr/igrp hash
    if(subjectSource === "fabric") {
      if(subjectType === "group") {
        if(!subjectId.startsWith("igrp")) {
          subjectId = `igrp${this.client.utils.AddressToHash(subjectId)}`;
        }
      } else {
        if(!subjectId.startsWith("iusr")) {
          subjectId = `iusr${this.client.utils.AddressToHash(subjectId)}`;
        }
      }
    }

    let existingPermissions = await this.client.ContentObjectMetadata({
      libraryId: policyLibraryId,
      objectId: policyId,
      writeToken: policyWriteToken,
      metadataSubtree: UrlJoin("auth_policy_spec", itemId)
    });

    if(!existingPermissions) {
      throw Error("Unable to add permissions to uninitialized item");
    }

    if(!existingPermissions.profiles[profileName]) {
      throw Error(`Profile '${profileName}' does not exist`);
    }

    let index = existingPermissions.permissions.findIndex(permission => {
      if(subjectSource === "fabric") {
        return permission.subject.id === subjectId;
      } else {
        return permission.subject.oauth_id === subjectId;
      }
    });

    if(index < 0) {
      index = existingPermissions.permissions.length;
    }

    let permissionSpec = {
      profile: profileName
    };

    if(start) {permissionSpec.start = start; }
    if(end) { permissionSpec.end = end; }

    let subjectInfo;
    if(subjectSource === "fabric") {
      if(subjectType === "group") {
        subjectInfo = {
          id: subjectId,
          type: "group"
        };
      } else if(subjectType === "user") {
        subjectInfo = {
          id: subjectId,
          type: "user"
        };
      } else {
        throw Error(`Invalid subject type: ${subjectType}`);
      }
    } else if(subjectSource === "oauth") {
      if(subjectType === "group") {
        subjectInfo = {
          id: subjectName,
          oauth_id: subjectId,
          type: "oauth_group"
        };
      } else if(subjectType === "user") {
        subjectInfo = {
          id: subjectName,
          oauth_id: subjectId,
          type: "oauth_user"
        };
      } else {
        throw Error(`Invalid subject type: ${subjectType}`);
      }
    } else {
      throw Error(`Invalid subject source: ${subjectSource}`);
    }

    permissionSpec.subject = subjectInfo;

    existingPermissions.permissions[index] = permissionSpec;

    await this.client.ReplaceMetadata({
      libraryId: policyLibraryId,
      objectId: policyId,
      writeToken: policyWriteToken,
      metadataSubtree: UrlJoin("auth_policy_spec", itemId, "permissions"),
      metadata: existingPermissions.permissions
    });

    // Fabric usernames are stored in auth_policy_settings/fabric_users
    if(subjectSource === "fabric" && subjectType === "user") {
      const userInfo = await this.client.ContentObjectMetadata({
        libraryId: policyLibraryId,
        objectId: policyId,
        metadataSubtree: UrlJoin("auth_policy_settings", "fabric_users", this.client.utils.HashToAddress(subjectId))
      });

      if(!userInfo) {
        await this.client.ReplaceMetadata({
          libraryId: policyLibraryId,
          objectId: policyId,
          writeToken: policyWriteToken,
          metadataSubtree: UrlJoin("auth_policy_settings", "fabric_users", this.client.utils.HashToAddress(subjectId)),
          metadata: {
            address: this.client.utils.HashToAddress(subjectId),
            name: subjectName
          }
        });
      }
    }
  }


  /**
   * Remove permission for the specified subject from the specified item policy
   *
   * @methodGroup Permissions
   * @namedParams
   * @param {string} policyId - Object ID of the policy
   * @param {string} policyWriteToken - Write token for the policy
   * @param {string} itemId - Object ID of the item
   * @param {string} subjectId - The ID of the subject
   */
  async RemovePermission({policyId, policyWriteToken, itemId, subjectId}) {
    ValidatePresence("policyId", policyId);
    ValidatePresence("policyWriteToken", policyWriteToken);
    ValidatePresence("itemId", itemId);
    ValidatePresence("subjectId", subjectId);

    const policyLibraryId = await this.client.ContentObjectLibraryId({objectId: policyId});

    const permissions = await this.client.ContentObjectMetadata({
      libraryId: policyLibraryId,
      objectId: policyId,
      metadataSubtree: UrlJoin("auth_policy_spec", itemId, "permissions")
    });

    if(!permissions) { return; }

    // Convert address to appropriate ID
    if(subjectId.startsWith("0x")) {
      const id = this.client.utils.AddressToObjectId(subjectId);
      if((await this.client.AccessType({id})) === "group") {
        subjectId = `igrp${this.client.utils.AddressToHash(subjectId)}`;
      } else {
        subjectId = `iusr${this.client.utils.AddressToHash(subjectId)}`;
      }
    }

    const index = permissions.findIndex(permission => {
      return permission.subject.id === subjectId || permission.subject.oauth_id === subjectId;
    });

    if(index < 0) { return; }

    await this.client.DeleteMetadata({
      libraryId: policyLibraryId,
      objectId: policyId,
      writeToken: policyWriteToken,
      metadataSubtree: UrlJoin("auth_policy_spec", itemId, "permissions", index.toString())
    });
  }
}

module.exports = PermissionsClient;
