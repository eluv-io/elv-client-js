#!/bin/bash

if [ -z "$1" ]
  then
    echo
    echo Missing tenancy name
    echo
    echo Usage: $0 TENANCY_NAME
    echo
    exit 1
fi

declare -a TESTS=(
	"local.ingest"
	"s3.ingest"
	"offering.copy.and.text.watermark"
	"offering.metadata.rewrite"
)

for i in "${TESTS[@]}"
do
	echo Running test.$i.sh vars.$1.$i.ignore.sh
	./test.$i.sh vars.$1.$i.ignore.sh
	if [ $? -ne 0 ]
	then
	  echo
		echo ERROR: TEST FAILED: $i
		echo
		exit 1
	fi
done

echo
echo ALL TESTS PASSED
echo
exit 0