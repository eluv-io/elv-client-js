pragma solidity 0.4.21;

import {Accessible} from "./accessible.sol";
import {Editable} from "./editable.sol";
import "./accessible.sol";


contract BaseContentType is Accessible, Editable {


    address public contentSpace;

    function BaseContentType() public payable {
        contentSpace = msg.sender;
    }

}
