pragma solidity 0.4.21;

import {Content} from "./content.sol";
import {BaseContent} from "./base_content.sol";
import {BaseLibrary} from "./base_library.sol";
import {AdmgrAdvertisement} from "./admgr_advertisement.sol";


contract AdmgrCampaign is Content {

    struct AdData {
        uint256 budget;
        uint256 paidOut;
        int8 status; //1 active, -1 fund expired, 0 deleted/invalid
    }

    uint8 public libraryRetrocession = 0;

    mapping(address => AdData) public adDataMap;
    address[] public campaignAds;
    uint public campaignAdsLength;

    uint public startDate = now;
    uint public duration = 0; // infinite

    function resetStartDate() public onlyOwner returns (uint) {
        startDate = now;
        return startDate;
    }

    function setDelay(uint delay) public onlyOwner returns (uint) {
        startDate = startDate + delay;
        return startDate;
    }

    function setDuration(uint ndays, uint nhours, uint nminutes, uint nseconds) public onlyOwner returns (uint) {
        duration = ((ndays * 24 + nhours) * 60 + nminutes) * 60 + nseconds;
        return duration;
    }

    function setLibraryRetrocession(uint8 percent) public onlyCreator returns(uint8) {
        libraryRetrocession = percent;
        return libraryRetrocession;
    }

    function isActive() public view returns (bool) {
        uint timeNow = now;
        if (timeNow < startDate) {
            return false;
        }
        return ((duration == 0) || (startDate + duration >= timeNow));
    }

    function payout(uint256 request_ID) public returns (bool) {
        require(isActive());
        AdmgrAdvertisement advertisementMgr = AdmgrAdvertisement(msg.sender);
        address advertisementAddr = advertisementMgr.getAdvertisement(request_ID);
        uint256 amount = advertisementMgr.getAmount(request_ID);
        BaseContent advertisement = BaseContent(advertisementAddr);
        require(advertisement.contentContractAddress() == msg.sender); //ensure consistency
        require(advertisementMgr.getOriginator(request_ID) == tx.origin); //ensure caller match request
        AdData storage adData = adDataMap[advertisementAddr];
        require(adData.status == 1);
        require(adData.budget - adData.paidOut >= amount);
        adDataMap[msg.sender].paidOut = adData.paidOut + amount;
        if (adDataMap[msg.sender].paidOut == adDataMap[msg.sender].budget) {
            adDataMap[msg.sender].status = -1;
        }
        uint256 amount_library = amount / 100 * libraryRetrocession;
        if (amount_library != 0){
            BaseContent content = BaseContent(advertisementMgr.getContent(request_ID));
            BaseLibrary lib = BaseLibrary(content.libraryAddress()); //debatable: pay library (add pull function) or owner
            lib.owner().transfer(amount_library);
        }
        tx.origin.transfer(amount - amount_library);
        advertisementMgr.markPaid(request_ID);
        return true;
    }

    function setupAd(address adAddress, uint256 budget) public onlyOwner returns (bool) {
        AdData memory adData = AdData(budget, 0, 1);
        adDataMap[adAddress] = adData;
        campaignAds.push(adAddress);
        campaignAdsLength = campaignAdsLength + 1;
        return true;
    }

}


contract AdmgrCampaignManager is Content {

    uint8 public libraryRetrocession = 0;

    function setLibraryRetrocession(uint8 percent) public onlyOwner returns(uint8) {
        libraryRetrocession = percent;
        return libraryRetrocession;
    }

    // Other numbers can be used as error codes and would stop the processing.
    function runCreate() public payable returns (uint) {
        address campaignAddress = new AdmgrCampaign();
        BaseContent campaignObj = BaseContent(msg.sender);
        campaignObj.setContentContractAddress(campaignAddress);
        AdmgrCampaign campaignContract = AdmgrCampaign(campaignAddress);
        campaignContract.setLibraryRetrocession(libraryRetrocession);
        campaignContract.transferCreatorship(owner); // Creatorship is kept central
        //campaignContract.transferOwnership(campaignObj.owner()); //Ownership is distributed
        return 0;
    }


}
