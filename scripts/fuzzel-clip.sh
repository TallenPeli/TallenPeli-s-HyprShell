#!/bin/sh

cliphist list | fuzzel -d -p '  ' --placeholder="Search Clipboard" | cliphist decode | wl-copy
