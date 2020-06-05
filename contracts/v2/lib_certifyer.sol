pragma solidity 0.4.24;

library Certifyer {

    //event Vrs(uint8 v, bytes32 r, bytes32 s);

    function splitSignature(bytes sig) pure public returns (uint8, bytes32, bytes32) {
        require(sig.length == 65);

        bytes32 r;
        bytes32 s;
        uint8 v;

        assembly {
        // first 32 bytes, after the length prefix
            r := mload(add(sig, 32))
        // second 32 bytes
            s := mload(add(sig, 64))
        // final byte (first byte of the next 32 bytes)
            v := byte(0, mload(add(sig, 96)))
        }
        return (v, r, s);
    }

    function uint2str(uint i) pure public returns (bytes){
        if (i == 0) return "0";
        uint j = i;
        uint length=0;
        while (j != 0){
            length++;
            j /= 10;
        }
        bytes memory bstr = new bytes(length);
        uint k = length - 1;
        while (i != 0){
            bstr[k--] = byte(48 + i % 10);
            i /= 10;
        }
        return bstr;
    }

    function messageHash(bytes message) pure public returns (bytes32) {
        return keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n",uint2str(message.length), message));
        //return keccak256("\x19Ethereum Signed Message:\n\x32\x30",  message);
    }

    function recoverSignerFromMessageHash(bytes32 message_hash, bytes sig) pure public returns (address) {
        uint8 v;
        bytes32 r;
        bytes32 s;
        //bytes32 ethMessage = keccak256("\x19Ethereum Signed Message:\n",bytes(message).length, message);

        (v, r, s) = splitSignature(sig);
        //emit Vrs(v,r,s);
        return ecrecover(message_hash, v, r, s);
    }

    function recoverSignerFromMessage(bytes message, bytes sig) pure public returns (address) {
        return recoverSignerFromMessageHash(messageHash(message), sig);
    }



}

