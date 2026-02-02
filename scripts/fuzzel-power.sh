#bin/bash

echo -e "Power Off\nHibernate\nSleep\nReboot\nLogout" | fuzzel -d --hide-prompt --minimal-lines -w 20 | python3 .config/hypr/scripts/power.py
