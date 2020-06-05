pragma solidity 0.4.24;

import "./ownable.sol";

contract MetaObject is Ownable {

    mapping(bytes32 => bytes) mapSmallKeys;
    mapping(bytes => bytes) mapBigKeys;

    event ObjectMetaChanged(bytes key);

    function putMeta(bytes key, bytes value) public onlyOwner {
        if (key.length <= 32) {
            bytes32 smallKey;
            uint256 keyLen = key.length;
            assembly {
                smallKey := mload(add(key, keyLen))
            }
            mapSmallKeys[smallKey] = value;
        } else {
            mapBigKeys[key] = value;
        }
        emit ObjectMetaChanged(key);
    }

    function getMeta(bytes key) public constant returns (bytes) {
        if (key.length <= 32) {
            bytes32 smallKey;
            uint256 keyLen = key.length;
            assembly {
                smallKey := mload(add(key, keyLen))
            }
            return mapSmallKeys[smallKey];
        }
        return mapBigKeys[key];
    }
}