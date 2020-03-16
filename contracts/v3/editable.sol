pragma solidity 0.4.24;

//import {Ownable} from "./ownable.sol";
import "./strings.sol";
import "./accessible.sol";
import "./access_indexor.sol";
import "./user_space.sol";

/* -- Revision history --
Editable20190222140100ML: First versioned released
Editable20190315141800ML: Migrated to 0.4.24
Editable20190515103600ML: Modified rights restriction on update to match the one on commit
Editable20190522154000SS: Changed hash bytes32 to string
Editable20190605144500ML: Renamed publish to confirm to avoid confusion in the case of the content-objects
Editable20190715105600PO
Editable20190801135500ML: Made explicit the definition of parentAddress method
Editable20191219134600ML: Made updateRequest contingent on canEdit rather than ownership
Editable20200109145900ML: Limited updateRequest to canEdit
Editable20200124080600ML: Fixed deletion of latest version
Editable20200210163900ML: Modified for authV3 support
Editable20200316135400ML: Implements check and set rights to be inherited from

*/


contract Editable is  Accessible {
    using strings for *;

    bytes32 public version ="Editable20200316135400ML"; //class name (max 16), date YYYYMMDD, time HHMMSS and Developer initials XX

    event CommitPending(address spaceAddress, address parentAddress, string objectHash);
    event UpdateRequest(string objectHash);
    event VersionConfirm(address spaceAddress, string objectHash);
    event VersionDelete(address spaceAddress, string versionHash, int256 index);

    string public objectHash;
    // made public on 1/25/2020 - not generally safe to assume it's available on all deployed contracts
    uint public objectTimestamp;
    string[] public versionHashes;
    uint[] public versionTimestamp;

    string public pendingHash;
    bool public commitPending;


    // TODO: migrate version timestamps as well ...
    function migrate(string _objectHash, string _versionHashesConcat) internal onlyOwner {

        objectHash = _objectHash;

        if (bytes(_versionHashesConcat).length == 0)
            return;

        strings.slice memory s = _versionHashesConcat.toSlice();
        strings.slice memory delim = ":".toSlice();
        string[] memory hashes = new string[](s.count(delim) + 1);
        for(uint i = 0; i < hashes.length; i++) {
            hashes[i] = s.split(delim).toString();
        }
        versionHashes = hashes;

        return;
    }

    modifier onlyEditor() {
        require(canEdit());
        _;
    }

    function countVersionHashes() public view returns (uint256) {
        return versionHashes.length;
    }

    /*
    //This function is meant to be overloaded. By default the owner is the only editor
    function canEdit() public view returns (bool) {
        return (msg.sender == owner);
    }
    */
    function canEdit() public view returns (bool) {
        return hasEditorRight(tx.origin);
    }



    function hasEditorRight(address candidate) public view returns (bool) {
        if ((candidate == owner) || (visibility >= 100)) {
            return true;
        }
        if (indexCategory > 0) {
            address walletAddress = IUserSpace(contentSpace).userWallets(candidate);
            return AccessIndexor(walletAddress).checkRights(indexCategory, address(this), 2/*AccessIndexor TYPE_EDIT*/);
        } else {
            return false;
        }
    }


    /*
    function canSee(address candidate) public view returns (bool) {
        if ((candidate == owner) || (visibility >= 1)) {
            return true;
        }
        if (indexCategory > 0) {
            address walletAddress = IUserSpace(contentSpace).userWallets(candidate);
            return AccessIndexor(walletAddress).checkRights(indexCategory, address(this), 0); // AccessIndexor TYPE_SEE
        } else {
            return false;
        }
    }
    */

    // intended to be overridden
    function canConfirm() public view returns (bool) {
        return false;
    }

    function canCommit() public view returns (bool) {
        return (tx.origin == owner);
    }

    // overridden in BaseContent to return library
    function parentAddress() public view returns (address) {
        return contentSpace;
    }


    function clearPending() public {
        require(canCommit());
        pendingHash = "";
        commitPending = false;
    }

    function commit(string _objectHash) public {
        require(canCommit());
        require(!commitPending); // don't allow two possibly different commits to step on each other - one always wins
	    require(bytes(_objectHash).length < 128);
        pendingHash = _objectHash;
        commitPending = true;
        emit CommitPending(contentSpace, parentAddress(), pendingHash);
    }

    function confirmCommit() public payable returns (bool) {
        require(canConfirm());
        require(commitPending);

        if (bytes(objectHash).length > 0) {
            versionHashes.push(objectHash); // save existing version info
            versionTimestamp.push(objectTimestamp);
        }
        objectHash = pendingHash;
        objectTimestamp = block.timestamp;
        pendingHash = "";
        commitPending = false;
        emit VersionConfirm(contentSpace, objectHash);
        return true;
    }

    function updateRequest() public {
        require(canEdit());
        emit UpdateRequest(objectHash);
    }

    function removeVersionIdx(uint idx) internal {
        delete versionHashes[idx];
        delete versionTimestamp[idx];
        if (idx != (versionHashes.length - 1)) {
            versionHashes[idx] = versionHashes[versionHashes.length - 1];
            versionTimestamp[idx] = versionTimestamp[versionTimestamp.length - 1];
        }
        versionHashes.length--;
        versionTimestamp.length--;
        return;
    }

    function deleteVersion(string _versionHash) public returns (int256) {
        require(canCommit());

        bytes32 findHash = keccak256(abi.encodePacked(_versionHash));
        bytes32 objHash = keccak256(abi.encodePacked(objectHash));
        if (findHash == objHash) {
           if (versionHashes.length == 0) {
              objectHash = "";
              objectTimestamp = 0;
            } else {
              //find the most recent
               uint256 mostRecent = 0;
               uint latestStamp = 0;
                for (uint256 x = 0; x < versionHashes.length; x++) {
                  if (versionTimestamp[x] > latestStamp) {
                      mostRecent = x;
                      latestStamp = versionTimestamp[x];
                  }
                }
                //assign most recent version as object version and delete from versions array
                objectHash = versionHashes[mostRecent];
                objectTimestamp = latestStamp;
                removeVersionIdx(mostRecent);
            }
            emit VersionDelete(contentSpace, _versionHash, 0);
            return 0;
        }

        int256 foundIdx = -1;
        for (uint256 i = 0; i < versionHashes.length; i++) {
            bytes32 checkHash = keccak256(abi.encodePacked(versionHashes[i]));
            if (findHash == checkHash) {
                removeVersionIdx(i);
                foundIdx = int256(i);
                break;
            }
        }
        require(foundIdx != -1);

        emit VersionDelete(contentSpace, _versionHash, foundIdx);
        return foundIdx;
    }



    function setRights(address stakeholder, uint8 access_type, uint8 access) public {
        IUserSpace userSpaceObj = IUserSpace(contentSpace);
        address walletAddress = userSpaceObj.userWallets(stakeholder);
        if (walletAddress == 0x0){
            //stakeholder is not a user (hence group or wallet)
            setGroupRights(stakeholder, access_type, access);
        } else {
            setGroupRights(walletAddress, access_type, access);
        }
    }

    function setGroupRights(address group, uint8 access_type, uint8 access) public {
        AccessIndexor indexor = AccessIndexor(group);
        indexor.setRights(indexCategory, address(this), access_type, access);
    }

    function setVisibility(uint8 _visibility_code) public onlyEditor {
        visibility = _visibility_code;
    }
}
