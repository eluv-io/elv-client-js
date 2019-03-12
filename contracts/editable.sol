pragma solidity 0.4.21;

import {Ownable} from "./ownable.sol";


contract Editable is Ownable {

    bytes32 public version ="Editable20190222140100ML"; //class name (max 16), date YYYYMMDD, time HHMMSS and Developer initials XX

    event Commit(bytes32 objectHash);
    event UpdateRequest(bytes32 objectHash);

    bytes32 public objectHash;

    function commit(bytes32 object_hash) public onlyOwner {
        objectHash = object_hash;
        emit Commit(objectHash);
    }

    function updateRequest() public onlyOwner {
        emit UpdateRequest(objectHash);
    }

}
