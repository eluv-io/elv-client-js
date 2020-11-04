pragma solidity 0.5.4;

library EncToken {

    address constant elv_precomp_enc_token_addr = address(254);

    bytes4 constant sigIdString = bytes4(keccak256("getString(string,bytes)"));
    bytes4 constant sigIdUint = bytes4(keccak256("getUint(string,bytes)"));
    bytes4 constant sigIdAddress = bytes4(keccak256("getAddress(string,bytes)"));

    function getUint(string memory _attrib, bytes memory _tok) internal view returns (uint256 ret) {
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

            let res := staticcall(0, callAddr, x, allLen, x, 0x20)

            switch res
            case 0 {
                revert(0, 0)
            }
            default {
                ret := mload(x)
            }
        }
    }

    function getAddress(string memory _attrib, bytes memory _tok) internal view returns (address payable ret) {
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

            let res := staticcall(0, callAddr, x, allLen, x, 0x20)

            switch res
            case 0 {
                revert(0, 0)
            }
            default {
                ret := mload(x)
            }
        }
    }

    function getString(string memory _attrib, bytes memory _tok) internal view returns (string memory ret) {
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

            let res := staticcall(0, callAddr, x, allLen, x, 0x60)

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
