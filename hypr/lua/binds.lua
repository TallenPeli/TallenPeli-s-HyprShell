-- ============
-- Key Bindings
-- ============

local helpers = require("lua.helpers")
local prefs = require("lua.preferences")
local paths = require("lua.paths")

local workspaces = { "1", "2", "3", "4", "5", "6", "7", "8", "9", "0" }

local M = {}

function M.setup()
	-- Program Keybinds
	hl.bind(prefs.mainMod .. " + C", hl.dsp.exec_cmd(prefs.terminal))
	hl.bind(prefs.mainMod .. " + F", hl.dsp.exec_cmd(prefs.browser))
	hl.bind(prefs.mainMod .. " + E", hl.dsp.exec_cmd(prefs.fileManager))

	-- Desktop Keybinds
	hl.bind(prefs.mainMod .. " + L", hl.dsp.exec_cmd("hyprlock"))
	hl.bind(prefs.mainMod .. " + " .. prefs.mainMod .. "_L", hl.dsp.exec_cmd(prefs.launcher))
	hl.bind(prefs.mainMod .. " + M", hl.dsp.exec_cmd('ags request -i "tallens-gtk-shell" "power-menu"'))
	hl.bind("CONTROL + ALT + DELETE", hl.dsp.exec_cmd('ags request -i "tallens-gtk-shell" "power-menu"'))

	hl.bind(prefs.mainMod .. " + CONTROL + R", function()
		helpers.restart_shell()
	end)

	hl.bind(prefs.mainMod .. " + H", hl.dsp.exec_cmd("$XDG_CONFIG_HOME/hypr/scripts/fuzzel-help.sh"))
	hl.bind(prefs.mainMod .. " + SPACE", hl.dsp.exec_cmd("$XDG_CONFIG_HOME/hypr/scripts/fuzzel-code.sh"))
	hl.bind(prefs.mainMod .. " + PERIOD", hl.dsp.exec_cmd("$XDG_CONFIG_HOME/hypr/scripts/fuzzel-emoji.sh"))
	hl.bind(prefs.mainMod .. " + SHIFT + V", hl.dsp.exec_cmd("$XDG_CONFIG_HOME/hypr/scripts/fuzzel-clip.sh"))
	hl.bind(prefs.mainMod .. " + SHIFT + C", hl.dsp.exec_cmd("$XDG_CONFIG_HOME/hypr/scripts/fuzzel-config.sh"))
	hl.bind(prefs.mainMod .. " + CONTROL + P", function()
		helpers.color_picker(prefs.colorFormat)
	end)

	-- Screenshots
	hl.bind(prefs.mainMod .. " + S", function()
		helpers.screenshot("active")
	end)
	hl.bind(prefs.mainMod .. " + SHIFT + S", function()
		helpers.screenshot("region")
	end)
	hl.bind(prefs.mainMod .. " + CONTROL + S", function()
		helpers.screenshot("window")
	end)

	-- Screen Recording (Audio)
	hl.bind(prefs.mainMod .. " + R", function()
		helpers.record_screen(true, false)
	end)
	hl.bind(prefs.mainMod .. " + SHIFT + R", function()
		helpers.record_screen(true, true)
	end)

	-- Screen Recording (No Audio)
	hl.bind(prefs.mainMod .. " + ALT + R", function()
		helpers.record_screen(false, false)
	end)
	hl.bind(prefs.mainMod .. " + ALT + SHIFT + R", function()
		helpers.record_screen(false, true)
	end)

	-- Editor keybinds
	hl.bind(
		prefs.mainMod .. " + ESCAPE",
		hl.dsp.exec_cmd(string.format("%s -e %s %s", prefs.terminal, prefs.editor, paths.config))
	)
	hl.bind(
		prefs.mainMod .. " + N",
		hl.dsp.exec_cmd(string.format("%s -e %s %s", prefs.terminal, prefs.editor, paths.projects))
	)

	-- Window Keybinds
	hl.bind(prefs.mainMod .. " + Q", hl.dsp.window.close())
	hl.bind(prefs.mainMod .. " + CONTROL + SHIFT + Q", hl.dsp.window.kill())

	hl.bind(prefs.mainMod .. " + J", hl.dsp.layout("togglesplit"))
	hl.bind(prefs.mainMod .. " + K", hl.dsp.layout("swapsplit"))

	hl.bind(prefs.mainMod .. " + D", hl.dsp.window.fullscreen({ mode = "maximized" }))
	hl.bind(prefs.mainMod .. " + SHIFT + F", hl.dsp.window.fullscreen())

	hl.bind(prefs.mainMod .. " + T", hl.dsp.window.float())
	hl.bind(prefs.mainMod .. " + P", hl.dsp.window.pin())

	hl.bind(prefs.mainMod .. " + mouse:272", hl.dsp.window.drag())
	hl.bind(prefs.mainMod .. " + mouse:273", hl.dsp.window.resize())

	-- Workspace Keybinds
	for i, key in ipairs(workspaces) do
		hl.bind(prefs.mainMod .. " + " .. key, hl.dsp.focus({ workspace = i }))
		hl.bind(prefs.mainMod .. " + SHIFT + " .. key, hl.dsp.window.move({ workspace = i }))
	end

	hl.bind(prefs.mainMod .. " + left", hl.dsp.focus({ direction = "l" }))
	hl.bind(prefs.mainMod .. " + right", hl.dsp.focus({ direction = "r" }))
	hl.bind(prefs.mainMod .. " + up", hl.dsp.focus({ direction = "u" }))
	hl.bind(prefs.mainMod .. " + down", hl.dsp.focus({ direction = "d" }))

	hl.bind(prefs.mainMod .. " + mouse_down", hl.dsp.focus({ workspace = "e+1" }))
	hl.bind(prefs.mainMod .. " + mouse_up", hl.dsp.focus({ workspace = "e-1" }))

	hl.bind(prefs.mainMod .. " + CONTROL + left", hl.dsp.focus({ workspace = "r-1" }))
	hl.bind(prefs.mainMod .. " + CONTROL + right", hl.dsp.focus({ workspace = "r+1" }))

	hl.bind("ALT + TAB", hl.dsp.window.cycle_next())

	hl.bind(prefs.mainMod .. " + ALT + SPACE", hl.dsp.workspace.toggle_special())

	-- Audio Controls
	hl.bind("XF86AudioRaiseVolume", helpers.change_volume(prefs.volumeStepAmount))
	hl.bind("XF86AudioLowerVolume", helpers.change_volume(-prefs.volumeStepAmount))

	hl.bind("XF86AudioMute", hl.dsp.exec_cmd("wpctl set-mute @DEFAULT_AUDIO_SINK@ toggle"))
	hl.bind("XF86AudioMicMute", hl.dsp.exec_cmd("wpctl set-mute @DEFAULT_AUDIO_SOURCE@ toggle"))

	-- Media Controls
	hl.bind("XF86AudioNext", hl.dsp.exec_cmd("playerctl next"))
	hl.bind("XF86AudioPause", hl.dsp.exec_cmd("playerctl pause-pause"))
	hl.bind("XF86AudioPlay", hl.dsp.exec_cmd("playerctl play-pause"))
	hl.bind("XF86AudioPrev", hl.dsp.exec_cmd("playerctl previous"))

	-- Brightness Controls
	hl.bind("XF86MonBrightnessUp", helpers.change_brightness(prefs.brightnessStepAmount))
	hl.bind("XF86MonBrightnessDown", helpers.change_brightness(-prefs.brightnessStepAmount))

	-- Toggle Game Mode (Disable animations and window effects)
	hl.bind(prefs.mainMod .. " + G", function()
		helpers.toggle_gamemode()
	end)

	-- Toggle Focus Mode
	hl.bind(prefs.mainMod .. " + CONTROL + F", function()
		helpers.toggle_focus()
	end)
end

return M
