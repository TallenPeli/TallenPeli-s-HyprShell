-- =====================
-- Environment Variables
-- =====================

local prefs = require("lua.preferences")

local M = {}

function M.setup()
	hl.env("HYPRCURSOR_THEME", "Bibata-Modern-Classic")
	hl.env("XCURSOR_THEME", "Bibata-Modern-Classic")
	hl.env("HYPRCURSOR_SIZE", "24")
	hl.env("XCURSOR_SIZE", "24")
	hl.env("EDITOR", prefs.editor)
	hl.env("QT_QPA_PLATFORMTHEME", "qt6ct")
	hl.env("TERMINAL", "/usr/bin/ghostty")
	hl.env("XDG_CURRENT_DESKTOP", "Hyprland")
	hl.env("XDG_SESSION_TYPE", "wayland")
	hl.env("XDG_SESSION_DESKTOP", "Hyprland")
end

return M
