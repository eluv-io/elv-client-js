#!/bin/bash
# SET VARIABLES FOR USE BY test.s3.ingest.sh
# (make your own copy of this file and replace values)

# -----------------------------------------------------------------
# TEST-SPECIFIC VARS
# -----------------------------------------------------------------
S3_PATH=\"s3://MY_S3_BUCKET_NAME/MY_FILE_PATH\"
TITLE="myTitle"
# S3 INFO
export AWS_BUCKET=MY_S3_BUCKET_NAME
export AWS_KEY=MY_AWS_KEY
export AWS_REGION=MY_S3_BUCKET_REGION
export AWS_SECRET=MY_AWS_SECRET

ABR_PROFILE_FILENAME=abr_profile_clear.json # <- Filename in ELV_CLIENT_PATH/utilities/example_files/
                                            #    If you want to use a file outside of this directory,
                                            #    uncomment following line and set ABR_PROFILE_ABSOLUTE_PATH instead

# ABR_PROFILE_ABSOLUTE_PATH=/path/to/your/abr_profile.json # <- will override ABR_PROFILE_FILENAME if set

# CONTENT TYPES
export MASTER_TYPE=MY_MASTER_CONTENT_TYPE_ID # 'TENANT_NAME - Title Master' (should start with 'iq__')
export MEZ_TYPE=MY_MEZZANINE_CONTENT_TYPE_ID # 'TENANT_NAME - Title' (should start with 'iq__')

# LIBRARIES
export MASTER_LIB=MY_MASTER_LIBRARY_ID # 'TENANT_NAME - Title Masters' (should start with 'ilib')
export MEZ_LIB=MY_MEZ_LIBRARY_ID  # 'TENANT_NAME - Title Mezzanines' (should start with 'ilib')

# -----------------------------------------------------------------
# ACCOUNT / NETWORK / CREDENTIALS INFO
# -----------------------------------------------------------------
export FABRIC_CONFIG_URL=MY_CONFIG_URL # <- https://demov3.net955210.contentfabric.io/config for demo network, https://main.net955305.contentfabric.io/config for production network
export PRIVATE_KEY=MY_FABRIC_PRIVATE_KEY # <- should start with 0x
export ADMINS_GROUP_ADDRESS=MY_GROUP_ADDRESS # <- set to your 'TENANT_NAME Content Admins' group contract address (should start with 0x)

# -----------------------------------------------------------------
# CLIENT RUNTIME ENVIRONMENT
# -----------------------------------------------------------------
export ELV_CLIENT_PATH=~/elv-client-js # <- change if elv-client-js installed at a different location

# -----------------------------------------------------------------
# GENERIC VARS APPLICABLE TO MOST TESTS
# -----------------------------------------------------------------
VERBOSE=1 # If set to 1, will print output from each elv-client-js script
export ETH_CONTRACT_TIMEOUT=20



# =================================================================
# UTILITY FUNCTIONS AND CHECKS (do not alter)
# =================================================================

if [ -z ${ABR_PROFILE_ABSOLUTE_PATH+x} ]
then
  # ABR_PROFILE_ABSOLUTE_PATH not set, use relative path
  export ABR_PROFILE_PATH=$ELV_CLIENT_PATH/utilities/example_files/$ABR_PROFILE_FILENAME
else
  # ABR_PROFILE_ABSOLUTE_PATH set, use it
  export ABR_PROFILE_PATH=$ABR_PROFILE_ABSOLUTE_PATH
fi

print_spaced() {
  echo; echo $*; echo
}

# CHECK THAT WE WERE CALLED WITH 'source' OR '.'
if [ -z ${ELV_CALLER_SHELL_LEVEL+x} ]
then
  # ELV_CALLER_SHELL_LEVEL not set, called interactively
  if [ $SHLVL != 1 ]; then print_spaced "Please run script using 'source' or '.'"; exit 1
  else print_spaced "Setting env vars ($0)"; fi
else
  if [ $SHLVL != $ELV_CALLER_SHELL_LEVEL ]; then print_spaced "Please make sure your script is calling $0 using 'source' or '.'"; exit 1
  else print_spaced "Setting env vars ($0)"; fi
fi

