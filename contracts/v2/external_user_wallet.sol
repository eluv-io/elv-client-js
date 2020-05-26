pragma solidity 0.4.24;

import {Ownable} from "./ownable.sol";
import {Editable} from "./editable.sol";
import {Accessible} from "./accessible.sol";

contract ExternalUserWallet is Accessible, Editable {

    address public addressTA; // trusted authority of the user - aka KMS
    address public addressExtUser;

    event CreateExtUserWallet(address contentSpace, address extUserAddr);

    constructor(address _content_space, address _taAddr, address _extUserAddr) public payable {
        contentSpace = _content_space;
        addressTA = _taAddr;
        addressExtUser = _extUserAddr;
        emit CreateExtUserWallet(_content_space, _extUserAddr);
    }

    function claimOwnership() public {
        require(msg.sender == addressExtUser);
        owner = msg.sender;
    }

    // overloads ...
    function canEdit() public view returns (bool) {
        return (msg.sender == owner || msg.sender == addressExtUser);
    }

    function canCommit() public view returns (bool) {
        return (msg.sender == owner || msg.sender == addressExtUser);
    }

    function accessRequest() public returns (bool) {
        require(msg.sender == owner || msg.sender == addressExtUser);
        emit AccessRequest();
        return true;
    }
}