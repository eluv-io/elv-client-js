pragma solidity ^0.4.16;

contract TestStoreMini {

    uint storedData;

    function set(uint x) public {
        storedData = x;
    }

    function get() constant public returns (uint) {
        return storedData;
    }

}
