pragma solidity 0.4.24;

import {Ownable} from "./ownable.sol";
import {Editable} from "./editable.sol";
import {Content} from "./content.sol";
import {Container} from "./container.sol";
import {AccessIndexor} from "./access_indexor.sol";
import "./user_space.sol";

/* -- Revision history --
BaseContent20190221101600ML: First versioned released
BaseContent20190301121900ML: Adds support for getAccessInfo, to replace getAccessCharge (not deprecated yet)
BaseContent20190315175100ML: Migrated to 0.4.24
BaseContent20190321122100ML: accessRequest returns requestID, removed ml_hash from access_complete event
BaseContent20190510151500ML: creation via ContentSpace factory, modified getAccessInfo API
BaseContent20190510151500ML: creation via ContentSpace factory, modified getAccessInfo API
BaseContent20190522154000SS: Changed hash bytes32 to string
BaseContent20190528193400ML: Modified to support non-library containers
BaseContent20190605203200ML: Splits publish and confirm logic
BaseContent20190724203300ML: Enforces access rights in access request
BaseContent20190801141600ML: Fixes the access rights grant for paid content
BaseContent20191029161700ML: Removed debug statements for accessRequest
BaseContent20191219135200ML: Made content object updatable by non-owner
BaseContent20200102165900ML: Enforce visibility driven rights to edit
BaseContent20200107175100ML: Moved Visibility filter from BaseContentObject to Accessible, default it to 0
BaseContent20200129211300ML: Restricts deletion to owner (not editor) or library owner, unless changed by custom contract
BaseContent20200131120200ML: Adds support for default finalize behavior in runFinalize
BaseContent20200205101900ML: Adds support for non-0 runkill codes in contract swap, allows library editors to delete objects
BaseContent20200205142000ML: Closes vulnerability allowing alien external objects to kill a custom contract
BaseContent20200211163800ML: Modified to conform to authV3 API
BaseContent20200212101200ML: Disambiguatea getAccessInfo vs getAccessInfoV3 to reflect API changes
BaseContent20200316135000ML: Leverages inherited hasAccess
*/


contract BaseContent is Editable {

    bytes32 public version ="BaseContent20200316135000ML"; //class name (max 16), date YYYYMMDD, time HHMMSS and Developer initials XX

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

    function migrate(address _contentType,
            address _addressKMS,
            address _contentContractAddress,
            // address _libraryAddress,
            uint256 _accessCharge,
            int _statusCode,
            // uint256 _requestID,
            uint8 _visibility,
            string _objectHash,
            string _versionHashes
        ) public {

        Ownable space = Ownable(contentSpace);
	      require(msg.sender == space.owner());

        contentType = _contentType;
        addressKMS = _addressKMS;
        contentContractAddress = _contentContractAddress;
        // libraryAddress = _libraryAddress; // TODO: set by library factory method?

        accessCharge = _accessCharge;
        statusCode = _statusCode;
        // requestID = _requestID;
        visibility = _visibility;

        super.migrate(_objectHash, _versionHashes);

        return;
    }

    // TODO: remove?
    mapping(bytes32 => RequestData) public requestMap;

    event ContentObjectCreate(address containingLibrary);
    event SetContentType(address contentType, address contentContractAddress);

    event LogPayment(bytes32 requestNonce, string label, address payee, uint256 amount);
    event AccessRequestValue(bytes32 customValue);
    event AccessRequestStakeholder(address stakeholder);
    event AccessRequest( //For backward compatibility
       uint256 requestID,
       uint8 level,
       string contentHash,
       string pkeRequestor,
       string pkeAFGH
   );

   event AccessComplete(uint256 requestID, uint256 scorePct, bool customContractResult);

   event AccessCompleteV3(
       bytes32 requestNonce,
       bool customContractResult,
       address parentAddress,
       bytes32 contextHash,
       address accessor,           // I've called this 'userAddress' - don't care too much but ideally it's the same name wherever it means the same thing!
       uint256 request_timestamp   // always millis - either set from context or with blockchain now()
   );


    event SetContentContract(address contentContractAddress);

    event SetAccessCharge(uint256 accessCharge);
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
        visibility = 0; //default could be made a function of the library.
        indexCategory = 1; // AccessIndexor CATEGORY_CONTENT_OBJECT
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
        return 0;
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
            uint killStatus = c.runKillExt();
            if ((killStatus == 100) || (killStatus == 1100)) {
               c.commandKill();
            } else {
               require((killStatus == 0) || (killStatus == 1000));
            }
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

    function getWIPAccessInfo(address accessor) private view returns (uint8, uint8, uint256) {
        if ((accessor == owner) || (visibility >= CAN_ACCESS) ){
            return (0, 0, accessCharge);
        }
        IUserSpace userSpaceObj = IUserSpace(contentSpace);
        address userWallet = userSpaceObj.userWallets(accessor);
        if (userWallet != 0x0) {
            /*
            AccessIndexor wallet = AccessIndexor(userWallet);
            if (wallet.checkContentObjectRights(address(this), wallet.TYPE_ACCESS()) == true) {
                return (0, 0, accessCharge);
            }
            */
            if (hasAccess(accessor) == true) {
                return (0, 0, accessCharge);
            }
        }
        if (Container(libraryAddress).canReview(accessor) == true) { //special case of pre-publish review
            return (0, 0, accessCharge);
        }
        return (10, 10, accessCharge);
    }

    function getCustomInfo(address accessor, bytes32[] customValues, address[] stakeholders) public view returns (uint8, uint8, uint256) {
        uint256 calculatedCharge = accessCharge;
        uint8[2] memory codes;
        codes[0] = (visibility >= CAN_SEE) ? 0 : 255; // visibilityCode
        codes[1] = (visibility >= CAN_ACCESS) ? 0 :255; //accessCode
        if (contentContractAddress != 0x0) {
            uint8 customMask;
            uint8 customVisibility;
            uint8 customAccess;
            uint256 customCharge;
            (customMask, customVisibility, customAccess, customCharge) = Content(contentContractAddress).runAccessInfo(customValues, stakeholders, accessor);
            if (customCharge > accessCharge) {
                codes[0] = 100;
            } else {
                if ((customMask & 1 /*DEFAULT_SEE*/) == 0) {
                    codes[0] = customVisibility;
                }
                if ((customMask & 2 /*DEFAULT_ACCESS*/) == 0) {
                    codes[1] = customAccess;
                }
                if ((customMask & 4 /*DEFAULT_CHARGE*/) == 0) {
                    calculatedCharge = customCharge;
                }
            }
        }
        return (codes[0], codes[1], calculatedCharge);
    }

    function getAccessInfo(uint8 level, bytes32[] customValues, address[] stakeholders) public view returns (uint8, uint8, uint256) { //legacy
        return getAccessInfoV3(msg.sender, customValues, stakeholders);
    }

    function getAccessInfoV3(address accessor, bytes32[] customValues, address[] stakeholders) public view returns (uint8, uint8, uint256) {

        if (statusCode != 0) {
            return getWIPAccessInfo(accessor); //broken out to reduce complexity (compiler failed)
        }
        uint256 calculatedCharge;
        uint8 visibilityCode;
        uint8 accessCode;
        (visibilityCode, accessCode, calculatedCharge) = getCustomInfo(accessor, customValues, stakeholders);//broken out to reduce complexity (compiler failed)

        if ((visibilityCode == 255) || (accessCode == 255) ) {
            IUserSpace userSpaceObj = IUserSpace(contentSpace);
            address userWallet = userSpaceObj.userWallets(accessor);
            if (userWallet != 0x0) {
                if (visibilityCode == 255) { //No custom calculations
                    if (AccessIndexor(userWallet).checkRights(indexCategory, address(this), 0)  /*canSee(accessor)*/ == true) {
                        visibilityCode = 0;
                    }
                }
                if (visibilityCode == 0) { //if content is not visible, no point in checking if it is accessible
                    if (accessCode == 255) {
                        if (hasAccess(accessor) == true) {
                            accessCode = 0;
                        } else {
                            accessCode = 100; //content accessible if paid for
                        }
                    }
                }
                /*
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
                */
            }
        }
        return (visibilityCode, accessCode, calculatedCharge);
    }

    function setAccessCharge(uint256 charge) public onlyEditor returns (uint256) {
        accessCharge = charge;
        emit SetAccessCharge(accessCharge);
        return accessCharge;
    }

    /*
    function canEdit() public view returns (bool) {
        if ((visibility >= 100) || (msg.sender == owner)) {
         return true;
        }
        IUserSpace userSpaceObj = IUserSpace(contentSpace);
        address walletAddress = userSpaceObj.userWallets(tx.origin);
        AccessIndexor wallet = AccessIndexor(walletAddress);
        return wallet.checkContentObjectRights(address(this), wallet.TYPE_EDIT());
    }
    */

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
        require(canEdit());
        bool submitStatus = Container(libraryAddress).publish(address(this));
        // Log event
        emit Publish(submitStatus, statusCode, objectHash); // TODO: confirm?
        return submitStatus;
    }

    function updateStatus(int status_code) public returns (int) {
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
    function processRequestPayment(bytes32 requestNonce, address payee, string label, uint256 amount) public returns (bool) {
        require((contentContractAddress != 0x0) && (msg.sender == contentContractAddress));
        return makeRequestPayment(requestNonce, payee, label, amount);
    }

    function makeRequestPayment(bytes32 requestNonce, address payee, string label, uint256 amount) private returns (bool) {
        RequestData storage r = requestMap[requestNonce];
        if ((r.settled + amount) <= r.amountPaid) {
            payee.transfer(amount);
            r.settled = r.settled + amount;
            emit LogPayment(requestNonce, label, payee, amount);
        }
        return true;
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

    function accessRequestContext(
        bytes32 requestNonce,
        bytes32 contextHash,
        address accessor,
        uint256 request_timestamp
    ) public payable returns (bytes32) {
        require(tx.origin == addressKMS);
        bytes32[] memory emptyVals;
        address[] memory emptyAddrs;
        return accessRequestInternal(requestNonce, emptyVals, emptyAddrs, contextHash, accessor, request_timestamp);
    }

    function makeNonce(uint256 reqId) view returns(bytes32) {
        return keccak256(abi.encodePacked(requestID, address(this)));
    }

    function accessRequestV3(
        bytes32[] customValues,
        address[] stakeholders
    ) public payable returns (bool) {
        requestID = requestID + 1;
        bytes32 requestNonce = makeNonce(requestID);
        accessRequestInternal(requestNonce, customValues, stakeholders, 0x0, msg.sender, now * 1000);

        //The 2 next lines could be moved into accessRequest internal to support payment via statechannel
        RequestData memory r = RequestData(msg.sender, msg.value, 0, 0);
        requestMap[requestNonce] = r;

        return true;
    }

    //  level - the security group for which the access request is for
    //  pkeAFGH - ephemeral public key of the requestor (AFGH)
    //  customValues - an array of custom values used to convey additional information
    //  stakeholders - an array of additional address used to provide additional relevant addresses
    function accessRequest( //Left for backward compatibility
        uint8 level,
        string pkeRequestor,
        string pkeAFGH,
        bytes32[] customValues,
        address[] stakeholders
    )
    public payable returns (uint256) {
        accessRequestV3(customValues, stakeholders);
        emit AccessRequest(requestID, 0, objectHash, pkeRequestor, pkeAFGH);
        return requestID;
    }

    function validateAccess(address accessor, bytes32[] custom_values, address[] stakeholders) internal {
        uint256 requiredFund;
        uint8 visibilityCode;
        uint8 accessCode;

        (visibilityCode, accessCode, requiredFund) = getAccessInfoV3(accessor, custom_values, stakeholders);

        if (accessCode == 100) { //Check if request is funded, except if user is owner or has paid already
            require(msg.value >= uint(requiredFund));
            setPaidRights();
            accessCode = 0;
        }
        require(accessCode == 0);
    }

    function accessRequestInternal(
        bytes32 requestNonce,
        bytes32[] custom_values,
        address[] stakeholders,
        bytes32 contextHash,
        address accessor,
        uint256 request_timestamp
    )
    internal returns (bytes32) {

        validateAccess(accessor, custom_values, stakeholders);

        if (contentContractAddress != 0x0) {
            Content c = Content(contentContractAddress);
            uint result = c.runAccess(requestNonce, custom_values, stakeholders, accessor);
            require(result == 0);
        }

        // Raise Event
        emit AccessRequestV3(requestNonce, libraryAddress, contextHash, accessor, request_timestamp);

        // Logs custom key/value pairs
        uint256 i;
        for (i = 0; i < custom_values.length; i++) {
            if (custom_values[i] != 0x0) {
                emit AccessRequestValue(custom_values[i]);
            }
        }
        for (i = 0; i < stakeholders.length; i++) {
            if (stakeholders[i] != 0x0) {
                emit AccessRequestStakeholder(stakeholders[i]);
            }
        }

        return requestNonce;
    }


    function accessCompleteInternal(bytes32 requestNonce, bytes32[] customValues, address[] stakeholders) public payable returns (bool) {
        bool success = true;
        if (contentContractAddress != 0x0) {
            Content c = Content(contentContractAddress);
            uint256 result = c.runFinalize(requestNonce, customValues, stakeholders, msg.sender);
            success = (result == 0);
        }
        return success;
    }

    function accessCompleteContext(
        bytes32 _requestNonce,
        bytes32 _contextHash,
        address _accessor,
        uint256 _request_timestamp
        ) public payable returns (bool) {

        require(tx.origin == addressKMS);
        bytes32[] memory emptyVals;
        address[] memory emptyAddrs;
        bool success = accessCompleteInternal(_requestNonce,  emptyVals, emptyAddrs);

        emit AccessCompleteV3(_requestNonce, success, libraryAddress, _contextHash, _accessor, _request_timestamp);
        return success;
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
    function accessCompleteV3(bytes32 requestNonce, bytes32[] customValues, address[] stakeholders) public payable returns (bool) {
        RequestData storage r = requestMap[requestNonce];
        require((r.originator != 0x0) && ((msg.sender == r.originator) || (msg.sender == owner)));

        bool success = accessCompleteInternal(requestNonce, customValues, stakeholders);

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
                makeRequestPayment(requestNonce, r.originator, "refund", r.amountPaid - r.settled);
            } else {
                //if access was not granted and no error was registered, escrow is released to the owner
                makeRequestPayment(requestNonce, owner, "release escrow", r.amountPaid - r.settled);
            }
        }
        delete requestMap[requestNonce];
        // record to event
        emit AccessCompleteV3(requestNonce, success, libraryAddress, 0x0, msg.sender, now * 1000);
        return success;
    }
    function accessComplete(uint256 request_ID, uint256 score_pct, bytes32 /*ml_out_hash*/) public payable returns (bool) {
        bytes32 requestNonce = makeNonce(requestID);
        bytes32[] memory emptyVals;
        address[] memory emptyAddrs;
        bool success = accessCompleteV3(requestNonce, emptyVals, emptyAddrs);
        emit AccessComplete(request_ID, score_pct, success);
        return success;
    }


    function kill() public onlyFromLibrary {
        uint canKill = 0;
        if (contentContractAddress != 0x0) {
            canKill = Content(contentContractAddress).runKillExt();
        }
        require((canKill == 0) || (canKill == 100) || (canKill == 1000) || (canKill == 1100));
        if (canKill < 1000) { //1000 and 1100 imply bypass of normal validation rules
          require((tx.origin == owner) || Container(libraryAddress).canEdit());
        }
        if ((canKill == 100) || (canKill == 1100)){
            Content(contentContractAddress).commandKill();
        }
        selfdestruct(owner);
    }

    function setPaidRights() private {
        address walletAddress = IUserSpace(contentSpace).userWallets(msg.sender);
        AccessIndexor indexor = AccessIndexor(walletAddress);
        indexor.setAccessRights();
    }
/*
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
*/

}
