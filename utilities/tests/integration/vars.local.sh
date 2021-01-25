#!/bin/bash

# SET VARIABLES FOR USE BY test.local.ingest.sh
# (make your own copy of this file and replace values)

# MEDIA FILE INFO
LOCAL_PATH=\"/MY_FILE_PATH\"
TITLE="myTitle"

# FLAGS
VERBOSE=1 # If set to 1, will print output from each elv-client-js script

# PROGRAM PATHS
ELV_CLIENT_PATH=~/elv-client-js # <- change if elv-client-js installed at a different location
ABR_PROFILE_PATH=$ELV_CLIENT_PATH/testScripts/abr_profile_clear.json

# S3 INFO
unset AWS_BUCKET
unset AWS_KEY
unset AWS_REGION
unset AWS_SECRET

# NETWORK / ACCOUNT / GROUP
export FABRIC_CONFIG_URL=MY_CONFIG_URL
export PRIVATE_KEY=MY_FABRIC_PRIVATE_KEY
ADMINS_GROUP_ADDRESS=MY_GROUP_ADDRESS

# CONTENT TYPES
MASTER_TYPE=MY_MASTER_CONTENT_TYPE_ID
MEZ_TYPE=MY_MEZZANINE_CONTENT_TYPE_ID

# LIBRARIES
MASTER_LIB=MY_MASTER_LIBRARY_ID
MEZ_LIB=MY_MEZ_LIBRARY_ID
