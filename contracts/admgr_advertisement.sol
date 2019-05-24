pragma solidity 0.4.24;

import {Content} from "./content.sol";
import {BaseContent} from "./base_content.sol";
import {BaseLibrary} from "./base_library.sol";
import {Certifyer} from "./lib_certifyer.sol";
import {AdmgrCampaign} from "./admgr_campaign_manager.sol";

//
// This contract implements a "free" watch-ads to access model.
// When an ad is served this custom contract is called.
// The pre access hook simply returns (not charging the client)
// The finalize metho pays the client a configured token credit
// for watching the ad.
//


/* -- Revision history --
AdmgrAdvertismnt20190222152600ML: First versioned released
AdmgrAdvertismnt20190318103000ML: Migrated to 0.4.24
AdmgrAdvertismnt20190404103100ML: Made 0.4.24 explicit
AdmgrAdvertismnt20190510152200ML: updated for new runAccessInfo API
*/


contract AdmgrAdvertisement is Content {

    bytes32 public version ="AdmgrAdvertismnt20190510152200ML"; //class name (max 16), date YYYYMMDD, time HHMMSS and Developer initials XX

    event MaxCreditPerAd(uint256 maxCreditPerAd);
    event BitcodeAddress(address bitcode);


    event dbgBool(string msg, bool flag);
    event dbgAddress(string msg, address addr);
    event dbgUint256(string msg, uint256 num);
    event dbgUint8(string msg, uint8 num);
    event dbgByte32(string msg, bytes32 b);
    event dbgBytes(string msg, bytes b);

    address public bitcodeAddress;

    struct RequestData {
        address originator; // client address requesting
        address content; // address of sponsored content item
        address advertisement; // address of advertisement being played
        address campaign; //address of the campaign base object
        uint256 amount; // to be paid upon access completion
        int8 status; //0 unpaid, 1 paid off
    }

    mapping(bytes32 => RequestData) public requestMap;

    uint256 public maxCreditPerAd = 0; //By default no maximum is set


    function dbgRequest(uint256 request_ID, address ad_address) public pure returns (bytes32)
    {
        return keccak256(abi.encodePacked(ad_address, request_ID));
    }


    function setMaxCreditPerAd(uint256 creditPerAd) public onlyOwner {
        maxCreditPerAd = creditPerAd;
        emit MaxCreditPerAd(maxCreditPerAd);
    }

    function getContent(bytes32 request_data_ID) public view returns (address) {
        return requestMap[request_data_ID].content;
    }

    function getOriginator(bytes32 request_data_ID) public view returns (address) {
        return requestMap[request_data_ID].originator;
    }

    function getAdvertisement(bytes32 request_data_ID) public view returns (address) {
        address advertisement = requestMap[request_data_ID].advertisement;
        require(advertisement != 0x0);
        return advertisement;
    }

    function getAmount(bytes32 request_data_ID) public view returns (uint256) {
        require((requestMap[request_data_ID].content != 0x0)  && (requestMap[request_data_ID].status == 0));
        return requestMap[request_data_ID].amount;
    }

    function getCampaign(bytes32 request_data_ID) public view returns (address) {
        return requestMap[request_data_ID].campaign;
    }

    function setBitcodeAddress(address bitcode) public onlyOwner returns(address) {
        bitcodeAddress = bitcode;
        emit BitcodeAddress(bitcodeAddress);
        return bitcodeAddress;
    }


    function createMessage(address content_address, address campaign_address, address ad_address, bytes32 amount) pure public returns (bytes) {
        bytes memory b = new bytes(96);
        b[0] = byte(32);
        b[21] = byte(32);
        b[42] = byte(32);
        b[63] = byte(32); //space separators
        uint i;
        uint8 hi;
        for (i = 0; i < 20; i++) {
            hi = (uint8(uint(ad_address) / (2**(8*(19 - i)))));
            b[i+1] = byte(hi);
            hi = (uint8(uint(campaign_address) / (2**(8*(19 - i)))));
            b[i+22] = byte(hi);
            hi = (uint8(uint(content_address) / (2**(8*(19 - i)))));
            b[i+43] = byte(hi);
        }
        for (i = 0; i < 32; i++) {
            hi = uint8(amount[i]);
            b[i+64] = byte(hi);
        }
        return b;
    }

    function verifyMessage(address content_address, address campaign_address, bytes32 amount, uint8 v, bytes32 r, bytes32 s) private view {
        bytes memory messageStr = createMessage(content_address, campaign_address, msg.sender, amount);
        bytes32 messageHash = keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n96", messageStr));
        address signee = ecrecover(messageHash, v, r, s);
        //emit dbgBytes("message rebuilt", messageStr);
        //emit dbgAddress("signee", signee);
        //emit dbgAddress("bitcodeAddress", bitcodeAddress);
        require(signee == bitcodeAddress); //bitcodeaddress could be stored in AdmgrCampaignManager or AdmgrCampaign
    }

    function insertRequest(
        uint256 request_ID,
        address content_address,
        address ad_address,
        address campaign_address,
        uint256 amount
    )
        private
    {
        bytes32 req_data_id = keccak256(abi.encodePacked(ad_address, request_ID));
        RequestData memory req = RequestData(tx.origin, content_address, ad_address, campaign_address, amount, 0);
        requestMap[req_data_id] = req;
    }

    function runAccess(
        uint256 request_ID,
        uint8,
        bytes32[] custom_values, // amount to be paid, signature v, signature r, signature s, tag1, tag1_match, tag2, tag2_matc, ...
        address[] stake_holders // @content being accessed, @campaign
    )
        public payable returns(uint)
    {
        if (stake_holders.length == 0) {
            return 0;
        }

        address contentAddress = stake_holders[0];
        if (contentAddress != 0x0) {
            address campaignAddress = stake_holders[1];
            bytes32 amount = custom_values[0];
            uint8 v = uint8(custom_values[1][0]);
            bytes32 r = custom_values[2];
            bytes32 s = custom_values[3];
            if (bitcodeAddress != 0x0) {
               verifyMessage(contentAddress, campaignAddress, amount, v, r, s);
            }
            require((maxCreditPerAd == 0) || (uint256(amount) <= maxCreditPerAd));
            BaseContent campaignObj = BaseContent(campaignAddress);
            AdmgrCampaign campaign = AdmgrCampaign(campaignObj.contentContractAddress());
            campaign.validateRequest(msg.sender, uint256(amount));
            insertRequest(request_ID, contentAddress, msg.sender, campaignAddress, uint256(amount));
        }
        return 0;
    }

    // Upon completion, the promised amount is divided between the library owner and the viewer and paid off.
    function runFinalize(uint256 request_ID, uint256 /*score_pct*/) public payable returns(uint) {
        bytes32 req_data_id = keccak256(abi.encodePacked(msg.sender, request_ID));
        RequestData storage req = requestMap[req_data_id];
        require((req.originator == tx.origin) && (req.status == 0));
        BaseContent campaignObj = BaseContent(requestMap[req_data_id].campaign);
        AdmgrCampaign campaign = AdmgrCampaign(campaignObj.contentContractAddress());
        campaign.payout(req_data_id);
        delete requestMap[req_data_id];
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
