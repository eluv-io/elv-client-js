pragma solidity ^0.4.21;

import {Accessible} from "./accessible.sol";

contract Editable is Accessible {

    event Commit(bytes32 objectHash);
    event UpdateRequest(bytes32 objectHash);

    bytes32 objectHash;

    function commit(bytes32 object_hash) public onlyOwner {
        objectHash = object_hash;
        emit Commit(objectHash);
    }

    function updateRequest() public onlyOwner {
        emit UpdateRequest(objectHash);
    }

}