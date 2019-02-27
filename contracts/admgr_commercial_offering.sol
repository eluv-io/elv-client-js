pragma solidity 0.4.21;

import {Content} from "./content.sol";
import {BaseContent} from "./base_content.sol";

//
// This contract can be used to indicate a relationship with a Campaign manager
// When campaignManager is left blank, the campaign manager can be selected 
//  individually for each sponsored content object.
//

contract AdmgrCommercialOffering is Content {

    address public commercialOfferingManagerAddress;
    address public campaignManager;
    bool public mandatorySponsoring;
    uint256 public presetAccessCharge;
    bool public mandatoryPresetAccessCharge;

    function runAccessCharge(
        uint8 level, /*level*/
        bytes32[], /*customValues*/
        address[] /*stakeholders*/
    )
    public payable returns (int256)
    {
        if (level == 0){
            return 0;
        }
        return -1;
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

}


contract AdmgrCommercialOfferingManager is Content {

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

