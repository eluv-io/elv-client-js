pragma solidity ^0.4.21;


import './ownable.sol';

contract ContentLibrary is Ownable {

    //mapping (address => bool) public managers; //for now let it be restricted to owner
    string public name;
    bytes32 public space;
    bytes32 public restricted_space;
    bytes32 public libraryHash;
    address[] public contributor_groups;
    address[] public reviewer_groups;
    address[] public accessor_groups;
    bytes32[] public content_types;
    uint256 public contributor_groups_length;
    uint256 public reviewer_groups_length;
    uint256 public accessor_groups_length;
    uint256 public content_types_length;

    mapping ( bytes32 => address ) public contentTypeContracts;  // custom contracts map
    mapping ( bytes32 => uint256 ) public contentTypeLicensingFees;  // custom contracts map

    //uint256 public maxCredit = 10;

    address[] approvalRequests;
    address public addressKMS;
    uint256 public approvalRequestsLength = 0;
    mapping (address => uint256) private approvalRequestsMap; // the position + 1 in the array, the + 1, is to differentiate index 0 from un-mapped

    event ContentObjectCreated(address contentAddress, address containingLibrary, bytes32 content_type, address content_owner);
    event ContributorGroupAdded(address group);
    event ReviewerGroupAdded(address group);
    event AccessorGroupAdded(address group);
    event ContentTypeAdded(bytes32 group);
    event UnauthorizedOperation(uint operation_code, address candidate);
    event ApproveContentRequest(address content_address, address submitter);
    event ApproveContentExecuted(address content_address, bool approved, string note);
    event SetLibraryHash(bytes32 library_hash);
    event PayCredit(address payee, uint256 amount);

    function () public payable { }

    function ContentLibrary(string memory library_name, bytes32 content_space, address address_KMS) public payable {
      name = library_name;
      space = content_space;
      contributor_groups_length = 0;
      reviewer_groups_length = 0;
      accessor_groups_length = 0;
      addressKMS = address_KMS;
    }

    function setAddressKMS(address address_KMS) public onlyOwner {
      addressKMS = address_KMS;
    }


    function setLibraryHash(bytes32 library_hash) public onlyOwner {
      libraryHash = library_hash;
      emit SetLibraryHash(library_hash);
    }

    function setRestrictedSpace(bytes32 new_restricted_space) public onlyOwner {
      restricted_space = new_restricted_space;
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

    function addContentType(bytes32 content_type, address custom_contract, uint256 licensing_fee) public onlyOwner {
      content_types.push(content_type);
      content_types_length = content_types_length + 1;
      contentTypeContracts[content_type] = custom_contract;
      contentTypeLicensingFees[content_type] = licensing_fee;
      emit ContentTypeAdded(content_type);
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
      AccessControlGroup groupContract;
      for (uint i=0; i <  contributor_groups.length; i++) {
        group =  contributor_groups[i];
        if (group != 0x0){
      groupContract = AccessControlGroup(group);
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
      AccessControlGroup groupContract;
      for (uint i=0; i <  reviewer_groups.length; i++) {
        group =  reviewer_groups[i];
        if (group != 0x0){
          groupContract = AccessControlGroup(group);
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
      Content c = Content(content_contract);
      if (c.owner() != tx.origin) { 
        return false;
      }
      if (reviewer_groups_length == 0) { //No review required
        int current_status = c.statusCode();
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
      Content c = Content(content_contract);

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
	 Content c = Content(content_contract);
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


    function createContent(bytes32 content_type) public  returns (address) {
        //check if sender has contributor access
        if (canContribute(tx.origin) == false) {
          emit UnauthorizedOperation(101, tx.origin);
          return 0x0;
        }

        //get custom contract address associated with content_type from hash
        address custom_contract = contentTypeContracts[content_type];
	uint256 licensing_fee = contentTypeLicensingFees[content_type];

        //create content object
        address contentAddress = new Content(address(this), content_type);
        Content c = Content(contentAddress);
        emit ContentObjectCreated(contentAddress, address(this), content_type, tx.origin);
       
        return contentAddress; //for debugging and testing
    }
}



contract Content is Ownable {

    bytes32 public contentType;
    address public addressKMS;
    address public customContractAddress;
    address public libraryAddress;
    bytes32 public contentHash;
    uint256 public accessCharge;
    //bool refundable;
    int public statusCode;// 0: accessible, - in draft, + in review - application have discretion to make up their own status codes to represent their workflow
    uint8 public percentComplete;
    uint256 public licensingFee;
    uint256 public licensingFeeReceived;
    uint256 public requestID;

    struct RequestData {
        address originator; // client address requesting
        uint256 amountPaid; // number of token received
        int8 status; //0 in escrow, 1 paid to content owner, -1 refunded to originator
    }

    mapping ( uint256 => RequestData ) public requestMap; 

    event ContentObjectCreate(address content_address, address containing_library, bytes32 content_type, address content_owner);
    event AccessRequest(uint request_validity, uint256 request_id, uint8 level, bytes32 contentHash, string pkeRequestor, string pkeAFGH);
    event AccessGrant(uint256 request_ID, bool access_granted, string reKey, string encrypted_AES_key);
    event AccessRequestValue(bytes32 customValue);
    event AccessRequestStakeholder(address stakeholder);
    event AccessComplete(uint256 request_ID, uint256 scorePct, bytes32 mlOutHash, bool customContractResult);
    event SetCustomContract(address custom_contract_address);
    event SetContentHash(bytes32 content_hash);
    event SetAccessCharge(uint256 access_charge);
    event GetAccessCharge(uint8 level, uint256 access_charge);
    event InsufficientFunds(uint256 access_charge, uint256 amount_provided);
    event SetStatusCode(int status_code);
    event Publish(uint8 pct_complete,bool request_status);

    // Debug events
    event InvokeCustomPreHook(address custom_contract);
    event ReturnCustomHook(address custom_contract, uint256 result);
    event InvokeCustomPostHook(address custom_contract);

    // "Fallback" function - necessary if this contract needs to be paid
    function () public payable { }

    function Content(address containingLibrary, bytes32 content_type) public payable {
        libraryAddress = containingLibrary;
        contentType = content_type;
        statusCode = -1;
	licensingFeeReceived = 0;
	requestID = 0;
        //get custom contract address associated with content_type from hash
	ContentLibrary lib = ContentLibrary(containingLibrary);
        customContractAddress = lib.contentTypeContracts(content_type);
        licensingFee = lib.contentTypeLicensingFees(content_type);
	addressKMS = lib.addressKMS();
        emit ContentObjectCreate(address(this), containingLibrary, content_type, tx.origin);
        emit SetCustomContract(customContractAddress);
    }

    function setLicensingFee(uint256 licensing_fee) public {
        if ( (tx.origin == owner) && (statusCode < 0 )) {
            licensingFee = licensing_fee;
        }
    }

    function setStatusCode(int status_code) public returns (int) {
	if ( (tx.origin == owner) && ((status_code < 0 ) || ((status_code > 0) && (statusCode < 0))) ) {
	  //Owner can revert content to draft mode regardless of status (debatable for published, viewable content i.e. status 0)
	  //  and owner can move status from draft to in review
	  statusCode = status_code;
	}
        /* logic removed as the owner still go through the library object to publish, so the entitlement will have to be made by the library
	if ( (msg.sender == libraryAddress) && ((statusCode > 0 ) || ((status_code < 0) && (statusCode == 0))) ) {
          // reviewer can revert published content to draft mode
          //   and reviewer can move content in review to any status including published
          statusCode = status_code;
        }
	*/
	if (msg.sender == libraryAddress) {
          // Library has full authority to change status, it is assumed entitlement is done there
          statusCode = status_code;
        }

	emit SetStatusCode(statusCode);
	return statusCode;
    }

    function setAddressKMS(address address_KMS) public onlyOwner {
	addressKMS = address_KMS;
    }


    function getUnpaidLicensingFee() public constant returns (uint256) {
      return  licensingFee - licensingFeeReceived;
    }

    function addLicensingFeeReceived(uint256 amount_to_be_paid) public returns (uint256){
      if (msg.sender != libraryAddress){
	return 0;
      }
      licensingFeeReceived = licensingFeeReceived + amount_to_be_paid;
      return licensingFeeReceived;
    }

    function setContentHash(bytes32 content_hash) public onlyOwner {
        contentHash = content_hash;
        emit SetContentHash(content_hash);
    }


    function setCustomContractAddress(address addr) public onlyOwner {
         customContractAddress = addr;
         emit SetCustomContract(customContractAddress);
    }

    function getAccessCharge(uint8 level, bytes32[] customValues, address[] stakeholders) public returns (uint256) {
      uint256 level_access_charge = accessCharge;
      if (customContractAddress != 0x0) {
        CustomContract c = CustomContract(customContractAddress);
        int256 calculatedCharge = c.runAccessCharge(level, customValues, stakeholders);
	if (calculatedCharge >= 0) {
	  level_access_charge = uint256(calculatedCharge);
	} 
      }
      emit GetAccessCharge(level, level_access_charge);
      return level_access_charge;
    }

    function setAccessCharge (uint256 charge) public onlyOwner returns (uint256) {
        accessCharge = charge;
        emit SetAccessCharge(accessCharge);
        return accessCharge;
    }


    function publish(uint8 pct_complete, string signed_verification) public payable onlyOwner returns (bool)
    {
      // Check that content is verified via the custom data and add to approval list for review if so
      // Here we check that the signed_verification is valid

      // TODO - CHECK SIGNATURE
      keccak256(signed_verification);

      // Update the content contract to reflect the approval process
      updateStatus(1, pct_complete); //mark with statusCode 1, which is the default for in-review - NOTE: could be change to be (currentStatus * -1)
      if (statusCode > 0) {
        ContentLibrary lib = ContentLibrary(libraryAddress);
	bool submitStatus = lib.submitApprovalRequest();

        // Log event
        emit Publish(pct_complete,submitStatus);
        return submitStatus;
      } else {
        return false;
      }
    }


    //returns the amount of licensing fee to be paid for the content, typically 0 or 100 if content approved to go live, unless a custom contract says otherwise
    function updateStatus(int status_code, uint8 percent_complete) public returns (uint256){
      if ((tx.origin == owner) || (msg.sender == libraryAddress)) {
	percentComplete = percent_complete;
	uint256 to_be_paid=0;
        int new_status_code;
        if (customContractAddress == 0x0) {
	  new_status_code = status_code;
	  if ((percentComplete == 100) && (status_code == 0)){
            to_be_paid = (licensingFee - licensingFeeReceived);
          }
        } else {
	  CustomContract c = CustomContract(customContractAddress);
	  int256 calculatedAmount;
          (new_status_code, calculatedAmount) = c.runStatusChange(status_code);
	  if (calculatedAmount < 0) {
	    if (status_code == 0) {
	      to_be_paid = (licensingFee - licensingFeeReceived);
	    }
	  } else {
	    to_be_paid = uint256(calculatedAmount);
	  }
	}
        setStatusCode(new_status_code);
	return to_be_paid;
      } else {
        return 0;
      }
    }


/* not implemented for now as it might require some re-designing
    function setRefundable(bool enabled) public {
        // Only if owner is sender
        if (msg.sender == owner)
        {
            refundable = enabled;
        }
    }

    function getRefundable() public constant returns (bool) {
        return refundable;
    }
*/


    //  level - the security group for which the access request is for
    //  pkeRequestor - ethereum public key of the requestor (ECIES)
    //  pkeAFGH - ephemeral public key of the requestor (AFGH)
    //  customValues - an array of custom values used to convey additional information
    //  stakeholders - an array of additional address used to provide additional relevant addresses
    function accessRequest(uint8 level, string pkeRequestor, string pkeAFGH, bytes32[] customValues, address[] stakeholders) public payable returns(bool)
    {
      requestID = requestID + 1;
      //if (statusCode !=0) return false; // only published content should be accessible (debatable)

      //Check if request is funded
      uint256 requiredFund = getAccessCharge(level, customValues, stakeholders);
      if (msg.value < uint(requiredFund)) {
        emit AccessRequest(103, requestID, level, bytes32(""), "", ""); //for non-0 (unsuccessful request) no need to emit the contentHash and pke
	return false;
      }
      RequestData memory r  = RequestData(msg.sender, msg.value, 0);// status of 0 indicates the payment received is in escrow in the content contract 
      requestMap[requestID] = r;
      if (customContractAddress != 0x0) {
        CustomContract c = CustomContract(customContractAddress);
        uint result = c.runAccess(requestID, level, customValues, stakeholders);
        if ( result != 0 ) {
          emit AccessRequest(result, requestID, level, bytes32(""), "", ""); //for non-0 (unsuccessful request) no need to emit the contentHash and pke
          return false;
        }
      }
      // Raise Event
      emit AccessRequest(0, requestID, level, contentHash, pkeRequestor, pkeAFGH);
      // Logs custom key/value pairs
      uint256 i;
      for (i=0; i < customValues.length; i++) {
        if (customValues[i] != 0x0){
          emit AccessRequestValue(customValues[i]);
        }
      }
      for (i=0; i < stakeholders.length; i++) {
        if (customValues[i] != 0x0){
          emit AccessRequestStakeholder(stakeholders[i]);
        }
      }

      return true;
    }


    //The rekey provided is encrypted with the pkeRequestor
    // if reKey is blank, then access was denied
    function accessGrant(uint256 request_ID, bool access_granted, string reKey, string encrypted_AES_key) public returns(bool)
    {
	if ((msg.sender != owner) && (msg.sender != addressKMS)) {
	  return false;
	}
        RequestData r  = requestMap[request_ID]; 
        if (r.originator == 0x0){
	  return false;
	}
        if (r.status == 0) {
	  if (access_granted == false) {
	    //escrowed fund to be refunded to accessor
	    r.originator.transfer(r.amountPaid);
	    r.status = -1;
            emit AccessGrant(request_ID, false, "", "");
	  } else {
	    //escrowed fund to be paid to owner
	    owner.transfer(r.amountPaid);
	    r.status = 1;
            emit AccessGrant(request_ID, true, reKey, encrypted_AES_key);
	  }
        }
        return true;
    }




    // sender passes the quality score as pct of best possible (converted to 1-100 scale)
    // the fabric provides to this access,
    // hash of the version of the ML-computed segment matrix used (stored as a'part'),
    // and a maximum credit to a client based on failed SLA (quality)
    // score and hash are recorded in an event
    // contract has astate variable creditBack
    // a credit refund is calculated for the caller (if )
    // will true up the charge based on the quality score by transferring tokens back
    // to the sender
    //
    // add a state variable in the contract indicating whether to credit back based on quality score

    function accessComplete(uint256 request_ID, uint256 scorePct, bytes32 mlOutHash) public payable returns(bool)
    {
	/*
        if (refundable == true) {
            payCredit(scorePct);
        } else {
        }
	*/

        bool result = true;
        if (customContractAddress != 0x0) {
            CustomContract c = CustomContract(customContractAddress);
            result = c.runFinalize(request_ID);
        }
	// Delete request from map after customContract in case it was needed for execution of custom wrap-up
	RequestData r  = requestMap[request_ID];
        if ((r.originator != 0x0) && (msg.sender == r.originator)){
	  if (r.status == 0) {
	    msg.sender.transfer(r.amountPaid); //if access was not granted, payment is returned to originator
	  }
	  delete requestMap[request_ID]; 
	} else {
          result = false;
	}
        // record to event
        emit AccessComplete(request_ID, scorePct, mlOutHash, result);
        return result;
    }



}


contract AccessControlGroup is Ownable {
   function hasAccess(address candidate) public view returns (bool);
}


contract CustomContract is Ownable {
    event DbgString(string s);
    event DbgAddress(address a);
    event DbgUint256(uint256 u);
    event DbgUint(uint u);
    event RunAccessCharge(uint8 level, int256 calculateAccessCharge);
    event RunAccess(uint256 request_ID, uint result);
    event RunFinalize(uint256 request_ID, bool result);
    event RunStatusChange(int proposed_status_code, int return_status_code, int256 licenseFeeToBePaid);

    function () public payable { }

    // charge, amount paid and address of the originator can all be retrieved from the requestMap using the requestID
    function runAccessCharge(uint8 level, bytes32[] customValues, address[] stakeholders) public returns (int256) {
	return -1; // indicates that the amount is the static one configured in the Content object and no extra calculation is required
    }
    function runAccess(uint256 request_ID, uint8 level, bytes32[] custom_values, address[] stake_holders) public payable returns(uint) {
	return 0; //indicates that access request can proceed. Other number can be used as error codes and would stop the processing.
    }
    function runFinalize(uint256 request_ID) public returns(bool) {
	return true; //the status is logged in an event at the end of the accessComplete function, behavior is currently unchanged regardless of result.
    }
    function runStatusChange(int proposed_status_code) public returns (int, int256) {
	return (proposed_status_code, -1); // a negative number indicates that the licending fee to be paid is the default
    }
}
