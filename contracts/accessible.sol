pragma solidity 0.4.21;


contract Accessible {

    bytes32 public version ="Accessible20190222135900ML"; //class name (max 16), date YYYYMMDD, time HHMMSS and Developer initials XX

    event AccessRequest();

    function accessRequest() public returns (bool) {
        emit AccessRequest();
        return true;
    }

}
