pragma solidity 0.4.21;

import {Ownable} from "./ownable.sol";


contract Accessible is Ownable {


    event AccessRequest(uint requestValidity);

    function accessRequest() public returns (bool) {
        emit AccessRequest(0);
        return true;
    }

}
