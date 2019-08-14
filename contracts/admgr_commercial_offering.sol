pragma solidity 0.4.24;

import {Content} from "./content.sol";
import {BaseContent} from "./base_content.sol";
import {BaseAccessControlGroup} from "./base_access_control_group.sol";

//
// This contract can be used to indicate a relationship with a Campaign manager
// When campaignManager is left blank, the campaign manager can be selected 
//  individually for each sponsored content object.
//


/* -- Revision history --
AdmgrCommOfferng20190228164900ML: First versioned released
AdmgrCommOfferng20190301124200ML: Adds stub for runAccessInfo to replace runAccessCharge
AdmgrCommOfferng20190510152300ML: updated for new runAccessInfo API
*/

contract AdmgrCommercialOffering is Content {

    bytes32 public version ="AdmgrCommOfferng20190510152300ML"; //class name (max 16), date YYYYMMDD, time HHMMSS and Developer initials XX

    address public commercialOfferingManagerAddress;
    address public campaignManager;
    bool public mandatorySponsoring;
    uint256 public presetAccessCharge;
    bool public mandatoryPresetAccessCharge;
    address public region;

    struct AvailabilityData {
        bool clearedSD; // cleared for SD
        bool clearedHD; // cleared for HD
        uint startDate; // Available on
        uint endDate; // Unavailable on
        address region; // Territory
    }

    mapping(address => AvailabilityData) public availability; // Indexed using Commercial Offering BaseContent address

    function setAvailability(address content, bool sd,bool hd, uint start, uint end, address r ) public {
        BaseContent c = BaseContent(content);
        require(tx.origin == c.owner());
        uint startDate = start;
        if (startDate == 0) {
            startDate = now;
        }
        address territory = region;
        if (territory == 0x0) {
            territory = r;
        }
        availability[content] = AvailabilityData(sd, hd, startDate, end, territory);
    }

    function setRegion(address r) public onlyOwner {
        region = r;
    }

    function setCommercialOfferingManagerAddress(address commercial_offering_manager_address) public onlyCreator {
        commercialOfferingManagerAddress = commercial_offering_manager_address;
    }

    function setCampaignManager(address campaign_manager) public onlyOwner {
        campaignManager = campaign_manager;
    }

    function setMandatorySponsoring(bool  mandatory_sponsoring) public onlyOwner {
        mandatorySponsoring = mandatory_sponsoring;
    }

    function setPresetAccessCharge(uint256 preset_access_charge) public onlyOwner {
        presetAccessCharge = preset_access_charge;
    }

    function setMandatoryPresetAccessCharge(bool mandatory_preset_access_charge) public onlyOwner {
        mandatoryPresetAccessCharge = mandatory_preset_access_charge;
    }

    function validateAvailability() public view {
        require(isAvailable(msg.sender, tx.origin) == 0);
    }

    function isAvailable(address content, address accessor) public view returns (uint8) {
        uint8 available = 0;
        AvailabilityData storage avail = availability[content];
        address r = region;
        if (region == 0x0) {
            r = avail.region;
        }
        if (r != 0x0) {
            BaseAccessControlGroup group = BaseAccessControlGroup(r);
            if (group.hasAccess(accessor) == false) {
                available = 10;
                //emit Log("Wrong territory");
            }
        }
        if (avail.startDate > now) {
            available = 20;
            //emit Log("Not yet available");
        }
        if ((avail.endDate != 0) && (avail.endDate < now)) {
            available = 30;
            //emit Log("Not longer available");
        }
        return available;
    }


    function runAccessInfo(
        uint8 level,
        bytes32[], /*customValues*/
        address[] /*stakeholders*/
    )
    public view returns (uint8, uint8, uint8, uint256)
    {
        if (level == 0){
            return (0, 0, 0, 0);
        }
        uint8 availCode = isAvailable(msg.sender, tx.origin);
        if (availCode != 0) {
            return (DEFAULT_ACCESS, availCode, 0, 0);
        }
        if (mandatoryPresetAccessCharge == true) {
            return (DEFAULT_ACCESS, availCode, 0, presetAccessCharge);
        }
        return (DEFAULT_SEE + DEFAULT_ACCESS + DEFAULT_CHARGE, 0, 0, 0);
    }

    /*
    function runAccessCharge(
        uint8 level, //level
        bytes32[], //customValues
        address[] //stakeholders
    )
    public payable returns (int256)
    {
        if (level == 0){
            return 0;
        }
        validateAvailability();
        if (mandatoryPresetAccessCharge == true) {
            return int256(presetAccessCharge);
        } else {
            return -1;
        }
    }
    */

    function runAccess(
        uint256, /*request_ID*/
        uint8 level, /*level*/
        bytes32[], /*custom_values*/
        address[] /*stake_holders*/
    )
    public payable returns(uint)
    {
        if (level != 0){
            validateAvailability();
        }
        return 0;
    }



    function runFinalize(uint256 /*request_ID*/,  uint256 score_pct) public payable returns(uint) {
        //BaseContent contentObj = BaseContent(msg.sender);
        // Amount paid for content should still be in escrow. Unless bad quality is reported, owner is remitted escrow
        if (score_pct >= 95) {
            return 0;
        } else {
            return 1;
        }
    }

}


contract AdmgrCommercialOfferingManager is Content {

    bytes32 public version ="AdmgrCommOffrMgr20190226134600ML"; //class name (max 16), date YYYYMMDD, time HHMMSS and Developer initials XX


    function runCreate() public payable returns (uint) {
        address commercialOfferingAddress = new AdmgrCommercialOffering();
        BaseContent commercialOfferingObj = BaseContent(msg.sender);
        AdmgrCommercialOffering commercialOfferingContract = AdmgrCommercialOffering(commercialOfferingAddress);
        commercialOfferingObj.setContentContractAddress(commercialOfferingAddress);
        commercialOfferingContract.setCommercialOfferingManagerAddress(address(this));
        commercialOfferingContract.transferCreatorship(owner); // Creatorship is kept central
        commercialOfferingContract.transferOwnership(commercialOfferingObj.owner()); //Ownership is distributed
        return 0;
    }

}

