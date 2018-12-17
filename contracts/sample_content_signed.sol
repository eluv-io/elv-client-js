pragma solidity 0.4.21;

import {Content} from "./content.sol";
import {BaseContent} from "./base_content.sol";
import {BaseLibrary} from "./base_library.sol";
import {Certifyer} from "./lib_certifyer.sol";


contract SampleContentSigned is Content {



    function recoverSignerFromMessageHash(bytes32 message_hash, bytes sig) pure public returns (address) {
	    return Certifyer.recoverSignerFromMessageHash(message_hash, sig);
    }

    function recoverSignerFromMessage(bytes message, bytes sig) pure public returns (address) {
        //bytes memory messageBytes = bytes(message);
	    return Certifyer.recoverSignerFromMessage(message, sig);
    }



}

