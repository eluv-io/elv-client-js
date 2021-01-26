#!/bin/bash

# SET VARIABLES FOR USE BY test.offering.copy.and.text.watermark.sh
# (make your own copy of this file and replace values)

# MEZ/OFFERING INFO
MEZ_ID=iq__MY_MEZ_OBJECT_ID
SOURCE_OFFERING_KEY="default"
TARGET_OFFERING_KEY="watermark-large"

# WATERMARK INFO
TEXT_WATERMARK='{"font_color":"white@0.2","font_relative_height":0.1,"shadow":true,"shadow_color":"black@0.15","template":"$USERNAME","x":"(w-tw)/100*85","y":"(h-th)/100*20"}'

# FLAGS
VERBOSE=0 # If set to 1, will print output from each elv-client-js script

# PROGRAM PATHS
ELV_CLIENT_PATH=~/elv-client-js # <- change if elv-client-js installed at a different location

# NETWORK / ACCOUNT
export FABRIC_CONFIG_URL=MY_CONFIG_URL
export PRIVATE_KEY=MY_FABRIC_PRIVATE_KEY