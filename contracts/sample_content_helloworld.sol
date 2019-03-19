pragma solidity 0.4.24;

import {Content} from "./content.sol";
import {BaseContent} from "./base_content.sol";


/* -- Revision history --
SplContHelloWrld20190318114800ML: First versioned released, Migrated to 0.4.24
*/



contract SampleContentHelloWorld is Content {

    event HelloWorldEvent(string message, address stakeHolder0);

    bytes32 public version ="SplContHelloWrld20190318114800ML"; //class name (max 16), date YYYYMMDD, time HHMMSS and Developer initials XX

    uint256 public credit = 1 * 1000000000000000000;
    bytes32 public constant STATUS_PUBLISHED = "Ready";

    function runDescribeStatus(int status_code) public pure returns (bytes32) {
        if (status_code == 0) {
            return STATUS_PUBLISHED;
        }
        return 0x0;
    }

    function runAccess(
        uint256, /* request_ID */
        uint8, /* level */
        bytes32[], /* custom_values */
        address[] stake_holders
    )
        public payable returns(uint)
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

    function setCredit(uint256 newCredit) public onlyOwner {
        credit = newCredit;
    }

}
