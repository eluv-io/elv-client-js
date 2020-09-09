pragma solidity 0.4.24;

import "./ownable.sol";
import "./lib_enctoken.sol";

contract CounterObject is Adminable {

    event CounterIncremented(bytes32 ident, uint8 slot, uint32 val);
    event BitSetAndGet(bytes32 ident, uint8 ord, bool prev);
    event WordGroupDeleted(bytes32 ident);

    struct wordGroup {
        uint32[8] slots;
    }

    mapping(bytes32 => wordGroup) wordGroups;

    function deleteGroup(bytes32 _ident) public onlyAdmin {
        delete wordGroups[_ident];
        emit WordGroupDeleted(_ident);
    }

    function incrementCounter(bytes32 _ident, uint8 _ord) public onlyAdmin {
        require(_ord < 8);
        uint32 x = wordGroups[_ident].slots[_ord];
        wordGroups[_ident].slots[_ord]++;
        emit CounterIncremented(_ident, _ord, x);
    }

    function getCounter(bytes32 _ident, uint8 _ord) public view returns (uint32) {
        require(_ord < 8);
        return wordGroups[_ident].slots[_ord];
    }

    function getBit(bytes32 _ident, uint8 _ord) public view returns (bool) {
        uint256 slot = _ord / (4 * 8); // bytes per slot * bits per slot
        uint256 bit = _ord % (4 * 8);
        uint32 checkVal = uint32(1) << bit;
        return wordGroups[_ident].slots[slot] & checkVal == 0 ? false : true;
    }

    function setAndGetBitInternal(bytes32 _ident, uint8 _ord) returns (bool) {
        uint256 slot = _ord / (4 * 8); // bytes per slot * bits per slot
        uint256 bit = _ord % (4 * 8);
        uint32 checkVal = uint32(1) << bit;
        bool currSet = wordGroups[_ident].slots[slot] & checkVal == 0 ? false : true;
        if (!currSet)
            wordGroups[_ident].slots[slot] |= checkVal;
        emit BitSetAndGet(_ident, _ord, currSet);
        return currSet;
    }

    function setAndGetBit(bytes32 _ident, uint8 _ord) public onlyAdmin returns (bool) {
        return setAndGetBitInternal(_ident, _ord);
    }
}

contract MetaObject is Adminable {

    mapping(bytes32 => bytes) mapSmallKeys;
    mapping(bytes => bytes) mapBigKeys;

    event ObjectMetaChanged(bytes key);

    function putMeta(bytes key, bytes value) public onlyAdmin {
        if (key.length <= 32) {
            bytes32 smallKey;
            uint256 keyLen = key.length;
            assembly {
                smallKey := mload(add(key, keyLen))
            }
            delete mapSmallKeys[smallKey];
            if (value.length > 0)
                mapSmallKeys[smallKey] = value;
        } else {
            delete mapBigKeys[key];
            if (value.length > 0)
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