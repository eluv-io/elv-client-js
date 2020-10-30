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
   *  - A profile may have 'start' and 'end' times
   *
   *  - A profile includes permission specifications for both the assets and the offerings of an item. Both must be specified when creating or modifying a profile.
   *
   *  - For both assets and offerings, there is a `default_permission` entry, which can be either 'full-access' or 'no-access'. This represents the access allowed to the assets and offerings when a permission for the profile is granted, excepting any custom permissions that override it.
   *
   *  - For both assets and offerings, a profile may have a 'custom_permissions' section, which specifies permissions for specific assets or offerings. These permissions must have a 'permission' entry which is either 'full-access' or 'no-access', and may have 'start' and 'end' times.
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
   *  - A permission may have 'start' and 'end' times. As mentioned above, the effective start and end times of a permission are the *most restrictive* of all applicable start and end times.
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
  function PermissionsClient(client) {
    _classCallCheck(this, PermissionsClient);

    this.client = client;
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
    /* Add / remove overall item permission */

    /**
     * Initialize policy for the specified item
     *
     * @namedParams
     * @param {string} policyId - Object ID of the policy
     * @param {string} policyWriteToken - Write token for the policy
     * @param {string} itemId - Object ID of the item
     * @param {object=} profiles={} - Profiles to create
     */

  }, {
    key: "InitializeItemPolicy",
    value: function InitializeItemPolicy(_ref) {
      var _this2 = this;

      var policyId, policyWriteToken, itemId, _ref$profiles, profiles, metadata, assetMetadata, displayTitle, itemSpec;

      return _regeneratorRuntime.async(function InitializeItemPolicy$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              policyId = _ref.policyId, policyWriteToken = _ref.policyWriteToken, itemId = _ref.itemId, _ref$profiles = _ref.profiles, profiles = _ref$profiles === void 0 ? {} : _ref$profiles;
              ValidatePresence("policyId", policyId);
              ValidatePresence("policyWriteToken", policyWriteToken);
              ValidatePresence("itemId", itemId);
              ValidatePresence("profiles", profiles);
              _context.t1 = _regeneratorRuntime;
              _context.t2 = this.client;
              _context.next = 9;
              return _regeneratorRuntime.awrap(this.client.ContentObjectLibraryId({
                objectId: itemId
              }));

            case 9:
              _context.t3 = _context.sent;
              _context.t4 = itemId;
              _context.t5 = ["public/name", "public/asset_metadata/title", "public/asset_metadata/display_title"];
              _context.t6 = {
                libraryId: _context.t3,
                objectId: _context.t4,
                select: _context.t5
              };
              _context.t7 = _context.t2.ContentObjectMetadata.call(_context.t2, _context.t6);
              _context.next = 16;
              return _context.t1.awrap.call(_context.t1, _context.t7);

            case 16:
              _context.t0 = _context.sent;

              if (_context.t0) {
                _context.next = 19;
                break;
              }

              _context.t0 = {};

            case 19:
              metadata = _context.t0;
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
              _context.t8 = _regeneratorRuntime;
              _context.t9 = this.client;
              _context.next = 28;
              return _regeneratorRuntime.awrap(this.client.ContentObjectLibraryId({
                objectId: policyId
              }));

            case 28:
              _context.t10 = _context.sent;
              _context.t11 = policyId;
              _context.t12 = policyWriteToken;
              _context.t13 = UrlJoin("auth_policy_spec", itemId);
              _context.t14 = itemSpec;
              _context.t15 = {
                libraryId: _context.t10,
                objectId: _context.t11,
                writeToken: _context.t12,
                metadataSubtree: _context.t13,
                metadata: _context.t14
              };
              _context.t16 = _context.t9.ReplaceMetadata.call(_context.t9, _context.t15);
              _context.next = 37;
              return _context.t8.awrap.call(_context.t8, _context.t16);

            case 37:
            case "end":
              return _context.stop();
          }
        }
      }, null, this);
    }
    /**
     * Remove the specified item policy
     *
     * @namedParams
     * @param {string} policyId - Object ID of the policy
     * @param {string} policyWriteToken - Write token for the policy
     * @param {string} itemId - Object ID of the item
     */

  }, {
    key: "RemoveItemPolicy",
    value: function RemoveItemPolicy(_ref2) {
      var policyId, policyWriteToken, itemId;
      return _regeneratorRuntime.async(function RemoveItemPolicy$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              policyId = _ref2.policyId, policyWriteToken = _ref2.policyWriteToken, itemId = _ref2.itemId;
              ValidatePresence("policyId", policyId);
              ValidatePresence("policyWriteToken", policyWriteToken);
              ValidatePresence("itemId", itemId);
              _context2.t0 = _regeneratorRuntime;
              _context2.t1 = this.client;
              _context2.next = 8;
              return _regeneratorRuntime.awrap(this.client.ContentObjectLibraryId({
                objectId: policyId
              }));

            case 8:
              _context2.t2 = _context2.sent;
              _context2.t3 = policyId;
              _context2.t4 = policyWriteToken;
              _context2.t5 = UrlJoin("auth_policy_spec", itemId);
              _context2.t6 = {
                libraryId: _context2.t2,
                objectId: _context2.t3,
                writeToken: _context2.t4,
                metadataSubtree: _context2.t5
              };
              _context2.t7 = _context2.t1.DeleteMetadata.call(_context2.t1, _context2.t6);
              _context2.next = 16;
              return _context2.t0.awrap.call(_context2.t0, _context2.t7);

            case 16:
            case "end":
              return _context2.stop();
          }
        }
      }, null, this);
    }
    /* Get / set / remove profile permissions */

    /**
     * Retrieve profile information on the specified item policy
     *
     * @namedParams
     * @param {string} policyId - Object ID of the policy
     * @param {string} itemId - Object ID of the item
     * @param {string=} profileName - The name of the profile. If not specified, all profiles will be returned
     */

  }, {
    key: "ItemProfiles",
    value: function ItemProfiles(_ref3) {
      var policyId, itemId, profileName;
      return _regeneratorRuntime.async(function ItemProfiles$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              policyId = _ref3.policyId, itemId = _ref3.itemId, profileName = _ref3.profileName;
              _context3.t0 = _regeneratorRuntime;
              _context3.t1 = this.client;
              _context3.next = 5;
              return _regeneratorRuntime.awrap(this.client.ContentObjectLibraryId({
                objectId: policyId
              }));

            case 5:
              _context3.t2 = _context3.sent;
              _context3.t3 = policyId;
              _context3.t4 = UrlJoin("auth_policy_spec", itemId, "profiles", profileName || "");
              _context3.t5 = {
                libraryId: _context3.t2,
                objectId: _context3.t3,
                metadataSubtree: _context3.t4
              };
              _context3.t6 = _context3.t1.ContentObjectMetadata.call(_context3.t1, _context3.t5);
              _context3.next = 12;
              return _context3.t0.awrap.call(_context3.t0, _context3.t6);

            case 12:
              return _context3.abrupt("return", _context3.sent);

            case 13:
            case "end":
              return _context3.stop();
          }
        }
      }, null, this);
    }
    /**
     * Create or modify a profile for the specified item policy
     *
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
    value: function SetProfile(_ref4) {
      var policyId, policyWriteToken, itemId, profileName, profileSpec;
      return _regeneratorRuntime.async(function SetProfile$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              policyId = _ref4.policyId, policyWriteToken = _ref4.policyWriteToken, itemId = _ref4.itemId, profileName = _ref4.profileName, profileSpec = _ref4.profileSpec;
              ValidatePresence("policyId", policyId);
              ValidatePresence("policyWriteToken", policyWriteToken);
              ValidatePresence("itemId", itemId);
              ValidatePresence("profileName", profileName);
              ValidatePresence("profileSpec", profileSpec);
              _context4.t0 = _regeneratorRuntime;
              _context4.t1 = this.client;
              _context4.next = 10;
              return _regeneratorRuntime.awrap(this.client.ContentObjectLibraryId({
                objectId: policyId
              }));

            case 10:
              _context4.t2 = _context4.sent;
              _context4.t3 = policyId;
              _context4.t4 = policyWriteToken;
              _context4.t5 = UrlJoin("auth_policy_spec", itemId, "profiles", profileName);
              _context4.t6 = this.FormatProfile(profileSpec);
              _context4.t7 = {
                libraryId: _context4.t2,
                objectId: _context4.t3,
                writeToken: _context4.t4,
                metadataSubtree: _context4.t5,
                metadata: _context4.t6
              };
              _context4.t8 = _context4.t1.ReplaceMetadata.call(_context4.t1, _context4.t7);
              _context4.next = 19;
              return _context4.t0.awrap.call(_context4.t0, _context4.t8);

            case 19:
            case "end":
              return _context4.stop();
          }
        }
      }, null, this);
    }
    /**
     * Remove a profile from the specified item policy
     *
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
    value: function RemoveProfile(_ref5) {
      var policyId, policyWriteToken, itemId, profileName;
      return _regeneratorRuntime.async(function RemoveProfile$(_context5) {
        while (1) {
          switch (_context5.prev = _context5.next) {
            case 0:
              policyId = _ref5.policyId, policyWriteToken = _ref5.policyWriteToken, itemId = _ref5.itemId, profileName = _ref5.profileName;
              ValidatePresence("policyId", policyId);
              ValidatePresence("policyWriteToken", policyWriteToken);
              ValidatePresence("itemId", itemId);
              ValidatePresence("profileName", profileName);
              _context5.t0 = _regeneratorRuntime;
              _context5.t1 = this.client;
              _context5.next = 9;
              return _regeneratorRuntime.awrap(this.client.ContentObjectLibraryId({
                objectId: policyId
              }));

            case 9:
              _context5.t2 = _context5.sent;
              _context5.t3 = policyId;
              _context5.t4 = policyWriteToken;
              _context5.t5 = UrlJoin("auth_policy_spec", itemId, "profiles", profileName);
              _context5.t6 = {
                libraryId: _context5.t2,
                objectId: _context5.t3,
                writeToken: _context5.t4,
                metadataSubtree: _context5.t5
              };
              _context5.t7 = _context5.t1.DeleteMetadata.call(_context5.t1, _context5.t6);
              _context5.next = 17;
              return _context5.t0.awrap.call(_context5.t0, _context5.t7);

            case 17:
            case "end":
              return _context5.stop();
          }
        }
      }, null, this);
    }
    /* Get / set / remove subject permissions */

    /**
     * Retrieve the permissions for the specified item policy
     *
     * @namedParams
     * @param {string} policyId - Object ID of the policy
     * @param {string} itemId - Object ID of the item
     *
     * @return {Promise<Array>} - The list of permissions for the specified item
     */

  }, {
    key: "ItemPermissions",
    value: function ItemPermissions(_ref6) {
      var _this3 = this;

      var policyId, itemId, libraryId, permissions;
      return _regeneratorRuntime.async(function ItemPermissions$(_context7) {
        while (1) {
          switch (_context7.prev = _context7.next) {
            case 0:
              policyId = _ref6.policyId, itemId = _ref6.itemId;
              _context7.next = 3;
              return _regeneratorRuntime.awrap(this.client.ContentObjectLibraryId({
                objectId: policyId
              }));

            case 3:
              libraryId = _context7.sent;
              _context7.next = 6;
              return _regeneratorRuntime.awrap(this.client.ContentObjectMetadata({
                libraryId: libraryId,
                objectId: policyId,
                metadataSubtree: UrlJoin("auth_policy_spec", itemId, "permissions")
              }));

            case 6:
              _context7.t0 = _context7.sent;

              if (_context7.t0) {
                _context7.next = 9;
                break;
              }

              _context7.t0 = [];

            case 9:
              permissions = _context7.t0;
              _context7.next = 12;
              return _regeneratorRuntime.awrap(Promise.all(permissions.map(function _callee(permission) {
                var subjectSource, subjectType, subjectId, subjectName, contentSpaceLibraryId, permissionSpec;
                return _regeneratorRuntime.async(function _callee$(_context6) {
                  while (1) {
                    switch (_context6.prev = _context6.next) {
                      case 0:
                        subjectSource = permission.subject.type.startsWith("oauth") ? "oauth" : "fabric";
                        subjectType = permission.subject.type.includes("group") ? "group" : "user";
                        subjectId = subjectSource === "oauth" ? permission.subject.oauth_id : _this3.client.utils.HashToAddress(permission.subject.id);
                        subjectName = permission.subject.id;

                        if (!(subjectSource === "fabric")) {
                          _context6.next = 26;
                          break;
                        }

                        if (!(subjectType === "group")) {
                          _context6.next = 17;
                          break;
                        }

                        _context6.next = 8;
                        return _regeneratorRuntime.awrap(_this3.client.ContentSpaceId());

                      case 8:
                        contentSpaceLibraryId = _context6.sent.replace("ispc", "ilib");
                        _context6.next = 11;
                        return _regeneratorRuntime.awrap(_this3.client.ContentObjectMetadata({
                          libraryId: contentSpaceLibraryId,
                          objectId: _this3.client.utils.AddressToObjectId(subjectId),
                          metadataSubtree: UrlJoin("public", "name")
                        }));

                      case 11:
                        _context6.t0 = _context6.sent;

                        if (_context6.t0) {
                          _context6.next = 14;
                          break;
                        }

                        _context6.t0 = subjectId;

                      case 14:
                        subjectName = _context6.t0;
                        _context6.next = 26;
                        break;

                      case 17:
                        _context6.next = 19;
                        return _regeneratorRuntime.awrap(_this3.client.ContentObjectMetadata({
                          libraryId: libraryId,
                          objectId: policyId,
                          metadataSubtree: UrlJoin("auth_policy_settings", "fabric_users", subjectId)
                        }));

                      case 19:
                        _context6.t2 = _context6.sent;

                        if (_context6.t2) {
                          _context6.next = 22;
                          break;
                        }

                        _context6.t2 = {};

                      case 22:
                        _context6.t1 = _context6.t2.name;

                        if (_context6.t1) {
                          _context6.next = 25;
                          break;
                        }

                        _context6.t1 = subjectId;

                      case 25:
                        subjectName = _context6.t1;

                      case 26:
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

                        return _context6.abrupt("return", permissionSpec);

                      case 30:
                      case "end":
                        return _context6.stop();
                    }
                  }
                });
              })));

            case 12:
              return _context7.abrupt("return", _context7.sent);

            case 13:
            case "end":
              return _context7.stop();
          }
        }
      }, null, this);
    }
    /**
     * Add or modify permission for the specified subject to the specified item policy
     *
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

  }, {
    key: "SetPermission",
    value: function SetPermission(_ref7) {
      var policyId, policyWriteToken, itemId, _ref7$subjectSource, subjectSource, _ref7$subjectType, subjectType, subjectName, subjectId, profileName, start, end, policyLibraryId, existingPermissions, index, permissionSpec, subjectInfo, userInfo;

      return _regeneratorRuntime.async(function SetPermission$(_context8) {
        while (1) {
          switch (_context8.prev = _context8.next) {
            case 0:
              policyId = _ref7.policyId, policyWriteToken = _ref7.policyWriteToken, itemId = _ref7.itemId, _ref7$subjectSource = _ref7.subjectSource, subjectSource = _ref7$subjectSource === void 0 ? "fabric" : _ref7$subjectSource, _ref7$subjectType = _ref7.subjectType, subjectType = _ref7$subjectType === void 0 ? "group" : _ref7$subjectType, subjectName = _ref7.subjectName, subjectId = _ref7.subjectId, profileName = _ref7.profileName, start = _ref7.start, end = _ref7.end;
              ValidatePresence("policyId", policyId);
              ValidatePresence("policyWriteToken", policyWriteToken);
              ValidatePresence("itemId", itemId);
              ValidatePresence("subjectType", subjectType);
              ValidatePresence("subjectSource", subjectSource);
              ValidatePresence("subjectId", subjectId);
              ValidatePresence("profileName", profileName);
              start = this.FormatDate(start);
              end = this.FormatDate(end);
              _context8.next = 12;
              return _regeneratorRuntime.awrap(this.client.ContentObjectLibraryId({
                objectId: policyId
              }));

            case 12:
              policyLibraryId = _context8.sent;

              // Allow address to be passed in for fabric subjects, though spec requires iusr/igrp hash
              if (subjectSource === "fabric") {
                if (subjectType === "group") {
                  if (!subjectId.startsWith("igrp")) {
                    subjectId = "igrp".concat(this.client.utils.AddressToHash(subjectId));
                  }
                } else {
                  if (!subjectId.startsWith("iusr")) {
                    subjectId = "iusr".concat(this.client.utils.AddressToHash(subjectId));
                  }
                }
              }

              _context8.next = 16;
              return _regeneratorRuntime.awrap(this.client.ContentObjectMetadata({
                libraryId: policyLibraryId,
                objectId: policyId,
                writeToken: policyWriteToken,
                metadataSubtree: UrlJoin("auth_policy_spec", itemId)
              }));

            case 16:
              existingPermissions = _context8.sent;

              if (existingPermissions) {
                _context8.next = 19;
                break;
              }

              throw Error("Unable to add permissions to uninitialized item");

            case 19:
              if (existingPermissions.profiles[profileName]) {
                _context8.next = 21;
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
                _context8.next = 38;
                break;
              }

              if (!(subjectType === "group")) {
                _context8.next = 31;
                break;
              }

              subjectInfo = {
                id: subjectId,
                type: "group"
              };
              _context8.next = 36;
              break;

            case 31:
              if (!(subjectType === "user")) {
                _context8.next = 35;
                break;
              }

              subjectInfo = {
                id: subjectId,
                type: "user"
              };
              _context8.next = 36;
              break;

            case 35:
              throw Error("Invalid subject type: ".concat(subjectType));

            case 36:
              _context8.next = 51;
              break;

            case 38:
              if (!(subjectSource === "oauth")) {
                _context8.next = 50;
                break;
              }

              if (!(subjectType === "group")) {
                _context8.next = 43;
                break;
              }

              subjectInfo = {
                id: subjectName,
                oauth_id: subjectId,
                type: "oauth_group"
              };
              _context8.next = 48;
              break;

            case 43:
              if (!(subjectType === "user")) {
                _context8.next = 47;
                break;
              }

              subjectInfo = {
                id: subjectName,
                oauth_id: subjectId,
                type: "oauth_user"
              };
              _context8.next = 48;
              break;

            case 47:
              throw Error("Invalid subject type: ".concat(subjectType));

            case 48:
              _context8.next = 51;
              break;

            case 50:
              throw Error("Invalid subject source: ".concat(subjectSource));

            case 51:
              permissionSpec.subject = subjectInfo;
              existingPermissions.permissions[index] = permissionSpec;
              _context8.next = 55;
              return _regeneratorRuntime.awrap(this.client.ReplaceMetadata({
                libraryId: policyLibraryId,
                objectId: policyId,
                writeToken: policyWriteToken,
                metadataSubtree: UrlJoin("auth_policy_spec", itemId, "permissions"),
                metadata: existingPermissions.permissions
              }));

            case 55:
              if (!(subjectSource === "fabric" && subjectType === "user")) {
                _context8.next = 62;
                break;
              }

              _context8.next = 58;
              return _regeneratorRuntime.awrap(this.client.ContentObjectMetadata({
                libraryId: policyLibraryId,
                objectId: policyId,
                metadataSubtree: UrlJoin("auth_policy_settings", "fabric_users", this.client.utils.HashToAddress(subjectId))
              }));

            case 58:
              userInfo = _context8.sent;

              if (userInfo) {
                _context8.next = 62;
                break;
              }

              _context8.next = 62;
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

            case 62:
            case "end":
              return _context8.stop();
          }
        }
      }, null, this);
    }
    /**
     * Remove permission for the specified subject from the specified item policy
     *
     * @namedParams
     * @param {string} policyId - Object ID of the policy
     * @param {string} policyWriteToken - Write token for the policy
     * @param {string} itemId - Object ID of the item
     * @param {string} subjectId - The ID of the subject
     */

  }, {
    key: "RemovePermission",
    value: function RemovePermission(_ref8) {
      var policyId, policyWriteToken, itemId, subjectId, policyLibraryId, permissions, id, index;
      return _regeneratorRuntime.async(function RemovePermission$(_context9) {
        while (1) {
          switch (_context9.prev = _context9.next) {
            case 0:
              policyId = _ref8.policyId, policyWriteToken = _ref8.policyWriteToken, itemId = _ref8.itemId, subjectId = _ref8.subjectId;
              ValidatePresence("policyId", policyId);
              ValidatePresence("policyWriteToken", policyWriteToken);
              ValidatePresence("itemId", itemId);
              ValidatePresence("subjectId", subjectId);
              _context9.next = 7;
              return _regeneratorRuntime.awrap(this.client.ContentObjectLibraryId({
                objectId: policyId
              }));

            case 7:
              policyLibraryId = _context9.sent;
              _context9.next = 10;
              return _regeneratorRuntime.awrap(this.client.ContentObjectMetadata({
                libraryId: policyLibraryId,
                objectId: policyId,
                metadataSubtree: UrlJoin("auth_policy_spec", itemId, "permissions")
              }));

            case 10:
              permissions = _context9.sent;

              if (permissions) {
                _context9.next = 13;
                break;
              }

              return _context9.abrupt("return");

            case 13:
              if (!subjectId.startsWith("0x")) {
                _context9.next = 23;
                break;
              }

              id = this.client.utils.AddressToObjectId(subjectId);
              _context9.next = 17;
              return _regeneratorRuntime.awrap(this.client.AccessType({
                id: id
              }));

            case 17:
              _context9.t0 = _context9.sent;

              if (!(_context9.t0 === "group")) {
                _context9.next = 22;
                break;
              }

              subjectId = "igrp".concat(this.client.utils.AddressToHash(subjectId));
              _context9.next = 23;
              break;

            case 22:
              subjectId = "iusr".concat(this.client.utils.AddressToHash(subjectId));

            case 23:
              index = permissions.findIndex(function (permission) {
                return permission.subject.id === subjectId || permission.subject.oauth_id === subjectId;
              });

              if (!(index < 0)) {
                _context9.next = 26;
                break;
              }

              return _context9.abrupt("return");

            case 26:
              _context9.next = 28;
              return _regeneratorRuntime.awrap(this.client.DeleteMetadata({
                libraryId: policyLibraryId,
                objectId: policyId,
                writeToken: policyWriteToken,
                metadataSubtree: UrlJoin("auth_policy_spec", itemId, "permissions", index.toString())
              }));

            case 28:
            case "end":
              return _context9.stop();
          }
        }
      }, null, this);
    }
  }]);

  return PermissionsClient;
}();

module.exports = PermissionsClient;