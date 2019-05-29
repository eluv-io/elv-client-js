pragma solidity 0.4.24;

import {Ownable} from "./ownable.sol";
import {Accessible} from "./accessible.sol";
import {Editable} from "./editable.sol";
import {BaseAccessControlGroup} from "./base_access_control_group.sol";
import {BaseContentType} from "./base_content_type.sol";
import {BaseLibrary} from "./base_library.sol";
import {BaseContent} from "./base_content.sol";
import {BaseAccessWalletFactory} from "./base_access_wallet.sol";
import {BaseAccessWallet} from "./base_access_wallet.sol";
import {AccessIndexor} from "./access_indexor.sol";
import {Container} from "./container.sol";
import "./user_space.sol";
import "./node_space.sol";
import "./node.sol";
import "./meta_object.sol";

/* -- Revision history --
BaseContentSpace20190221114100ML: First versioned released
BaseContentSpace20190319194900ML: Requires 0.4.24
BaseContentSpace20190320114200ML: Adding support for user-wallet
BaseContentSpace20190506153400ML: Moves dependant creation to factories, requires factory to be set after instantiation
BaseContentSpace20190510150900ML: Moves content creation from library to a dedicated content space factory
BaseContentSpace20190528193500ML: Moves node management to a parent class (NodeSpace)
*/


contract BaseContentSpace is MetaObject, Accessible, Container, UserSpace, NodeSpace {

    bytes32 public version ="BaseContentSpace20190528193500ML"; //class name (max 16), date YYYYMMDD, time HHMMSS and Developer initials XX

    string public name;
    string public description;
    address public factory;
    address public walletFactory;
    address public libraryFactory;
    address public contentFactory;

    address public guarantor;

    mapping(address => address) public nodeMapping;


    event CreateContentType(address contentTypeAddress);
    event CreateLibrary(address libraryAddress);
    event CreateGroup(address groupAddress);
    event CreateContent(address contentAddress);
    event CreateAccessWallet(address wallet);

    event EngageAccountLibrary(address accountAddress);
    event SetFactory(address factory);

    event RegisterNode(address nodeObjAddr);
    event UnregisterNode(address nodeObjAddr);


    constructor(string memory content_space_name) public {
        name = content_space_name;
        contentSpace = address(this);
    }

    function setFactory(address new_factory) public onlyOwner {
        factory = new_factory;
    }

    function setWalletFactory(address new_factory) public onlyOwner {
        walletFactory = new_factory;
    }

    function setLibraryFactory(address new_factory) public onlyOwner {
        libraryFactory = new_factory;
    }

    function setContentFactory(address new_factory) public onlyOwner {
        contentFactory = new_factory;
    }

    function setGuarantor(address _guarantor) public onlyOwner {
        guarantor = _guarantor;
    }

    function setDescription(string memory content_space_description) public onlyOwner {
        description = content_space_description;
    }


    // used to create a node contract instance. should be called by the address of the node that wishes to register.
    function registerSpaceNode() public returns (address) {
        require(nodeMapping[msg.sender] == 0x0); // for now can't re-register (or replace) node instance
        uint i = 0;
        for (; i < activeNodeAddresses.length; i++) {
            if (activeNodeAddresses[i] == msg.sender) {
                break;
            }
        }
        require(i < activeNodeAddresses.length); // node should be in active list
        address nodeAddr = BaseFactory(factory).createNode(msg.sender);
        nodeMapping[msg.sender] = nodeAddr;
        emit RegisterNode(nodeAddr);
        return nodeAddr;
    }

    function unregisterSpaceNode() public returns (bool) {
        require(nodeMapping[msg.sender] != 0x0);
        address nodeAddr = nodeMapping[msg.sender];
        delete nodeMapping[msg.sender];
        Node(nodeAddr).kill();
        emit UnregisterNode(nodeAddr);
    }


    function createContentType() public returns (address) {
        address contentTypeAddress = BaseFactory(factory).createContentType();
        emit CreateContentType(contentTypeAddress);
        return contentTypeAddress;
    }

    function createLibrary(address address_KMS) public returns (address) {
        address libraryAddress = BaseLibraryFactory(libraryFactory).createLibrary(address_KMS);
        emit CreateLibrary(libraryAddress);
        return libraryAddress;
    }

    function createContent(address lib, address content_type) public returns (address) {
        address contentAddress = BaseContentFactory(contentFactory).createContent(lib, content_type);
        emit CreateContent(contentAddress);
        return contentAddress;
    }

    function createGroup() public returns (address) {
        address groupAddress = BaseFactory(factory).createGroup();
        emit CreateGroup(groupAddress);
        return groupAddress;
    }

    function engageAccountLibrary() public returns (address) {
        emit EngageAccountLibrary(tx.origin);
    }

    function createAccessWallet() public returns (address) {
        return createUserWallet(tx.origin);
    }

    //This methods revert when attempting to transfer ownership, so for now we make it private
    // Hence it will be assumed, that user are responsible for creating their wallet.
    function createUserWallet(address user) private returns (address) {
        require(userWallets[user] == 0x0);
        address walletAddress = BaseAccessWalletFactory(walletFactory).createAccessWallet();
        if (user != tx.origin) {
            BaseAccessWallet wallet = BaseAccessWallet(walletAddress);
            wallet.transferOwnership(user);
        }
        emit CreateAccessWallet(walletAddress);
        userWallets[user] = walletAddress;
        return walletAddress;
    }

    function getAccessWallet() public returns(address) {
        if (userWallets[tx.origin] == 0x0) {
            return createAccessWallet();
        } else {
            return userWallets[tx.origin];
        }
    }

    /* removed as the createUserWallet does not work for creating wallet on behalf of a user
    // Not sure we want that, if so it might have to be restricted -- to be thought through
    function getUserWallet(address user) public returns(address) {
        if (userWallets[user] == 0x0) {
            return createUserWallet(user);
        } else {
            return userWallets[user];
        }
    }
    */


}

/* -- Revision history --
BaseFactory20190227170400ML: First versioned released
BaseFactory20190301105700ML: No changes version bump to test
BaseFactory20190319195000ML: with  0.4.24 migration
BaseFactory20190506153000ML: Split createLibrary out, adds access indexing
*/

contract BaseFactory is Ownable {

    bytes32 public version ="BaseFactory20190506153000ML"; //class name (max 16), date YYYYMMDD, time HHMMSS and Developer initials XX

    function createContentType() public returns (address) {
        address newType = (new BaseContentType(msg.sender));
        // register library in user wallet
        BaseContentSpace contentSpaceObj = BaseContentSpace(msg.sender);
        address walletAddress = contentSpaceObj.getAccessWallet();
        BaseAccessWallet userWallet = BaseAccessWallet(walletAddress);
        userWallet.setContentTypeRights(newType, userWallet.TYPE_EDIT(), userWallet.ACCESS_CONFIRMED());
        return newType;
    }

    function createGroup() public returns (address) {
        address newGroup = (new BaseAccessControlGroup(msg.sender));
        // register library in user wallet
        BaseContentSpace contentSpaceObj = BaseContentSpace(msg.sender);
        address walletAddress = contentSpaceObj.getAccessWallet();
        BaseAccessWallet userWallet = BaseAccessWallet(walletAddress);
        userWallet.setAccessGroupRights(newGroup, userWallet.TYPE_EDIT(), userWallet.ACCESS_CONFIRMED());
        return newGroup;
    }

    function createNode(address _owner) public returns (address) {
        Node n = new Node(); // this sets owner to tx.origin?
        require(n.owner() == _owner);
        return address(n);
    }
}


/* -- Revision history --
BaseFactory20190506153100ML: Split out of BaseFactory, adds access indexing
*/

contract BaseLibraryFactory is Ownable {

    bytes32 public version ="BaseLibFactory20190506153200ML"; //class name (max 16), date YYYYMMDD, time HHMMSS and Developer initials XX

    function createLibrary(address address_KMS) public returns (address) {
        address newLib = (new BaseLibrary(address_KMS, msg.sender));
        // register library in user wallet
        BaseContentSpace contentSpaceObj = BaseContentSpace(msg.sender);
        address walletAddress = contentSpaceObj.getAccessWallet();
        BaseAccessWallet userWallet = BaseAccessWallet(walletAddress);
        userWallet.setLibraryRights(newLib, userWallet.TYPE_EDIT(), userWallet.ACCESS_CONFIRMED());
        return newLib;
    }
}


/* -- Revision history --
BaseCtFactory20190509171900ML: Split out of BaseLibraryFactory
*/

contract BaseContentFactory is Ownable {

    bytes32 public version ="BaseCtFactory20190509171900ML"; //class name (max 16), date YYYYMMDD, time HHMMSS and Developer initials XX

    function createContent(address lib, address content_type) public  returns (address) {
        Container libraryObj = Container(lib);
        require(libraryObj.canContribute(tx.origin)); //check if sender has contributor access
        require(libraryObj.validType(content_type));

        BaseContent content = new BaseContent(msg.sender, lib, content_type);
        content.setAddressKMS(libraryObj.addressKMS());
        content.setContentContractAddress(libraryObj.contentTypeContracts(content_type));

        // register object in user wallet
        BaseContentSpace contentSpaceObj = BaseContentSpace(msg.sender);
        address walletAddress = contentSpaceObj.getAccessWallet();
        AccessIndexor userWallet = AccessIndexor(walletAddress);
        userWallet.setContentObjectRights(address(content), userWallet.TYPE_EDIT(), userWallet.ACCESS_CONFIRMED());

        return address(content);
    }
}
