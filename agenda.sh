#!/bin/bash -e
# Nice little helper script to run the few commands

[ -z "$1" ] && echo "did not supply MM-DD for script" && exit 1

echo "Creating new agenda for $1"
git checkout main
git fetch
git pull
git checkout -b mtg/$1-meeting-agenda

DST_FILE=community/2023-$1-community-meeting.md
cp community/template.txt $DST_FILE
# TODO: sed
echo "Done! Edit $DST_FILE"
