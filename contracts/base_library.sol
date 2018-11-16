pragma solidity 0.4.21;

import {Accessible} from "./accessible.sol";
import {Editable} from "./editable.sol";
import {BaseAccessControlGroup} from "./base_access_control_group.sol";
import {BaseContent} from "./base_content.sol";
import "./accessible.sol";


contract BaseLibrary is Accessible, Editable {


    address public contentSpace;
    address[] public contributorGroups;
    address[] public reviewerGroups;
    address[] public accessorGroups;
    address[] public contentTypes;
    uint256 public contributorGroupsLength;
    uint256 public reviewerGroupsLength;
    uint256 public accessorGroupsLength;
    uint256 public contentTypesLength;

    mapping ( address => address ) public contentTypeContracts;  // custom contracts map
    mapping ( address => uint256 ) public contentTypeLicensingFees;  // custom contracts map

    address[] public approvalRequests;
    address public addressKMS;
    uint256 public approvalRequestsLength = 0;
    mapping (address => uint256) private approvalRequestsMap; //index offset by 1 to avoid confusing 0 for removed

    event ContentObjectCreated(address contentAddress, address content_type);
    event ContributorGroupAdded(address group);
    event ReviewerGroupAdded(address group);
    event AccessorGroupAdded(address group);
    event ContentTypeAdded(address contentType, address contentContract, uint256 licensingFee);
    event UnauthorizedOperation(uint operationCode, address candidate);
    event ApproveContentRequest(address contentAddress, address submitter);
    event ApproveContentExecuted(address contentAddress, bool approved, string note);
    event PayCredit(address payee, uint256 amount);

    function BaseLibrary(address address_KMS) public payable {
        contentSpace = msg.sender;
        contributorGroupsLength = 0;
        reviewerGroupsLength = 0;
        accessorGroupsLength = 0;
        addressKMS = address_KMS;
    }

    function setAddressKMS(address address_KMS) public onlyOwner {
        addressKMS = address_KMS;
    }

    function addContributorGroup(address group) public onlyOwner {
        contributorGroups.push(group);
        contributorGroupsLength = contributorGroupsLength + 1;
        emit ContributorGroupAdded(group);
    }

    function addReviewerGroup(address group) public onlyOwner {
        reviewerGroups.push(group);
        reviewerGroupsLength = reviewerGroupsLength + 1;
        emit ReviewerGroupAdded(group);
    }

    function addAccessorGroup(address group) public onlyOwner {
        accessorGroups.push(group);
        accessorGroupsLength = accessorGroupsLength + 1;
        emit AccessorGroupAdded(group);
    }

    function addContentType(address content_type, address content_contract, uint256 licensing_fee) public onlyOwner {
        contentTypes.push(content_type);
        contentTypesLength = contentTypesLength + 1;
        contentTypeContracts[content_type] = content_contract;
        contentTypeLicensingFees[content_type] = licensing_fee;
        emit ContentTypeAdded(content_type, content_contract, licensing_fee);
    }

    function hasAccess(address candidate) public constant returns (bool) {
        if (accessorGroups.length == 0) {
            return true;
        }
        address group;
        bool groupAccess;
        BaseAccessControlGroup groupContract;
        for (uint i=0; i < accessorGroups.length; i++) {
            group = accessorGroups[i];
            if (group != 0x0) {
                groupContract = BaseAccessControlGroup(group);
                groupAccess = groupContract.hasAccess(candidate);
                if (groupAccess == true) {
                    return true;
                }
            }
        }
        return false;
    }

    function canContribute(address candidate) public constant returns (bool) {
        if (contributorGroups.length == 0) {
            return true;
        }
        address group;
        bool groupAccess;
        BaseAccessControlGroup groupContract;
        for (uint i = 0; i < contributorGroups.length; i++) {
            group = contributorGroups[i];
            if (group != 0x0) {
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
        for (uint i=0; i < reviewerGroups.length; i++) {
            group = reviewerGroups[i];
            if (group != 0x0) {
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
        address contentContract = msg.sender;
        BaseContent c = BaseContent(contentContract);
        if (c.owner() != tx.origin) {
            return false;
        }
        if (reviewerGroupsLength == 0) { //No review required
            uint8 percentComplete = c.percentComplete();
            // 0 indicates approval, custom contract might overwrite that decision
            uint256 toBePaid = c.updateStatus(0, percentComplete);
            payCredit(c, toBePaid);

            // Log event
            emit ApproveContentExecuted(contentContract, true, "");
            return true;
        }
        if (approvalRequestsMap[contentContract] != 0) {
            return false;
        }
        // Create a new approval request and add to pending list
        if (approvalRequestsLength < approvalRequests.length) {
            approvalRequests[approvalRequestsLength] = contentContract;
        } else {
            approvalRequests.push(contentContract);
        }
        approvalRequestsMap[contentContract] = approvalRequestsLength + 1;
        approvalRequestsLength++;

        // Log event
        emit ApproveContentRequest(contentContract, tx.origin);
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
        approvalRequestsLength--;
        approvalRequestsMap[content_contract] = 0;
        if (approvalRequestsLength > index) {
            address lastRequest = approvalRequests[approvalRequestsLength];
            approvalRequests[index] = lastRequest;
            delete approvalRequests[approvalRequestsLength];
            approvalRequestsMap[lastRequest] = index + 1;
        }

        int currentStatus = c.statusCode();
        if (currentStatus > 0) {
            uint8 percentComplete = c.percentComplete();
            int newStatusCode;
            if (approved == true) {
                newStatusCode = 0; // indicates approval, custom contract might overwrite that decision
            } else {
                newStatusCode = (currentStatus + 1) * -1; // returned to draft
            }
            uint256 toBePaid = c.updateStatus(newStatusCode, percentComplete);
            payCredit(c, toBePaid);

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
            uint256 toBePaid;
            uint256 remainder = c.getUnpaidLicensingFee(); //c.licensingFee - c.licensingFeeReceived;
            if (amount > remainder) {
                toBePaid = remainder;
            } else {
                toBePaid = amount;
            }
            // credit the transaction caller
            c.owner().transfer(toBePaid);
            c.addLicensingFeeReceived(toBePaid);
            emit PayCredit(c.owner(), toBePaid);
            return toBePaid;
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

    function accessRequest() public returns (bool) {
        if (hasAccess(tx.origin)) {
            emit AccessRequest(0);
            return true;
        } else {
            emit AccessRequest(105);
            return false;
        }
    }
}

