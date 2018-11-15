pragma solidity 0.4.21;

import {Editable} from "./editable.sol";


contract BaseContentType is Editable {


    address public contentSpace;

    function BaseContentType() public payable {
        contentSpace = msg.sender;
    }

}
