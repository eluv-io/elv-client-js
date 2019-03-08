pragma solidity 0.4.21;

import "./ownable.sol";
import {BaseFactory} from "./base_content_space.sol";


contract BaseAccessControlGroup is Ownable {

    bytes32 public version ="BsAccessCtrlGrp20190222140700ML"; //class name (max 16), date YYYYMMDD, time HHMMSS and Developer initials XX

    address public contentSpace;

    mapping (address => bool) public members;
    mapping (address => bool) public managers;

    event MemberAdded(address candidate);
    event ManagerAccessGranted(address candidate);
    event MemberRevoked(address candidate);
    event ManagerAccessRevoked(address candidate);
    event UnauthorizedOperation(uint operationCode, address candidate);

    function BaseAccessControlGroup(address content_space) public {
        contentSpace = content_space;
        managers[creator] = true;
        members[creator] = true;
    }

    function grantManagerAccess(address manager) public onlyOwner {
        managers[manager] = true;
        emit ManagerAccessGranted(manager);
    }

    function revokeManagerAccess(address manager) public {
        require((msg.sender == owner) || (msg.sender == manager));
        managers[manager] = false;
        emit ManagerAccessRevoked(manager);
    }

    function hasManagerAccess(address candidate) public view returns (bool) {
        return (managers[candidate] == true);
    }

    function grantAccess(address candidate) public {
        require(managers[msg.sender] == true);
        members[candidate] = true;
        emit MemberAdded(candidate);
    }

    function revokeAccess(address candidate) public {
        require((managers[msg.sender] == true) || (msg.sender == candidate));
        members[candidate] = false;
        emit MemberRevoked(candidate);
    }

    function hasAccess(address candidate) public view returns (bool) {
        return (members[candidate] == true);
    }
}
