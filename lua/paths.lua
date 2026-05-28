local helpers = require("lua.helpers")

local M = {}

function M.setup()
	M.config_dir = helpers.get_cmd_output("systemd-path user-configuration")

	-- Fallback to $HOME/.config if systemd-path isn't on the system
	if not M.config_dir or M.config_dir == "" then
		M.config = helpers.get_cmd_output("echo ~") .. "/.config"
	end

	M.hypr = M.config_dir .. "/hypr"
	M.config = M.hypr .. "/hyprland.lua"
	M.scripts = M.config_dir .. "/scripts"

	M.downloads = helpers.get_xdg_dir("downloads")
	M.documents = helpers.get_xdg_dir("documents")
	M.pictures = helpers.get_xdg_dir("pictures")
	M.videos = helpers.get_xdg_dir("videos")
	M.music = helpers.get_xdg_dir("music")
	M.projects = helpers.get_xdg_dir("projects")
end

return M
