pragma solidity 0.4.21;

import {Content} from "./content.sol";
import {BaseContent} from "./base_content.sol";
import {BaseLibrary} from "./base_library.sol";
import {AdmgrAdvertisement} from "./admgr_advertisement.sol";


contract AdmgrCampaign is Content {

    bytes32 public version ="AdmgrCampaign20190222153200ML"; //class name (max 16), date YYYYMMDD, time HHMMSS and Developer initials XX

    address public campaignManagerAddress;

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

    function setCampaignManagerAddress(address campaign_manager_address) public onlyCreator {
        campaignManagerAddress = campaign_manager_address;
    }

    function isActive() public view returns (bool) {
        uint timeNow = now;
        if (timeNow < startDate) {
            return false;
        }
        return ((duration == 0) || (startDate + duration >= timeNow));
    }


    function validateRequest(address adAddress, uint256 amount) public view returns (bool){
        require(isActive());
        //emit LogBool("isActive", isActive());
        AdData storage adData = adDataMap[adAddress];
        //emit LogUint256("adData.budget", adData.budget);
        //emit LogUint256("adData.paidOut", adData.paidOut);
        //emit LogUint256("amount", amount);
        require((adData.budget == 0) || (adData.budget - adData.paidOut >= amount));
        return true;
    }

    function payout(bytes32 requestDataID) public returns (bool) {
        require(isActive());
        AdmgrAdvertisement advertisementMgr = AdmgrAdvertisement(msg.sender);
        uint256 amount = advertisementMgr.getAmount(requestDataID);
        address ad = advertisementMgr.getAdvertisement(requestDataID);
        BaseContent advertisement = BaseContent(ad);
        require(advertisement.contentContractAddress() == msg.sender); //ensure consistency
        require(advertisementMgr.getOriginator(requestDataID) == tx.origin); //ensure caller match request
        AdData storage adData = adDataMap[ad];
        require(adData.status == 1);
        require((adData.budget == 0) || (adData.budget - adData.paidOut >= amount));
        adDataMap[ad].paidOut = adData.paidOut + amount;
        if ((adData.budget != 0) && (adDataMap[ad].paidOut == adData.budget)) {
            adDataMap[ad].status = -1;
        }
        uint256 amount_library = amount / 100 * libraryRetrocession;
        if (amount_library != 0){
            BaseContent content = BaseContent(advertisementMgr.getContent(requestDataID));
            BaseLibrary lib = BaseLibrary(content.libraryAddress()); //debatable: pay library (add pull function) or owner
            lib.owner().transfer(amount_library);
            emit LogPayment("Retrocession", lib.owner(), amount_library);
        }
        tx.origin.transfer(amount - amount_library);
        emit LogPayment("Reward", tx.origin, amount - amount_library);
        return true;
    }

    function setupAd(address adAddress, uint256 budget) public onlyOwner returns (bool) {
        AdData memory adData = AdData(budget, 0, 1);
        AdData storage existingData = adDataMap[adAddress];
        if (existingData.status == 0) {
            campaignAds.push(adAddress);
            campaignAdsLength = campaignAdsLength + 1;
        }
        adDataMap[adAddress] = adData;

        return true;
    }

    function removeAd(address adAddress) public onlyOwner returns (bool){
        delete adDataMap[adAddress];
        for (uint i = 0; i < campaignAdsLength; i++) {
            if (campaignAds[i] == adAddress) {
                delete campaignAds[i];
                if (i != (campaignAdsLength - 1)) {
                    campaignAds[i] = campaignAds[campaignAdsLength - 1];
                    delete campaignAds[campaignAdsLength - 1];
                }
                campaignAdsLength--;
                return true;
            }
        }
        return false;
    }

}


contract AdmgrCampaignManager is Content {

    bytes32 public version ="AdmgrCampaignMgr20190222153600ML"; //class name (max 16), date YYYYMMDD, time HHMMSS and Developer initials XX

    uint8 public libraryRetrocession = 0;

    address public campaignLibraryAddress;
    address public marketPlaceAddress;
    bool public initializedAsCampaignMgr = false;

    function setLibraryRetrocession(uint8 percent) public onlyOwner returns(uint8) {
        libraryRetrocession = percent;
        return libraryRetrocession;
    }

    function setCampaignLibraryAddress(address campaign_library_address) public onlyOwner {
        campaignLibraryAddress = campaign_library_address;
    }

    function setMarketPlaceAddress(address market_place_address) public onlyCreator {
        marketPlaceAddress = market_place_address;
    }

    function runCreate() public payable returns (uint) {
        if (initializedAsCampaignMgr == false){
            initializedAsCampaignMgr = true;
            return 0;
        }
        address campaignAddress = new AdmgrCampaign();
        BaseContent campaignObj = BaseContent(msg.sender);
        campaignObj.setContentContractAddress(campaignAddress);
        AdmgrCampaign campaignContract = AdmgrCampaign(campaignAddress);
        campaignContract.setLibraryRetrocession(libraryRetrocession);
        campaignContract.setCampaignManagerAddress(address(this));
        campaignContract.transferCreatorship(owner); // Creatorship is kept central
        //campaignContract.transferOwnership(campaignObj.owner()); //Ownership is distributed
        return 0;
    }



}


contract AdmgrMarketPlace is Content {

    bytes32 public version ="AdmgrMarketPlace20190222153700ML"; //class name (max 16), date YYYYMMDD, time HHMMSS and Developer initials XX

    function runCreate() public payable returns (uint) {
        address campaignMgrAddress = new AdmgrCampaignManager();
        BaseContent campaignMgrObj = BaseContent(msg.sender);
        AdmgrCampaignManager campaignMgrContract = AdmgrCampaignManager(campaignMgrAddress);
        campaignMgrObj.setContentContractAddress(campaignMgrAddress);
        campaignMgrContract.setMarketPlaceAddress(address(this));
        campaignMgrContract.transferCreatorship(owner); // Creatorship is kept central
        campaignMgrContract.transferOwnership(campaignMgrObj.owner()); //Ownership is distributed
        return 0;
    }

}
