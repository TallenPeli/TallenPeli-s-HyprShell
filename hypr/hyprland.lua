-- ===========================
-- Hyprland configuration file
-- ===========================

local monitors = require("lua.monitors")
local environment = require("lua.environment")
local binds = require("lua.binds")
local animations = require("lua.animations")
local rules = require("lua.rules")
local paths = require("lua.paths")
local helpers = require("lua.helpers")

-- =======
-- Startup
-- =======

monitors.setup()
environment.setup()
paths.setup()
binds.setup()
animations.setup()
rules.setup()

hl.on("hyprland.start", function()
	hl.exec_cmd("hyprpaper")
	hl.exec_cmd("clipboard-sync")
	hl.exec_cmd("wl-paste --watch cliphist store")
	hl.exec_cmd("udiskie")

	hl.exec_cmd("ags run")
	hl.exec_cmd("discover-overlay")
	hl.exec_cmd("dunst -conf $XDG_CONFIG_HOME/dunst/dunstrc")

	hl.exec_cmd("dbus-update-activation-environment --systemd WAYLAND_DISPLAY XDG_CURRENT_DESKTOP")

	-- Cursor
	hl.exec_cmd("hyprctl setcursor Bibata-Modern-Classic 24")
	hl.exec_cmd("gsettings set org.gnome.desktop.interface cursor-theme Bibata-Modern-Classic")
end)

-- Recurring Exec
hl.on("config.reloaded", function()
	-- Themes
	hl.exec_cmd('gsettings set org.gnome.desktop.interface color-scheme "default"')
	hl.exec_cmd('gsettings set org.gnome.desktop.interface gtk-theme "adw-gtk3-dark"')
	hl.exec_cmd('gsettings set org.gnome.desktop.interface color-scheme "prefer-dark"')
end)

hl.on("monitor.added", function()
	helpers.restart_shell()
end)

hl.on("monitor.removed", function()
	helpers.restart_shell()
end)

-- ================
-- General Settings
-- ================

hl.config({
	general = {
		gaps_in = 4,
		gaps_out = 8,
		border_size = 2,
		resize_on_border = true,
		allow_tearing = false,
		layout = "dwindle",
	},
	misc = {
		vrr = 2,
		force_default_wallpaper = 0,
		disable_hyprland_logo = true,
	},
	input = {
		kb_layout = "us",
		follow_mouse = 1,
		sensitivity = -0.1,
	},
	dwindle = { preserve_split = true },
	master = { new_status = "master" },
	debug = { vfr = true },
})

-- ==========
-- Decoration
-- ==========

hl.config({
	decoration = {
		rounding = 10,

		dim_inactive = true,
		dim_strength = 0.06,

		active_opacity = 1.0,
		inactive_opacity = 0.9,

		shadow = {
			enabled = false,
			range = 4,
			render_power = 3,
		},

		blur = {
			enabled = true,
			noise = 0.03,
			size = 14,
			passes = 4,

			vibrancy = 0.1696,
		},
	},
})
