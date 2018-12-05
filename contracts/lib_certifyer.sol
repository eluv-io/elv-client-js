pragma solidity 0.4.21;


library Certifyer {

    //event Vrs(uint8 v, bytes32 r, bytes32 s);

    function splitSignature(bytes sig) pure  internal returns (uint8, bytes32, bytes32) {
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

    function uint2str(uint i) internal pure returns (string){
        if (i == 0) return "0";
        uint j = i;
        uint length;
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
        return string(bstr);
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

    function recoverSignerFromMessage(string message, bytes sig) pure public returns (address) {
        uint8 v;
        bytes32 r;
        bytes32 s;
        bytes32 message_hash = keccak256("\x19Ethereum Signed Message:\n",uint2str(bytes(message).length), message);

        (v, r, s) = splitSignature(sig);
        //emit Vrs(v,r,s);
        return ecrecover(message_hash, v, r, s);
    }



}

