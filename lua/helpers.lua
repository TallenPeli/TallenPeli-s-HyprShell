-- ================
-- Helper Functions
-- ================

local M = {}

-- Runs a command and returns the output
function M.get_cmd_output(cmd)
	if not cmd or cmd == "" then
		return nil
	end

	local handle = io.popen(cmd)
	if not handle then
		return nil
	end

	local result = handle:read("*a"):gsub("%s+", "")
	handle:close()

	return result
end

-- Get the path of an XDG user directory
function M.get_xdg_dir(dir_type)
	if not dir_type or dir_type == "" then
		return nil
	end

	local output = M.get_cmd_output("xdg-user-dir " .. dir_type:upper())

	return output
end

-- Change volume % by amount
function M.change_volume(amount)
	local suffix = amount > 0 and "%+" or "%-"
	local abs_amount = math.abs(amount)

	return hl.dsp.exec_cmd("wpctl set-volume @DEFAULT_AUDIO_SINK@ " .. abs_amount .. suffix)
end

-- Change brightness % by amount
function M.change_brightness(amount)
	local suffix = amount > 0 and "%+" or "%-"
	local abs_amount = math.abs(amount)

	return hl.dsp.exec_cmd("brightnessctl s " .. abs_amount .. suffix)
end

function M.get_date()
	return os.date("%Y-%m-%d_%H-%M-%S")
end

-- Returns true if a program is running
function M.is_process_running(name)
	return M.get_cmd_output("pgrep -x " .. name) ~= ""
end

-- Screen recording function
function M.record_screen(has_audio, is_interactive)
	local paths = require("lua.paths")

	if M.is_process_running("wf-recorder") then
		hl.exec_cmd(
			string.format(
				'notify-send " Recording Stopped" "Recording saved to %s" -a "   Screen Recorder"',
				paths.videos
			)
		)
		hl.exec_cmd("pkill wf-recorder")
	else
		hl.exec_cmd("mkdir -p " .. paths.videos)

		local file_path = paths.videos .. "/recording_" .. os.date("%Y-%m-%d_%H-%M-%S") .. ".mp4"
		local monitor = hl.get_active_monitor()
		if monitor == nil then
			return
		end

		local monitor_flag = (not is_interactive) and ("-o " .. monitor.name) or ""
		local audio_flag = has_audio and "--audio" or ""
		local geometry_flag = is_interactive and '-g "$(slurp)"' or ""

		hl.exec_cmd(
			string.format(
				'notify-send "  Started Recording" "Saving recording to %s" -a "   Screen Recorder"',
				file_path
			)
		)

		local cmd = string.format(
			"wf-recorder %s %s %s --pixel-format yuv420p -f %s -t",
			monitor_flag,
			geometry_flag,
			audio_flag,
			file_path
		)

		hl.exec_cmd(cmd)
	end
end

function M.screenshot(mode)
	-- "active" - fullscreen
	-- "region" - selection
	-- "window" - window
	local is_valid = { active = true, region = true, window = true }
	local prefs = require("lua.preferences")

	if is_valid[mode] then
		hl.layer_rule({ match = { namespace = "selection" }, no_anim = true })

		hl.exec_cmd(string.format("hyprshot -o %s -m %s --active", prefs.pictures, mode))
	else
		hl.notification.create({
			text = string.format('Screenshot mode "%s" is not valid.', mode),
			duration = 3000,
		})
	end
end

-- Pick a color on the screen and copy it to the clipboard
function M.color_picker(format)
	local is_valid = { cmyk = true, hex = true, rgb = true, hsl = true, hsv = true }

	if is_valid[format] then
		local cmd = string.format(
			'color=$(hyprpicker -f %s) && [ -n "$color" ] && '
				.. 'ffmpeg -f lavfi -i color=c="$color":s=16x16 -frames:v 1 /tmp/hypr_color.png -y && '
				.. 'echo -n "$color" | wl-copy && '
				.. 'notify-send -i /tmp/hypr_color.png "󰏘  Color Copied" "Value: $color" -a "Hyprpicker"',
			format
		)

		hl.exec_cmd(cmd)
	else
		hl.notification.create({
			text = string.format('Format "%s" is not valid.', format),
			duration = 3000,
		})
	end
end

local is_gamemode = false
function M.toggle_gamemode()
	if not is_gamemode then
		hl.config({
			animations = { enabled = false },
			decoration = {
				blur = { enabled = false },
				shadow = { enabled = false },
				rounding = 0,
			},
			general = {
				gaps_in = 0,
				gaps_out = 0,
				border_size = 0,
			},
		})

		hl.window_rule({
			name = "gamemode-opaque",
			match = { class = ".*" },
			opaque = true,
			force_rgbx = true,
		})

		is_gamemode = true
		hl.exec_cmd("notify-send '   Game Mode' 'Enabled' --app-name=\"Hyprland\"")
	else
		hl.config({
			animations = { enabled = true },
			decoration = {
				blur = { enabled = true },
				shadow = { enabled = true },
				rounding = 10,
			},
			general = {
				gaps_in = 4,
				gaps_out = 8,
				border_size = 2,
			},
		})

		hl.window_rule({
			name = "gamemode-opaque",
			match = { class = ".*" },
			opaque = false,
			force_rgbx = false,
		})

		is_gamemode = false
		hl.exec_cmd("notify-send '   Game Mode' 'Disabled' --app-name=\"Hyprland\"")
	end
end

local is_focus_mode = false
function M.toggle_focus()
	if not is_focus_mode then
		hl.config({
			animations = { enabled = true },
			decoration = {
				blur = { enabled = true },
				shadow = { enabled = true },
				rounding = 10,
			},
			general = {
				gaps_in = 4,
				gaps_out = 8,
				border_size = 2,
			},
		})

		is_focus_mode = true
		hl.exec_cmd("notify-send 'Focus Mode' 'Enabled' --app-name=\"Hyprland\"")
	else
		hl.config({
			animations = { enabled = false },
			decoration = {
				blur = { enabled = false },
				shadow = { enabled = false },
				rounding = 0,
			},
			general = {
				gaps_in = 0,
				gaps_out = 0,
				border_size = 0,
			},
		})

		hl.window_rule({
			name = "gamemode-opaque",
			match = { class = ".*" },
			opaque = true,
			force_rgbx = true,
		})
		is_focus_mode = false
		hl.exec_cmd("notify-send 'Focus Mode' 'Disabled' --app-name=\"Hyprland\"")
	end
end

function M.toggle_animations() end

function M.restart_shell()
	hl.exec_cmd("killall gjs; ags run &")
end

return M
