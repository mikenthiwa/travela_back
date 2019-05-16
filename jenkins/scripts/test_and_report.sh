#!/bin/bash

#########################################################################
# This script is used to run tests against the application
# and send coverage report to CodeClimate
#########################################################################

set -e pipefail

echo $GIT_COMMIT # only needed for debugging
GIT_COMMIT=$(git log | grep -m1 -oE '[^ ]+$')
echo $GIT_COMMIT # only needed for debugging

./cc-test-reporter before-build
yarn test --coverage
./cc-test-reporter after-build -t simplecov --exit-code $? || echo  “Skipping Code Climate coverage upload”
