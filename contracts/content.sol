pragma solidity ^0.4.21;

import {Ownable} from './ownable.sol';


contract Content is Ownable {
    event DbgString(string s);
    event DbgAddress(address a);
    event DbgUint256(uint256 u);
    event DbgUint(uint u);
    event RunAccessCharge(uint8 level, int256 calculateAccessCharge);
    event RunAccess(uint256 request_ID, uint result);
    event RunFinalize(uint256 request_ID, bool result);
    event RunStatusChange(int proposed_status_code, int return_status_code, int256 licenseFeeToBePaid);


    // charge, amount paid and address of the originator can all be retrieved from the requestMap using the requestID
    function runAccessCharge(uint8 /*level*/, bytes32[] /*customValues*/, address[] /*stakeholders*/) public payable returns (int256) {
        return -1; // indicates that the amount is the static one configured in the Content object and no extra calculation is required
    }
    function runAccess(uint256 /*request_ID*/, uint8 /*level*/, bytes32[] /*custom_values*/, address[] /*stake_holders*/) public payable returns(uint) {
        return 0; //indicates that access request can proceed. Other number can be used as error codes and would stop the processing.
    }
    function runFinalize(uint256 /*request_ID*/) public payable returns(bool) {
        return true; //the status is logged in an event at the end of the accessComplete function, behavior is currently unchanged regardless of result.
    }
    function runStatusChange(int proposed_status_code) public payable returns (int, int256) {
        return (proposed_status_code, -1); // a negative number indicates that the licending fee to be paid is the default
    }
}
