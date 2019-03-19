pragma solidity 0.4.24;

import {Content} from "./content.sol";


/* -- Revision history --
PaymentService20190318102800ML: First versioned released, migrated to 0.4.24, made a Content object
*/

contract PaymentService is Content {

    bytes32 public version ="PaymentService20190318102800ML"; //class name (max 16), date YYYYMMDD, time HHMMSS and Developer initials XX

    struct RedeemRequest {
        address id; // client address requesting
        string redeemCurrency;
        uint256 numTokens; // number of token to be redeemed
        string payTo;
        string nonce;
        bool valid; // to distinguish non-existing objects
    }
    RedeemRequest[]  redeemRequests;
    uint256 redeemRequestsLength = 0;

    string tokenCurrency = "USD";
    uint256 tokenValue = 1;
    address public payerAddress;

    event RedeemTokenRequest(uint256 numtokens, string pay_to, string nonce);
    event RedeemTokenExecuted(string currency, uint256 value, string payment_proof, string nonce);
    event SetTokenValue(string currency, uint256 value);


    function redeemTokenRequest(string payment_account, string tx_nonce) public payable returns (uint) {
        //If the request is not backed by a balance
        if (msg.value == 0) {
            return 1;
        }
        RedeemRequest memory request = RedeemRequest(msg.sender, "USD", msg.value, payment_account, tx_nonce, true);
        if (redeemRequestsLength < redeemRequests.length) {
            redeemRequests[redeemRequestsLength] = request;
        } else {
            redeemRequests.push(request);
        }
        redeemRequestsLength ++;
        emit RedeemTokenRequest(msg.value, payment_account, tx_nonce);
        return 0;
    }

    function getPendingRedeemRequest() public constant returns ( address, string, uint256, string, string) {
        if (redeemRequestsLength == 0) {
            return (0, "", 0, "", "");
        }
        RedeemRequest memory req = redeemRequests[0];
        return (req.id, req.redeemCurrency, req.numTokens, req.payTo, req.nonce);
    }

    function redeemTokenExecuted(string currency, uint256 value, string payment_proof, string tx_nonce) public returns (uint) {
        if ((msg.sender != creator) && (msg.sender != payerAddress)) {
            return 3;
        }
        if (keccak256(abi.encodePacked(redeemRequests[0].nonce)) == keccak256(abi.encodePacked(tx_nonce))) {
            delete redeemRequests[0];
            redeemRequestsLength --;
            if (redeemRequestsLength > 0) {
                redeemRequests[0] = redeemRequests[redeemRequestsLength];
                delete redeemRequests[redeemRequestsLength];
            }
            emit RedeemTokenExecuted(currency, value, payment_proof, tx_nonce);
            return 0;
        }
        return 1;
    }

    function redeemDbg(uint256 idx) public constant returns (uint256, uint256, string) {
        return (redeemRequests.length, redeemRequestsLength, redeemRequests[idx].nonce);
    }

    function setPayerAdress(address payer_address) public onlyOwner {
        payerAddress = payer_address;
    }

    function setTokenValue(string currency, uint256 value) public onlyOwner {
        tokenCurrency = currency;
        tokenValue = value;
        emit SetTokenValue(currency, value);
    }

    function getTokenValue() public constant returns(string, uint256) {
        return (tokenCurrency, tokenValue);
    }



}
