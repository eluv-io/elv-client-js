pragma solidity ^0.4.21;

//
// This contract tracks multimarket credits of a client, and allows for
// purchases in one market (e.g. event tickets) to yield credits for access to
// content (e.g N ticket purchases allows free content access) and v.versa
// (N content accesses allows free tickets).
// If there is not enough credit for free access the transaction is charged
// at the configured charge rate.
//
contract CustomContract {
    struct RedeemRequest {
        address id; // client address requesting
        string redeemCurrency;
        uint256 numTokens; // number of token to be redeemed
        string payTo;
        string nonce;
        bool valid; // to distinguish non-existing objects
    }
    RedeemRequest[]  redeemRequests;
    uint256 redeemRequestsLength = 0;
    uint256 maxCredit = 10;

    struct ApprovalRequest {
        string content_hash; // content hash request is for
        string lib_id; // content id request is for
        address submitter; // person who submitted the webisode
        uint8 percent_complete; // percent of the total expected complete
        bool valid; // to distinguish non-existing objects
    }
    ApprovalRequest[] approvalRequests;
    uint256 approvalRequestsLength = 0;

    struct ClientObject {
        address id; // client address requesting
        uint accessCount; // number of content accesses
        uint eventCount; // number of event accesses (tickets) purchased
        // internal elements
        bool valid; // to distinguish non-existing objects
        uint256 keyIndex; // index in the 'key list'
    }
    struct KeyElement {
        address key;
        bool valid; // set to 'false' when the element is deleted
    }

    address creator;
    uint256 eventCreditQuota; // number of event purchases for content to be free
    uint256 accessCreditQuota; // number of content accesses for event ticket to be free
    uint256 eventCharge; // ticket charge
    string tokenCurrency;
    uint256 tokenValue;

    function () public payable {
    }

    // hashmap of Client Object addresses to Obj
    mapping( address => ClientObject ) clientObjects; // keymap
    KeyElement[] clientObjectKeys; // key list; required to iterate
    event ClientObjectCreate(address id);
    event RedeemTokenRequest(uint256 numtokens, string pay_to, string nonce);
    event RedeemTokenExecuted(string currency, uint256 value, string payment_proof, string nonce);
    event SetTokenValue(string currency, uint256 value);
    event ApproveContentRequest(string content_hash, string lib_id, address submitter, uint8 percent_complete);
    event ApproveContentExecuted(string content_hash, string lib_id, address submitter,
        uint8 percent_complete, bool approved, string note);

    // Debug events
    event CustomMultimarket();
    event BuyEventTicket(uint number, uint256 charge, uint256 value);
    event RegisterConsumer(address consumer_address);
    event ConsumerEventCount(uint256 count);
    event SetEventCreditQuota(uint256 new_value);
    event SetEventCharge(uint256 new_value);
    event SetAccessCreditQuota(uint256 new_value);
    event InsufficientFunds(uint256 charge, uint256 value);
    event MultimarketPreHook(uint256 charge, uint256 value);
    event ConsumerAccessCount(uint256 count);
    event QuotaNotMet(uint256 count, uint256 required, string msg);
    event QuotaMet(uint256 count, uint256 required, string msg);
    event PayCredit(string s, address addr, uint256 credit);
    event DbgString(string s);
    event DbgAddress(address a);
    event DbgUint256(uint256 u);
    event DbgUint(uint u);

    function CustomContract() public payable
    {
        creator = msg.sender;
    }
    // Create a 'ClientObject'
    function clientCreate( address sender ) private returns (address id)
    {
       emit RegisterConsumer(sender);
         // 0 requests, and position 0 in keyIndex
         ClientObject memory o = ClientObject( sender, 0, 0, true, 0 );
         clientObjects[o.id] = o;
         o.keyIndex = clientObjectKeys.push(KeyElement(o.id, true));
         emit ClientObjectCreate(o.id);
         return o.id;
     }
     function setEventCreditQuota(uint256 q) public
     {
         // Only if sender of this transaction is the contract owner
         if (msg.sender == creator) {
             eventCreditQuota = q;
             emit SetEventCreditQuota(eventCreditQuota);
         }
     }
     function getEventCreditQuota() public constant returns (uint256)
     {
         return eventCreditQuota;
     }
     function setAccessCreditQuota(uint256 q) public
     {
         // Only if sender is the contract owner
         if (msg.sender == creator) {
             accessCreditQuota = q;
             emit SetAccessCreditQuota(accessCreditQuota);
         }
     }
     function getAccessCreditQuota() public constant returns (uint256)
     {
         return accessCreditQuota;
     }
     function setEventCharge(uint256 c) public
     {
         // Only if the sender is the contract owner
         if (msg.sender == creator) {
             eventCharge = c;
             emit SetEventCharge(c);
         }
     }
     function getEventCharge() public constant returns (uint256)
     {
         return eventCharge;
     }

    function getAccessCount(address sender) public constant returns (uint)
    {
        ClientObject memory o = clientObjects [ sender ];
        if ( o.id != 0 )
            return o.accessCount;
        else
            return 0;
    }

    function getEventCount(address sender) public constant returns (uint)
    {
        ClientObject memory o = clientObjects [ sender ];
        if ( o.id != 0 )
            return o.eventCount;
        else
            return 0;
    }

    function setLicenseFee(uint256 val) public
    {
        // Only if the sender is the contract owner
        if (msg.sender == creator) {
            maxCredit = val;
        }
    }

    function getLicenseFee() public constant returns (uint256)
    {
        return maxCredit;
    }

     // purchase 'number' of event tickets; increment the count of event purchases for this client
     // if the count of content accesses is less than the quota charge the amount passed
     function buyEventTicket(uint number) public payable returns(uint)
     {
         emit BuyEventTicket(number, eventCharge, msg.value);
         uint result = 0;
         // Do we have this client yet?
         // If not, create a new one
         ClientObject storage o = clientObjects [ msg.sender ];
         if ( o.id == 0 ) {
             clientCreate(msg.sender);
         }
         else {
             // DbgString("Client exists:");
             // DbgAddress(o.id);
         }
         if (o.accessCount < accessCreditQuota) {
             emit QuotaNotMet(o.accessCount, accessCreditQuota, "Access quota not met - charging for tickets");
             //require( value >= charge );
             if (msg.value < eventCharge) {
                 emit InsufficientFunds(eventCharge, msg.value);
                 emit ConsumerEventCount(o.eventCount);
                 return result;
             }
             else {
                // DbgString("Charging:");
                 // DbgUint256(eventCharge);
             }
         }
         else {
             emit QuotaMet(o.accessCount, accessCreditQuota, "Access quota met - free tickets!!!");
         }
         o.eventCount = o.eventCount + number;
         result = 1;
         emit ConsumerEventCount(o.eventCount);
         return result;
     }
     // increment the count of content purchases for this client
     // if the count of event purchases is less than the quota charge the amount passed
     function runAccessPre(address sender, uint256 charge, uint256 value, bytes32[] customKeys, bytes32[] customValues, bytes signature ) public payable returns(uint)
     {
         emit MultimarketPreHook(charge, value);
         uint result = 0;
         //to silence warning
         if ((customKeys.length == customValues.length) && (signature.length == 0)){
           result = 0;
         }
         // Do we have this client yet?
         // If not, create a new one
         ClientObject memory o = clientObjects [ sender ];
         if ( o.id == 0 ) {
             clientCreate(sender);
         }
         else {
             // DbgString("Client exists:");
             // DbgAddress(o.id);
         }
         if(o.eventCount < eventCreditQuota) {
             emit QuotaNotMet(o.eventCount, eventCreditQuota, "Event quota not met - charging access");
             //require( value >= charge );
             if (value < charge) {
                 emit InsufficientFunds(charge, value);
                 emit ConsumerAccessCount(o.accessCount);
                 return result;
             }
             else {
                 // DbgString("Charging for Access:");
                 // DbgUint256(charge);
             }
         }
         else {
             emit QuotaMet(o.eventCount, eventCreditQuota, "Event quota met - free access!!!");
         }
         o.accessCount = o.accessCount + 1;
         result = 1;
         emit ConsumerAccessCount(o.accessCount);
         return result;
     }
     function runAccessPost() pure public returns(uint)
     {
       uint result = 1;
      return result;
     }

    function runFinalize(address sender) pure public returns(bool)
    {
        if (sender != 0) {
            return true;
        } else{
            return true;
        }
    }

    function publishContent(string lib_id, string content_hash, uint8 pct_complete, string signed_verification)
        public payable returns (uint)
    {
        // Check that content is verified via the custom data and add to approval list for review if so
        // Here we check that the signed_verification is valid

        // TODO - CHECK SIGNATURE
        keccak256(signed_verification);

        // Create a new approval request and add to pending list
        ApprovalRequest memory request = ApprovalRequest(content_hash, lib_id, msg.sender, pct_complete, true);
        if (approvalRequestsLength < approvalRequests.length) {
            approvalRequests[approvalRequestsLength] = request;
         }
         else {
             approvalRequests.push(request);
         }
         approvalRequestsLength ++;

         // Log event
         emit ApproveContentRequest(content_hash, lib_id, msg.sender, pct_complete);
         return 0;
    }

    function getPendingApprovalRequest() public constant returns (string, string, address, uint8 )
    {
        // Read and process the first content in the approvalRequests list
        if (approvalRequestsLength == 0) {
            return ("", "", 0, 0);
        }
        ApprovalRequest memory req = approvalRequests[0];
        return (req.content_hash, req.lib_id, req.submitter, req.percent_complete);
    }

    function approveContentExecuted(string lib_id, string content_hash, bool approved, string note) public returns ( uint )
    {
        // credit the account based on the percent_complete
        ApprovalRequest memory req = approvalRequests[0];

        if (keccak256(lib_id) != keccak256(req.lib_id) || keccak256(content_hash) != keccak256(req.content_hash)) {
            emit DbgString("Content details don't match");
        }

        if (approved == true) {
            // req.percent_complete
            if ( (req.percent_complete >=60) && (req.percent_complete < 100)) {
                payCredit(60, req.submitter);
            }
            else if (req.percent_complete == 100) {
                // FIXME - here we need to pay the remainder
                payCredit(40, req.submitter);
            }
        }

        // remove the request from the list
        delete approvalRequests[0];
        approvalRequestsLength --;
        if (approvalRequestsLength > 0) {
            approvalRequests[0] = approvalRequests[approvalRequestsLength];
            delete approvalRequests[approvalRequestsLength];
        }

        // Log event
        emit ApproveContentExecuted(req.content_hash, req.lib_id, req.submitter, req.percent_complete, approved, note);
        return 0;
    }

    function redeemTokenRequest(string payment_account, string tx_nonce) public payable returns (uint)
     {
         //If the request is not backed by a balance
         if (msg.value == 0) {
            return 1;
         }
         RedeemRequest memory request = RedeemRequest(msg.sender, "USD", msg.value, payment_account, tx_nonce, true);
     if (redeemRequestsLength < redeemRequests.length) {
       redeemRequests[redeemRequestsLength] = request;
     } else {
           redeemRequests.push(request);
     }
         redeemRequestsLength ++;
         emit RedeemTokenRequest(msg.value, payment_account, tx_nonce);
         return 0;
     }
     function getPendingRedeemRequest() public constant returns ( address, string, uint256, string, string)
     {
         if (redeemRequestsLength == 0) {
             return (0, "", 0, "", "");
         }
         RedeemRequest memory req = redeemRequests[0];
         return (req.id, req.redeemCurrency, req.numTokens, req.payTo, req.nonce);
     }
     function redeemTokenExecuted(string currency, uint256 value, string payment_proof, string tx_nonce) public returns (uint)
     {
         if (keccak256(redeemRequests[0].nonce) == keccak256(tx_nonce)) {
             delete redeemRequests[0];
             redeemRequestsLength --;
             if (redeemRequestsLength > 0) {
                 redeemRequests[0] = redeemRequests[redeemRequestsLength];
                 delete redeemRequests[redeemRequestsLength];
             }
             emit RedeemTokenExecuted(currency, value, payment_proof, tx_nonce);
             return 0;
         }
         return 1;
     }
     function redeemDbg(uint256 idx) public constant returns (uint256, uint256, string)
     {
         return (redeemRequests.length, redeemRequestsLength, redeemRequests[idx].nonce);
     }
     function setTokenValue(string currency, uint256 value) public
     {
         tokenCurrency = currency;
         tokenValue = value;
         emit SetTokenValue(currency, value);
     }
     function getTokenValue() public constant returns(string, uint256)
     {
         return (tokenCurrency, tokenValue);
     }
     // Pays payee based on the score pct
     function payCredit(uint256 percent, address payee) public {
         // credit the transaction caller
         uint256 amount = maxCredit * percent / 100;
         emit PayCredit("Pay credit: address, amount", payee, amount);
         payee.transfer(amount);
     }
     // Transaction sender ("this client") buys tickets until the ticket quota for free access is reached
     // Calls runAccessPre and shows that the pending charge is free
     /*
     function testBuyTicketsRequestAccess() public payable returns(uint)
     {
         uint r = 0;
         DbgString("EnterTestBuyTicketsFreeAccess. msg.value:");
         DbgUint(msg.value);
         bytes32[] memory customKeys = new bytes32[](4);
         bytes32[] memory customValues = new bytes32[](4);
         customKeys[0] = "content_rating_EU";
         customKeys[1] = "content_rating_NA";
         customKeys[2] = "content_rating_MEA";
         customKeys[3] = "client_region";
         customValues[0] = "FSA_16";
         customValues[1] = "PG-13";
         customValues[2] = "Restricted";
         customValues[3] = "MEA";
         string memory sigstr  = "SIGNATURE 001177";
         // After (2) purchases, make the opposite item free
         setAccessCreditQuota(2);
         setEventCreditQuota(2);
         setEventCharge(10);
         // charge = 10
         // uint number, uint256 charge, uint256 value
         r = buyEventTicket(1);
         uint256 ec = getEventCount(msg.sender);
         DbgString("Client event count:");
         DbgUint256(ec);
         r = runAccessPre(msg.sender, 10, msg.value, customKeys, customValues, bytes(sigstr));
         uint256 ac = getAccessCount(msg.sender);
         DbgString("Client access count:");
        DbgUint256(ac);
        return r;
    }
    */
}
