pragma solidity 0.4.21;

import {Accessible} from "./accessible.sol";
import {Editable} from "./editable.sol";
import {BaseAccessControlGroup} from "./base_access_control_group.sol";
import {BaseContentType} from "./base_content_type.sol";
import {BaseLibrary} from "./base_library.sol";
import "./accessible.sol";


contract BaseContentSpace is Accessible, Editable {


    string public name;
    string public description;

    event CreateContentType(address contentTypeAddress);
    event CreateLibrary(address libraryAddress);
    event CreateGroup(address groupAddress);
    event EngageAccountLibrary(address accountAddress);

    function BaseContentSpace(string memory content_space_name) public {
        name = content_space_name;
    }

    function setDescription(string memory content_space_description) public onlyOwner {
        description = content_space_description;
    }

    function createContentType() public returns (address) {
        address contentTypeAddress = new BaseContentType();
        emit CreateContentType(contentTypeAddress);
        return contentTypeAddress;
    }

    function createLibrary(address address_KMS) public returns (address) {
        address libraryAddress = new BaseLibrary(address_KMS);
        emit CreateLibrary(libraryAddress);
        return libraryAddress;
    }

    function createGroup() public returns (address) {
        address groupAddress = new BaseAccessControlGroup();
        emit CreateGroup(groupAddress);
        return groupAddress;
    }

    function engageAccountLibrary() public returns (address) {
        emit EngageAccountLibrary(tx.origin);
    }


}

