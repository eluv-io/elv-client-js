pragma solidity 0.4.21;

import {Content} from "./content.sol";
import {BaseContent} from "./base_content.sol";
import {BaseLibrary} from "./base_library.sol";

//
// This contract implements an approval process in which after a 60%  
// completion of the submission, a partial payment of 40% of the licensing
// fee is paid to the contributor, with the remaining balance paid upon
// full, final approval.
//

contract SampleContentLicensing is Content {

    event PayCredit(address payee, address content, uint256 amount);

    uint256 public licensingFee = 10000000000000000000; //defaulted to 10 ethers
    uint8 public percentPartial = 60; // percentage threshold for content to trigger partial payment
    uint8 public partialPayment = 40; // percentage amount of licensing fees to be paid upon partial completion

    bytes32 public constant STATUS_DRAFT_APPROVED = "Draft approved";
    bytes32 public constant STATUS_FINAL_REVIEW = "Final in review";

    struct LicensingStatus {
        uint8 percentComplete;
        uint256 licensingFee;
        uint256 licensingFeePaid;
        bool valid; // to distinguish non-existing objects
    }

    mapping ( address => LicensingStatus ) public licensingStatus;

    function setLicensingFee(uint256 licensing_fee) public onlyOwner returns (uint256) {
        licensingFee = licensing_fee;
    }

    function setPercentPartial(uint8 percent_partial) public onlyOwner returns (uint8) {
        percentPartial = percent_partial;
        return percentPartial;
    }

    function setPartialPayment(uint8 partial_payment) public onlyOwner returns (uint8) {
        partialPayment = partial_payment;
        return partialPayment;
    }

    function runDescribeStatus(int status_code) public pure returns (bytes32) {
        if (status_code == -3) {
            return STATUS_DRAFT_APPROVED;
        }
        if (status_code == 3) {
            return STATUS_FINAL_REVIEW;
        }
        return 0x0;
    }

    function runCreate() public payable returns (uint) {
        LicensingStatus memory itemStatus = LicensingStatus(0, licensingFee, 0, true);
        licensingStatus[msg.sender] = itemStatus;
    }

    //on publish-0 payoff remainder, so that licensing is honored regardless of how submission was done
    // deny publishing unless percentComplete is 100
    function runStatusChange(int proposed_status_code) public payable returns (int) {
        address contentContract = msg.sender;
        BaseContent contentObj = BaseContent(contentContract);
        uint8 percentComplete = licensingStatus[contentContract].percentComplete;
        int statusCode = proposed_status_code;
        uint payout = 0;
        uint256 pendingFee = licensingStatus[contentContract].licensingFee
                                - licensingStatus[contentContract].licensingFeePaid;

        if ((contentObj.statusCode() < 0) && (proposed_status_code > 0)) {  //contributor conditions
            if (percentComplete >= percentPartial) {
                statusCode = 3;
            } else {
                statusCode = 1;
            }
        } else {  //reviewer conditions
            if (percentComplete == 100) {
                if (proposed_status_code == 0) {
                    payout = pendingFee;
                }
            } else if (percentComplete >= percentPartial) {
                if (proposed_status_code == 0) { // percent_complete is over 60%  but not 100%
                    uint256 partialPayoff = (licensingStatus[contentContract].licensingFee * partialPayment) / 100
                                                - licensingStatus[contentContract].licensingFeePaid;
                    payout = (partialPayoff > pendingFee) ? pendingFee : partialPayoff;
                    statusCode = -3;
                }
            } else {
                statusCode = -1;
            }
        }

        if (payout > 0) {
            require(payout <= pendingFee);
            address contentObjOwner = contentObj.creator();
            licensingStatus[contentContract].licensingFeePaid = licensingStatus[contentContract].licensingFeePaid
                                                                    + payout;
            contentObjOwner.transfer(payout);
            emit PayCredit(contentObjOwner, contentContract, payout);
        }

        emit RunStatusChange(proposed_status_code, statusCode);
        if (statusCode == 0) {
            //Ownership was transferred to the custom contract, when the content was placed in review
            delete (licensingStatus[contentContract]);
        } else if (statusCode < 0) {
            //Ownership is returned to the user, to continue editing
            contentObj.transferOwnership(contentObj.creator());
        } else if (statusCode > 0) {
            //Ownership is transferred to the custom contract, to prevent editing during review
            contentObj.transferOwnership(address(this));
        }
        return statusCode;
    }

    function reviewContent(
        address content_contract,
        bool approved,
        uint8 percent_complete,
        string note
    )
        public returns (bool)
    {
        licensingStatus[content_contract].percentComplete = percent_complete;
        BaseContent contentObj = BaseContent(content_contract);
        BaseLibrary libraryObj = BaseLibrary(contentObj.libraryAddress());
        bool result = libraryObj.approveContent(content_contract, approved, note);
        return result;
    }

    function transferContentOwnership(address content_address, address new_owner) public onlyOwner returns (address) {
        //instead of limiting the ownership transfer to the custom contract owner, we could remove the onlyOwner
        // requirement and replace by a validation either based on a group managed in that contract or managed by the
        // library (reviewers for example).
        BaseContent contentObj = BaseContent(content_address);
        contentObj.transferOwnership(new_owner);
        return new_owner;
    }

}

