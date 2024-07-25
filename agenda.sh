#!/bin/bash -e
# Nice little helper script to run the few commands

[ -z "$1" ] && echo "did not supply YYYY-MM-DD for script" && exit 1

echo "Creating new agenda for $1"
echo "Livestream link $2"
git checkout main
git fetch
git pull

DST_FILE=community/$1-community-meeting.mdx
cat community/template.txt | sed "s/YYYY-MM-DD/$1/" | sed "s,VIDEOURL,$2," > "$DST_FILE"

CONSTANTS_FILE=src/constants.ts
sed "s,YOUTUBE: '.*',YOUTUBE: '${2}'," $CONSTANTS_FILE > $CONSTANTS_FILE.tmp
mv $CONSTANTS_FILE.tmp $CONSTANTS_FILE

echo "Done! Add agenda items, demos, and awesome stuff to $DST_FILE"
