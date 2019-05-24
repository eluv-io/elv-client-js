pragma solidity 0.4.24;

import {Ownable} from "./ownable.sol";


/* -- Revision history --
Editable20190222140100ML: First versioned released
Editable20190315141800ML: Migrated to 0.4.24
Editable20190515103600ML: Modified rights restriction on update to match the one on commit
Editable20190522154000SS: Changed hash bytes32 to string
*/


contract Editable is Ownable {

    bytes32 public version ="Editable20190522154000SS"; //class name (max 16), date YYYYMMDD, time HHMMSS and Developer initials XX

    event Commit(string objectHash);
    event UpdateRequest(string objectHash);

    string public objectHash;

    // intended to be overridden
    function canPublish() public view returns (bool) {
        return false;
    }

    function commit(string object_hash) public {
        require(msg.sender == owner || canPublish());
	require(bytes(object_hash).length < 128);
        objectHash = object_hash;
        emit Commit(objectHash);
    }

    function updateRequest() public {
        require(msg.sender == owner || canPublish());
        emit UpdateRequest(objectHash);
    }

}
