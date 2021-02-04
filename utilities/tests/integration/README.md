##elv-client-js/utilities
### Integration tests

* These test run against a fabric node containing libraries and content types
* To run:
  * Create a copy of the appropriate `vars.*.sh` file and give it a filename ending in `.ignore.sh` (this will prevent accidentally committing your file to git repo). Example: `cp vars.s3.ingest.sh vars.MY_TENANCY_NAME.s3.ingest.ignore.sh`
  * Edit your `*.ignore.sh` file and fill in your credentials / file paths / library and content type IDs  
  * Then, run test with `TEST_NAME.sh NAME_OF_VAR_FILE`, e.g. 
    
    
    test.s3.ingest.sh  vars.MY_TENANCY_NAME.s3.ingest.ignore.sh 


### CreateVarsFile.js

* This is a utility script that will create a `vars.TENANCY_NAME.TEST_NAME.ignore.sh` file for you for the named test, substituting in information from your tenancy info. You will need to save your tenancy info to a text file, then run with:

    
    cd elv-client-js/utilities/test/integration/  
    node CreateVarsFile.js vars.local.ingest.sh  PATH_TO_MY_TENANCY_TEXT_FILE  NETWORK

* `NETWORK` is one of the following: `prod`, `demo`, `test`, or `local`
* In the above example, `TEST_NAME` is `local.ingest`
* Above would create a file named `vars.YOUR_TENANT_NAME.local.ingest.ignore.sh`
* You may still need to edit the created file to replace other environment variables
* Depending on the particular test, you may also need to replace additional items like S3 credentials

### run_all_tests.sh

* Once you have created tenant-specific versions of all the vars.TEST_NAME.sh files, you can run all the tests with:

    
    cd elv-client-js/utilities/test/integration/  
    ./run_all_tests.sh YOUR_TENANT_NAME

 * This script will abort as soon as any individual test fails.

### Sample tenant info file contents:

```
Setting up tenant 'tenant-name'
Admin account:
	tenant-name-elv-admin
	0x0000000000000000000000000000000000000000
	0x0000000000000000000000000000000000000000000000000000000000000000
	word word word word word word word word word word word word
Tenant ID:
	 iten0000000000000000000000000000
Access Groups:
	Organization Admins Group: 0x0000000000000000000000000000000000000000
	Content Admins Group: 0x0000000000000000000000000000000000000000
	Content Users Group: 0x0000000000000000000000000000000000000000
Tenant Types:
	tenant-name - Title: iq__0000000000000000000000000000
	tenant-name - Title Collection: iq__000000000000000000000000000
	tenant-name - Title Master: iq__0000000000000000000000000000
	tenant-name - Channel iq__000000000000000000000000000
	tenant-name - Live Stream iq__000000000000000000000000000
Tenant Libraries:
	tenant-name - Properties: ilib000000000000000000000000000
	tenant-name - Title Masters: ilib0000000000000000000000000000
	tenant-name - Title Mezzanines: ilib0000000000000000000000000000
	tenant-name - Reports: ilib0000000000000000000000000000
Site Object:
	Site - tenant-name: iq__000000000000000000000000000
Creating Reporting Objects...
	Platform Percentages
	Summary by Date
	Summary by Month
	Summary by Title
	Title Playout Session Details
	Title Playout Session Details by Auth Address
	Title Playout Starts Detail
```
