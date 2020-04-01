pragma solidity 0.4.24;

/* -- Revision history --
Accessible20190222135900ML: First versioned released
Accessible20190315141600ML: Migrated to 0.4.24
Accessible20200107160900ML: Moved Visibility filter from BaseContentObject to Accessible
Accessible20200210095300ML: Changed API to V3
Accessible20200316121600ML: Implements hasAccess
*/

import "./ownable.sol";
import "./access_indexor.sol";
import "./user_space.sol";

contract Accessible is Ownable {

    bytes32 public version ="Accessible20200316121600ML"; //class name (max 16), date YYYYMMDD, time HHMMSS and Developer initials XX

    uint8 public visibility = 1;
    uint8 public constant CAN_SEE = 1;
    uint8 public constant CAN_ACCESS = 10;
    uint8 public constant CAN_EDIT = 100;
    uint8 public indexCategory = 0;


    event AccessRequestV3(
        bytes32 requestNonce,
        address parentAddress, // likely will need for tenancy - but could be something else ...?
        bytes32 contextHash,
        address accessor,           // I've called this 'userAddress' - don't care too much but ideally it's the same name wherever it means the same thing!
        uint256 requestTimestamp   // always millis - either set from context or with blockchain now()
    );

    function hasAccess(address candidate) public view returns (bool) {

        if ((candidate == owner) || (visibility >= 10) ) {
            return true;
        }

        if (indexCategory > 0) {
            address walletAddress = IUserSpace(contentSpace).userWallets(candidate);
            return AccessIndexor(walletAddress).checkRights(indexCategory, address(this), 1/*AccessIndexor TYPE_ACCESS*/);
        } else {
            return false;
        }
    }


    function accessRequestV3(
        bytes32[] customValues,
        address[] stakeholders
    ) public payable returns (bool) {
        require(hasAccess(msg.sender));
        emit AccessRequestV3(keccak256(abi.encodePacked(address(this), now)), 0x0, 0x0, msg.sender, now * 1000);
        return true;
    }


    function setVisibility(uint8 _visibility_code) public onlyOwner {
        visibility = _visibility_code;
    }

}
