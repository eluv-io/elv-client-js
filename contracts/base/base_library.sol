pragma solidity ^0.4.21;


import {Editable} from './editable.sol';
import {BaseAccessControlGroup} from './base_access_control_group.sol';
import {BaseContent} from './base_content.sol';

contract BaseLibrary is Editable {

    //mapping (address => bool) public managers; //for now let it be restricted to owner
    address public space;
    //bytes32 public restricted_space;
    bytes32 public libraryHash;
    address[] public contributor_groups;
    address[] public reviewer_groups;
    address[] public accessor_groups;
    address[] public content_types;
    uint256 public contributor_groups_length;
    uint256 public reviewer_groups_length;
    uint256 public accessor_groups_length;
    uint256 public content_types_length;

    mapping ( address => address ) public contentTypeContracts;  // custom contracts map
    mapping ( address => uint256 ) public contentTypeLicensingFees;  // custom contracts map

    //uint256 public maxCredit = 10;

    address[] approvalRequests;
    address public addressKMS;
    uint256 public approvalRequestsLength = 0;
    mapping (address => uint256) private approvalRequestsMap; // the position + 1 in the array, the + 1, is to differentiate index 0 from un-mapped

    event ContentObjectCreated(address contentAddress, address content_type);
    event ContributorGroupAdded(address group);
    event ReviewerGroupAdded(address group);
    event AccessorGroupAdded(address group);
    event ContentTypeAdded(address contentType, address contentContract, uint256 licensingFee);
    event UnauthorizedOperation(uint operationCode, address candidate);
    event ApproveContentRequest(address contentAddress, address submitter);
    event ApproveContentExecuted(address contentAddress, bool approved, string note);

    event PayCredit(address payee, uint256 amount);

    //function () public payable { }

    function BaseLibrary(address address_KMS) public payable {
        space = msg.sender;
        contributor_groups_length = 0;
        reviewer_groups_length = 0;
        accessor_groups_length = 0;
        addressKMS = address_KMS;
    }

    function setAddressKMS(address address_KMS) public onlyOwner {
        addressKMS = address_KMS;
    }





    function addContributorGroup(address group) public onlyOwner {
        contributor_groups.push(group);
        contributor_groups_length = contributor_groups_length + 1;
        emit ContributorGroupAdded(group);
    }

    function addReviewerGroup(address group) public onlyOwner {
        reviewer_groups.push(group);
        reviewer_groups_length = contributor_groups_length + 1;
        emit ReviewerGroupAdded(group);
    }

    function addAccessorGroup(address group) public onlyOwner {
        accessor_groups.push(group);
        accessor_groups_length = accessor_groups_length + 1;
        emit AccessorGroupAdded(group);
    }

    function addContentType(address content_type, address content_contract, uint256 licensing_fee) public onlyOwner {
        content_types.push(content_type);
        content_types_length = content_types_length + 1;
        contentTypeContracts[content_type] = content_contract;
        contentTypeLicensingFees[content_type] = licensing_fee;
        emit ContentTypeAdded(content_type, content_contract, licensing_fee);
    }


    //TO DO: modify to match can_contribute if it works
    // Since this calls an external contract it can not be made a public view,
    //  so it executes as a transaction and the side effect is that we do not get the returned values, making it useless
    //  A possible workaround would be emit permission granted / permission denied event instead of returning the boolean. It seems wasteful though and would be inconvenient to use.
    function hasAccess(address candidate) public returns (bool) {
        if (accessor_groups.length == 0){
            return true;
        }
        address group;
        for (uint i=0; i < accessor_groups.length; i++) {
            group = accessor_groups[i];
            bool groupAccess;
            if (group != 0x0){
                groupAccess = group.call(bytes4(keccak256("has_access(address)")), candidate);
                if (groupAccess == true) {
                    return true;
                }
            }
        }
        return false;
    }


    function canContribute(address candidate) public constant returns (bool) {
        if (contributor_groups.length == 0){
            return true;
        }
        address group;
        bool groupAccess;
        BaseAccessControlGroup groupContract;
        for (uint i=0; i <  contributor_groups.length; i++) {
            group =  contributor_groups[i];
            if (group != 0x0){
                groupContract = BaseAccessControlGroup(group);
                groupAccess = groupContract.hasAccess(candidate);
                if (groupAccess == true) {
                    return true;
                }
            }
        }
        return false;
    }


    function canReview(address candidate) public constant returns (bool) {
        if (candidate == owner) {
            return true;
        }
        address group;
        bool groupAccess;
        BaseAccessControlGroup groupContract;
        for (uint i=0; i <  reviewer_groups.length; i++) {
            group =  reviewer_groups[i];
            if (group != 0x0){
                groupContract = BaseAccessControlGroup(group);
                groupAccess = groupContract.hasAccess(candidate);
                if (groupAccess == true) {
                    return true;
                }
            }
        }
        return false;
    }



    function submitApprovalRequest() public returns (bool) {
        address content_contract = msg.sender;
        BaseContent c = BaseContent(content_contract);
        if (c.owner() != tx.origin) {
            return false;
        }
        if (reviewer_groups_length == 0) { //No review required
            //int current_status = c.statusCode();
            uint8 percent_complete = c.percentComplete();
            int new_status_code;
            new_status_code = 0; // indicates approval, custom contract might overwrite that decision
            uint256 to_be_paid = c.updateStatus(new_status_code, percent_complete);
            payCredit(c, to_be_paid);

            // Log event
            emit ApproveContentExecuted(content_contract, true, "");
            return true;
        }
        if (approvalRequestsMap[content_contract] != 0) {
            return false;
        }
        // Create a new approval request and add to pending list
        if (approvalRequestsLength < approvalRequests.length) {
            approvalRequests[approvalRequestsLength] = content_contract;
        } else {
            approvalRequests.push(content_contract);
        }
        approvalRequestsMap[content_contract] = approvalRequestsLength + 1;//should be same either way, but in second case the length and number of items match
        approvalRequestsLength ++;

        // Log event
        emit ApproveContentRequest(content_contract, tx.origin);
        return true;
    }


    function getPendingApprovalRequest(uint256 index) public constant returns (address) {
        // Read and process the first content in the approvalRequests list
        if ((approvalRequestsLength == 0) || (approvalRequestsLength <= index)) {
            return 0;
        }
        return approvalRequests[index];
    }

    function approveContentExecuted(address content_contract, bool approved, string note) public returns ( bool ) {
        if (canReview(tx.origin) == false) {
            return false;
        }
        // credit the account based on the percent_complete
        uint256 index = approvalRequestsMap[content_contract] - 1;
        BaseContent c = BaseContent(content_contract);

        // remove the request from the list
        delete approvalRequests[index];
        approvalRequestsLength --;
        approvalRequestsMap[content_contract] = 0;
        if (approvalRequestsLength > index) {
            address last_request = approvalRequests[approvalRequestsLength];
            approvalRequests[index] = last_request;
            delete approvalRequests[approvalRequestsLength];
            approvalRequestsMap[last_request] = index + 1;
        }

        int current_status = c.statusCode();
        if (current_status > 0) {
            uint8 percent_complete = c.percentComplete();
            int new_status_code;
            if (approved == true) {

                /* remove this logic from here as it is constraining - best to handle it in custom contract
                if (percent_complete == 100) {
                  new_status_code = 0; // content approved for viewing
                } else {
                  new_status_code = (current_status + 2) * -1; // +2 to keep it odd number. Even number could be used to indicate refusal
                }
                */
                new_status_code = 0; // indicates approval, custom contract might overwrite that decision
            } else {
                new_status_code = (current_status + 1) * -1; // returned to draft
            }
            uint256 to_be_paid = c.updateStatus(new_status_code, percent_complete);
            payCredit(c, to_be_paid);

            // Log event
            emit ApproveContentExecuted(content_contract, approved, note);
            return true;
        } else {
            return false;
        }
    }


    function payCredit(address content_contract, uint256 amount) public returns (uint256) {
        if (amount > 0) {
            BaseContent c = BaseContent(content_contract);
            uint256 to_be_paid;
            uint256 remainder = c.getUnpaidLicensingFee(); //c.licensingFee - c.licensingFeeReceived;
            if (amount > remainder) {
                to_be_paid = remainder;
            } else {
                to_be_paid = amount;
            }
            // credit the transaction caller
            c.owner().transfer(to_be_paid);
            c.addLicensingFeeReceived(to_be_paid);
            emit PayCredit(c.owner(), to_be_paid);
            return to_be_paid;
        } else {
            return 0;
        }
    }


    function createContent(address content_type) public  returns (address) {
        //check if sender has contributor access
        if (canContribute(tx.origin) == false) {
            emit UnauthorizedOperation(101, tx.origin);
            return 0x0;
        }

        //get custom contract address associated with content_type from hash
        //address custom_contract = contentTypeContracts[content_type]; //Not required anylonger
        //uint256 licensing_fee = contentTypeLicensingFees[content_type]; //Not required anylonger

        //create content object
        address contentAddress = new BaseContent();
        BaseContent c = BaseContent(contentAddress);
        c.setContentType(content_type);
        emit ContentObjectCreated(contentAddress, content_type);

        return contentAddress;
    }
}



