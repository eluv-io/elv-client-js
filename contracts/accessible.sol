pragma solidity 0.4.21;


contract Accessible {


    event AccessRequest(uint requestValidity);

    function accessRequest() public returns (bool) {
        emit AccessRequest(0);
        return true;
    }

}
