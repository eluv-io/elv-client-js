pragma solidity 0.4.24;

import {Ownable} from "./ownable.sol";
import {BaseContent} from "./base_content.sol";
import "./access_indexor.sol";

/* -- Revision history --
BaseAccessWallet20190320114000ML: First versioned released
BaseAccessWallet20190506154400ML: Adds instantiation via factory, adds access indexing
BaseAccessWallet20190510151100ML: Supports modified getAccessInfo API
*/

// abigen --sol base_access_wallet.sol --pkg=contracts --out build/base_access_wallet.go

contract BaseAccessWallet is AccessIndexor {
    bytes32 public version = "BaseAccessWallet20190510151100ML"; //class name (max 16), date YYYYMMDD, time HHMMSS and Developer initials XX

    event AccessRequest(
        uint256 requestID,
        uint8 level,
        address content,
        address accessor
    );
    event AccessComplete(uint256 requestID, uint256 scorePct, address content, address accessor);


    constructor(address content_space)  public payable {
        contentSpace = content_space;
    }

    function accessRequestMsg(
        address content_address,
        uint8 level,
        string pke_requestor,
        string pke_AFGH,
        bytes32[] custom_values,
        address[] stakeholders
    ) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(content_address, level, pke_requestor, pke_AFGH, custom_values, stakeholders));
    }

    function accessCompleteMsg(
        address content_address,
        uint256 request_ID,
        uint256 score_pct,
        bytes32 ml_out_hash
    ) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(content_address, request_ID, score_pct, ml_out_hash));
    }

    function accessRequest(
        address content_address,
        bytes /*signature*/,
        uint8 level,
        string pke_requestor,
        string pke_AFGH,
        bytes32[] custom_values,
        address[] stakeholders
    ) public returns (uint256) {
        /*
        //Signature should be valid for requested operation
        bytes32 message = accessRequestMsg(content_address,  level, pke_requestor, pke_AFGH, custom_values, stakeholders);
        require(owner == recoverSignerFromMessage(message,signature));
        */

        BaseContent content = BaseContent(content_address);
        uint256 requiredFund;
        uint8 visibilityCode;
        uint8 accessCode;
        (visibilityCode, accessCode, requiredFund) = content.getAccessInfo( level, custom_values, stakeholders);
        require(visibilityCode == 0);
        uint256 requestID = content.accessRequest.value((accessCode != 0) ? requiredFund : 0)(level, pke_requestor, pke_AFGH, custom_values, stakeholders);
        emit AccessRequest(requestID, level, content_address, owner);
        return requestID;

    }

    function accessComplete(
        address content_address,
        bytes /*signature*/,
        uint256 request_ID,
        uint256 score_pct,
        bytes32 ml_out_hash
    ) public payable returns (bool) {
        /*
        //Signature should be valid for requested operation
        bytes32  message = accessCompleteMsg(content_address, request_ID, score_pct, ml_out_hash);
        require(owner == recoverSignerFromMessage(message,signature));
        */

        BaseContent content = BaseContent(content_address);
        emit AccessComplete(request_ID, score_pct, content_address, owner);
        return content.accessComplete(request_ID, score_pct, ml_out_hash);

    }

}


/* -- Revision history --
BsAccWltFactory20190506154200ML: First versioned released
*/

contract BaseAccessWalletFactory is Ownable {

    bytes32 public version ="BsAccWltFactory20190506154200ML"; //class name (max 16), date YYYYMMDD, time HHMMSS and Developer initials XX

    function createAccessWallet() public returns (address) {
        return  (new BaseAccessWallet(msg.sender));
    }


}




