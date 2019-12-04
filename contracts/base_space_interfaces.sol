pragma solidity 0.4.24;

interface FactorySpace {
    // this is the only method that's not directly called on the space
    function createContent(address lib, address content_type) public returns (address);

    // current factory methods of space - not including wallet ...
    function createContentType() public returns (address);
    function createLibrary(address address_KMS) public returns (address);
    function createGroup() public returns (address);
}

interface UserSpace {
    function getUserWallet(address _userAddr) external view returns (address);
}

interface KmsSpace {
    function checkKMSAddr(address _kmsAddr) external view returns (uint);
    function getKMSID(address _kmsAddr) external view returns (string);
    function getKMSInfo(string _kmsID, bytes prefix) external view returns (string, string);
}

interface NodeSpace {
    function canNodePublish(address candidate) public view returns (bool);
}

