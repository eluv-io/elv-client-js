pragma solidity 0.4.24;

import {Accessible} from "./accessible.sol";
import {Editable} from "./editable.sol";
import "./accessible.sol";


/* -- Revision history --
BaseContentType20190222145700ML: First versioned released
BaseContentType20190318101200ML: Migrated to 0.4.24
*/


contract BaseContentType is Accessible, Editable {

    bytes32 public version ="BaseContentType20190318101200ML"; //class name (max 16), date YYYYMMDD, time HHMMSS and Developer initials XX

    address public contentSpace;

    constructor(address content_space) public payable {
        contentSpace = content_space;
    }

    function canPublish() public view returns (bool) {
        return msg.sender == owner;
    }
}
