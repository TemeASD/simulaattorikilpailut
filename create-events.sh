#!/bin/bash
cd /home/devbox/simracingfi-calendar/

node ./providers/gtfr.js
echo "GTFR done"
node ./providers/simracingfi.js
echo "Simracing.fi done"
node ./providers/trellet.js
echo "Trellet done"

node ./index.js
cp -r ./dist/html/* ../simracingfi-calendar-dist/
cd /home/devbox/simracingfi-calendar-dist/
git add -A
git commit -a -m "Update" && git push

echo "Released"