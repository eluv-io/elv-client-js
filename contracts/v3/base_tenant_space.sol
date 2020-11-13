pragma solidity 0.5.4;

import {Ownable} from "./ownable.sol";
import {Accessible} from "./accessible.sol";
import {Editable} from "./editable.sol";
import "./base_space_interfaces.sol";
import {BaseAccessWalletFactory} from "./base_access_wallet.sol";
import {BaseAccessWallet} from "./base_access_wallet.sol";
import {BaseAccessControlGroup} from "./base_access_control_group.sol";
import {Container} from "./container.sol";
import "./user_space.sol";
import "./node_space.sol";
import "./meta_object.sol";
import "./lib_precompile.sol";
import "./base_content_space.sol";
import "./lib_enctoken.sol";

// CAREFUL: no storage! - otherwise it will conflict with the calling contract
contract TenantFuncsBase is MetaObject, CounterObject {

    event TenantTransfer(address to, uint256 amount);

    function checkAndSet(bytes memory _encToken) private {
        uint256 otpOrd = EncToken.getUint("ord", _encToken);

        bytes32 segIdent = bytes32(EncToken.getUint("segident(id,ord)", _encToken));

        uint8 segBit = uint8(otpOrd % 256);
        bool wasSet = setAndGetBitInternal(segIdent, segBit);
        require(!wasSet);
    }

    function transferToken(bytes memory _encAuthToken, uint256 _amount, address payable _to) public {
        checkAndSet(_encAuthToken);

        uint256 maxAmount = EncToken.getUint("max", _encAuthToken);
        require(_amount <= maxAmount);

        _to.transfer(_amount);

        emit TenantTransfer(_to, _amount);
    }

    event ApplyGroups(address to, uint256 numGroups);

    function applyGroups(bytes memory _encToken, uint256, address payable _to) public {
        string[10] memory groupOrdNames = ["grp:0", "grp:1", "grp:2", "grp:3", "grp:4", "grp:5", "grp:6", "grp:7", "grp:8", "grp:9"];

        checkAndSet(_encToken);

        uint256 cntGroups = EncToken.getUint("len(grp)", _encToken);
        require(cntGroups <= 10);
        for (uint256 i = 0; i < cntGroups; i++) {
            address payable groupAddr = EncToken.getAddress(groupOrdNames[i], _encToken);
            BaseAccessControlGroup(groupAddr).grantAccess(_to);
        }

        emit ApplyGroups(_to, cntGroups);
    }
}

contract BaseTenantSpace is MetaObject, CounterObject, Editable, IUserSpace, INodeSpace, IKmsSpace, IFactorySpace {

    bytes32 public version ="BaseTenantSpace20200504120000PO"; //class name (max 16), date YYYYMMDD, time HHMMSS and Developer initials XX

    string public name;
    string public description;

    address public addressKMS;

    function setAddressKMS(address address_KMS) public onlyOwner {
        addressKMS = address_KMS;
    }

    // TODO: add setter(s)
    uint256 public defTokenExpSecs = 24 * 60 * 60; // default one day
    uint256 public defLeewaySecs = 2 * 60; // default two minutes

    function setDescription(string memory _desc) public onlyAdmin {
        description = _desc;
    }

    event CreateTenant(bytes32 version, address owner);
    event GetAccessWallet(address walletAddress);

    constructor(address payable _contentSpace, string memory _tenantName, address _kmsAddr) public payable {
        name = _tenantName;
        BaseContentSpace spc = BaseContentSpace(_contentSpace);
        // allow either the space owner or a trusted address to refer to the space
        require(msg.sender == spc.owner() || spc.checkKMSAddr(msg.sender) > 0);
        contentSpace = address(_contentSpace);
        addressKMS = _kmsAddr;
        emit CreateTenant(version, owner);
    }

    bytes32 public constant GROUP_ID_ADMIN = "tenant_admin";

    mapping(bytes32 => address payable[]) public groupsMapping;
    bytes32[] public groupIds;

    mapping(bytes32 => string[]) public listsMapping;

    function addListItem(bytes32 listKey, string memory itemVal) public onlyAdmin {
        listsMapping[listKey].push(itemVal);
    }

    function removeListOrd(bytes32 listKey, uint itemOrd) public onlyAdmin {
        uint lastOrd = listsMapping[listKey].length - 1;
        if (itemOrd < lastOrd) {
            listsMapping[listKey][itemOrd] = listsMapping[listKey][lastOrd];
        }
        delete listsMapping[listKey][lastOrd];
        listsMapping[listKey].length--;
    }

    function listLength(bytes32 listKey) public view returns (uint) {
        return listsMapping[listKey].length;
    }

    function isAdmin(address payable _candidate) public view returns (bool) {
        if (_candidate == owner) {
            return true;
        }

        address payable[] memory maybeAddrs = groupsMapping[GROUP_ID_ADMIN];
        for (uint256 i = 0; i < maybeAddrs.length; i++) {
            BaseAccessControlGroup theGroup = BaseAccessControlGroup(maybeAddrs[i]);
            // if candidate is either a manager or regular member, we consider them an admin of the tenant
            if (theGroup.hasAccessRight(_candidate, false) || theGroup.hasAccessRight(_candidate, true)) {
                return true;
            }
        }
        return false;
    }

    event FunctionsAdded(bytes4[] func4Bytes, address funcAddr);

    mapping(bytes4 => address) public funcMapping;

    function addFuncs(bytes4[] memory _func4Bytes, address _funcAddr) public onlyAdmin {
        for (uint256 i = 0; i < _func4Bytes.length; i++) {
            funcMapping[_func4Bytes[i]] = _funcAddr;
        }
        emit FunctionsAdded(_func4Bytes, _funcAddr);
    }

    function checkCallFunc(bytes4 _func4Bytes, bytes memory _encAuthToken, uint8 _v, bytes32 _r, bytes32 _s) public view returns (bool) {

        address maybeFuncAddr = funcMapping[_func4Bytes];
        require(maybeFuncAddr != address(0x0));

        address payable signerAddr = address(uint160(ecrecover(keccak256(_encAuthToken), _v, _r, _s)));
        if (!isAdmin(signerAddr)) {
            return false;
        }

        address maybeAddr = EncToken.getAddress("iid", _encAuthToken);
        if (maybeAddr != address(this)) {
            return false;
        }

        uint256 maybeIATMillis = EncToken.getUint("iat", _encAuthToken);
        if (maybeIATMillis != 0) {
            uint secSinceIAT = now + defLeewaySecs - (maybeIATMillis / 1000);
            require(secSinceIAT <= defTokenExpSecs);
        }

        return true;
    }

    function callFuncUintAddr(bytes4 _func4Bytes, uint256 _p1, address payable _p2, bytes memory _encAuthToken,
        uint8 _v, bytes32 _r, bytes32 _s) public {

        require(checkCallFunc(_func4Bytes, _encAuthToken, _v, _r, _s));

        address maybeFuncAddr = funcMapping[_func4Bytes];
        bool success;
        bytes memory data;
        (success, data) = maybeFuncAddr.delegatecall(abi.encodeWithSelector(_func4Bytes, _encAuthToken, _p1, _p2));
        require(success);
    }

    function transfer(address payable _to, uint256 _amount) public onlyAdmin {
        _to.transfer(_amount);
    }

    modifier onlyAdmin() {
        require(isAdmin(msg.sender));
        _;
    }

    event AddTenantGroup(bytes32 groupId, address groupAddr);
    event RemoveTenantGroup(bytes32 groupId, address groupAddr);

    function addGroup(bytes32 _id, address payable _groupAddr) public onlyAdmin {
        require(_groupAddr != address(0x0));
        for (uint256 i = 0; i < groupsMapping[_id].length; i++) {
            require(_id != GROUP_ID_ADMIN); // only one tenant admin group allowed
            if (groupsMapping[_id][i] == _groupAddr) {
                return;
            }
        }
        if (groupsMapping[_id].push(_groupAddr) == 1) {
            groupIds.push(_id);
        }
        emit AddTenantGroup(_id, _groupAddr);
    }

    function checkIdsRemove(bytes32 _id) private {
        if (groupsMapping[_id].length == 0) {
            for (uint256 i = 0; i < groupIds.length; i++) {
                if (groupIds[i] == _id) {
                    if (i != groupIds.length - 1) {
                        groupIds[i] = groupIds[groupIds.length - 1];
                    }
                    delete groupIds[groupIds.length - 1];
                    groupIds.length -= 1;
                }
            }
        }
    }

    function removeGroup(bytes32 _id, address _groupAddr) public onlyAdmin {
        require(_id != GROUP_ID_ADMIN); // can't change the tenant admin group
        for (uint256 i = 0; i < groupsMapping[_id].length; i++) {
            if (groupsMapping[_id][i] == _groupAddr) {
                uint256 len = groupsMapping[_id].length;
                if (i != len - 1) {
                    groupsMapping[_id][i] = groupsMapping[_id][len - 1];
                }
                delete groupsMapping[_id][len - 1];
                groupsMapping[_id].length -= 1;
                checkIdsRemove(_id);
                emit RemoveTenantGroup(_id, _groupAddr);
                return;
            }
        }
    }

    // for 'historical' reasons the tenant ID is based on the address of the admin group - not this contract!
    function getTenantID() public view returns (string memory) {
        address adminGroup = groupsMapping[GROUP_ID_ADMIN][0];
        return Precompile.makeIDString(Precompile.CodeTEN(), adminGroup);
    }

    // implement IUserSpace

    address public userManager;
    event SetUserManager(address newManager, address prevManager);

    function setUserManager(address _userMan) public onlyAdmin {
        emit SetUserManager(_userMan, userManager);
        userManager = _userMan;
    }

    function userWallets(address _userAddr) external view returns (address) {
        if (userManager != address(0x0)) {
            return IUserSpace(userManager).userWallets(_userAddr);
        }
        return IUserSpace(contentSpace).userWallets(_userAddr);
    }

    function createUserWallet(address payable _userAddr) external returns (address) {
        if (userManager != address(0x0)) {
            return IUserSpace(userManager).createUserWallet(_userAddr);
        }
        // at this point in time, deployed spaces do not implement this method so we will revert - but this is likely what we want to do anyway
        return IUserSpace(contentSpace).createUserWallet(_userAddr);
    }

    // implement INodeSpace

    address public nodeManager;
    event SetNodeManager(address newManager, address prevManager);

    function setNodeManager(address _nodeMan) public onlyAdmin {
        emit SetNodeManager(_nodeMan, nodeManager);
        nodeManager = _nodeMan;
    }

    function canConfirm() public view returns (bool) {
        if (nodeManager != address(0x0)) {
            return INodeSpace(nodeManager).canNodePublish(msg.sender);
        }
        return INodeSpace(contentSpace).canNodePublish(msg.sender);
    }

    function canNodePublish(address _candidate) external view returns (bool) {
        if (nodeManager != address(0x0)) {
            return INodeSpace(nodeManager).canNodePublish(_candidate);
        }
        return INodeSpace(contentSpace).canNodePublish(_candidate);
    }

    // implement IFactorySpace

    address public factoryManager;
    event SetFactoryManager(address newManager, address prevManager);

    function setFactoryManager(address _factMan) public onlyAdmin {
        emit SetFactoryManager(_factMan, factoryManager);
        factoryManager = _factMan;
    }

    function createContentType() public returns (address) {
        if (factoryManager != address(0x0)) {
            return IFactorySpace(factoryManager).createContentType();
        }
        return IFactorySpace(contentSpace).createContentType();
    }

    function createLibrary(address _kmsAddress) public returns (address) {
        if (factoryManager != address(0x0)) {
            return IFactorySpace(factoryManager).createLibrary(_kmsAddress);
        }
        return IFactorySpace(contentSpace).createLibrary(_kmsAddress);
    }

    function createContent(address payable _lib, address payable _contentType) public returns (address) {
        if (factoryManager != address(0x0)) {
            return IFactorySpace(factoryManager).createContent(_lib, _contentType);
        }
        return IFactorySpace(contentSpace).createContent(_lib, _contentType);
    }

    function createGroup() public returns (address) {
        if (factoryManager != address(0x0)) {
            return IFactorySpace(factoryManager).createGroup();
        }
        return IFactorySpace(contentSpace).createGroup();
    }

    address public kmsManager;
    event SetKmsManager(address newManager, address prevManager);

    function setKmsManager(address _kmsMan) public onlyAdmin {
        emit SetKmsManager(_kmsMan, kmsManager);
        kmsManager = _kmsMan;
    }

    // implement IKmsSpace

    function getKMSID(address _kmsAddr) public view returns (string memory) {
        if (kmsManager != address(0x0)) {
            return IKmsSpace(kmsManager).getKMSID(_kmsAddr);
        }
        return IKmsSpace(contentSpace).getKMSID(_kmsAddr);
    }

    function checkKMS(string calldata _kmsIdStr) external view returns (uint) {
        if (kmsManager != address(0x0)) {
            return IKmsSpace(kmsManager).checkKMS(_kmsIdStr);
        }
        return IKmsSpace(contentSpace).checkKMS(_kmsIdStr);
    }

    function checkKMSAddr(address _kmsAddr) public view returns (uint) {
        if (kmsManager != address(0x0)) {
            return IKmsSpace(kmsManager).checkKMSAddr(_kmsAddr);
        }
        return IKmsSpace(contentSpace).checkKMSAddr(_kmsAddr);
    }

    function getKMSInfo(string calldata _kmsID, bytes calldata _prefix) external view returns (string memory, string memory) {
        if (kmsManager != address(0x0)) {
            return IKmsSpace(kmsManager).getKMSInfo(_kmsID, _prefix);
        }
        return IKmsSpace(contentSpace).getKMSInfo(_kmsID, _prefix);
    }
}