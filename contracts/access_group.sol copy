pragma solidity ^0.4.21;

import './ownable.sol';

contract AccessControlGroup is Ownable {

    mapping (address => bool) public members;
    mapping (address => bool) public managers;
    bytes32 public name;

    event MemberAdded(address candidate);
    event ManagerAccessGranted(address candidate);
    event MemberRevoked(address candidate);
    event ManagerAccessRevoked(address candidate);
    event UnauthorizedOperation(uint operation_code, address candidate);

    function stringToBytes32(string memory source) pure internal returns (bytes32 result) {
       bytes memory tempEmptyStringTest = bytes(source);
       if (tempEmptyStringTest.length == 0) {
           return 0x0;
       }
       assembly {
           result := mload(add(source, 32))
       }
    }

    function AccessControlGroup(string memory groupName) public {
	name = stringToBytes32(groupName);
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
      }	else {
	//console.log("Unauthorized attempt by "+ msg.sender + " to revoke manager privilege for " + manager);
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
        //console.log("Unauthorized attempt by "+ msg.sender + " to grant access privilege to " + candidate);
	emit UnauthorizedOperation(20, candidate);
      }
    }

    function revokeAccess(address candidate) public {
      if ((managers[msg.sender] == true) || (msg.sender == candidate)) {
        members[candidate] = false;
	emit MemberRevoked(candidate);
      } else {
        //console.log("Unauthorized attempt by "+ msg.sender + " to revoke access privilege for " + manager);
	emit UnauthorizedOperation(21, candidate);
      }
    }

    function hasAccess(address candidate) public view returns (bool) {
        return (members[candidate] == true);
    }

    function groupName() public view returns (string) {
	bytes memory bytesArray = new bytes(32);
        for (uint256 i; i < 32; i++) {
          bytesArray[i] = name[i];
        }
        return string(bytesArray);
    }


}
