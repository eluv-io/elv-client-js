#!/bin/bash

# SET VARIABLES FOR USE BY test.s3.ingest.sh
# (make your own copy of this file and replace values)

# MEDIA FILE INFO
S3_PATH=\"s3://MY_S3_BUCKET_NAME/MY_FILE_PATH\"
TITLE="myTitle"

# FLAGS
VERBOSE=1 # If set to 1, will print output from each elv-client-js script

# PROGRAM PATHS
ELV_CLIENT_PATH=~/elv-client-js # <- change if elv-client-js installed at a different location
ABR_PROFILE_PATH=$ELV_CLIENT_PATH/testScripts/abr_profile_clear.json

# S3 INFO
export AWS_BUCKET=MY_S3_BUCKET_NAME
export AWS_KEY=MY_AWS_KEY
export AWS_REGION=MY_S3_BUCKET_REGION
export AWS_SECRET=MY_AWS_SECRET

# NETWORK / ACCOUNT
export FABRIC_CONFIG_URL=MY_CONFIG_URL
export PRIVATE_KEY=MY_FABRIC_PRIVATE_KEY

# CONTENT TYPES
MASTER_TYPE=MY_MASTER_CONTENT_TYPE_ID
MEZ_TYPE=MY_MEZZANINE_CONTENT_TYPE_ID

# LIBRARIES
MASTER_LIB=MY_MASTER_LIBRARY_ID
MEZ_LIB=MY_MEZ_LIBRARY_ID
