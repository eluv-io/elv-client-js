pragma solidity 0.4.21;

import {Accessible} from "./accessible.sol";
import {Editable} from "./editable.sol";
import "./accessible.sol";


contract BaseContentType is Accessible, Editable {

    bytes32 public version ="BaseContentType20190222145700ML"; //class name (max 16), date YYYYMMDD, time HHMMSS and Developer initials XX

    address public contentSpace;

    function BaseContentType(address content_space) public payable {
        contentSpace = content_space;
    }

}
