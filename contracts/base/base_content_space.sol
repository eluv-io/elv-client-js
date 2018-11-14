pragma solidity 0.4.21;

import {Ownable} from "./ownable.sol";
import {BaseAccessControlGroup} from './base_access_control_group.sol';
import {BaseContentType} from './base_content_type.sol';
import {BaseLibrary} from './base_library.sol';


contract BaseContentSpace is Ownable {


    string public name;
    string public description;

    event CreateContentType(address contentTypeAddress);
    event CreateLibrary(address libraryAddress);
    event CreateGroup(address groupAddress);
    event CreateAccountLibrary(address accountAddress);


    function BaseContentSpace(string memory content_space_name) public {
        name = content_space_name;
    }


    function setDescription(string memory content_space_description) public  {
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

    function createAccountLibrary() public returns (address) {
        emit CreateAccountLibrary(tx.origin);
    }


}

