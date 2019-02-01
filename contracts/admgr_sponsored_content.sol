pragma solidity 0.4.21;

import {Content} from "./content.sol";

//
// This contract can be used to indicate a relationship with a Campaign manager
// When campaignManager is left blank, the campaign manager can be selected 
//  individually for each sponsored content object.
//

contract AdmgrSponsoredContent is Content {

    address public campaignManager;

    function setCampaignManager(address campaign_manager) public onlyOwner {
	campaignManager = campaign_manager;
    }


}
