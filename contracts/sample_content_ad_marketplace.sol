pragma solidity 0.4.24;

import {Content} from "./content.sol";
import {BaseContent} from "./base_content.sol";
import {BaseLibrary} from "./base_library.sol";
import {Certifyer} from "./lib_certifyer.sol";


//
// This contract implements a "free" watch-ads to access model.
// When an ad is served this custom contract is called.
// The pre access hook simply returns (not charging the client)
// The finalize metho pays the client a configured token credit
// for watching the ad.
//


/* -- Revision history --
SplContAdMktplce20190226115400ML: First versioned released
SplContAdMktplce20190318103100ML: Migrated to 0.4.24
*/


contract SampleContentAdMarketplace is Content {

    bytes32 public version ="SplContAdMktplce20190318103100ML"; //class name (max 16), date YYYYMMDD, time HHMMSS and Developer initials XX


    event MaxCreditPerAd(uint256 maxCreditPerAd);
    event BitcodeAddress(address bitcode);

    address public bitcodeAddress;

    struct RetrocessionData {
        bool active;
        uint8 maxAdsPerContent;
        uint8 libraryPercent;
    }

    mapping(address => RetrocessionData) public retrocessions;

    struct RequestData {
        address originator; // client address requesting
        address content; // address of sponsored content item
        uint256 amount; // to be paid upon access completion
        int8 status; //0 unpaid, 1 paid off
    }

    mapping(bytes32 => RequestData) public requestMap;

    uint256 public maxCreditPerAd = 0; //By default no maximum is set

    function setMaxCreditPerAd(uint256 creditPerAd) public onlyOwner {
        maxCreditPerAd = creditPerAd;
        emit MaxCreditPerAd(maxCreditPerAd);
    }

    function setBitcodeAddress(address bitcode) public onlyOwner returns(address) {
        bitcodeAddress = bitcode;
        emit BitcodeAddress(bitcodeAddress);
        return bitcodeAddress;
    }

    function setRetrocession(address library_addr, uint8 max_ads_per_item, uint8 percent, bool active) public onlyOwner returns(bool) {
        RetrocessionData memory r = RetrocessionData(active, max_ads_per_item, percent);
        retrocessions[library_addr] = r;
        return active;
    }

    function createMessage(address content_address, address ad_address, bytes32 amount) pure public returns (bytes) {
        bytes memory b = new bytes(75);
        b[0] = byte(32);
        b[21] = byte(32); //space separator
        b[42] = byte(32); //space separator
        uint i;
        uint8 hi;
        for (i = 0; i < 20; i++) {
            hi = (uint8(uint(ad_address) / (2**(8*(19 - i)))));
            b[i+1] = byte(hi);
            hi = (uint8(uint(content_address) / (2**(8*(19 - i)))));
            b[i+22] = byte(hi);
        }
        for (i = 0; i < 32; i++) {
            hi = uint8(amount[i]);
            b[i+43] = byte(hi);
        }
        return b;
    }

    function verifyMessage(address content_address, bytes32 amount, uint8 v, bytes32 r, bytes32 s) private view {
        bytes memory messageStr =  createMessage(content_address, msg.sender, amount);
        bytes32 messageHash = keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n75", messageStr));
        address signee = ecrecover(messageHash, v, r, s);
        //emit LogUint256("amount", uint256(amount));
        require(signee == bitcodeAddress);
    }



    function insertRequest(uint256 request_ID, address content_address, uint256 amount) private {
        bytes32 adRequestID = keccak256(abi.encodePacked(request_ID, msg.sender)); //Hash of ads object and content request ID
        RequestData memory req = RequestData(tx.origin, content_address, amount, 0);
        requestMap[adRequestID] = req;
    }

    function runAccess(
        uint256 request_ID,
        uint8,
        bytes32[] custom_values, // amount to be paid, signature v, signature r, signature s, tag1, tag1_match, tag2, tag2_matc, ...
        address[] stake_holders // @content being accessed
    )
        public payable returns(uint)
    {
        address contentAddress = stake_holders[0];
        BaseContent c = BaseContent(contentAddress);
        address libraryAddr = c.libraryAddress();
        RetrocessionData storage retro = retrocessions[libraryAddr];
        require(retro.active); //library is found and active
        bytes32 amount = custom_values[0];
        uint8 v = uint8(custom_values[1][0]);
        bytes32 r = custom_values[2];
        bytes32 s = custom_values[3];
        verifyMessage(contentAddress, amount, v, r, s);
        require((maxCreditPerAd == 0) || (uint256(amount) <= maxCreditPerAd));
        insertRequest(request_ID, contentAddress, uint256(amount));
        return 0;
    }

    // Upon completion, the promised amount is divided between the library owner and the viewer and paid off.
    function runFinalize(uint256 request_ID, uint256 /*score_pct*/) public payable returns(uint) {
        bytes32 adRequestID = keccak256(abi.encodePacked(request_ID, msg.sender)); //Hash of ads object and content request ID
        RequestData storage req = requestMap[adRequestID];
        require((req.originator == tx.origin) && (req.status == 0));
        //emit LogInt256("req.status", int256(req.status));
        BaseContent contentObj = BaseContent(req.content);
        address libraryAddr = contentObj.libraryAddress();
        BaseLibrary lib = BaseLibrary(contentObj.libraryAddress());
        RetrocessionData storage retro = retrocessions[libraryAddr];

        uint256 payToLibrary = req.amount / 100 * retro.libraryPercent;
        uint256 payToViewer = req.amount - payToLibrary;
        tx.origin.transfer(payToViewer);
        lib.owner().transfer(payToLibrary);
        req.status = 1; //mark as paid, not really needed as we delete req anyway
        delete requestMap[adRequestID];
        emit RunFinalize(request_ID, 0);
        return 0;
    }




/* Unused


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

    function toString(address x) public returns (string) {
        bytes memory b = new bytes(20);
        for (uint i = 0; i < 20; i++)
            b[i] = byte(uint8(uint(x) / (2**(8*(19 - i)))));
        return string(b);
    }


    function addressToString(address _addr) public pure returns(bytes) {
        bytes32 value = bytes32(uint256(_addr));
        bytes memory alphabet = "0123456789abcdef";

        bytes memory str = new bytes(42);
        str[0] = '0';
        str[1] = 'x';
        for (uint i = 0; i < 20; i++) {
            str[2+i*2] = alphabet[uint(value[i + 12] >> 4)];
            str[3+i*2] = alphabet[uint(value[i + 12] & 0x0f)];
        }
        return str;
    }
*/

}
