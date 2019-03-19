pragma solidity 0.4.24;

import {Editable} from "./editable.sol";
import {Content} from "./content.sol";
import {BaseLibrary} from "./base_library.sol";

/* -- Revision history --
BaseContent20190221101600ML: First versioned released
BaseContent20190301121900ML: Adds support for getAccessInfo, to replace getAccessCharge (not deprecated yet)
BaseContent20190315175100ML: Migrated to 0.4.24
*/


contract BaseContent is Editable {
    bytes32 public version ="BaseContent20190315175100ML"; //class name (max 16), date YYYYMMDD, time HHMMSS and Developer initials XX

    address public contentType;
    address public addressKMS;
    address public contentContractAddress;
    address public libraryAddress;

    uint256 public accessCharge;
    //bool refundable;
    int public statusCode; // 0: accessible, - in draft, + in review
                           // application have discretion to make up their own status codes to represent their workflow
    bytes32 public constant STATUS_PUBLISHED = "Published";
    bytes32 public constant STATUS_DRAFT = "Draft";
    bytes32 public constant STATUS_REVIEW = "Draft in review";

    uint256 public requestID = 0;

    struct RequestData {
        address originator; // client address requesting
        uint256 amountPaid; // number of token received
        int8 status; //0 access requested, 1 access granted, -1 access refused, 2 access completed, -2 access error
        uint256 settled; //Amount of the escrowed money (amountPaid) that has been settled (paid to owner or refunded)
    }

    mapping(uint256 => RequestData) public requestMap;

    event ContentObjectCreate(address containingLibrary);
    event SetContentType(address contentType, address contentContractAddress);

    event AccessRequest(
        uint256 requestID,
        uint8 level,
        bytes32 contentHash,
        string pkeRequestor,
        string pkeAFGH
    );
    event LogPayment(uint256 requestID, string label, address payee, uint256 amount);
    event AccessGrant(uint256 requestID, bool access_granted, string reKey, string encryptedAESKey);
    event AccessRequestValue(bytes32 customValue);
    event AccessRequestStakeholder(address stakeholder);
    event AccessComplete(uint256 requestID, uint256 scorePct, bytes32 mlOutHash, bool customContractResult);
    event SetContentContract(address contentContractAddress);

    event SetAccessCharge(uint256 accessCharge);
    event GetAccessCharge(uint8 level, uint256 accessCharge);
    event InsufficientFunds(uint256 accessCharge, uint256 amountProvided);
    event SetStatusCode(int statusCode);
    event Publish(bool requestStatus, int statusCode, bytes32 objectHash);

    // Debug events
    event InvokeCustomPreHook(address custom_contract);
    event ReturnCustomHook(address custom_contract, uint256 result);
    event InvokeCustomPostHook(address custom_contract);

    constructor(address content_type) public payable {
        libraryAddress = msg.sender;
        statusCode = -1;
        contentType = content_type;
        //get custom contract address associated with content_type from hash
        /*
        BaseLibrary lib = BaseLibrary(libraryAddress);
        contentContractAddress = lib.contentTypeContracts(content_type);
        addressKMS = lib.addressKMS();
        if (contentContractAddress != 0x0) {
            Content c = Content(contentContractAddress);
            require(c.runCreate() == 0);
        }
        */
        emit ContentObjectCreate(libraryAddress);
    }

    function statusDescription() public constant returns (bytes32) {
        return statusCodeDescription(statusCode);
    }

    function statusCodeDescription(int status_code) public constant returns (bytes32) {
        bytes32 codeDescription = 0x0;
        if (contentContractAddress != 0x0) {
            Content c = Content(contentContractAddress);
            codeDescription = c.runDescribeStatus(status_code);
        }
        if (codeDescription != 0x0) {
            return codeDescription;
        }
        if (status_code == 0) {
            return STATUS_PUBLISHED;
        }
        if (status_code < 0) {
            return  STATUS_DRAFT;
        }
        if (status_code > 0) {
            return STATUS_REVIEW;
        }
    }

    /* should be deprecated
    function setContentType(address content_type) public onlyOwner {
        contentType = content_type;
        //get custom contract address associated with content_type from hash
        BaseLibrary lib = BaseLibrary(libraryAddress);
        contentContractAddress = lib.contentTypeContracts(content_type);
        addressKMS = lib.addressKMS();
        if (contentContractAddress != 0x0) {

        }
        emit SetContentType(content_type, contentContractAddress);
    }

    */
    function setStatusCode(int status_code) public returns (int) {
        if ((tx.origin == owner) && ((status_code < 0) || ((status_code > 0) && (statusCode < 0)))) {

            //Owner can revert content to draft mode regardless of status (debatable for published, viewable content)
            //  and owner can move status from draft to in review
            statusCode = status_code;
        }

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

    //Owner can change this, unless the contract they are already set it prevent them to do so.
    function setContentContractAddress(address addr) public onlyOwner {
        Content c;
        if (contentContractAddress != 0x0) {
            c = Content(contentContractAddress);
            uint killStatus = c.runKill();
            require(killStatus == 0);
        }
        contentContractAddress = addr;
        if (addr != 0x0) {
            c = Content(addr);
            uint createStatus = c.runCreate();
            require(createStatus == 0);
        }
        emit SetContentContract(contentContractAddress);
    }

    // Access codes
    // 0   -> accessible
    // 100 -> calculation of price exceeds specified cap (accessCharge)
    function getAccessInfo(uint8 level, bytes32[] custom_values, address[] stakeholders) public view returns (int8, uint256) {
        uint256 levelAccessCharge;
        int8 accessCode = -1;
        if (contentContractAddress != 0x0) {
            Content c = Content(contentContractAddress);
            (accessCode, levelAccessCharge) = c.runAccessInfo(level, custom_values, stakeholders);
            if (levelAccessCharge > accessCharge) {
                accessCode = 100;
            }
        }
        if (accessCode == -1) { //No custom calculations
            return (0, accessCharge);
        } else {
            return (accessCode, levelAccessCharge);
        }
    }

    //This function should be deprecated as it is very costly, getAccessInfo, which is a view, can be used instead
    function getAccessCharge(uint8 level, bytes32[] custom_values, address[] stakeholders) public returns (uint256) {
        uint256 levelAccessCharge;
        int8 accessCode;
        (accessCode, levelAccessCharge) = getAccessInfo(level, custom_values, stakeholders);
        require(accessCode == 0);
        emit GetAccessCharge(level, levelAccessCharge);
        return levelAccessCharge;
    }

    function setAccessCharge(uint256 charge) public onlyOwner returns (uint256) {
        accessCharge = charge;
        emit SetAccessCharge(accessCharge);
        return accessCharge;
    }

    bytes32[] public versionHashes;
    bytes32 pendingHash;

    event CommitPending(bytes32 objectHash);

    //    function commit(bytes32 object_hash) public onlyOwner {
//        objectHash = object_hash;
//        emit Commit(objectHash);
//    }
    function commit(bytes32 _objectHash) public onlyOwner {
        // TODO: what to do if there already *is* a pendingHash?
        pendingHash = _objectHash;
        emit CommitPending(pendingHash);
    }

    function canPublish() public view returns (bool) {
        if (msg.sender == owner || msg.sender == libraryAddress) return true;
        BaseLibrary lib = BaseLibrary(libraryAddress);
        return lib.canNodePublish(msg.sender);
    }

    // TODO: why payable?
    // function confirm() public payable onlyOwner returns (bool) {
    function publish() public payable returns (bool) {
        require(canPublish());

        // TODO: hmmmm... this doesn't quite make sense WRT current code ...
        //require(pendingHash != ""); //ML: commented for now, as commit is typically not called in current code base
        if (objectHash != "") {
            versionHashes.push(objectHash); // save existing version info
        }
        super.commit(pendingHash);
        pendingHash = "";

        // Update the content contract to reflect the approval process
        updateStatus(1); //update status to in-review
        // mark with statusCode 1, which is the default for in-review - NOTE: could be change to be (currentStatus * -1)
        bool submitStatus = false;
        if (statusCode > 0) {
            BaseLibrary lib = BaseLibrary(libraryAddress);
            submitStatus = lib.submitApprovalRequest();
        }
        // Log event
        emit Publish(submitStatus, statusCode, objectHash); // TODO: confirm?
        return submitStatus;
    }

    function updateStatus(int status_code) public returns (int) {
        // require((tx.origin == owner) || (msg.sender == owner) || (msg.sender == libraryAddress));
        require(canPublish());
        int newStatusCode;
        if (contentContractAddress == 0x0) {
            if (((tx.origin == owner) || (msg.sender == owner)) && ((status_code == -1) || (status_code == 1))) {
                newStatusCode = status_code; //owner can change status back to draft or to in-review
            } else if ((msg.sender == libraryAddress) && (statusCode >= 0)) {
                newStatusCode = status_code; //library can change status of content in review to any status
            }
        } else {
            Content c = Content(contentContractAddress);
            newStatusCode = c.runStatusChange(status_code);
        }
        statusCode = newStatusCode;
        emit SetStatusCode(statusCode);
        return statusCode;
    }


    //this function allows custom content contract to call makeRequestPayment
    function processRequestPayment(uint256 request_ID, address payee, string label, uint256 amount) public returns (bool) {
        require((contentContractAddress != 0x0) && (msg.sender == contentContractAddress));
        return makeRequestPayment(request_ID, payee, label, amount);
    }

    function makeRequestPayment(uint256 request_ID, address payee, string label, uint256 amount) private returns (bool) {
        RequestData storage r = requestMap[request_ID];
        if ((r.settled + amount) <= r.amountPaid) {
            payee.transfer(amount);
            r.settled = r.settled + amount;
            emit LogPayment(request_ID, label, payee, amount);
        }
    }

    //  level - the security group for which the access request is for
    //  pkeRequestor - ethereum public key of the requestor (ECIES)
    //  pkeAFGH - ephemeral public key of the requestor (AFGH)
    //  customValues - an array of custom values used to convey additional information
    //  stakeholders - an array of additional address used to provide additional relevant addresses
    function accessRequest(
        uint8 level,
        string pke_requestor,
        string pke_AFGH,
        bytes32[] custom_values,
        address[] stakeholders
    )
        public payable returns (bool)
    {
        requestID = requestID + 1;
        //if (statusCode !=0) return false; // only published content should be accessible (debatable)
        BaseLibrary lib = BaseLibrary(libraryAddress);
        require(lib.hasAccess(tx.origin));

        if (tx.origin != owner) { //Check if request is funded, except if user is owner
            uint256 requiredFund = getAccessCharge(level, custom_values, stakeholders);
            require(msg.value >= uint(requiredFund));
        }
        RequestData memory r = RequestData(msg.sender, msg.value, 0, 0);
        // status of 0 indicates the payment received is in escrow in the content contract
        requestMap[requestID] = r;
        if (contentContractAddress != 0x0) {
            Content c = Content(contentContractAddress);
            uint result = c.runAccess(requestID, level, custom_values, stakeholders);
            require(result == 0);
        }
        // Raise Event
        emit AccessRequest(requestID, level, objectHash, pke_requestor, pke_AFGH);
        // Logs custom key/value pairs
        uint256 i;
        for (i = 0; i < custom_values.length; i++) {
            if (custom_values[i] != 0x0) {
                emit AccessRequestValue(custom_values[i]);
            }
        }
        for (i = 0; i < stakeholders.length; i++) {
            if (custom_values[i] != 0x0) {
                emit AccessRequestStakeholder(stakeholders[i]);
            }
        }

        return true;
    }

    //The rekey provided is encrypted with the pkeRequestor
    // if reKey is blank, then access was denied
    function accessGrant(
        uint256 request_ID,
        bool access_granted,
        string re_key,
        string encrypted_AES_key
    )
        public returns (bool)
    {
        require((msg.sender == owner) || (msg.sender == addressKMS));

        RequestData storage r = requestMap[request_ID];
        require(r.originator != 0x0);
        bool result = access_granted;
        if (contentContractAddress != 0x0) {
            Content c = Content(contentContractAddress);
            result = (c.runGrant(request_ID, access_granted) == 0);
        } else { //default behavior is settlement upon access grant
            if (r.settled < r.amountPaid) {
                if (access_granted == false) {
                    //escrowed fund to be refunded to accessor
                    makeRequestPayment(request_ID, r.originator, "access declined", r.amountPaid - r.settled);
                } else {
                    //escrowed fund to be paid to owner
                    makeRequestPayment(request_ID, owner, "owner payment", r.amountPaid - r.settled);
                }
            }
        }
        if (result == true) {
            r.status = 1;
            emit AccessGrant(request_ID, true, re_key, encrypted_AES_key);
        } else {
            r.status = -1;
            emit AccessGrant(request_ID, false, "", "");
        }
        return result;
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
    function accessComplete(uint256 request_ID, uint256 score_pct, bytes32 ml_out_hash) public payable returns (bool) {
        RequestData storage r = requestMap[request_ID];
        require((r.originator != 0x0) && ((msg.sender == r.originator) || (msg.sender == owner)));
        bool success = (score_pct != 0);
        if (contentContractAddress != 0x0) {
            Content c = Content(contentContractAddress);
            uint256 result = uint256(c.runFinalize(request_ID, score_pct));
            success = (result == 0);
        }
        if (msg.sender == r.originator) {//Owner direct call can't modify status to avoid premature clearing of escrow
            if (success){
             r.status = 2; //access completeted, by default score_pct is not taken into account
            } else {
             r.status = -2; //access error, only if finalize is returning non-zero code
          }
        }
        // Delete request from map after customContract in case it was needed for execution of custom wrap-up
        if (r.settled < r.amountPaid) {
            if (r.status <= 0) {
                //if access was not granted, payment is returned to originator
                makeRequestPayment(request_ID, r.originator, "refund", r.amountPaid - r.settled);
            } else {
                //if access was not granted and no error was registered, escrow is released to the owner
                makeRequestPayment(request_ID, owner, "release escrow", r.amountPaid - r.settled);
            }
        }
        delete requestMap[request_ID];
        // record to event
        emit AccessComplete(request_ID, score_pct, ml_out_hash, success);
        return success;
    }

    function kill() public onlyOwner {
        if (contentContractAddress != 0x0) {
            Content c = Content(contentContractAddress);
            require(c.runKill() == 0);
        }
        super.kill();
    }

}
