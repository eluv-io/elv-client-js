##elv-client-js/utilities
### integration tests

* These test run against a fabric node containing libraries and content types
* To run:
  * Create a copy of the appropriate vars.*.sh file and give it a filename ending in `.ignore.sh` (this will prevent accidentally committing your file to git repo). Example: `cp vars.s3.ingest.sh vars.MY_TENANCY_NAME.s3.ingest.ignore.sh`
  * Edit your `*.ignore.sh` file and fill in your credentials / file paths / library and content type IDs  
  * Then, run test with TESTNAME NAME_OF_VAR_FILE, e.g. 
    
    
    test.s3.ingest.sh  vars.MY_TENANCY_NAME.s3.ingest.ignore.sh 