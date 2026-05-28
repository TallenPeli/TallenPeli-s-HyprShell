#!/usr/bin/env bash

CONFIG_DIR="$HOME/.config/"

TERMINAL="ghostty" 

if [ ! -d "$CONFIG_DIR" ]; then
    notify-send "Error" "Directory $CONFIG_DIR does not exist."
    exit 1
fi

SELECTED_CONFIG=$(ls -1 "$CONFIG_DIR" | fuzzel --dmenu -p "  " --placeholder="Search Configs" --width 40)

if [ $? -eq 0 ] && [ -n "$SELECTED_CONFIG" ]; then
    
    FULL_PATH="$CONFIG_DIR/$SELECTED_CONFIG"

    if [ -z "$TERMINAL" ]; then
        nvim "$FULL_PATH"
    else
        $TERMINAL --working-directory=$FULL_PATH -e nvim "$FULL_PATH" &
    fi

else
    echo "No config selected."
fi
