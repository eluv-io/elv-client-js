pragma solidity 0.4.21;


contract Accessible {


    event AccessRequest();

    function accessRequest() public returns (bool) {
        emit AccessRequest();
        return true;
    }

}
