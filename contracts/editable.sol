pragma solidity 0.4.24;

import {Ownable} from "./ownable.sol";


/* -- Revision history --
Editable20190222140100ML: First versioned released
Editable20190315141800ML: Migrated to 0.4.24
Editable20190515103600ML: Modified rights restriction on update to match the one on commit
Editable20190522154000SS: Changed hash bytes32 to string
Editable20190605144500ML: Renamed publish to confirm to avoid confusion in the case of the content-objects
*/


contract Editable is Ownable {

    bytes32 public version ="Editable20190607105600PO"; //class name (max 16), date YYYYMMDD, time HHMMSS and Developer initials XX

    event CommitPending(string objectHash);
    event UpdateRequest(string objectHash);
    event VersionConfirm(string objectHash);

    string public objectHash;
    string[] public versionHashes;
    string pendingHash;

    function countVersionHashes() public view returns (uint256) {
        return versionHashes.length;
    }

    // intended to be overridden
    function canConfirm() public view returns (bool) {
        return false;
    }

    function canCommit() public view returns (bool) {
        return (tx.origin == owner);
    }

    function commit(string _objectHash) public {
        require(canCommit());
	    require(bytes(_objectHash).length < 128);
        pendingHash = _objectHash;
        emit CommitPending(pendingHash);
    }

    function confirmCommit() public payable returns (bool) {
        require(canConfirm());

        if (bytes(objectHash).length > 0) {
            versionHashes.push(objectHash); // save existing version info
        }
        objectHash = pendingHash;
        pendingHash = "";
        emit VersionConfirm(objectHash);
    }

    function updateRequest() public {
        require(msg.sender == owner || canConfirm());
        emit UpdateRequest(objectHash);
    }
}
