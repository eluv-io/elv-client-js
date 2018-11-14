pragma solidity 0.4.21;

import "./ownable.sol";


contract BaseAccessControlGroup is Ownable {


    mapping (address => bool) public members;
    mapping (address => bool) public managers;

    event MemberAdded(address candidate);
    event ManagerAccessGranted(address candidate);
    event MemberRevoked(address candidate);
    event ManagerAccessRevoked(address candidate);
    event UnauthorizedOperation(uint operationCode, address candidate);

    function BaseAccessControlGroup() public {
        managers[creator] = true;
        members[creator] = true;
    }

    function grantManagerAccess(address manager) public onlyOwner {
        managers[manager] = true;
        emit ManagerAccessGranted(manager);
    }

    function revokeManagerAccess(address manager) public {
        if ((msg.sender == creator) || (msg.sender == manager)) {
            managers[manager] = false;
            emit ManagerAccessRevoked(manager);
        } else {
            emit UnauthorizedOperation(11, manager);
        }
    }

    function hasManagerAccess(address candidate) public view returns (bool) {
        return (managers[candidate] == true);
    }

    function grantAccess(address candidate) public {
        if (managers[msg.sender] == true) {
            members[candidate] = true;
            emit MemberAdded(candidate);
        } else {
            emit UnauthorizedOperation(20, candidate);
        }
    }

    function revokeAccess(address candidate) public {
        if ((managers[msg.sender] == true) || (msg.sender == candidate)) {
            members[candidate] = false;
            emit MemberRevoked(candidate);
        } else {
            emit UnauthorizedOperation(21, candidate);
        }
    }

    function hasAccess(address candidate) public view returns (bool) {
        return (members[candidate] == true);
    }
}
