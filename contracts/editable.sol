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
    event CommitPending(string objectHash);
    event UpdateRequest(string objectHash);

    string public objectHash;
    string[] public versionHashes;
    string pendingHash;

    function countVersionHashes() public view returns (uint256) {
        return versionHashes.length;
    }

    // intended to be overridden
    function canPublish() public view returns (bool) {
        return false;
    }

    function commit(string _objectHash) public {
        require(msg.sender == owner || canPublish());
	    require(bytes(_objectHash).length < 128);
        pendingHash = _objectHash;
        emit CommitPending(pendingHash);
    }

    function publish() public payable returns (bool) {
        require(canPublish());

        if (bytes(objectHash).length > 0) {
            versionHashes.push(objectHash); // save existing version info
        }
        objectHash = pendingHash;
        pendingHash = "";
    }

    function updateRequest() public {
        require(msg.sender == owner || canPublish());
        emit UpdateRequest(objectHash);
    }
}
