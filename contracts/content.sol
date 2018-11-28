pragma solidity 0.4.21;

import {Ownable} from "./ownable.sol";


contract Content is Ownable {


    event DbgString(string s);
    event DbgAddress(address a);
    event DbgUint256(uint256 u);
    event DbgUint(uint u);
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

    //0 indicates that the deletion/inactivation can proceed.
    // Other numbers can be used as error codes and would stop the processing.
    function runKill() public payable returns (uint) {
        return 0;
    }

    // a negative number returned indicates that the licending fee to be paid is the default
    function runStatusChange(int proposed_status_code) public payable returns (int) {
        return proposed_status_code;
    }

    // charge, amount paid and address of the originator can all be retrieved from the requestMap using the requestID
    // a -1 return indicates that the amount is the static one configured in the Content object
    //  and no extra calculation is required
    function runAccessCharge(
        uint8, /*level*/
        bytes32[], /*customValues*/
        address[] /*stakeholders*/
    )
        public payable returns (int256)
    {
        return -1;
    }

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

    //the status is logged in an event at the end of the accessComplete function
    // behavior is currently unchanged regardless of result.
    // 0 indicates that the finalization can proceed.
    // Other numbers can be used as error codes and would stop the processing.
    function runFinalize(uint256 /*request_ID*/) public payable returns(uint) {
        return 0;
    }

}
