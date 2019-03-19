pragma solidity ^0.4.21;

import {Ownable} from "./ownable.sol";
import {Accessible} from "./accessible.sol";
import {Editable} from "./editable.sol";
import {BaseAccessControlGroup} from "./base_access_control_group.sol";
import {BaseContentType} from "./base_content_type.sol";
import {BaseLibrary} from "./base_library.sol";
import "./accessible.sol";


contract BaseContentSpace is Accessible, Editable {

    bytes32 public version ="BaseContentSpace20190221114100ML"; //class name (max 16), date YYYYMMDD, time HHMMSS and Developer initials XX

    string public name;
    string public description;
    address public factory;

    address[] public activeNodeAddresses;
    bytes[] public activeNodeLocators;

    address[] public pendingNodeAddresses;
    bytes[] public pendingNodeLocators;

    function checkRedundantEntry(address[] _addrs, bytes[] _locators, address _nodeAddr, bytes _nodeLocator) pure internal returns (bool) {
        require(_addrs.length == _locators.length);
        for (uint i = 0; i < _addrs.length; i++) {
            // right now we assume that neither the address or the locator can be used redundantly
            if (keccak256(_locators[i]) == keccak256(_nodeLocator) || _addrs[i] == _nodeAddr) {
                return true;
            }
        }
        return false;
    }

    event NodeSubmitted(address addr, bytes locator);

    function numActiveNodes() public view returns (uint) {
        return activeNodeLocators.length;
    }

    function numPendingNodes() public view returns (uint) {
        return pendingNodeLocators.length;
    }

    // we assume that this call is made from the submitted node - that is, from their address
    function submitNode(bytes _locator) public {
        require(!checkRedundantEntry(pendingNodeAddresses, pendingNodeLocators, msg.sender, _locator));
        require(!checkRedundantEntry(activeNodeAddresses, activeNodeLocators, msg.sender, _locator));
        require(pendingNodeAddresses.length < 100); // don't allow *too* much abuse - TODO: what value?
        pendingNodeLocators.push(_locator);
        pendingNodeAddresses.push(msg.sender);
        emit NodeSubmitted(msg.sender, _locator);
    }

    event NodeApproved(address addr, bytes locator);

    function removeNodeInternal(uint nodeOrd, address[] storage _nodeAddresses, bytes[] storage _nodeLocators) internal {
        require(nodeOrd < _nodeAddresses.length && nodeOrd < _nodeLocators.length);
        if (nodeOrd != _nodeAddresses.length - 1) {
            _nodeLocators[nodeOrd] = _nodeLocators[_nodeLocators.length - 1];
            _nodeAddresses[nodeOrd] = _nodeAddresses[_nodeAddresses.length - 1];
        }
        delete _nodeLocators[_nodeLocators.length - 1];
        _nodeLocators.length--;
        delete _nodeAddresses[_nodeAddresses.length - 1];
        _nodeAddresses.length--;
    }

    function approveNode(address _nodeAddr) public onlyOwner {
        bool found = false;
        for (uint i = 0; i < pendingNodeAddresses.length; i++) {
            if (pendingNodeAddresses[i] == _nodeAddr) {
                activeNodeAddresses.push(pendingNodeAddresses[i]);
                activeNodeLocators.push(pendingNodeLocators[i]);
                emit NodeApproved(pendingNodeAddresses[i], pendingNodeLocators[i]);
                removeNodeInternal(i, pendingNodeAddresses, pendingNodeLocators);
                found = true;
                break;
            }
        }
        require(found);
    }

    // direct method for owner to add node(s)
    function addNode(address _nodeAddr, bytes _locator) public onlyOwner {
        require(!checkRedundantEntry(activeNodeAddresses, activeNodeLocators, _nodeAddr, _locator));
        activeNodeAddresses.push(_nodeAddr);
        activeNodeLocators.push(_locator);
    }

    // direct method for owner to remove node(s)
    function removeNode(address _nodeAddr) public onlyOwner {
        for (uint i = 0; i < activeNodeAddresses.length; i++) {
            if (activeNodeAddresses[i] == _nodeAddr) {
                removeNodeInternal(i, activeNodeAddresses, activeNodeLocators);
            }
        }
    }

    // check whether an address - which should represent a content fabric node - can confirm (publish?) a content object
    function canNodePublish(address candidate) public view returns (bool) {
        for (uint i = 0; i < activeNodeAddresses.length; i++) {
            if (activeNodeAddresses[i] == candidate) {
                return true;
            }
        }
        return false;
    }

    event CreateContentType(address contentTypeAddress);
    event CreateLibrary(address libraryAddress);
    event CreateGroup(address groupAddress);
    event EngageAccountLibrary(address accountAddress);
    event SetFactory(address factory);


    constructor(string memory content_space_name) public {
        name = content_space_name;
        factory = new BaseFactory();
        //BaseFactory(factory).setContentSpace();
    }

    function setFactory(address new_factory) public onlyOwner {
        factory = new_factory;
        //BaseFactory(factory).setContentSpace();
    }

    function setDescription(string memory content_space_description) public onlyOwner {
        description = content_space_description;
    }

    function createContentType() public returns (address) {
        address contentTypeAddress = BaseFactory(factory).createContentType();
        emit CreateContentType(contentTypeAddress);
        return contentTypeAddress;
    }

    function createLibrary(address address_KMS) public returns (address) {
        address libraryAddress = BaseFactory(factory).createLibrary(address_KMS);
        emit CreateLibrary(libraryAddress);
        return libraryAddress;
    }

    function createGroup() public returns (address) {
        address groupAddress = BaseFactory(factory).createGroup();
        emit CreateGroup(groupAddress);
        return groupAddress;
    }

    function engageAccountLibrary() public returns (address) {
        emit EngageAccountLibrary(tx.origin);
    }

}

/* -- Revision history --
BaseFactory20190227170400ML: First versioned released
BaseFactory20190301105700ML: No changes version bump to test
*/

contract BaseFactory is Ownable {

    bytes32 public version ="BaseFactory20190301105700ML"; //class name (max 16), date YYYYMMDD, time HHMMSS and Developer initials XX

    /*address public contentSpace;

    function setContentSpace() public onlyOwner {
        contentSpace = msg.sender;
    }
    */

    function createContentType() public returns (address) {
        return (new BaseContentType(msg.sender));
    }

    function createLibrary(address address_KMS) public returns (address) {
        return (new BaseLibrary(address_KMS, msg.sender));
    }

    function createGroup() public returns (address) {
        return (new BaseAccessControlGroup(msg.sender));
    }
}

