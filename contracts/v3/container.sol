pragma solidity 0.4.24;
import {Editable} from "./editable.sol";
import {BaseContent} from "./base_content.sol";
import {INodeSpace} from "./node_space.sol";

/**
 * Container
 * The Container contract provides the interface required for an entity to be used as a library of content objects
 */

/* -- Revision history --
Container20190528144600ML: First versioned released
Container20190529091800ML: Remove warning on hasAccess
Container20200316135300ML: Leverages inherited hasAccess
*/


contract Container is Editable {

    bytes32 public version = "Container20200316135300ML"; //class name (max 16), date YYYYMMDD, time HHMMSS and Developer initials XX

    address public addressKMS;

    address[] public contentTypes;
    uint256 public contentTypesLength = 0;
    mapping ( address => address ) public contentTypeContracts;  // custom contracts map


    event ContentTypeAdded(address contentType, address contentContract);
    event ContentTypeRemoved(address contentType);


    function setAddressKMS(address address_KMS) public onlyOwner {
        addressKMS = address_KMS;
    }

    function addContentType(address content_type, address content_contract) public onlyOwner {
        if ((contentTypeContracts[content_type] == 0x0) && (whitelistedType(content_type) == false)) {
            if (contentTypesLength < contentTypes.length) {
                contentTypes[contentTypesLength] = content_type;
            } else {
                contentTypes.push(content_type);
            }
            contentTypesLength = contentTypesLength + 1;
        }
        contentTypeContracts[content_type] = content_contract;
        emit ContentTypeAdded(content_type, content_contract);
    }

    function removeContentType(address content_type) public onlyOwner returns (bool) {
        uint256 latestIndex = contentTypesLength - 1;
        for (uint256 i = 0; i < contentTypesLength; i++) {
            if (contentTypes[i] == content_type) {
                delete contentTypes[i];
                if (i != latestIndex) {
                    contentTypes[i] = contentTypes[latestIndex];
                    delete contentTypes[latestIndex];
                }
                contentTypesLength = latestIndex; //decrease by 1
                delete contentTypeContracts[content_type];
                emit ContentTypeRemoved(content_type);
                return true;
            }
        }
        return false;
    }

    function validType(address content_type) public view returns (bool) {
        if (contentTypesLength == 0){
            return true;
        }
        return whitelistedType(content_type);
    }

    function whitelistedType(address content_type) public view returns (bool) {
        bool isValidType = false;
        for (uint i = 0; i < contentTypesLength; i++) {
            if (contentTypes[i] == content_type) {
                isValidType = true;
            }
        }
        return isValidType;
    }


    function findTypeByHash(bytes32 typeHash) public view returns (address) {
        for (uint i = 0; i < contentTypes.length; i++) {
            Editable contentType = Editable(contentTypes[i]);
            if (keccak256(abi.encodePacked(contentType.objectHash())) == keccak256(abi.encodePacked(typeHash))) {
                return contentTypes[i];
            }
        }
        return 0x0;
    }

    function requiresReview() public view returns (bool) {
        return false;
    }

    // Current implementation ignores rights provided directly to individual
    function canContribute(address _candidate) public constant returns (bool) {
        return ((_candidate == owner) || (msg.sender == owner)); //not sure about the ||
    }

    function canPublish(address _candidate) public view returns (bool) {
        return ((_candidate == owner) || (msg.sender == owner)); //not sure about the ||
    }

    function canReview(address /*_candidate*/) public view returns (bool) {
        return false;
    }

    function publish(address contentObj) public returns (bool) {
        require(msg.sender == contentObj);
        BaseContent content = BaseContent(contentObj);
        content.updateStatus(0); //update status to published
        return (content.statusCode() == 0);
    }

}
