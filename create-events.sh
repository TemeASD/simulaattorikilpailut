#!/bin/bash
cd /home/devbox/simracingfi-calendar/

node ./providers/gtfr.js
echo "GTFR done"
node ./providers/simracingfi.js
echo "Simracing.fi done"
node ./providers/trellet.js
echo "Trellet done"

npm run release-html
echo "Released"