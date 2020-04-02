pragma solidity 0.4.24;

import {Ownable} from "./ownable.sol";
import {Container} from "./container.sol";
import {BaseContent} from "./base_content.sol";
import {IKmsSpace, INodeSpace} from "./base_space_interfaces.sol";
import "./access_indexor.sol";
import "./transactable.sol";
import {ExternalUserWallet} from "./external_user_wallet.sol";

/* -- Revision history --
BaseAccessWallet20190320114000ML: First versioned released
BaseAccessWallet20190506154400ML: Adds instantiation via factory, adds access indexing
BaseAccessWallet20190510151100ML: Supports modified getAccessInfo API
BaseAccessWallet20190528124400ML: Change base to be Accessible and Editable (thru Container)
BsAccessWallet20190611120000PO: State channel support 
BsAccessWallet20191203102900ML: Bumped up to reflect change in the access_indexor code
*/

// abigen --sol base_access_wallet.sol --pkg=contracts --out build/base_access_wallet.go

contract BaseAccessWallet is Container, AccessIndexor, Transactable {
    bytes32 public version = "BsAccessWallet20191203102900ML"; //class name (max 16), date YYYYMMDD, time HHMMSS and Developer initials XX

    constructor(address content_space)  public payable {
        contentSpace = content_space;
    }

    function canConfirm() public view returns (bool) {
        INodeSpace bcs = INodeSpace(contentSpace);
        return bcs.canNodePublish(msg.sender);
    }

    // WIP - state channel support

    // the most recent timestamp that has been recorded for this channel
    // this only defines a flow of valid timestamps for the channel since it is the last timestamp that was recorded
    //  to the blockchain.
    uint256 public currentTimestamp;

    // TODO: not sure if this is necessary - there should be a default accessor for currentTimestamp?
    function validateTimestamp(uint256 _ts) public view returns (bool) {
        if (_ts > currentTimestamp)
            return true;
        return false;
    }

    function validateTransaction(uint8 _v, bytes32 _r, bytes32 _s, address _dest, uint256 _value, uint256 _ts)
    public
    view
    returns (bool) {
        bytes32 checkHash = keccak256(abi.encodePacked(address(this), _dest, _value, _ts));
        address checkAddr = ecrecover(checkHash, _v, _r, _s);
        if (checkAddr != owner) return false;
        return true;
    }

    event ExecStatus(address guarantor, int code);

    int public constant execStatusOk = 0;
    int public constant execStatusNonceFail = 1;
    int public constant execStatusBalanceFail = 2;
    int public constant execStatusSigFail = 3;
    int public constant execStatusSendFail = 4;

    function execute(address _guarantor, uint8 _v, bytes32 _r, bytes32 _s, address _dest, uint256 _value, uint256 _ts)
    external
    returns (bool) {

        IKmsSpace spc = IKmsSpace(contentSpace);
        require(msg.sender == contentSpace || spc.checkKMSAddr(msg.sender) > 0);
        require(spc.checkKMSAddr(_guarantor) > 0);

        if (_ts <= currentTimestamp) {
            emit ExecStatus(_guarantor, execStatusNonceFail);
            return false;
        }

        if (address(this).balance < _value) {
            emit ExecStatus(_guarantor, execStatusBalanceFail);
            return false;
        }

        // this check should not really fail because the _guarantor should have at least validated the transaction before
        //  accepting it into a batch.
        bool checkTrans = validateTransaction(_v, _r, _s, _dest, _value, _ts);
        if (!checkTrans) {
            emit ExecStatus(_guarantor, execStatusSigFail);
            return false;
        }

        currentTimestamp = _ts;

        // TODO: for a content access request there might be other data we want to pass ...?
        bool sent = _dest.send(_value);
        if (!sent) {
            emit ExecStatus(_guarantor, execStatusSendFail);
            return false;
        }

        emit ExecStatus(_guarantor, execStatusOk);

        return true;
    }
}


/* -- Revision history --
BsAccWltFactory20190506154200ML: First versioned released
*/

contract BaseAccessWalletFactory is Ownable {

    bytes32 public version ="BsAccWltFactory20190506154200ML"; //class name (max 16), date YYYYMMDD, time HHMMSS and Developer initials XX

    function createAccessWallet() public returns (address) {
        return (new BaseAccessWallet(msg.sender));
    }
}
