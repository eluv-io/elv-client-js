pragma solidity 0.4.21;

import {Content} from "./content.sol";
import {BaseContent} from "./base_content.sol";


contract SampleInstance is Content {

    bytes32 public something;

    function setSomething(bytes32 new_thing) public onlyOwner returns(bytes32) {
        something = new_thing;
        return something;
    }
}


contract SampleInstanceFactory is Content {

    event dbgAddress(string logMsg, address addr);

    bool public centralizedOwnership = false;

    function setCentralizedOwnership(bool centralized_ownership) public onlyOwner returns(bool) {
        centralizedOwnership = centralized_ownership;
        return centralizedOwnership;
    }

    function runCreate() public payable returns (uint) {

        address instanceAddress = new SampleInstance();
        BaseContent contentObj = BaseContent(msg.sender);
        contentObj.setContentContractAddress(instanceAddress);
        if (centralizedOwnership) {
            SampleInstance sampleInstance = SampleInstance(instanceAddress);
            sampleInstance.transferOwnership(owner);
        }

        return 0;
    }


}

