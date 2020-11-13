pragma solidity 0.5.4;

interface Transactable {
    function execute(address _guarantor, uint8 _v, bytes32 _r, bytes32 _s, address payable _dest, uint256 _value, uint256 _ts) external returns (bool);
    function validateTimestamp(uint256 _ts) external view returns (bool);
    function validateTransaction(uint8 _v, bytes32 _r, bytes32 _s, address _dest, uint256 _value, uint256 _ts) external view returns (bool);
}
