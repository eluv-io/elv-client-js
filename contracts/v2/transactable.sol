pragma solidity ^0.4.24;

interface Transactable {
    function execute(address _guarantor, uint8 _v, bytes32 _r, bytes32 _s, address _dest, uint256 _value, uint256 _ts) external returns (bool);
    function validateTimestamp(uint256 _ts) external view returns (bool, uint256);
    function validateTransaction(uint8 _v, bytes32 _r, bytes32 _s, address _dest, uint256 _value, uint256 _ts) external view returns (bool);
}
