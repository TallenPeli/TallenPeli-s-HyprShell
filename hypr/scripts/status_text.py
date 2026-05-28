#!/bin/python3
import os
import time
from dataclasses import dataclass

# music, updates, notifications, vpn, weather, battery
modules = ["media", "updates", "notifications", "vpn", "weather"]


@dataclass
class StatusItem:
    data: str
    priority: int


song_info_max_length = 35
weather_location = "Toronto"  # Change this to your city

items = []

# Get the linux distro
# Current supported distros: Arch, Fedora
system = ""
try:
    kernel = os.popen("uname -r").read().strip()
    if "arch" in kernel:
        system = "arch"
    elif "fc" in kernel:
        system = "fedora"
    else:
        # TODO Add more linux distro support
        system = "linux-generic"
except:
    system = "linux-generic"

# Song info
if "media" in modules:
    try:
        song_info = (
            os.popen("playerctl metadata --format '󰝚  {{ title }} - {{ artist }}'")
            .read()
            .strip()
        )
        if song_info != "No players found":
            if len(song_info) > song_info_max_length:
                items.append(
                    StatusItem(
                        data=song_info[:song_info_max_length] + "...", priority=0
                    )
                )
            else:
                items.append(StatusItem(data=song_info, priority=0))
    except:
        pass

# Notifications
if "notifications" in modules:
    try:
        notifications = os.popen("dunstctl count waiting").read().strip()
        if int(notifications) > 0:
            items.append(
                StatusItem(data=f"{notifications} Unread notifications", priority=1)
            )
    except:
        pass

# Updates (Only works on Arch and Fedora)
if "updates" in modules:
    try:
        # Set a default value
        updates = "0"

        # Get number of updates as a number
        if system == "arch":
            updates = os.popen("checkupdates | wc -l").read().strip()
        elif system == "fedora":
            updates = os.popen("dnf check-update --quiet | wc -l").read().strip()

        if int(updates) > 0:
            items.append(StatusItem(data=f"󰚰  {updates} Pending updates", priority=2))
    except:
        pass

# VPN status (only works for network manager)
if "vpn" in modules:
    try:
        vpn_check = (
            os.popen(
                "nmcli -t -f active,type connection show --order name | grep -e 'yes:vpn' -e 'yes:wireguard'"
            )
            .read()
            .strip()
        )
        if vpn_check:
            items.append(StatusItem(data="󰖂  VPN Connected", priority=2))
    except:
        pass


# Short weather status report
if "weather" in modules:
    cache_file = "/tmp/weather_cache"
    try:
        # check if the cache exists and if it's less than 30 minutes old (1800 seconds)
        if os.path.exists(cache_file) and (
            time.time() - os.path.getmtime(cache_file) < 1800
        ):
            with open(cache_file, "r") as file:
                weather_data = file.read().strip()
        else:
            # Fetch new weather data
            weather_data = (
                os.popen(
                    f"curl -s 'wttr.in/{{{weather_location}}}?format=%C+%t+in+{{{weather_location}}}'"
                )
                .read()
                .strip()
            )

            # Save the weather data into the cache
            if weather_data and "Unknown" not in weather_data:
                with open(cache_file, "w") as file:
                    file.write(weather_data)

        if weather_data:
            items.append(StatusItem(data=weather_data, priority=3))
    except:
        pass

# Battery charge status
if "battery" in modules:
    try:
        capacity = (
            os.popen("cat /sys/class/power_supply/BAT0/capacity 2>/dev/null")
            .read()
            .strip()
        )
        status = (
            os.popen("cat /sys/class/power_supply/BAT0/status 2>/dev/null")
            .read()
            .strip()
        )

        if capacity:
            icon = "󰁹 "
            if status == "Charging":
                icon = "󰂄 "
            elif int(capacity) < 20:
                icon = "󰂃 "

            # If the battery is low and not charging, increase the priority
            priority = 0 if (int(capacity)) < 20 and status != "Charging" else 3
            items.append(StatusItem(data=f"{icon} {capacity}%", priority=priority))
    except:
        pass

# Sort the list using the key priority
items.sort(key=lambda x: x.priority)

# Empty list
if len(items) == 0:
    print("")
# only one item so we can just print it, the priority doesn't matter
elif len(items) == 1:
    print(items[0].data)
# Calculate the 2 items with the highest priority and print them
elif len(items) > 1:
    print(f"{items[0].data} | {items[1].data}")
