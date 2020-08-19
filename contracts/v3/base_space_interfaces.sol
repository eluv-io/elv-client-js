pragma solidity 0.4.24;

interface IFactorySpace {
    // this is the only method that's not directly called on the space
    function createContent(address lib, address content_type) external returns (address);

    // current factory methods of space - not including wallet ...
    function createContentType() external returns (address);
    function createLibrary(address address_KMS) external returns (address);
    function createGroup() external returns (address);
}

interface IUserSpace {
    function userWallets(address _userAddr) external view returns (address);
    function createUserWallet(address _user) external returns (address);
}

interface IKmsSpace {
    function checkKMSAddr(address _kmsAddr) external view returns (uint);
    function getKMSID(address _kmsAddr) external view returns (string);
    function getKMSInfo(string _kmsID, bytes prefix) external view returns (string, string);
}

interface INodeSpace {
    function canNodePublish(address candidate) external view returns (bool);
}

