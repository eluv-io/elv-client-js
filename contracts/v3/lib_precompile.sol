pragma solidity ^0.4.24;

library Precompile {

    address constant elv_precomp_addr = 255;

    bytes4 constant sigIdString = bytes4(keccak256("makeIDString(int,address)"));

    int public constant KMS = 11;
    int public constant TEN = 14;

    function CodeKMS() internal constant returns (int) {
        return KMS;
    }

    function CodeTEN() internal constant returns (int) {
        return TEN;
    }

    uint constant idStrLen = 32;

    function makeIDString(int _code, address _addr) internal constant returns (string ret) {

        bytes4 sig = sigIdString;
        bytes4 codeBytes = bytes4(_code);
        address callAddr = elv_precomp_addr;

        assembly {
            let x := mload(0x40)
            mstore(x, sig)
            mstore(add(x, 0x04), codeBytes)
            mstore(add(x, 0x08), _addr)
            // input is now [4 bytes][4 bytes][32 bytes] = 40 bytes

            let res := call(
            0,          // no gas
            callAddr,   // To addr
            0,          // No value - i.e. tokens
            x,          // Inputs are stored at location x
            0x28,       // Inputs are 40 bytes long
            x,          // Store output over input
            0x40)       // Outputs are 64 bytes long

            if eq(res, 0) {
                revert(0, 0)
            }

            ret := x
            mstore(0x40, add(x, 0x40))  // Set storage pointer to empty space - i.e. after returned storage
        }
    }
}
