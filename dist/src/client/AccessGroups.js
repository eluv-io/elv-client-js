var _defineProperty = require("@babel/runtime/helpers/defineProperty");
var _toConsumableArray = require("@babel/runtime/helpers/toConsumableArray");
var _regeneratorRuntime = require("@babel/runtime/regenerator");
var _asyncToGenerator = require("@babel/runtime/helpers/asyncToGenerator");
function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }
function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }
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

var _require = require("../Validation"),
  ValidatePresence = _require.ValidatePresence,
  ValidateLibrary = _require.ValidateLibrary,
  ValidateObject = _require.ValidateObject,
  ValidateAddress = _require.ValidateAddress;

/**
 * Retrieve a list of all available access groups
 *
 * @methodGroup Access Groups
 * @return {Promise<Array>} - List of access groups
 */
exports.ListAccessGroups = /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee2() {
  var _this = this;
  var addresses, groups;
  return _regeneratorRuntime.wrap(function _callee2$(_context2) {
    while (1) switch (_context2.prev = _context2.next) {
      case 0:
        _context2.next = 2;
        return this.Collection({
          collectionType: "accessGroups"
        });
      case 2:
        addresses = _context2.sent.map(function (address) {
          return _this.utils.FormatAddress(address);
        });
        _context2.next = 5;
        return this.utils.LimitedMap(5, addresses, /*#__PURE__*/function () {
          var _ref2 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee(address) {
            var id, meta;
            return _regeneratorRuntime.wrap(function _callee$(_context) {
              while (1) switch (_context.prev = _context.next) {
                case 0:
                  id = _this.utils.AddressToHash(address);
                  _context.next = 3;
                  return _this.ContentObjectMetadata({
                    libraryId: _this.contentSpaceLibraryId,
                    objectId: "iq__".concat(id)
                  });
                case 3:
                  _context.t0 = _context.sent;
                  if (_context.t0) {
                    _context.next = 6;
                    break;
                  }
                  _context.t0 = {};
                case 6:
                  meta = _context.t0;
                  return _context.abrupt("return", {
                    address: address,
                    id: "igrp".concat(id),
                    meta: meta
                  });
                case 8:
                case "end":
                  return _context.stop();
              }
            }, _callee);
          }));
          return function (_x) {
            return _ref2.apply(this, arguments);
          };
        }());
      case 5:
        groups = _context2.sent;
        return _context2.abrupt("return", groups.sort(function (a, b) {
          var name1 = (a.meta["public"] || {}).name || "zz__".concat(a.address);
          var name2 = (b.meta["public"] || {}).name || "zz__".concat(b.address);
          return name1 < name2 ? -1 : 1;
        }));
      case 7:
      case "end":
        return _context2.stop();
    }
  }, _callee2, this);
}));
exports.SetGroupPermission = /*#__PURE__*/function () {
  var _ref4 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee3(_ref3) {
    var groupAddress, objectId, permission, _ref3$remove, remove, groupInfo, objectInfo, event;
    return _regeneratorRuntime.wrap(function _callee3$(_context3) {
      while (1) switch (_context3.prev = _context3.next) {
        case 0:
          groupAddress = _ref3.groupAddress, objectId = _ref3.objectId, permission = _ref3.permission, _ref3$remove = _ref3.remove, remove = _ref3$remove === void 0 ? false : _ref3$remove;
          _context3.next = 3;
          return this.authClient.ContractInfo({
            address: groupAddress
          });
        case 3:
          groupInfo = _context3.sent;
          _context3.next = 6;
          return this.authClient.ContractInfo({
            id: objectId
          });
        case 6:
          objectInfo = _context3.sent;
          if (!(Object.keys(groupInfo).length === 0)) {
            _context3.next = 9;
            break;
          }
          throw Error("No information returned for group address ".concat(groupAddress));
        case 9:
          if (!(!objectInfo.isV3 && objectInfo.accessType === this.authClient.ACCESS_TYPES.GROUP)) {
            _context3.next = 17;
            break;
          }
          if (!groupInfo.isV3) {
            _context3.next = 12;
            break;
          }
          throw Error("Unable to map V3 group to V2 object");
        case 12:
          _context3.next = 14;
          return this.CallContractMethodAndWait({
            contractAddress: groupAddress,
            methodName: "setAccessGroupRights",
            methodArgs: [this.utils.HashToAddress(objectId), permission === "manage" ? 2 : permission === "access" ? 1 : 0, permission === "none" || remove ? 0 : 2]
          });
        case 14:
          event = _context3.sent;
          _context3.next = 20;
          break;
        case 17:
          _context3.next = 19;
          return this.CallContractMethodAndWait({
            contractAddress: this.utils.HashToAddress(objectId),
            methodName: "setRights",
            methodArgs: [groupAddress, permission === "manage" ? 2 : permission === "access" ? 1 : 0, permission === "none" || remove ? 0 : 2]
          });
        case 19:
          event = _context3.sent;
        case 20:
          _context3.next = 22;
          return this.ExtractEventFromLogs({
            abi: groupInfo.abi,
            event: event,
            eventName: "RightsChanged"
          });
        case 22:
          return _context3.abrupt("return", _context3.sent);
        case 23:
        case "end":
          return _context3.stop();
      }
    }, _callee3, this);
  }));
  return function (_x2) {
    return _ref4.apply(this, arguments);
  };
}();

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
exports.AccessGroupOwner = /*#__PURE__*/function () {
  var _ref6 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee4(_ref5) {
    var contractAddress;
    return _regeneratorRuntime.wrap(function _callee4$(_context4) {
      while (1) switch (_context4.prev = _context4.next) {
        case 0:
          contractAddress = _ref5.contractAddress;
          contractAddress = ValidateAddress(contractAddress);
          this.Log("Retrieving owner of access group ".concat(contractAddress));
          _context4.next = 5;
          return this.authClient.Owner({
            address: contractAddress
          });
        case 5:
          return _context4.abrupt("return", _context4.sent);
        case 6:
        case "end":
          return _context4.stop();
      }
    }, _callee4, this);
  }));
  return function (_x3) {
    return _ref6.apply(this, arguments);
  };
}();

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
exports.AccessGroupMembers = /*#__PURE__*/function () {
  var _ref8 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee6(_ref7) {
    var _this2 = this;
    var contractAddress, length;
    return _regeneratorRuntime.wrap(function _callee6$(_context6) {
      while (1) switch (_context6.prev = _context6.next) {
        case 0:
          contractAddress = _ref7.contractAddress;
          contractAddress = ValidateAddress(contractAddress);
          this.Log("Retrieving members for group ".concat(contractAddress));
          _context6.next = 5;
          return this.CallContractMethod({
            contractAddress: contractAddress,
            methodName: "membersNum"
          });
        case 5:
          length = _context6.sent.toNumber();
          _context6.next = 8;
          return Promise.all(_toConsumableArray(Array(length)).map( /*#__PURE__*/function () {
            var _ref9 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee5(_, i) {
              return _regeneratorRuntime.wrap(function _callee5$(_context5) {
                while (1) switch (_context5.prev = _context5.next) {
                  case 0:
                    _context5.t0 = _this2.utils;
                    _context5.next = 3;
                    return _this2.CallContractMethod({
                      contractAddress: contractAddress,
                      methodName: "membersList",
                      methodArgs: [i]
                    });
                  case 3:
                    _context5.t1 = _context5.sent;
                    return _context5.abrupt("return", _context5.t0.FormatAddress.call(_context5.t0, _context5.t1));
                  case 5:
                  case "end":
                    return _context5.stop();
                }
              }, _callee5);
            }));
            return function (_x5, _x6) {
              return _ref9.apply(this, arguments);
            };
          }()));
        case 8:
          return _context6.abrupt("return", _context6.sent);
        case 9:
        case "end":
          return _context6.stop();
      }
    }, _callee6, this);
  }));
  return function (_x4) {
    return _ref8.apply(this, arguments);
  };
}();

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
exports.AccessGroupManagers = /*#__PURE__*/function () {
  var _ref11 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee8(_ref10) {
    var _this3 = this;
    var contractAddress, length;
    return _regeneratorRuntime.wrap(function _callee8$(_context8) {
      while (1) switch (_context8.prev = _context8.next) {
        case 0:
          contractAddress = _ref10.contractAddress;
          contractAddress = ValidateAddress(contractAddress);
          this.Log("Retrieving managers for group ".concat(contractAddress));
          _context8.next = 5;
          return this.CallContractMethod({
            contractAddress: contractAddress,
            methodName: "managersNum"
          });
        case 5:
          length = _context8.sent.toNumber();
          _context8.next = 8;
          return Promise.all(_toConsumableArray(Array(length)).map( /*#__PURE__*/function () {
            var _ref12 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee7(_, i) {
              return _regeneratorRuntime.wrap(function _callee7$(_context7) {
                while (1) switch (_context7.prev = _context7.next) {
                  case 0:
                    _context7.t0 = _this3.utils;
                    _context7.next = 3;
                    return _this3.CallContractMethod({
                      contractAddress: contractAddress,
                      methodName: "managersList",
                      methodArgs: [i]
                    });
                  case 3:
                    _context7.t1 = _context7.sent;
                    return _context7.abrupt("return", _context7.t0.FormatAddress.call(_context7.t0, _context7.t1));
                  case 5:
                  case "end":
                    return _context7.stop();
                }
              }, _callee7);
            }));
            return function (_x8, _x9) {
              return _ref12.apply(this, arguments);
            };
          }()));
        case 8:
          return _context8.abrupt("return", _context8.sent);
        case 9:
        case "end":
          return _context8.stop();
      }
    }, _callee8, this);
  }));
  return function (_x7) {
    return _ref11.apply(this, arguments);
  };
}();

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
exports.CreateAccessGroup = /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee9() {
  var _ref14,
    name,
    description,
    _ref14$metadata,
    metadata,
    _yield$this$authClien,
    contractAddress,
    objectId,
    editResponse,
    _args9 = arguments;
  return _regeneratorRuntime.wrap(function _callee9$(_context9) {
    while (1) switch (_context9.prev = _context9.next) {
      case 0:
        _ref14 = _args9.length > 0 && _args9[0] !== undefined ? _args9[0] : {}, name = _ref14.name, description = _ref14.description, _ref14$metadata = _ref14.metadata, metadata = _ref14$metadata === void 0 ? {} : _ref14$metadata;
        this.Log("Creating access group: ".concat(name || "", " ").concat(description || ""));
        _context9.next = 4;
        return this.authClient.CreateAccessGroup();
      case 4:
        _yield$this$authClien = _context9.sent;
        contractAddress = _yield$this$authClien.contractAddress;
        contractAddress = this.utils.FormatAddress(contractAddress);
        objectId = this.utils.AddressToObjectId(contractAddress);
        this.Log("Access group: ".concat(contractAddress, " ").concat(objectId));
        _context9.next = 11;
        return this.EditContentObject({
          libraryId: this.contentSpaceLibraryId,
          objectId: objectId
        });
      case 11:
        editResponse = _context9.sent;
        _context9.next = 14;
        return this.ReplaceMetadata({
          libraryId: this.contentSpaceLibraryId,
          objectId: objectId,
          writeToken: editResponse.write_token,
          metadata: _objectSpread({
            "public": {
              name: name,
              description: description
            },
            name: name,
            description: description
          }, metadata)
        });
      case 14:
        _context9.next = 16;
        return this.FinalizeContentObject({
          libraryId: this.contentSpaceLibraryId,
          objectId: objectId,
          writeToken: editResponse.write_token,
          commitMessage: "Create access group"
        });
      case 16:
        return _context9.abrupt("return", contractAddress);
      case 17:
      case "end":
        return _context9.stop();
    }
  }, _callee9, this);
}));

/**
 * NOT YET SUPPORTED - Delete an access group
 *
 * Calls the kill method on the specified access group's contract
 *
 * @memberof module:ElvClient/AccessGroups
 * @methodGroup Access Groups
 * @namedParams
 * @param {string} contractAddress - The address of the access group contract
 */
exports.DeleteAccessGroup = /*#__PURE__*/function () {
  var _ref16 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee10(_ref15) {
    var contractAddress;
    return _regeneratorRuntime.wrap(function _callee10$(_context10) {
      while (1) switch (_context10.prev = _context10.next) {
        case 0:
          contractAddress = _ref15.contractAddress;
          throw Error("Not supported");
        case 6:
        case "end":
          return _context10.stop();
      }
    }, _callee10, this);
  }));
  return function (_x10) {
    return _ref16.apply(this, arguments);
  };
}();
exports.AccessGroupMembershipMethod = /*#__PURE__*/function () {
  var _ref18 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee11(_ref17) {
    var contractAddress, memberAddress, methodName, eventName, isManager, event, abi, candidate;
    return _regeneratorRuntime.wrap(function _callee11$(_context11) {
      while (1) switch (_context11.prev = _context11.next) {
        case 0:
          contractAddress = _ref17.contractAddress, memberAddress = _ref17.memberAddress, methodName = _ref17.methodName, eventName = _ref17.eventName;
          contractAddress = ValidateAddress(contractAddress);
          memberAddress = ValidateAddress(memberAddress);

          // Ensure caller is the member being acted upon or a manager/owner of the group
          if (this.utils.EqualAddress(this.signer.address, memberAddress)) {
            _context11.next = 9;
            break;
          }
          _context11.next = 6;
          return this.CallContractMethod({
            contractAddress: contractAddress,
            methodName: "hasManagerAccess",
            methodArgs: [this.utils.FormatAddress(this.signer.address)]
          });
        case 6:
          isManager = _context11.sent;
          if (isManager) {
            _context11.next = 9;
            break;
          }
          throw Error("Manager access required");
        case 9:
          this.Log("Calling ".concat(methodName, " on group ").concat(contractAddress, " for user ").concat(memberAddress));
          _context11.next = 12;
          return this.CallContractMethodAndWait({
            contractAddress: contractAddress,
            methodName: methodName,
            methodArgs: [memberAddress],
            eventName: eventName,
            eventValue: "candidate"
          });
        case 12:
          event = _context11.sent;
          _context11.next = 15;
          return this.ContractAbi({
            contractAddress: contractAddress
          });
        case 15:
          abi = _context11.sent;
          candidate = this.ExtractValueFromEvent({
            abi: abi,
            event: event,
            eventName: eventName,
            eventValue: "candidate"
          });
          if (!(this.utils.FormatAddress(candidate) !== this.utils.FormatAddress(memberAddress))) {
            _context11.next = 21;
            break;
          }
          // eslint-disable-next-line no-console
          console.error("Mismatch: " + candidate + " :: " + memberAddress);
          // eslint-disable-next-line no-console
          console.error("Is target user address wallet created?");
          throw Error("Access group method " + methodName + " failed. Is target user address wallet created?");
        case 21:
          return _context11.abrupt("return", event.transactionHash);
        case 22:
        case "end":
          return _context11.stop();
      }
    }, _callee11, this);
  }));
  return function (_x11) {
    return _ref18.apply(this, arguments);
  };
}();

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
exports.AddAccessGroupMember = /*#__PURE__*/function () {
  var _ref20 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee12(_ref19) {
    var contractAddress, memberAddress;
    return _regeneratorRuntime.wrap(function _callee12$(_context12) {
      while (1) switch (_context12.prev = _context12.next) {
        case 0:
          contractAddress = _ref19.contractAddress, memberAddress = _ref19.memberAddress;
          contractAddress = ValidateAddress(contractAddress);
          memberAddress = ValidateAddress(memberAddress);
          _context12.next = 5;
          return this.AccessGroupMembershipMethod({
            contractAddress: contractAddress,
            memberAddress: memberAddress,
            methodName: "grantAccess",
            eventName: "MemberAdded"
          });
        case 5:
          return _context12.abrupt("return", _context12.sent);
        case 6:
        case "end":
          return _context12.stop();
      }
    }, _callee12, this);
  }));
  return function (_x12) {
    return _ref20.apply(this, arguments);
  };
}();

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
exports.RemoveAccessGroupMember = /*#__PURE__*/function () {
  var _ref22 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee13(_ref21) {
    var contractAddress, memberAddress;
    return _regeneratorRuntime.wrap(function _callee13$(_context13) {
      while (1) switch (_context13.prev = _context13.next) {
        case 0:
          contractAddress = _ref21.contractAddress, memberAddress = _ref21.memberAddress;
          contractAddress = ValidateAddress(contractAddress);
          memberAddress = ValidateAddress(memberAddress);
          _context13.next = 5;
          return this.AccessGroupMembershipMethod({
            contractAddress: contractAddress,
            memberAddress: memberAddress,
            methodName: "revokeAccess",
            eventName: "MemberRevoked"
          });
        case 5:
          return _context13.abrupt("return", _context13.sent);
        case 6:
        case "end":
          return _context13.stop();
      }
    }, _callee13, this);
  }));
  return function (_x13) {
    return _ref22.apply(this, arguments);
  };
}();

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
exports.AddAccessGroupManager = /*#__PURE__*/function () {
  var _ref24 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee14(_ref23) {
    var contractAddress, memberAddress;
    return _regeneratorRuntime.wrap(function _callee14$(_context14) {
      while (1) switch (_context14.prev = _context14.next) {
        case 0:
          contractAddress = _ref23.contractAddress, memberAddress = _ref23.memberAddress;
          contractAddress = ValidateAddress(contractAddress);
          memberAddress = ValidateAddress(memberAddress);
          _context14.next = 5;
          return this.AccessGroupMembershipMethod({
            contractAddress: contractAddress,
            memberAddress: memberAddress,
            methodName: "grantManagerAccess",
            eventName: "ManagerAccessGranted"
          });
        case 5:
          return _context14.abrupt("return", _context14.sent);
        case 6:
        case "end":
          return _context14.stop();
      }
    }, _callee14, this);
  }));
  return function (_x14) {
    return _ref24.apply(this, arguments);
  };
}();

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
exports.RemoveAccessGroupManager = /*#__PURE__*/function () {
  var _ref26 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee15(_ref25) {
    var contractAddress, memberAddress;
    return _regeneratorRuntime.wrap(function _callee15$(_context15) {
      while (1) switch (_context15.prev = _context15.next) {
        case 0:
          contractAddress = _ref25.contractAddress, memberAddress = _ref25.memberAddress;
          contractAddress = ValidateAddress(contractAddress);
          memberAddress = ValidateAddress(memberAddress);
          _context15.next = 5;
          return this.AccessGroupMembershipMethod({
            contractAddress: contractAddress,
            memberAddress: memberAddress,
            methodName: "revokeManagerAccess",
            eventName: "ManagerAccessRevoked"
          });
        case 5:
          return _context15.abrupt("return", _context15.sent);
        case 6:
        case "end":
          return _context15.stop();
      }
    }, _callee15, this);
  }));
  return function (_x15) {
    return _ref26.apply(this, arguments);
  };
}();

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
exports.ContentLibraryGroupPermissions = /*#__PURE__*/function () {
  var _ref28 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee18(_ref27) {
    var _this4 = this;
    var libraryId, _ref27$permissions, permissions, libraryPermissions;
    return _regeneratorRuntime.wrap(function _callee18$(_context18) {
      while (1) switch (_context18.prev = _context18.next) {
        case 0:
          libraryId = _ref27.libraryId, _ref27$permissions = _ref27.permissions, permissions = _ref27$permissions === void 0 ? [] : _ref27$permissions;
          ValidateLibrary(libraryId);
          libraryPermissions = {};
          if (!permissions || permissions.length === 0) {
            permissions = ["accessor", "contributor", "reviewer"];
          } else {
            // Format and validate specified permissions
            permissions = permissions.map(function (permission) {
              permission = permission.toLowerCase();
              if (!["accessor", "contributor", "reviewer"].includes(permission)) {
                throw Error("Invalid permission: ".concat(permission));
              }
              return permission;
            });
          }
          this.Log("Retrieving ".concat(permissions.join(", "), " group(s) for library ").concat(libraryId));
          _context18.next = 7;
          return Promise.all(permissions.map( /*#__PURE__*/function () {
            var _ref29 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee17(type) {
              var numGroups, accessGroupAddresses;
              return _regeneratorRuntime.wrap(function _callee17$(_context17) {
                while (1) switch (_context17.prev = _context17.next) {
                  case 0:
                    _context17.next = 2;
                    return _this4.CallContractMethod({
                      contractAddress: _this4.utils.HashToAddress(libraryId),
                      methodName: type + "GroupsLength"
                    });
                  case 2:
                    numGroups = _context17.sent;
                    numGroups = parseInt(numGroups._hex, 16);
                    _context17.next = 6;
                    return _this4.utils.LimitedMap(3, _toConsumableArray(Array(numGroups).keys()), /*#__PURE__*/function () {
                      var _ref30 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee16(i) {
                        return _regeneratorRuntime.wrap(function _callee16$(_context16) {
                          while (1) switch (_context16.prev = _context16.next) {
                            case 0:
                              _context16.prev = 0;
                              _context16.t0 = _this4.utils;
                              _context16.next = 4;
                              return _this4.CallContractMethod({
                                contractAddress: _this4.utils.HashToAddress(libraryId),
                                methodName: type + "Groups",
                                methodArgs: [i]
                              });
                            case 4:
                              _context16.t1 = _context16.sent;
                              return _context16.abrupt("return", _context16.t0.FormatAddress.call(_context16.t0, _context16.t1));
                            case 8:
                              _context16.prev = 8;
                              _context16.t2 = _context16["catch"](0);
                              // eslint-disable-next-line no-console
                              console.error(_context16.t2);
                            case 11:
                            case "end":
                              return _context16.stop();
                          }
                        }, _callee16, null, [[0, 8]]);
                      }));
                      return function (_x18) {
                        return _ref30.apply(this, arguments);
                      };
                    }());
                  case 6:
                    accessGroupAddresses = _context17.sent;
                    accessGroupAddresses.forEach(function (address) {
                      return libraryPermissions[address] = [].concat(_toConsumableArray(libraryPermissions[address] || []), [type]).sort();
                    });
                  case 8:
                  case "end":
                    return _context17.stop();
                }
              }, _callee17);
            }));
            return function (_x17) {
              return _ref29.apply(this, arguments);
            };
          }()));
        case 7:
          return _context18.abrupt("return", libraryPermissions);
        case 8:
        case "end":
          return _context18.stop();
      }
    }, _callee18, this);
  }));
  return function (_x16) {
    return _ref28.apply(this, arguments);
  };
}();

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
exports.AddContentLibraryGroup = /*#__PURE__*/function () {
  var _ref32 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee19(_ref31) {
    var libraryId, groupAddress, permission, existingPermissions, event, abi;
    return _regeneratorRuntime.wrap(function _callee19$(_context19) {
      while (1) switch (_context19.prev = _context19.next) {
        case 0:
          libraryId = _ref31.libraryId, groupAddress = _ref31.groupAddress, permission = _ref31.permission;
          ValidateLibrary(libraryId);
          groupAddress = ValidateAddress(groupAddress);
          if (["accessor", "contributor", "reviewer"].includes(permission.toLowerCase())) {
            _context19.next = 5;
            break;
          }
          throw Error("Invalid group type: ".concat(permission));
        case 5:
          this.Log("Adding ".concat(permission, " group ").concat(groupAddress, " to library ").concat(libraryId));
          _context19.next = 8;
          return this.ContentLibraryGroupPermissions({
            libraryId: libraryId,
            permissions: [permission]
          });
        case 8:
          existingPermissions = _context19.sent;
          if (!existingPermissions[groupAddress]) {
            _context19.next = 11;
            break;
          }
          return _context19.abrupt("return");
        case 11:
          // Capitalize permission to match method and event names
          permission = permission.charAt(0).toUpperCase() + permission.substr(1).toLowerCase();
          _context19.next = 14;
          return this.CallContractMethodAndWait({
            contractAddress: this.utils.HashToAddress(libraryId),
            methodName: "add".concat(permission, "Group"),
            methodArgs: [groupAddress]
          });
        case 14:
          event = _context19.sent;
          _context19.next = 17;
          return this.ContractAbi({
            id: libraryId
          });
        case 17:
          abi = _context19.sent;
          _context19.next = 20;
          return this.ExtractEventFromLogs({
            abi: abi,
            event: event,
            eventName: "".concat(permission, "GroupAdded")
          });
        case 20:
        case "end":
          return _context19.stop();
      }
    }, _callee19, this);
  }));
  return function (_x19) {
    return _ref32.apply(this, arguments);
  };
}();

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
exports.RemoveContentLibraryGroup = /*#__PURE__*/function () {
  var _ref34 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee20(_ref33) {
    var libraryId, groupAddress, permission, existingPermissions, event, abi;
    return _regeneratorRuntime.wrap(function _callee20$(_context20) {
      while (1) switch (_context20.prev = _context20.next) {
        case 0:
          libraryId = _ref33.libraryId, groupAddress = _ref33.groupAddress, permission = _ref33.permission;
          ValidateLibrary(libraryId);
          groupAddress = ValidateAddress(groupAddress);
          if (["accessor", "contributor", "reviewer"].includes(permission.toLowerCase())) {
            _context20.next = 5;
            break;
          }
          throw Error("Invalid group type: ".concat(permission));
        case 5:
          this.Log("Removing ".concat(permission, " group ").concat(groupAddress, " from library ").concat(libraryId));
          _context20.next = 8;
          return this.ContentLibraryGroupPermissions({
            libraryId: libraryId,
            permissions: [permission]
          });
        case 8:
          existingPermissions = _context20.sent;
          if (existingPermissions[groupAddress]) {
            _context20.next = 11;
            break;
          }
          return _context20.abrupt("return");
        case 11:
          // Capitalize permission to match method and event names
          permission = permission.charAt(0).toUpperCase() + permission.substr(1).toLowerCase();
          _context20.next = 14;
          return this.CallContractMethodAndWait({
            contractAddress: this.utils.HashToAddress(libraryId),
            methodName: "remove".concat(permission, "Group"),
            methodArgs: [groupAddress]
          });
        case 14:
          event = _context20.sent;
          _context20.next = 17;
          return this.ContractAbi({
            id: libraryId
          });
        case 17:
          abi = _context20.sent;
          _context20.next = 20;
          return this.ExtractEventFromLogs({
            abi: abi,
            event: event,
            eventName: "".concat(permission, "GroupRemoved")
          });
        case 20:
        case "end":
          return _context20.stop();
      }
    }, _callee20, this);
  }));
  return function (_x20) {
    return _ref34.apply(this, arguments);
  };
}();

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
exports.ContentObjectGroupPermissions = /*#__PURE__*/function () {
  var _ref36 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee22(_ref35) {
    var _this5 = this;
    var objectId, contractAddress, groupAddresses, rightsMethod, groupPermissions;
    return _regeneratorRuntime.wrap(function _callee22$(_context22) {
      while (1) switch (_context22.prev = _context22.next) {
        case 0:
          objectId = _ref35.objectId;
          ValidateObject(objectId);
          this.Log("Retrieving group permissions for object ".concat(objectId));
          contractAddress = this.utils.HashToAddress(objectId); // Access indexor only available on access groups, so must ask each access group
          // we belong to about this object
          _context22.next = 6;
          return this.Collection({
            collectionType: "accessGroups"
          });
        case 6:
          groupAddresses = _context22.sent;
          _context22.next = 9;
          return this.AccessType({
            id: objectId
          });
        case 9:
          _context22.t0 = _context22.sent;
          _context22.next = _context22.t0 === this.authClient.ACCESS_TYPES.OBJECT ? 12 : _context22.t0 === this.authClient.ACCESS_TYPES.TYPE ? 14 : _context22.t0 === this.authClient.ACCESS_TYPES.GROUP ? 16 : _context22.t0 === this.authClient.ACCESS_TYPES.LIBRARY ? 18 : 19;
          break;
        case 12:
          rightsMethod = "getContentObjectRights";
          return _context22.abrupt("break", 19);
        case 14:
          rightsMethod = "getContentTypeRights";
          return _context22.abrupt("break", 19);
        case 16:
          rightsMethod = "getAccessGroupRights";
          return _context22.abrupt("break", 19);
        case 18:
          rightsMethod = "getLibraryRights";
        case 19:
          groupPermissions = {};
          _context22.next = 22;
          return Promise.all(groupAddresses.map( /*#__PURE__*/function () {
            var _ref37 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee21(groupAddress) {
              var permission, permissions;
              return _regeneratorRuntime.wrap(function _callee21$(_context21) {
                while (1) switch (_context21.prev = _context21.next) {
                  case 0:
                    _context21.prev = 0;
                    groupAddress = _this5.utils.FormatAddress(groupAddress);
                    _context21.next = 4;
                    return _this5.CallContractMethod({
                      contractAddress: groupAddress,
                      methodName: rightsMethod,
                      methodArgs: [contractAddress]
                    });
                  case 4:
                    permission = _context21.sent;
                    if (!(permission === 0)) {
                      _context21.next = 7;
                      break;
                    }
                    return _context21.abrupt("return");
                  case 7:
                    permissions = [];
                    if (permission >= 100) {
                      permissions.push("manage");
                    }
                    if (permission % 100 >= 10) {
                      permissions.push("access");
                    }
                    if (permission % 10 > 0) {
                      permissions.push("see");
                    }
                    groupPermissions[groupAddress] = permissions;
                    _context21.next = 18;
                    break;
                  case 14:
                    _context21.prev = 14;
                    _context21.t0 = _context21["catch"](0);
                    _this5.Log("Failed to retrieve group permissions for ".concat(groupAddress), true);
                    _this5.Log(_context21.t0, true);
                  case 18:
                  case "end":
                    return _context21.stop();
                }
              }, _callee21, null, [[0, 14]]);
            }));
            return function (_x22) {
              return _ref37.apply(this, arguments);
            };
          }()));
        case 22:
          return _context22.abrupt("return", groupPermissions);
        case 23:
        case "end":
          return _context22.stop();
      }
    }, _callee22, this);
  }));
  return function (_x21) {
    return _ref36.apply(this, arguments);
  };
}();

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
exports.AddContentObjectGroupPermission = /*#__PURE__*/function () {
  var _ref39 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee23(_ref38) {
    var objectId, groupAddress, permission;
    return _regeneratorRuntime.wrap(function _callee23$(_context23) {
      while (1) switch (_context23.prev = _context23.next) {
        case 0:
          objectId = _ref38.objectId, groupAddress = _ref38.groupAddress, permission = _ref38.permission;
          ValidatePresence("permission", permission);
          ValidateObject(objectId);
          groupAddress = ValidateAddress(groupAddress);
          if (!this.utils.EqualAddress(groupAddress, this.utils.HashToAddress(objectId))) {
            _context23.next = 6;
            break;
          }
          throw Error("Group rights cannot be set on the same group");
        case 6:
          permission = permission.toLowerCase();
          if (["see", "access", "manage"].includes(permission)) {
            _context23.next = 9;
            break;
          }
          throw Error("Invalid permission type: ".concat(permission));
        case 9:
          this.Log("Adding ".concat(permission, " permission to group ").concat(groupAddress, " for ").concat(objectId));
          _context23.next = 12;
          return this.SetGroupPermission({
            groupAddress: groupAddress,
            objectId: objectId,
            permission: permission
          });
        case 12:
          return _context23.abrupt("return", _context23.sent);
        case 13:
        case "end":
          return _context23.stop();
      }
    }, _callee23, this);
  }));
  return function (_x23) {
    return _ref39.apply(this, arguments);
  };
}();

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
exports.RemoveContentObjectGroupPermission = /*#__PURE__*/function () {
  var _ref41 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee24(_ref40) {
    var objectId, groupAddress, permission;
    return _regeneratorRuntime.wrap(function _callee24$(_context24) {
      while (1) switch (_context24.prev = _context24.next) {
        case 0:
          objectId = _ref40.objectId, groupAddress = _ref40.groupAddress, permission = _ref40.permission;
          ValidatePresence("permission", permission);
          ValidateObject(objectId);
          groupAddress = ValidateAddress(groupAddress);
          permission = permission.toLowerCase();
          if (["see", "access", "manage"].includes(permission)) {
            _context24.next = 7;
            break;
          }
          throw Error("Invalid permission type: ".concat(permission));
        case 7:
          this.Log("Removing ".concat(permission, " permission from group ").concat(groupAddress, " for ").concat(objectId));
          _context24.next = 10;
          return this.SetGroupPermission({
            groupAddress: groupAddress,
            objectId: objectId,
            permission: permission,
            remove: true
          });
        case 10:
          return _context24.abrupt("return", _context24.sent);
        case 11:
        case "end":
          return _context24.stop();
      }
    }, _callee24, this);
  }));
  return function (_x24) {
    return _ref41.apply(this, arguments);
  };
}();

/**
 * Link the specified group to an OAuth provider with the specified credentials
 *
 * @param {string} groupAddress - The address of the group
 * @param {string} kmsId - The ID of the KMS (or trust authority ID)
 * @param {string | Object} oauthConfig - The configuration for the OAuth settings
 */
exports.LinkAccessGroupToOauth = /*#__PURE__*/function () {
  var _ref43 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee25(_ref42) {
    var groupAddress, kmsId, oauthConfig, _yield$this$authClien2, publicKey, kmsKey, kmsConfig, userKey, userConfig, objectId, writeToken;
    return _regeneratorRuntime.wrap(function _callee25$(_context25) {
      while (1) switch (_context25.prev = _context25.next) {
        case 0:
          groupAddress = _ref42.groupAddress, kmsId = _ref42.kmsId, oauthConfig = _ref42.oauthConfig;
          ValidateAddress(groupAddress);
          ValidatePresence("kmsId", kmsId);
          ValidatePresence("oauthConfig", oauthConfig);
          if (typeof oauthConfig === "string") {
            oauthConfig = JSON.parse(oauthConfig);
          }
          _context25.next = 7;
          return this.authClient.KMSInfo({
            kmsId: kmsId
          });
        case 7:
          _yield$this$authClien2 = _context25.sent;
          publicKey = _yield$this$authClien2.publicKey;
          kmsKey = "eluv.jwtv.".concat(kmsId);
          _context25.next = 12;
          return this.Crypto.EncryptConk(oauthConfig, publicKey);
        case 12:
          kmsConfig = _context25.sent;
          userKey = "eluv.jwtv.iusr".concat(this.utils.AddressToHash(this.signer.address));
          _context25.next = 16;
          return this.EncryptECIES({
            message: oauthConfig
          });
        case 16:
          userConfig = _context25.sent;
          objectId = this.utils.AddressToObjectId(groupAddress);
          _context25.next = 20;
          return this.EditContentObject({
            libraryId: this.contentSpaceLibraryId,
            objectId: objectId
          });
        case 20:
          writeToken = _context25.sent.write_token;
          _context25.next = 23;
          return this.ReplaceMetadata({
            libraryId: this.contentSpaceLibraryId,
            objectId: objectId,
            writeToken: writeToken,
            metadataSubtree: kmsKey,
            metadata: kmsConfig
          });
        case 23:
          _context25.next = 25;
          return this.ReplaceMetadata({
            libraryId: this.contentSpaceLibraryId,
            objectId: objectId,
            writeToken: writeToken,
            metadataSubtree: userKey,
            metadata: userConfig
          });
        case 25:
          _context25.next = 27;
          return this.FinalizeContentObject({
            libraryId: this.contentSpaceLibraryId,
            objectId: objectId,
            writeToken: writeToken,
            commitMessage: "Bind access group to OAuth"
          });
        case 27:
          _context25.next = 29;
          return this.CallContractMethodAndWait({
            contractAddress: groupAddress,
            methodName: "setOAuthEnabled",
            methodArgs: [false]
          });
        case 29:
          _context25.next = 31;
          return this.CallContractMethodAndWait({
            contractAddress: groupAddress,
            methodName: "setOAuthEnabled",
            methodArgs: [true]
          });
        case 31:
        case "end":
          return _context25.stop();
      }
    }, _callee25, this);
  }));
  return function (_x25) {
    return _ref43.apply(this, arguments);
  };
}();

/**
 * Disable the OAuth linking on the specified access group
 *
 * @param {string} groupAddress - The address of the group
 */
exports.UnlinkAccessGroupFromOauth = /*#__PURE__*/function () {
  var _ref45 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee26(_ref44) {
    var groupAddress;
    return _regeneratorRuntime.wrap(function _callee26$(_context26) {
      while (1) switch (_context26.prev = _context26.next) {
        case 0:
          groupAddress = _ref44.groupAddress;
          ValidateAddress(groupAddress);
          _context26.next = 4;
          return this.CallContractMethodAndWait({
            contractAddress: groupAddress,
            methodName: "setOAuthEnabled",
            methodArgs: [false]
          });
        case 4:
        case "end":
          return _context26.stop();
      }
    }, _callee26, this);
  }));
  return function (_x26) {
    return _ref45.apply(this, arguments);
  };
}();