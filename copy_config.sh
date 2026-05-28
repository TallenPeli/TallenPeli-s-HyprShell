#!/bin/bash

# Delete old configuration files
rm -rf ./ags/
rm -rf ./hypr/

# Copy the configs to ./
cp -r ~/.config/hypr/ ./
cp -r ~/.config/ags/ ./
