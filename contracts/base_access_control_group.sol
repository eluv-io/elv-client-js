pragma solidity 0.4.24;

//import "./ownable.sol";
import {BaseFactory} from "./base_content_space.sol";
import {BaseContentSpace} from "./base_content_space.sol";
import {AccessIndexor} from "./access_indexor.sol";
import {Editable} from "./editable.sol";
import {Container} from "./container.sol";


/* -- Revision history --
BsAccessCtrlGrp20190222140700ML: First versioned released
BsAccessCtrlGrp20190315172900ML: Migrated to 0.4.24
BsAccessCtrlGrp20190506153800ML: Adds access indexing
BsAccessCtrlGrp20190510150700ML: Fixes bug (wrong index was used for group rights)
BsAccessCtrlGrp20190722161600ML: Made editable
*/


contract BaseAccessControlGroup is AccessIndexor, Editable {

    bytes32 public version ="BsAccessCtrlGrp20190722161600ML"; //class name (max 16), date YYYYMMDD, time HHMMSS and Developer initials XX

    mapping (address => bool) public members;
    mapping (address => bool) public managers;

    event MemberAdded(address candidate);
    event ManagerAccessGranted(address candidate);
    event MemberRevoked(address candidate);
    event ManagerAccessRevoked(address candidate);
    event UnauthorizedOperation(uint operationCode, address candidate);

    constructor(address content_space) public {
        contentSpace = content_space;
        managers[creator] = true;
        members[creator] = true;
    }

    function grantManagerAccess(address manager) public onlyOwner {
        managers[manager] = true;
        members[manager] = true; //added for consistencies with AccessIndex
        emit ManagerAccessGranted(manager);
        BaseContentSpace contentSpaceObj = BaseContentSpace(contentSpace);
        address walletAddress = contentSpaceObj.userWallets(manager);
        AccessIndexor userWallet = AccessIndexor(walletAddress);
        userWallet.setAccessGroupRights(address(this), userWallet.TYPE_EDIT(), userWallet.ACCESS_TENTATIVE());
    }

    function revokeManagerAccess(address manager) public {
        require((msg.sender == owner) || (msg.sender == manager));
        managers[manager] = false;
        emit ManagerAccessRevoked(manager);
        BaseContentSpace contentSpaceObj = BaseContentSpace(contentSpace);
        address walletAddress = contentSpaceObj.userWallets(manager);
        AccessIndexor userWallet = AccessIndexor(walletAddress);
        userWallet.setContentTypeRights(address(this), userWallet.TYPE_EDIT(), userWallet.ACCESS_NONE());
    }

    function hasManagerAccess(address candidate) public view returns (bool) {
        return (managers[candidate] == true);
    }

    //event dbg_setAccessGroupRights(address a, uint8 b, uint8 c);
    function grantAccess(address candidate) public {
        require(managers[msg.sender] == true);
        members[candidate] = true;
        emit MemberAdded(candidate);

        BaseContentSpace contentSpaceObj = BaseContentSpace(contentSpace);
        address walletAddress = contentSpaceObj.userWallets(candidate);
        AccessIndexor userWallet = AccessIndexor(walletAddress);
        userWallet.setAccessGroupRights(address(this), userWallet.TYPE_ACCESS(), userWallet.ACCESS_TENTATIVE());
        //emit dbg_setAccessGroupRights(walletAddress, userWallet.TYPE_ACCESS(), userWallet.ACCESS_TENTATIVE());
        //emit dbg_setAccessGroupRights(address(this), userWallet.TYPE_ACCESS(), userWallet.ACCESS_TENTATIVE());
    }

    function revokeAccess(address candidate) public {
        require((managers[msg.sender] == true) || (msg.sender == candidate));
        members[candidate] = false;
        emit MemberRevoked(candidate);
        BaseContentSpace contentSpaceObj = BaseContentSpace(contentSpace);
        address walletAddress = contentSpaceObj.userWallets(candidate);
        AccessIndexor userWallet = AccessIndexor(walletAddress);
        userWallet.setContentTypeRights(address(this), userWallet.TYPE_ACCESS(), userWallet.ACCESS_NONE());
    }

    function hasAccess(address candidate) public view returns (bool) {
        return (members[candidate] == true);
    }

    function canConfirm() public view returns (bool) {
        BaseContentSpace bcs = BaseContentSpace(contentSpace);
        return bcs.canNodePublish(msg.sender);
    }

}
