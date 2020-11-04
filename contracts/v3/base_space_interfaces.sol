pragma solidity 0.5.4;

interface IFactorySpace {
    // this is the only method that's not directly called on the space
    function createContent(address payable lib, address payable content_type) external returns (address);

    // current factory methods of space - not including wallet ...
    function createContentType() external returns (address);
    function createLibrary(address address_KMS) external returns (address);
    function createGroup() external returns (address);
}

interface IUserSpace {
    function userWallets(address _userAddr) external view returns (address);
    function createUserWallet(address payable _user) external returns (address);
}

interface IKmsSpace {
    function checkKMS(string calldata _kmsIdStr) external view returns (uint);
    function checkKMSAddr(address _kmsAddr) external view returns (uint);
    function getKMSID(address _kmsAddr) external view returns (string memory);
    function getKMSInfo(string calldata _kmsID, bytes calldata prefix) external view returns (string memory, string memory);
}

interface INodeSpace {
    function canNodePublish(address candidate) external view returns (bool);
}

