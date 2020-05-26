pragma solidity 0.4.24;

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
*/

contract Content is Ownable {

    bytes32 public version ="Content20191219134300ML"; //class name (max 16), date YYYYMMDD, time HHMMSS and Developer initials XX

    uint8 public constant DEFAULT_SEE  = 1;
    uint8 public constant DEFAULT_ACCESS  = 2;
    uint8 public constant DEFAULT_CHARGE  = 4;

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
    event RunAccessCharge(uint8 level, int256 calculateAccessCharge);
    event RunAccess(uint256 requestID, uint result);
    event RunFinalize(uint256 requestID, uint result);

    function runDescribeStatus(int) public pure returns (bytes32) {
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

    //0 indicates that the deletion/inactivation can proceed.
    //100 indicates that the deletion can proceed and the custom contract should be killed too
    // Other numbers can be used as error codes and would stop the processing.
    function runKill() public payable returns (uint) {
        return 0;
    }

    // a negative number returned indicates that the licending fee to be paid is the default
    function runStatusChange(int proposed_status_code) public payable returns (int) {
        return proposed_status_code;
    }


    function runAccessInfo(
        uint8, /*level*/
        bytes32[], /*customValues*/
        address[] /*stakeholders*/
    )
    public view returns (uint8, uint8, uint8, uint256) //Mask, visibilityCode, accessCode, accessCharge
    {
        return (7, 0, 0, 0); //7 is DEFAULT_SEE + DEFAULT_ACCESS + DEFAULT_CHARGE, hence the 3 tailing values are ignored
    }

    /* DEPRECATED - runAccessInfo is used instead
    // charge, amount paid and address of the originator can all be retrieved from the requestMap using the requestID
    // a -1 return indicates that the amount is the static one configured in the Content object
    //  and no extra calculation is required
    function runAccessCharge(
        uint8, //level
        bytes32[], //customValues
        address[] //stakeholders
    )
        public payable returns (int256)
    {
        return -1;
    }
    */

    //0 indicates that access request can proceed.
    // Other numbers can be used as error codes and would stop the processing.
    function runAccess(
        uint256, /*request_ID*/
        uint8, /*level*/
        bytes32[], /*custom_values*/
        address[] /*stake_holders*/
    )
        public payable returns(uint)
    {
            return 0;
    }

    //0 indicates that access grant can proceed.
    // Other numbers can be used as error codes and would stop the processing.
    function runGrant(
        uint256, /*request_ID */
        bool /*access_granted */
    )
    public payable returns (uint)
    {
        return 0;
    }

    //the status is logged in an event at the end of the accessComplete function
    // behavior is currently unchanged regardless of result.
    // 0 indicates that the finalization can proceed.
    // Other numbers can be used as error codes and would stop the processing.
    function runFinalize(uint256 /*request_ID*/, uint256 /*score_pct*/) public payable returns (uint) {
        return 0;
    }

    function runFinalizeExt(uint256 requestID, uint256 score_pct, address originator) public payable returns (uint) {
        return 0;
    }

}
