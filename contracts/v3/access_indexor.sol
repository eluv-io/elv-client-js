pragma solidity 0.4.24;

import "./ownable.sol";
import {IUserSpace} from "./base_space_interfaces.sol";

/* -- Revision history --
AccessIndexor20190423111800ML: First versioned release
AccessIndexor20190510150600ML: Removes debug events
AccessIndexor20190528194200ML: Removes contentSpace is field as it is now inherited from Ownable
AccessIndexor20190605162000ML: Adds cleanUp functions to remove references to dead objects
AccessIndexor20190722214200ML: Fix false positive for group-based rights when object owner match group owner
AccessIndexor20190801141000ML: Adds method to provide ACCESS right to the caller object
AccessIndexor20191113202400ML: Ensures accessor has at least access right to a group to benefit from group rights
AccessIndexor20200110100200ML: Removes debug events
AccessIndexor20200204144400ML: Fixes lookup of group based rights to check group membership vs. visibility only
AccessIndexor20200316121400ML: replaces entity-specific set and check rights with generic one that uses index-type
*/


contract AccessIndexor is Ownable {

    bytes32 public version = "AccessIndexor20200316121400ML";

    event RightsChanged(address principal, address entity, uint8 aggregate);

    uint8 public CATEGORY_CONTENT_OBJECT = 1;
    uint8 public CATEGORY_GROUP = 2;
    uint8 public CATEGORY_LIBRARY = 3;
    uint8 public CATEGORY_CONTENT_TYPE = 4;
    uint8 public CATEGORY_CONTRACT = 5;

    uint8 public constant TYPE_SEE = 0;
    uint8 public constant TYPE_ACCESS = 1;
    uint8 public constant TYPE_EDIT = 2;
    uint8 public constant ACCESS_NONE = 0; // No access
    uint8 public constant ACCESS_TENTATIVE = 1; //access was granted, but not accepted by recipient
    uint8 public constant ACCESS_CONFIRMED = 2; //access was granted and accepted by recipient
    uint8[3] ranking = [1,10,100];

    struct AccessIndex {
        uint8 category;
        mapping (address => uint8) rights; // rights map for a given object address
        address[] list; // All items for which rights are known
        uint256 length; // Number of items listed
    }

    //mapping (address => uint8) libraryRights;
    //address[] libraryList;
    AccessIndex public libraries; // = AccessIndex(libraryRights, libraryList, 0);
    AccessIndex public contentObjects;
    AccessIndex public accessGroups;
    AccessIndex public contentTypes;
    AccessIndex public contracts;
    AccessIndex public others;

    mapping(uint8 => AccessIndex) private accessIndexes;

    constructor() public payable {
        libraries.category = CATEGORY_LIBRARY;
        accessGroups.category = CATEGORY_GROUP;
        contentObjects.category = CATEGORY_CONTENT_OBJECT;
        contentTypes.category = CATEGORY_CONTENT_TYPE;
        contracts.category = CATEGORY_CONTRACT;
    }


    function getAccessIndex(uint8 indexCategory) private returns (AccessIndex storage) {
        if (indexCategory == CATEGORY_CONTENT_OBJECT) {
            return contentObjects;
        }
        if (indexCategory == CATEGORY_GROUP) {
            return accessGroups;
        }
        if (indexCategory == CATEGORY_LIBRARY) {
            return libraries;
        }
        if (indexCategory == CATEGORY_CONTRACT) {
            return contracts;
        }
        if (indexCategory == CATEGORY_CONTENT_TYPE) {
            return contentTypes;
        }
        return others;
    }

    function setContentSpace(address content_space) public onlyOwner {
        contentSpace = content_space;
    }

    /*
    function setLibraryRights(address lib, uint8 access_type, uint8 access) public  {
        setRightsInternal(libraries, lib, access_type, access);
    }

    function setAccessGroupRights(address group, uint8 access_type, uint8 access) public  {
        setRightsInternal(accessGroups, group, access_type, access);
    }

    function setContentObjectRights(address obj, uint8 access_type, uint8 access) public  {
        setRightsInternal(contentObjects, obj, access_type, access);
    }

    function setContentTypeRights(address obj, uint8 access_type, uint8 access) public  {
        //setRightsInternal(contentTypes, obj, access_type, access);
        //setRightsInternal(accessIndexes[CATEGORY_CONTENT_TYPE], obj, access_type, access);
        setRightsInternal(getAccessIndex(CATEGORY_CONTENT_TYPE), obj, access_type, access);
    }

    function setContractRights(address obj, uint8 access_type, uint8 access) public  {
        setRightsInternal(contracts, obj, access_type, access);
    }

    */

    /*
    function checkLibraryRights(address lib, uint8 access_type) public view returns(bool) {
        return checkRights(CATEGORY_LIBRARY, lib, access_type);
    }

    function checkAccessGroupRights(address group, uint8 access_type) public view returns(bool) {
        return checkRights(CATEGORY_GROUP, group, access_type);
    }

    function checkContentObjectRights(address obj, uint8 access_type) public view returns(bool) {
        return checkRights(CATEGORY_CONTENT_OBJECT, obj, access_type);
    }

    function checkContentTypeRights(address obj, uint8 access_type) public view returns(bool) {
        return checkRights(CATEGORY_CONTENT_TYPE, obj, access_type);
    }

    function checkContractRights(address obj, uint8 access_type) public view returns(bool) {
        return checkRights(CATEGORY_CONTRACT, obj, access_type);
    }
    */

    function getLibraryRights(address lib) public view returns(uint8) {
        return libraries.rights[lib];
    }

    function getLibrariesLength() public view returns(uint256) {
        return libraries.length;
    }

    function getLibrary(uint256 position) public view returns(address) {
        return libraries.list[position];
    }

    function getAccessGroupRights(address group) public view returns(uint8) {
        return accessGroups.rights[group];
    }

    function getAccessGroupsLength() public view returns(uint256) {
        return accessGroups.length;
    }

    function getAccessGroup(uint256 position) public view returns(address) {
        return accessGroups.list[position];
    }

    function getContentObjectRights(address obj) public view returns(uint8) {
        return contentObjects.rights[obj];
    }

    function getContentObjectsLength() public view returns(uint256) {
        return contentObjects.length;
    }

    function getContentObject(uint256 position) public view returns(address) {
        return contentObjects.list[position];
    }

    function getContentTypeRights(address obj) public view returns(uint8) {
        return contentTypes.rights[obj];
    }

    function getContentTypesLength() public view returns(uint256) {
        return contentTypes.length;
    }

    function getContentType(uint256 position) public view returns(address) {
        return contentTypes.list[position];
    }

    function getContractRights(address obj) public view returns(uint8) {
        return contracts.rights[obj];
    }

    function getContractsLength() public view returns(uint256) {
        return contracts.length;
    }

    function getContract(uint256 position) public view returns(address) {
        return contracts.list[position];
    }

    function hasManagerAccess(address candidate) public view returns (bool) {
        return (candidate == owner);
    }

    function checkDirectRights(uint8 index_type, address obj, uint8 access_type) public view returns(bool) {
        if (index_type != 0) {
            return checkRawRights(getAccessIndex(index_type), obj, access_type);
        }
        return false;
    }

    function checkRawRights(AccessIndex storage index, address obj, uint8 access_type) private view returns(bool) {
        uint8 currentAggregate = index.rights[obj];
        return (currentAggregate >= ranking[access_type]);
    }

    function checkRights(uint8 index_type, address obj, uint8 access_type) public view returns(bool) {
        Ownable instance = Ownable(obj);
        if (instance.owner() == owner){
            return true;
        }
        bool directRights = checkDirectRights(index_type, obj, access_type);
        if (directRights == true) {
            return true;
        }
        if (index_type != CATEGORY_GROUP){
            AccessIndexor groupObj;
            address group;
            for (uint i = 0; i < accessGroups.length; i++) {
                group = accessGroups.list[i];
                if ((group != 0x0) && (accessGroups.rights[group] >= 1)) {
                    groupObj = AccessIndexor(group);
                    //needs to be at least a member, seeing is not enough  (not using hasAccess on group to avoid circular reference)
                    if (((groupObj.owner() == owner) || (accessGroups.rights[group] >= 10 )) && groupObj.checkDirectRights(index_type, obj, access_type) == true) {
                        return true;
                    }
                }
            }
        }
        return false;
    }


    // Provides ACCESS right to the caller object
    function setAccessRights() public  {
        address obj = msg.sender;
        uint8 currentAggregate = contentObjects.rights[obj];
        uint8[3] memory currentRights;
        currentRights[0] = currentAggregate % 10;
        currentRights[1] = currentAggregate % 100 - currentRights[0];
        currentRights[2] = currentAggregate - currentRights[1] - currentRights[0];

        currentRights[TYPE_ACCESS] = ACCESS_CONFIRMED * ranking[TYPE_ACCESS]; //Set access to confirmed

        uint8 newAggregate = currentRights[0] + currentRights[1] + currentRights[2];
        contentObjects.rights[obj] = newAggregate;

        //add to array if newly added
        if ((newAggregate != 0) && (currentAggregate == 0)) {
            addToList(contentObjects, obj);
        }
        emit RightsChanged(address(this), obj, newAggregate);
    }


    function setRights(uint8 indexType, address obj, uint8 access_type, uint8 access) public  {
        if (indexType != 0) {
            setRightsInternal(getAccessIndex(indexType),  obj,  access_type,  access);
        }
    }


        // Indexor managers can revoke anything
    // Indexor managers can confirm tentative
    // Object rights holders can grant tentative
    // Object rights holders can revoke
    // Object rights holders can grant confirm if they are also Wallet manager
    //access is either ACCESS_NONE (0), or any uint8 > 0, the current rights and privilege of granter and grantee will drive the new rights values
    function setRightsInternal(AccessIndex storage index, address obj, uint8 access_type, uint8 access) private  {
        bool isIndexorManager = hasManagerAccess(tx.origin);
        bool isObjRightHolder = false;
        IUserSpace space = IUserSpace(contentSpace);
        address walletAddress = space.userWallets(tx.origin);
        AccessIndexor wallet = AccessIndexor(walletAddress);
        isObjRightHolder = wallet.checkRights(index.category, obj, TYPE_EDIT);

        uint8 currentAggregate = index.rights[obj];
        uint8[3] memory currentRights;
        currentRights[0] = currentAggregate % 10;
        currentRights[1] = currentAggregate % 100 - currentRights[0];
        currentRights[2] = currentAggregate - currentRights[1] - currentRights[0];

        bool operationAuthorized = false;
        uint8 targetAccess = access;

        // Indexor managers can revoke anything, Object rights holders can revoke
        if ((access == ACCESS_NONE) && (isIndexorManager ||  isObjRightHolder)) {
            operationAuthorized = true;
        }

        // Indexor managers can confirm tentative
        if ((access != ACCESS_NONE) && isIndexorManager && (currentRights[access_type] == ACCESS_TENTATIVE)) {
            operationAuthorized = true;
            targetAccess = ACCESS_CONFIRMED;
        }

        // Object rights holders can grant tentative
        if ((access != ACCESS_NONE) && isObjRightHolder && (currentRights[access_type] != ACCESS_CONFIRMED)){
            operationAuthorized = true;
            targetAccess = ACCESS_TENTATIVE;
         }

        // Object rights holders can grant confirm if they are also Wallet manager
        if ((access != ACCESS_NONE) && isIndexorManager && isObjRightHolder) {
            operationAuthorized = true;
            targetAccess = ACCESS_CONFIRMED;
        }

        require(operationAuthorized);

        currentRights[access_type] = targetAccess * ranking[access_type];

        uint8 newAggregate = currentRights[0] + currentRights[1] + currentRights[2];
        index.rights[obj] = newAggregate;

        //add to array if newly added
        if ((newAggregate != 0) && (currentAggregate == 0)) {
            addToList(index, obj);
        }

        //remove from array if removed
        if (newAggregate == 0) {
            removeFromList(index, obj);
        }

        emit RightsChanged(address(this), obj, newAggregate);
    }

    function addToList(AccessIndex storage index, address obj) private {
        if (index.length < index.list.length) {
            index.list[index.length] = obj;
        } else {
            index.list.push(obj);
        }
        index.length++;
    }

    function removeFromList(AccessIndex storage index, address obj) private returns (bool) {
        for (uint i = 0; i < index.length; i++) {
            if (index.list[i] == obj) {
                delete index.list[i];
                if (i != (index.length - 1)) {
                    index.list[i] = index.list[index.length - 1];
                    delete index.list[index.length - 1];
                }
                index.length--;
                return true;
            }
        }
        return false;
    }

    function contractExists(address addr) public view returns (bool) {
        uint size;
        assembly {
            size := extcodesize(addr)
        }
        return (size > 0);
    }

    //event dbgAddress(string label, uint index, address a);
    function cleanUp(AccessIndex storage index) private returns (uint) {
        uint cleansedCount = 0;
        uint i = 0;
        while (i < index.length) {
            if (contractExists(index.list[i]) == false) {
                //emit dbgAddress("dead", i, index.list[i]);
                delete index.list[i];
                cleansedCount++;
                if (i != (index.length - 1)) {
                    index.list[i] = index.list[index.length - 1];
                    delete index.list[index.length - 1];
                }
                index.length--;
            } else {
                //emit dbgAddress("alive", i, index.list[i]);
                i++;
            }
        }
        return cleansedCount;
    }

    function cleanUpLibraries() public returns (uint) {
        return cleanUp(libraries);
    }

    function cleanUpAccessGroups() public returns (uint) {
        return cleanUp(accessGroups);
    }

    function cleanUpContentObjects() public returns (uint) {
        return cleanUp(contentObjects);
    }

    function cleanUpContentTypes() public returns (uint) {
        return cleanUp(contentTypes);
    }

    function cleanUpAll() public returns (uint, uint, uint, uint, uint) {
        return (cleanUp(libraries), cleanUp(accessGroups), cleanUp(contentObjects), cleanUp(contentTypes), cleanUp(contracts));
   }
}
