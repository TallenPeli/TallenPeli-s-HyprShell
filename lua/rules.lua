-- ======================
-- Window/Workspace Rules
-- ======================

local prefs = require("lua.preferences")

local M = {}

function M.setup()
	-- Windows
	hl.window_rule({
		name = "prevent-maximize",
		suppress_event = "maximize",
		match = { class = ".*" },
	})

	hl.window_rule({
		name = "ghost-window-fix",
		no_focus = true,
		match = {
			class = "^$",
			title = "^$",
			xwayland = 1,
			float = 1,
			fullscreen = 0,
			pin = 0,
		},
	})

	hl.window_rule({
		name = "picture-in-picture",
		tag = "+pip",
		float = true,
		pin = true,
		opacity = 1,
		move = { "(monitor_w-window_w)-16", 50 },
		size = { 400, 225 },
		match = { title = "Picture-in-Picture" },
	})

	hl.window_rule({
		name = "terminal-opacity",
		opacity = 0.9,
		match = { class = ".*" .. prefs.terminal .. ".*" },
	})

	hl.window_rule({
		name = "app-opacity",
		opacity = 0.95,
		match = { class = "(?i)spotify|org.gnome.Nautilus" },
	})

	hl.window_rule({
		name = "youtube-opacity-override",
		opacity = "1.0 override",
		opaque = true,
		force_rgbx = true,
		match = { title = ".*YouTube.*" },
	})

	hl.window_rule({
		match = {
			float = false,
			workspace = "w[tv1]",
		},
		border_size = 0,
		rounding = 0,
	})

	hl.window_rule({
		match = {
			float = false,
			workspace = "f[1]",
		},
		border_size = 0,
		rounding = 0,
	})

	-- Workspaces
	hl.workspace_rule({
		workspace = "w[tv1]",
		gaps_out = 0,
		gaps_in = 0,
	})

	hl.workspace_rule({
		workspace = "f[1]",
		gaps_out = 0,
		gaps_in = 0,
	})

	-- Layers
	hl.layer_rule({
		match = {
			namespace = "selection",
		},
		no_anim = true,
	})
end

return M
