# Eluvio Custom Contracts Overview

In the Eluvio Content Fabric all access control and privileges are managed with Ethereum-compatible smart contracts.
The contracts allow content owners to control all aspects of the content management lifecycle including creation, editing, publishing and end-user access.
Because of it's blockchain architecture novel compensation and incentive structures can also be realized with the platform's cryptocurrency.

The Eluvio Content Fabric provides default, pre-defined contracts that content providers and owners can use to control their content.
These default contracts provide built in customization features through custom contracts.

While different approaches are possible, this document will cover the most common extension, which is providing a custom contract for a content object.

Custom content contracts extend from the provided CustomContract definition:

```
contract CustomContract is Ownable {
    event RunAccessCharge(uint8 level, int256 calculateAccessCharge);
    event RunAccess(uint256 request_ID, uint result);
    event RunFinalize(uint256 request_ID, bool result);
    event RunStatusChange(int proposed_status_code, int return_status_code, int256 licenseFeeToBePaid);
    
    function () public payable { }
    
    // charge, amount paid and address of the originator can all be retrieved from the requestMap using the requestID
    function runAccessCharge(uint8 /* level */, bytes32[] /* customValues */, address[] /* stakeholders */) public returns (int256) {
       return -1; // indicates that the amount is the static one configured in the Content object and no extra calculation is required
    }
    
    function runAccess(uint256 /* request_ID */, uint8 /* level */, bytes32[] /* custom_values */, address[] /* stake_holders */) public payable returns(uint) {
       return 0; //indicates that access request can proceed. Other number can be used as error codes and would stop the processing.
    }
    
    function runFinalize(uint256 /* request_ID */) public returns(bool) {
       return true; //the status is logged in an event at the end of the accessComplete function, behavior is currently unchanged regardless of result.
    }
    
    function runStatusChange(int proposed_status_code) public returns (int, int256) {
       return (proposed_status_code, -1); // a negative number indicates that the licensing fee to be paid is the default
    }   
}
```

Each of the methods can be overridden to change the content management behavior of content objects.
Details of each method are provided below.
Methods that are not implemented in the derived contracts will default to `CustomContract`'s default methods which provide the default fabric behavior.

An example of custom contract is provided in this project in `contracts/custom_content_helloworld.sol`.

The test `test/TestCustomHelloWorld.js` also demonstrates some of the basic custom contract interactions.
Once a custom contract is deployed it can be attached to a content object with the `setCustomContractAddress` method of the content contract.
This is also demonstrated in the test.

Also, `test/TestDeploy.js` demonstrates one method of deploying contracts from JavaScript, which includes deploying a custom contract.
Note that the test will not execute in it's provided form (`TestDeploy() is commented out`) because it most be configured correctly to execute against a running blockchain node.

### Custom Contract Methods

##### runAccessCharge(uint8 level, bytes32[] customValues, address[] stakeholders) public returns (int256)

* Called from `getAccessCharge` method of Content, which is called from `accessRequest`.
* During a content access request, the runAccessCharge method of a custom contract can be used to override the default access 'charge' for the content.
* The `accessRequest` method of the default Content object provides two optional parameters - `bytes32[] customValues` and `address[] stakeholders` - that will be passed into 
   the runAccessCharge invocation to provide additional context for customization.
* If the charge returned by `runAccessCharge` is greater than the amount provided to the access request (`msg.value`) the access is denied.

##### runAccess(uint256 request_ID, uint8 level, bytes32[] custom_values, address[] stake_holders) public payable returns(uint)

* The `runAccess` method of a custom contract is called in `accessRequest` *after* `runAccessCharge` but with similar parameters. 
* This method allows for other, more general logic to be implemented that grants or denies an access request.
   Any non-zero exit code denies access and the returned code is emitted through the 'AccessRequest' event for use by the end-user application. 
* This method is also the correct place to implement more generic custom behavior, such as paying other contracts.
   
##### runFinalize(uint256 request_ID) public returns(bool)

* The `runFinalize` method is invoked in the content object's `accessComplete` method, which is called when access to the content object has been completed.   
* The (boolean) return value of `runFinalize` is returned as the result of `accessComplete` *unless* request_ID is invalid, in which case the returned result is always false.

##### runStatusChange(int proposed_status_code) public returns (int, int256)

* The `runStatusChange` method is called from the `updateStatus` method of a Content contract.
* The `runStatusChange` call receives the proposed status code provided by the callee. The `runStatusChange` invocation can return a new, different status code and an amount.
* The status code is used to set the overall status of the content object. In the default content contract implementation `0` indicates content that is accessible. 
   Any negative number (default `-1`) indicates the content is in draft mode. A positive number (default `1`) indicates content that is in review. Custom contract implementations
   are free to define their own status code but should adhere to these conventions.
* Whatever status code is returned from the `runStatusChange` method will be used to set the current status of the content contract. 
* The `updateStatus` method is called on the content contract whenever there is a request to change the overall status of the content object, such as publication, approval and execution requests.
   from the owning library.
* For approval and execution requests, the amount returned by `updateStatus`, which can be overridden by `runStatusChange`, is an amount to be charged as a license fee from the library contract to the custom contract.    
