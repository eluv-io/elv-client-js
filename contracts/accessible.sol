pragma solidity ^0.4.11;

import './ownable.sol';

contract Accessible is Ownable {

    address private customContractAddress;
    address public libraryAddress;
    bytes32 private contentHash;

    event ContentObjectCreate(address from, string cid, bytes32 hash);
    event PartAccessRequestHash(bytes32 hash);
    event PartAccessRequestPKE(string pkeRequestor);
    event PartAccessGrantedHash(bytes32 hash);
    event PartAccessGrantedPKB(string pkbRequestor);
    event PartAccessGrantedRK(string reKey);

    // Debug events
    event SetCustomContract(address custom_contract);
    event InvokeCustomPreHook(address custom_contract);
    event ReturnCustomHook(address custom_contract, uint256 result);
    event InvokeCustomPostHook(address custom_contract);
    event AccessRequest(bytes32 content_hash);

    event DbgString(string s);
    event DbgAddress(address a);
    event DbgUint256(uint256 u);
    event DbgUint(uint u);
    event DbgBytes32(bytes32 b);


    // "Fallback" function - necessary if this contract needs to be paid
    function () public payable { }

    // TO BE VERIFIED: Do we need the 'hash' arg or is cid enough
    function Accessible(address containingLibrary, address custom_contract, bytes32 hash, string cid) payable {
	libraryAddress = containingLibrary;
	customContractAddress = custom_contract;
	contentHash = hash;
	emit ContentObjectCreate(msg.sender, cid, hash);
        emit SetCustomContract(customContractAddress);
    }


    function runCustomPreHook( bytes32[] customKeys, bytes32[] customValues, bytes signature ) private returns(uint) {
        emit InvokeCustomPreHook(customContractAddress);
        if (customContractAddress == 0) 
           return 1;
        CustomContract c = CustomContract(customContractAddress);
        uint result = c.runAccessPre(msg.sender, 0, msg.value, customKeys, customValues, signature);
        return result;
    }




    function runCustomPostHook( ) private returns(uint) {
        emit InvokeCustomPostHook(customContractAddress);
        if (customContractAddress == 0) {
           return 1;
        }
        CustomContract c = CustomContract(customContractAddress);
        uint result = c.runAccessPost();
        return result;
    }




    //  cid - is the content id of the content object created
    //  hash - is the  hash of the subobject created for which we are requesting access
    //  pkeRequestor - ephemeral public key of the requestor
    function accessRequest(string cid, bytes32 hash, string pkeRequestor, bytes32[] customKeys, bytes32[] customValues, bytes signature) public payable returns(bool) {
        emit AccessRequest(hash);

        /* can't have that here as it causes issue to stub out the content library object
	ContentLibrary libraryContract = ContentLibrary(libraryAddress);
        if (libraryContract.has_access(msg.sender) == false)
	  return false;
        */

        uint r = runCustomPreHook(customKeys, customValues, signature);

        emit ReturnCustomHook(customContractAddress, r);
        if ( r <= 0 )
           return false;

        // Raise Event
        emit PartAccessRequestHash(hash);
        emit PartAccessRequestPKE(pkeRequestor);

        r = runCustomPostHook();
        emit ReturnCustomHook(customContractAddress, r);
        if ( r <= 0 )
           return false;
        else
           return true;
    }

    function accessGranted(bytes32 hash, string pkbRequestor, string reKey) public returns(bool) {   
        emit PartAccessGrantedHash(hash);
        emit PartAccessGrantedPKB(pkbRequestor);
        emit PartAccessGrantedRK(reKey);
        return true;
    }


}



contract CustomContract {

    /* I don't think we need those declarations as we do not call from here the events of those custom contracts
    event DbgString(string s);
    event DbgAddress(address a);
    event DbgUint256(uint256 u);
    event DbgUint(uint u);
    event DbgBytes32(bytes32 b);
    */

    function runAccessPre(address sender, uint256 charge, uint256 value, bytes32[] customKeys, bytes32[] customValues, bytes signature) public payable returns(uint);
    function runAccessPost() public returns(uint);
    function runFinalize(address sender) public returns(bool);
}

/* can't put that here as it causes double definition error when importing into the library.sol file
contract ContentLibrary {
    function has_access(address candidate) public returns (bool);
}
*/
