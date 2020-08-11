pragma solidity 0.4.24;

import {Ownable} from "./ownable.sol";
import {Editable} from "./editable.sol";
import {Content} from "./content.sol";
import {Container} from "./container.sol";
import {AccessIndexor} from "./access_indexor.sol";
import "./user_space.sol";
import "./meta_object.sol";

/* -- Revision history --
BaseContent20190221101600ML: First versioned released
BaseContent20190301121900ML: Adds support for getAccessInfo, to replace getAccessCharge (not deprecated yet)
BaseContent20190315175100ML: Migrated to 0.4.24
BaseContent20190321122100ML: accessRequest returns requestID, removed ml_hash from access_complete event
BaseContent20190510151500ML: creation via ContentSpace factory, modified getAccessInfo API
BaseContent20190522154000SS: Changed hash bytes32 to string
BaseContent20190528193400ML: Modified to support non-library containers
BaseContent20190605203200ML: Splits publish and confirm logic
BaseContent20190724203300ML: Enforces access rights in access request
BaseContent20190801141600ML: Fixes the access rights grant for paid content
BaseContent20191029161700ML: Removed debug statements for accessRequest
BaseContent20191219135200ML: Made content object updatable by non-owner
BaseContent20200422180500ML: Version update to reflect changes made to editable to fix deletion
*/


contract BaseContent is MetaObject, Editable {

    bytes32 public version ="BaseContent20200803130000PO"; //class name (max 16), date YYYYMMDD, time HHMMSS and Developer initials XX

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

    uint8 public visibility = 0;
    uint8 public constant CAN_SEE = 1;
    uint8 public constant CAN_ACCESS = 10;
    uint8 public constant CAN_EDIT = 100;

    struct RequestData {
        address originator; // client address requesting
        uint256 amountPaid; // number of token received
        int8 status; //0 access requested, 1 access granted, -1 access refused, 2 access completed, -2 access error
        uint256 settled; //Amount of the escrowed money (amountPaid) that has been settled (paid to owner or refunded)
    }

     modifier onlyEditor() {
        require(canEdit());
        _;
    }

    mapping(uint256 => RequestData) public requestMap;

    event ContentObjectCreate(address containingLibrary);
    event SetContentType(address contentType, address contentContractAddress);

    event AccessRequest(
        uint256 requestID,
        uint8 level,
        string contentHash,
        string pkeRequestor,
        string pkeAFGH
    );
    event LogPayment(uint256 requestID, string label, address payee, uint256 amount);
    event AccessGrant(uint256 requestID, bool access_granted, string reKey, string encryptedAESKey);
    event AccessRequestValue(bytes32 customValue);
    event AccessRequestStakeholder(address stakeholder);
    event AccessComplete(uint256 requestID, uint256 scorePct, bool customContractResult);
    event SetContentContract(address contentContractAddress);

    event SetAccessCharge(uint256 accessCharge);
    event GetAccessCharge(uint8 level, uint256 accessCharge);
    event InsufficientFunds(uint256 accessCharge, uint256 amountProvided);
    event SetStatusCode(int statusCode);
    event Publish(bool requestStatus, int statusCode, string objectHash);

    // Debug events
    event InvokeCustomPreHook(address custom_contract);
    event ReturnCustomHook(address custom_contract, uint256 result);
    event InvokeCustomPostHook(address custom_contract);

    modifier onlyFromLibrary() {
        require(msg.sender == libraryAddress);
        _;
    }

    constructor(address content_space, address lib, address content_type) public payable {
        contentSpace = content_space;
        libraryAddress = lib;
        statusCode = -1;
        contentType = content_type;
        visibility = CAN_ACCESS; //default could be made a function of the library.

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


    function setVisibility(uint8 visibility_code) public onlyEditor {
        visibility = visibility_code;
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

    function setAddressKMS(address address_KMS) public onlyEditor {
        addressKMS = address_KMS;
    }

    function getKMSInfo(bytes prefix) public view returns (string, string) {
        IKmsSpace kmsSpaceObj = IKmsSpace(contentSpace);
        if (addressKMS == 0x0 || kmsSpaceObj.checkKMSAddr(addressKMS) == 0) {
            return ("", "");
        }
        return kmsSpaceObj.getKMSInfo(kmsSpaceObj.getKMSID(addressKMS), prefix);
    }

    //Owner can change this, unless the contract they are already set it prevent them to do so.
    function setContentContractAddress(address addr) public onlyEditor {
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

    // Visibility codes
    //      0   -> visible
    //      10  -> content not published
    //      100 -> calculation of price exceeds specified cap (accessCharge)
    //      255 -> unset
    // Access codes
    //      0   -> paid for
    //      10  -> content not published
    //      100 -> content available if paid for
    //      255 -> unset

    function getWIPAccessInfo() private view returns (uint8, uint8, uint256) {
        if ((tx.origin == owner) || (visibility >= CAN_EDIT) ){
            return (0, 0, accessCharge);
        }
        IUserSpace userSpaceObj = IUserSpace(contentSpace);
        address userWallet = userSpaceObj.userWallets(tx.origin);
        if (userWallet != 0x0) {
            AccessIndexor wallet = AccessIndexor(userWallet);
            if (wallet.checkContentObjectRights(address(this), wallet.TYPE_EDIT()) == true) {
                return (0, 0, accessCharge);
            }
        }
        if (Container(libraryAddress).canReview(tx.origin) == true) { //special case of pre-publish review
            return (0, 0, accessCharge);
        }
        return (10, 10, accessCharge);
    }

    function getCustomInfo(uint8 level, bytes32[] custom_values, address[] stakeholders) public view returns (uint8, uint8, uint256) {
        uint256 levelAccessCharge = accessCharge;
        uint8 visibilityCode = (visibility >= CAN_SEE) ? 0 : 255;
        uint8 accessCode = (visibility >= CAN_ACCESS) ? 0 :255;
        if (contentContractAddress != 0x0) {
            uint8 customMask;
            uint8 customVisibility;
            uint8 customAccess;
            uint256 customCharge;
            Content c = Content(contentContractAddress);
            (customMask, customVisibility, customAccess, customCharge) = c.runAccessInfo(level, custom_values, stakeholders);
            if (customCharge > accessCharge) {
                visibilityCode = 100;
            } else {
                if ((customMask & c.DEFAULT_SEE()) == 0) {
                    visibilityCode = customVisibility;
                }
                if ((customMask & c.DEFAULT_ACCESS()) == 0) {
                    accessCode = customAccess;
                }
                if ((customMask & c.DEFAULT_CHARGE()) == 0) {
                    levelAccessCharge = customCharge;
                }
            }
        }
        return (visibilityCode, accessCode, levelAccessCharge);
    }

    function getAccessInfo(uint8 level, bytes32[] custom_values, address[] stakeholders) public view returns (uint8, uint8, uint256) {

        if (statusCode != 0) {
            return getWIPAccessInfo(); //broken out to reduce complexity (compiler failed)
        }
        uint256 levelAccessCharge;
        uint8 visibilityCode;
        uint8 accessCode;
        (visibilityCode, accessCode, levelAccessCharge) = getCustomInfo( level, custom_values, stakeholders);//broken out to reduce complexity (compiler failed)

        if ((visibilityCode == 255) || (accessCode == 255) ) {
            IUserSpace userSpaceObj = IUserSpace(contentSpace);
            address userWallet = userSpaceObj.userWallets(tx.origin);
            if (userWallet != 0x0) {
                AccessIndexor wallet = AccessIndexor(userWallet);
                if (visibilityCode == 255) { //No custom calculations
                    if (wallet.checkContentObjectRights(address(this), wallet.TYPE_SEE()) == true) {
                        visibilityCode = 0;
                    }
                }
                if (visibilityCode == 0) { //if content is not visible, no point in checking if it is accessible
                    if (accessCode == 255) {
                        if (wallet.checkContentObjectRights(address(this), wallet.TYPE_ACCESS()) == true) {
                            accessCode = 0;
                        } else {
                            accessCode = 100; //content accessible if paid for
                        }
                    }
                }
            }
        }
        return (visibilityCode, accessCode, levelAccessCharge);
    }

    function setAccessCharge(uint256 charge) public onlyEditor returns (uint256) {
        accessCharge = charge;
        emit SetAccessCharge(accessCharge);
        return accessCharge;
    }

    function canEdit() public view returns (bool) {
        IUserSpace userSpaceObj = IUserSpace(contentSpace);
        address walletAddress = userSpaceObj.userWallets(tx.origin);
        AccessIndexor wallet = AccessIndexor(walletAddress);
        return wallet.checkContentObjectRights(address(this), wallet.TYPE_EDIT());
    }

    function canPublish() public view returns (bool) {
        return (canEdit() || msg.sender == libraryAddress);
    }

    function canCommit() public view returns (bool) {
        return canEdit();
    }

    function canConfirm() public view returns (bool) {
        INodeSpace bcs = INodeSpace(contentSpace);
        return bcs.canNodePublish(msg.sender);
    }

    // override from Editable
    function parentAddress() public view returns (address) {
        return libraryAddress;
    }

    // TODO: why payable?
    function publish() public payable returns (bool) {
        bool submitStatus = Container(libraryAddress).publish(address(this));
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

    function updateRequest() public {
        if (contentContractAddress == 0x0) {
            super.updateRequest();
        } else {
            Content c = Content(contentContractAddress);
            uint editCode = c.runEdit();
            if (editCode == 100) {
                super.updateRequest();
            } else {
                require(editCode == 0);
                emit UpdateRequest(objectHash);
            }
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
        public payable returns (uint256)
    {
        requestID = requestID + 1;
        uint256 requiredFund;
        uint8 visibilityCode;
        uint8 accessCode;

        (visibilityCode, accessCode, requiredFund) = getAccessInfo(level, custom_values, stakeholders);
        //emit DbgAccessCode(accessCode);

        if (accessCode == 100) { //Check if request is funded, except if user is owner or has paid already
            require(msg.value >= uint(requiredFund));
            //emit DbgAccess(requiredFund, msg.value, uint(requiredFund), (msg.value >= uint(requiredFund)));
            setPaidRights();
            accessCode = 0;
        }
        //emit DbgAccessCode(accessCode);
        require(accessCode == 0);


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

        return requestID;
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
        require(ml_out_hash == ml_out_hash); //placeholder for verification of signature
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
        emit AccessComplete(request_ID, score_pct, success);
        return success;
    }

    function kill() public onlyFromLibrary {
        if (contentContractAddress != 0x0) {
            Content c = Content(contentContractAddress);
            uint canKill = c.runKill();
            require((canKill == 0) || (canKill == 100));
            if (canKill == 100) {
                c.kill();
            }
        }
        super.kill();
    }

    function setPaidRights() private {
        address walletAddress = IUserSpace(contentSpace).userWallets(msg.sender);
        AccessIndexor indexor = AccessIndexor(walletAddress);
        indexor.setAccessRights();
    }

    function setRights(address stakeholder, uint8 access_type, uint8 access) public {
        address walletAddress = IUserSpace(contentSpace).userWallets(stakeholder);
        if (walletAddress == 0x0){
            //stakeholder is not a user (hence group or wallet)
            setGroupRights(stakeholder, access_type, access);
        } else {
            setGroupRights(walletAddress, access_type, access);
        }
    }

    function setGroupRights(address group, uint8 access_type, uint8 access) public {
        AccessIndexor indexor = AccessIndexor(group);
        indexor.setContentObjectRights(address(this), access_type, access);
    }

}
