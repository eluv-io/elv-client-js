var _regeneratorRuntime = require("@babel/runtime/regenerator");

var _defineProperty = require("@babel/runtime/helpers/defineProperty");

var _classCallCheck = require("@babel/runtime/helpers/classCallCheck");

var _createClass = require("@babel/runtime/helpers/createClass");

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

var UrlJoin = require("url-join");

var _require = require("./Validation"),
    ValidatePresence = _require.ValidatePresence,
    ValidatePermission = _require.ValidatePermission;

var PermissionsClient =
/*#__PURE__*/
function () {
  "use strict";

  /**
   * The PermissionsClient is intended to make it easy to setup and maintain permission policies in the fabric.
   *
   * <br/><b>Item Policies</b>:
   *  - An item policy is the full specification of the policy for an object. It consists of a set of available profiles and a list of permissions.
   *  - The item policy must be initialized using `CreateItemPolicy` before the other modification methods in this client can be used.
   *  - The item policy can be retrieved using the `ItemPolicy` method to check if the policy for a particular item has been initialized.
   *
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
   *  - A permission must have a subject, which can be either a user, a group, or an NTP instance, either from the Fabric or from an OAuth provider
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
  function PermissionsClient(client) {
    _classCallCheck(this, PermissionsClient);

    this.client = client;
    this.subjectNames = {};
  }

  _createClass(PermissionsClient, [{
    key: "FormatDate",
    value: function FormatDate(date) {
      if (!date) {
        return;
      }

      if (isNaN(new Date(date))) {
        throw Error("Invalid start time: ".concat(date));
      }

      return new Date(date).toISOString();
    }
  }, {
    key: "FormatProfile",
    value: function FormatProfile(profile) {
      var _this = this;

      ValidatePermission(profile.default_permission);
      var profileSpec = {};

      if (profile.start) {
        profileSpec.start = this.FormatDate(profile.start);
      }

      if (profile.end) {
        profileSpec.end = this.FormatDate(profile.end);
      }

      ["assets", "offerings"].forEach(function (type) {
        var typeInfo = profile[type] || {};
        profileSpec[type] = {
          default_permission: typeInfo.default_permission || typeInfo.default_permissions || "no-access"
        };

        if (typeInfo.custom_permissions) {
          profileSpec[type].custom_permissions = {};
          Object.keys(typeInfo.custom_permissions).forEach(function (id) {
            var permission = typeInfo.custom_permissions[id];
            var spec = {
              permission: ValidatePermission(permission.permission)
            };

            if (permission.start) {
              spec.start = _this.FormatDate(permission.start);
            }

            if (permission.end) {
              spec.end = _this.FormatDate(permission.end);
            }

            profileSpec[type].custom_permissions[id] = _objectSpread({}, permission, {}, spec);
          });
        }
      });
      return profileSpec;
    }
  }, {
    key: "FormatPermission",
    value: function FormatPermission(_ref) {
      var policyId, policyWriteToken, permission, subjectSource, subjectType, subjectId, id, cachedName, subjectName, contentSpaceLibraryId, permissionSpec;
      return _regeneratorRuntime.async(function FormatPermission$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              policyId = _ref.policyId, policyWriteToken = _ref.policyWriteToken, permission = _ref.permission;
              subjectSource = permission.subject.type.startsWith("oauth") ? "oauth" : "fabric";
              subjectType = permission.subject.type === "otp" ? "ntp" : permission.subject.type.includes("group") ? "group" : "user";
              subjectId = permission.subject.type === "otp" ? permission.subject.id : subjectSource === "oauth" ? permission.subject.oauth_id : this.client.utils.HashToAddress(permission.subject.id);
              id = permission.subject.oauth_id || permission.subject.id;
              cachedName = this.subjectNames[id];
              subjectName = cachedName || permission.subject.id;

              if (!(!cachedName && subjectSource === "fabric")) {
                _context.next = 62;
                break;
              }

              if (!(subjectType === "group")) {
                _context.next = 20;
                break;
              }

              _context.next = 11;
              return _regeneratorRuntime.awrap(this.client.ContentSpaceId());

            case 11:
              contentSpaceLibraryId = _context.sent.replace("ispc", "ilib");
              _context.next = 14;
              return _regeneratorRuntime.awrap(this.client.ContentObjectMetadata({
                libraryId: contentSpaceLibraryId,
                objectId: this.client.utils.AddressToObjectId(subjectId),
                metadataSubtree: UrlJoin("public", "name")
              }));

            case 14:
              _context.t0 = _context.sent;

              if (_context.t0) {
                _context.next = 17;
                break;
              }

              _context.t0 = subjectId;

            case 17:
              subjectName = _context.t0;
              _context.next = 62;
              break;

            case 20:
              if (!(subjectType === "user")) {
                _context.next = 42;
                break;
              }

              _context.t3 = _regeneratorRuntime;
              _context.t4 = this.client;
              _context.next = 25;
              return _regeneratorRuntime.awrap(this.client.ContentObjectLibraryId({
                objectId: policyId
              }));

            case 25:
              _context.t5 = _context.sent;
              _context.t6 = policyId;
              _context.t7 = policyWriteToken;
              _context.t8 = UrlJoin("auth_policy_settings", "fabric_users", subjectId);
              _context.t9 = {
                libraryId: _context.t5,
                objectId: _context.t6,
                writeToken: _context.t7,
                metadataSubtree: _context.t8
              };
              _context.t10 = _context.t4.ContentObjectMetadata.call(_context.t4, _context.t9);
              _context.next = 33;
              return _context.t3.awrap.call(_context.t3, _context.t10);

            case 33:
              _context.t2 = _context.sent;

              if (_context.t2) {
                _context.next = 36;
                break;
              }

              _context.t2 = {};

            case 36:
              _context.t1 = _context.t2.name;

              if (_context.t1) {
                _context.next = 39;
                break;
              }

              _context.t1 = subjectId;

            case 39:
              subjectName = _context.t1;
              _context.next = 62;
              break;

            case 42:
              if (!(subjectType === "ntp")) {
                _context.next = 62;
                break;
              }

              _context.t13 = _regeneratorRuntime;
              _context.t14 = this.client;
              _context.next = 47;
              return _regeneratorRuntime.awrap(this.client.ContentObjectLibraryId({
                objectId: policyId
              }));

            case 47:
              _context.t15 = _context.sent;
              _context.t16 = policyId;
              _context.t17 = policyWriteToken;
              _context.t18 = UrlJoin("auth_policy_settings", "ntp_instances", subjectId);
              _context.t19 = {
                libraryId: _context.t15,
                objectId: _context.t16,
                writeToken: _context.t17,
                metadataSubtree: _context.t18
              };
              _context.t20 = _context.t14.ContentObjectMetadata.call(_context.t14, _context.t19);
              _context.next = 55;
              return _context.t13.awrap.call(_context.t13, _context.t20);

            case 55:
              _context.t12 = _context.sent;

              if (_context.t12) {
                _context.next = 58;
                break;
              }

              _context.t12 = {};

            case 58:
              _context.t11 = _context.t12.name;

              if (_context.t11) {
                _context.next = 61;
                break;
              }

              _context.t11 = subjectId;

            case 61:
              subjectName = _context.t11;

            case 62:
              this.subjectNames[id] = subjectName;
              permissionSpec = {
                profileName: permission.profile,
                subjectSource: subjectSource,
                subjectType: subjectType,
                subjectId: subjectId,
                subjectName: subjectName
              };

              if (permission.start) {
                permissionSpec.start = permission.start;
              }

              if (permission.end) {
                permissionSpec.end = permission.end;
              }

              return _context.abrupt("return", permissionSpec);

            case 67:
            case "end":
              return _context.stop();
          }
        }
      }, null, this);
    }
    /* Add / remove overall item permission */

    /**
     * Retrieve a list of all items in the specified policy
     *
     * @methodGroup Policies
     * @namedParams
     * @param {string} policyId - Object ID of the policy
     * @param {string=} policyWriteToken - Write token for the policy object - if specified, info will be retrieved from the write draft instead of the last finalized policy object
     * @return {Promise<Object>} - A mapping of item objectId to the display name of the item
     */

  }, {
    key: "PolicyItems",
    value: function PolicyItems(_ref2) {
      var policyId, policyWriteToken;
      return _regeneratorRuntime.async(function PolicyItems$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              policyId = _ref2.policyId, policyWriteToken = _ref2.policyWriteToken;
              _context2.t1 = _regeneratorRuntime;
              _context2.t2 = this.client;
              _context2.next = 5;
              return _regeneratorRuntime.awrap(this.client.ContentObjectLibraryId({
                objectId: policyId
              }));

            case 5:
              _context2.t3 = _context2.sent;
              _context2.t4 = policyId;
              _context2.t5 = policyWriteToken;
              _context2.t6 = ["*/display_title"];
              _context2.t7 = {
                libraryId: _context2.t3,
                objectId: _context2.t4,
                writeToken: _context2.t5,
                metadataSubtree: "auth_policy_spec",
                select: _context2.t6
              };
              _context2.t8 = _context2.t2.ContentObjectMetadata.call(_context2.t2, _context2.t7);
              _context2.next = 13;
              return _context2.t1.awrap.call(_context2.t1, _context2.t8);

            case 13:
              _context2.t0 = _context2.sent;

              if (_context2.t0) {
                _context2.next = 16;
                break;
              }

              _context2.t0 = {};

            case 16:
              return _context2.abrupt("return", _context2.t0);

            case 17:
            case "end":
              return _context2.stop();
          }
        }
      }, null, this);
    }
    /**
     * Retrieve the full item policy for the given item.
     *
     * @methodGroup Policies
     * @namedParams
     * @param {string} policyId - Object ID of the policy
     * @param {string=} policyWriteToken - Write token for the policy object - if specified, info will be retrieved from the write draft instead of the last finalized policy object
     * @param {string} itemId - Object ID of the item
     * @return {Promise<Object | undefined>} - The policy for the specified item. If none exists, returns undefined
     */

  }, {
    key: "ItemPolicy",
    value: function ItemPolicy(_ref3) {
      var policyId, policyWriteToken, itemId, profiles, permissions;
      return _regeneratorRuntime.async(function ItemPolicy$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              policyId = _ref3.policyId, policyWriteToken = _ref3.policyWriteToken, itemId = _ref3.itemId;
              _context3.next = 3;
              return _regeneratorRuntime.awrap(this.ItemProfiles({
                policyId: policyId,
                policyWriteToken: policyWriteToken,
                itemId: itemId
              }));

            case 3:
              profiles = _context3.sent;
              _context3.next = 6;
              return _regeneratorRuntime.awrap(this.ItemPermissions({
                policyId: policyId,
                policyWriteToken: policyWriteToken,
                itemId: itemId
              }));

            case 6:
              permissions = _context3.sent;

              if (!(!profiles || !permissions)) {
                _context3.next = 9;
                break;
              }

              return _context3.abrupt("return");

            case 9:
              return _context3.abrupt("return", {
                profiles: profiles,
                permissions: permissions
              });

            case 10:
            case "end":
              return _context3.stop();
          }
        }
      }, null, this);
    }
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

  }, {
    key: "CreateItemPolicy",
    value: function CreateItemPolicy(_ref4) {
      var _this2 = this;

      var policyId, policyWriteToken, itemId, _ref4$profiles, profiles, metadata, assetMetadata, displayTitle, itemSpec;

      return _regeneratorRuntime.async(function CreateItemPolicy$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              policyId = _ref4.policyId, policyWriteToken = _ref4.policyWriteToken, itemId = _ref4.itemId, _ref4$profiles = _ref4.profiles, profiles = _ref4$profiles === void 0 ? {} : _ref4$profiles;
              ValidatePresence("policyId", policyId);
              ValidatePresence("policyWriteToken", policyWriteToken);
              ValidatePresence("itemId", itemId);
              ValidatePresence("profiles", profiles);
              _context4.t1 = _regeneratorRuntime;
              _context4.t2 = this.client;
              _context4.next = 9;
              return _regeneratorRuntime.awrap(this.client.ContentObjectLibraryId({
                objectId: itemId
              }));

            case 9:
              _context4.t3 = _context4.sent;
              _context4.t4 = itemId;
              _context4.t5 = ["public/name", "public/asset_metadata/title", "public/asset_metadata/display_title"];
              _context4.t6 = {
                libraryId: _context4.t3,
                objectId: _context4.t4,
                select: _context4.t5
              };
              _context4.t7 = _context4.t2.ContentObjectMetadata.call(_context4.t2, _context4.t6);
              _context4.next = 16;
              return _context4.t1.awrap.call(_context4.t1, _context4.t7);

            case 16:
              _context4.t0 = _context4.sent;

              if (_context4.t0) {
                _context4.next = 19;
                break;
              }

              _context4.t0 = {};

            case 19:
              metadata = _context4.t0;
              assetMetadata = (metadata["public"] || {}).asset_metadata || {};
              displayTitle = assetMetadata.display_title || assetMetadata.title || (metadata["public"] || {}).name;
              itemSpec = {
                display_title: displayTitle,
                permissions: [],
                profiles: {}
              };
              Object.keys(profiles).forEach(function (profileName) {
                itemSpec.profiles[profileName] = _this2.FormatProfile(profiles[profileName]);
              });
              _context4.t8 = _regeneratorRuntime;
              _context4.t9 = this.client;
              _context4.next = 28;
              return _regeneratorRuntime.awrap(this.client.ContentObjectLibraryId({
                objectId: policyId
              }));

            case 28:
              _context4.t10 = _context4.sent;
              _context4.t11 = policyId;
              _context4.t12 = policyWriteToken;
              _context4.t13 = UrlJoin("auth_policy_spec", itemId);
              _context4.t14 = itemSpec;
              _context4.t15 = {
                libraryId: _context4.t10,
                objectId: _context4.t11,
                writeToken: _context4.t12,
                metadataSubtree: _context4.t13,
                metadata: _context4.t14
              };
              _context4.t16 = _context4.t9.ReplaceMetadata.call(_context4.t9, _context4.t15);
              _context4.next = 37;
              return _context4.t8.awrap.call(_context4.t8, _context4.t16);

            case 37:
            case "end":
              return _context4.stop();
          }
        }
      }, null, this);
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

  }, {
    key: "RemoveItemPolicy",
    value: function RemoveItemPolicy(_ref5) {
      var policyId, policyWriteToken, itemId;
      return _regeneratorRuntime.async(function RemoveItemPolicy$(_context5) {
        while (1) {
          switch (_context5.prev = _context5.next) {
            case 0:
              policyId = _ref5.policyId, policyWriteToken = _ref5.policyWriteToken, itemId = _ref5.itemId;
              ValidatePresence("policyId", policyId);
              ValidatePresence("policyWriteToken", policyWriteToken);
              ValidatePresence("itemId", itemId);
              _context5.t0 = _regeneratorRuntime;
              _context5.t1 = this.client;
              _context5.next = 8;
              return _regeneratorRuntime.awrap(this.client.ContentObjectLibraryId({
                objectId: policyId
              }));

            case 8:
              _context5.t2 = _context5.sent;
              _context5.t3 = policyId;
              _context5.t4 = policyWriteToken;
              _context5.t5 = UrlJoin("auth_policy_spec", itemId);
              _context5.t6 = {
                libraryId: _context5.t2,
                objectId: _context5.t3,
                writeToken: _context5.t4,
                metadataSubtree: _context5.t5
              };
              _context5.t7 = _context5.t1.DeleteMetadata.call(_context5.t1, _context5.t6);
              _context5.next = 16;
              return _context5.t0.awrap.call(_context5.t0, _context5.t7);

            case 16:
            case "end":
              return _context5.stop();
          }
        }
      }, null, this);
    }
    /* Get / set / remove profile permissions */

    /**
     * Retrieve profile information on the specified item policy
     *
     * @methodGroup Profiles
     * @namedParams
     * @param {string} policyId - Object ID of the policy
     * @param {string=} policyWriteToken - Write token for the policy object - if specified, info will be retrieved from the write draft instead of the last finalized policy object
     * @param {string} itemId - Object ID of the item
     * @param {string=} profileName - The name of the profile. If not specified, all profiles will be returned
     */

  }, {
    key: "ItemProfiles",
    value: function ItemProfiles(_ref6) {
      var policyId, policyWriteToken, itemId, profileName;
      return _regeneratorRuntime.async(function ItemProfiles$(_context6) {
        while (1) {
          switch (_context6.prev = _context6.next) {
            case 0:
              policyId = _ref6.policyId, policyWriteToken = _ref6.policyWriteToken, itemId = _ref6.itemId, profileName = _ref6.profileName;
              _context6.t0 = _regeneratorRuntime;
              _context6.t1 = this.client;
              _context6.next = 5;
              return _regeneratorRuntime.awrap(this.client.ContentObjectLibraryId({
                objectId: policyId
              }));

            case 5:
              _context6.t2 = _context6.sent;
              _context6.t3 = policyId;
              _context6.t4 = policyWriteToken;
              _context6.t5 = UrlJoin("auth_policy_spec", itemId, "profiles", profileName || "");
              _context6.t6 = {
                libraryId: _context6.t2,
                objectId: _context6.t3,
                writeToken: _context6.t4,
                metadataSubtree: _context6.t5
              };
              _context6.t7 = _context6.t1.ContentObjectMetadata.call(_context6.t1, _context6.t6);
              _context6.next = 13;
              return _context6.t0.awrap.call(_context6.t0, _context6.t7);

            case 13:
              return _context6.abrupt("return", _context6.sent);

            case 14:
            case "end":
              return _context6.stop();
          }
        }
      }, null, this);
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

  }, {
    key: "SetProfile",
    value: function SetProfile(_ref7) {
      var policyId, policyWriteToken, itemId, profileName, profileSpec;
      return _regeneratorRuntime.async(function SetProfile$(_context7) {
        while (1) {
          switch (_context7.prev = _context7.next) {
            case 0:
              policyId = _ref7.policyId, policyWriteToken = _ref7.policyWriteToken, itemId = _ref7.itemId, profileName = _ref7.profileName, profileSpec = _ref7.profileSpec;
              ValidatePresence("policyId", policyId);
              ValidatePresence("policyWriteToken", policyWriteToken);
              ValidatePresence("itemId", itemId);
              ValidatePresence("profileName", profileName);
              ValidatePresence("profileSpec", profileSpec);
              _context7.t0 = _regeneratorRuntime;
              _context7.t1 = this.client;
              _context7.next = 10;
              return _regeneratorRuntime.awrap(this.client.ContentObjectLibraryId({
                objectId: policyId
              }));

            case 10:
              _context7.t2 = _context7.sent;
              _context7.t3 = policyId;
              _context7.t4 = policyWriteToken;
              _context7.t5 = UrlJoin("auth_policy_spec", itemId, "profiles", profileName);
              _context7.t6 = this.FormatProfile(profileSpec);
              _context7.t7 = {
                libraryId: _context7.t2,
                objectId: _context7.t3,
                writeToken: _context7.t4,
                metadataSubtree: _context7.t5,
                metadata: _context7.t6
              };
              _context7.t8 = _context7.t1.ReplaceMetadata.call(_context7.t1, _context7.t7);
              _context7.next = 19;
              return _context7.t0.awrap.call(_context7.t0, _context7.t8);

            case 19:
            case "end":
              return _context7.stop();
          }
        }
      }, null, this);
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

  }, {
    key: "RemoveProfile",
    value: function RemoveProfile(_ref8) {
      var policyId, policyWriteToken, itemId, profileName;
      return _regeneratorRuntime.async(function RemoveProfile$(_context8) {
        while (1) {
          switch (_context8.prev = _context8.next) {
            case 0:
              policyId = _ref8.policyId, policyWriteToken = _ref8.policyWriteToken, itemId = _ref8.itemId, profileName = _ref8.profileName;
              ValidatePresence("policyId", policyId);
              ValidatePresence("policyWriteToken", policyWriteToken);
              ValidatePresence("itemId", itemId);
              ValidatePresence("profileName", profileName);
              _context8.t0 = _regeneratorRuntime;
              _context8.t1 = this.client;
              _context8.next = 9;
              return _regeneratorRuntime.awrap(this.client.ContentObjectLibraryId({
                objectId: policyId
              }));

            case 9:
              _context8.t2 = _context8.sent;
              _context8.t3 = policyId;
              _context8.t4 = policyWriteToken;
              _context8.t5 = UrlJoin("auth_policy_spec", itemId, "profiles", profileName);
              _context8.t6 = {
                libraryId: _context8.t2,
                objectId: _context8.t3,
                writeToken: _context8.t4,
                metadataSubtree: _context8.t5
              };
              _context8.t7 = _context8.t1.DeleteMetadata.call(_context8.t1, _context8.t6);
              _context8.next = 17;
              return _context8.t0.awrap.call(_context8.t0, _context8.t7);

            case 17:
            case "end":
              return _context8.stop();
          }
        }
      }, null, this);
    }
    /* Get / set / remove subject permissions */

    /**
     * Retrieve the permissions for the specified item policy
     *
     * @methodGroup Permissions
     * @namedParams
     * @param {string} policyId - Object ID of the policy
     * @param {string=} policyWriteToken - Write token for the policy object - if specified, info will be retrieved from the write draft instead of the last finalized policy object
     * @param {string} itemId - Object ID of the item
     *
     * @return {Promise<Array>} - The list of permissions for the specified item
     */

  }, {
    key: "ItemPermissions",
    value: function ItemPermissions(_ref9) {
      var _this3 = this;

      var policyId, policyWriteToken, itemId, libraryId, permissions;
      return _regeneratorRuntime.async(function ItemPermissions$(_context10) {
        while (1) {
          switch (_context10.prev = _context10.next) {
            case 0:
              policyId = _ref9.policyId, policyWriteToken = _ref9.policyWriteToken, itemId = _ref9.itemId;
              _context10.next = 3;
              return _regeneratorRuntime.awrap(this.client.ContentObjectLibraryId({
                objectId: policyId
              }));

            case 3:
              libraryId = _context10.sent;
              _context10.next = 6;
              return _regeneratorRuntime.awrap(this.client.ContentObjectMetadata({
                libraryId: libraryId,
                objectId: policyId,
                writeToken: policyWriteToken,
                metadataSubtree: UrlJoin("auth_policy_spec", itemId, "permissions")
              }));

            case 6:
              _context10.t0 = _context10.sent;

              if (_context10.t0) {
                _context10.next = 9;
                break;
              }

              _context10.t0 = [];

            case 9:
              permissions = _context10.t0;
              _context10.next = 12;
              return _regeneratorRuntime.awrap(Promise.all(permissions.map(function _callee(permission) {
                return _regeneratorRuntime.async(function _callee$(_context9) {
                  while (1) {
                    switch (_context9.prev = _context9.next) {
                      case 0:
                        _context9.next = 2;
                        return _regeneratorRuntime.awrap(_this3.FormatPermission({
                          policyId: policyId,
                          policyWriteToken: policyWriteToken,
                          permission: permission
                        }));

                      case 2:
                        return _context9.abrupt("return", _context9.sent);

                      case 3:
                      case "end":
                        return _context9.stop();
                    }
                  }
                });
              })));

            case 12:
              return _context10.abrupt("return", _context10.sent);

            case 13:
            case "end":
              return _context10.stop();
          }
        }
      }, null, this);
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
     * @param {string} subjectType="group - ("user" | "group" | "ntp") - The type of the subject
     * @param {string} subjectName - The name of the subject
     * @param {string} subjectId - The ID of the subject
     * @param {string} profileName - The profile to apply for the permission
     * @param {string | number} start - The start time for the permission
     * @param {string | number} end - The end time for the permission
     */

  }, {
    key: "SetPermission",
    value: function SetPermission(_ref10) {
      var policyId, policyWriteToken, itemId, _ref10$subjectSource, subjectSource, _ref10$subjectType, subjectType, subjectName, subjectId, profileName, start, end, policyLibraryId, existingPermissions, index, permissionSpec, subjectInfo, userInfo, _userInfo;

      return _regeneratorRuntime.async(function SetPermission$(_context11) {
        while (1) {
          switch (_context11.prev = _context11.next) {
            case 0:
              policyId = _ref10.policyId, policyWriteToken = _ref10.policyWriteToken, itemId = _ref10.itemId, _ref10$subjectSource = _ref10.subjectSource, subjectSource = _ref10$subjectSource === void 0 ? "fabric" : _ref10$subjectSource, _ref10$subjectType = _ref10.subjectType, subjectType = _ref10$subjectType === void 0 ? "group" : _ref10$subjectType, subjectName = _ref10.subjectName, subjectId = _ref10.subjectId, profileName = _ref10.profileName, start = _ref10.start, end = _ref10.end;
              ValidatePresence("policyId", policyId);
              ValidatePresence("policyWriteToken", policyWriteToken);
              ValidatePresence("itemId", itemId);
              ValidatePresence("subjectType", subjectType);
              ValidatePresence("subjectSource", subjectSource);
              ValidatePresence("subjectId", subjectId);
              ValidatePresence("profileName", profileName);
              start = this.FormatDate(start);
              end = this.FormatDate(end);
              _context11.next = 12;
              return _regeneratorRuntime.awrap(this.client.ContentObjectLibraryId({
                objectId: policyId
              }));

            case 12:
              policyLibraryId = _context11.sent;

              // Allow address to be passed in for fabric subjects, though spec requires iusr/igrp hash
              if (subjectSource === "fabric") {
                if (subjectType === "group") {
                  if (!subjectId.startsWith("igrp")) {
                    subjectId = "igrp".concat(this.client.utils.AddressToHash(subjectId));
                  }
                } else if (subjectType === "user") {
                  if (!subjectId.startsWith("iusr")) {
                    subjectId = "iusr".concat(this.client.utils.AddressToHash(subjectId));
                  }
                }
              }

              _context11.next = 16;
              return _regeneratorRuntime.awrap(this.client.ContentObjectMetadata({
                libraryId: policyLibraryId,
                objectId: policyId,
                writeToken: policyWriteToken,
                metadataSubtree: UrlJoin("auth_policy_spec", itemId)
              }));

            case 16:
              existingPermissions = _context11.sent;

              if (existingPermissions) {
                _context11.next = 19;
                break;
              }

              throw Error("Unable to add permissions to uninitialized item");

            case 19:
              if (existingPermissions.profiles[profileName]) {
                _context11.next = 21;
                break;
              }

              throw Error("Profile '".concat(profileName, "' does not exist"));

            case 21:
              index = existingPermissions.permissions.findIndex(function (permission) {
                if (subjectSource === "fabric") {
                  return permission.subject.id === subjectId;
                } else {
                  return permission.subject.oauth_id === subjectId;
                }
              });

              if (index < 0) {
                index = existingPermissions.permissions.length;
              }

              permissionSpec = {
                profile: profileName
              };

              if (start) {
                permissionSpec.start = start;
              }

              if (end) {
                permissionSpec.end = end;
              }

              if (!(subjectSource === "fabric")) {
                _context11.next = 42;
                break;
              }

              if (!(subjectType === "group")) {
                _context11.next = 31;
                break;
              }

              subjectInfo = {
                id: subjectId,
                type: "group"
              };
              _context11.next = 40;
              break;

            case 31:
              if (!(subjectType === "user")) {
                _context11.next = 35;
                break;
              }

              subjectInfo = {
                id: subjectId,
                type: "user"
              };
              _context11.next = 40;
              break;

            case 35:
              if (!(subjectType === "ntp")) {
                _context11.next = 39;
                break;
              }

              subjectInfo = {
                id: subjectId,
                type: "otp"
              };
              _context11.next = 40;
              break;

            case 39:
              throw Error("Invalid subject type: ".concat(subjectType));

            case 40:
              _context11.next = 55;
              break;

            case 42:
              if (!(subjectSource === "oauth")) {
                _context11.next = 54;
                break;
              }

              if (!(subjectType === "group")) {
                _context11.next = 47;
                break;
              }

              subjectInfo = {
                id: subjectName,
                oauth_id: subjectId,
                type: "oauth_group"
              };
              _context11.next = 52;
              break;

            case 47:
              if (!(subjectType === "user")) {
                _context11.next = 51;
                break;
              }

              subjectInfo = {
                id: subjectName,
                oauth_id: subjectId,
                type: "oauth_user"
              };
              _context11.next = 52;
              break;

            case 51:
              throw Error("Invalid subject type: ".concat(subjectType));

            case 52:
              _context11.next = 55;
              break;

            case 54:
              throw Error("Invalid subject source: ".concat(subjectSource));

            case 55:
              permissionSpec.subject = subjectInfo;
              existingPermissions.permissions[index] = permissionSpec;
              _context11.next = 59;
              return _regeneratorRuntime.awrap(this.client.ReplaceMetadata({
                libraryId: policyLibraryId,
                objectId: policyId,
                writeToken: policyWriteToken,
                metadataSubtree: UrlJoin("auth_policy_spec", itemId, "permissions"),
                metadata: existingPermissions.permissions
              }));

            case 59:
              if (!(subjectSource === "fabric" && subjectType === "user")) {
                _context11.next = 68;
                break;
              }

              _context11.next = 62;
              return _regeneratorRuntime.awrap(this.client.ContentObjectMetadata({
                libraryId: policyLibraryId,
                objectId: policyId,
                writeToken: policyWriteToken,
                metadataSubtree: UrlJoin("auth_policy_settings", "fabric_users", this.client.utils.HashToAddress(subjectId))
              }));

            case 62:
              userInfo = _context11.sent;

              if (userInfo) {
                _context11.next = 66;
                break;
              }

              _context11.next = 66;
              return _regeneratorRuntime.awrap(this.client.ReplaceMetadata({
                libraryId: policyLibraryId,
                objectId: policyId,
                writeToken: policyWriteToken,
                metadataSubtree: UrlJoin("auth_policy_settings", "fabric_users", this.client.utils.HashToAddress(subjectId)),
                metadata: {
                  address: this.client.utils.HashToAddress(subjectId),
                  name: subjectName
                }
              }));

            case 66:
              _context11.next = 75;
              break;

            case 68:
              if (!(subjectSource === "fabric" && subjectType === "ntp")) {
                _context11.next = 75;
                break;
              }

              _context11.next = 71;
              return _regeneratorRuntime.awrap(this.client.ContentObjectMetadata({
                libraryId: policyLibraryId,
                objectId: policyId,
                writeToken: policyWriteToken,
                metadataSubtree: UrlJoin("auth_policy_settings", "ntp_instances", subjectId)
              }));

            case 71:
              _userInfo = _context11.sent;

              if (_userInfo) {
                _context11.next = 75;
                break;
              }

              _context11.next = 75;
              return _regeneratorRuntime.awrap(this.client.ReplaceMetadata({
                libraryId: policyLibraryId,
                objectId: policyId,
                writeToken: policyWriteToken,
                metadataSubtree: UrlJoin("auth_policy_settings", "ntp_instances", subjectId),
                metadata: {
                  address: subjectId,
                  ntpId: subjectId,
                  name: subjectName,
                  type: "ntpInstance"
                }
              }));

            case 75:
            case "end":
              return _context11.stop();
          }
        }
      }, null, this);
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

  }, {
    key: "RemovePermission",
    value: function RemovePermission(_ref11) {
      var _this4 = this;

      var policyId, policyWriteToken, itemId, subjectId, policyLibraryId, permissions, id;
      return _regeneratorRuntime.async(function RemovePermission$(_context13) {
        while (1) {
          switch (_context13.prev = _context13.next) {
            case 0:
              policyId = _ref11.policyId, policyWriteToken = _ref11.policyWriteToken, itemId = _ref11.itemId, subjectId = _ref11.subjectId;
              ValidatePresence("policyId", policyId);
              ValidatePresence("policyWriteToken", policyWriteToken);
              ValidatePresence("itemId", itemId);
              ValidatePresence("subjectId", subjectId);
              _context13.next = 7;
              return _regeneratorRuntime.awrap(this.client.ContentObjectLibraryId({
                objectId: policyId
              }));

            case 7:
              policyLibraryId = _context13.sent;
              _context13.next = 10;
              return _regeneratorRuntime.awrap(this.client.ContentObjectMetadata({
                libraryId: policyLibraryId,
                objectId: policyId,
                writeToken: policyWriteToken,
                metadataSubtree: UrlJoin("auth_policy_spec", itemId, "permissions")
              }));

            case 10:
              permissions = _context13.sent;

              if (permissions) {
                _context13.next = 13;
                break;
              }

              return _context13.abrupt("return");

            case 13:
              if (!subjectId.startsWith("0x")) {
                _context13.next = 23;
                break;
              }

              id = this.client.utils.AddressToObjectId(subjectId);
              _context13.next = 17;
              return _regeneratorRuntime.awrap(this.client.AccessType({
                id: id
              }));

            case 17:
              _context13.t0 = _context13.sent;

              if (!(_context13.t0 === "group")) {
                _context13.next = 22;
                break;
              }

              subjectId = "igrp".concat(this.client.utils.AddressToHash(subjectId));
              _context13.next = 23;
              break;

            case 22:
              subjectId = "iusr".concat(this.client.utils.AddressToHash(subjectId));

            case 23:
              _context13.next = 25;
              return _regeneratorRuntime.awrap(Promise.all(permissions.map(function _callee2(permission, index) {
                return _regeneratorRuntime.async(function _callee2$(_context12) {
                  while (1) {
                    switch (_context12.prev = _context12.next) {
                      case 0:
                        if (!(permission.subject.id === subjectId || permission.subject.oauth_id === subjectId)) {
                          _context12.next = 3;
                          break;
                        }

                        _context12.next = 3;
                        return _regeneratorRuntime.awrap(_this4.client.DeleteMetadata({
                          libraryId: policyLibraryId,
                          objectId: policyId,
                          writeToken: policyWriteToken,
                          metadataSubtree: UrlJoin("auth_policy_spec", itemId, "permissions", index.toString())
                        }));

                      case 3:
                      case "end":
                        return _context12.stop();
                    }
                  }
                });
              })));

            case 25:
            case "end":
              return _context13.stop();
          }
        }
      }, null, this);
    }
    /**
     * Retrieve all permissions for the specified subject.
     *
     * @methodGroup Permissions
     * @namedParams
     * @param {string} policyId - Object ID of the policy
     * @param {string=} policyWriteToken - Write token for the policy object - if specified, info will be retrieved from the write draft instead of the last finalized policy object
     * @param {string} subjectId - The ID of the subject
     *
     * @returns {Object} - All permissions pertaining to the given subject. Format of result for each item is identical to the format of `ItemPolicy`
     */

  }, {
    key: "SubjectPermissions",
    value: function SubjectPermissions(_ref12) {
      var _this5 = this;

      var policyId, policyWriteToken, subjectId, id, policyLibraryId, policy, allSubjectPermissions, _i, _Object$keys, itemId, itemPermissions, subjectPermissions;

      return _regeneratorRuntime.async(function SubjectPermissions$(_context15) {
        while (1) {
          switch (_context15.prev = _context15.next) {
            case 0:
              policyId = _ref12.policyId, policyWriteToken = _ref12.policyWriteToken, subjectId = _ref12.subjectId;
              ValidatePresence("policyId", policyId);
              ValidatePresence("subjectId", subjectId); // Convert address to appropriate ID

              if (!subjectId.startsWith("0x")) {
                _context15.next = 13;
                break;
              }

              id = this.client.utils.AddressToObjectId(subjectId);
              _context15.next = 7;
              return _regeneratorRuntime.awrap(this.client.AccessType({
                id: id
              }));

            case 7:
              _context15.t0 = _context15.sent;

              if (!(_context15.t0 === "group")) {
                _context15.next = 12;
                break;
              }

              subjectId = "igrp".concat(this.client.utils.AddressToHash(subjectId));
              _context15.next = 13;
              break;

            case 12:
              subjectId = "iusr".concat(this.client.utils.AddressToHash(subjectId));

            case 13:
              _context15.next = 15;
              return _regeneratorRuntime.awrap(this.client.ContentObjectLibraryId({
                objectId: policyId
              }));

            case 15:
              policyLibraryId = _context15.sent;
              _context15.next = 18;
              return _regeneratorRuntime.awrap(this.client.ContentObjectMetadata({
                libraryId: policyLibraryId,
                objectId: policyId,
                writeToken: policyWriteToken,
                metadataSubtree: UrlJoin("auth_policy_spec")
              }));

            case 18:
              policy = _context15.sent;
              allSubjectPermissions = {};
              _i = 0, _Object$keys = Object.keys(policy);

            case 21:
              if (!(_i < _Object$keys.length)) {
                _context15.next = 31;
                break;
              }

              itemId = _Object$keys[_i];
              itemPermissions = policy[itemId].permissions || [];
              _context15.next = 26;
              return _regeneratorRuntime.awrap(Promise.all(itemPermissions.filter(function (permission) {
                return (permission.subject || {}).oauth_id === subjectId || (permission.subject || {}).id === subjectId;
              }).map(function _callee3(permission) {
                return _regeneratorRuntime.async(function _callee3$(_context14) {
                  while (1) {
                    switch (_context14.prev = _context14.next) {
                      case 0:
                        _context14.next = 2;
                        return _regeneratorRuntime.awrap(_this5.FormatPermission({
                          policyId: policyId,
                          policyWriteToken: policyWriteToken,
                          permission: permission
                        }));

                      case 2:
                        return _context14.abrupt("return", _context14.sent);

                      case 3:
                      case "end":
                        return _context14.stop();
                    }
                  }
                });
              })));

            case 26:
              subjectPermissions = _context15.sent;

              if (subjectPermissions.length > 0) {
                allSubjectPermissions[itemId] = _objectSpread({}, policy[itemId], {
                  permissions: subjectPermissions
                });
              }

            case 28:
              _i++;
              _context15.next = 21;
              break;

            case 31:
              return _context15.abrupt("return", allSubjectPermissions);

            case 32:
            case "end":
              return _context15.stop();
          }
        }
      }, null, this);
    }
    /**
     * Remove all permissions for the specified subject.
     *
     * @methodGroup Permissions
     * @namedParams
     * @param {string} policyId - Object ID of the policy
     * @param {string} policyWriteToken - Write token for the policy
     * @param {string} subjectId - The ID of the subject
     */

  }, {
    key: "RemoveSubjectPermissions",
    value: function RemoveSubjectPermissions(_ref13) {
      var _this6 = this;

      var policyId, policyWriteToken, subjectId, subjectPermissions;
      return _regeneratorRuntime.async(function RemoveSubjectPermissions$(_context17) {
        while (1) {
          switch (_context17.prev = _context17.next) {
            case 0:
              policyId = _ref13.policyId, policyWriteToken = _ref13.policyWriteToken, subjectId = _ref13.subjectId;
              ValidatePresence("policyId", policyId);
              ValidatePresence("policyWriteToken", policyWriteToken);
              ValidatePresence("subjectId", subjectId);
              _context17.next = 6;
              return _regeneratorRuntime.awrap(this.SubjectPermissions({
                policyId: policyId,
                policyWriteToken: policyWriteToken,
                subjectId: subjectId
              }));

            case 6:
              subjectPermissions = _context17.sent;
              _context17.next = 9;
              return _regeneratorRuntime.awrap(this.client.utils.LimitedMap(5, Object.keys(subjectPermissions), function _callee4(itemId) {
                return _regeneratorRuntime.async(function _callee4$(_context16) {
                  while (1) {
                    switch (_context16.prev = _context16.next) {
                      case 0:
                        _context16.next = 2;
                        return _regeneratorRuntime.awrap(_this6.RemovePermission({
                          policyId: policyId,
                          policyWriteToken: policyWriteToken,
                          subjectId: subjectId,
                          itemId: itemId
                        }));

                      case 2:
                      case "end":
                        return _context16.stop();
                    }
                  }
                });
              }));

            case 9:
            case "end":
              return _context17.stop();
          }
        }
      }, null, this);
    }
  }]);

  return PermissionsClient;
}();

module.exports = PermissionsClient;