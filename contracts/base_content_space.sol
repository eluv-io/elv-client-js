pragma solidity 0.4.21;

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

    event CreateContentType(address contentTypeAddress);
    event CreateLibrary(address libraryAddress);
    event CreateGroup(address groupAddress);
    event EngageAccountLibrary(address accountAddress);
    event SetFactory(address factory);


    function BaseContentSpace(string memory content_space_name) public {
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

