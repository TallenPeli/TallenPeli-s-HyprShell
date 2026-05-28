#!/usr/bin/env bash

PROJECTS_DIR="$HOME/Projects"

TERMINAL="ghostty" 

if [ ! -d "$PROJECTS_DIR" ]; then
    notify-send "Error" "Directory $PROJECTS_DIR does not exist."
    exit 1
fi

SELECTED_PROJECT=$(ls -1 "$PROJECTS_DIR" | fuzzel --dmenu -p "  " --placeholder="Search Projects" --width 40)

if [ $? -eq 0 ] && [ -n "$SELECTED_PROJECT" ]; then
    
    FULL_PATH="$PROJECTS_DIR/$SELECTED_PROJECT"

    if [ -z "$TERMINAL" ]; then
        nvim "$FULL_PATH"
    else
        $TERMINAL --working-directory=$FULL_PATH -e nvim "$FULL_PATH" &
    fi

else
    echo "No project selected."
fi
