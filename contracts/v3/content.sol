pragma solidity 0.5.4;

import {Ownable} from "./ownable.sol";
import {BaseContent} from "./base_content.sol";

/* -- Revision history --
Content20190221101700ML: First versioned released
Content20190301121800ML: Adds stub for runAccessInfo
Content20190315171500ML: Migrated to 0.4.24
Content20190506155000ML: Makes the default for runAccess match content object behavior that does not have custom contract
Content20190510151600ML: Modified API for runAccessInfo to add Access information
Content20191031162000ML: Adds finalize method for state channel
Content20191219134300ML: Adds hook to be used to override standard behavior for authorization to edit
Content20200130164500ML: Allows kill to be commanded by other content object
Content20200205141800ML: Closes vulnerability allowing alien external objects to kill the contract
Content20200210164100ML: Modified for authV3 support
*/

contract Content is Ownable {

    bytes32 public version ="Content20200210164100ML"; //class name (max 16), date YYYYMMDD, time HHMMSS and Developer initials XX

    uint8 public constant DEFAULT_SEE  = 1;
    uint8 public constant DEFAULT_ACCESS  = 2;
    uint8 public constant DEFAULT_CHARGE  = 4;

    address authorizedKiller;

    event Log(string label);
    event LogBool(string label, bool b);
    event LogAddress(string label, address a);
    event LogUint256(string label, uint256 u);
    event LogInt256(string label, int256 u);
    event LogBytes32(string label, bytes32 b);
    event LogPayment(string label, address payee, uint256 amount);
    event RunCreate(uint result);
    event RunKill(uint result);
    event RunStatusChange(int proposedStatusCode, int returnStatusCode);
    event RunAccessCharge(int256 calculatedAccessCharge);
    event RunAccess(uint256 requestNonce, uint result);
    event RunFinalize(uint256 requestNonce, uint result);

    function runDescribeStatus(int) public view returns (bytes32) {
        return 0x0;
    }

    //0 indicates that the creation can proceed.
    // Other numbers can be used as error codes and would stop the processing.
    function runCreate() public payable returns (uint) {
        return 0;
    }


   //0 indicates edit can proceed
   //100 indicates that custom contract does not modify default behavior
   function runEdit() public returns (uint) {
       return 100;
   }

    //0 indicates that normal behavior should apply
    //100 indicates that normal behavior should apply and the custom contract should be killed too
    //1000 indicates that the deletion/inactivation can proceed without further validations
    //1100 indicates that the deletion can proceed without further validations and the custom contract should be killed too
    // Other numbers can be used as error codes and would stop the processing.
    function runKill() public payable returns (uint) {
        return 0;
    }


    function runKillExt() public payable returns (uint) {
        uint result = runKill();
        if ((result == 100) || (result == 1100)) {
          authorizedKiller = msg.sender;
        } else {
          authorizedKiller = address(0x0);
        }
        return result;
    }

    // a negative number returned indicates that the licensing fee to be paid is the default
    function runStatusChange(int proposed_status_code) public payable returns (int) {
        return proposed_status_code;
    }


    function runAccessInfo(
        bytes32[] memory, /*customValues*/
        address payable[] memory, /*stakeholders*/
        address
    ) public view returns (uint8, uint8, uint8, uint256) //Mask, visibilityCode, accessCode, accessCharge
    {
        return (7, 0, 0, 0); //7 is DEFAULT_SEE + DEFAULT_ACCESS + DEFAULT_CHARGE, hence the 3 tailing values are ignored
    }



    //0 indicates that access request can proceed.
    // Other numbers can be used as error codes and would stop the processing.
    function runAccess(
        uint256,
        bytes32[] memory,
        address payable[] memory,
        address
    )
        public payable returns(uint)
    {
            return 0;
    }



    //the status is logged in an event at the end of the accessComplete function
    // behavior is currently unchanged regardless of result.
    // 0 indicates that the finalization can proceed.
    // Other numbers can be used as error codes and would stop the processing.
    function runFinalize(
      uint256,
      bytes32[] memory,
      address[] memory,
      address
    ) public payable returns (uint) {
        return 0;
    }


    function commandKill() public  {
       require(authorizedKiller == msg.sender);
       BaseContent baseContent = BaseContent(msg.sender);
       require(baseContent.contentContractAddress() == address(this));
       selfdestruct(owner);  // kills contract; send remaining funds back to owner
   }

}
