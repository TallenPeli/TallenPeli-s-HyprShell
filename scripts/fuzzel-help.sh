#!/bin/bash

# Extract data, pipe to fuzzel. 
# 'cut' grabs the first word "[Super+C]". 
# 'tr -d "[]"' removes the brackets so you paste "Super+C".
sed '1,/^### DATA ###$/d' "$0" | fuzzel --dmenu -p " Keys: " --placeholder="Search Keybinds..." --width 85 

exit 0

### DATA ###
 [Super+C] - Open Terminal (Ghostty)
󰖟 [Super+F] - Open Browser (Zen)
 [Super+E] - Open File Manager (Nautilus)
 [Super+N] - Open Neovim in ~/Code/
 [Super+Space] - Search and open code project in Neovim
󰞅 [Super+Period] - Emoji Picker
 [Super+Shift+C] - Dotfiles Config Menu
 [Super+Shift+V] - Clipboard History
 [Super+Shift+N] - Notification History
󱐌 [Super+Control+P] - Power Profiles Menu
 [Super+Escape] - Edit Hyprland Config
 [Super+Q] - Close Active Window
󰍃 [Super+Shift+Alt+Q] - Exit Hyprland (Kill Session)
󰐥 [Super+M] - Power Menu (Shutdown/Reboot)
 [Super+T] - Toggle Floating Mode
 [Super+P] - Toggle Pseudo Tiling (Dwindle)
 [Super+J] - Toggle Split (Dwindle)
 [Super+Shift+F] - Toggle Fullscreen
 [Super+D] - Toggle Fake Fullscreen
 [Super+Shift+P] - Pin Window
 [Super+H] - Keybind help (Show this Keybind List)
 [Super+Shift+L] - Lock Screen
 [Ctrl+Super+R] - Reload Waybar
 [Super+S] - Screenshot (Active Monitor)
 [Super+Shift+S] - Take interactive screenshot (Select Region)
 [Super+Control+S] - Screenshot (Active Window)
 [Super+R] - Record Screen (Fullscreen with Sound)
 [Super+Shift+R] - Record Screen (Region with Sound)
 [Super+Alt+R] - Record Screen (Fullscreen Silent)
 [Super+Alt+Shift+R] - Record Screen (Region Silent)
 [Super+Left] - Move Focus Left
 [Super+Right] - Move Focus Right
 [Super+Up] - Move Focus Up
 [Super+Down] - Move Focus Down
 [Super+Control+Left] - Go to Workspace on Left
 [Super+Control+Right] - Go to Workspace on Right
 [Alt+Tab] - Cycle Windows
 [Super+1-0] - Switch to Workspace 1-0
 [Super+Shift+1-0] - Move Window to Workspace 1-10
 [Super+MouseLeft] - Move Window (Drag)
 [Super+MouseRight] - Resize Window (Drag)
