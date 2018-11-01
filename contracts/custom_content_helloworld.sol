pragma solidity ^0.4.21;

import './library.sol';

contract HelloWorld is CustomContract
{

    event HelloWorldEvent(string message, address stakeHolder0);

    uint256 public credit = 1 * 1000000000000000000;

    function runAccess(
        uint256 /* request_ID */,
        uint8 /* level */,
        bytes32[] /* custom_values */,
	address[] stake_holders) public payable returns(uint)
    {
	if (stake_holders.length > 0) {

            emit HelloWorldEvent("Hi there", stake_holders[0]);

            // Pay the stake holder a small amount
	    stake_holders[0].transfer(credit);
	    return 0;

        } else {

            emit HelloWorldEvent("Hi there - no stake holders", 0x0);
	    return 1;

        }
    }

    function setCredit(
        uint256 newCredit) public onlyOwner
    {
        credit = newCredit;
    }

}
