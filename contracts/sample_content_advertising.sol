pragma solidity 0.4.21;

import {Content} from "./content.sol";
import {BaseContent} from "./base_content.sol";


//
// This contract implements a "free" watch-ads to access model.
// When an ad is served this custom contract is called.
// The pre access hook simply returns (not charging the client)
// The finalize metho pays the client a configured token credit
// for watching the ad.
//

contract SampleContentAdvertising is Content {


    event TokenCreditPerAd(uint256 tokenCreditPerAd);

    uint256 public tokenCreditPerAd; // tokens earned per ad access

    function setTokenCreditPerAd(uint256 creditPerAd) public onlyOwner {
        tokenCreditPerAd = creditPerAd;
        emit TokenCreditPerAd(tokenCreditPerAd);
    }

    function runFinalize(uint256 request_ID) public payable returns(uint) {
        BaseContent contentObj = BaseContent(msg.sender);
        address originator;
        uint256 nothing;
        int8 status;
        (originator, nothing, status) = contentObj.requestMap(request_ID);
        require((originator == tx.origin) && (status == 1));
        // check that the runFinalize is initiated by content requestor to avoid paying wrong User
        // and that payment was not made yet (upon accessComplete status is change from 0 to 1 or -1)
        // status codes: 0 in escrow, 1 paid to content owner, -1 refunded to originator
        tx.origin.transfer(tokenCreditPerAd);
        emit RunFinalize(request_ID, 0);
        return 0;
    }

}
