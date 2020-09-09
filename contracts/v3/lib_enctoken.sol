pragma solidity ^0.4.24;

library EncToken {

    address constant elv_precomp_enc_token_addr = 254;

    bytes4 constant sigIdString = bytes4(keccak256("getString(string,bytes)"));
    bytes4 constant sigIdUint = bytes4(keccak256("getUint(string,bytes)"));
    bytes4 constant sigIdAddress = bytes4(keccak256("getAddress(string,bytes)"));

    function getUint(string _attrib, bytes _tok) internal constant returns (uint256 ret) {
        bytes4 sig = sigIdUint;
        address callAddr = elv_precomp_enc_token_addr;
        bytes32 truncAttrib;

        uint tokLen = _tok.length;
        uint allLen = 4 + 32 + tokLen; // 4bytes + truncated token + token bytes length

        assembly {
            let x := mload(0x40)        // Find empty storage location using "free memory pointer"
            mstore(x, sig)              // Place signature at beginning of empty storage

            truncAttrib := mload(add(_attrib, 32))
            mstore(add(x, 0x04), truncAttrib)

            for { let i := 0 } lt(i, tokLen) { i := add(i, 32) } {
                mstore(add(x, add(0x24,i)), mload(add(add(_tok, 0x20), i)))
            }

            let res := call(0, callAddr, 0, x, allLen, x, 0x20)

            switch res
            case 0 {
                revert(0, 0)
            }
            default {
                ret := mload(x)
            }
        }
    }

    function getAddress(string _attrib, bytes _tok) internal constant returns (address ret) {
        bytes4 sig = sigIdAddress;
        address callAddr = elv_precomp_enc_token_addr;
        bytes32 truncAttrib;

        uint tokLen = _tok.length;
        uint allLen = 4 + 32 + tokLen; // 4bytes + truncated token + token bytes length

        assembly {
            let x := mload(0x40)        // Find empty storage location using "free memory pointer"
            mstore(x, sig)              // Place signature at beginning of empty storage

            truncAttrib := mload(add(_attrib, 32))
            mstore(add(x, 0x04), truncAttrib)

            for { let i := 0 } lt(i, tokLen) { i := add(i, 32) } {
                mstore(add(x, add(0x24,i)), mload(add(add(_tok, 0x20), i)))
            }

            let res := call(0, callAddr, 0, x, allLen, x, 0x20)

            switch res
            case 0 {
                revert(0, 0)
            }
            default {
                ret := mload(x)
            }
        }
    }

    function getString(string _attrib, bytes _tok) internal constant returns (string ret) {
        bytes4 sig = sigIdString;
        address callAddr = elv_precomp_enc_token_addr;
        bytes32 truncAttrib;

        uint tokLen = _tok.length;
        uint allLen = 4 + 32 + tokLen; // 4bytes + truncated token + token bytes length

        assembly {
            let x := mload(0x40)        // Find empty storage location using "free memory pointer"
            mstore(x, sig)              // Place signature at beginning of empty storage

            truncAttrib := mload(add(_attrib, 32))
            mstore(add(x, 0x04), truncAttrib)

            for { let i := 0 } lt(i, tokLen) { i := add(i, 32) } {
                mstore(add(x, add(0x24,i)), mload(add(add(_tok, 0x20), i)))
            }

            let res := call(0, callAddr, 0, x, allLen, x, 0x60)

            switch res
            case 0 {
                revert(0, 0)
            }
            default {
                ret := x
                mstore(0x40, add(x, 0x60))  // Set storage pointer to empty space - i.e. after returned storage
            }
        }
    }
}
