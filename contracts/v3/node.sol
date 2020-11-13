pragma solidity 0.5.4;

import {Ownable} from "./ownable.sol";

/* -- Revision history --
Node20190315105100ML: First versioned released
*/

contract Node is Ownable {

    bytes32 public version ="Node20190315105100ML"; //class name (max 16), date YYYYMMDD, time HHMMSS and Developer initials XX

    event Log(string label);
    event LogBool(string label, bool b);
    event LogAddress(string label, address a);
    event LogUint256(string label, uint256 u);
    event LogInt256(string label, int256 u);
    event LogBytes32(string label, bytes32 b);

    function log(string memory label) public onlyOwner {
        emit Log(label);
    }
}
